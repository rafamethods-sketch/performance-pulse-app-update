export type ExercisePattern =
  | "Squat / Vertical Force"
  | "Hinge / Horizontal Force"
  | "Lunge / Unilateral Force"
  | "Lower Body Accessories"
  | "Olympic derivatives"
  | "Speed & Agility Skills"
  | "Gait & Carry"
  | "Push / Upper Body Press"
  | "Pull / Upper Body Pull"
  | "Upper Body Accessories"
  | "Core / Trunk Control"
  | "Mobility / Movement Prep";

export type BodyRegion = "lower_body" | "upper_body" | "global_movement";
export type ExerciseType =
  | "accessory"
  | "conditioning"
  | "control"
  | "core"
  | "hypertrophy"
  | "mobility"
  | "plyometric"
  | "power"
  | "strength";
export type SessionExerciseSection = "activation" | "accessory" | "main";

export type ExerciseBlock =
  | "Control / tolerancia"
  | "Reeducación de la marcha"
  | "Fuerza base"
  | "Hipertrofia"
  | "Potencia"
  | "Pliometria"
  | "Conditioning"
  | "Acceleration / Linear Speed"
  | "Deceleration / Change of Direction"
  | "Footwork / Coordination"
  | "Reactive Agility"
  | "Rotation"
  | "Anti-rotation"
  | "Lateral flexion"
  | "Anti-lateral flexion"
  | "Flexion-extension"
  | "Anti-flexion-extension"
  | "Ground support & transitions"
  | "Chest accessories"
  | "Shoulder accessories"
  | "Arm accessories"
  | "Quad accessories"
  | "Hamstring accessories"
  | "Glute accessories"
  | "Abductor accessories"
  | "Adductor accessories"
  | "Calf & ankle accessories"
  | "Neck and spine mobility"
  | "Shoulder mobility & activation"
  | "Hip mobility & activation"
  | "Ankle mobility"
  | "Thoracic & trunk mobility"
  | "Integrated mobility";

export type FatigueMap = Partial<Record<FatigueMapKey, number>>;

export type FatigueMapKey =
  | "quadriceps"
  | "glutes"
  | "adductors"
  | "hamstrings"
  | "calves"
  | "hipFlexors"
  | "core"
  | "obliques"
  | "transverseAbdominis"
  | "rectusAbdominis"
  | "shoulders"
  | "gluteMed"
  | "lumbarStabilizers"
  | "hips"
  | "thoracicSpine"
  | "cervicalSpine"
  | "neckFlexors"
  | "ankles"
  | "soleus"
  | "tibialisAnterior"
  | "chest"
  | "triceps"
  | "anteriorDelts"
  | "lateralDelts"
  | "upperTraps"
  | "serratusAnterior"
  | "lats"
  | "midBack"
  | "rearDelts"
  | "biceps"
  | "lowerTraps"
  | "rotatorCuff"
  | "spinalErectors"
  | "traps"
  | "forearms"
  | "upperBack";

export type ExerciseVariantType =
  | "material"
  | "stance"
  | "grip"
  | "range"
  | "tempo"
  | "support"
  | "direction"
  | "start_position"
  | "reception"
  | "complex"
  | "progression"
  | "regression";

export type ExerciseVariantDifficulty = "basic" | "intermediate" | "advanced";

export type ExerciseVariant = {
  id: string;
  name: string;
  type: ExerciseVariantType;
  difficulty?: ExerciseVariantDifficulty;
  equipment?: string[];
  description?: string;
  coachingNotes?: string;
};

export type ExerciseDefinition = {
  bodyRegion: BodyRegion;
  block: ExerciseBlock;
  equipment: string[];
  errorsToAvoid: string[];
  exerciseType: ExerciseType;
  fatigueMap: FatigueMap;
  id: string;
  name: string;
  pattern: ExercisePattern;
  primaryMuscles: string[];
  rank: number;
  secondaryMuscles: string[];
  technicalDescription: string;
  allowedSessionSections: SessionExerciseSection[];
  variants?: ExerciseVariant[];
};

export type WeeklyExerciseSetInput = {
  exerciseId: string;
  isWarmUp?: boolean;
  sets: number;
};

type ExerciseSeed = Omit<
  ExerciseDefinition,
  "allowedSessionSections" | "block" | "bodyRegion" | "exerciseType" | "id" | "pattern" | "rank"
> & { id?: string };

type ExerciseGroupSeed = {
  block: ExerciseBlock;
  exerciseType?: ExerciseType;
  allowedSessionSections?: SessionExerciseSection[];
  pattern: ExercisePattern;
  slug: string;
  exercises: ExerciseSeed[];
};

export const exercisePatterns: ExercisePattern[] = [
  "Squat / Vertical Force",
  "Hinge / Horizontal Force",
  "Lunge / Unilateral Force",
  "Lower Body Accessories",
  "Olympic derivatives",
  "Speed & Agility Skills",
  "Gait & Carry",
  "Push / Upper Body Press",
  "Pull / Upper Body Pull",
  "Upper Body Accessories",
  "Core / Trunk Control",
  "Mobility / Movement Prep"
];

export const bodyRegions: BodyRegion[] = ["lower_body", "upper_body", "global_movement"];

export const bodyRegionLabels: Record<BodyRegion, string> = {
  lower_body: "Lower body",
  upper_body: "Upper body",
  global_movement: "Global movement"
};

export const patternBodyRegions: Record<ExercisePattern, BodyRegion> = {
  "Squat / Vertical Force": "lower_body",
  "Hinge / Horizontal Force": "lower_body",
  "Lunge / Unilateral Force": "lower_body",
  "Lower Body Accessories": "lower_body",
  "Push / Upper Body Press": "upper_body",
  "Pull / Upper Body Pull": "upper_body",
  "Upper Body Accessories": "upper_body",
  "Olympic derivatives": "global_movement",
  "Speed & Agility Skills": "global_movement",
  "Gait & Carry": "global_movement",
  "Core / Trunk Control": "global_movement",
  "Mobility / Movement Prep": "global_movement"
};

export const exerciseBlocks: ExerciseBlock[] = [
  "Control / tolerancia",
  "Reeducación de la marcha",
  "Fuerza base",
  "Hipertrofia",
  "Potencia",
  "Pliometria",
  "Conditioning",
  "Acceleration / Linear Speed",
  "Deceleration / Change of Direction",
  "Footwork / Coordination",
  "Reactive Agility",
  "Rotation",
  "Anti-rotation",
  "Lateral flexion",
  "Anti-lateral flexion",
  "Flexion-extension",
  "Anti-flexion-extension",
  "Ground support & transitions",
  "Chest accessories",
  "Shoulder accessories",
  "Arm accessories",
  "Quad accessories",
  "Hamstring accessories",
  "Glute accessories",
  "Abductor accessories",
  "Adductor accessories",
  "Calf & ankle accessories",
  "Neck and spine mobility",
  "Shoulder mobility & activation",
  "Hip mobility & activation",
  "Ankle mobility",
  "Thoracic & trunk mobility",
  "Integrated mobility"
];

function inferExerciseType(group: ExerciseGroupSeed): ExerciseType {
  if (group.block === "Control / tolerancia") return "control";
  if (group.block === "Fuerza base") return "strength";
  if (group.block === "Hipertrofia") return "hypertrophy";
  if (group.block === "Potencia") return "power";
  if (group.block === "Pliometria") return "plyometric";
  if (group.block === "Conditioning" || group.pattern === "Gait & Carry") return "conditioning";
  if (group.pattern === "Core / Trunk Control") return "core";
  if (group.pattern === "Lower Body Accessories" || group.pattern === "Upper Body Accessories") return "accessory";
  return "strength";
}

function inferAllowedSessionSections(exerciseType: ExerciseType): SessionExerciseSection[] {
  if (exerciseType === "mobility") return ["activation"];
  if (exerciseType === "accessory" || exerciseType === "hypertrophy" || exerciseType === "control") {
    return ["main", "accessory"];
  }
  return ["main", "accessory"];
}

const exerciseGroups: ExerciseGroupSeed[] = [
  {
    slug: "squat-vertical-force-control",
    pattern: "Squat / Vertical Force",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Triple flexo-extensión en supino con resistencia manual",
        equipment: ["Manual"],
        technicalDescription:
          "Tumbado en supino, realiza una triple flexo-extensión guiada de cadera, rodilla y tobillo contra resistencia manual. Mantén una trayectoria controlada, alineación de rodilla y presión progresiva sin dolor.",
        errorsToAvoid: ["Empujar de forma brusca", "Perder la alineación de rodilla", "Bloquear la respiración"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.6, glutes: 0.5, adductors: 0.2, hamstrings: 0.1, core: 0.1, calves: 0.2 }
      }),
      squatExercise({
        name: "Sentadilla asistida con feedback manual",
        equipment: ["Manual", "Soporte"],
        technicalDescription:
          "Realiza una sentadilla con apoyo o feedback manual para guiar la flexión de cadera, rodilla y tobillo. Mantén el peso repartido en todo el pie y controla el descenso y la subida.",
        errorsToAvoid: ["Colapsar las rodillas", "Levantar talones", "Depender totalmente del soporte"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.3, hamstrings: 0.1, spinalErectors: 0.2, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Wall sit iso",
        equipment: ["Peso corporal", "Pared"],
        technicalDescription:
          "Apoya la espalda en la pared y mantén una posición de sentadilla isométrica. Busca presión estable en el pie, rodillas alineadas y tronco apoyado sin dolor.",
        errorsToAvoid: ["Hundirse sin control", "Juntar las rodillas", "Apoyar solo las puntas de los pies"],
        primaryMuscles: ["Cuádriceps"],
        secondaryMuscles: ["Glúteo mayor", "Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 0.85, glutes: 0.35, adductors: 0.2, hamstrings: 0.1, core: 0.1, calves: 0.15 }
      }),
      squatExercise({
        name: "Spanish squat",
        equipment: ["Banda", "Soporte"],
        technicalDescription:
          "Coloca una banda detrás de las rodillas y desciende manteniendo el tronco estable y la tibia controlada. Prioriza tensión continua, rodillas alineadas y subida controlada.",
        errorsToAvoid: ["Perder tensión de la banda", "Inclinarse excesivamente", "Rebotar abajo"],
        primaryMuscles: ["Cuádriceps"],
        secondaryMuscles: ["Glúteo mayor", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.35, adductors: 0.1, hamstrings: 0.1, core: 0.15, calves: 0.15 }
      })
    ]
  },
  {
    slug: "squat-vertical-force-strength",
    pattern: "Squat / Vertical Force",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Sit to Stand",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Desde un cajón o silla, levántate y vuelve a sentarte controlando la posición del pie y la dirección de las rodillas. Mantén el tronco estable y evita caer al sentarte.",
        errorsToAvoid: ["Impulsarse con balanceo excesivo", "Caer al cajón", "Despegar talones"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.3, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Goblet squat",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sujeta la carga delante del pecho y desciende flexionando cadera, rodilla y tobillo. Mantén el peso repartido en todo el pie, rodillas alineadas y subida controlada.",
        errorsToAvoid: ["Levantar los talones", "Colapsar las rodillas hacia dentro", "Perder la posición del tronco", "Bajar sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.4, core: 0.3, spinalErectors: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Smith squat",
        equipment: ["Multipower"],
        technicalDescription:
          "Coloca la barra guiada en una posición cómoda y realiza la sentadilla manteniendo control del recorrido. Ajusta los pies para conservar estabilidad, rango útil y tensión continua.",
        errorsToAvoid: ["Colocar los pies demasiado lejos", "Bloquear rodillas de forma brusca", "Relajar el tronco"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Front squat",
        equipment: ["Barra"],
        technicalDescription:
          "Sostén la barra delante de los hombros y desciende con tronco estable y codos altos. Mantén el centro de presión equilibrado y sube sin perder la posición torácica.",
        errorsToAvoid: ["Dejar caer los codos", "Redondear el tronco", "Perder profundidad controlada"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Core", "Erectores espinales", "Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, core: 0.5, spinalErectors: 0.5, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Back squat",
        equipment: ["Barra"],
        technicalDescription:
          "Coloca la barra sobre la espalda, fija el tronco y desciende manteniendo pies activos y rodillas alineadas. Sube empujando el suelo y conservando el control de la carga.",
        errorsToAvoid: ["Perder tensión del tronco", "Valgo de rodilla", "Desplazar el peso solo a puntas o talones"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.9, adductors: 0.5, core: 0.4, spinalErectors: 0.5, calves: 0.2 }
      })
    ]
  },
  {
    slug: "squat-vertical-force-hypertrophy",
    pattern: "Squat / Vertical Force",
    block: "Hipertrofia",
    exercises: [
      squatExercise({
        name: "Leg press",
        equipment: ["Máquina"],
        technicalDescription:
          "Empuja la plataforma manteniendo pelvis estable y rodillas alineadas con los pies. Usa un rango útil, controla la bajada y evita bloquear de forma brusca.",
        errorsToAvoid: ["Despegar la pelvis", "Cerrar rodillas", "Bloquear rodillas con agresividad"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        id: "squat-vertical-force-hypertrophy-belt-squat",
        name: "Belt squat",
        equipment: ["Máquina", "Cinturón de carga"],
        technicalDescription:
          "Variante de sentadilla con carga aplicada desde la cadera mediante cinturón o máquina específica. Permite entrenar el patrón de sentadilla con menor carga axial sobre la columna, manteniendo énfasis en cuádriceps y glúteo mayor.",
        errorsToAvoid: [
          "perder profundidad útil por exceso de carga",
          "colapsar las rodillas hacia dentro",
          "inclinar excesivamente el tronco",
          "dejar que la pelvis se desplace sin control",
          "empujar solo con la punta del pie",
          "usar el cinturón demasiado bajo o mal ajustado"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquiosurales", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.85, glutes: 0.75, adductors: 0.35, hamstrings: 0.2, calves: 0.2, core: 0.2 }
      }),
      squatExercise({
        name: "Hack squat",
        equipment: ["Máquina"],
        technicalDescription:
          "Desciende en la máquina manteniendo apoyo completo del pie y espalda estable contra el respaldo. Controla profundidad, alineación de rodilla y ritmo.",
        errorsToAvoid: ["Levantar talones", "Rebotar abajo", "Perder alineación de rodillas"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.6, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Pendulum squat",
        equipment: ["Máquina"],
        technicalDescription:
          "Realiza el patron de sentadilla en péndulo con tensión constante y control del rango. Mantén pies activos, pelvis estable y subida sin impulsos bruscos.",
        errorsToAvoid: ["Usar rebote excesivo", "Perder contacto estable del pie", "Cerrar las rodillas"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, calves: 0.2 }
      })
    ]
  },
  {
    slug: "squat-vertical-force-power",
    pattern: "Squat / Vertical Force",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Countermovement jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza un descenso rápido y salta verticalmente buscando máxima altura con aterrizaje controlado. Mantén alineación de rodillas y rigidez suficiente del tronco.",
        errorsToAvoid: ["Aterrizar sin control", "Colapsar rodillas", "Hacer una bajada lenta"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.8, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Squat jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Parte desde una posición estable de sentadilla y salta sin contramovimiento marcado. Prioriza salida explosiva, tronco firme y aterrizaje equilibrado.",
        errorsToAvoid: ["Usar rebote previo", "Perder postura en la salida", "Aterrizar rigido"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Core", "Aductores"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Box jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Salta sobre un cajón buscando altura y control de recepción. Aterriza estable, con rodillas alineadas y baja del cajón sin impactos innecesarios.",
        errorsToAvoid: ["Elegir un cajón demasiado alto", "Caer en flexión descontrolada", "Saltar hacia delante sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Core", "Aductores"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.8, calves: 0.7, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Jump squat con carga",
        equipment: ["Mancuerna", "Barra"],
        technicalDescription:
          "Realiza un salto vertical con carga ligera o moderada, buscando velocidad y técnica limpia. Mantén tronco estable, despegue potente y aterrizaje controlado.",
        errorsToAvoid: ["Usar demasiada carga", "Perder velocidad", "Aterrizar con rodillas hacia dentro"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Core", "Erectores espinales", "Aductores"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.9, calves: 0.7, core: 0.4, spinalErectors: 0.3, adductors: 0.3 }
      })
    ]
  },
  {
    slug: "squat-vertical-force-plyometrics",
    pattern: "Squat / Vertical Force",
    block: "Pliometria",
    exercises: [
      squatExercise({
        id: "squat-vertical-force-plyometric-tall-to-short-landing",
        name: "Tall to Short Landing",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de aterrizaje en el que el deportista pasa de una posición alta a una posición atlética baja de forma rápida y controlada. Sirve para enseñar absorción de fuerza, rigidez útil, control de rodilla-cadera-tobillo y preparación para drop landings y saltos reactivos.",
        errorsToAvoid: [
          "caer con rodillas colapsadas hacia dentro",
          "perder contacto completo del pie",
          "hundirse demasiado sin control",
          "bloquear las rodillas al aterrizar",
          "perder la posición del tronco",
          "hacer el gesto lento y sin intención reactiva"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Isquiosurales", "Glúteo medio", "Core"],
        fatigueMap: { quadriceps: 0.55, glutes: 0.45, calves: 0.4, hamstrings: 0.25, gluteMed: 0.25, core: 0.25 }
      }),
      squatExercise({
        name: "Drop landing",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajón bajo y absorbe el impacto con control de cadera, rodilla y tobillo. Busca estabilidad, silencio en el apoyo y alineación correcta.",
        errorsToAvoid: ["Caer con rodillas hacia dentro", "Aterrizar muy rigido", "Perder equilibrio"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
        variants: [
          {
            id: "drop-landing-variant-box-bilateral",
            name: "Caída bilateral del cajón",
            type: "support",
            difficulty: "basic",
            equipment: ["Peso corporal", "Cajón"],
            description:
              "Variante de aterrizaje bilateral desde cajón, orientada a aprender absorción de fuerza y alineación de rodilla, cadera y tobillo.",
            coachingNotes: "Usar alturas bajas y buscar una caída silenciosa y estable."
          },
          {
            id: "drop-landing-variant-lateral",
            name: "Caída lateral",
            type: "direction",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Cajón bajo"],
            description:
              "Variante de aterrizaje con desplazamiento lateral, útil para introducir demandas frontales y control de cadera.",
            coachingNotes: "Evitar colapso de rodilla hacia dentro y pérdida de control del tronco."
          }
        ],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, calves: 0.6, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        id: "squat-vertical-force-plyometric-drop-landing-unilateral",
        name: "Drop landing unilateral",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Aterrizaje unilateral desde una pequeña altura orientado a mejorar la absorción de fuerza, el control de rodilla y la estabilidad de cadera y tobillo. Priorizar caída silenciosa, alineación y control antes de progresar a saltos reactivos.",
        errorsToAvoid: [
          "colapsar rodilla hacia dentro",
          "aterrizar con el tronco descontrolado",
          "caer de puntillas sin controlar talón",
          "usar una altura excesiva",
          "perder equilibrio tras el contacto",
          "buscar velocidad antes que control"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Glúteo medio", "Isquiosurales", "Core"],
        fatigueMap: { quadriceps: 0.6, glutes: 0.5, calves: 0.45, gluteMed: 0.4, hamstrings: 0.25, core: 0.3 }
      }),
      squatExercise({
        name: "Pogo jump bilateral",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza rebotes bilaterales rápidos con mínimo tiempo de contacto. Mantén tobillos activos, tronco estable y una amplitud pequeña y reactiva.",
        errorsToAvoid: ["Flexionar demasiado las rodillas", "Perder ritmo", "Caer pesado"],
        primaryMuscles: ["Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Glúteo mayor", "Core"],
        variants: [
          {
            id: "pogo-bilateral-variant-assisted",
            name: "Pogos asistidos bilaterales",
            type: "support",
            difficulty: "basic",
            equipment: ["Peso corporal", "Soporte"],
            description:
              "Variante asistida para aprender ritmo, rigidez de tobillo y contacto breve con menor demanda de control.",
            coachingNotes: "Usar soporte solo para facilitar el gesto, no para descargar completamente el peso."
          },
          {
            id: "pogo-bilateral-variant-band-assisted",
            name: "Pogos asistidos con goma",
            type: "support",
            difficulty: "basic",
            equipment: ["Peso corporal", "Goma elástica"],
            description: "Variante asistida con goma para reducir impacto y facilitar la reactividad inicial.",
            coachingNotes: "Mantener contactos cortos y evitar que la goma altere la postura."
          },
          {
            id: "pogo-bilateral-variant-coordinative-extensive",
            name: "Pogos dinámicos coordinativos extensivos",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description:
              "Variante coordinativa de baja-moderada intensidad para trabajar ritmo, elasticidad y control de apoyos.",
            coachingNotes: "Priorizar coordinación y calidad de contacto por encima de altura."
          },
          {
            id: "pogo-bilateral-variant-coordinative-intensive",
            name: "Pogos dinámicos coordinativos intensivos",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante coordinativa más intensa con mayor exigencia de rigidez, ritmo y tolerancia de contactos.",
            coachingNotes:
              "Reducir volumen si aparece pérdida de rebote o molestias en Aquiles, pie o rodilla."
          }
        ],
        fatigueMap: { calves: 1, quadriceps: 0.4, glutes: 0.3, core: 0.2 }
      }),
      squatExercise({
        id: "squat-vertical-force-plyometric-single-leg-pogo",
        name: "Pogo unilateral",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Saltos reactivos unilaterales de baja amplitud orientados al trabajo de rigidez de tobillo, reactividad del complejo pie-tobillo y control vertical con apoyo único. Mantener contacto breve, alineación estable y rebote elástico.",
        errorsToAvoid: [
          "hundirse demasiado en cada contacto",
          "perder rigidez de tobillo",
          "colapsar la rodilla hacia dentro",
          "balancear excesivamente el tronco",
          "buscar altura en vez de contacto breve",
          "realizarlo con dolor en pie, Aquiles o rodilla"
        ],
        primaryMuscles: ["Gemelos", "Sóleo", "Cuádriceps"],
        secondaryMuscles: ["Glúteo medio", "Glúteo mayor", "Core"],
        variants: [
          {
            id: "single-leg-pogo-variant-assisted",
            name: "Pogos asistidos unilaterales",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Soporte"],
            description:
              "Variante unilateral asistida para introducir reactividad a una pierna con menor demanda de equilibrio.",
            coachingNotes: "Usar soporte mínimo y mantener alineación de tobillo, rodilla y cadera."
          },
          {
            id: "single-leg-pogo-variant-band-assisted",
            name: "Pogos unilaterales asistidos con goma",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Goma elástica"],
            description: "Variante unilateral asistida con goma para reducir impacto y facilitar el rebote.",
            coachingNotes: "No usar la goma para compensar una mala estabilidad del apoyo."
          },
          {
            id: "single-leg-pogo-variant-front",
            name: "Pogos unilaterales frontales",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Pogos unilaterales con pequeño desplazamiento frontal, orientados a reactividad y control dinámico.",
            coachingNotes: "Mantener contactos breves y evitar desplazamientos excesivos."
          },
          {
            id: "single-leg-pogo-variant-lateral",
            name: "Pogos laterales unilaterales",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Pogos unilaterales con desplazamiento lateral, aumentando la demanda de control frontal y estabilidad de cadera.",
            coachingNotes: "Priorizar alineación y control antes de aumentar amplitud."
          }
        ],
        fatigueMap: { calves: 0.8, soleus: 0.7, quadriceps: 0.35, gluteMed: 0.35, glutes: 0.25, core: 0.2 }
      }),
      squatExercise({
        name: "Low hurdle hop",
        equipment: ["Peso corporal", "Vallas bajas"],
        technicalDescription:
          "Salta vallas bajas con contactos rápidos y controlados. Mantén ritmo, orientación de rodillas y una recepción elástica sin perder postura.",
        errorsToAvoid: ["Buscar demasiada altura", "Frenarse en cada apoyo", "Colapsar rodillas"],
        primaryMuscles: ["Gemelos", "Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core"],
        fatigueMap: { calves: 0.9, quadriceps: 0.6, glutes: 0.6, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Depth jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajón y responde con un salto potente tras una recepción breve. Prioriza rigidez útil, alineación y contacto rápido con el suelo.",
        errorsToAvoid: ["Usar demasiada altura", "Quedarse hundido al aterrizar", "Rebotar sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.9, adductors: 0.4, core: 0.4, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Drop jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajón y salta buscando mínimo tiempo de contacto. Mantén recepción elástica, tronco estable y salida vertical rápida.",
        errorsToAvoid: ["Alargar el contacto", "Aterrizar con ruido excesivo", "Perder alineación de rodilla"],
        primaryMuscles: ["Gemelos", "Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
        variants: [
          {
            id: "drop-jump-box",
            name: "Drop jump desde cajón",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Peso corporal / cajón"],
            description:
              "Variante realizada desde cajón bajo, priorizando contacto breve y rebote vertical controlado.",
            coachingNotes:
              "Usar una altura que permita mantener rigidez, alineación y tiempo de contacto corto."
          },
          {
            id: "drop-jump-unilateral-step",
            name: "Drop jump unilateral desde step",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Peso corporal / step"],
            description: "Variante unilateral con mayor demanda de control de tobillo, rodilla y cadera.",
            coachingNotes: "No progresar a esta variante si el aterrizaje bilateral no es estable."
          },
          {
            id: "drop-jump-variant-asymmetric-step",
            name: "Drop jump asimétrico desde step",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Step"],
            description:
              "Variante asimétrica del drop jump que aumenta la demanda de control unilateral, alineación y reactividad.",
            coachingNotes:
              "Usar solo si el deportista controla bien el drop jump bilateral y los aterrizajes unilaterales."
          },
          {
            id: "drop-jump-variant-lateral",
            name: "Drop jump lateral",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Cajón bajo"],
            description: "Variante con orientación lateral que combina caída, contacto breve y rebote hacia el lado.",
            coachingNotes: "Priorizar estabilidad de cadera y rodilla antes de buscar distancia lateral."
          },
          {
            id: "drop-jump-variant-continuous",
            name: "Drop jumps continuos",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Cajón bajo"],
            description:
              "Secuencia de drop jumps repetidos para trabajar reactividad y tolerancia a contactos sucesivos.",
            coachingNotes:
              "Cortar la serie si aumenta demasiado el tiempo de contacto o se pierde alineación."
          }
        ],
        fatigueMap: { calves: 1, quadriceps: 0.8, glutes: 0.7, adductors: 0.4, core: 0.4, hamstrings: 0.3 }
      })
    ]
  },
  {
    slug: "hinge-horizontal-force-control",
    pattern: "Hinge / Horizontal Force",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Puente de gluteo con resistencia manual",
        equipment: ["Manual"],
        technicalDescription:
          "En supino, empuja la cadera hacia arriba contra resistencia manual suave. Mantén pelvis estable, costillas controladas y extensión de cadera sin compensar con la zona lumbar.",
        errorsToAvoid: ["Arquear la zona lumbar", "Empujar con tirónes", "Perder alineación de rodillas"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.4, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip hinge con feedback manual",
        equipment: ["Manual", "Soporte"],
        technicalDescription:
          "Practica la bisagra llevando la cadera atrás con feedback manual o soporte. Mantén columna neutra, pelvis controlada y peso repartido en el pie.",
        errorsToAvoid: ["Flexionar demasiado las rodillas", "Redondear la espalda", "Perder la pelvis neutra"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.5, hamstrings: 0.5, spinalErectors: 0.3, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip hinge con palo",
        equipment: ["Peso corporal", "Palo"],
        technicalDescription:
          "Coloca el palo en contacto con cabeza, espalda y sacro mientras haces la bisagra. Busca movimiento desde la cadera sin perder los puntos de contacto.",
        errorsToAvoid: ["Separar el palo de la espalda", "Convertirlo en sentadilla", "Mirar al frente en exceso"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.4, hamstrings: 0.4, spinalErectors: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Wall hinge drill",
        equipment: ["Peso corporal", "Pared"],
        technicalDescription:
          "De espaldas a una pared, lleva la cadera atrás hasta tocarla manteniendo columna neutra. Controla el recorrido y evita que las rodillas dominen el movimiento.",
        errorsToAvoid: ["Alejarse demasiado de la pared", "Redondear la espalda", "Levantar los talones"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.4, hamstrings: 0.4, spinalErectors: 0.2, core: 0.2 }
      })
    ]
  },
  {
    slug: "hinge-horizontal-force-strength",
    pattern: "Hinge / Horizontal Force",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Glute bridge",
        equipment: ["Peso corporal"],
        technicalDescription:
          "En supino, eleva la cadera hasta alinear tronco y muslos. Mantén pelvis estable, empuje desde talones y pausa breve arriba sin hiperextender la zona lumbar.",
        errorsToAvoid: ["Arquear la espalda", "Empujar solo con puntas", "Bajar sin control"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.4, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Apoya la espalda en banco y extiende la cadera hasta una posición estable. Mantén mentón recogido, pelvis controlada y empuje simétrico con los pies.",
        errorsToAvoid: ["Hiperextender lumbar", "Perder la retroversion final", "Separar rodillas sin control"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Aductores", "Core", "Erectores espinales"],
        variants: [
          {
            id: "hip-thrust-barbell",
            name: "Hip thrust con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante cargada con barra para aumentar la sobrecarga de extensión de cadera.",
            coachingNotes: "Ajustar protección de cadera y mantener retroversión pélvica controlada arriba."
          },
          {
            id: "hip-thrust-unilateral",
            name: "Hip thrust unilateral",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Mancuerna", "Barra"],
            description: "Variante unilateral con mayor demanda de estabilidad pélvica y control de cadera.",
            coachingNotes: "Evitar rotación de pelvis y pérdida de extensión completa."
          },
          {
            id: "hip-thrust-variant-dumbbell",
            name: "Hip thrust con mancuerna",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuerna"],
            description:
              "Variante cargada con mancuerna, útil como progresión intermedia entre peso corporal y barra.",
            coachingNotes: "Mantener control pélvico arriba y evitar hiperextensión lumbar."
          },
          {
            id: "hip-thrust-variant-asymmetric-barbell",
            name: "Hip thrust asimétrico con barra",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con apoyo asimétrico que aumenta la demanda de control pélvico y estabilidad de cadera.",
            coachingNotes: "Evitar rotación de pelvis y mantener empuje equilibrado."
          },
          {
            id: "hip-thrust-variant-unilateral-dumbbell",
            name: "Hip thrust unilateral con mancuerna",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Mancuerna"],
            description:
              "Variante unilateral cargada con mancuerna para aumentar la sobrecarga de extensión de cadera y control pélvico.",
            coachingNotes: "Usar carga moderada y evitar que la pelvis caiga o rote."
          },
          {
            id: "hip-thrust-variant-eccentric-unilateral-dumbbell",
            name: "Hip thrust excéntrico unilateral con mancuerna",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Mancuerna"],
            description:
              "Variante unilateral con énfasis excéntrico para aumentar el control de la bajada y la demanda sobre glúteo e isquiosurales.",
            coachingNotes: "Controlar la fase excéntrica sin perder alineación de pelvis."
          }
        ],
        fatigueMap: { glutes: 1, hamstrings: 0.5, adductors: 0.3, core: 0.3, spinalErectors: 0.2 }
      }),
      squatExercise({
        name: "Kettlebell deadlift",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Coloca la kettlebell entre los pies y levanta desde una bisagra estable. Mantén espalda neutra, brazos largos y la carga cerca del cuerpo.",
        errorsToAvoid: ["Tirar con brazos", "Redondear espalda", "Alejar la carga del cuerpo"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, spinalErectors: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Romanian deadlift",
        equipment: ["Mancuernas", "Barra"],
        technicalDescription:
          "Desciende la carga con rodillas desbloqueadas y cadera atrás, manteniéndola cerca del cuerpo. Sube extendiendo la cadera sin perder columna neutra.",
        errorsToAvoid: ["Redondear espalda", "Convertirlo en sentadilla", "Alejar la carga"],
        primaryMuscles: ["Isquios", "Glúteo mayor"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        variants: [
          {
            id: "romanian-deadlift-variant-barbell",
            name: "Romanian deadlift con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante bilateral con barra para sobrecarga progresiva del patrón hinge.",
            coachingNotes: "Mantener barra cercana, espalda neutra y tensión activa en isquiosurales."
          },
          {
            id: "romanian-deadlift-variant-dumbbells",
            name: "Romanian deadlift con mancuernas",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuernas"],
            description:
              "Variante con mancuernas que facilita ajuste de recorrido y puede ser más accesible técnicamente.",
            coachingNotes: "Evitar que las mancuernas se alejen del cuerpo."
          },
          {
            id: "romanian-deadlift-variant-single-leg",
            name: "Romanian deadlift unilateral",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Mancuerna", "Kettlebell"],
            description:
              "Variante unilateral con mayor demanda de equilibrio, control pélvico y estabilidad de cadera.",
            coachingNotes: "Mantener pelvis cuadrada y no abrir la cadera de la pierna libre."
          },
          {
            id: "romanian-deadlift-variant-deficit",
            name: "Romanian deadlift en déficit",
            type: "range",
            difficulty: "advanced",
            equipment: ["Barra", "Mancuernas", "Plataforma"],
            description:
              "Variante con mayor rango de movimiento, aumentando la demanda sobre isquiosurales y control de bisagra.",
            coachingNotes: "Usar solo si se mantiene columna neutra y control del rango."
          }
        ],
        fatigueMap: { hamstrings: 1, glutes: 0.8, spinalErectors: 0.5, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        id: "hinge-horizontal-force-strength-good-morning",
        name: "Good morning",
        equipment: ["Barra"],
        technicalDescription:
          "Ejercicio de bisagra de cadera con barra orientado al control de la flexión de cadera, la extensión de cadera y la resistencia de la cadena posterior. Mantener columna neutra, desplazamiento de cadera hacia atrás y tensión activa en isquiosurales, glúteos y erectores espinales.",
        errorsToAvoid: [
          "flexionar la columna lumbar",
          "convertirlo en una sentadilla",
          "bajar más de lo que permite la movilidad de cadera",
          "perder tensión en la espalda alta",
          "usar demasiada carga para el nivel técnico",
          "bloquear las rodillas en exceso"
        ],
        primaryMuscles: ["Isquiosurales", "Glúteo mayor", "Erectores espinales"],
        secondaryMuscles: ["Aductores", "Core", "Upper back"],
        variants: [
          {
            id: "good-morning-variant-barbell",
            name: "Buenos días con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Variante clásica con barra para trabajar bisagra de cadera, control lumbar y cadena posterior.",
            coachingNotes: "Usar cargas conservadoras y priorizar control técnico."
          },
          {
            id: "good-morning-variant-smith-machine",
            name: "Buenos días en multipower",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Multipower"],
            description:
              "Variante guiada en multipower que reduce la demanda de estabilización libre y facilita el control de trayectoria.",
            coachingNotes: "Ajustar posición para que el movimiento siga siendo una bisagra de cadera."
          },
          {
            id: "good-morning-variant-zercher",
            name: "Buenos días Zercher",
            type: "support",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con barra en posición Zercher, aumentando la demanda de core, espalda alta y control del tronco.",
            coachingNotes: "Usar cargas bajas y evitar pérdida de postura por la posición anterior de la carga."
          }
        ],
        fatigueMap: { hamstrings: 0.75, glutes: 0.65, spinalErectors: 0.65, adductors: 0.25, core: 0.35, upperBack: 0.25 }
      }),
      squatExercise({
        name: "Peso muerto con barra hexagonal",
        equipment: ["Barra hexagonal"],
        technicalDescription:
          "Colocate dentro de la barra hexagonal y levanta empujando el suelo con tronco estable. Mantén la carga centrada, cadera y hombros subiendo coordinados.",
        errorsToAvoid: ["Perder tensión inicial", "Levantar cadera antes que hombros", "Bloquear con extensión lumbar"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Cuádriceps", "Erectores espinales", "Core", "Aductores"],
        variants: [
          {
            id: "trap-bar-deadlift-variant-high-handles",
            name: "Peso muerto con barra hexagonal agarre alto",
            type: "range",
            difficulty: "basic",
            equipment: ["Barra hexagonal"],
            description:
              "Variante con agarres altos que reduce el rango de movimiento y facilita la posición inicial.",
            coachingNotes: "Útil como entrada técnica antes de progresar a agarres bajos."
          },
          {
            id: "trap-bar-deadlift-variant-low-handles",
            name: "Peso muerto con barra hexagonal agarre bajo",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Barra hexagonal"],
            description: "Variante con agarres bajos y mayor rango de movimiento.",
            coachingNotes: "Mantener control de tronco y empuje equilibrado de piernas."
          },
          {
            id: "trap-bar-deadlift-variant-jump",
            name: "Trap bar jump",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Barra hexagonal"],
            description:
              "Variante balística con barra hexagonal orientada a potencia de extensión de cadera, rodilla y tobillo.",
            coachingNotes: "Usar cargas ligeras y no programarlo como fuerza máxima."
          }
        ],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, quadriceps: 0.5, spinalErectors: 0.5, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Conventional deadlift",
        equipment: ["Barra"],
        technicalDescription:
          "Levanta la barra desde el suelo manteniéndola cerca de las piernas. Fija tronco, empuja el suelo y extiende cadera y rodilla sin perder posición.",
        errorsToAvoid: ["Redondear lumbar", "Tirar con la barra lejos", "Bloquear con hiperextensión"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Erectores espinales"],
        secondaryMuscles: ["Cuádriceps", "Core", "Aductores", "Gemelos"],
        variants: [
          {
            id: "conventional-deadlift-variant-deficit",
            name: "Peso muerto convencional en déficit",
            type: "range",
            difficulty: "advanced",
            equipment: ["Barra", "Plataforma"],
            description:
              "Variante con mayor rango de movimiento para aumentar demanda inicial de fuerza y control de posición.",
            coachingNotes: "Usar solo si el deportista mantiene buena posición desde el suelo."
          },
          {
            id: "conventional-deadlift-variant-block-pull",
            name: "Peso muerto desde bloques",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Barra", "Bloques"],
            description:
              "Variante con menor rango de movimiento, útil para trabajar sobrecarga o posiciones específicas del tirón.",
            coachingNotes: "Evitar convertirlo en una extensión lumbar; mantener empuje de piernas y cadera."
          },
          {
            id: "conventional-deadlift-variant-paused",
            name: "Peso muerto con pausa",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con pausa en una posición concreta del tirón para mejorar control, tensión y trayectoria.",
            coachingNotes: "Mantener tensión durante la pausa sin perder posición lumbar."
          }
        ],
        fatigueMap: { glutes: 0.9, hamstrings: 0.9, spinalErectors: 0.7, quadriceps: 0.4, core: 0.4, adductors: 0.3, calves: 0.2 }
      })
    ]
  },
  {
    slug: "hinge-horizontal-force-hypertrophy",
    pattern: "Hinge / Horizontal Force",
    block: "Hipertrofia",
    exercises: [
      squatExercise({
        name: "Back extension",
        equipment: ["Banco 45", "Banco romano"],
        technicalDescription:
          "En banco de extensión, flexiona desde la cadera y vuelve extendiendo sin hiperextender lumbar. Mantén control del rango y tensión en glúteos e isquios.",
        errorsToAvoid: ["Subir con tirón lumbar", "Hiperextender al final", "Perder control del descenso"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, spinalErectors: 0.5, core: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust machine",
        equipment: ["Máquina"],
        technicalDescription:
          "Ajusta la máquina y extiende la cadera contra la resistencia guiada. Mantén pelvis controlada, pausa arriba y descenso sin perder tensión.",
        errorsToAvoid: ["Hiperextender lumbar", "Recortar rango", "Empujar de forma asimétrica"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Aductores", "Core"],
        fatigueMap: { glutes: 1, hamstrings: 0.4, adductors: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Romanian deadlift unilateral",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Realiza una bisagra a una pierna con carga contralateral o ipsilateral. Mantén pelvis estable, espalda neutra y control del apoyo.",
        errorsToAvoid: ["Abrir la cadera", "Perder equilibrio", "Redondear la espalda"],
        primaryMuscles: ["Isquios", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { hamstrings: 0.9, glutes: 0.8, adductors: 0.4, core: 0.4, spinalErectors: 0.3, calves: 0.2 }
      })
    ]
  },
  {
    slug: "hinge-horizontal-force-power",
    pattern: "Hinge / Horizontal Force",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Hip thrust explosivo",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Realiza el hip thrust con intención máxima de velocidad manteniendo control arriba. Usa una carga que permita extensión potente sin perder técnica.",
        errorsToAvoid: ["Usar carga demasiado alta", "Hiperextender lumbar", "Perder velocidad"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.5, core: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust con salto",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde puente o hip thrust, extiende la cadera de forma explosiva para despegar ligeramente. Aterriza controlando pelvis y rodillas.",
        errorsToAvoid: ["Aterrizar sin control", "Arquear lumbar", "Perder alineación de rodillas"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Gemelos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.5, core: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Kettlebell swing",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Proyecta la kettlebell con una bisagra explosiva de cadera. Mantén brazos relajados, columna neutra y recepción de la carga con cadera atrás.",
        errorsToAvoid: ["Hacer una sentadilla", "Tirar con brazos", "Perder timing de cadera"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, spinalErectors: 0.4, core: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Broad jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Salta horizontalmente proyectando la cadera y aterriza con control. Busca extensión potente, braceo coordinado y recepción estable.",
        errorsToAvoid: ["Aterrizar con rodillas dentro", "Caer hacia delante", "Perder control del tronco"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, calves: 0.7, quadriceps: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Romanian deadlift + Step up contralateral",
        equipment: ["Mancuerna", "Cajon"],
        technicalDescription:
          "Combina una bisagra rumana unilateral con subida contralateral al cajón. Mantén pelvis estable, control del apoyo y transición potente hacia el step-up.",
        errorsToAvoid: ["Girar la pelvis", "Perder equilibrio", "Acelerar sin control"],
        primaryMuscles: ["Glúteo mayor", "Isquios"],
        secondaryMuscles: ["Cuádriceps", "Aductores", "Core", "Gemelos"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, quadriceps: 0.4, adductors: 0.4, core: 0.4, calves: 0.2 }
      })
    ]
  },
  {
    slug: "hinge-horizontal-force-plyometrics",
    pattern: "Hinge / Horizontal Force",
    block: "Pliometria",
    exercises: [
      squatExercise({
        name: "Broad jump landing",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza un salto horizontal y centra la tarea en absorber la recepción. Mantén cadera atrás, rodillas alineadas y control de tronco al caer.",
        errorsToAvoid: ["Caer con rodillas dentro", "No frenar la inercia", "Aterrizar rigido"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Aductores", "Core"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.7, calves: 0.6, quadriceps: 0.4, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        id: "hinge-horizontal-force-plyometric-horizontal-bounds",
        name: "Bounds horizontales",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Saltos horizontales alternos orientados a producir y absorber fuerza en dirección horizontal. Trabajan extensión potente de cadera, control de la recepción y transferencia hacia aceleración y desplazamientos deportivos.",
        errorsToAvoid: [
          "aterrizar con la rodilla colapsada",
          "buscar distancia perdiendo control",
          "no terminar la extensión de cadera",
          "caer con demasiada rigidez",
          "perder la orientación del tronco",
          "convertirlo en carrera sin fase de salto clara"
        ],
        primaryMuscles: ["Glúteo mayor", "Isquiosurales", "Cuádriceps"],
        secondaryMuscles: ["Gemelos", "Glúteo medio", "Core"],
        variants: [
          {
            id: "horizontal-bounds-variant-extensive",
            name: "Bounds horizontales extensivos",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description:
              "Variante de bounds con énfasis en volumen, ritmo y control de la recepción, sin buscar máxima distancia.",
            coachingNotes: "Mantener calidad de apoyo y dirección horizontal estable."
          },
          {
            id: "horizontal-bounds-variant-intensive",
            name: "Bounds horizontales intensivos",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante de mayor intensidad orientada a producir más distancia horizontal y absorber fuerzas mayores.",
            coachingNotes: "Usar menos repeticiones y más descanso que en bounds extensivos."
          },
          {
            id: "horizontal-bounds-variant-diagonal",
            name: "Bounds en diagonal",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante con orientación diagonal que añade demanda frontal y transversal al salto horizontal.",
            coachingNotes: "Evitar que la búsqueda de diagonal reduzca el control de rodilla y pelvis."
          },
          {
            id: "horizontal-bounds-variant-half-kneeling-start",
            name: "Bounds horizontales desde posición semiarrodillada",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante iniciada desde posición semiarrodillada para aumentar la demanda de salida, coordinación y producción horizontal.",
            coachingNotes: "Mantener salida potente sin perder alineación inicial."
          }
        ],
        fatigueMap: { glutes: 0.65, hamstrings: 0.55, quadriceps: 0.45, calves: 0.35, gluteMed: 0.3, core: 0.25 }
      }),
      squatExercise({
        id: "hinge-horizontal-force-plyometric-horizontal-hops",
        name: "Hops horizontales",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Saltos horizontales repetidos con énfasis en reactividad, rigidez útil y desplazamiento hacia delante. Mantener contactos controlados, orientación horizontal y producción de fuerza desde cadera y tobillo.",
        errorsToAvoid: [
          "perder control de la recepción",
          "hundirse demasiado en cada apoyo",
          "buscar velocidad sin estabilidad",
          "caer con rodilla colapsada",
          "usar demasiada distancia entre contactos",
          "perder alineación de pelvis y tronco"
        ],
        primaryMuscles: ["Glúteo mayor", "Isquiosurales", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Glúteo medio", "Core"],
        variants: [
          {
            id: "horizontal-hops-variant-extensive",
            name: "Hops horizontales extensivos",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description:
              "Variante con énfasis extensivo para trabajar ritmo, elasticidad y repetición de contactos horizontales.",
            coachingNotes: "Mantener contactos estables y evitar fatiga técnica."
          },
          {
            id: "horizontal-hops-variant-obstacles",
            name: "Hops horizontales con obstáculos",
            type: "support",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Vallas bajas"],
            description:
              "Variante con obstáculos bajos para aumentar la precisión, la reactividad y el control de trayectoria.",
            coachingNotes: "Usar obstáculos bajos y separaciones que no comprometan la técnica."
          },
          {
            id: "horizontal-hops-variant-inertia",
            name: "Hops horizontales con inercia",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante con mayor continuidad e inercia hacia delante, orientada a transferencia a aceleración y desplazamiento.",
            coachingNotes: "No permitir que la velocidad reduzca la calidad del apoyo."
          },
          {
            id: "horizontal-hops-variant-half-kneeling-start",
            name: "Hops horizontales desde posición semiarrodillada",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description: "Variante iniciada desde posición semiarrodillada para trabajar salida horizontal y coordinación.",
            coachingNotes: "Buscar una primera acción potente sin perder control de tronco."
          }
        ],
        fatigueMap: { glutes: 0.6, hamstrings: 0.55, calves: 0.45, quadriceps: 0.35, gluteMed: 0.3, core: 0.25 }
      }),
      squatExercise({
        name: "Repeated broad jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Encadena saltos horizontales repetidos manteniendo ritmo y recepciones estables. Reutiliza la fuerza horizontal sin perder alineación ni control.",
        errorsToAvoid: ["Frenarse demasiado", "Perder estabilidad", "Buscar distancia a costa de técnica"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.8, calves: 0.8, quadriceps: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Horizontal hurdle hop",
        equipment: ["Vallas bajas"],
        technicalDescription:
          "Supera vallas bajas con saltos horizontales reactivos y contactos controlados. Mantén rigidez útil, dirección estable y recepción rápida.",
        errorsToAvoid: ["Saltar demasiado alto", "Perder ritmo", "Colapsar al aterrizar"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Aductores", "Core"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.7, calves: 0.9, quadriceps: 0.4, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        id: "hinge-horizontal-force-plyometric-horizontal-drop-jump",
        name: "Drop jump horizontal",
        equipment: ["Peso corporal", "Cajon bajo"],
        technicalDescription:
          "Ejercicio reactivo en el que se cae desde una pequeña altura y se proyecta el cuerpo hacia delante con un salto horizontal. Combina absorción rápida, orientación horizontal de la fuerza y reactividad tras el contacto.",
        errorsToAvoid: [
          "usar una altura excesiva",
          "pasar demasiado tiempo en el suelo",
          "no proyectar la cadera hacia delante",
          "aterrizar sin control",
          "colapsar rodillas o tobillos",
          "perder rigidez del tronco"
        ],
        primaryMuscles: ["Glúteo mayor", "Isquiosurales", "Cuádriceps"],
        secondaryMuscles: ["Gemelos", "Glúteo medio", "Core"],
        variants: [
          {
            id: "horizontal-drop-jump-variant-from-bench",
            name: "Drop jump horizontal desde banco",
            type: "support",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Banco bajo"],
            description: "Variante desde banco bajo con proyección horizontal tras el contacto.",
            coachingNotes: "Usar altura baja y cortar si el contacto se vuelve lento."
          },
          {
            id: "horizontal-drop-jump-variant-continuous",
            name: "Drop jumps horizontales continuos",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Secuencia continua de drop jumps horizontales para trabajar contactos repetidos y proyección hacia delante.",
            coachingNotes: "Mantener contactos cortos y recepción controlada en cada repetición."
          },
          {
            id: "horizontal-drop-jump-variant-rotational",
            name: "Drop jumps rotacionales",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante con componente rotacional, aumentando la demanda de control transversal y estabilidad en la recepción.",
            coachingNotes: "Usar con deportistas que ya controlen bien los drop jumps horizontales."
          }
        ],
        fatigueMap: { glutes: 0.65, hamstrings: 0.55, quadriceps: 0.5, calves: 0.4, gluteMed: 0.3, core: 0.3 }
      })
    ]
  },
  {
    slug: "lunge-unilateral-force-control",
    pattern: "Lunge / Unilateral Force",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Split stance hold con resistencia manual",
        equipment: ["Manual"],
        technicalDescription:
          "Mantén una posición de split stance mientras recibes resistencia manual suave. Busca pelvis estable, pie completo apoyado y rodilla alineada sin perder equilibrio.",
        errorsToAvoid: ["Colapsar la rodilla hacia dentro", "Inclinar la pelvis", "Perder presión del pie delantero"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.5, glutes: 0.5, adductors: 0.4, hamstrings: 0.2, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Split squat iso asistido",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Mantén una posición baja de split squat con ayuda de un soporte si hace falta. Controla pelvis, rodilla y pie, respirando sin dolor ni compensaciones.",
        errorsToAvoid: ["Apoyarse demasiado en el soporte", "Cerrar la rodilla", "Perder verticalidad del tronco"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.4, hamstrings: 0.2, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Assisted split squat",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Realiza un split squat con soporte para guiar el equilibrio. Desciende controlando rodilla y pelvis, y sube empujando el suelo con el pie delantero.",
        errorsToAvoid: ["Tirar del soporte", "Perder alineación frontal", "Acortar el rango sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.7, adductors: 0.4, hamstrings: 0.3, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Step-down controlado",
        equipment: ["Cajon", "Step"],
        technicalDescription:
          "Desde un cajón o step, baja una pierna de forma lenta manteniendo pelvis nivelada y rodilla alineada. Toca el suelo con control y vuelve sin impulsarte.",
        errorsToAvoid: ["Dejar caer la pelvis", "Colapsar la rodilla", "Bajar demasiado rápido"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.6, adductors: 0.5, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        id: "lunge-unilateral-force-control-step-down-mp",
        name: "Step Down MP",
        equipment: ["Cajon", "Step"],
        technicalDescription:
          "Ejercicio unilateral de control de descenso desde cajón o step, con énfasis en alineación cadera-rodilla-pie, control excéntrico y estabilidad lumbopélvica.",
        errorsToAvoid: [
          "colapsar la rodilla hacia dentro",
          "dejar caer la pelvis",
          "perder control del pie",
          "bajar demasiado rápido",
          "compensar con inclinación excesiva del tronco"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Glúteo medio", "Aductores", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.55, glutes: 0.4, gluteMed: 0.3, adductors: 0.2, calves: 0.15, core: 0.2 }
      })
    ]
  },
  {
    slug: "lunge-unilateral-force-strength",
    pattern: "Lunge / Unilateral Force",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Split squat",
        equipment: ["Peso corporal", "Mancuernas"],
        technicalDescription:
          "En posición de zancada estática, baja y sube controlando pelvis, rodilla y apoyo del pie delantero. Mantén tronco estable y empuje equilibrado.",
        errorsToAvoid: ["Rebotar abajo", "Cerrar la rodilla", "Apoyar el peso solo en la pierna trasera"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Reverse lunge",
        equipment: ["Peso corporal", "Mancuernas"],
        technicalDescription:
          "Da un paso atrás y desciende hasta una zancada estable. Vuelve empujando con la pierna delantera y manteniendo control de rodilla y pelvis.",
        errorsToAvoid: ["Dar un paso demasiado corto", "Perder equilibrio", "Impulsarse con la pierna trasera"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        variants: [
          {
            id: "reverse-lunge-variant-dumbbells",
            name: "Zancada hacia atrás con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas"],
            description:
              "Variante cargada con mancuernas para progresar la fuerza unilateral manteniendo libertad de movimiento.",
            coachingNotes: "Mantener paso atrás controlado y rodilla delantera alineada."
          },
          {
            id: "reverse-lunge-variant-goblet",
            name: "Zancada hacia atrás goblet",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Kettlebell"],
            description:
              "Variante con carga anterior tipo goblet, útil para facilitar postura erguida y control del tronco.",
            coachingNotes: "No dejar que la carga provoque flexión excesiva de tronco."
          },
          {
            id: "reverse-lunge-variant-smith-machine",
            name: "Zancada hacia atrás en multipower",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Multipower"],
            description: "Variante guiada que facilita estabilidad y permite sobrecarga controlada.",
            coachingNotes: "Ajustar la posición para que el recorrido no fuerce la rodilla ni la cadera."
          },
          {
            id: "reverse-lunge-variant-landmine",
            name: "Zancada trasera con landmine",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description: "Variante con landmine que añade una trayectoria diagonal y demanda de control del tronco.",
            coachingNotes: "Evitar rotar el tronco hacia la carga."
          }
        ],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Walking lunge",
        equipment: ["Mancuernas"],
        technicalDescription:
          "Avanza alternando zancadas con control de pelvis y rodilla en cada apoyo. Mantén pasos estables, tronco firme y ritmo sin perder técnica.",
        errorsToAvoid: ["Acelerar sin control", "Cruzar los pies", "Perder alineación de rodilla"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        variants: [
          {
            id: "walking-lunge-variant-dumbbells",
            name: "Zancada frontal alterna con mancuerna",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas"],
            description: "Variante cargada de zancada alterna para trabajar fuerza unilateral y control dinámico.",
            coachingNotes: "Mantener pasos consistentes y tronco estable."
          },
          {
            id: "walking-lunge-variant-eccentric-dumbbells",
            name: "Zancada excéntrica con mancuernas",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Mancuernas"],
            description:
              "Variante con énfasis excéntrico para aumentar control de la bajada y tolerancia unilateral.",
            coachingNotes: "Controlar el descenso sin perder alineación de rodilla y pelvis."
          },
          {
            id: "walking-lunge-variant-front-rack",
            name: "Walking lunge en front rack",
            type: "support",
            difficulty: "advanced",
            equipment: ["Kettlebells", "Mancuernas", "Barra"],
            description: "Variante con carga en front rack que aumenta la demanda de tronco y espalda alta.",
            coachingNotes: "Mantener costillas controladas y no perder postura por la carga anterior."
          }
        ],
        fatigueMap: { quadriceps: 0.9, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Step-up",
        equipment: ["Cajon", "Mancuernas"],
        technicalDescription:
          "Sube a un cajón empujando principalmente con la pierna apoyada arriba. Mantén pelvis estable, rodilla alineada y bajada controlada.",
        errorsToAvoid: ["Impulsarse con la pierna de abajo", "Dejar caer la pelvis", "Perder control en la bajada"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        variants: [
          {
            id: "step-up-variant-dumbbells",
            name: "Step-up con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Cajón"],
            description:
              "Variante cargada con mancuernas para progresar fuerza unilateral en extensión de cadera y rodilla.",
            coachingNotes: "Empujar desde la pierna del cajón y evitar impulsarse con la pierna trasera."
          },
          {
            id: "step-up-variant-contralateral-load",
            name: "Step-up con carga contralateral",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Kettlebell", "Cajón"],
            description:
              "Variante con carga contralateral que aumenta la demanda de estabilidad lateral y control de pelvis.",
            coachingNotes: "Evitar inclinación lateral del tronco hacia la carga."
          },
          {
            id: "step-up-variant-high-box",
            name: "Step-up a cajón alto",
            type: "range",
            difficulty: "advanced",
            equipment: ["Cajón"],
            description: "Variante con mayor altura de cajón para aumentar rango y demanda de cadera.",
            coachingNotes: "No usar alturas que obliguen a compensar con impulso o pérdida de pelvis."
          }
        ],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.3, core: 0.3 }
      })
    ]
  },
  {
    slug: "lunge-unilateral-force-hypertrophy",
    pattern: "Lunge / Unilateral Force",
    block: "Hipertrofia",
    exercises: [
      squatExercise({
        name: "Unilateral leg press",
        equipment: ["Máquina"],
        technicalDescription:
          "Empuja la plataforma con una pierna manteniendo pelvis estable y rodilla alineada. Controla la bajada y usa un rango que permita tensión sin dolor.",
        errorsToAvoid: ["Despegar la pelvis", "Cerrar la rodilla", "Bloquear bruscamente"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Smith split squat",
        equipment: ["Multipower"],
        technicalDescription:
          "Realiza un split squat guiado en multipower, manteniendo apoyo firme y recorrido controlado. Ajusta la posición para acumular tensión sin perder alineación.",
        errorsToAvoid: ["Colocar los pies mal respecto a la barra", "Relajar el tronco", "Rebotar abajo"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.2, core: 0.2 }
      }),
      squatExercise({
        name: "Front foot elevated split squat",
        equipment: ["Mancuernas", "Plataforma"],
        technicalDescription:
          "Coloca el pie delantero elevado y desciende en split squat aumentando el rango útil. Mantén rodilla alineada, pelvis estable y carga controlada.",
        errorsToAvoid: ["Perder profundidad controlada", "Cerrar la rodilla", "Inclinarse sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        variants: [
          {
            id: "front-foot-elevated-split-squat-variant-dumbbells",
            name: "Front foot elevated split squat con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Plataforma"],
            description:
              "Variante cargada con mancuernas para progresar fuerza unilateral con mayor rango de la pierna adelantada.",
            coachingNotes: "Mantener control de rodilla y pelvis durante todo el rango."
          },
          {
            id: "front-foot-elevated-split-squat-variant-goblet",
            name: "Front foot elevated split squat goblet",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Kettlebell", "Plataforma"],
            description: "Variante con carga anterior tipo goblet para facilitar postura y control de tronco.",
            coachingNotes: "No dejar que la carga anterior limite la profundidad o provoque flexión excesiva."
          },
          {
            id: "front-foot-elevated-split-squat-variant-deficit",
            name: "Deficit split squat",
            type: "range",
            difficulty: "advanced",
            equipment: ["Mancuernas", "Plataformas"],
            description: "Variante con ambos pies elevados para aumentar rango de movimiento y demanda unilateral.",
            coachingNotes: "Usar solo si el deportista controla bien el front foot elevated split squat."
          }
        ],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.5, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Bulgarian split squat",
        equipment: ["Mancuernas", "Banco"],
        technicalDescription:
          "Apoya el pie trasero en un banco y baja con control sobre la pierna delantera. Mantén pelvis estable, rodilla alineada y empuje completo del pie.",
        errorsToAvoid: ["Apoyar demasiado peso atrás", "Perder equilibrio", "Cerrar rodilla delantera"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        variants: [
          {
            id: "bulgarian-split-squat-variant-dumbbells",
            name: "Búlgara con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Banco"],
            description:
              "Variante cargada con mancuernas para progresar la fuerza unilateral manteniendo libertad de movimiento.",
            coachingNotes: "Mantener pelvis estable y controlar la profundidad."
          },
          {
            id: "bulgarian-split-squat-variant-smith-machine",
            name: "Búlgara en multipower",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Multipower", "Banco"],
            description: "Variante guiada que permite mayor estabilidad y sobrecarga controlada.",
            coachingNotes: "Ajustar la posición del banco para evitar tensión excesiva en la cadera trasera."
          },
          {
            id: "bulgarian-split-squat-variant-front-rack",
            name: "Búlgara en front rack",
            type: "support",
            difficulty: "advanced",
            equipment: ["Kettlebells", "Mancuernas", "Barra", "Banco"],
            description:
              "Variante con carga anterior que aumenta la demanda de tronco, espalda alta y control postural.",
            coachingNotes: "Mantener costillas controladas y evitar inclinarse hacia delante en exceso."
          }
        ],
        fatigueMap: { quadriceps: 1, glutes: 0.9, adductors: 0.5, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Deficit split squat",
        equipment: ["Mancuernas", "Plataformas"],
        technicalDescription:
          "Realiza un split squat desde plataformas para aumentar el rango. Controla la profundidad, mantén pelvis estable y evita perder tensión abajo.",
        errorsToAvoid: ["Usar déficit excesivo", "Rebotar en el fondo", "Perder alineación frontal"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 1, glutes: 0.9, adductors: 0.5, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      })
    ]
  },
  {
    slug: "lunge-unilateral-force-power",
    pattern: "Lunge / Unilateral Force",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Explosive step-up",
        equipment: ["Cajon"],
        technicalDescription:
          "Sube al cajón con intención explosiva desde una pierna, manteniendo pelvis estable y bajada controlada. La velocidad no debe comprometer la alineación.",
        errorsToAvoid: ["Impulsarse con la pierna de abajo", "Perder control de rodilla", "Caer pesado"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Gemelos", "Aductores", "Core", "Isquios"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.5, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Step-up jump",
        equipment: ["Cajon"],
        technicalDescription:
          "Desde el cajón, realiza una subida con salto buscando potencia unilateral. Aterriza y baja con control, manteniendo pelvis y rodilla estables.",
        errorsToAvoid: ["Buscar altura sin control", "Colapsar rodilla", "Bajar del cajón con impacto excesivo"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Isquios"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.6, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Split squat jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde split squat, salta verticalmente y aterriza en la misma posición. Mantén tronco firme, rodilla alineada y recepción controlada.",
        errorsToAvoid: ["Aterrizar con rodilla hacia dentro", "Perder postura", "Hundir la pelvis sin control"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Lunge jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Alterna zancadas con salto, cambiando apoyos en el aire. Mantén ritmo, alineación de rodilla y recepción estable en cada repetición.",
        errorsToAvoid: ["Perder equilibrio", "Aterrizar estrecho", "Colapsar pelvis o rodilla"],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Lateral push-off",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Empuja lateralmente desde una pierna para desplazar el cuerpo con rapidez. Mantén cadera estable, pie activo y control del apoyo antes de repetir.",
        errorsToAvoid: ["Cruzar apoyos sin control", "Perder pelvis estable", "Caer sobre el borde del pie"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Aductores"],
        secondaryMuscles: ["Gemelos", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, adductors: 0.5, calves: 0.5, hamstrings: 0.3, core: 0.4 }
      })
    ]
  },
  {
    slug: "lunge-unilateral-force-plyometrics",
    pattern: "Lunge / Unilateral Force",
    block: "Pliometria",
    exercises: [
      squatExercise({
        name: "Lateral bound landing",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Salta lateralmente y centra la tarea en aterrizar estable sobre una pierna. Controla pelvis, rodilla y pie antes de reiniciar.",
        errorsToAvoid: ["Caer con rodilla dentro", "No estabilizar antes de repetir", "Inclinar el tronco en exceso"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Aductores"],
        secondaryMuscles: ["Gemelos", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, adductors: 0.5, calves: 0.5, hamstrings: 0.3, core: 0.4 }
      }),
      squatExercise({
        name: "Skater bound",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Encadena saltos laterales tipo patinador con recepción unilateral. Reutiliza la fuerza lateral manteniendo pelvis estable y contacto controlado.",
        errorsToAvoid: ["Perder ritmo", "Caer con apoyo inestable", "Cruzar demasiado la pierna libre"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Aductores"],
        secondaryMuscles: ["Gemelos", "Isquios", "Core"],
        variants: [
          {
            id: "skater-bound-variant-lateral-double",
            name: "Salto lateral doble",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description:
              "Variante con doble acción lateral para trabajar continuidad, control frontal y transferencia a desplazamientos laterales.",
            coachingNotes: "Evitar que el segundo salto se haga sin estabilidad previa."
          },
          {
            id: "skater-bound-variant-square",
            name: "Salto lateral en cuadrado",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante que organiza los saltos laterales en patrón de cuadrado, aumentando la demanda de orientación y control.",
            coachingNotes: "Mantener cada recepción estable antes de cambiar de dirección."
          },
          {
            id: "skater-bound-variant-medball",
            name: "Salto lateral con medball",
            type: "complex",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Balón medicinal"],
            description:
              "Variante que añade balón medicinal para aumentar la demanda coordinativa y de control del tronco.",
            coachingNotes: "Usar balón ligero y evitar que el tronco arrastre la recepción."
          }
        ],
        fatigueMap: { glutes: 0.9, quadriceps: 0.8, adductors: 0.5, calves: 0.6, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Alternating bounds",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza bounds alternos avanzando de una pierna a otra. Mantén proyección, recepción activa y alineación de rodilla en cada apoyo.",
        errorsToAvoid: ["Buscar distancia perdiendo control", "Aterrizar rigido", "Perder estabilidad de pelvis"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Single-leg bound",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Salta y aterriza con la misma pierna, controlando fuerza unilateral y rigidez de apoyo. Mantén pelvis estable y contacto eficiente.",
        errorsToAvoid: ["Colapsar al aterrizar", "Perder control del pie", "Repetir sin estabilidad"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        variants: [
          {
            id: "single-leg-bound-variant-45-degree",
            name: "Saltos 45º unilaterales alternos",
            type: "direction",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description: "Variante con dirección diagonal a 45º, útil para control unilateral en dirección no lineal.",
            coachingNotes: "Controlar rodilla y pelvis en cada aterrizaje."
          },
          {
            id: "single-leg-bound-variant-horizontal-double",
            name: "Salto doble horizontal unilateral",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante con dos saltos horizontales unilaterales consecutivos, aumentando demanda de reactividad y tolerancia.",
            coachingNotes: "No usar si el deportista no puede estabilizar un salto unilateral simple."
          },
          {
            id: "single-leg-bound-variant-from-bench",
            name: "Salto unilateral horizontal desde banco",
            type: "support",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Banco bajo"],
            description:
              "Variante con salida desde banco bajo para aumentar la demanda de absorción y proyección horizontal unilateral.",
            coachingNotes: "Mantener baja la altura y priorizar control sobre distancia."
          }
        ],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, calves: 0.8, adductors: 0.4, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Lateral hurdle hop",
        equipment: ["Vallas bajas"],
        technicalDescription:
          "Salta lateralmente sobre vallas bajas con apoyos reactivos. Mantén ritmo, control de pelvis y rodillas alineadas en cada contacto.",
        errorsToAvoid: ["Saltar demasiado alto", "Aterrizar sin control", "Perder ritmo lateral"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        variants: [
          {
            id: "lateral-hurdle-hop-variant-single-leg",
            name: "Lateral hurdle hop unilateral",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Vallas bajas"],
            description:
              "Variante unilateral del salto lateral sobre valla, con mayor demanda de control frontal y reactividad.",
            coachingNotes: "Usar vallas bajas y volumen reducido."
          },
          {
            id: "lateral-hurdle-hop-variant-alternating",
            name: "Lateral hurdle hop alterno",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Vallas bajas"],
            description: "Variante alterna para trabajar ritmo, coordinación y cambio de apoyo lateral.",
            coachingNotes: "Mantener contactos controlados y evitar perder la línea de desplazamiento."
          },
          {
            id: "lateral-hurdle-hop-variant-continuous",
            name: "Lateral hurdle hops continuos",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Vallas bajas"],
            description: "Secuencia continua de saltos laterales sobre valla para trabajar reactividad lateral.",
            coachingNotes: "Cortar la serie si se pierde rigidez o alineación."
          }
        ],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, calves: 0.8, adductors: 0.5, hamstrings: 0.3, core: 0.4 }
      })
    ]
  },
  {
    slug: "lower-body-accessories-quads",
    pattern: "Lower Body Accessories",
    block: "Quad accessories",
    exercises: [
      squatExercise({
        name: "Leg extension",
        equipment: ["Máquina"],
        technicalDescription:
          "Extiende la rodilla en máquina controlando el recorrido y la pausa final sin perder la posición de la cadera. Mantén tensión continua y regreso controlado.",
        errorsToAvoid: ["Balancear el cuerpo", "Soltar la fase de bajada", "Usar un rango doloroso"],
        primaryMuscles: ["Cuádriceps"],
        secondaryMuscles: ["Flexores cadera"],
        fatigueMap: { quadriceps: 1, hipFlexors: 0.2 },
        variants: [
          {
            id: "leg-extension-variant-bilateral",
            name: "Extensión de rodilla bilateral",
            type: "stance",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante bilateral en máquina para trabajar extensión de rodilla con trayectoria guiada.",
            coachingNotes: "Ajustar el eje de la máquina con la rodilla y controlar la fase excéntrica."
          },
          {
            id: "leg-extension-variant-unilateral",
            name: "Extensión de rodilla unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante unilateral útil para ajustar asimetrías y controlar mejor la carga por pierna.",
            coachingNotes: "Evitar compensar con la pelvis o levantar la cadera del asiento."
          },
          {
            id: "leg-extension-variant-paused",
            name: "Leg extension con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con pausa en extensión para aumentar control y tensión del cuádriceps.",
            coachingNotes: "Pausar sin bloquear agresivamente la rodilla."
          },
          {
            id: "leg-extension-variant-eccentric",
            name: "Leg extension excéntrica",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Máquina"],
            description:
              "Variante con énfasis excéntrico para aumentar el control de la bajada y la demanda del cuádriceps.",
            coachingNotes: "Usar cargas moderadas y mantener una bajada controlada."
          }
        ]
      })
    ]
  },
  {
    slug: "lower-body-accessories-hamstrings",
    pattern: "Lower Body Accessories",
    block: "Hamstring accessories",
    exercises: [
      squatExercise({
        name: "Lying leg curl",
        equipment: ["Máquina"],
        technicalDescription:
          "Flexiona las rodillas en máquina tumbado manteniendo cadera estable. Controla la subida, aprieta en el final y baja sin soltar la carga.",
        errorsToAvoid: ["Levantar la pelvis", "Balancear la carga", "Soltar la bajada"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { hamstrings: 1, calves: 0.2 },
        variants: [
          {
            id: "lying-leg-curl-variant-bilateral",
            name: "Curl femoral tumbado bilateral",
            type: "stance",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante bilateral en máquina para trabajar flexión de rodilla con apoyo en decúbito prono.",
            coachingNotes: "Mantener pelvis apoyada y evitar arquear la zona lumbar."
          },
          {
            id: "lying-leg-curl-variant-unilateral",
            name: "Curl femoral tumbado unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante unilateral para ajustar carga por pierna y detectar asimetrías.",
            coachingNotes: "Evitar rotar la pelvis durante la flexión de rodilla."
          },
          {
            id: "lying-leg-curl-variant-paused",
            name: "Curl femoral tumbado con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con pausa en la flexión para aumentar control y tensión en isquiosurales.",
            coachingNotes: "Pausar sin perder apoyo de pelvis ni compensar con lumbar."
          },
          {
            id: "lying-leg-curl-variant-eccentric",
            name: "Curl femoral tumbado excéntrico",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Máquina"],
            description: "Variante con énfasis en la fase excéntrica para aumentar control y demanda posterior.",
            coachingNotes: "Usar carga que permita controlar toda la bajada."
          }
        ]
      }),
      squatExercise({
        name: "Seated leg curl",
        equipment: ["Máquina"],
        technicalDescription:
          "Flexiona las rodillas sentado con el muslo fijado y control de la pelvis. Mantén tensión continua y evita compensar con el tronco.",
        errorsToAvoid: ["Mover la cadera", "Rebotar al final", "Usar rango parcial sin criterio"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { hamstrings: 1, calves: 0.2 },
        variants: [
          {
            id: "seated-leg-curl-variant-bilateral",
            name: "Curl femoral sentado bilateral",
            type: "stance",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante bilateral sentada para trabajar flexión de rodilla con la cadera flexionada.",
            coachingNotes: "Ajustar respaldo y eje de rodilla antes de cargar."
          },
          {
            id: "seated-leg-curl-variant-unilateral",
            name: "Curl femoral sentado unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante unilateral que permite individualizar carga y controlar asimetrías.",
            coachingNotes: "Mantener pelvis estable y no despegarse del respaldo."
          },
          {
            id: "seated-leg-curl-variant-paused",
            name: "Curl femoral sentado con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con pausa en la flexión para enfatizar control y tensión en isquiosurales.",
            coachingNotes: "No perder posición de cadera durante la pausa."
          },
          {
            id: "seated-leg-curl-variant-eccentric",
            name: "Curl femoral sentado excéntrico",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Máquina"],
            description: "Variante con bajada controlada para aumentar la demanda excéntrica de los isquiosurales.",
            coachingNotes: "Reducir carga si se pierde control de la fase excéntrica."
          }
        ]
      }),
      squatExercise({
        name: "Nordic curl",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Fija los pies y controla el descenso del tronco desde las rodillas. Mantén cadera extendida y usa asistencia si necesitas conservar calidad.",
        errorsToAvoid: ["Flexionar la cadera", "Caer sin control", "Perder alineación tronco-muslo"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Glúteo mayor", "Gemelos", "Estabilizadores lumbares"],
        fatigueMap: { hamstrings: 1, glutes: 0.3, calves: 0.2, lumbarStabilizers: 0.2 },
        variants: [
          {
            id: "nordic-curl-variant-assisted",
            name: "Nordic curl asistido",
            type: "regression",
            difficulty: "basic",
            equipment: ["Peso corporal", "Soporte", "Banda elástica"],
            description: "Regresión del Nordic curl con asistencia para controlar la bajada y facilitar el retorno.",
            coachingNotes: "Usar asistencia suficiente para mantener alineación de cadera y tronco."
          },
          {
            id: "nordic-curl-variant-eccentric",
            name: "Nordic curl excéntrico",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Soporte"],
            description:
              "Variante con énfasis excéntrico, buscando controlar la bajada el mayor tiempo posible.",
            coachingNotes: "No romper la línea hombro-cadera-rodilla durante la bajada."
          },
          {
            id: "nordic-curl-variant-partial",
            name: "Nordic curl parcial",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Soporte"],
            description: "Variante con rango parcial para progresar tolerancia y control antes del rango completo.",
            coachingNotes: "Aumentar el rango solo si se mantiene control técnico."
          },
          {
            id: "nordic-curl-variant-full",
            name: "Nordic curl completo",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Soporte"],
            description: "Variante completa con mayor demanda excéntrica y concéntrica de isquiosurales.",
            coachingNotes: "Reservar para deportistas con buena tolerancia posterior y control lumbo-pélvico."
          }
        ]
      })
    ]
  },
  {
    slug: "lower-body-accessories-glutes",
    pattern: "Lower Body Accessories",
    block: "Glute accessories",
    exercises: [
      squatExercise({
        id: "lower-body-accessories-glutes-cable-kickback",
        name: "Cable kickback",
        equipment: ["Polea"],
        technicalDescription:
          "Extiende la cadera contra polea manteniendo tronco estable y pelvis cuadrada. Mueve desde la cadera sin arquear la lumbar.",
        errorsToAvoid: ["Arquear lumbar", "Rotar la pelvis", "Usar impulso"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Estabilizadores lumbares"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.3, lumbarStabilizers: 0.2 },
        variants: [
          {
            id: "cable-kickback-variant-standing",
            name: "Patada de glúteo en polea de pie",
            type: "stance",
            difficulty: "basic",
            equipment: ["Polea", "Tobillera"],
            description: "Variante de pie para trabajar extensión de cadera con tensión continua.",
            coachingNotes: "Mantener pelvis estable y evitar arquear la zona lumbar."
          },
          {
            id: "cable-kickback-variant-quadruped",
            name: "Patada de glúteo en polea en cuadrupedia",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea", "Tobillera"],
            description:
              "Variante en cuadrupedia que facilita focalizar la extensión de cadera con mayor control de tronco.",
            coachingNotes: "No rotar la pelvis ni perder apoyo de manos y rodillas."
          },
          {
            id: "cable-kickback-variant-straight-leg",
            name: "Patada de glúteo en polea con rodilla extendida",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Polea", "Tobillera"],
            description:
              "Variante con rodilla más extendida que modifica la sensación de trabajo en extensión de cadera.",
            coachingNotes: "Evitar convertirlo en una extensión lumbar."
          },
          {
            id: "cable-kickback-variant-bent-knee",
            name: "Patada de glúteo en polea con rodilla flexionada",
            type: "range",
            difficulty: "basic",
            equipment: ["Polea", "Tobillera"],
            description:
              "Variante con rodilla flexionada para focalizar la extensión de cadera reduciendo la palanca.",
            coachingNotes: "Mantener el movimiento desde la cadera, no desde la espalda."
          }
        ]
      }),
      squatExercise({
        name: "Hip extension machine",
        equipment: ["Máquina"],
        technicalDescription:
          "Extiende la cadera en máquina con pelvis estable y recorrido controlado. Prioriza tensión en gluteo sin compensar con la zona lumbar.",
        errorsToAvoid: ["Hiperextender lumbar", "Perder apoyo de pelvis", "Soltar la vuelta"],
        primaryMuscles: ["Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Estabilizadores lumbares"],
        fatigueMap: { glutes: 1, hamstrings: 0.4, lumbarStabilizers: 0.2 },
        variants: [
          {
            id: "hip-extension-machine-variant-unilateral",
            name: "Extensión de cadera unilateral en máquina",
            type: "stance",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante unilateral guiada para trabajar extensión de cadera con estabilidad externa.",
            coachingNotes: "Ajustar el apoyo para que el movimiento salga de la cadera y no de la zona lumbar."
          },
          {
            id: "hip-extension-machine-variant-straight-leg",
            name: "Extensión de cadera en máquina con rodilla extendida",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con rodilla más extendida que aumenta la palanca y modifica la demanda posterior.",
            coachingNotes: "Usar carga moderada y controlar el rango."
          },
          {
            id: "hip-extension-machine-variant-bent-knee",
            name: "Extensión de cadera en máquina con rodilla flexionada",
            type: "range",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante con rodilla flexionada para reducir palanca y facilitar el control del gesto.",
            coachingNotes: "Evitar compensar con lumbar en la fase final."
          },
          {
            id: "hip-extension-machine-variant-paused",
            name: "Extensión de cadera en máquina con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con pausa en extensión para aumentar control y tensión en glúteo.",
            coachingNotes: "Pausar sin perder posición pélvica."
          }
        ]
      })
    ]
  },
  {
    slug: "lower-body-accessories-abductor-accessories",
    pattern: "Lower Body Accessories",
    block: "Abductor accessories",
    exercises: [
      squatExercise({
        name: "Abducción de cadera en decúbito lateral",
        equipment: ["Peso corporal", "Miniband", "Tobillera"],
        technicalDescription:
          "Ejercicio accesorio para abductores de cadera en decúbito lateral. Elevar la pierna superior manteniendo pelvis estable y controlando tanto la subida como la bajada. Puede progresarse con miniband o tobillera.",
        errorsToAvoid: [
          "Rotar la pelvis",
          "Llevar la pierna hacia delante como flexión de cadera",
          "Usar impulso",
          "Elevar la pierna perdiendo alineación",
          "Arquear la zona lumbar"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Tensor de la fascia lata", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { gluteMed: 0.7, glutes: 0.25, core: 0.15 }
      }),
      squatExercise({
        id: "lower-body-accessories-abductors-monster-walk-miniband",
        name: "Monster walk con miniband",
        equipment: ["Miniband"],
        technicalDescription:
          "Desplazamiento controlado con miniband orientado al trabajo de abductores de cadera, especialmente glúteo medio y glúteo menor. Mantener ligera flexión de cadera y rodilla, pelvis estable y tensión constante en la banda durante los pasos.",
        errorsToAvoid: [
          "juntar los pies y perder tensión en la banda",
          "compensar con inclinación lateral del tronco",
          "rotar excesivamente los pies hacia fuera",
          "colapsar las rodillas hacia dentro",
          "dar pasos demasiado largos perdiendo control",
          "convertirlo en un ejercicio rápido sin control postural"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Cuádriceps", "Core"],
        fatigueMap: { gluteMed: 0.8, glutes: 0.35, quadriceps: 0.2, core: 0.25 }
      }),
      squatExercise({
        name: "Abducción de cadera unilateral de pie en polea baja",
        equipment: ["Polea baja", "Tobillera"],
        technicalDescription:
          "Ejercicio accesorio unilateral para abductores de cadera con carga cuantificable. Separar la pierna lateralmente desde la cadera, manteniendo el tronco estable y controlando la fase excéntrica.",
        errorsToAvoid: [
          "Inclinar el tronco",
          "Rotar la pelvis",
          "Usar demasiada carga",
          "Perder control de la pierna de apoyo",
          "Hacer el movimiento con impulso"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Tensor de la fascia lata", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { gluteMed: 0.8, glutes: 0.25, core: 0.25, quadriceps: 0.1, calves: 0.1 }
      }),
      squatExercise({
        id: "lower-body-accessories-glutes-1",
        name: "Abducción en máquina sentada",
        equipment: ["Máquina"],
        technicalDescription:
          "Ejercicio accesorio para abductores de cadera en máquina. Separar las piernas contra la resistencia manteniendo espalda y pelvis estables, controlando el recorrido completo.",
        errorsToAvoid: [
          "Usar impulso",
          "Despegar la pelvis o la espalda del respaldo",
          "Usar más carga de la que permite controlar",
          "Hacer repeticiones parciales sin control",
          "Perder control en la fase de vuelta"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Tensor de la fascia lata", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { gluteMed: 0.85, glutes: 0.3, core: 0.1 }
      })
    ]
  },
  {
    slug: "lower-body-accessories-adductors",
    pattern: "Lower Body Accessories",
    block: "Adductor accessories",
    exercises: [
      squatExercise({
        id: "lower-body-accessories-adductors-2",
        name: "Aducción isométrica de cadera sentado",
        equipment: ["Bloque de yoga", "Pelota", "Fitball"],
        technicalDescription:
          "Ejercicio accesorio isométrico para aductores de cadera en posición sentada. Colocar un bloque de yoga, pelota o fitball entre las rodillas y realizar una presión controlada hacia la línea media manteniendo pelvis y tronco estables.",
        errorsToAvoid: [
          "Contener la respiración",
          "Redondear la espalda",
          "Inclinar el tronco",
          "Presionar de forma brusca",
          "Perder la posición neutra de pelvis",
          "Generar dolor o molestia excesiva"
        ],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Core / estabilizadores lumbopélvicos", "Glúteo mayor"],
        fatigueMap: { adductors: 0.65, core: 0.15, glutes: 0.1 }
      }),
      squatExercise({
        id: "lower-body-accessories-adductors-3",
        name: "Aducción de cadera en decúbito lateral",
        equipment: ["Bloque de yoga", "Pelota", "Fitball"],
        technicalDescription:
          "Ejercicio accesorio para aductores de cadera en decúbito lateral. Trabajar la aproximación de la pierna hacia la línea media manteniendo la pelvis estable. El bloque de yoga, pelota o fitball puede utilizarse como referencia, apoyo o resistencia ligera según la variante.",
        errorsToAvoid: [
          "Rotar la pelvis",
          "Usar impulso",
          "Flexionar demasiado la cadera",
          "Perder alineación de tronco y pelvis",
          "Buscar más recorrido a costa del control",
          "Arquear la zona lumbar"
        ],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Glúteo mayor", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { adductors: 0.7, glutes: 0.15, core: 0.15 }
      }),
      squatExercise({
        id: "lower-body-accessories-adductors-4",
        name: "Aducción de cadera unilateral de pie en polea baja",
        equipment: ["Polea baja", "Tobillera"],
        technicalDescription:
          "Ejercicio accesorio unilateral para aductores de cadera con carga cuantificable. Llevar la pierna hacia la línea media desde la cadera manteniendo el tronco estable, la pierna de apoyo controlada y la fase excéntrica lenta.",
        errorsToAvoid: [
          "Inclinar el tronco",
          "Rotar la pelvis",
          "Usar demasiada carga",
          "Hacer el movimiento con impulso",
          "Perder control de la pierna de apoyo"
        ],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Core / estabilizadores lumbopélvicos", "Glúteo mayor", "Cuádriceps", "Gemelos"],
        fatigueMap: { adductors: 0.8, core: 0.25, glutes: 0.15, quadriceps: 0.1, calves: 0.1 }
      }),
      squatExercise({
        id: "lower-body-accessories-adductors-1",
        name: "Aducción en máquina sentada",
        equipment: ["Máquina"],
        technicalDescription:
          "Ejercicio accesorio para aductores de cadera en máquina. Aproximar las piernas contra la resistencia manteniendo espalda y pelvis estables, controlando el recorrido completo y la fase de vuelta.",
        errorsToAvoid: [
          "Usar impulso",
          "Despegar la pelvis o la espalda del respaldo",
          "Usar más carga de la que permite controlar",
          "Hacer repeticiones parciales sin control",
          "Perder tensión en la fase excéntrica"
        ],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Core / estabilizadores lumbopélvicos", "Glúteo mayor"],
        fatigueMap: { adductors: 0.85, core: 0.1, glutes: 0.1 }
      })
    ]
  },
  {
    slug: "lower-body-accessories-calf-ankle",
    pattern: "Lower Body Accessories",
    block: "Calf & ankle accessories",
    exercises: [
      squatExercise({
        name: "Standing calf raise",
        equipment: ["Máquina", "Mancuernas"],
        technicalDescription:
          "Eleva talones de pie con rodillas extendidas y control del tobillo. Pausa arriba y baja con rango completo sin perder alineación del pie.",
        errorsToAvoid: ["Rebotar", "Caer hacia el borde del pie", "Acortar el rango"],
        primaryMuscles: ["Gemelos"],
        secondaryMuscles: ["Sóleo"],
        fatigueMap: { calves: 1, soleus: 0.4 },
        variants: [
          {
            id: "standing-calf-raise-variant-machine",
            name: "Elevación de talones de pie en máquina",
            type: "support",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante guiada para trabajar flexión plantar con rodilla extendida.",
            coachingNotes: "Controlar recorrido completo sin rebotar abajo."
          },
          {
            id: "standing-calf-raise-variant-dumbbells",
            name: "Elevación de talones de pie con mancuernas",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuernas"],
            description: "Variante con mancuernas para trabajar gemelos con carga libre.",
            coachingNotes: "Mantener equilibrio y controlar la bajada."
          },
          {
            id: "standing-calf-raise-variant-unilateral",
            name: "Elevación de talones unilateral de pie",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Mancuerna", "Máquina"],
            description: "Variante unilateral para ajustar carga por pierna y aumentar la demanda de control.",
            coachingNotes: "Evitar rotar el tobillo o perder alineación del pie."
          },
          {
            id: "standing-calf-raise-variant-paused-stretch",
            name: "Elevación de talones con pausa abajo",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina", "Mancuernas", "Step"],
            description: "Variante con pausa en posición de estiramiento para aumentar control del rango.",
            coachingNotes: "Pausar sin colapsar el arco del pie."
          }
        ]
      }),
      squatExercise({
        name: "Seated calf raise",
        equipment: ["Máquina"],
        technicalDescription:
          "Eleva talones sentado con control, buscando tensión en sóleo y recorrido completo. Mantén pausa arriba y bajada estable.",
        errorsToAvoid: ["Rebotar abajo", "Usar recorrido parcial", "Perder apoyo del antepié"],
        primaryMuscles: ["Sóleo"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { soleus: 1, calves: 0.6 },
        variants: [
          {
            id: "seated-calf-raise-variant-machine",
            name: "Elevación de talones sentado en máquina",
            type: "support",
            difficulty: "basic",
            equipment: ["Máquina"],
            description: "Variante sentada para trabajar flexión plantar con rodilla flexionada.",
            coachingNotes: "Controlar el rango completo y evitar rebotes."
          },
          {
            id: "seated-calf-raise-variant-dumbbell",
            name: "Elevación de talones sentado con mancuerna",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuerna", "Banco"],
            description:
              "Variante con mancuerna apoyada sobre la rodilla para trabajar flexión plantar en sedestación.",
            coachingNotes: "Proteger la rodilla y mantener control del recorrido."
          },
          {
            id: "seated-calf-raise-variant-unilateral",
            name: "Elevación de talones sentado unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Máquina", "Mancuerna", "Banco"],
            description: "Variante unilateral para ajustar la carga por lado y controlar asimetrías.",
            coachingNotes: "Mantener el pie estable y controlar la fase excéntrica."
          },
          {
            id: "seated-calf-raise-variant-paused",
            name: "Elevación de talones sentado con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina", "Mancuerna", "Banco"],
            description: "Variante con pausa arriba o abajo para mejorar control del recorrido.",
            coachingNotes: "Evitar rebotes y mantener tensión continua."
          }
        ]
      }),
      squatExercise({
        name: "Tibialis raise",
        equipment: ["Peso corporal", "Máquina"],
        technicalDescription:
          "Eleva la punta del pie contra gravedad o máquina manteniendo talón estable. Controla la subida y la bajada sin compensar con cadera.",
        errorsToAvoid: ["Mover todo el cuerpo", "Usar impulso", "Acortar el rango"],
        primaryMuscles: ["Tibial anterior"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { tibialisAnterior: 1, calves: 0.1 },
        variants: [
          {
            id: "tibialis-raise-variant-wall",
            name: "Tibialis raise en pared",
            type: "support",
            difficulty: "basic",
            equipment: ["Peso corporal", "Pared"],
            description: "Variante apoyada en pared para trabajar dorsiflexión con carga corporal ajustable.",
            coachingNotes: "Alejar más los pies solo si se mantiene control del recorrido."
          },
          {
            id: "tibialis-raise-variant-machine",
            name: "Tibialis raise en máquina",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante en máquina para trabajar dorsiflexión con carga externa controlada.",
            coachingNotes: "Evitar compensar con movimiento de rodilla o cadera."
          },
          {
            id: "tibialis-raise-variant-band",
            name: "Dorsiflexión resistida con banda",
            type: "material",
            difficulty: "basic",
            equipment: ["Banda elástica"],
            description: "Variante con banda elástica para trabajar dorsiflexores con resistencia progresiva.",
            coachingNotes: "Controlar la vuelta y mantener el tobillo alineado."
          },
          {
            id: "tibialis-raise-variant-unilateral",
            name: "Tibialis raise unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Pared", "Máquina", "Banda elástica"],
            description: "Variante unilateral para ajustar carga por lado y detectar asimetrías.",
            coachingNotes: "Mantener rango completo sin rotar el pie."
          }
        ]
      })
    ]
  },
  {
    slug: "olympic-derivatives-power",
    pattern: "Olympic derivatives",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Jump shrug desde hang",
        equipment: ["Barra"],
        technicalDescription:
          "Desde posición hang, realiza una triple extensión explosiva y termina con un encogimiento alto sin recepción. Mantén la barra cerca, brazos largos hasta la extensión y control del apoyo.",
        errorsToAvoid: ["Tirar con brazos demasiado pronto", "Alejar la barra", "No terminar la extensión"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Cuádriceps", "Trapecio"],
        secondaryMuscles: ["Gemelos", "Erectores espinales", "Core", "Antebrazos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.6, calves: 0.4, spinalErectors: 0.4, core: 0.3, forearms: 0.2 }
      }),
      squatExercise({
        name: "Hang clean pull",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, tira de la barra con extensión potente de cadera, rodilla y tobillo sin recibirla. Mantén trayectoria vertical cercana y hombros sobre la barra antes de acelerar.",
        errorsToAvoid: ["Iniciar con brazos", "Golpear la barra hacia delante", "Perder posición del tronco"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Cuádriceps", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.7, spinalErectors: 0.4, core: 0.3, calves: 0.4, forearms: 0.3, upperBack: 0.4 }
      }),
      squatExercise({
        name: "Hang high pull",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, acelera la barra con triple extensión y continúa el tirón alto manteniendo codos arriba y fuera. La barra debe viajar cerca del cuerpo sin perder equilibrio.",
        errorsToAvoid: ["Remar antes de extender", "Bajar codos", "Alejar la barra"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Cuádriceps", "Trapecio", "Upper back"],
        secondaryMuscles: ["Gemelos", "Erectores espinales", "Core", "Antebrazos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.8, upperBack: 0.6, calves: 0.4, spinalErectors: 0.4, core: 0.3, forearms: 0.3 }
      }),
      squatExercise({
        name: "Clean pull desde suelo",
        equipment: ["Barra"],
        technicalDescription:
          "Tira desde el suelo pasando por rodilla con control y acelera hacia una extensión completa. Mantén la barra cerca, espalda firme y transición fluida al segundo tirón.",
        errorsToAvoid: ["Subir la cadera demasiado pronto", "Rodear la rodilla con la barra", "Perder la espalda neutra"],
        primaryMuscles: ["Glúteo mayor", "Isquios", "Cuádriceps", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, quadriceps: 0.8, traps: 0.7, spinalErectors: 0.5, core: 0.4, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Hang muscle clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, extiende potente y recibe la barra en rack sin caída profunda. Mantén la barra cerca, codos rápidos y postura estable al finalizar.",
        errorsToAvoid: ["Recibir con codos bajos", "Separar la barra", "Convertirlo en curl"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Trapecio", "Upper back"],
        secondaryMuscles: ["Isquios", "Erectores espinales", "Core", "Antebrazos", "Gemelos"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, traps: 0.7, upperBack: 0.5, hamstrings: 0.6, spinalErectors: 0.4, core: 0.4, forearms: 0.3, calves: 0.3 }
      }),
      squatExercise({
        name: "Hang power clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, realiza triple extensión y recibe la barra en posición power con codos rápidos. Mantén recepción estable, pies activos y barra cercana.",
        errorsToAvoid: ["Saltar hacia delante", "Recibir con codos lentos", "Perder rigidez del tronco"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        variants: [
          {
            id: "hang-power-clean-variant-low-hang",
            name: "Low hang power clean",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante desde posición baja del hang, aumentando la demanda de control de cadera y trayectoria de la barra.",
            coachingNotes: "Evitar perder la espalda alta o alejar la barra."
          },
          {
            id: "hang-power-clean-variant-hip",
            name: "Hip power clean",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante desde la cadera que reduce recorrido y enfatiza la extensión final.",
            coachingNotes: "Buscar extensión rápida y recepción alta estable."
          },
          {
            id: "hang-power-clean-variant-split",
            name: "Hang power clean split",
            type: "reception",
            difficulty: "advanced",
            equipment: ["Barra"],
            description: "Variante con recepción en split stance para aumentar la demanda coordinativa y asimétrica.",
            coachingNotes: "No usar si el deportista aún no controla la recepción bilateral."
          },
          {
            id: "hang-power-clean-variant-kettlebell-unilateral",
            name: "Hang power clean unilateral con kettlebell",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Kettlebell"],
            description:
              "Variante unilateral con kettlebell desde hang, útil para trabajar potencia con menor complejidad que la barra.",
            coachingNotes: "Controlar la recepción de la kettlebell y evitar compensaciones del tronco."
          }
        ],
        fatigueMap: { glutes: 0.9, quadriceps: 0.8, hamstrings: 0.7, traps: 0.7, spinalErectors: 0.5, core: 0.4, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Power clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, acelera la barra y recibela en posición power. Coordina salida, transición por rodilla, segundo tirón y recepción estable con codos altos.",
        errorsToAvoid: ["Tirar temprano con brazos", "Recibir bajo o inestable", "Alejar la barra"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        variants: [
          {
            id: "power-clean-variant-low-hang-power-clean",
            name: "Low hang power clean",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Power clean iniciado desde posición baja del hang, manteniendo recepción alta y mayor demanda de control de la trayectoria.",
            coachingNotes: "Mantener tensión en isquiosurales y espalda alta antes de iniciar el tirón."
          },
          {
            id: "power-clean-variant-hip-power-clean",
            name: "Hip power clean",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Power clean iniciado desde la cadera para enfatizar la extensión final, la velocidad de tirón y la recepción alta.",
            coachingNotes: "No anticipar la flexión de brazos antes de completar la extensión."
          },
          {
            id: "power-clean-variant-hang-power-clean-split",
            name: "Hang power clean split",
            type: "reception",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante desde hang con recepción en split, útil para trabajar velocidad bajo la barra y control asimétrico.",
            coachingNotes: "Mantener una recepción estable y recuperar los pies con control."
          },
          {
            id: "power-clean-variant-unilateral-box-kettlebell",
            name: "Hang power clean unilateral al cajón con kettlebell",
            type: "support",
            difficulty: "advanced",
            equipment: ["Kettlebell", "Cajón"],
            description:
              "Variante unilateral con apoyo en cajón que combina extensión de cadera, coordinación unilateral y recepción controlada.",
            coachingNotes: "Evitar que el cajón provoque pérdida de alineación de rodilla y cadera."
          },
          {
            id: "power-clean-variant-unilateral-box-dumbbell",
            name: "Hang power clean unilateral al cajón con mancuerna",
            type: "support",
            difficulty: "advanced",
            equipment: ["Mancuerna", "Cajón"],
            description: "Variante unilateral con mancuerna y apoyo en cajón, orientada a potencia unilateral y coordinación global.",
            coachingNotes: "Usar cargas moderadas y priorizar velocidad limpia sobre carga."
          }
        ],
        fatigueMap: { glutes: 0.9, hamstrings: 0.7, quadriceps: 0.8, traps: 0.7, spinalErectors: 0.5, calves: 0.4, core: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, tira y recibe la barra en una sentadilla frontal más profunda. Mantén trayectoria cercana, codos rápidos y estabilidad en la recepción.",
        errorsToAvoid: ["Colapsar en la recepción", "Perder codos altos", "Separar la barra del cuerpo"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        variants: [
          {
            id: "clean-variant-hang-clean",
            name: "Hang clean",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Variante de clean iniciada desde posición de hang, reduciendo la complejidad de la salida desde el suelo y centrando el trabajo en la extensión potente y la recepción.",
            coachingNotes: "Mantener la barra cerca del cuerpo y no tirar con brazos antes de completar la extensión."
          },
          {
            id: "clean-variant-low-hang-clean",
            name: "Low hang clean",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante iniciada desde una posición baja del hang, con mayor demanda de control postural, trayectoria de barra y tensión de cadena posterior.",
            coachingNotes: "No bajar más de lo que permita mantener columna neutra y barra cercana."
          },
          {
            id: "clean-variant-hip-clean",
            name: "Hip clean",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante iniciada desde la cadera para enfatizar la extensión final y la velocidad bajo la barra.",
            coachingNotes:
              "Evitar convertirlo en un tirón de brazos; la intención debe venir de la extensión de cadera."
          },
          {
            id: "clean-variant-split-clean",
            name: "Split clean",
            type: "reception",
            difficulty: "advanced",
            equipment: ["Barra"],
            description: "Variante de clean con recepción en split stance, aumentando la demanda coordinativa y el control asimétrico.",
            coachingNotes: "Priorizar una recepción estable antes de aumentar carga."
          },
          {
            id: "clean-variant-kettlebell-clean-unilateral",
            name: "Clean unilateral con kettlebell",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Kettlebell"],
            description:
              "Variante unilateral con kettlebell que permite trabajar triple extensión, recepción unilateral y coordinación con menor carga absoluta.",
            coachingNotes: "Evitar golpear la kettlebell contra el antebrazo y mantener control del tronco."
          },
          {
            id: "clean-variant-kettlebell-clean-tandem",
            name: "Clean unilateral tándem con kettlebell",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Kettlebell"],
            description: "Variante unilateral en posición tándem con mayor demanda de estabilidad, control frontal y coordinación.",
            coachingNotes: "Usar cargas bajas y mantener alineación de pelvis y tronco."
          }
        ],
        fatigueMap: { glutes: 0.9, quadriceps: 0.9, hamstrings: 0.7, traps: 0.7, spinalErectors: 0.5, core: 0.5, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        id: "olympic-derivatives-power-muscle-snatch",
        name: "Muscle snatch",
        equipment: ["Barra"],
        technicalDescription:
          "Derivado olímpico de arrancada orientado a la extensión potente de cadera, rodilla y tobillo y al tirón vertical hasta una recepción alta sin profundidad de sentadilla. Priorizar trayectoria cercana de la barra, extensión completa y control overhead.",
        errorsToAvoid: [
          "tirar con los brazos demasiado pronto",
          "alejar la barra del cuerpo",
          "no completar la extensión de cadera",
          "recibir con hombros inestables",
          "arquear la zona lumbar en la posición overhead",
          "usar demasiada carga para el nivel técnico"
        ],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Deltoides"],
        secondaryMuscles: ["Isquiosurales", "Gemelos", "Trapecio", "Core", "Manguito rotador"],
        fatigueMap: { glutes: 0.45, quadriceps: 0.4, hamstrings: 0.3, calves: 0.25, shoulders: 0.4, upperBack: 0.3, traps: 0.3, rotatorCuff: 0.2, core: 0.25 }
      }),
      squatExercise({
        name: "Hang power snatch",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, realiza triple extensión y recibe la barra por encima de la cabeza en posición power. Mantén trayectoria cercana, bloqueo estable y control overhead.",
        errorsToAvoid: ["Recibir con hombros inestables", "Alejar la barra", "Perder velocidad bajo la barra"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquios", "Trapecio", "Upper back"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos"],
        variants: [
          {
            id: "hang-power-snatch-variant-low-hang",
            name: "Low hang power snatch",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Barra"],
            description: "Variante desde posición baja del hang, con mayor demanda de control de bisagra y trayectoria.",
            coachingNotes: "Mantener la barra cerca y recibir con hombros activos."
          },
          {
            id: "hang-power-snatch-variant-hip",
            name: "Hip power snatch",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante desde la cadera para enfatizar extensión final y velocidad overhead.",
            coachingNotes: "No compensar con hiperextensión lumbar al recibir."
          },
          {
            id: "hang-power-snatch-variant-split",
            name: "Hang power snatch split",
            type: "reception",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con recepción en split, útil para trabajar coordinación avanzada y estabilidad overhead asimétrica.",
            coachingNotes: "Priorizar estabilidad de recepción antes de aumentar carga."
          },
          {
            id: "hang-power-snatch-variant-landmine-unilateral",
            name: "Hang snatch unilateral con landmine",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description:
              "Variante unilateral con landmine desde hang, reduciendo la exigencia técnica de la barra y manteniendo intención potente.",
            coachingNotes: "Controlar que la carga no desplace el tronco lateralmente."
          }
        ],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, hamstrings: 0.7, traps: 0.8, upperBack: 0.7, spinalErectors: 0.4, core: 0.5, calves: 0.4, forearms: 0.3 }
      }),
      squatExercise({
        name: "Power snatch",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, acelera la barra y recibela por encima de la cabeza en posición power. Coordina salida, tirón y recepción overhead estable.",
        errorsToAvoid: ["Perder la barra hacia delante", "Recibir sin bloqueo estable", "Romper la posición de espalda en la salida"],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquios", "Trapecio", "Upper back"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos"],
        variants: [
          {
            id: "power-snatch-variant-low-hang-power-snatch",
            name: "Low hang power snatch",
            type: "start_position",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Power snatch iniciado desde posición baja del hang, con recepción alta y mayor demanda técnica de trayectoria.",
            coachingNotes: "Mantener la barra cerca y no perder estabilidad overhead."
          },
          {
            id: "power-snatch-variant-hip-power-snatch",
            name: "Hip power snatch",
            type: "start_position",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Power snatch iniciado desde la cadera, enfatizando extensión final, tirón vertical y recepción overhead alta.",
            coachingNotes: "Priorizar velocidad y control overhead sobre carga."
          },
          {
            id: "power-snatch-variant-power-snatch-split",
            name: "Power snatch split",
            type: "reception",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con recepción en split stance, aumentando la complejidad coordinativa y la estabilidad overhead asimétrica.",
            coachingNotes: "Usar solo con deportistas que controlen bien la recepción overhead."
          },
          {
            id: "power-snatch-variant-landmine-snatch-unilateral",
            name: "Snatch unilateral con landmine",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description:
              "Variante unilateral con landmine que simplifica la trayectoria overhead y permite trabajar potencia diagonal/unilateral.",
            coachingNotes: "Mantener control de tronco y evitar empujar la carga solo con el brazo."
          },
          {
            id: "power-snatch-variant-landmine-switch-snatch",
            name: "Switch snatch con landmine",
            type: "complex",
            difficulty: "advanced",
            equipment: ["Landmine"],
            description: "Variante dinámica con cambio de lado en landmine, orientada a potencia, coordinación y control global.",
            coachingNotes: "Usar cargas bajas y controlar la transición entre lados."
          }
        ],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, hamstrings: 0.7, traps: 0.8, upperBack: 0.7, spinalErectors: 0.5, core: 0.5, calves: 0.4, forearms: 0.3 }
      }),
      squatExercise({
        id: "olympic-derivatives-power-push-jerk",
        name: "Push jerk",
        equipment: ["Barra"],
        technicalDescription:
          "Derivado olímpico de empuje vertical en el que se utiliza un dip-drive de piernas para impulsar la barra y recibirla sobre la cabeza con flexión parcial de rodillas. Trabaja transferencia de fuerza desde tren inferior hacia overhead y estabilidad en recepción.",
        errorsToAvoid: [
          "hacer el dip demasiado profundo",
          "perder verticalidad del tronco",
          "empujar la barra hacia delante",
          "no bloquear de forma estable sobre la cabeza",
          "recibir con rodillas colapsadas",
          "perder control de core y costillas"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Deltoides"],
        secondaryMuscles: ["Gemelos", "Tríceps", "Trapecio", "Core", "Manguito rotador"],
        variants: [
          {
            id: "push-jerk-variant-push-press",
            name: "Push press",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Barra", "Mancuernas"],
            description:
              "Variante sin recepción baja marcada, útil como paso previo para aprender el dip-drive y la transferencia de piernas al empuje overhead.",
            coachingNotes: "Mantener dip vertical y bloqueo overhead estable."
          },
          {
            id: "push-jerk-variant-unilateral-push-press",
            name: "Push press unilateral",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Kettlebell"],
            description:
              "Variante unilateral que permite trabajar transferencia de piernas a empuje overhead con menor carga absoluta y mayor demanda de control.",
            coachingNotes: "Evitar inclinación lateral del tronco durante el drive."
          },
          {
            id: "push-jerk-variant-landmine-push-press",
            name: "Landmine push press",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description: "Variante con landmine que orienta el empuje en trayectoria diagonal y reduce la exigencia overhead pura.",
            coachingNotes: "Mantener control de costillas y no empujar solo con el brazo."
          },
          {
            id: "push-jerk-variant-clean-push-press-kettlebell",
            name: "Clean + push press unilateral con kettlebell",
            type: "complex",
            difficulty: "advanced",
            equipment: ["Kettlebell"],
            description:
              "Complejo unilateral que combina clean y push press con kettlebell, útil para potencia global, coordinación y transferencia.",
            coachingNotes: "Separar claramente recepción del clean y drive del push press."
          }
        ],
        fatigueMap: { quadriceps: 0.45, glutes: 0.35, calves: 0.25, shoulders: 0.45, triceps: 0.25, upperBack: 0.25, traps: 0.25, rotatorCuff: 0.25, core: 0.3 }
      }),
      squatExercise({
        id: "olympic-derivatives-power-split-jerk",
        name: "Split jerk",
        equipment: ["Barra"],
        technicalDescription:
          "Derivado olímpico de empuje vertical con recepción en split stance. Utiliza el impulso de piernas para elevar la barra y una recepción asimétrica para estabilizarla sobre la cabeza. Requiere coordinación, velocidad bajo la barra, control del split y estabilidad overhead.",
        errorsToAvoid: [
          "separar poco los pies en la recepción",
          "recibir con el peso mal repartido",
          "perder la línea de la barra sobre el centro de masas",
          "colapsar la rodilla adelantada",
          "arquear la zona lumbar",
          "recuperar los pies sin control"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Deltoides"],
        secondaryMuscles: ["Isquiosurales", "Gemelos", "Tríceps", "Glúteo medio", "Core", "Manguito rotador"],
        variants: [
          {
            id: "split-jerk-variant-asymmetric-start",
            name: "Split jerk con inicio asimétrico",
            type: "stance",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante con inicio asimétrico para aumentar la demanda de control del split y la coordinación de la recepción.",
            coachingNotes: "Usar solo si el split jerk básico ya es estable."
          },
          {
            id: "split-jerk-variant-behind-neck",
            name: "Split jerk tras nuca",
            type: "support",
            difficulty: "advanced",
            equipment: ["Barra"],
            description:
              "Variante iniciada desde posición tras nuca, reduciendo la interferencia del rack frontal pero aumentando la exigencia de movilidad y estabilidad.",
            coachingNotes: "Evitar si hay molestias de hombro o limitaciones overhead."
          },
          {
            id: "split-jerk-variant-power-jerk",
            name: "Power jerk",
            type: "reception",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Variante con recepción bilateral parcial, útil como alternativa al split para trabajar drive vertical y recepción overhead.",
            coachingNotes: "Mantener pies paralelos y rodillas alineadas en la recepción."
          }
        ],
        fatigueMap: { quadriceps: 0.45, glutes: 0.4, hamstrings: 0.25, calves: 0.25, gluteMed: 0.25, shoulders: 0.45, triceps: 0.25, rotatorCuff: 0.25, core: 0.3 }
      })
    ]
  },
  {
    slug: "speed-agility-skills-acceleration-linear-speed",
    pattern: "Speed & Agility Skills",
    block: "Acceleration / Linear Speed",
    exercises: [
      squatExercise({
        id: "speed-agility-skills-acceleration-linear-5-10m",
        name: "Aceleración lineal 5-10 m",
        equipment: ["Campo", "Pista"],
        technicalDescription:
          "Ejercicio de aceleración corta orientado a mejorar la salida, la inclinación del cuerpo, la aplicación horizontal de fuerza y la frecuencia inicial de apoyos en distancias de 5 a 10 metros.",
        errorsToAvoid: [
          "Salir demasiado erguido",
          "Dar pasos demasiado largos al inicio",
          "Apoyar el pie muy por delante del centro de masas",
          "Perder tensión de tronco",
          "Frenar antes de completar la distancia",
          "Mirar al suelo en exceso"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Isquiosurales"],
        secondaryMuscles: ["Gemelos", "Core", "Flexores de cadera"],
        fatigueMap: { quadriceps: 0.5, glutes: 0.5, hamstrings: 0.4, calves: 0.35, hipFlexors: 0.25, core: 0.2 }
      }),
      squatExercise({
        id: "speed-agility-skills-linear-sprint-20-30m",
        name: "Sprint lineal 20-30 m",
        equipment: ["Campo", "Pista"],
        technicalDescription:
          "Sprint lineal de 20 a 30 metros orientado a trabajar aceleración prolongada y transición hacia mayor velocidad. Mantener técnica de carrera eficiente, postura progresivamente más alta y aplicación de fuerza coordinada.",
        errorsToAvoid: [
          "Salir sin intención máxima",
          "Perder coordinación de brazos",
          "Talonear por delante del cuerpo",
          "Tensar hombros y cuello",
          "Acortar en exceso la zancada",
          "Desacelerar antes de terminar"
        ],
        primaryMuscles: ["Glúteo mayor", "Isquiosurales", "Cuádriceps"],
        secondaryMuscles: ["Gemelos", "Flexores de cadera", "Core"],
        fatigueMap: { glutes: 0.5, hamstrings: 0.45, quadriceps: 0.45, calves: 0.4, hipFlexors: 0.25, core: 0.2 }
      })
    ]
  },
  {
    slug: "speed-agility-skills-deceleration-change-direction",
    pattern: "Speed & Agility Skills",
    block: "Deceleration / Change of Direction",
    exercises: [
      squatExercise({
        id: "speed-agility-skills-acceleration-deceleration-5-10m",
        name: "Aceleración + frenada 5-10 m",
        equipment: ["Campo", "Pista", "Conos"],
        technicalDescription:
          "Ejercicio de aceleración corta seguida de frenada controlada. Acelerar entre 5 y 10 metros y detenerse en el menor espacio posible manteniendo buena alineación de cadera, rodilla y pie.",
        errorsToAvoid: [
          "Frenar con el tronco demasiado erguido",
          "Colapsar rodillas hacia dentro",
          "Apoyar muy estrecho",
          "Perder equilibrio al detenerse",
          "Usar demasiados pasos de frenada sin control",
          "Mirar al suelo todo el tiempo"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor"],
        secondaryMuscles: ["Isquiosurales", "Gemelos", "Aductores", "Glúteo medio", "Core"],
        fatigueMap: { quadriceps: 0.65, glutes: 0.55, hamstrings: 0.3, calves: 0.35, adductors: 0.2, gluteMed: 0.25, core: 0.25 }
      }),
      squatExercise({
        id: "speed-agility-skills-sprint-change-direction",
        name: "Sprint con cambio de dirección",
        equipment: ["Campo", "Pista", "Conos"],
        technicalDescription:
          "Sprint con frenada, cambio de dirección y nueva aceleración. Trabaja la capacidad de desacelerar, reorientar el cuerpo y aplicar fuerza en una nueva dirección.",
        errorsToAvoid: [
          "Llegar demasiado alto al cambio de dirección",
          "Colapsar la rodilla de apoyo",
          "Girar solo con el tronco",
          "Apoyar el pie demasiado lejos del cuerpo",
          "Perder el control de la cadera",
          "Reiniciar la aceleración sin estabilidad"
        ],
        primaryMuscles: ["Glúteo mayor", "Cuádriceps", "Isquiosurales"],
        secondaryMuscles: ["Glúteo medio", "Aductores", "Gemelos", "Core"],
        fatigueMap: { glutes: 0.55, quadriceps: 0.55, hamstrings: 0.35, calves: 0.35, gluteMed: 0.3, adductors: 0.3, core: 0.3 }
      })
    ]
  },
  {
    slug: "speed-agility-skills-footwork-coordination",
    pattern: "Speed & Agility Skills",
    block: "Footwork / Coordination",
    exercises: [
      squatExercise({
        id: "speed-agility-skills-ladder-front-in-out",
        name: "Escalera de agilidad: apoyos frontales dentro-fuera",
        equipment: ["Escalera de agilidad"],
        technicalDescription:
          "Ejercicio de coordinación de pies con escalera de agilidad. Realizar apoyos frontales dentro y fuera de los espacios manteniendo ritmo, control postural y precisión de pisada. Variantes: 1 dentro-fuera, 2 dentro-fuera, 2 dentro y 2 fuera, skipping frontal.",
        errorsToAvoid: [
          "Mirar solo al suelo",
          "Perder ritmo de brazos",
          "Pisar la escalera continuamente",
          "Elevar demasiado el centro de masas",
          "Moverse rápido sin precisión",
          "Bloquear la respiración"
        ],
        primaryMuscles: ["Gemelos", "Cuádriceps"],
        secondaryMuscles: ["Flexores de cadera", "Core", "Tibial anterior"],
        fatigueMap: { calves: 0.35, quadriceps: 0.3, hipFlexors: 0.25, tibialisAnterior: 0.2, core: 0.15 }
      }),
      squatExercise({
        id: "speed-agility-skills-ladder-lateral-in-out",
        name: "Escalera de agilidad: apoyos laterales dentro-fuera",
        equipment: ["Escalera de agilidad"],
        technicalDescription:
          "Ejercicio de coordinación lateral con escalera de agilidad. Realizar apoyos dentro-fuera en desplazamiento lateral manteniendo cadera baja, control de rodilla y ritmo de pies. Variantes: lateral 2 dentro-fuera, lateral dentro-fuera, skipping lateral, apoyos laterales alternos.",
        errorsToAvoid: [
          "Cruzar pies sin intención",
          "Perder orientación lateral",
          "Colapsar rodillas",
          "Subir demasiado el centro de masas",
          "Perder ritmo de brazos",
          "Sacrificar precisión por velocidad"
        ],
        primaryMuscles: ["Gemelos", "Cuádriceps", "Glúteo medio"],
        secondaryMuscles: ["Aductores", "Core", "Glúteo mayor"],
        fatigueMap: { calves: 0.35, quadriceps: 0.3, gluteMed: 0.3, adductors: 0.2, glutes: 0.2, core: 0.2 }
      }),
      squatExercise({
        id: "speed-agility-skills-ladder-cross-rotation",
        name: "Escalera de agilidad: cruces y rotaciones",
        equipment: ["Escalera de agilidad"],
        technicalDescription:
          "Ejercicio de coordinación con patrones cruzados y rotaciones sobre escalera de agilidad. Trabaja orientación corporal, disociación cadera-tronco y control de apoyos en patrones no lineales. Variantes: cruces laterales, cruce trasero, doble apoyo con rotación, 2 dentro y 2 fuera cruzando.",
        errorsToAvoid: [
          "Rotar sin controlar la pelvis",
          "Cruzar los pies perdiendo equilibrio",
          "Mirar solo al suelo",
          "Perder coordinación de brazos",
          "Acelerar sin precisión",
          "Bloquear la cadera"
        ],
        primaryMuscles: ["Cuádriceps", "Gemelos", "Core"],
        secondaryMuscles: ["Glúteo medio", "Aductores", "Glúteo mayor"],
        fatigueMap: { quadriceps: 0.3, calves: 0.3, core: 0.3, gluteMed: 0.25, adductors: 0.2, glutes: 0.2 }
      }),
      squatExercise({
        id: "speed-agility-skills-ladder-pogos-jumps",
        name: "Escalera de agilidad: pogos y saltos",
        equipment: ["Escalera de agilidad"],
        technicalDescription:
          "Ejercicio de coordinación y reactividad de pies con pequeños saltos, pogos y entradas/salidas sobre escalera. Priorizar contactos rápidos, alineación de tobillo-rodilla-cadera y control del aterrizaje. Variantes: pogos dentro-fuera, pogos cruzados, salto bipodal dentro-fuera, salto unilateral dentro-fuera.",
        errorsToAvoid: [
          "Contactos largos y pesados",
          "Hundirse en cada apoyo",
          "Colapsar rodillas",
          "Perder rigidez activa del tobillo",
          "Saltar demasiado alto",
          "Perder ritmo"
        ],
        primaryMuscles: ["Gemelos", "Cuádriceps"],
        secondaryMuscles: ["Glúteo mayor", "Glúteo medio", "Core", "Tibial anterior"],
        fatigueMap: { calves: 0.45, quadriceps: 0.35, glutes: 0.25, gluteMed: 0.2, tibialisAnterior: 0.2, core: 0.2 }
      })
    ]
  },
  {
    slug: "speed-agility-skills-reactive-agility",
    pattern: "Speed & Agility Skills",
    block: "Reactive Agility",
    exercises: [
      squatExercise({
        id: "speed-agility-skills-reactive-four-colors",
        name: "Agilidad 4 colores",
        equipment: ["Conos", "Luces", "Tarjetas de colores"],
        technicalDescription:
          "Ejercicio de agilidad reactiva basado en estímulos visuales. El deportista debe reaccionar a una señal de color y desplazarse hacia el cono o zona correspondiente, priorizando percepción, decisión, primer apoyo y control de frenada.",
        errorsToAvoid: [
          "Anticipar la señal",
          "Moverse antes del estímulo",
          "Perder postura al reaccionar",
          "Frenar sin control",
          "Mirar al suelo en vez de al estímulo",
          "No recuperar posición inicial"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteo mayor", "Gemelos"],
        secondaryMuscles: ["Glúteo medio", "Aductores", "Isquiosurales", "Core"],
        fatigueMap: { quadriceps: 0.45, glutes: 0.45, calves: 0.35, gluteMed: 0.3, adductors: 0.25, hamstrings: 0.25, core: 0.3 }
      })
    ]
  },
  {
    slug: "gait-carry-gait-reeducation",
    pattern: "Gait & Carry",
    block: "Reeducación de la marcha",
    exercises: [
      squatExercise({
        name: "Talon-punta con pasos normales",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Camina apoyando talón y transicionando hacia la punta con pasos naturales. Mantén ritmo estable, mirada al frente y apoyo controlado en cada pisada.",
        errorsToAvoid: ["Arrastrar los pies", "Perder equilibrio", "Acelerar sin controlar el apoyo"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Glúteo medio", "Core", "Cuádriceps"],
        fatigueMap: { calves: 0.4, glutes: 0.2, core: 0.2, quadriceps: 0.2 }
      }),
      squatExercise({
        name: "Talon-punta con pasos largos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza pasos largos manteniendo la secuencia talón-punta y controlando la pelvis. Debe verse una zancada amplia sin perder postura ni apoyo del pie.",
        errorsToAvoid: ["Sobrepasar la zancada perdiendo control", "Colapsar la rodilla", "Inclinar el tronco en exceso"],
        primaryMuscles: ["Gemelos", "Glúteo mayor"],
        secondaryMuscles: ["Isquios", "Cuádriceps", "Core"],
        fatigueMap: { calves: 0.5, glutes: 0.4, hamstrings: 0.3, quadriceps: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Talon-punta con pasos cortos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Camina con pasos cortos y precisos manteniendo la transición talón-punta. Busca control, simetría y ritmo constante sin bloquear rodillas.",
        errorsToAvoid: ["Dar pasos rigidos", "Mirar continuamente al suelo", "Perder la secuencia de apoyo"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Core", "Glúteo medio"],
        fatigueMap: { calves: 0.4, core: 0.2, glutes: 0.2, quadriceps: 0.1 }
      }),
      squatExercise({
        name: "Talon-punta con pasos lentos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Avanza lentamente exagerando el control de cada fase del apoyo. Mantén equilibrio, respiración tranquila y transición limpia desde talón hasta punta.",
        errorsToAvoid: ["Caer sobre el pie", "Compensar con balanceo de tronco", "Perder control al despegar"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Core", "Glúteo medio", "Cuádriceps"],
        fatigueMap: { calves: 0.5, core: 0.3, glutes: 0.3, quadriceps: 0.2 }
      })
    ]
  },
  {
    slug: "gait-carry-strength",
    pattern: "Gait & Carry",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Farmer hold",
        equipment: ["Mancuernas", "Kettlebells"],
        technicalDescription:
          "Sostén carga a ambos lados con postura alta, hombros estables y agarre firme. Mantén costillas controladas y pies apoyados sin balancearte.",
        errorsToAvoid: ["Encoger hombros sin control", "Arquear la zona lumbar", "Perder simetría de carga"],
        primaryMuscles: ["Antebrazos", "Trapecio"],
        secondaryMuscles: ["Core", "Upper back", "Glúteos"],
        fatigueMap: { forearms: 1, traps: 0.8, core: 0.6, upperBack: 0.5, glutes: 0.2 }
      }),
      squatExercise({
        name: "Suitcase hold",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sostén una carga a un lado manteniendo tronco vertical y pelvis nivelada. Debe verse resistencia a la inclinación lateral sin compensar con el hombro.",
        errorsToAvoid: ["Inclinarse hacia la carga", "Elevar un hombro", "Rotar el tronco"],
        primaryMuscles: ["Oblicuos", "Antebrazos"],
        secondaryMuscles: ["Trapecio", "Core", "Glúteos"],
        fatigueMap: { core: 0.9, obliques: 1, forearms: 0.9, traps: 0.6, glutes: 0.2 }
      }),
      squatExercise({
        name: "Farmer carry",
        equipment: ["Mancuernas", "Kettlebells"],
        technicalDescription:
          "Camina con carga bilateral manteniendo postura alta, pasos regulares y agarre firme. La carga no debe alterar el ritmo ni la posición del tronco.",
        errorsToAvoid: ["Dar pasos desordenados", "Perder hombros estables", "Balancear las cargas"],
        primaryMuscles: ["Antebrazos", "Trapecio", "Core"],
        secondaryMuscles: ["Upper back", "Glúteos", "Gemelos"],
        fatigueMap: { forearms: 1, traps: 0.9, core: 0.8, upperBack: 0.6, glutes: 0.4, calves: 0.3 }
      }),
      squatExercise({
        name: "Suitcase carry",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Camina con una carga a un lado resistiendo inclinación y rotación. Mantén pasos simétricos, tronco alto y distancia constante entre carga y pierna.",
        errorsToAvoid: ["Inclinarse hacia un lado", "Acortar el paso de forma asimétrica", "Perder agarre o postura"],
        primaryMuscles: ["Oblicuos", "Antebrazos", "Core"],
        secondaryMuscles: ["Trapecio", "Glúteos", "Gemelos"],
        fatigueMap: { obliques: 1, core: 0.9, forearms: 0.9, traps: 0.7, glutes: 0.4, calves: 0.3 }
      }),
      squatExercise({
        name: "Front rack carry",
        equipment: ["Kettlebells", "Mancuernas"],
        technicalDescription:
          "Transporta la carga en rack frontal con codos recogidos, tronco alto y respiración controlada. Mantén abdomen activo sin hiperextender la espalda.",
        errorsToAvoid: ["Abrir codos en exceso", "Arquear lumbar", "Perder respiración o postura"],
        primaryMuscles: ["Core", "Upper back"],
        secondaryMuscles: ["Trapecio", "Antebrazos", "Glúteos", "Cuádriceps"],
        fatigueMap: { core: 0.9, upperBack: 0.7, traps: 0.6, forearms: 0.5, glutes: 0.3, quadriceps: 0.2 }
      }),
      squatExercise({
        name: "Zercher carry",
        equipment: ["Barra", "Sandbag"],
        technicalDescription:
          "Camina abrazando la carga en posición Zercher con tronco firme y pasos cortos. Mantén la carga cerca, codos debajo y columna neutra.",
        errorsToAvoid: ["Redondear la espalda", "Separar la carga del cuerpo", "Perder control de la respiración"],
        primaryMuscles: ["Core", "Upper back", "Bíceps"],
        secondaryMuscles: ["Glúteos", "Cuádriceps", "Antebrazos"],
        fatigueMap: { core: 0.9, upperBack: 0.7, forearms: 0.5, glutes: 0.4, quadriceps: 0.3, spinalErectors: 0.4 }
      }),
      squatExercise({
        name: "Overhead carry",
        equipment: ["Mancuerna", "Kettlebell", "Barra"],
        technicalDescription:
          "Transporta la carga por encima de la cabeza con brazo estable, costillas controladas y pasos regulares. Debe verse alineación vertical sin compensaciones lumbares.",
        errorsToAvoid: ["Arquear la espalda", "Perder bloqueo del brazo", "Caminar con pasos inestables"],
        primaryMuscles: ["Core", "Trapecio", "Upper back"],
        secondaryMuscles: ["Antebrazos", "Oblicuos", "Glúteos"],
        fatigueMap: { core: 0.9, traps: 0.8, upperBack: 0.7, forearms: 0.5, obliques: 0.5, glutes: 0.3 }
      })
    ]
  },
  {
    slug: "gait-carry-conditioning",
    pattern: "Gait & Carry",
    block: "Conditioning",
    exercises: [
      squatExercise({
        name: "Sled push",
        equipment: ["Trineo"],
        technicalDescription:
          "Empuja el trineo con inclinación controlada, pasos potentes y apoyo activo del pie. Mantén cadera estable y ritmo constante durante la distancia o intervalo.",
        errorsToAvoid: ["Perder tracción", "Hundirse de hombros", "Dar pasos demasiado largos"],
        primaryMuscles: ["Cuádriceps", "Glúteos", "Gemelos"],
        secondaryMuscles: ["Isquios", "Core", "Upper back"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, calves: 0.7, hamstrings: 0.4, core: 0.4, upperBack: 0.3 }
      }),
      squatExercise({
        name: "Backward sled drag",
        equipment: ["Trineo"],
        technicalDescription:
          "Arrastra el trineo caminando hacia atrás con pasos cortos y tensión continua. Mantén tronco alto, rodillas alineadas y empuje constante desde el antepié.",
        errorsToAvoid: ["Tirar solo con brazos", "Perder alineación de rodilla", "Dar tirónes sin ritmo"],
        primaryMuscles: ["Cuádriceps", "Gemelos"],
        secondaryMuscles: ["Glúteos", "Core", "Antebrazos"],
        fatigueMap: { quadriceps: 1, calves: 0.7, glutes: 0.5, core: 0.3, forearms: 0.3 }
      }),
      squatExercise({
        name: "Sled pull con arnes",
        equipment: ["Trineo", "Arnes"],
        technicalDescription:
          "Traccióna el trineo con arnés avanzando con inclinación estable y pasos potentes. Mantén línea corporal firme y ritmo continuo sin perder apoyo.",
        errorsToAvoid: ["Romper postura de tronco", "Resbalar por falta de apoyo", "Acelerar perdiendo control"],
        primaryMuscles: ["Glúteos", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuádriceps", "Core", "Erectores espinales"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, calves: 0.7, quadriceps: 0.5, core: 0.4, spinalErectors: 0.3 }
      }),
      squatExercise({
        name: "Loaded carry intervals",
        equipment: ["Mancuernas", "Kettlebells"],
        technicalDescription:
          "Alterna tramos de transporte cargado con descansos o cambios de distancia. Mantén técnica estable durante todo el intervalo, incluso con fatiga acumulada.",
        errorsToAvoid: ["Perder postura al fatigarse", "Balancear las cargas", "No respetar la distancia o tiempo objetivo"],
        primaryMuscles: ["Antebrazos", "Core", "Trapecio"],
        secondaryMuscles: ["Upper back", "Glúteos", "Gemelos"],
        fatigueMap: { forearms: 1, core: 0.8, traps: 0.8, upperBack: 0.6, glutes: 0.5, calves: 0.4 }
      }),
      squatExercise({
        name: "Carry medley",
        equipment: ["Material variado"],
        technicalDescription:
          "Combina varios transportes de carga en secuencia, cambiando implementos o posiciónes. Prioriza transiciónes limpias, postura estable y control del ritmo.",
        errorsToAvoid: ["Elegir cargas que rompen la técnica", "Perder orden en las transiciónes", "Descuidar respiración y postura"],
        primaryMuscles: ["Antebrazos", "Core", "Trapecio"],
        secondaryMuscles: ["Upper back", "Glúteos", "Gemelos", "Oblicuos"],
        fatigueMap: { forearms: 1, core: 0.9, traps: 0.8, upperBack: 0.6, glutes: 0.5, calves: 0.4, obliques: 0.5 }
      })
    ]
  },
  {
    slug: "push-upper-body-press-control",
    pattern: "Push / Upper Body Press",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Scapular retraction-protraction drill",
        equipment: ["Peso corporal", "Pared", "Cuadrupedia"],
        technicalDescription:
          "Alterna retracción y protracción escapular sin flexionar codos, en pared o cuadrupedia. Debe verse movimiento controlado de escápulas con cuello relajado y tronco estable.",
        errorsToAvoid: ["Doblar los codos", "Elevar hombros hacia las orejas", "Perder control del tronco"],
        primaryMuscles: ["Serrato anterior", "Trapecio medio"],
        secondaryMuscles: ["Core", "Pectoral", "Deltoides anterior"],
        fatigueMap: { serratusAnterior: 0.8, upperBack: 0.5, traps: 0.4, chest: 0.2, anteriorDelts: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Horizontal press manual/banded",
        equipment: ["Manual", "Banda elástica"],
        technicalDescription:
          "Empuja horizontalmente contra resistencia manual o banda manteniendo escápula controlada y muñeca alineada. El movimiento debe ser fluido, sin dolor y con tronco estable.",
        errorsToAvoid: ["Perder alineación de muñeca", "Elevar hombros", "Rotar el tronco para compensar"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.6, triceps: 0.5, anteriorDelts: 0.4, serratusAnterior: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Vertical press manual/banded",
        equipment: ["Manual", "Banda elástica"],
        technicalDescription:
          "Empuja en dirección vertical contra resistencia manual o banda, manteniendo costillas controladas y escápula estable. Debe verse elevación limpia sin compensacion lumbar.",
        errorsToAvoid: ["Arquear la espalda", "Adelantar la cabeza", "Perder control escapular"],
        primaryMuscles: ["Deltoides anterior", "Tríceps"],
        secondaryMuscles: ["Deltoides lateral", "Trapecio superior", "Core"],
        fatigueMap: { anteriorDelts: 0.7, triceps: 0.5, lateralDelts: 0.4, upperTraps: 0.3, core: 0.4 }
      }),
      squatExercise({
        name: "Push-up hold",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén posición de flexión con manos bajo hombros, cuerpo alineado y escápulas activas. La pelvis, costillas y cabeza deben permanecer estables.",
        errorsToAvoid: ["Hundirse entre hombros", "Caer de cadera", "Bloquear respiración"],
        primaryMuscles: ["Pectoral", "Tríceps", "Serrato anterior"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 0.5, triceps: 0.5, serratusAnterior: 0.5, anteriorDelts: 0.4, core: 0.6 }
      }),
      squatExercise({
        name: "Bottom-up kettlebell hold",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Sostén la kettlebell invertida con muñeca neutra y hombro centrado. Mantén respiración, antebrazo vertical y control fino sin que la carga oscile.",
        errorsToAvoid: ["Doblar la muñeca", "Elevar el hombro", "Perder control de la campana"],
        primaryMuscles: ["Antebrazos", "Deltoides anterior"],
        secondaryMuscles: ["Manguito rotador", "Trapecio superior", "Core"],
        fatigueMap: { forearms: 0.8, anteriorDelts: 0.5, upperTraps: 0.3, core: 0.3, upperBack: 0.3 }
      })
    ]
  },
  {
    slug: "push-upper-body-press-strength",
    pattern: "Push / Upper Body Press",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Incline push-up",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Realiza flexiones con manos elevadas en un soporte, manteniendo cuerpo alineado y control escapular. Baja con control y empuja sin perder postura.",
        errorsToAvoid: ["Abrir codos en exceso", "Perder alineación corporal", "Hundirse entre hombros"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.7, triceps: 0.6, anteriorDelts: 0.5, serratusAnterior: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una flexión manteniendo línea cabeza-cadera-tobillo, manos firmes y codos controlados. Empuja el suelo hasta recuperar una posición estable.",
        errorsToAvoid: ["Colapsar la lumbar", "Abrir codos sin control", "No completar el empuje"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        variants: [
          {
            id: "push-up-variant-knee",
            name: "Push-up con rodillas apoyadas",
            type: "regression",
            difficulty: "basic",
            equipment: ["Peso corporal"],
            description: "Regresión del push-up que reduce la carga relativa y facilita el control de tronco y escápulas.",
            coachingNotes: "Mantener línea hombro-cadera-rodilla y evitar colapsar la zona lumbar."
          },
          {
            id: "push-up-variant-deficit",
            name: "Push-up en déficit",
            type: "range",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Soportes"],
            description:
              "Variante con mayor rango de movimiento para aumentar la demanda de pectoral, hombro anterior y control escapular.",
            coachingNotes: "Usar solo si el deportista mantiene control en el rango completo."
          },
          {
            id: "push-up-variant-weighted",
            name: "Push-up lastrado",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Disco", "Chaleco lastrado"],
            description: "Variante con carga externa para progresar fuerza de empuje horizontal.",
            coachingNotes: "Colocar la carga de forma estable y no perder rigidez del tronco."
          },
          {
            id: "push-up-variant-close-grip",
            name: "Push-up agarre cerrado",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description:
              "Variante con manos más próximas para aumentar la participación relativa de tríceps y demanda de control escapular.",
            coachingNotes: "Evitar abrir excesivamente los codos o perder alineación de muñeca."
          }
        ],
        fatigueMap: { chest: 0.8, triceps: 0.7, anteriorDelts: 0.6, serratusAnterior: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Bench press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona desde banco con escápulas estables, pies apoyados y trayectoria controlada. Baja con control hacia el pecho y empuja manteniendo muñecas y codos alineados.",
        errorsToAvoid: ["Rebotar la carga", "Perder retracción escapular", "Abrir codos de forma excesiva"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Core", "Upper back"],
        variants: [
          {
            id: "bench-press-variant-barbell",
            name: "Press banca con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description:
              "Variante clásica con barra para desarrollar fuerza de empuje horizontal con alta capacidad de sobrecarga.",
            coachingNotes: "Mantener escápulas estables, pies apoyados y trayectoria controlada."
          },
          {
            id: "bench-press-variant-dumbbells",
            name: "Press banca con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas"],
            description: "Variante con mancuernas que permite mayor libertad de movimiento y demanda de estabilización.",
            coachingNotes: "Controlar la bajada y evitar perder simetría entre brazos."
          },
          {
            id: "bench-press-variant-paused",
            name: "Press banca con pausa",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Barra", "Mancuernas"],
            description: "Variante con pausa en la parte baja para mejorar control, fuerza desde parada y estabilidad.",
            coachingNotes: "Mantener tensión durante la pausa sin hundir hombros ni perder posición escapular."
          },
          {
            id: "bench-press-variant-close-grip",
            name: "Press banca agarre cerrado",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante con agarre más cerrado que aumenta la demanda relativa de tríceps y control del empuje.",
            coachingNotes: "No cerrar el agarre hasta comprometer muñecas u hombros."
          },
          {
            id: "bench-press-variant-floor-press",
            name: "Floor press",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Barra", "Mancuernas"],
            description:
              "Variante con rango limitado por el suelo, útil para controlar hombro y enfatizar la fase media-final del empuje.",
            coachingNotes: "Apoyar tríceps de forma controlada y no rebotar contra el suelo."
          }
        ],
        fatigueMap: { chest: 1, triceps: 0.8, anteriorDelts: 0.7, core: 0.2, upperBack: 0.2 }
      }),
      squatExercise({
        name: "Incline bench press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona en banco inclinado manteniendo escápulas firmes y trayectoria estable. El énfasis debe ir al empuje inclinado sin perder control de hombro.",
        errorsToAvoid: ["Convertirlo en press vertical", "Elevar hombros", "Perder apoyo en el banco"],
        primaryMuscles: ["Pectoral", "Deltoides anterior", "Tríceps"],
        secondaryMuscles: ["Upper back", "Core"],
        variants: [
          {
            id: "incline-bench-press-variant-barbell",
            name: "Press inclinado con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante con barra orientada a empuje inclinado y sobrecarga progresiva.",
            coachingNotes: "Mantener trayectoria estable y evitar convertirlo en press vertical."
          },
          {
            id: "incline-bench-press-variant-dumbbells",
            name: "Press inclinado con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas"],
            description: "Variante con mancuernas que permite libertad de trayectoria y mayor demanda de estabilización.",
            coachingNotes: "Controlar la bajada y mantener hombros activos."
          },
          {
            id: "incline-bench-press-variant-low-incline",
            name: "Press inclinado bajo",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Barra", "Mancuernas", "Banco inclinado"],
            description: "Variante con menor inclinación para acercar el estímulo al press horizontal.",
            coachingNotes: "Elegir la inclinación según tolerancia de hombro y objetivo del empuje."
          },
          {
            id: "incline-bench-press-variant-high-incline",
            name: "Press inclinado alto",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Barra", "Mancuernas", "Banco inclinado"],
            description: "Variante con mayor inclinación, acercando el estímulo al press vertical.",
            coachingNotes: "Evitar compensar con extensión lumbar."
          }
        ],
        fatigueMap: { chest: 0.9, anteriorDelts: 0.8, triceps: 0.7, upperBack: 0.2, core: 0.2 }
      }),
      squatExercise({
        name: "Landmine press",
        equipment: ["Barra", "Landmine"],
        technicalDescription:
          "Empuja la barra en diagonal desde landmine, manteniendo costillas controladas y hombro centrado. La trayectoria debe ser estable, con final fuerte sin inclinar el tronco.",
        errorsToAvoid: ["Rotar el tronco", "Elevar hombro al final", "Perder base de apoyo"],
        primaryMuscles: ["Deltoides anterior", "Pectoral", "Tríceps"],
        secondaryMuscles: ["Serrato anterior", "Core", "Trapecio superior"],
        variants: [
          {
            id: "landmine-press-variant-standing",
            name: "Landmine press de pie",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description: "Variante de pie con empuje diagonal y demanda de control global.",
            coachingNotes: "Mantener costillas controladas y no rotar el tronco en exceso."
          },
          {
            id: "landmine-press-variant-half-kneeling",
            name: "Landmine press semiarrodillado",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description: "Variante semiarrodillada que aumenta la demanda de control lumbo-pélvico y estabilidad.",
            coachingNotes: "Mantener pelvis estable y empujar en trayectoria diagonal limpia."
          },
          {
            id: "landmine-press-variant-unilateral",
            name: "Landmine press unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Landmine"],
            description: "Variante unilateral para trabajar empuje diagonal con control antirotacional.",
            coachingNotes: "Evitar que el tronco acompañe excesivamente la carga."
          },
          {
            id: "landmine-press-variant-rotational",
            name: "Landmine press rotacional",
            type: "complex",
            difficulty: "advanced",
            equipment: ["Landmine"],
            description: "Variante con componente rotacional para integrar empuje, tronco y transferencia global.",
            coachingNotes: "Usar cargas moderadas y controlar la rotación desde cadera y tronco."
          }
        ],
        fatigueMap: { anteriorDelts: 0.8, chest: 0.6, triceps: 0.6, serratusAnterior: 0.4, core: 0.4, upperTraps: 0.3 }
      }),
      squatExercise({
        name: "Overhead press / Press militar",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona por encima de la cabeza con tronco firme, costillas abajo y trayectoria vertical. Termina con brazos estables y cabeza alineada bajo la carga.",
        errorsToAvoid: ["Arquear lumbar", "Adelantar la cabeza", "No bloquear con control"],
        primaryMuscles: ["Deltoides anterior", "Tríceps"],
        secondaryMuscles: ["Deltoides lateral", "Trapecio superior", "Core", "Upper back"],
        variants: [
          {
            id: "overhead-press-variant-barbell",
            name: "Press militar con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra"],
            description: "Variante bilateral con barra para desarrollar fuerza de empuje vertical.",
            coachingNotes: "Mantener glúteos y abdomen activos, evitando hiperextensión lumbar."
          },
          {
            id: "overhead-press-variant-dumbbells",
            name: "Press militar con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas"],
            description: "Variante con mancuernas que permite más libertad de movimiento y demanda de estabilización.",
            coachingNotes: "Controlar la trayectoria y mantener hombros activos arriba."
          },
          {
            id: "overhead-press-variant-seated",
            name: "Press militar sentado",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Barra", "Mancuernas", "Banco"],
            description:
              "Variante sentada que reduce la contribución de piernas y facilita el foco en empuje vertical.",
            coachingNotes: "No compensar con hiperextensión lumbar."
          },
          {
            id: "overhead-press-variant-unilateral",
            name: "Press militar unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Kettlebell"],
            description: "Variante unilateral con mayor demanda de control lateral y estabilidad del tronco.",
            coachingNotes: "Evitar inclinarse hacia el lado contrario durante el empuje."
          }
        ],
        fatigueMap: { anteriorDelts: 1, lateralDelts: 0.6, triceps: 0.8, upperTraps: 0.4, core: 0.5, upperBack: 0.3 }
      })
    ]
  },
  {
    slug: "push-upper-body-press-hypertrophy",
    pattern: "Push / Upper Body Press",
    block: "Hipertrofia",
    exercises: [
      squatExercise({
        name: "Chest press",
        equipment: ["Máquina"],
        technicalDescription:
          "Presiona en máquina con espalda apoyada, muñecas neutras y ritmo controlado. Mantén hombros estables y tensión continua durante todo el recorrido.",
        errorsToAvoid: ["Perder contacto con el respaldo", "Bloquear codos agresivamente", "Rebotar la carga"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior"],
        fatigueMap: { chest: 0.9, triceps: 0.7, anteriorDelts: 0.5, serratusAnterior: 0.2 }
      }),
      squatExercise({
        name: "Incline chest press",
        equipment: ["Máquina"],
        technicalDescription:
          "Empuja en máquina inclinada con control, manteniendo hombros bajos y trayectoria estable. Busca tensión en pectoral superior sin compensar con cuello.",
        errorsToAvoid: ["Elevar hombros", "Perder control al bajar", "Cerrar demasiado el agarre"],
        primaryMuscles: ["Pectoral", "Deltoides anterior"],
        secondaryMuscles: ["Tríceps", "Serrato anterior"],
        fatigueMap: { chest: 0.9, anteriorDelts: 0.7, triceps: 0.6, serratusAnterior: 0.2 }
      }),
      squatExercise({
        name: "Shoulder press",
        equipment: ["Máquina"],
        technicalDescription:
          "Presiona verticalmente en máquina con espalda apoyada y hombros controlados. Sube con fuerza y baja con control sin perder alineación de codos.",
        errorsToAvoid: ["Elevar hombros excesivamente", "Arquear lumbar", "Bajar fuera de control"],
        primaryMuscles: ["Deltoides anterior", "Tríceps"],
        secondaryMuscles: ["Deltoides lateral", "Trapecio superior"],
        fatigueMap: { anteriorDelts: 0.9, triceps: 0.7, lateralDelts: 0.6, upperTraps: 0.3 }
      })
    ]
  },
  {
    slug: "push-upper-body-press-power",
    pattern: "Push / Upper Body Press",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Medicine ball chest pass",
        equipment: ["Balón medicinal"],
        technicalDescription:
          "Lanza el balon desde el pecho con empuje explosivo, tronco firme y trayectoria directa. La accion debe ser rápida, coordinada y con recepción segura si hay retorno.",
        errorsToAvoid: ["Lanzar solo con brazos", "Perder postura", "Frenar antes de soltar el balon"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.7, anteriorDelts: 0.6, serratusAnterior: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Medicine ball overhead throw",
        equipment: ["Balón medicinal"],
        technicalDescription:
          "Lanza el balon por encima de la cabeza con extensión potente y control del tronco. Mantén costillas controladas y libera el balon con velocidad.",
        errorsToAvoid: ["Arquear lumbar", "Lanzar sin coordinar piernas y tronco", "Perder control del hombro"],
        primaryMuscles: ["Deltoides anterior", "Tríceps", "Pectoral"],
        secondaryMuscles: ["Core", "Trapecio superior", "Serrato anterior"],
        fatigueMap: { anteriorDelts: 0.8, triceps: 0.7, chest: 0.6, core: 0.5, upperTraps: 0.3, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Explosive push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una flexión empujando el suelo con máxima velocidad, manteniendo cuerpo alineado. La prioridad es despegar o acelerar sin perder control.",
        errorsToAvoid: ["Perder alineación corporal", "Caer sin absorber", "Buscar altura a costa de técnica"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.8, anteriorDelts: 0.6, serratusAnterior: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Push press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Combina un dip corto con extensión potente de piernas y press vertical. Transmite fuerza a la carga manteniendo tronco firme y recepción estable arriba.",
        errorsToAvoid: ["Convertirlo en sentadilla", "Arquear lumbar", "Presionar tarde sin aprovechar piernas"],
        primaryMuscles: ["Deltoides anterior", "Tríceps", "Cuádriceps"],
        secondaryMuscles: ["Glúteos", "Core", "Trapecio superior"],
        fatigueMap: { anteriorDelts: 0.8, triceps: 0.7, quadriceps: 0.4, glutes: 0.3, core: 0.5, upperTraps: 0.4 }
      }),
      squatExercise({
        name: "Landmine push press",
        equipment: ["Barra", "Landmine"],
        technicalDescription:
          "Realiza un empuje diagonal explosivo desde landmine usando una pequeña ayuda de piernas. Mantén línea corporal estable y finaliza con brazo fuerte.",
        errorsToAvoid: ["Rotar sin control", "Perder base de apoyo", "Empujar lento sin intención"],
        primaryMuscles: ["Deltoides anterior", "Pectoral", "Tríceps"],
        secondaryMuscles: ["Cuádriceps", "Glúteos", "Core", "Serrato anterior"],
        fatigueMap: { anteriorDelts: 0.8, chest: 0.6, triceps: 0.7, quadriceps: 0.3, glutes: 0.3, core: 0.5, serratusAnterior: 0.4 }
      })
    ]
  },
  {
    slug: "push-upper-body-press-plyometrics",
    pattern: "Push / Upper Body Press",
    block: "Pliometria",
    exercises: [
      squatExercise({
        name: "Push-up landing",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde una pequeña caída o liberacion, recibe en posición de flexión absorbiendo con brazos y escápulas. Mantén tronco firme y contacto controlado.",
        errorsToAvoid: ["Caer con codos rigidos", "Hundirse entre hombros", "Perder alineación corporal"],
        primaryMuscles: ["Pectoral", "Tríceps", "Serrato anterior"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 0.7, triceps: 0.7, serratusAnterior: 0.5, anteriorDelts: 0.5, core: 0.4 }
      }),
      squatExercise({
        name: "Plyo push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza flexiones pliométricas despegando las manos del suelo y aterrizando con absorción activa. Mantén ritmo, alineación y control del contacto.",
        errorsToAvoid: ["Aterrizar rigido", "Perder postura", "Abrir codos sin control"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Core", "Serrato anterior"],
        variants: [
          {
            id: "plyo-push-up-variant-clap",
            name: "Flexiones con palmada",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description:
              "Variante explosiva con palmada que exige mayor producción de fuerza y control de recepción.",
            coachingNotes:
              "Usar solo si el deportista mantiene buena alineación en flexiones explosivas básicas."
          },
          {
            id: "plyo-push-up-variant-explosive",
            name: "Flexiones explosivas",
            type: "progression",
            difficulty: "intermediate",
            equipment: ["Peso corporal"],
            description: "Variante explosiva sin palmada, orientada a intención máxima de empuje y recepción controlada.",
            coachingNotes: "Priorizar velocidad de salida y control escapular."
          },
          {
            id: "plyo-push-up-variant-eccentric-explosive",
            name: "Flexiones excéntricas explosivas",
            type: "tempo",
            difficulty: "advanced",
            equipment: ["Peso corporal"],
            description: "Variante que combina control excéntrico con acción concéntrica explosiva.",
            coachingNotes: "No permitir pérdida de tronco o colapso escapular durante la bajada."
          }
        ],
        fatigueMap: { chest: 0.9, triceps: 0.8, anteriorDelts: 0.7, core: 0.4, serratusAnterior: 0.4 }
      }),
      squatExercise({
        name: "Depth push-up",
        equipment: ["Cajones", "Soportes"],
        technicalDescription:
          "Deja caer las manos desde soportes hacia el suelo y responde con empuje rápido. Prioriza absorción controlada, contacto breve y alineación del tronco.",
        errorsToAvoid: ["Usar demasiada altura", "Colapsar hombros", "No absorber antes de empujar"],
        primaryMuscles: ["Pectoral", "Tríceps", "Deltoides anterior"],
        secondaryMuscles: ["Serrato anterior", "Core"],
        fatigueMap: { chest: 0.9, triceps: 0.8, anteriorDelts: 0.7, serratusAnterior: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Reactive medicine ball chest pass",
        equipment: ["Balón medicinal"],
        technicalDescription:
          "Recibe y relanza el balón medicinal desde el pecho con contacto rápido. Mantén postura estable, absorbe con brazos y devuelve con intención explosiva.",
        errorsToAvoid: ["Retener demasiado el balon", "Perder posición al recibir", "Lanzar sin absorber"],
        primaryMuscles: ["Pectoral", "Tríceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.7, anteriorDelts: 0.6, serratusAnterior: 0.5, core: 0.4 }
      })
    ]
  },
  {
    slug: "pull-upper-body-pull-control",
    pattern: "Pull / Upper Body Pull",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Scapular retraction-depression drill",
        equipment: ["Peso corporal", "Banda elástica"],
        technicalDescription:
          "Practica retracción y depresión escapular sin flexionar los codos, manteniendo cuello relajado y tronco estable. Debe verse control de escápulas antes de iniciar cualquier tracción.",
        errorsToAvoid: ["Doblar los codos", "Elevar hombros hacia las orejas", "Compensar con extensión lumbar"],
        primaryMuscles: ["Trapecio medio", "Trapecio inferior"],
        secondaryMuscles: ["Dorsal ancho", "Romboides", "Core"],
        fatigueMap: { midBack: 0.6, lowerTraps: 0.6, lats: 0.3, upperBack: 0.5, core: 0.2 }
      }),
      squatExercise({
        name: "Horizontal pull manual/banded",
        equipment: ["Manual", "Banda elástica"],
        technicalDescription:
          "Realiza una tracción horizontal contra resistencia manual o banda, llevando codos atrás con escápulas controladas. Mantén pecho alto y muñecas neutras.",
        errorsToAvoid: ["Tirar solo con brazos", "Encoger hombros", "Rotar el tronco"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.6, lats: 0.5, biceps: 0.3, rearDelts: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "External shoulder rotation manual/banded",
        equipment: ["Manual", "Banda elástica"],
        technicalDescription:
          "Rota externamente el hombro contra resistencia manteniendo codo estable y escápula tranquila. El movimiento debe ser pequeño, preciso y sin dolor.",
        errorsToAvoid: ["Separar el codo", "Rotar el tronco", "Usar demasiada resistencia"],
        primaryMuscles: ["Manguito rotador"],
        secondaryMuscles: ["Deltoides posterior", "Trapecio inferior"],
        fatigueMap: { rotatorCuff: 0.8, rearDelts: 0.3, lowerTraps: 0.2 }
      }),
      squatExercise({
        name: "Vertical pull manual/banded",
        equipment: ["Manual", "Banda elástica"],
        technicalDescription:
          "Simula una tracción vertical contra resistencia manual o banda, iniciando desde depresión escapular y llevando codos hacia abajo. Mantén costillas controladas.",
        errorsToAvoid: ["Tirar con cuello", "Arquear lumbar", "Perder depresión escapular"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Trapecio inferior", "Espalda media", "Core"],
        fatigueMap: { lats: 0.6, biceps: 0.4, lowerTraps: 0.4, midBack: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Dead hang",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Cuelga de una barra con agarre firme, hombros tolerando la carga y tronco relajado pero controlado. Mantén respiración y evita dolor o perdida brusca de tensión.",
        errorsToAvoid: ["Colgarse con dolor", "Perder agarre sin control", "Elevar hombros de forma rigida"],
        primaryMuscles: ["Antebrazos", "Dorsal ancho"],
        secondaryMuscles: ["Trapecio inferior", "Core"],
        fatigueMap: { forearms: 0.8, lats: 0.5, lowerTraps: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Scapular pull-up hold",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Desde colgado, activa depresión escapular y mantén el cuerpo elevado sin flexionar codos. Debe verse control de escápulas y cuello relajado.",
        errorsToAvoid: ["Flexionar codos", "Balancearse", "Encoger hombros"],
        primaryMuscles: ["Dorsal ancho", "Trapecio inferior"],
        secondaryMuscles: ["Antebrazos", "Core", "Espalda media"],
        fatigueMap: { lats: 0.6, lowerTraps: 0.6, forearms: 0.5, midBack: 0.3, core: 0.3 }
      })
    ]
  },
  {
    slug: "pull-upper-body-pull-strength",
    pattern: "Pull / Upper Body Pull",
    block: "Fuerza base",
    exercises: [
      squatExercise({
        name: "Supported dumbbell row",
        equipment: ["Mancuerna", "Banco"],
        technicalDescription:
          "Rema con una mancuerna apoyando el cuerpo en banco, llevando el codo atrás sin rotar el tronco. Mantén escápula controlada y bajada estable.",
        errorsToAvoid: ["Girar el tronco", "Tirar con impulso", "Elevar el hombro hacia la oreja"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Deltoides posterior", "Bíceps", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.8, midBack: 0.9, rearDelts: 0.5, biceps: 0.5, forearms: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Inverted row / Australian pull-up",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Tira del cuerpo hacia una barra baja manteniendo línea corporal y escápulas activas. Ajusta la inclinación para controlar dificultad sin perder postura.",
        errorsToAvoid: ["Caer de cadera", "Adelantar la cabeza", "Tirar solo con brazos"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Core", "Antebrazos"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, core: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Seated cable row",
        equipment: ["Polea"],
        technicalDescription:
          "Rema sentado en polea llevando codos atrás con pecho alto y escápulas controladas. Mantén torso estable y evita balancear el cuerpo.",
        errorsToAvoid: ["Balancearse para tirar", "Redondear espalda", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Antebrazos"],
        variants: [
          {
            id: "seated-cable-row-variant-neutral",
            name: "Remo sentado agarre neutro",
            type: "grip",
            difficulty: "basic",
            equipment: ["Polea"],
            description: "Variante con agarre neutro para trabajar tracción horizontal con recorrido controlado.",
            coachingNotes: "Iniciar el movimiento desde escápulas y no desde balanceo del tronco."
          },
          {
            id: "seated-cable-row-variant-wide",
            name: "Remo sentado agarre amplio",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Polea", "Barra larga"],
            description: "Variante con agarre amplio que modifica la línea de tracción y demanda de espalda alta.",
            coachingNotes: "Evitar elevar hombros y perder control escapular."
          },
          {
            id: "seated-cable-row-variant-unilateral",
            name: "Remo sentado unilateral",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante unilateral para ajustar trayectoria y trabajar control asimétrico.",
            coachingNotes: "Evitar rotar el tronco hacia atrás para completar la repetición."
          },
          {
            id: "seated-cable-row-variant-paused",
            name: "Remo sentado con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante con pausa al final del tirón para enfatizar control escapular y tensión en espalda.",
            coachingNotes: "Pausar sin encoger hombros ni arquear la zona lumbar."
          }
        ],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, rearDelts: 0.4, forearms: 0.4 }
      }),
      squatExercise({
        name: "T-bar row",
        equipment: ["Barra T", "Landmine"],
        technicalDescription:
          "Rema con barra T o landmine manteniendo tronco firme, cadera estable y trayectoria hacia el abdomen. Controla la bajada sin perder posición.",
        errorsToAvoid: ["Redondear lumbar", "Usar impulso de cadera", "Llevar hombros al cuello"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Erectores espinales", "Antebrazos", "Deltoides posterior"],
        variants: [
          {
            id: "t-bar-row-variant-landmine",
            name: "Remo T con landmine",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra", "Landmine"],
            description: "Variante con landmine para trabajar tracción horizontal con alta capacidad de sobrecarga.",
            coachingNotes: "Mantener bisagra estable y evitar tirar con impulso lumbar."
          },
          {
            id: "t-bar-row-variant-chest-supported",
            name: "Remo T con apoyo de pecho",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Máquina", "Banco inclinado", "Barra T"],
            description: "Variante con apoyo de pecho que reduce la demanda lumbar y facilita focalizar en tracción.",
            coachingNotes: "No despegar el pecho del apoyo para completar la repetición."
          },
          {
            id: "t-bar-row-variant-wide-grip",
            name: "Remo T agarre amplio",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Barra T", "Máquina"],
            description: "Variante con agarre amplio para modificar la línea de tracción hacia espalda alta.",
            coachingNotes: "Mantener hombros bajos y controlar el final del recorrido."
          }
        ],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, spinalErectors: 0.5, forearms: 0.5, rearDelts: 0.4 }
      }),
      squatExercise({
        name: "Assisted pull-up / Chin-up",
        equipment: ["Banda", "Máquina asistida"],
        technicalDescription:
          "Realiza dominadas asistidas iniciando con control escapular y llevando pecho hacia la barra. Usa asistencia suficiente para completar rango sin perder técnica.",
        errorsToAvoid: ["Balancearse", "Acortar el rango", "Tirar con cuello o hombros elevados"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        variants: [
          {
            id: "assisted-pull-up-chin-up-variant-band",
            name: "Dominada asistida con goma",
            type: "support",
            difficulty: "basic",
            equipment: ["Banda elástica", "Barra"],
            description:
              "Variante asistida con banda para reducir la carga relativa y permitir practicar el patrón completo.",
            coachingNotes: "Elegir una banda que ayude sin alterar demasiado la trayectoria."
          },
          {
            id: "assisted-pull-up-chin-up-variant-machine",
            name: "Dominada asistida en máquina",
            type: "support",
            difficulty: "basic",
            equipment: ["Máquina asistida"],
            description: "Variante asistida en máquina para ajustar la ayuda de forma más controlada.",
            coachingNotes:
              "Mantener control escapular y evitar depender de la asistencia para completar repeticiones de mala calidad."
          },
          {
            id: "assisted-pull-up-chin-up-variant-foot-supported",
            name: "Dominada asistida con apoyo de pies",
            type: "support",
            difficulty: "basic",
            equipment: ["Barra", "Cajón"],
            description: "Variante con apoyo de pies para modular la asistencia manualmente.",
            coachingNotes: "Usar las piernas como ayuda mínima, no como empuje principal."
          }
        ],
        fatigueMap: { lats: 0.8, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.5, core: 0.3 }
      }),
      squatExercise({
        name: "Pull-up / Chin-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza dominada o chin-up desde colgado, iniciando con escápulas y llevando el cuerpo hacia la barra. Mantén control, rango completo y sin balanceo excesivo.",
        errorsToAvoid: ["Kipping sin objetivo", "No completar rango", "Encoger hombros al subir"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        variants: [
          {
            id: "pull-up-chin-up-variant-pronated",
            name: "Dominada pronada",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Barra"],
            description:
              "Variante con agarre pronado, orientada a tracción vertical con alta demanda de dorsal, bíceps y control escapular.",
            coachingNotes: "Iniciar con depresión escapular y evitar balanceo."
          },
          {
            id: "pull-up-chin-up-variant-supinated",
            name: "Chin-up / Dominada supina",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Barra"],
            description: "Variante con agarre supino, normalmente con mayor participación relativa de flexores del codo.",
            coachingNotes: "Mantener control escapular y no perder extensión torácica."
          },
          {
            id: "pull-up-chin-up-variant-neutral",
            name: "Dominada agarre neutro",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Barra neutra"],
            description: "Variante con agarre neutro, útil para modificar tolerancia de hombro y codo.",
            coachingNotes: "Mantener trayectoria controlada y evitar encoger hombros."
          },
          {
            id: "pull-up-chin-up-variant-weighted",
            name: "Dominada lastrada",
            type: "progression",
            difficulty: "advanced",
            equipment: ["Peso corporal", "Cinturón", "Disco", "Chaleco lastrado"],
            description: "Variante con carga externa para progresar fuerza máxima de tracción vertical.",
            coachingNotes: "Añadir carga solo si el rango y control escapular son sólidos."
          },
          {
            id: "pull-up-chin-up-variant-eccentric",
            name: "Dominada excéntrica",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Peso corporal", "Barra"],
            description: "Variante con énfasis en la fase excéntrica para desarrollar control y fuerza específica.",
            coachingNotes: "Controlar la bajada sin perder posición escapular ni colgarse pasivamente."
          }
        ],
        fatigueMap: { lats: 1, biceps: 0.7, midBack: 0.6, lowerTraps: 0.5, forearms: 0.6, core: 0.4 }
      })
    ]
  },
  {
    slug: "pull-upper-body-pull-hypertrophy",
    pattern: "Pull / Upper Body Pull",
    block: "Hipertrofia",
    exercises: [
      squatExercise({
        name: "Chest-supported horizontal row machine",
        equipment: ["Máquina"],
        technicalDescription:
          "Rema en máquina con pecho apoyado, manteniendo hombros bajos y tirando con codos. El apoyo reduce compensaciones y permite acumular volumen controlado.",
        errorsToAvoid: ["Separar el pecho del apoyo", "Encoger hombros", "Rebotar la carga"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Antebrazos"],
        fatigueMap: { midBack: 0.9, lats: 0.7, biceps: 0.4, rearDelts: 0.5, forearms: 0.3 }
      }),
      squatExercise({
        name: "Diagonal row machine",
        equipment: ["Máquina"],
        technicalDescription:
          "Rema en trayectoria diagonal guiada, buscando recorrido estable y tensión continua. Mantén pecho apoyado o tronco fijo según máquina.",
        errorsToAvoid: ["Tirar con impulso", "Perder trayectoria", "Elevar hombros"],
        primaryMuscles: ["Dorsal ancho", "Espalda media"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior"],
        fatigueMap: { lats: 0.8, midBack: 0.8, biceps: 0.4, rearDelts: 0.4 }
      }),
      squatExercise({
        name: "Chest-supported T-bar row",
        equipment: ["Barra T", "Máquina"],
        technicalDescription:
          "Rema con pecho apoyado en barra T o máquina, llevando codos atrás sin despegar el torso. Controla la fase excéntrica y mantén cuello neutro.",
        errorsToAvoid: ["Separarse del apoyo", "Acortar rango", "Cerrar demasiado el cuello"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Antebrazos"],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, rearDelts: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Lat pulldown",
        equipment: ["Máquina", "Polea"],
        technicalDescription:
          "Realiza jalón vertical llevando la barra o agarre hacia la parte alta del pecho. Inicia con depresión escapular y controla la vuelta sin perder postura.",
        errorsToAvoid: ["Tirar detrás de la nuca sin criterio", "Balancear el tronco", "Perder depresión escapular"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos"],
        variants: [
          {
            id: "lat-pulldown-variant-pronated",
            name: "Jalón al pecho agarre prono",
            type: "grip",
            difficulty: "basic",
            equipment: ["Máquina", "Polea"],
            description: "Variante de jalón con agarre prono para trabajar tracción vertical con recorrido controlado.",
            coachingNotes: "Llevar la barra hacia la parte alta del pecho sin tirar con balanceo."
          },
          {
            id: "lat-pulldown-variant-supinated",
            name: "Jalón al pecho agarre supino",
            type: "grip",
            difficulty: "basic",
            equipment: ["Máquina", "Polea"],
            description: "Variante con agarre supino que modifica la demanda de flexores del codo y dorsal.",
            coachingNotes: "Mantener hombros bajos y controlar la fase excéntrica."
          },
          {
            id: "lat-pulldown-variant-neutral",
            name: "Jalón al pecho agarre neutro",
            type: "grip",
            difficulty: "basic",
            equipment: ["Máquina", "Polea", "Agarre neutro"],
            description: "Variante con agarre neutro, útil para modificar comodidad de hombro y codo.",
            coachingNotes: "Evitar inclinarse excesivamente hacia atrás."
          },
          {
            id: "lat-pulldown-variant-unilateral",
            name: "Jalón unilateral en polea",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante unilateral que permite ajustar trayectoria y trabajar control asimétrico.",
            coachingNotes: "Evitar rotar el tronco para completar el tirón."
          },
          {
            id: "lat-pulldown-variant-kneeling",
            name: "Jalón semiarrodillado en polea",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description:
              "Variante semiarrodillada que aumenta la demanda de control lumbo-pélvico y permite una trayectoria más libre.",
            coachingNotes: "Mantener pelvis estable y no compensar con extensión lumbar."
          }
        ],
        fatigueMap: { lats: 0.9, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.4 }
      }),
      squatExercise({
        name: "Cable pullover",
        equipment: ["Polea"],
        technicalDescription:
          "Extiende los hombros desde polea manteniendo codos casi fijos y tronco estable. Busca tensión de dorsal sin convertirlo en empuje ni flexionar codos.",
        errorsToAvoid: ["Doblar demasiado los codos", "Arquear lumbar", "Usar impulso"],
        primaryMuscles: ["Dorsal ancho"],
        secondaryMuscles: ["Tríceps", "Core", "Serrato anterior"],
        fatigueMap: { lats: 0.9, triceps: 0.2, core: 0.3, serratusAnterior: 0.2 }
      })
    ]
  },
  {
    slug: "pull-upper-body-pull-power",
    pattern: "Pull / Upper Body Pull",
    block: "Potencia",
    exercises: [
      squatExercise({
        name: "Medicine ball slam",
        equipment: ["Balón medicinal"],
        technicalDescription:
          "Eleva el balon y golpea el suelo con accion potente de brazos y tronco. Mantén control del rebote y usa una trayectoria fuerte sin perder postura.",
        errorsToAvoid: ["Arquear lumbar", "Golpear sin controlar el rebote", "Usar solo brazos"],
        primaryMuscles: ["Dorsal ancho", "Core"],
        secondaryMuscles: ["Tríceps", "Espalda media", "Deltoides anterior"],
        fatigueMap: { lats: 0.6, core: 0.7, triceps: 0.4, midBack: 0.3, anteriorDelts: 0.3 }
      }),
      squatExercise({
        name: "Explosive band row",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Rema contra banda con intención explosiva y retorno controlado. Mantén tronco estable y acelera el codo atrás sin perder escápula.",
        errorsToAvoid: ["Perder control al volver", "Rotar el tronco", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.7, lats: 0.6, biceps: 0.4, rearDelts: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Explosive inverted row",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Realiza inverted row con intención explosiva manteniendo cuerpo alineado. Sube rápido, controla la bajada y evita perder rigidez corporal.",
        errorsToAvoid: ["Caer de cadera", "Tirar con cuello", "Perder control excéntrico"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Core", "Antebrazos"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, core: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Explosive pull-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una dominada buscando máxima velocidad de subida sin balanceo excesivo. Mantén inicio escapular, rango útil y recepción controlada al bajar.",
        errorsToAvoid: ["Convertirlo en kipping sin control", "Acortar rango", "Caer sin frenar"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.9, biceps: 0.7, midBack: 0.6, lowerTraps: 0.4, forearms: 0.5, core: 0.4 }
      })
    ]
  },
  {
    slug: "pull-upper-body-pull-plyometrics",
    pattern: "Pull / Upper Body Pull",
    block: "Pliometria",
    exercises: [
      squatExercise({
        name: "Reactive band row",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Realiza remos reactivos con banda, absorbiendo la vuelta y relanzando la tracción con rapidez. Mantén escápulas activas y tronco estable.",
        errorsToAvoid: ["Dejar que la banda tire sin control", "Perder postura", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Bíceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.7, lats: 0.6, biceps: 0.4, rearDelts: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Inverted row release/catch",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Desde inverted row, suelta brevemente y vuelve a agarrar o absorber la tracción con control. Prioriza contacto seguro y alineación corporal.",
        errorsToAvoid: ["Soltar sin control", "Perder rigidez corporal", "Caer de hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Deltoides posterior", "Antebrazos", "Core"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, forearms: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Band-assisted plyo pull-up",
        equipment: ["Banda", "Barra"],
        technicalDescription:
          "Realiza dominadas pliométricas asistidas con banda buscando una subida rápida y recepción controlada. La asistencia debe permitir velocidad sin perder técnica.",
        errorsToAvoid: ["Usar una banda demasiado ligera", "Balancearse", "Caer sin control escapular"],
        primaryMuscles: ["Dorsal ancho", "Bíceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.8, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.5, core: 0.4 }
      }),
      squatExercise({
        id: "pull-upper-body-pull-plyometric-power-pull-up",
        name: "Dominada de potencia",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Variante explosiva de dominada orientada a producir fuerza rápidamente en tracción vertical. Buscar intención máxima de subida, control escapular y recepción controlada en la bajada, sin perder posición de hombros.",
        errorsToAvoid: [
          "tirar solo con brazos sin depresión escapular",
          "perder control en la bajada",
          "compensar con balanceo excesivo",
          "llevar el cuello hacia delante",
          "hacer repeticiones explosivas sin rango útil",
          "continuar cuando se pierde velocidad o técnica"
        ],
        primaryMuscles: ["Dorsal", "Bíceps", "Trapecio medio"],
        secondaryMuscles: ["Romboides", "Deltoides posterior", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.75, biceps: 0.55, rearDelts: 0.3, forearms: 0.3, core: 0.2 }
      })
    ]
  },
  {
    slug: "upper-body-accessories-chest",
    pattern: "Upper Body Accessories",
    block: "Chest accessories",
    exercises: [
      squatExercise({
        name: "Pec deck",
        equipment: ["Máquina"],
        technicalDescription:
          "Realiza aperturas guiadas en máquina manteniendo pecho alto y hombros controlados. Junta los brazos sin perder posición escapular y vuelve con control.",
        errorsToAvoid: ["Llevar hombros hacia delante", "Usar impulso", "Forzar rango con dolor"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Bíceps"],
        fatigueMap: { chest: 1, anteriorDelts: 0.3, biceps: 0.1 },
        variants: [
          {
            id: "pec-deck-variant-neutral-grip",
            name: "Pec deck agarre neutro",
            type: "grip",
            difficulty: "basic",
            equipment: ["Máquina"],
            description:
              "Variante con agarre neutro para trabajar aducción horizontal de hombro con trayectoria guiada.",
            coachingNotes: "Mantener escápulas estables y no adelantar excesivamente los hombros al cerrar."
          },
          {
            id: "pec-deck-variant-elbow-pads",
            name: "Pec deck con apoyo de antebrazo",
            type: "support",
            difficulty: "basic",
            equipment: ["Máquina"],
            description:
              "Variante con apoyo de antebrazo que reduce la exigencia de agarre y facilita focalizar el trabajo en pectoral.",
            coachingNotes: "Evitar empujar con las manos o perder control en la fase excéntrica."
          },
          {
            id: "pec-deck-variant-paused",
            name: "Pec deck con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description: "Variante con pausa en el cierre para aumentar control y tensión en el pectoral.",
            coachingNotes: "Pausar sin encoger hombros ni perder posición torácica."
          }
        ]
      }),
      squatExercise({
        name: "Cable fly",
        equipment: ["Polea"],
        technicalDescription:
          "Realiza aperturas en polea con ligera flexión de codo, controlando la vuelta y manteniendo pecho abierto. La tensión debe ser continua y sin tirónes.",
        errorsToAvoid: ["Convertirlo en press", "Perder postura", "Cruzar brazos con impulso"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 1, anteriorDelts: 0.4, core: 0.2 },
        variants: [
          {
            id: "cable-fly-variant-high-to-low",
            name: "Aperturas en polea de arriba abajo",
            type: "direction",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description:
              "Variante con trayectoria descendente que modifica la línea de fuerza y el énfasis del pectoral.",
            coachingNotes: "Mantener codos ligeramente flexionados y no convertirlo en un press."
          },
          {
            id: "cable-fly-variant-low-to-high",
            name: "Aperturas en polea de abajo arriba",
            type: "direction",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description:
              "Variante con trayectoria ascendente, orientada a modificar el ángulo de trabajo del pectoral.",
            coachingNotes: "Evitar elevar hombros o compensar con extensión lumbar."
          },
          {
            id: "cable-fly-variant-mid",
            name: "Aperturas en polea a media altura",
            type: "direction",
            difficulty: "basic",
            equipment: ["Polea"],
            description: "Variante a media altura con trayectoria horizontal controlada.",
            coachingNotes: "Mantener tensión continua y controlar la apertura sin perder escápulas."
          },
          {
            id: "cable-fly-variant-unilateral",
            name: "Apertura unilateral en polea",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante unilateral que permite ajustar trayectoria y trabajar control asimétrico.",
            coachingNotes: "Evitar rotar el tronco para mover más carga."
          }
        ]
      })
    ]
  },
  {
    slug: "upper-body-accessories-shoulders",
    pattern: "Upper Body Accessories",
    block: "Shoulder accessories",
    exercises: [
      squatExercise({
        name: "Lateral raise",
        equipment: ["Mancuernas", "Polea"],
        technicalDescription:
          "Eleva los brazos hacia los lados manteniendo cuello relajado y control del peso. Debe verse recorrido limpio, sin balanceo ni subida excesiva del hombro.",
        errorsToAvoid: ["Balancear el tronco", "Subir con trapecio", "Flexionar demasiado los codos"],
        primaryMuscles: ["Deltoides lateral"],
        secondaryMuscles: ["Trapecio superior", "Manguito rotador"],
        fatigueMap: { lateralDelts: 1, upperTraps: 0.3, rotatorCuff: 0.2 },
        variants: [
          {
            id: "lateral-raise-variant-dumbbells",
            name: "Elevación lateral con mancuernas",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuernas"],
            description: "Variante clásica para trabajar deltoides medio con carga libre.",
            coachingNotes: "Evitar balanceo y mantener control del recorrido."
          },
          {
            id: "lateral-raise-variant-cable",
            name: "Elevación lateral en polea",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante en polea que permite tensión más continua durante el recorrido.",
            coachingNotes: "Ajustar la altura de la polea y evitar compensar con inclinación excesiva."
          },
          {
            id: "lateral-raise-variant-lean-away",
            name: "Elevación lateral inclinado",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Mancuerna", "Polea", "Soporte"],
            description:
              "Variante con inclinación del cuerpo para modificar la curva de resistencia y aumentar el control.",
            coachingNotes: "Usar cargas bajas y mantener movimiento limpio."
          },
          {
            id: "lateral-raise-variant-partial-top",
            name: "Elevación lateral parcial arriba",
            type: "range",
            difficulty: "advanced",
            equipment: ["Mancuernas", "Polea"],
            description: "Variante parcial en la zona alta del recorrido para aumentar tensión específica.",
            coachingNotes: "No usar si genera molestias de hombro o pérdida de control escapular."
          }
        ]
      }),
      squatExercise({
        name: "Reverse fly machine",
        equipment: ["Máquina"],
        technicalDescription:
          "Realiza aperturas inversas en máquina con codos suaves y escápulas controladas. Mantén pecho apoyado y evita impulsar la carga.",
        errorsToAvoid: ["Encoger hombros", "Flexionar demasiado codos", "Perder control en la vuelta"],
        primaryMuscles: ["Deltoides posterior"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Manguito rotador"],
        fatigueMap: { rearDelts: 1, midBack: 0.5, lowerTraps: 0.3, rotatorCuff: 0.3 },
        variants: [
          {
            id: "reverse-fly-machine-variant-neutral-grip",
            name: "Reverse fly agarre neutro",
            type: "grip",
            difficulty: "basic",
            equipment: ["Máquina"],
            description:
              "Variante con agarre neutro para trabajar deltoides posterior y espalda alta con trayectoria guiada.",
            coachingNotes: "Mantener pecho apoyado y evitar encoger hombros."
          },
          {
            id: "reverse-fly-machine-variant-pronated-grip",
            name: "Reverse fly agarre prono",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description:
              "Variante con agarre prono que modifica la posición del hombro y la sensación de trabajo posterior.",
            coachingNotes: "Controlar el final del recorrido sin perder posición escapular."
          },
          {
            id: "reverse-fly-machine-variant-paused",
            name: "Reverse fly con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Máquina"],
            description:
              "Variante con pausa al final de la apertura para enfatizar control escapular y deltoides posterior.",
            coachingNotes: "Pausar sin elevar hombros ni arquear la espalda."
          }
        ]
      }),
      squatExercise({
        id: "upper-body-accessories-shoulder-band-pull-apart",
        name: "Band Pull Apart",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Ejercicio accesorio de tracción horizontal con banda elástica orientado a deltoides posterior, manguito rotador y control escapular. Separar la banda manteniendo brazos controlados y escápulas estables.",
        errorsToAvoid: [
          "arquear la zona lumbar",
          "encoger hombros",
          "flexionar demasiado los codos",
          "tirar con impulso",
          "perder control escapular"
        ],
        primaryMuscles: ["Deltoides posterior", "Manguito rotador"],
        secondaryMuscles: ["Trapecio medio", "Romboides", "Core"],
        fatigueMap: { shoulders: 0.25, rotatorCuff: 0.3, upperBack: 0.3, traps: 0.2, core: 0.1 },
        variants: [
          {
            id: "band-pull-apart-variant-pronated",
            name: "Band pull apart agarre prono",
            type: "grip",
            difficulty: "basic",
            equipment: ["Banda elástica"],
            description: "Variante con agarre prono para trabajar apertura horizontal y control escapular.",
            coachingNotes: "Mantener brazos activos y no arquear la zona lumbar."
          },
          {
            id: "band-pull-apart-variant-supinated",
            name: "Band pull apart agarre supino",
            type: "grip",
            difficulty: "basic",
            equipment: ["Banda elástica"],
            description:
              "Variante con agarre supino que modifica la rotación del hombro y la sensación de trabajo escapular.",
            coachingNotes: "Usar una banda que permita recorrido completo sin compensaciones."
          },
          {
            id: "band-pull-apart-variant-diagonal",
            name: "Band pull apart diagonal",
            type: "direction",
            difficulty: "intermediate",
            equipment: ["Banda elástica"],
            description: "Variante diagonal para integrar control escapular en una trayectoria menos lineal.",
            coachingNotes: "Mantener tensión constante y alternar lados con control."
          }
        ]
      }),
      squatExercise({
        name: "Face pull",
        equipment: ["Polea", "Banda"],
        technicalDescription:
          "Tira hacia la cara con codos altos, rotación externa y escápulas controladas. Debe verse deltoides posterior y espalda media trabajando sin elevar hombros.",
        errorsToAvoid: ["Convertirlo en remo bajo", "Arquear lumbar", "Encoger hombros"],
        primaryMuscles: ["Deltoides posterior", "Espalda media"],
        secondaryMuscles: ["Trapecio inferior", "Manguito rotador", "Bíceps"],
        fatigueMap: { rearDelts: 0.8, midBack: 0.6, lowerTraps: 0.5, rotatorCuff: 0.5, biceps: 0.2 },
        variants: [
          {
            id: "face-pull-variant-rope",
            name: "Face pull con cuerda",
            type: "material",
            difficulty: "basic",
            equipment: ["Polea", "Cuerda"],
            description:
              "Variante en polea con cuerda para trabajar tracción hacia la cara, rotación externa y control escapular.",
            coachingNotes: "Tirar hacia la zona de la cara sin extender la zona lumbar."
          },
          {
            id: "face-pull-variant-band",
            name: "Face pull con banda",
            type: "material",
            difficulty: "basic",
            equipment: ["Banda elástica"],
            description:
              "Variante con banda elástica, útil para calentamiento, activación o trabajo accesorio ligero.",
            coachingNotes: "Controlar la vuelta y no perder tensión de la banda."
          },
          {
            id: "face-pull-variant-high-to-low",
            name: "Face pull de arriba abajo",
            type: "direction",
            difficulty: "intermediate",
            equipment: ["Polea", "Cuerda"],
            description: "Variante con trayectoria ligeramente descendente para modificar la línea de tracción.",
            coachingNotes: "Mantener hombros bajos y controlar la rotación externa."
          },
          {
            id: "face-pull-variant-paused",
            name: "Face pull con pausa",
            type: "tempo",
            difficulty: "intermediate",
            equipment: ["Polea", "Cuerda", "Banda elástica"],
            description: "Variante con pausa al final del tirón para reforzar control escapular.",
            coachingNotes: "No compensar la pausa con extensión cervical o lumbar."
          }
        ]
      })
    ]
  },
  {
    slug: "upper-body-accessories-arms",
    pattern: "Upper Body Accessories",
    block: "Arm accessories",
    exercises: [
      squatExercise({
        name: "Triceps extension",
        equipment: ["Polea", "Mancuerna"],
        technicalDescription:
          "Extiende los codos manteniendo brazos estables y controlando la vuelta. El movimiento debe centrarse en el codo sin compensar con hombros o tronco.",
        errorsToAvoid: ["Mover los codos", "Usar impulso", "Perder control en la fase excéntrica"],
        primaryMuscles: ["Tríceps"],
        secondaryMuscles: ["Antebrazos", "Hombros"],
        fatigueMap: { triceps: 1, forearms: 0.2, shoulders: 0.1 },
        variants: [
          {
            id: "triceps-extension-variant-cable-rope",
            name: "Extensión de tríceps en polea con cuerda",
            type: "material",
            difficulty: "basic",
            equipment: ["Polea", "Cuerda"],
            description:
              "Variante en polea con cuerda para trabajar extensión de codo con tensión continua.",
            coachingNotes: "Mantener codos estables y evitar balanceo del tronco."
          },
          {
            id: "triceps-extension-variant-cable-bar",
            name: "Extensión de tríceps en polea con barra",
            type: "material",
            difficulty: "basic",
            equipment: ["Polea", "Barra corta"],
            description: "Variante en polea con barra para permitir mayor estabilidad de agarre.",
            coachingNotes: "No separar los codos ni usar impulso."
          },
          {
            id: "triceps-extension-variant-overhead-cable",
            name: "Extensión de tríceps overhead en polea",
            type: "range",
            difficulty: "intermediate",
            equipment: ["Polea", "Cuerda"],
            description:
              "Variante overhead que aumenta la demanda del tríceps en posición de hombro flexionado.",
            coachingNotes: "Mantener costillas controladas y evitar hiperextensión lumbar."
          },
          {
            id: "triceps-extension-variant-dumbbell-overhead",
            name: "Extensión de tríceps overhead con mancuerna",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuerna"],
            description:
              "Variante con mancuerna por encima de la cabeza para trabajar extensión de codo con carga libre.",
            coachingNotes: "Controlar el rango y evitar molestias de hombro."
          },
          {
            id: "triceps-extension-variant-unilateral-cable",
            name: "Extensión de tríceps unilateral en polea",
            type: "stance",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description: "Variante unilateral que permite ajustar trayectoria y corregir asimetrías.",
            coachingNotes: "Mantener hombro estable y no rotar el tronco."
          }
        ]
      }),
      squatExercise({
        name: "Biceps curl",
        equipment: ["Mancuernas", "Barra", "Polea"],
        technicalDescription:
          "Flexiona los codos manteniendo brazos estables y muñecas controladas. Sube sin balancear y baja con control para mantener tensión en biceps.",
        errorsToAvoid: ["Balancear el tronco", "Mover codos hacia delante", "Perder control excéntrico"],
        primaryMuscles: ["Bíceps"],
        secondaryMuscles: ["Antebrazos", "Deltoides anterior"],
        fatigueMap: { biceps: 1, forearms: 0.4, anteriorDelts: 0.1 },
        variants: [
          {
            id: "biceps-curl-variant-dumbbells",
            name: "Curl de bíceps con mancuernas",
            type: "material",
            difficulty: "basic",
            equipment: ["Mancuernas"],
            description: "Variante clásica con mancuernas para flexión de codo con libertad de movimiento.",
            coachingNotes: "Evitar balanceo y mantener control de la fase excéntrica."
          },
          {
            id: "biceps-curl-variant-barbell",
            name: "Curl de bíceps con barra",
            type: "material",
            difficulty: "basic",
            equipment: ["Barra"],
            description: "Variante con barra que permite mayor estabilidad y carga bilateral.",
            coachingNotes: "Mantener codos cerca del cuerpo y no compensar con la espalda."
          },
          {
            id: "biceps-curl-variant-cable",
            name: "Curl de bíceps en polea",
            type: "material",
            difficulty: "basic",
            equipment: ["Polea"],
            description: "Variante en polea para mantener tensión continua durante el recorrido.",
            coachingNotes: "Controlar la extensión completa sin perder posición del hombro."
          },
          {
            id: "biceps-curl-variant-hammer",
            name: "Curl martillo",
            type: "grip",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Cuerda", "Polea"],
            description: "Variante con agarre neutro que modifica la demanda de flexores del codo.",
            coachingNotes: "Evitar balanceo y mantener muñeca neutra."
          },
          {
            id: "biceps-curl-variant-incline",
            name: "Curl inclinado con mancuernas",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Banco inclinado"],
            description:
              "Variante con hombro extendido y apoyo en banco inclinado, aumentando el rango y la demanda de control.",
            coachingNotes: "Usar cargas moderadas y no adelantar los hombros al subir."
          },
          {
            id: "biceps-curl-variant-bayesian",
            name: "Bayesian curl en polea",
            type: "support",
            difficulty: "intermediate",
            equipment: ["Polea"],
            description:
              "Variante en polea con el brazo ligeramente por detrás del cuerpo, modificando el ángulo de trabajo.",
            coachingNotes: "Mantener hombro estable y evitar rotar el tronco."
          }
        ]
      }),
      squatExercise({
        name: "Spider curl",
        equipment: ["Mancuernas", "Barra"],
        technicalDescription:
          "Realiza curl con pecho apoyado en banco inclinado, dejando brazos colgar y flexionando codos sin balanceo. Mantén tensión y control total.",
        errorsToAvoid: ["Despegar el pecho", "Acortar rango", "Usar impulso"],
        primaryMuscles: ["Bíceps"],
        secondaryMuscles: ["Antebrazos"],
        fatigueMap: { biceps: 1, forearms: 0.3 },
        variants: [
          {
            id: "spider-curl-variant-dumbbells",
            name: "Spider curl con mancuernas",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Mancuernas", "Banco inclinado"],
            description: "Variante con mancuernas y apoyo en banco inclinado para limitar compensaciones.",
            coachingNotes: "Mantener brazos colgando y no despegar el pecho del banco."
          },
          {
            id: "spider-curl-variant-bar",
            name: "Spider curl con barra",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra", "Banco inclinado"],
            description: "Variante con barra que facilita carga bilateral estable.",
            coachingNotes: "Evitar balanceo y controlar la bajada."
          },
          {
            id: "spider-curl-variant-ez-bar",
            name: "Spider curl con barra EZ",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Barra EZ", "Banco inclinado"],
            description: "Variante con barra EZ que puede ser más cómoda para muñecas y codos.",
            coachingNotes: "Mantener recorrido controlado y sin impulso."
          }
        ]
      }),
      squatExercise({
        name: "Preacher curl",
        equipment: ["Banco predicador", "Máquina"],
        technicalDescription:
          "Flexiona los codos con brazos apoyados en banco predicador o máquina. Controla la bajada y evita perder tensión al extender.",
        errorsToAvoid: ["Hiperextender el codo", "Levantar brazos del apoyo", "Rebotar abajo"],
        primaryMuscles: ["Bíceps"],
        secondaryMuscles: ["Antebrazos"],
        fatigueMap: { biceps: 1, forearms: 0.3 },
        variants: [
          {
            id: "preacher-curl-variant-ez-bar",
            name: "Curl predicador con barra EZ",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Banco predicador", "Barra EZ"],
            description: "Variante clásica en banco predicador con barra EZ para limitar compensaciones.",
            coachingNotes: "No bloquear el codo agresivamente al final del recorrido."
          },
          {
            id: "preacher-curl-variant-dumbbell",
            name: "Curl predicador con mancuerna",
            type: "material",
            difficulty: "intermediate",
            equipment: ["Banco predicador", "Mancuerna"],
            description:
              "Variante unilateral con mancuerna que permite ajustar trayectoria y detectar asimetrías.",
            coachingNotes: "Mantener brazo apoyado y controlar la fase excéntrica."
          },
          {
            id: "preacher-curl-variant-machine",
            name: "Curl predicador en máquina",
            type: "support",
            difficulty: "basic",
            equipment: ["Máquina predicador"],
            description: "Variante guiada que facilita estabilidad y control del recorrido.",
            coachingNotes: "Ajustar asiento y apoyo para que el eje del codo sea cómodo."
          }
        ]
      })
    ]
  },
  {
    slug: "mobility-movement-prep-neck-spine",
    pattern: "Mobility / Movement Prep",
    block: "Neck and spine mobility",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        name: "Cervical mobility drill",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Moviliza la columna cervical en rangos suaves de flexión, extensión, inclinación y rotación. Mantén respiración tranquila y evita dolor o mareo.",
        errorsToAvoid: ["Forzar el cuello", "Moverse rápido", "Compensar con hombros"],
        primaryMuscles: ["Columna cervical"],
        secondaryMuscles: ["Trapecio superior", "Flexores cervicales"],
        fatigueMap: { cervicalSpine: 0.5, upperTraps: 0.2, neckFlexors: 0.2 }
      }),
      squatExercise({
        name: "Cat-cow / Cat camel",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad suave de columna en cuadrupedia. Alternar flexión y extensión de columna coordinando pelvis, columna torácica y cervical de forma controlada.",
        errorsToAvoid: [
          "Hacer el movimiento rápido",
          "Forzar el cuello",
          "Hundir la zona lumbar sin control",
          "Bloquear la respiración",
          "Mover solo la zona cervical o solo la lumbar"
        ],
        primaryMuscles: ["Columna torácica", "Estabilizadores lumbares"],
        secondaryMuscles: ["Core"],
        fatigueMap: { spinalErectors: 0.15, core: 0.15 }
      })
    ]
  },
  {
    slug: "mobility-movement-prep-shoulder-mobility-activation",
    pattern: "Mobility / Movement Prep",
    block: "Shoulder mobility & activation",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        id: "mobility-movement-prep-upper-body-1",
        name: "Shoulder CARs",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza círculos articulares lentos de hombro manteniendo costillas controladas. Busca rango activo sin compensar con tronco o cuello.",
        errorsToAvoid: ["Arquear lumbar", "Encoger hombros", "Acelerar el movimiento"],
        primaryMuscles: ["Hombros"],
        secondaryMuscles: ["Manguito rotador", "Trapecio superior"],
        fatigueMap: { shoulders: 0.5, rotatorCuff: 0.3, upperTraps: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-upper-body-2",
        name: "Scapular mobility drill",
        equipment: ["Peso corporal", "Banda elástica"],
        technicalDescription:
          "Moviliza escápulas en retracción, protracción, elevación y depresión con control. Mantén cuello relajado y costillas estables.",
        errorsToAvoid: ["Encoger cuello", "Doblar codos si no toca", "Perder postura"],
        primaryMuscles: ["Escápulas"],
        secondaryMuscles: ["Serrato anterior", "Trapecio"],
        fatigueMap: { serratusAnterior: 0.3, traps: 0.2, shoulders: 0.2 }
      }),
      squatExercise({
        id: "mobility-movement-prep-shoulder-mobility-activation-scapular-retraction-band",
        name: "Retracción escapular con goma",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Ejercicio de activación y control escapular con banda elástica. Realizar retracción escapular manteniendo cuello relajado, costillas controladas y sin compensar con extensión lumbar.",
        errorsToAvoid: [
          "encoger los hombros",
          "tirar con los brazos en vez de mover escápulas",
          "arquear la zona lumbar",
          "adelantar la cabeza",
          "usar demasiada tensión de banda"
        ],
        primaryMuscles: ["Espalda alta", "Trapecio"],
        secondaryMuscles: ["Trapecio inferior", "Manguito rotador", "Hombros", "Core"],
        fatigueMap: { upperBack: 0.3, traps: 0.25, lowerTraps: 0.2, rotatorCuff: 0.15, shoulders: 0.15, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-upper-body-3",
        name: "Wall slide",
        equipment: ["Pared", "Banda elástica"],
        technicalDescription:
          "Desliza brazos por la pared manteniendo costillas controladas y escápulas activas. Busca elevación limpia sin arquear la espalda.",
        errorsToAvoid: ["Arquear lumbar", "Elevar hombros en exceso", "Perder contacto con la pared"],
        primaryMuscles: ["Hombros", "Serrato anterior"],
        secondaryMuscles: ["Trapecio inferior", "Core"],
        fatigueMap: { shoulders: 0.4, serratusAnterior: 0.3, lowerTraps: 0.2, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-shoulder-mobility-activation-7",
        name: "Rotación interna y externa de hombro",
        equipment: ["Peso corporal", "Pica", "Banda suave", "Pared", "Banco"],
        technicalDescription:
          "Ejercicio de movilidad y control de rotación interna y externa de hombro. Trabajar el rango disponible manteniendo escápula controlada y sin compensar con tronco o cuello. Puede realizarse sentado con referencia de pared como regresión para controlar mejor la rotación externa.",
        errorsToAvoid: [
          "Adelantar la cabeza",
          "Elevar el hombro",
          "Rotar el tronco para ganar rango",
          "Forzar dolor",
          "Perder control escapular"
        ],
        primaryMuscles: ["Manguito rotador"],
        secondaryMuscles: ["Hombros", "Espalda alta", "Core"],
        fatigueMap: { rotatorCuff: 0.3, shoulders: 0.2, upperBack: 0.15, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-shoulder-mobility-activation-external-rotation-band",
        name: "Rotación externa con goma",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Ejercicio de activación del manguito rotador con banda elástica. Mantener el codo próximo al cuerpo o apoyado según variante, controlar la escápula y realizar rotación externa sin compensar con tronco ni muñeca.",
        errorsToAvoid: [
          "separar excesivamente el codo",
          "girar el tronco",
          "elevar el hombro",
          "perder control escapular",
          "usar demasiada tensión de banda",
          "mover la muñeca en vez del hombro"
        ],
        primaryMuscles: ["Manguito rotador"],
        secondaryMuscles: ["Hombros", "Espalda alta", "Core"],
        fatigueMap: { rotatorCuff: 0.4, shoulders: 0.2, upperBack: 0.2, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-upper-body-4",
        name: "Movilidad de hombro con pica",
        equipment: ["Pica", "PVC", "Banda elástica"],
        technicalDescription:
          "Ejercicio de movilidad global de hombro con pica, PVC o banda. Agrupa circunducciones de hombro, flexión máxima de hombro y pasadas tipo band shoulder dislocates, manteniendo costillas controladas y rango sin dolor.",
        errorsToAvoid: [
          "Arquear la zona lumbar",
          "Elevar excesivamente los hombros",
          "Flexionar los codos para ganar rango",
          "Mover rápido sin control",
          "Forzar dolor en el hombro"
        ],
        primaryMuscles: ["Hombros"],
        secondaryMuscles: ["Manguito rotador", "Pectoral", "Dorsal", "Espalda alta", "Core"],
        fatigueMap: { shoulders: 0.25, rotatorCuff: 0.2, chest: 0.15, lats: 0.15, upperBack: 0.15, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-shoulder-mobility-activation-shoulder-band-mobility",
        name: "Movilidad de hombro con superband",
        equipment: ["Superband"],
        technicalDescription:
          "Ejercicio de movilidad y control escapulohumeral con superband. Agrupa variantes de antepulsión y retropulsión de hombro, incluyendo retropulsión con rotación, usando asistencia suave sin perder posición costal ni control escapular.",
        errorsToAvoid: [
          "Usar demasiada tensión de banda",
          "Compensar con el tronco",
          "Elevar los hombros",
          "Perder control escapular",
          "Hacer rebotes rápidos"
        ],
        primaryMuscles: ["Hombros", "Manguito rotador"],
        secondaryMuscles: ["Espalda alta", "Core"],
        fatigueMap: { shoulders: 0.25, rotatorCuff: 0.25, upperBack: 0.2, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-shoulder-mobility-activation-11",
        name: "Flexo-extensión de hombro con fitball",
        equipment: ["Fitball"],
        technicalDescription:
          "Ejercicio de movilidad de hombro y tronco usando fitball como apoyo. Deslizar los brazos sobre el fitball buscando flexión y extensión controlada de hombro, manteniendo respiración y control de columna.",
        errorsToAvoid: [
          "Hundir la zona lumbar",
          "Perder control de las costillas",
          "Cargar demasiado peso sobre el fitball",
          "Elevar los hombros",
          "Moverse rápido sin control"
        ],
        primaryMuscles: ["Hombros"],
        secondaryMuscles: ["Espalda alta", "Dorsal", "Core"],
        fatigueMap: { shoulders: 0.2, upperBack: 0.15, lats: 0.15, core: 0.15 }
      })
    ]
  },
  {
    slug: "mobility-movement-prep-hip-mobility-activation",
    pattern: "Mobility / Movement Prep",
    block: "Hip mobility & activation",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-1",
        name: "Movilidad de cadera en decúbito supino",
        equipment: ["Peso corporal", "Miniband"],
        technicalDescription:
          "Ejercicio de movilidad y control de cadera en decúbito supino. Agrupa variantes de abducción-aducción y circunducción de cadera, manteniendo pelvis estable y recorrido controlado. Puede realizarse con peso corporal o miniband suave como activación.",
        errorsToAvoid: [
          "Rotar la pelvis",
          "Arquear la zona lumbar",
          "Buscar demasiado rango perdiendo control",
          "Mover la pierna con impulso",
          "Convertir el movimiento en flexión de cadera"
        ],
        primaryMuscles: ["Caderas", "Glúteo medio"],
        secondaryMuscles: ["Glúteos", "Aductores", "Core"],
        fatigueMap: { gluteMed: 0.3, glutes: 0.2, adductors: 0.2, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-lower-body-2",
        name: "Circunducción de cadera sentado en silla",
        equipment: ["Peso corporal", "Silla"],
        technicalDescription:
          "Ejercicio de movilidad de cadera en posición sentada. Realizar círculos controlados con la cadera, combinando flexión, abducción y rotación sin compensar con el tronco.",
        errorsToAvoid: [
          "Inclinar el tronco para ganar rango",
          "Mover la pelvis en exceso",
          "Usar impulso",
          "Perder control del recorrido",
          "Forzar el rango"
        ],
        primaryMuscles: ["Caderas", "Glúteo medio"],
        secondaryMuscles: ["Glúteos", "Aductores", "Core"],
        fatigueMap: { gluteMed: 0.25, glutes: 0.2, adductors: 0.15, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-2",
        name: "Abducción de cadera en cuadrupedia",
        equipment: ["Peso corporal", "Miniband"],
        technicalDescription:
          "Ejercicio de activación y control lumbopélvico en cuadrupedia. Separar la rodilla hacia fuera manteniendo columna y pelvis estables. Puede realizarse con peso corporal o con miniband suave para aumentar la activación.",
        errorsToAvoid: [
          "Rotar la pelvis",
          "Hundir la zona lumbar",
          "Desplazar demasiado el peso corporal",
          "Convertirlo en extensión de cadera",
          "Usar impulso"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { gluteMed: 0.45, glutes: 0.25, core: 0.2 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-3",
        name: "Clamshell con miniband",
        equipment: ["Miniband"],
        technicalDescription:
          "Ejercicio de activación de glúteo medio en decúbito lateral con caderas y rodillas flexionadas. Mantener los pies juntos y abrir la rodilla superior contra la resistencia de la miniband sin rotar la pelvis.",
        errorsToAvoid: [
          "Girar la pelvis hacia atrás",
          "Separar los pies",
          "Hacer el movimiento demasiado rápido",
          "Compensar con la zona lumbar",
          "Perder tensión de la miniband"
        ],
        primaryMuscles: ["Glúteo medio", "Glúteo menor"],
        secondaryMuscles: ["Glúteo mayor", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { gluteMed: 0.5, glutes: 0.25, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-lower-body-3",
        name: "Rotaciones de cadera en 90-90",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad y control de rotación interna y externa de cadera en posición 90-90. Cambiar de lado o trabajar rotaciones manteniendo pelvis y tronco controlados. Puede realizarse con apoyo de manos como regresión o sin apoyo como progresión.",
        errorsToAvoid: [
          "Compensar con inclinación del tronco",
          "Perder control de la pelvis",
          "Forzar la rodilla",
          "Mover desde la zona lumbar en vez de la cadera",
          "Hacer el cambio con impulso"
        ],
        primaryMuscles: ["Caderas", "Glúteo medio"],
        secondaryMuscles: ["Glúteos", "Aductores", "Core"],
        fatigueMap: { gluteMed: 0.3, glutes: 0.2, adductors: 0.2, core: 0.15 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-hip-internal-rotation",
        name: "Rotación interna de cadera",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad y control de rotación interna de cadera. Trabajar el rango disponible manteniendo pelvis estable y evitando compensaciones lumbares o de rodilla.",
        errorsToAvoid: [
          "mover la pelvis para ganar rango",
          "forzar la rodilla",
          "compensar con la zona lumbar",
          "perder control del recorrido",
          "buscar rango con dolor"
        ],
        primaryMuscles: ["Caderas", "Glúteo medio"],
        secondaryMuscles: ["Glúteos", "Aductores", "Core"],
        fatigueMap: { gluteMed: 0.3, glutes: 0.2, adductors: 0.15, core: 0.15 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-supported-hip-internal-rotation",
        name: "Rotación interna apoyo de cadera",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Ejercicio de control de cadera con apoyo, orientado a mejorar la rotación interna y la estabilidad lumbopélvica. Mantener apoyo estable, pelvis controlada y rotar desde la cadera sin perder alineación de rodilla y pie.",
        errorsToAvoid: [
          "colapsar la rodilla",
          "perder apoyo del pie",
          "rotar desde la lumbar",
          "desplazar la pelvis sin control",
          "forzar el rango"
        ],
        primaryMuscles: ["Caderas", "Glúteo medio"],
        secondaryMuscles: ["Glúteos", "Aductores", "Core", "Cuádriceps"],
        fatigueMap: { gluteMed: 0.35, glutes: 0.25, adductors: 0.15, core: 0.2, quadriceps: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-b-stance-internal-rotation",
        name: "B-stance con rotación interna de cadera",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad y control de cadera en posición B-stance. Colocar una pierna adelantada como pierna principal y la pierna trasera como apoyo ligero. Desde esa posición, inclinar el tronco de forma controlada manteniendo columna estable y permitir una rotación interna suave hacia la pierna adelantada, buscando control de pelvis y cadera sin carga externa.",
        errorsToAvoid: [
          "Cargar demasiado la pierna trasera",
          "Colapsar la rodilla de la pierna adelantada",
          "Rotar desde la zona lumbar en vez de desde la cadera",
          "Perder columna neutra",
          "Buscar rango excesivo sin control",
          "Convertirlo en una sentadilla",
          "Perder apoyo estable del pie delantero"
        ],
        primaryMuscles: ["Glúteo mayor", "Isquiosurales"],
        secondaryMuscles: ["Glúteo medio", "Aductores", "Core / estabilizadores lumbopélvicos"],
        fatigueMap: { glutes: 0.3, hamstrings: 0.25, gluteMed: 0.2, adductors: 0.1, core: 0.15 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-6",
        name: "Bisagra de cadera con pica",
        equipment: ["Pica", "PVC"],
        technicalDescription:
          "Ejercicio de movilidad y aprendizaje del patrón de bisagra de cadera. Colocar la pica en contacto con cabeza, zona dorsal y sacro, y llevar la cadera hacia atrás manteniendo columna neutra y control de la pelvis.",
        errorsToAvoid: [
          "Perder contacto con la pica",
          "Flexionar demasiado las rodillas",
          "Redondear la zona lumbar",
          "Convertirlo en una sentadilla",
          "Mover la columna en vez de la cadera"
        ],
        primaryMuscles: ["Glúteos", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.25, hamstrings: 0.25, spinalErectors: 0.15, core: 0.15 }
      }),
      squatExercise({
        id: "mobility-movement-prep-hip-mobility-activation-adductor-rockback",
        name: "Adductor rockback",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde cuadrupedia con una pierna extendida lateralmente, lleva la cadera atrás y vuelve con control. Mantén columna neutra y tensión tolerable.",
        errorsToAvoid: ["Redondear lumbar", "Forzar la ingle", "Rebotar"],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Caderas", "Core"],
        fatigueMap: { adductors: 0.4, hips: 0.3, core: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-integrated-2",
        name: "Sentadilla asiática",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Sentadilla profunda mantenida utilizada como movilidad global de tren inferior. Buscar una posición profunda con talones apoyados, cadera baja, rodillas flexionadas y tronco lo más erguido posible dentro del rango disponible.",
        errorsToAvoid: [
          "Despegar los talones sin control",
          "Colapsar rodillas hacia dentro",
          "Redondear excesivamente la espalda",
          "Forzar el rango",
          "Perder la respiración o tensión relajada"
        ],
        primaryMuscles: ["Cuádriceps", "Glúteos"],
        secondaryMuscles: ["Aductores", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.25, glutes: 0.25, adductors: 0.2, calves: 0.2, core: 0.15 }
      })
    ]
  },
  {
    slug: "mobility-movement-prep-ankle-mobility",
    pattern: "Mobility / Movement Prep",
    block: "Ankle mobility",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        id: "mobility-movement-prep-lower-body-1",
        name: "Dorsiflexión de tobillo asistida semiarrodillado",
        equipment: ["Mancuerna"],
        technicalDescription:
          "Ejercicio de movilidad de dorsiflexión en posición semiarrodillada. Llevar la rodilla hacia delante sobre el pie usando una mancuerna como asistencia o carga suave, manteniendo el talón apoyado y controlando la alineación de la rodilla.",
        errorsToAvoid: ["Levantar el talón", "Colapsar la rodilla hacia dentro", "Girar el pie", "Usar demasiada carga", "Perder control del rango final"],
        primaryMuscles: ["Tobillo"],
        secondaryMuscles: ["Gemelos", "Cuádriceps", "Glúteos", "Core"],
        fatigueMap: { calves: 0.2, quadriceps: 0.1, glutes: 0.1, core: 0.1 }
      }),
      squatExercise({
        name: "Dorsiflexión resistida con superband",
        equipment: ["Superband"],
        technicalDescription:
          "Ejercicio de movilidad de tobillo con resistencia/asistencia de superband. Colocar la banda para facilitar el deslizamiento articular y llevar la rodilla hacia delante manteniendo el talón apoyado.",
        errorsToAvoid: ["Colocar mal la banda", "Perder apoyo del talón", "Colapsar la rodilla hacia dentro", "Hacer rebotes sin control", "Forzar dolor en el tobillo"],
        primaryMuscles: ["Tobillo"],
        secondaryMuscles: ["Gemelos", "Cuádriceps", "Core"],
        fatigueMap: { calves: 0.2, quadriceps: 0.1, core: 0.1 }
      }),
      squatExercise({
        name: "Dorsiflexión de tobillo con abducción de cadera semiarrodillado",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad combinada de tobillo y cadera. En posición semiarrodillada, llevar la rodilla hacia delante y ligeramente hacia fuera, buscando dorsiflexión y apertura de cadera con control.",
        errorsToAvoid: ["Levantar el talón", "Perder alineación pie-rodilla", "Rotar la pelvis", "Forzar demasiado la cadera", "Hacer el movimiento con impulso"],
        primaryMuscles: ["Tobillo", "Caderas"],
        secondaryMuscles: ["Gemelos", "Glúteo medio", "Aductores", "Core"],
        fatigueMap: { calves: 0.2, gluteMed: 0.25, adductors: 0.15, core: 0.1 }
      }),
      squatExercise({
        name: "Dorsiflexión alterna en sentadilla profunda",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio integrado de movilidad de tobillo en sentadilla profunda. Mantener la posición profunda y alternar el avance de cada rodilla hacia delante, trabajando la dorsiflexión de una pierna y luego de la otra.",
        errorsToAvoid: ["Despegar los talones", "Perder la posición profunda", "Colapsar rodillas hacia dentro", "Redondear excesivamente la espalda", "Moverse demasiado rápido"],
        primaryMuscles: ["Tobillo", "Caderas"],
        secondaryMuscles: ["Gemelos", "Cuádriceps", "Glúteos", "Core"],
        fatigueMap: { calves: 0.25, quadriceps: 0.2, glutes: 0.2, core: 0.15 }
      })
    ]
  },
  {
    slug: "mobility-movement-prep-thoracic-trunk-mobility",
    pattern: "Mobility / Movement Prep",
    block: "Thoracic & trunk mobility",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        id: "mobility-movement-prep-neck-spine-3",
        name: "Rotación torácica sentado con brazos en pecho",
        equipment: ["Peso corporal", "Silla"],
        technicalDescription:
          "Ejercicio básico de rotación torácica en sedestación. Sentarse con pelvis estable, cruzar brazos sobre el pecho y rotar el tronco hacia un lado y otro sin compensar con la pelvis.",
        errorsToAvoid: ["Girar la pelvis", "Inclinar el tronco", "Elevar los hombros", "Forzar el cuello", "Hacer el movimiento rápido y sin control"],
        primaryMuscles: ["Columna torácica"],
        secondaryMuscles: ["Core", "Erectores espinales", "Oblicuos"],
        fatigueMap: { core: 0.2, spinalErectors: 0.15, obliques: 0.2 }
      }),
      squatExercise({
        id: "mobility-movement-prep-neck-spine-4",
        name: "Rotación torácica tumbado lateral (Open book)",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad torácica en decúbito lateral. Mantener rodillas flexionadas y pelvis estable, abrir el brazo y el pecho hacia el techo y hacia atrás como si se abriera un libro.",
        errorsToAvoid: ["Despegar las rodillas", "Girar la pelvis", "Arquear la zona lumbar", "Forzar el hombro", "Mover solo el brazo sin rotar el tronco"],
        primaryMuscles: ["Columna torácica"],
        secondaryMuscles: ["Core", "Erectores espinales", "Oblicuos"],
        fatigueMap: { core: 0.15, spinalErectors: 0.15, obliques: 0.2 }
      }),
      squatExercise({
        name: "Rotación torácica semiarrodillado en pared",
        equipment: ["Pared"],
        technicalDescription:
          "Variante típica de open book en posición semiarrodillada junto a una pared. Mantener pelvis estable, usar la pared como referencia y abrir el pecho rotando desde la columna torácica. Puede hacerse también sin pared como variante.",
        errorsToAvoid: ["Rotar la pelvis", "Perder la posición semiarrodillada", "Inclinar el tronco", "Forzar el hombro contra la pared", "Mover solo el brazo sin acompañar con el pecho"],
        primaryMuscles: ["Columna torácica"],
        secondaryMuscles: ["Core", "Erectores espinales", "Oblicuos", "Glúteos"],
        fatigueMap: { core: 0.2, spinalErectors: 0.15, obliques: 0.2, glutes: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-neck-spine-5",
        name: "Rotación torácica en cuadrupedia",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio de movilidad torácica en cuadrupedia. Desde apoyo de manos y rodillas, rotar el tronco llevando el codo o la mano hacia el techo manteniendo pelvis y zona lumbar controladas.",
        errorsToAvoid: ["Hundir la zona lumbar", "Desplazar demasiado el peso", "Rotar la pelvis", "Forzar el cuello", "Mover solo el brazo sin rotación torácica"],
        primaryMuscles: ["Columna torácica"],
        secondaryMuscles: ["Core", "Erectores espinales", "Oblicuos", "Hombros"],
        fatigueMap: { core: 0.2, spinalErectors: 0.15, obliques: 0.2, shoulders: 0.1 }
      }),
      squatExercise({
        name: "Inclinación lateral de tronco",
        equipment: ["Peso corporal", "Pared"],
        technicalDescription:
          "Ejercicio de movilidad lateral del tronco. Realizar inclinación lateral controlada buscando apertura de la cadena lateral y control entre costillas y pelvis. Variante básica: sentado en pared. Variante progresiva: semiarrodillado.",
        errorsToAvoid: ["Rotar el tronco en vez de inclinar", "Elevar el hombro", "Perder control de pelvis", "Compensar con la zona lumbar", "Forzar el rango"],
        primaryMuscles: ["Columna torácica", "Core"],
        secondaryMuscles: ["Erectores espinales", "Oblicuos"],
        fatigueMap: { core: 0.2, spinalErectors: 0.15, obliques: 0.25 }
      }),
      squatExercise({
        name: "Zancada adelante + rotación de tronco",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio integrado de movilidad de cadera y tronco. Realizar una zancada adelante y rotar el tronco hacia la pierna adelantada o hacia el lado abierto según el objetivo, manteniendo control de pelvis y rodilla.",
        errorsToAvoid: ["Perder alineación de la rodilla adelantada", "Rotar desde la lumbar sin control", "Perder equilibrio", "Colapsar la cadera", "Hacer la rotación con impulso"],
        primaryMuscles: ["Caderas", "Columna torácica"],
        secondaryMuscles: ["Glúteos", "Cuádriceps", "Aductores", "Core", "Gemelos"],
        fatigueMap: { glutes: 0.25, quadriceps: 0.2, adductors: 0.15, core: 0.25, calves: 0.1 }
      }),
      squatExercise({
        name: "Zancada lateral + rotación de tronco",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio integrado de movilidad de cadera, aductores y tronco. Realizar zancada lateral y añadir rotación de tronco, preferentemente hacia la pierna flexionada como referencia principal. La rotación hacia el lado abierto puede usarse como variante.",
        errorsToAvoid: ["Colapsar la rodilla de la pierna flexionada", "Perder apoyo del pie", "Forzar demasiado los aductores", "Rotar sin controlar la pelvis", "Usar impulso"],
        primaryMuscles: ["Caderas", "Columna torácica"],
        secondaryMuscles: ["Glúteos", "Glúteo medio", "Aductores", "Cuádriceps", "Core", "Gemelos"],
        fatigueMap: { glutes: 0.25, gluteMed: 0.2, adductors: 0.25, quadriceps: 0.2, core: 0.25, calves: 0.1 }
      })
    ]
  },
  {
    slug: "mobility-movement-prep-integrated",
    pattern: "Mobility / Movement Prep",
    block: "Integrated mobility",
    exerciseType: "mobility",
    allowedSessionSections: ["activation"],
    exercises: [
      squatExercise({
        name: "World greatest stretch",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Combina zancada, apertura de cadera y rotación torácica de forma fluida. Mantén control de apoyo y rango tolerado.",
        errorsToAvoid: ["Colapsar la rodilla", "Forzar la rotación", "Perder estabilidad"],
        primaryMuscles: ["Caderas", "Columna torácica"],
        secondaryMuscles: ["Aductores", "Flexores cadera", "Hombros"],
        fatigueMap: { hips: 0.5, thoracicSpine: 0.4, adductors: 0.2, hipFlexors: 0.2, shoulders: 0.1 }
      }),
      squatExercise({
        id: "mobility-movement-prep-integrated-3",
        name: "Inchworm",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Camina con las manos hacia plancha y vuelve acercando los pies con control. Mantén piernas activas, hombros estables y respiración fluida.",
        errorsToAvoid: ["Hundirse de lumbar", "Caminar sin control", "Forzar isquios"],
        primaryMuscles: ["Hombros", "Caderas"],
        secondaryMuscles: ["Isquios", "Gemelos", "Core"],
        fatigueMap: { shoulders: 0.3, hips: 0.3, hamstrings: 0.2, calves: 0.2, core: 0.2 }
      })
    ]
  },
  {
    slug: "core-trunk-control-ground-support",
    pattern: "Core / Trunk Control",
    block: "Ground support & transitions",
    exercises: [
      squatExercise({
        id: "core-trunk-control-ground-support-bear-walk-unilateral",
        name: "Bear walk unilateral",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Ejercicio global de apoyo y desplazamiento en cuadrupedia con énfasis en control unilateral, estabilidad de tronco, cintura escapular y cadera. Avanzar o mantener posición alternando apoyos sin perder alineación.",
        errorsToAvoid: [
          "hundir la zona lumbar",
          "rotar excesivamente la pelvis",
          "perder apoyo activo de manos",
          "elevar demasiado la cadera",
          "mover rápido sin control"
        ],
        primaryMuscles: ["Core", "Hombros"],
        secondaryMuscles: ["Serrato anterior", "Glúteos", "Cuádriceps"],
        fatigueMap: { core: 0.35, shoulders: 0.3, serratusAnterior: 0.25, glutes: 0.2, quadriceps: 0.15 }
      }),
      squatExercise({
        id: "core-trunk-control-ground-support-turkish-get-up-start",
        name: "Turkish get-up: inicio",
        equipment: ["Peso corporal", "Kettlebell", "Mancuerna"],
        technicalDescription:
          "Primera fase del levantamiento turco. Desde decúbito supino, mantener un brazo estable hacia arriba y realizar el inicio del incorporado controlando hombro, tronco y respiración.",
        errorsToAvoid: [
          "perder verticalidad del brazo",
          "encoger el hombro",
          "impulsarse sin control",
          "perder tensión abdominal",
          "mirar al suelo en vez de controlar la carga/brazo"
        ],
        primaryMuscles: ["Core", "Hombros"],
        secondaryMuscles: ["Manguito rotador", "Oblicuos", "Glúteos"],
        fatigueMap: { shoulders: 0.3, rotatorCuff: 0.25, core: 0.35, obliques: 0.25, glutes: 0.15 }
      }),
      squatExercise({
        id: "core-trunk-control-ground-support-turkish-get-up-second-step",
        name: "Turkish get-up: segundo paso",
        equipment: ["Peso corporal", "Kettlebell", "Mancuerna"],
        technicalDescription:
          "Segunda fase del levantamiento turco, progresando desde el apoyo inicial hacia una posición más estable de transición. Priorizar control del hombro, apoyo del brazo libre y estabilidad del tronco.",
        errorsToAvoid: [
          "perder alineación del brazo elevado",
          "colapsar el apoyo",
          "rotar sin control",
          "perder respiración",
          "acelerar la transición"
        ],
        primaryMuscles: ["Core", "Hombros"],
        secondaryMuscles: ["Manguito rotador", "Oblicuos", "Glúteos", "Cuádriceps"],
        fatigueMap: { shoulders: 0.35, rotatorCuff: 0.25, core: 0.35, obliques: 0.25, glutes: 0.2, quadriceps: 0.1 }
      }),
      squatExercise({
        id: "core-trunk-control-ground-support-turkish-get-up-third-step",
        name: "Turkish get-up: tercer paso",
        equipment: ["Peso corporal", "Kettlebell", "Mancuerna"],
        technicalDescription:
          "Tercera fase del levantamiento turco, integrando transición de cadera y apoyo inferior. Mantener brazo estable, tronco activo y control de cadera durante el paso.",
        errorsToAvoid: [
          "perder verticalidad del brazo",
          "colapsar la cadera",
          "apoyar la rodilla sin control",
          "perder orientación del tronco",
          "ir demasiado rápido"
        ],
        primaryMuscles: ["Core", "Hombros"],
        secondaryMuscles: ["Manguito rotador", "Oblicuos", "Glúteos", "Cuádriceps"],
        fatigueMap: { shoulders: 0.35, rotatorCuff: 0.25, core: 0.35, obliques: 0.25, glutes: 0.25, quadriceps: 0.15 }
      }),
      squatExercise({
        id: "core-trunk-control-ground-support-turkish-get-up-complete",
        name: "Turkish get-up completo",
        equipment: ["Peso corporal", "Kettlebell", "Mancuerna"],
        technicalDescription:
          "Levantamiento turco completo, integrando estabilidad de hombro, control de tronco, transición de cadera, apoyo unilateral y coordinación global desde el suelo hasta la posición de pie y vuelta.",
        errorsToAvoid: [
          "perder verticalidad del brazo",
          "acelerar las transiciones",
          "colapsar hombro o muñeca",
          "perder estabilidad de cadera",
          "no controlar la bajada",
          "perder respiración"
        ],
        primaryMuscles: ["Core", "Hombros", "Glúteos"],
        secondaryMuscles: ["Manguito rotador", "Oblicuos", "Cuádriceps", "Isquiosurales"],
        fatigueMap: { shoulders: 0.4, rotatorCuff: 0.3, core: 0.4, obliques: 0.25, glutes: 0.3, quadriceps: 0.2, hamstrings: 0.15 }
      })
    ]
  },
  {
    slug: "core-trunk-control-rotation",
    pattern: "Core / Trunk Control",
    block: "Rotation",
    exercises: [
      squatExercise({
        name: "Half-kneeling band rotation",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Desde medio arrodillado, rota el tronco contra la banda manteniendo pelvis estable y costillas controladas. La rotación debe ser limpia y sin perder equilibrio.",
        errorsToAvoid: ["Girar la pelvis", "Inclinarse hacia la banda", "Tirar solo con brazos"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Glúteos", "Hombros", "Recto abdominal"],
        fatigueMap: { obliques: 0.7, transverseAbdominis: 0.6, glutes: 0.3, shoulders: 0.3, rectusAbdominis: 0.3 }
      }),
      squatExercise({
        name: "Standing cable rotation",
        equipment: ["Polea"],
        technicalDescription:
          "Rota de pie con polea manteniendo base estable, pelvis controlada y transferencia de fuerza desde cadera a tronco. El movimiento debe ser continuo y coordinado.",
        errorsToAvoid: ["Rotar solo con brazos", "Perder apoyo de pies", "Arquear lumbar"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Caderas", "Hombros", "Glúteos"],
        fatigueMap: { obliques: 0.8, transverseAbdominis: 0.6, hips: 0.5, shoulders: 0.4, glutes: 0.4 }
      }),
      squatExercise({
        name: "Landmine rotation",
        equipment: ["Barra", "Landmine"],
        technicalDescription:
          "Rota la barra en arco desde landmine controlando tronco, cadera y hombros. Mantén brazos activos y permite que el cuerpo acompañe sin perder postura.",
        errorsToAvoid: ["Bloquear cadera", "Perder control de la barra", "Hiperextender la lumbar"],
        primaryMuscles: ["Oblicuos", "Hombros"],
        secondaryMuscles: ["Transverso abdominal", "Caderas", "Dorsal"],
        fatigueMap: { obliques: 0.8, shoulders: 0.6, transverseAbdominis: 0.5, hips: 0.5, lats: 0.3 }
      }),
      squatExercise({
        name: "Medicine ball rotational throw",
        equipment: ["Balón medicinal"],
        technicalDescription:
          "Lanza el balón medicinal rotando con potencia desde caderas y tronco. Debe verse transferencia fluida, pies activos y salida explosiva sin perder control.",
        errorsToAvoid: ["Lanzar solo con brazos", "Quedarse bloqueado de cadera", "Perder equilibrio tras soltar"],
        primaryMuscles: ["Oblicuos", "Caderas"],
        secondaryMuscles: ["Transverso abdominal", "Hombros", "Pectoral"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.6, hips: 0.7, shoulders: 0.5, chest: 0.3 }
      })
    ]
  },
  {
    slug: "core-trunk-control-anti-rotation",
    pattern: "Core / Trunk Control",
    block: "Anti-rotation",
    exercises: [
      squatExercise({
        name: "Pallof press",
        equipment: ["Banda elástica", "Polea"],
        technicalDescription:
          "Empuja la banda o polea al frente resistiendo que el tronco rote. Mantén pelvis y costillas alineadas, brazos firmes y respiración controlada.",
        errorsToAvoid: ["Rotar hacia la carga", "Encoger hombros", "Bloquear respiración"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Recto abdominal", "Glúteos", "Hombros"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, rectusAbdominis: 0.4, glutes: 0.3, shoulders: 0.2 }
      }),
      squatExercise({
        name: "Half-kneeling Pallof press",
        equipment: ["Banda elástica", "Polea"],
        technicalDescription:
          "Desde medio arrodillado, realiza Pallof press resistiendo rotación y manteniendo pelvis neutra. La posición debe reducir compensaciones y exigir control lumbopelvico.",
        errorsToAvoid: ["Inclinarse hacia la resistencia", "Perder pelvis neutra", "Empujar con hombros elevados"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Glúteos", "Recto abdominal", "Hombros"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, glutes: 0.4, rectusAbdominis: 0.4, shoulders: 0.2 }
      }),
      squatExercise({
        name: "Anti-rotation walkout",
        equipment: ["Banda elástica", "Polea"],
        technicalDescription:
          "Camina lateralmente alejandote de la resistencia y mantén el tronco sin rotar. Cada paso debe ser estable, con pelvis nivelada y brazos firmes.",
        errorsToAvoid: ["Girar el tronco", "Dar pasos demasiado largos", "Perder tensión de brazos"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Glúteos", "Hombros", "Aductores"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, glutes: 0.4, shoulders: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Dead bug anti-rotation",
        equipment: ["Banda elástica"],
        technicalDescription:
          "Realiza dead bug resistiendo una tracción lateral de banda. Mantén lumbar estable, pelvis controlada y movimiento lento de piernas o brazos.",
        errorsToAvoid: ["Arquear lumbar", "Rotar pelvis", "Mover extremidades demasiado rápido"],
        primaryMuscles: ["Transverso abdominal", "Oblicuos"],
        secondaryMuscles: ["Recto abdominal", "Flexores cadera", "Estabilizadores lumbares"],
        fatigueMap: { transverseAbdominis: 0.9, obliques: 0.8, rectusAbdominis: 0.5, hipFlexors: 0.3, lumbarStabilizers: 0.5 }
      })
    ]
  },
  {
    slug: "core-trunk-control-lateral-flexion",
    pattern: "Core / Trunk Control",
    block: "Lateral flexion",
    exercises: [
      squatExercise({
        name: "Side bend",
        equipment: ["Mancuerna", "Polea"],
        technicalDescription:
          "Inclina lateralmente el tronco de forma controlada y vuelve a la posición neutra. Mantén pelvis estable, recorrido útil y tensión en el costado.",
        errorsToAvoid: ["Rotar el tronco", "Usar impulso", "Cargar demasiado peso"],
        primaryMuscles: ["Oblicuos"],
        secondaryMuscles: ["Cuadrado lumbar", "Estabilizadores lumbares"],
        fatigueMap: { obliques: 0.8, lumbarStabilizers: 0.5, transverseAbdominis: 0.3 }
      }),
      squatExercise({
        name: "45-degree side bend",
        equipment: ["Banco romano"],
        technicalDescription:
          "Realiza flexión lateral en banco a 45 grados controlando bajada y subida. Mantén cadera apoyada, tronco largo y movimiento sin rotación.",
        errorsToAvoid: ["Girar el pecho", "Rebotar abajo", "Forzar rango lumbar"],
        primaryMuscles: ["Oblicuos", "Cuadrado lumbar"],
        secondaryMuscles: ["Glúteo medio", "Estabilizadores lumbares"],
        fatigueMap: { obliques: 0.8, lumbarStabilizers: 0.6, gluteMed: 0.3 }
      }),
      squatExercise({
        name: "Cable oblique crunch",
        equipment: ["Polea"],
        technicalDescription:
          "Flexiona y rota ligeramente el tronco contra polea dirigiendo el esfuerzo al oblicuo. Mantén pelvis estable y controla el retorno sin perder tensión.",
        errorsToAvoid: ["Tirar con brazos", "Rotar sin control", "Acortar el rango"],
        primaryMuscles: ["Oblicuos", "Recto abdominal"],
        secondaryMuscles: ["Transverso abdominal", "Flexores cadera"],
        fatigueMap: { obliques: 0.9, rectusAbdominis: 0.6, transverseAbdominis: 0.4, hipFlexors: 0.2 }
      })
    ]
  },
  {
    slug: "core-trunk-control-anti-lateral-flexion",
    pattern: "Core / Trunk Control",
    block: "Anti-lateral flexion",
    exercises: [
      squatExercise({
        name: "Side plank",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén plancha lateral con cuerpo alineado, cadera elevada y hombro estable. Debe verse una línea firme sin hundir pelvis ni rotar el tronco.",
        errorsToAvoid: ["Caer de cadera", "Rotar hombros", "Apoyar el cuello en tensión"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Glúteo medio", "Hombros", "Aductores"],
        fatigueMap: { obliques: 1, transverseAbdominis: 0.8, gluteMed: 0.6, shoulders: 0.4, adductors: 0.2 }
      }),
      squatExercise({
        name: "Side plank with reach",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde plancha lateral, añade alcance del brazo manteniendo cadera alta y tronco estable. El alcance debe desafiar el control sin perder alineación.",
        errorsToAvoid: ["Rotar sin control", "Bajar cadera", "Perder apoyo del hombro"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Glúteo medio", "Hombros", "Serrato anterior"],
        fatigueMap: { obliques: 1, transverseAbdominis: 0.8, gluteMed: 0.6, shoulders: 0.5, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Copenhagen plank",
        equipment: ["Banco", "Peso corporal"],
        technicalDescription:
          "Mantén plancha lateral con la pierna superior apoyada en banco, sosteniendo pelvis alta y tronco alineado. Controla aductores y oblicuos sin dolor.",
        errorsToAvoid: ["Hundirse de pelvis", "Forzar la ingle", "Rotar el tronco"],
        primaryMuscles: ["Aductores", "Oblicuos"],
        secondaryMuscles: ["Transverso abdominal", "Glúteo medio", "Hombros"],
        fatigueMap: { adductors: 0.9, obliques: 0.8, transverseAbdominis: 0.6, gluteMed: 0.4, shoulders: 0.3 }
      }),
      squatExercise({
        name: "Offset hold",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sostén una carga a un lado manteniendo tronco vertical y pelvis nivelada. El objetivo es resistir inclinación lateral sin compensar con hombros o cadera.",
        errorsToAvoid: ["Inclinarse hacia la carga", "Elevar un hombro", "Perder respiración"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Antebrazos", "Glúteos", "Hombros"],
        fatigueMap: { obliques: 1, transverseAbdominis: 0.8, forearms: 0.5, glutes: 0.3, shoulders: 0.2 }
      })
    ]
  },
  {
    slug: "core-trunk-control-flexion-extension",
    pattern: "Core / Trunk Control",
    block: "Flexion-extension",
    exercises: [
      squatExercise({
        name: "Crunch",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Flexiona el tronco elevando escápulas del suelo y controlando la bajada. Mantén pelvis estable, cuello relajado y esfuerzo dirigido al abdomen.",
        errorsToAvoid: ["Tirar del cuello", "Usar impulso", "Aplastar la respiración"],
        primaryMuscles: ["Recto abdominal"],
        secondaryMuscles: ["Oblicuos", "Transverso abdominal"],
        fatigueMap: { rectusAbdominis: 0.8, obliques: 0.3, transverseAbdominis: 0.3 }
      }),
      squatExercise({
        name: "Cable crunch",
        equipment: ["Polea"],
        technicalDescription:
          "Flexiona el tronco contra polea manteniendo cadera estable y controlando la vuelta. Debe verse flexión abdominal, no tirón de brazos.",
        errorsToAvoid: ["Tirar con brazos", "Sentarse sobre talones", "Perder control excéntrico"],
        primaryMuscles: ["Recto abdominal"],
        secondaryMuscles: ["Oblicuos", "Transverso abdominal"],
        fatigueMap: { rectusAbdominis: 1, obliques: 0.4, transverseAbdominis: 0.4 }
      }),
      squatExercise({
        name: "Reverse crunch",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Eleva pelvis llevando rodillas hacia el tronco con control, evitando balanceo. Mantén la bajada lenta y la zona lumbar estable.",
        errorsToAvoid: ["Balancear piernas", "Golpear el suelo al bajar", "Convertirlo en impulso de cadera"],
        primaryMuscles: ["Recto abdominal"],
        secondaryMuscles: ["Transverso abdominal", "Flexores cadera", "Oblicuos"],
        fatigueMap: { rectusAbdominis: 0.8, transverseAbdominis: 0.5, hipFlexors: 0.4, obliques: 0.3 }
      }),
      squatExercise({
        name: "Hanging knee raise",
        equipment: ["Barra"],
        technicalDescription:
          "Desde colgado, eleva rodillas manteniendo pelvis controlada y evitando balanceo. Usa abdomen para cerrar el gesto y controla la bajada.",
        errorsToAvoid: ["Balancearse", "Tirar solo con flexores de cadera", "Perder agarre"],
        primaryMuscles: ["Recto abdominal", "Flexores cadera"],
        secondaryMuscles: ["Transverso abdominal", "Dorsal", "Antebrazos"],
        fatigueMap: { rectusAbdominis: 0.8, hipFlexors: 0.7, transverseAbdominis: 0.5, lats: 0.3, forearms: 0.4 }
      }),
      squatExercise({
        name: "Prone trunk extension",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde prono, extiende suavemente el tronco manteniendo cuello largo y glúteos activos. Busca control posterior sin comprimir la zona lumbar.",
        errorsToAvoid: ["Hiperextender lumbar", "Elevar demasiado la cabeza", "Perder control al bajar"],
        primaryMuscles: ["Erectores espinales", "Estabilizadores lumbares"],
        secondaryMuscles: ["Glúteos", "Isquios"],
        fatigueMap: { spinalErectors: 0.8, lumbarStabilizers: 0.7, glutes: 0.3, hamstrings: 0.2 }
      })
    ]
  },
  {
    slug: "core-trunk-control-anti-flexion-extension",
    pattern: "Core / Trunk Control",
    block: "Anti-flexion-extension",
    exercises: [
      squatExercise({
        name: "Dead bug",
        equipment: ["Peso corporal", "Bloque de yoga", "Fitball"],
        technicalDescription:
          "Mueve brazos y piernas alternos manteniendo lumbar estable y pelvis neutra. Ajusta material para mejorar feedback sin perder respiración ni control.",
        errorsToAvoid: ["Arquear lumbar", "Mover demasiado rápido", "Perder coordinación respiratoria"],
        primaryMuscles: ["Transverso abdominal", "Recto abdominal"],
        secondaryMuscles: ["Flexores cadera", "Oblicuos", "Estabilizadores lumbares"],
        fatigueMap: { transverseAbdominis: 0.9, rectusAbdominis: 0.6, hipFlexors: 0.3, obliques: 0.4, lumbarStabilizers: 0.5 }
      }),
      squatExercise({
        name: "Bird dog",
        equipment: ["Peso corporal", "Banda elástica"],
        technicalDescription:
          "Desde cuadrupedia, extiende brazo y pierna contrarios manteniendo pelvis y costillas estables. El movimiento debe ser lento, simétrico y sin rotación.",
        errorsToAvoid: ["Abrir la cadera", "Arquear lumbar", "Elevar extremidades demasiado alto"],
        primaryMuscles: ["Transverso abdominal", "Estabilizadores lumbares"],
        secondaryMuscles: ["Glúteos", "Hombros", "Oblicuos"],
        fatigueMap: { transverseAbdominis: 0.8, lumbarStabilizers: 0.7, glutes: 0.4, shoulders: 0.3, obliques: 0.3 }
      }),
      squatExercise({
        name: "Plank",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén plancha frontal con pelvis neutra, costillas controladas y empuje activo del suelo. El cuerpo debe formar una línea estable sin hundirse.",
        errorsToAvoid: ["Caer de lumbar", "Elevar demasiado la cadera", "Bloquear respiración"],
        primaryMuscles: ["Transverso abdominal", "Recto abdominal"],
        secondaryMuscles: ["Hombros", "Glúteos", "Serrato anterior"],
        fatigueMap: { transverseAbdominis: 0.9, rectusAbdominis: 0.7, shoulders: 0.4, glutes: 0.3, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Hollow hold",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén posición hollow con lumbar controlada, costillas abajo y extremidades extendidas según nivel. Debe sentirse tensión abdominal sin perder pelvis.",
        errorsToAvoid: ["Arquear lumbar", "Elevar cabeza con tensión cervical", "Usar una palanca demasiado dificil"],
        primaryMuscles: ["Recto abdominal", "Transverso abdominal"],
        secondaryMuscles: ["Flexores cadera", "Oblicuos"],
        fatigueMap: { rectusAbdominis: 0.9, transverseAbdominis: 0.8, hipFlexors: 0.4, obliques: 0.4 }
      }),
      squatExercise({
        name: "Ab wheel rollout",
        equipment: ["Rueda abdominal"],
        technicalDescription:
          "Rueda hacia delante manteniendo pelvis y costillas controladas, y vuelve sin colapsar lumbar. Ajusta rango para conservar tensión abdominal y hombros estables.",
        errorsToAvoid: ["Arquear lumbar", "Ir más lejos de lo controlable", "Tirar con brazos al volver"],
        primaryMuscles: ["Recto abdominal", "Transverso abdominal"],
        secondaryMuscles: ["Dorsal", "Hombros", "Estabilizadores lumbares"],
        fatigueMap: { rectusAbdominis: 1, transverseAbdominis: 0.8, lats: 0.5, shoulders: 0.4, lumbarStabilizers: 0.6 }
      })
    ]
  }
];

export const exerciseLibrary: ExerciseDefinition[] = exerciseGroups.flatMap((group) => {
  const exerciseType = group.exerciseType ?? inferExerciseType(group);
  const allowedSessionSections = group.allowedSessionSections ?? inferAllowedSessionSections(exerciseType);

  return group.exercises.map((exercise, index) => ({
    ...exercise,
    allowedSessionSections,
    bodyRegion: patternBodyRegions[group.pattern],
    exerciseType,
    id: exercise.id ?? `${group.slug}-${index + 1}`,
    pattern: group.pattern,
    block: group.block,
    rank: index + 1
  }));
});

export function getExercisesByPattern(pattern: ExercisePattern) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.pattern === pattern));
}

export function getExercisePatternsByBodyRegion(bodyRegion: BodyRegion) {
  return exercisePatterns.filter((pattern) => patternBodyRegions[pattern] === bodyRegion);
}

export function getExercisesByBodyRegion(bodyRegion: BodyRegion) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.bodyRegion === bodyRegion));
}

export function searchExercises(query: string, options?: { section?: SessionExerciseSection }) {
  const normalizedQuery = normalizeExerciseSearchText(query);
  const bySection = options?.section
    ? exerciseLibrary.filter((exercise) => exercise.allowedSessionSections.includes(options.section!))
    : exerciseLibrary;
  const sectionFiltered =
    options?.section === "main"
      ? bySection.filter((exercise) => exercise.exerciseType !== "mobility")
      : bySection;

  if (!normalizedQuery) return sortExercises(sectionFiltered).slice(0, 12);

  return sortExercises(
    sectionFiltered.filter((exercise) =>
      getExerciseSearchText(exercise).includes(normalizedQuery)
    )
  ).slice(0, 12);
}

export function getExerciseById(exerciseId: string) {
  return exerciseLibrary.find((exercise) => exercise.id === exerciseId) ?? null;
}

export function getExercisesByBlock(block: ExerciseBlock) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.block === block));
}

export function getExercisesByEquipment(equipment: string) {
  return sortExercises(
    exerciseLibrary.filter((exercise) =>
      exercise.equipment.some((item) => item.toLowerCase() === equipment.toLowerCase())
    )
  );
}

export function calculateWeeklySetsByPattern(entries: WeeklyExerciseSetInput[]) {
  return getWorkingSetEntries(entries).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    if (!exercise) return acc;
    acc[exercise.pattern] = (acc[exercise.pattern] ?? 0) + entry.sets;
    return acc;
  }, {});
}

export function calculateWeeklyPercentageByPattern(entries: WeeklyExerciseSetInput[]) {
  const setsByPattern = calculateWeeklySetsByPattern(entries);
  const totalSets = Object.values(setsByPattern).reduce((total, sets) => total + sets, 0);

  return Object.fromEntries(
    Object.entries(setsByPattern).map(([pattern, sets]) => [
      pattern,
      totalSets > 0 ? (sets / totalSets) * 100 : 0
    ])
  );
}

export function calculateWeeklySetsByBlock(entries: WeeklyExerciseSetInput[]) {
  return getWorkingSetEntries(entries).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    if (!exercise) return acc;
    acc[exercise.block] = (acc[exercise.block] ?? 0) + entry.sets;
    return acc;
  }, {});
}

export function calculateWeeklySetsByExercise(entries: WeeklyExerciseSetInput[]) {
  return getWorkingSetEntries(entries).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    if (!exercise) return acc;
    acc[exercise.name] = (acc[exercise.name] ?? 0) + entry.sets;
    return acc;
  }, {});
}

export function calculateWeeklyFatigueMap(entries: WeeklyExerciseSetInput[]) {
  return getWorkingSetEntries(entries).reduce<Record<string, number>>((acc, entry) => {
    const exercise = getExerciseById(entry.exerciseId);
    if (!exercise || exercise.exerciseType === "mobility") return acc;

    Object.entries(exercise.fatigueMap).forEach(([muscle, value]) => {
      acc[muscle] = (acc[muscle] ?? 0) + entry.sets * value;
    });

    return acc;
  }, {});
}

export function calculateExerciseMuscleLoad(entry: WeeklyExerciseSetInput) {
  const exercise = getExerciseById(entry.exerciseId);
  if (!exercise || exercise.exerciseType === "mobility" || entry.sets <= 0) return {};

  return Object.fromEntries(
    Object.entries(exercise.fatigueMap).map(([muscle, value]) => [muscle, entry.sets * value])
  );
}

export function calculateWeeklyMuscleLoad(entries: WeeklyExerciseSetInput[]) {
  return calculateWeeklyFatigueMap(entries);
}

export function getExerciseRegression(exerciseId: string) {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  const blockExercises = getComparableBlockExercises(exercise);
  const index = blockExercises.findIndex((item) => item.id === exerciseId);
  return index > 0 ? blockExercises[index - 1] : null;
}

export function getExerciseProgression(exerciseId: string) {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  const blockExercises = getComparableBlockExercises(exercise);
  const index = blockExercises.findIndex((item) => item.id === exerciseId);
  return index >= 0 && index < blockExercises.length - 1 ? blockExercises[index + 1] : null;
}

function squatExercise(exercise: ExerciseSeed): ExerciseSeed {
  return exercise;
}

function getWorkingSetEntries(entries: WeeklyExerciseSetInput[]) {
  return entries.filter((entry) => !entry.isWarmUp && entry.sets > 0);
}

function getComparableBlockExercises(exercise: ExerciseDefinition) {
  return sortExercises(
    exerciseLibrary.filter(
      (item) => item.pattern === exercise.pattern && item.block === exercise.block
    )
  );
}

function sortExercises(exercises: ExerciseDefinition[]) {
  return [...exercises].sort((a, b) =>
    a.pattern.localeCompare(b.pattern) ||
    exerciseBlocks.indexOf(a.block) - exerciseBlocks.indexOf(b.block) ||
    a.rank - b.rank
  );
}

function getExerciseSearchText(exercise: ExerciseDefinition) {
  return normalizeExerciseSearchText(
    [
      exercise.name,
      exercise.pattern,
      exercise.block,
      exercise.bodyRegion,
      exercise.exerciseType,
      ...exercise.equipment,
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles
    ].join(" ")
  );
}

function normalizeExerciseSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
