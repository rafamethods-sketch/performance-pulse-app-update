export type AnkleDomainStatus = "incomplete" | "adequate" | "finding" | "priority";
export type AnkleTaskStatus = "normal" | "discomfort" | "avoids";
export type AnkleComparisonAnswer = "yes" | "no" | "inconclusive";

export type AnkleAssessment = {
  id: string;
  date: string;
  painLocation?: string;
  painLocations?: string[];
  customPainLocation?: string;
  anchorTask: string;
  customTask?: string;
  taskStatus?: AnkleTaskStatus;
  regression?: string;
  regressionResponse?: "better" | "same" | "worse";
  safetyNote?: string;
  safetyFlag?: boolean;
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
    legLengthRight?: number | null;
    legLengthLeft?: number | null;
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
  performance: {
    right: number | null;
    left: number | null;
    advancedTest?: "side-hop" | "repeated-hop" | "drop-jump";
    advancedRight?: number | null;
    advancedLeft?: number | null;
  };
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
  incomplete: "Sin rellenar",
  adequate: "Adecuado",
  finding: "A vigilar",
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
  const advancedPerformanceDifference = calculateSideDifference(
    assessment.performance.advancedRight ?? null,
    assessment.performance.advancedLeft ?? null
  );
  const controlPairs = [
    calculateSideDifference(assessment.control.anteriorRight, assessment.control.anteriorLeft).asymmetryPct,
    calculateSideDifference(assessment.control.posteromedialRight, assessment.control.posteromedialLeft).asymmetryPct,
    calculateSideDifference(assessment.control.posterolateralRight, assessment.control.posterolateralLeft).asymmetryPct
  ].filter((value): value is number => value !== null);

  const hasToleranceData = Boolean(assessment.anchorTask?.trim())
    && Boolean(assessment.taskStatus)
    && (assessment.anchorTask !== "Otra" || Boolean(assessment.customTask?.trim()));
  const tolerance: AnkleDomainStatus = !hasToleranceData
    ? "incomplete"
    : assessment.taskStatus === "avoids" || (
    assessment.taskStatus === "discomfort" && ["same", "worse"].includes(assessment.regressionResponse ?? "")
  )
    ? "priority"
    : assessment.taskStatus === "discomfort"
      ? "finding"
      : "adequate";
  const hasRelevantRomDifference = (romDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.romAsymmetryPriorityPct
    || (romDifference.absolute ?? 0) >= ankleAssessmentConfig.placeholders.romDifferenceFindingCm;
  const rom: AnkleDomainStatus = romDifference.absolute === null
    ? "incomplete"
    : hasRelevantRomDifference && assessment.rom.taskImproves === "yes"
    ? "priority"
    : hasRelevantRomDifference
      ? "finding"
      : "adequate";
  const hasStrengthData = strengthDifference.absolute !== null
    && assessment.strength.consistentHeight !== undefined
    && assessment.strength.maintainsRom !== undefined
    && assessment.strength.clearDeviation !== undefined
    && assessment.strength.symptomsLimit !== undefined
    && Boolean(assessment.strength.stopReason);
  const strength: AnkleDomainStatus = !hasStrengthData
    ? "incomplete"
    : assessment.strength.symptomsLimit || ["Dolor / molestia", "Dolor/molestia"].includes(assessment.strength.stopReason ?? "")
    ? "priority"
    : (strengthDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.strengthAsymmetryFindingPct || assessment.strength.clearDeviation || assessment.strength.consistentHeight === false || assessment.strength.maintainsRom === false
      ? "finding"
      : "adequate";
  const hasControlMeasures = controlPairs.length === 3;
  const hasControlAnswers = assessment.control.lessStable !== undefined
    && assessment.control.givesWay !== undefined
    && assessment.control.confidence !== undefined;
  const control: AnkleDomainStatus = !hasControlMeasures && !hasControlAnswers
    ? "incomplete"
    : assessment.control.givesWay === "frequently" || assessment.control.confidence === "no"
    ? "priority"
    : assessment.control.lessStable || assessment.control.givesWay === "occasionally" || assessment.control.confidence === "partially" || controlPairs.some((value) => value >= ankleAssessmentConfig.placeholders.yBalanceAsymmetryFindingPct)
      ? "finding"
      : "adequate";
  const hasMainPerformanceData = performanceDifference.absolute !== null;
  const hasAdvancedPerformanceData = advancedPerformanceDifference.absolute !== null;
  const performance: AnkleDomainStatus = !hasMainPerformanceData && !hasAdvancedPerformanceData
    ? "incomplete"
    : (performanceDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.performanceAsymmetryFindingPct
      || (advancedPerformanceDifference.asymmetryPct ?? 0) >= ankleAssessmentConfig.placeholders.performanceAsymmetryFindingPct
    ? "finding"
    : "adequate";

  return { tolerance, rom, strength, control, performance };
}
