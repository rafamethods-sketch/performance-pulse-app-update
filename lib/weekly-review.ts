import { getNextSessionCompatibility } from "@/lib/session-compatibility";
import { getSessionImpact } from "@/lib/session-impact";

export type WeeklyReviewLevel = "stable" | "review" | "priority" | "unknown";
export type WeeklyReviewConfidence = "high" | "medium" | "low";
export type WeeklyReviewReasonType = "adherence" | "impact" | "compatibility" | "wellness" | "discomfort" | "dataQuality";

export type WeeklyReviewReason = {
  type: WeeklyReviewReasonType;
  label: string;
  severity: "info" | "watch" | "priority";
};

export type WeeklyReviewStats = {
  plannedSessions: number;
  completedSessions: number;
  pendingSessions: number;
  completionRate: number | null;
  highImpactSessions: number;
  moderateImpactSessions: number;
  lowImpactSessions: number;
  unknownImpactSessions: number;
  discomfortSessions: number;
};

export type WeeklyCoachReview = {
  level: WeeklyReviewLevel;
  label: string;
  description: string;
  reasons: WeeklyReviewReason[];
  primaryReason?: WeeklyReviewReason;
  suggestedDecision: string;
  confidence: WeeklyReviewConfidence;
  stats: WeeklyReviewStats;
};

export type WeeklyReviewStyle = {
  badgeClassName: string;
  dotClassName: string;
  borderClassName: string;
};

type NumericInput = number | string | null;

type WeeklyReviewExercise = {
  plannedSets?: NumericInput;
  setDetails?: readonly unknown[] | null;
  sets?: NumericInput;
};

export type WeeklyReviewWellness = {
  date?: string | null;
  fatigue?: NumericInput;
  mood?: NumericInput;
  motivation?: NumericInput;
  recovery?: NumericInput;
  scaleMax?: NumericInput;
  sleep?: NumericInput;
  sleepQuality?: NumericInput;
  soreness?: NumericInput;
  stress?: NumericInput;
};

export type WeeklyReviewSession = {
  actualDurationMinutes?: NumericInput;
  cardioPlan?: {
    targetDurationMinutes?: NumericInput;
    targetRpeMax?: NumericInput;
    targetRpeMin?: NumericInput;
  } | null;
  completed?: boolean;
  date?: string | null;
  discomfort?: { hasDiscomfort?: boolean } | null;
  duration?: NumericInput;
  exercisePlan?: readonly WeeklyReviewExercise[] | null;
  exercises?: readonly WeeklyReviewExercise[] | null;
  finalRpe?: NumericInput;
  performedExercises?: readonly unknown[] | null;
  plannedDurationMinutes?: NumericInput;
  plannedExercises?: readonly WeeklyReviewExercise[] | null;
  rpe?: NumericInput;
  sRPE?: NumericInput;
  srpe?: NumericInput;
  status?: string | null;
  summary?: string | null;
  targetRpe?: NumericInput;
  type?: string | null;
  wellness?: WeeklyReviewWellness | null;
};

export type WeeklyCoachReviewInput = {
  sessions?: readonly WeeklyReviewSession[] | null;
  nextSession?: WeeklyReviewSession | null;
  wellness?: readonly WeeklyReviewWellness[] | null;
  referenceDate?: string | Date | null;
};

const weeklyReviewCopy: Record<WeeklyReviewLevel, Pick<WeeklyCoachReview, "label" | "description">> = {
  stable: {
    label: "Seguimiento estable",
    description: "La semana mantiene un seguimiento estable con los datos disponibles."
  },
  review: {
    label: "Conviene revisar",
    description: "Hay aspectos de la semana que conviene revisar antes de mantener la progresión."
  },
  priority: {
    label: "Prioridad",
    description: "Hay varios aspectos relevantes que conviene revisar antes de progresar."
  },
  unknown: {
    label: "Sin datos suficientes",
    description: "Faltan datos de la semana para obtener una lectura útil."
  }
};

const severityOrder = { priority: 0, watch: 1, info: 2 } as const;
const reasonTypeOrder: Record<WeeklyReviewReasonType, number> = {
  discomfort: 0,
  wellness: 1,
  impact: 2,
  compatibility: 3,
  adherence: 4,
  dataQuality: 5
};

function readNumber(value: NumericInput | undefined) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readDate(value?: string | Date | null) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : new Date(value);
  if (!value) return null;
  const localized = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const parsed = localized
    ? new Date(Number(localized[3]), Number(localized[2]) - 1, Number(localized[1]))
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getWeekBounds(referenceDate?: string | Date | null) {
  const parsedReference = readDate(referenceDate) ?? new Date();
  const start = new Date(parsedReference.getFullYear(), parsedReference.getMonth(), parsedReference.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { end, start };
}

function selectWeekEntries<T extends { date?: string | null }>(entries: readonly T[], referenceDate?: string | Date | null) {
  const datedEntries = entries.map((entry) => ({ date: readDate(entry.date), entry }));
  if (!datedEntries.some(({ date }) => Boolean(date))) return entries.slice(0, 7);
  const { end, start } = getWeekBounds(referenceDate);
  return datedEntries
    .filter((item): item is { date: Date; entry: T } => Boolean(item.date))
    .filter(({ date }) => date >= start && date < end)
    .map(({ entry }) => entry);
}

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function hasRealSessionData(session: WeeklyReviewSession) {
  return Boolean(
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.finalRpe) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function isCompletedSession(session: WeeklyReviewSession) {
  if (session.completed === true || hasRealSessionData(session)) return true;
  return /completad|realizad|finished/i.test(session.status ?? "");
}

function addReason(reasons: WeeklyReviewReason[], reason: WeeklyReviewReason) {
  if (!reasons.some((current) => current.label === reason.label)) reasons.push(reason);
}

function sortReasons(reasons: WeeklyReviewReason[]) {
  return [...reasons].sort((left, right) => {
    const severityDifference = severityOrder[left.severity] - severityOrder[right.severity];
    return severityDifference || reasonTypeOrder[left.type] - reasonTypeOrder[right.type];
  });
}

function getWellnessReasons(entries: readonly WeeklyReviewWellness[]) {
  const reasons: WeeklyReviewReason[] = [];
  let hasData = false;

  entries.forEach((entry) => {
    const observedValues = [entry.sleep, entry.sleepQuality, entry.fatigue, entry.stress, entry.soreness, entry.motivation, entry.recovery, entry.mood]
      .map(readNumber)
      .filter((value): value is number => value !== null && value >= 1 && value <= 7);
    if (observedValues.length === 0) return;
    hasData = true;

    const explicitScaleMax = readNumber(entry.scaleMax);
    const scaleMax = explicitScaleMax === 5 || explicitScaleMax === 7
      ? explicitScaleMax
      : observedValues.some((value) => value > 5) ? 7 : 5;
    const lowLimit = 2;
    const highLimit = scaleMax === 7 ? 6 : 4;
    const watch = (label: string) => addReason(reasons, { type: "wellness", label, severity: "watch" });
    const sleep = readNumber(entry.sleepQuality) ?? readNumber(entry.sleep);
    const recovery = readNumber(entry.recovery);
    const motivation = readNumber(entry.motivation);
    const fatigue = readNumber(entry.fatigue);
    const stress = readNumber(entry.stress);
    const soreness = readNumber(entry.soreness);

    if (sleep !== null && sleep >= 1 && sleep <= lowLimit) watch("Sueño bajo esta semana");
    if (recovery !== null && recovery >= 1 && recovery <= lowLimit) watch("Recuperación baja esta semana");
    if (motivation !== null && motivation >= 1 && motivation <= lowLimit) watch("Motivación baja esta semana");
    if (fatigue !== null && fatigue >= highLimit && fatigue <= scaleMax) watch("Fatiga alta esta semana");
    if (stress !== null && stress >= highLimit && stress <= scaleMax) watch("Estrés alto esta semana");
    if (soreness !== null && soreness >= highLimit && soreness <= scaleMax) watch("Agujetas altas esta semana");
  });

  return { hasData, reasons };
}

function getSuggestedDecision(level: WeeklyReviewLevel, primaryReason?: WeeklyReviewReason) {
  if (level === "unknown") return "Completar datos de la semana";
  if (level === "stable") return "Mantener progresión";
  if (level === "priority") return "Ajustar o revisar la semana antes de progresar";

  switch (primaryReason?.type) {
    case "adherence": return "Revisar cumplimiento semanal";
    case "impact": return "Revisar distribución de carga";
    case "discomfort": return "Revisar tolerancia antes de progresar";
    case "wellness": return "Revisar recuperación antes de mantener la carga";
    case "compatibility": return "Revisar próxima sesión";
    default: return "Revisar datos de la semana";
  }
}

function createReview(
  level: WeeklyReviewLevel,
  confidence: WeeklyReviewConfidence,
  inputReasons: WeeklyReviewReason[],
  stats: WeeklyReviewStats
): WeeklyCoachReview {
  const reasons = sortReasons(inputReasons);
  const primaryReason = reasons[0];
  return {
    level,
    ...weeklyReviewCopy[level],
    reasons,
    primaryReason,
    suggestedDecision: getSuggestedDecision(level, primaryReason),
    confidence,
    stats
  };
}

export function getWeeklyCoachReview(input: WeeklyCoachReviewInput): WeeklyCoachReview {
  const allSessions = [...(input.sessions ?? [])];
  const weekSessions = selectWeekEntries(allSessions, input.referenceDate);
  const completedSessions = weekSessions.filter(isCompletedSession);
  const pendingSessions = weekSessions.length - completedSessions.length;
  const impacts = completedSessions.map((session) => getSessionImpact({
    ...session,
    sRPE: session.sRPE ?? session.srpe
  }));
  const stats: WeeklyReviewStats = {
    plannedSessions: weekSessions.length,
    completedSessions: completedSessions.length,
    pendingSessions,
    completionRate: weekSessions.length > 0 ? completedSessions.length / weekSessions.length : null,
    highImpactSessions: impacts.filter((impact) => impact.level === "high").length,
    moderateImpactSessions: impacts.filter((impact) => impact.level === "moderate").length,
    lowImpactSessions: impacts.filter((impact) => impact.level === "low").length,
    unknownImpactSessions: impacts.filter((impact) => impact.level === "unknown").length,
    discomfortSessions: completedSessions.filter((session) => session.discomfort?.hasDiscomfort === true).length
  };
  const reasons: WeeklyReviewReason[] = [];

  if (stats.plannedSessions === 0) {
    addReason(reasons, { type: "dataQuality", label: "Faltan registros de la semana", severity: "info" });
  } else if (stats.completionRate !== null && stats.plannedSessions >= 3) {
    if (stats.completionRate < 0.5) {
      addReason(reasons, { type: "adherence", label: "Baja adherencia semanal", severity: "priority" });
    } else if (stats.completionRate < 0.75) {
      addReason(reasons, { type: "adherence", label: "Adherencia semanal a revisar", severity: "watch" });
    }
  }
  if (stats.pendingSessions > 0) {
    addReason(reasons, { type: "adherence", label: "Sesiones pendientes esta semana", severity: "info" });
  }

  if (stats.highImpactSessions >= 2) {
    addReason(reasons, { type: "impact", label: "Impacto alto repetido esta semana", severity: "watch" });
  } else if (stats.highImpactSessions === 1) {
    addReason(reasons, { type: "impact", label: "Una sesión de impacto alto", severity: "info" });
  }

  if (stats.discomfortSessions >= 2) {
    addReason(reasons, { type: "discomfort", label: "Molestias repetidas esta semana", severity: "priority" });
  } else if (stats.discomfortSessions === 1) {
    addReason(reasons, { type: "discomfort", label: "Molestia registrada esta semana", severity: "watch" });
  }

  const embeddedWellness = weekSessions.flatMap((session) => session.wellness
    ? [{ date: session.date, ...session.wellness }]
    : []);
  const suppliedWellness = selectWeekEntries(input.wellness ?? [], input.referenceDate);
  const recentWellness = [...suppliedWellness, ...embeddedWellness];
  const wellness = getWellnessReasons(recentWellness);
  wellness.reasons.forEach((reason) => addReason(reasons, reason));
  if (!wellness.hasData && stats.plannedSessions > 0) {
    addReason(reasons, { type: "dataQuality", label: "Datos de wellness incompletos", severity: "info" });
  }

  const compatibilitySessions = input.nextSession
    ? weekSessions.filter((session) => session !== input.nextSession)
    : weekSessions;
  const compatibility = input.nextSession ? getNextSessionCompatibility({
    nextSession: input.nextSession,
    recentSessions: compatibilitySessions,
    recentWellness
  }) : null;
  if (compatibility?.level === "priority") {
    addReason(reasons, { type: "compatibility", label: "Próxima sesión requiere atención", severity: "priority" });
  } else if (compatibility?.level === "review") {
    addReason(reasons, { type: "compatibility", label: "Próxima sesión a revisar", severity: "watch" });
  }

  const substantiveWatchReasons = reasons.filter((reason) => reason.severity === "watch" && reason.type !== "dataQuality");
  const hasWellnessConcern = wellness.reasons.length > 0;
  const repeatedHighImpact = stats.highImpactSessions >= 2;
  const hasDiscomfort = stats.discomfortSessions > 0;
  const lowAdherence = stats.completionRate !== null && stats.plannedSessions >= 3 && stats.completionRate < 0.75;
  const compatibilityNeedsReview = compatibility?.level === "review" || compatibility?.level === "priority";
  const plannedSessionDemanding = compatibility?.reasons.some((reason) => reason.label === "Próxima sesión exigente") === true;
  const explicitPriority = reasons.some((reason) => reason.severity === "priority")
    || (hasDiscomfort && compatibilityNeedsReview)
    || (repeatedHighImpact && hasWellnessConcern)
    || (repeatedHighImpact && lowAdherence)
    || (lowAdherence && (plannedSessionDemanding || compatibilityNeedsReview))
    || substantiveWatchReasons.length >= 3;

  const knownImpactCount = stats.highImpactSessions + stats.moderateImpactSessions + stats.lowImpactSessions;
  const usefulSources = [stats.plannedSessions > 0, knownImpactCount > 0, wellness.hasData, Boolean(input.nextSession)]
    .filter(Boolean).length;
  const confidence: WeeklyReviewConfidence = usefulSources >= 3 ? "high" : usefulSources >= 2 ? "medium" : "low";
  const hasUsefulContext = stats.plannedSessions > 0 || wellness.hasData || Boolean(input.nextSession);

  if (!hasUsefulContext) return createReview("unknown", "low", reasons, stats);
  if (explicitPriority) return createReview("priority", confidence, reasons, stats);
  if (substantiveWatchReasons.length > 0) return createReview("review", confidence, reasons, stats);
  return createReview("stable", confidence, reasons, stats);
}

export function getWeeklyReviewStyle(level: WeeklyReviewLevel): WeeklyReviewStyle {
  switch (level) {
    case "stable":
      return {
        badgeClassName: "border border-line bg-mint text-moss",
        dotClassName: "bg-moss",
        borderClassName: "border-moss/30"
      };
    case "review":
      return {
        badgeClassName: "border border-clay/25 bg-wheat text-clay",
        dotClassName: "bg-clay",
        borderClassName: "border-clay/30"
      };
    case "priority":
      return {
        badgeClassName: "border border-clay/40 bg-coral/10 text-clay",
        dotClassName: "bg-coral",
        borderClassName: "border-clay/50"
      };
    case "unknown":
      return {
        badgeClassName: "border border-line bg-panel text-ink/70",
        dotClassName: "bg-ink/40",
        borderClassName: "border-line"
      };
  }
}
