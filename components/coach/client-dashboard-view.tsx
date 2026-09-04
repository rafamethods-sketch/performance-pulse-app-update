"use client";

import type { SheetId } from "@/lib/data";
import { getPlannedSessionImpact, getSessionImpactStyle } from "@/lib/session-impact";
import { getNextSessionCompatibility, getSessionCompatibilityStyle } from "@/lib/session-compatibility";
import { exerciseLibrary } from "@/lib/exercises";
import {
  acwrRanges,
  calculateACWR,
  calculateHooperIndex,
  calculateMonotony,
  calculateSessionLoad,
  calculateStrain,
  calculateWeeklyLoad,
  getMetricStatus,
  monotonyRanges,
  strainRanges
} from "@/lib/client-metrics";
import {
  calculateWeeklyExternalLoad,
  calculateWeeklyExternalLoadByPattern,
  calculateWeeklyMuscleSets,
  type SessionExerciseInput,
  type TrainingSessionInput
} from "@/lib/session-load";
import {
  getWeeklyCoachReview,
  getWeeklyReviewStyle,
  type WeeklyCoachReview,
  type WeeklyReviewSession
} from "@/lib/weekly-review";

type DashboardSessionRecord = TrainingSessionInput & {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: {
    comment?: string;
    rating?: "bad" | "good" | string;
  } | "down" | "up" | null;
  cardioResult?: {
    durationMinutes?: number | string | null;
    distanceMeters?: number | string | null;
    timeInZones?: Record<string, number | undefined>;
  };
  cardioPlan?: {
    targetDurationMinutes?: number | string | null;
    targetRpeMax?: number | string | null;
    targetRpeMin?: number | string | null;
  } | null;
  completed?: boolean;
  date: string;
  discomfort?: {
    hasDiscomfort?: boolean;
    notes?: string | null;
  };
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: SessionExerciseInput[];
  plannedExercises?: SessionExerciseInput[];
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  summary: string;
  targetRpe?: number | string | null;
  type: string;
  wellness?: {
    calm?: number;
    energy?: number;
    fatigue?: number;
    motivation?: number;
    recovery?: number;
    sleep?: number;
    soreness?: number;
    stress?: number;
  };
};

type CoachClient = {
  chronicLoad: number;
  coachNotes: string;
  dailyLoads: number[];
  goalType: string;
  hooper: {
    fatigue: number;
    mood?: number;
    sleep: number;
    soreness: number;
    stress: number;
  };
  id: string;
  injuries?: string | null;
  level: string;
  modality: string;
  name: string;
  nextEvent: string;
  assessmentPreferences?: {
    favoriteTests?: string[];
    reassessmentDates?: Record<string, string>;
  };
  assessments?: Array<{
    category?: string;
    date?: string;
    name?: string;
    testName?: string;
  }>;
  planning: {
    currentBlock: string;
    currentWeek: string;
    distribution: string;
    eventDate?: string;
    nextSessions?: string[];
    primaryGoal: string;
    secondaryGoal: string;
  };
  readiness: number;
  sessionRecords: DashboardSessionRecord[];
  status: string;
};

type ClientDashboardViewProps = {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
};

function getDashboardMonotonyStatus(value: number) {
  return getMetricStatus(value, monotonyRanges);
}

function getDashboardAcwrStatus(value: number) {
  return getMetricStatus(value, acwrRanges);
}

function getDashboardStrainStatus(value: number) {
  return getMetricStatus(value, strainRanges);
}

function getDashboardHooperStatus(value: number) {
  if (value >= 12) return "Alto";
  if (value >= 9) return "Vigilar";
  return "Controlado";
}

function getDashboardLoadData(client: CoachClient) {
  const weeklyLoad = calculateWeeklyLoad(
    client.sessionRecords.map((session) => ({
      duration: getDashboardNumber(session.actualDurationMinutes ?? session.duration) ?? 0,
      rpe: getDashboardNumber(session.finalRpe ?? session.rpe) ?? 0
    }))
  );
  const monotony = calculateMonotony(client.dailyLoads);
  const strain = calculateStrain(weeklyLoad, monotony);
  const acwr = calculateACWR(weeklyLoad, client.chronicLoad);
  const hooper = calculateHooperIndex(client.hooper);

  return {
    acwr,
    acwrStatus: getDashboardAcwrStatus(acwr),
    hooper,
    hooperStatus: getDashboardHooperStatus(hooper),
    monotony,
    monotonyStatus: getDashboardMonotonyStatus(monotony),
    strain,
    strainStatus: getDashboardStrainStatus(strain),
    weeklyLoad
  };
}

function hasDashboardValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function getDashboardNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getDashboardSrpe(session: DashboardSessionRecord) {
  const explicitSrpe = getDashboardNumber(session.sRPE ?? session.srpe);
  if (explicitSrpe !== null) return explicitSrpe;

  const duration = getDashboardNumber(session.actualDurationMinutes ?? session.duration);
  const rpe = getDashboardNumber(session.finalRpe ?? session.rpe);
  if (duration === null || rpe === null || duration <= 0 || rpe <= 0) return null;

  return calculateSessionLoad(rpe, duration);
}

function getDashboardQuickFeedbackRating(feedback: DashboardSessionRecord["athleteQuickFeedback"]) {
  if (!feedback) return null;
  if (typeof feedback === "string") return feedback === "down" ? "bad" : feedback === "up" ? "good" : feedback;
  return feedback.rating ?? null;
}

function hasDashboardRealSessionData(session: DashboardSessionRecord) {
  return Boolean(
    session.completed ||
    hasDashboardValue(session.duration) ||
    hasDashboardValue(session.rpe) ||
    hasDashboardValue(session.finalRpe) ||
    hasDashboardValue(session.actualDurationMinutes) ||
    hasDashboardValue(session.sRPE) ||
    hasDashboardValue(session.srpe) ||
    hasDashboardValue(session.finalNotes) ||
    hasDashboardValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function isDashboardPendingReview(session: DashboardSessionRecord) {
  if (session.reviewStatus === "reviewed") return false;
  return hasDashboardRealSessionData(session);
}

function hasDashboardExerciseData(session: DashboardSessionRecord) {
  return Boolean(
    (session.performedExercises?.length ?? 0) > 0 ||
    (session.plannedExercises?.length ?? 0) > 0 ||
    (session.exercises?.length ?? 0) > 0
  );
}

function getDashboardSessionInput(session: DashboardSessionRecord): TrainingSessionInput {
  return {
    completed: session.completed,
    exercises: session.exercises,
    performedExercises: session.performedExercises,
    plannedExercises: session.plannedExercises
  };
}

function getDashboardEventDays(client: CoachClient) {
  const eventDate = client.planning.eventDate ?? client.nextEvent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];
  if (!eventDate || eventDate === "sin fecha") return null;

  const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const slashMatch = eventDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const parsed = dateMatch
    ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
    : slashMatch
      ? new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
      : null;

  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return Math.ceil((parsed.getTime() - today.getTime()) / 86_400_000);
}

function getDashboardDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDashboardDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfDashboardWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  start.setDate(start.getDate() - ((day + 6) % 7));
  return start;
}

function getDashboardDayDiff(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - target.getTime()) / 86_400_000);
}

function formatDashboardDate(value?: string | null) {
  const date = getDashboardDate(value);
  if (!date) return "Sin fecha";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

function getDashboardSessionKind(session: DashboardSessionRecord): "activeRecovery" | "concurrent" | "resistance" | "strength" {
  const label = `${session.type ?? ""} ${session.summary ?? ""}`.toLowerCase();
  if (label.includes("descanso") || label.includes("recovery") || label.includes("recuperaci")) return "activeRecovery";
  if (label.includes("concurrent") || label.includes("mixt")) return "concurrent";
  if (label.includes("resistencia") || label.includes("cardio") || label.includes("z2") || label.includes("series")) return "resistance";
  return "strength";
}

function getDashboardKindLabel(kind: ReturnType<typeof getDashboardSessionKind>) {
  if (kind === "activeRecovery") return "Descanso activo";
  if (kind === "concurrent") return "Concurrente";
  if (kind === "resistance") return "Resistencia";
  return "Fuerza";
}

function getDashboardKindClass(kind: ReturnType<typeof getDashboardSessionKind>) {
  if (kind === "activeRecovery") return "border-moss/25 bg-mint text-moss";
  if (kind === "concurrent") return "border-clay/25 bg-clay/10 text-clay";
  if (kind === "resistance") return "border-steel/25 bg-steel/10 text-steel";
  return "border-ink/15 bg-panel text-ink";
}

function getDashboardReadiness(session?: DashboardSessionRecord | null) {
  const wellness = session?.wellness;
  if (!wellness) return null;
  const energy = wellness.energy ?? (wellness.fatigue ? Math.max(1, 6 - wellness.fatigue) : null);
  const recovery = wellness.recovery ?? (wellness.soreness ? Math.max(1, 6 - wellness.soreness) : null);
  const calm = wellness.calm ?? (wellness.stress ? Math.max(1, 6 - wellness.stress) : null);
  const values = [wellness.sleep, energy, recovery, calm, wellness.motivation].filter((value): value is number => typeof value === "number" && value > 0);
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getDashboardWeeklySeries(sessions: DashboardSessionRecord[]) {
  const weeklyLoads = new Map<string, { label: string; load: number; start: Date }>();
  sessions.forEach((session) => {
    const date = getDashboardDate(session.date);
    const srpe = getDashboardSrpe(session);
    if (!date || srpe === null) return;
    const start = getStartOfDashboardWeek(date);
    const key = getDashboardDateKey(start);
    const current = weeklyLoads.get(key) ?? { label: formatDashboardDate(key), load: 0, start };
    weeklyLoads.set(key, { ...current, load: current.load + srpe });
  });
  return [...weeklyLoads.values()].sort((a, b) => a.start.getTime() - b.start.getTime()).slice(-6);
}

function getDashboardDailySeries(sessions: DashboardSessionRecord[]) {
  return sessions
    .map((session) => {
      const date = getDashboardDate(session.date);
      if (!date) return null;
      return {
        date,
        discomfort: Boolean(session.discomfort?.hasDiscomfort || session.discomfort?.notes),
        label: formatDashboardDate(session.date),
        readiness: getDashboardReadiness(session),
        srpe: getDashboardSrpe(session) ?? 0
      };
    })
    .filter((entry): entry is { date: Date; discomfort: boolean; label: string; readiness: number | null; srpe: number } => Boolean(entry))
    .filter((entry) => getDashboardDayDiff(entry.date) <= 13)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getCurrentDashboardWeekDailyLoads(sessions: DashboardSessionRecord[]) {
  const weekStart = getStartOfDashboardWeek(new Date());
  const loads = Array.from({ length: 7 }, () => 0);

  sessions.forEach((session) => {
    const date = getDashboardDate(session.date);
    const srpe = getDashboardSrpe(session);
    if (!date || srpe === null) return;
    const dayDiff = Math.floor((date.getTime() - weekStart.getTime()) / 86_400_000);
    if (dayDiff < 0 || dayDiff > 6) return;
    loads[dayDiff] += srpe;
  });

  return loads;
}

function getDashboardMean(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getDashboardStandardDeviation(values: number[]) {
  const mean = getDashboardMean(values);
  if (mean === null || values.length === 0) return null;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function formatDashboardNumber(value: number, suffix = "") {
  return `${Math.round(value).toLocaleString("es-ES")}${suffix}`;
}

function getClientDashboardData(client: CoachClient, loadData: ReturnType<typeof getDashboardLoadData>) {
  const sessions = (client.sessionRecords ?? []) as DashboardSessionRecord[];
  const trainingSessions = sessions.map(getDashboardSessionInput);
  const sessionsWithSrpe = sessions
    .map((session) => ({ session, srpe: getDashboardSrpe(session) }))
    .filter((entry): entry is { session: DashboardSessionRecord; srpe: number } => entry.srpe !== null);
  const hasExerciseData = sessions.some(hasDashboardExerciseData);
  const weeklyExternalLoad = hasExerciseData
    ? calculateWeeklyExternalLoad(trainingSessions, exerciseLibrary)
    : null;
  const loadByPattern = hasExerciseData
    ? calculateWeeklyExternalLoadByPattern(trainingSessions, exerciseLibrary)
    : {};
  const muscleSets = hasExerciseData
    ? calculateWeeklyMuscleSets(trainingSessions, exerciseLibrary)
    : {};
  const plannedSessions = client.planning.nextSessions?.length ?? 0;
  const completedSessions = sessions.filter(hasDashboardRealSessionData).length;
  const adherencePercent = plannedSessions > 0
    ? Math.min(100, Math.round((completedSessions / plannedSessions) * 100))
    : null;
  const pendingReviews = sessions.filter(isDashboardPendingReview).length;
  const latestSession = [...sessions].reverse().find(hasDashboardRealSessionData) ?? sessions.at(-1) ?? null;
  const latestRpe = latestSession ? getDashboardNumber(latestSession.finalRpe ?? latestSession.rpe) : null;
  const latestReadiness = getDashboardReadiness(latestSession);
  const latestSleep = latestSession?.wellness?.sleep ?? null;
  const eventDays = getDashboardEventDays(client);
  const strongestPattern = Object.entries(loadByPattern).sort(([, a], [, b]) => b - a)[0] ?? null;
  const strongestMuscle = Object.entries(muscleSets).sort(([, a], [, b]) => b - a)[0] ?? null;
  const weeklySeries = getDashboardWeeklySeries(sessions);
  const dailySeries = getDashboardDailySeries(sessions);
  const currentWeekLoad = weeklySeries.at(-1)?.load ?? 0;
  const previousWeekLoad = weeklySeries.at(-2)?.load ?? 0;
  const weeklyChangePct = previousWeekLoad > 0
    ? Math.round(((currentWeekLoad - previousWeekLoad) / previousWeekLoad) * 100)
    : null;
  const weeklyChangeLabel = currentWeekLoad <= 0 || previousWeekLoad <= 0
    ? "Datos insuficientes"
    : weeklyChangePct === null
      ? "Datos insuficientes"
      : weeklyChangePct < -10
        ? "Descarga"
        : weeklyChangePct <= 10
          ? "Estable"
          : weeklyChangePct <= 25
            ? "Subida suave"
            : "Subida alta";
  const weeklyAverage4 = weeklySeries.length > 0
    ? weeklySeries.slice(-4).reduce((total, entry) => total + entry.load, 0) / Math.min(4, weeklySeries.length)
    : 0;
  const previousWeeklyLoads = weeklySeries.slice(0, -1).slice(-4).map((entry) => entry.load).filter((load) => load > 0);
  const habitualLoad = previousWeeklyLoads.length >= 3 ? getDashboardMean(previousWeeklyLoads) : null;
  const recentHabitualRatio = habitualLoad && habitualLoad > 0 && currentWeekLoad > 0 ? currentWeekLoad / habitualLoad : null;
  const recentHabitualLabel = recentHabitualRatio === null
    ? "Datos insuficientes"
    : recentHabitualRatio < 0.8
      ? "Inferior a habitual"
      : recentHabitualRatio <= 1.2
        ? "Similar a habitual"
        : recentHabitualRatio <= 1.5
          ? "Superior a habitual"
          : "Muy superior a habitual";
  const currentWeekDailyLoads = getCurrentDashboardWeekDailyLoads(sessions);
  const currentWeekDaysWithLoad = currentWeekDailyLoads.filter((load) => load > 0).length;
  const dailyMean = getDashboardMean(currentWeekDailyLoads);
  const dailyDeviation = getDashboardStandardDeviation(currentWeekDailyLoads);
  const monotonyValue = currentWeekDaysWithLoad >= 3 && dailyMean !== null && dailyDeviation !== null && dailyDeviation > 0
    ? dailyMean / dailyDeviation
    : null;
  const monotonyLabel = currentWeekDaysWithLoad < 3
    ? "Datos insuficientes"
    : monotonyValue === null
      ? "Variabilidad muy baja"
      : monotonyValue >= 2
        ? "A vigilar"
        : monotonyValue >= 1.5
          ? "Variabilidad baja"
          : "Distribución estable";
  const strainValue = monotonyValue !== null && currentWeekLoad > 0 ? currentWeekLoad * monotonyValue : null;
  const strainLabel = strainValue === null
    ? "Datos insuficientes"
    : strainValue >= 6000 || (currentWeekLoad >= 2200 && (monotonyValue ?? 0) >= 2)
      ? "A vigilar"
      : strainValue >= 3500
        ? "Alto"
        : strainValue >= 1800
          ? "Moderado"
          : "Bajo";
  const adherenceLabel = adherencePercent === null
    ? "Datos insuficientes"
    : adherencePercent >= 85
      ? "Alto"
      : adherencePercent >= 65
        ? "Medio"
        : "Bajo";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recentSessions = sessions.filter((session) => {
    const date = getDashboardDate(session.date);
    const diff = date ? getDashboardDayDiff(date) : null;
    return diff !== null && diff >= 0 && diff <= 6;
  });
  const recentDiscomfort = sessions.filter((session) => {
    const date = getDashboardDate(session.date);
    return date && getDashboardDayDiff(date) <= 14 && Boolean(session.discomfort?.hasDiscomfort || session.discomfort?.notes);
  });
  const negativeFeedback = sessions.filter((session) => {
    const date = getDashboardDate(session.date);
    return date && getDashboardDayDiff(date) <= 14 && getDashboardQuickFeedbackRating(session.athleteQuickFeedback) === "bad";
  });
  const reassessmentDates = Object.values(client.assessmentPreferences?.reassessmentDates ?? {})
    .map(getDashboardDate)
    .filter((date): date is Date => Boolean(date));
  const dueReassessments = reassessmentDates.filter((date) => {
    const diff = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
    return diff <= 14;
  });
  const sessionDistribution = recentSessions.reduce<Record<ReturnType<typeof getDashboardSessionKind>, { count: number; load: number }>>(
    (distribution, session) => {
      const kind = getDashboardSessionKind(session);
      distribution[kind].count += 1;
      distribution[kind].load += getDashboardSrpe(session) ?? 0;
      return distribution;
    },
    {
      activeRecovery: { count: 0, load: 0 },
      concurrent: { count: 0, load: 0 },
      resistance: { count: 0, load: 0 },
      strength: { count: 0, load: 0 }
    }
  );
  const alerts: string[] = [];
  const watchSignals: Array<{ action: SheetId; label: string; meta: string; tone: "calm" | "warning" | "danger" }> = [];

  const addWatchSignal = (
    label: string,
    meta: string,
    action: SheetId,
    tone: "calm" | "warning" | "danger" = "warning"
  ) => {
    if (watchSignals.some((signal) => signal.label === label)) return;
    watchSignals.push({ action, label, meta, tone });
  };

  if (latestRpe !== null && latestRpe >= 8) {
    alerts.push("Última sesión con RPE alto. Revisar recuperación.");
    addWatchSignal("RPE final alto", `Último registro: RPE ${latestRpe}`, "training", "warning");
  }
  if (loadData.weeklyLoad >= 2200) {
    alerts.push("sRPE semanal alto. Revisar distribución de carga.");
    addWatchSignal("Carga semanal elevada", formatDashboardNumber(loadData.weeklyLoad, " UA"), "planning", "warning");
  }
  if (weeklyChangePct !== null && weeklyChangePct >= 35) {
    alerts.push(`Aumento semanal de carga del ${weeklyChangePct}%. Revisar progresión.`);
    addWatchSignal("Subida de carga semanal", `+${weeklyChangePct}% vs semana previa`, "planning", "warning");
  }
  if (latestReadiness !== null && latestReadiness < 3) {
    alerts.push("Readiness reciente bajo. Revisar bienestar antes de progresar.");
    addWatchSignal("Readiness bajo", `${latestReadiness.toFixed(1)} / 5`, "clientWellness", "danger");
  }
  if (typeof latestSleep === "number" && latestSleep < 3) {
    addWatchSignal("Sueño bajo", `${latestSleep} / 5 en el último registro`, "clientWellness", "warning");
  }
  if (monotonyLabel === "A vigilar" || monotonyLabel === "Variabilidad baja" || monotonyLabel === "Variabilidad muy baja") {
    addWatchSignal("Variabilidad semanal baja", monotonyValue !== null ? `Monotony ${monotonyValue.toFixed(2)}` : monotonyLabel, "planning", "warning");
  }
  if (strainLabel === "A vigilar" || recentHabitualLabel === "Muy superior a habitual") {
    addWatchSignal(
      strainLabel === "A vigilar" ? "Estrés semanal elevado" : "Carga reciente superior a la habitual",
      strainLabel === "A vigilar" && strainValue !== null ? formatDashboardNumber(strainValue) : recentHabitualLabel,
      "planning",
      "warning"
    );
  }
  if (strongestPattern && weeklyExternalLoad && strongestPattern[1] / weeklyExternalLoad >= 0.55) {
    alerts.push(`Carga concentrada en ${strongestPattern[0]}. Revisar distribución.`);
    addWatchSignal("Carga concentrada", strongestPattern[0], "planning", "warning");
  }
  if (strongestMuscle && Object.values(muscleSets).reduce((total, value) => total + value, 0) > 0) {
    const totalMuscleSets = Object.values(muscleSets).reduce((total, value) => total + value, 0);
    if (strongestMuscle[1] / totalMuscleSets >= 0.35) {
      alerts.push(`Fatiga concentrada en ${strongestMuscle[0]}. Vigilar tolerancia.`);
      addWatchSignal("Fatiga concentrada", strongestMuscle[0], "training", "warning");
    }
  }
  if (adherencePercent !== null && adherencePercent < 70) {
    alerts.push("Adherencia baja. Revisar disponibilidad o ajuste semanal.");
    addWatchSignal("Adherencia baja", `${adherencePercent}%`, "training", "warning");
  }
  if (pendingReviews > 0) {
    alerts.push("Hay sesiones pendientes de revisar.");
    addWatchSignal("Sesiones pendientes", `${pendingReviews} por revisar`, "training", "calm");
  }
  if (recentDiscomfort.length > 0) {
    addWatchSignal("Molestias recientes", `${recentDiscomfort.length} registro(s) en 14 días`, "clientWellness", "warning");
  }
  if (negativeFeedback.length > 0) {
    addWatchSignal("Feedback negativo", `${negativeFeedback.length} respuesta(s) recientes`, "training", "warning");
  }
  if (dueReassessments.length > 0) {
    addWatchSignal("Reevaluación próxima", `${dueReassessments.length} valoración(es)`, "assessments", "calm");
  }
  if (client.injuries && !client.injuries.toLowerCase().includes("sin lesiones")) {
    alerts.push("Lesiones o limitaciones registradas. Revisar antes de progresar.");
    addWatchSignal("Limitaciones registradas", client.injuries, "management", "warning");
  }
  if (eventDays !== null && eventDays >= 0 && eventDays <= 14) {
    alerts.push("Evento próximo: ajustar carga si procede.");
    addWatchSignal("Evento próximo", `${eventDays} día(s)`, "planning", "calm");
  }

  const severeSignals = [
    weeklyChangePct !== null && weeklyChangePct >= 50,
    latestReadiness !== null && latestReadiness < 2.5,
    recentDiscomfort.length >= 2
  ].filter(Boolean).length;
  const cautionSignals = [
    latestRpe !== null && latestRpe >= 8,
    loadData.weeklyLoad >= 2200,
    weeklyChangePct !== null && weeklyChangePct >= 25,
    latestReadiness !== null && latestReadiness < 3,
    typeof latestSleep === "number" && latestSleep < 3,
    pendingReviews > 0,
    adherencePercent !== null && adherencePercent < 70,
    negativeFeedback.length > 0,
    dueReassessments.length > 0
  ].filter(Boolean).length;
  const generalStatus = sessions.length === 0
    ? "Sin datos suficientes"
    : severeSignals > 0
      ? "Descargar / revisar"
      : cautionSignals > 0
        ? "A vigilar"
        : latestReadiness !== null && latestReadiness >= 4 && loadData.weeklyLoad > 0
          ? "Preparado"
          : "Estable";
  const decisionText = generalStatus === "Preparado"
    ? "Buena disponibilidad para progresar con prudencia."
    : generalStatus === "Estable"
      ? "Semana estable. Mantener y revisar respuesta."
      : generalStatus === "A vigilar"
        ? "Mantener carga y revisar señales antes de progresar."
        : generalStatus === "Descargar / revisar"
          ? "Valorar descarga o ajuste de la semana."
          : "Aún faltan registros para orientar la decisión.";

  return {
    adherencePercent,
    alerts,
    completedSessions,
    currentWeekLoad,
    dailySeries,
    decisionText,
    generalStatus,
    hasExerciseData,
    latestReadiness,
    loadByPattern,
    muscleSets,
    pendingReviews,
    plannedSessions,
    previousWeekLoad,
    recentSessions,
    sessionDistribution,
    sessions,
    sessionsWithSrpe,
    strongestMuscle,
    strongestPattern,
    watchSignals: watchSignals.slice(0, 6),
    loadControlIndicators: {
      adherenceLabel,
      currentWeekDaysWithLoad,
      currentWeekDailyLoads,
      monotonyLabel,
      monotonyValue,
      recentHabitualLabel,
      recentHabitualRatio,
      strainLabel,
      strainValue,
      weeklyChangeLabel
    },
    weeklyAverage4,
    weeklyChangePct,
    weeklyExternalLoad,
    weeklySeries
  };
}

export function ClientDashboardView({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: ClientDashboardViewProps) {
  const loadData = getDashboardLoadData(client);
  const dashboardData = getClientDashboardData(client, loadData);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextSession = client.sessionRecords
    .map((session) => ({ date: getDashboardDate(session.date), session }))
    .filter((entry) => entry.date && entry.date >= today && !hasDashboardRealSessionData(entry.session))
    .sort((left, right) => (left.date?.getTime() ?? 0) - (right.date?.getTime() ?? 0))[0]?.session ?? null;
  const weeklyReview = getWeeklyCoachReview({
    nextSession: nextSession as WeeklyReviewSession | null,
    referenceDate: today,
    sessions: client.sessionRecords as WeeklyReviewSession[]
  });
  const plannedImpact = nextSession ? getPlannedSessionImpact(nextSession as WeeklyReviewSession) : null;
  const plannedImpactStyle = plannedImpact ? getSessionImpactStyle(plannedImpact.level) : null;
  const recentSessions = client.sessionRecords.filter((session) => session !== nextSession);
  const compatibility = nextSession ? getNextSessionCompatibility({
    nextSession: nextSession as WeeklyReviewSession,
    recentSessions: recentSessions as WeeklyReviewSession[],
    recentWellness: recentSessions.filter((session) => session.wellness).map((session) => ({
      ...session.wellness,
      date: session.date
    }))
  }) : null;
  const compatibilityStyle = compatibility ? getSessionCompatibilityStyle(compatibility.level) : null;

  return (
    <div className="mt-6 grid gap-5">
      <ClientHeader client={client} onBack={onBack} onOpenClientSheet={onOpenClientSheet} onOpenDetails={onOpenDetails} />
      <WeeklyDecisionBlock review={weeklyReview} />
      <section className="coach-surface min-w-0 rounded-md p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink">Próxima sesión</h3>
            <p className="mt-1 text-sm text-ink/55">Demanda prevista y contexto reciente, con lecturas separadas.</p>
          </div>
          <button className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink" onClick={() => onOpenClientSheet(client.id, "planning")} type="button">
            Ver planificación
          </button>
        </div>
        {nextSession ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-md border border-line bg-panel/35 p-3">
              <p className="text-xs font-medium text-ink/55">{formatDashboardDate(nextSession.date)} · {nextSession.type}</p>
              <p className="mt-2 break-words font-semibold text-ink">{nextSession.summary || "Sesión planificada"}</p>
              {plannedImpact && plannedImpactStyle ? (
                <span className={`mt-3 inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold ${plannedImpactStyle.badgeClassName}`}>
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${plannedImpactStyle.dotClassName}`} />
                  Previsto: {plannedImpact.label}
                </span>
              ) : null}
            </div>
            {compatibility && compatibilityStyle ? (
              <div className="min-w-0 rounded-md border border-line p-3">
                <p className="text-xs font-semibold text-ink/55">Compatibilidad · Lectura orientativa</p>
                <span className={`mt-2 inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold ${compatibilityStyle.badgeClassName}`}>
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${compatibilityStyle.dotClassName}`} />
                  {compatibility.label}
                </span>
                {compatibility.primaryReason ? <p className="mt-2 text-sm text-ink/65">{compatibility.primaryReason.label}</p> : null}
                <p className="mt-2 text-sm text-ink/70"><span className="font-semibold text-ink">Próxima decisión:</span> {compatibility.suggestedAction}</p>
              </div>
            ) : null}
          </div>
        ) : <DashboardEmptyState>No hay una próxima sesión pendiente con fecha disponible.</DashboardEmptyState>}
      </section>

      <section className="min-w-0 space-y-3" aria-label="Contexto de carga">
        <div>
          <h3 className="font-semibold text-ink">Contexto de carga</h3>
          <p className="mt-1 text-sm text-ink/55">Carga registrada y bienestar para contextualizar la lectura semanal.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <WeeklyLoadDecisionBlock dashboardData={dashboardData} loadData={loadData} />
          <DailyLoadReadinessBlock dashboardData={dashboardData} />
        </div>
        <details className="coach-surface rounded-md p-4">
          <summary className="cursor-pointer font-semibold text-ink">Detalle de entrenamiento</summary>
          <p className="mt-2 text-sm text-ink/55">Indicadores de carga, distribución muscular, patrones y zonas.</p>
          <div className="mt-4 grid gap-4">
            <LoadControlIndicatorsBlock dashboardData={dashboardData} />
            <div className="grid gap-4 xl:grid-cols-2">
              <LoadDistributionDecisionBlock dashboardData={dashboardData} />
              <PatternZoneWatchBlock dashboardData={dashboardData} />
            </div>
          </div>
        </details>
      </section>
      <DashboardWatchSignalsBlock dashboardData={dashboardData} onOpenClientSheet={onOpenClientSheet} clientId={client.id} />
      <DashboardQuickActionsBlock client={client} dashboardData={dashboardData} onOpenClientSheet={onOpenClientSheet} />
    </div>
  );
}

function WeeklyDecisionBlock({ review }: { review: WeeklyCoachReview }) {
  const style = getWeeklyReviewStyle(review.level);
  const secondaryReasons = review.reasons
    .filter((reason) => reason !== review.primaryReason)
    .slice(0, 3);
  const confidenceLabel = review.confidence === "high" ? "alta" : review.confidence === "medium" ? "media" : "baja";
  const impactSummary = [
    `${review.stats.highImpactSessions} ${review.stats.highImpactSessions === 1 ? "alto" : "altos"}`,
    `${review.stats.moderateImpactSessions} ${review.stats.moderateImpactSessions === 1 ? "medio" : "medios"}`,
    `${review.stats.lowImpactSessions} ${review.stats.lowImpactSessions === 1 ? "bajo" : "bajos"}`,
    review.stats.unknownImpactSessions > 0 ? `${review.stats.unknownImpactSessions} sin datos` : ""
  ].filter(Boolean).join(" · ");

  return (
    <section className={`coach-surface rounded-md border p-5 ${style.borderClassName}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Lectura semanal</p>
          <h3 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">RAC Review semanal</h3>
          <p className="mt-2 text-sm text-ink/65">{review.description}</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${style.badgeClassName}`}>
          <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${style.dotClassName}`} />
          {review.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-line bg-panel/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Qué significa</p>
          <p className="mt-2 text-sm text-ink/70">
            <span className="font-semibold text-ink">Motivo principal:</span>{" "}
            {review.primaryReason?.label ?? "Sin aspectos principales a revisar."}
          </p>
          <p className="mt-3 text-sm text-ink/70">
            <span className="font-semibold text-ink">Decisión sugerida:</span> {review.suggestedDecision}
          </p>
          <p className="mt-3 text-xs font-semibold text-ink/45">Confianza {confidenceLabel}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <ClientInfoCard label="Cumplimiento" value={`${review.stats.completedSessions}/${review.stats.plannedSessions} sesiones`} />
          <ClientInfoCard label="Impacto" value={impactSummary} />
          <ClientInfoCard label="Molestias" value={`${review.stats.discomfortSessions}`} />
        </div>
      </div>

      {secondaryReasons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {secondaryReasons.map((reason) => (
            <span className="rounded-md border border-line bg-panel/55 px-2.5 py-1.5 text-xs font-semibold text-ink/65" key={`${reason.type}-${reason.label}`}>
              {reason.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DashboardEmptyState({ children }: { children: string }) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
      {children}
    </div>
  );
}

function WeeklyLoadDecisionBlock({
  dashboardData,
  loadData
}: {
  dashboardData: ReturnType<typeof getClientDashboardData>;
  loadData: ReturnType<typeof getDashboardLoadData>;
}) {
  const maxLoad = Math.max(1, ...dashboardData.weeklySeries.map((entry) => entry.load));

  return (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Carga semanal</h3>
          <p className="mt-1 text-sm text-ink/55">Tendencia de sRPE semanal y comparación con la semana anterior.</p>
        </div>
        <span className="w-fit rounded-md bg-panel px-3 py-1 text-sm font-semibold text-ink/70">
          {dashboardData.sessionsWithSrpe.length > 0 ? formatDashboardNumber(loadData.weeklyLoad, " UA") : "Sin datos"}
        </span>
      </div>

      {dashboardData.weeklySeries.length > 0 ? (
        <>
          <div className="mt-5 flex h-40 items-end gap-2 rounded-md bg-panel/35 p-3">
            {dashboardData.weeklySeries.map((entry, index) => (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${entry.label}-${index}`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-moss to-steel"
                  style={{ height: `${Math.max(18, (entry.load / maxLoad) * 112)}px` }}
                />
                <span className="max-w-full truncate text-[10px] font-semibold text-ink/45">{entry.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ClientInfoCard label="Semana actual" value={formatDashboardNumber(dashboardData.currentWeekLoad, " UA")} />
            <ClientInfoCard
              label="Semana previa"
              value={dashboardData.previousWeekLoad > 0 ? formatDashboardNumber(dashboardData.previousWeekLoad, " UA") : "Sin datos"}
            />
            <ClientInfoCard
              label="Cambio"
              value={dashboardData.weeklyChangePct !== null ? `${dashboardData.weeklyChangePct > 0 ? "+" : ""}${dashboardData.weeklyChangePct}%` : "Sin referencia"}
            />
            <ClientInfoCard label="Media 4 semanas" value={formatDashboardNumber(dashboardData.weeklyAverage4, " UA")} />
            <ClientInfoCard label="Sesiones con sRPE" value={`${dashboardData.sessionsWithSrpe.length}`} />
            <ClientInfoCard label="ACWR" value={`${loadData.acwr.toFixed(2)} · ${loadData.acwrStatus === "Riesgo" ? "A revisar" : loadData.acwrStatus}`} />
          </div>
        </>
      ) : (
        <DashboardEmptyState>Sin sesiones registradas esta semana.</DashboardEmptyState>
      )}
    </section>
  );
}

function DailyLoadReadinessBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const maxSrpe = Math.max(1, ...dashboardData.dailySeries.map((entry) => entry.srpe));

  return (
    <section className="coach-surface rounded-md p-4">
      <h3 className="font-semibold text-ink">Carga diaria y bienestar</h3>
      <p className="mt-1 text-sm text-ink/55">Últimos registros diarios combinando carga, bienestar y molestias.</p>

      {dashboardData.dailySeries.length > 0 ? (
        <div className="mt-5">
          <div className="flex h-44 items-end gap-2 rounded-md bg-panel/35 p-3">
            {dashboardData.dailySeries.map((entry, index) => (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${entry.label}-${index}`}>
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-8 rounded-t ${entry.discomfort ? "bg-clay" : "bg-moss"}`}
                    style={{ height: `${entry.srpe > 0 ? Math.max(10, (entry.srpe / maxSrpe) * 100) : 4}%` }}
                  />
                </div>
                <span className="h-5 text-xs font-semibold text-ink/65">
                  {entry.readiness !== null ? entry.readiness.toFixed(1) : "-"}
                </span>
                <span className="max-w-full truncate text-[10px] font-semibold text-ink/45">{entry.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
            <span className="rounded-md border border-line bg-panel px-2 py-1">Barras: sRPE</span>
            <span className="rounded-md border border-line bg-panel px-2 py-1">Número: readiness / 5</span>
            <span className="rounded-md border border-line bg-panel px-2 py-1">Arcilla: molestia registrada</span>
          </div>
        </div>
      ) : (
        <DashboardEmptyState>Sin registros recientes de carga diaria o readiness.</DashboardEmptyState>
      )}
    </section>
  );
}

function getLoadIndicatorTone(label: string) {
  if (label === "A vigilar" || label === "Subida alta" || label === "Muy superior a habitual") return "border-clay/25 bg-clay/10 text-clay";
  if (label === "Datos insuficientes") return "border-line bg-panel text-ink/55";
  if (label === "Descarga" || label === "Inferior a habitual") return "border-steel/20 bg-steel/10 text-steel";
  return "border-moss/25 bg-mint text-moss";
}

function getLoadIndicatorValue(value: number | null, decimals = 0, suffix = "") {
  if (value === null || !Number.isFinite(value)) return "Sin datos";
  return `${decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("es-ES")}${suffix}`;
}

function getLoadControlReading(dashboardData: ReturnType<typeof getClientDashboardData>) {
  const indicators = dashboardData.loadControlIndicators;
  if (dashboardData.currentWeekLoad <= 0) return "Datos insuficientes para interpretar la carga.";
  if (indicators.recentHabitualLabel === "Muy superior a habitual" || indicators.strainLabel === "A vigilar") {
    return "Carga reciente superior a la habitual. Revisar respuesta antes de progresar.";
  }
  if (indicators.monotonyLabel === "A vigilar" || indicators.monotonyLabel === "Variabilidad baja" || indicators.monotonyLabel === "Variabilidad muy baja") {
    return "Variabilidad baja. Conviene revisar la distribución semanal.";
  }
  if (indicators.weeklyChangeLabel === "Subida alta") {
    return "Subida semanal alta. Mantener lectura prudente de la respuesta.";
  }
  return "Carga estable y bien distribuida.";
}

function LoadControlIndicatorsBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const indicators = dashboardData.loadControlIndicators;
  const cards = [
    {
      detail: indicators.weeklyChangeLabel,
      label: "Cambio semanal",
      value: dashboardData.weeklyChangePct !== null ? `${dashboardData.weeklyChangePct > 0 ? "+" : ""}${dashboardData.weeklyChangePct}%` : "Sin datos"
    },
    {
      detail: indicators.monotonyLabel,
      label: "Monotony",
      value: getLoadIndicatorValue(indicators.monotonyValue, 2)
    },
    {
      detail: indicators.strainLabel,
      label: "Strain",
      value: getLoadIndicatorValue(indicators.strainValue)
    },
    {
      detail: indicators.recentHabitualLabel,
      label: "Reciente / habitual",
      value: getLoadIndicatorValue(indicators.recentHabitualRatio, 2)
    },
    {
      detail: indicators.adherenceLabel,
      label: "Cumplimiento",
      value: dashboardData.adherencePercent !== null ? `${dashboardData.adherencePercent}%` : "Sin datos"
    }
  ];

  return (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Indicadores de carga</h3>
          <p className="mt-1 text-sm text-ink/55">Lectura orientativa de carga interna reciente.</p>
        </div>
        <span className="w-fit rounded-md border border-line bg-panel px-3 py-1 text-xs font-semibold text-ink/55">
          {indicators.currentWeekDaysWithLoad} día(s) con carga
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article className="coach-subtle-card rounded-md p-3" key={card.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{card.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{card.value}</p>
            <span className={`mt-3 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getLoadIndicatorTone(card.detail)}`}>
              {card.detail}
            </span>
          </article>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-line bg-panel/45 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Lectura de carga</p>
        <p className="mt-1 text-sm font-semibold text-ink/75">{getLoadControlReading(dashboardData)}</p>
      </div>
    </section>
  );
}

function HorizontalDashboardBars({
  emptyText,
  entries,
  suffix
}: {
  emptyText: string;
  entries: [string, number][];
  suffix: string;
}) {
  const maxValue = Math.max(1, ...entries.map(([, value]) => value));

  if (entries.length === 0) return <DashboardEmptyState>{emptyText}</DashboardEmptyState>;

  return (
    <div className="mt-4 grid gap-3">
      {entries.map(([label, value]) => (
        <div className="coach-subtle-card rounded-md p-3" key={label}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{label}</p>
            <span className="text-xs font-semibold text-moss">{Math.round(value).toLocaleString("es-ES")} {suffix}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel">
            <div className="h-full rounded-full bg-moss" style={{ width: `${Math.max(6, (value / maxValue) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadDistributionDecisionBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const distribution = (["strength", "resistance", "concurrent", "activeRecovery"] as const)
    .map((kind) => ({ kind, ...dashboardData.sessionDistribution[kind] }))
    .filter((entry) => entry.count > 0 || entry.load > 0);
  const totalLoad = Math.max(1, distribution.reduce((total, entry) => total + entry.load, 0));

  return (
    <section className="coach-surface rounded-md p-4">
      <h3 className="font-semibold text-ink">Distribución de carga</h3>
      <p className="mt-1 text-sm text-ink/55">Reparto de sesiones y sRPE de los últimos 7 días por tipo de trabajo.</p>
      {distribution.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {distribution.map((entry) => (
            <article className="rounded-md border border-line bg-panel/45 p-3" key={entry.kind}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${getDashboardKindClass(entry.kind)}`}>
                  {getDashboardKindLabel(entry.kind)}
                </span>
                <span className="text-xs font-semibold text-ink/55">
                  {entry.count} sesión(es) · {formatDashboardNumber(entry.load, " UA")}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel">
                <div className="h-full rounded-full bg-moss" style={{ width: `${Math.max(8, (entry.load / totalLoad) * 100)}%` }} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <DashboardEmptyState>Sin sesiones recientes para distribuir la carga.</DashboardEmptyState>
      )}
    </section>
  );
}

function PatternZoneWatchBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const patternEntries = Object.entries(dashboardData.loadByPattern)
    .filter(([, load]) => load > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const muscleEntries = Object.entries(dashboardData.muscleSets)
    .filter(([, sets]) => sets > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <section className="coach-surface rounded-md p-4">
      <h3 className="font-semibold text-ink">Fatiga por patrón / zona</h3>
      <p className="mt-1 text-sm text-ink/55">Lectura visual de dónde se concentra el trabajo registrado.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Patrones</p>
          <HorizontalDashboardBars emptyText="Sin datos suficientes por patrón." entries={patternEntries} suffix="kg" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Zonas musculares</p>
          <HorizontalDashboardBars emptyText="Sin datos suficientes por zona." entries={muscleEntries} suffix="series" />
        </div>
      </div>
    </section>
  );
}

function DashboardWatchSignalsBlock({
  clientId,
  dashboardData,
  onOpenClientSheet
}: {
  clientId: string;
  dashboardData: ReturnType<typeof getClientDashboardData>;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
}) {
  const toneClass = {
    calm: "border-steel/20 bg-steel/10 text-steel",
    danger: "border-coral/25 bg-coral/10 text-coral",
    warning: "border-clay/25 bg-clay/10 text-clay"
  };

  return (
    <section className="coach-surface rounded-md p-4">
      <h3 className="font-semibold text-ink">Qué revisar</h3>
      <p className="mt-1 text-sm text-ink/55">Motivos concretos para abrir la vista relacionada y decidir el siguiente ajuste.</p>
      {dashboardData.watchSignals.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {dashboardData.watchSignals.map((signal) => (
            <article className="rounded-md border border-line bg-panel/45 p-3" key={`${signal.label}-${signal.meta}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${toneClass[signal.tone]}`}>
                    {signal.label}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-ink">{signal.meta}</p>
                </div>
                <button
                  className="rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink/70"
                  onClick={() => onOpenClientSheet(clientId, signal.action)}
                  type="button"
                >
                  Revisar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <DashboardEmptyState>Sin señales relevantes ahora.</DashboardEmptyState>
      )}
    </section>
  );
}

function DashboardQuickActionsBlock({
  client,
  dashboardData,
  onOpenClientSheet
}: {
  client: CoachClient;
  dashboardData: ReturnType<typeof getClientDashboardData>;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
}) {
  const actions: Array<{ label: string; sheet: SheetId; meta: string }> = [
    { label: "Planificar sesión", meta: "Abrir entrenamiento", sheet: "training" },
    { label: "Ir a Planificación", meta: "Revisar semana y bloque", sheet: "planning" },
    { label: "Ir a Valoraciones", meta: "Tests principales y reevaluación", sheet: "assessments" },
    { label: "Ver Bienestar", meta: "Readiness, sueño y molestias", sheet: "clientWellness" },
    { label: "Ver Progreso", meta: "Evolución y técnica", sheet: "clientProgress" }
  ];

  return (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Seguimiento</h3>
          <p className="mt-1 text-sm text-ink/55">Atajos para actuar desde la lectura semanal sin duplicar pantallas.</p>
        </div>
        <span className="w-fit rounded-md border border-line bg-panel px-3 py-1 text-xs font-semibold text-ink/55">
          {dashboardData.pendingReviews} revisión(es) pendiente(s)
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => (
          <button
            className="rounded-md border border-line bg-panel/45 p-3 text-left transition hover:border-moss/35 hover:bg-panel"
            key={action.label}
            onClick={() => onOpenClientSheet(client.id, action.sheet)}
            type="button"
          >
            <span className="text-sm font-semibold text-ink">{action.label}</span>
            <span className="mt-1 block text-xs font-medium text-ink/55">{action.meta}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ClientHeader({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  return (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button className="mb-3 text-sm font-semibold text-moss" onClick={onBack} type="button">
            ← Volver a Gestión
          </button>
          <h2 className="text-xl font-semibold text-ink">{client.name}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {client.modality} · {client.level} · {client.goalType}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink"
            onClick={onOpenDetails}
            type="button"
          >
            Detalles
          </button>
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onOpenClientSheet(client.id, "assessments")}
            type="button"
          >
            Valoraciones
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink/65"><span className="font-semibold text-ink">Objetivo:</span> {client.planning.primaryGoal}</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-xs text-ink/60">
        <span>Contexto: {client.status}</span>
        <span>Readiness: {client.readiness}%</span>
        <span>Próximo evento: {client.nextEvent}</span>
      </div>
    </section>
  );
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`min-w-0 rounded-md bg-panel/55 p-3 ${className}`}>
      <p className="text-xs font-semibold text-ink/60">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">{value}</p>
    </article>
  );
}
