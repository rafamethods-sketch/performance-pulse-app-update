import "server-only";

export type StravaOAuthErrorCode =
  | "oauth_state_invalid"
  | "oauth_state_expired"
  | "oauth_state_consumed"
  | "oauth_access_denied"
  | "provider_scope_insufficient"
  | "provider_account_already_linked"
  | "provider_oauth_exchange_failed"
  | "provider_connection_persistence_failed"
  | "already_connected"
  | "strava_configuration_invalid";

const messages: Record<StravaOAuthErrorCode, string> = {
  oauth_state_invalid: "OAuth state is invalid.",
  oauth_state_expired: "OAuth state has expired.",
  oauth_state_consumed: "OAuth state has already been used.",
  oauth_access_denied: "OAuth access was cancelled.",
  provider_scope_insufficient: "The provider did not grant the required scope.",
  provider_account_already_linked: "The provider account is already linked.",
  provider_oauth_exchange_failed: "The provider authorization could not be completed.",
  provider_connection_persistence_failed: "The provider connection could not be saved.",
  already_connected: "The provider is already connected.",
  strava_configuration_invalid: "Strava OAuth configuration is unavailable.",
};

export class StravaOAuthError extends Error {
  readonly code: StravaOAuthErrorCode;

  constructor(code: StravaOAuthErrorCode) {
    super(messages[code]);
    this.name = "StravaOAuthError";
    this.code = code;
  }
}
