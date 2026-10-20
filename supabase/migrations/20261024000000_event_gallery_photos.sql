alter table public.events
  add column if not exists gallery_images jsonb not null default '[]'::jsonb
  check (case when jsonb_typeof(gallery_images) = 'array' then jsonb_array_length(gallery_images) <= 5 else false end);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-gallery', 'event-gallery', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Published event photos are public" on storage.objects;
create policy "Published event photos are public"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'event-gallery');

drop policy if exists "Organizers upload photos to their events" on storage.objects;
create policy "Organizers upload photos to their events"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-gallery'
    and exists (
      select 1 from public.events
      where events.id::text = (storage.foldername(name))[1]
        and events.created_by = auth.uid()
    )
  );

drop policy if exists "Organizers delete photos from their events" on storage.objects;
create policy "Organizers delete photos from their events"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-gallery'
    and exists (
      select 1 from public.events
      where events.id::text = (storage.foldername(name))[1]
        and events.created_by = auth.uid()
    )
  );
