export type AnkleDomainStatus = "adequate" | "finding" | "priority";
export type AnkleTaskStatus = "normal" | "discomfort" | "avoids";
export type AnkleComparisonAnswer = "yes" | "no" | "inconclusive";

export type AnkleAssessment = {
  id: string;
  date: string;
  anchorTask: string;
  taskStatus: AnkleTaskStatus;
  regression?: string;
  regressionResponse?: "better" | "same" | "worse";
  safetyNote?: string;
  rom: { right: number | null; left: number | null; taskImproves?: AnkleComparisonAnswer };
  strength: {
    right: number | null;
    left: number | null;
    consistentHeight?: boolean;
    maintainsRom?: boolean;
    clearDeviation?: boolean;
    symptomsLimit?: boolean;
    stopReason?: string;
  };
  control: {
    anteriorRight: number | null;
    anteriorLeft: number | null;
    posteromedialRight: number | null;
    posteromedialLeft: number | null;
    posterolateralRight: number | null;
    posterolateralLeft: number | null;
    lessStable?: boolean;
    givesWay?: "never" | "occasionally" | "frequently";
    confidence?: "yes" | "partially" | "no";
  };
  performance: { right: number | null; left: number | null };
  notes?: string;
};

export const ankleAssessmentConfig = {
  version: "ankle-v1",
  placeholders: {
    romDifferenceFindingCm: 2,
    romAsymmetryPriorityPct: 20,
    strengthAsymmetryFindingPct: 15,
    performanceAsymmetryFindingPct: 15,
    yBalanceAsymmetryFindingPct: 15
  },
  note: "Criterios iniciales editables para ordenar la información; no son puntos de corte diagnósticos."
} as const;

export const ankleDomainLabels: Record<"tolerance" | "rom" | "strength" | "control" | "performance", string> = {
  tolerance: "Tolerancia",
  rom: "ROM",
  strength: "Fuerza",
  control: "Control / Estabilidad",
  performance: "Performance"
};

export const ankleStatusLabels: Record<AnkleDomainStatus, string> = {
  adequate: "Adecuado",
  finding: "Hallazgo",
  priority: "Prioridad"
};

export function calculateSideDifference(right: number | null, left: number | null) {
  if (right === null || left === null) return { absolute: null, asymmetryPct: null };
  const maximum = Math.max(Math.abs(right), Math.abs(left));
  return {
    absolute: Math.abs(right - left),
    asymmetryPct: maximum > 0 ? Math.round((Math.abs(right - left) / maximum) * 100) : 0
  };
}

export function getAnkleDomainStatuses(assessment: AnkleAssessment) {
  const romDifference = calculateSideDifference(assessment.rom.right, assessment.rom.left);
  const strengthDifference = calculateSideDifference(assessment.strength.right, assessment.strength.left);
  const performanceDifference = calculateSideDifference(assessment.performance.right, assessment.performance.left);
  const controlPairs = [
    calculateSideDifference(assessment.control.anteriorRight, assessment.control.anteriorLeft).asymmetryPct,
    calculateSideDifference(assessment.control.posteromedialRight, assessment.control.posteromedialLeft).asymmetryPct,
    calculateSideDifference(assessment.control.posterolateralRight, assessment.control.posterolateralLeft).asymmetryPct
  ].filter((value): value is number => value !== null);

  const tolerance: AnkleDomainStatus = assessment.taskStatus === "avoids" || (
    assessment.taskStatus === "discomfort" && ["same", "worse"].includes(assessment.regressionResponse ?? "")
  )
    ? "priority"
    : assessment.taskStatus === "discomfort"
      ? "finding"
      : "adequate";
  const hasRelevantRomDifference = (romDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.romAsymmetryPriorityPct
    || (romDifference.absolute ?? 0) >= ankleAssessmentConfig.placeholders.romDifferenceFindingCm;
  const rom: AnkleDomainStatus = hasRelevantRomDifference && assessment.rom.taskImproves === "yes"
    ? "priority"
    : hasRelevantRomDifference
      ? "finding"
      : "adequate";
  const strength: AnkleDomainStatus = assessment.strength.symptomsLimit
    ? "priority"
    : (strengthDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.strengthAsymmetryFindingPct || assessment.strength.clearDeviation || assessment.strength.consistentHeight === false || assessment.strength.maintainsRom === false
      ? "finding"
      : "adequate";
  const control: AnkleDomainStatus = assessment.control.givesWay === "frequently" || assessment.control.confidence === "no"
    ? "priority"
    : assessment.control.lessStable || assessment.control.givesWay === "occasionally" || assessment.control.confidence === "partially" || controlPairs.some((value) => value >= ankleAssessmentConfig.placeholders.yBalanceAsymmetryFindingPct)
      ? "finding"
      : "adequate";
  const performance: AnkleDomainStatus = (performanceDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.performanceAsymmetryFindingPct
    ? "finding"
    : "adequate";

  return { tolerance, rom, strength, control, performance };
}
