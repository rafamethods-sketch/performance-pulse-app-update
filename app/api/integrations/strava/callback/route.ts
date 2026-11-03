import { NextResponse } from "next/server";

import { createProviderCredentialRepository } from "@/lib/external-activities/server/credentials/repository";
import { createOAuthStateRepository } from "@/lib/external-activities/server/oauth/state";
import { StravaOAuthError } from "@/lib/external-activities/server/strava/errors";
import { loadStravaAuthorizationConfig } from "@/lib/external-activities/server/strava/config";
import {
  completeStravaOAuth,
  unavailableStravaTokenExchanger,
} from "@/lib/external-activities/server/strava/oauth";
import { createSupabaseAdminClient } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

function safeRedirect(result: string) {
  const destination = new URL("/", loadStravaAuthorizationConfig().redirectUri);
  destination.searchParams.set("integration", "strava");
  destination.searchParams.set("result", result);
  return NextResponse.redirect(destination);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const scope = url.searchParams.get("scope");
  const providerError = url.searchParams.get("error");
  if (!state) return safeRedirect("oauth_state_invalid");

  try {
    const admin = createSupabaseAdminClient();
    const consumedState = await createOAuthStateRepository(admin).consumeState(state);
    if (providerError === "access_denied") {
      return safeRedirect("cancelled");
    }
    if (providerError || !code) {
      throw new StravaOAuthError("provider_oauth_exchange_failed");
    }
    const repository = createProviderCredentialRepository(admin);
    await completeStravaOAuth({
      trustedClient: admin,
      credentialRepository: repository,
      consumedState,
      code,
      callbackScope: scope,
      tokenExchanger: unavailableStravaTokenExchanger,
    });
    return safeRedirect("connected");
  } catch (error) {
    const codeValue = error instanceof StravaOAuthError ? error.code : "provider_oauth_exchange_failed";
    return safeRedirect(codeValue);
  }
}
