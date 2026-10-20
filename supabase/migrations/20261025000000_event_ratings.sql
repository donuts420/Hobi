create table if not exists public.event_ratings (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  primary key (event_id, user_id)
);

alter table public.event_ratings enable row level security;
grant select on public.event_ratings to authenticated;
grant insert (event_id, user_id, rating) on public.event_ratings to authenticated;
grant update (rating) on public.event_ratings to authenticated;

drop policy if exists "Users can read their own event ratings" on public.event_ratings;
create policy "Users can read their own event ratings"
  on public.event_ratings for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can rate published events" on public.event_ratings;
create policy "Users can rate published events"
  on public.event_ratings for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events
      where events.id = event_ratings.event_id and events.status = 'published'
    )
  );

drop policy if exists "Users can update their event rating" on public.event_ratings;
create policy "Users can update their event rating"
  on public.event_ratings for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events
      where events.id = event_ratings.event_id and events.status = 'published'
    )
  );

create or replace function public.get_event_rating_summary(p_event_id uuid)
returns table (average_rating numeric, review_count bigint, user_rating smallint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(round(avg(rating)::numeric, 2), 0::numeric),
    count(*),
    max(rating) filter (where user_id = auth.uid())
  from public.event_ratings
  where event_id = p_event_id
    and exists (
      select 1 from public.events
      where events.id = p_event_id and events.status = 'published'
    );
$$;

grant execute on function public.get_event_rating_summary(uuid) to anon, authenticated;
