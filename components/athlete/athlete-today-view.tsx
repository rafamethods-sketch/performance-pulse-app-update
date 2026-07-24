"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { getExerciseById } from "@/lib/exercises";
import type { CardioPlan, CardioResult, CardioZone } from "@/lib/cardio-deviation";

type AthleteWellness = {
  fatigue: number;
  motivation: number;
  sleep: number;
  soreness: number;
  stress: number;
};

type AthleteSetDetail = {
  load?: number | string | null;
  percent1RM?: number | string | null;
  rpe?: number | string | null;
  reps?: number | string | null;
  rir?: number | string | null;
  setNumber: number;
  velocity?: number | string | null;
};

type AthleteExercise = {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  intensityMethod?: string | null;
  load?: number | string | null;
  name?: string | null;
  observation?: string | null;
  percent1RM?: number | string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  section?: string | null;
  selectedEquipment?: string | null;
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  sets?: number | string | null;
  setDetails?: AthleteSetDetail[];
  targetVelocity?: number | string | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
};

type AthleteSessionDiscomfort = {
  bodyArea?: string;
  exerciseId?: string;
  exerciseName?: string;
  hasDiscomfort: boolean;
  intensity?: number;
  notes?: string;
  phase?: string;
};

type AthleteSessionRecord = {
  actualDurationMinutes?: number | string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: CardioResult;
  completed?: boolean;
  date: string;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  discomfort?: AthleteSessionDiscomfort;
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

type AthleteExerciseBlockKey = "activation" | "main" | "auxiliary";

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

const discomfortPhases = [
  "Calentamiento",
  "Inicio de la serie",
  "Fase excéntrica",
  "Fase concéntrica",
  "Fase isométrica",
  "Aterrizaje / impacto",
  "Final de la serie",
  "Después del ejercicio",
  "Después de la sesión"
];

const athleteExerciseBlocks: Array<{ key: AthleteExerciseBlockKey; label: string }> = [
  { key: "activation", label: "ACTIVACIÓN" },
  { key: "main", label: "BLOQUE PRINCIPAL" },
  { key: "auxiliary", label: "BLOQUE AUXILIAR / OPCIONAL" }
];

const cardioZoneFields: Array<{ key: CardioZone; label: string }> = [
  { key: "z1", label: "Z1" },
  { key: "z2", label: "Z2" },
  { key: "z3", label: "Z3" },
  { key: "z4", label: "Z4" },
  { key: "z5", label: "Z5" }
];

const cardioSportLabels: Record<NonNullable<CardioPlan["sport"]>, string> = {
  other: "Otro",
  ride: "Ciclismo",
  row: "Remo",
  run: "Carrera",
  swim: "Natación",
  walk: "Caminar"
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsePositiveNumber(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getSetDetailsRepSum(setDetails?: AthleteSetDetail[]) {
  return (setDetails ?? []).reduce((total, detail) => total + parsePositiveNumber(detail.reps), 0);
}

function normalizeSetDetails(exercise: AthleteExercise) {
  return (exercise.setDetails ?? []).map((detail, index) => ({
    load: detail.load ?? "",
    percent1RM: detail.percent1RM ?? "",
    reps: detail.reps ?? "",
    rpe: detail.rpe ?? "",
    rir: detail.rir ?? "",
    setNumber: index + 1,
    velocity: detail.velocity ?? ""
  }));
}

function buildCardioResultFromDraft(draft: {
  distanceMeters: string;
  durationMinutes: string;
  perceivedRpe: string;
  timeInZonesMinutes: Record<CardioZone, string>;
}): CardioResult | undefined {
  const durationMinutes = parsePositiveNumber(draft.durationMinutes);
  const distanceMeters = parsePositiveNumber(draft.distanceMeters);
  const perceivedRpe = parsePositiveNumber(draft.perceivedRpe);
  const timeInZones: CardioResult["timeInZones"] = {};

  cardioZoneFields.forEach((zone) => {
    const minutes = parsePositiveNumber(draft.timeInZonesMinutes[zone.key]);
    if (minutes > 0) timeInZones![zone.key] = minutes * 60;
  });

  const result: CardioResult = {
    source: "manual"
  };
  if (durationMinutes > 0) result.durationMinutes = durationMinutes;
  if (distanceMeters > 0) result.distanceMeters = distanceMeters;
  if (perceivedRpe > 0) result.perceivedRpe = perceivedRpe;
  if (Object.keys(timeInZones).length > 0) result.timeInZones = timeInZones;

  return Object.keys(result).length > 1 ? result : undefined;
}

function createAthleteExerciseEntries(session: AthleteSessionRecord | null) {
  return (session?.plannedExercises ?? []).map<AthleteExercise>((exercise) => {
    const nextExercise = {
      ...exercise,
      athleteNotes: "",
      exerciseRpe: "",
      load: "",
      plannedLoad: exercise.plannedLoad ?? exercise.load ?? "",
      plannedReps: exercise.plannedReps ?? exercise.reps ?? "",
      plannedRest: exercise.plannedRest ?? exercise.rest ?? "",
      plannedRir: exercise.plannedRir ?? exercise.targetRir ?? "",
      plannedSets: exercise.plannedSets ?? exercise.sets ?? "",
      reps: "",
      rest: "",
      rir: "",
      sets: ""
    };

    return {
      ...nextExercise,
      setDetails: normalizeSetDetails(exercise)
    };
  });
}

function hasAthleteDisplayValue(value?: number | string | null) {
  return value !== undefined && value !== null && `${value}`.trim() !== "";
}

function getAthleteExercisePrescription(exercise: AthleteExercise) {
  const targetRpe = exercise.plannedRpe ?? exercise.targetRpe;
  const volume = hasAthleteDisplayValue(exercise.plannedSets) && hasAthleteDisplayValue(exercise.plannedReps)
    ? `${exercise.plannedSets}x${exercise.plannedReps}`
    : [
        hasAthleteDisplayValue(exercise.plannedSets) ? `${exercise.plannedSets} series` : "",
        hasAthleteDisplayValue(exercise.plannedReps) ? `${exercise.plannedReps} reps` : ""
      ].filter(Boolean).join(" · ");
  const method = exercise.intensityMethod;
  const intensity =
    method === "velocity" && hasAthleteDisplayValue(exercise.targetVelocity) ? `${exercise.targetVelocity} m/s`
      : method === "rpe" && hasAthleteDisplayValue(targetRpe) ? `RPE ${targetRpe}`
      : method === "percent_1rm" && hasAthleteDisplayValue(exercise.percent1RM) ? `${exercise.percent1RM}% 1RM`
      : method === "rir" && hasAthleteDisplayValue(exercise.plannedRir ?? exercise.targetRir) ? `RIR ${exercise.plannedRir ?? exercise.targetRir}`
      : hasAthleteDisplayValue(exercise.targetVelocity) ? `${exercise.targetVelocity} m/s`
      : hasAthleteDisplayValue(targetRpe) ? `RPE ${targetRpe}`
      : hasAthleteDisplayValue(exercise.plannedRir ?? exercise.targetRir) ? `RIR ${exercise.plannedRir ?? exercise.targetRir}`
      : hasAthleteDisplayValue(exercise.percent1RM) ? `${exercise.percent1RM}% 1RM`
      : "";
  const load = hasAthleteDisplayValue(exercise.plannedLoad) ? `${exercise.plannedLoad} kg` : "";
  const restValue = formatAthleteRestDuration(exercise.plannedRest ?? exercise.rest);
  const rest = restValue ? restValue : "";

  return [volume, load, rest, intensity].filter(Boolean);
}

function formatAthleteRestDuration(value?: number | string | null) {
  if (!hasAthleteDisplayValue(value)) return "";
  const rawValue = `${value}`.trim();
  const normalizedValue = rawValue.replace(",", ".").toLowerCase();
  const colonMatch = normalizedValue.match(/^(\d{1,2}):(\d{1,2})$/);

  if (colonMatch) {
    const minutes = Number(colonMatch[1]);
    const seconds = Number(colonMatch[2]);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return `${minutes.toString().padStart(2, "0")}:${Math.min(seconds, 59).toString().padStart(2, "0")}`;
    }
  }

  const secondsMatch = normalizedValue.match(/^(\d+(?:\.\d+)?)\s*(s|seg|sec|")?$/);
  if (secondsMatch) {
    const totalSeconds = Number(secondsMatch[1]);
    if (Number.isFinite(totalSeconds)) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.round(totalSeconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  const minutesMatch = normalizedValue.match(/^(\d+(?:\.\d+)?)\s*(min|m)$/);
  if (minutesMatch) {
    const totalSeconds = Math.round(Number(minutesMatch[1]) * 60);
    if (Number.isFinite(totalSeconds)) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  return rawValue;
}

function getAthleteExerciseMaterialVariant(exercise: AthleteExercise) {
  return [
    hasAthleteDisplayValue(exercise.selectedEquipment) ? `Material: ${exercise.selectedEquipment}` : "",
    hasAthleteDisplayValue(exercise.selectedVariantName) ? `Variante: ${exercise.selectedVariantName}` : ""
  ].filter(Boolean).join(" · ");
}

function getAthleteExerciseBlockKey(exercise: AthleteExercise): AthleteExerciseBlockKey {
  const block = `${exercise.block ?? exercise.section ?? ""}`.toLowerCase();
  if (block === "activation") return "activation";
  if (block === "auxiliary" || block === "accessory") return "auxiliary";
  return "main";
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
  const [collapsedExerciseBlocks, setCollapsedExerciseBlocks] = useState<Record<AthleteExerciseBlockKey, boolean>>({
    activation: false,
    auxiliary: false,
    main: false
  });
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);
  const [finalRpe, setFinalRpe] = useState(0);
  const [athleteSessionNotes, setAthleteSessionNotes] = useState("");
  const [discomfortAnswer, setDiscomfortAnswer] = useState<"" | "no" | "yes">("");
  const [discomfortDraft, setDiscomfortDraft] = useState({
    bodyArea: "",
    exerciseKey: "",
    intensity: 0,
    notes: "",
    phase: ""
  });
  const [cardioResultDraft, setCardioResultDraft] = useState({
    distanceMeters: "",
    durationMinutes: "",
    perceivedRpe: "",
    timeInZonesMinutes: {
      z1: "",
      z2: "",
      z3: "",
      z4: "",
      z5: ""
    } as Record<CardioZone, string>
  });
  const [validationMessage, setValidationMessage] = useState("");
  const calculatedSrpe = actualDurationMinutes > 0 && finalRpe > 0
    ? actualDurationMinutes * finalRpe
    : null;
  const wellnessComplete = Object.values(wellness).every((value) => value >= 1 && value <= 5);
  const finalRpeValid = finalRpe >= 1 && finalRpe <= 10;
  const durationValid = actualDurationMinutes > 0;
  const discomfortValid =
    discomfortAnswer === "no" ||
    (discomfortAnswer === "yes" &&
      discomfortDraft.bodyArea.trim().length > 0 &&
      discomfortDraft.phase.trim().length > 0 &&
      discomfortDraft.intensity >= 1 &&
      discomfortDraft.intensity <= 10);
  const canSubmitSession = finalRpeValid && durationValid && discomfortValid;

  useEffect(() => {
    setWellness(session?.wellness ?? emptyAthleteWellness);
    setWellnessConfirmed(false);
    setPerformedExercises(createAthleteExerciseEntries(session));
    setCollapsedExerciseBlocks({
      activation: false,
      auxiliary: false,
      main: false
    });
    setActualDurationMinutes(0);
    setFinalRpe(0);
    setAthleteSessionNotes("");
    setDiscomfortAnswer("");
    setDiscomfortDraft({
      bodyArea: "",
      exerciseKey: "",
      intensity: 0,
      notes: "",
      phase: ""
    });
    setCardioResultDraft({
      distanceMeters: "",
      durationMinutes: "",
      perceivedRpe: "",
      timeInZonesMinutes: {
        z1: "",
        z2: "",
        z3: "",
        z4: "",
        z5: ""
      }
    });
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
    if (!finalRpeValid) {
      setValidationMessage("Introduce el RPE final de la sesión para poder enviarla.");
      return;
    }
    if (!durationValid) {
      setValidationMessage("Introduce la duración real de la sesión para poder enviarla.");
      return;
    }
    if (!discomfortAnswer) {
      setValidationMessage("Indica si has tenido alguna molestia durante la sesión.");
      return;
    }
    if (!discomfortValid) {
      setValidationMessage("Completa zona corporal, fase e intensidad de la molestia para poder enviar la sesión.");
      return;
    }

    const discomfortExerciseIndex = Number(discomfortDraft.exerciseKey);
    const discomfortExercise = Number.isInteger(discomfortExerciseIndex)
      ? performedExercises[discomfortExerciseIndex]
      : undefined;
    const discomfort: AthleteSessionDiscomfort = discomfortAnswer === "yes"
      ? {
          bodyArea: discomfortDraft.bodyArea.trim(),
          exerciseId: discomfortExercise?.exerciseId ?? undefined,
          exerciseName: discomfortExercise?.exerciseName ?? discomfortExercise?.name ?? undefined,
          hasDiscomfort: true,
          intensity: discomfortDraft.intensity,
          notes: discomfortDraft.notes.trim() || undefined,
          phase: discomfortDraft.phase
        }
      : {
          hasDiscomfort: false
        };

    const updatedSession: AthleteSessionRecord = {
      ...session,
      actualDurationMinutes,
      cardioResult: session.cardioPlan ? buildCardioResultFromDraft(cardioResultDraft) : session.cardioResult,
      completed: true,
      discomfort,
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
        <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
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
            <div className="mt-4 grid gap-3">
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
                  {performedExercises.length > 0 ? athleteExerciseBlocks.map((block) => {
                    const blockExercises = performedExercises
                      .map((exercise, index) => ({ exercise, index }))
                      .filter(({ exercise }) => getAthleteExerciseBlockKey(exercise) === block.key);
                    const isCollapsed = collapsedExerciseBlocks[block.key];
                    const exerciseCountLabel = `${blockExercises.length} ${blockExercises.length === 1 ? "ejercicio" : "ejercicios"}`;
                    if (blockExercises.length === 0) return null;

                    return (
                      <section className="rounded-md border border-line bg-panel/35 p-3" key={block.key}>
                        <button
                          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-semibold uppercase tracking-wide text-ink transition hover:text-moss"
                          onClick={() => setCollapsedExerciseBlocks((current) => ({ ...current, [block.key]: !current[block.key] }))}
                          type="button"
                        >
                          <span className="text-lg leading-none">{isCollapsed ? "›" : "⌄"}</span>
                          <span>{block.label} · {exerciseCountLabel}</span>
                        </button>
                        {!isCollapsed ? (
                          <div className="mt-3 grid gap-3">
                            {blockExercises.map(({ exercise, index }) => (
                              <AthleteExerciseCard
                                exercise={exercise}
                                index={index}
                                key={exercise.id || `${exercise.exerciseName}-${index}`}
                                onUpdate={updateExercise}
                              />
                            ))}
                          </div>
                        ) : null}
                      </section>
                    );
                  }) : (
                    <p className="rounded-md border border-dashed border-line p-5 text-center text-sm text-ink/55">
                      Esta sesión no tiene ejercicios planificados.
                    </p>
                  )}
                </div>
              </section>

              {session.cardioPlan ? (
                <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">Cardio / resistencia</h3>
                      <p className="mt-1 text-sm text-ink/60">Registra solo datos agregados de la parte de cardio.</p>
                    </div>
                    <span className="w-fit rounded-md bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/65">
                      {session.cardioPlan.targetZone ? session.cardioPlan.targetZone.toUpperCase() : "Sin zona objetivo"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <ClientInfoCard label="Modalidad" value={session.cardioPlan.sport ? cardioSportLabels[session.cardioPlan.sport] : "Sin especificar"} />
                    <ClientInfoCard label="Duración objetivo" value={session.cardioPlan.targetDurationMinutes ? `${session.cardioPlan.targetDurationMinutes} min` : "Sin especificar"} />
                    <ClientInfoCard label="Distancia objetivo" value={session.cardioPlan.targetDistanceMeters ? `${session.cardioPlan.targetDistanceMeters} m` : "Sin especificar"} />
                    <ClientInfoCard
                      label="RPE objetivo"
                      value={session.cardioPlan.targetRpeMin && session.cardioPlan.targetRpeMax ? `${session.cardioPlan.targetRpeMin}-${session.cardioPlan.targetRpeMax}/10` : "Sin especificar"}
                    />
                  </div>
                  {session.cardioPlan.notes ? (
                    <p className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/65">{session.cardioPlan.notes}</p>
                  ) : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Duración real en minutos
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        inputMode="decimal"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, durationMinutes: event.target.value }))}
                        type="text"
                        value={cardioResultDraft.durationMinutes}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Distancia real
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        inputMode="decimal"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, distanceMeters: event.target.value }))}
                        placeholder="Metros"
                        type="text"
                        value={cardioResultDraft.distanceMeters}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                      RPE percibido de cardio
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        inputMode="decimal"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, perceivedRpe: event.target.value }))}
                        placeholder="Opcional"
                        type="text"
                        value={cardioResultDraft.perceivedRpe}
                      />
                    </label>
                  </div>
                  <div className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                    <p className="text-sm font-semibold text-ink">Tiempo en zonas</p>
                    <p className="mt-1 text-xs text-ink/50">Introduce minutos por zona solo si los tienes. Se guardan internamente en segundos.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-5">
                      {cardioZoneFields.map((zone) => (
                        <label className="space-y-1 text-xs font-semibold text-ink/60" key={zone.key}>
                          {zone.label}
                          <input
                            className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-moss"
                            inputMode="decimal"
                            onChange={(event) =>
                              setCardioResultDraft((current) => ({
                                ...current,
                                timeInZonesMinutes: {
                                  ...current.timeInZonesMinutes,
                                  [zone.key]: event.target.value
                                }
                              }))
                            }
                            type="text"
                            value={cardioResultDraft.timeInZonesMinutes[zone.key]}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

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
                {!finalRpeValid ? (
                  <p className="mt-3 text-sm font-medium text-amber-800">
                    Introduce el RPE final de la sesión para poder enviarla.
                  </p>
                ) : null}
                <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
                  <p className="text-sm font-semibold text-ink">¿Has tenido alguna molestia durante la sesión?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      ["no", "No"],
                      ["yes", "Sí"]
                    ] as const).map(([value, label]) => (
                      <button
                        aria-pressed={discomfortAnswer === value}
                        className={`rounded-md border px-4 py-2 text-sm font-semibold ${discomfortAnswer === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"}`}
                        key={value}
                        onClick={() => {
                          setDiscomfortAnswer(value);
                          setValidationMessage("");
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {!discomfortAnswer ? (
                    <p className="mt-2 text-sm font-medium text-amber-800">Responde esta pregunta para poder enviar la sesión.</p>
                  ) : null}

                  {discomfortAnswer === "yes" ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium text-ink/75">
                        Zona corporal
                        <input
                          className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                          onChange={(event) => setDiscomfortDraft((current) => ({ ...current, bodyArea: event.target.value }))}
                          placeholder="Ej: rodilla derecha, lumbar, hombro"
                          value={discomfortDraft.bodyArea}
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-ink/75">
                        Ejercicio relacionado
                        <select
                          className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                          onChange={(event) => setDiscomfortDraft((current) => ({ ...current, exerciseKey: event.target.value }))}
                          value={discomfortDraft.exerciseKey}
                        >
                          <option value="">Sin asociar</option>
                          {performedExercises.map((exercise, index) => (
                            <option key={`${exercise.id || exercise.exerciseName}-${index}`} value={`${index}`}>
                              {exercise.exerciseName || exercise.name || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar"}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-ink/75">
                        Fase del ejercicio
                        <select
                          className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                          onChange={(event) => setDiscomfortDraft((current) => ({ ...current, phase: event.target.value }))}
                          value={discomfortDraft.phase}
                        >
                          <option value="">Selecciona una fase</option>
                          {discomfortPhases.map((phase) => (
                            <option key={phase} value={phase}>{phase}</option>
                          ))}
                        </select>
                      </label>
                      <AthleteNumberField
                        label="Intensidad 1-10"
                        max={10}
                        min={1}
                        onChange={(value) => setDiscomfortDraft((current) => ({ ...current, intensity: value }))}
                        value={discomfortDraft.intensity}
                      />
                      <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                        Descripción breve
                        <textarea
                          className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                          onChange={(event) => setDiscomfortDraft((current) => ({ ...current, notes: event.target.value }))}
                          placeholder="Opcional: cuándo apareció, sensación, si cambió al ajustar..."
                          value={discomfortDraft.notes}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
                <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
                  Notas generales
                  <textarea
                    className="min-h-20 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setAthleteSessionNotes(event.target.value)}
                    placeholder="Sensaciones, molestias o cambios realizados"
                    value={athleteSessionNotes}
                  />
                </label>
                <button
                  className="mt-4 h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!canSubmitSession}
                  onClick={submitSession}
                  type="button"
                >
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
    <div className={`rounded-md border border-line bg-panel/35 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function AthleteNumberField({ label, max, min = 0, onChange, value }: { label: string; max?: number; min?: number; onChange: (value: number) => void; value: number }) {
  return (
    <label className="space-y-2 text-sm font-medium text-ink/75">
      {label}
      <input
        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
        inputMode="decimal"
        onChange={(event) => {
          const parsed = Number(event.target.value.replace(",", "."));
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        placeholder={max ? `${min}-${max}` : undefined}
        type="text"
        value={value || ""}
      />
    </label>
  );
}

function getAthleteExerciseIntensityMethod(exercise: AthleteExercise) {
  if (exercise.intensityMethod) return exercise.intensityMethod;
  if (hasAthleteDisplayValue(exercise.plannedRir ?? exercise.targetRir)) return "rir";
  if (hasAthleteDisplayValue(exercise.plannedRpe ?? exercise.targetRpe)) return "rpe";
  if (hasAthleteDisplayValue(exercise.percent1RM)) return "percent_1rm";
  if (hasAthleteDisplayValue(exercise.targetVelocity)) return "velocity";
  return "";
}

function getLastSetValue(setDetails: AthleteSetDetail[], field: keyof AthleteSetDetail) {
  const matchingDetail = [...setDetails].reverse().find((detail) => hasAthleteDisplayValue(detail[field] as number | string | null));
  return matchingDetail ? matchingDetail[field] : "";
}

function getCleanSetDetails(setDetails: AthleteSetDetail[], method: string) {
  return setDetails.map((detail, index) => {
    const nextDetail: AthleteSetDetail = {
      setNumber: index + 1
    };

    if (hasAthleteDisplayValue(detail.reps)) nextDetail.reps = detail.reps;
    if (hasAthleteDisplayValue(detail.load)) nextDetail.load = detail.load;
    if (method === "rir" && hasAthleteDisplayValue(detail.rir)) nextDetail.rir = detail.rir;
    if (method === "rpe" && hasAthleteDisplayValue(detail.rpe)) nextDetail.rpe = detail.rpe;
    if (method === "percent_1rm" && hasAthleteDisplayValue(detail.percent1RM)) nextDetail.percent1RM = detail.percent1RM;
    if (method === "velocity" && hasAthleteDisplayValue(detail.velocity)) nextDetail.velocity = detail.velocity;

    return nextDetail;
  });
}

function getUpdatedExerciseFromSetDetails(exercise: AthleteExercise, setDetails: AthleteSetDetail[]) {
  const repSum = getSetDetailsRepSum(setDetails);
  const method = getAthleteExerciseIntensityMethod(exercise);
  const cleanSetDetails = getCleanSetDetails(setDetails, method);
  const updates: Partial<AthleteExercise> = {
    reps: repSum > 0 ? `${repSum}` : exercise.reps,
    setDetails: cleanSetDetails,
    sets: setDetails.length > 0 ? `${setDetails.length}` : ""
  };

  const lastLoad = getLastSetValue(setDetails, "load");
  if (hasAthleteDisplayValue(lastLoad as number | string | null)) updates.load = lastLoad as number | string;

  if (method === "rir") {
    const lastRir = getLastSetValue(setDetails, "rir");
    if (hasAthleteDisplayValue(lastRir as number | string | null)) updates.rir = lastRir as number | string;
  }

  if (method === "rpe") {
    const lastRpe = getLastSetValue(setDetails, "rpe");
    if (hasAthleteDisplayValue(lastRpe as number | string | null)) updates.exerciseRpe = lastRpe as number | string;
  }

  return updates;
}

function handleAthleteSetKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  exerciseKey: string,
  setIndex: number,
  field: string,
  setCount: number
) {
  const fieldOrder = ["reps", "load", "intensity"];
  const currentFieldIndex = fieldOrder.indexOf(field);
  let nextSetIndex = setIndex;
  let nextField = field;

  if (event.key === "ArrowRight") {
    if (currentFieldIndex >= fieldOrder.length - 1) return;
    nextField = fieldOrder[currentFieldIndex + 1];
  } else if (event.key === "ArrowLeft") {
    if (currentFieldIndex <= 0) return;
    nextField = fieldOrder[currentFieldIndex - 1];
  } else if (event.key === "ArrowDown") {
    if (setIndex >= setCount - 1) return;
    nextSetIndex = setIndex + 1;
  } else if (event.key === "ArrowUp") {
    if (setIndex <= 0) return;
    nextSetIndex = setIndex - 1;
  } else {
    return;
  }

  event.preventDefault();
  document
    .querySelector<HTMLElement>(`[data-athlete-set-field="${exerciseKey}-${nextSetIndex}-${nextField}"]`)
    ?.focus();
}

function AthleteExerciseCard({ exercise, index, onUpdate }: {
  exercise: AthleteExercise;
  index: number;
  onUpdate: (index: number, updates: Partial<AthleteExercise>) => void;
}) {
  const exerciseName = exercise.exerciseName || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
  const setDetails = normalizeSetDetails(exercise);
  const materialVariant = getAthleteExerciseMaterialVariant(exercise);
  const prescription = getAthleteExercisePrescription(exercise);
  const intensityMethod = getAthleteExerciseIntensityMethod(exercise);
  const exerciseKey = `${exercise.id || exercise.exerciseId || exerciseName}-${index}`;
  const intensityLabel =
    intensityMethod === "rir" ? "RIR"
      : intensityMethod === "rpe" ? "RPE"
      : intensityMethod === "percent_1rm" ? "%1RM"
      : intensityMethod === "velocity" ? "Velocidad"
      : "";
  const intensityField =
    intensityMethod === "rir" ? "rir"
      : intensityMethod === "rpe" ? "rpe"
      : intensityMethod === "percent_1rm" ? "percent1RM"
      : intensityMethod === "velocity" ? "velocity"
      : "";

  function addSetDetail() {
    const nextSetDetails = [
      ...setDetails,
      {
        load: exercise.plannedLoad ?? "",
        reps: exercise.plannedReps ?? "",
        setNumber: setDetails.length + 1
      }
    ];
    onUpdate(index, getUpdatedExerciseFromSetDetails(exercise, nextSetDetails));
  }

  function removeSetDetail(setIndex: number) {
    const nextSetDetails = setDetails
      .filter((_, detailIndex) => detailIndex !== setIndex)
      .map((detail, detailIndex) => ({ ...detail, setNumber: detailIndex + 1 }));
    onUpdate(index, getUpdatedExerciseFromSetDetails(exercise, nextSetDetails));
  }

  function updateSetDetail(setIndex: number, field: keyof AthleteSetDetail, value: string) {
    const nextSetDetails = setDetails.map((detail, detailIndex) =>
      detailIndex === setIndex ? { ...detail, [field]: value } : detail
    );
    onUpdate(index, getUpdatedExerciseFromSetDetails(exercise, nextSetDetails));
  }

  return (
    <article className="rounded-md border border-line bg-panel/35 p-4">
      <p className="font-semibold text-ink">{exerciseName}</p>
      <p className="mt-1 text-xs text-ink/55">Bloque: {exercise.block || exercise.section || "Principal"}</p>
      {materialVariant ? (
        <p className="mt-2 text-sm font-medium text-ink/65">{materialVariant}</p>
      ) : null}
      {prescription.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/65">
          {prescription.map((item) => (
            <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-ink/75" key={item}>{item}</span>
          ))}
        </div>
      ) : null}
      {exercise.observation ? <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/65">{exercise.observation}</p> : null}
      <div className="mt-4 rounded-md border border-line bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink">Series registradas</p>
          <button
            className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-panel"
            onClick={addSetDetail}
            type="button"
          >
            Añadir serie
          </button>
        </div>
        {setDetails.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {setDetails.map((detail, setIndex) => (
              <div className="rounded-md border border-line bg-panel/35 p-2" key={detail.setNumber}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink/65">Serie {detail.setNumber}</p>
                  <button
                    aria-label={`Eliminar serie ${detail.setNumber}`}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-ink/45 transition hover:bg-white hover:text-red-700"
                    onClick={() => removeSetDetail(setIndex)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
                <div className={`grid gap-2 ${intensityField ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  <AthleteExerciseInput
                    dataField={`${exerciseKey}-${setIndex}-reps`}
                    inputMode="numeric"
                    label="Reps"
                    onChange={(value) => updateSetDetail(setIndex, "reps", value)}
                    onKeyDown={(event) => handleAthleteSetKeyDown(event, exerciseKey, setIndex, "reps", setDetails.length)}
                    value={detail.reps}
                  />
                  <AthleteExerciseInput
                    dataField={`${exerciseKey}-${setIndex}-load`}
                    inputMode="decimal"
                    label="Kg"
                    onChange={(value) => updateSetDetail(setIndex, "load", value)}
                    onKeyDown={(event) => handleAthleteSetKeyDown(event, exerciseKey, setIndex, "load", setDetails.length)}
                    value={detail.load}
                  />
                  {intensityField ? (
                    <AthleteExerciseInput
                      dataField={`${exerciseKey}-${setIndex}-intensity`}
                      inputMode="decimal"
                      label={intensityMethod === "velocity" ? "Velocidad m/s" : intensityLabel}
                      onChange={(value) => updateSetDetail(setIndex, intensityField as keyof AthleteSetDetail, value)}
                      onKeyDown={(event) => handleAthleteSetKeyDown(event, exerciseKey, setIndex, "intensity", setDetails.length)}
                      value={detail[intensityField as keyof AthleteSetDetail] as number | string | null}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm text-ink/55">
            Sin series registradas todavía.
          </div>
        )}
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

function AthleteExerciseInput({ dataField, inputMode = "decimal", label, onChange, onKeyDown, value }: {
  dataField?: string;
  inputMode?: "decimal" | "numeric";
  label: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  value?: number | string | null;
}) {
  return (
    <label className="space-y-1 text-xs font-medium text-ink/65">
      {label}
      <input
        className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-moss"
        data-athlete-set-field={dataField}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        value={value ?? ""}
      />
    </label>
  );
}
