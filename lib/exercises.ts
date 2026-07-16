export type ExercisePattern =
  | "Squat / Vertical Force"
  | "Hinge / Horizontal Force"
  | "Lunge / Unilateral Force"
  | "Olympic derivatives"
  | "Gait & Carry"
  | "Push / Upper Body Press"
  | "Pull"
  | "Rotation"
  | "Core";

export type ExerciseBlock =
  | "Control / tolerancia"
  | "Reeducación de la marcha"
  | "Fuerza base"
  | "Hipertrofia"
  | "Potencia"
  | "Pliometria"
  | "Conditioning";

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
  | "chest"
  | "triceps"
  | "anteriorDelts"
  | "lateralDelts"
  | "upperTraps"
  | "serratusAnterior"
  | "spinalErectors"
  | "traps"
  | "forearms"
  | "upperBack";

export type ExerciseDefinition = {
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

type ExerciseSeed = Omit<ExerciseDefinition, "block" | "id" | "pattern" | "rank">;

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
  "Olympic derivatives",
  "Gait & Carry",
  "Push / Upper Body Press",
  "Pull",
  "Rotation",
  "Core"
];

export const exerciseBlocks: ExerciseBlock[] = [
  "Control / tolerancia",
  "Reeducación de la marcha",
  "Fuerza base",
  "Hipertrofia",
  "Potencia",
  "Pliometria",
  "Conditioning"
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
        name: "Leg extension",
        equipment: ["Maquina"],
        technicalDescription:
          "Extiende la rodilla en maquina controlando el recorrido y la pausa final sin perder la posicion de la cadera. Mantén tension continua y regreso controlado.",
        errorsToAvoid: ["Balancear el cuerpo", "Soltar la fase de bajada", "Usar un rango doloroso"],
        primaryMuscles: ["Cuadriceps"],
        secondaryMuscles: ["Hip flexors"],
        fatigueMap: { quadriceps: 1, hipFlexors: 0.2 }
      }),
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
        name: "Romanian deadlift unilateral",
        equipment: ["Mancuerna", "Kettlebell"],
        technicalDescription:
          "Realiza una bisagra a una pierna con carga contralateral o ipsilateral. Mantén pelvis estable, espalda neutra y control del apoyo.",
        errorsToAvoid: ["Abrir la cadera", "Perder equilibrio", "Redondear la espalda"],
        primaryMuscles: ["Isquios", "Gluteo mayor"],
        secondaryMuscles: ["Aductores", "Core", "Erectores espinales", "Gemelos"],
        fatigueMap: { hamstrings: 0.9, glutes: 0.8, adductors: 0.4, core: 0.4, spinalErectors: 0.3, calves: 0.2 }
      }),
      squatExercise({
        name: "Nordic curl",
        equipment: ["Peso corporal", "Soporte"],
        technicalDescription:
          "Fija los pies y controla el descenso del tronco desde las rodillas. Mantén cadera extendida y usa asistencia si necesitas conservar calidad.",
        errorsToAvoid: ["Flexionar la cadera", "Caer sin control", "Perder alineacion tronco-muslo"],
        primaryMuscles: ["Isquios"],
        secondaryMuscles: ["Gluteo mayor", "Gemelos", "Core"],
        fatigueMap: { hamstrings: 1, glutes: 0.4, calves: 0.3, core: 0.3 }
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
        name: "Pec deck",
        equipment: ["Maquina"],
        technicalDescription:
          "Realiza aperturas guiadas en maquina manteniendo pecho alto y hombros controlados. Junta los brazos sin perder posicion escapular y vuelve con control.",
        errorsToAvoid: ["Llevar hombros hacia delante", "Usar impulso", "Forzar rango con dolor"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Serrato anterior"],
        fatigueMap: { chest: 1, anteriorDelts: 0.4, serratusAnterior: 0.2 }
      }),
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
        name: "Cable fly",
        equipment: ["Polea"],
        technicalDescription:
          "Realiza aperturas en polea con ligera flexion de codo, controlando la vuelta y manteniendo pecho abierto. La tension debe ser continua y sin tirones.",
        errorsToAvoid: ["Convertirlo en press", "Perder postura", "Cruzar brazos con impulso"],
        primaryMuscles: ["Pectoral"],
        secondaryMuscles: ["Deltoides anterior", "Core"],
        fatigueMap: { chest: 1, anteriorDelts: 0.4, core: 0.2 }
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
      }),
      squatExercise({
        name: "Lateral raise",
        equipment: ["Mancuernas", "Polea"],
        technicalDescription:
          "Eleva los brazos hacia los lados manteniendo cuello relajado y control del peso. Debe verse recorrido limpio, sin balanceo ni subida excesiva del hombro.",
        errorsToAvoid: ["Balancear el tronco", "Subir con trapecio", "Flexionar demasiado los codos"],
        primaryMuscles: ["Deltoides lateral"],
        secondaryMuscles: ["Trapecio superior", "Core"],
        fatigueMap: { lateralDelts: 1, upperTraps: 0.3, core: 0.1 }
      }),
      squatExercise({
        name: "Triceps extension",
        equipment: ["Polea", "Mancuerna"],
        technicalDescription:
          "Extiende los codos manteniendo brazos estables y controlando la vuelta. El movimiento debe centrarse en el codo sin compensar con hombros o tronco.",
        errorsToAvoid: ["Mover los codos", "Usar impulso", "Perder control en la fase excentrica"],
        primaryMuscles: ["Triceps"],
        secondaryMuscles: ["Antebrazos", "Core"],
        fatigueMap: { triceps: 1, forearms: 0.2, core: 0.1 }
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
  legacyGroup("pull-horizontal-control", "Pull", "Control / tolerancia", [
    ["Retraccion escapular asistida", ["Asistencia manual"]],
    ["Remo manual sentado", ["Resistencia manual"]],
    ["Remo con banda", ["Banda elastica"]],
    ["Remo TRX alto", ["TRX"]]
  ]),
  legacyGroup("pull-horizontal-strength", "Pull", "Fuerza base", [
    ["Remo mancuerna apoyado", ["Mancuerna"]],
    ["Remo TRX bajo", ["TRX"]],
    ["Remo con barra", ["Barra"]],
    ["Dominada asistida con banda", ["Banda elastica"]]
  ]),
  legacyGroup("pull-horizontal-hypertrophy", "Pull", "Hipertrofia", [
    ["Remo en polea", ["Polea"]],
    ["Remo maquina convergente", ["Maquina"]],
    ["Jalon al pecho", ["Polea"]],
    ["Pullover en polea", ["Polea"]]
  ]),
  legacyGroup("pull-horizontal-power", "Pull", "Potencia", [
    ["Med ball slam", ["Balon medicinal"]],
    ["Explosive TRX row", ["TRX"]],
    ["High pull", ["Barra"]],
    ["Explosive band row", ["Banda elastica"]]
  ]),
  legacyGroup("rotation-control", "Rotation", "Control / tolerancia", [
    ["Anti-rotacion manual", ["Resistencia manual"]],
    ["Pallof press isometrico", ["Banda", "Polea"]],
    ["Pallof press dinamico", ["Banda", "Polea"]],
    ["Tall kneeling anti-rotacion", ["Banda", "Polea"]]
  ]),
  legacyGroup("rotation-strength", "Rotation", "Fuerza base", [
    ["Cable chop", ["Polea"]],
    ["Cable lift", ["Polea"]],
    ["Landmine rotation", ["Barra landmine"]],
    ["Half kneeling cable rotation", ["Polea"]]
  ]),
  legacyGroup("rotation-hypertrophy", "Rotation", "Hipertrofia", [
    ["Cable woodchop", ["Polea"]],
    ["Cable rotation", ["Polea"]],
    ["Rotary torso machine", ["Maquina"]],
    ["Landmine windshield", ["Barra landmine"]]
  ]),
  legacyGroup("rotation-power", "Rotation", "Potencia", [
    ["Rotational med ball throw", ["Balon medicinal"]],
    ["Shot put throw", ["Balon medicinal"]],
    ["Scoop toss", ["Balon medicinal"]],
    ["Landmine rotational punch", ["Barra landmine"]]
  ]),
  legacyGroup("core-anti-extension-control", "Core", "Control / tolerancia", [
    ["Dead bug asistido", ["Feedback manual"]],
    ["Dead bug", ["Peso corporal"]],
    ["Plank", ["Peso corporal"]],
    ["Body saw", ["Peso corporal", "Sliders"]]
  ]),
  legacyGroup("core-anti-extension-strength", "Core", "Fuerza base", [
    ["Stability ball rollout", ["Fitball"]],
    ["Ab wheel rollout", ["Rueda abdominal"]],
    ["Long lever plank", ["Peso corporal"]],
    ["Barbell rollout", ["Barra"]]
  ]),
  legacyGroup("core-hypertrophy", "Core", "Hipertrofia", [
    ["Cable crunch", ["Polea"]],
    ["Machine crunch", ["Maquina"]],
    ["Weighted plank", ["Disco"]],
    ["Hanging knee raise", ["Barra"]]
  ]),
  legacyGroup("core-power", "Core", "Potencia", [
    ["Med ball overhead slam", ["Balon medicinal"]],
    ["Med ball sit-up throw", ["Balon medicinal"]],
    ["Plank to sprint start", ["Peso corporal"]],
    ["Explosive rollout return", ["Rueda abdominal"]]
  ])
];

export const exerciseLibrary: ExerciseDefinition[] = exerciseGroups.flatMap((group) =>
  group.exercises.map((exercise, index) => ({
    ...exercise,
    id: `${group.slug}-${index + 1}`,
    pattern: group.pattern,
    block: group.block,
    rank: index + 1
  }))
);

export function getExercisesByPattern(pattern: ExercisePattern) {
  return sortExercises(exerciseLibrary.filter((exercise) => exercise.pattern === pattern));
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

function legacyGroup(
  slug: string,
  pattern: ExercisePattern,
  block: ExerciseBlock,
  exercises: [string, string[]][]
): ExerciseGroupSeed {
  return {
    slug,
    pattern,
    block,
    exercises: exercises.map(([name, equipment]) => createGenericExercise(name, equipment))
  };
}

function createGenericExercise(name: string, equipment: string[]): ExerciseSeed {
  return {
    name,
    equipment,
    technicalDescription:
      "Ejercicio clasificado por patron y bloque para seleccion del entrenador. Ajusta carga, rango y ritmo segun la persona, manteniendo control tecnico y ausencia de dolor relevante.",
    errorsToAvoid: ["Perder control tecnico", "Usar una carga no tolerada", "Forzar rango doloroso"],
    primaryMuscles: [],
    secondaryMuscles: [],
    fatigueMap: {}
  };
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
