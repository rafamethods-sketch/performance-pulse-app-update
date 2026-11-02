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
