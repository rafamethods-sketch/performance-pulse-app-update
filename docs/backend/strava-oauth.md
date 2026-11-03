# Strava OAuth foundation

S4.1 establishes the trusted OAuth boundary without contacting Strava. An authenticated RAC athlete starts the flow, the backend stores only a SHA-256 state digest with a ten-minute TTL, and the callback atomically consumes that state to recover the canonical RAC `athlete_id`.

- Authorization uses `https://www.strava.com/oauth/authorize` and requests only `activity:read`.
- The callback never accepts RAC ownership fields and does not require a browser Bearer token; ownership comes exclusively from the consumed state.
- Raw state, authorization codes, access tokens, refresh tokens, client secrets, encryption keys, and raw provider responses are never logged or stored outside their dedicated encrypted boundary.
- `external_provider_oauth_states` has RLS with no policies. Only `service_role` may access it or execute the atomic consume RPC.
- A successful fake exchange creates an `error` connection, stores encrypted credentials, then finalizes it as `connected`. Any failure compensates by deleting the new connection and its cascading credentials.
- Returned scopes are validated and persisted exactly as granted; `activity:read` is required and `activity:read_all` is not requested.
- Callback redirects use the fixed internal `/` destination. Arbitrary redirect URLs are never accepted.
- Next incoming-request logging excludes the callback path so its query-string state and authorization code are not written by the application logger. Deployment-edge access-log redaction remains an environment requirement before real OAuth is enabled.

Future runtime variables are `STRAVA_CLIENT_ID`, `STRAVA_REDIRECT_URI`, and server-only `STRAVA_CLIENT_SECRET`. They are validated only when invoked, so builds require no secrets. S4.1 uses an injected fake exchanger in tests; real token exchange at `https://www.strava.com/oauth/token` remains S4.2.
