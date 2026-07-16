export type ExercisePattern =
  | "Squat / Vertical Force"
  | "Hinge / Horizontal Force"
  | "Lunge / Unilateral Force"
  | "Lower Body Accessories"
  | "Olympic derivatives"
  | "Gait & Carry"
  | "Push / Upper Body Press"
  | "Pull / Upper Body Pull"
  | "Upper Body Accessories"
  | "Core / Trunk Control";

export type BodyRegion = "lower" | "upper" | "global";

export type ExerciseBlock =
  | "Control / tolerancia"
  | "Reeducación de la marcha"
  | "Fuerza base"
  | "Hipertrofia"
  | "Potencia"
  | "Pliometria"
  | "Conditioning"
  | "Rotation"
  | "Anti-rotation"
  | "Lateral flexion"
  | "Anti-lateral flexion"
  | "Flexion-extension"
  | "Anti-flexion-extension"
  | "Chest accessories"
  | "Shoulder accessories"
  | "Arm accessories"
  | "Quad accessories"
  | "Hamstring accessories"
  | "Glute accessories"
  | "Adductor accessories"
  | "Calf & ankle accessories";

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

export type ExerciseDefinition = {
  bodyRegion: BodyRegion;
  block: ExerciseBlock;
  equipment: string[];
  errorsToAvoid: string[];
  fatigueMap: FatigueMap;
  id: string;
  name: string;
  pattern: ExercisePattern;
  primaryMuscles: string[];
  rank: number;
  secondaryMuscles: string[];
  technicalDescription: string;
};

export type WeeklyExerciseSetInput = {
  exerciseId: string;
  isWarmUp?: boolean;
  sets: number;
};

type ExerciseSeed = Omit<ExerciseDefinition, "block" | "bodyRegion" | "id" | "pattern" | "rank">;

type ExerciseGroupSeed = {
  block: ExerciseBlock;
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
  "Gait & Carry",
  "Push / Upper Body Press",
  "Pull / Upper Body Pull",
  "Upper Body Accessories",
  "Core / Trunk Control"
];

export const bodyRegions: BodyRegion[] = ["lower", "upper", "global"];

export const bodyRegionLabels: Record<BodyRegion, string> = {
  lower: "Tren inferior",
  upper: "Tren superior",
  global: "Global"
};

export const patternBodyRegions: Record<ExercisePattern, BodyRegion> = {
  "Squat / Vertical Force": "lower",
  "Hinge / Horizontal Force": "lower",
  "Lunge / Unilateral Force": "lower",
  "Lower Body Accessories": "lower",
  "Push / Upper Body Press": "upper",
  "Pull / Upper Body Pull": "upper",
  "Upper Body Accessories": "upper",
  "Olympic derivatives": "global",
  "Gait & Carry": "global",
  "Core / Trunk Control": "global"
};

export const exerciseBlocks: ExerciseBlock[] = [
  "Control / tolerancia",
  "Reeducación de la marcha",
  "Fuerza base",
  "Hipertrofia",
  "Potencia",
  "Pliometria",
  "Conditioning",
  "Rotation",
  "Anti-rotation",
  "Lateral flexion",
  "Anti-lateral flexion",
  "Flexion-extension",
  "Anti-flexion-extension",
  "Chest accessories",
  "Shoulder accessories",
  "Arm accessories",
  "Quad accessories",
  "Hamstring accessories",
  "Glute accessories",
  "Adductor accessories",
  "Calf & ankle accessories"
];

const exerciseGroups: ExerciseGroupSeed[] = [
  {
    slug: "squat-vertical-force-control",
    pattern: "Squat / Vertical Force",
    block: "Control / tolerancia",
    exercises: [
      squatExercise({
        name: "Triple flexo-extension en supino con resistencia manual",
        equipment: ["Manual"],
        technicalDescription:
          "Tumbado en supino, realiza una triple flexo-extension guiada de cadera, rodilla y tobillo contra resistencia manual. Mantén una trayectoria controlada, alineacion de rodilla y presion progresiva sin dolor.",
        errorsToAvoid: ["Empujar de forma brusca", "Perder la alineacion de rodilla", "Bloquear la respiracion"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.6, glutes: 0.5, adductors: 0.3, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Sentadilla asistida con feedback manual",
        equipment: ["Manual", "Soporte"],
        technicalDescription:
          "Realiza una sentadilla con apoyo o feedback manual para guiar la flexion de cadera, rodilla y tobillo. Mantén el peso repartido en todo el pie y controla el descenso y la subida.",
        errorsToAvoid: ["Colapsar las rodillas", "Levantar talones", "Depender totalmente del soporte"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.3, core: 0.2, spinalErectors: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Wall sit iso",
        equipment: ["Peso corporal", "Pared"],
        technicalDescription:
          "Apoya la espalda en la pared y mantén una posicion de sentadilla isometrica. Busca presion estable en el pie, rodillas alineadas y tronco apoyado sin dolor.",
        errorsToAvoid: ["Hundirse sin control", "Juntar las rodillas", "Apoyar solo las puntas de los pies"],
        primaryMuscles: ["Cuadriceps"],
        secondaryMuscles: ["Gluteo mayor", "Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.4, adductors: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Spanish squat",
        equipment: ["Banda", "Soporte"],
        technicalDescription:
          "Coloca una banda detras de las rodillas y desciende manteniendo el tronco estable y la tibia controlada. Prioriza tension continua, rodillas alineadas y subida controlada.",
        errorsToAvoid: ["Perder tension de la banda", "Inclinarse excesivamente", "Rebotar abajo"],
        primaryMuscles: ["Cuadriceps"],
        secondaryMuscles: ["Gluteo mayor", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.4, core: 0.2, calves: 0.2 }
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
          "Desde un cajon o silla, levantate y vuelve a sentarte controlando la posicion del pie y la direccion de las rodillas. Mantén el tronco estable y evita caer al sentarte.",
        errorsToAvoid: ["Impulsarse con balanceo excesivo", "Caer al cajon", "Despegar talones"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.3, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Goblet squat",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sujeta la carga delante del pecho y desciende flexionando cadera, rodilla y tobillo. Mantén el peso repartido en todo el pie, rodillas alineadas y subida controlada.",
        errorsToAvoid: ["Levantar los talones", "Colapsar las rodillas hacia dentro", "Perder la posicion del tronco", "Bajar sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.4, core: 0.3, spinalErectors: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Smith squat",
        equipment: ["Multipower"],
        technicalDescription:
          "Coloca la barra guiada en una posicion comoda y realiza la sentadilla manteniendo control del recorrido. Ajusta los pies para conservar estabilidad, rango util y tension continua.",
        errorsToAvoid: ["Colocar los pies demasiado lejos", "Bloquear rodillas de forma brusca", "Relajar el tronco"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, core: 0.2, calves: 0.2 }
      }),
      squatExercise({
        name: "Front squat",
        equipment: ["Barra"],
        technicalDescription:
          "Sostén la barra delante de los hombros y desciende con tronco estable y codos altos. Mantén el centro de presion equilibrado y sube sin perder la posicion toracica.",
        errorsToAvoid: ["Dejar caer los codos", "Redondear el tronco", "Perder profundidad controlada"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Core", "Erectores espinales", "Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, core: 0.5, spinalErectors: 0.5, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Back squat",
        equipment: ["Barra"],
        technicalDescription:
          "Coloca la barra sobre la espalda, fija el tronco y desciende manteniendo pies activos y rodillas alineadas. Sube empujando el suelo y conservando el control de la carga.",
        errorsToAvoid: ["Perder tension del tronco", "Valgo de rodilla", "Desplazar el peso solo a puntas o talones"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
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
        equipment: ["Maquina"],
        technicalDescription:
          "Empuja la plataforma manteniendo pelvis estable y rodillas alineadas con los pies. Usa un rango util, controla la bajada y evita bloquear de forma brusca.",
        errorsToAvoid: ["Despegar la pelvis", "Cerrar rodillas", "Bloquear rodillas con agresividad"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Hack squat",
        equipment: ["Maquina"],
        technicalDescription:
          "Desciende en la maquina manteniendo apoyo completo del pie y espalda estable contra el respaldo. Controla profundidad, alineacion de rodilla y ritmo.",
        errorsToAvoid: ["Levantar talones", "Rebotar abajo", "Perder alineacion de rodillas"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.6, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Pendulum squat",
        equipment: ["Maquina"],
        technicalDescription:
          "Realiza el patron de sentadilla en pendulo con tension constante y control del rango. Mantén pies activos, pelvis estable y subida sin impulsos bruscos.",
        errorsToAvoid: ["Usar rebote excesivo", "Perder contacto estable del pie", "Cerrar las rodillas"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
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
          "Realiza un descenso rapido y salta verticalmente buscando maxima altura con aterrizaje controlado. Mantén alineacion de rodillas y rigidez suficiente del tronco.",
        errorsToAvoid: ["Aterrizar sin control", "Colapsar rodillas", "Hacer una bajada lenta"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.8, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Squat jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Parte desde una posicion estable de sentadilla y salta sin contramovimiento marcado. Prioriza salida explosiva, tronco firme y aterrizaje equilibrado.",
        errorsToAvoid: ["Usar rebote previo", "Perder postura en la salida", "Aterrizar rigido"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Core", "Aductores"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Box jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Salta sobre un cajon buscando altura y control de recepcion. Aterriza estable, con rodillas alineadas y baja del cajon sin impactos innecesarios.",
        errorsToAvoid: ["Elegir un cajon demasiado alto", "Caer en flexion descontrolada", "Saltar hacia delante sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Core", "Aductores"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.8, calves: 0.7, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Jump squat con carga",
        equipment: ["Mancuerna", "Barra"],
        technicalDescription:
          "Realiza un salto vertical con carga ligera o moderada, buscando velocidad y tecnica limpia. Mantén tronco estable, despegue potente y aterrizaje controlado.",
        errorsToAvoid: ["Usar demasiada carga", "Perder velocidad", "Aterrizar con rodillas hacia dentro"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
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
        name: "Drop landing",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajon bajo y absorbe el impacto con control de cadera, rodilla y tobillo. Busca estabilidad, silencio en el apoyo y alineacion correcta.",
        errorsToAvoid: ["Caer con rodillas hacia dentro", "Aterrizar muy rigido", "Perder equilibrio"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, calves: 0.6, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Pogo jump bilateral",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza rebotes bilaterales rapidos con minimo tiempo de contacto. Mantén tobillos activos, tronco estable y una amplitud pequena y reactiva.",
        errorsToAvoid: ["Flexionar demasiado las rodillas", "Perder ritmo", "Caer pesado"],
        primaryMuscles: ["Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Gluteo mayor", "Core"],
        fatigueMap: { calves: 1, quadriceps: 0.4, glutes: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Low hurdle hop",
        equipment: ["Peso corporal", "Vallas bajas"],
        technicalDescription:
          "Salta vallas bajas con contactos rapidos y controlados. Mantén ritmo, orientacion de rodillas y una recepcion elastica sin perder postura.",
        errorsToAvoid: ["Buscar demasiada altura", "Frenarse en cada apoyo", "Colapsar rodillas"],
        primaryMuscles: ["Gemelos", "Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core"],
        fatigueMap: { calves: 0.9, quadriceps: 0.6, glutes: 0.6, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Depth jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajon y responde con un salto potente tras una recepcion breve. Prioriza rigidez util, alineacion y contacto rapido con el suelo.",
        errorsToAvoid: ["Usar demasiada altura", "Quedarse hundido al aterrizar", "Rebotar sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.9, adductors: 0.4, core: 0.4, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Drop jump",
        equipment: ["Peso corporal", "Cajon"],
        technicalDescription:
          "Cae desde un cajon y salta buscando minimo tiempo de contacto. Mantén recepcion elastica, tronco estable y salida vertical rapida.",
        errorsToAvoid: ["Alargar el contacto", "Aterrizar con ruido excesivo", "Perder alineacion de rodilla"],
        primaryMuscles: ["Gemelos", "Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Hamstrings"],
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
          "En supino, empuja la cadera hacia arriba contra resistencia manual suave. Mantén pelvis estable, costillas controladas y extension de cadera sin compensar con la zona lumbar.",
        errorsToAvoid: ["Arquear la zona lumbar", "Empujar con tirones", "Perder alineacion de rodillas"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.4, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip hinge con feedback manual",
        equipment: ["Manual", "Soporte"],
        technicalDescription:
          "Practica la bisagra llevando la cadera atras con feedback manual o soporte. Mantén columna neutra, pelvis controlada y peso repartido en el pie.",
        errorsToAvoid: ["Flexionar demasiado las rodillas", "Redondear la espalda", "Perder la pelvis neutra"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.5, hamstrings: 0.5, spinalErectors: 0.3, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip hinge con palo",
        equipment: ["Peso corporal", "Palo"],
        technicalDescription:
          "Coloca el palo en contacto con cabeza, espalda y sacro mientras haces la bisagra. Busca movimiento desde la cadera sin perder los puntos de contacto.",
        errorsToAvoid: ["Separar el palo de la espalda", "Convertirlo en sentadilla", "Mirar al frente en exceso"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.4, hamstrings: 0.4, spinalErectors: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Wall hinge drill",
        equipment: ["Peso corporal", "Pared"],
        technicalDescription:
          "De espaldas a una pared, lleva la cadera atras hasta tocarla manteniendo columna neutra. Controla el recorrido y evita que las rodillas dominen el movimiento.",
        errorsToAvoid: ["Alejarse demasiado de la pared", "Redondear la espalda", "Levantar los talones"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
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
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.4, core: 0.2, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Apoya la espalda en banco y extiende la cadera hasta una posicion estable. Mantén menton recogido, pelvis controlada y empuje simetrico con los pies.",
        errorsToAvoid: ["Hiperextender lumbar", "Perder la retroversion final", "Separar rodillas sin control"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Aductores", "Core", "Erectores espinales"],
        fatigueMap: { glutes: 1, hamstrings: 0.5, adductors: 0.3, core: 0.3, spinalErectors: 0.2 }
      }),
      squatExercise({
        name: "Kettlebell deadlift",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Coloca la kettlebell entre los pies y levanta desde una bisagra estable. Mantén espalda neutra, brazos largos y la carga cerca del cuerpo.",
        errorsToAvoid: ["Tirar con brazos", "Redondear espalda", "Alejar la carga del cuerpo"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, spinalErectors: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Romanian deadlift",
        equipment: ["Mancuernas", "Barra"],
        technicalDescription:
          "Desciende la carga con rodillas desbloqueadas y cadera atras, manteniendola cerca del cuerpo. Sube extendiendo la cadera sin perder columna neutra.",
        errorsToAvoid: ["Redondear espalda", "Convertirlo en sentadilla", "Alejar la carga"],
        primaryMuscles: ["Isquios", "Gluteo mayor"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { hamstrings: 1, glutes: 0.8, spinalErectors: 0.5, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Peso muerto con barra hexagonal",
        equipment: ["Barra hexagonal"],
        technicalDescription:
          "Colocate dentro de la barra hexagonal y levanta empujando el suelo con tronco estable. Mantén la carga centrada, cadera y hombros subiendo coordinados.",
        errorsToAvoid: ["Perder tension inicial", "Levantar cadera antes que hombros", "Bloquear con extension lumbar"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Cuadriceps", "Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, quadriceps: 0.5, spinalErectors: 0.5, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Conventional deadlift",
        equipment: ["Barra"],
        technicalDescription:
          "Levanta la barra desde el suelo manteniendola cerca de las piernas. Fija tronco, empuja el suelo y extiende cadera y rodilla sin perder posicion.",
        errorsToAvoid: ["Redondear lumbar", "Tirar con la barra lejos", "Bloquear con hiperextension"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Erectores espinales"],
        secondaryMuscles: ["Cuadriceps", "Core", "Aductores", "Gemelos"],
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
          "En banco de extension, flexiona desde la cadera y vuelve extendiendo sin hiperextender lumbar. Mantén control del rango y tension en gluteos e isquios.",
        errorsToAvoid: ["Subir con tiron lumbar", "Hiperextender al final", "Perder control del descenso"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, spinalErectors: 0.5, core: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Ajusta la maquina y extiende la cadera contra la resistencia guiada. Mantén pelvis controlada, pausa arriba y descenso sin perder tension.",
        errorsToAvoid: ["Hiperextender lumbar", "Recortar rango", "Empujar de forma asimetrica"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Aductores", "Core"],
        fatigueMap: { glutes: 1, hamstrings: 0.4, adductors: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Romanian deadlift unilateral",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Realiza una bisagra a una pierna con carga contralateral o ipsilateral. Mantén pelvis estable, espalda neutra y control del apoyo.",
        errorsToAvoid: ["Abrir la cadera", "Perder equilibrio", "Redondear la espalda"],
        primaryMuscles: ["Isquios", "Gluteo mayor"],
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
          "Realiza el hip thrust con intencion maxima de velocidad manteniendo control arriba. Usa una carga que permita extension potente sin perder tecnica.",
        errorsToAvoid: ["Usar carga demasiado alta", "Hiperextender lumbar", "Perder velocidad"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.5, core: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Hip thrust con salto",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde puente o hip thrust, extiende la cadera de forma explosiva para despegar ligeramente. Aterriza controlando pelvis y rodillas.",
        errorsToAvoid: ["Aterrizar sin control", "Arquear lumbar", "Perder alineacion de rodillas"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Core", "Gemelos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.5, core: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Kettlebell swing",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Proyecta la kettlebell con una bisagra explosiva de cadera. Mantén brazos relajados, columna neutra y recepcion de la carga con cadera atras.",
        errorsToAvoid: ["Hacer una sentadilla", "Tirar con brazos", "Perder timing de cadera"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Erectores espinales", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, spinalErectors: 0.4, core: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Broad jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Salta horizontalmente proyectando la cadera y aterriza con control. Busca extension potente, braceo coordinado y recepcion estable.",
        errorsToAvoid: ["Aterrizar con rodillas dentro", "Caer hacia delante", "Perder control del tronco"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Core", "Aductores"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, calves: 0.7, quadriceps: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Romanian deadlift + Step up contralateral",
        equipment: ["Mancuerna", "Cajon"],
        technicalDescription:
          "Combina una bisagra rumana unilateral con subida contralateral al cajon. Mantén pelvis estable, control del apoyo y transicion potente hacia el step-up.",
        errorsToAvoid: ["Girar la pelvis", "Perder equilibrio", "Acelerar sin control"],
        primaryMuscles: ["Gluteo mayor", "Isquios"],
        secondaryMuscles: ["Cuadriceps", "Aductores", "Core", "Gemelos"],
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
          "Realiza un salto horizontal y centra la tarea en absorber la recepcion. Mantén cadera atras, rodillas alineadas y control de tronco al caer.",
        errorsToAvoid: ["Caer con rodillas dentro", "No frenar la inercia", "Aterrizar rigido"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Aductores", "Core"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.7, calves: 0.6, quadriceps: 0.4, adductors: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Repeated broad jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Encadena saltos horizontales repetidos manteniendo ritmo y recepciones estables. Reutiliza la fuerza horizontal sin perder alineacion ni control.",
        errorsToAvoid: ["Frenarse demasiado", "Perder estabilidad", "Buscar distancia a costa de tecnica"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Core", "Aductores"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.8, calves: 0.8, quadriceps: 0.4, core: 0.3, adductors: 0.3 }
      }),
      squatExercise({
        name: "Horizontal hurdle hop",
        equipment: ["Vallas bajas"],
        technicalDescription:
          "Supera vallas bajas con saltos horizontales reactivos y contactos controlados. Mantén rigidez util, direccion estable y recepcion rapida.",
        errorsToAvoid: ["Saltar demasiado alto", "Perder ritmo", "Colapsar al aterrizar"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Aductores", "Core"],
        fatigueMap: { glutes: 0.7, hamstrings: 0.7, calves: 0.9, quadriceps: 0.4, adductors: 0.3, core: 0.3 }
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
          "Mantén una posicion de split stance mientras recibes resistencia manual suave. Busca pelvis estable, pie completo apoyado y rodilla alineada sin perder equilibrio.",
        errorsToAvoid: ["Colapsar la rodilla hacia dentro", "Inclinar la pelvis", "Perder presion del pie delantero"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.5, glutes: 0.5, adductors: 0.4, hamstrings: 0.2, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Split squat iso asistido",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Mantén una posicion baja de split squat con ayuda de un soporte si hace falta. Controla pelvis, rodilla y pie, respirando sin dolor ni compensaciones.",
        errorsToAvoid: ["Apoyarse demasiado en el soporte", "Cerrar la rodilla", "Perder verticalidad del tronco"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.6, adductors: 0.4, hamstrings: 0.2, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Assisted split squat",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Realiza un split squat con soporte para guiar el equilibrio. Desciende controlando rodilla y pelvis, y sube empujando el suelo con el pie delantero.",
        errorsToAvoid: ["Tirar del soporte", "Perder alineacion frontal", "Acortar el rango sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.7, glutes: 0.7, adductors: 0.4, hamstrings: 0.3, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Step-down controlado",
        equipment: ["Cajon", "Step"],
        technicalDescription:
          "Desde un cajon o step, baja una pierna de forma lenta manteniendo pelvis nivelada y rodilla alineada. Toca el suelo con control y vuelve sin impulsarte.",
        errorsToAvoid: ["Dejar caer la pelvis", "Colapsar la rodilla", "Bajar demasiado rapido"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.6, adductors: 0.5, calves: 0.3, core: 0.3 }
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
          "En posicion de zancada estatica, baja y sube controlando pelvis, rodilla y apoyo del pie delantero. Mantén tronco estable y empuje equilibrado.",
        errorsToAvoid: ["Rebotar abajo", "Cerrar la rodilla", "Apoyar el peso solo en la pierna trasera"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Reverse lunge",
        equipment: ["Peso corporal", "Mancuernas"],
        technicalDescription:
          "Da un paso atras y desciende hasta una zancada estable. Vuelve empujando con la pierna delantera y manteniendo control de rodilla y pelvis.",
        errorsToAvoid: ["Dar un paso demasiado corto", "Perder equilibrio", "Impulsarse con la pierna trasera"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Walking lunge",
        equipment: ["Mancuernas"],
        technicalDescription:
          "Avanza alternando zancadas con control de pelvis y rodilla en cada apoyo. Mantén pasos estables, tronco firme y ritmo sin perder tecnica.",
        errorsToAvoid: ["Acelerar sin control", "Cruzar los pies", "Perder alineacion de rodilla"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 0.9, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Step-up",
        equipment: ["Cajon", "Mancuernas"],
        technicalDescription:
          "Sube a un cajon empujando principalmente con la pierna apoyada arriba. Mantén pelvis estable, rodilla alineada y bajada controlada.",
        errorsToAvoid: ["Impulsarse con la pierna de abajo", "Dejar caer la pelvis", "Perder control en la bajada"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
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
        equipment: ["Maquina"],
        technicalDescription:
          "Empuja la plataforma con una pierna manteniendo pelvis estable y rodilla alineada. Controla la bajada y usa un rango que permita tension sin dolor.",
        errorsToAvoid: ["Despegar la pelvis", "Cerrar la rodilla", "Bloquear bruscamente"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Gemelos"],
        fatigueMap: { quadriceps: 1, glutes: 0.7, adductors: 0.4, calves: 0.2 }
      }),
      squatExercise({
        name: "Smith split squat",
        equipment: ["Multipower"],
        technicalDescription:
          "Realiza un split squat guiado en multipower, manteniendo apoyo firme y recorrido controlado. Ajusta la posicion para acumular tension sin perder alineacion.",
        errorsToAvoid: ["Colocar los pies mal respecto a la barra", "Relajar el tronco", "Rebotar abajo"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.4, hamstrings: 0.3, calves: 0.2, core: 0.2 }
      }),
      squatExercise({
        name: "Front foot elevated split squat",
        equipment: ["Mancuernas", "Plataforma"],
        technicalDescription:
          "Coloca el pie delantero elevado y desciende en split squat aumentando el rango util. Mantén rodilla alineada, pelvis estable y carga controlada.",
        errorsToAvoid: ["Perder profundidad controlada", "Cerrar la rodilla", "Inclinarse sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, adductors: 0.5, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Bulgarian split squat",
        equipment: ["Mancuernas", "Banco"],
        technicalDescription:
          "Apoya el pie trasero en un banco y baja con control sobre la pierna delantera. Mantén pelvis estable, rodilla alineada y empuje completo del pie.",
        errorsToAvoid: ["Apoyar demasiado peso atras", "Perder equilibrio", "Cerrar rodilla delantera"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Isquios", "Gemelos", "Core"],
        fatigueMap: { quadriceps: 1, glutes: 0.9, adductors: 0.5, hamstrings: 0.3, calves: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Deficit split squat",
        equipment: ["Mancuernas", "Plataformas"],
        technicalDescription:
          "Realiza un split squat desde plataformas para aumentar el rango. Controla la profundidad, mantén pelvis estable y evita perder tension abajo.",
        errorsToAvoid: ["Usar deficit excesivo", "Rebotar en el fondo", "Perder alineacion frontal"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
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
          "Sube al cajon con intencion explosiva desde una pierna, manteniendo pelvis estable y bajada controlada. La velocidad no debe comprometer la alineacion.",
        errorsToAvoid: ["Impulsarse con la pierna de abajo", "Perder control de rodilla", "Caer pesado"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor"],
        secondaryMuscles: ["Gemelos", "Aductores", "Core", "Isquios"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.5, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Step-up jump",
        equipment: ["Cajon"],
        technicalDescription:
          "Desde el cajon, realiza una subida con salto buscando potencia unilateral. Aterriza y baja con control, manteniendo pelvis y rodilla estables.",
        errorsToAvoid: ["Buscar altura sin control", "Colapsar rodilla", "Bajar del cajon con impacto excesivo"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Core", "Isquios"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.6, adductors: 0.4, core: 0.3, hamstrings: 0.3 }
      }),
      squatExercise({
        name: "Split squat jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde split squat, salta verticalmente y aterriza en la misma posicion. Mantén tronco firme, rodilla alineada y recepcion controlada.",
        errorsToAvoid: ["Aterrizar con rodilla hacia dentro", "Perder postura", "Hundir la pelvis sin control"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Lunge jump",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Alterna zancadas con salto, cambiando apoyos en el aire. Mantén ritmo, alineacion de rodilla y recepcion estable en cada repeticion.",
        errorsToAvoid: ["Perder equilibrio", "Aterrizar estrecho", "Colapsar pelvis o rodilla"],
        primaryMuscles: ["Cuadriceps", "Gluteo mayor", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { quadriceps: 0.8, glutes: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.3, core: 0.3 }
      }),
      squatExercise({
        name: "Lateral push-off",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Empuja lateralmente desde una pierna para desplazar el cuerpo con rapidez. Mantén cadera estable, pie activo y control del apoyo antes de repetir.",
        errorsToAvoid: ["Cruzar apoyos sin control", "Perder pelvis estable", "Caer sobre el borde del pie"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Aductores"],
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
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Aductores"],
        secondaryMuscles: ["Gemelos", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, adductors: 0.5, calves: 0.5, hamstrings: 0.3, core: 0.4 }
      }),
      squatExercise({
        name: "Skater bound",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Encadena saltos laterales tipo patinador con recepcion unilateral. Reutiliza la fuerza lateral manteniendo pelvis estable y contacto controlado.",
        errorsToAvoid: ["Perder ritmo", "Caer con apoyo inestable", "Cruzar demasiado la pierna libre"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Aductores"],
        secondaryMuscles: ["Gemelos", "Isquios", "Core"],
        fatigueMap: { glutes: 0.9, quadriceps: 0.8, adductors: 0.5, calves: 0.6, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Alternating bounds",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza bounds alternos avanzando de una pierna a otra. Mantén proyeccion, recepcion activa y alineacion de rodilla en cada apoyo.",
        errorsToAvoid: ["Buscar distancia perdiendo control", "Aterrizar rigido", "Perder estabilidad de pelvis"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, calves: 0.7, adductors: 0.4, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Single-leg bound",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Salta y aterriza con la misma pierna, controlando fuerza unilateral y rigidez de apoyo. Mantén pelvis estable y contacto eficiente.",
        errorsToAvoid: ["Colapsar al aterrizar", "Perder control del pie", "Repetir sin estabilidad"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, calves: 0.8, adductors: 0.4, hamstrings: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Lateral hurdle hop",
        equipment: ["Vallas bajas"],
        technicalDescription:
          "Salta lateralmente sobre vallas bajas con apoyos reactivos. Mantén ritmo, control de pelvis y rodillas alineadas en cada contacto.",
        errorsToAvoid: ["Saltar demasiado alto", "Aterrizar sin control", "Perder ritmo lateral"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Gemelos"],
        secondaryMuscles: ["Aductores", "Isquios", "Core"],
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
        equipment: ["Maquina"],
        technicalDescription:
          "Extiende la rodilla en maquina controlando el recorrido y la pausa final sin perder la posicion de la cadera. Mantén tension continua y regreso controlado.",
        errorsToAvoid: ["Balancear el cuerpo", "Soltar la fase de bajada", "Usar un rango doloroso"],
        primaryMuscles: ["Cuadriceps"],
        secondaryMuscles: ["Flexores cadera"],
        fatigueMap: { quadriceps: 1, hipFlexors: 0.2 }
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
        equipment: ["Maquina"],
        technicalDescription:
          "Flexiona las rodillas en maquina tumbado manteniendo cadera estable. Controla la subida, aprieta en el final y baja sin soltar la carga.",
        errorsToAvoid: ["Levantar la pelvis", "Balancear la carga", "Soltar la bajada"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { hamstrings: 1, calves: 0.2 }
      }),
      squatExercise({
        name: "Seated leg curl",
        equipment: ["Maquina"],
        technicalDescription:
          "Flexiona las rodillas sentado con el muslo fijado y control de la pelvis. Mantén tension continua y evita compensar con el tronco.",
        errorsToAvoid: ["Mover la cadera", "Rebotar al final", "Usar rango parcial sin criterio"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { hamstrings: 1, calves: 0.2 }
      }),
      squatExercise({
        name: "Nordic curl",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Fija los pies y controla el descenso del tronco desde las rodillas. Mantén cadera extendida y usa asistencia si necesitas conservar calidad.",
        errorsToAvoid: ["Flexionar la cadera", "Caer sin control", "Perder alineacion tronco-muslo"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gluteo mayor", "Gemelos", "Estabilizadores lumbares"],
        fatigueMap: { hamstrings: 1, glutes: 0.3, calves: 0.2, lumbarStabilizers: 0.2 }
      })
    ]
  },
  {
    slug: "lower-body-accessories-glutes",
    pattern: "Lower Body Accessories",
    block: "Glute accessories",
    exercises: [
      squatExercise({
        name: "Hip abduction machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Abduce la cadera en maquina manteniendo pelvis estable y recorrido controlado. Busca tension local en gluteo medio sin balancear el tronco.",
        errorsToAvoid: ["Rebotar al final", "Inclinar el tronco", "Usar rango sin control"],
        primaryMuscles: ["Gluteo medio"],
        secondaryMuscles: ["Gluteo mayor"],
        fatigueMap: { gluteMed: 1, glutes: 0.5 }
      }),
      squatExercise({
        name: "Cable kickback",
        equipment: ["Polea"],
        technicalDescription:
          "Extiende la cadera contra polea manteniendo tronco estable y pelvis cuadrada. Mueve desde la cadera sin arquear la lumbar.",
        errorsToAvoid: ["Arquear lumbar", "Rotar la pelvis", "Usar impulso"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Estabilizadores lumbares"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.3, lumbarStabilizers: 0.2 }
      }),
      squatExercise({
        name: "Hip extension machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Extiende la cadera en maquina con pelvis estable y recorrido controlado. Prioriza tension en gluteo sin compensar con la zona lumbar.",
        errorsToAvoid: ["Hiperextender lumbar", "Perder apoyo de pelvis", "Soltar la vuelta"],
        primaryMuscles: ["Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Estabilizadores lumbares"],
        fatigueMap: { glutes: 1, hamstrings: 0.4, lumbarStabilizers: 0.2 }
      })
    ]
  },
  {
    slug: "lower-body-accessories-adductors",
    pattern: "Lower Body Accessories",
    block: "Adductor accessories",
    exercises: [
      squatExercise({
        name: "Hip adduction machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Aduce la cadera en maquina manteniendo pelvis estable y tension continua. Controla la vuelta sin rebotes y usa un rango tolerado.",
        errorsToAvoid: ["Rebotar", "Perder postura", "Forzar apertura dolorosa"],
        primaryMuscles: ["Aductores"],
        secondaryMuscles: ["Core"],
        fatigueMap: { adductors: 1, core: 0.1 }
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
        equipment: ["Maquina", "Mancuernas"],
        technicalDescription:
          "Eleva talones de pie con rodillas extendidas y control del tobillo. Pausa arriba y baja con rango completo sin perder alineacion del pie.",
        errorsToAvoid: ["Rebotar", "Caer hacia el borde del pie", "Acortar el rango"],
        primaryMuscles: ["Gemelos"],
        secondaryMuscles: ["Soleo"],
        fatigueMap: { calves: 1, soleus: 0.4 }
      }),
      squatExercise({
        name: "Seated calf raise",
        equipment: ["Maquina"],
        technicalDescription:
          "Eleva talones sentado con control, buscando tension en soleo y recorrido completo. Mantén pausa arriba y bajada estable.",
        errorsToAvoid: ["Rebotar abajo", "Usar recorrido parcial", "Perder apoyo del antepie"],
        primaryMuscles: ["Soleo"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { soleus: 1, calves: 0.6 }
      }),
      squatExercise({
        name: "Tibialis raise",
        equipment: ["Peso corporal", "Maquina"],
        technicalDescription:
          "Eleva la punta del pie contra gravedad o maquina manteniendo talon estable. Controla la subida y la bajada sin compensar con cadera.",
        errorsToAvoid: ["Mover todo el cuerpo", "Usar impulso", "Acortar el rango"],
        primaryMuscles: ["Tibial anterior"],
        secondaryMuscles: ["Gemelos"],
        fatigueMap: { tibialisAnterior: 1, calves: 0.1 }
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
          "Desde posicion hang, realiza una triple extension explosiva y termina con un encogimiento alto sin recepcion. Mantén la barra cerca, brazos largos hasta la extension y control del apoyo.",
        errorsToAvoid: ["Tirar con brazos demasiado pronto", "Alejar la barra", "No terminar la extension"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Cuadriceps", "Trapecio"],
        secondaryMuscles: ["Gemelos", "Erectores espinales", "Core", "Antebrazos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.6, calves: 0.4, spinalErectors: 0.4, core: 0.3, forearms: 0.2 }
      }),
      squatExercise({
        name: "Hang clean pull",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, tira de la barra con extension potente de cadera, rodilla y tobillo sin recibirla. Mantén trayectoria vertical cercana y hombros sobre la barra antes de acelerar.",
        errorsToAvoid: ["Iniciar con brazos", "Golpear la barra hacia delante", "Perder posicion del tronco"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Cuadriceps", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.7, spinalErectors: 0.4, core: 0.3, calves: 0.4, forearms: 0.3, upperBack: 0.4 }
      }),
      squatExercise({
        name: "Hang high pull",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, acelera la barra con triple extension y continua el tiron alto manteniendo codos arriba y fuera. La barra debe viajar cerca del cuerpo sin perder equilibrio.",
        errorsToAvoid: ["Remar antes de extender", "Bajar codos", "Alejar la barra"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Cuadriceps", "Trapecio", "Upper back"],
        secondaryMuscles: ["Gemelos", "Erectores espinales", "Core", "Antebrazos"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, quadriceps: 0.7, traps: 0.8, upperBack: 0.6, calves: 0.4, spinalErectors: 0.4, core: 0.3, forearms: 0.3 }
      }),
      squatExercise({
        name: "Clean pull desde suelo",
        equipment: ["Barra"],
        technicalDescription:
          "Tira desde el suelo pasando por rodilla con control y acelera hacia una extension completa. Mantén la barra cerca, espalda firme y transicion fluida al segundo tiron.",
        errorsToAvoid: ["Subir la cadera demasiado pronto", "Rodear la rodilla con la barra", "Perder la espalda neutra"],
        primaryMuscles: ["Gluteo mayor", "Isquios", "Cuadriceps", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.8, quadriceps: 0.8, traps: 0.7, spinalErectors: 0.5, core: 0.4, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Hang muscle clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, extiende potente y recibe la barra en rack sin caida profunda. Mantén la barra cerca, codos rapidos y postura estable al finalizar.",
        errorsToAvoid: ["Recibir con codos bajos", "Separar la barra", "Convertirlo en curl"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Trapecio", "Upper back"],
        secondaryMuscles: ["Isquios", "Erectores espinales", "Core", "Antebrazos", "Gemelos"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, traps: 0.7, upperBack: 0.5, hamstrings: 0.6, spinalErectors: 0.4, core: 0.4, forearms: 0.3, calves: 0.3 }
      }),
      squatExercise({
        name: "Hang power clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, realiza triple extension y recibe la barra en posicion power con codos rapidos. Mantén recepcion estable, pies activos y barra cercana.",
        errorsToAvoid: ["Saltar hacia delante", "Recibir con codos lentos", "Perder rigidez del tronco"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.9, quadriceps: 0.8, hamstrings: 0.7, traps: 0.7, spinalErectors: 0.5, core: 0.4, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Power clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, acelera la barra y recibela en posicion power. Coordina salida, transicion por rodilla, segundo tiron y recepcion estable con codos altos.",
        errorsToAvoid: ["Tirar temprano con brazos", "Recibir bajo o inestable", "Alejar la barra"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.9, hamstrings: 0.7, quadriceps: 0.8, traps: 0.7, spinalErectors: 0.5, calves: 0.4, core: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Clean",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, tira y recibe la barra en una sentadilla frontal mas profunda. Mantén trayectoria cercana, codos rapidos y estabilidad en la recepcion.",
        errorsToAvoid: ["Colapsar en la recepcion", "Perder codos altos", "Separar la barra del cuerpo"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Isquios", "Trapecio"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos", "Upper back"],
        fatigueMap: { glutes: 0.9, quadriceps: 0.9, hamstrings: 0.7, traps: 0.7, spinalErectors: 0.5, core: 0.5, calves: 0.4, forearms: 0.3, upperBack: 0.5 }
      }),
      squatExercise({
        name: "Hang power snatch",
        equipment: ["Barra"],
        technicalDescription:
          "Desde hang, realiza triple extension y recibe la barra por encima de la cabeza en posicion power. Mantén trayectoria cercana, bloqueo estable y control overhead.",
        errorsToAvoid: ["Recibir con hombros inestables", "Alejar la barra", "Perder velocidad bajo la barra"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Isquios", "Trapecio", "Upper back"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.7, hamstrings: 0.7, traps: 0.8, upperBack: 0.7, spinalErectors: 0.4, core: 0.5, calves: 0.4, forearms: 0.3 }
      }),
      squatExercise({
        name: "Power snatch",
        equipment: ["Barra"],
        technicalDescription:
          "Desde el suelo, acelera la barra y recibela por encima de la cabeza en posicion power. Coordina salida, tiron y recepcion overhead estable.",
        errorsToAvoid: ["Perder la barra hacia delante", "Recibir sin bloqueo estable", "Romper la posicion de espalda en la salida"],
        primaryMuscles: ["Gluteo mayor", "Cuadriceps", "Isquios", "Trapecio", "Upper back"],
        secondaryMuscles: ["Erectores espinales", "Core", "Gemelos", "Antebrazos"],
        fatigueMap: { glutes: 0.8, quadriceps: 0.8, hamstrings: 0.7, traps: 0.8, upperBack: 0.7, spinalErectors: 0.5, core: 0.5, calves: 0.4, forearms: 0.3 }
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
          "Camina apoyando talon y transicionando hacia la punta con pasos naturales. Mantén ritmo estable, mirada al frente y apoyo controlado en cada pisada.",
        errorsToAvoid: ["Arrastrar los pies", "Perder equilibrio", "Acelerar sin controlar el apoyo"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Gluteo medio", "Core", "Cuadriceps"],
        fatigueMap: { calves: 0.4, glutes: 0.2, core: 0.2, quadriceps: 0.2 }
      }),
      squatExercise({
        name: "Talon-punta con pasos largos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza pasos largos manteniendo la secuencia talon-punta y controlando la pelvis. Debe verse una zancada amplia sin perder postura ni apoyo del pie.",
        errorsToAvoid: ["Sobrepasar la zancada perdiendo control", "Colapsar la rodilla", "Inclinar el tronco en exceso"],
        primaryMuscles: ["Gemelos", "Gluteo mayor"],
        secondaryMuscles: ["Isquios", "Cuadriceps", "Core"],
        fatigueMap: { calves: 0.5, glutes: 0.4, hamstrings: 0.3, quadriceps: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Talon-punta con pasos cortos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Camina con pasos cortos y precisos manteniendo la transicion talon-punta. Busca control, simetria y ritmo constante sin bloquear rodillas.",
        errorsToAvoid: ["Dar pasos rigidos", "Mirar continuamente al suelo", "Perder la secuencia de apoyo"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Core", "Gluteo medio"],
        fatigueMap: { calves: 0.4, core: 0.2, glutes: 0.2, quadriceps: 0.1 }
      }),
      squatExercise({
        name: "Talon-punta con pasos lentos",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Avanza lentamente exagerando el control de cada fase del apoyo. Mantén equilibrio, respiracion tranquila y transicion limpia desde talon hasta punta.",
        errorsToAvoid: ["Caer sobre el pie", "Compensar con balanceo de tronco", "Perder control al despegar"],
        primaryMuscles: ["Gemelos", "Tibial anterior"],
        secondaryMuscles: ["Core", "Gluteo medio", "Cuadriceps"],
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
        errorsToAvoid: ["Encoger hombros sin control", "Arquear la zona lumbar", "Perder simetria de carga"],
        primaryMuscles: ["Antebrazos", "Trapecio"],
        secondaryMuscles: ["Core", "Upper back", "Gluteos"],
        fatigueMap: { forearms: 1, traps: 0.8, core: 0.6, upperBack: 0.5, glutes: 0.2 }
      }),
      squatExercise({
        name: "Suitcase hold",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sostén una carga a un lado manteniendo tronco vertical y pelvis nivelada. Debe verse resistencia a la inclinacion lateral sin compensar con el hombro.",
        errorsToAvoid: ["Inclinarse hacia la carga", "Elevar un hombro", "Rotar el tronco"],
        primaryMuscles: ["Oblicuos", "Antebrazos"],
        secondaryMuscles: ["Trapecio", "Core", "Gluteos"],
        fatigueMap: { core: 0.9, obliques: 1, forearms: 0.9, traps: 0.6, glutes: 0.2 }
      }),
      squatExercise({
        name: "Farmer carry",
        equipment: ["Mancuernas", "Kettlebells"],
        technicalDescription:
          "Camina con carga bilateral manteniendo postura alta, pasos regulares y agarre firme. La carga no debe alterar el ritmo ni la posicion del tronco.",
        errorsToAvoid: ["Dar pasos desordenados", "Perder hombros estables", "Balancear las cargas"],
        primaryMuscles: ["Antebrazos", "Trapecio", "Core"],
        secondaryMuscles: ["Upper back", "Gluteos", "Gemelos"],
        fatigueMap: { forearms: 1, traps: 0.9, core: 0.8, upperBack: 0.6, glutes: 0.4, calves: 0.3 }
      }),
      squatExercise({
        name: "Suitcase carry",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Camina con una carga a un lado resistiendo inclinacion y rotacion. Mantén pasos simetricos, tronco alto y distancia constante entre carga y pierna.",
        errorsToAvoid: ["Inclinarse hacia un lado", "Acortar el paso de forma asimetrica", "Perder agarre o postura"],
        primaryMuscles: ["Oblicuos", "Antebrazos", "Core"],
        secondaryMuscles: ["Trapecio", "Gluteos", "Gemelos"],
        fatigueMap: { obliques: 1, core: 0.9, forearms: 0.9, traps: 0.7, glutes: 0.4, calves: 0.3 }
      }),
      squatExercise({
        name: "Front rack carry",
        equipment: ["Kettlebells", "Mancuernas"],
        technicalDescription:
          "Transporta la carga en rack frontal con codos recogidos, tronco alto y respiracion controlada. Mantén abdomen activo sin hiperextender la espalda.",
        errorsToAvoid: ["Abrir codos en exceso", "Arquear lumbar", "Perder respiracion o postura"],
        primaryMuscles: ["Core", "Upper back"],
        secondaryMuscles: ["Trapecio", "Antebrazos", "Gluteos", "Cuadriceps"],
        fatigueMap: { core: 0.9, upperBack: 0.7, traps: 0.6, forearms: 0.5, glutes: 0.3, quadriceps: 0.2 }
      }),
      squatExercise({
        name: "Zercher carry",
        equipment: ["Barra", "Sandbag"],
        technicalDescription:
          "Camina abrazando la carga en posicion Zercher con tronco firme y pasos cortos. Mantén la carga cerca, codos debajo y columna neutra.",
        errorsToAvoid: ["Redondear la espalda", "Separar la carga del cuerpo", "Perder control de la respiracion"],
        primaryMuscles: ["Core", "Upper back", "Biceps"],
        secondaryMuscles: ["Gluteos", "Cuadriceps", "Antebrazos"],
        fatigueMap: { core: 0.9, upperBack: 0.7, forearms: 0.5, glutes: 0.4, quadriceps: 0.3, spinalErectors: 0.4 }
      }),
      squatExercise({
        name: "Overhead carry",
        equipment: ["Mancuerna", "Kettlebell", "Barra"],
        technicalDescription:
          "Transporta la carga por encima de la cabeza con brazo estable, costillas controladas y pasos regulares. Debe verse alineacion vertical sin compensaciones lumbares.",
        errorsToAvoid: ["Arquear la espalda", "Perder bloqueo del brazo", "Caminar con pasos inestables"],
        primaryMuscles: ["Core", "Trapecio", "Upper back"],
        secondaryMuscles: ["Antebrazos", "Oblicuos", "Gluteos"],
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
          "Empuja el trineo con inclinacion controlada, pasos potentes y apoyo activo del pie. Mantén cadera estable y ritmo constante durante la distancia o intervalo.",
        errorsToAvoid: ["Perder traccion", "Hundirse de hombros", "Dar pasos demasiado largos"],
        primaryMuscles: ["Cuadriceps", "Gluteos", "Gemelos"],
        secondaryMuscles: ["Isquios", "Core", "Upper back"],
        fatigueMap: { quadriceps: 1, glutes: 0.8, calves: 0.7, hamstrings: 0.4, core: 0.4, upperBack: 0.3 }
      }),
      squatExercise({
        name: "Backward sled drag",
        equipment: ["Trineo"],
        technicalDescription:
          "Arrastra el trineo caminando hacia atras con pasos cortos y tension continua. Mantén tronco alto, rodillas alineadas y empuje constante desde el antepie.",
        errorsToAvoid: ["Tirar solo con brazos", "Perder alineacion de rodilla", "Dar tirones sin ritmo"],
        primaryMuscles: ["Cuadriceps", "Gemelos"],
        secondaryMuscles: ["Gluteos", "Core", "Antebrazos"],
        fatigueMap: { quadriceps: 1, calves: 0.7, glutes: 0.5, core: 0.3, forearms: 0.3 }
      }),
      squatExercise({
        name: "Sled pull con arnes",
        equipment: ["Trineo", "Arnes"],
        technicalDescription:
          "Tracciona el trineo con arnes avanzando con inclinacion estable y pasos potentes. Mantén linea corporal firme y ritmo continuo sin perder apoyo.",
        errorsToAvoid: ["Romper postura de tronco", "Resbalar por falta de apoyo", "Acelerar perdiendo control"],
        primaryMuscles: ["Gluteos", "Isquios", "Gemelos"],
        secondaryMuscles: ["Cuadriceps", "Core", "Erectores espinales"],
        fatigueMap: { glutes: 0.8, hamstrings: 0.7, calves: 0.7, quadriceps: 0.5, core: 0.4, spinalErectors: 0.3 }
      }),
      squatExercise({
        name: "Loaded carry intervals",
        equipment: ["Mancuernas", "Kettlebells"],
        technicalDescription:
          "Alterna tramos de transporte cargado con descansos o cambios de distancia. Mantén tecnica estable durante todo el intervalo, incluso con fatiga acumulada.",
        errorsToAvoid: ["Perder postura al fatigarse", "Balancear las cargas", "No respetar la distancia o tiempo objetivo"],
        primaryMuscles: ["Antebrazos", "Core", "Trapecio"],
        secondaryMuscles: ["Upper back", "Gluteos", "Gemelos"],
        fatigueMap: { forearms: 1, core: 0.8, traps: 0.8, upperBack: 0.6, glutes: 0.5, calves: 0.4 }
      }),
      squatExercise({
        name: "Carry medley",
        equipment: ["Material variado"],
        technicalDescription:
          "Combina varios transportes de carga en secuencia, cambiando implementos o posiciones. Prioriza transiciones limpias, postura estable y control del ritmo.",
        errorsToAvoid: ["Elegir cargas que rompen la tecnica", "Perder orden en las transiciones", "Descuidar respiracion y postura"],
        primaryMuscles: ["Antebrazos", "Core", "Trapecio"],
        secondaryMuscles: ["Upper back", "Gluteos", "Gemelos", "Oblicuos"],
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
          "Alterna retraccion y protraccion escapular sin flexionar codos, en pared o cuadrupedia. Debe verse movimiento controlado de escápulas con cuello relajado y tronco estable.",
        errorsToAvoid: ["Doblar los codos", "Elevar hombros hacia las orejas", "Perder control del tronco"],
        primaryMuscles: ["Serrato anterior", "Trapecio medio"],
        secondaryMuscles: ["Core", "Pectoral", "Deltoides anterior"],
        fatigueMap: { serratusAnterior: 0.8, upperBack: 0.5, traps: 0.4, chest: 0.2, anteriorDelts: 0.2, core: 0.3 }
      }),
      squatExercise({
        name: "Horizontal press manual/banded",
        equipment: ["Manual", "Banda elastica"],
        technicalDescription:
          "Empuja horizontalmente contra resistencia manual o banda manteniendo escápula controlada y muñeca alineada. El movimiento debe ser fluido, sin dolor y con tronco estable.",
        errorsToAvoid: ["Perder alineacion de muñeca", "Elevar hombros", "Rotar el tronco para compensar"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.6, triceps: 0.5, anteriorDelts: 0.4, serratusAnterior: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Vertical press manual/banded",
        equipment: ["Manual", "Banda elastica"],
        technicalDescription:
          "Empuja en direccion vertical contra resistencia manual o banda, manteniendo costillas controladas y escápula estable. Debe verse elevacion limpia sin compensacion lumbar.",
        errorsToAvoid: ["Arquear la espalda", "Adelantar la cabeza", "Perder control escapular"],
        primaryMuscles: ["Deltoides anterior", "Triceps"],
        secondaryMuscles: ["Deltoides lateral", "Trapecio superior", "Core"],
        fatigueMap: { anteriorDelts: 0.7, triceps: 0.5, lateralDelts: 0.4, upperTraps: 0.3, core: 0.4 }
      }),
      squatExercise({
        name: "Push-up hold",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén posicion de flexion con manos bajo hombros, cuerpo alineado y escápulas activas. La pelvis, costillas y cabeza deben permanecer estables.",
        errorsToAvoid: ["Hundirse entre hombros", "Caer de cadera", "Bloquear respiracion"],
        primaryMuscles: ["Pectoral", "Triceps", "Serrato anterior"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 0.5, triceps: 0.5, serratusAnterior: 0.5, anteriorDelts: 0.4, core: 0.6 }
      }),
      squatExercise({
        name: "Bottom-up kettlebell hold",
        equipment: ["Kettlebell"],
        technicalDescription:
          "Sostén la kettlebell invertida con muñeca neutra y hombro centrado. Mantén respiracion, antebrazo vertical y control fino sin que la carga oscile.",
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
        errorsToAvoid: ["Abrir codos en exceso", "Perder alineacion corporal", "Hundirse entre hombros"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.7, triceps: 0.6, anteriorDelts: 0.5, serratusAnterior: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una flexion manteniendo linea cabeza-cadera-tobillo, manos firmes y codos controlados. Empuja el suelo hasta recuperar una posicion estable.",
        errorsToAvoid: ["Colapsar la lumbar", "Abrir codos sin control", "No completar el empuje"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.7, anteriorDelts: 0.6, serratusAnterior: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Bench press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona desde banco con escápulas estables, pies apoyados y trayectoria controlada. Baja con control hacia el pecho y empuja manteniendo muñecas y codos alineados.",
        errorsToAvoid: ["Rebotar la carga", "Perder retraccion escapular", "Abrir codos de forma excesiva"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Core", "Upper back"],
        fatigueMap: { chest: 1, triceps: 0.8, anteriorDelts: 0.7, core: 0.2, upperBack: 0.2 }
      }),
      squatExercise({
        name: "Incline bench press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona en banco inclinado manteniendo escápulas firmes y trayectoria estable. El énfasis debe ir al empuje inclinado sin perder control de hombro.",
        errorsToAvoid: ["Convertirlo en press vertical", "Elevar hombros", "Perder apoyo en el banco"],
        primaryMuscles: ["Pectoral", "Deltoides anterior", "Triceps"],
        secondaryMuscles: ["Upper back", "Core"],
        fatigueMap: { chest: 0.9, anteriorDelts: 0.8, triceps: 0.7, upperBack: 0.2, core: 0.2 }
      }),
      squatExercise({
        name: "Landmine press",
        equipment: ["Barra", "Landmine"],
        technicalDescription:
          "Empuja la barra en diagonal desde landmine, manteniendo costillas controladas y hombro centrado. La trayectoria debe ser estable, con final fuerte sin inclinar el tronco.",
        errorsToAvoid: ["Rotar el tronco", "Elevar hombro al final", "Perder base de apoyo"],
        primaryMuscles: ["Deltoides anterior", "Pectoral", "Triceps"],
        secondaryMuscles: ["Serrato anterior", "Core", "Trapecio superior"],
        fatigueMap: { anteriorDelts: 0.8, chest: 0.6, triceps: 0.6, serratusAnterior: 0.4, core: 0.4, upperTraps: 0.3 }
      }),
      squatExercise({
        name: "Overhead press / Press militar",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Presiona por encima de la cabeza con tronco firme, costillas abajo y trayectoria vertical. Termina con brazos estables y cabeza alineada bajo la carga.",
        errorsToAvoid: ["Arquear lumbar", "Adelantar la cabeza", "No bloquear con control"],
        primaryMuscles: ["Deltoides anterior", "Triceps"],
        secondaryMuscles: ["Deltoides lateral", "Trapecio superior", "Core", "Upper back"],
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
        equipment: ["Maquina"],
        technicalDescription:
          "Presiona en maquina con espalda apoyada, muñecas neutras y ritmo controlado. Mantén hombros estables y tensión continua durante todo el recorrido.",
        errorsToAvoid: ["Perder contacto con el respaldo", "Bloquear codos agresivamente", "Rebotar la carga"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior"],
        fatigueMap: { chest: 0.9, triceps: 0.7, anteriorDelts: 0.5, serratusAnterior: 0.2 }
      }),
      squatExercise({
        name: "Incline chest press",
        equipment: ["Maquina"],
        technicalDescription:
          "Empuja en maquina inclinada con control, manteniendo hombros bajos y trayectoria estable. Busca tensión en pectoral superior sin compensar con cuello.",
        errorsToAvoid: ["Elevar hombros", "Perder control al bajar", "Cerrar demasiado el agarre"],
        primaryMuscles: ["Pectoral", "Deltoides anterior"],
        secondaryMuscles: ["Triceps", "Serrato anterior"],
        fatigueMap: { chest: 0.9, anteriorDelts: 0.7, triceps: 0.6, serratusAnterior: 0.2 }
      }),
      squatExercise({
        name: "Shoulder press",
        equipment: ["Maquina"],
        technicalDescription:
          "Presiona verticalmente en maquina con espalda apoyada y hombros controlados. Sube con fuerza y baja con control sin perder alineacion de codos.",
        errorsToAvoid: ["Elevar hombros excesivamente", "Arquear lumbar", "Bajar fuera de control"],
        primaryMuscles: ["Deltoides anterior", "Triceps"],
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
        equipment: ["Balon medicinal"],
        technicalDescription:
          "Lanza el balon desde el pecho con empuje explosivo, tronco firme y trayectoria directa. La accion debe ser rapida, coordinada y con recepcion segura si hay retorno.",
        errorsToAvoid: ["Lanzar solo con brazos", "Perder postura", "Frenar antes de soltar el balon"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.7, anteriorDelts: 0.6, serratusAnterior: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Medicine ball overhead throw",
        equipment: ["Balon medicinal"],
        technicalDescription:
          "Lanza el balon por encima de la cabeza con extension potente y control del tronco. Mantén costillas controladas y libera el balon con velocidad.",
        errorsToAvoid: ["Arquear lumbar", "Lanzar sin coordinar piernas y tronco", "Perder control del hombro"],
        primaryMuscles: ["Deltoides anterior", "Triceps", "Pectoral"],
        secondaryMuscles: ["Core", "Trapecio superior", "Serrato anterior"],
        fatigueMap: { anteriorDelts: 0.8, triceps: 0.7, chest: 0.6, core: 0.5, upperTraps: 0.3, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Explosive push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una flexion empujando el suelo con maxima velocidad, manteniendo cuerpo alineado. La prioridad es despegar o acelerar sin perder control.",
        errorsToAvoid: ["Perder alineacion corporal", "Caer sin absorber", "Buscar altura a costa de tecnica"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior", "Core"],
        fatigueMap: { chest: 0.8, triceps: 0.8, anteriorDelts: 0.6, serratusAnterior: 0.4, core: 0.4 }
      }),
      squatExercise({
        name: "Push press",
        equipment: ["Barra", "Mancuernas"],
        technicalDescription:
          "Combina un dip corto con extension potente de piernas y press vertical. Transmite fuerza a la carga manteniendo tronco firme y recepcion estable arriba.",
        errorsToAvoid: ["Convertirlo en sentadilla", "Arquear lumbar", "Presionar tarde sin aprovechar piernas"],
        primaryMuscles: ["Deltoides anterior", "Triceps", "Cuadriceps"],
        secondaryMuscles: ["Gluteos", "Core", "Trapecio superior"],
        fatigueMap: { anteriorDelts: 0.8, triceps: 0.7, quadriceps: 0.4, glutes: 0.3, core: 0.5, upperTraps: 0.4 }
      }),
      squatExercise({
        name: "Landmine push press",
        equipment: ["Barra", "Landmine"],
        technicalDescription:
          "Realiza un empuje diagonal explosivo desde landmine usando una pequena ayuda de piernas. Mantén linea corporal estable y finaliza con brazo fuerte.",
        errorsToAvoid: ["Rotar sin control", "Perder base de apoyo", "Empujar lento sin intencion"],
        primaryMuscles: ["Deltoides anterior", "Pectoral", "Triceps"],
        secondaryMuscles: ["Cuadriceps", "Gluteos", "Core", "Serrato anterior"],
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
          "Desde una pequena caida o liberacion, recibe en posicion de flexion absorbiendo con brazos y escápulas. Mantén tronco firme y contacto controlado.",
        errorsToAvoid: ["Caer con codos rigidos", "Hundirse entre hombros", "Perder alineacion corporal"],
        primaryMuscles: ["Pectoral", "Triceps", "Serrato anterior"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 0.7, triceps: 0.7, serratusAnterior: 0.5, anteriorDelts: 0.5, core: 0.4 }
      }),
      squatExercise({
        name: "Plyo push-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza flexiones pliometricas despegando las manos del suelo y aterrizando con absorcion activa. Mantén ritmo, alineacion y control del contacto.",
        errorsToAvoid: ["Aterrizar rigido", "Perder postura", "Abrir codos sin control"],
        primaryMuscles: ["Pectoral", "Triceps"],
        secondaryMuscles: ["Deltoides anterior", "Core", "Serrato anterior"],
        fatigueMap: { chest: 0.9, triceps: 0.8, anteriorDelts: 0.7, core: 0.4, serratusAnterior: 0.4 }
      }),
      squatExercise({
        name: "Depth push-up",
        equipment: ["Cajones", "Soportes"],
        technicalDescription:
          "Deja caer las manos desde soportes hacia el suelo y responde con empuje rapido. Prioriza absorcion controlada, contacto breve y alineacion del tronco.",
        errorsToAvoid: ["Usar demasiada altura", "Colapsar hombros", "No absorber antes de empujar"],
        primaryMuscles: ["Pectoral", "Triceps", "Deltoides anterior"],
        secondaryMuscles: ["Serrato anterior", "Core"],
        fatigueMap: { chest: 0.9, triceps: 0.8, anteriorDelts: 0.7, serratusAnterior: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Reactive medicine ball chest pass",
        equipment: ["Balon medicinal"],
        technicalDescription:
          "Recibe y relanza el balon medicinal desde el pecho con contacto rapido. Mantén postura estable, absorbe con brazos y devuelve con intencion explosiva.",
        errorsToAvoid: ["Retener demasiado el balon", "Perder posicion al recibir", "Lanzar sin absorber"],
        primaryMuscles: ["Pectoral", "Triceps"],
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
        equipment: ["Peso corporal", "Banda elastica"],
        technicalDescription:
          "Practica retraccion y depresion escapular sin flexionar los codos, manteniendo cuello relajado y tronco estable. Debe verse control de escápulas antes de iniciar cualquier traccion.",
        errorsToAvoid: ["Doblar los codos", "Elevar hombros hacia las orejas", "Compensar con extension lumbar"],
        primaryMuscles: ["Trapecio medio", "Trapecio inferior"],
        secondaryMuscles: ["Dorsal ancho", "Romboides", "Core"],
        fatigueMap: { midBack: 0.6, lowerTraps: 0.6, lats: 0.3, upperBack: 0.5, core: 0.2 }
      }),
      squatExercise({
        name: "Horizontal pull manual/banded",
        equipment: ["Manual", "Banda elastica"],
        technicalDescription:
          "Realiza una traccion horizontal contra resistencia manual o banda, llevando codos atras con escápulas controladas. Mantén pecho alto y muñecas neutras.",
        errorsToAvoid: ["Tirar solo con brazos", "Encoger hombros", "Rotar el tronco"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.6, lats: 0.5, biceps: 0.3, rearDelts: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "External shoulder rotation manual/banded",
        equipment: ["Manual", "Banda elastica"],
        technicalDescription:
          "Rota externamente el hombro contra resistencia manteniendo codo estable y escápula tranquila. El movimiento debe ser pequeño, preciso y sin dolor.",
        errorsToAvoid: ["Separar el codo", "Rotar el tronco", "Usar demasiada resistencia"],
        primaryMuscles: ["Manguito rotador"],
        secondaryMuscles: ["Deltoides posterior", "Trapecio inferior"],
        fatigueMap: { rotatorCuff: 0.8, rearDelts: 0.3, lowerTraps: 0.2 }
      }),
      squatExercise({
        name: "Vertical pull manual/banded",
        equipment: ["Manual", "Banda elastica"],
        technicalDescription:
          "Simula una traccion vertical contra resistencia manual o banda, iniciando desde depresion escapular y llevando codos hacia abajo. Mantén costillas controladas.",
        errorsToAvoid: ["Tirar con cuello", "Arquear lumbar", "Perder depresion escapular"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Trapecio inferior", "Espalda media", "Core"],
        fatigueMap: { lats: 0.6, biceps: 0.4, lowerTraps: 0.4, midBack: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Dead hang",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Cuelga de una barra con agarre firme, hombros tolerando la carga y tronco relajado pero controlado. Mantén respiracion y evita dolor o perdida brusca de tension.",
        errorsToAvoid: ["Colgarse con dolor", "Perder agarre sin control", "Elevar hombros de forma rigida"],
        primaryMuscles: ["Antebrazos", "Dorsal ancho"],
        secondaryMuscles: ["Trapecio inferior", "Core"],
        fatigueMap: { forearms: 0.8, lats: 0.5, lowerTraps: 0.3, core: 0.2 }
      }),
      squatExercise({
        name: "Scapular pull-up hold",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Desde colgado, activa depresion escapular y mantén el cuerpo elevado sin flexionar codos. Debe verse control de escápulas y cuello relajado.",
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
          "Rema con una mancuerna apoyando el cuerpo en banco, llevando el codo atras sin rotar el tronco. Mantén escápula controlada y bajada estable.",
        errorsToAvoid: ["Girar el tronco", "Tirar con impulso", "Elevar el hombro hacia la oreja"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Deltoides posterior", "Biceps", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.8, midBack: 0.9, rearDelts: 0.5, biceps: 0.5, forearms: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Inverted row / Australian pull-up",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Tira del cuerpo hacia una barra baja manteniendo linea corporal y escápulas activas. Ajusta la inclinacion para controlar dificultad sin perder postura.",
        errorsToAvoid: ["Caer de cadera", "Adelantar la cabeza", "Tirar solo con brazos"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Core", "Antebrazos"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, core: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Seated cable row",
        equipment: ["Polea"],
        technicalDescription:
          "Rema sentado en polea llevando codos atras con pecho alto y escápulas controladas. Mantén torso estable y evita balancear el cuerpo.",
        errorsToAvoid: ["Balancearse para tirar", "Redondear espalda", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Antebrazos"],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, rearDelts: 0.4, forearms: 0.4 }
      }),
      squatExercise({
        name: "T-bar row",
        equipment: ["Barra T", "Landmine"],
        technicalDescription:
          "Rema con barra T o landmine manteniendo tronco firme, cadera estable y trayectoria hacia el abdomen. Controla la bajada sin perder posicion.",
        errorsToAvoid: ["Redondear lumbar", "Usar impulso de cadera", "Llevar hombros al cuello"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Erectores espinales", "Antebrazos", "Deltoides posterior"],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, spinalErectors: 0.5, forearms: 0.5, rearDelts: 0.4 }
      }),
      squatExercise({
        name: "Assisted pull-up / Chin-up",
        equipment: ["Banda", "Maquina asistida"],
        technicalDescription:
          "Realiza dominadas asistidas iniciando con control escapular y llevando pecho hacia la barra. Usa asistencia suficiente para completar rango sin perder tecnica.",
        errorsToAvoid: ["Balancearse", "Acortar el rango", "Tirar con cuello o hombros elevados"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.8, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.5, core: 0.3 }
      }),
      squatExercise({
        name: "Pull-up / Chin-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza dominada o chin-up desde colgado, iniciando con escápulas y llevando el cuerpo hacia la barra. Mantén control, rango completo y sin balanceo excesivo.",
        errorsToAvoid: ["Kipping sin objetivo", "No completar rango", "Encoger hombros al subir"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
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
        equipment: ["Maquina"],
        technicalDescription:
          "Rema en maquina con pecho apoyado, manteniendo hombros bajos y tirando con codos. El apoyo reduce compensaciones y permite acumular volumen controlado.",
        errorsToAvoid: ["Separar el pecho del apoyo", "Encoger hombros", "Rebotar la carga"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Antebrazos"],
        fatigueMap: { midBack: 0.9, lats: 0.7, biceps: 0.4, rearDelts: 0.5, forearms: 0.3 }
      }),
      squatExercise({
        name: "Diagonal row machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Rema en trayectoria diagonal guiada, buscando recorrido estable y tension continua. Mantén pecho apoyado o tronco fijo según maquina.",
        errorsToAvoid: ["Tirar con impulso", "Perder trayectoria", "Elevar hombros"],
        primaryMuscles: ["Dorsal ancho", "Espalda media"],
        secondaryMuscles: ["Biceps", "Deltoides posterior"],
        fatigueMap: { lats: 0.8, midBack: 0.8, biceps: 0.4, rearDelts: 0.4 }
      }),
      squatExercise({
        name: "Chest-supported T-bar row",
        equipment: ["Barra T", "Maquina"],
        technicalDescription:
          "Rema con pecho apoyado en barra T o maquina, llevando codos atras sin despegar el torso. Controla la fase excentrica y mantén cuello neutro.",
        errorsToAvoid: ["Separarse del apoyo", "Acortar rango", "Cerrar demasiado el cuello"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Antebrazos"],
        fatigueMap: { midBack: 0.9, lats: 0.8, biceps: 0.5, rearDelts: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Lat pulldown",
        equipment: ["Maquina", "Polea"],
        technicalDescription:
          "Realiza jalon vertical llevando la barra o agarre hacia la parte alta del pecho. Inicia con depresion escapular y controla la vuelta sin perder postura.",
        errorsToAvoid: ["Tirar detras de la nuca sin criterio", "Balancear el tronco", "Perder depresion escapular"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos"],
        fatigueMap: { lats: 0.9, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.4 }
      }),
      squatExercise({
        name: "Cable pullover",
        equipment: ["Polea"],
        technicalDescription:
          "Extiende los hombros desde polea manteniendo codos casi fijos y tronco estable. Busca tension de dorsal sin convertirlo en empuje ni flexionar codos.",
        errorsToAvoid: ["Doblar demasiado los codos", "Arquear lumbar", "Usar impulso"],
        primaryMuscles: ["Dorsal ancho"],
        secondaryMuscles: ["Triceps", "Core", "Serrato anterior"],
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
        equipment: ["Balon medicinal"],
        technicalDescription:
          "Eleva el balon y golpea el suelo con accion potente de brazos y tronco. Mantén control del rebote y usa una trayectoria fuerte sin perder postura.",
        errorsToAvoid: ["Arquear lumbar", "Golpear sin controlar el rebote", "Usar solo brazos"],
        primaryMuscles: ["Dorsal ancho", "Core"],
        secondaryMuscles: ["Triceps", "Espalda media", "Deltoides anterior"],
        fatigueMap: { lats: 0.6, core: 0.7, triceps: 0.4, midBack: 0.3, anteriorDelts: 0.3 }
      }),
      squatExercise({
        name: "Explosive band row",
        equipment: ["Banda elastica"],
        technicalDescription:
          "Rema contra banda con intencion explosiva y retorno controlado. Mantén tronco estable y acelera el codo atras sin perder escápula.",
        errorsToAvoid: ["Perder control al volver", "Rotar el tronco", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.7, lats: 0.6, biceps: 0.4, rearDelts: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Explosive inverted row",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Realiza inverted row con intencion explosiva manteniendo cuerpo alineado. Sube rapido, controla la bajada y evita perder rigidez corporal.",
        errorsToAvoid: ["Caer de cadera", "Tirar con cuello", "Perder control excentrico"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Core", "Antebrazos"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, core: 0.5, forearms: 0.4 }
      }),
      squatExercise({
        name: "Explosive pull-up",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza una dominada buscando maxima velocidad de subida sin balanceo excesivo. Mantén inicio escapular, rango util y recepcion controlada al bajar.",
        errorsToAvoid: ["Convertirlo en kipping sin control", "Acortar rango", "Caer sin frenar"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
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
        equipment: ["Banda elastica"],
        technicalDescription:
          "Realiza remos reactivos con banda, absorbiendo la vuelta y relanzando la traccion con rapidez. Mantén escápulas activas y tronco estable.",
        errorsToAvoid: ["Dejar que la banda tire sin control", "Perder postura", "Encoger hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho"],
        secondaryMuscles: ["Biceps", "Deltoides posterior", "Core"],
        fatigueMap: { midBack: 0.7, lats: 0.6, biceps: 0.4, rearDelts: 0.4, core: 0.3 }
      }),
      squatExercise({
        name: "Inverted row release/catch",
        equipment: ["Peso corporal", "Barra"],
        technicalDescription:
          "Desde inverted row, suelta brevemente y vuelve a agarrar o absorber la traccion con control. Prioriza contacto seguro y alineacion corporal.",
        errorsToAvoid: ["Soltar sin control", "Perder rigidez corporal", "Caer de hombros"],
        primaryMuscles: ["Espalda media", "Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Deltoides posterior", "Antebrazos", "Core"],
        fatigueMap: { midBack: 0.8, lats: 0.7, biceps: 0.5, rearDelts: 0.5, forearms: 0.5, core: 0.5 }
      }),
      squatExercise({
        name: "Band-assisted plyo pull-up",
        equipment: ["Banda", "Barra"],
        technicalDescription:
          "Realiza dominadas pliometricas asistidas con banda buscando una subida rapida y recepcion controlada. La asistencia debe permitir velocidad sin perder tecnica.",
        errorsToAvoid: ["Usar una banda demasiado ligera", "Balancearse", "Caer sin control escapular"],
        primaryMuscles: ["Dorsal ancho", "Biceps"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Antebrazos", "Core"],
        fatigueMap: { lats: 0.8, biceps: 0.6, midBack: 0.5, lowerTraps: 0.4, forearms: 0.5, core: 0.4 }
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
        equipment: ["Maquina"],
        technicalDescription:
          "Realiza aperturas guiadas en maquina manteniendo pecho alto y hombros controlados. Junta los brazos sin perder posicion escapular y vuelve con control.",
        errorsToAvoid: ["Llevar hombros hacia delante", "Usar impulso", "Forzar rango con dolor"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Biceps"],
        fatigueMap: { chest: 1, anteriorDelts: 0.3, biceps: 0.1 }
      }),
      squatExercise({
        name: "Cable fly",
        equipment: ["Polea"],
        technicalDescription:
          "Realiza aperturas en polea con ligera flexion de codo, controlando la vuelta y manteniendo pecho abierto. La tension debe ser continua y sin tirones.",
        errorsToAvoid: ["Convertirlo en press", "Perder postura", "Cruzar brazos con impulso"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 1, anteriorDelts: 0.4, core: 0.2 }
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
        fatigueMap: { lateralDelts: 1, upperTraps: 0.3, rotatorCuff: 0.2 }
      }),
      squatExercise({
        name: "Reverse fly machine",
        equipment: ["Maquina"],
        technicalDescription:
          "Realiza aperturas inversas en maquina con codos suaves y escápulas controladas. Mantén pecho apoyado y evita impulsar la carga.",
        errorsToAvoid: ["Encoger hombros", "Flexionar demasiado codos", "Perder control en la vuelta"],
        primaryMuscles: ["Deltoides posterior"],
        secondaryMuscles: ["Espalda media", "Trapecio inferior", "Manguito rotador"],
        fatigueMap: { rearDelts: 1, midBack: 0.5, lowerTraps: 0.3, rotatorCuff: 0.3 }
      }),
      squatExercise({
        name: "Face pull",
        equipment: ["Polea", "Banda"],
        technicalDescription:
          "Tira hacia la cara con codos altos, rotacion externa y escápulas controladas. Debe verse deltoides posterior y espalda media trabajando sin elevar hombros.",
        errorsToAvoid: ["Convertirlo en remo bajo", "Arquear lumbar", "Encoger hombros"],
        primaryMuscles: ["Deltoides posterior", "Espalda media"],
        secondaryMuscles: ["Trapecio inferior", "Manguito rotador", "Biceps"],
        fatigueMap: { rearDelts: 0.8, midBack: 0.6, lowerTraps: 0.5, rotatorCuff: 0.5, biceps: 0.2 }
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
        errorsToAvoid: ["Mover los codos", "Usar impulso", "Perder control en la fase excentrica"],
        primaryMuscles: ["Triceps"],
        secondaryMuscles: ["Antebrazos", "Hombros"],
        fatigueMap: { triceps: 1, forearms: 0.2, shoulders: 0.1 }
      }),
      squatExercise({
        name: "Biceps curl",
        equipment: ["Mancuernas", "Barra", "Polea"],
        technicalDescription:
          "Flexiona los codos manteniendo brazos estables y muñecas controladas. Sube sin balancear y baja con control para mantener tension en biceps.",
        errorsToAvoid: ["Balancear el tronco", "Mover codos hacia delante", "Perder control excentrico"],
        primaryMuscles: ["Biceps"],
        secondaryMuscles: ["Antebrazos", "Deltoides anterior"],
        fatigueMap: { biceps: 1, forearms: 0.4, anteriorDelts: 0.1 }
      }),
      squatExercise({
        name: "Spider curl",
        equipment: ["Mancuernas", "Barra"],
        technicalDescription:
          "Realiza curl con pecho apoyado en banco inclinado, dejando brazos colgar y flexionando codos sin balanceo. Mantén tension y control total.",
        errorsToAvoid: ["Despegar el pecho", "Acortar rango", "Usar impulso"],
        primaryMuscles: ["Biceps"],
        secondaryMuscles: ["Antebrazos"],
        fatigueMap: { biceps: 1, forearms: 0.3 }
      }),
      squatExercise({
        name: "Preacher curl",
        equipment: ["Banco predicador", "Maquina"],
        technicalDescription:
          "Flexiona los codos con brazos apoyados en banco predicador o maquina. Controla la bajada y evita perder tension al extender.",
        errorsToAvoid: ["Hiperextender el codo", "Levantar brazos del apoyo", "Rebotar abajo"],
        primaryMuscles: ["Biceps"],
        secondaryMuscles: ["Antebrazos"],
        fatigueMap: { biceps: 1, forearms: 0.3 }
      })
    ]
  },
  {
    slug: "core-trunk-control-rotation",
    pattern: "Core / Trunk Control",
    block: "Rotation",
    exercises: [
      squatExercise({
        name: "Thoracic rotation drill",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Realiza rotaciones toracicas controladas manteniendo pelvis estable y respiracion fluida. Debe moverse la parte alta de la espalda sin compensar desde la zona lumbar.",
        errorsToAvoid: ["Rotar desde la pelvis", "Forzar el cuello", "Buscar rango con dolor"],
        primaryMuscles: ["Oblicuos", "Movilidad toracica"],
        secondaryMuscles: ["Transverso abdominal", "Erectores espinales"],
        fatigueMap: { obliques: 0.4, transverseAbdominis: 0.3, spinalErectors: 0.2, lumbarStabilizers: 0.2 }
      }),
      squatExercise({
        name: "Half-kneeling band rotation",
        equipment: ["Banda elastica"],
        technicalDescription:
          "Desde medio arrodillado, rota el tronco contra la banda manteniendo pelvis estable y costillas controladas. La rotacion debe ser limpia y sin perder equilibrio.",
        errorsToAvoid: ["Girar la pelvis", "Inclinarse hacia la banda", "Tirar solo con brazos"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Gluteos", "Hombros", "Recto abdominal"],
        fatigueMap: { obliques: 0.7, transverseAbdominis: 0.6, glutes: 0.3, shoulders: 0.3, rectusAbdominis: 0.3 }
      }),
      squatExercise({
        name: "Standing cable rotation",
        equipment: ["Polea"],
        technicalDescription:
          "Rota de pie con polea manteniendo base estable, pelvis controlada y transferencia de fuerza desde cadera a tronco. El movimiento debe ser continuo y coordinado.",
        errorsToAvoid: ["Rotar solo con brazos", "Perder apoyo de pies", "Arquear lumbar"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Caderas", "Hombros", "Gluteos"],
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
        equipment: ["Balon medicinal"],
        technicalDescription:
          "Lanza el balon medicinal rotando con potencia desde caderas y tronco. Debe verse transferencia fluida, pies activos y salida explosiva sin perder control.",
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
        equipment: ["Banda elastica", "Polea"],
        technicalDescription:
          "Empuja la banda o polea al frente resistiendo que el tronco rote. Mantén pelvis y costillas alineadas, brazos firmes y respiracion controlada.",
        errorsToAvoid: ["Rotar hacia la carga", "Encoger hombros", "Bloquear respiracion"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Recto abdominal", "Gluteos", "Hombros"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, rectusAbdominis: 0.4, glutes: 0.3, shoulders: 0.2 }
      }),
      squatExercise({
        name: "Half-kneeling Pallof press",
        equipment: ["Banda elastica", "Polea"],
        technicalDescription:
          "Desde medio arrodillado, realiza Pallof press resistiendo rotacion y manteniendo pelvis neutra. La posicion debe reducir compensaciones y exigir control lumbopelvico.",
        errorsToAvoid: ["Inclinarse hacia la resistencia", "Perder pelvis neutra", "Empujar con hombros elevados"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Gluteos", "Recto abdominal", "Hombros"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, glutes: 0.4, rectusAbdominis: 0.4, shoulders: 0.2 }
      }),
      squatExercise({
        name: "Anti-rotation walkout",
        equipment: ["Banda elastica", "Polea"],
        technicalDescription:
          "Camina lateralmente alejandote de la resistencia y mantén el tronco sin rotar. Cada paso debe ser estable, con pelvis nivelada y brazos firmes.",
        errorsToAvoid: ["Girar el tronco", "Dar pasos demasiado largos", "Perder tension de brazos"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Gluteos", "Hombros", "Aductores"],
        fatigueMap: { obliques: 0.9, transverseAbdominis: 0.8, glutes: 0.4, shoulders: 0.3, adductors: 0.2 }
      }),
      squatExercise({
        name: "Dead bug anti-rotation",
        equipment: ["Banda elastica"],
        technicalDescription:
          "Realiza dead bug resistiendo una traccion lateral de banda. Mantén lumbar estable, pelvis controlada y movimiento lento de piernas o brazos.",
        errorsToAvoid: ["Arquear lumbar", "Rotar pelvis", "Mover extremidades demasiado rapido"],
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
          "Inclina lateralmente el tronco de forma controlada y vuelve a la posicion neutra. Mantén pelvis estable, recorrido util y tension en el costado.",
        errorsToAvoid: ["Rotar el tronco", "Usar impulso", "Cargar demasiado peso"],
        primaryMuscles: ["Oblicuos"],
        secondaryMuscles: ["Cuadrado lumbar", "Estabilizadores lumbares"],
        fatigueMap: { obliques: 0.8, lumbarStabilizers: 0.5, transverseAbdominis: 0.3 }
      }),
      squatExercise({
        name: "45-degree side bend",
        equipment: ["Banco romano"],
        technicalDescription:
          "Realiza flexion lateral en banco a 45 grados controlando bajada y subida. Mantén cadera apoyada, tronco largo y movimiento sin rotacion.",
        errorsToAvoid: ["Girar el pecho", "Rebotar abajo", "Forzar rango lumbar"],
        primaryMuscles: ["Oblicuos", "Cuadrado lumbar"],
        secondaryMuscles: ["Gluteo medio", "Estabilizadores lumbares"],
        fatigueMap: { obliques: 0.8, lumbarStabilizers: 0.6, gluteMed: 0.3 }
      }),
      squatExercise({
        name: "Cable oblique crunch",
        equipment: ["Polea"],
        technicalDescription:
          "Flexiona y rota ligeramente el tronco contra polea dirigiendo el esfuerzo al oblicuo. Mantén pelvis estable y controla el retorno sin perder tension.",
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
          "Mantén plancha lateral con cuerpo alineado, cadera elevada y hombro estable. Debe verse una linea firme sin hundir pelvis ni rotar el tronco.",
        errorsToAvoid: ["Caer de cadera", "Rotar hombros", "Apoyar el cuello en tension"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Gluteo medio", "Hombros", "Aductores"],
        fatigueMap: { obliques: 1, transverseAbdominis: 0.8, gluteMed: 0.6, shoulders: 0.4, adductors: 0.2 }
      }),
      squatExercise({
        name: "Side plank with reach",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Desde plancha lateral, añade alcance del brazo manteniendo cadera alta y tronco estable. El alcance debe desafiar el control sin perder alineacion.",
        errorsToAvoid: ["Rotar sin control", "Bajar cadera", "Perder apoyo del hombro"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Gluteo medio", "Hombros", "Serrato anterior"],
        fatigueMap: { obliques: 1, transverseAbdominis: 0.8, gluteMed: 0.6, shoulders: 0.5, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Copenhagen plank",
        equipment: ["Banco", "Peso corporal"],
        technicalDescription:
          "Mantén plancha lateral con la pierna superior apoyada en banco, sosteniendo pelvis alta y tronco alineado. Controla aductores y oblicuos sin dolor.",
        errorsToAvoid: ["Hundirse de pelvis", "Forzar la ingle", "Rotar el tronco"],
        primaryMuscles: ["Aductores", "Oblicuos"],
        secondaryMuscles: ["Transverso abdominal", "Gluteo medio", "Hombros"],
        fatigueMap: { adductors: 0.9, obliques: 0.8, transverseAbdominis: 0.6, gluteMed: 0.4, shoulders: 0.3 }
      }),
      squatExercise({
        name: "Offset hold",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Sostén una carga a un lado manteniendo tronco vertical y pelvis nivelada. El objetivo es resistir inclinacion lateral sin compensar con hombros o cadera.",
        errorsToAvoid: ["Inclinarse hacia la carga", "Elevar un hombro", "Perder respiracion"],
        primaryMuscles: ["Oblicuos", "Transverso abdominal"],
        secondaryMuscles: ["Antebrazos", "Gluteos", "Hombros"],
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
        errorsToAvoid: ["Tirar del cuello", "Usar impulso", "Aplastar la respiracion"],
        primaryMuscles: ["Recto abdominal"],
        secondaryMuscles: ["Oblicuos", "Transverso abdominal"],
        fatigueMap: { rectusAbdominis: 0.8, obliques: 0.3, transverseAbdominis: 0.3 }
      }),
      squatExercise({
        name: "Cable crunch",
        equipment: ["Polea"],
        technicalDescription:
          "Flexiona el tronco contra polea manteniendo cadera estable y controlando la vuelta. Debe verse flexion abdominal, no tiron de brazos.",
        errorsToAvoid: ["Tirar con brazos", "Sentarse sobre talones", "Perder control excentrico"],
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
          "Desde prono, extiende suavemente el tronco manteniendo cuello largo y gluteos activos. Busca control posterior sin comprimir la zona lumbar.",
        errorsToAvoid: ["Hiperextender lumbar", "Elevar demasiado la cabeza", "Perder control al bajar"],
        primaryMuscles: ["Erectores espinales", "Estabilizadores lumbares"],
        secondaryMuscles: ["Gluteos", "Isquios"],
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
          "Mueve brazos y piernas alternos manteniendo lumbar estable y pelvis neutra. Ajusta material para mejorar feedback sin perder respiracion ni control.",
        errorsToAvoid: ["Arquear lumbar", "Mover demasiado rapido", "Perder coordinacion respiratoria"],
        primaryMuscles: ["Transverso abdominal", "Recto abdominal"],
        secondaryMuscles: ["Flexores cadera", "Oblicuos", "Estabilizadores lumbares"],
        fatigueMap: { transverseAbdominis: 0.9, rectusAbdominis: 0.6, hipFlexors: 0.3, obliques: 0.4, lumbarStabilizers: 0.5 }
      }),
      squatExercise({
        name: "Bird dog",
        equipment: ["Peso corporal", "Banda elastica"],
        technicalDescription:
          "Desde cuadrupedia, extiende brazo y pierna contrarios manteniendo pelvis y costillas estables. El movimiento debe ser lento, simetrico y sin rotacion.",
        errorsToAvoid: ["Abrir la cadera", "Arquear lumbar", "Elevar extremidades demasiado alto"],
        primaryMuscles: ["Transverso abdominal", "Estabilizadores lumbares"],
        secondaryMuscles: ["Gluteos", "Hombros", "Oblicuos"],
        fatigueMap: { transverseAbdominis: 0.8, lumbarStabilizers: 0.7, glutes: 0.4, shoulders: 0.3, obliques: 0.3 }
      }),
      squatExercise({
        name: "Plank",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén plancha frontal con pelvis neutra, costillas controladas y empuje activo del suelo. El cuerpo debe formar una linea estable sin hundirse.",
        errorsToAvoid: ["Caer de lumbar", "Elevar demasiado la cadera", "Bloquear respiracion"],
        primaryMuscles: ["Transverso abdominal", "Recto abdominal"],
        secondaryMuscles: ["Hombros", "Gluteos", "Serrato anterior"],
        fatigueMap: { transverseAbdominis: 0.9, rectusAbdominis: 0.7, shoulders: 0.4, glutes: 0.3, serratusAnterior: 0.3 }
      }),
      squatExercise({
        name: "Hollow hold",
        equipment: ["Peso corporal"],
        technicalDescription:
          "Mantén posicion hollow con lumbar controlada, costillas abajo y extremidades extendidas segun nivel. Debe sentirse tension abdominal sin perder pelvis.",
        errorsToAvoid: ["Arquear lumbar", "Elevar cabeza con tension cervical", "Usar una palanca demasiado dificil"],
        primaryMuscles: ["Recto abdominal", "Transverso abdominal"],
        secondaryMuscles: ["Flexores cadera", "Oblicuos"],
        fatigueMap: { rectusAbdominis: 0.9, transverseAbdominis: 0.8, hipFlexors: 0.4, obliques: 0.4 }
      }),
      squatExercise({
        name: "Ab wheel rollout",
        equipment: ["Rueda abdominal"],
        technicalDescription:
          "Rueda hacia delante manteniendo pelvis y costillas controladas, y vuelve sin colapsar lumbar. Ajusta rango para conservar tension abdominal y hombros estables.",
        errorsToAvoid: ["Arquear lumbar", "Ir mas lejos de lo controlable", "Tirar con brazos al volver"],
        primaryMuscles: ["Recto abdominal", "Transverso abdominal"],
        secondaryMuscles: ["Dorsal", "Hombros", "Estabilizadores lumbares"],
        fatigueMap: { rectusAbdominis: 1, transverseAbdominis: 0.8, lats: 0.5, shoulders: 0.4, lumbarStabilizers: 0.6 }
      })
    ]
  }
];

export const exerciseLibrary: ExerciseDefinition[] = exerciseGroups.flatMap((group) =>
  group.exercises.map((exercise, index) => ({
    ...exercise,
    bodyRegion: patternBodyRegions[group.pattern],
    id: `${group.slug}-${index + 1}`,
    pattern: group.pattern,
    block: group.block,
    rank: index + 1
  }))
);

export function getExercisesByPattern(pattern: ExercisePattern) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.pattern === pattern));
}

export function getExercisePatternsByBodyRegion(bodyRegion: BodyRegion) {
  return exercisePatterns.filter((pattern) => patternBodyRegions[pattern] === bodyRegion);
}

export function getExercisesByBodyRegion(bodyRegion: BodyRegion) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.bodyRegion === bodyRegion));
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
    if (!exercise) return acc;

    Object.entries(exercise.fatigueMap).forEach(([muscle, value]) => {
      acc[muscle] = (acc[muscle] ?? 0) + entry.sets * value;
    });

    return acc;
  }, {});
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
