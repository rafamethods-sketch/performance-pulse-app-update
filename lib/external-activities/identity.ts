import type { ExternalActivityProvider } from "./types";

export type ExternalActivityIdentity = {
  clientId: string;
  provider: ExternalActivityProvider;
  providerRecordId: string;
};

export function getExternalActivityIdentityKey({
  clientId,
  provider,
  providerRecordId,
}: ExternalActivityIdentity): string {
  const normalizedClientId = clientId.trim();
  const normalizedProviderRecordId = providerRecordId.trim();

  if (!normalizedClientId) {
    throw new Error("External activity identity requires a RAC clientId.");
  }
  if (!normalizedProviderRecordId) {
    throw new Error("External activity identity requires a providerRecordId.");
  }

  return JSON.stringify([normalizedClientId, provider, normalizedProviderRecordId]);
}
