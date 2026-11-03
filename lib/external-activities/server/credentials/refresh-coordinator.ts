import "server-only";

import { randomUUID } from "node:crypto";

import { ProviderCredentialError } from "./errors";
import type { ProviderCredentialRepository } from "./repository";
import type { DecryptedProviderCredentials } from "./types";

export type RefreshedProviderCredentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type ProviderCredentialRefresh = (
  credentials: DecryptedProviderCredentials,
) => Promise<RefreshedProviderCredentials>;

export async function refreshProviderCredentials(
  repository: ProviderCredentialRepository,
  connectionId: string,
  refresh: ProviderCredentialRefresh,
) {
  const current = await repository.loadCredentials(connectionId);
  const refreshLockId = randomUUID();
  const leaseInput = {
    connectionId: current.connectionId,
    expectedCredentialVersion: current.credentialVersion,
    refreshLockId,
  };
  await repository.claimRefreshLease(leaseInput);

  let completed = false;
  try {
    const refreshed = await refresh(current);
    if (
      !refreshed
      || typeof refreshed.accessToken !== "string"
      || refreshed.accessToken.trim().length === 0
      || typeof refreshed.refreshToken !== "string"
      || refreshed.refreshToken.trim().length === 0
      || Number.isNaN(new Date(refreshed.expiresAt).getTime())
    ) {
      throw new ProviderCredentialError("provider_credentials_invalid_input");
    }
    const result = await repository.completeRefresh({
      connectionId: current.connectionId,
      expectedCredentialVersion: current.credentialVersion,
      refreshLockId,
      ...refreshed,
    });
    completed = true;
    return result;
  } finally {
    if (!completed) {
      try {
        await repository.releaseRefreshLease(leaseInput);
      } catch {
        // Preserve the original refresh failure; an expired lease remains recoverable.
      }
    }
  }
}
