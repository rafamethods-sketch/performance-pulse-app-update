"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CalendarDays, Clock3, Dumbbell, Gauge, Sparkles } from "lucide-react";
import { AthleteIntakeQuestionnaire } from "@/components/athlete/athlete-intake-questionnaire";
import { AthleteSessionPlan } from "@/components/shared/athlete-session-plan";
import { SessionPlanVsActual } from "@/components/shared/session-plan-vs-actual";
import type { ExerciseTempo } from "@/lib/exercise-tempo";
import { getExerciseById } from "@/lib/exercises";
import type { CardioPlan, CardioResult, CardioZone } from "@/lib/cardio-deviation";
import type { IntakeQuestionnaire } from "@/lib/intake-questionnaire";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { getResistanceMethodById, type ResistanceMethod } from "@/lib/resistance-methods";
import { getSportZoneProfile, type ResistanceSport, type ResistanceZone } from "@/lib/resistance-zones";
import {
  getSessionSetByNumber,
  getSessionExerciseExecutionMode,
  resolveSessionSetNumbers,
  type SessionExerciseCompletion,
  type SessionExerciseEffort,
  type SessionExerciseExecutionMode
} from "@/lib/session-execution";
import {
  estimateMenstrualPhase,
  getMenstrualSymptomSummary,
  menstrualBleedingLabels,
  type ClientSex,
  type MenstrualBleedingLevel,
  type MenstrualCycleEntry,
  type MenstrualSymptomKey,
  type MenstrualTracking
} from "@/lib/menstrual-cycle";

type ResistanceCardioResult = CardioResult & {
  intensityCompleted?: string;
  intervalsCompleted?: string;
  notes?: string;
  recoveryCompleted?: string;
};

type AthleteTechniqueVideoView = "front" | "side" | "back" | "other";

type AthleteWellness = {
  calm?: number;
  energy?: number;
  fatigue: number;
  motivation: number;
  recovery?: number;
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
  bandColor?: string | null;
  bandResistance?: string | null;
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  exerciseRpe?: number | string | null;
  exerciseEffort?: SessionExerciseEffort | null;
  id?: string | null;
  intensityMethod?: string | null;
  load?: number | string | null;
  name?: string | null;
  observation?: string | null;
  omittedSetNumbers?: number[] | null;
  percent1RM?: number | string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  plannedSetReps?: Array<number | string> | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  section?: string | null;
  sessionBlock?: "activation" | "main" | "complementary" | null;
  setMethod?: "straight" | "ascending" | "descending" | "cluster" | null;
  clusterConfig?: { intraClusterRestSeconds?: number | string | null; repsPerMiniSet?: Array<number | string> | null } | null;
  completion?: SessionExerciseCompletion | null;
  executionMode?: SessionExerciseExecutionMode | null;
  tempo?: ExerciseTempo | null;
  selectedEquipment?: string | null;
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  sets?: number | string | null;
  setDetails?: AthleteSetDetail[];
  targetVelocity?: number | string | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
  techniqueVideoNote?: string | null;
  techniqueVideoUrl?: string | null;
  techniqueVideoView?: AthleteTechniqueVideoView | null;
  videoNote?: string | null;
  videoUrl?: string | null;
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
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: ResistanceCardioResult;
  completed?: boolean;
  date: string;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  discomfort?: AthleteSessionDiscomfort;
  performedExercises?: AthleteExercise[];
  plannedExercises?: AthleteExercise[];
  resistanceMethodId?: string;
  resistanceSport?: ResistanceSport;
  reviewStatus?: "pending" | "reviewed";
  sessionNumber?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  summary: string;
  targetResistanceZoneId?: ResistanceZone["id"];
  targetRpe?: number | string | null;
  type: string;
  week?: number | string | null;
  weekLabel?: string | null;
  wellness?: AthleteWellness;
  wellnessConfirmedAt?: string;
};

type AthleteClient = {
  id: string;
  intakeQuestionnaire?: IntakeQuestionnaire;
  menstrualTracking?: MenstrualTracking;
  name: string;
  sex?: ClientSex;
  sessionRecords: AthleteSessionRecord[];
};

type AthleteExerciseBlockKey = "activation" | "main" | "auxiliary";

type AthleteTodayViewProps<TClient extends AthleteClient> = {
  client: TClient | null;
  onShowCalendar: () => void;
  onShowHistory: () => void;
  onShowPlanning: () => void;
  onShowProfile?: () => void;
  onShowWeeklyLoad: () => void;
  onUpdateClient: (updatedClient: TClient) => void;
};

const emptyAthleteWellness: AthleteWellness = {
  calm: 0,
  energy: 0,
  fatigue: 0,
  motivation: 0,
  recovery: 0,
  sleep: 0,
  soreness: 0,
  stress: 0
};

type AthleteReadinessField = "sleep" | "energy" | "recovery" | "calm" | "motivation";

const athleteWellnessFields: Array<{ key: AthleteReadinessField; label: string }> = [
  { key: "sleep", label: "Sueño" },
  { key: "energy", label: "Energía" },
  { key: "recovery", label: "Recuperación muscular" },
  { key: "calm", label: "Calma" },
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

const menstrualSymptomFields: Array<{ key: MenstrualSymptomKey; label: string }> = [
  { key: "cramps", label: "Dolor menstrual" },
  { key: "fatigue", label: "Fatiga" },
  { key: "lowBackPain", label: "Dolor lumbar" },
  { key: "headache", label: "Dolor de cabeza" },
  { key: "bloating", label: "Hinchazón" },
  { key: "moodChanges", label: "Cambios de ánimo" },
  { key: "poorSleep", label: "Sueño peor" },
  { key: "cravings", label: "Antojos / hambre" },
  { key: "digestiveDiscomfort", label: "Molestias digestivas" },
  { key: "lowMotivation", label: "Motivación baja" },
  { key: "perceivedPerformanceDrop", label: "Rendimiento percibido bajo" }
];

const emptyMenstrualSymptoms = menstrualSymptomFields.reduce<Partial<Record<MenstrualSymptomKey, number>>>((current, field) => {
  current[field.key] = 0;
  return current;
}, {});

const athleteExerciseBlocks: Array<{ key: AthleteExerciseBlockKey; label: string }> = [
  { key: "activation", label: "ACTIVACIÓN" },
  { key: "main", label: "BLOQUE PRINCIPAL" },
  { key: "auxiliary", label: "BLOQUE AUXILIAR / OPCIONAL" }
];

const athleteTechniqueVideoViewLabels: Record<AthleteTechniqueVideoView, string> = {
  back: "Posterior",
  front: "Frontal",
  other: "Otra",
  side: "Lateral"
};

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

function getAthleteResistanceMethodLabel(method?: ResistanceMethod | null) {
  return method ? `${method.method} · ${method.name}` : "";
}

const athleteResistanceZoneMetricLabels: Array<{ key: keyof NonNullable<ResistanceZone["metrics"]>; label: string }> = [
  { key: "masPercent", label: "MAS" },
  { key: "mapPercent", label: "MAP" },
  { key: "vo2maxPercent", label: "VO2max" },
  { key: "hrMaxPercent", label: "HRmax" },
  { key: "hrrPercent", label: "HRR" },
  { key: "mlssPowerPercent", label: "W-MLSS" },
  { key: "rpe", label: "RPE" }
];

function getAthleteResistanceZoneGuide(sport?: ResistanceSport, zoneId?: string | null) {
  const profile = getSportZoneProfile(sport ?? "generic");
  const zone = profile.zones.find((item) => item.id === zoneId) ?? null;
  const metrics = zone
    ? athleteResistanceZoneMetricLabels
        .map((metric) => {
          const value = zone.metrics?.[metric.key];
          return value ? `${metric.label} ${value}` : "";
        })
        .filter(Boolean)
    : [];

  return { metrics, profile, zone };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatAthleteTodayDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    weekday: "long"
  }).format(date);
}

function parsePositiveNumber(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function invertReadinessScore(value?: number) {
  return value && value >= 1 && value <= 5 ? 6 - value : 0;
}

function getPositiveWellnessValue(wellness: AthleteWellness, key: AthleteReadinessField) {
  if (key === "energy") return wellness.energy ?? invertReadinessScore(wellness.fatigue);
  if (key === "recovery") return wellness.recovery ?? invertReadinessScore(wellness.soreness);
  if (key === "calm") return wellness.calm ?? invertReadinessScore(wellness.stress);
  return wellness[key] ?? 0;
}

function normalizeAthleteWellness(source?: AthleteWellness) {
  const base = source ?? emptyAthleteWellness;
  return {
    ...base,
    calm: getPositiveWellnessValue(base, "calm"),
    energy: getPositiveWellnessValue(base, "energy"),
    recovery: getPositiveWellnessValue(base, "recovery")
  };
}

function buildStoredAthleteWellness(wellness: AthleteWellness): AthleteWellness {
  const normalized = normalizeAthleteWellness(wellness);
  return {
    ...normalized,
    fatigue: invertReadinessScore(normalized.energy),
    soreness: invertReadinessScore(normalized.recovery),
    stress: invertReadinessScore(normalized.calm)
  };
}

function getReadinessScore(wellness: AthleteWellness) {
  const values = athleteWellnessFields.map((field) => getPositiveWellnessValue(wellness, field.key));
  const validValues = values.filter((value) => value >= 1 && value <= 5);
  if (validValues.length !== athleteWellnessFields.length) return null;
  const average = validValues.reduce((total, value) => total + value, 0) / validValues.length;
  return average.toFixed(1);
}

function getSetDetailsRepSum(setDetails?: AthleteSetDetail[]) {
  return (setDetails ?? []).reduce((total, detail) => total + parsePositiveNumber(detail.reps), 0);
}

function normalizeSetDetails(exercise: AthleteExercise) {
  return resolveSessionSetNumbers(exercise.setDetails).map(({ detail, setNumber }) => ({
    load: detail.load ?? "",
    percent1RM: detail.percent1RM ?? "",
    reps: detail.reps ?? "",
    rpe: detail.rpe ?? "",
    rir: detail.rir ?? "",
    setNumber,
    velocity: detail.velocity ?? ""
  }));
}

function buildCardioResultFromDraft(draft: {
  distanceKm: string;
  durationMinutes: string;
  intensityCompleted: string;
  intervalsCompleted: string;
  notes: string;
  perceivedRpe: string;
  recoveryCompleted: string;
  timeInZonesMinutes: Record<CardioZone, string>;
}): ResistanceCardioResult | undefined {
  const durationMinutes = parsePositiveNumber(draft.durationMinutes);
  const distanceKm = parsePositiveNumber(draft.distanceKm);
  const perceivedRpe = parsePositiveNumber(draft.perceivedRpe);
  const timeInZones: CardioResult["timeInZones"] = {};

  cardioZoneFields.forEach((zone) => {
    const minutes = parsePositiveNumber(draft.timeInZonesMinutes[zone.key]);
    if (minutes > 0) timeInZones![zone.key] = minutes * 60;
  });

  const result: ResistanceCardioResult = {
    source: "manual"
  };
  if (durationMinutes > 0) result.durationMinutes = durationMinutes;
  if (distanceKm > 0) result.distanceMeters = distanceKm * 1000;
  if (perceivedRpe > 0) result.perceivedRpe = perceivedRpe;
  if (Object.keys(timeInZones).length > 0) result.timeInZones = timeInZones;
  if (draft.intervalsCompleted.trim()) result.intervalsCompleted = draft.intervalsCompleted.trim();
  if (draft.intensityCompleted.trim()) result.intensityCompleted = draft.intensityCompleted.trim();
  if (draft.recoveryCompleted.trim()) result.recoveryCompleted = draft.recoveryCompleted.trim();
  if (draft.notes.trim()) result.notes = draft.notes.trim();

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
      setDetails: []
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
  const bandSummary = [exercise.bandColor, exercise.bandResistance]
    .filter((value) => hasAthleteDisplayValue(value))
    .join(" · ");

  return [
    hasAthleteDisplayValue(exercise.selectedEquipment) ? `Material: ${exercise.selectedEquipment}` : "",
    hasAthleteDisplayValue(exercise.selectedVariantName) ? `Variante: ${exercise.selectedVariantName}` : "",
    bandSummary ? `Banda elástica: ${bandSummary}` : ""
  ].filter(Boolean).join(" · ");
}

function getAthleteExerciseBlockKey(exercise: AthleteExercise): AthleteExerciseBlockKey {
  if (exercise.sessionBlock === "activation") return "activation";
  if (exercise.sessionBlock === "complementary") return "auxiliary";
  if (exercise.sessionBlock === "main") return "main";
  const block = `${exercise.block ?? exercise.section ?? ""}`.toLowerCase();
  if (block === "activation") return "activation";
  if (block === "auxiliary" || block === "accessory") return "auxiliary";
  return "main";
}

function getAthleteExerciseUiKey(exercise: AthleteExercise, index: number) {
  return `${exercise.id || exercise.exerciseId || exercise.exerciseName || "exercise"}-${index}`;
}

function getAthleteActivationGroups(exercises: Array<{ exercise: AthleteExercise; index: number }>) {
  const groups = [
    { key: "mobility", label: "MOVILIDAD / PREPARACIÓN", matches: (exercise: AthleteExercise) => getExerciseById(exercise.exerciseId || "")?.exerciseType === "mobility" },
    { key: "plyometric", label: "PLIOMETRÍA", matches: (exercise: AthleteExercise) => getExerciseById(exercise.exerciseId || "")?.exerciseType === "plyometric" },
    { key: "other", label: "OTROS EJERCICIOS", matches: (exercise: AthleteExercise) => !["mobility", "plyometric"].includes(getExerciseById(exercise.exerciseId || "")?.exerciseType ?? "") }
  ];
  return groups
    .map((group) => ({ ...group, exercises: exercises.filter(({ exercise }) => group.matches(exercise)) }))
    .filter((group) => group.exercises.length > 0);
}

export function AthleteTodayView<TClient extends AthleteClient>({
  client,
  onShowCalendar,
  onShowHistory,
  onShowPlanning,
  onShowProfile,
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
  const [showSessionPreview, setShowSessionPreview] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showIntakeEditor, setShowIntakeEditor] = useState(false);
  const [performedExercises, setPerformedExercises] = useState<AthleteExercise[]>([]);
  const [openExerciseBlock, setOpenExerciseBlock] = useState<AthleteExerciseBlockKey | null>(null);
  const [openExerciseKey, setOpenExerciseKey] = useState<string | null>(null);
  const [finishedExerciseKeys, setFinishedExerciseKeys] = useState<Set<string>>(() => new Set());
  const activeSessionNavigationKeyRef = useRef<string | null>(null);
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
    distanceKm: "",
    durationMinutes: "",
    intensityCompleted: "",
    intervalsCompleted: "",
    notes: "",
    perceivedRpe: "",
    recoveryCompleted: "",
    timeInZonesMinutes: {
      z1: "",
      z2: "",
      z3: "",
      z4: "",
      z5: ""
    } as Record<CardioZone, string>
  });
  const [menstrualConfigDraft, setMenstrualConfigDraft] = useState({
    averageBleedingDays: "",
    averageCycleLength: "",
    cycleRegularity: "unknown" as NonNullable<MenstrualTracking["cycleRegularity"]>,
    enabled: false,
    hormonalContraception: "prefer_not_to_say" as NonNullable<MenstrualTracking["hormonalContraception"]>,
    lastPeriodStartDate: "",
    shareWithCoach: false
  });
  const [menstrualEntryDraft, setMenstrualEntryDraft] = useState<{
    bleeding: MenstrualBleedingLevel;
    notes: string;
    symptoms: Partial<Record<MenstrualSymptomKey, number>>;
  }>({
    bleeding: "none",
    notes: "",
    symptoms: { ...emptyMenstrualSymptoms }
  });
  const [menstrualMessage, setMenstrualMessage] = useState("");
  const [showMenstrualDetails, setShowMenstrualDetails] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const wellnessComplete = athleteWellnessFields.every((field) => {
    const value = getPositiveWellnessValue(wellness, field.key);
    return value >= 1 && value <= 5;
  });
  const readinessScore = getReadinessScore(wellness);
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
  const resistanceMethod = getResistanceMethodById(session?.resistanceMethodId);
  const resistanceZoneGuide = getAthleteResistanceZoneGuide(session?.resistanceSport, session?.targetResistanceZoneId);
  const sessionTypeText = `${session?.type ?? ""}`.toLowerCase();
  const isMixedSession = sessionTypeText.includes("mixta") || sessionTypeText.includes("mixed");
  const isResistanceSession = Boolean(
    session?.cardioPlan ||
    session?.resistanceMethodId ||
    sessionTypeText.includes("cardio") ||
    sessionTypeText.includes("resistencia")
  );
  const shouldShowStrengthRegister = performedExercises.length > 0 && (!isResistanceSession || isMixedSession);

  useEffect(() => {
    setWellness(normalizeAthleteWellness(session?.wellness));
    setWellnessConfirmed(Boolean(session?.wellnessConfirmedAt || session?.completed || session?.wellness));
    setShowSessionPreview(false);
    setShowWellnessModal(false);
    setShowFinalizeModal(false);
    const nextExercises = session?.performedExercises?.length
      ? session.performedExercises
      : createAthleteExerciseEntries(session);
    setPerformedExercises(nextExercises);
    const sessionNavigationKey = session ? `${client?.id ?? "athlete"}-${sessionIndex}-${session.date}` : null;
    if (activeSessionNavigationKeyRef.current !== sessionNavigationKey) {
      setOpenExerciseBlock(
        athleteExerciseBlocks.find((block) => nextExercises.some((exercise) => getAthleteExerciseBlockKey(exercise) === block.key))?.key ?? null
      );
      setOpenExerciseKey(nextExercises.length ? getAthleteExerciseUiKey(nextExercises[0], 0) : null);
      setFinishedExerciseKeys(new Set());
      activeSessionNavigationKeyRef.current = sessionNavigationKey;
    }
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
      distanceKm: "",
      durationMinutes: "",
      intensityCompleted: "",
      intervalsCompleted: "",
      notes: "",
      perceivedRpe: "",
      recoveryCompleted: "",
      timeInZonesMinutes: {
        z1: "",
        z2: "",
        z3: "",
        z4: "",
        z5: ""
      }
    });
    const tracking = client?.menstrualTracking;
    const todayEntry = tracking?.entries?.find((entry) => entry.date === todayKey);
    setMenstrualConfigDraft({
      averageBleedingDays: tracking?.averageBleedingDays ? String(tracking.averageBleedingDays) : "",
      averageCycleLength: tracking?.averageCycleLength ? String(tracking.averageCycleLength) : "",
      cycleRegularity: tracking?.cycleRegularity ?? "unknown",
      enabled: tracking?.enabled ?? false,
      hormonalContraception: tracking?.hormonalContraception ?? "prefer_not_to_say",
      lastPeriodStartDate: tracking?.lastPeriodStartDate ?? "",
      shareWithCoach: tracking?.shareWithCoach ?? false
    });
    setMenstrualEntryDraft({
      bleeding: todayEntry?.bleeding ?? "none",
      notes: todayEntry?.notes ?? "",
      symptoms: { ...emptyMenstrualSymptoms, ...(todayEntry?.symptoms ?? {}) }
    });
    setMenstrualMessage("");
    setShowMenstrualDetails(false);
    setValidationMessage("");
  }, [client?.id, client?.menstrualTracking, session, sessionIndex, todayKey]);

  useEffect(() => {
    if (!showSessionPreview && !showWellnessModal && !showFinalizeModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSessionPreview(false);
        setShowWellnessModal(false);
        setShowFinalizeModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFinalizeModal, showSessionPreview, showWellnessModal]);

  function updateExercise(index: number, updates: Partial<AthleteExercise>) {
    setPerformedExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...updates } : exercise
      )
    );
  }

  function persistExerciseExecution(exerciseIndex: number, updates: Partial<AthleteExercise>) {
    if (!client || !session || sessionIndex < 0) return;
    invalidateFinishedExercise(exerciseIndex);
    const nextExercises = performedExercises.map((exercise, index) => {
      if (index !== exerciseIndex) return exercise;
      const updatedExercise = { ...exercise, ...updates };
      return updates.setDetails
        ? { ...updatedExercise, ...getUpdatedExerciseFromSetDetails(updatedExercise, updates.setDetails) }
        : updatedExercise;
    });
    const updatedSession: AthleteSessionRecord = {
      ...session,
      performedExercises: nextExercises
    };

    setPerformedExercises(nextExercises);
    onUpdateClient({
      ...client,
      sessionRecords: client.sessionRecords.map((record, index) =>
        index === sessionIndex ? updatedSession : record
      )
    } as TClient);
  }

  function persistExerciseCompletion(exerciseIndex: number, completed: boolean) {
    if (!client || !session || sessionIndex < 0) return;
    invalidateFinishedExercise(exerciseIndex);
    const nextExercises = performedExercises.map((exercise, index) =>
      index === exerciseIndex
        ? {
            ...exercise,
            completion: completed ? { completed: true, completedAt: new Date().toISOString() } : { completed: false }
          }
        : exercise
    );
    const updatedSession: AthleteSessionRecord = { ...session, performedExercises: nextExercises };

    setPerformedExercises(nextExercises);
    onUpdateClient({
      ...client,
      sessionRecords: client.sessionRecords.map((record, index) => index === sessionIndex ? updatedSession : record)
    } as TClient);
  }

  function invalidateFinishedExercise(exerciseIndex: number) {
    const exercise = performedExercises[exerciseIndex];
    if (!exercise) return;
    const exerciseKey = getAthleteExerciseUiKey(exercise, exerciseIndex);
    setFinishedExerciseKeys((current) => {
      if (!current.has(exerciseKey)) return current;
      const next = new Set(current);
      next.delete(exerciseKey);
      return next;
    });
  }

  function openExerciseBlockWithFirstExercise(blockKey: AthleteExerciseBlockKey) {
    const firstExerciseIndex = performedExercises.findIndex((exercise) => getAthleteExerciseBlockKey(exercise) === blockKey);
    setOpenExerciseBlock(blockKey);
    setOpenExerciseKey(firstExerciseIndex >= 0 ? getAthleteExerciseUiKey(performedExercises[firstExerciseIndex], firstExerciseIndex) : null);
  }

  function finishExercise(exerciseIndex: number) {
    const exercise = performedExercises[exerciseIndex];
    if (!exercise) return;
    const exerciseKey = getAthleteExerciseUiKey(exercise, exerciseIndex);
    const nextExerciseIndex = performedExercises.findIndex((_, candidateIndex) => candidateIndex > exerciseIndex);
    const nextExercise = nextExerciseIndex >= 0 ? performedExercises[nextExerciseIndex] : null;
    setFinishedExerciseKeys((current) => new Set(current).add(exerciseKey));
    setOpenExerciseBlock(nextExercise ? getAthleteExerciseBlockKey(nextExercise) : getAthleteExerciseBlockKey(exercise));
    setOpenExerciseKey(nextExercise ? getAthleteExerciseUiKey(nextExercise, nextExerciseIndex) : null);
  }

  function startSession() {
    if (wellnessConfirmed) return;
    setShowWellnessModal(true);
  }

  function confirmWellness() {
    if (!client || !session || sessionIndex < 0 || !wellnessComplete) return;
    const storedWellness = buildStoredAthleteWellness(wellness);
    const updatedSession: AthleteSessionRecord = {
      ...session,
      wellness: storedWellness,
      wellnessConfirmedAt: new Date().toISOString()
    };

    onUpdateClient({
      ...client,
      sessionRecords: client.sessionRecords.map((record, index) =>
        index === sessionIndex ? updatedSession : record
      )
    } as TClient);
    setWellness(storedWellness);
    setWellnessConfirmed(true);
    setShowWellnessModal(false);
  }

  function submitSession() {
    if (!client || !session || sessionIndex < 0) return;
    if (!finalRpeValid) {
      setValidationMessage("Introduce el esfuerzo global de la sesión para poder enviarla.");
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
      cardioResult: isResistanceSession
        ? buildCardioResultFromDraft({
            ...cardioResultDraft,
            durationMinutes: `${actualDurationMinutes}`,
            perceivedRpe: `${finalRpe}`
          })
        : session.cardioResult,
      completed: true,
      discomfort,
      finalNotes: athleteSessionNotes.trim(),
      finalRpe,
      performedExercises,
      reviewStatus: "pending",
      // Legacy field: stores internal load (session RPE × duration), not the 1–10 session RPE.
      sRPE: calculateSessionLoad(finalRpe, actualDurationMinutes),
      status: "Completada",
      wellness: buildStoredAthleteWellness(wellness),
      wellnessConfirmedAt: session.wellnessConfirmedAt ?? new Date().toISOString()
    };

    onUpdateClient({
      ...client,
      sessionRecords: client.sessionRecords.map((record, index) =>
        index === sessionIndex ? updatedSession : record
      )
    } as TClient);
    setValidationMessage("");
    setShowFinalizeModal(false);
  }

  function saveMenstrualTracking() {
    if (!client || client.sex !== "female") return;

    const currentTracking = client.menstrualTracking;
    const nextEntry: MenstrualCycleEntry = {
      bleeding: menstrualEntryDraft.bleeding,
      date: todayKey,
      id: currentTracking?.entries?.find((entry) => entry.date === todayKey)?.id ?? `cycle-${Date.now()}`,
      notes: menstrualEntryDraft.notes.trim() || undefined,
      symptoms: menstrualEntryDraft.symptoms
    };
    const nextEntries = [
      nextEntry,
      ...(currentTracking?.entries ?? []).filter((entry) => entry.date !== todayKey)
    ].sort((a, b) => b.date.localeCompare(a.date));
    const nextTracking: MenstrualTracking = {
      ...currentTracking,
      averageBleedingDays: menstrualConfigDraft.averageBleedingDays ? Number(menstrualConfigDraft.averageBleedingDays) : undefined,
      averageCycleLength: menstrualConfigDraft.averageCycleLength ? Number(menstrualConfigDraft.averageCycleLength) : undefined,
      cycleRegularity: menstrualConfigDraft.cycleRegularity,
      enabled: menstrualConfigDraft.enabled,
      entries: nextEntries,
      hormonalContraception: menstrualConfigDraft.hormonalContraception,
      lastPeriodStartDate: menstrualConfigDraft.lastPeriodStartDate || undefined,
      shareWithCoach: menstrualConfigDraft.shareWithCoach
    };

    onUpdateClient({
      ...client,
      menstrualTracking: nextTracking
    } as TClient);
    setMenstrualMessage("Registro de ciclo guardado.");
  }

  if (!client) {
    return (
      <AthleteEmptyState message="No hay deportista seleccionado." />
    );
  }

  const menstrualPhase = estimateMenstrualPhase({
    averageBleedingDays: menstrualConfigDraft.averageBleedingDays,
    averageCycleLength: menstrualConfigDraft.averageCycleLength,
    date: todayKey,
    lastPeriodStartDate: menstrualConfigDraft.lastPeriodStartDate
  });
  const menstrualSymptoms = getMenstrualSymptomSummary({
    date: todayKey,
    id: "draft",
    symptoms: menstrualEntryDraft.symptoms
  });
  const menstrualTrackingBlock = client.sex === "female" ? (
    <section className="rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Ciclo menstrual</h3>
          <p className="mt-1 text-sm text-ink/60">
            Registro opcional para adaptar la planificación según ciclo, síntomas y recuperación. No sustituye asesoramiento médico.
          </p>
        </div>
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <label className="flex min-h-11 w-full items-center gap-2 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm font-semibold text-ink/70 sm:w-fit">
            <input
              checked={menstrualConfigDraft.enabled}
              onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, enabled: event.target.checked }))}
              type="checkbox"
            />
            Activar seguimiento
          </label>
          {menstrualConfigDraft.enabled ? (
            <button
              className="min-h-11 w-full rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white sm:w-auto"
              onClick={() => setShowMenstrualDetails((current) => !current)}
              type="button"
            >
              {showMenstrualDetails ? "Cerrar registro" : "Registrar / editar"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs font-medium leading-relaxed text-ink/55">
        Esta información es sensible y opcional. Puedes dejar de compartirla con tu entrenador en cualquier momento.
      </p>
      {menstrualConfigDraft.enabled ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <ClientInfoCard
            label="Fase estimada"
            value={`${menstrualPhase.label}${menstrualPhase.cycleDay ? ` · día ${menstrualPhase.cycleDay}` : ""}`}
          />
          <ClientInfoCard label="Sangrado hoy" value={menstrualBleedingLabels[menstrualEntryDraft.bleeding]} />
          <ClientInfoCard
            label="Síntomas"
            value={menstrualSymptoms.length > 0 ? `${menstrualSymptoms.length} registrados` : "Sin síntomas"}
          />
        </div>
      ) : null}

      {menstrualConfigDraft.enabled && showMenstrualDetails ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Fecha de inicio de última menstruación
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, lastPeriodStartDate: event.target.value }))}
                type="date"
                value={menstrualConfigDraft.lastPeriodStartDate}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Duración media del ciclo
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                inputMode="numeric"
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, averageCycleLength: event.target.value }))}
                placeholder="28"
                type="text"
                value={menstrualConfigDraft.averageCycleLength}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Duración media del sangrado
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                inputMode="numeric"
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, averageBleedingDays: event.target.value }))}
                placeholder="5"
                type="text"
                value={menstrualConfigDraft.averageBleedingDays}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Regularidad del ciclo
              <select
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, cycleRegularity: event.target.value as NonNullable<MenstrualTracking["cycleRegularity"]> }))}
                value={menstrualConfigDraft.cycleRegularity}
              >
                <option value="regular">Regular</option>
                <option value="irregular">Irregular</option>
                <option value="unknown">No lo sé</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Anticonceptivos hormonales
              <select
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, hormonalContraception: event.target.value as NonNullable<MenstrualTracking["hormonalContraception"]> }))}
                value={menstrualConfigDraft.hormonalContraception}
              >
                <option value="yes">Sí</option>
                <option value="no">No</option>
                <option value="prefer_not_to_say">Prefiero no decirlo</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-line bg-panel/35 px-3 py-3 text-sm font-semibold text-ink/70">
              <input
                checked={menstrualConfigDraft.shareWithCoach}
                onChange={(event) => setMenstrualConfigDraft((current) => ({ ...current, shareWithCoach: event.target.checked }))}
                type="checkbox"
              />
              Compartir esta información con mi entrenador
            </label>
          </div>

          <div className="rounded-md border border-line bg-panel/35 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">Registro diario</p>
                <p className="mt-1 text-sm text-ink/55">
                  Fase estimada: {menstrualPhase.label}
                  {menstrualPhase.cycleDay ? ` · día ${menstrualPhase.cycleDay}` : ""}
                </p>
              </div>
              <span className="w-fit rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">
                {menstrualPhase.confidence === "estimated" ? "Orientativo" : "Sin estimación"}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Sangrado
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => setMenstrualEntryDraft((current) => ({ ...current, bleeding: event.target.value as MenstrualBleedingLevel }))}
                  value={menstrualEntryDraft.bleeding}
                >
                  {Object.entries(menstrualBleedingLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-md border border-line bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase text-ink/45">Síntomas activos</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {menstrualSymptoms.length > 0 ? menstrualSymptoms.map((symptom) => `${symptom.label} ${symptom.level}/3`).join(" · ") : "Sin síntomas registrados"}
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {menstrualSymptomFields.map((field) => (
                <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink/75" key={field.key}>
                  <span>{field.label}</span>
                  <select
                    className="h-9 rounded-md border border-line bg-panel/35 px-2 text-sm font-semibold text-ink outline-none"
                    onChange={(event) =>
                      setMenstrualEntryDraft((current) => ({
                        ...current,
                        symptoms: { ...current.symptoms, [field.key]: Number(event.target.value) }
                      }))
                    }
                    value={menstrualEntryDraft.symptoms[field.key] ?? 0}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </label>
              ))}
            </div>
            <label className="mt-3 block space-y-2 text-sm font-medium text-ink/75">
              Notas
              <textarea
                className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setMenstrualEntryDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Sensaciones, molestias, recuperación, contexto..."
                value={menstrualEntryDraft.notes}
              />
            </label>
            <button
              className="mt-3 min-h-11 w-full rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white sm:w-auto"
              onClick={saveMenstrualTracking}
              type="button"
            >
              Guardar registro de hoy
            </button>
            {menstrualMessage ? <p className="mt-2 text-sm font-semibold text-moss">{menstrualMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  ) : null;
  const intakeEditBlock = client.intakeQuestionnaire?.completed ? (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Información inicial</h3>
          <p className="mt-1 text-sm text-ink/55">Puedes actualizar tu cuestionario desde Perfil si cambia tu contexto, objetivos o limitaciones.</p>
        </div>
        <button
          className="w-fit rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70"
          onClick={onShowProfile ?? (() => setShowIntakeEditor((current) => !current))}
          type="button"
        >
          {onShowProfile ? "Editar cuestionario en Perfil" : showIntakeEditor ? "Cerrar cuestionario" : "Editar cuestionario de ingreso"}
        </button>
      </div>
      {!onShowProfile && showIntakeEditor ? (
        <AthleteIntakeQuestionnaire
          client={client}
          mode="edit"
          onCancel={() => setShowIntakeEditor(false)}
          onUpdateClient={onUpdateClient}
        />
      ) : null}
    </section>
  ) : null;

  if (!session) {
    return (
      <div className="mt-5 w-full min-w-0 space-y-5">
        <AthleteEmptyState
          clientName={client.name}
          message="No tienes ninguna sesión asignada para hoy."
          onShowCalendar={onShowCalendar}
          onShowHistory={onShowHistory}
          onShowPlanning={onShowPlanning}
          onShowWeeklyLoad={onShowWeeklyLoad}
        />
        {intakeEditBlock}
        {menstrualTrackingBlock}
      </div>
    );
  }

  const sessionAlreadySent = session.completed || session.status === "Completada";
  const sessionStatusLabel = session.reviewStatus === "reviewed"
    ? "Revisada"
    : sessionAlreadySent
      ? "Enviada al entrenador"
      : "Pendiente";
  const targetDuration = session.cardioPlan?.targetDurationMinutes;
  const todayFocus = session.summary?.trim();
  const plannedExerciseCount = session.plannedExercises?.length ?? 0;

  return (
    <div className="mt-4 w-full min-w-0 space-y-4 sm:mt-5 sm:space-y-5">
      {intakeEditBlock}
      <section className="highlight-summary-card overflow-hidden rounded-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-300">Hoy</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{session.type || "Sesión programada"}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm capitalize text-white/65">
                <CalendarDays aria-hidden="true" size={15} />
                {formatAthleteTodayDate(session.date)}
              </p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${sessionAlreadySent ? "bg-emerald-400/15 text-emerald-200" : "bg-blue-400/15 text-blue-200"}`}>
              {sessionStatusLabel}
            </span>
          </div>

          {todayFocus ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-200">
                <Sparkles aria-hidden="true" size={15} />
                Foco de hoy
              </div>
              <p className="mt-2 text-base font-medium leading-relaxed text-white sm:text-lg">{todayFocus}</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-white/75">
            {targetDuration ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2">
                <Clock3 aria-hidden="true" size={15} />
                {targetDuration} min estimados
              </span>
            ) : null}
            {session.targetRpe ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2">
                <Gauge aria-hidden="true" size={15} />
                RPE objetivo {session.targetRpe}/10
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2">
              <Dumbbell aria-hidden="true" size={15} />
              {plannedExerciseCount > 0 ? `${plannedExerciseCount} ${plannedExerciseCount === 1 ? "ejercicio" : "ejercicios"}` : "Entrenamiento de hoy"}
            </span>
          </div>
        </div>
        {!sessionAlreadySent ? (
          <div className="grid gap-3 border-t border-white/10 bg-black/10 p-4 sm:grid-cols-[0.8fr_1.2fr] sm:p-5">
            <button
              className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
              onClick={() => setShowSessionPreview(true)}
              type="button"
            >
              Ver sesión
            </button>
            <button
              className="h-12 w-full rounded-xl bg-blue-500 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={wellnessConfirmed}
              onClick={startSession}
              type="button"
            >
              {wellnessConfirmed ? "Sesión iniciada" : "Comenzar sesión"}
            </button>
          </div>
        ) : null}
      </section>

      {menstrualTrackingBlock}

      {sessionAlreadySent ? (
        <div className="grid gap-4">
          <section className="rounded-md border border-line bg-panel p-5 shadow-soft">
            <h3 className="font-semibold text-[rgb(var(--color-success))]">Sesión finalizada</h3>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/70">
              <span>Esfuerzo global: {session.finalRpe ? `${session.finalRpe}/10` : "Sin registrar"}</span>
              <span>Duración: {session.actualDurationMinutes ? `${session.actualDurationMinutes} min` : "Sin registrar"}</span>
              <span>Carga interna: {session.sRPE ? `${session.sRPE} UA` : "Pendiente"}</span>
            </div>
            {session.finalNotes ? <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/65">{session.finalNotes}</p> : null}
          </section>
          <SessionPlanVsActual
            date={session.date}
            performedExercises={session.performedExercises ?? []}
            plannedExercises={session.plannedExercises ?? []}
            summary={session.summary}
            type={session.type}
          />
        </div>
      ) : (
        <>
          <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
            {wellnessConfirmed ? (
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">Preparación del día</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">Así llegas a la sesión</h3>
                    <p className="mt-1 text-sm text-ink/60">Resumen de las sensaciones que has confirmado hoy.</p>
                  </div>
                  <span className="w-fit rounded-full bg-mint px-3 py-1 text-xs font-semibold text-moss">
                    Readiness {readinessScore ?? "Pendiente"} / 5
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {athleteWellnessFields.map((field) => {
                    const value = getPositiveWellnessValue(wellness, field.key);
                    return (
                      <div className="rounded-xl border border-line bg-panel/35 px-3 py-3" key={field.key}>
                        <p className="text-xs font-semibold text-ink/50">{field.label}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-ink">{value}</span>
                          <span className="text-xs text-ink/45">/ 5</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-gradient-to-r from-steel to-moss" style={{ width: `${Math.min(100, Math.max(0, value) * 20)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">Preparación del día</h3>
                  <p className="mt-1 text-sm text-ink/60">Pulsa Comenzar para confirmar tu wellness previo antes de registrar la sesión.</p>
                </div>
                <button
                  className="h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90 sm:w-auto"
                  onClick={startSession}
                  type="button"
                >
                  Comenzar sesión
                </button>
              </div>
            )}
          </section>

          {wellnessConfirmed ? (
            <>
              {shouldShowStrengthRegister ? (
                <>
                <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                  <h3 className="text-lg font-semibold text-ink">Ejercicios planificados</h3>
                  <div className="mt-4 space-y-4">
                    {athleteExerciseBlocks.filter((candidate) => performedExercises.some((exercise) => getAthleteExerciseBlockKey(exercise) === candidate.key)).map((block, blockIndex, existingBlocks) => {
                      const blockExercises = performedExercises
                        .map((exercise, index) => ({ exercise, index }))
                        .filter(({ exercise }) => getAthleteExerciseBlockKey(exercise) === block.key);
                      const isOpen = openExerciseBlock === block.key;
                      const exerciseGroups = block.key === "activation"
                        ? getAthleteActivationGroups(blockExercises)
                        : [{ key: block.key, label: "", exercises: blockExercises }];
                      const completionExercises = blockExercises.filter(({ exercise }) => getSessionExerciseExecutionMode(exercise) === "completion_only");
                      const trackedExercises = blockExercises.filter(({ exercise }) => getSessionExerciseExecutionMode(exercise) === "set_tracking");
                      const completedExercises = completionExercises.filter(({ exercise }) => exercise.completion?.completed).length;
                      const plannedSets = trackedExercises.reduce((total, { exercise }) => total + getFinalizePlannedSetCount(exercise), 0);
                      const completedSets = trackedExercises.reduce((total, { exercise }) =>
                        total + getFinalizeRecordedSetCount(exercise) + (exercise.omittedSetNumbers ?? []).filter((setNumber) => setNumber <= getFinalizePlannedSetCount(exercise)).length, 0
                      );
                      const blockFinished = blockExercises.every(({ exercise, index }) =>
                        getSessionExerciseExecutionMode(exercise) === "completion_only"
                          ? exercise.completion?.completed === true
                          : finishedExerciseKeys.has(getAthleteExerciseUiKey(exercise, index))
                      );
                      const progressLabel = [
                        completionExercises.length ? `${completedExercises}/${completionExercises.length} ejercicios` : "",
                        plannedSets ? `${completedSets}/${plannedSets} series` : ""
                      ].filter(Boolean).join(" · ") || "Pendiente";
                      const nextBlock = existingBlocks[blockIndex + 1];
                      if (blockExercises.length === 0) return null;

                      return (
                        <section className="rounded-md border border-line bg-panel/35 p-3 sm:p-4" key={block.key}>
                          <button
                            aria-expanded={isOpen}
                            className="flex min-h-11 w-full items-center gap-3 rounded-md px-1 text-left text-sm font-semibold uppercase tracking-wide text-ink transition hover:text-moss"
                            onClick={() => {
                              if (isOpen) {
                                setOpenExerciseBlock(null);
                                setOpenExerciseKey(null);
                                return;
                              }
                              openExerciseBlockWithFirstExercise(block.key);
                            }}
                            type="button"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block">{block.label}</span>
                              <span className="mt-0.5 block text-[11px] font-semibold normal-case tracking-normal text-ink/50">{progressLabel}</span>
                            </span>
                            <span className={`text-lg leading-none transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                          </button>
                          {isOpen ? (
                            <div className="mt-3 grid gap-4">
                              {exerciseGroups.map((group) => (
                                <div className="grid gap-3" key={group.key}>
                                  {group.label ? <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{group.label}</h4> : null}
                                  {group.exercises.map(({ exercise, index }) => {
                                    const exerciseKey = getAthleteExerciseUiKey(exercise, index);
                                    return (
                                    <AthleteExerciseCard
                                      exercise={exercise}
                                      index={index}
                                      isFinished={finishedExerciseKeys.has(exerciseKey)}
                                      isOpen={openExerciseKey === exerciseKey}
                                      key={exerciseKey}
                                      onFinish={() => finishExercise(index)}
                                      onOpen={() => setOpenExerciseKey((current) => current === exerciseKey ? null : exerciseKey)}
                                      onUpdateExecution={persistExerciseExecution}
                                      onToggleCompletion={persistExerciseCompletion}
                                      onUpdate={updateExercise}
                                    />
                                    );
                                  })}
                                </div>
                              ))}
                              {nextBlock && blockFinished ? (
                                <button
                                  className="min-h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90 sm:ml-auto sm:w-auto"
                                  onClick={() => openExerciseBlockWithFirstExercise(nextBlock.key)}
                                  type="button"
                                >
                                  Continuar a {nextBlock.label.toLowerCase()}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                </section>
                {performedExercises.some((exercise) => exercise.completion?.completed || exercise.exerciseEffort || exercise.omittedSetNumbers?.length || (exercise.setDetails ?? []).some((detail) => [detail.load, detail.reps, detail.rir, detail.rpe, detail.percent1RM, detail.velocity].some(hasAthleteDisplayValue))) ? (
                  <details className="group rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                    <summary className="cursor-pointer list-none text-sm font-bold text-ink marker:hidden">
                      <span className="flex items-center justify-between gap-3">
                        Revisar planificado vs realizado
                        <span className="text-lg text-ink/35 transition group-open:rotate-180">⌄</span>
                      </span>
                    </summary>
                    <div className="mt-4">
                      <SessionPlanVsActual
                        date={session.date}
                        performedExercises={performedExercises}
                        plannedExercises={session.plannedExercises ?? []}
                        summary={session.summary}
                        type={session.type}
                      />
                    </div>
                  </details>
                ) : null}
                </>
              ) : null}

              {isResistanceSession ? (
                <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">Registro de resistencia</h3>
                      <p className="mt-1 text-sm text-ink/60">Registra solo datos agregados de la sesión de resistencia.</p>
                    </div>
                    <span className="w-fit rounded-md bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/65">
                      {resistanceZoneGuide.zone?.shortLabel ?? session.cardioPlan?.targetZone?.toUpperCase() ?? "Sin zona objetivo"}
                    </span>
                  </div>
                  {resistanceZoneGuide.zone ? (
                    <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                      <p className="font-semibold text-ink">Zona objetivo planificada</p>
                      <p className="mt-1">{resistanceZoneGuide.profile.name} · {resistanceZoneGuide.zone.label}</p>
                      <p className="mt-1">{resistanceZoneGuide.zone.description}</p>
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
                      <p className="mt-2 text-xs font-medium text-ink/50">
                        Guía metodológica. Individualiza con test, deporte, nivel y contexto.
                      </p>
                    </div>
                  ) : null}
                  {session.cardioPlan ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <ClientInfoCard label="Modalidad" value={session.cardioPlan.sport ? cardioSportLabels[session.cardioPlan.sport] : "Sin especificar"} />
                    <ClientInfoCard label="Duración objetivo" value={session.cardioPlan.targetDurationMinutes ? `${session.cardioPlan.targetDurationMinutes} min` : "Sin especificar"} />
                    <ClientInfoCard label="Distancia objetivo" value={session.cardioPlan.targetDistanceMeters ? `${session.cardioPlan.targetDistanceMeters} m` : "Sin especificar"} />
                    <ClientInfoCard
                      label="RPE objetivo"
                      value={session.cardioPlan.targetRpeMin && session.cardioPlan.targetRpeMax ? `${session.cardioPlan.targetRpeMin}-${session.cardioPlan.targetRpeMax}/10` : "Sin especificar"}
                    />
                    </div>
                  ) : null}
                  {resistanceMethod ? (
                    <div className="mt-3 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                      <p className="font-semibold text-ink">Método planificado: {getAthleteResistanceMethodLabel(resistanceMethod)}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <ClientInfoCard label="Intensidad" value={resistanceMethod.intensity || "Sin especificar"} />
                        <ClientInfoCard label="Repeticiones / duración" value={[resistanceMethod.repetitions, resistanceMethod.repetitionDuration].filter(Boolean).join(" · ") || "Sin especificar"} />
                        <ClientInfoCard label="Recuperación" value={resistanceMethod.recoveryBetweenRepetitions || "Sin especificar"} />
                        <ClientInfoCard label="Series" value={resistanceMethod.series || "Sin especificar"} />
                      </div>
                    </div>
                  ) : null}
                  {session.cardioPlan?.notes ? (
                    <p className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/65">{session.cardioPlan.notes}</p>
                  ) : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Distancia real opcional
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        inputMode="decimal"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, distanceKm: event.target.value }))}
                        placeholder="Km"
                        type="text"
                        value={cardioResultDraft.distanceKm}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Repeticiones o intervalos realizados
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, intervalsCompleted: event.target.value }))}
                        placeholder="Ej: 6 repeticiones de 4 min"
                        type="text"
                        value={cardioResultDraft.intervalsCompleted}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Intensidad realizada
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, intensityCompleted: event.target.value }))}
                        placeholder="Ej: Z3 estable, 4:30/km, 240 W"
                        type="text"
                        value={cardioResultDraft.intensityCompleted}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Recuperación realizada
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, recoveryCompleted: event.target.value }))}
                        placeholder="Ej: 2 min suave entre repeticiones"
                        type="text"
                        value={cardioResultDraft.recoveryCompleted}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                      Observaciones sobre método
                      <textarea
                        className="min-h-20 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => setCardioResultDraft((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Sensación, ajustes de ritmo, cumplimiento del método..."
                        value={cardioResultDraft.notes}
                      />
                    </label>
                  </div>
                <div className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                    <p className="text-sm font-semibold text-ink">Tiempo en zonas</p>
                    <p className="mt-1 text-xs text-ink/50">Introduce minutos por zona solo si los tienes. Se guardan internamente en segundos.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Cuando termines</h3>
                    <p className="mt-1 text-sm text-ink/60">Cierra la sesión con esfuerzo global, molestias, comentario y duración.</p>
                  </div>
                  <button className="h-11 w-full rounded-md bg-ink px-5 text-sm font-semibold text-white sm:w-auto" onClick={() => setShowFinalizeModal(true)} type="button">
                    Finalizar sesión
                  </button>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm text-ink/55">
              Completa y confirma primero el wellness previo.
            </div>
          )}
        </>
      )}
      {showSessionPreview ? (
        <AthleteSessionPreviewModal
          onClose={() => setShowSessionPreview(false)}
          session={session}
        />
      ) : null}
      {showWellnessModal ? (
        <AthleteWellnessModal
          onClose={() => setShowWellnessModal(false)}
          onConfirm={confirmWellness}
          readinessScore={readinessScore}
          setWellness={setWellness}
          wellness={wellness}
          wellnessComplete={wellnessComplete}
        />
      ) : null}
      {showFinalizeModal ? (
        <AthleteFinalizeSessionModal
          actualDurationMinutes={actualDurationMinutes}
          canSubmit={canSubmitSession}
          discomfortAnswer={discomfortAnswer}
          discomfortDraft={discomfortDraft}
          finalRpe={finalRpe}
          notes={athleteSessionNotes}
          onClose={() => setShowFinalizeModal(false)}
          onDiscomfortAnswerChange={(value) => {
            setDiscomfortAnswer(value);
            setValidationMessage("");
          }}
          onDiscomfortDraftChange={setDiscomfortDraft}
          onDurationChange={setActualDurationMinutes}
          onFinalRpeChange={setFinalRpe}
          onNotesChange={setAthleteSessionNotes}
          onSubmit={submitSession}
          performedExercises={performedExercises}
          plannedExercises={session.plannedExercises ?? []}
          validationMessage={validationMessage}
        />
      ) : null}
    </div>
  );
}

function getFinalizePlannedSetCount(exercise: AthleteExercise) {
  if (getSessionExerciseExecutionMode(exercise) === "completion_only") return 0;
  const sequenceCount = (exercise.plannedSetReps ?? []).filter(hasAthleteDisplayValue).length;
  const parsedSets = Number(`${exercise.plannedSets ?? exercise.sets ?? ""}`.replace(",", "."));
  return Math.max(sequenceCount, Number.isFinite(parsedSets) && parsedSets > 0 ? Math.trunc(parsedSets) : 0);
}

function getFinalizeRecordedSetCount(exercise: AthleteExercise) {
  if (getSessionExerciseExecutionMode(exercise) === "completion_only") return 0;
  return (exercise.setDetails ?? []).filter((detail) =>
    [detail.load, detail.reps, detail.rir, detail.rpe, detail.percent1RM, detail.velocity].some(hasAthleteDisplayValue)
  ).length;
}

function AthleteFinalizeSessionModal({
  actualDurationMinutes,
  canSubmit,
  discomfortAnswer,
  discomfortDraft,
  finalRpe,
  notes,
  onClose,
  onDiscomfortAnswerChange,
  onDiscomfortDraftChange,
  onDurationChange,
  onFinalRpeChange,
  onNotesChange,
  onSubmit,
  performedExercises,
  plannedExercises,
  validationMessage
}: {
  actualDurationMinutes: number;
  canSubmit: boolean;
  discomfortAnswer: "" | "no" | "yes";
  discomfortDraft: { bodyArea: string; exerciseKey: string; intensity: number; notes: string; phase: string };
  finalRpe: number;
  notes: string;
  onClose: () => void;
  onDiscomfortAnswerChange: (value: "no" | "yes") => void;
  onDiscomfortDraftChange: Dispatch<SetStateAction<{ bodyArea: string; exerciseKey: string; intensity: number; notes: string; phase: string }>>;
  onDurationChange: (value: number) => void;
  onFinalRpeChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  performedExercises: AthleteExercise[];
  plannedExercises: AthleteExercise[];
  validationMessage: string;
}) {
  const plannedSetTotal = plannedExercises.reduce((total, exercise) => total + getFinalizePlannedSetCount(exercise), 0);
  const recordedSetTotal = performedExercises.reduce((total, exercise) => total + getFinalizeRecordedSetCount(exercise), 0);
  const omittedSetTotal = performedExercises.reduce((total, exercise) => total + (exercise.omittedSetNumbers ?? []).filter((setNumber) => setNumber <= getFinalizePlannedSetCount(exercise)).length, 0);
  const pendingSetTotal = Math.max(0, plannedSetTotal - recordedSetTotal - omittedSetTotal);
  const completionOnlyExercises = plannedExercises.filter((exercise) => getSessionExerciseExecutionMode(exercise) === "completion_only");
  const completedExerciseTotal = performedExercises.filter((exercise) => getSessionExerciseExecutionMode(exercise) === "completion_only" && exercise.completion?.completed).length;
  const pendingExerciseTotal = Math.max(0, completionOnlyExercises.length - completedExerciseTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <section aria-label="Finalizar sesión" aria-modal="true" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-xl border border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-soft sm:max-h-[88vh] sm:rounded-xl sm:p-5" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-ink">Finalizar sesión</h3>
            <p className="mt-1 text-sm text-ink/55">Completa estos cuatro datos antes de cerrar.</p>
          </div>
          <button aria-label="Cerrar finalización" className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-panel/45 font-semibold text-ink/60" onClick={onClose} type="button">X</button>
        </div>

        {pendingSetTotal > 0 ? <p className="mt-4 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm text-ink/65">Quedan {pendingSetTotal} {pendingSetTotal === 1 ? "serie" : "series"} sin registrar. Puedes volver a la sesión o finalizar igualmente.</p> : null}
        {pendingExerciseTotal > 0 ? <p className="mt-2 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm text-ink/65">Quedan {pendingExerciseTotal} {pendingExerciseTotal === 1 ? "ejercicio simple" : "ejercicios simples"} sin completar. Puedes volver a la sesión o finalizar igualmente.</p> : null}

        <div className="mt-4 grid gap-4">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Esfuerzo global</legend>
            <p className="mt-1 text-xs text-ink/50">¿Qué esfuerzo tuvo la sesión en conjunto?</p>
            <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <button aria-pressed={finalRpe === value} className={`h-10 rounded-md border text-sm font-bold ${finalRpe === value ? "border-ink bg-ink text-white" : "border-line bg-panel/35 text-ink/70"}`} key={value} onClick={() => onFinalRpeChange(value)} type="button">{value}</button>
              ))}
            </div>
          </fieldset>

          <label className="space-y-1 text-sm font-semibold text-ink">Duración total de la sesión<div className="flex items-center gap-2"><input className="h-11 min-w-0 flex-1 rounded-md border border-line bg-panel/25 px-3 font-normal text-ink" inputMode="numeric" min={1} onChange={(event) => onDurationChange(Number(event.target.value) || 0)} placeholder="Minutos" type="number" value={actualDurationMinutes || ""} /><span className="text-sm text-ink/55">min</span></div></label>

          <fieldset className="rounded-md border border-line bg-panel/25 p-3">
            <legend className="px-1 text-sm font-semibold text-ink">¿Alguna molestia?</legend>
            <div className="mt-1 flex gap-2">
              {([['no', 'No'], ['yes', 'Sí']] as const).map(([value, label]) => (
                <button aria-pressed={discomfortAnswer === value} className={`h-10 min-w-20 rounded-md border px-4 text-sm font-semibold ${discomfortAnswer === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"}`} key={value} onClick={() => onDiscomfortAnswerChange(value)} type="button">{label}</button>
              ))}
            </div>
            {discomfortAnswer === "yes" ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-ink/60">Zona corporal<input className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onDiscomfortDraftChange((current) => ({ ...current, bodyArea: event.target.value }))} placeholder="Ej: rodilla derecha" value={discomfortDraft.bodyArea} /></label>
                <label className="space-y-1 text-xs font-semibold text-ink/60">Intensidad 1-10<input className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink" inputMode="numeric" max={10} min={1} onChange={(event) => onDiscomfortDraftChange((current) => ({ ...current, intensity: Number(event.target.value) || 0 }))} type="number" value={discomfortDraft.intensity || ""} /></label>
                <label className="space-y-1 text-xs font-semibold text-ink/60">Fase<select className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onDiscomfortDraftChange((current) => ({ ...current, phase: event.target.value }))} value={discomfortDraft.phase}><option value="">Selecciona</option>{discomfortPhases.map((phase) => <option key={phase} value={phase}>{phase}</option>)}</select></label>
                <label className="space-y-1 text-xs font-semibold text-ink/60">Ejercicio<select className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onDiscomfortDraftChange((current) => ({ ...current, exerciseKey: event.target.value }))} value={discomfortDraft.exerciseKey}><option value="">Sin asociar</option>{performedExercises.map((exercise, index) => <option key={`${exercise.id || exercise.exerciseName}-${index}`} value={`${index}`}>{exercise.exerciseName || exercise.name || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio"}</option>)}</select></label>
                <label className="space-y-1 text-xs font-semibold text-ink/60 sm:col-span-2">Descripción · opcional<textarea className="min-h-16 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => onDiscomfortDraftChange((current) => ({ ...current, notes: event.target.value }))} value={discomfortDraft.notes} /></label>
              </div>
            ) : null}
          </fieldset>

          <label className="space-y-1 text-sm font-semibold text-ink">Comentario <span className="font-normal text-ink/45">· opcional</span><textarea className="min-h-16 w-full rounded-md border border-line bg-panel/25 px-3 py-2 text-sm font-normal text-ink" onChange={(event) => onNotesChange(event.target.value)} placeholder="Algo que deba saber tu entrenador…" value={notes} /></label>

        </div>

        {validationMessage ? <p className="mt-3 text-sm font-medium text-coral">{validationMessage}</p> : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button className="h-11 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink" onClick={onClose} type="button">Volver a la sesión</button>
          <button className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45" disabled={!canSubmit} onClick={onSubmit} type="button">Finalizar sesión</button>
        </div>
      </section>
    </div>
  );
}

function AthleteSessionPreviewModal({
  onClose,
  session
}: {
  onClose: () => void;
  session: AthleteSessionRecord;
}) {
  const resistanceMethod = getResistanceMethodById(session.resistanceMethodId);
  const resistanceZoneGuide = getAthleteResistanceZoneGuide(session.resistanceSport, session.targetResistanceZoneId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-xl border border-line bg-white p-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-soft sm:max-h-[88vh] sm:rounded-md sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-ink/45">Tu sesión</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{session.summary || "Sesión planificada"}</h3>
            <p className="mt-1 text-sm text-ink/60">{formatAthleteTodayDate(session.date)} · {session.type}</p>
          </div>
          <button
            aria-label="Cerrar resumen"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-panel/45 text-base font-semibold text-ink/60"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>

        {resistanceMethod ? (
          <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
            <p className="font-semibold text-ink">Método: {getAthleteResistanceMethodLabel(resistanceMethod)}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <ClientInfoCard label="Intensidad" value={resistanceMethod.intensity || "Sin especificar"} />
              <ClientInfoCard label="Repeticiones / duración" value={[resistanceMethod.repetitions, resistanceMethod.repetitionDuration].filter(Boolean).join(" · ") || "Sin especificar"} />
              <ClientInfoCard label="Recuperación" value={resistanceMethod.recoveryBetweenRepetitions || "Sin especificar"} />
              <ClientInfoCard label="Series" value={resistanceMethod.series || "Sin especificar"} />
            </div>
          </div>
        ) : null}
        {resistanceZoneGuide.zone ? (
          <div className="mt-3 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
            <p className="font-semibold text-ink">Zona objetivo: {resistanceZoneGuide.zone.label}</p>
            <p className="mt-1">{resistanceZoneGuide.profile.name} · {resistanceZoneGuide.zone.description}</p>
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

        <div className="mt-5">
          <AthleteSessionPlan exercises={session.plannedExercises ?? []} />
        </div>
      </section>
    </div>
  );
}

function AthleteWellnessModal({
  onClose,
  onConfirm,
  readinessScore,
  setWellness,
  wellness,
  wellnessComplete
}: {
  onClose: () => void;
  onConfirm: () => void;
  readinessScore: string | null;
  setWellness: Dispatch<SetStateAction<AthleteWellness>>;
  wellness: AthleteWellness;
  wellnessComplete: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="max-h-[94dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-xl border border-line bg-white p-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-soft sm:max-h-[88vh] sm:rounded-md sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-ink">Wellness previo</h3>
            <p className="mt-1 text-sm text-ink/60">Valora cómo te encuentras antes de empezar.</p>
          </div>
          <button
            aria-label="Cerrar wellness"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-panel/45 text-base font-semibold text-ink/60"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>
        <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
          <p className="font-semibold text-ink">Escala: 1 = muy mal · 5 = muy bien</p>
          <p className="mt-1">Cuanto mayor sea la puntuación, mejor es tu preparación para entrenar.</p>
        </div>
        <div className="mt-4 grid gap-3">
          {athleteWellnessFields.map((field) => (
            <div className="rounded-md border border-line bg-panel/35 p-2.5 sm:p-3" key={field.key}>
              <p className="text-sm font-medium text-ink">{field.label}</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-pressed={getPositiveWellnessValue(wellness, field.key) === value}
                    className={`h-12 rounded-md border text-base font-semibold ${getPositiveWellnessValue(wellness, field.key) === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"}`}
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
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink/65">Readiness del día: {readinessScore ?? "Pendiente"} / 5</p>
          <button
            className="h-12 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            disabled={!wellnessComplete}
            onClick={onConfirm}
            type="button"
          >
            Confirmar wellness
          </button>
        </div>
      </section>
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
    <div className="mt-5 rounded-md border border-dashed border-line bg-white p-5 text-center shadow-soft sm:p-8">
      <h2 className="text-lg font-semibold text-ink">Sesión de hoy</h2>
      {clientName ? <p className="mt-1 text-sm font-medium text-ink/70">{clientName}</p> : null}
      <p className="mt-3 text-sm text-ink/60">{message}</p>
      {onShowCalendar && onShowHistory && onShowPlanning && onShowWeeklyLoad ? (
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="min-h-11 w-full rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel sm:w-auto"
            onClick={onShowCalendar}
            type="button"
          >
            Ver calendario
          </button>
          <button
            className="min-h-11 w-full rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel sm:w-auto"
            onClick={onShowWeeklyLoad}
            type="button"
          >
            Ver carga semanal
          </button>
          <button
            className="min-h-11 w-full rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-panel sm:w-auto"
            onClick={onShowHistory}
            type="button"
          >
            Ver historial
          </button>
          <button
            className="min-h-11 w-full rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 sm:w-auto"
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
      setNumber: Number.isInteger(detail.setNumber) && detail.setNumber > 0 ? detail.setNumber : index + 1
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

function AthleteExerciseCard({ exercise, index, isFinished, isOpen, onFinish, onOpen, onToggleCompletion, onUpdate, onUpdateExecution }: {
  exercise: AthleteExercise;
  index: number;
  isFinished: boolean;
  isOpen: boolean;
  onFinish: () => void;
  onOpen: () => void;
  onToggleCompletion: (index: number, completed: boolean) => void;
  onUpdate: (index: number, updates: Partial<AthleteExercise>) => void;
  onUpdateExecution: (index: number, updates: Partial<AthleteExercise>) => void;
}) {
  const exerciseName = exercise.exerciseName || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
  const setDetails = normalizeSetDetails(exercise);
  const materialVariant = getAthleteExerciseMaterialVariant(exercise);
  const prescription = getAthleteExercisePrescription(exercise);
  const intensityMethod = getAthleteExerciseIntensityMethod(exercise);
  const exerciseKey = `${exercise.id || exercise.exerciseId || exerciseName}-${index}`;
  const plannedSequence = (exercise.plannedSetReps ?? []).filter(hasAthleteDisplayValue);
  const plannedSetCount = Math.max(
    plannedSequence.length,
    Math.max(0, Math.trunc(parsePositiveNumber(exercise.plannedSets ?? exercise.sets)))
  );
  const highestActualSetNumber = resolveSessionSetNumbers(setDetails).reduce((highest, entry) => Math.max(highest, entry.setNumber), 0);
  const totalSetCount = Math.max(plannedSetCount, highestActualSetNumber, 1);
  const completionOnly = getSessionExerciseExecutionMode(exercise) === "completion_only";
  const exerciseCompleted = exercise.completion?.completed === true;
  const omittedSetNumbers = (exercise.omittedSetNumbers ?? []).filter((value) => Number.isInteger(value) && value > 0 && value <= plannedSetCount);
  const [editingSetNumber, setEditingSetNumber] = useState<number | null>(null);
  const [setDraft, setSetDraft] = useState<AthleteSetDetail>({ setNumber: totalSetCount + 1 });
  const [setValidation, setSetValidation] = useState("");
  const [effortDraft, setEffortDraft] = useState(exercise.exerciseEffort?.type === "rpe" ? `${exercise.exerciseEffort.value}` : "");
  const [effortValidation, setEffortValidation] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (editingSetNumber !== null) return;
    setSetDraft({ setNumber: totalSetCount + 1 });
    setSetValidation("");
  }, [editingSetNumber, totalSetCount]);

  function getPlannedReps(setIndex: number) {
    if (exercise.setMethod === "cluster" && exercise.clusterConfig?.repsPerMiniSet?.length) {
      return exercise.clusterConfig.repsPerMiniSet.join(" + ");
    }
    return plannedSequence[setIndex] ?? exercise.plannedReps ?? "";
  }

  function getPlannedReference(setNumber: number) {
    const setIndex = setNumber - 1;
    const reference = [
      hasAthleteDisplayValue(exercise.plannedLoad) ? `${exercise.plannedLoad} kg` : "",
      hasAthleteDisplayValue(getPlannedReps(setIndex)) ? `${getPlannedReps(setIndex)} reps` : "",
      hasAthleteDisplayValue(
        intensityMethod === "rir" ? exercise.plannedRir ?? exercise.targetRir
          : intensityMethod === "rpe" ? exercise.plannedRpe ?? exercise.targetRpe
          : intensityMethod === "percent_1rm" ? exercise.percent1RM
          : exercise.targetVelocity
      ) ? getAthleteExercisePrescription(exercise).find((item) => item.startsWith("RIR") || item.startsWith("RPE") || item.includes("% 1RM") || item.includes("m/s")) ?? "" : ""
    ].filter(Boolean);
    return reference.join(" · ");
  }

  function getPlannedSetValues(setNumber: number): AthleteSetDetail {
    const reps = exercise.setMethod === "cluster" && exercise.clusterConfig?.repsPerMiniSet?.length
      ? exercise.clusterConfig.repsPerMiniSet.reduce<number>((total, value) => total + parsePositiveNumber(value), 0)
      : getPlannedReps(setNumber - 1);
    const result: AthleteSetDetail = { setNumber };
    if (Number.isInteger(Number(`${reps}`.trim())) && Number(reps) >= 0) result.reps = reps;
    if (hasAthleteDisplayValue(exercise.plannedLoad)) result.load = exercise.plannedLoad;
    if (intensityMethod === "rir" && hasAthleteDisplayValue(exercise.plannedRir ?? exercise.targetRir)) result.rir = exercise.plannedRir ?? exercise.targetRir;
    if (intensityMethod === "velocity" && hasAthleteDisplayValue(exercise.targetVelocity)) result.velocity = exercise.targetVelocity;
    return result;
  }

  function upsertSet(detail: AthleteSetDetail) {
    const withoutSet = resolveSessionSetNumbers(setDetails).filter((entry) => entry.setNumber !== detail.setNumber).map((entry) => ({ ...entry.detail, setNumber: entry.setNumber }));
    const nextSetDetails = [...withoutSet, detail].sort((a, b) => a.setNumber - b.setNumber);
    onUpdateExecution(index, { omittedSetNumbers: omittedSetNumbers.filter((value) => value < detail.setNumber), setDetails: nextSetDetails });
  }

  function beginEdit(setNumber: number) {
    const actual = getSessionSetByNumber(setDetails, setNumber);
    setEditingSetNumber(setNumber);
    setSetDraft(actual ? { ...actual, setNumber } : setNumber > plannedSetCount ? { setNumber } : getPlannedSetValues(setNumber));
    setSetValidation("");
  }

  function confirmAccordingToPlan(setNumber: number) {
    upsertSet(getPlannedSetValues(setNumber));
    setEditingSetNumber(null);
  }

  function omitSet(setNumber: number) {
    const hasLaterRecordedSet = resolveSessionSetNumbers(setDetails).some((entry) => entry.setNumber > setNumber);
    if (hasLaterRecordedSet && typeof window !== "undefined") {
      const shouldOmit = window.confirm("Esta serie y las siguientes se marcarán como no realizadas. Se eliminarán los registros posteriores de este ejercicio.");
      if (!shouldOmit) return;
    }
    const omittedFromHere = Array.from({ length: plannedSetCount - setNumber + 1 }, (_, offset) => setNumber + offset);
    const nextSetDetails = resolveSessionSetNumbers(setDetails)
      .filter((entry) => entry.setNumber < setNumber)
      .map((entry) => ({ ...entry.detail, setNumber: entry.setNumber }));
    const hasRemainingRecordedSet = nextSetDetails.some((detail) => Number(detail.setNumber) <= plannedSetCount);
    onUpdateExecution(index, {
      exerciseEffort: hasRemainingRecordedSet ? exercise.exerciseEffort : undefined,
      omittedSetNumbers: [...new Set([...omittedSetNumbers.filter((value) => value < setNumber), ...omittedFromHere])].sort((a, b) => a - b),
      setDetails: nextSetDetails
    });
    setEditingSetNumber(null);
    setSetValidation("");
  }

  function deleteExtraSet(setNumber: number) {
    const nextSetDetails = resolveSessionSetNumbers(setDetails).filter((entry) => entry.setNumber !== setNumber).map((entry) => ({ ...entry.detail, setNumber: entry.setNumber }));
    onUpdateExecution(index, { setDetails: nextSetDetails });
    setEditingSetNumber(null);
  }

  function updateDraft(field: keyof AthleteSetDetail, value: string) {
    setSetDraft((current) => ({ ...current, [field]: value }));
  }

  function confirmSet(setNumber: number) {
    const reps = `${setDraft.reps ?? ""}`.trim();
    const load = `${setDraft.load ?? ""}`.trim();
    const repsNumber = Number(reps.replace(",", "."));
    const loadNumber = load ? Number(load.replace(",", ".")) : null;
    const rir = `${setDraft.rir ?? ""}`.trim();
    const velocity = `${setDraft.velocity ?? ""}`.trim();
    const rirNumber = rir ? Number(rir.replace(",", ".")) : null;
    const velocityNumber = velocity ? Number(velocity.replace(",", ".")) : null;

    if (!reps || !Number.isInteger(repsNumber) || repsNumber < 0) {
      setSetValidation("Introduce repeticiones reales con un número entero igual o mayor que 0.");
      return;
    }
    if (loadNumber !== null && (!Number.isFinite(loadNumber) || loadNumber < 0)) {
      setSetValidation("La carga debe ser un número igual o mayor que 0, o quedar vacía.");
      return;
    }
    if (intensityMethod === "rir" && (rirNumber === null || !Number.isFinite(rirNumber) || rirNumber < 0 || rirNumber > 10)) {
      setSetValidation("Introduce un RIR real entre 0 y 10.");
      return;
    }
    if (intensityMethod === "velocity" && (velocityNumber === null || !Number.isFinite(velocityNumber) || velocityNumber < 0)) {
      setSetValidation("Introduce una velocidad real igual o mayor que 0.");
      return;
    }
    const confirmedDetail: AthleteSetDetail = {
      setNumber,
      reps
    };
    if (load) confirmedDetail.load = load;
    if (intensityMethod === "rir") confirmedDetail.rir = rir;
    if (intensityMethod === "velocity") confirmedDetail.velocity = velocity;
    upsertSet(confirmedDetail);
    setEditingSetNumber(null);
    setSetDraft({ setNumber: Math.max(totalSetCount, setNumber) + 1 });
    setSetValidation("");
  }

  function isSetEqualToPlan(detail: AthleteSetDetail, setNumber: number) {
    const planned = getPlannedSetValues(setNumber);
    const equalValue = (actual: number | string | null | undefined, target: number | string | null | undefined) => {
      const actualText = `${actual ?? ""}`.trim().replace(",", ".");
      const targetText = `${target ?? ""}`.trim().replace(",", ".");
      const actualNumber = Number(actualText);
      const targetNumber = Number(targetText);
      return actualText && targetText && Number.isFinite(actualNumber) && Number.isFinite(targetNumber)
        ? actualNumber === targetNumber
        : actualText === targetText;
    };
    return equalValue(detail.reps, planned.reps)
      && equalValue(detail.load, planned.load)
      && (intensityMethod !== "rir" || equalValue(detail.rir, planned.rir))
      && (intensityMethod !== "velocity" || equalValue(detail.velocity, planned.velocity));
  }

  const isMobility = getExerciseById(exercise.exerciseId || "")?.exerciseType === "mobility";
  const recordedPlannedSetNumbers = new Set(resolveSessionSetNumbers(setDetails).filter((entry) => entry.setNumber <= plannedSetCount).map((entry) => entry.setNumber));
  const requiresEffort = !completionOnly && !isMobility && recordedPlannedSetNumbers.size > 0;
  const firstOmittedSetNumber = omittedSetNumbers.length > 0 ? Math.min(...omittedSetNumbers) : null;
  const nextPendingSetNumber = Array.from({ length: plannedSetCount }, (_, offset) => offset + 1).find((setNumber) => !recordedPlannedSetNumbers.has(setNumber) && !omittedSetNumbers.includes(setNumber)) ?? null;
  const nextActionableSetNumber = firstOmittedSetNumber ?? nextPendingSetNumber;
  const allPlannedSetsRecorded = plannedSetCount > 0 && Array.from({ length: plannedSetCount }, (_, offset) => offset + 1).every((setNumber) => recordedPlannedSetNumbers.has(setNumber));
  const resolvedPlannedSets = Array.from({ length: plannedSetCount }, (_, offset) => offset + 1).filter((setNumber) =>
    Boolean(getSessionSetByNumber(setDetails, setNumber)) || omittedSetNumbers.includes(setNumber)
  ).length;
  const seriesResolved = !completionOnly && plannedSetCount > 0 && resolvedPlannedSets === plannedSetCount;
  const exerciseStatus = completionOnly
    ? exerciseCompleted ? "Completado" : "Pendiente"
    : isFinished ? "Completado" : resolvedPlannedSets > 0 ? "En curso" : "Pendiente";
  const displaySetCount = Math.max(totalSetCount, editingSetNumber ?? 0);

  function finishCurrentExercise() {
    if (!seriesResolved) return;
    if (requiresEffort) {
      const value = Number(effortDraft.replace(",", "."));
      if (!Number.isFinite(value) || value < 1 || value > 10) {
        setEffortValidation("Introduce un RPE real entre 1 y 10.");
        return;
      }
      onUpdateExecution(index, { exerciseEffort: { type: "rpe", value } });
    }
    setEffortValidation("");
    onFinish();
  }

  return (
    <article className={`min-w-0 rounded-md border ${isOpen ? "border-moss/35 bg-white" : "border-line bg-panel/25"}`}>
      <button
        aria-expanded={isOpen}
        className="flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left"
        onClick={onOpen}
        type="button"
      >
        <span className={`text-sm font-bold ${isFinished || exerciseCompleted ? "text-[rgb(var(--color-success))]" : "text-ink/35"}`}>
          {isFinished || exerciseCompleted ? "✓" : "•"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{exerciseName}</span>
          <span className="mt-0.5 block text-xs text-ink/50">
            {completionOnly ? exerciseStatus : `${resolvedPlannedSets}/${plannedSetCount} series · ${exercise.exerciseEffort ? `${exercise.exerciseEffort.type.toUpperCase()} ${exercise.exerciseEffort.value}` : "RPE —"}`}
          </span>
        </span>
        <span className={`text-lg text-ink/35 transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {isOpen ? <div className="border-t border-line px-3 pb-3 pt-3">
        {materialVariant ? <p className="text-sm font-medium text-ink/65">{materialVariant}</p> : null}
        {prescription.length > 0 ? <p className="mt-1 text-sm font-medium text-ink/65">Plan · {prescription.join(" · ")}</p> : null}
        {(exercise.videoUrl || exercise.videoNote) ? (
          <details className="mt-3 rounded-md border border-line bg-panel/25 p-3 text-sm text-ink/65">
            <summary className="cursor-pointer font-semibold text-ink">▶ Ver técnica</summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-start sm:justify-between">
              {exercise.videoNote ? <p><span className="font-semibold text-ink">Clave técnica:</span> {exercise.videoNote}</p> : null}
              {exercise.videoUrl ? <a className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink" href={exercise.videoUrl} rel="noreferrer" target="_blank">Abrir vídeo técnico</a> : null}
            </div>
          </details>
        ) : null}

        {completionOnly ? (
          <button
            aria-pressed={exerciseCompleted}
            className={`mt-4 min-h-12 w-full rounded-md border px-4 py-2 text-sm font-semibold transition ${exerciseCompleted ? "border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/10 text-ink" : "border-line bg-white text-ink hover:bg-mint"}`}
            onClick={() => {
              const nextCompleted = !exerciseCompleted;
              onToggleCompletion(index, nextCompleted);
              if (nextCompleted) onFinish();
            }}
            type="button"
          >
            {exerciseCompleted ? "✓ Hecho" : "Marcar como hecho"}
          </button>
        ) : <div className="mt-3 overflow-hidden rounded-md border border-line bg-white">
        {Array.from({ length: displaySetCount }, (_, indexOffset) => indexOffset + 1).map((setNumber) => {
          const actual = getSessionSetByNumber(setDetails, setNumber);
          const omitted = setNumber <= plannedSetCount && omittedSetNumbers.includes(setNumber);
          const extra = setNumber > plannedSetCount;
          const isEditing = editingSetNumber === setNumber;
          const equalToPlan = Boolean(actual && !extra && isSetEqualToPlan(actual, setNumber));
          const canActOnPlannedSet = Boolean(actual) || setNumber === nextActionableSetNumber;
          const canConfirmPlan = hasAthleteDisplayValue(getPlannedSetValues(setNumber).reps);
          const display = omitted ? "No realizada" : actual ? [hasAthleteDisplayValue(actual.load) ? `${actual.load} kg` : "", `${actual.reps ?? "—"} reps`, hasAthleteDisplayValue(actual.rir) ? `RIR ${actual.rir}` : "", hasAthleteDisplayValue(actual.velocity) ? `${actual.velocity} m/s` : ""].filter(Boolean).join(" · ") : extra ? "Serie adicional" : getPlannedReference(setNumber) || "Sin detalle";
          return (
            <div className={`${setNumber > 1 ? "border-t border-line" : ""} ${omitted ? "bg-clay/5" : ""}`} key={`${exerciseKey}-${setNumber}`}>
              <div className="flex min-h-14 min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-1.5 sm:flex-nowrap">
                <span className="w-10 shrink-0 text-xs font-bold text-ink/50">S{setNumber}</span>
                <span className="min-w-[9rem] flex-1 break-words text-sm font-semibold text-ink">{display}</span>
                {!isEditing ? <div className="ml-auto flex shrink-0 items-center gap-1">
                  {!extra ? <button aria-label="Realizada según el plan" className={`grid h-11 w-11 place-items-center rounded-md text-base font-bold disabled:cursor-not-allowed disabled:opacity-35 ${equalToPlan ? "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]" : "text-ink/50 hover:bg-panel"}`} disabled={!canConfirmPlan || !canActOnPlannedSet} onClick={() => confirmAccordingToPlan(setNumber)} title={canConfirmPlan ? "Realizada según el plan" : "Modifica la serie para registrar un rango planificado"} type="button">✓</button> : null}
                  <button aria-label="Modificar serie" className={`grid h-11 w-11 place-items-center rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-35 ${actual && !equalToPlan ? "bg-amber-50 text-amber-800" : "text-ink/50 hover:bg-panel"}`} disabled={!extra && !canActOnPlannedSet} onClick={() => beginEdit(setNumber)} title="Modificar serie" type="button">✎</button>
                  <button aria-label={extra ? "Eliminar serie adicional" : "No realizar esta serie ni las siguientes"} className={`grid h-11 w-11 place-items-center rounded-md text-base disabled:cursor-not-allowed disabled:opacity-35 ${omitted ? "bg-clay/10 text-clay" : "text-ink/50 hover:bg-panel"}`} disabled={!extra && !actual && setNumber !== nextPendingSetNumber} onClick={() => extra ? deleteExtraSet(setNumber) : omitSet(setNumber)} title={extra ? "Eliminar serie adicional" : "No realizar esta serie ni las siguientes"} type="button">×</button>
                </div> : null}
              </div>
              {actual && !extra && !equalToPlan ? <p className="-mt-1 px-2.5 pb-2 pl-[3.125rem] text-xs text-ink/45">Plan · {getPlannedReference(setNumber)}</p> : null}
              {isEditing ? (
                <div className="border-t border-line bg-panel/20 px-3 py-3">
                  <p className="text-xs text-ink/50">{extra ? "Serie adicional" : `Plan · ${getPlannedReference(setNumber)}`}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <AthleteExerciseInput dataField={`${exerciseKey}-${setNumber}-load`} inputMode="decimal" label="Carga (kg)" onChange={(value) => updateDraft("load", value)} value={setDraft.load} />
                    <AthleteExerciseInput dataField={`${exerciseKey}-${setNumber}-reps`} inputMode="numeric" label="Reps" onChange={(value) => updateDraft("reps", value)} value={setDraft.reps} />
                    {intensityMethod === "rir" ? <AthleteExerciseInput dataField={`${exerciseKey}-${setNumber}-rir`} inputMode="decimal" label="RIR real" onChange={(value) => updateDraft("rir", value)} value={setDraft.rir} /> : null}
                    {intensityMethod === "velocity" ? <AthleteExerciseInput dataField={`${exerciseKey}-${setNumber}-velocity`} inputMode="decimal" label="Velocidad real (m/s)" onChange={(value) => updateDraft("velocity", value)} value={setDraft.velocity} /> : null}
                  </div>
                  {setValidation ? <p className="mt-2 text-xs font-medium text-clay">{setValidation}</p> : null}
                  <div className="mt-3 flex gap-2"><button className="min-h-11 flex-1 rounded-md bg-ink px-3 text-sm font-semibold text-white" onClick={() => confirmSet(setNumber)} type="button">Guardar</button><button className="min-h-11 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink/60" onClick={() => setEditingSetNumber(null)} type="button">Cancelar</button></div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>}
      {setValidation && editingSetNumber === null ? <p className="mt-2 text-xs font-medium text-clay">{setValidation}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
        {!completionOnly && allPlannedSetsRecorded && omittedSetNumbers.length === 0 ? <button className="min-h-10 text-sm font-semibold text-moss" onClick={() => beginEdit(Math.max(plannedSetCount, highestActualSetNumber) + 1)} type="button">+ Añadir serie</button> : null}
        <button className="min-h-10 text-sm font-semibold text-moss" onClick={() => setShowNotes((current) => !current)} type="button">{exercise.athleteNotes?.trim() ? "Nota · Editar" : "+ Nota"}</button>
        <button className="min-h-10 text-sm font-semibold text-moss" onClick={() => setShowVideo((current) => !current)} type="button">{exercise.techniqueVideoUrl?.trim() ? `Vídeo añadido · ${athleteTechniqueVideoViewLabels[exercise.techniqueVideoView ?? "side"]}` : "+ Vídeo"}</button>
      </div>
      {!showNotes && exercise.athleteNotes?.trim() ? <p className="mt-1 line-clamp-2 text-sm text-ink/55">{exercise.athleteNotes}</p> : null}
      {showNotes ? (
        <label className="mt-3 block space-y-1 text-xs font-medium text-ink/65" htmlFor={`${exerciseKey}-athlete-notes`}>
          Nota del deportista
          <textarea className="min-h-11 w-full resize-y rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-moss" id={`${exerciseKey}-athlete-notes`} onChange={(event) => onUpdate(index, { athleteNotes: event.target.value })} rows={1} value={exercise.athleteNotes ?? ""} />
        </label>
      ) : null}
      {showVideo ? (
        <div className="mt-3 rounded-md border border-line bg-white p-3">
          <p className="text-sm font-semibold text-ink">Vídeo para revisión del entrenador</p>
          <p className="mt-1 text-xs text-ink/50">Comparte solo vídeos que quieras que revise tu entrenador. Usa enlaces privados o no listados si contienen información personal.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-ink/65 sm:col-span-2">
            Enlace al vídeo
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss"
              onChange={(event) => onUpdate(index, { techniqueVideoUrl: event.target.value, techniqueVideoView: exercise.techniqueVideoView ?? "side" })}
              placeholder="Pega aquí un enlace privado o no listado a tu vídeo."
              type="url"
              value={exercise.techniqueVideoUrl ?? ""}
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink/65">
            Vista del vídeo
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss"
              onChange={(event) => onUpdate(index, { techniqueVideoView: event.target.value as AthleteTechniqueVideoView })}
              value={exercise.techniqueVideoView ?? "side"}
            >
              {Object.entries(athleteTechniqueVideoViewLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink/65">
            Nota del deportista
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss"
              onChange={(event) => onUpdate(index, { techniqueVideoNote: event.target.value })}
              placeholder="Opcional"
              type="text"
              value={exercise.techniqueVideoNote ?? ""}
            />
          </label>
          </div>
        </div>
      ) : null}
      {!completionOnly && seriesResolved ? (
        <div className="mt-3 rounded-md border border-moss/30 bg-mint/35 p-2.5">
          <div className="flex flex-wrap items-end gap-2">
            {requiresEffort ? (
              <label className="min-w-0 flex-1 text-xs font-semibold text-ink/65 sm:max-w-44">
                Esfuerzo real · RPE
                <input
                  aria-label="Esfuerzo real RPE"
                  className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-base text-ink outline-none focus:border-moss"
                  inputMode="decimal"
                  onChange={(event) => { setEffortDraft(event.target.value); setEffortValidation(""); }}
                  type="text"
                  value={effortDraft}
                />
              </label>
            ) : null}
            <button className="min-h-11 flex-1 rounded-md bg-ink px-4 text-sm font-semibold text-white sm:flex-none" onClick={finishCurrentExercise} type="button">Finalizar ejercicio</button>
          </div>
          {effortValidation ? <p className="mt-2 text-xs font-medium text-clay">{effortValidation}</p> : null}
        </div>
      ) : null}
      </div> : null}
    </article>
  );
}

function AthleteExerciseInput({ className = "", dataField, inputMode = "decimal", label, onChange, placeholder, value }: {
  className?: string;
  dataField?: string;
  inputMode?: "decimal" | "numeric";
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: number | string | null;
}) {
  return (
    <label className={`min-w-0 space-y-1 text-xs font-medium text-ink/65 ${className}`}>
      {label}
      <input
        className="h-12 min-w-0 w-full rounded-md border border-line bg-white px-3 text-base text-ink outline-none focus:border-moss"
        data-athlete-set-field={dataField}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value ?? ""}
      />
    </label>
  );
}
