# External activities schema

- `public.external_activities` stores normalized, source-controlled data written by trusted ingestion only.
- `athlete_id` always references `public.profiles.id`; local `CoachClient.id` values never reach the database.
- Imported identity is unique per athlete, provider, and provider record ID. Records from different providers are not merged automatically.
- Athletes may read their own rows, and coaches may read rows only through an active `coach_athletes` relationship enforced by RLS.
- Browser roles have no write privileges. Browser code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; trusted server persistence uses `SUPABASE_SECRET_KEY`, which must never be exposed to the frontend.
- Manual `session_rpe`, notes, and activity type overrides remain separate from source-controlled data so later imports cannot overwrite them.
- Session linking remains pending until RAC sessions have stable backend UUIDs.
- Version 1 stores no raw provider payload, GPS track, per-second heart-rate samples, FIT file, or provider token.

The trusted flow is `provider → normalization → ingestion service → injected repository → external_activities`. The repository has an explicit source-controlled column allowlist and cannot write manual enrichment or session links. `createSupabaseAdminClient()` constructs the elevated client only when invoked on the server and fails closed if its server-only configuration is absent or invalid. The admin client bypasses RLS, so it never proves caller identity or ownership: the authenticated Route Handler planned for E2 must validate the athlete and derive `profiles.id` before invoking trusted persistence.
