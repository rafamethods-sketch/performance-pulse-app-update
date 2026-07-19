"use client";

import { useMemo, useState } from "react";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { getExerciseById } from "@/lib/exercises";

type AthleteWellness = {
  fatigue?: number;
  motivation?: number;
  sleep?: number;
  soreness?: number;
  stress?: number;
};

type ReviewSessionExercise = {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
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
  sets?: number | string | null;
  setDetails?: Array<{
    reps?: number | string | null;
    setNumber: number;
  }>;
  targetRir?: number | string | null;
};

type ReviewSessionRecord = {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  exercises?: ReviewSessionExercise[];
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: ReviewSessionExercise[];
  plannedExercises?: ReviewSessionExercise[];
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  summary: string;
  type: string;
  wellness?: AthleteWellness;
};

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

function parsePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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
  if (session.reviewStatus === "reviewed") return "Revisada";
  if (session.reviewStatus === "pending" || hasRealSessionData(session)) return "Pendiente de revisar";
  return "Enviada";
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
  if (label === "Revisada") return "bg-mint text-moss";
  if (label === "Pendiente de revisar") return "bg-amber-100 text-amber-800";
  return "bg-blue-50 text-blue-700";
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
    <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">Historial</h2>
        <p className="text-sm text-ink/60">Sesiones completadas y enviadas al entrenador.</p>
      </div>

      {sessions.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {sessions.map((session, index) => {
            const sessionKey = getSessionHistoryKey(session, index);
            const isOpen = openSessionKey === sessionKey;
            const duration = getAthleteSessionDuration(session);
            const rpe = getAthleteSessionRpe(session);
            const srpe = getSessionSrpe(session);
            const notes = getAthleteSessionNotes(session);
            const { plannedExercises, performedExercises } = getReviewExercises(session);
            const exerciseCount = Math.max(plannedExercises.length, performedExercises.length);
            const detailRows = Array.from({ length: exerciseCount }, (_, exerciseIndex) => ({
              performed: performedExercises[exerciseIndex],
              planned: plannedExercises[exerciseIndex]
            }));

            return (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={sessionKey}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-ink/45">{displayValue(session.date, "Sin fecha")}</p>
                    <h3 className="mt-1 font-semibold text-ink">{displayValue(session.type, "Sesión")}</h3>
                    <p className="mt-1 text-sm text-ink/60">{displayValue(session.summary, "Sin resumen")}</p>
                  </div>
                  <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${getHistoryBadgeClass(getAthleteSessionReviewLabel(session))}`}>
                    {getAthleteSessionReviewLabel(session)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <ClientInfoCard label="Duración" value={hasDisplayValue(duration) ? `${duration} min` : "Pendiente"} />
                  <ClientInfoCard label="RPE final" value={hasDisplayValue(rpe) ? `${rpe}/10` : "Pendiente"} />
                  <ClientInfoCard label="sRPE" value={srpe !== null ? `${srpe} UA` : "Pendiente"} />
                </div>
                <button
                  className="mt-4 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                  onClick={() => setOpenSessionKey(isOpen ? "" : sessionKey)}
                  type="button"
                >
                  {isOpen ? "Ocultar detalle" : "Ver detalle"}
                </button>

                {isOpen ? (
                  <div className="mt-4 grid gap-3 rounded-md border border-line bg-white p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <ClientInfoCard label="Sueño" value={session.wellness?.sleep ? `${session.wellness.sleep}/5` : "Sin registrar"} />
                      <ClientInfoCard label="Fatiga" value={session.wellness?.fatigue ? `${session.wellness.fatigue}/5` : "Sin registrar"} />
                      <ClientInfoCard label="Estrés" value={session.wellness?.stress ? `${session.wellness.stress}/5` : "Sin registrar"} />
                      <ClientInfoCard label="DOMS" value={session.wellness?.soreness ? `${session.wellness.soreness}/5` : "Sin registrar"} />
                    </div>
                    <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                      <p className="font-semibold text-ink">Notas del deportista</p>
                      <p className="mt-1">{notes || "Sin notas registradas"}</p>
                    </div>
                    {exerciseCount > 0 ? (
                      <div className="grid gap-3">
                        {detailRows.map(({ planned, performed }, exerciseIndex) => (
                          <article className="rounded-md border border-line bg-panel/35 p-3" key={`${sessionKey}-${exerciseIndex}`}>
                            <p className="font-semibold text-ink">{getExerciseLabel(performed ?? planned)}</p>
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
