import type { ExerciseDefinition } from "./exercises";

export type SessionExerciseInput = {
  exerciseId?: string | null;
  exerciseName?: string | null;
  load?: number | string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  sets?: number | string | null;
};

export type TrainingSessionInput = {
  completed?: boolean;
  exercises?: SessionExerciseInput[];
  performedExercises?: SessionExerciseInput[];
  plannedExercises?: SessionExerciseInput[];
};

type ExerciseLibraryInput = ExerciseDefinition[];

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSessionExercises(session: TrainingSessionInput) {
  if (session.completed && session.performedExercises?.length) {
    return session.performedExercises;
  }

  if (!session.completed && session.plannedExercises?.length) {
    return session.plannedExercises;
  }

  return session.performedExercises?.length
    ? session.performedExercises
    : session.exercises?.length
      ? session.exercises
      : session.plannedExercises ?? [];
}

function getExerciseDefinition(
  entry: SessionExerciseInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  if (entry.exerciseId) {
    const byId = exerciseLibrary.find((exercise) => exercise.id === entry.exerciseId);
    if (byId) return byId;
  }

  if (!entry.exerciseName) return null;
  const normalizedName = entry.exerciseName.trim().toLowerCase();
  return (
    exerciseLibrary.find((exercise) => exercise.name.toLowerCase() === normalizedName) ??
    null
  );
}

function isMainLoadExercise(
  entry: SessionExerciseInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  const exercise = getExerciseDefinition(entry, exerciseLibrary);
  return !exercise || exercise.exerciseType !== "mobility";
}

function getEntrySets(entry: SessionExerciseInput) {
  return toNumber(entry.sets ?? entry.plannedSets);
}

function getEntryReps(entry: SessionExerciseInput) {
  return toNumber(entry.reps ?? entry.plannedReps);
}

function getEntryLoad(entry: SessionExerciseInput) {
  return toNumber(entry.load ?? entry.plannedLoad);
}

function getExternalLoad(entry: SessionExerciseInput) {
  return getEntrySets(entry) * getEntryReps(entry) * getEntryLoad(entry);
}

export function calculateSessionExternalLoad(
  session: TrainingSessionInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  return getSessionExercises(session).reduce((total, entry) => {
    if (!isMainLoadExercise(entry, exerciseLibrary)) return total;
    return total + getExternalLoad(entry);
  }, 0);
}

export function calculateExternalLoadByPattern(
  session: TrainingSessionInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  return getSessionExercises(session).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseDefinition(entry, exerciseLibrary);
    if (!exercise || exercise.exerciseType === "mobility") return acc;

    acc[exercise.pattern] = (acc[exercise.pattern] ?? 0) + getExternalLoad(entry);
    return acc;
  }, {});
}

export function calculateWeeklyExternalLoad(
  sessions: TrainingSessionInput[],
  exerciseLibrary: ExerciseLibraryInput
) {
  return sessions.reduce(
    (total, session) => total + calculateSessionExternalLoad(session, exerciseLibrary),
    0
  );
}

export function calculateWeeklyExternalLoadByPattern(
  sessions: TrainingSessionInput[],
  exerciseLibrary: ExerciseLibraryInput
) {
  return sessions.reduce<Record<string, number>>((acc, session) => {
    const sessionLoad = calculateExternalLoadByPattern(session, exerciseLibrary);

    Object.entries(sessionLoad).forEach(([pattern, load]) => {
      acc[pattern] = (acc[pattern] ?? 0) + load;
    });

    return acc;
  }, {});
}

export function calculateSessionMuscleSets(
  session: TrainingSessionInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  return getSessionExercises(session).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseDefinition(entry, exerciseLibrary);
    if (!exercise || exercise.exerciseType === "mobility") return acc;

    const sets = getEntrySets(entry);
    Object.entries(exercise.fatigueMap ?? {}).forEach(([muscle, fatigueValue]) => {
      acc[muscle] = (acc[muscle] ?? 0) + sets * fatigueValue;
    });

    return acc;
  }, {});
}

export function calculateWeeklyMuscleSets(
  sessions: TrainingSessionInput[],
  exerciseLibrary: ExerciseLibraryInput
) {
  return sessions.reduce<Record<string, number>>((acc, session) => {
    const sessionSets = calculateSessionMuscleSets(session, exerciseLibrary);

    Object.entries(sessionSets).forEach(([muscle, sets]) => {
      acc[muscle] = (acc[muscle] ?? 0) + sets;
    });

    return acc;
  }, {});
}

export function calculateSessionFatigueMap(
  session: TrainingSessionInput,
  exerciseLibrary: ExerciseLibraryInput
) {
  return calculateSessionMuscleSets(session, exerciseLibrary);
}

export function calculateWeeklyFatigueMapFromSessions(
  sessions: TrainingSessionInput[],
  exerciseLibrary: ExerciseLibraryInput
) {
  return calculateWeeklyMuscleSets(sessions, exerciseLibrary);
}
