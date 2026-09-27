import { normalizeProviderActivityType } from "./catalog";
import { getExternalActivityIdentityKey } from "./identity";
import type {
  ExternalActivity,
  ExternalActivityImportRecord,
  ExternalActivityImportedData,
} from "./types";

function requireNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }
  return normalized;
}

const isoTimestampWithZonePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|([+-])(\d{2}):(\d{2}))$/;

export function validateExternalActivityTimestamp(value: string, field: string): string {
  if (value !== value.trim()) {
    throw new Error(`${field} must be an ISO date-time with an explicit timezone.`);
  }

  const match = isoTimestampWithZonePattern.exec(value);
  if (!match) {
    throw new Error(`${field} must be an ISO date-time with an explicit timezone.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[8] === "Z" ? 0 : Number(match[10]);
  const offsetMinute = match[8] === "Z" ? 0 : Number(match[11]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 23 ||
    offsetMinute > 59 ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error(`${field} must be a valid timestamp.`);
  }

  return value;
}

function optionalIsoTimestamp(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : validateExternalActivityTimestamp(value, field);
}

function requireNonNegativeNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite, non-negative number.`);
  }
  return value;
}

function optionalNonNegativeNumber(value: number | undefined, field: string): number | undefined {
  return value === undefined ? undefined : requireNonNegativeNumber(value, field);
}

export type NormalizeExternalActivityImportInput = {
  clientId: string;
  record: ExternalActivityImportRecord;
  now: string;
  internalId?: string;
  existing?: ExternalActivity;
};

export function normalizeExternalActivityImport({
  clientId,
  record,
  now,
  internalId,
  existing,
}: NormalizeExternalActivityImportInput): ExternalActivity {
  const normalizedClientId = requireNonEmpty(clientId, "clientId");
  const normalizedProviderRecordId = requireNonEmpty(
    record.providerRecordId,
    "providerRecordId",
  );
  const normalizedNow = validateExternalActivityTimestamp(now, "now");

  const identityKey = getExternalActivityIdentityKey({
    clientId: normalizedClientId,
    provider: record.provider,
    providerRecordId: normalizedProviderRecordId,
  });

  if (existing) {
    const existingIdentityKey = getExternalActivityIdentityKey(existing);
    if (identityKey !== existingIdentityKey) {
      throw new Error("Provider update does not match the existing activity identity.");
    }
  }

  const id = existing?.id ?? requireNonEmpty(internalId ?? "", "internalId");
  const providerActivityType = requireNonEmpty(
    record.providerActivityType,
    "providerActivityType",
  );

  const imported: ExternalActivityImportedData = {
    providerActivityType,
    startedAt: validateExternalActivityTimestamp(record.startedAt, "startedAt"),
    endedAt: optionalIsoTimestamp(record.endedAt, "endedAt"),
    durationSeconds: requireNonNegativeNumber(record.durationSeconds, "durationSeconds"),
    distanceMeters: optionalNonNegativeNumber(record.distanceMeters, "distanceMeters"),
    averageHeartRate: optionalNonNegativeNumber(
      record.averageHeartRate,
      "averageHeartRate",
    ),
    maxHeartRate: optionalNonNegativeNumber(record.maxHeartRate, "maxHeartRate"),
    activeCaloriesKcal: optionalNonNegativeNumber(
      record.activeCaloriesKcal,
      "activeCaloriesKcal",
    ),
    elevationGainMeters: optionalNonNegativeNumber(
      record.elevationGainMeters,
      "elevationGainMeters",
    ),
    sourceApp: record.sourceApp?.trim() || undefined,
    device:
      record.device?.manufacturer?.trim() || record.device?.model?.trim()
        ? {
            manufacturer: record.device.manufacturer?.trim() || undefined,
            model: record.device.model?.trim() || undefined,
          }
        : undefined,
  };

  return {
    id,
    clientId: normalizedClientId,
    provider: record.provider,
    providerRecordId: normalizedProviderRecordId,
    activityType: normalizeProviderActivityType(providerActivityType),
    imported,
    enrichment: existing?.enrichment,
    link: existing?.link,
    firstImportedAt: existing?.firstImportedAt ?? normalizedNow,
    lastSeenAt: normalizedNow,
    sourceUpdatedAt: optionalIsoTimestamp(record.sourceUpdatedAt, "sourceUpdatedAt"),
    schemaVersion: 1,
  };
}
