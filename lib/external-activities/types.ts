export type ExternalActivityProvider =
  | "mock"
  | "apple_health"
  | "health_connect"
  | "garmin"
  | "intervals";

export type ExternalActivityType =
  | "running"
  | "cycling"
  | "walking"
  | "hiking"
  | "swimming"
  | "strength"
  | "cardio"
  | "mobility"
  | "sport"
  | "other";

export type ExternalActivityDevice = {
  manufacturer?: string;
  model?: string;
};

export type ExternalActivityImportedData = {
  providerActivityType: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  activeCaloriesKcal?: number;
  elevationGainMeters?: number;
  sourceApp?: string;
  device?: ExternalActivityDevice;
};

export type ExternalActivityEnrichment = {
  sessionRpe?: number;
  note?: string;
  activityTypeOverride?: ExternalActivityType;
  updatedAt?: string;
};

export type ExternalActivityActor = {
  actorType: "coach" | "athlete";
  actorId: string;
};

export type ExternalActivityLink = {
  sessionId: string;
  linkedAt: string;
  linkedBy: ExternalActivityActor;
};

export type ExternalActivity = {
  id: string;
  clientId: string;
  provider: ExternalActivityProvider;
  providerRecordId: string;
  activityType: ExternalActivityType;
  imported: ExternalActivityImportedData;
  enrichment?: ExternalActivityEnrichment;
  link?: ExternalActivityLink;
  firstImportedAt: string;
  lastSeenAt: string;
  sourceUpdatedAt?: string;
  deletedAtSource?: string;
  schemaVersion: 1;
};

export type ExternalActivityMatchDismissal = {
  externalActivityId: string;
  sessionId: string;
  dismissedAt: string;
  dismissedBy: ExternalActivityActor;
};

export type ExternalActivityImportRecord = {
  provider: ExternalActivityProvider;
  providerRecordId: string;
  providerActivityType: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  activeCaloriesKcal?: number;
  elevationGainMeters?: number;
  sourceApp?: string;
  device?: ExternalActivityDevice;
  sourceUpdatedAt?: string;
};

export type ExternalActivityProviderChange =
  | {
      kind: "upsert";
      record: ExternalActivityImportRecord;
    }
  | {
      kind: "delete";
      provider: ExternalActivityProvider;
      providerRecordId: string;
      deletedAtSource: string;
    };

export type ExternalActivityChangePage = {
  changes: ExternalActivityProviderChange[];
  nextCursor?: string;
};

export type TrainingLoadContribution = {
  key: string;
  clientId: string;
  occurredAt: string;
  source: "rac_session" | "external_activity" | "linked_pair";
  sessionId?: string;
  externalActivityId?: string;
  durationMinutes: number;
  sessionRpe: number;
  load: number;
};
