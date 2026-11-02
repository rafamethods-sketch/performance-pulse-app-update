# External provider credentials

`public.external_provider_credentials` is the private, encrypted credential store for a verified `external_provider_connections` row. `connection_id` is both its primary key and cascading foreign key, enforcing a strict one-to-one relationship without a second identity.

- Access and refresh tokens are stored only as independent AES-256-GCM ciphertext, 12-byte nonce, and 16-byte authentication-tag fields.
- `expires_at` records provider access-token expiry. An already-expired timestamp is valid stored state and can be refreshed later by trusted server code.
- `encryption_key_version` identifies the server-only keyring entry; no encryption key is stored in the database.
- `credential_version` starts at 1 and is reserved for trusted optimistic concurrency updates.
- RLS is enabled with no policies. `anon` and `authenticated` have zero privileges; only `service_role` receives CRUD grants.
- Deleting the parent connection cascades to its credential row.
- Plaintext tokens, OAuth authorization codes, client secrets, raw provider responses, refresh locks, and OAuth orchestration are outside S3.2.
- `created_at` and `updated_at` are technical audit timestamps; future trusted writes must maintain `updated_at` explicitly.

## Trusted repository

The server-only credential repository accepts an injected trusted Supabase client. Callers provide a connection ID and token values, while the repository resolves the provider from `external_provider_connections`, encrypts both tokens independently through the shared AES-256-GCM primitive, and encapsulates PostgREST `bytea` conversion.

- Plaintext exists only in the trusted process while storing, loading, or replacing credentials and is never returned in metadata operations.
- `replaceCredentials` and `deleteCredentials` require the expected `credential_version`; stale writes fail with a sanitized conflict instead of overwriting newer credentials.
- Each successful replacement atomically writes both encrypted envelopes and expiry, increments `credential_version`, selects the active key version, and maintains `updated_at`.
- The repository performs no OAuth, provider HTTP, refresh coordination, lease management, RPC, logging, or browser serialization.
