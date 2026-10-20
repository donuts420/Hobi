-- Extend the existing booking schema without removing its customer/manager fields.
alter table public.bookings
  add column if not exists expires_at timestamptz,
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_refund_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'expired', 'refund_processing', 'refunded'));

create unique index if not exists bookings_razorpay_order_id_uidx
  on public.bookings(razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists bookings_razorpay_payment_id_uidx
  on public.bookings(razorpay_payment_id) where razorpay_payment_id is not null;
create unique index if not exists bookings_razorpay_refund_id_uidx
  on public.bookings(razorpay_refund_id) where razorpay_refund_id is not null;
create index if not exists bookings_expiry_idx
  on public.bookings(expires_at) where status = 'pending';
create index if not exists booking_items_booking_idx on public.booking_items(booking_id);

alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;

create or replace function public.reserve_booking(
  p_user_id uuid,
  p_event_id uuid,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid := gen_random_uuid();
  v_item record;
  v_unit_price bigint;
  v_total_paise bigint := 0;
  v_total_inr numeric := 0;
  v_ticket_count integer := 0;
begin
  if p_user_id is null or p_event_id is null
     or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Invalid booking request' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Choose at least one ticket' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.events e
    where e.id = p_event_id and e.status = 'published' and e.starts_at > now()
  ) then
    raise exception 'Event is not available for booking' using errcode = 'P0002';
  end if;

  select coalesce(sum(x.quantity), 0)::integer
  into v_ticket_count
  from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer);
  if v_ticket_count < 1 or v_ticket_count > 10
     or exists (
       select 1 from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer)
       where x.ticket_type_id is null or x.quantity is null or x.quantity < 1
     ) then
    raise exception 'Choose between 1 and 10 tickets' using errcode = '22023';
  end if;

  perform tt.id
  from public.ticket_types tt
  join (
    select x.ticket_type_id
    from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer)
    group by x.ticket_type_id
  ) selected on selected.ticket_type_id = tt.id
  where tt.event_id = p_event_id
  order by tt.id
  for update of tt;

  if (
    select count(*) from (
      select x.ticket_type_id
      from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer)
      group by x.ticket_type_id
    ) requested
  ) <> (
    select count(*) from public.ticket_types tt
    where tt.event_id = p_event_id
      and tt.id in (
        select x.ticket_type_id
        from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer)
      )
  ) then
    raise exception 'One or more ticket types are unavailable' using errcode = 'P0002';
  end if;

  insert into public.bookings(id, event_id, customer_id, status, total_amount_inr, expires_at)
  values (v_booking_id, p_event_id, p_user_id, 'pending', 0, now() + interval '15 minutes');

  for v_item in
    select x.ticket_type_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(ticket_type_id uuid, quantity integer)
    group by x.ticket_type_id
    order by x.ticket_type_id
  loop
    update public.ticket_types tt
    set available_quantity = tt.available_quantity - v_item.quantity
    where tt.id = v_item.ticket_type_id
      and tt.event_id = p_event_id
      and tt.available_quantity >= v_item.quantity
    returning round(tt.price_inr * 100)::bigint
    into v_unit_price;

    if not found then
      raise exception 'Not enough tickets remain for one of your selections' using errcode = 'P0001';
    end if;
    if v_unit_price <= 0 then
      raise exception 'Ticket price is invalid' using errcode = '22023';
    end if;

    insert into public.booking_items(
      booking_id, ticket_type_id, ticket_name, unit_price_inr, quantity
    )
    select v_booking_id, tt.id, tt.name, v_unit_price / 100.0, v_item.quantity
    from public.ticket_types tt
    where tt.id = v_item.ticket_type_id;

    v_total_paise := v_total_paise + (v_unit_price * v_item.quantity);
  end loop;

  v_total_inr := v_total_paise / 100.0;
  update public.bookings
  set total_amount_inr = v_total_inr, updated_at = now()
  where id = v_booking_id;

  return jsonb_build_object(
    'id', v_booking_id,
    'amount_paise', v_total_paise,
    'currency', 'INR',
    'expires_at', now() + interval '15 minutes'
  );
end;
$$;

create or replace function public.attach_razorpay_order(
  p_booking_id uuid,
  p_order_id text
) returns boolean
language sql
security definer
set search_path = ''
as $$
  with changed as (
    update public.bookings
    set razorpay_order_id = p_order_id, updated_at = now()
    where id = p_booking_id
      and status = 'pending'
      and expires_at > now()
      and razorpay_order_id is null
    returning id
  )
  select exists(select 1 from changed);
$$;

create or replace function public.release_booking(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed boolean := false;
begin
  update public.bookings
  set status = 'expired', updated_at = now()
  where id = p_booking_id and status = 'pending'
  returning true into v_changed;
  if not coalesce(v_changed, false) then return false; end if;

  update public.ticket_types tt
  set available_quantity = tt.available_quantity + items.quantity
  from (
    select ticket_type_id, sum(quantity)::integer as quantity
    from public.booking_items
    where booking_id = p_booking_id
    group by ticket_type_id
  ) items
  where tt.id = items.ticket_type_id;
  return true;
end;
$$;

create or replace function public.expire_pending_bookings()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid;
  v_count integer := 0;
begin
  for v_booking_id in
    select id from public.bookings
    where status = 'pending' and expires_at <= now()
    order by expires_at
    for update skip locked
  loop
    if public.release_booking(v_booking_id) then v_count := v_count + 1; end if;
  end loop;
  return v_count;
end;
$$;

create or replace function public.finalize_razorpay_payment(
  p_order_id text,
  p_payment_id text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings%rowtype;
begin
  select * into v_booking
  from public.bookings
  where razorpay_order_id = p_order_id
  for update;
  if not found then return 'not_found'; end if;

  if v_booking.status = 'confirmed' then
    if v_booking.razorpay_payment_id = p_payment_id then return 'paid'; end if;
    return 'conflict';
  end if;
  if v_booking.status in ('refund_processing', 'refunded') then
    return v_booking.status;
  end if;
  if v_booking.razorpay_payment_id is not null
     and v_booking.razorpay_payment_id <> p_payment_id then
    return 'conflict';
  end if;

  if v_booking.status = 'pending' and v_booking.expires_at > now() then
    update public.bookings
    set status = 'confirmed', razorpay_payment_id = p_payment_id, paid_at = now(), updated_at = now()
    where id = v_booking.id;
    return 'paid';
  end if;

  if v_booking.status = 'pending' then
    perform public.release_booking(v_booking.id);
  end if;
  update public.bookings
  set status = 'refund_processing', razorpay_payment_id = p_payment_id, updated_at = now()
  where id = v_booking.id and status = 'expired';
  if found then return 'late_payment_refund'; end if;
  return 'conflict';
end;
$$;

create or replace function public.record_late_payment_refund(
  p_order_id text,
  p_payment_id text,
  p_refund_id text
) returns boolean
language sql
security definer
set search_path = ''
as $$
  with changed as (
    update public.bookings
    set razorpay_refund_id = p_refund_id, updated_at = now()
    where razorpay_order_id = p_order_id
      and razorpay_payment_id = p_payment_id
      and status = 'refund_processing'
      and razorpay_refund_id is null
    returning id
  )
  select exists(select 1 from changed);
$$;

revoke execute on function public.reserve_booking(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.attach_razorpay_order(uuid, text) from public, anon, authenticated;
revoke execute on function public.release_booking(uuid) from public, anon, authenticated;
revoke execute on function public.expire_pending_bookings() from public, anon, authenticated;
revoke execute on function public.finalize_razorpay_payment(text, text) from public, anon, authenticated;
revoke execute on function public.record_late_payment_refund(text, text, text) from public, anon, authenticated;
grant execute on function public.reserve_booking(uuid, uuid, jsonb) to service_role;
grant execute on function public.attach_razorpay_order(uuid, text) to service_role;
grant execute on function public.release_booking(uuid) to service_role;
grant execute on function public.expire_pending_bookings() to service_role;
grant execute on function public.finalize_razorpay_payment(text, text) to service_role;
grant execute on function public.record_late_payment_refund(text, text, text) to service_role;

create extension if not exists pg_cron;
select cron.schedule(
  'expire-pending-hopi-bookings',
  '* * * * *',
  $job$ select public.expire_pending_bookings(); $job$
);
