import "./server-only";

import { isValidBackendUuid } from "../../client-backend-identity";
import { validateExternalActivityTimestamp } from "../normalize";
import type {
  ExternalActivityDevice,
  ExternalActivityProvider,
  ExternalActivityType,
} from "../types";
import {
  ExternalActivityInputError,
  type ImportedExternalActivityInput,
  type MarkExternalActivityDeletedInput,
} from "./types";

const supportedProviders = new Set<ExternalActivityProvider>([
  "mock",
  "apple_health",
  "health_connect",
  "garmin",
  "intervals",
  "strava",
]);

const supportedActivityTypes = new Set<ExternalActivityType>([
  "running",
  "cycling",
  "walking",
  "hiking",
  "swimming",
  "strength",
  "cardio",
  "mobility",
  "sport",
  "other",
]);

function requireNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new ExternalActivityInputError(`${field} is required.`);
  return normalized;
}

function requireNonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ExternalActivityInputError(`${field} must be non-negative.`);
  }
  return value;
}

function optionalNonNegative(value: number | undefined, field: string) {
  return value === undefined ? undefined : requireNonNegative(value, field);
}

function optionalPositive(value: number | undefined, field: string) {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value <= 0) {
    throw new ExternalActivityInputError(`${field} must be positive.`);
  }
  return value;
}

function optionalTimestamp(value: string | undefined, field: string) {
  if (value === undefined) return undefined;
  try {
    return validateExternalActivityTimestamp(value, field);
  } catch {
    throw new ExternalActivityInputError(`${field} must be a valid timestamp.`);
  }
}

function normalizeDevice(device: ExternalActivityDevice | undefined) {
  if (!device) return undefined;
  const manufacturer = device.manufacturer?.trim() || undefined;
  const model = device.model?.trim() || undefined;
  return manufacturer || model ? { manufacturer, model } : undefined;
}

export function validateImportedExternalActivityInput(
  input: ImportedExternalActivityInput,
): ImportedExternalActivityInput {
  if (!isValidBackendUuid(input.athleteId)) {
    throw new ExternalActivityInputError("athleteId must be a backend UUID.");
  }
  if (!supportedProviders.has(input.provider)) {
    throw new ExternalActivityInputError("provider is not supported.");
  }
  if (!supportedActivityTypes.has(input.activityType)) {
    throw new ExternalActivityInputError("activityType is not supported.");
  }
  if (input.schemaVersion !== 1) {
    throw new ExternalActivityInputError("schemaVersion is not supported.");
  }

  let startedAt: string;
  try {
    startedAt = validateExternalActivityTimestamp(input.startedAt, "startedAt");
  } catch {
    throw new ExternalActivityInputError("startedAt must be a valid timestamp.");
  }
  const endedAt = optionalTimestamp(input.endedAt, "endedAt");
  if (endedAt && Date.parse(endedAt) < Date.parse(startedAt)) {
    throw new ExternalActivityInputError("endedAt cannot precede startedAt.");
  }

  return {
    athleteId: input.athleteId.trim().toLowerCase(),
    provider: input.provider,
    providerRecordId: requireNonEmpty(input.providerRecordId, "providerRecordId"),
    activityType: input.activityType,
    startedAt,
    endedAt,
    durationSeconds: requireNonNegative(input.durationSeconds, "durationSeconds"),
    distanceMeters: optionalNonNegative(input.distanceMeters, "distanceMeters"),
    avgHrBpm: optionalPositive(input.avgHrBpm, "avgHrBpm"),
    maxHrBpm: optionalPositive(input.maxHrBpm, "maxHrBpm"),
    activeCaloriesKcal: optionalNonNegative(
      input.activeCaloriesKcal,
      "activeCaloriesKcal",
    ),
    elevationGainMeters: optionalNonNegative(
      input.elevationGainMeters,
      "elevationGainMeters",
    ),
    sourceApp: input.sourceApp?.trim() || undefined,
    device: normalizeDevice(input.device),
    sourceUpdatedAt: optionalTimestamp(input.sourceUpdatedAt, "sourceUpdatedAt"),
    deletedAtSource: optionalTimestamp(input.deletedAtSource, "deletedAtSource"),
    schemaVersion: 1,
  };
}

export function validateExternalActivityDeletionInput(
  input: MarkExternalActivityDeletedInput,
): MarkExternalActivityDeletedInput {
  if (!isValidBackendUuid(input.athleteId)) {
    throw new ExternalActivityInputError("athleteId must be a backend UUID.");
  }
  if (!supportedProviders.has(input.provider)) {
    throw new ExternalActivityInputError("provider is not supported.");
  }

  return {
    athleteId: input.athleteId.trim().toLowerCase(),
    provider: input.provider,
    providerRecordId: requireNonEmpty(input.providerRecordId, "providerRecordId"),
    deletedAtSource: optionalTimestamp(
      input.deletedAtSource,
      "deletedAtSource",
    ) as string,
  };
}
