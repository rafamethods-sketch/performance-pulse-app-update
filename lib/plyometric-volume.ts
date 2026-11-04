import type { ExerciseDefinition } from "./exercises";
import type { ClusterConfig, SetMethod } from "./training-prescription";

type PlyometricSetDetail = {
  reps?: number | string | null;
  setNumber?: number | null;
};

export type PlyometricVolumeExercise = {
  clusterConfig?: ClusterConfig | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  omittedSetNumbers?: number[] | null;
  plannedReps?: number | string | null;
  plannedSetReps?: Array<number | string> | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  setDetails?: PlyometricSetDetail[] | null;
  setMethod?: SetMethod | null;
  sets?: number | string | null;
};

export type PlyometricVolumeSession = {
  completed?: boolean;
  date: string;
  exercises?: PlyometricVolumeExercise[] | null;
  performedExercises?: PlyometricVolumeExercise[] | null;
  plannedExercises?: PlyometricVolumeExercise[] | null;
  status?: string | null;
};

export type PlyometricDemandVolume = {
  unclassified: number;
  zone1: number;
  zone2: number;
  zone3: number;
};

export type WeeklyPlyometricVolume = {
  actualByDemand: PlyometricDemandVolume;
  actualContacts: number;
  actualContactsPerSession: number | null;
  actualIncomplete: boolean;
  actualSessionCount: number;
  hasActualData: boolean;
  plannedByDemand: PlyometricDemandVolume;
  plannedContacts: number;
  plannedIncomplete: boolean;
  plannedSessionCount: number;
};

export type WeekPeriod = {
  end: Date;
  start: Date;
};

function createEmptyDemandVolume(): PlyometricDemandVolume {
  return { unclassified: 0, zone1: 0, zone2: 0, zone3: 0 };
}

function readExactPositiveInteger(value: unknown) {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseSessionDate(value: string) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const date = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getWeekPeriod(referenceDate = new Date()): WeekPeriod {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { end, start };
}

export function filterSessionsInWeek<T extends { date: string }>(
  sessions: readonly T[],
  referenceDate = new Date()
) {
  const { end, start } = getWeekPeriod(referenceDate);
  return sessions.filter((session) => {
    const date = parseSessionDate(session.date);
    return Boolean(date && date >= start && date < end);
  });
}

function findExerciseDefinition(
  entry: PlyometricVolumeExercise,
  exerciseLibrary: readonly ExerciseDefinition[]
) {
  if (entry.exerciseId) {
    const exercise = exerciseLibrary.find((candidate) => candidate.id === entry.exerciseId);
    if (exercise) return exercise;
  }
  if (!entry.exerciseName) return null;
  const normalizedName = entry.exerciseName.trim().toLowerCase();
  return exerciseLibrary.find((candidate) => candidate.name.toLowerCase() === normalizedName) ?? null;
}

function getEligiblePlyometricExercise(
  entry: PlyometricVolumeExercise,
  exerciseLibrary: readonly ExerciseDefinition[]
) {
  const exercise = findExerciseDefinition(entry, exerciseLibrary);
  return exercise?.exerciseType === "plyometric" && exercise.bodyRegion === "lower_body"
    ? exercise
    : null;
}

function getPlannedContacts(entry: PlyometricVolumeExercise) {
  if (entry.plannedSetReps?.length) {
    const repetitions = entry.plannedSetReps.map(readExactPositiveInteger);
    if (repetitions.some((value) => value === null)) return null;
    return repetitions.reduce<number>((total, value) => total + (value ?? 0), 0);
  }

  const sets = readExactPositiveInteger(entry.plannedSets ?? entry.sets);
  if (sets === null) return null;

  if (entry.setMethod === "cluster") {
    const miniSets = entry.clusterConfig?.repsPerMiniSet ?? [];
    const repetitions = miniSets.map(readExactPositiveInteger);
    if (repetitions.length === 0 || repetitions.some((value) => value === null)) return null;
    return sets * repetitions.reduce<number>((total, value) => total + (value ?? 0), 0);
  }

  const reps = readExactPositiveInteger(entry.plannedReps ?? entry.reps);
  return reps === null ? null : sets * reps;
}

function getActualContacts(entry: PlyometricVolumeExercise) {
  if (!entry.setDetails) return { contacts: 0, incomplete: true };
  if (entry.setDetails.length === 0) {
    const plannedSets = readExactPositiveInteger(entry.plannedSets ?? entry.sets);
    const omittedSets = new Set(entry.omittedSetNumbers ?? []);
    const allPlannedSetsOmitted = plannedSets !== null &&
      Array.from({ length: plannedSets }, (_, index) => index + 1).every((setNumber) => omittedSets.has(setNumber));
    return { contacts: 0, incomplete: !allPlannedSetsOmitted };
  }

  let contacts = 0;
  let incomplete = false;
  entry.setDetails.forEach((detail) => {
    const reps = readExactPositiveInteger(detail.reps);
    if (reps === null) {
      incomplete = true;
      return;
    }
    contacts += reps;
  });
  return { contacts, incomplete };
}

function addDemandContacts(
  target: PlyometricDemandVolume,
  demand: ExerciseDefinition["plyometricDemand"],
  contacts: number
) {
  if (demand === 1) target.zone1 += contacts;
  else if (demand === 2) target.zone2 += contacts;
  else if (demand === 3) target.zone3 += contacts;
  else target.unclassified += contacts;
}

export function calculateWeeklyPlyometricVolume(
  sessions: readonly PlyometricVolumeSession[],
  exerciseLibrary: readonly ExerciseDefinition[]
): WeeklyPlyometricVolume {
  const result: WeeklyPlyometricVolume = {
    actualByDemand: createEmptyDemandVolume(),
    actualContacts: 0,
    actualContactsPerSession: null,
    actualIncomplete: false,
    actualSessionCount: 0,
    hasActualData: false,
    plannedByDemand: createEmptyDemandVolume(),
    plannedContacts: 0,
    plannedIncomplete: false,
    plannedSessionCount: 0
  };

  sessions.forEach((session) => {
    const plannedEntries = session.plannedExercises?.length
      ? session.plannedExercises
      : session.exercises ?? [];
    let sessionHasPlannedPlyometrics = false;
    plannedEntries.forEach((entry) => {
      const exercise = getEligiblePlyometricExercise(entry, exerciseLibrary);
      if (!exercise) return;
      sessionHasPlannedPlyometrics = true;
      const contacts = getPlannedContacts(entry);
      if (contacts === null) {
        result.plannedIncomplete = true;
        return;
      }
      result.plannedContacts += contacts;
      addDemandContacts(result.plannedByDemand, exercise.plyometricDemand, contacts);
    });
    if (sessionHasPlannedPlyometrics) result.plannedSessionCount += 1;

    let sessionActualContacts = 0;
    (session.performedExercises ?? []).forEach((entry) => {
      const exercise = getEligiblePlyometricExercise(entry, exerciseLibrary);
      if (!exercise) return;
      const hasExecutionState = Boolean(
        session.completed ||
          session.status === "Completada" ||
          entry.setDetails?.length ||
          entry.omittedSetNumbers?.length
      );
      if (!hasExecutionState) return;
      result.hasActualData = true;
      const actual = getActualContacts(entry);
      result.actualIncomplete ||= actual.incomplete;
      result.actualContacts += actual.contacts;
      sessionActualContacts += actual.contacts;
      addDemandContacts(result.actualByDemand, exercise.plyometricDemand, actual.contacts);
    });
    if (sessionActualContacts > 0) result.actualSessionCount += 1;
  });

  result.actualContactsPerSession = result.actualSessionCount > 0
    ? result.actualContacts / result.actualSessionCount
    : null;
  return result;
}
