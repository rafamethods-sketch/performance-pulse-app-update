-- Store normalized, source-controlled external activities for trusted ingestion.

begin;

create table public.external_activities (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_record_id text not null,
  activity_type text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  distance_meters numeric,
  avg_hr_bpm numeric,
  max_hr_bpm numeric,
  active_calories_kcal numeric,
  elevation_gain_meters numeric,
  source_app text,
  device jsonb,
  first_imported_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  source_updated_at timestamptz,
  deleted_at_source timestamptz,
  schema_version integer not null default 1,
  constraint external_activities_provider_supported check (
    provider in ('mock', 'apple_health', 'health_connect', 'garmin', 'intervals')
  ),
  constraint external_activities_provider_record_id_not_empty check (
    btrim(provider_record_id) <> ''
  ),
  constraint external_activities_activity_type_not_empty check (
    btrim(activity_type) <> ''
  ),
  constraint external_activities_duration_non_negative check (
    duration_seconds is null or duration_seconds >= 0
  ),
  constraint external_activities_distance_non_negative check (
    distance_meters is null or distance_meters >= 0
  ),
  constraint external_activities_avg_hr_positive check (
    avg_hr_bpm is null or avg_hr_bpm > 0
  ),
  constraint external_activities_max_hr_positive check (
    max_hr_bpm is null or max_hr_bpm > 0
  ),
  constraint external_activities_active_calories_non_negative check (
    active_calories_kcal is null or active_calories_kcal >= 0
  ),
  constraint external_activities_elevation_gain_non_negative check (
    elevation_gain_meters is null or elevation_gain_meters >= 0
  ),
  constraint external_activities_time_order check (
    ended_at is null or ended_at >= started_at
  ),
  constraint external_activities_schema_version_positive check (
    schema_version >= 1
  ),
  constraint external_activities_device_object check (
    device is null or jsonb_typeof(device) = 'object'
  ),
  constraint external_activities_provider_identity_unique unique (
    athlete_id,
    provider,
    provider_record_id
  )
);

comment on table public.external_activities is
  'Normalized external activity data controlled exclusively by trusted ingestion.';
comment on column public.external_activities.athlete_id is
  'Canonical athlete identity referencing public.profiles.id; never a local CoachClient.id.';

create index external_activities_athlete_started_at_idx
on public.external_activities (athlete_id, started_at desc);

alter table public.external_activities enable row level security;

revoke all on table public.external_activities from public;
revoke all on table public.external_activities from anon;
revoke all on table public.external_activities from authenticated;
revoke all on table public.external_activities from service_role;
grant select on table public.external_activities to authenticated;
grant select, insert, update, delete on table public.external_activities to service_role;

create policy "external_activities_select_own"
on public.external_activities
for select
to authenticated
using (athlete_id = (select auth.uid()));

create policy "external_activities_select_active_coach"
on public.external_activities
for select
to authenticated
using (public.is_active_coach_for(athlete_id));

commit;
