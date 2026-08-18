-- AI Fitness OS — initial schema. Run in Supabase SQL editor (or `supabase db push`).
create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  age int check (age between 5 and 120),
  gender text,
  height_cm numeric(5,1),
  current_weight numeric(5,1),
  fitness_level text,
  preferred_activities text[],
  units text not null default 'metric',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- GOALS ----------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  daily_calorie_goal int not null default 2000 check (daily_calorie_goal between 800 and 8000),
  daily_step_goal int not null default 10000 check (daily_step_goal between 500 and 100000),
  target_weight numeric(5,1),
  weekly_activity_minutes int,
  weekly_workout_target int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- DAILY LOGS (one row per user per day) ----------
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  steps int not null default 0,
  active_calories int not null default 0,
  workout_calories int not null default 0,
  other_activity_calories int not null default 0,
  total_calories_burned int generated always as (active_calories + workout_calories + other_activity_calories) stored,
  calories_consumed int not null default 0,
  gym boolean not null default false,
  gym_duration_minutes int,
  workout_type text,
  weight numeric(5,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------- FOOD LOGS ----------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  image_url text,
  food_name text not null,
  portion text,
  calories int not null check (calories >= 0),
  protein numeric(6,1) default 0,
  carbs numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  fiber numeric(6,1) default 0,
  ai_confidence text check (ai_confidence in ('low','medium','high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists food_logs_user_date on public.food_logs (user_id, date);

-- ---------- WORKOUTS ----------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  source text not null default 'manual' check (source in ('manual','apple_health')),
  workout_type text not null,
  duration_minutes int not null check (duration_minutes > 0),
  calories_burned int not null default 0,
  intensity text,
  apple_health_id text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, apple_health_id)
);
create index if not exists workouts_user_date on public.workouts (user_id, date);

-- ---------- ACTIVITIES (free-form) ----------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  activity_name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  intensity text,
  calories_burned int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists activities_user_date on public.activities (user_id, date);

-- ---------- WEIGHT ENTRIES ----------
create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric(5,1) not null check (weight between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------- APPLE HEALTH ----------
create table if not exists public.health_integrations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ingest_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  connected boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.health_syncs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sync_time timestamptz not null default now(),
  source text not null default 'health_auto_export',
  status text not null check (status in ('success','partial','failed')),
  records_imported int not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'health_auto_export',
  record_type text not null,
  record_date date not null,
  payload jsonb,
  normalized_value numeric,
  unit text,
  created_at timestamptz not null default now()
);
create index if not exists health_records_user_type_date on public.health_records (user_id, record_type, record_date);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text;
begin
  foreach t in array array['profiles','goals','daily_logs','food_logs','workouts'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- Auto-create profile, goals, health integration on signup ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing;
  insert into public.goals (user_id) values (new.id) on conflict do nothing;
  insert into public.health_integrations (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.daily_logs enable row level security;
alter table public.food_logs enable row level security;
alter table public.workouts enable row level security;
alter table public.activities enable row level security;
alter table public.weight_entries enable row level security;
alter table public.health_integrations enable row level security;
alter table public.health_syncs enable row level security;
alter table public.health_records enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own daily_logs" on public.daily_logs;
create policy "own daily_logs" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own food_logs" on public.food_logs;
create policy "own food_logs" on public.food_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own workouts" on public.workouts;
create policy "own workouts" on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own activities" on public.activities;
create policy "own activities" on public.activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own weight" on public.weight_entries;
create policy "own weight" on public.weight_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own integration read" on public.health_integrations;
create policy "own integration read" on public.health_integrations for select using (auth.uid() = user_id);
drop policy if exists "own integration update" on public.health_integrations;
create policy "own integration update" on public.health_integrations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own syncs read" on public.health_syncs;
create policy "own syncs read" on public.health_syncs for select using (auth.uid() = user_id);
drop policy if exists "own records read" on public.health_records;
create policy "own records read" on public.health_records for select using (auth.uid() = user_id);
-- health_syncs / health_records are written only by the server (service role) via the webhook.

-- ---------- STORAGE: private food images bucket ----------
insert into storage.buckets (id, name, public) values ('food-images', 'food-images', false)
on conflict (id) do nothing;

drop policy if exists "users read own food images" on storage.objects;
create policy "users read own food images" on storage.objects for select
  using (bucket_id = 'food-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "users upload own food images" on storage.objects;
create policy "users upload own food images" on storage.objects for insert
  with check (bucket_id = 'food-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "users delete own food images" on storage.objects;
create policy "users delete own food images" on storage.objects for delete
  using (bucket_id = 'food-images' and auth.uid()::text = (storage.foldername(name))[1]);
