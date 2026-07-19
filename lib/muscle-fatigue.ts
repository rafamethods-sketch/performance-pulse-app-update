import { getExerciseById, type FatigueMapKey } from "@/lib/exercises";

export type MuscleFatigueLevel = "none" | "low" | "moderate" | "high" | "very_high";

export type MuscleFatigueResult = {
  key: MuscleFatigueKey;
  label: string;
  level: MuscleFatigueLevel;
  relative: number;
  score: number;
};

export type MuscleFatigueExercise = {
  actualRpe?: number | string | null;
  exerciseId?: string | null;
  exerciseRpe?: number | string | null;
  perceivedExertion?: number | string | null;
  plannedReps?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rpe?: number | string | null;
  sets?: number | string | null;
  setDetails?: Array<{
    reps?: number | string | null;
    setNumber: number;
  }>;
};

export type MuscleFatigueSession = {
  finalRpe?: number | string | null;
  performedExercises?: MuscleFatigueExercise[];
  plannedExercises?: MuscleFatigueExercise[];
  rpe?: number | string | null;
};

export type WeeklyMuscleFatigue = {
  hasData: boolean;
  incomplete: boolean;
  maxScore: number;
  results: MuscleFatigueResult[];
  topMuscles: MuscleFatigueResult[];
};

type MuscleFatigueKey =
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "chest"
  | "back"
  | "delts"
  | "biceps"
  | "triceps"
  | "core";

type MuscleConfig = {
  key: MuscleFatigueKey;
  label: string;
  mapKeys: FatigueMapKey[];
};

export const muscleFatigueGroups: MuscleConfig[] = [
  { key: "quadriceps", label: "Cuádriceps", mapKeys: ["quadriceps"] },
  { key: "hamstrings", label: "Isquiosurales", mapKeys: ["hamstrings"] },
  { key: "glutes", label: "Glúteos", mapKeys: ["glutes", "gluteMed"] },
  { key: "calves", label: "Gemelos / sóleo", mapKeys: ["calves", "soleus"] },
  { key: "chest", label: "Pectoral", mapKeys: ["chest"] },
  { key: "back", label: "Espalda / dorsales", mapKeys: ["lats", "midBack", "upperBack", "lowerTraps", "traps", "spinalErectors"] },
  { key: "delts", label: "Deltoides", mapKeys: ["anteriorDelts", "lateralDelts", "rearDelts", "shoulders"] },
  { key: "biceps", label: "Bíceps", mapKeys: ["biceps"] },
  { key: "triceps", label: "Tríceps", mapKeys: ["triceps"] },
  { key: "core", label: "Core", mapKeys: ["core", "obliques", "transverseAbdominis", "rectusAbdominis", "lumbarStabilizers"] }
];

function parsePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getSessionExercises(session: MuscleFatigueSession) {
  return session.performedExercises?.length ? session.performedExercises : session.plannedExercises ?? [];
}

function getExerciseRpe(exercise: MuscleFatigueExercise, session: MuscleFatigueSession) {
  const exerciseRpe = parsePositiveNumber(
    exercise.exerciseRpe ?? exercise.rpe ?? exercise.actualRpe ?? exercise.perceivedExertion
  );
  if (exerciseRpe > 0) return exerciseRpe;

  const sessionRpe = parsePositiveNumber(session.finalRpe ?? session.rpe);
  return sessionRpe > 0 ? sessionRpe : null;
}

function getSetDetailsRepSum(exercise: MuscleFatigueExercise) {
  return (exercise.setDetails ?? []).reduce((total, detail) => total + parsePositiveNumber(detail.reps), 0);
}

function getMuscleLevel(relative: number): MuscleFatigueLevel {
  if (relative <= 0) return "none";
  if (relative <= 25) return "low";
  if (relative <= 50) return "moderate";
  if (relative <= 75) return "high";
  return "very_high";
}

export function calculateWeeklyMuscleFatigue(sessions: MuscleFatigueSession[]): WeeklyMuscleFatigue {
  const scores = Object.fromEntries(muscleFatigueGroups.map((group) => [group.key, 0])) as Record<MuscleFatigueKey, number>;
  let incomplete = false;

  sessions.forEach((session) => {
    getSessionExercises(session).forEach((exercise) => {
      if (!exercise.exerciseId) return;

      const libraryExercise = getExerciseById(exercise.exerciseId);
      if (!libraryExercise?.fatigueMap) return;

      const setDetailsRepSum = getSetDetailsRepSum(exercise);
      const totalReps = setDetailsRepSum > 0
        ? setDetailsRepSum
        : parsePositiveNumber(exercise.sets ?? exercise.plannedSets) * parsePositiveNumber(exercise.reps ?? exercise.plannedReps);
      if (totalReps <= 0) return;

      const rpe = getExerciseRpe(exercise, session);
      if (!rpe) {
        incomplete = true;
        return;
      }

      muscleFatigueGroups.forEach((group) => {
        const involvement = group.mapKeys.reduce((total, mapKey) => total + (libraryExercise.fatigueMap[mapKey] ?? 0), 0);
        if (involvement <= 0) return;
        scores[group.key] += totalReps * (rpe / 10) * involvement;
      });
    });
  });

  const maxScore = Math.max(0, ...Object.values(scores));
  const results = muscleFatigueGroups.map<MuscleFatigueResult>((group) => {
    const score = scores[group.key] ?? 0;
    const relative = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      key: group.key,
      label: group.label,
      level: getMuscleLevel(relative),
      relative,
      score
    };
  });
  const topMuscles = results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    hasData: maxScore > 0,
    incomplete,
    maxScore,
    results,
    topMuscles
  };
}
