export type ClientBackendIdentitySource = {
  athleteProfileId?: unknown;
};

export type BackendAthleteReference = {
  athleteProfileId: string;
};

const backendUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidBackendUuid(value: unknown): value is string {
  return typeof value === "string" && backendUuidPattern.test(value.trim());
}

export function getAthleteProfileId(client: ClientBackendIdentitySource): string | null {
  if (!isValidBackendUuid(client.athleteProfileId)) return null;
  return client.athleteProfileId.trim().toLowerCase();
}

export function isBackendRelatableClient(client: ClientBackendIdentitySource): boolean {
  return getAthleteProfileId(client) !== null;
}

// This only validates an identity pointer returned by a trusted backend flow.
// It never proves access: an active coach_athletes relationship and RLS remain authoritative.
export function toBackendAthleteReference(
  client: ClientBackendIdentitySource,
): BackendAthleteReference | null {
  const athleteProfileId = getAthleteProfileId(client);
  return athleteProfileId ? { athleteProfileId } : null;
}
