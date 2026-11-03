-- Coordinate provider credential refreshes through short trusted leases.

begin;

alter table public.external_provider_credentials
  add column refresh_lock_id uuid,
  add column refresh_lock_expires_at timestamptz,
  add constraint external_provider_credentials_refresh_lock_complete check (
    (refresh_lock_id is null and refresh_lock_expires_at is null)
    or (refresh_lock_id is not null and refresh_lock_expires_at is not null)
  );

comment on column public.external_provider_credentials.refresh_lock_id is
  'Opaque trusted-runtime lease owner used only while refreshing credentials.';
comment on column public.external_provider_credentials.refresh_lock_expires_at is
  'Lease expiry; expired leases may be reclaimed by a new trusted refresh worker.';

create function public.claim_external_provider_credential_refresh(
  p_connection_id uuid,
  p_expected_credential_version bigint,
  p_refresh_lock_id uuid
)
returns table (
  connection_id uuid,
  credential_version bigint,
  refresh_lock_id uuid,
  refresh_lock_expires_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  update public.external_provider_credentials as credentials
  set
    refresh_lock_id = p_refresh_lock_id,
    refresh_lock_expires_at = clock_timestamp() + interval '120 seconds'
  where credentials.connection_id = p_connection_id
    and credentials.credential_version = p_expected_credential_version
    and (
      credentials.refresh_lock_id is null
      or credentials.refresh_lock_expires_at <= clock_timestamp()
    )
  returning
    credentials.connection_id,
    credentials.credential_version,
    credentials.refresh_lock_id,
    credentials.refresh_lock_expires_at;
$$;

create function public.complete_external_provider_credential_refresh(
  p_connection_id uuid,
  p_expected_credential_version bigint,
  p_refresh_lock_id uuid,
  p_access_token_ciphertext bytea,
  p_access_token_nonce bytea,
  p_access_token_auth_tag bytea,
  p_refresh_token_ciphertext bytea,
  p_refresh_token_nonce bytea,
  p_refresh_token_auth_tag bytea,
  p_expires_at timestamptz,
  p_encryption_key_version integer,
  p_updated_at timestamptz
)
returns table (
  connection_id uuid,
  expires_at timestamptz,
  encryption_key_version integer,
  credential_version bigint,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  update public.external_provider_credentials as credentials
  set
    access_token_ciphertext = p_access_token_ciphertext,
    access_token_nonce = p_access_token_nonce,
    access_token_auth_tag = p_access_token_auth_tag,
    refresh_token_ciphertext = p_refresh_token_ciphertext,
    refresh_token_nonce = p_refresh_token_nonce,
    refresh_token_auth_tag = p_refresh_token_auth_tag,
    expires_at = p_expires_at,
    encryption_key_version = p_encryption_key_version,
    credential_version = credentials.credential_version + 1,
    refresh_lock_id = null,
    refresh_lock_expires_at = null,
    updated_at = p_updated_at
  where credentials.connection_id = p_connection_id
    and credentials.credential_version = p_expected_credential_version
    and credentials.refresh_lock_id = p_refresh_lock_id
    and credentials.refresh_lock_expires_at > clock_timestamp()
  returning
    credentials.connection_id,
    credentials.expires_at,
    credentials.encryption_key_version,
    credentials.credential_version,
    credentials.created_at,
    credentials.updated_at;
$$;

create function public.release_external_provider_credential_refresh(
  p_connection_id uuid,
  p_expected_credential_version bigint,
  p_refresh_lock_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.external_provider_credentials as credentials
  set
    refresh_lock_id = null,
    refresh_lock_expires_at = null
  where credentials.connection_id = p_connection_id
    and credentials.credential_version = p_expected_credential_version
    and credentials.refresh_lock_id = p_refresh_lock_id;

  return found;
end;
$$;

revoke all on function public.claim_external_provider_credential_refresh(uuid, bigint, uuid)
  from public, anon, authenticated;
revoke all on function public.complete_external_provider_credential_refresh(
  uuid, bigint, uuid, bytea, bytea, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz
) from public, anon, authenticated;
revoke all on function public.release_external_provider_credential_refresh(uuid, bigint, uuid)
  from public, anon, authenticated;

grant execute on function public.claim_external_provider_credential_refresh(uuid, bigint, uuid)
  to service_role;
grant execute on function public.complete_external_provider_credential_refresh(
  uuid, bigint, uuid, bytea, bytea, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz
) to service_role;
grant execute on function public.release_external_provider_credential_refresh(uuid, bigint, uuid)
  to service_role;

commit;
