create table if not exists public.login_email_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  digest text not null check (digest ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  attempts smallint not null default 0 check (attempts between 0 and 5),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.login_email_otp_challenges enable row level security;
revoke all on table public.login_email_otp_challenges from public, anon, authenticated;
grant select, insert, update, delete on table public.login_email_otp_challenges to service_role;

create or replace function public.request_login_email_otp(
  p_email text,
  p_digest text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_email));
  v_id uuid;
begin
  if v_email is null or v_email = '' or p_digest is null
    or p_digest !~ '^[0-9a-f]{64}$' or p_expires_at is null
    or p_expires_at <= pg_catalog.now() then
    return null;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_email, 0));

  if exists (
    select 1
    from public.login_email_otp_challenges c
    where c.email = v_email
      and c.created_at > pg_catalog.now() - interval '60 seconds'
  ) then
    return null;
  end if;

  insert into public.login_email_otp_challenges (email, digest, expires_at)
  values (v_email, p_digest, least(p_expires_at, pg_catalog.now() + interval '5 minutes'))
  on conflict (email) do update
    set digest = excluded.digest,
        expires_at = excluded.expires_at,
        attempts = 0,
        consumed_at = null,
        created_at = pg_catalog.now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.consume_login_email_otp(
  p_challenge_id uuid,
  p_email text,
  p_digest text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.login_email_otp_challenges%rowtype;
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_email));
begin
  if p_digest is null or p_digest !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  select * into v_challenge
  from public.login_email_otp_challenges c
  where c.id = p_challenge_id and c.email = v_email
  for update;

  if not found
    or v_challenge.consumed_at is not null
    or v_challenge.expires_at <= pg_catalog.now()
    or v_challenge.attempts >= 5 then
    return false;
  end if;

  if v_challenge.digest <> p_digest then
    update public.login_email_otp_challenges
    set attempts = attempts + 1
    where id = p_challenge_id;
    return false;
  end if;

  update public.login_email_otp_challenges
  set consumed_at = pg_catalog.now()
  where id = p_challenge_id;

  return true;
end;
$$;

revoke all on function public.request_login_email_otp(text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.consume_login_email_otp(uuid, text, text) from public, anon, authenticated;
grant execute on function public.request_login_email_otp(text, text, timestamptz) to service_role;
grant execute on function public.consume_login_email_otp(uuid, text, text) to service_role;
