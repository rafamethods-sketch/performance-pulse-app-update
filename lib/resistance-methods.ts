// Source: Métodos de entrenamiento..xlsx
// Built only from Rafa's resistance training methodology document.
// Do not add external methods, examples, effects, zones, or bibliography here.

export type ResistanceMethodStatus = "complete" | "pending";

export type ResistanceMethod = {
  bibliography: string;
  examples: string[];
  family: "Métodos continuos" | "Métodos fraccionados" | "Métodos puesta a punto";
  group: string;
  id: string;
  intensity: string;
  method: string;
  name: string;
  recoveryBetweenRepetitions: string;
  recoveryBetweenSeries: string;
  repetitionDuration: string;
  repetitions: string;
  series: string;
  sessionDuration: string;
  source: "Métodos de entrenamiento..xlsx";
  status: ResistanceMethodStatus;
  subgroup: string;
  trainingEffects: string[];
  zones: string[];
};

const source = "Métodos de entrenamiento..xlsx" as const;

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractZones(intensity: string) {
  return Array.from(new Set(intensity.match(/\bR\d\+?\b/g) ?? []));
}

function completeMethod(
  method: string,
  name: string,
  family: ResistanceMethod["family"],
  group: string,
  subgroup: string,
  data: {
    bibliography: string;
    examples: string;
    intensity: string;
    recoveryBetweenRepetitions: string | number;
    recoveryBetweenSeries: string | number;
    repetitionDuration: string;
    repetitions: string | number;
    series: string | number;
    sessionDuration: string;
    trainingEffects: string;
  }
): ResistanceMethod {
  return {
    bibliography: data.bibliography,
    examples: splitLines(data.examples),
    family,
    group,
    id: method.toLowerCase(),
    intensity: data.intensity,
    method,
    name,
    recoveryBetweenRepetitions: `${data.recoveryBetweenRepetitions}`,
    recoveryBetweenSeries: `${data.recoveryBetweenSeries}`,
    repetitionDuration: data.repetitionDuration,
    repetitions: `${data.repetitions}`,
    series: `${data.series}`,
    sessionDuration: data.sessionDuration,
    source,
    status: "complete",
    subgroup,
    trainingEffects: splitLines(data.trainingEffects),
    zones: extractZones(data.intensity)
  };
}

function pendingMethod(
  method: string,
  name: string,
  family: ResistanceMethod["family"],
  group: string,
  subgroup: string
): ResistanceMethod {
  return {
    bibliography: "",
    examples: [],
    family,
    group,
    id: method.toLowerCase(),
    intensity: "",
    method,
    name,
    recoveryBetweenRepetitions: "",
    recoveryBetweenSeries: "",
    repetitionDuration: "",
    repetitions: "",
    series: "",
    sessionDuration: "",
    source,
    status: "pending",
    subgroup,
    trainingEffects: [],
    zones: []
  };
}

export const resistanceMethods: ResistanceMethod[] = [
  completeMethod("CE", "Continuo extensivo", "Métodos continuos", "Uniforme", "Extensivo", {
    bibliography: "(Seiler y Tønnessen, 2009)",
    examples: "1 x 2h R1\n1 x 40 min R1\n1 x 50 min R1",
    intensity: "R1 (Total sesión 30 min - 2 h)",
    recoveryBetweenRepetitions: "-",
    recoveryBetweenSeries: "-",
    repetitionDuration: "30 min - varias horas",
    repetitions: 1,
    series: 1,
    sessionDuration: "30 min - varias horas",
    trainingEffects:
      "Mejora de la Estabilidad técnica/Eficacia/Economia del movimiento.\nIncremento relativo de la oxidacion de las grasas.\nDesplazamiento del Umbral Aeróbico.\nAumento de la producción de enzimas oxidativas y mitocondrias.\nMejora del ritmo de recuperacion entre esfuerzos de alta intensidad."
  }),
  completeMethod("CI", "Continuo intensivo", "Métodos continuos", "Uniforme", "Intensivo", {
    bibliography: "(Seiler y Tønnessen, 2009)",
    examples: "1 x 1 h R1+\n1 x 35 min R2\n1 x 1.5 h R1+",
    intensity: "R1+ (Total sesión 30 min - 1.5h)\nR2 (Total sesión 20 min - 40 min)",
    recoveryBetweenRepetitions: "-",
    recoveryBetweenSeries: "-",
    repetitionDuration: "20 min - 1.5 horas",
    repetitions: 1,
    series: 1,
    sessionDuration: "20 min - 1.5 horas",
    trainingEffects:
      "Aumento del volumen sistólico y engrosamiento del septo ventricular.\nMejora del metabolismo de la Oxidación de las grasas y del Glucógeno.\nDesplazamiento del umbral aeróbico\nMejora del sistema buffer de bicarbonato."
  }),
  completeMethod("CV1", "Continuo variable 1", "Métodos continuos", "Variable", "Variable 1", {
    bibliography: "(Seiler y Tønnessen, 2009)",
    examples: "1 hora: 10 min R2 - 2 min R1\n\n45 min: 12 min R2 - 3 min R1+\n\n72 min: 6 min R2 - 3 min R1\n\n35 min: 5 min R2 - 2 min R1+",
    intensity: "Tramos intensidad elevada: > de 5 min R2 (Total sesión 25 min - 50 min)\n\nTramos intensidad Moderada: < 3 min R1 o R1+",
    recoveryBetweenRepetitions: "-",
    recoveryBetweenSeries: "-",
    repetitionDuration: "30 min - 80 min",
    repetitions: 1,
    series: 1,
    sessionDuration: "30 min - 80 min",
    trainingEffects:
      "Mejora el aprovechamiento del Glucógeno en presencia de O2\nRegulación de la producción / eliminación de lactato.\nDesarrollo hipertrófico del músculo cardiaco.\nMejora la capilarización del músculo esquelético.\nMejora la adaptación a cambios de suministro energético."
  }),
  completeMethod("CV2", "Continuo variable 2", "Métodos continuos", "Variable", "Variable 2", {
    bibliography: "(Seiler y Tønnessen, 2009)",
    examples: "40 min: 4 min R3 / 4 min R1\n\n40 min: 5 min R3 / 3 min R1\n\n36 min: 3 min R3 / 3 min R1",
    intensity: "Tramos intensidad elevada: entre 3 y 5 min R3 (Total sesión 15 min - 25 min)\n\nTramos intensidad moderada: > 3 min R1",
    recoveryBetweenRepetitions: "-",
    recoveryBetweenSeries: "-",
    repetitionDuration: "30 min - 60 min",
    repetitions: 1,
    series: 1,
    sessionDuration: "30 min - 60 min",
    trainingEffects:
      "Incremento del VO2max.\nRegula la producción y eliminación de lactato en sangre.\nDesarrollo hipertrófico del músculo cardiaco.\nAdaptación a cambios de suministro energéticos."
  }),
  completeMethod("IEL", "Interválico extensivo largo", "Métodos fraccionados", "Intervalico", "Extensivo largo", {
    bibliography: "(Helgerud et al., 2007; Pallarés et al., 2009, 2010)",
    examples: "6 x 10 min R2 / 2 min R0\n\n7 x 5 min R3 / 5 min R0\n\n3 x 20 min R2 / 3 min R0\n\n2‐4‐6‐8‐6‐4‐2 min R3 / mismo tiempo de rec R0",
    intensity: "R2 (Tiempo total por sesión 25 - 70 min)\n\nR3 /Tiempo total por sesión 15- 40 min)",
    recoveryBetweenRepetitions: "2 - 5 min",
    recoveryBetweenSeries: "-",
    repetitionDuration: "4 - 20 min",
    repetitions: "6 - 10",
    series: 1,
    sessionDuration: "40 - 85 min",
    trainingEffects:
      "Desplazamiento del umbral anaeróbico.\nMejora de la irrigación periférica y capilarización.\nAumento de depósitos de glucógeno en las fibras lentas.\nEconomía del metabolismo del glucógeno.\nHipertrofia del miocardio."
  }),
  completeMethod("IEM", "Interválico extensivo medio", "Métodos fraccionados", "Intervalico", "Extensivo medio", {
    bibliography: "(Helgerud et al., 2007; Pallarés et al., 2009, 2010)",
    examples: "5 x 2 min R3+ / 4 min R0\n\n12 x 2 min R3 / 3 min R0 \n\n4 x 4 min R3 / 3 min R0 \n\n10 x 4 min R3 / 4 min R0",
    intensity: "R3 (Tiempo total por sesión 15 - 40 min)\n\nR3+ (Tiempo total por sesión 6 - 16 min)",
    recoveryBetweenRepetitions: "1 - 3 min",
    recoveryBetweenSeries: "-",
    repetitionDuration: "1 - 4 min",
    repetitions: "4 - 15",
    series: 1,
    sessionDuration: "45 - 90 min",
    trainingEffects:
      "Mejora del VO2max - Potencia aeróbica.\nReducción de %VT2(VO2max)\nMejora del Volumen Sistólico.\nTolerancia y eliminación de lactato.\nMejora de las enzimas glucoliticas y oxidativas."
  }),
  completeMethod("IIC", "Interválico intensivo corto", "Métodos fraccionados", "Intervalico", "Intensivo corto", {
    bibliography: "(Helgerud et al., 2007; Gibala y McGee, 2008; Pallarés et al., 2009, 2010)",
    examples: "3 x (3 x 1 min R3+/ 1 min R0) / 10 min R0\n\n4 x (3 x 30 s R4 / 2 min R0) / 12 min R0\n\n2 x (4 x 45 s R3+/ 1 min R0) / 10 min R0",
    intensity: "R3+ (Tiempo total por sesión 6 - 16 min)\n\nR4 (Tiempo total por sesión 4 - 10 min)",
    recoveryBetweenRepetitions: "1 - 2 min",
    recoveryBetweenSeries: "10 - 12 min",
    repetitionDuration: "20 seg - 1 min",
    repetitions: "3 - 4",
    series: "2 - 4",
    sessionDuration: "40 - 80 min",
    trainingEffects:
      "Mejora del VO2max - Capacidad y Potencia aeróbica.\nReducción del %VT2 (VO2max)\nTolerancia al ácido láctico - sistema buffer.\nImplicación fibras rápidas.\nAumentos de los depósitos de PC y Glucógeno"
  }),
  completeMethod("IIMC", "Interválico intensivo muy corto", "Métodos fraccionados", "Intervalico", "Intensivo muy corto", {
    bibliography: "(Pallarés y Morán, 2012)",
    examples: "3 x (4 x 10 seg R6 / 2 min R0) / 10 min R0 \n\n6 x (3 x 15 seg R6 / 3 min R0) / 5 min R0 \n\n5 x (4 x 8 seg R6 / 3 min R0) / 10 min R0",
    intensity: "R6 \nVelocidad máxima\n(Repeticiones por sesión 10 - 25)",
    recoveryBetweenRepetitions: "2 - 3 min",
    recoveryBetweenSeries: "5 - 10 min",
    repetitionDuration: "8 seg - 15 seg",
    repetitions: "3 - 4",
    series: "3 - 6",
    sessionDuration: "50 - 60 min",
    trainingEffects:
      "Mejora la potencia anaeróbica láctica.\nAumento de los depósitos de ATO y PC.\nMejora de la coordinación inter e intramuscular.\nAumentos de la frecuencia de ciclo.\nImplicación fibras rápidas."
  }),
  pendingMethod("RL", "Repeticiones largo", "Métodos fraccionados", "Repeticiones", "Largo"),
  pendingMethod("RM", "Repeticiones medio", "Métodos fraccionados", "Repeticiones", "Medio"),
  pendingMethod("RC", "Repeticiones corto", "Métodos fraccionados", "Repeticiones", "Corto"),
  pendingMethod("CyC", "Competición o control", "Métodos puesta a punto", "Competición o control", ""),
  pendingMethod("SS", "Series simuladoras", "Métodos puesta a punto", "Series simuladoras", ""),
  pendingMethod("SR", "Series rotas", "Métodos puesta a punto", "Series rotas", "")
];

export const completeResistanceMethodIds = ["CE", "CI", "CV1", "CV2", "IEL", "IEM", "IIC", "IIMC"] as const;
export const pendingResistanceMethodIds = ["RL", "RM", "RC", "CyC", "SS", "SR"] as const;

