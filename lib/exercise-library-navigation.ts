import type { ExerciseDefinition, ExercisePattern } from "@/lib/exercises";

export const exerciseLibraryFamilyOrder = [
  "strength",
  "power_olympic",
  "plyometric",
  "core",
  "mobility",
  "speed_agility",
  "conditioning_movement"
] as const;

export type ExerciseLibraryFamily = (typeof exerciseLibraryFamilyOrder)[number];
export type ExerciseLibraryFamilyResolution = ExerciseLibraryFamily | "unclassified";

export const exerciseLibraryFamilyLabels: Record<ExerciseLibraryFamily, string> = {
  conditioning_movement: "Acondicionamiento y desplazamientos",
  core: "Core",
  mobility: "Movilidad",
  plyometric: "Pliometría",
  power_olympic: "Potencia y olímpicos",
  speed_agility: "Velocidad y agilidad",
  strength: "Fuerza"
};

const strengthPatterns = new Set<ExercisePattern>([
  "Squat / Vertical Force",
  "Hinge / Horizontal Force",
  "Lunge / Unilateral Force",
  "Push / Upper Body Press",
  "Pull / Upper Body Pull",
  "Lower Body Accessories",
  "Upper Body Accessories"
]);

const compactPatternLabels: Partial<Record<ExercisePattern, string>> = {
  "Core / Trunk Control": "Tronco",
  "Gait & Carry": "Desplazamientos",
  "Hinge / Horizontal Force": "Hinge",
  "Lower Body Accessories": "Accesorio · Tren inferior",
  "Lunge / Unilateral Force": "Lunge / unilateral",
  "Mobility / Movement Prep": "Preparación del movimiento",
  "Olympic derivatives": "Olímpicos",
  "Pull / Upper Body Pull": "Pull",
  "Push / Upper Body Press": "Push",
  "Speed & Agility Skills": "Velocidad / agilidad",
  "Squat / Vertical Force": "Squat",
  "Upper Body Accessories": "Accesorio · Tren superior"
};

const compactBlockLabels: Record<string, string> = {
  "Anti-flexion-extension": "Antiextensión",
  "Anti-lateral flexion": "Antilateralización",
  "Anti-rotation": "Antirotación",
  "Ankle mobility": "Tobillo",
  "Flexion-extension": "Flexión / extensión",
  "Ground support & transitions": "Apoyos y transiciones",
  "Hip mobility & activation": "Cadera",
  "Integrated mobility": "Movilidad integrada",
  "Lateral flexion": "Lateralización",
  "Neck and spine mobility": "Cuello y columna",
  "Rotation": "Rotación",
  "Shoulder mobility & activation": "Hombro",
  "Thoracic & trunk mobility": "Columna torácica y tronco"
};

export function resolveExerciseLibraryFamily(
  exercise: ExerciseDefinition
): ExerciseLibraryFamilyResolution {
  if (exercise.exerciseType === "plyometric") return "plyometric";
  if (exercise.exerciseType === "core" || exercise.pattern === "Core / Trunk Control") return "core";
  if (exercise.exerciseType === "mobility" || exercise.pattern === "Mobility / Movement Prep") return "mobility";
  if (exercise.pattern === "Olympic derivatives") return "power_olympic";
  if (exercise.pattern === "Speed & Agility Skills") return "speed_agility";
  if (exercise.pattern === "Gait & Carry") return "conditioning_movement";
  if (exercise.exerciseType === "power") return "power_olympic";
  if (strengthPatterns.has(exercise.pattern)) return "strength";
  return "unclassified";
}

export function getExerciseLibraryFamilyLabel(exercise: ExerciseDefinition) {
  const family = resolveExerciseLibraryFamily(exercise);
  return family === "unclassified" ? "Otros" : exerciseLibraryFamilyLabels[family];
}

export function getExerciseLibraryCompactAttribute(exercise: ExerciseDefinition) {
  if (exercise.exerciseType === "core" || exercise.exerciseType === "mobility") {
    return compactBlockLabels[exercise.block] ?? exercise.block;
  }
  return compactPatternLabels[exercise.pattern] ?? exercise.pattern;
}

export function matchesExerciseLibrarySearch(exercise: ExerciseDefinition, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;

  return normalizeSearchValue([
    exercise.name,
    exercise.pattern,
    exercise.block,
    ...exercise.equipment
  ].join(" ")).includes(normalizedQuery);
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
