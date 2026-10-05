create extension if not exists "pgcrypto";

create type public.user_role as enum ('coach', 'athlete');
create type public.training_goal as enum ('health', 'performance', 'hypertrophy', 'return_to_play');
create type public.session_type as enum ('strength', 'cardio', 'mixed');
create type public.cardio_mode as enum ('running', 'cycling', 'swimming');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_athletes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (coach_id, athlete_id)
);

create table public.athlete_baselines (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  age integer,
  sport text,
  goal public.training_goal not null,
  experience_level text,
  injuries text,
  max_heart_rate integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planned_sessions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  session_type public.session_type not null,
  goal public.training_goal,
  planned_for timestamptz not null,
  estimated_minutes integer,
  objective text,
  notes text,
  completion_message text,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planned_strength_exercises (
  id uuid primary key default gen_random_uuid(),
  planned_session_id uuid not null references public.planned_sessions(id) on delete cascade,
  exercise_name text not null,
  movement_pattern text,
  muscle_group text,
  sets integer not null,
  reps numeric not null,
  load_kg numeric,
  rest_seconds integer,
  target_rpe numeric,
  target_rir numeric,
  observation text,
  sort_order integer not null default 0
);

create table public.planned_cardio_blocks (
  id uuid primary key default gen_random_uuid(),
  planned_session_id uuid not null references public.planned_sessions(id) on delete cascade,
  mode public.cardio_mode not null,
  target_distance_m integer,
  target_pace text,
  target_speed text,
  target_hr_low integer,
  target_hr_high integer,
  target_intensity_percent numeric,
  intensity_reference text,
  cadence_target numeric,
  stroke_rate_target numeric,
  z1_minutes integer default 0,
  z2_minutes integer default 0,
  z3_minutes integer default 0,
  z4_minutes integer default 0,
  z5_minutes integer default 0,
  notes text
);

create table public.wellness_hooper (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  planned_session_id uuid references public.planned_sessions(id) on delete set null,
  sleep integer not null check (sleep between 1 and 5),
  stress integer not null check (stress between 1 and 5),
  fatigue integer not null check (fatigue between 1 and 5),
  muscle_soreness integer not null check (muscle_soreness between 1 and 5),
  total_score integer generated always as (sleep + stress + fatigue + muscle_soreness) stored,
  created_at timestamptz not null default now()
);

create table public.completed_sessions (
  id uuid primary key default gen_random_uuid(),
  planned_session_id uuid references public.planned_sessions(id) on delete set null,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  session_type public.session_type not null,
  completed_at timestamptz not null default now(),
  duration_minutes integer not null,
  session_rpe numeric not null,
  session_srpe numeric generated always as (duration_minutes * session_rpe) stored,
  final_muscular_rpe numeric,
  final_cardiac_rpe numeric,
  completion_status text not null default 'completed',
  missed_reason text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.completed_strength_exercises (
  id uuid primary key default gen_random_uuid(),
  completed_session_id uuid not null references public.completed_sessions(id) on delete cascade,
  planned_exercise_id uuid references public.planned_strength_exercises(id) on delete set null,
  exercise_name text not null,
  movement_pattern text,
  muscle_group text,
  completed_sets integer not null,
  completed_reps numeric not null,
  completed_load_kg numeric not null default 0,
  actual_rpe numeric,
  actual_rir numeric,
  observation text,
  tonnage_kg numeric generated always as (completed_sets * completed_reps * completed_load_kg) stored
);

create table public.completed_cardio_entries (
  id uuid primary key default gen_random_uuid(),
  completed_session_id uuid not null references public.completed_sessions(id) on delete cascade,
  mode public.cardio_mode not null,
  distance_m integer,
  average_pace text,
  average_speed text,
  intensity_percent numeric,
  intensity_reference text,
  average_hr integer,
  max_hr integer,
  cadence numeric,
  stroke_rate numeric,
  z1_minutes integer default 0,
  z2_minutes integer default 0,
  z3_minutes integer default 0,
  z4_minutes integer default 0,
  z5_minutes integer default 0,
  itrimp numeric,
  notes text
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  assessment_goal public.training_goal,
  assessed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  category text not null,
  test_name text not null,
  result_value numeric,
  result_text text,
  unit text,
  notes text
);

create table public.postural_assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  scapula_shoulder text,
  hip text,
  spine text,
  knee_ankle_foot text,
  gait_balance text,
  general_observations text
);

alter table public.profiles enable row level security;
alter table public.coach_athletes enable row level security;
alter table public.athlete_baselines enable row level security;
alter table public.planned_sessions enable row level security;
alter table public.planned_strength_exercises enable row level security;
alter table public.planned_cardio_blocks enable row level security;
alter table public.wellness_hooper enable row level security;
alter table public.completed_sessions enable row level security;
alter table public.completed_strength_exercises enable row level security;
alter table public.completed_cardio_entries enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.postural_assessments enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

create policy "profiles_select_related"
on public.profiles for select
using (
  id = auth.uid()
  or exists (
    select 1 from public.coach_athletes ca
    where (ca.coach_id = auth.uid() and ca.athlete_id = profiles.id)
       or (ca.athlete_id = auth.uid() and ca.coach_id = profiles.id)
  )
);

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

create policy "coach_athletes_select_related"
on public.coach_athletes for select
using (coach_id = auth.uid() or athlete_id = auth.uid());

create policy "coach_athletes_insert_coach"
on public.coach_athletes for insert
with check (coach_id = auth.uid());

create policy "athlete_baselines_select_related"
on public.athlete_baselines for select
using (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.coach_athletes ca
    where ca.athlete_id = athlete_baselines.athlete_id
      and ca.coach_id = auth.uid()
  )
);

create policy "athlete_baselines_modify_own"
on public.athlete_baselines for all
using (athlete_id = auth.uid())
with check (athlete_id = auth.uid());

create policy "planned_sessions_select_related"
on public.planned_sessions for select
using (coach_id = auth.uid() or athlete_id = auth.uid());

create policy "planned_sessions_modify_coach"
on public.planned_sessions for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "planned_strength_exercises_select_related"
on public.planned_strength_exercises for select
using (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_strength_exercises.planned_session_id
      and (ps.coach_id = auth.uid() or ps.athlete_id = auth.uid())
  )
);

create policy "planned_strength_exercises_modify_coach"
on public.planned_strength_exercises for all
using (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_strength_exercises.planned_session_id
      and ps.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_strength_exercises.planned_session_id
      and ps.coach_id = auth.uid()
  )
);

create policy "planned_cardio_blocks_select_related"
on public.planned_cardio_blocks for select
using (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_cardio_blocks.planned_session_id
      and (ps.coach_id = auth.uid() or ps.athlete_id = auth.uid())
  )
);

create policy "planned_cardio_blocks_modify_coach"
on public.planned_cardio_blocks for all
using (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_cardio_blocks.planned_session_id
      and ps.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.planned_sessions ps
    where ps.id = planned_cardio_blocks.planned_session_id
      and ps.coach_id = auth.uid()
  )
);

create policy "completed_sessions_select_related"
on public.completed_sessions for select
using (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.coach_athletes ca
    where ca.athlete_id = completed_sessions.athlete_id
      and ca.coach_id = auth.uid()
  )
);

create policy "completed_sessions_insert_athlete"
on public.completed_sessions for insert
with check (athlete_id = auth.uid());

create policy "completed_strength_exercises_select_related"
on public.completed_strength_exercises for select
using (
  exists (
    select 1 from public.completed_sessions cs
    where cs.id = completed_strength_exercises.completed_session_id
      and (
        cs.athlete_id = auth.uid()
        or exists (
          select 1 from public.coach_athletes ca
          where ca.athlete_id = cs.athlete_id
            and ca.coach_id = auth.uid()
        )
      )
  )
);

create policy "completed_strength_exercises_insert_athlete"
on public.completed_strength_exercises for insert
with check (
  exists (
    select 1 from public.completed_sessions cs
    where cs.id = completed_strength_exercises.completed_session_id
      and cs.athlete_id = auth.uid()
  )
);

create policy "completed_cardio_entries_select_related"
on public.completed_cardio_entries for select
using (
  exists (
    select 1 from public.completed_sessions cs
    where cs.id = completed_cardio_entries.completed_session_id
      and (
        cs.athlete_id = auth.uid()
        or exists (
          select 1 from public.coach_athletes ca
          where ca.athlete_id = cs.athlete_id
            and ca.coach_id = auth.uid()
        )
      )
  )
);

create policy "completed_cardio_entries_insert_athlete"
on public.completed_cardio_entries for insert
with check (
  exists (
    select 1 from public.completed_sessions cs
    where cs.id = completed_cardio_entries.completed_session_id
      and cs.athlete_id = auth.uid()
  )
);

create policy "wellness_select_related"
on public.wellness_hooper for select
using (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.coach_athletes ca
    where ca.athlete_id = wellness_hooper.athlete_id
      and ca.coach_id = auth.uid()
  )
);

create policy "wellness_insert_athlete"
on public.wellness_hooper for insert
with check (athlete_id = auth.uid());

create policy "assessments_select_related"
on public.assessments for select
using (coach_id = auth.uid() or athlete_id = auth.uid());

create policy "assessments_modify_coach"
on public.assessments for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "assessment_results_select_related"
on public.assessment_results for select
using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_results.assessment_id
      and (a.coach_id = auth.uid() or a.athlete_id = auth.uid())
  )
);

create policy "assessment_results_modify_coach"
on public.assessment_results for all
using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_results.assessment_id
      and a.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_results.assessment_id
      and a.coach_id = auth.uid()
  )
);

create policy "postural_assessments_select_related"
on public.postural_assessments for select
using (
  exists (
    select 1 from public.assessments a
    where a.id = postural_assessments.assessment_id
      and (a.coach_id = auth.uid() or a.athlete_id = auth.uid())
  )
);

create policy "postural_assessments_modify_coach"
on public.postural_assessments for all
using (
  exists (
    select 1 from public.assessments a
    where a.id = postural_assessments.assessment_id
      and a.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assessments a
    where a.id = postural_assessments.assessment_id
      and a.coach_id = auth.uid()
  )
);

create index idx_planned_sessions_athlete_date on public.planned_sessions (athlete_id, planned_for);
create index idx_completed_sessions_athlete_date on public.completed_sessions (athlete_id, completed_at);
create index idx_completed_strength_session on public.completed_strength_exercises (completed_session_id);
create index idx_wellness_athlete_created on public.wellness_hooper (athlete_id, created_at);
