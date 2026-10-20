alter table public.profiles
  add column if not exists phone text;

-- Keep clients from changing role directly; allow profile name and phone edits only.
revoke update on table public.profiles from public, anon, authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

create or replace function public.become_organizer(
  p_full_name text,
  p_phone text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_phone text := regexp_replace(btrim(coalesce(p_phone, '')), '[[:space:]()-]', '', 'g');
begin
  if v_user_id is null then
    raise exception 'Sign in to create an organizer account' using errcode = '42501';
  end if;

  if not exists (
    select 1 from auth.users
    where id = v_user_id and email_confirmed_at is not null
  ) then
    raise exception 'Verify your account email before becoming an organizer' using errcode = '42501';
  end if;

  if p_full_name is null or length(btrim(p_full_name)) not between 2 and 100 then
    raise exception 'Enter a name between 2 and 100 characters' using errcode = '22023';
  end if;

  if v_phone !~ '^\+?[0-9]{7,15}$' then
    raise exception 'Enter a valid phone number with 7 to 15 digits' using errcode = '22023';
  end if;

  insert into public.profiles (id, full_name, phone, role, created_at)
  values (v_user_id, btrim(p_full_name), btrim(p_phone), 'organizer', now())
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        role = case
          when public.profiles.role = 'administrator' then 'administrator'
          else 'organizer'
        end;

  return 'organizer';
end;
$$;

revoke all on function public.become_organizer(text, text) from public, anon, authenticated;
grant execute on function public.become_organizer(text, text) to authenticated;
