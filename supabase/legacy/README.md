# Legacy Supabase schema

`001_initial_schema.sql` is a legacy schema retained only as a historical
reference. It must never be executed automatically and it does not represent
the current baseline of Performance HQ Preview.

Performance HQ Preview started this baseline process with an empty `public`
schema. Do not copy this file back into `supabase/migrations/` and do not use it
as the starting point for Preview.

Production has not yet been audited or reconciled. Do not assume that
Production either contains or does not contain this legacy schema. Any future
comparison or baseline decision requires a separate, read-only audit and an
explicitly approved procedure.
