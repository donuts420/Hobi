alter table public.events
  add column if not exists contact_1_name text,
  add column if not exists contact_1_email text,
  add column if not exists contact_2_name text,
  add column if not exists contact_2_email text;

alter table public.events
  add constraint events_contact_details_required check (
    contact_1_name is not null and btrim(contact_1_name) <> ''
    and contact_1_email is not null
    and contact_1_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and contact_2_name is not null and btrim(contact_2_name) <> ''
    and contact_2_email is not null
    and contact_2_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) not valid;
