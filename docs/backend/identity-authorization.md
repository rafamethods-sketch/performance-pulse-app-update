# RAC backend identity and authorization

This document describes the minimal identity foundation for RAC. It does not
create sessions, wellness records, assessments, planning data, or external
activities.

## Draft status and migration safety

The SQL files for this design live under `supabase/drafts/identity/`. They are
review-only drafts and must not be executed. Supabase CLI does not discover
that directory as its automatic migration history.

Do not run `supabase db push` for this work. The legacy
`supabase/migrations/001_initial_schema.sql` must first be resolved through a
separately reviewed baseline procedure. Only after that procedure is approved
may these drafts be reviewed again and moved or renamed into
`supabase/migrations/`.

## Canonical user identity

`auth.users.id` is the canonical UUID for an authenticated person. Every RAC
backend user has a `public.profiles` row with the same primary key:

```text
auth.users.id = profiles.id
```

The frontend does not choose this UUID and local identifiers are never accepted
as substitutes.

## Profile provisioning and roles

A database trigger creates a missing profile when an `auth.users` row is
created. The role is hardcoded to `athlete`; it is not read from OAuth metadata,
user metadata, email, query parameters, or frontend input.

The migration also backfills missing profiles for existing Auth users as
athletes and uses `ON CONFLICT DO NOTHING`, so an existing profile is not
overwritten.

Authenticated clients receive only `SELECT` privilege on profiles. They cannot
directly insert, update, delete, or promote profiles. A future athlete-to-coach
promotion must use a separately reviewed trusted backend workflow. No such
promotion workflow is implemented yet.

`profile.role` represents the product roles `coach` and `athlete`; it must not
represent platform administration. Platform owner/admin capability will be a
separate authorization layer. Initially Rafa will be the first platform admin,
and only a platform admin will be allowed to authorize future coaches. A normal
coach must never be able to create coaches, promote an athlete to coach, grant
administrative access to themselves, or administer unrelated coaches.

No `platform_admins` table, promotion RPC, administration UI, organization, or
organization membership is implemented by these drafts. The current profile
model does not prevent adding those capabilities separately later.

## Coach-athlete authorization

`public.coach_athletes` connects two canonical profile UUIDs. Its status is one
of:

- `pending`: relationship exists but grants no operational access;
- `active`: a validated coach may access the related athlete;
- `inactive`: historical/revoked relationship that grants no operational access.

The default is `pending`. A database trigger also verifies that `coach_id`
references a coach profile and `athlete_id` references an athlete profile.

Authenticated clients can read relationship rows in which they participate,
but they cannot directly insert, update, activate, reassign, or delete a
relationship. Those mutations require a future trusted workflow.

RAC begins with one operational coach, but the relationship model must not
assume a global singleton coach. The pair model supports multiple coaches,
multiple athletes per coach, RAC centre coaches, authorized external coaches,
and potentially multiple coaches for one athlete. It contains no hardcoded
coach UUID or email.

Operational coach-to-athlete access requires all of the following:

1. the caller UUID is the relationship's `coach_id`;
2. the caller profile role is `coach`;
3. the target profile role is `athlete`;
4. the relationship status is `active`.

`public.is_active_coach_for(uuid)` performs that minimal check with a fixed
empty `search_path`. It derives caller identity from `auth.uid()` and accepts
only the target athlete UUID. It does not accept a coach ID or ownership claim
from the frontend.

## RLS and recursion

Profiles and relationships have RLS enabled. The direct relationship policy
checks only row UUIDs and does not query profiles. The related-profile policy
uses the narrowly scoped `SECURITY DEFINER` helper instead of making profiles
and `coach_athletes` policies query each other recursively.

The helper returns only a boolean authorization decision. Its body uses fully
qualified object names, has a fixed empty `search_path`, contains no dynamic
SQL, and is executable only by `authenticated`.

## Initial owner bootstrap

Existing Auth users are intentionally backfilled as athletes. Before enabling
real coach access, the initial owner must be promoted through a trusted,
one-time bootstrap that is outside reusable migrations and frontend code.

Considered approaches:

1. **One-time audited database-admin operation.** After verifying the owner's
   Auth UUID out of band, an authorized database administrator performs one
   narrowly scoped transaction and records the operation. No email or UUID is
   embedded in a reusable migration. This is the recommended initial approach
   because it has the smallest bootstrap surface.
2. **Controlled administrative bootstrap table/configuration.** A separately
   secured mechanism could hold a one-time bootstrap request and consume it
   atomically. This is more repeatable but adds schema, lifecycle, and secret
   management before they are otherwise needed.
3. **One-time trusted server command.** A reviewed server-only command could
   require an explicit Auth UUID and operator confirmation. This is acceptable
   if it provides equivalent authentication, auditing, and one-time controls,
   but it must not expose a browser endpoint that can self-promote.

OAuth metadata, email matching, query parameters, frontend state, and reusable
hardcoded identifiers are never authorization sources. After the separate
platform-admin capability exists, all subsequent coach promotions should flow
through that audited authority rather than repeating bootstrap operations.

## Future organizations

Organizations can be added later with separate `organizations` and
`organization_members` tables referencing `profiles.id`. They do not need to
replace profile identity or the direct `coach_athletes` authorization pair.
Organization membership may add policy constraints or provenance, while an
authorized external coach can continue to exist without belonging to an
organization.

## Demo and local data

Local RAC identifiers such as `demo-client`, client slugs,
`session-${Date.now()}`, and other local-only records do not map automatically
to `profiles.id`, `coach_id`, or `athlete_id`. Demo and local clients remain
outside this backend identity foundation.

## Legacy migration 001

`001_initial_schema.sql` is retained unchanged as a legacy artifact. The new
identity SQL drafts are intentionally designed for a project whose `public`
schema is empty. They must not be applied after executing migration 001 because
001 already creates overlapping types and tables and includes a weaker
authorization model.

Before any remote migration run, a separate reviewed baseline procedure must
mark or exclude legacy migration 001 without executing it. A standard command
that blindly applies every repository migration in filename order is unsafe for
the empty Preview project and must not be used.

## Not implemented yet

- coach promotion;
- invitation, acceptance, activation, or revocation workflows;
- frontend role loading;
- mapping from `CoachClient` to an athlete profile UUID;
- stable backend session identity;
- planned or completed sessions;
- wellness, assessments, or other health data;
- external activities;
- any migration execution against Supabase.
