-- REVIEW-ONLY DRAFT — DO NOT EXECUTE OR MOVE INTO supabase/migrations until the
-- legacy 001 baseline procedure has been reviewed and approved.

begin;

create type public.coach_athlete_status as enum ('pending', 'active', 'inactive');

create table public.coach_athletes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  status public.coach_athlete_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coach_athletes_distinct_users check (coach_id <> athlete_id),
  constraint coach_athletes_unique_pair unique (coach_id, athlete_id)
);

create index coach_athletes_athlete_id_idx
on public.coach_athletes (athlete_id);

comment on table public.coach_athletes is
  'Trusted relationship between a coach profile and an athlete profile. Only active relationships authorize operational access.';
comment on column public.coach_athletes.status is
  'Pending is the fail-closed default. Only active grants operational coach-to-athlete access.';

create function public.enforce_coach_athlete_profile_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles as coach_profile
    where coach_profile.id = new.coach_id
      and coach_profile.role = 'coach'::public.user_role
  ) then
    raise exception 'coach_id must reference a coach profile'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.profiles as athlete_profile
    where athlete_profile.id = new.athlete_id
      and athlete_profile.role = 'athlete'::public.user_role
  ) then
    raise exception 'athlete_id must reference an athlete profile'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.enforce_coach_athlete_profile_roles() is
  'Rejects trusted relationship writes whose endpoints do not have the required backend roles.';

revoke all on function public.enforce_coach_athlete_profile_roles() from public;
revoke all on function public.enforce_coach_athlete_profile_roles() from anon;
revoke all on function public.enforce_coach_athlete_profile_roles() from authenticated;

create trigger coach_athletes_enforce_profile_roles
before insert or update of coach_id, athlete_id
on public.coach_athletes
for each row execute function public.enforce_coach_athlete_profile_roles();

create function public.is_active_coach_for(target_athlete_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.coach_athletes as relationship
    join public.profiles as coach_profile
      on coach_profile.id = relationship.coach_id
    join public.profiles as athlete_profile
      on athlete_profile.id = relationship.athlete_id
    where relationship.coach_id = (select auth.uid())
      and relationship.athlete_id = target_athlete_id
      and relationship.status = 'active'::public.coach_athlete_status
      and coach_profile.role = 'coach'::public.user_role
      and athlete_profile.role = 'athlete'::public.user_role
  );
$$;

comment on function public.is_active_coach_for(uuid) is
  'Returns whether the authenticated backend coach has an active relationship with the target athlete UUID.';

revoke all on function public.is_active_coach_for(uuid) from public;
revoke all on function public.is_active_coach_for(uuid) from anon;
revoke all on function public.is_active_coach_for(uuid) from authenticated;
grant execute on function public.is_active_coach_for(uuid) to authenticated;

alter table public.coach_athletes enable row level security;

revoke all on table public.coach_athletes from anon;
revoke all on table public.coach_athletes from authenticated;
grant select on table public.coach_athletes to authenticated;

create policy "coach_athletes_select_own"
on public.coach_athletes
for select
to authenticated
using (
  coach_id = (select auth.uid())
  or athlete_id = (select auth.uid())
);

create policy "profiles_select_active_athlete_for_coach"
on public.profiles
for select
to authenticated
using (public.is_active_coach_for(id));

commit;
