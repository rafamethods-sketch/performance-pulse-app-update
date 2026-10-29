# External provider connections

`public.external_provider_connections` records a verified link between a canonical RAC athlete profile and an external provider account. It is separate from `external_activities`, which stores imported activity records, and from the future private credentials store.

- S2 supports only the cloud-side `strava` provider.
- `athlete_id` always references `public.profiles.id`; `provider_account_id` is the provider-owned account identifier and never establishes RAC ownership.
- `(athlete_id, provider)` permits one logical connection per RAC athlete and provider.
- `(provider, provider_account_id)` prevents one provider account from being linked to multiple RAC athletes.
- Athletes may select only their own connection row. They cannot insert, update, or delete it.
- Coaches and anonymous users have no direct access. A future server-side DTO or safe view may expose minimal connection status if needed.
- Only the trusted backend may write connection rows. Future OAuth state validation must determine the RAC athlete before any write.
- OAuth access tokens, refresh tokens, client secrets, authorization codes, OAuth state, encryption keys, and raw OAuth payloads are explicitly excluded.
- `last_error_code` stores only a sanitized internal code. `updated_at` is maintained explicitly by trusted writes.
