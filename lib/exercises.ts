export type ExercisePattern =
  | "Squat / Vertical Force"
  | "Hinge / Horizontal Force"
  | "Lunge"
  | "Gait & Carry"
  | "Push"
  | "Pull"
  | "Rotation"
  | "Core";

export type ExerciseBlock =
  | "Control / tolerancia"
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
  | "spinalErectors";

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
  "Lunge",
  "Gait & Carry",
  "Push",
  "Pull",
  "Rotation",
  "Core"
];

export const exerciseBlocks: ExerciseBlock[] = [
  "Control / tolerancia",
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
  legacyGroup("lunge-unilateral-control", "Lunge", "Control / tolerancia", [
    ["Split squat asistido", ["Apoyo externo"]],
    ["Step back lunge asistido", ["Apoyo externo"]],
    ["Split squat peso corporal", ["Peso corporal"]],
    ["Step up bajo", ["Cajon bajo"]]
  ]),
  legacyGroup("lunge-unilateral-strength", "Lunge", "Fuerza base", [
    ["Split squat con mancuernas", ["Mancuernas"]],
    ["Reverse lunge con mancuernas", ["Mancuernas"]],
    ["Bulgarian split squat", ["Banco", "Carga externa"]],
    ["Front rack reverse lunge", ["Barra"]]
  ]),
  legacyGroup("lunge-unilateral-hypertrophy", "Lunge", "Hipertrofia", [
    ["Step up alto", ["Cajon"]],
    ["Walking lunge", ["Mancuernas"]],
    ["Bulgarian split squat en multipower", ["Multipower"]],
    ["Prensa unilateral", ["Maquina"]]
  ]),
  legacyGroup("lunge-unilateral-power", "Lunge", "Potencia", [
    ["Split squat jump", ["Peso corporal"]],
    ["Alternating lunge jump", ["Peso corporal"]],
    ["Lateral bound", ["Peso corporal"]],
    ["Step up jump", ["Cajon"]]
  ]),
  legacyGroup("gait-carry-control", "Gait & Carry", "Control / tolerancia", [
    ["Marcha asistida con feedback manual", ["Asistencia manual"]],
    ["Marcha en el sitio", ["Peso corporal"]],
    ["Farmer hold bilateral", ["Mancuernas", "Kettlebells"]],
    ["Farmer carry bilateral", ["Mancuernas", "Kettlebells"]]
  ]),
  legacyGroup("gait-carry-strength", "Gait & Carry", "Fuerza base", [
    ["Suitcase carry", ["Mancuerna", "Kettlebell"]],
    ["Front rack carry", ["Kettlebells"]],
    ["Trap bar carry", ["Trap bar"]],
    ["Sled push pesado", ["Trineo"]]
  ]),
  legacyGroup("gait-carry-hypertrophy", "Gait & Carry", "Hipertrofia", [
    ["Sled push volumen", ["Trineo"]],
    ["Sled drag", ["Trineo"]],
    ["Stair climber loaded", ["Maquina"]],
    ["Farmer carry tiempo bajo tension", ["Mancuernas", "Kettlebells"]]
  ]),
  legacyGroup("gait-carry-power", "Gait & Carry", "Potencia", [
    ["A-skip", ["Peso corporal"]],
    ["Pogo run", ["Peso corporal"]],
    ["Sled sprint", ["Trineo"]],
    ["Resisted acceleration", ["Cinta", "Trineo"]]
  ]),
  legacyGroup("push-horizontal-control", "Push", "Control / tolerancia", [
    ["Press manual supino", ["Resistencia manual"]],
    ["Press pared", ["Peso corporal"]],
    ["Flexion inclinada alta", ["Apoyo alto"]],
    ["Flexion inclinada baja", ["Banco"]]
  ]),
  legacyGroup("push-horizontal-strength", "Push", "Fuerza base", [
    ["Flexion", ["Peso corporal"]],
    ["Press mancuernas banco", ["Mancuernas"]],
    ["Press banca", ["Barra"]],
    ["Floor press", ["Barra", "Mancuernas"]]
  ]),
  legacyGroup("push-horizontal-hypertrophy", "Push", "Hipertrofia", [
    ["Press maquina convergente", ["Maquina"]],
    ["Chest press", ["Maquina"]],
    ["Aperturas en polea", ["Polea"]],
    ["Pec deck", ["Maquina"]]
  ]),
  legacyGroup("push-horizontal-power", "Push", "Potencia", [
    ["Chest pass balon medicinal", ["Balon medicinal"]],
    ["Plyo push up", ["Peso corporal"]],
    ["Bench throw", ["Barra", "Multipower"]],
    ["Push press", ["Barra"]]
  ]),
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
    ["Power snatch from hang", ["Barra"]]
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
