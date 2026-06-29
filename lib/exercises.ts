export type ExercisePattern =
  | "Squat"
  | "Hinge"
  | "Lunge"
  | "Gait & Carry"
  | "Push"
  | "Pull"
  | "Rotation"
  | "Core";

export type ExerciseObjective =
  | "Control motor / resistencia manual"
  | "Fuerza base"
  | "Hipertrofia"
  | "Potencia"
  | "Conditioning";

export type ExerciseDefinition = {
  equipment: string;
  family: string;
  id: string;
  name: string;
  objective: ExerciseObjective;
  orderInFamily: number;
  pattern: ExercisePattern;
  planeOrDirection: string;
};

export const exercisePatterns: ExercisePattern[] = [
  "Squat",
  "Hinge",
  "Lunge",
  "Gait & Carry",
  "Push",
  "Pull",
  "Rotation",
  "Core"
];

export const exerciseObjectives: ExerciseObjective[] = [
  "Control motor / resistencia manual",
  "Fuerza base",
  "Hipertrofia",
  "Potencia",
  "Conditioning"
];

export const exerciseLibrary: ExerciseDefinition[] = [
  {
    id: "squat-bilateral-strength-1",
    name: "Sentadilla asistida con feedback manual",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Asistencia manual",
    orderInFamily: 1
  },
  {
    id: "squat-bilateral-strength-2",
    name: "Sentadilla a cajon",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Cajon",
    orderInFamily: 2
  },
  {
    id: "squat-bilateral-strength-3",
    name: "Goblet squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Kettlebell / mancuerna",
    orderInFamily: 3
  },
  {
    id: "squat-bilateral-strength-4",
    name: "Front squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Barra",
    orderInFamily: 4
  },
  {
    id: "squat-bilateral-strength-5",
    name: "Back squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Barra",
    orderInFamily: 5
  },
  {
    id: "squat-bilateral-hypertrophy-1",
    name: "Leg extension",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Hipertrofia",
    planeOrDirection: "Vertical",
    equipment: "Maquina",
    orderInFamily: 1
  },
  {
    id: "squat-bilateral-hypertrophy-2",
    name: "Prensa",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Hipertrofia",
    planeOrDirection: "Vertical",
    equipment: "Maquina",
    orderInFamily: 2
  },
  {
    id: "squat-bilateral-hypertrophy-3",
    name: "Hack squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Hipertrofia",
    planeOrDirection: "Vertical",
    equipment: "Maquina",
    orderInFamily: 3
  },
  {
    id: "squat-bilateral-hypertrophy-4",
    name: "Pendulum squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Hipertrofia",
    planeOrDirection: "Vertical",
    equipment: "Maquina",
    orderInFamily: 4
  },
  {
    id: "squat-bilateral-power-1",
    name: "Countermovement jump",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    planeOrDirection: "Vertical",
    equipment: "Peso corporal",
    orderInFamily: 1
  },
  {
    id: "squat-bilateral-power-2",
    name: "Jump squat",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    planeOrDirection: "Vertical",
    equipment: "Peso corporal / carga ligera",
    orderInFamily: 2
  },
  {
    id: "squat-bilateral-power-3",
    name: "Hang power clean",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    planeOrDirection: "Vertical",
    equipment: "Barra",
    orderInFamily: 3
  },
  {
    id: "squat-bilateral-power-4",
    name: "Power clean",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    planeOrDirection: "Vertical",
    equipment: "Barra",
    orderInFamily: 4
  },
  {
    id: "squat-bilateral-power-5",
    name: "Clean",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    planeOrDirection: "Vertical",
    equipment: "Barra",
    orderInFamily: 5
  },
  {
    id: "hinge-bilateral-strength-1",
    name: "Bisagra con pared",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Anteroposterior",
    equipment: "Pared",
    orderInFamily: 1
  },
  {
    id: "hinge-bilateral-strength-2",
    name: "Peso muerto rumano con mancuernas",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Anteroposterior",
    equipment: "Mancuernas",
    orderInFamily: 2
  },
  {
    id: "hinge-bilateral-strength-3",
    name: "Trap bar deadlift",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Fuerza base",
    planeOrDirection: "Vertical",
    equipment: "Trap bar",
    orderInFamily: 3
  },
  {
    id: "lunge-unilateral-strength-1",
    name: "Split squat asistido",
    pattern: "Lunge",
    family: "Lunge estatico",
    objective: "Fuerza base",
    planeOrDirection: "Sagital",
    equipment: "Apoyo externo",
    orderInFamily: 1
  },
  {
    id: "lunge-unilateral-strength-2",
    name: "Split squat",
    pattern: "Lunge",
    family: "Lunge estatico",
    objective: "Fuerza base",
    planeOrDirection: "Sagital",
    equipment: "Peso corporal",
    orderInFamily: 2
  },
  {
    id: "lunge-unilateral-strength-3",
    name: "Bulgarian split squat",
    pattern: "Lunge",
    family: "Lunge estatico",
    objective: "Fuerza base",
    planeOrDirection: "Sagital",
    equipment: "Banco / carga externa",
    orderInFamily: 3
  },
  {
    id: "gait-carry-conditioning-1",
    name: "Farmer carry bilateral",
    pattern: "Gait & Carry",
    family: "Carry",
    objective: "Conditioning",
    planeOrDirection: "Lineal",
    equipment: "Mancuernas / kettlebells",
    orderInFamily: 1
  },
  {
    id: "gait-carry-conditioning-2",
    name: "Suitcase carry",
    pattern: "Gait & Carry",
    family: "Carry",
    objective: "Conditioning",
    planeOrDirection: "Lineal",
    equipment: "Mancuerna / kettlebell",
    orderInFamily: 2
  },
  {
    id: "gait-carry-conditioning-3",
    name: "Sled push",
    pattern: "Gait & Carry",
    family: "Locomocion cargada",
    objective: "Conditioning",
    planeOrDirection: "Horizontal",
    equipment: "Trineo",
    orderInFamily: 1
  },
  {
    id: "push-horizontal-strength-1",
    name: "Press pared",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Peso corporal",
    orderInFamily: 1
  },
  {
    id: "push-horizontal-strength-2",
    name: "Flexion inclinada",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Banco / apoyo",
    orderInFamily: 2
  },
  {
    id: "push-horizontal-strength-3",
    name: "Press banca",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Barra",
    orderInFamily: 3
  },
  {
    id: "pull-horizontal-strength-1",
    name: "Remo con banda",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Banda elastica",
    orderInFamily: 1
  },
  {
    id: "pull-horizontal-strength-2",
    name: "Remo en polea",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Polea",
    orderInFamily: 2
  },
  {
    id: "pull-horizontal-strength-3",
    name: "Remo con barra",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Fuerza base",
    planeOrDirection: "Horizontal",
    equipment: "Barra",
    orderInFamily: 3
  },
  {
    id: "rotation-control-1",
    name: "Pallof press isometrico",
    pattern: "Rotation",
    family: "Anti-rotacion",
    objective: "Control motor / resistencia manual",
    planeOrDirection: "Transversal",
    equipment: "Banda / polea",
    orderInFamily: 1
  },
  {
    id: "rotation-control-2",
    name: "Pallof press dinamico",
    pattern: "Rotation",
    family: "Anti-rotacion",
    objective: "Control motor / resistencia manual",
    planeOrDirection: "Transversal",
    equipment: "Banda / polea",
    orderInFamily: 2
  },
  {
    id: "rotation-power-1",
    name: "Rotational med ball throw",
    pattern: "Rotation",
    family: "Rotacion explosiva",
    objective: "Potencia",
    planeOrDirection: "Transversal",
    equipment: "Balon medicinal",
    orderInFamily: 1
  },
  {
    id: "core-control-1",
    name: "Dead bug",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Control motor / resistencia manual",
    planeOrDirection: "Sagital",
    equipment: "Peso corporal",
    orderInFamily: 1
  },
  {
    id: "core-control-2",
    name: "Plank",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Control motor / resistencia manual",
    planeOrDirection: "Sagital",
    equipment: "Peso corporal",
    orderInFamily: 2
  },
  {
    id: "core-control-3",
    name: "Ab wheel rollout",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Control motor / resistencia manual",
    planeOrDirection: "Sagital",
    equipment: "Rueda abdominal",
    orderInFamily: 3
  }
];

export function getExercisesByPattern(pattern: ExercisePattern) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.pattern === pattern));
}

export function getExercisesByFamily(family: string) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.family === family));
}

export function getExercisesByObjective(objective: ExerciseObjective) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.objective === objective));
}

export function getExerciseRegression(exerciseId: string) {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  const familyProgression = getComparableFamilyExercises(exercise);
  const index = familyProgression.findIndex((item) => item.id === exerciseId);
  return index > 0 ? familyProgression[index - 1] : null;
}

export function getExerciseProgression(exerciseId: string) {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  const familyProgression = getComparableFamilyExercises(exercise);
  const index = familyProgression.findIndex((item) => item.id === exerciseId);
  return index >= 0 && index < familyProgression.length - 1 ? familyProgression[index + 1] : null;
}

function getComparableFamilyExercises(exercise: ExerciseDefinition) {
  return sortExercises(
    exerciseLibrary.filter(
      (item) =>
        item.pattern === exercise.pattern &&
        item.family === exercise.family &&
        item.objective === exercise.objective
    )
  );
}

function sortExercises(exercises: ExerciseDefinition[]) {
  return [...exercises].sort((a, b) =>
    a.pattern.localeCompare(b.pattern) ||
    a.family.localeCompare(b.family) ||
    a.objective.localeCompare(b.objective) ||
    a.orderInFamily - b.orderInFamily
  );
}
