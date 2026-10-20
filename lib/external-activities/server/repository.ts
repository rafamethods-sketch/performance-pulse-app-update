import "./server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExternalActivityProvider } from "../types";
import {
  toExternalActivityInsertRow,
  toExternalActivityUpdateRow,
} from "./mapper";
import {
  ExternalActivityPersistenceError,
  type ImportedExternalActivityInput,
  type ImportedExternalActivityResult,
  type MarkExternalActivityDeletedInput,
} from "./types";
import {
  validateExternalActivityDeletionInput,
  validateImportedExternalActivityInput,
} from "./validation";

const returnedColumns =
  "id, athlete_id, provider, provider_record_id, first_imported_at, last_seen_at";

type PersistedExternalActivity = {
  id: string;
  athlete_id: string;
  provider: ExternalActivityProvider;
  provider_record_id: string;
  first_imported_at: string;
  last_seen_at: string;
};

export type ExternalActivityRepository = {
  upsertImportedExternalActivity: (
    input: ImportedExternalActivityInput,
  ) => Promise<ImportedExternalActivityResult>;
  markExternalActivityDeletedAtSource: (
    input: MarkExternalActivityDeletedInput,
  ) => Promise<ImportedExternalActivityResult>;
};

function toResult(row: PersistedExternalActivity): ImportedExternalActivityResult {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    provider: row.provider,
    providerRecordId: row.provider_record_id,
    firstImportedAt: row.first_imported_at,
    lastSeenAt: row.last_seen_at,
  };
}

function persistenceError(error?: { code?: string } | null) {
  if (error?.code === "42501") return new ExternalActivityPersistenceError("unauthorized");
  if (error?.code === "23505") {
    return new ExternalActivityPersistenceError("unexpected_conflict");
  }
  return new ExternalActivityPersistenceError();
}

export function createExternalActivityRepository(
  trustedClient: SupabaseClient,
  options: { now?: () => Date } = {},
): ExternalActivityRepository {
  const now = options.now ?? (() => new Date());

  async function updateExisting(
    input: ImportedExternalActivityInput,
    lastSeenAt: string,
  ) {
    const { data, error } = await trustedClient
      .from("external_activities")
      .update(toExternalActivityUpdateRow(input, lastSeenAt))
      .eq("athlete_id", input.athleteId)
      .eq("provider", input.provider)
      .eq("provider_record_id", input.providerRecordId)
      .select(returnedColumns)
      .single();

    if (error || !data) throw persistenceError(error);
    return toResult(data as PersistedExternalActivity);
  }

  async function upsertImportedExternalActivity(
    unvalidatedInput: ImportedExternalActivityInput,
  ) {
    const input = validateImportedExternalActivityInput(unvalidatedInput);
    const lastSeenAt = now().toISOString();
    const { data, error } = await trustedClient
      .from("external_activities")
      .insert(toExternalActivityInsertRow(input, lastSeenAt))
      .select(returnedColumns)
      .single();

    if (!error && data) return toResult(data as PersistedExternalActivity);
    if (error?.code === "23505") return updateExisting(input, lastSeenAt);
    throw persistenceError(error);
  }

  async function markExternalActivityDeletedAtSource(
    input: MarkExternalActivityDeletedInput,
  ) {
    const validated = validateExternalActivityDeletionInput(input);
    const { data, error } = await trustedClient
      .from("external_activities")
      .update({
        deleted_at_source: validated.deletedAtSource,
        last_seen_at: now().toISOString(),
      })
      .eq("athlete_id", validated.athleteId)
      .eq("provider", validated.provider)
      .eq("provider_record_id", validated.providerRecordId)
      .select(returnedColumns)
      .single();

    if (error || !data) throw persistenceError(error);
    return toResult(data as PersistedExternalActivity);
  }

  return {
    upsertImportedExternalActivity,
    markExternalActivityDeletedAtSource,
  };
}
