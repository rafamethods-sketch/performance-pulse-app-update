export type SessionImpactLevel = "low" | "moderate" | "high" | "unknown";

export type SessionImpact = {
  level: SessionImpactLevel;
  label: string;
  description: string;
  reasons: string[];
};

export type SessionImpactStyle = {
  badgeClassName: string;
  dotClassName: string;
  borderClassName: string;
};

type NumericInput = number | string | null;

// Structural input only: no changes to stored session models are required.
type SessionImpactInput = {
  sRPE?: NumericInput;
  actualDurationMinutes?: NumericInput;
  duration?: NumericInput;
  finalRpe?: NumericInput;
  cardioResult?: unknown;
  performedExercises?: readonly unknown[] | null;
  discomfort?: { hasDiscomfort?: boolean } | null;
  type?: string | null;
  summary?: string | null;
};

type PlannedExerciseInput = {
  plannedSets?: NumericInput;
  setDetails?: readonly unknown[] | null;
  sets?: NumericInput;
};

type PlannedSessionImpactInput = {
  targetRpe?: NumericInput;
  duration?: NumericInput;
  plannedDurationMinutes?: NumericInput;
  exercises?: readonly PlannedExerciseInput[] | null;
  plannedExercises?: readonly PlannedExerciseInput[] | null;
  exercisePlan?: readonly PlannedExerciseInput[] | null;
  cardioPlan?: {
    targetDurationMinutes?: NumericInput;
    targetRpeMax?: NumericInput;
    targetRpeMin?: NumericInput;
  } | null;
  type?: string | null;
  summary?: string | null;
};

const impactCopy: Record<SessionImpactLevel, Pick<SessionImpact, "label" | "description">> = {
  low: {
    label: "Impacto bajo",
    description: "Sesión de baja demanda."
  },
  moderate: {
    label: "Impacto medio",
    description: "Sesión de demanda moderada."
  },
  high: {
    label: "Impacto alto",
    description: "Sesión exigente a tener en cuenta para la recuperación."
  },
  unknown: {
    label: "Sin datos suficientes",
    description: "Faltan datos para estimar el impacto."
  }
};

// Initial RAC v1 criteria for session demand, kept together for future tuning.
const impactThresholds = {
  moderateSrpe: 250,
  highSrpe: 500,
  moderateRpe: 6,
  highRpe: 8,
  longDurationMinutes: 60
} as const;

// RAC v1 placeholders for planned volume. They are not diagnostic cut-offs.
const plannedImpactThresholds = {
  elevatedSets: 18,
  veryHighSets: 30
} as const;

function readNumber(value: NumericInput | undefined): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// Call for completed sessions. This helper neither decides completion nor saves data.
export function getSessionImpact(session: SessionImpactInput): SessionImpact {
  const storedSrpe = readNumber(session.sRPE);
  const duration = readNumber(session.actualDurationMinutes) ?? readNumber(session.duration);
  const parsedRpe = readNumber(session.finalRpe);
  const finalRpe = parsedRpe !== null && parsedRpe <= 10 ? parsedRpe : null;
  const canEstimate = duration !== null && duration > 0 && finalRpe !== null;
  const estimatedSrpe = canEstimate ? duration * finalRpe : null;
  const load = storedSrpe ?? (estimatedSrpe !== null && Number.isFinite(estimatedSrpe) ? estimatedSrpe : null);
  const reasons: string[] = [];
  let level: SessionImpactLevel = "unknown";

  if (load === null) {
    reasons.push("Faltan duración y RPE");
  } else {
    const highRpe = finalRpe !== null && finalRpe >= impactThresholds.highRpe;
    const longDuration = duration !== null && duration >= impactThresholds.longDurationMinutes;

    if (load >= impactThresholds.highSrpe || (highRpe && longDuration)) {
      level = "high";
    } else if (load >= impactThresholds.moderateSrpe || (finalRpe !== null && finalRpe >= impactThresholds.moderateRpe)) {
      level = "moderate";
    } else {
      level = "low";
    }

    if (storedSrpe === null) reasons.push("Carga estimada con duración y RPE");
    if (load >= impactThresholds.highSrpe) reasons.push("sRPE alto");
    else if (load >= impactThresholds.moderateSrpe) reasons.push("sRPE moderado");
    if (highRpe) reasons.push("RPE final alto");
    else if (finalRpe !== null && finalRpe >= impactThresholds.moderateRpe) reasons.push("RPE final moderado");
    if (longDuration) reasons.push("Duración elevada");
  }

  // Context only: discomfort does not participate in the demand classification.
  if (session.discomfort?.hasDiscomfort === true) reasons.push("Molestia registrada");

  return { level, ...impactCopy[level], reasons };
}

function getPlannedExerciseSets(exercise: PlannedExerciseInput) {
  const explicitSets = readNumber(exercise.plannedSets) ?? readNumber(exercise.sets);
  if (explicitSets !== null) return explicitSets;
  return exercise.setDetails?.length ?? 0;
}

// Estimate expected demand before a session. This does not classify real work or create alerts.
export function getPlannedSessionImpact(session: PlannedSessionImpactInput): SessionImpact {
  const exercises = session.plannedExercises?.length
    ? session.plannedExercises
    : session.exercises?.length
      ? session.exercises
      : session.exercisePlan ?? [];
  const plannedSets = exercises.reduce((total, exercise) => total + getPlannedExerciseSets(exercise), 0);
  const duration = readNumber(session.plannedDurationMinutes)
    ?? readNumber(session.cardioPlan?.targetDurationMinutes)
    ?? readNumber(session.duration);
  const parsedTargetRpe = readNumber(session.targetRpe)
    ?? readNumber(session.cardioPlan?.targetRpeMax)
    ?? readNumber(session.cardioPlan?.targetRpeMin);
  const targetRpe = parsedTargetRpe !== null && parsedTargetRpe > 0 && parsedTargetRpe <= 10
    ? parsedTargetRpe
    : null;
  const canEstimateLoad = duration !== null && duration > 0 && targetRpe !== null;
  const plannedLoad = canEstimateLoad ? duration * targetRpe : null;
  const elevatedVolume = plannedSets >= plannedImpactThresholds.elevatedSets;
  const veryHighVolume = plannedSets >= plannedImpactThresholds.veryHighSets;
  const reasons: string[] = [];
  let level: SessionImpactLevel = "unknown";

  if (plannedLoad !== null) {
    if (plannedLoad >= impactThresholds.highSrpe) level = "high";
    else if (plannedLoad >= impactThresholds.moderateSrpe) level = "moderate";
    else level = "low";

    reasons.push("Estimación con datos planificados");
    if (plannedLoad >= impactThresholds.highSrpe) reasons.push("Carga prevista alta");
    else if (plannedLoad >= impactThresholds.moderateSrpe) reasons.push("Carga prevista moderada");
  } else if (targetRpe !== null) {
    level = targetRpe >= impactThresholds.moderateRpe ? "moderate" : "low";
    reasons.push("Estimación con datos planificados");
  } else if (elevatedVolume) {
    // Volume alone supports a cautious moderate estimate, never a high estimate.
    level = "moderate";
    reasons.push("Estimación con datos planificados");
  } else {
    reasons.push("Faltan datos planificados");
  }

  if (level !== "unknown") {
    if (targetRpe !== null && targetRpe >= impactThresholds.highRpe) reasons.push("RPE objetivo alto");
    else if (targetRpe !== null && targetRpe >= impactThresholds.moderateRpe) reasons.push("RPE objetivo moderado");
    if (duration !== null && duration >= impactThresholds.longDurationMinutes) reasons.push("Duración prevista elevada");
    if (elevatedVolume) reasons.push("Volumen planificado elevado");

    if (veryHighVolume && level === "moderate") level = "high";
    else if (elevatedVolume && level === "low") level = "moderate";
  }

  return { level, ...impactCopy[level], reasons };
}

export function getSessionImpactStyle(level: SessionImpactLevel): SessionImpactStyle {
  switch (level) {
    case "low":
      return {
        badgeClassName: "border border-blue-100 bg-blue-50/90 text-blue-700 [[data-theme=dark]_&]:border-blue-900/50 [[data-theme=dark]_&]:bg-blue-950/20 [[data-theme=dark]_&]:text-blue-200",
        dotClassName: "bg-blue-300 [[data-theme=dark]_&]:bg-blue-300/70",
        borderClassName: "border-blue-100 [[data-theme=dark]_&]:border-blue-900/50"
      };
    case "moderate":
      return {
        badgeClassName: "border border-blue-200/90 bg-blue-100 text-blue-800 [[data-theme=dark]_&]:border-blue-700/50 [[data-theme=dark]_&]:bg-blue-900/30 [[data-theme=dark]_&]:text-blue-100",
        dotClassName: "bg-blue-500 [[data-theme=dark]_&]:bg-blue-300/80",
        borderClassName: "border-blue-300 [[data-theme=dark]_&]:border-blue-700/50"
      };
    case "high":
      return {
        badgeClassName: "border border-blue-800 bg-blue-950 text-blue-100 [[data-theme=dark]_&]:border-blue-700/70 [[data-theme=dark]_&]:bg-blue-950/60 [[data-theme=dark]_&]:text-blue-50",
        dotClassName: "bg-blue-300 [[data-theme=dark]_&]:bg-blue-200",
        borderClassName: "border-blue-800 [[data-theme=dark]_&]:border-blue-700/70"
      };
    case "unknown":
      return {
        badgeClassName: "border border-line bg-panel text-ink/70",
        dotClassName: "bg-ink/40",
        borderClassName: "border-line"
      };
  }
}
