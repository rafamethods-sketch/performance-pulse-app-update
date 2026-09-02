import { getPlannedSessionImpact, getSessionImpact } from "@/lib/session-impact";

export type SessionCompatibilityLevel = "compatible" | "review" | "priority" | "unknown";
export type SessionCompatibilityConfidence = "high" | "medium" | "low";
export type SessionCompatibilityReasonType = "plannedImpact" | "recentImpact" | "discomfort" | "wellness" | "adherence" | "deviation" | "dataQuality";
export type SessionCompatibilityReason = {
  type: SessionCompatibilityReasonType;
  label: string;
  severity: "info" | "watch" | "priority";
};

export type SessionCompatibility = {
  level: SessionCompatibilityLevel;
  label: string;
  description: string;
  reasons: SessionCompatibilityReason[];
  primaryReason?: SessionCompatibilityReason;
  suggestedAction: string;
  confidence: SessionCompatibilityConfidence;
};

export type SessionCompatibilityStyle = {
  badgeClassName: string;
  dotClassName: string;
  borderClassName: string;
};

type NumericInput = number | string | null;
type CompatibilityExercise = { plannedSets?: NumericInput; setDetails?: readonly unknown[] | null; sets?: NumericInput };
type CompatibilitySession = {
  actualDurationMinutes?: NumericInput;
  cardioPlan?: { targetDurationMinutes?: NumericInput; targetRpeMax?: NumericInput; targetRpeMin?: NumericInput } | null;
  completed?: boolean;
  date?: string | null;
  discomfort?: { hasDiscomfort?: boolean } | null;
  duration?: NumericInput;
  exercisePlan?: readonly CompatibilityExercise[] | null;
  exercises?: readonly CompatibilityExercise[] | null;
  finalRpe?: NumericInput;
  performedExercises?: readonly unknown[] | null;
  plannedDurationMinutes?: NumericInput;
  plannedExercises?: readonly CompatibilityExercise[] | null;
  rpe?: NumericInput;
  sRPE?: NumericInput;
  srpe?: NumericInput;
  status?: string | null;
  summary?: string | null;
  targetRpe?: NumericInput;
  type?: string | null;
};
type CompatibilityWellness = {
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

export type SessionCompatibilityInput = {
  nextSession?: CompatibilitySession | null;
  recentSessions?: readonly CompatibilitySession[] | null;
  recentWellness?: readonly CompatibilityWellness[] | null;
};

const compatibilityCopy: Record<SessionCompatibilityLevel, Pick<SessionCompatibility, "label" | "description">> = {
  compatible: { label: "Compatible", description: "La próxima sesión encaja con el contexto reciente disponible." },
  review: { label: "Conviene revisar", description: "Hay aspectos recientes que conviene revisar antes de mantener la sesión tal como está." },
  priority: { label: "Prioridad", description: "Hay varios aspectos relevantes antes de ejecutar o progresar la sesión." },
  unknown: { label: "Sin datos suficientes", description: "Faltan datos recientes para valorar la compatibilidad." }
};
const severityOrder = { priority: 0, watch: 1, info: 2 } as const;
const reasonTypeOrder: Record<SessionCompatibilityReasonType, number> = {
  discomfort: 0,
  wellness: 1,
  recentImpact: 2,
  plannedImpact: 3,
  deviation: 4,
  adherence: 5,
  dataQuality: 6
};

function readNumber(value: NumericInput | undefined) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readDate(value?: string | null) {
  if (!value) return null;
  const localized = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const parsed = localized
    ? new Date(Number(localized[3]), Number(localized[2]) - 1, Number(localized[1]))
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function selectRecentEntries<T extends { date?: string | null }>(entries: readonly T[]) {
  const datedEntries = entries
    .map((entry) => ({ date: readDate(entry.date), entry }))
    .filter((item): item is { date: Date; entry: T } => Boolean(item.date))
    .sort((left, right) => right.date.getTime() - left.date.getTime());
  if (datedEntries.length === 0) return entries.slice(0, 3);

  const now = new Date();
  const recentLimit = new Date(now);
  recentLimit.setDate(recentLimit.getDate() - 7);
  return datedEntries.filter(({ date }) => date <= now && date >= recentLimit).map(({ entry }) => entry);
}

function addReason(reasons: SessionCompatibilityReason[], reason: SessionCompatibilityReason) {
  if (!reasons.some((current) => current.label === reason.label)) reasons.push(reason);
}

function sortReasons(reasons: SessionCompatibilityReason[]) {
  return [...reasons].sort((left, right) => {
    const severityDifference = severityOrder[left.severity] - severityOrder[right.severity];
    return severityDifference || reasonTypeOrder[left.type] - reasonTypeOrder[right.type];
  });
}

function getWellnessSignals(entries: readonly CompatibilityWellness[]) {
  const reasons: SessionCompatibilityReason[] = [];
  let hasData = false;

  entries.forEach((entry) => {
    const observedValues = [entry.sleep, entry.sleepQuality, entry.fatigue, entry.stress, entry.soreness, entry.motivation, entry.recovery, entry.mood]
      .map(readNumber)
      .filter((value): value is number => value !== null && value >= 1 && value <= 7);
    if (observedValues.length > 0) hasData = true;
    const explicitScaleMax = readNumber(entry.scaleMax);
    const scaleMax = explicitScaleMax === 5 || explicitScaleMax === 7 ? explicitScaleMax : observedValues.some((value) => value > 5) ? 7 : 5;
    const lowLimit = 2;
    const highLimit = scaleMax === 7 ? 6 : 4;
    const values = {
      sleep: readNumber(entry.sleepQuality) ?? readNumber(entry.sleep),
      recovery: readNumber(entry.recovery),
      motivation: readNumber(entry.motivation),
      fatigue: readNumber(entry.fatigue),
      stress: readNumber(entry.stress),
      soreness: readNumber(entry.soreness)
    };
    const watch = (label: string) => addReason(reasons, { type: "wellness", label, severity: "watch" });

    if (values.sleep !== null && values.sleep >= 1 && values.sleep <= lowLimit) watch("Sueño bajo reciente");
    if (values.recovery !== null && values.recovery >= 1 && values.recovery <= lowLimit) watch("Recuperación baja reciente");
    if (values.motivation !== null && values.motivation >= 1 && values.motivation <= lowLimit) watch("Motivación baja reciente");
    if (values.fatigue !== null && values.fatigue >= highLimit && values.fatigue <= scaleMax) watch("Fatiga alta reciente");
    if (values.stress !== null && values.stress >= highLimit && values.stress <= scaleMax) watch("Estrés alto reciente");
    if (values.soreness !== null && values.soreness >= highLimit && values.soreness <= scaleMax) watch("Agujetas altas recientes");
  });

  return { hasData, reasons };
}

function isCompletedSession(session: CompatibilitySession) {
  if (session.completed === true) return true;
  return /completad|realizad|finished/i.test(session.status ?? "");
}

function hasCompletionState(session: CompatibilitySession) {
  return typeof session.completed === "boolean" || Boolean(session.status?.trim());
}

function getDeviationSignals(sessions: readonly CompatibilitySession[]) {
  const reasons: SessionCompatibilityReason[] = [];
  let hasData = false;
  let hasRelevantDeviation = false;

  sessions.filter(isCompletedSession).forEach((session) => {
    const targetRpe = readNumber(session.targetRpe) ?? readNumber(session.cardioPlan?.targetRpeMax);
    const actualRpe = readNumber(session.finalRpe) ?? readNumber(session.rpe);
    const plannedDuration = readNumber(session.plannedDurationMinutes) ?? readNumber(session.cardioPlan?.targetDurationMinutes);
    const actualDuration = readNumber(session.actualDurationMinutes) ?? readNumber(session.duration);
    const rpeDeviation = targetRpe !== null && actualRpe !== null && actualRpe >= targetRpe + 2;
    const durationDeviation = plannedDuration !== null && plannedDuration > 0 && actualDuration !== null
      && actualDuration >= plannedDuration * 1.25 && actualDuration - plannedDuration >= 10;
    if ((targetRpe !== null && actualRpe !== null) || (plannedDuration !== null && actualDuration !== null)) hasData = true;
    if (rpeDeviation) addReason(reasons, { type: "deviation", label: "RPE real superior al objetivo", severity: "watch" });
    if (durationDeviation) addReason(reasons, { type: "deviation", label: "Duración real superior a la prevista", severity: "watch" });
    if (rpeDeviation || durationDeviation) hasRelevantDeviation = true;

    const realImpact = getSessionImpact({ ...session, sRPE: session.sRPE ?? session.srpe });
    const plannedImpact = getPlannedSessionImpact(session);
    if (realImpact.level === "high" && plannedImpact.level !== "high" && plannedImpact.level !== "unknown") {
      hasRelevantDeviation = true;
      addReason(reasons, { type: "deviation", label: "Sesión reciente más exigente de lo previsto", severity: "watch" });
    }
  });

  return { hasData, hasRelevantDeviation, reasons };
}

function getSuggestedAction(level: SessionCompatibilityLevel, reasons: readonly SessionCompatibilityReason[]) {
  if (level === "unknown") return "Completar datos antes de interpretar";
  if (level === "compatible") return "Mantener sesión";
  const hasDiscomfort = reasons.some((reason) => reason.type === "discomfort");
  const hasWellness = reasons.some((reason) => reason.type === "wellness");
  const hasRecentImpact = reasons.some((reason) => reason.type === "recentImpact");
  if (level === "priority") return "Ajustar o revisar la próxima sesión";
  if (hasDiscomfort) return "Revisar tolerancia antes de entrenar";
  if (hasWellness) return "Revisar recuperación antes de mantener la carga";
  if (hasRecentImpact) return "Revisar carga de la próxima sesión";
  return "Revisar próxima sesión";
}

function createCompatibility(level: SessionCompatibilityLevel, confidence: SessionCompatibilityConfidence, inputReasons: SessionCompatibilityReason[]) {
  const reasons = sortReasons(inputReasons);
  return {
    level,
    ...compatibilityCopy[level],
    reasons,
    primaryReason: reasons[0],
    suggestedAction: getSuggestedAction(level, reasons),
    confidence
  };
}

export function getNextSessionCompatibility(input: SessionCompatibilityInput): SessionCompatibility {
  if (!input.nextSession) {
    return createCompatibility("unknown", "low", [{ type: "dataQuality", label: "No hay próxima sesión planificada", severity: "watch" }]);
  }

  const reasons: SessionCompatibilityReason[] = [];
  const plannedImpact = getPlannedSessionImpact(input.nextSession);
  const recentSessions = selectRecentEntries(input.recentSessions ?? []);
  const recentWellness = selectRecentEntries(input.recentWellness ?? []);
  const completedRecentSessions = recentSessions.filter(isCompletedSession);
  const recentImpacts = completedRecentSessions.map((session) => getSessionImpact({ ...session, sRPE: session.sRPE ?? session.srpe }));
  const recentHighCount = recentImpacts.filter((impact) => impact.level === "high").length;
  const elevatedRecentCount = recentImpacts.filter((impact) => impact.level === "high" || impact.level === "moderate").length;
  const discomfortCount = completedRecentSessions.filter((session) => session.discomfort?.hasDiscomfort === true).length;
  const wellness = getWellnessSignals(recentWellness);
  const deviation = getDeviationSignals(recentSessions);
  const sessionsWithCompletionState = recentSessions.filter(hasCompletionState);
  const incompleteCount = sessionsWithCompletionState.filter((session) => !isCompletedSession(session)).length;
  const usefulContext = new Set<string>();

  if (plannedImpact.level === "high") addReason(reasons, { type: "plannedImpact", label: "Próxima sesión exigente", severity: "info" });
  if (plannedImpact.level === "unknown") addReason(reasons, { type: "plannedImpact", label: "Faltan datos de la próxima sesión", severity: "watch" });
  if (recentImpacts.some((impact) => impact.level !== "unknown")) usefulContext.add("sessions");
  if (recentHighCount === 1) addReason(reasons, { type: "recentImpact", label: "Impacto alto reciente", severity: "watch" });
  if (recentHighCount >= 2) addReason(reasons, { type: "recentImpact", label: "Impacto alto repetido", severity: "watch" });
  else if (elevatedRecentCount >= 3) addReason(reasons, { type: "recentImpact", label: "Carga reciente elevada", severity: "watch" });

  if (discomfortCount > 0) usefulContext.add("discomfort");
  if (discomfortCount === 1) addReason(reasons, { type: "discomfort", label: "Molestia reciente", severity: "watch" });
  if (discomfortCount >= 2) addReason(reasons, { type: "discomfort", label: "Molestia repetida", severity: "priority" });

  if (wellness.hasData) usefulContext.add("wellness");
  wellness.reasons.forEach((reason) => addReason(reasons, reason));
  if (sessionsWithCompletionState.length > 0) usefulContext.add("adherence");
  if (incompleteCount === 1) addReason(reasons, { type: "adherence", label: "Sesión reciente no completada", severity: "watch" });
  if (incompleteCount >= 2) addReason(reasons, { type: "adherence", label: "Baja adherencia reciente", severity: "watch" });
  if (deviation.hasData) usefulContext.add("deviation");
  deviation.reasons.forEach((reason) => addReason(reasons, reason));

  const confidence: SessionCompatibilityConfidence = plannedImpact.level !== "unknown" && usefulContext.size >= 2
    ? "high"
    : plannedImpact.level !== "unknown" && usefulContext.size >= 1 ? "medium" : "low";
  if (confidence === "low") {
    addReason(reasons, {
      type: "dataQuality",
      label: recentSessions.length === 0 ? "Faltan registros recientes" : !wellness.hasData ? "Faltan datos de wellness" : "Datos recientes incompletos",
      severity: "watch"
    });
  }

  const hasWellnessConcern = wellness.reasons.length > 0;
  const hasDiscomfort = discomfortCount > 0;
  const plannedIsElevated = plannedImpact.level === "moderate" || plannedImpact.level === "high";
  const substantiveWatchCount = reasons.filter((reason) => reason.severity === "watch" && reason.type !== "dataQuality" && reason.type !== "plannedImpact").length;
  const explicitPriority = reasons.some((reason) => reason.severity === "priority")
    || (plannedImpact.level === "high" && hasDiscomfort)
    || (plannedImpact.level === "high" && recentHighCount > 0 && hasWellnessConcern)
    || (recentHighCount >= 2 && hasWellnessConcern)
    || (deviation.hasRelevantDeviation && hasDiscomfort)
    || (hasDiscomfort && hasWellnessConcern && plannedIsElevated)
    || (incompleteCount >= 2 && plannedImpact.level === "high")
    || substantiveWatchCount >= 3;

  const hasUsefulRecentContext = usefulContext.size > 0;
  if (plannedImpact.level === "unknown" && !hasUsefulRecentContext) return createCompatibility("unknown", confidence, reasons);
  if (explicitPriority) return createCompatibility("priority", confidence, reasons);
  if (reasons.some((reason) => reason.severity === "watch")) return createCompatibility("review", confidence, reasons);
  return createCompatibility("compatible", confidence, reasons);
}

export function getSessionCompatibilityStyle(level: SessionCompatibilityLevel): SessionCompatibilityStyle {
  switch (level) {
    case "compatible": return { badgeClassName: "border border-line bg-mint text-moss", dotClassName: "bg-moss", borderClassName: "border-moss/30" };
    case "review": return { badgeClassName: "border border-clay/25 bg-wheat text-clay", dotClassName: "bg-clay", borderClassName: "border-clay/30" };
    case "priority": return { badgeClassName: "border border-clay/40 bg-coral/10 text-clay", dotClassName: "bg-coral", borderClassName: "border-clay/50" };
    case "unknown": return { badgeClassName: "border border-line bg-panel text-ink/70", dotClassName: "bg-ink/40", borderClassName: "border-line" };
  }
}
