import { NextResponse } from "next/server";

import {
  DeviceIngestRequestError,
  extractBearerToken,
  parseDeviceIngestRequest,
} from "@/lib/external-activities/server/device-ingest-http";
import { createExternalActivityIngestionService } from "@/lib/external-activities/server/ingestion-service";
import { createExternalActivityRepository } from "@/lib/external-activities/server/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/server-admin";
import {
  createSupabaseServerAuthClient,
  SupabaseServerAuthConfigurationError,
} from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const accessToken = extractBearerToken(request);
  if (!accessToken) {
    return errorResponse(401, "authentication_required", "A valid Bearer token is required.");
  }

  try {
    const authClient = createSupabaseServerAuthClient(accessToken);
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
    const authenticatedUser = authData.user;
    if (authError || !authenticatedUser) {
      return errorResponse(401, "invalid_access_token", "The access token is invalid or expired.");
    }

    const { data: profile, error: profileError } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", authenticatedUser.id)
      .maybeSingle();

    if (profileError) {
      return errorResponse(500, "profile_lookup_failed", "Unable to validate the authenticated profile.");
    }
    if (!profile || profile.role !== "athlete") {
      return errorResponse(403, "athlete_access_required", "Athlete access is required.");
    }

    const changes = await parseDeviceIngestRequest(request);

    const adminClient = createSupabaseAdminClient();
    const repository = createExternalActivityRepository(adminClient);
    const ingestion = createExternalActivityIngestionService(repository);
    const results = await ingestion.ingestExternalActivityChanges({
      athleteId: authenticatedUser.id,
      changes,
    });
    const successCount = results.filter((result) => result.ok).length;

    return NextResponse.json({
      successCount,
      failureCount: results.length - successCount,
      results: results.map((result) => result.ok
        ? {
            providerRecordId: result.result.providerRecordId,
            status: "success",
          }
        : {
            providerRecordId: result.providerRecordId,
            status: "failure",
            error: result.error,
          }),
    });
  } catch (error) {
    if (error instanceof DeviceIngestRequestError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof SupabaseServerAuthConfigurationError) {
      return errorResponse(500, "server_configuration_error", "Server configuration is unavailable.");
    }
    return errorResponse(500, "internal_error", "Device ingestion failed.");
  }
}
