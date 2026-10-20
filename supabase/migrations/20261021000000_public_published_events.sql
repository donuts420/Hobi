alter table public.events enable row level security;
alter table public.ticket_types enable row level security;

grant select on public.events, public.ticket_types to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant insert on public.ticket_types to authenticated;

drop policy if exists "Published events are visible to everyone" on public.events;
create policy "Published events are visible to everyone"
  on public.events for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Organizers can read their events" on public.events;
create policy "Organizers can read their events"
  on public.events for select to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  );

drop policy if exists "Organizers can create their events" on public.events;
create policy "Organizers can create their events"
  on public.events for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  );

drop policy if exists "Organizers can publish their events" on public.events;
create policy "Organizers can publish their events"
  on public.events for update to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  )
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  );

drop policy if exists "Organizers can remove their events" on public.events;
create policy "Organizers can remove their events"
  on public.events for delete to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  );

drop policy if exists "Published event tickets are visible to everyone" on public.ticket_types;
create policy "Published event tickets are visible to everyone"
  on public.ticket_types for select to anon, authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.status = 'published'
    )
  );

drop policy if exists "Organizers can add tickets to their events" on public.ticket_types;
create policy "Organizers can add tickets to their events"
  on public.ticket_types for insert to authenticated
  with check (
    exists (
      select 1
      from public.events
      join public.profiles on profiles.id = auth.uid()
      where events.id = ticket_types.event_id
        and events.created_by = auth.uid()
        and profiles.role in ('organizer', 'administrator')
    )
  );
