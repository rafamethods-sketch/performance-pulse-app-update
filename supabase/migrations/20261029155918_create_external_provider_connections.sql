-- Store verified external-provider account links without OAuth credentials.

begin;

create table public.external_provider_connections (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  status text not null default 'connected',
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  last_sync_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_provider_connections_provider_supported check (
    provider in ('strava')
  ),
  constraint external_provider_connections_provider_account_id_not_empty check (
    btrim(provider_account_id) <> ''
  ),
  constraint external_provider_connections_status_supported check (
    status in ('connected', 'disconnected', 'error')
  ),
  constraint external_provider_connections_status_consistent check (
    (status = 'connected' and disconnected_at is null)
    or (status = 'disconnected' and disconnected_at is not null)
    or status = 'error'
  ),
  constraint external_provider_connections_scopes_nonempty check (
    array_position(scopes, null) is null
    and (
      cardinality(scopes) = 0
      or array_to_string(scopes, '|') !~ '(^|[|])[[:space:]]*([|]|$)'
    )
  ),
  constraint external_provider_connections_last_error_code_not_empty check (
    last_error_code is null or btrim(last_error_code) <> ''
  ),
  constraint external_provider_connections_athlete_provider_unique unique (
    athlete_id,
    provider
  ),
  constraint external_provider_connections_provider_account_unique unique (
    provider,
    provider_account_id
  )
);

comment on table public.external_provider_connections is
  'Verified links between RAC athletes and external provider accounts; contains no OAuth credentials.';
comment on column public.external_provider_connections.athlete_id is
  'Canonical RAC athlete identity derived by trusted backend flows.';
comment on column public.external_provider_connections.provider_account_id is
  'Provider-owned account identity; never a RAC profile UUID.';
comment on column public.external_provider_connections.last_error_code is
  'Sanitized internal error code only; never provider responses, tokens, or stack traces.';
comment on column public.external_provider_connections.updated_at is
  'Maintained explicitly by future trusted writes; no browser write access exists.';

alter table public.external_provider_connections enable row level security;

revoke all on table public.external_provider_connections from public;
revoke all on table public.external_provider_connections from anon;
revoke all on table public.external_provider_connections from authenticated;
revoke all on table public.external_provider_connections from service_role;
grant select on table public.external_provider_connections to authenticated;
grant select, insert, update, delete on table public.external_provider_connections to service_role;

create policy "external_provider_connections_select_own"
on public.external_provider_connections
for select
to authenticated
using (athlete_id = (select auth.uid()));

commit;
