"use client";

import { useMemo, useState } from "react";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { analyzeCardioDeviation, type CardioPlan, type CardioResult } from "@/lib/cardio-deviation";
import { getExerciseById } from "@/lib/exercises";
import { getResistanceMethodById, type ResistanceMethod } from "@/lib/resistance-methods";
import { getSportZoneProfile, type ResistanceSport, type ResistanceZone } from "@/lib/resistance-zones";

type ResistanceCardioResult = CardioResult & {
  intensityCompleted?: string;
  intervalsCompleted?: string;
  notes?: string;
  recoveryCompleted?: string;
};

type AthleteWellness = {
  calm?: number;
  energy?: number;
  fatigue?: number;
  motivation?: number;
  recovery?: number;
  sleep?: number;
  soreness?: number;
  stress?: number;
};

type ReviewSessionExercise = {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
  bandColor?: string | null;
  bandResistance?: string | null;
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  load?: number | string | null;
  name?: string | null;
  notes?: string | null;
  observation?: string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  section?: string | null;
  selectedEquipment?: string | null;
  selectedVariantName?: string | null;
  sets?: number | string | null;
  setDetails?: Array<{
    reps?: number | string | null;
    setNumber: number;
  }>;
  targetRir?: number | string | null;
  techniqueReview?: {
    checklist?: Array<{
      id: string;
      label: string;
      note?: string;
      severity?: "low" | "moderate" | "high";
      side?: "left" | "right" | "both" | "not_applicable";
      status: "ok" | "watch" | "issue";
    }>;
    coachFeedback?: string;
    compensationTags?: string[];
    globalScore?: "good" | "acceptable" | "needs_work" | "high_priority";
    markedAsReference?: boolean;
    planningDecision?: "keep_progression" | "repeat_exercise" | "regress" | "reduce_load" | "change_exercise" | "mobility_or_control_focus" | "";
    status?: "not_reviewed" | "ok" | "minor_compensation" | "moderate_compensation" | "high_compensation";
  };
  techniqueVideoNote?: string | null;
  techniqueVideoUrl?: string | null;
  techniqueVideoView?: "front" | "side" | "back" | "other" | null;
  videoNote?: string | null;
  videoUrl?: string | null;
};

type ReviewSessionRecord = {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: ResistanceCardioResult;
  completed?: boolean;
  date: string;
  discomfort?: {
    bodyArea?: string;
    exerciseId?: string;
    exerciseName?: string;
    hasDiscomfort: boolean;
    intensity?: number;
    notes?: string;
    phase?: string;
  };
  duration?: number | string | null;
  exercises?: ReviewSessionExercise[];
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: ReviewSessionExercise[];
  plannedExercises?: ReviewSessionExercise[];
  resistanceMethodId?: string;
  resistanceSport?: ResistanceSport;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  summary: string;
  targetResistanceZoneId?: ResistanceZone["id"];
  type: string;
  wellness?: AthleteWellness;
};

const techniqueVideoViewLabels = {
  back: "Posterior",
  front: "Frontal",
  other: "Otra",
  side: "Lateral"
} as const;

const techniqueGlobalScoreLabels = {
  acceptable: "Aceptable",
  good: "Bien",
  high_priority: "Prioridad alta",
  needs_work: "Necesita trabajo"
} as const;

const athleteTechniquePlanningDecisionLabels = {
  change_exercise: "Tu entrenador valorará cambiar el ejercicio.",
  keep_progression: "Puedes mantener la progresión indicada por tu entrenador.",
  mobility_or_control_focus: "Tu entrenador quiere reforzar movilidad o control.",
  reduce_load: "Tu entrenador valorará reducir la carga.",
  regress: "Tu entrenador valorará una versión más sencilla.",
  repeat_exercise: "Tu entrenador quiere repetir este ejercicio."
} as const;

type AthleteHistoryClient = {
  name: string;
  sessionRecords?: ReviewSessionRecord[];
};

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function getTechniqueReviewMainItems(review?: ReviewSessionExercise["techniqueReview"]) {
  return (review?.checklist ?? [])
    .filter((item) => item.status === "issue" || item.status === "watch")
    .slice(0, 3);
}

function parsePositiveNumber(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function invertReadinessScore(value?: number) {
  return value && value >= 1 && value <= 5 ? 6 - value : 0;
}

function getPositiveWellnessValue(wellness: AthleteWellness | undefined, key: "sleep" | "energy" | "recovery" | "calm" | "motivation") {
  if (!wellness) return 0;
  if (key === "energy") return wellness.energy ?? invertReadinessScore(wellness.fatigue);
  if (key === "recovery") return wellness.recovery ?? invertReadinessScore(wellness.soreness);
  if (key === "calm") return wellness.calm ?? invertReadinessScore(wellness.stress);
  return wellness[key] ?? 0;
}

function formatPositiveWellnessValue(wellness: AthleteWellness | undefined, key: "sleep" | "energy" | "recovery" | "calm" | "motivation") {
  const value = getPositiveWellnessValue(wellness, key);
  return value ? `${value}/5` : "Sin registrar";
}

function getSetDetailsReps(entry?: ReviewSessionExercise) {
  return (entry?.setDetails ?? [])
    .map((detail) => parsePositiveNumber(detail.reps))
    .filter((reps) => reps > 0);
}

function getSetDetailsRepSum(entry?: ReviewSessionExercise) {
  return getSetDetailsReps(entry).reduce((total, reps) => total + reps, 0);
}

function getReviewExercises(session: ReviewSessionRecord) {
  const plannedExercises = session.plannedExercises ?? session.exercises ?? [];
  const performedExercises = session.performedExercises ?? [];

  return {
    plannedExercises,
    performedExercises
  };
}

function getExerciseLabel(entry?: ReviewSessionExercise) {
  if (!entry) return "Ejercicio sin especificar";
  if (entry.exerciseName) return entry.exerciseName;
  if (entry.name) return entry.name;
  if (entry.exerciseId) return getExerciseById(entry.exerciseId)?.name ?? entry.exerciseId;
  return "Ejercicio sin especificar";
}

function getExerciseMetaLabel(entry?: ReviewSessionExercise) {
  const bandSummary = [entry?.bandColor, entry?.bandResistance].filter((value) => hasDisplayValue(value)).join(" · ");
  return [
    hasDisplayValue(entry?.selectedEquipment) ? `Material: ${entry?.selectedEquipment}` : "",
    hasDisplayValue(entry?.selectedVariantName) ? `Variante: ${entry?.selectedVariantName}` : "",
    bandSummary ? `Banda elástica: ${bandSummary}` : ""
  ].filter(Boolean).join(" · ");
}

function getPlannedValue(entry: ReviewSessionExercise | undefined, field: "sets" | "reps" | "load" | "rest" | "rir") {
  if (!entry) return undefined;

  switch (field) {
    case "sets":
      return entry.plannedSets ?? entry.sets;
    case "reps":
      return entry.plannedReps ?? entry.reps;
    case "load":
      return entry.plannedLoad ?? entry.load;
    case "rest":
      return entry.plannedRest ?? entry.rest;
    case "rir":
      return entry.plannedRir ?? entry.targetRir ?? entry.rir;
  }
}

function getPerformedValue(entry: ReviewSessionExercise | undefined, field: "sets" | "reps" | "load" | "rest" | "rir") {
  if (!entry) return undefined;

  switch (field) {
    case "sets":
      return entry.sets;
    case "reps":
      return getSetDetailsRepSum(entry) || entry.reps;
    case "load":
      return entry.load;
    case "rest":
      return entry.actualRest ?? entry.rest;
    case "rir":
      return entry.rir ?? entry.targetRir;
  }
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

function getSessionHistoryKey(session: ReviewSessionRecord, sessionIndex: number) {
  return `${session.date}-${session.summary}-${sessionIndex}`;
}

function getAthleteSessionDuration(session: ReviewSessionRecord) {
  return session.actualDurationMinutes ?? session.duration ?? null;
}

function getAthleteSessionRpe(session: ReviewSessionRecord) {
  return session.finalRpe ?? session.rpe ?? null;
}

function getAthleteSessionNotes(session: ReviewSessionRecord) {
  return session.finalNotes ?? session.notes ?? "";
}

function getAthleteSessionReviewLabel(session: ReviewSessionRecord) {
  if (hasRealSessionData(session)) return "Completada";
  return "Pendiente";
}

function getAthleteResistanceMethodLabel(method?: ResistanceMethod | null) {
  return method ? `${method.method} · ${method.name}` : "";
}

const athleteHistoryResistanceZoneMetricLabels: Array<{ key: keyof NonNullable<ResistanceZone["metrics"]>; label: string }> = [
  { key: "masPercent", label: "MAS" },
  { key: "mapPercent", label: "MAP" },
  { key: "vo2maxPercent", label: "VO2max" },
  { key: "hrMaxPercent", label: "HRmax" },
  { key: "hrrPercent", label: "HRR" },
  { key: "mlssPowerPercent", label: "W-MLSS" },
  { key: "rpe", label: "RPE" }
];

function getAthleteHistoryResistanceZoneGuide(sport?: ResistanceSport, zoneId?: string | null) {
  const profile = getSportZoneProfile(sport ?? "generic");
  const zone = profile.zones.find((item) => item.id === zoneId) ?? null;
  const metrics = zone
    ? athleteHistoryResistanceZoneMetricLabels
        .map((metric) => {
          const value = zone.metrics?.[metric.key];
          return value ? `${metric.label} ${value}` : "";
        })
        .filter(Boolean)
    : [];

  return { metrics, profile, zone };
}

function formatCardioZoneMinutes(timeInZones?: CardioResult["timeInZones"]) {
  if (!timeInZones) return [];
  return (["z1", "z2", "z3", "z4", "z5"] as const)
    .map((zone) => ({
      label: zone.toUpperCase(),
      minutes: Math.round((timeInZones[zone] ?? 0) / 60)
    }))
    .filter((zone) => zone.minutes > 0);
}

function formatResistanceDistance(distanceMeters?: number | string | null) {
  const meters = parsePositiveNumber(distanceMeters);
  if (meters <= 0) return "Sin registrar";
  const kilometers = meters / 1000;
  const formattedKilometers = kilometers >= 10
    ? Math.round(kilometers).toString()
    : kilometers.toFixed(1).replace(".", ",");
  return `${formattedKilometers} km`;
}

function hasResistancePerformedData(session: ReviewSessionRecord) {
  return Boolean(
    session.cardioResult ||
    session.cardioPlan ||
    hasDisplayValue(session.resistanceMethodId) ||
    hasDisplayValue(session.resistanceSport) ||
    hasDisplayValue(session.targetResistanceZoneId)
  );
}

function getAthleteDate(value?: string | null) {
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

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md border border-line bg-panel/35 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function getHistoryBadgeClass(label: string) {
  if (label === "Completada") return "bg-mint text-moss";
  if (label === "Pendiente") return "bg-amber-100 text-amber-800";
  return "bg-blue-50 text-blue-700";
}

function getAthleteQuickFeedbackLabel(value?: "up" | "down" | null) {
  if (value === "up") return "👍 Sesión valorada positivamente";
  if (value === "down") return "👎 Sesión valorada negativamente";
  return "";
}

function AthleteEmptyState({ clientName, message }: { clientName?: string; message: string }) {
  return (
    <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Sesión de hoy</h2>
      {clientName ? <p className="mt-1 text-sm font-medium text-ink/70">{clientName}</p> : null}
      <p className="mt-3 text-sm text-ink/60">{message}</p>
    </div>
  );
}

export function AthleteHistoryView({ client }: { client: AthleteHistoryClient | null }) {
  const [openSessionKey, setOpenSessionKey] = useState("");
  const sessions = useMemo(
    () => ((client?.sessionRecords ?? []) as ReviewSessionRecord[])
      .filter((session) => hasRealSessionData(session))
      .sort((a, b) => (getAthleteDate(b.date)?.getTime() ?? 0) - (getAthleteDate(a.date)?.getTime() ?? 0)),
    [client?.sessionRecords]
  );

  if (!client) {
    return <AthleteEmptyState message="No hay deportista seleccionado." />;
  }

  return (
    <section className="mt-4 rounded-md border border-line bg-white p-3 shadow-soft sm:mt-5 sm:p-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-moss">Sesiones anteriores</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Tu historial de entrenamiento</h2>
        <p className="text-sm text-ink/60">Consulta lo esencial de cada sesión y abre el detalle cuando lo necesites.</p>
      </div>

      {sessions.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:mt-5">
          {sessions.map((session, index) => {
            const sessionKey = getSessionHistoryKey(session, index);
            const isOpen = openSessionKey === sessionKey;
            const duration = getAthleteSessionDuration(session);
            const rpe = getAthleteSessionRpe(session);
            const srpe = getSessionSrpe(session);
            const notes = getAthleteSessionNotes(session);
            const { plannedExercises, performedExercises } = getReviewExercises(session);
            const exerciseCount = Math.max(plannedExercises.length, performedExercises.length);
            const resistanceMethod = getResistanceMethodById(session.resistanceMethodId);
            const cardioDeviation = session.cardioPlan || session.cardioResult
              ? analyzeCardioDeviation(session.cardioPlan, session.cardioResult)
              : null;
            const cardioZones = formatCardioZoneMinutes(session.cardioResult?.timeInZones);
            const hasResistanceData = hasResistancePerformedData(session);
            const resistanceDuration = session.cardioResult?.durationMinutes ?? session.actualDurationMinutes;
            const detailRows = Array.from({ length: exerciseCount }, (_, exerciseIndex) => ({
              performed: performedExercises[exerciseIndex],
              planned: plannedExercises[exerciseIndex]
            }));
            const resistanceZoneGuide = getAthleteHistoryResistanceZoneGuide(session.resistanceSport, session.targetResistanceZoneId);
            const sentTechniqueVideos = performedExercises.filter((exercise) => hasDisplayValue(exercise.techniqueVideoUrl));
            const quickFeedbackLabel = getAthleteQuickFeedbackLabel(session.athleteQuickFeedback);
            const mainExerciseNames = (performedExercises.length > 0 ? performedExercises : plannedExercises)
              .map(getExerciseLabel)
              .filter(Boolean)
              .slice(0, 3);
            const distance = session.cardioResult?.distanceMeters;

            return (
              <article className="min-w-0 rounded-md border border-line bg-panel/35 p-3 sm:p-4" key={sessionKey}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-ink/45">{displayValue(session.date, "Sin fecha")}</p>
                    <h3 className="mt-1 font-semibold text-ink">{displayValue(session.type, "Sesión")}</h3>
                    <p className="mt-1 text-sm text-ink/60">{displayValue(session.summary, "Sin resumen")}</p>
                    {mainExerciseNames.length > 0 ? (
                      <p className="mt-2 text-xs font-medium text-ink/50">Principales: {mainExerciseNames.join(" · ")}</p>
                    ) : null}
                  </div>
                  <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${getHistoryBadgeClass(getAthleteSessionReviewLabel(session))}`}>
                    {getAthleteSessionReviewLabel(session)}
                  </span>
                </div>
                <div className={`mt-3 grid gap-1.5 sm:mt-4 sm:gap-2 ${hasDisplayValue(distance) ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                  <ClientInfoCard label="Duración" value={hasDisplayValue(duration) ? `${duration} min` : "Pendiente"} />
                  <ClientInfoCard label="RPE final" value={hasDisplayValue(rpe) ? `${rpe}/10` : "Pendiente"} />
                  <ClientInfoCard label="sRPE" value={srpe !== null ? `${srpe} UA` : "Pendiente"} />
                  {hasDisplayValue(distance) ? <ClientInfoCard label="Distancia" value={formatResistanceDistance(distance)} /> : null}
                </div>
                {sentTechniqueVideos.length > 0 ? (
                  <p className="mt-3 w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">
                    Vídeo de técnica enviado
                  </p>
                ) : null}
                {quickFeedbackLabel ? (
                  <p className="mt-3 w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">
                    {quickFeedbackLabel}
                  </p>
                ) : null}
                <button
                  className="mt-4 min-h-11 w-full rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel sm:w-auto"
                  onClick={() => setOpenSessionKey(isOpen ? "" : sessionKey)}
                  type="button"
                >
                  {isOpen ? "Ocultar detalle" : "Ver detalle"}
                </button>

                {isOpen ? (
                  <div className="mt-4 grid min-w-0 gap-3 rounded-md border border-line bg-white p-3 sm:p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <ClientInfoCard label="Sueño" value={formatPositiveWellnessValue(session.wellness, "sleep")} />
                      <ClientInfoCard label="Energía" value={formatPositiveWellnessValue(session.wellness, "energy")} />
                      <ClientInfoCard label="Recuperación muscular" value={formatPositiveWellnessValue(session.wellness, "recovery")} />
                      <ClientInfoCard label="Calma" value={formatPositiveWellnessValue(session.wellness, "calm")} />
                      <ClientInfoCard label="Motivación" value={formatPositiveWellnessValue(session.wellness, "motivation")} />
                    </div>
                    <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                      <p className="font-semibold text-ink">Notas del deportista</p>
                      <p className="mt-1">{notes || "Sin notas registradas"}</p>
                    </div>
                    {quickFeedbackLabel ? (
                      <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                        <p className="font-semibold text-ink">Feedback rápido</p>
                        <p className="mt-1">{quickFeedbackLabel}</p>
                        {session.athleteQuickFeedbackNote ? <p className="mt-1">{session.athleteQuickFeedbackNote}</p> : null}
                      </div>
                    ) : null}
                    {resistanceMethod ? (
                      <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                        <p className="font-semibold text-ink">Método de resistencia</p>
                        <p className="mt-1">{getAthleteResistanceMethodLabel(resistanceMethod)}</p>
                      </div>
                    ) : null}
                    {resistanceZoneGuide.zone ? (
                      <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                        <p className="font-semibold text-ink">Zona objetivo planificada</p>
                        <p className="mt-1">{resistanceZoneGuide.profile.name} · {resistanceZoneGuide.zone.label}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {resistanceZoneGuide.metrics.length > 0 ? resistanceZoneGuide.metrics.map((metric) => (
                            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/60" key={metric}>
                              {metric}
                            </span>
                          )) : (
                            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">
                              Sin porcentajes añadidos todavía.
                            </span>
                          )}
                          <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/60">
                            {resistanceZoneGuide.profile.mainReferenceMetric}
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {session.discomfort?.hasDiscomfort ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-semibold">Molestia reportada</p>
                        <p className="mt-1">Zona corporal: {session.discomfort.bodyArea || "Sin especificar"}</p>
                        {session.discomfort.exerciseName ? <p className="mt-1">Ejercicio: {session.discomfort.exerciseName}</p> : null}
                        <p className="mt-1">Fase: {session.discomfort.phase || "Sin especificar"}</p>
                        <p className="mt-1">Intensidad: {session.discomfort.intensity ?? "Sin especificar"}/10</p>
                        {session.discomfort.notes ? <p className="mt-1">{session.discomfort.notes}</p> : null}
                      </div>
                    ) : null}
                    {hasResistanceData ? (
                      <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                        <p className="font-semibold text-ink">Resistencia realizada</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <p>Duración realizada: <span className="font-semibold text-ink">{hasDisplayValue(resistanceDuration) ? `${resistanceDuration} min` : "Sin registrar"}</span></p>
                          <p>Distancia: <span className="font-semibold text-ink">{formatResistanceDistance(session.cardioResult?.distanceMeters)}</span></p>
                          <p>RPE final: <span className="font-semibold text-ink">{hasDisplayValue(session.finalRpe) ? `${session.finalRpe}/10` : "Sin registrar"}</span></p>
                          <p>Deporte: <span className="font-semibold text-ink">{resistanceZoneGuide.zone ? resistanceZoneGuide.profile.name : "Sin especificar"}</span></p>
                          <p>Zona objetivo: <span className="font-semibold text-ink">{resistanceZoneGuide.zone?.label ?? session.cardioPlan?.targetZone?.toUpperCase() ?? "Sin especificar"}</span></p>
                          {session.cardioResult?.intervalsCompleted ? (
                            <p>Repeticiones / intervalos: <span className="font-semibold text-ink">{session.cardioResult.intervalsCompleted}</span></p>
                          ) : null}
                          {session.cardioResult?.intensityCompleted ? (
                            <p>Intensidad realizada: <span className="font-semibold text-ink">{session.cardioResult.intensityCompleted}</span></p>
                          ) : null}
                          {session.cardioResult?.recoveryCompleted ? (
                            <p>Recuperación realizada: <span className="font-semibold text-ink">{session.cardioResult.recoveryCompleted}</span></p>
                          ) : null}
                        </div>
                        {session.cardioResult?.notes ? (
                          <p className="mt-3 rounded-md border border-line bg-white px-3 py-2">{session.cardioResult.notes}</p>
                        ) : null}
                        {cardioZones.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {cardioZones.map((zone) => (
                              <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-ink/65" key={zone.label}>
                                {zone.label}: {zone.minutes} min
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {cardioDeviation ? <p className="mt-3 rounded-md bg-white px-3 py-2">{cardioDeviation.reading}</p> : null}
                      </div>
                    ) : null}
                    {session.reviewStatus === "reviewed" ? (
                      <div className="rounded-md border border-line bg-mint/50 p-3 text-sm text-ink/70">
                        <p className="font-semibold text-ink">Feedback del entrenador</p>
                        <p className="mt-1">{session.reviewNotes || "Sesión revisada por tu entrenador."}</p>
                      </div>
                    ) : session.reviewStatus === "pending" ? (
                      <p className="rounded-md border border-line bg-panel/35 px-3 py-2 text-sm font-medium text-ink/55">
                        Pendiente de revisión
                      </p>
                    ) : null}
                    {exerciseCount > 0 ? (
                      <div className="grid gap-3">
                        {detailRows.map(({ planned, performed }, exerciseIndex) => (
                          <article className="rounded-md border border-line bg-panel/35 p-3" key={`${sessionKey}-${exerciseIndex}`}>
                            <p className="font-semibold text-ink">{getExerciseLabel(performed ?? planned)}</p>
                            {getExerciseMetaLabel(performed ?? planned) ? (
                              <p className="mt-1 text-xs font-semibold text-ink/45">{getExerciseMetaLabel(performed ?? planned)}</p>
                            ) : null}
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                              {([
                                ["Series", getPlannedValue(planned, "sets"), getPerformedValue(performed, "sets")],
                                ["Reps", getPlannedValue(planned, "reps"), getPerformedValue(performed, "reps")],
                                ["Carga", getPlannedValue(planned, "load"), getPerformedValue(performed, "load")],
                                ["Descanso", getPlannedValue(planned, "rest"), getPerformedValue(performed, "rest")],
                                ["RIR", getPlannedValue(planned, "rir"), getPerformedValue(performed, "rir")],
                                ["RPE ejercicio", undefined, performed?.exerciseRpe]
                              ] as const).map(([label, plannedValue, performedValue]) => (
                                <div className="rounded-md border border-line bg-white px-3 py-2 text-sm" key={label}>
                                  <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
                                  <p className="mt-1 text-ink/70">Plan: <span className="font-semibold text-ink">{displayValue(plannedValue, "-")}</span></p>
                                  <p className="text-ink/70">Real: <span className="font-semibold text-ink">{displayValue(performedValue, "-")}</span></p>
                                </div>
                              ))}
                            </div>
                            {hasDisplayValue(performed?.athleteNotes) ? (
                              <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/65">{performed?.athleteNotes}</p>
                            ) : null}
                            {getSetDetailsReps(performed).length > 0 ? (
                              <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/65">
                                <span className="font-semibold text-ink">Detalle por serie: </span>
                                {getSetDetailsReps(performed).join(" / ")} reps
                              </p>
                            ) : null}
                            {performed?.techniqueVideoUrl ? (
                              <div className="mt-3 rounded-md border border-line bg-white p-3 text-sm text-ink/65">
                                <p className="font-semibold text-ink">Vídeo de técnica enviado</p>
                                <p className="mt-1">Vista: {techniqueVideoViewLabels[performed.techniqueVideoView ?? "other"]}</p>
                                {performed.techniqueVideoNote ? <p className="mt-1">Nota: {performed.techniqueVideoNote}</p> : null}
                                <a
                                  className="mt-2 inline-flex min-h-9 items-center rounded-md border border-line bg-panel/60 px-3 py-1.5 text-xs font-semibold text-ink"
                                  href={performed.techniqueVideoUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Abrir vídeo
                                </a>
                                {(performed.techniqueReview?.coachFeedback || performed.techniqueReview?.globalScore || performed.techniqueReview?.planningDecision || getTechniqueReviewMainItems(performed.techniqueReview).length > 0) ? (
                                  <div className="mt-3 rounded-md border border-line bg-panel/35 p-3">
                                    <p className="font-semibold text-ink">Revisión manual del entrenador.</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {performed.techniqueReview?.globalScore ? (
                                        <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">
                                          Valoración: {techniqueGlobalScoreLabels[performed.techniqueReview.globalScore]}
                                        </span>
                                      ) : null}
                                      {performed.techniqueReview?.planningDecision ? (
                                        <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">
                                          {athleteTechniquePlanningDecisionLabels[performed.techniqueReview.planningDecision]}
                                        </span>
                                      ) : null}
                                    </div>
                                    {performed.techniqueReview?.coachFeedback ? (
                                      <p className="mt-3 text-sm text-ink/70">{performed.techniqueReview.coachFeedback}</p>
                                    ) : null}
                                    {getTechniqueReviewMainItems(performed.techniqueReview).length > 0 ? (
                                      <div className="mt-3 grid gap-1 text-xs font-semibold text-ink/55">
                                        {getTechniqueReviewMainItems(performed.techniqueReview).map((item) => (
                                          <p key={item.id}>Punto a revisar: {item.label}</p>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm text-ink/55">
                        Sin datos de ejercicios para esta sesión.
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm font-semibold text-ink/55">
          Todavía no has completado ninguna sesión.
        </div>
      )}
    </section>
  );
}
