import {
  Activity,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  FileClock,
  Library,
  LineChart,
  MessageSquareText,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = "coach" | "athlete";
export type GoalType = "health" | "performance";
export type SheetId =
  | "clients"
  | "training"
  | "assessments"
  | "calendar"
  | "fatigue"
  | "decision"
  | "planning"
  | "progressions"
  | "routines"
  | "weeklyLoad"
  | "messages";
export type MovementPattern = "Dominante rodilla" | "Bisagra cadera" | "Empuje" | "Traccion" | "Core";
export type CardioMode = "Carrera" | "Ciclismo" | "Natacion";
export type AssessmentGoal = "Salud general" | "Rendimiento" | "Hipertrofia" | "Readaptacion";
export type MuscleGroup =
  | "Cuadriceps"
  | "Isquios"
  | "Gluteo"
  | "Pectoral"
  | "Dorsal"
  | "Deltoides"
  | "Biceps"
  | "Triceps"
  | "Gemelo"
  | "Core";
type NavItem = {
  id?: SheetId;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { id: "clients", label: "Clientes", icon: Users },
  { id: "calendar", label: "Calendario", icon: CalendarDays },
  { id: "training", label: "Sesiones", icon: ClipboardList },
  { id: "planning", label: "Planificacion", icon: FileClock },
  { id: "progressions", label: "Ejercicios", icon: Library },
  { id: "messages", label: "Mensajes", icon: MessageSquareText },
  { id: "weeklyLoad", label: "Metricas", icon: LineChart },
  { id: "assessments", label: "Valoraciones", icon: LineChart },
  { id: "fatigue", label: "Fatiga", icon: Activity },
  { id: "routines", label: "Rutinas", icon: Dumbbell },
  { id: "decision", label: "Dashboard general", icon: Activity }
];

export const coachMainNavIds: SheetId[] = ["clients", "calendar", "training", "planning", "progressions", "messages"];

export const coachStats = [
  { label: "Clientes registrados", value: "24", trend: "+3 este mes" },
  { label: "ACWR en zona segura", value: "18", trend: "75%" },
  { label: "Monotonia elevada", value: "4", trend: "vigilar" },
  { label: "Strain semanal alto", value: "6", trend: "ajustar carga" }
];

export const coachClients = [
  {
    id: "lucia-martin",
    name: "Lucia Martin",
    age: 31,
    sport: "Fuerza",
    modality: "Powerlifting",
    level: "Avanzada",
    goalType: "Rendimiento",
    status: "Datos completos",
    nextEvent: "Test fuerza maxima - 12/09/2026",
    lastActivity: "Fuerza tren inferior - hace 2 dias",
    availability: "4 dias / semana",
    history: "6 anos de entrenamiento de fuerza. Compite de forma recreativa.",
    injuries: "Molestia intermitente rodilla izquierda.",
    coachNotes: "Priorizar calidad tecnica y controlar fatiga de cuadriceps.",
    loadMetric: "ACWR 1.12 - monotonia 1.4",
    readiness: 94,
    activeBlocks: ["Desarrollo fuerza maxima", "Potencia baja fatiga"],
    recentSessions: ["Sentadilla 4x5 RPE 7", "Zona 2 35 min", "Peso muerto rumano 3x8"],
    metrics: ["sRPE 1840 UA", "Hooper 7/20", "ACWR 1.12", "Strain moderado"],
    chronicLoad: 1640,
    dailyLoads: [360, 0, 510, 290, 0, 460, 220],
    hooper: { sleep: 1, fatigue: 2, stress: 1, soreness: 2, mood: 1 },
    planning: {
      currentBlock: "Desarrollo fuerza maxima",
      currentWeek: "Semana 4 de 6",
      primaryGoal: "fuerza maxima",
      secondaryGoal: "mantener volumen util",
      distribution: "ondulante",
      nextSessions: ["Sentadilla pesada", "Banca tecnica", "Potencia baja fatiga"]
    },
    sessionRecords: [
      { date: "2026-06-21", type: "Fuerza", duration: 72, rpe: 7, summary: "Sentadilla 4x5, RDL 3x8", notes: "Rodilla estable" },
      { date: "2026-06-19", type: "Cardio", duration: 35, rpe: 4, summary: "Zona 2 suave", notes: "Recuperacion buena" },
      { date: "2026-06-17", type: "Fuerza", duration: 64, rpe: 8, summary: "Banca + accesorios", notes: "Fatiga local pectoral" },
      { date: "2026-06-15", type: "Fuerza", duration: 58, rpe: 5, summary: "Tecnica peso muerto", notes: "Baja carga" }
    ],
    assessments: [
      { date: "2026-06-10", type: "Fuerza", name: "e1RM sentadilla", result: "102 kg", action: "Ver historial" },
      { date: "2026-05-30", type: "Movilidad", name: "Dorsiflexion tobillo", result: "asimetria leve", action: "Anadir nueva" },
      { date: "2026-05-18", type: "Cuestionarios", name: "Hooper basal", result: "6/20", action: "Ver historial" }
    ]
  },
  {
    id: "carlos-vega",
    name: "Carlos Vega",
    age: 38,
    sport: "Running",
    modality: "Running",
    level: "Intermedio",
    goalType: "Rendimiento",
    status: "Carga alta",
    nextEvent: "10K popular - 18/10/2026",
    lastActivity: "Intervalos umbral - ayer",
    availability: "5 dias / semana",
    history: "Corredor popular con 4 anos de experiencia.",
    injuries: "Tendinopatia aquilea previa, actualmente controlada.",
    coachNotes: "Vigilar ACWR y alternar dias intensos con rodajes suaves.",
    loadMetric: "ACWR 1.41 - strain alto",
    readiness: 82,
    activeBlocks: ["Umbral / potencia aerobica", "Puesta a punto 10K"],
    recentSessions: ["6x3 min Z4", "Rodaje Z2 50 min", "Fuerza general 45 min"],
    metrics: ["sRPE 2320 UA", "Hooper 10/20", "ACWR 1.41", "Monotonia 1.8"],
    chronicLoad: 1645,
    dailyLoads: [0, 620, 360, 610, 250, 480, 0],
    hooper: { sleep: 2, fatigue: 3, stress: 2, soreness: 2, mood: 1 },
    planning: {
      currentBlock: "Umbral / potencia aerobica",
      currentWeek: "Semana 3 de 5",
      primaryGoal: "umbral",
      secondaryGoal: "mantener fuerza general",
      distribution: "flexible",
      nextSessions: ["Rodaje Z2", "Intervalos umbral", "Fuerza general"]
    },
    sessionRecords: [
      { date: "2026-06-21", type: "Running", duration: 46, rpe: 8, summary: "6x3 min Z4", notes: "FC alta al final" },
      { date: "2026-06-20", type: "Running", duration: 50, rpe: 5, summary: "Rodaje Z2", notes: "Aquiles sin dolor" },
      { date: "2026-06-18", type: "Fuerza", duration: 45, rpe: 6, summary: "Fuerza general", notes: "Volumen moderado" },
      { date: "2026-06-16", type: "Running", duration: 52, rpe: 7, summary: "Tempo progresivo", notes: "Buenas sensaciones" }
    ],
    assessments: [
      { date: "2026-06-12", type: "Resistencia", name: "Test 5 min", result: "3:54 min/km", action: "Ver historial" },
      { date: "2026-06-01", type: "Antropometria", name: "Peso corporal", result: "74.2 kg", action: "Anadir nueva" },
      { date: "2026-05-20", type: "Dolor / lesiones", name: "Aquiles", result: "1/10", action: "Ver historial" }
    ]
  },
  {
    id: "marta-ruiz",
    name: "Marta Ruiz",
    age: 29,
    sport: "Fitness salud",
    modality: "General",
    level: "Principiante",
    goalType: "Salud",
    status: "Faltan medidas",
    nextEvent: "Control composicion corporal - sin fecha",
    lastActivity: "Full body inicial - hace 4 dias",
    availability: "3 dias / semana",
    history: "Inicio reciente. Objetivo de adherencia y mejora general.",
    injuries: "Sin lesiones relevantes declaradas.",
    coachNotes: "Completar valoraciones iniciales y reforzar tecnica basica.",
    loadMetric: "ACWR 0.86 - monotonia estable",
    readiness: 76,
    activeBlocks: ["Desarrollo general", "Adherencia y tecnica"],
    recentSessions: ["Sentadilla silla 3x10", "Caminata 30 min", "Movilidad cadera"],
    metrics: ["sRPE 980 UA", "Hooper 6/20", "ACWR 0.86", "Series duras 8"],
    chronicLoad: 1140,
    dailyLoads: [180, 0, 260, 0, 320, 0, 220],
    hooper: { sleep: 1, fatigue: 1, stress: 2, soreness: 1, mood: 1 },
    planning: {
      currentBlock: "Desarrollo general",
      currentWeek: "Semana 2 de 4",
      primaryGoal: "adherencia y tecnica",
      secondaryGoal: "mejora de fuerza y capacidad aerobica",
      distribution: "lineal",
      nextSessions: ["Full body basico", "Caminata progresiva", "Movilidad cadera"]
    },
    sessionRecords: [
      { date: "2026-06-20", type: "Fuerza", duration: 42, rpe: 4, summary: "Sentadilla silla 3x10", notes: "Tecnica correcta" },
      { date: "2026-06-18", type: "Cardio", duration: 30, rpe: 3, summary: "Caminata", notes: "Sin molestias" },
      { date: "2026-06-16", type: "Movilidad", duration: 25, rpe: 2, summary: "Cadera y columna", notes: "Mejor control" }
    ],
    assessments: [
      { date: "2026-06-08", type: "Inicial", name: "5STS", result: "13.8 s", action: "Ver historial" },
      { date: "2026-06-08", type: "Movilidad", name: "Screen cadera", result: "restriccion leve", action: "Anadir nueva" },
      { date: "2026-06-08", type: "Cuestionarios", name: "Calidad de vida", result: "pendiente", action: "Completar" }
    ]
  }
];

export const decisionMetrics = [
  {
    name: "sRPE semanal",
    formula: "sumatorio semanal de duracion de sesion x RPE",
    description: "Carga interna semanal expresada en unidades arbitrarias.",
    source: "Foster et al."
  },
  {
    name: "Strain",
    formula: "carga semanal x monotonia",
    description: "Combina carga acumulada con baja variabilidad semanal.",
    source: "Foster et al."
  },
  {
    name: "Monotonia",
    formula: "media diaria de carga / desviacion estandar diaria",
    description: "Detecta semanas demasiado repetitivas o poco variables.",
    source: "Foster et al."
  },
  {
    name: "ACWR",
    formula: "EWMA aguda 7 dias / EWMA cronica 28 dias",
    description: "Relacion carga reciente frente a carga habitual ponderando mas los dias recientes.",
    source: "Gabbett, Hulin, Blanch"
  }
];

export const ewmaMethod = {
  acuteWindow: 7,
  chronicWindow: 28,
  acuteLambda: "2 / (7 + 1) = 0.25",
  chronicLambda: "2 / (28 + 1) = 0.069",
  dailyFormula: "EWMA hoy = carga hoy x lambda + EWMA ayer x (1 - lambda)",
  ratioFormula: "ACWR EWMA = EWMA aguda / EWMA cronica"
};

export const trafficLightRules = [
  {
    metric: "sRPE semanal",
    green: "Dentro del plan o cambio moderado frente a la media individual",
    amber: "Cambio claro que requiere revisar objetivo, fatiga y disponibilidad",
    red: "Pico o caida brusca de carga semanal sin justificacion planificada"
  },
  {
    metric: "Monotonia",
    green: "< 1.5",
    amber: "1.5 - 2.0",
    red: "> 2.0"
  },
  {
    metric: "ACWR",
    green: "0.80 - 1.30",
    amber: "0.70 - 0.79 o 1.31 - 1.49",
    red: "< 0.70 o >= 1.50"
  },
  {
    metric: "Strain",
    green: "< percentil 75 individual",
    amber: "percentil 75 - 90 individual",
    red: "> percentil 90 individual o alto durante varias semanas"
  }
];

export const literatureNotes = [
  "Los umbrales absolutos funcionan como ayuda visual, no como diagnostico.",
  "ACWR con EWMA responde mejor a cambios recientes que la media movil simple, pero sigue requiriendo contexto.",
  "Strain y sRPE semanal son mas utiles cuando se comparan contra el historial individual del deportista."
];

export const goalInterpretations = {
  health: [
    "Priorizar regularidad y tolerancia a la carga",
    "Evitar picos bruscos de ACWR",
    "Reducir monotonia cuando aparezca fatiga o molestias"
  ],
  performance: [
    "Buscar progresiones de carga planificadas",
    "Controlar bloques de strain alto",
    "Relacionar ACWR con rendimiento especifico"
  ]
};

export const sessionQuantifiers = [
  {
    type: "Fuerza",
    items: ["Tonelaje", "RPE muscular", "RPE cardiaco"]
  },
  {
    type: "Cardio",
    items: ["iTRIMP", "Metros totales", "Tiempo en cada zona"]
  }
];

export const plannedSession = {
  title: "Fuerza tren inferior + zona 2",
  athlete: "Lucia Martin",
  date: "Hoy",
  strengthObjective: "Rendimiento",
  athleteMaxHr: 190,
  objective: "Estimulo de fuerza controlado y cierre aerobico suave",
  estimatedMinutes: 72,
  strengthExercises: [
    {
      name: "Sentadilla trasera",
      pattern: "Dominante rodilla",
      muscleGroup: "Cuadriceps",
      sets: 4,
      reps: 5,
      load: 82.5,
      rest: "2-3 min",
      targetRpe: 7,
      targetRir: 3,
      observation: "Vigilar profundidad y molestias de rodilla"
    },
    {
      name: "Peso muerto rumano",
      pattern: "Bisagra cadera",
      muscleGroup: "Isquios",
      sets: 3,
      reps: 8,
      load: 70,
      rest: "2 min",
      targetRpe: 7,
      targetRir: 3,
      observation: "Mantener tension isquios sin dolor lumbar"
    },
    {
      name: "Zancada caminando",
      pattern: "Dominante rodilla",
      muscleGroup: "Gluteo",
      sets: 3,
      reps: 10,
      load: 24,
      rest: "90 s",
      targetRpe: 8,
      targetRir: 2,
      observation: "Anotar asimetrias o molestia"
    },
    {
      name: "Plancha frontal",
      pattern: "Core",
      muscleGroup: "Core",
      sets: 3,
      reps: 1,
      load: 0,
      rest: "60 s",
      targetRpe: 6,
      targetRir: 4,
      observation: "Repeticion equivale a una serie de tiempo"
    }
  ],
  blocks: [
    {
      name: "Activacion",
      details: "Movilidad cadera, respiracion, sentadilla goblet ligera",
      target: "10 min"
    },
    {
      name: "Fuerza principal",
      details: "Sentadilla 4x5, RPE muscular 7, descanso 2-3 min",
      target: "Tonelaje + RPE muscular"
    },
    {
      name: "Accesorios",
      details: "Peso muerto rumano 3x8, zancadas 3x10, gemelo 3x12",
      target: "RPE muscular + RPE cardiaco"
    },
    {
      name: "Cardio final",
      details: "Bici zona 2 continua",
      target: "20 min + tiempo en zona"
    }
  ]
};

export const coachCompletionMessage = {
  title: "Mensaje de Rafa",
  body: "Enhorabuena, muy buen trabajo completando la sesion. Revisa sensaciones y recupera bien; manana ajustamos la carga segun como respondas."
};

export const athleteAdherence = {
  completed: 9,
  planned: 12,
  percentage: 75
};

export const pastSessions = [
  {
    id: "session-1",
    date: "18 Jun",
    type: "Fuerza",
    title: "Fuerza tren inferior",
    srpe: 504,
    status: "Completada",
    summary: "Tonelaje 3895 kg, RIR medio 2.5, cuadriceps alto",
    details: {
      duration: "72 min",
      rpe: 7,
      exercises: [
        "Sentadilla trasera 4x5x82.5 kg",
        "Peso muerto rumano 3x8x70 kg",
        "Zancada caminando 3x10x24 kg"
      ],
      notes: "Molestia leve de rodilla en la ultima serie de zancadas."
    }
  },
  {
    id: "session-2",
    date: "16 Jun",
    type: "Cardio",
    title: "Carrera Z2",
    srpe: 300,
    status: "Completada",
    summary: "40 min, FC media 142, 6200 m, cadencia 170 ppm",
    details: {
      duration: "40 min",
      rpe: 5,
      exercises: ["Z2 32 min", "Z3 8 min"],
      notes: "Buenas sensaciones, ritmo estable."
    }
  },
  {
    id: "session-3",
    date: "14 Jun",
    type: "Mixta",
    title: "Full body salud",
    srpe: 0,
    status: "No realizada",
    summary: "Sesion no completada",
    details: {
      duration: "0 min",
      rpe: 0,
      exercises: [],
      notes: "No realizada por falta de tiempo laboral."
    }
  }
];

export const muscleVolumeTargets = [
  {
    muscleGroup: "Cuadriceps",
    minimumEffectiveSets: 5,
    developmentTargetSets: 10,
    note: "Referencia practica para hipertrofia/composicion corporal."
  },
  {
    muscleGroup: "Isquios",
    minimumEffectiveSets: 5,
    developmentTargetSets: 10,
    note: "Debe combinarse con tolerancia a agujetas y fatiga posterior."
  },
  {
    muscleGroup: "Gluteo",
    minimumEffectiveSets: 5,
    developmentTargetSets: 10,
    note: "Puede recibir estimulo indirecto en sentadillas y bisagras."
  },
  {
    muscleGroup: "Pectoral",
    minimumEffectiveSets: 5,
    developmentTargetSets: 10,
    note: "Volumen directo de empujes horizontales e inclinados."
  },
  {
    muscleGroup: "Dorsal",
    minimumEffectiveSets: 5,
    developmentTargetSets: 10,
    note: "Volumen directo de tracciones horizontales y verticales."
  }
];

export const strengthDecisionTargets = [
  {
    metric: "Exposicion a ejercicio clave",
    green: "Ejercicio principal completado con tecnica estable",
    amber: "Reduccion moderada de series, carga o RPE objetivo",
    red: "No completa el ejercicio clave o aparece molestia relevante"
  },
  {
    metric: "Intensidad/RPE",
    green: "RPE dentro de +/-1 del objetivo",
    amber: "RPE 2 puntos por encima o por debajo",
    red: "RPE muy alto con perdida tecnica o dolor"
  },
  {
    metric: "Tonelaje",
    green: ">= 90% del tonelaje planificado",
    amber: "75-89% del tonelaje planificado",
    red: "< 75% del tonelaje planificado"
  },
  {
    metric: "Distribucion por patron",
    green: "Patrones principales cubiertos segun plan",
    amber: "Un patron queda claramente por debajo",
    red: "Se pierde el patron prioritario del bloque"
  }
];

export const cardioModes = [
  {
    mode: "Carrera",
    intensityReference: "%VAM",
    distanceLabel: "Metros",
    paceLabel: "Ritmo medio",
    pacePlaceholder: "Ej. 5:10/km",
    techniqueLabel: "Cadencia",
    techniqueUnit: "ppm"
  },
  {
    mode: "Ciclismo",
    intensityReference: "%CP",
    distanceLabel: "Metros",
    paceLabel: "Velocidad media",
    pacePlaceholder: "Ej. 32 km/h",
    techniqueLabel: "Cadencia",
    techniqueUnit: "rpm"
  },
  {
    mode: "Natacion",
    intensityReference: "%CSS",
    distanceLabel: "Metros",
    paceLabel: "Ritmo medio",
    pacePlaceholder: "Ej. 1:42/100m",
    techniqueLabel: "Brazadas",
    techniqueUnit: "brazadas/min"
  }
];

export const cardioZones = [
  { zone: "Z1", label: "Recuperacion", minPercentHrMax: 50, maxPercentHrMax: 60 },
  { zone: "Z2", label: "Base aerobica", minPercentHrMax: 60, maxPercentHrMax: 70 },
  { zone: "Z3", label: "Tempo", minPercentHrMax: 70, maxPercentHrMax: 80 },
  { zone: "Z4", label: "Umbral", minPercentHrMax: 80, maxPercentHrMax: 90 },
  { zone: "Z5", label: "VO2 / alta intensidad", minPercentHrMax: 90, maxPercentHrMax: 100 }
];

export const assessmentGoals: AssessmentGoal[] = [
  "Salud general",
  "Rendimiento",
  "Hipertrofia",
  "Readaptacion"
];

export const assessmentCategories = [
  {
    category: "Cardiovascular",
    tests: [
      {
        name: "Rockport 1 mile walk test",
        goals: ["Salud general"],
        output: "VO2max estimado",
        note: "Opcion submaxima y accesible para poblacion general."
      },
      {
        name: "Course Navette / 20 m shuttle run",
        goals: ["Rendimiento"],
        output: "VO2max estimado y velocidad final",
        note: "Util cuando el deportista tolera esfuerzos maximos progresivos."
      },
      {
        name: "Test VAM 5-6 min",
        goals: ["Rendimiento"],
        output: "VAM y ritmos por porcentaje",
        note: "Muy practico para prescribir carrera por %VAM."
      },
      {
        name: "Critical Power / FTP test",
        goals: ["Rendimiento"],
        output: "CP/FTP y zonas de potencia",
        note: "Preferente para ciclismo si hay potenciometro."
      },
      {
        name: "CSS 400+200 m",
        goals: ["Rendimiento"],
        output: "CSS y ritmo por 100 m",
        note: "Preferente para natacion."
      }
    ]
  },
  {
    category: "Fuerza",
    tests: [
      {
        name: "1RM directo",
        goals: ["Rendimiento"],
        output: "Fuerza maxima",
        note: "Usar en deportistas experimentados y tecnicamente seguros."
      },
      {
        name: "1RM estimado por repeticiones",
        goals: ["Salud general", "Hipertrofia", "Readaptacion"],
        output: "Fuerza estimada",
        note: "Mas seguro y practico cuando no conviene test maximo."
      },
      {
        name: "Salto CMJ",
        goals: ["Rendimiento", "Readaptacion"],
        output: "Potencia neuromuscular",
        note: "Util para fatiga, potencia y asimetrias si hay plataforma/app fiable."
      },
      {
        name: "Handgrip",
        goals: ["Salud general", "Readaptacion"],
        output: "Fuerza prensil",
        note: "Marcador simple asociado a salud funcional."
      },
      {
        name: "5STS / Five Times Sit-to-Stand",
        goals: ["Salud general", "Readaptacion"],
        output: "Fuerza funcional de tren inferior",
        note: "Muy util en personas mayores y poblacion con bajo nivel funcional."
      },
      {
        name: "30 s Chair Stand",
        goals: ["Salud general", "Readaptacion"],
        output: "Resistencia funcional de tren inferior",
        note: "Practico para seguimiento en adultos mayores."
      },
      {
        name: "Timed Up and Go",
        goals: ["Salud general", "Readaptacion"],
        output: "Movilidad funcional y riesgo funcional",
        note: "Complementa fuerza con movilidad y equilibrio."
      }
    ]
  },
  {
    category: "Antropometrica",
    tests: [
      {
        name: "Peso, perimetros y cintura/cadera",
        goals: ["Salud general", "Hipertrofia"],
        output: "Cambio corporal y distribucion",
        note: "Alta utilidad practica con baja complejidad."
      },
      {
        name: "Pliegues cutaneos ISAK",
        goals: ["Hipertrofia", "Rendimiento"],
        output: "Suma de pliegues y estimacion de composicion",
        note: "Mejor si el evaluador esta entrenado."
      },
      {
        name: "Bioimpedancia",
        goals: ["Salud general", "Hipertrofia"],
        output: "Masa grasa, masa libre de grasa y agua",
        note: "Controlar hidratacion y condiciones de medicion."
      }
    ]
  },
  {
    category: "Calidad de vida",
    tests: [
      {
        name: "SF-12 / SF-36",
        goals: ["Salud general", "Readaptacion"],
        output: "Salud fisica y mental percibida",
        note: "Cuestionarios muy usados en investigacion clinica."
      },
      {
        name: "EQ-5D",
        goals: ["Salud general", "Readaptacion"],
        output: "Estado de salud percibido",
        note: "Breve y facil de aplicar."
      },
      {
        name: "PSQI",
        goals: ["Salud general", "Rendimiento"],
        output: "Calidad del sueno",
        note: "Especialmente util si el sueno condiciona carga y recuperacion."
      }
    ]
  },
  {
    category: "Psicologica",
    tests: [
      {
        name: "POMS",
        goals: ["Rendimiento"],
        output: "Estado de animo y fatiga psicologica",
        note: "Util en seguimiento de carga y recuperacion."
      },
      {
        name: "DASS-21",
        goals: ["Salud general", "Readaptacion"],
        output: "Depresion, ansiedad y estres",
        note: "Cribado, no diagnostico clinico."
      },
      {
        name: "Escala de estres percibido PSS",
        goals: ["Salud general", "Rendimiento"],
        output: "Estres percibido",
        note: "Facil de combinar con wellness y carga."
      },
      {
        name: "RESTQ-Sport",
        goals: ["Rendimiento"],
        output: "Estres-recuperacion",
        note: "Muy alineado con control de carga en deportistas."
      }
    ]
  }
];

export const posturalAssessmentFields = [
  {
    label: "Escapula / hombro",
    placeholder: "Ej. disquinesia escapular, alado, dolor en elevacion, deficit de control..."
  },
  {
    label: "Cadera",
    placeholder: "Ej. restriccion rotacion interna, dolor anterior, asimetria, limitacion flexion..."
  },
  {
    label: "Columna",
    placeholder: "Ej. hipercifosis, extension limitada, dolor lumbar, control lumbo-pelvico..."
  },
  {
    label: "Rodilla / tobillo / pie",
    placeholder: "Ej. valgo dinamico, dorsiflexion limitada, pronacion, dolor rotuliano..."
  },
  {
    label: "Marcha / equilibrio",
    placeholder: "Ej. inestabilidad, apoyo asimetrico, miedo a caer, uso de ayudas..."
  },
  {
    label: "Observaciones generales",
    placeholder: "Notas libres, derivaciones, banderas rojas, recomendaciones iniciales..."
  }
];

export const calendarSessions = [
  {
    day: "Lunes",
    date: "22 Jun",
    time: "09:00",
    athlete: "Lucia Martin",
    title: "Fuerza tren inferior",
    type: "Fuerza",
    status: "Planificada"
  },
  {
    day: "Lunes",
    date: "22 Jun",
    time: "18:30",
    athlete: "Carlos Vega",
    title: "Carrera Z2 + tecnica",
    type: "Cardio",
    status: "Pendiente wellness"
  },
  {
    day: "Martes",
    date: "23 Jun",
    time: "12:00",
    athlete: "Marta Ruiz",
    title: "Full body salud",
    type: "Fuerza",
    status: "Planificada"
  },
  {
    day: "Miercoles",
    date: "24 Jun",
    time: "08:30",
    athlete: "Lucia Martin",
    title: "Bici zona 2",
    type: "Cardio",
    status: "Planificada"
  },
  {
    day: "Jueves",
    date: "25 Jun",
    time: "19:00",
    athlete: "Carlos Vega",
    title: "Intervalos umbral",
    type: "Cardio",
    status: "Alta carga"
  },
  {
    day: "Sabado",
    date: "27 Jun",
    time: "10:00",
    athlete: "Marta Ruiz",
    title: "Movilidad + fuerza base",
    type: "Mixta",
    status: "Planificada"
  }
];

export const recentStrengthLoads = [
  {
    muscleGroup: "Cuadriceps",
    side: "Frontal",
    exercise: "Sentadilla trasera",
    sets: 4,
    reps: 5,
    load: 82.5,
    rpe: 8,
    rir: 2,
    hoursAgo: 18
  },
  {
    muscleGroup: "Gluteo",
    side: "Posterior",
    exercise: "Zancada caminando",
    sets: 3,
    reps: 10,
    load: 24,
    rpe: 8,
    rir: 2,
    hoursAgo: 18
  },
  {
    muscleGroup: "Isquios",
    side: "Posterior",
    exercise: "Peso muerto rumano",
    sets: 3,
    reps: 8,
    load: 70,
    rpe: 7,
    rir: 3,
    hoursAgo: 36
  },
  {
    muscleGroup: "Pectoral",
    side: "Frontal",
    exercise: "Press banca",
    sets: 3,
    reps: 8,
    load: 75,
    rpe: 6,
    rir: 4,
    hoursAgo: 96
  },
  {
    muscleGroup: "Dorsal",
    side: "Posterior",
    exercise: "Remo con barra",
    sets: 4,
    reps: 8,
    load: 60,
    rpe: 7,
    rir: 3,
    hoursAgo: 120
  },
  {
    muscleGroup: "Deltoides",
    side: "Frontal",
    exercise: "Press militar",
    sets: 3,
    reps: 6,
    load: 45,
    rpe: 7,
    rir: 3,
    hoursAgo: 48
  }
];

export const fatigueLegend = [
  { status: "Verde", label: "Recuperado", range: "0-25" },
  { status: "Amarillo", label: "Carga reciente moderada", range: "26-50" },
  { status: "Naranja", label: "Fatiga probable", range: "51-75" },
  { status: "Rojo", label: "Alta fatiga", range: "76-100" }
];

export const decisionDashboard = {
  athlete: "Lucia Martin",
  week: "Semana 25",
  recommendation: "Mantener carga con ajuste de dominante de rodilla",
  recommendationTone: "Amarillo",
  metrics: [
    {
      label: "sRPE semanal",
      value: "2480 UA",
      status: "Amarillo",
      interpretation: "+18% frente a la media individual"
    },
    {
      label: "Hooper",
      value: "13/20",
      status: "Amarillo",
      interpretation: "Fatiga y dolor muscular moderados"
    },
    {
      label: "ACWR EWMA",
      value: "1.31",
      status: "Amarillo",
      interpretation: "Ligeramente por encima de zona objetivo"
    },
    {
      label: "Monotonia",
      value: "1.7",
      status: "Amarillo",
      interpretation: "Poca variabilidad semanal"
    },
    {
      label: "Strain",
      value: "4216",
      status: "Naranja",
      interpretation: "Carga alta con variabilidad baja"
    },
    {
      label: "Adherencia",
      value: "75%",
      status: "Amarillo",
      interpretation: "9 de 12 sesiones completadas"
    },
    {
      label: "Dolor muscular",
      value: "4/5",
      status: "Rojo",
      interpretation: "Revisar musculatura implicada"
    },
    {
      label: "Mapa de fatiga",
      value: "2 alertas",
      status: "Naranja",
      interpretation: "Cuadriceps rojo, isquios naranja"
    }
  ],
  actions: [
    "Bajar volumen de dominante de rodilla 20-30%",
    "Mantener cardio Z2 si Hooper mejora",
    "Evitar RIR 0-1 en tren inferior esta semana",
    "Revisar motivo de sesiones no completadas"
  ]
};

export const weeklyLoadSeries = [
  { week: "S20", srpe: 1650, monotony: 1.2, strain: 1980, acwr: 0.92, hooper: 8 },
  { week: "S21", srpe: 1780, monotony: 1.3, strain: 2314, acwr: 0.98, hooper: 9 },
  { week: "S22", srpe: 2100, monotony: 1.4, strain: 2940, acwr: 1.08, hooper: 10 },
  { week: "S23", srpe: 1950, monotony: 1.1, strain: 2145, acwr: 0.96, hooper: 8 },
  { week: "S24", srpe: 2380, monotony: 1.6, strain: 3808, acwr: 1.22, hooper: 12 },
  { week: "S25", srpe: 2480, monotony: 1.7, strain: 4216, acwr: 1.31, hooper: 13 }
];

export const messageThreads = [
  {
    id: "thread-1",
    athlete: "Lucia Martin",
    lastMessage: "Perfecto, hoy bajo carga de pierna y te cuento sensaciones.",
    unread: 2,
    status: "Activo",
    messages: [
      {
        author: "coach",
        text: "Buenos dias Lucia. Hoy el mapa marca cuadriceps alto, asi que baja un 25% la carga de sentadilla.",
        time: "08:12"
      },
      {
        author: "athlete",
        text: "Perfecto, hoy bajo carga de pierna y te cuento sensaciones.",
        time: "08:18"
      }
    ]
  },
  {
    id: "thread-2",
    athlete: "Carlos Vega",
    lastMessage: "Ayer no pude terminar los intervalos por molestias.",
    unread: 1,
    status: "Revisar",
    messages: [
      {
        author: "athlete",
        text: "Ayer no pude terminar los intervalos por molestias.",
        time: "20:43"
      },
      {
        author: "coach",
        text: "Lo reviso y ajusto la sesion de manana.",
        time: "21:02"
      }
    ]
  },
  {
    id: "thread-3",
    athlete: "Marta Ruiz",
    lastMessage: "Sesion completada, buenas sensaciones.",
    unread: 0,
    status: "Al dia",
    messages: [
      {
        author: "athlete",
        text: "Sesion completada, buenas sensaciones.",
        time: "18:05"
      }
    ]
  }
];

export const hooperQuestions = [
  { key: "sleep", label: "Sueno", helper: "1 muy bueno, 5 muy malo" },
  { key: "stress", label: "Estres", helper: "1 muy bajo, 5 muy alto" },
  { key: "fatigue", label: "Fatiga", helper: "1 muy baja, 5 muy alta" },
  { key: "soreness", label: "Dolor muscular", helper: "1 nada, 5 mucho" }
];

export const sports = [
  "Fuerza",
  "Running",
  "Triatlon",
  "Futbol",
  "Hyrox",
  "Fitness salud",
  "Otro"
];
