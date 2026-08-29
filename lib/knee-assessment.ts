export type KneeDomain = "tolerance" | "rom" | "strength" | "control" | "performance";
export type KneeDomainStatus = "incomplete" | "adequate" | "finding" | "priority";

export type KneeAssessment = {
  id: string;
  date: string;
  painLocation?: string;
  painLocations?: string[];
  customPainLocation?: string;
  task?: string;
  customTask?: string;
  taskStatus?: "normal" | "discomfort" | "avoids";
  regression?: string;
  regressionResponse?: "better" | "same" | "worse";
  safetyFlag?: boolean;
  safetyNote?: string;
  rom: {
    romMethod?: "measured" | "visual";
    extensionRight: number | null;
    extensionLeft: number | null;
    flexionRight: number | null;
    flexionLeft: number | null;
    affectsTask?: "yes" | "no" | "inconclusive";
    rotationInternalRight?: number | null;
    rotationInternalLeft?: number | null;
    rotationExternalRight?: number | null;
    rotationExternalLeft?: number | null;
    visualExtension?: {
      right?: "full" | "slightly_limited" | "clearly_limited" | "not_assessed";
      left?: "full" | "slightly_limited" | "clearly_limited" | "not_assessed";
    };
    visualFlexion?: {
      right?: "high" | "moderately_limited" | "clearly_limited" | "not_assessed";
      left?: "high" | "moderately_limited" | "clearly_limited" | "not_assessed";
    };
    visualSymmetry?: "similar" | "slight_difference" | "clear_difference" | "not_clear";
    movementQualityNote?: string;
  };
  strength: {
    method?: "dynamometer" | "machine";
    unit?: string;
    right: number | null;
    left: number | null;
    limitsTask?: boolean;
    flexorMethod?: "dynamometer" | "machine";
    flexorUnit?: string;
    flexorRight?: number | null;
    flexorLeft?: number | null;
  };
  control: {
    balance?: boolean;
    descentControl?: boolean;
    stableTrajectory?: boolean;
    trunkPelvisControl?: boolean;
    symptomsLimit?: boolean;
    lessStable?: boolean;
    givesWay?: "never" | "occasionally" | "frequently";
    confidence?: "yes" | "partially" | "no";
  };
  performance: {
    right: number | null;
    left: number | null;
    advancedTest?: "vertical-jump" | "drop-jump" | "side-hop";
    advancedRight?: number | null;
    advancedLeft?: number | null;
  };
  notes?: string;
};

export const kneeAssessmentConfig = {
  version: "knee-v1",
  placeholders: {
    romDifferenceFindingDegrees: 5,
    romRotationDifferenceFindingDegrees: 5,
    strengthAsymmetryFindingPct: 15,
    performanceAsymmetryFindingPct: 15
  },
  note: "Criterios orientativos editables para ordenar la información funcional; no son puntos de corte diagnósticos."
} as const;

export const kneeDomainLabels: Record<KneeDomain, string> = {
  tolerance: "Tolerancia",
  rom: "ROM",
  strength: "Fuerza",
  control: "Control / Estabilidad",
  performance: "Performance"
};

export const kneeStatusLabels: Record<KneeDomainStatus, string> = {
  incomplete: "Sin rellenar",
  adequate: "Adecuado",
  finding: "A vigilar",
  priority: "Prioridad"
};

export function calculateKneeDifference(right: number | null | undefined, left: number | null | undefined) {
  if (right == null || left == null) return { absolute: null, asymmetryPct: null };
  const maximum = Math.max(Math.abs(right), Math.abs(left));
  return {
    absolute: Math.abs(right - left),
    asymmetryPct: maximum > 0 ? Math.round((Math.abs(right - left) / maximum) * 100) : 0
  };
}

export function getKneeDomainStatuses(assessment: KneeAssessment): Record<KneeDomain, KneeDomainStatus> {
  const taskComplete = Boolean(assessment.task?.trim())
    && Boolean(assessment.taskStatus)
    && (assessment.task !== "Otra" || Boolean(assessment.customTask?.trim()));
  const tolerance: KneeDomainStatus = !taskComplete
    ? "incomplete"
    : assessment.taskStatus === "avoids" || (assessment.taskStatus === "discomfort" && ["same", "worse"].includes(assessment.regressionResponse ?? ""))
      ? "priority"
      : assessment.taskStatus === "discomfort"
        ? "finding"
        : "adequate";

  const extension = calculateKneeDifference(assessment.rom.extensionRight, assessment.rom.extensionLeft);
  const flexion = calculateKneeDifference(assessment.rom.flexionRight, assessment.rom.flexionLeft);
  const rotationInternal = calculateKneeDifference(assessment.rom.rotationInternalRight, assessment.rom.rotationInternalLeft);
  const rotationExternal = calculateKneeDifference(assessment.rom.rotationExternalRight, assessment.rom.rotationExternalLeft);
  const romComplete = extension.absolute !== null && flexion.absolute !== null;
  const mainRomFinding = [extension.absolute, flexion.absolute].some((value) => (value ?? 0) >= kneeAssessmentConfig.placeholders.romDifferenceFindingDegrees);
  const rotationRomFinding = [rotationInternal.absolute, rotationExternal.absolute]
    .some((value) => value !== null && value >= kneeAssessmentConfig.placeholders.romRotationDifferenceFindingDegrees);
  const romFinding = mainRomFinding || rotationRomFinding;
  const measuredRom: KneeDomainStatus = !romComplete ? "incomplete" : romFinding && assessment.rom.affectsTask === "yes" ? "priority" : romFinding ? "finding" : "adequate";
  const visualValues = [
    assessment.rom.visualExtension?.right,
    assessment.rom.visualExtension?.left,
    assessment.rom.visualFlexion?.right,
    assessment.rom.visualFlexion?.left
  ];
  const hasVisualRomData = visualValues.some(Boolean) || Boolean(assessment.rom.visualSymmetry);
  const visualRomComplete = visualValues.every((value) => Boolean(value) && value !== "not_assessed");
  const visualRomClear = visualValues.includes("clearly_limited") || assessment.rom.visualSymmetry === "clear_difference";
  const visualRomFinding = visualValues.some((value) => value === "slightly_limited" || value === "moderately_limited")
    || assessment.rom.visualSymmetry === "slight_difference";
  const visualRom: KneeDomainStatus = !visualRomComplete
    ? "incomplete"
    : visualRomClear && assessment.rom.affectsTask === "yes"
      ? "priority"
      : visualRomClear || visualRomFinding
        ? "finding"
        : "adequate";
  const rom: KneeDomainStatus = assessment.rom.romMethod === "measured"
    ? measuredRom
    : assessment.rom.romMethod === "visual"
      ? visualRom
      : romComplete
        ? measuredRom
        : hasVisualRomData
          ? visualRom
          : "incomplete";

  const strengthDifference = calculateKneeDifference(assessment.strength.right, assessment.strength.left);
  const strengthComplete = Boolean(assessment.strength.method) && Boolean(assessment.strength.unit) && strengthDifference.absolute !== null;
  const strengthFinding = (strengthDifference.asymmetryPct ?? 0) >= kneeAssessmentConfig.placeholders.strengthAsymmetryFindingPct;
  const strength: KneeDomainStatus = !strengthComplete ? "incomplete" : assessment.strength.limitsTask ? "priority" : strengthFinding ? "finding" : "adequate";

  const controlAnswers = [assessment.control.balance, assessment.control.descentControl, assessment.control.stableTrajectory, assessment.control.trunkPelvisControl, assessment.control.symptomsLimit, assessment.control.lessStable];
  const controlComplete = controlAnswers.every((answer) => answer !== undefined) && Boolean(assessment.control.givesWay) && Boolean(assessment.control.confidence);
  const control: KneeDomainStatus = !controlComplete
    ? "incomplete"
    : assessment.control.symptomsLimit || assessment.control.givesWay === "frequently" || assessment.control.confidence === "no"
      ? "priority"
      : controlAnswers.some((answer) => answer === false) || assessment.control.lessStable || assessment.control.givesWay === "occasionally" || assessment.control.confidence === "partially"
        ? "finding"
        : "adequate";

  const mainPerformance = calculateKneeDifference(assessment.performance.right, assessment.performance.left);
  const advancedPerformance = calculateKneeDifference(assessment.performance.advancedRight, assessment.performance.advancedLeft);
  const advancedPerformanceComplete = Boolean(assessment.performance.advancedTest) && advancedPerformance.absolute !== null;
  const performanceComplete = mainPerformance.absolute !== null || advancedPerformanceComplete;
  const performanceFinding = (mainPerformance.asymmetryPct ?? 0) >= kneeAssessmentConfig.placeholders.performanceAsymmetryFindingPct
    || (advancedPerformanceComplete && (advancedPerformance.asymmetryPct ?? 0) >= kneeAssessmentConfig.placeholders.performanceAsymmetryFindingPct);
  const performance: KneeDomainStatus = !performanceComplete ? "incomplete" : performanceFinding ? "finding" : "adequate";

  return { tolerance, rom, strength, control, performance };
}
