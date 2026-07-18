"use client";

import { useEffect, useState } from "react";
import { getExerciseById } from "@/lib/exercises";

type AthleteWellness = {
  fatigue: number;
  motivation: number;
  sleep: number;
  soreness: number;
  stress: number;
};

type AthleteExercise = {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  load?: number | string | null;
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
  targetRir?: number | string | null;
};

type AthleteSessionRecord = {
  actualDurationMinutes?: number | string | null;
  block?: string | null;
  completed?: boolean;
  date: string;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  performedExercises?: AthleteExercise[];
  plannedExercises?: AthleteExercise[];
  reviewStatus?: "pending" | "reviewed";
  sessionNumber?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  summary: string;
  targetRpe?: number | string | null;
  type: string;
  week?: number | string | null;
  weekLabel?: string | null;
  wellness?: AthleteWellness;
};

type AthleteClient = {
  id: string;
  name: string;
  sessionRecords: AthleteSessionRecord[];
};

type AthleteTodayViewProps<TClient extends AthleteClient> = {
  client: TClient | null;
  onShowCalendar: () => void;
  onShowHistory: () => void;
  onShowPlanning: () => void;
  onShowWeeklyLoad: () => void;
  onUpdateClient: (updatedClient: TClient) => void;
};

const emptyAthleteWellness: AthleteWellness = {
  fatigue: 0,
  motivation: 0,
  sleep: 0,
  soreness: 0,
  stress: 0
};

const athleteWellnessFields: Array<{ key: keyof AthleteWellness; label: string }> = [
  { key: "sleep", label: "Sueño" },
  { key: "fatigue", label: "Fatiga" },
  { key: "stress", label: "Estrés" },
  { key: "soreness", label: "DOMS" },
  { key: "motivation", label: "Motivación" }
];

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createAthleteExerciseEntries(session: AthleteSessionRecord | null) {
  return (session?.plannedExercises ?? []).map<AthleteExercise>((exercise) => ({
    ...exercise,
    athleteNotes: "",
    exerciseRpe: "",
    load: exercise.plannedLoad ?? exercise.load ?? "",
    reps: exercise.plannedReps ?? exercise.reps ?? "",
    rest: exercise.plannedRest ?? exercise.rest ?? "",
    rir: exercise.plannedRir ?? exercise.targetRir ?? "",
    sets: exercise.plannedSets ?? exercise.sets ?? ""
  }));
}

export function AthleteTodayView<TClient extends AthleteClient>({
  client,
  onShowCalendar,
  onShowHistory,
  onShowPlanning,
  onShowWeeklyLoad,
  onUpdateClient
}: AthleteTodayViewProps<TClient>) {
  const todayKey = getLocalDateKey();
  const sessionIndex = client
    ? client.sessionRecords.findIndex((record) => record.date === todayKey)
    : -1;
  const session = client && sessionIndex >= 0 ? client.sessionRecords[sessionIndex] : null;
  const [wellness, setWellness] = useState<AthleteWellness>(emptyAthleteWellness);
  const [wellnessConfirmed, setWellnessConfirmed] = useState(false);
  const [performedExercises, setPerformedExercises] = useState<AthleteExercise[]>([]);
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);
  const [finalRpe, setFinalRpe] = useState(0);
  const [athleteSessionNotes, setAthleteSessionNotes] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const calculatedSrpe = actualDurationMinutes > 0 && finalRpe > 0
    ? actualDurationMinutes * finalRpe
    : null;
  const wellnessComplete = Object.values(wellness).every((value) => value >= 1 && value <= 5);

  useEffect(() => {
    setWellness(session?.wellness ?? emptyAthleteWellness);
    setWellnessConfirmed(false);
    setPerformedExercises(createAthleteExerciseEntries(session));
    setActualDurationMinutes(0);
    setFinalRpe(0);
    setAthleteSessionNotes("");
    setValidationMessage("");
  }, [session]);

  function updateExercise(index: number, updates: Partial<AthleteExercise>) {
    setPerformedExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...updates } : exercise
      )
    );
  }

  function submitSession() {
    if (!client || !session || sessionIndex < 0) return;
    if (actualDurationMinutes <= 0 || finalRpe <= 0) {
      setValidationMessage("Completa la duración real y el RPE final antes de enviar.");
      return;
    }

    const updatedSession: AthleteSessionRecord = {
      ...session,
      actualDurationMinutes,
      completed: true,
      finalNotes: athleteSessionNotes.trim(),
      finalRpe,
      performedExercises,
      reviewStatus: "pending",
      sRPE: actualDurationMinutes * finalRpe,
      status: "Completada",
      wellness
    };

    onUpdateClient({
      ...client,
      sessionRecords: client.sessionRecords.map((record, index) =>
        index === sessionIndex ? updatedSession : record
      )
    } as TClient);
    setValidationMessage("");
  }

  if (!client) {
    return (
      <AthleteEmptyState message="No hay deportista seleccionado." />
    );
  }

  if (!session) {
    return (
      <AthleteEmptyState
        clientName={client.name}
        message="No tienes ninguna sesión asignada para hoy."
        onShowCalendar={onShowCalendar}
        onShowHistory={onShowHistory}
        onShowPlanning={onShowPlanning}
        onShowWeeklyLoad={onShowWeeklyLoad}
      />
    );
  }

  const sessionAlreadySent = session.completed || session.status === "Completada";
  const sessionStatusLabel = session.reviewStatus === "reviewed"
    ? "Revisada"
    : sessionAlreadySent
      ? "Enviada al entrenador"
      : "Pendiente";

  return (
    <div className="mx-auto mt-5 max-w-3xl space-y-5">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Sesión de hoy</h2>
            <p className="mt-1 text-sm font-medium text-ink/70">{client.name}</p>
          </div>
          <span className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${sessionAlreadySent ? "bg-mint text-moss" : "bg-blue-50 text-blue-700"}`}>
            {sessionStatusLabel}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ClientInfoCard label="Bloque / mesociclo" value={`${session.block || "Sin asignar"}`} />
          <ClientInfoCard
            label="Semana y sesión"
            value={`${session.weekLabel || session.week || "Sin asignar"}${session.sessionNumber ? ` · Sesión ${session.sessionNumber}` : ""}`}
          />
          <ClientInfoCard label="Tipo" value={session.type} />
          <ClientInfoCard label="RPE objetivo" value={session.targetRpe ? `${session.targetRpe}/10` : "Sin especificar"} />
        </div>
        <div className="mt-4 rounded-md bg-panel/45 p-4">
          <p className="text-xs font-semibold uppercase text-ink/50">Resumen / objetivo</p>
          <p className="mt-2 text-sm font-medium text-ink">{session.summary}</p>
        </div>
      </section>

      {sessionAlreadySent ? (
        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-center shadow-soft">
          <h3 className="font-semibold text-emerald-900">Sesión enviada al entrenador.</h3>
          <p className="mt-2 text-sm text-emerald-800">sRPE: {session.sRPE ? `${session.sRPE} UA` : "Pendiente"}</p>
        </section>
      ) : (
        <>
          <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
            <h3 className="text-lg font-semibold text-ink">Wellness previo</h3>
            <p className="mt-1 text-sm text-ink/60">Valora cómo te encuentras antes de empezar.</p>
            <div className="mt-4 space-y-3">
              {athleteWellnessFields.map((field) => (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={field.key}>
                  <p className="text-sm font-medium text-ink">{field.label}</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        aria-pressed={wellness[field.key] === value}
                        className={`h-10 rounded-md border text-sm font-semibold ${wellness[field.key] === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"}`}
                        key={`${field.key}-${value}`}
                        onClick={() => setWellness((current) => ({ ...current, [field.key]: value }))}
                        type="button"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-4 h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!wellnessComplete}
              onClick={() => setWellnessConfirmed(true)}
              type="button"
            >
              Confirmar wellness
            </button>
          </section>

          {wellnessConfirmed ? (
            <>
              <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                <h3 className="text-lg font-semibold text-ink">Ejercicios planificados</h3>
                <div className="mt-4 space-y-4">
                  {performedExercises.length > 0 ? performedExercises.map((exercise, index) => (
                    <AthleteExerciseCard
                      exercise={exercise}
                      index={index}
                      key={exercise.id || `${exercise.exerciseName}-${index}`}
                      onUpdate={updateExercise}
                    />
                  )) : (
                    <p className="rounded-md border border-dashed border-line p-5 text-center text-sm text-ink/55">
                      Esta sesión no tiene ejercicios planificados.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Registro final de sesión</h3>
                    <p className="mt-1 text-sm text-ink/60">Completa los datos reales al terminar.</p>
                  </div>
                  <span className="w-fit rounded-md bg-panel/60 px-3 py-1 text-sm font-semibold text-ink">
                    sRPE: {calculatedSrpe ? `${calculatedSrpe} UA` : "Pendiente"}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AthleteNumberField label="Duración real en minutos" onChange={setActualDurationMinutes} value={actualDurationMinutes} />
                  <AthleteNumberField label="RPE final de sesión" max={10} onChange={setFinalRpe} value={finalRpe} />
                </div>
                <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
                  Notas generales
                  <textarea
                    className="min-h-24 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setAthleteSessionNotes(event.target.value)}
                    placeholder="Sensaciones, molestias o cambios realizados"
                    value={athleteSessionNotes}
                  />
                </label>
                <button className="mt-4 h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white" onClick={submitSession} type="button">
                  Enviar sesión al entrenador
                </button>
                {validationMessage ? <p className="mt-3 text-sm font-medium text-red-700">{validationMessage}</p> : null}
              </section>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm text-ink/55">
              Completa y confirma primero el wellness previo.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AthleteEmptyState({
  clientName,
  message,
  onShowCalendar,
  onShowHistory,
  onShowPlanning,
  onShowWeeklyLoad
}: {
  clientName?: string;
  message: string;
  onShowCalendar?: () => void;
  onShowHistory?: () => void;
  onShowPlanning?: () => void;
  onShowWeeklyLoad?: () => void;
}) {
  return (
    <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Sesión de hoy</h2>
      {clientName ? <p className="mt-1 text-sm font-medium text-ink/70">{clientName}</p> : null}
      <p className="mt-3 text-sm text-ink/60">{message}</p>
      {onShowCalendar && onShowHistory && onShowPlanning && onShowWeeklyLoad ? (
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
            onClick={onShowCalendar}
            type="button"
          >
            Ver calendario
          </button>
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
            onClick={onShowWeeklyLoad}
            type="button"
          >
            Ver carga semanal
          </button>
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
            onClick={onShowHistory}
            type="button"
          >
            Ver historial
          </button>
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            onClick={onShowPlanning}
            type="button"
          >
            Ver planificación
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md bg-panel/45 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function AthleteNumberField({ label, max, onChange, value }: { label: string; max?: number; onChange: (value: number) => void; value: number }) {
  return (
    <label className="space-y-2 text-sm font-medium text-ink/75">
      {label}
      <input
        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
        max={max}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value || ""}
      />
    </label>
  );
}

function AthleteExerciseCard({ exercise, index, onUpdate }: {
  exercise: AthleteExercise;
  index: number;
  onUpdate: (index: number, updates: Partial<AthleteExercise>) => void;
}) {
  const exerciseName = exercise.exerciseName || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
  return (
    <article className="rounded-md border border-line bg-panel/35 p-4">
      <p className="font-semibold text-ink">{exerciseName}</p>
      <p className="mt-1 text-xs text-ink/55">Bloque: {exercise.block || exercise.section || "Principal"}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/65">
        <span className="rounded-md bg-white px-2 py-1">{exercise.plannedSets || "-"} series</span>
        <span className="rounded-md bg-white px-2 py-1">{exercise.plannedReps || "-"} reps</span>
        <span className="rounded-md bg-white px-2 py-1">{exercise.plannedLoad || "-"} kg</span>
        <span className="rounded-md bg-white px-2 py-1">Descanso {exercise.plannedRest || "-"}</span>
        <span className="rounded-md bg-white px-2 py-1">RIR {exercise.plannedRir || "-"}</span>
      </div>
      {exercise.observation ? <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-ink/65">{exercise.observation}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <AthleteExerciseInput label="Series realizadas" onChange={(value) => onUpdate(index, { sets: value })} value={exercise.sets} />
        <AthleteExerciseInput label="Reps realizadas" onChange={(value) => onUpdate(index, { reps: value })} value={exercise.reps} />
        <AthleteExerciseInput label="Carga real" onChange={(value) => onUpdate(index, { load: value })} value={exercise.load} />
        <AthleteExerciseInput label="Descanso real" onChange={(value) => onUpdate(index, { actualRest: value, rest: value })} value={exercise.actualRest ?? exercise.rest} />
        <AthleteExerciseInput label="RPE ejercicio" max={10} onChange={(value) => onUpdate(index, { exerciseRpe: value })} value={exercise.exerciseRpe} />
        <AthleteExerciseInput label="RIR real" onChange={(value) => onUpdate(index, { rir: value })} value={exercise.rir} />
      </div>
      <label className="mt-3 block space-y-1 text-xs font-medium text-ink/65">
        Notas del deportista
        <textarea
          className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss"
          onChange={(event) => onUpdate(index, { athleteNotes: event.target.value })}
          value={exercise.athleteNotes ?? ""}
        />
      </label>
    </article>
  );
}

function AthleteExerciseInput({ label, max, onChange, value }: {
  label: string;
  max?: number;
  onChange: (value: string) => void;
  value?: number | string | null;
}) {
  return (
    <label className="space-y-1 text-xs font-medium text-ink/65">
      {label}
      <input
        className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-moss"
        max={max}
        min={0}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value ?? ""}
      />
    </label>
  );
}
