import { getExternalActivityIdentityKey } from "./identity";
import {
  normalizeExternalActivityImport,
  validateExternalActivityTimestamp,
} from "./normalize";
import type { ExternalActivity, ExternalActivityImportRecord } from "./types";

export type UpsertExternalActivityInput = {
  activities: readonly ExternalActivity[];
  clientId: string;
  record: ExternalActivityImportRecord;
  now: string;
  createInternalId: () => string;
};

export type ExternalActivityUpsertResult = {
  activities: ExternalActivity[];
  activity: ExternalActivity;
  created: boolean;
};

export function upsertExternalActivity({
  activities,
  clientId,
  record,
  now,
  createInternalId,
}: UpsertExternalActivityInput): ExternalActivityUpsertResult {
  const identityKey = getExternalActivityIdentityKey({
    clientId,
    provider: record.provider,
    providerRecordId: record.providerRecordId,
  });
  const existingIndex = activities.findIndex(
    (activity) => getExternalActivityIdentityKey(activity) === identityKey,
  );
  const existing = existingIndex >= 0 ? activities[existingIndex] : undefined;
  const activity = normalizeExternalActivityImport({
    clientId,
    record,
    now,
    existing,
    internalId: existing ? undefined : createInternalId(),
  });

  if (existingIndex < 0) {
    return { activities: [...activities, activity], activity, created: true };
  }

  return {
    activities: activities.map((listedActivity, index) =>
      index === existingIndex ? activity : listedActivity,
    ),
    activity,
    created: false,
  };
}

export function markExternalActivityDeleted(
  activity: ExternalActivity,
  deletedAtSource: string,
): ExternalActivity {
  return {
    ...activity,
    deletedAtSource: validateExternalActivityTimestamp(
      deletedAtSource,
      "deletedAtSource",
    ),
  };
}

export function isExternalActivityLinkOrphaned(
  activity: ExternalActivity,
  availableSessionIds: ReadonlySet<string> | readonly string[],
): boolean {
  if (!activity.link) return false;
  const sessionIds = new Set(availableSessionIds);
  return !sessionIds.has(activity.link.sessionId);
}
