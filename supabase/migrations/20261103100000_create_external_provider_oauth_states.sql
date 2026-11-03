-- Store short-lived, single-use OAuth state hashes for trusted provider callbacks.

begin;

create table public.external_provider_oauth_states (
  id uuid primary key default gen_random_uuid(),
  state_hash bytea not null unique,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  redirect_path text,
  constraint external_provider_oauth_states_provider_supported check (
    provider in ('strava')
  ),
  constraint external_provider_oauth_states_redirect_path_safe check (
    redirect_path is null or redirect_path in ('/', '/client', '/settings/integrations')
  )
);

comment on table public.external_provider_oauth_states is
  'Hashed, short-lived OAuth state created and consumed only by the trusted backend.';
comment on column public.external_provider_oauth_states.state_hash is
  'SHA-256 digest of the raw state; the raw browser value is never persisted.';
comment on column public.external_provider_oauth_states.athlete_id is
  'Canonical RAC athlete established before OAuth begins.';

alter table public.external_provider_oauth_states enable row level security;

revoke all on table public.external_provider_oauth_states from public;
revoke all on table public.external_provider_oauth_states from anon;
revoke all on table public.external_provider_oauth_states from authenticated;
revoke all on table public.external_provider_oauth_states from service_role;
grant select, insert, update, delete on table public.external_provider_oauth_states to service_role;

create function public.consume_external_provider_oauth_state(p_state_hash bytea)
returns table (
  outcome text,
  athlete_id uuid,
  provider text,
  redirect_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched public.external_provider_oauth_states%rowtype;
begin
  select states.*
  into matched
  from public.external_provider_oauth_states as states
  where states.state_hash = p_state_hash
  for update;

  if not found then
    return query select 'invalid'::text, null::uuid, null::text, null::text;
    return;
  end if;

  if matched.consumed_at is not null then
    return query select 'consumed'::text, null::uuid, null::text, null::text;
    return;
  end if;

  if matched.expires_at <= clock_timestamp() then
    return query select 'expired'::text, null::uuid, null::text, null::text;
    return;
  end if;

  update public.external_provider_oauth_states as states
  set consumed_at = clock_timestamp()
  where states.id = matched.id;

  return query select
    'consumed_now'::text,
    matched.athlete_id,
    matched.provider,
    matched.redirect_path;
end;
$$;

revoke all on function public.consume_external_provider_oauth_state(bytea)
  from public, anon, authenticated;
grant execute on function public.consume_external_provider_oauth_state(bytea)
  to service_role;

commit;
