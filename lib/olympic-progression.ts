import type {
  ExerciseDefinition,
  OlympicCatch,
  OlympicFamily,
  OlympicStage,
  OlympicStartPosition
} from "@/lib/exercises";

export const olympicFamilyOrder: OlympicFamily[] = ["general", "clean", "snatch", "jerk"];
export const olympicStageOrder: OlympicStage[] = ["fundamentals", "pull", "receiving", "power", "full_lift"];

export const olympicFamilyLabels: Record<OlympicFamily, string> = {
  clean: "Clean",
  general: "General",
  jerk: "Jerk",
  snatch: "Snatch"
};

export const olympicStageLabels: Record<OlympicStage, string> = {
  full_lift: "Levantamientos completos",
  fundamentals: "Fundamentos",
  power: "Power",
  pull: "Tirones",
  receiving: "Recepción"
};

export const olympicStageCompactLabels: Record<OlympicStage, string> = {
  full_lift: "Completo",
  fundamentals: "Fundamentos",
  power: "Power",
  pull: "Tirón",
  receiving: "Recepción"
};

export const olympicStartPositionLabels: Record<OlympicStartPosition, string> = {
  blocks: "Bloques",
  floor: "Suelo",
  hang: "Hang",
  other: "Otra",
  rack: "Rack"
};

export const olympicCatchLabels: Record<OlympicCatch, string> = {
  full: "Completa",
  high: "Alta",
  none: "Sin recepción",
  split: "Split"
};

export function isOlympicExercise(exercise?: ExerciseDefinition | null): exercise is ExerciseDefinition {
  return exercise?.pattern === "Olympic derivatives" && Boolean(exercise.olympicFamily && exercise.olympicStage && exercise.olympicCatch);
}

export function getOlympicPrerequisites(exercise: ExerciseDefinition, library: readonly ExerciseDefinition[]) {
  const prerequisiteIds = new Set(exercise.olympicPrerequisiteIds ?? []);
  return library.filter((candidate) => prerequisiteIds.has(candidate.id));
}

export function getOlympicNextSteps(exercise: ExerciseDefinition, library: readonly ExerciseDefinition[]) {
  return library.filter((candidate) => candidate.olympicPrerequisiteIds?.includes(exercise.id));
}

export function getOlympicCompactSummary(exercise: ExerciseDefinition) {
  if (!isOlympicExercise(exercise)) return null;
  return [
    olympicFamilyLabels[exercise.olympicFamily!],
    olympicStageCompactLabels[exercise.olympicStage!],
    exercise.olympicStartPosition ? olympicStartPositionLabels[exercise.olympicStartPosition] : null
  ].filter(Boolean).join(" · ");
}
