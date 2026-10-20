import "./server-only";

import { normalizeProviderActivityType } from "../catalog";
import type {
  ExternalActivityImportRecord,
  ExternalActivityProviderChange,
} from "../types";
import type { ExternalActivityRepository } from "./repository";
import {
  ExternalActivityInputError,
  ExternalActivityPersistenceError,
  type ExternalActivityBatchItemResult,
  type ImportedExternalActivityInput,
} from "./types";

export type IngestExternalActivityInput = {
  athleteId: string;
  record: ExternalActivityImportRecord;
};

export type IngestExternalActivityChangesInput = {
  athleteId: string;
  changes: readonly ExternalActivityProviderChange[];
};

function toImportedInput({
  athleteId,
  record,
}: IngestExternalActivityInput): ImportedExternalActivityInput {
  return {
    athleteId,
    provider: record.provider,
    providerRecordId: record.providerRecordId,
    activityType: normalizeProviderActivityType(record.providerActivityType),
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    durationSeconds: record.durationSeconds,
    distanceMeters: record.distanceMeters,
    avgHrBpm: record.averageHeartRate,
    maxHrBpm: record.maxHeartRate,
    activeCaloriesKcal: record.activeCaloriesKcal,
    elevationGainMeters: record.elevationGainMeters,
    sourceApp: record.sourceApp,
    device: record.device,
    sourceUpdatedAt: record.sourceUpdatedAt,
    deletedAtSource: undefined,
    schemaVersion: 1,
  };
}

export function createExternalActivityIngestionService(
  repository: ExternalActivityRepository,
) {
  async function ingestExternalActivity(input: IngestExternalActivityInput) {
    return repository.upsertImportedExternalActivity(toImportedInput(input));
  }

  async function ingestExternalActivities(
    inputs: readonly IngestExternalActivityInput[],
  ): Promise<ExternalActivityBatchItemResult[]> {
    const results: ExternalActivityBatchItemResult[] = [];
    for (const input of inputs) {
      try {
        results.push({ ok: true, result: await ingestExternalActivity(input) });
      } catch (error) {
        results.push({
          ok: false,
          provider: input.record.provider,
          providerRecordId: input.record.providerRecordId,
          error: {
            code: error instanceof ExternalActivityInputError
              ? "invalid_input"
              : error instanceof ExternalActivityPersistenceError
                ? error.code
                : "persistence_failure",
            message: error instanceof ExternalActivityInputError
              ? error.message
              : error instanceof ExternalActivityPersistenceError
                ? error.message
                : "External activity persistence failed.",
          },
        });
      }
    }
    return results;
  }

  async function ingestExternalActivityChanges({
    athleteId,
    changes,
  }: IngestExternalActivityChangesInput): Promise<ExternalActivityBatchItemResult[]> {
    const results: ExternalActivityBatchItemResult[] = [];
    for (const change of changes) {
      try {
        const result = change.kind === "upsert"
          ? await ingestExternalActivity({ athleteId, record: change.record })
          : await repository.markExternalActivityDeletedAtSource({
              athleteId,
              provider: change.provider,
              providerRecordId: change.providerRecordId,
              deletedAtSource: change.deletedAtSource,
            });
        results.push({ ok: true, result });
      } catch (error) {
        results.push({
          ok: false,
          provider: change.kind === "upsert" ? change.record.provider : change.provider,
          providerRecordId: change.kind === "upsert"
            ? change.record.providerRecordId
            : change.providerRecordId,
          error: {
            code: error instanceof ExternalActivityInputError
              ? "invalid_input"
              : error instanceof ExternalActivityPersistenceError
                ? error.code
                : "persistence_failure",
            message: error instanceof ExternalActivityInputError
              ? error.message
              : error instanceof ExternalActivityPersistenceError
                ? error.message
                : "External activity persistence failed.",
          },
        });
      }
    }
    return results;
  }

  return {
    ingestExternalActivity,
    ingestExternalActivities,
    ingestExternalActivityChanges,
  };
}
