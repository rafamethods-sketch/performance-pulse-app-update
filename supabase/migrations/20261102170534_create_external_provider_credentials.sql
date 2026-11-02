-- Store encrypted provider credentials separately from connection metadata.

begin;

create table public.external_provider_credentials (
  connection_id uuid primary key
    references public.external_provider_connections(id)
    on delete cascade,
  access_token_ciphertext bytea not null,
  access_token_nonce bytea not null,
  access_token_auth_tag bytea not null,
  refresh_token_ciphertext bytea not null,
  refresh_token_nonce bytea not null,
  refresh_token_auth_tag bytea not null,
  expires_at timestamptz not null,
  encryption_key_version integer not null,
  credential_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_provider_credentials_access_ciphertext_nonempty check (
    octet_length(access_token_ciphertext) > 0
  ),
  constraint external_provider_credentials_access_nonce_length check (
    octet_length(access_token_nonce) = 12
  ),
  constraint external_provider_credentials_access_auth_tag_length check (
    octet_length(access_token_auth_tag) = 16
  ),
  constraint external_provider_credentials_refresh_ciphertext_nonempty check (
    octet_length(refresh_token_ciphertext) > 0
  ),
  constraint external_provider_credentials_refresh_nonce_length check (
    octet_length(refresh_token_nonce) = 12
  ),
  constraint external_provider_credentials_refresh_auth_tag_length check (
    octet_length(refresh_token_auth_tag) = 16
  ),
  constraint external_provider_credentials_key_version_positive check (
    encryption_key_version >= 1
  ),
  constraint external_provider_credentials_version_positive check (
    credential_version >= 1
  )
);

comment on table public.external_provider_credentials is
  'Encrypted provider credentials accessible only to the trusted backend.';
comment on column public.external_provider_credentials.connection_id is
  'Strict one-to-one identity and cascade boundary for an external provider connection.';
comment on column public.external_provider_credentials.expires_at is
  'Provider access-token expiry; past timestamps remain valid stored state until trusted refresh.';
comment on column public.external_provider_credentials.encryption_key_version is
  'Server-side keyring version required to decrypt both credential envelopes.';
comment on column public.external_provider_credentials.credential_version is
  'Monotonic version reserved for trusted optimistic concurrency updates.';
comment on column public.external_provider_credentials.updated_at is
  'Maintained explicitly by trusted writes; no browser write access exists.';

alter table public.external_provider_credentials enable row level security;

revoke all on table public.external_provider_credentials from public;
revoke all on table public.external_provider_credentials from anon;
revoke all on table public.external_provider_credentials from authenticated;
revoke all on table public.external_provider_credentials from service_role;
grant select, insert, update, delete on table public.external_provider_credentials to service_role;

commit;
