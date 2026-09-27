import { getExternalActivityIdentityKey } from "./identity";
import type { ExternalActivity, TrainingLoadContribution } from "./types";

export type DurationResolutionInput = {
  racActualDurationMinutes?: number;
  externalDurationSeconds?: number;
  legacyExecutedDurationMinutes?: number;
};

export type RpeResolutionInput = {
  racFinalRpe?: number;
  externalSessionRpe?: number;
  legacyExecutedRpe?: number;
};

export type RacSessionLoadInput = {
  id: string;
  clientId: string;
  occurredAt: string;
  executed: boolean;
  actualDurationMinutes?: number;
  finalRpe?: number;
  legacyExecutedDurationMinutes?: number;
  legacyExecutedRpe?: number;
};

function validPositiveNumber(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

function validRpe(value: number | undefined): value is number {
  return validPositiveNumber(value) && value <= 10;
}

function validTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function resolveExternalActivityDurationMinutes({
  racActualDurationMinutes,
  externalDurationSeconds,
  legacyExecutedDurationMinutes,
}: DurationResolutionInput): number | undefined {
  if (validPositiveNumber(racActualDurationMinutes)) return racActualDurationMinutes;
  if (validPositiveNumber(externalDurationSeconds)) return externalDurationSeconds / 60;
  if (validPositiveNumber(legacyExecutedDurationMinutes)) {
    return legacyExecutedDurationMinutes;
  }
  return undefined;
}

export function resolveExternalActivitySessionRpe({
  racFinalRpe,
  externalSessionRpe,
  legacyExecutedRpe,
}: RpeResolutionInput): number | undefined {
  if (validRpe(racFinalRpe)) return racFinalRpe;
  if (validRpe(externalSessionRpe)) return externalSessionRpe;
  if (validRpe(legacyExecutedRpe)) return legacyExecutedRpe;
  return undefined;
}

export function calculateExternalActivityInternalLoad(
  durationMinutes: number | undefined,
  sessionRpe: number | undefined,
): number | undefined {
  if (!validPositiveNumber(durationMinutes) || !validRpe(sessionRpe)) return undefined;
  const load = durationMinutes * sessionRpe;
  return Number.isFinite(load) ? load : undefined;
}

function makeContribution(
  contribution: Omit<TrainingLoadContribution, "load">,
): TrainingLoadContribution | undefined {
  const load = calculateExternalActivityInternalLoad(
    contribution.durationMinutes,
    contribution.sessionRpe,
  );
  return load === undefined ? undefined : { ...contribution, load };
}

export type BuildTrainingLoadContributionsInput = {
  sessions: readonly RacSessionLoadInput[];
  externalActivities: readonly ExternalActivity[];
};

function getDuplicateValues(values: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

export function getConflictingLinkedSessionIds(
  externalActivities: readonly ExternalActivity[],
): Set<string> {
  const linkedSessionCounts = new Map<string, number>();
  for (const activity of externalActivities) {
    if (activity.deletedAtSource || !activity.link) continue;
    linkedSessionCounts.set(
      activity.link.sessionId,
      (linkedSessionCounts.get(activity.link.sessionId) ?? 0) + 1,
    );
  }

  return new Set(
    [...linkedSessionCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([sessionId]) => sessionId),
  );
}

export function buildTrainingLoadContributions({
  sessions,
  externalActivities,
}: BuildTrainingLoadContributionsInput): TrainingLoadContribution[] {
  const duplicateSessionIds = getDuplicateValues(sessions.map((session) => session.id));
  const activityIdentityKeys = externalActivities.map((activity) =>
    getExternalActivityIdentityKey(activity),
  );
  const duplicateActivityIdentityKeys = getDuplicateValues(activityIdentityKeys);
  const conflictingLinkedSessionIds = getConflictingLinkedSessionIds(externalActivities);
  const uniqueSessions = new Map(
    sessions
      .filter((session) => !duplicateSessionIds.has(session.id))
      .map((session) => [session.id, session]),
  );
  const contributions: TrainingLoadContribution[] = [];
  const linkedSessionIds = new Set<string>();

  for (const [activityIndex, activity] of externalActivities.entries()) {
    if (activity.deletedAtSource) continue;
    if (duplicateActivityIdentityKeys.has(activityIdentityKeys[activityIndex])) continue;
    if (activity.link && duplicateSessionIds.has(activity.link.sessionId)) continue;
    if (activity.link && conflictingLinkedSessionIds.has(activity.link.sessionId)) continue;

    const linkedSession = activity.link
      ? uniqueSessions.get(activity.link.sessionId)
      : undefined;
    if (linkedSession && linkedSession.clientId === activity.clientId) {
      linkedSessionIds.add(linkedSession.id);
      if (!linkedSession.executed) continue;

      const durationMinutes = resolveExternalActivityDurationMinutes({
        racActualDurationMinutes: linkedSession.actualDurationMinutes,
        externalDurationSeconds: activity.imported.durationSeconds,
        legacyExecutedDurationMinutes: linkedSession.legacyExecutedDurationMinutes,
      });
      const sessionRpe = resolveExternalActivitySessionRpe({
        racFinalRpe: linkedSession.finalRpe,
        externalSessionRpe: activity.enrichment?.sessionRpe,
        legacyExecutedRpe: linkedSession.legacyExecutedRpe,
      });
      if (!validTimestamp(linkedSession.occurredAt)) continue;

      const contribution = makeContribution({
        key: `linked:${linkedSession.id}:${activity.id}`,
        clientId: activity.clientId,
        occurredAt: linkedSession.occurredAt,
        source: "linked_pair",
        sessionId: linkedSession.id,
        externalActivityId: activity.id,
        durationMinutes: durationMinutes ?? 0,
        sessionRpe: sessionRpe ?? 0,
      });
      if (contribution) contributions.push(contribution);
      continue;
    }

    if (!validTimestamp(activity.imported.startedAt)) continue;
    const durationMinutes = resolveExternalActivityDurationMinutes({
      externalDurationSeconds: activity.imported.durationSeconds,
    });
    const sessionRpe = resolveExternalActivitySessionRpe({
      externalSessionRpe: activity.enrichment?.sessionRpe,
    });
    const contribution = makeContribution({
      key: `external:${activity.id}`,
      clientId: activity.clientId,
      occurredAt: activity.imported.startedAt,
      source: "external_activity",
      externalActivityId: activity.id,
      durationMinutes: durationMinutes ?? 0,
      sessionRpe: sessionRpe ?? 0,
    });
    if (contribution) contributions.push(contribution);
  }

  for (const session of uniqueSessions.values()) {
    if (!session.executed || linkedSessionIds.has(session.id)) continue;
    if (!validTimestamp(session.occurredAt)) continue;
    const durationMinutes = resolveExternalActivityDurationMinutes({
      racActualDurationMinutes: session.actualDurationMinutes,
      legacyExecutedDurationMinutes: session.legacyExecutedDurationMinutes,
    });
    const sessionRpe = resolveExternalActivitySessionRpe({
      racFinalRpe: session.finalRpe,
      legacyExecutedRpe: session.legacyExecutedRpe,
    });
    const contribution = makeContribution({
      key: `session:${session.id}`,
      clientId: session.clientId,
      occurredAt: session.occurredAt,
      source: "rac_session",
      sessionId: session.id,
      durationMinutes: durationMinutes ?? 0,
      sessionRpe: sessionRpe ?? 0,
    });
    if (contribution) contributions.push(contribution);
  }

  return contributions;
}
