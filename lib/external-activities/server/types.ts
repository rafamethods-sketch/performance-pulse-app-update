import type {
  ExternalActivityDevice,
  ExternalActivityProvider,
  ExternalActivityType,
} from "../types";

export type ImportedExternalActivityInput = {
  athleteId: string;
  provider: ExternalActivityProvider;
  providerRecordId: string;
  activityType: ExternalActivityType;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  distanceMeters?: number;
  avgHrBpm?: number;
  maxHrBpm?: number;
  activeCaloriesKcal?: number;
  elevationGainMeters?: number;
  sourceApp?: string;
  device?: ExternalActivityDevice;
  sourceUpdatedAt?: string;
  deletedAtSource?: string;
  schemaVersion: 1;
};

export type ImportedExternalActivityResult = {
  id: string;
  athleteId: string;
  provider: ExternalActivityProvider;
  providerRecordId: string;
  firstImportedAt: string;
  lastSeenAt: string;
};

export type ExternalActivityIngestionErrorCode =
  | "invalid_input"
  | "persistence_failure"
  | "unexpected_conflict"
  | "unauthorized";

export type MarkExternalActivityDeletedInput = {
  athleteId: string;
  provider: ExternalActivityProvider;
  providerRecordId: string;
  deletedAtSource: string;
};

export type ExternalActivityBatchItemResult =
  | { ok: true; result: ImportedExternalActivityResult }
  | {
      ok: false;
      provider?: ExternalActivityProvider;
      providerRecordId?: string;
      error: {
        code: ExternalActivityIngestionErrorCode;
        message: string;
      };
    };

export class ExternalActivityInputError extends Error {
  readonly code = "invalid_input" as const;

  constructor(message: string) {
    super(message);
    this.name = "ExternalActivityInputError";
  }
}

export class ExternalActivityPersistenceError extends Error {
  readonly code: Exclude<ExternalActivityIngestionErrorCode, "invalid_input">;

  constructor(
    code: Exclude<ExternalActivityIngestionErrorCode, "invalid_input"> =
      "persistence_failure",
  ) {
    const message = code === "unauthorized"
      ? "Trusted external activity persistence is not authorized."
      : code === "unexpected_conflict"
        ? "External activity identity conflict could not be resolved."
        : "External activity persistence failed.";
    super(message);
    this.name = "ExternalActivityPersistenceError";
    this.code = code;
  }
}
