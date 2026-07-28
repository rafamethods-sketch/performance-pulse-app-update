export type ClientSex = "female" | "male" | "other" | "prefer_not_to_say";

export type MenstrualBleedingLevel = "none" | "spotting" | "light" | "moderate" | "heavy";

export type MenstrualSymptomKey =
  | "cramps"
  | "fatigue"
  | "lowBackPain"
  | "headache"
  | "bloating"
  | "moodChanges"
  | "poorSleep"
  | "cravings"
  | "digestiveDiscomfort"
  | "lowMotivation"
  | "perceivedPerformanceDrop";

export type MenstrualCycleEntry = {
  bleeding?: MenstrualBleedingLevel;
  date: string;
  id: string;
  notes?: string;
  symptoms?: Partial<Record<MenstrualSymptomKey, number>>;
};

export type MenstrualTracking = {
  averageBleedingDays?: number;
  averageCycleLength?: number;
  cycleRegularity?: "regular" | "irregular" | "unknown";
  enabled: boolean;
  entries?: MenstrualCycleEntry[];
  hormonalContraception?: "yes" | "no" | "prefer_not_to_say";
  lastPeriodStartDate?: string;
  shareWithCoach?: boolean;
};

export type MenstrualPhase = "menstruation" | "follicular" | "ovulation" | "luteal" | "unknown";

export type MenstrualPhaseEstimate = {
  confidence: "estimated" | "unknown";
  cycleDay: number | null;
  label: string;
  phase: MenstrualPhase;
};

export const menstrualPhaseLabels: Record<MenstrualPhase, string> = {
  follicular: "Folicular",
  luteal: "Lútea",
  menstruation: "Menstruación",
  ovulation: "Ovulación",
  unknown: "Sin estimación"
};

export const menstrualBleedingLabels: Record<MenstrualBleedingLevel, string> = {
  heavy: "Abundante",
  light: "Ligero",
  moderate: "Moderado",
  none: "Ninguno",
  spotting: "Manchado"
};

export const menstrualSymptomLabels: Record<MenstrualSymptomKey, string> = {
  bloating: "Hinchazón",
  cramps: "Dolor menstrual",
  cravings: "Antojos / hambre",
  digestiveDiscomfort: "Molestias digestivas",
  fatigue: "Fatiga",
  headache: "Dolor de cabeza",
  lowBackPain: "Dolor lumbar",
  lowMotivation: "Motivación baja",
  moodChanges: "Cambios de ánimo",
  perceivedPerformanceDrop: "Rendimiento percibido bajo",
  poorSleep: "Sueño peor"
};

function parseDateOnly(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function differenceInCalendarDays(from: Date, to: Date) {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

export function estimateMenstrualPhase({
  averageBleedingDays,
  averageCycleLength,
  date,
  lastPeriodStartDate
}: {
  averageBleedingDays?: number | string | null;
  averageCycleLength?: number | string | null;
  date?: string | null;
  lastPeriodStartDate?: string | null;
}): MenstrualPhaseEstimate {
  const startDate = parseDateOnly(lastPeriodStartDate);
  const targetDate = parseDateOnly(date ?? new Date().toISOString().slice(0, 10));
  const cycleLength = Number(averageCycleLength);
  const bleedingDays = Number(averageBleedingDays);

  if (!startDate || !targetDate || !Number.isFinite(cycleLength) || cycleLength < 18) {
    return { confidence: "unknown", cycleDay: null, label: menstrualPhaseLabels.unknown, phase: "unknown" };
  }

  const daysSinceStart = differenceInCalendarDays(startDate, targetDate);
  if (daysSinceStart < 0) {
    return { confidence: "unknown", cycleDay: null, label: menstrualPhaseLabels.unknown, phase: "unknown" };
  }

  const cycleDay = (daysSinceStart % Math.round(cycleLength)) + 1;
  const normalizedBleedingDays = Number.isFinite(bleedingDays) && bleedingDays > 0 ? Math.min(Math.round(bleedingDays), Math.round(cycleLength)) : 5;
  const ovulationDay = Math.max(normalizedBleedingDays + 2, Math.round(cycleLength) - 14);
  const ovulationStart = Math.max(normalizedBleedingDays + 1, ovulationDay - 1);
  const ovulationEnd = Math.min(Math.round(cycleLength), ovulationDay + 1);
  let phase: MenstrualPhase = "luteal";

  if (cycleDay <= normalizedBleedingDays) phase = "menstruation";
  else if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) phase = "ovulation";
  else if (cycleDay < ovulationStart) phase = "follicular";

  return {
    confidence: "estimated",
    cycleDay,
    label: menstrualPhaseLabels[phase],
    phase
  };
}

export function getMenstrualSymptomSummary(entry?: MenstrualCycleEntry | null) {
  if (!entry?.symptoms) return [];

  return Object.entries(entry.symptoms)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => ({
      key: key as MenstrualSymptomKey,
      label: menstrualSymptomLabels[key as MenstrualSymptomKey],
      level: Number(value)
    }))
    .sort((a, b) => b.level - a.level);
}

export function getCycleTrainingContext(entry?: MenstrualCycleEntry | null) {
  const symptoms = getMenstrualSymptomSummary(entry);
  const maxSymptom = symptoms.reduce((max, symptom) => Math.max(max, symptom.level), 0);

  if (maxSymptom >= 3) {
    return "Síntomas altos: priorizar comunicación, recuperación, técnica o reducción de carga si procede.";
  }
  if (maxSymptom === 2) {
    return "Síntomas moderados: valorar ajustar volumen, intensidad o densidad según respuesta.";
  }

  return "Síntomas bajos: mantener planificación prevista si la deportista se siente bien.";
}

export function getLatestMenstrualEntry(entries?: MenstrualCycleEntry[]) {
  return [...(entries ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}
