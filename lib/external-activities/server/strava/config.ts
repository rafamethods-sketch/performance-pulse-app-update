import "server-only";

import { StravaOAuthError } from "./errors";

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function loadStravaAuthorizationConfig() {
  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const redirectUri = process.env.STRAVA_REDIRECT_URI?.trim();
  if (!clientId || !/^\d+$/.test(clientId) || Number(clientId) <= 0 || !redirectUri) {
    throw new StravaOAuthError("strava_configuration_invalid");
  }
  let parsedRedirect: URL;
  try {
    parsedRedirect = new URL(redirectUri);
  } catch {
    throw new StravaOAuthError("strava_configuration_invalid");
  }
  const validProtocol = parsedRedirect.protocol === "https:"
    || (parsedRedirect.protocol === "http:" && isLocalHostname(parsedRedirect.hostname));
  if (!validProtocol || parsedRedirect.username || parsedRedirect.password) {
    throw new StravaOAuthError("strava_configuration_invalid");
  }
  return { clientId, redirectUri: parsedRedirect.toString() };
}

export function loadStravaClientSecret() {
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();
  if (!clientSecret) throw new StravaOAuthError("strava_configuration_invalid");
  return clientSecret;
}
