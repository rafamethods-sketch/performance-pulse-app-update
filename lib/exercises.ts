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

type ExerciseSeed = Omit<ExerciseDefinition, "id" | "orderInFamily" | "pattern" | "family" | "objective">;

type ExerciseGroupSeed = {
  family: string;
  objective: ExerciseObjective;
  pattern: ExercisePattern;
  slug: string;
  exercises: ExerciseSeed[];
};

const exerciseGroups: ExerciseGroupSeed[] = [
  {
    slug: "squat-bilateral-control",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Sentadilla asistida con feedback manual", planeOrDirection: "Vertical", equipment: "Asistencia manual" },
      { name: "Sit to stand asistido", planeOrDirection: "Vertical", equipment: "Silla / apoyo" },
      { name: "Sentadilla a cajon", planeOrDirection: "Vertical", equipment: "Cajon" },
      { name: "Sentadilla tempo peso corporal", planeOrDirection: "Vertical", equipment: "Peso corporal" }
    ]
  },
  {
    slug: "squat-bilateral-strength",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Fuerza base",
    exercises: [
      { name: "Goblet squat", planeOrDirection: "Vertical", equipment: "Kettlebell / mancuerna" },
      { name: "Front squat", planeOrDirection: "Vertical", equipment: "Barra" },
      { name: "Back squat", planeOrDirection: "Vertical", equipment: "Barra" },
      { name: "Safety bar squat", planeOrDirection: "Vertical", equipment: "Barra safety" }
    ]
  },
  {
    slug: "squat-bilateral-hypertrophy",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Hipertrofia",
    exercises: [
      { name: "Leg extension", planeOrDirection: "Vertical", equipment: "Maquina" },
      { name: "Prensa", planeOrDirection: "Vertical", equipment: "Maquina" },
      { name: "Hack squat", planeOrDirection: "Vertical", equipment: "Maquina" },
      { name: "Pendulum squat", planeOrDirection: "Vertical", equipment: "Maquina" }
    ]
  },
  {
    slug: "squat-bilateral-power",
    pattern: "Squat",
    family: "Squat bilateral",
    objective: "Potencia",
    exercises: [
      { name: "Countermovement jump", planeOrDirection: "Vertical", equipment: "Peso corporal" },
      { name: "Jump squat", planeOrDirection: "Vertical", equipment: "Peso corporal / carga ligera" },
      { name: "Hang power clean", planeOrDirection: "Vertical", equipment: "Barra" },
      { name: "Power clean", planeOrDirection: "Vertical", equipment: "Barra" }
    ]
  },
  {
    slug: "hinge-bilateral-control",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Bisagra con feedback manual", planeOrDirection: "Anteroposterior", equipment: "Asistencia manual" },
      { name: "Bisagra con pared", planeOrDirection: "Anteroposterior", equipment: "Pared" },
      { name: "Bisagra con palo", planeOrDirection: "Anteroposterior", equipment: "Palo" },
      { name: "Puente de gluteo", planeOrDirection: "Sagital", equipment: "Peso corporal" }
    ]
  },
  {
    slug: "hinge-bilateral-strength",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Fuerza base",
    exercises: [
      { name: "Peso muerto rumano con mancuernas", planeOrDirection: "Anteroposterior", equipment: "Mancuernas" },
      { name: "Kettlebell deadlift", planeOrDirection: "Vertical", equipment: "Kettlebell" },
      { name: "Trap bar deadlift", planeOrDirection: "Vertical", equipment: "Trap bar" },
      { name: "Peso muerto rumano con barra", planeOrDirection: "Anteroposterior", equipment: "Barra" }
    ]
  },
  {
    slug: "hinge-bilateral-hypertrophy",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Hipertrofia",
    exercises: [
      { name: "Hip thrust en maquina", planeOrDirection: "Horizontal", equipment: "Maquina" },
      { name: "Curl femoral sentado", planeOrDirection: "Sagital", equipment: "Maquina" },
      { name: "Back extension", planeOrDirection: "Sagital", equipment: "Banco" },
      { name: "Pull through en polea", planeOrDirection: "Anteroposterior", equipment: "Polea" }
    ]
  },
  {
    slug: "hinge-bilateral-power",
    pattern: "Hinge",
    family: "Hinge bilateral",
    objective: "Potencia",
    exercises: [
      { name: "Kettlebell swing", planeOrDirection: "Anteroposterior", equipment: "Kettlebell" },
      { name: "Broad jump", planeOrDirection: "Horizontal", equipment: "Peso corporal" },
      { name: "Hang high pull", planeOrDirection: "Vertical", equipment: "Barra" },
      { name: "Snatch pull", planeOrDirection: "Vertical", equipment: "Barra" }
    ]
  },
  {
    slug: "lunge-unilateral-control",
    pattern: "Lunge",
    family: "Lunge unilateral",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Split squat asistido", planeOrDirection: "Sagital", equipment: "Apoyo externo" },
      { name: "Step back lunge asistido", planeOrDirection: "Sagital", equipment: "Apoyo externo" },
      { name: "Split squat peso corporal", planeOrDirection: "Sagital", equipment: "Peso corporal" },
      { name: "Step up bajo", planeOrDirection: "Vertical", equipment: "Cajon bajo" }
    ]
  },
  {
    slug: "lunge-unilateral-strength",
    pattern: "Lunge",
    family: "Lunge unilateral",
    objective: "Fuerza base",
    exercises: [
      { name: "Split squat con mancuernas", planeOrDirection: "Sagital", equipment: "Mancuernas" },
      { name: "Reverse lunge con mancuernas", planeOrDirection: "Sagital", equipment: "Mancuernas" },
      { name: "Bulgarian split squat", planeOrDirection: "Sagital", equipment: "Banco / carga externa" },
      { name: "Front rack reverse lunge", planeOrDirection: "Sagital", equipment: "Barra" }
    ]
  },
  {
    slug: "lunge-unilateral-hypertrophy",
    pattern: "Lunge",
    family: "Lunge unilateral",
    objective: "Hipertrofia",
    exercises: [
      { name: "Step up alto", planeOrDirection: "Vertical", equipment: "Cajon" },
      { name: "Walking lunge", planeOrDirection: "Sagital", equipment: "Mancuernas" },
      { name: "Bulgarian split squat en multipower", planeOrDirection: "Sagital", equipment: "Multipower" },
      { name: "Prensa unilateral", planeOrDirection: "Vertical", equipment: "Maquina" }
    ]
  },
  {
    slug: "lunge-unilateral-power",
    pattern: "Lunge",
    family: "Lunge unilateral",
    objective: "Potencia",
    exercises: [
      { name: "Split squat jump", planeOrDirection: "Vertical", equipment: "Peso corporal" },
      { name: "Alternating lunge jump", planeOrDirection: "Vertical", equipment: "Peso corporal" },
      { name: "Lateral bound", planeOrDirection: "Frontal", equipment: "Peso corporal" },
      { name: "Step up jump", planeOrDirection: "Vertical", equipment: "Cajon" }
    ]
  },
  {
    slug: "gait-carry-control",
    pattern: "Gait & Carry",
    family: "Gait & Carry",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Marcha asistida con feedback manual", planeOrDirection: "Lineal", equipment: "Asistencia manual" },
      { name: "Marcha en el sitio", planeOrDirection: "Lineal", equipment: "Peso corporal" },
      { name: "Farmer hold bilateral", planeOrDirection: "Estatica", equipment: "Mancuernas / kettlebells" },
      { name: "Farmer carry bilateral", planeOrDirection: "Lineal", equipment: "Mancuernas / kettlebells" }
    ]
  },
  {
    slug: "gait-carry-strength",
    pattern: "Gait & Carry",
    family: "Gait & Carry",
    objective: "Fuerza base",
    exercises: [
      { name: "Suitcase carry", planeOrDirection: "Lineal", equipment: "Mancuerna / kettlebell" },
      { name: "Front rack carry", planeOrDirection: "Lineal", equipment: "Kettlebells" },
      { name: "Trap bar carry", planeOrDirection: "Lineal", equipment: "Trap bar" },
      { name: "Sled push pesado", planeOrDirection: "Horizontal", equipment: "Trineo" }
    ]
  },
  {
    slug: "gait-carry-hypertrophy",
    pattern: "Gait & Carry",
    family: "Gait & Carry",
    objective: "Hipertrofia",
    exercises: [
      { name: "Sled push volumen", planeOrDirection: "Horizontal", equipment: "Trineo" },
      { name: "Sled drag", planeOrDirection: "Horizontal", equipment: "Trineo" },
      { name: "Stair climber loaded", planeOrDirection: "Vertical", equipment: "Maquina" },
      { name: "Farmer carry tiempo bajo tension", planeOrDirection: "Lineal", equipment: "Mancuernas / kettlebells" }
    ]
  },
  {
    slug: "gait-carry-power",
    pattern: "Gait & Carry",
    family: "Gait & Carry",
    objective: "Potencia",
    exercises: [
      { name: "A-skip", planeOrDirection: "Lineal", equipment: "Peso corporal" },
      { name: "Pogo run", planeOrDirection: "Lineal", equipment: "Peso corporal" },
      { name: "Sled sprint", planeOrDirection: "Horizontal", equipment: "Trineo" },
      { name: "Resisted acceleration", planeOrDirection: "Horizontal", equipment: "Cinta / trineo" }
    ]
  },
  {
    slug: "push-horizontal-control",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Press manual supino", planeOrDirection: "Horizontal", equipment: "Resistencia manual" },
      { name: "Press pared", planeOrDirection: "Horizontal", equipment: "Peso corporal" },
      { name: "Flexion inclinada alta", planeOrDirection: "Horizontal", equipment: "Apoyo alto" },
      { name: "Flexion inclinada baja", planeOrDirection: "Horizontal", equipment: "Banco" }
    ]
  },
  {
    slug: "push-horizontal-strength",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Fuerza base",
    exercises: [
      { name: "Flexion", planeOrDirection: "Horizontal", equipment: "Peso corporal" },
      { name: "Press mancuernas banco", planeOrDirection: "Horizontal", equipment: "Mancuernas" },
      { name: "Press banca", planeOrDirection: "Horizontal", equipment: "Barra" },
      { name: "Floor press", planeOrDirection: "Horizontal", equipment: "Barra / mancuernas" }
    ]
  },
  {
    slug: "push-horizontal-hypertrophy",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Hipertrofia",
    exercises: [
      { name: "Press maquina convergente", planeOrDirection: "Horizontal", equipment: "Maquina" },
      { name: "Chest press", planeOrDirection: "Horizontal", equipment: "Maquina" },
      { name: "Aperturas en polea", planeOrDirection: "Horizontal", equipment: "Polea" },
      { name: "Pec deck", planeOrDirection: "Horizontal", equipment: "Maquina" }
    ]
  },
  {
    slug: "push-horizontal-power",
    pattern: "Push",
    family: "Push horizontal",
    objective: "Potencia",
    exercises: [
      { name: "Chest pass balon medicinal", planeOrDirection: "Horizontal", equipment: "Balon medicinal" },
      { name: "Plyo push up", planeOrDirection: "Horizontal", equipment: "Peso corporal" },
      { name: "Bench throw", planeOrDirection: "Horizontal", equipment: "Barra / multipower" },
      { name: "Push press", planeOrDirection: "Vertical", equipment: "Barra" }
    ]
  },
  {
    slug: "pull-horizontal-control",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Retraccion escapular asistida", planeOrDirection: "Horizontal", equipment: "Asistencia manual" },
      { name: "Remo manual sentado", planeOrDirection: "Horizontal", equipment: "Resistencia manual" },
      { name: "Remo con banda", planeOrDirection: "Horizontal", equipment: "Banda elastica" },
      { name: "Remo TRX alto", planeOrDirection: "Horizontal", equipment: "TRX" }
    ]
  },
  {
    slug: "pull-horizontal-strength",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Fuerza base",
    exercises: [
      { name: "Remo mancuerna apoyado", planeOrDirection: "Horizontal", equipment: "Mancuerna" },
      { name: "Remo TRX bajo", planeOrDirection: "Horizontal", equipment: "TRX" },
      { name: "Remo con barra", planeOrDirection: "Horizontal", equipment: "Barra" },
      { name: "Dominada asistida con banda", planeOrDirection: "Vertical", equipment: "Banda elastica" }
    ]
  },
  {
    slug: "pull-horizontal-hypertrophy",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Hipertrofia",
    exercises: [
      { name: "Remo en polea", planeOrDirection: "Horizontal", equipment: "Polea" },
      { name: "Remo maquina convergente", planeOrDirection: "Horizontal", equipment: "Maquina" },
      { name: "Jalon al pecho", planeOrDirection: "Vertical", equipment: "Polea" },
      { name: "Pullover en polea", planeOrDirection: "Sagital", equipment: "Polea" }
    ]
  },
  {
    slug: "pull-horizontal-power",
    pattern: "Pull",
    family: "Pull horizontal",
    objective: "Potencia",
    exercises: [
      { name: "Med ball slam", planeOrDirection: "Vertical", equipment: "Balon medicinal" },
      { name: "Explosive TRX row", planeOrDirection: "Horizontal", equipment: "TRX" },
      { name: "High pull", planeOrDirection: "Vertical", equipment: "Barra" },
      { name: "Power snatch from hang", planeOrDirection: "Vertical", equipment: "Barra" }
    ]
  },
  {
    slug: "rotation-control",
    pattern: "Rotation",
    family: "Rotation",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Anti-rotacion manual", planeOrDirection: "Transversal", equipment: "Resistencia manual" },
      { name: "Pallof press isometrico", planeOrDirection: "Transversal", equipment: "Banda / polea" },
      { name: "Pallof press dinamico", planeOrDirection: "Transversal", equipment: "Banda / polea" },
      { name: "Tall kneeling anti-rotacion", planeOrDirection: "Transversal", equipment: "Banda / polea" }
    ]
  },
  {
    slug: "rotation-strength",
    pattern: "Rotation",
    family: "Rotation",
    objective: "Fuerza base",
    exercises: [
      { name: "Cable chop", planeOrDirection: "Diagonal", equipment: "Polea" },
      { name: "Cable lift", planeOrDirection: "Diagonal", equipment: "Polea" },
      { name: "Landmine rotation", planeOrDirection: "Transversal", equipment: "Barra landmine" },
      { name: "Half kneeling cable rotation", planeOrDirection: "Transversal", equipment: "Polea" }
    ]
  },
  {
    slug: "rotation-hypertrophy",
    pattern: "Rotation",
    family: "Rotation",
    objective: "Hipertrofia",
    exercises: [
      { name: "Cable woodchop", planeOrDirection: "Diagonal", equipment: "Polea" },
      { name: "Cable rotation", planeOrDirection: "Transversal", equipment: "Polea" },
      { name: "Rotary torso machine", planeOrDirection: "Transversal", equipment: "Maquina" },
      { name: "Landmine windshield", planeOrDirection: "Transversal", equipment: "Barra landmine" }
    ]
  },
  {
    slug: "rotation-power",
    pattern: "Rotation",
    family: "Rotation",
    objective: "Potencia",
    exercises: [
      { name: "Rotational med ball throw", planeOrDirection: "Transversal", equipment: "Balon medicinal" },
      { name: "Shot put throw", planeOrDirection: "Transversal", equipment: "Balon medicinal" },
      { name: "Scoop toss", planeOrDirection: "Transversal", equipment: "Balon medicinal" },
      { name: "Landmine rotational punch", planeOrDirection: "Transversal", equipment: "Barra landmine" }
    ]
  },
  {
    slug: "core-anti-extension-control",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Control motor / resistencia manual",
    exercises: [
      { name: "Dead bug asistido", planeOrDirection: "Sagital", equipment: "Feedback manual" },
      { name: "Dead bug", planeOrDirection: "Sagital", equipment: "Peso corporal" },
      { name: "Plank", planeOrDirection: "Sagital", equipment: "Peso corporal" },
      { name: "Body saw", planeOrDirection: "Sagital", equipment: "Peso corporal / sliders" }
    ]
  },
  {
    slug: "core-anti-extension-strength",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Fuerza base",
    exercises: [
      { name: "Stability ball rollout", planeOrDirection: "Sagital", equipment: "Fitball" },
      { name: "Ab wheel rollout", planeOrDirection: "Sagital", equipment: "Rueda abdominal" },
      { name: "Long lever plank", planeOrDirection: "Sagital", equipment: "Peso corporal" },
      { name: "Barbell rollout", planeOrDirection: "Sagital", equipment: "Barra" }
    ]
  },
  {
    slug: "core-hypertrophy",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Hipertrofia",
    exercises: [
      { name: "Cable crunch", planeOrDirection: "Sagital", equipment: "Polea" },
      { name: "Machine crunch", planeOrDirection: "Sagital", equipment: "Maquina" },
      { name: "Weighted plank", planeOrDirection: "Sagital", equipment: "Disco" },
      { name: "Hanging knee raise", planeOrDirection: "Sagital", equipment: "Barra" }
    ]
  },
  {
    slug: "core-power",
    pattern: "Core",
    family: "Anti-extension",
    objective: "Potencia",
    exercises: [
      { name: "Med ball overhead slam", planeOrDirection: "Sagital", equipment: "Balon medicinal" },
      { name: "Med ball sit-up throw", planeOrDirection: "Sagital", equipment: "Balon medicinal" },
      { name: "Plank to sprint start", planeOrDirection: "Sagital", equipment: "Peso corporal" },
      { name: "Explosive rollout return", planeOrDirection: "Sagital", equipment: "Rueda abdominal" }
    ]
  }
];

export const exerciseLibrary: ExerciseDefinition[] = exerciseGroups.flatMap((group) =>
  group.exercises.map((exercise, index) => ({
    ...exercise,
    id: `${group.slug}-${index + 1}`,
    pattern: group.pattern,
    family: group.family,
    objective: group.objective,
    orderInFamily: index + 1
  }))
);

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
