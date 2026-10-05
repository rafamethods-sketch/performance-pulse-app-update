-- REVIEW-ONLY DRAFT — DO NOT EXECUTE OR MOVE INTO supabase/migrations until the
-- legacy 001 baseline procedure has been reviewed and approved.

begin;

create type public.user_role as enum ('coach', 'athlete');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'athlete',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Backend identity for RAC users. The primary key is the canonical auth.users UUID.';
comment on column public.profiles.role is
  'Authorization role assigned by trusted backend workflows only. New users default to athlete.';

create function public.create_rac_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'athlete'::public.user_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.create_rac_profile_for_auth_user() is
  'Creates a fail-closed athlete profile for a newly authenticated user. It never reads role from user metadata.';

revoke all on function public.create_rac_profile_for_auth_user() from public;
revoke all on function public.create_rac_profile_for_auth_user() from anon;
revoke all on function public.create_rac_profile_for_auth_user() from authenticated;

create trigger rac_create_profile_after_auth_user_insert
after insert on auth.users
for each row execute function public.create_rac_profile_for_auth_user();

insert into public.profiles (id, role)
select users.id, 'athlete'::public.user_role
from auth.users as users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

commit;
