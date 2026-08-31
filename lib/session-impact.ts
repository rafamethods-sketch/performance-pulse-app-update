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

export function getSessionImpactStyle(level: SessionImpactLevel): SessionImpactStyle {
  switch (level) {
    case "low":
      return {
        badgeClassName: "border border-blue-100 bg-blue-50/90 text-blue-700 [[data-theme=dark]_&]:border-blue-900 [[data-theme=dark]_&]:bg-blue-950/40 [[data-theme=dark]_&]:text-blue-200",
        dotClassName: "bg-blue-300",
        borderClassName: "border-blue-100 [[data-theme=dark]_&]:border-blue-900"
      };
    case "moderate":
      return {
        badgeClassName: "border border-blue-200/90 bg-blue-100 text-blue-800 [[data-theme=dark]_&]:border-blue-700 [[data-theme=dark]_&]:bg-blue-900 [[data-theme=dark]_&]:text-blue-100",
        dotClassName: "bg-blue-500",
        borderClassName: "border-blue-300 [[data-theme=dark]_&]:border-blue-700"
      };
    case "high":
      return {
        badgeClassName: "border border-blue-800 bg-blue-950 text-blue-100",
        dotClassName: "bg-blue-300",
        borderClassName: "border-blue-800"
      };
    case "unknown":
      return {
        badgeClassName: "border border-line bg-panel text-ink/70",
        dotClassName: "bg-ink/40",
        borderClassName: "border-line"
      };
  }
}
