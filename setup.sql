-- Run once in Supabase: SQL Editor -> New query -> Run
create table if not exists public.habit_tracker_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.habit_tracker_data enable row level security;

create policy "habit_select_own" on public.habit_tracker_data
  for select to authenticated using (auth.uid() = user_id);
create policy "habit_insert_own" on public.habit_tracker_data
  for insert to authenticated with check (auth.uid() = user_id);
create policy "habit_update_own" on public.habit_tracker_data
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_delete_own" on public.habit_tracker_data
  for delete to authenticated using (auth.uid() = user_id);
