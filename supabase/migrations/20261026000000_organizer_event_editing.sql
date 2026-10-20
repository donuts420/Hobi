create policy "Administrators can read events"
  on public.events for select to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'administrator'
  ));

create policy "Administrators can manage event gallery photos"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'event-gallery'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrator')
  )
  with check (
    bucket_id = 'event-gallery'
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrator')
  );

drop policy if exists "Organizers can publish their events" on public.events;
create policy "Organizers can publish their events"
  on public.events for update to authenticated
  using (
    status <> 'deleting' and created_by = auth.uid()
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('organizer', 'administrator'))
  )
  with check (
    status <> 'deleting' and created_by = auth.uid()
    and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('organizer', 'administrator'))
  );

revoke delete on public.events from authenticated;

create or replace function public.update_organizer_event_details(
  p_event_id uuid,
  p_title text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_banner_image_url text,
  p_gallery_images jsonb
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.events e
    where e.id = p_event_id
      and exists (
        select 1 from public.profiles p where p.id = auth.uid()
          and ((p.role = 'organizer' and e.created_by = auth.uid()) or p.role = 'administrator')
      )
  ) then raise exception 'Event not found or access denied' using errcode = '42501'; end if;
  if nullif(btrim(p_title), '') is null or p_starts_at is null
     or (p_ends_at is not null and p_ends_at <= p_starts_at)
     or nullif(btrim(p_banner_image_url), '') is null
     or (case when jsonb_typeof(p_gallery_images) = 'array' then
       jsonb_array_length(p_gallery_images) > 5
       or exists (
         select 1 from jsonb_array_elements(p_gallery_images) as item(value)
         where jsonb_typeof(item.value) <> 'string'
       )
     else true end) then
    raise exception 'Invalid event details' using errcode = '22023';
  end if;
  update public.events
  set title = btrim(p_title), starts_at = p_starts_at, ends_at = p_ends_at,
      banner_image_url = p_banner_image_url, gallery_images = p_gallery_images
  where id = p_event_id and status <> 'deleting';
  if not found then raise exception 'Event deletion is already in progress' using errcode = '55000'; end if;
end;
$$;

create or replace function public.begin_delete_organizer_event(p_event_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  select created_by into v_owner from public.events where id = p_event_id;
  if not found or auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid()
      and ((role = 'organizer' and v_owner = auth.uid()) or role = 'administrator')
  ) then raise exception 'Event not found or access denied' using errcode = '42501'; end if;
  perform id from public.ticket_types where event_id = p_event_id order by id for update;
  perform id from public.events where id = p_event_id and created_by = v_owner for update;
  if not found then raise exception 'Event not found' using errcode = 'P0002'; end if;
  if exists (select 1 from public.bookings where event_id = p_event_id) then
    raise exception 'Events with booking records cannot be deleted' using errcode = '23503';
  end if;
  update public.events set status = 'deleting' where id = p_event_id;
end;
$$;

create or replace function public.finish_delete_organizer_event(p_event_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  select created_by into v_owner from public.events where id = p_event_id;
  if not found or auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid()
      and ((role = 'organizer' and v_owner = auth.uid()) or role = 'administrator')
  ) then raise exception 'Event not found or access denied' using errcode = '42501'; end if;
  perform id from public.ticket_types where event_id = p_event_id order by id for update;
  perform id from public.events where id = p_event_id and status = 'deleting' for update;
  if not found then raise exception 'Event deletion is not pending' using errcode = '55000'; end if;
  if exists (select 1 from public.bookings where event_id = p_event_id) then
    raise exception 'Events with booking records cannot be deleted' using errcode = '23503';
  end if;
  delete from public.ticket_types where event_id = p_event_id;
  delete from public.events where id = p_event_id;
end;
$$;

create or replace function public.guard_event_booking_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_status text;
begin
  select status into v_status from public.events where id = new.event_id for update;
  if v_status is distinct from 'published' then
    raise exception 'Event is not available for booking' using errcode = 'P0002';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_require_published_event on public.bookings;
create trigger bookings_require_published_event
  before insert on public.bookings
  for each row execute function public.guard_event_booking_insert();

revoke execute on function public.update_organizer_event_details(uuid, text, timestamptz, timestamptz, text, jsonb) from public, anon;
revoke execute on function public.begin_delete_organizer_event(uuid) from public, anon;
revoke execute on function public.finish_delete_organizer_event(uuid) from public, anon;
grant execute on function public.update_organizer_event_details(uuid, text, timestamptz, timestamptz, text, jsonb) to authenticated;
grant execute on function public.begin_delete_organizer_event(uuid) to authenticated;
grant execute on function public.finish_delete_organizer_event(uuid) to authenticated;
