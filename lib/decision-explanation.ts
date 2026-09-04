import type { WeeklyCoachReview, WeeklyReviewReasonType } from "@/lib/weekly-review";
import type { SessionCompatibility, SessionCompatibilityReasonType } from "@/lib/session-compatibility";

export type DecisionExplanationLevel = "stable" | "review" | "priority" | "unknown";
export type DecisionExplanationConfidence = "high" | "medium" | "low";
export type DecisionEvidenceType =
  | "trainingLoad"
  | "plannedLoad"
  | "wellness"
  | "discomfort"
  | "adherence"
  | "compatibility"
  | "dataQuality"
  | "review";

export type DecisionEvidence = {
  type: DecisionEvidenceType;
  label: string;
  value?: string;
  severity: "info" | "watch" | "priority";
};

export type DecisionMissingData = {
  type: DecisionEvidenceType;
  label: string;
};

export type DecisionExplanation = {
  level: DecisionExplanationLevel;
  title: string;
  decision: string;
  mainReason?: string;
  supportingEvidence: DecisionEvidence[];
  missingData: DecisionMissingData[];
  confidence: DecisionExplanationConfidence;
  action: string;
};

const weeklyEvidenceTypes: Record<WeeklyReviewReasonType, DecisionEvidenceType> = {
  adherence: "adherence",
  impact: "trainingLoad",
  compatibility: "compatibility",
  wellness: "wellness",
  discomfort: "discomfort",
  dataQuality: "dataQuality"
};

const compatibilityEvidenceTypes: Record<SessionCompatibilityReasonType, DecisionEvidenceType> = {
  plannedImpact: "plannedLoad",
  recentImpact: "trainingLoad",
  discomfort: "discomfort",
  wellness: "wellness",
  adherence: "adherence",
  deviation: "trainingLoad",
  dataQuality: "dataQuality"
};

const severityOrder = { priority: 0, watch: 1, info: 2 } as const;
const evidenceTypeOrder: Record<DecisionEvidenceType, number> = {
  discomfort: 0,
  wellness: 1,
  trainingLoad: 2,
  plannedLoad: 2,
  compatibility: 3,
  adherence: 4,
  review: 5,
  dataQuality: 6
};

// Missing data wins across lists. Sorting before deduplication retains the
// strongest evidence for a repeated label; equal ranks retain source order.
function organizeEvidence(evidence: DecisionEvidence[], missing: DecisionMissingData[]) {
  const missingLabels = new Set<string>();
  const missingData = missing.filter(({ label }) => {
    if (missingLabels.has(label)) return false;
    missingLabels.add(label);
    return true;
  });
  const evidenceLabels = new Set<string>();
  const supportingEvidence = [...evidence]
    .sort((left, right) =>
      severityOrder[left.severity] - severityOrder[right.severity] ||
      evidenceTypeOrder[left.type] - evidenceTypeOrder[right.type]
    )
    .filter(({ label }) => {
      if (missingLabels.has(label) || evidenceLabels.has(label)) return false;
      evidenceLabels.add(label);
      return true;
    });

  return { supportingEvidence, missingData };
}

/** Organizes an existing weekly decision without reclassifying its inputs. */
export function fromWeeklyCoachReview(review: WeeklyCoachReview): DecisionExplanation {
  const evidence: DecisionEvidence[] = [];
  const missing: DecisionMissingData[] = [];

  for (const reason of review.reasons) {
    const type = weeklyEvidenceTypes[reason.type];
    if (reason.type === "dataQuality") {
      missing.push({ type, label: reason.label });
    } else {
      evidence.push({ type, label: reason.label, severity: reason.severity });
    }
  }

  const stats = review.stats;
  // Counts provide context only: they do not introduce severity thresholds.
  evidence.push(
    { type: "adherence", label: "Cumplimiento semanal", value: `${stats.completedSessions}/${stats.plannedSessions} sesiones`, severity: "info" },
    { type: "trainingLoad", label: "Impacto semanal", value: `Alto: ${stats.highImpactSessions} · Medio: ${stats.moderateImpactSessions} · Bajo: ${stats.lowImpactSessions}`, severity: "info" },
    { type: "discomfort", label: "Sesiones con molestias", value: `${stats.discomfortSessions}`, severity: "info" }
  );
  if (stats.completionRate === null) {
    missing.push({ type: "adherence", label: "Faltan sesiones planificadas" });
  }
  if (stats.unknownImpactSessions > 0) {
    missing.push({ type: "trainingLoad", label: "Sesiones sin impacto interpretable" });
  }

  return {
    level: review.level,
    title: "RAC Review semanal",
    decision: review.suggestedDecision,
    mainReason: review.primaryReason?.label,
    ...organizeEvidence(evidence, missing),
    confidence: review.confidence,
    action: review.suggestedDecision
  };
}

/** Preserves the compatibility decision and separates missing inputs. */
export function fromSessionCompatibility(compatibility: SessionCompatibility): DecisionExplanation {
  const evidence: DecisionEvidence[] = [];
  const missing: DecisionMissingData[] = [];

  for (const reason of compatibility.reasons) {
    const type = compatibilityEvidenceTypes[reason.type];
    const isMissing = reason.type === "dataQuality" || (
      reason.type === "plannedImpact" && reason.label === "Faltan datos de la próxima sesión"
    );
    if (isMissing) {
      missing.push({ type, label: reason.label });
    } else {
      evidence.push({ type, label: reason.label, severity: reason.severity });
    }
  }

  return {
    level: compatibility.level === "compatible" ? "stable" : compatibility.level,
    title: "Compatibilidad próxima sesión",
    decision: compatibility.suggestedAction,
    mainReason: compatibility.primaryReason?.label,
    ...organizeEvidence(evidence, missing),
    confidence: compatibility.confidence,
    action: compatibility.suggestedAction
  };
}
