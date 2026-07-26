export type ActivationRole = "primary" | "secondary" | "stabilizer";

export type ActivationLevel = 3 | 2 | 1;

export type EvidenceStrength = "direct" | "family" | "inference";

export type SourceType = "pubmed";

export type ExerciseActivationEvidence = {
  exerciseId?: string;
  exerciseName?: string;
  pattern?: string;
  family?: string;
  muscles: {
    muscle: string;
    role: ActivationRole;
    level: ActivationLevel;
    note?: string;
  }[];
  sources: {
    pmid: string;
    title: string;
    sourceType: SourceType;
  }[];
  evidenceStrength: EvidenceStrength;
  notes?: string;
};

type ExerciseLookup = {
  id: string;
  name: string;
  pattern?: string;
};

const pubmedSources = {
  deadliftReview: {
    pmid: "32107499",
    title: "Electromyographic activity in deadlift exercise and its variants. A systematic review.",
    sourceType: "pubmed"
  },
  conventionalRomanianDeadlift: {
    pmid: "30662500",
    title: "An electromyographic and kinetic comparison of conventional and Romanian deadlifts.",
    sourceType: "pubmed"
  },
  romanianDeadliftVariants: {
    pmid: "35162922",
    title: "An Electromyographic Analysis of Romanian, Step-Romanian, and Stiff-Leg Deadlift.",
    sourceType: "pubmed"
  },
  hipThrustReview: {
    pmid: "31191088",
    title: "Barbell Hip Thrust, Muscular Activation and Performance: A Systematic Review.",
    sourceType: "pubmed"
  },
  squatLungeLoading: {
    pmid: "30676181",
    title: "Effect of Loading Devices on Muscle Activation in Squat and Lunge.",
    sourceType: "pubmed"
  },
  monopodalSquatLungeStepUp: {
    pmid: "32236133",
    title:
      "Electromyographic activity in the gluteus medius, gluteus maximus, biceps femoris, vastus lateralis, vastus medialis and rectus femoris during the Monopodal Squat, Forward Lunge and Lateral Step-Up exercises.",
    sourceType: "pubmed"
  },
  singleLegSquat: {
    pmid: "33887761",
    title: "Muscle Activation During Single-Legged Squat Is Affected by Position of the Nonstance Limb.",
    sourceType: "pubmed"
  },
  benchInclinations: {
    pmid: "33049982",
    title:
      "Effect of Five Bench Inclinations on the Electromyographic Activity of the Pectoralis Major, Anterior Deltoid, and Triceps Brachii during the Bench Press Exercise.",
    sourceType: "pubmed"
  },
  pushUpBenchPress: {
    pmid: "29809073",
    title: "Muscle Activity Patterns do not Differ Between Push-Up and Bench Press Exercises.",
    sourceType: "pubmed"
  },
  upperBodyLifts: {
    pmid: "15903389",
    title:
      "Electromyographic activity of the pectoralis major and anterior deltoid muscles during three upper-body lifts.",
    sourceType: "pubmed"
  },
  pullUpDevices: {
    pmid: "28828073",
    title: "Electromyographical Comparison of a Traditional, Suspension Device, and Towel Pull-Up.",
    sourceType: "pubmed"
  },
  pullUpChinUp: {
    pmid: "21068680",
    title:
      "Surface electromyographic activation patterns and elbow joint motion during a pull-up, chin-up, or perfect-pullup rotational exercise.",
    sourceType: "pubmed"
  },
  latPulldownTypes: {
    pmid: "19855327",
    title: "Electromyographic analysis of three different types of lat pull-down.",
    sourceType: "pubmed"
  },
  latPulldownGrip: {
    pmid: "40981044",
    title:
      "Electromyographic Analysis of Back Muscle Activation During Lat Pulldown Exercise: Effects of Grip Variations and Forearm Orientation.",
    sourceType: "pubmed"
  },
  plankLongLever: {
    pmid: "25325773",
    title:
      "An electromyographic comparison of a modified version of the plank with a long lever and posterior tilt versus the traditional plank exercise.",
    sourceType: "pubmed"
  },
  plankHipAdduction: {
    pmid: "27213781",
    title:
      "Comparison of EMG activity on abdominal muscles during plank exercise with unilateral and bilateral additional isometric hip adduction.",
    sourceType: "pubmed"
  },
  plankAttentionalFocus: {
    pmid: "30063527",
    title: "Electromyographic Effect of Using Different Attentional Foci During the Front Plank Exercise.",
    sourceType: "pubmed"
  }
} as const;

export const activationRoleLabels: Record<ActivationRole, string> = {
  primary: "Principal",
  secondary: "Secundaria",
  stabilizer: "Estabilizadora"
};

export const activationLevelLabels: Record<ActivationLevel, string> = {
  3: "Principal",
  2: "Secundaria",
  1: "Estabilizadora"
};

export const evidenceStrengthLabels: Record<EvidenceStrength, string> = {
  direct: "Evidencia directa",
  family: "Evidencia por familia",
  inference: "Inferencia"
};

const hingePrimary = [
  { muscle: "glutes", role: "primary", level: 3 },
  { muscle: "hamstrings", role: "primary", level: 3 },
  { muscle: "spinalErectors", role: "secondary", level: 2 },
  { muscle: "core", role: "stabilizer", level: 1 },
  { muscle: "forearms", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

const squatFamily = [
  { muscle: "quadriceps", role: "primary", level: 3 },
  { muscle: "glutes", role: "primary", level: 3 },
  { muscle: "adductors", role: "secondary", level: 2 },
  { muscle: "spinalErectors", role: "stabilizer", level: 1 },
  { muscle: "core", role: "stabilizer", level: 1 },
  { muscle: "calves", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

const lungeFamily = [
  { muscle: "quadriceps", role: "primary", level: 3 },
  { muscle: "glutes", role: "primary", level: 3 },
  { muscle: "gluteMed", role: "secondary", level: 2 },
  { muscle: "hamstrings", role: "secondary", level: 2 },
  { muscle: "adductors", role: "stabilizer", level: 1 },
  { muscle: "core", role: "stabilizer", level: 1 },
  { muscle: "calves", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

const benchFamily = [
  { muscle: "chest", role: "primary", level: 3 },
  { muscle: "shoulders", role: "secondary", level: 2, note: "Mapea deltoides anterior a hombros." },
  { muscle: "triceps", role: "secondary", level: 2 },
  { muscle: "upperBack", role: "stabilizer", level: 1 },
  { muscle: "core", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

const verticalPullFamily = [
  { muscle: "lats", role: "primary", level: 3 },
  { muscle: "upperBack", role: "secondary", level: 2 },
  { muscle: "biceps", role: "secondary", level: 2 },
  { muscle: "forearms", role: "stabilizer", level: 1 },
  { muscle: "core", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

const plankFamily = [
  { muscle: "core", role: "primary", level: 3 },
  { muscle: "shoulders", role: "secondary", level: 2 },
  { muscle: "glutes", role: "stabilizer", level: 1 },
  { muscle: "spinalErectors", role: "stabilizer", level: 1 }
] satisfies ExerciseActivationEvidence["muscles"];

export const exerciseActivationEvidenceProfiles: ExerciseActivationEvidence[] = [
  {
    exerciseId: "hinge-horizontal-force-strength-7",
    exerciseName: "Conventional deadlift",
    pattern: "Hinge / Horizontal Force",
    family: "Deadlift",
    muscles: [
      ...hingePrimary,
      { muscle: "quadriceps", role: "secondary", level: 2 },
      { muscle: "upperBack", role: "stabilizer", level: 1 }
    ],
    sources: [pubmedSources.deadliftReview, pubmedSources.conventionalRomanianDeadlift],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para peso muerto convencional y demandas principales de cadena posterior."
  },
  {
    exerciseId: "hinge-horizontal-force-strength-4",
    exerciseName: "Romanian deadlift",
    pattern: "Hinge / Horizontal Force",
    family: "Deadlift",
    muscles: hingePrimary,
    sources: [
      pubmedSources.deadliftReview,
      pubmedSources.conventionalRomanianDeadlift,
      pubmedSources.romanianDeadliftVariants
    ],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para Romanian deadlift y variantes cercanas."
  },
  {
    exerciseId: "hinge-horizontal-force-hypertrophy-3",
    exerciseName: "Romanian deadlift unilateral",
    pattern: "Hinge / Horizontal Force",
    family: "Deadlift",
    muscles: [
      ...hingePrimary,
      { muscle: "gluteMed", role: "secondary", level: 2 },
      { muscle: "calves", role: "stabilizer", level: 1 }
    ],
    sources: [pubmedSources.deadliftReview, pubmedSources.romanianDeadliftVariants],
    evidenceStrength: "family",
    notes: "Variante unilateral tratada como familia cercana de Romanian deadlift."
  },
  {
    exerciseId: "hinge-horizontal-force-strength-6",
    exerciseName: "Peso muerto con barra hexagonal",
    pattern: "Hinge / Horizontal Force",
    family: "Deadlift",
    muscles: [
      { muscle: "glutes", role: "primary", level: 3 },
      { muscle: "hamstrings", role: "secondary", level: 2 },
      { muscle: "quadriceps", role: "secondary", level: 2 },
      { muscle: "spinalErectors", role: "secondary", level: 2 },
      { muscle: "core", role: "stabilizer", level: 1 },
      { muscle: "forearms", role: "stabilizer", level: 1 }
    ],
    sources: [pubmedSources.deadliftReview],
    evidenceStrength: "family",
    notes: "Perfil por familia de deadlift; no sustituye al fatigueMap operativo."
  },
  {
    exerciseId: "hinge-horizontal-force-strength-2",
    exerciseName: "Hip thrust",
    pattern: "Hinge / Horizontal Force",
    family: "Hip thrust",
    muscles: [
      { muscle: "glutes", role: "primary", level: 3 },
      { muscle: "hamstrings", role: "secondary", level: 2 },
      { muscle: "quadriceps", role: "secondary", level: 2 },
      { muscle: "core", role: "stabilizer", level: 1 },
      { muscle: "spinalErectors", role: "stabilizer", level: 1 }
    ],
    sources: [pubmedSources.hipThrustReview],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo del hip thrust con barra y variantes cercanas."
  },
  ...[
    ["squat-vertical-force-strength-2", "Goblet squat"],
    ["squat-vertical-force-strength-4", "Front squat"],
    ["squat-vertical-force-strength-5", "Back squat"]
  ].map(([exerciseId, exerciseName]) => ({
    exerciseId,
    exerciseName,
    pattern: "Squat / Vertical Force",
    family: "Squat",
    muscles: squatFamily,
    sources: [pubmedSources.squatLungeLoading],
    evidenceStrength: "family" as const,
    notes: "Perfil cualitativo por familia squat/vertical force."
  })),
  ...[
    ["lunge-unilateral-force-strength-2", "Reverse lunge"],
    ["lunge-unilateral-force-strength-3", "Walking lunge"],
    ["lunge-unilateral-force-strength-4", "Step-up"],
    ["lunge-unilateral-force-hypertrophy-4", "Bulgarian split squat"]
  ].map(([exerciseId, exerciseName]) => ({
    exerciseId,
    exerciseName,
    pattern: "Lunge / Unilateral Force",
    family: "Lunge / Step-up",
    muscles: lungeFamily,
    sources: [
      pubmedSources.squatLungeLoading,
      pubmedSources.monopodalSquatLungeStepUp,
      pubmedSources.singleLegSquat
    ],
    evidenceStrength: "family" as const,
    notes: "Perfil cualitativo para patrones unilaterales de lunge/step-up."
  })),
  {
    exerciseId: "push-upper-body-press-strength-2",
    exerciseName: "Push-up",
    pattern: "Push / Upper Body Press",
    family: "Push-up / Bench press",
    muscles: [
      { muscle: "chest", role: "primary", level: 3 },
      { muscle: "triceps", role: "secondary", level: 2 },
      { muscle: "shoulders", role: "secondary", level: 2 },
      { muscle: "core", role: "stabilizer", level: 1 }
    ],
    sources: [pubmedSources.pushUpBenchPress],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para push-up y comparación con bench press."
  },
  {
    exerciseId: "push-upper-body-press-strength-3",
    exerciseName: "Bench press",
    pattern: "Push / Upper Body Press",
    family: "Bench press",
    muscles: benchFamily,
    sources: [pubmedSources.benchInclinations, pubmedSources.pushUpBenchPress, pubmedSources.upperBodyLifts],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para press banca horizontal."
  },
  {
    exerciseId: "push-upper-body-press-strength-4",
    exerciseName: "Incline bench press",
    pattern: "Push / Upper Body Press",
    family: "Bench press",
    muscles: benchFamily,
    sources: [pubmedSources.benchInclinations, pubmedSources.upperBodyLifts],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para press inclinado dentro de la familia bench press."
  },
  {
    exerciseId: "pull-upper-body-pull-strength-6",
    exerciseName: "Pull-up / Chin-up",
    pattern: "Pull / Upper Body Pull",
    family: "Pull-up / Chin-up",
    muscles: verticalPullFamily,
    sources: [pubmedSources.pullUpDevices, pubmedSources.pullUpChinUp],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para dominada, chin-up y variantes cercanas."
  },
  {
    exerciseId: "pull-upper-body-pull-hypertrophy-4",
    exerciseName: "Lat pulldown",
    pattern: "Pull / Upper Body Pull",
    family: "Lat pulldown",
    muscles: verticalPullFamily,
    sources: [pubmedSources.latPulldownTypes, pubmedSources.latPulldownGrip],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para jalón al pecho y variaciones de agarre/orientación."
  },
  {
    exerciseId: "core-trunk-control-anti-flexion-extension-3",
    exerciseName: "Plank",
    pattern: "Core / Trunk Control",
    family: "Plank",
    muscles: plankFamily,
    sources: [pubmedSources.plankLongLever, pubmedSources.plankHipAdduction, pubmedSources.plankAttentionalFocus],
    evidenceStrength: "direct",
    notes: "Perfil cualitativo para front plank y variantes próximas."
  }
];

export function getExerciseActivationEvidence(exercise?: ExerciseLookup | null) {
  if (!exercise) return null;
  const normalizedName = exercise.name.toLowerCase();

  return (
    exerciseActivationEvidenceProfiles.find(
      (profile) =>
        profile.exerciseId === exercise.id ||
        profile.exerciseName?.toLowerCase() === normalizedName
    ) ?? null
  );
}

export function getActivationMusclesByRole(profile?: ExerciseActivationEvidence | null) {
  return {
    primary: profile?.muscles.filter((entry) => entry.role === "primary") ?? [],
    secondary: profile?.muscles.filter((entry) => entry.role === "secondary") ?? [],
    stabilizer: profile?.muscles.filter((entry) => entry.role === "stabilizer") ?? []
  };
}

export function getExerciseActivationCoverage(exercises: ExerciseLookup[]) {
  const direct = exercises.filter(
    (exercise) => getExerciseActivationEvidence(exercise)?.evidenceStrength === "direct"
  );
  const family = exercises.filter(
    (exercise) => getExerciseActivationEvidence(exercise)?.evidenceStrength === "family"
  );
  const withoutEvidence = exercises.filter((exercise) => !getExerciseActivationEvidence(exercise));

  return {
    direct,
    family,
    withoutEvidence
  };
}
