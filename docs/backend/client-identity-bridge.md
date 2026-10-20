# Client identity bridge

- `CoachClient.id` is a local RAC identifier used by navigation and local persistence. It is not a backend foreign key.
- `profiles.id` is the canonical backend identity and equals the corresponding `auth.users.id` UUID.
- `CoachClient.athleteProfileId` and `BackendAthleteReference` are optional local/DTO references to that backend profile. They may only come from a trusted backend response and must never be inferred from a name, email, local client ID, slug, position, session ID, timestamp, or OAuth metadata. Neither is proof of authorization.
- `coach_clients_v1` and any `athleteProfileId` stored in localStorage are caches, not authorization. A valid UUID alone grants no access.
- Authorization is checked exclusively in the backend through an active `coach_athletes` relationship and database RLS. `profiles.role` is the authoritative application role.
- Demo, legacy, and local-only clients may omit `athleteProfileId`; they continue to work locally but are not backend-relatable.
- The current Auth UI still treats any authenticated email as a coach. Wiring `auth session -> profiles.id / profiles.role -> UI role` remains pending until the identity schema is deployed to Preview. That future wiring must fail closed and must not retain `email => coach` as a fallback.
