import type {
  ExternalActivityImportRecord,
  ExternalActivityProviderChange,
} from "./types";

export const cyclingImportFixture: ExternalActivityImportRecord = {
  provider: "mock",
  providerRecordId: "mock-cycling-001",
  providerActivityType: "Cycling",
  startedAt: "2026-09-21T08:00:00+02:00",
  endedAt: "2026-09-21T09:20:00+02:00",
  durationSeconds: 4_800,
  distanceMeters: 30_000,
  averageHeartRate: 142,
  maxHeartRate: 171,
  sourceApp: "Mock Connect",
};

export const runningWithoutHeartRateFixture: ExternalActivityImportRecord = {
  provider: "mock",
  providerRecordId: "mock-running-001",
  providerActivityType: "Running",
  startedAt: "2026-09-22T18:30:00+02:00",
  durationSeconds: 2_700,
  distanceMeters: 7_500,
};

export const walkingMinimumFixture: ExternalActivityImportRecord = {
  provider: "mock",
  providerRecordId: "mock-walking-001",
  providerActivityType: "Walking",
  startedAt: "2026-09-23T12:00:00Z",
  durationSeconds: 900,
};

export const cyclingUpdateFixture: ExternalActivityImportRecord = {
  ...cyclingImportFixture,
  durationSeconds: 4_920,
  distanceMeters: 30_800,
  sourceUpdatedAt: "2026-09-21T10:00:00+02:00",
};

export const partialImportFixture: ExternalActivityImportRecord = {
  provider: "mock",
  providerRecordId: "mock-partial-001",
  providerActivityType: "Sport",
  startedAt: "2026-09-24T07:15:00Z",
  durationSeconds: 0,
};

export const possibleCrossProviderDuplicateFixture: ExternalActivityImportRecord = {
  provider: "intervals",
  providerRecordId: "intervals-possible-duplicate-001",
  providerActivityType: "Ride",
  startedAt: cyclingImportFixture.startedAt,
  endedAt: cyclingImportFixture.endedAt,
  durationSeconds: cyclingImportFixture.durationSeconds,
  distanceMeters: cyclingImportFixture.distanceMeters,
};

export const mockProviderChangePages: readonly ExternalActivityProviderChange[][] = [
  [
    { kind: "upsert", record: cyclingImportFixture },
    { kind: "upsert", record: runningWithoutHeartRateFixture },
    { kind: "upsert", record: walkingMinimumFixture },
    { kind: "upsert", record: partialImportFixture },
    { kind: "upsert", record: possibleCrossProviderDuplicateFixture },
  ],
  [{ kind: "upsert", record: cyclingUpdateFixture }],
  [
    {
      kind: "delete",
      provider: "mock",
      providerRecordId: cyclingImportFixture.providerRecordId,
      deletedAtSource: "2026-09-25T09:00:00Z",
    },
  ],
  [{ kind: "upsert", record: cyclingUpdateFixture }],
];
