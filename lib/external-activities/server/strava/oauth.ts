import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProviderCredentialRepository } from "../credentials/repository";
import type { ConsumedOAuthState } from "../oauth/state";
import { loadStravaAuthorizationConfig } from "./config";
import { StravaOAuthError } from "./errors";
import type { StravaTokenExchanger, StravaTokenResponse } from "./types";

const requiredScope = "activity:read";

function validateScopes(scopes: unknown): string[] {
  if (!Array.isArray(scopes) || scopes.some((scope) => typeof scope !== "string")) {
    throw new StravaOAuthError("provider_oauth_exchange_failed");
  }
  const normalized = [...new Set(scopes.map((scope) => scope.trim()).filter(Boolean))];
  if (!normalized.includes(requiredScope)) {
    throw new StravaOAuthError("provider_scope_insufficient");
  }
  return normalized;
}

function validateTokenResponse(response: StravaTokenResponse) {
  const expiresAt = typeof response?.expiresAt === "number"
    ? new Date(response.expiresAt * 1000)
    : new Date(response?.expiresAt);
  if (
    !response
    || typeof response.accessToken !== "string"
    || response.accessToken.trim().length === 0
    || typeof response.refreshToken !== "string"
    || response.refreshToken.trim().length === 0
    || Number.isNaN(expiresAt.getTime())
    || expiresAt.getTime() <= 0
    || typeof response.athleteId !== "string"
    || !/^\d+$/.test(response.athleteId)
    || Number(response.athleteId) <= 0
  ) {
    throw new StravaOAuthError("provider_oauth_exchange_failed");
  }
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: expiresAt.toISOString(),
    athleteId: response.athleteId,
    scopes: validateScopes(response.scopes),
  };
}

export function buildStravaAuthorizationUrl(state: string) {
  const config = loadStravaAuthorizationConfig();
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", requiredScope);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function assertStravaNotConnected(
  trustedClient: SupabaseClient,
  athleteId: string,
) {
  const { data, error } = await trustedClient
    .from("external_provider_connections")
    .select("id")
    .eq("athlete_id", athleteId)
    .eq("provider", "strava")
    .eq("status", "connected")
    .maybeSingle();
  if (error) throw new StravaOAuthError("provider_connection_persistence_failed");
  if (data) throw new StravaOAuthError("already_connected");
}

export async function completeStravaOAuth(input: {
  trustedClient: SupabaseClient;
  credentialRepository: ProviderCredentialRepository;
  consumedState: ConsumedOAuthState;
  code: string;
  callbackScope: string | null;
  tokenExchanger: StravaTokenExchanger;
}) {
  let tokenResponse: StravaTokenResponse;
  try {
    tokenResponse = await input.tokenExchanger({
      code: input.code,
      callbackScope: input.callbackScope,
    });
  } catch (error) {
    if (error instanceof StravaOAuthError) throw error;
    throw new StravaOAuthError("provider_oauth_exchange_failed");
  }
  const validated = validateTokenResponse(tokenResponse);
  await assertStravaNotConnected(input.trustedClient, input.consumedState.athleteId);

  const inserted = await input.trustedClient
    .from("external_provider_connections")
    .insert({
      athlete_id: input.consumedState.athleteId,
      provider: "strava",
      provider_account_id: validated.athleteId,
      status: "error",
      scopes: validated.scopes,
      last_error_code: "oauth_credentials_pending",
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    if (inserted.error?.code === "23505") {
      throw new StravaOAuthError("provider_account_already_linked");
    }
    throw new StravaOAuthError("provider_connection_persistence_failed");
  }
  const connectionId = inserted.data.id as string;

  try {
    await input.credentialRepository.storeCredentials({
      connectionId,
      accessToken: validated.accessToken,
      refreshToken: validated.refreshToken,
      expiresAt: validated.expiresAt,
    });
    const finalized = await input.trustedClient
      .from("external_provider_connections")
      .update({
        status: "connected",
        last_error_code: null,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId)
      .eq("status", "error")
      .select("id")
      .maybeSingle();
    if (finalized.error || !finalized.data) {
      throw new StravaOAuthError("provider_connection_persistence_failed");
    }
    return { connectionId, scopes: validated.scopes };
  } catch (error) {
    await input.trustedClient.from("external_provider_connections").delete().eq("id", connectionId);
    if (error instanceof StravaOAuthError) throw error;
    throw new StravaOAuthError("provider_connection_persistence_failed");
  }
}

export const unavailableStravaTokenExchanger: StravaTokenExchanger = async () => {
  throw new StravaOAuthError("provider_oauth_exchange_failed");
};
