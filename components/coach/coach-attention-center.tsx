"use client";

import { useMemo, useState } from "react";
import type { TargetTrainingSession } from "@/components/coach/types";
import { getExerciseById } from "@/lib/exercises";
import type { IntakeQuestionnaire } from "@/lib/intake-questionnaire";

type AttentionFilter = "all" | "sessions" | "technique" | "feedback" | "wellness" | "management";
type AttentionPeriod = 7 | 14 | 30 | 90;
type AttentionSectionId =
  | "pendingSessions"
  | "unreviewedVideos"
  | "highPriorityTechnique"
  | "negativeFeedback"
  | "discomfort"
  | "lowReadiness"
  | "expiringAccess"
  | "intakeQuestionnaire"
  | "pinnedPrivateNotes"
  | "pendingOnboarding"
  | "staleTests";

type ClientWellness = {
  calm?: number;
  energy?: number;
  fatigue: number;
  motivation: number;
  recovery?: number;
  sleep: number;
  soreness: number;
  stress: number;
};

type TechniqueVideoView = "front" | "side" | "back" | "other";
type TechniqueReviewStatus = "not_reviewed" | "ok" | "minor_compensation" | "moderate_compensation" | "high_compensation";
type TechniqueGlobalScore = "good" | "acceptable" | "needs_work" | "high_priority";
type TechniquePlanningDecision =
  | ""
  | "keep_progression"
  | "repeat_exercise"
  | "regress"
  | "reduce_load"
  | "change_exercise"
  | "mobility_or_control_focus";

type TechniqueAssessmentItem = {
  label: string;
  severity?: "low" | "moderate" | "high";
  status?: "ok" | "watch" | "issue";
};

type TechniqueReview = {
  checklist?: TechniqueAssessmentItem[];
  globalScore?: TechniqueGlobalScore;
  planningDecision?: TechniquePlanningDecision | null;
  status?: TechniqueReviewStatus;
};

type ConnectedSessionExercise = {
  exerciseId?: string | null;
  exerciseName?: string | null;
  name?: string | null;
  techniqueReview?: TechniqueReview;
  techniqueVideoUrl?: string | null;
  techniqueVideoView?: TechniqueVideoView | null;
};

type ReviewSessionRecord = {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  cardioPlan?: unknown;
  cardioResult?: unknown;
  completed?: boolean;
  discomfort?: {
    bodyArea?: string;
    exerciseName?: string;
    hasDiscomfort?: boolean;
    intensity?: number | string | null;
    notes?: string;
    phase?: string;
  };
  date?: string | null;
  duration?: number | string | null;
  exercises?: ConnectedSessionExercise[];
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: ConnectedSessionExercise[];
  plannedExercises?: ConnectedSessionExercise[];
  resistanceMethodId?: string;
  resistanceSport?: string | null;
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  status?: string | null;
  summary?: string | null;
  targetResistanceZoneId?: string | null;
  type?: string | null;
  wellness?: ClientWellness;
};

type CoachClient = {
  accessEndDate?: string;
  availableEquipment?: string;
  availability?: string | null;
  coachPrivateNotes?: Array<{ pinned?: boolean; text: string; title?: string }>;
  id: string;
  injuries?: string | null;
  intakeQuestionnaire?: IntakeQuestionnaire;
  modality?: string | null;
  name: string;
  nextEvent?: string | null;
  onboarding?: unknown;
  performanceTests?: {
    entries?: Array<{ date?: string; testName?: string }>;
  };
  planning?: {
    eventName?: string;
    primaryGoal?: string;
  };
  sessionRecords?: ReviewSessionRecord[];
  sport?: string | null;
};

type CoachAttentionItem = {
  action: "session" | "details" | "progress";
  badge?: string;
  clientId: string;
  clientName: string;
  date?: string | null;
  detail?: string;
  id: string;
  meta?: string;
  section: AttentionSectionId;
  sessionIndex?: number;
  title: string;
};

const attentionFilterLabels: Record<AttentionFilter, string> = {
  all: "Todos",
  feedback: "Feedback",
  management: "Gestión",
  sessions: "Sesiones",
  technique: "Técnica",
  wellness: "Wellness"
};

const attentionPeriodOptions: AttentionPeriod[] = [7, 14, 30, 90];

const attentionSectionLabels: Record<AttentionSectionId, { description: string; filter: AttentionFilter; title: string }> = {
  discomfort: {
    description: "Molestias reportadas dentro del seguimiento deportivo.",
    filter: "wellness",
    title: "Molestias o fatiga a vigilar"
  },
  expiringAccess: {
    description: "Clientes con acceso activo próximo a finalizar.",
    filter: "management",
    title: "Accesos próximos a finalizar"
  },
  highPriorityTechnique: {
    description: "Revisiones manuales marcadas con prioridad alta o compensación alta.",
    filter: "technique",
    title: "Técnica con prioridad alta"
  },
  intakeQuestionnaire: {
    description: "Cuestionarios de ingreso pendientes o actualizados por el deportista.",
    filter: "management",
    title: "Cuestionarios de ingreso"
  },
  lowReadiness: {
    description: "Registros recientes de wellness/readiness bajos.",
    filter: "wellness",
    title: "Wellness / readiness bajo"
  },
  negativeFeedback: {
    description: "Feedback rápido negativo enviado por el deportista.",
    filter: "feedback",
    title: "Feedback negativo reciente"
  },
  pendingOnboarding: {
    description: "Fichas iniciales pendientes o incompletas.",
    filter: "management",
    title: "Fichas iniciales pendientes"
  },
  pinnedPrivateNotes: {
    description: "Clientes con notas privadas fijadas para tener presentes.",
    filter: "management",
    title: "Notas internas fijadas"
  },
  pendingSessions: {
    description: "Sesiones completadas que todavía necesitan revisión.",
    filter: "sessions",
    title: "Sesiones pendientes de revisar"
  },
  staleTests: {
    description: "Clientes sin tests de referencia o con tests antiguos.",
    filter: "management",
    title: "Tests de rendimiento antiguos o ausentes"
  },
  unreviewedVideos: {
    description: "Vídeos enviados por deportistas que todavía no tienen revisión técnica.",
    filter: "technique",
    title: "Vídeos técnicos sin revisar"
  }
};

const techniqueVideoViewLabels: Record<TechniqueVideoView, string> = {
  back: "Posterior",
  front: "Frontal",
  other: "Otra",
  side: "Lateral"
};

const techniquePlanningDecisionLabels: Record<Exclude<TechniquePlanningDecision, "">, string> = {
  change_exercise: "Cambiar ejercicio",
  keep_progression: "Mantener progresión",
  mobility_or_control_focus: "Enfocar movilidad/control",
  reduce_load: "Reducir carga",
  regress: "Regresar ejercicio",
  repeat_exercise: "Repetir ejercicio"
};

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`rounded-md bg-panel/55 p-4 ${className}`}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm font-semibold text-moss">{value}</p>
    </article>
  );
}

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function parseAccessDate(dateKey?: string | null) {
  if (!dateKey) return null;
  const parsed = new Date(`${dateKey}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTodayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatAccessDate(dateKey?: string | null) {
  const date = parseAccessDate(dateKey);
  if (!date) return "Sin fecha";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDisplayDate(value?: string | null, fallback = "Sin fecha") {
  if (!value) return fallback;
  const rawValue = value.trim();
  const isoDateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) return `${isoDateMatch[3]}-${isoDateMatch[2]}-${isoDateMatch[1]}`;

  const slashDateMatch = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashDateMatch) {
    return `${slashDateMatch[1].padStart(2, "0")}-${slashDateMatch[2].padStart(2, "0")}-${slashDateMatch[3]}`;
  }

  return rawValue || fallback;
}

function getReviewSessionDate(value?: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function calculateSessionLoad(rpe: number, duration: number) {
  return rpe * duration;
}

function getAttentionDate(value?: string | null) {
  return getReviewSessionDate(value) ?? parseAccessDate(value);
}

function isWithinLastDays(value: string | null | undefined, days: number) {
  const date = getAttentionDate(value);
  if (!date) return false;
  const today = getTodayDateOnly();
  const elapsedDays = Math.floor((today.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
  return elapsedDays >= 0 && elapsedDays <= days;
}

function getAttentionReadinessScore(wellness?: ClientWellness) {
  if (!wellness) return null;
  const values = [
    wellness.sleep,
    wellness.energy ?? Math.max(1, 6 - wellness.fatigue),
    wellness.recovery ?? Math.max(1, 6 - wellness.soreness),
    wellness.calm ?? Math.max(1, 6 - wellness.stress),
    wellness.motivation
  ].filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getAttentionSectionFilter(section: AttentionSectionId) {
  return attentionSectionLabels[section].filter;
}

function hasRealSessionData(session: ReviewSessionRecord) {
  return Boolean(
    session.completed ||
    hasDisplayValue(session.duration) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function getSessionReviewStatus(session: ReviewSessionRecord): "pending" | "reviewed" | null {
  if (session.reviewStatus === "reviewed") return "reviewed";
  if (hasRealSessionData(session)) return "pending";
  return null;
}

function getSessionSrpe(session: ReviewSessionRecord) {
  if (hasDisplayValue(session.sRPE)) {
    const parsedSrpe = Number(session.sRPE);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }
  if (hasDisplayValue(session.srpe)) {
    const parsedSrpe = Number(session.srpe);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }

  const duration = Number(session.actualDurationMinutes ?? session.duration);
  const rpe = Number(session.finalRpe ?? session.rpe);

  if (!Number.isFinite(duration) || !Number.isFinite(rpe) || duration <= 0 || rpe <= 0) return null;
  return calculateSessionLoad(rpe, duration);
}

function getTechniqueReviewSummary(review?: TechniqueReview | null) {
  const checklist = review?.checklist ?? [];
  const issueItems = checklist.filter((item) => item.status === "issue");
  const watchItems = checklist.filter((item) => item.status === "watch");

  return {
    issueCount: issueItems.length,
    mainItems: [...issueItems, ...watchItems].slice(0, 3),
    watchCount: watchItems.length
  };
}

function getTechniquePlanningDecisionLabel(decision?: TechniquePlanningDecision | null) {
  if (!decision) return "";
  return techniquePlanningDecisionLabels[decision] ?? "";
}

function getOnboardingValue(value?: number | string | string[] | null) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "";
  if (value === undefined || value === null) return "";
  return `${value}`.trim();
}

function getOnboardingSummary(client: CoachClient) {
  const onboarding = client.onboarding as
    | {
        equipmentAccess?: {
          availableEquipment?: string[];
          gymAccess?: boolean;
          homeTraining?: boolean;
        };
        goals?: {
          mainGoal?: string;
        };
        limitations?: {
          injuries?: string;
          movementLimitations?: string;
        };
        sportProfile?: {
          nextCompetitionName?: string;
          primarySport?: string;
        };
        trainingAvailability?: {
          daysPerWeek?: number | string;
          sessionDurationMinutes?: number | string;
        };
      }
    | undefined;
  const equipment = [
    ...(onboarding?.equipmentAccess?.availableEquipment ?? []),
    onboarding?.equipmentAccess?.gymAccess ? "Gimnasio" : "",
    onboarding?.equipmentAccess?.homeTraining ? "Casa" : ""
  ].filter(Boolean);

  return {
    availability: getOnboardingValue(onboarding?.trainingAvailability?.daysPerWeek)
      ? `${onboarding?.trainingAvailability?.daysPerWeek} días/semana${onboarding?.trainingAvailability?.sessionDurationMinutes ? ` · ${onboarding.trainingAvailability.sessionDurationMinutes} min` : ""}`
      : getOnboardingValue(client.availability),
    equipment: equipment.length > 0 ? equipment.join(", ") : getOnboardingValue(client.availableEquipment),
    limitations: getOnboardingValue(onboarding?.limitations?.injuries || onboarding?.limitations?.movementLimitations || client.injuries),
    mainGoal: getOnboardingValue(onboarding?.goals?.mainGoal || client.planning?.primaryGoal),
    nextEvent: getOnboardingValue(onboarding?.sportProfile?.nextCompetitionName || client.planning?.eventName || client.nextEvent),
    primarySport: getOnboardingValue(onboarding?.sportProfile?.primarySport || client.modality || client.sport)
  };
}

function getOnboardingCompletion(client: CoachClient) {
  const onboarding = client.onboarding as { completed?: boolean } | undefined;
  if (onboarding?.completed) return { isComplete: true };
  const summary = getOnboardingSummary(client);
  const filledCount = Object.values(summary).filter((value) => value && !["Pendiente", "Pendiente de completar.", "Sin evento definido"].includes(value)).length;

  return {
    isComplete: filledCount >= 4
  };
}

function getSortedPerformanceTests(client?: CoachClient | null) {
  return [...(client?.performanceTests?.entries ?? [])].sort((left, right) => {
    const leftTime = parseAccessDate(left.date)?.getTime() ?? 0;
    const rightTime = parseAccessDate(right.date)?.getTime() ?? 0;
    return rightTime - leftTime;
  });
}

function buildCoachAttentionItems(clients: CoachClient[], period: AttentionPeriod): CoachAttentionItem[] {
  const items: CoachAttentionItem[] = [];
  const today = getTodayDateOnly();

  clients.forEach((client) => {
    const sessionRecords = client.sessionRecords ?? [];
    const intakeQuestionnaire = client.intakeQuestionnaire;

    if (intakeQuestionnaire?.required === true && intakeQuestionnaire.completed !== true) {
      items.push({
        action: "details",
        badge: "Pendiente",
        clientId: client.id,
        clientName: client.name,
        date: intakeQuestionnaire.updatedAt,
        detail: "El deportista todavía no ha completado el cuestionario obligatorio.",
        id: `intake-pending-${client.id}`,
        section: "intakeQuestionnaire",
        title: "Cuestionario de ingreso pendiente"
      });
    } else if (intakeQuestionnaire?.completed === true && intakeQuestionnaire.needsCoachReview === true) {
      items.push({
        action: "details",
        badge: "Actualizado",
        clientId: client.id,
        clientName: client.name,
        date: intakeQuestionnaire.updatedAt ?? intakeQuestionnaire.completedAt,
        detail: "El deportista ha enviado o actualizado el cuestionario.",
        id: `intake-updated-${client.id}`,
        section: "intakeQuestionnaire",
        title: "Cuestionario de ingreso actualizado"
      });
    }

    sessionRecords.forEach((session, sessionIndex) => {
      const sessionInPeriod = isWithinLastDays(session.date, period);

      if (getSessionReviewStatus(session) === "pending") {
        const srpe = getSessionSrpe(session);
        items.push({
          action: "session",
          badge: "Revisión pendiente",
          clientId: client.id,
          clientName: client.name,
          date: session.date,
          detail: srpe !== null ? `sRPE ${srpe} UA` : "sRPE pendiente",
          id: `pending-session-${client.id}-${sessionIndex}`,
          meta: session.type ?? undefined,
          section: "pendingSessions",
          sessionIndex,
          title: session.summary || "Sesión completada"
        });
      }

      if (session.athleteQuickFeedback === "down" && sessionInPeriod) {
        const srpe = getSessionSrpe(session);
        items.push({
          action: "session",
          badge: "Feedback negativo",
          clientId: client.id,
          clientName: client.name,
          date: session.date,
          detail: session.athleteQuickFeedbackNote || (srpe !== null ? `sRPE ${srpe} UA` : "Sin comentario"),
          id: `negative-feedback-${client.id}-${sessionIndex}`,
          meta: session.type ?? undefined,
          section: "negativeFeedback",
          sessionIndex,
          title: session.summary || "Sesión con feedback negativo"
        });
      }

      if ((session.discomfort?.hasDiscomfort || session.discomfort?.notes) && sessionInPeriod) {
        const discomfort = session.discomfort;
        items.push({
          action: "session",
          badge: discomfort?.intensity ? `${discomfort.intensity}/10` : "Molestia",
          clientId: client.id,
          clientName: client.name,
          date: session.date,
          detail: [discomfort?.bodyArea, discomfort?.exerciseName, discomfort?.phase, discomfort?.notes].filter(Boolean).join(" · "),
          id: `discomfort-${client.id}-${sessionIndex}`,
          meta: session.type ?? undefined,
          section: "discomfort",
          sessionIndex,
          title: discomfort?.bodyArea || "Molestia reportada"
        });
      }

      if (session.wellness && sessionInPeriod) {
        const readiness = getAttentionReadinessScore(session.wellness);
        if (readiness !== null && readiness <= 2.8) {
          items.push({
            action: "session",
            badge: `${readiness.toFixed(1)}/5`,
            clientId: client.id,
            clientName: client.name,
            date: session.date,
            detail: `Sueño ${session.wellness.sleep}/5 · Energía ${session.wellness.energy ?? Math.max(1, 6 - session.wellness.fatigue)}/5 · Recuperación ${session.wellness.recovery ?? Math.max(1, 6 - session.wellness.soreness)}/5`,
            id: `low-readiness-${client.id}-${sessionIndex}`,
            meta: session.type ?? undefined,
            section: "lowReadiness",
            sessionIndex,
            title: "Readiness bajo"
          });
        }
      }

      (session.performedExercises ?? []).forEach((exercise, exerciseIndex) => {
        const videoUrl = `${exercise.techniqueVideoUrl ?? ""}`.trim();
        if (!videoUrl) return;

        const exerciseName =
          exercise.exerciseName ||
          exercise.name ||
          getExerciseById(exercise.exerciseId || "")?.name ||
          "Ejercicio sin especificar";
        const review = exercise.techniqueReview;
        const isUnreviewed = !review || !review.status || review.status === "not_reviewed";
        const summary = getTechniqueReviewSummary(review);
        const mainIssue = summary.mainItems[0];
        const hasHighChecklistSeverity = (review?.checklist ?? []).some((item) => item.severity === "high");
        const isHighPriority =
          review?.status === "high_compensation" ||
          review?.globalScore === "high_priority" ||
          hasHighChecklistSeverity;

        if (isUnreviewed) {
          items.push({
            action: "session",
            badge: "Sin revisar",
            clientId: client.id,
            clientName: client.name,
            date: session.date,
            detail: `Vista: ${techniqueVideoViewLabels[exercise.techniqueVideoView ?? "other"]}`,
            id: `unreviewed-video-${client.id}-${sessionIndex}-${exerciseIndex}`,
            meta: exerciseName,
            section: "unreviewedVideos",
            sessionIndex,
            title: exerciseName
          });
        }

        if (isHighPriority) {
          const planningDecision = getTechniquePlanningDecisionLabel(review?.planningDecision);
          items.push({
            action: "session",
            badge: review?.globalScore === "high_priority" ? "Prioridad alta" : "Técnica",
            clientId: client.id,
            clientName: client.name,
            date: session.date,
            detail: [mainIssue?.label, planningDecision].filter(Boolean).join(" · ") || "Revisión técnica marcada para vigilar",
            id: `high-technique-${client.id}-${sessionIndex}-${exerciseIndex}`,
            meta: exerciseName,
            section: "highPriorityTechnique",
            sessionIndex,
            title: exerciseName
          });
        }
      });
    });

    const accessEndDate = parseAccessDate(client.accessEndDate);
    if (accessEndDate) {
      const daysRemaining = Math.ceil((accessEndDate.getTime() - today.getTime()) / 86400000);
      if (daysRemaining >= 0 && daysRemaining <= 14) {
        items.push({
          action: "details",
          badge: `${daysRemaining} días`,
          clientId: client.id,
          clientName: client.name,
          date: client.accessEndDate,
          detail: `Acceso activo hasta ${formatAccessDate(client.accessEndDate)}`,
          id: `access-${client.id}`,
          section: "expiringAccess",
          title: client.name
        });
      }
    }

    const pinnedNotes = (client.coachPrivateNotes ?? []).filter((note) => note.pinned && note.text.trim());
    if (pinnedNotes.length > 0) {
      items.push({
        action: "details",
        badge: `${pinnedNotes.length} fijadas`,
        clientId: client.id,
        clientName: client.name,
        detail: pinnedNotes.slice(0, 2).map((note) => note.title || note.text).join(" · "),
        id: `pinned-private-notes-${client.id}`,
        meta: "Solo entrenador",
        section: "pinnedPrivateNotes",
        title: client.name
      });
    }

    const onboardingCompletion = getOnboardingCompletion(client);
    if (!onboardingCompletion.isComplete) {
      const onboardingSummary = getOnboardingSummary(client);
      const missingFields = [
        onboardingSummary.primarySport ? "" : "deporte",
        onboardingSummary.mainGoal ? "" : "objetivo",
        onboardingSummary.availability ? "" : "disponibilidad",
        onboardingSummary.limitations ? "" : "limitaciones"
      ].filter(Boolean);

      items.push({
        action: "details",
        badge: "Ficha inicial pendiente",
        clientId: client.id,
        clientName: client.name,
        detail: missingFields.length > 0 ? `Pendiente: ${missingFields.join(", ")}` : "Ficha inicial por completar",
        id: `onboarding-${client.id}`,
        meta: onboardingSummary.primarySport || client.modality || client.sport || undefined,
        section: "pendingOnboarding",
        title: client.name
      });
    }

    const performanceTests = getSortedPerformanceTests(client);
    const latestTest = performanceTests[0];
    const latestTestDate = latestTest ? parseAccessDate(latestTest.date) : null;
    const daysSinceLatestTest = latestTestDate ? Math.floor((today.getTime() - latestTestDate.getTime()) / 86400000) : null;

    if (!latestTest || (daysSinceLatestTest !== null && daysSinceLatestTest > 90)) {
      items.push({
        action: "progress",
        badge: latestTest ? "Tests antiguos" : "Sin tests",
        clientId: client.id,
        clientName: client.name,
        date: latestTest?.date,
        detail: latestTest ? `Último test: ${latestTest.testName} · ${formatDisplayDate(latestTest.date)}` : "Sin tests de referencia registrados",
        id: `tests-${client.id}`,
        section: "staleTests",
        title: client.name
      });
    }
  });

  return items.sort((left, right) => {
    const leftTime = getAttentionDate(left.date)?.getTime() ?? 0;
    const rightTime = getAttentionDate(right.date)?.getTime() ?? 0;
    return rightTime - leftTime;
  });
}

export function CoachAttentionCenter({
  clients,
  onOpenClientDetails,
  onOpenClientProgress,
  onOpenTrainingSession
}: {
  clients: CoachClient[];
  onOpenClientDetails: (clientId: string) => void;
  onOpenClientProgress: (clientId: string) => void;
  onOpenTrainingSession: (clientId: string, target?: TargetTrainingSession) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<AttentionFilter>("all");
  const [period, setPeriod] = useState<AttentionPeriod>(14);
  const items = useMemo(() => buildCoachAttentionItems(clients, period), [clients, period]);
  const visibleItems = items.filter((item) => activeFilter === "all" || getAttentionSectionFilter(item.section) === activeFilter);
  const visibleSections = (Object.keys(attentionSectionLabels) as AttentionSectionId[])
    .map((section) => ({
      items: visibleItems.filter((item) => item.section === section),
      section
    }))
    .filter((group) => group.items.length > 0);
  const counters = {
    feedback: items.filter((item) => getAttentionSectionFilter(item.section) === "feedback").length,
    management: items.filter((item) => getAttentionSectionFilter(item.section) === "management").length,
    sessions: items.filter((item) => getAttentionSectionFilter(item.section) === "sessions").length,
    technique: items.filter((item) => getAttentionSectionFilter(item.section) === "technique").length,
    wellness: items.filter((item) => getAttentionSectionFilter(item.section) === "wellness").length
  };

  function openItem(item: CoachAttentionItem) {
    if (item.action === "details") {
      onOpenClientDetails(item.clientId);
      return;
    }

    if (item.action === "progress") {
      onOpenClientProgress(item.clientId);
      return;
    }

    onOpenTrainingSession(item.clientId, {
      clientId: item.clientId,
      sessionDate: item.date ?? undefined,
      sessionIndex: item.sessionIndex
    });
  }

  return (
    <div className="mt-6 grid gap-5">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Centro de atención</h2>
            <p className="mt-1 text-sm text-ink/55">Qué necesita revisión o seguimiento rápido hoy.</p>
          </div>
          <p className="max-w-xl text-xs font-medium text-ink/45">
            Vista de trabajo basada en datos locales del entrenador.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ClientInfoCard label="Sesiones" value={`${counters.sessions}`} />
          <ClientInfoCard label="Técnica" value={`${counters.technique}`} />
          <ClientInfoCard label="Feedback" value={`${counters.feedback}`} />
          <ClientInfoCard label="Wellness" value={`${counters.wellness}`} />
          <ClientInfoCard label="Gestión" value={`${counters.management}`} />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-panel/35 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(attentionFilterLabels) as AttentionFilter[]).map((filter) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  activeFilter === filter ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/65 hover:bg-panel"
                }`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {attentionFilterLabels[filter]}
              </button>
            ))}
          </div>
          <label className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/60">
            Periodo
            <select
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
              onChange={(event) => setPeriod(Number(event.target.value) as AttentionPeriod)}
              value={period}
            >
              {attentionPeriodOptions.map((option) => (
                <option key={option} value={option}>{option} días</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {visibleSections.length === 0 ? (
        <section className="rounded-md border border-line bg-white p-6 text-center shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Todo al día.</h3>
          <p className="mt-2 text-sm text-ink/55">No hay pendientes relevantes con los filtros actuales.</p>
        </section>
      ) : (
        visibleSections.map(({ items: sectionItems, section }) => {
          const sectionMeta = attentionSectionLabels[section];

          return (
            <section className="rounded-md border border-line bg-white p-5 shadow-soft" key={section}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{sectionMeta.title}</h3>
                  <p className="mt-1 text-sm text-ink/55">{sectionMeta.description}</p>
                </div>
                <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">
                  {sectionItems.length}
                </span>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {sectionItems.slice(0, 8).map((item) => (
                  <article className="rounded-md border border-line bg-panel/35 p-4" key={item.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-ink/45">{item.clientName}</p>
                        <h4 className="mt-1 font-semibold text-ink">{item.title}</h4>
                        <p className="mt-1 text-sm text-ink/60">
                          {[item.date ? formatDisplayDate(item.date) : "", item.meta].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {item.badge ? (
                        <span className="w-fit rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    {item.detail ? <p className="mt-3 text-sm text-ink/65">{item.detail}</p> : null}
                    <button
                      className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                      onClick={() => openItem(item)}
                      type="button"
                    >
                      {item.action === "session" ? "Ver detalle" : item.action === "progress" ? "Ver progreso" : "Ver información"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
