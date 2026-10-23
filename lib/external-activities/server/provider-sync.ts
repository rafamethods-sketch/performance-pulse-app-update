import "./server-only";

import type { ExternalActivityChangePage } from "../types";
import type { ExternalActivityBatchItemResult } from "./types";

export type ExternalActivityChangeProvider = {
  getChanges: (
    cursor?: string,
  ) => ExternalActivityChangePage | Promise<ExternalActivityChangePage>;
};

export type ExternalActivityChangeIngestion = {
  ingestExternalActivityChanges: (input: {
    athleteId: string;
    changes: ExternalActivityChangePage["changes"];
  }) => Promise<ExternalActivityBatchItemResult[]>;
};

export type ExternalActivityProviderPageResult =
  | {
      results: ExternalActivityBatchItemResult[];
      canAdvanceCursor: true;
      nextCursor?: string;
    }
  | {
      results: ExternalActivityBatchItemResult[];
      canAdvanceCursor: false;
      nextCursor?: never;
    };

export async function syncExternalActivityProviderPage({
  athleteId,
  provider,
  ingestion,
  cursor,
}: {
  athleteId: string;
  provider: ExternalActivityChangeProvider;
  ingestion: ExternalActivityChangeIngestion;
  cursor?: string;
}): Promise<ExternalActivityProviderPageResult> {
  const page = await provider.getChanges(cursor);
  const results = await ingestion.ingestExternalActivityChanges({
    athleteId,
    changes: page.changes,
  });
  const canAdvanceCursor = results.every((result) => result.ok);

  if (!canAdvanceCursor) {
    return { results, canAdvanceCursor: false };
  }

  return {
    results,
    canAdvanceCursor: true,
    nextCursor: page.nextCursor,
  };
}
