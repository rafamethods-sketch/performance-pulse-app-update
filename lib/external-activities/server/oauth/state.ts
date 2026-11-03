import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { StravaOAuthError } from "../strava/errors";

const stateTtlMilliseconds = 10 * 60 * 1000;
const databaseByteaPattern = /^\\x(?:[0-9a-f]{2})+$/i;

export type ConsumedOAuthState = {
  athleteId: string;
  provider: "strava";
  redirectPath: string;
};

function hashState(state: string) {
  return createHash("sha256").update(state, "utf8").digest();
}

function toDatabaseBytea(value: Buffer) {
  return `\\x${value.toString("hex")}`;
}

export function createOAuthStateRepository(
  trustedClient: SupabaseClient,
  now: () => Date = () => new Date(),
) {
  return {
    async createState(athleteId: string, redirectPath = "/") {
      const rawState = randomBytes(32).toString("base64url");
      const expiresAt = new Date(now().getTime() + stateTtlMilliseconds).toISOString();
      const { error } = await trustedClient.from("external_provider_oauth_states").insert({
        state_hash: toDatabaseBytea(hashState(rawState)),
        athlete_id: athleteId,
        provider: "strava",
        expires_at: expiresAt,
        redirect_path: redirectPath,
      });
      if (error) throw new StravaOAuthError("provider_connection_persistence_failed");
      return { rawState, expiresAt };
    },

    async consumeState(rawState: string): Promise<ConsumedOAuthState> {
      if (typeof rawState !== "string" || rawState.length < 32) {
        throw new StravaOAuthError("oauth_state_invalid");
      }
      const stateHash = toDatabaseBytea(hashState(rawState));
      if (!databaseByteaPattern.test(stateHash)) {
        throw new StravaOAuthError("oauth_state_invalid");
      }
      const { data, error } = await trustedClient.rpc(
        "consume_external_provider_oauth_state",
        { p_state_hash: stateHash },
      );
      if (error) throw new StravaOAuthError("oauth_state_invalid");
      const result = Array.isArray(data) ? data[0] : data;
      if (!result || result.outcome === "invalid") {
        throw new StravaOAuthError("oauth_state_invalid");
      }
      if (result.outcome === "expired") {
        throw new StravaOAuthError("oauth_state_expired");
      }
      if (result.outcome === "consumed") {
        throw new StravaOAuthError("oauth_state_consumed");
      }
      if (
        result.outcome !== "consumed_now"
        || result.provider !== "strava"
        || typeof result.athlete_id !== "string"
      ) {
        throw new StravaOAuthError("oauth_state_invalid");
      }
      return {
        athleteId: result.athlete_id,
        provider: "strava",
        redirectPath: result.redirect_path || "/",
      };
    },
  };
}
