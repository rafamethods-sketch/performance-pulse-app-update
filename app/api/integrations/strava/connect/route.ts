import { NextResponse } from "next/server";

import { extractBearerToken } from "@/lib/external-activities/server/device-ingest-http";
import { createOAuthStateRepository } from "@/lib/external-activities/server/oauth/state";
import {
  assertStravaNotConnected,
  buildStravaAuthorizationUrl,
} from "@/lib/external-activities/server/strava/oauth";
import { StravaOAuthError } from "@/lib/external-activities/server/strava/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/server-admin";
import { createSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const accessToken = extractBearerToken(request);
  if (!accessToken) return errorResponse(401, "authentication_required", "Authentication is required.");

  try {
    const authClient = createSupabaseServerAuthClient(accessToken);
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return errorResponse(401, "invalid_access_token", "The access token is invalid or expired.");
    }
    const { data: profile, error: profileError } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) return errorResponse(500, "profile_lookup_failed", "Unable to validate profile.");
    if (!profile || profile.role !== "athlete") {
      return errorResponse(403, "athlete_access_required", "Athlete access is required.");
    }
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 0) {
      const body = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length > 0) {
        return errorResponse(400, "invalid_request", "Unexpected request fields.");
      }
    }

    const admin = createSupabaseAdminClient();
    await assertStravaNotConnected(admin, authData.user.id);
    const state = await createOAuthStateRepository(admin).createState(authData.user.id, "/");
    return NextResponse.json({
      provider: "strava",
      authorizationUrl: buildStravaAuthorizationUrl(state.rawState),
      expiresAt: state.expiresAt,
    });
  } catch (error) {
    if (error instanceof StravaOAuthError) {
      const status = error.code === "already_connected" ? 409 : 500;
      return errorResponse(status, error.code, error.message);
    }
    return errorResponse(500, "internal_error", "Unable to start Strava authorization.");
  }
}
