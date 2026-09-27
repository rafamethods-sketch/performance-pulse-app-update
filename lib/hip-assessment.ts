import { calculateKneeDifference } from "@/lib/knee-assessment";

export type HipDomain = "tolerance" | "rom" | "strength" | "control" | "performance";
export type HipDomainStatus = "incomplete" | "adequate" | "finding" | "priority";
export type HipTask = "squat" | "splitSquat" | "hinge" | "singleLeg";
export type HipTaskStatus = "normal" | "discomfort" | "avoids";
export type HipStrengthPattern = "abduction" | "adduction" | "extension" | "flexion";
export type HipStrengthMethod = "dynamometer" | "load_repetitions" | "isometric" | "qualitative";
export type HipControlResult = "adequate" | "mild_compensation" | "clear_compensation" | "discomfort" | "not_performed";

export type HipStrengthResult = {
  method?: HipStrengthMethod;
  unit?: string;
  right: number | null;
  left: number | null;
  limitsTask?: boolean;
};

export type HipAssessment = {
  id: string;
  date: string;
  painLocations?: string[];
  painSide?: "right" | "left" | "bilateral";
  customPainLocation?: string;
  safetyFlag?: boolean;
  safetyNote?: string;
  tolerance: Partial<Record<HipTask, HipTaskStatus>>;
  rom: {
    flexionRight: number | null;
    flexionLeft: number | null;
    internalRotationRight: number | null;
    internalRotationLeft: number | null;
    externalRotationRight: number | null;
    externalRotationLeft: number | null;
    extensionRight?: number | null;
    extensionLeft?: number | null;
    affectsTask?: "yes" | "no" | "inconclusive";
  };
  strength: Record<HipStrengthPattern, HipStrengthResult>;
  control: { right?: HipControlResult; left?: HipControlResult };
  notes?: string;
};

export type HipSharedPerformance = {
  assessmentId: string;
  date: string;
  right: number;
  left: number;
};

export const hipAssessmentConfig = {
  version: "hip-v1",
  placeholders: {
    romDifferenceFindingDegrees: 5,
    strengthAsymmetryFindingPct: 15,
    performanceAsymmetryFindingPct: 15
  },
  note: "Criterios orientativos para ordenar la información funcional; no son puntos de corte diagnósticos."
} as const;

export const hipDomainLabels: Record<HipDomain, string> = {
  tolerance: "Tolerancia",
  rom: "ROM",
  strength: "Fuerza",
  control: "Control / Estabilidad",
  performance: "Performance"
};

export const hipStatusLabels: Record<HipDomainStatus, string> = {
  priority: "Prioridad",
  finding: "Hallazgo",
  adequate: "Adecuado",
  incomplete: "Sin rellenar"
};

export const calculateHipDifference = calculateKneeDifference;

export function getHipDomainStatuses(
  assessment: HipAssessment,
  sharedPerformance?: HipSharedPerformance | null
): Record<HipDomain, HipDomainStatus> {
  const taskValues = Object.values(assessment.tolerance);
  const tolerance: HipDomainStatus = taskValues.length < 4
    ? "incomplete"
    : taskValues.includes("avoids")
      ? "priority"
      : taskValues.includes("discomfort")
        ? "finding"
        : "adequate";

  const romPairs = [
    calculateHipDifference(assessment.rom.flexionRight, assessment.rom.flexionLeft),
    calculateHipDifference(assessment.rom.internalRotationRight, assessment.rom.internalRotationLeft),
    calculateHipDifference(assessment.rom.externalRotationRight, assessment.rom.externalRotationLeft)
  ];
  const romComplete = romPairs.every((pair) => pair.absolute !== null);
  const romFinding = romPairs.some((pair) => (pair.absolute ?? 0) >= hipAssessmentConfig.placeholders.romDifferenceFindingDegrees);
  const rom: HipDomainStatus = !romComplete
    ? "incomplete"
    : romFinding && assessment.rom.affectsTask === "yes"
      ? "priority"
      : romFinding
        ? "finding"
        : "adequate";

  const strengthResults = Object.values(assessment.strength);
  const completeStrength = strengthResults.filter((item) => item.method && item.right !== null && item.left !== null);
  const strengthFinding = completeStrength.some((item) => (
    calculateHipDifference(item.right, item.left).asymmetryPct ?? 0
  ) >= hipAssessmentConfig.placeholders.strengthAsymmetryFindingPct);
  const strength: HipDomainStatus = completeStrength.length === 0
    ? "incomplete"
    : completeStrength.some((item) => item.limitsTask)
      ? "priority"
      : strengthFinding
        ? "finding"
        : "adequate";

  const controlValues = [assessment.control.right, assessment.control.left];
  const controlComplete = controlValues.every((value) => value && value !== "not_performed");
  const control: HipDomainStatus = !controlComplete
    ? "incomplete"
    : controlValues.includes("discomfort")
      ? "priority"
      : controlValues.some((value) => value === "mild_compensation" || value === "clear_compensation")
        ? "finding"
        : "adequate";

  const performanceDifference = sharedPerformance
    ? calculateHipDifference(sharedPerformance.right, sharedPerformance.left)
    : null;
  const performance: HipDomainStatus = !performanceDifference
    ? "incomplete"
    : (performanceDifference.asymmetryPct ?? 0) >= hipAssessmentConfig.placeholders.performanceAsymmetryFindingPct
      ? "finding"
      : "adequate";

  return { tolerance, rom, strength, control, performance };
}
