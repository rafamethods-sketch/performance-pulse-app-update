export type ExercisePattern =
  | "Squat / Vertical Force"
  | "Hinge"
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

type ExerciseSeed = Omit<ExerciseDefinition, "block" | "id" | "pattern" | "rank">;

type ExerciseGroupSeed = {
  block: ExerciseBlock;
  pattern: ExercisePattern;
  slug: string;
  exercises: ExerciseSeed[];
};

export const exercisePatterns: ExercisePattern[] = [
  "Squat / Vertical Force",
  "Hinge",
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
  legacyGroup("hinge-bilateral-control", "Hinge", "Control / tolerancia", [
    ["Bisagra con feedback manual", ["Asistencia manual"]],
    ["Bisagra con pared", ["Pared"]],
    ["Bisagra con palo", ["Palo"]],
    ["Puente de gluteo", ["Peso corporal"]]
  ]),
  legacyGroup("hinge-bilateral-strength", "Hinge", "Fuerza base", [
    ["Peso muerto rumano con mancuernas", ["Mancuernas"]],
    ["Kettlebell deadlift", ["Kettlebell"]],
    ["Trap bar deadlift", ["Trap bar"]],
    ["Peso muerto rumano con barra", ["Barra"]]
  ]),
  legacyGroup("hinge-bilateral-hypertrophy", "Hinge", "Hipertrofia", [
    ["Hip thrust en maquina", ["Maquina"]],
    ["Curl femoral sentado", ["Maquina"]],
    ["Back extension", ["Banco"]],
    ["Pull through en polea", ["Polea"]]
  ]),
  legacyGroup("hinge-bilateral-power", "Hinge", "Potencia", [
    ["Kettlebell swing", ["Kettlebell"]],
    ["Broad jump", ["Peso corporal"]],
    ["Hang high pull", ["Barra"]],
    ["Snatch pull", ["Barra"]]
  ]),
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
