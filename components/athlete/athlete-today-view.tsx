"use client";

import { useEffect, useState } from "react";
import type { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { CalendarDays, Clock3, Dumbbell, Gauge, Sparkles } from "lucide-react";
import { AthleteIntakeQuestionnaire } from "@/components/athlete/athlete-intake-questionnaire";
import { getExerciseById } from "@/lib/exercises";
import type { CardioPlan, CardioResult, CardioZone } from "@/lib/cardio-deviation";
import type { IntakeQuestionnaire } from "@/lib/intake-questionnaire";
import { getResistanceMethodById, type ResistanceMethod } from "@/lib/resistance-methods";
import { getSportZoneProfile, type ResistanceSport, type ResistanceZone } from "@/lib/resistance-zones";
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
  const [showIntakeEditor, setShowIntakeEditor] = useState(false);
  const [performedExercises, setPerformedExercises] = useState<AthleteExercise[]>([]);
  const [collapsedExerciseBlocks, setCollapsedExerciseBlocks] = useState<Record<AthleteExerciseBlockKey, boolean>>({
    activation: false,
    auxiliary: false,
    main: false
  });
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);
  const [athleteQuickFeedback, setAthleteQuickFeedback] = useState<"up" | "down" | null>(null);
  const [athleteQuickFeedbackNote, setAthleteQuickFeedbackNote] = useState("");
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
  const calculatedSrpe = actualDurationMinutes > 0 && finalRpe > 0
    ? actualDurationMinutes * finalRpe
    : null;
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
    setPerformedExercises(createAthleteExerciseEntries(session));
    setCollapsedExerciseBlocks({
      activation: false,
      auxiliary: false,
      main: false
    });
    setActualDurationMinutes(0);
    setAthleteQuickFeedback(null);
    setAthleteQuickFeedbackNote("");
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
  }, [client?.menstrualTracking, session, todayKey]);

  useEffect(() => {
    if (!showSessionPreview && !showWellnessModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSessionPreview(false);
        setShowWellnessModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSessionPreview, showWellnessModal]);

  function updateExercise(index: number, updates: Partial<AthleteExercise>) {
    setPerformedExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...updates } : exercise
      )
    );
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
      athleteQuickFeedback,
      athleteQuickFeedbackNote: athleteQuickFeedbackNote.trim() || undefined,
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
      sRPE: actualDurationMinutes * finalRpe,
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
  const sessionMetadata = [
    session.block,
    session.weekLabel || session.week ? `${session.weekLabel || session.week}` : "",
    session.sessionNumber ? `Sesión ${session.sessionNumber}` : ""
  ].filter(Boolean).join(" · ");

  return (
    <div className="mt-4 w-full min-w-0 space-y-4 sm:mt-5 sm:space-y-5">
      {intakeEditBlock}
      <section className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-soft">
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
              {sessionMetadata || "Entrenamiento de hoy"}
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
        <section className="rounded-md border border-line bg-panel p-5 text-center shadow-soft">
          <h3 className="font-semibold text-[rgb(var(--color-success))]">Sesión enviada al entrenador.</h3>
          <p className="mt-2 text-sm text-ink/70">sRPE: {session.sRPE ? `${session.sRPE} UA` : "Pendiente"}</p>
        </section>
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
                <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
                  <h3 className="text-lg font-semibold text-ink">Ejercicios planificados</h3>
                  <div className="mt-4 space-y-4">
                    {athleteExerciseBlocks.map((block) => {
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
                    })}
                  </div>
                </section>
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
                    <AthleteNumberField
                      label="Duración real en minutos"
                      onChange={(value) => {
                        setActualDurationMinutes(value);
                        setCardioResultDraft((current) => ({ ...current, durationMinutes: value ? `${value}` : "" }));
                      }}
                      value={actualDurationMinutes}
                    />
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
                    <AthleteNumberField
                      label="RPE final de sesión"
                      max={10}
                      onChange={(value) => {
                        setFinalRpe(value);
                        setCardioResultDraft((current) => ({ ...current, perceivedRpe: value ? `${value}` : "" }));
                      }}
                      value={finalRpe}
                    />
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
                  {!finalRpeValid ? (
                    <p className="mt-3 text-sm font-medium text-clay">
                      Introduce el RPE final de la sesión para poder enviarla.
                    </p>
                  ) : null}
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Registro final de sesión</h3>
                    <p className="mt-1 text-sm text-ink/60">Completa los datos reales al terminar.</p>
                  </div>
                  <span className="w-fit rounded-md bg-panel/60 px-3 py-1 text-sm font-semibold text-ink">
                    sRPE: {calculatedSrpe ? `${calculatedSrpe} UA` : "Pendiente"}
                  </span>
                </div>
                {!isResistanceSession ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <AthleteNumberField label="Duración real en minutos" onChange={setActualDurationMinutes} value={actualDurationMinutes} />
                    <AthleteNumberField label="RPE final de sesión" max={10} onChange={setFinalRpe} value={finalRpe} />
                  </div>
                ) : null}
                {!isResistanceSession && !finalRpeValid ? (
                  <p className="mt-3 text-sm font-medium text-clay">
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
                    <p className="mt-2 text-sm font-medium text-clay">Responde esta pregunta para poder enviar la sesión.</p>
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
                <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
                  <p className="text-sm font-semibold text-ink">¿Cómo te ha sentado la sesión?</p>
                  <p className="mt-1 text-xs text-ink/50">
                    Opcional. Esto ayuda a tu entrenador a ajustar la planificación.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      ["up", "👍 Bien"],
                      ["down", "👎 Mal"]
                    ] as const).map(([value, label]) => (
                      <button
                        aria-pressed={athleteQuickFeedback === value}
                        className={`rounded-md border px-4 py-2 text-sm font-semibold ${
                          athleteQuickFeedback === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"
                        }`}
                        onClick={() => setAthleteQuickFeedback((current) => current === value ? null : value)}
                        type="button"
                        key={value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 block space-y-2 text-sm font-medium text-ink/75">
                    Comentario breve
                    <textarea
                      className="min-h-16 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => setAthleteQuickFeedbackNote(event.target.value)}
                      placeholder="Opcional: qué fue bien o qué no sentó tan bien."
                      value={athleteQuickFeedbackNote}
                    />
                  </label>
                  <p className="mt-2 text-xs text-ink/45">
                    Este feedback es subjetivo y no sustituye al registro de RPE, molestias o bienestar.
                  </p>
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
                {validationMessage ? <p className="mt-3 text-sm font-medium text-coral">{validationMessage}</p> : null}
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
            <p className="text-xs font-semibold uppercase text-ink/45">Visualizar sesión</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{session.type}</h3>
            <p className="mt-1 text-sm text-ink/60">{session.summary}</p>
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

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <ClientInfoCard label="Bloque / mesociclo" value={`${session.block || "Sin asignar"}`} />
          <ClientInfoCard label="Semana y sesión" value={`${session.weekLabel || session.week || "Sin asignar"}${session.sessionNumber ? ` · Sesión ${session.sessionNumber}` : ""}`} />
          <ClientInfoCard label="RPE objetivo" value={session.targetRpe ? `${session.targetRpe}/10` : "Sin especificar"} />
          <ClientInfoCard label="Duración estimada" value="Sin especificar" />
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

        <div className="mt-5 grid gap-4">
          {athleteExerciseBlocks.map((block) => {
            const blockExercises = (session.plannedExercises ?? []).filter((exercise) => getAthleteExerciseBlockKey(exercise) === block.key);
            if (blockExercises.length === 0) return null;

            return (
              <section className="rounded-md border border-line bg-panel/35 p-3" key={block.key}>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-ink">{block.label}</h4>
                <div className="mt-3 grid gap-2">
                  {blockExercises.map((exercise, index) => {
                    const exerciseName = exercise.exerciseName || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
                    const materialVariant = getAthleteExerciseMaterialVariant(exercise);
                    const prescription = getAthleteExercisePrescription(exercise);
                    return (
                      <article className="rounded-md border border-line bg-white p-3" key={exercise.id || `${exerciseName}-${index}`}>
                        <p className="text-sm font-semibold text-ink">{exerciseName}</p>
                        {materialVariant ? <p className="mt-1 text-xs font-medium text-ink/55">{materialVariant}</p> : null}
                        {prescription.length > 0 ? (
                          <p className="mt-2 text-sm font-medium text-ink/65">{prescription.join(" · ")}</p>
                        ) : null}
                        {exercise.observation ? <p className="mt-2 text-xs text-ink/50">{exercise.observation}</p> : null}
                        {(exercise.videoUrl || exercise.videoNote) ? (
                          <div className="mt-3 rounded-md border border-line bg-panel/35 p-3 text-xs text-ink/60">
                            {exercise.videoNote ? (
                              <p><span className="font-semibold text-ink">Clave técnica:</span> {exercise.videoNote}</p>
                            ) : null}
                            {exercise.videoUrl ? (
                              <a
                                className="mt-2 inline-flex min-h-9 items-center rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                                href={exercise.videoUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                Ver vídeo técnico
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
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
    <article className="min-w-0 rounded-md border border-line bg-panel/35 p-3 sm:p-4">
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
      {(exercise.videoUrl || exercise.videoNote) ? (
        <div className="mt-3 rounded-md border border-line bg-white p-3 text-sm text-ink/65">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-ink">Vídeo técnico</p>
              {exercise.videoNote ? (
                <p className="mt-1"><span className="font-semibold text-ink">Clave técnica:</span> {exercise.videoNote}</p>
              ) : null}
            </div>
            {exercise.videoUrl ? (
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-panel/60 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel"
                href={exercise.videoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Ver vídeo técnico
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="mt-4 rounded-md border border-line bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink">Series registradas</p>
          <button
            className="min-h-11 w-full rounded-md border border-line bg-panel/60 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-panel sm:w-fit"
            onClick={addSetDetail}
            type="button"
          >
            Añadir serie
          </button>
        </div>
        {setDetails.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {setDetails.map((detail, setIndex) => (
              <div className="min-w-0 rounded-md border border-line bg-panel/35 p-3" key={detail.setNumber}>
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
                <div className={`grid min-w-0 grid-cols-2 gap-2 ${intensityField ? "sm:grid-cols-3" : ""}`}>
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
                      className="col-span-2 sm:col-span-1"
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
      <div className="mt-3 rounded-md border border-line bg-white p-3">
        <p className="text-sm font-semibold text-ink">Vídeo de técnica</p>
        <p className="mt-1 text-xs text-ink/50">
          Comparte solo vídeos que quieras que revise tu entrenador. Usa enlaces privados o no listados si contienen información personal.
        </p>
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
    </article>
  );
}

function AthleteExerciseInput({ className = "", dataField, inputMode = "decimal", label, onChange, onKeyDown, value }: {
  className?: string;
  dataField?: string;
  inputMode?: "decimal" | "numeric";
  label: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
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
        onKeyDown={onKeyDown}
        type="text"
        value={value ?? ""}
      />
    </label>
  );
}
