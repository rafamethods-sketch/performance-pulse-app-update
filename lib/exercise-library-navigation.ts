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
export type StrengthLibraryRegion = "lower" | "upper";
export type ExerciseLibraryGroup = {
  family: ExerciseLibraryFamily;
  key: string;
  label: string;
  strengthRegion?: StrengthLibraryRegion;
};

export const exerciseLibraryFamilyLabels: Record<ExerciseLibraryFamily, string> = {
  conditioning_movement: "Acondicionamiento y desplazamientos",
  core: "Core",
  mobility: "Movilidad",
  plyometric: "Pliometría",
  power_olympic: "Potencia y olímpicos",
  speed_agility: "Velocidad y agilidad",
  strength: "Fuerza"
};

export const strengthLibraryRegionLabels: Record<StrengthLibraryRegion, string> = {
  lower: "Tren inferior",
  upper: "Tren superior"
};

export const exerciseLibraryGroups: Record<ExerciseLibraryFamily, readonly ExerciseLibraryGroup[]> = {
  conditioning_movement: [
    { family: "conditioning_movement", key: "gait", label: "Marcha" },
    { family: "conditioning_movement", key: "conditioning", label: "Acondicionamiento" },
    { family: "conditioning_movement", key: "carries_holds", label: "Carries y holds" }
  ],
  core: [
    { family: "core", key: "rotation", label: "Rotación" },
    { family: "core", key: "anti_rotation", label: "Antirotación" },
    { family: "core", key: "flexion_extension", label: "Flexión / Extensión" },
    { family: "core", key: "anti_extension", label: "Antiextensión" },
    { family: "core", key: "lateral_flexion", label: "Lateralización" },
    { family: "core", key: "anti_lateral_flexion", label: "Antilateralización" },
    { family: "core", key: "ground_support", label: "Apoyos y transiciones" }
  ],
  mobility: [
    { family: "mobility", key: "hip", label: "Cadera" },
    { family: "mobility", key: "shoulder", label: "Hombro" },
    { family: "mobility", key: "ankle", label: "Tobillo" },
    { family: "mobility", key: "thoracic_trunk", label: "Columna torácica y tronco" },
    { family: "mobility", key: "neck_spine", label: "Cuello y columna" },
    { family: "mobility", key: "integrated", label: "Integrada" }
  ],
  plyometric: [
    { family: "plyometric", key: "jump", label: "Saltos" },
    { family: "plyometric", key: "reactive", label: "Reactivos" },
    { family: "plyometric", key: "landing", label: "Aterrizajes" },
    { family: "plyometric", key: "other", label: "Otros pliométricos" }
  ],
  power_olympic: [
    { family: "power_olympic", key: "olympic", label: "Olímpicos" },
    { family: "power_olympic", key: "other_power", label: "Otros ejercicios de potencia" }
  ],
  speed_agility: [
    { family: "speed_agility", key: "acceleration", label: "Aceleración" },
    { family: "speed_agility", key: "deceleration_change_direction", label: "Cambio de dirección / desaceleración" },
    { family: "speed_agility", key: "coordination", label: "Coordinación" },
    { family: "speed_agility", key: "reactive_agility", label: "Agilidad reactiva" }
  ],
  strength: [
    { family: "strength", key: "lower_squat", label: "Squat", strengthRegion: "lower" },
    { family: "strength", key: "lower_hinge", label: "Hinge", strengthRegion: "lower" },
    { family: "strength", key: "lower_lunge", label: "Lunge / unilateral", strengthRegion: "lower" },
    { family: "strength", key: "lower_accessory", label: "Accesorios", strengthRegion: "lower" },
    { family: "strength", key: "upper_push", label: "Push", strengthRegion: "upper" },
    { family: "strength", key: "upper_pull", label: "Pull", strengthRegion: "upper" },
    { family: "strength", key: "upper_accessory", label: "Accesorios", strengthRegion: "upper" }
  ]
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

export function resolveExerciseLibraryGroup(exercise: ExerciseDefinition): string | "unclassified" {
  const family = resolveExerciseLibraryFamily(exercise);

  if (family === "strength") {
    const groupsByPattern: Partial<Record<ExercisePattern, string>> = {
      "Hinge / Horizontal Force": "lower_hinge",
      "Lower Body Accessories": "lower_accessory",
      "Lunge / Unilateral Force": "lower_lunge",
      "Pull / Upper Body Pull": "upper_pull",
      "Push / Upper Body Press": "upper_push",
      "Squat / Vertical Force": "lower_squat",
      "Upper Body Accessories": "upper_accessory"
    };
    return groupsByPattern[exercise.pattern] ?? "unclassified";
  }

  if (family === "core") {
    const groupsByBlock: Record<string, string> = {
      "Anti-flexion-extension": "anti_extension",
      "Anti-lateral flexion": "anti_lateral_flexion",
      "Anti-rotation": "anti_rotation",
      "Flexion-extension": "flexion_extension",
      "Ground support & transitions": "ground_support",
      "Lateral flexion": "lateral_flexion",
      "Rotation": "rotation"
    };
    return groupsByBlock[exercise.block] ?? "unclassified";
  }

  if (family === "plyometric") {
    const hasCompleteLowerBodyProfile = exercise.bodyRegion === "lower_body" &&
      exercise.plyometricType &&
      exercise.plyometricSupport &&
      exercise.plyometricDirection &&
      exercise.plyometricDemand;
    return hasCompleteLowerBodyProfile ? exercise.plyometricType! : "other";
  }

  if (family === "mobility") {
    const groupsByBlock: Record<string, string> = {
      "Ankle mobility": "ankle",
      "Hip mobility & activation": "hip",
      "Integrated mobility": "integrated",
      "Neck and spine mobility": "neck_spine",
      "Shoulder mobility & activation": "shoulder",
      "Thoracic & trunk mobility": "thoracic_trunk"
    };
    return groupsByBlock[exercise.block] ?? "unclassified";
  }

  if (family === "power_olympic") {
    return exercise.pattern === "Olympic derivatives" ? "olympic" : "other_power";
  }

  if (family === "speed_agility") {
    const groupsByBlock: Record<string, string> = {
      "Acceleration / Linear Speed": "acceleration",
      "Deceleration / Change of Direction": "deceleration_change_direction",
      "Footwork / Coordination": "coordination",
      "Reactive Agility": "reactive_agility"
    };
    return groupsByBlock[exercise.block] ?? "unclassified";
  }

  if (family === "conditioning_movement") {
    if (exercise.block === "Reeducación de la marcha") return "gait";
    if (exercise.block === "Conditioning") return "conditioning";
    return "carries_holds";
  }

  return "unclassified";
}

export function getExerciseLibraryGroups(
  family: ExerciseLibraryFamily,
  strengthRegion?: StrengthLibraryRegion
) {
  const groups = exerciseLibraryGroups[family];
  return family === "strength" && strengthRegion
    ? groups.filter((group) => group.strengthRegion === strengthRegion)
    : groups;
}

export function getExerciseLibraryGroupLabel(exercise: ExerciseDefinition) {
  const family = resolveExerciseLibraryFamily(exercise);
  if (family === "unclassified") return "Sin clasificar";
  const groupKey = resolveExerciseLibraryGroup(exercise);
  return exerciseLibraryGroups[family].find((group) => group.key === groupKey)?.label ?? "Sin clasificar";
}

export function getStrengthLibraryRegion(exercise: ExerciseDefinition): StrengthLibraryRegion | null {
  if (resolveExerciseLibraryFamily(exercise) !== "strength") return null;
  const groupKey = resolveExerciseLibraryGroup(exercise);
  return exerciseLibraryGroups.strength.find((group) => group.key === groupKey)?.strengthRegion ?? null;
}

export function getExerciseLibraryFamilyLabel(exercise: ExerciseDefinition) {
  const family = resolveExerciseLibraryFamily(exercise);
  return family === "unclassified" ? "Otros" : exerciseLibraryFamilyLabels[family];
}

export function getExerciseLibraryCompactAttribute(exercise: ExerciseDefinition) {
  const groupLabel = getExerciseLibraryGroupLabel(exercise);
  const strengthRegion = getStrengthLibraryRegion(exercise);
  return strengthRegion
    ? `${strengthLibraryRegionLabels[strengthRegion]} · ${groupLabel}`
    : groupLabel;
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
