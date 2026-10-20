# External activities schema

- `public.external_activities` stores normalized, source-controlled data written by trusted ingestion only.
- `athlete_id` always references `public.profiles.id`; local `CoachClient.id` values never reach the database.
- Imported identity is unique per athlete, provider, and provider record ID. Records from different providers are not merged automatically.
- Athletes may read their own rows, and coaches may read rows only through an active `coach_athletes` relationship enforced by RLS.
- Browser roles have no write privileges. Future trusted server-side ingestion may write through `service_role`, which must never be exposed to the frontend.
- Manual `session_rpe`, notes, and activity type overrides remain separate from source-controlled data so later imports cannot overwrite them.
- Session linking remains pending until RAC sessions have stable backend UUIDs.
- Version 1 stores no raw provider payload, GPS track, per-second heart-rate samples, FIT file, or provider token.

The trusted flow is `provider → normalization → ingestion service → injected repository → external_activities`. The repository has an explicit source-controlled column allowlist and cannot write manual enrichment or session links. Runtime construction of a server-only Supabase client remains pending; no service-role secret is stored or read by this layer.
