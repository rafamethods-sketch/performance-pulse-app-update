import "./server-only";

import type { ImportedExternalActivityInput } from "./types";

export type ExternalActivityInsertRow = {
  athlete_id: string;
  provider: string;
  provider_record_id: string;
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  distance_meters: number | null;
  avg_hr_bpm: number | null;
  max_hr_bpm: number | null;
  active_calories_kcal: number | null;
  elevation_gain_meters: number | null;
  source_app: string | null;
  device: { manufacturer?: string; model?: string } | null;
  last_seen_at: string;
  source_updated_at: string | null;
  deleted_at_source: string | null;
  schema_version: number;
};

export type ExternalActivityUpdateRow = Omit<
  ExternalActivityInsertRow,
  "athlete_id" | "provider" | "provider_record_id"
>;

export function toExternalActivityInsertRow(
  input: ImportedExternalActivityInput,
  lastSeenAt: string,
): ExternalActivityInsertRow {
  return {
    athlete_id: input.athleteId,
    provider: input.provider,
    provider_record_id: input.providerRecordId,
    activity_type: input.activityType,
    started_at: input.startedAt,
    ended_at: input.endedAt ?? null,
    duration_seconds: input.durationSeconds,
    distance_meters: input.distanceMeters ?? null,
    avg_hr_bpm: input.avgHrBpm ?? null,
    max_hr_bpm: input.maxHrBpm ?? null,
    active_calories_kcal: input.activeCaloriesKcal ?? null,
    elevation_gain_meters: input.elevationGainMeters ?? null,
    source_app: input.sourceApp ?? null,
    device: input.device ?? null,
    last_seen_at: lastSeenAt,
    source_updated_at: input.sourceUpdatedAt ?? null,
    deleted_at_source: input.deletedAtSource ?? null,
    schema_version: input.schemaVersion,
  };
}

export function toExternalActivityUpdateRow(
  input: ImportedExternalActivityInput,
  lastSeenAt: string,
): ExternalActivityUpdateRow {
  const row = toExternalActivityInsertRow(input, lastSeenAt);
  return {
    activity_type: row.activity_type,
    started_at: row.started_at,
    ended_at: row.ended_at,
    duration_seconds: row.duration_seconds,
    distance_meters: row.distance_meters,
    avg_hr_bpm: row.avg_hr_bpm,
    max_hr_bpm: row.max_hr_bpm,
    active_calories_kcal: row.active_calories_kcal,
    elevation_gain_meters: row.elevation_gain_meters,
    source_app: row.source_app,
    device: row.device,
    last_seen_at: row.last_seen_at,
    source_updated_at: row.source_updated_at,
    deleted_at_source: row.deleted_at_source,
    schema_version: row.schema_version,
  };
}
