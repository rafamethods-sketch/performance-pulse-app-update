// Source: capturas docentes aportadas por Rafa sobre zonas de entrenamiento de resistencia.
// This catalog is intentionally built only from Rafa's provided teaching slides.
// Do not add external methods, examples, effects, zones, percentages, or bibliography here.

export type ResistanceZoneId =
  | "R0"
  | "R1"
  | "R1_PLUS"
  | "R2"
  | "R3"
  | "R3_PLUS"
  | "R4"
  | "R5"
  | "R6";

export type ResistanceSport = "generic" | "running" | "cycling" | "swimming";

export type ResistanceZone = {
  commonUses?: string[];
  description: string;
  id: ResistanceZoneId;
  intensity?: string;
  label: string;
  methodLinks?: string[];
  metrics?: {
    hrrPercent?: string;
    hrMaxPercent?: string;
    mapPercent?: string;
    masPercent?: string;
    mlssPowerPercent?: string;
    rpe?: string;
    vo2maxPercent?: string;
  };
  physiologicalFocus?: string[];
  shortLabel: string;
  sourceNote?: string;
};

export type SportZoneProfile = {
  mainReferenceMetric: string;
  name: string;
  notes?: string;
  secondaryMetrics: string[];
  source?: string;
  sport: ResistanceSport;
  zones: ResistanceZone[];
};

const qualitativeZoneData: Record<ResistanceZoneId, Pick<ResistanceZone, "description" | "methodLinks" | "physiologicalFocus">> = {
  R0: {
    description: "Recuperación, muy baja intensidad, pausas activas.",
    methodLinks: ["recuperación entre repeticiones", "pausas activas"],
    physiologicalFocus: ["Recuperación", "Baja carga interna"]
  },
  R1: {
    description: "Baja intensidad, base aeróbica, cómodo y sostenible.",
    methodLinks: ["CE", "CI según variante", "trabajo extensivo"],
    physiologicalFocus: ["Base aeróbica", "Economía extensiva"]
  },
  R1_PLUS: {
    description: "Transición alta dentro del trabajo aeróbico extensivo.",
    methodLinks: ["CV1", "CV2", "transición aeróbica"],
    physiologicalFocus: ["Aeróbico extensivo alto", "Transición hacia MLSS"]
  },
  R2: {
    description: "Trabajo cercano a MLSS / umbral funcional sostenible.",
    methodLinks: ["CV1", "CV2", "IEL", "trabajo de MLSS"],
    physiologicalFocus: ["MLSS", "Sostenibilidad submáxima"]
  },
  R3: {
    description: "Alta intensidad, entorno de umbral anaeróbico.",
    methodLinks: ["IEL", "IEM", "umbral anaeróbico"],
    physiologicalFocus: ["Umbral anaeróbico", "Tolerancia a intensidad alta"]
  },
  R3_PLUS: {
    description: "Trabajo cercano a VO2max.",
    methodLinks: ["RL", "IIC", "trabajo VO2max", "SR: intensidad de competición", "SS: intensidad de competición"],
    physiologicalFocus: ["VO2max", "Potencia aeróbica"]
  },
  R4: {
    description: "Intensidad muy alta usada en repeticiones largas RL.",
    methodLinks: ["RL"],
    physiologicalFocus: ["Repeticiones largas", "Alta intensidad"]
  },
  R5: {
    description: "Potencia láctica, usada en repeticiones medias RM.",
    methodLinks: ["RM"],
    physiologicalFocus: ["Potencia láctica", "Repeticiones medias"]
  },
  R6: {
    description: "Velocidad máxima / all out, usada en repeticiones cortas RC.",
    methodLinks: ["RC"],
    physiologicalFocus: ["Velocidad máxima", "Repeticiones cortas"]
  }
};

function zone(
  id: ResistanceZoneId,
  label: string,
  metrics?: ResistanceZone["metrics"],
  intensity?: string,
  sourceNote?: string
): ResistanceZone {
  const qualitative = qualitativeZoneData[id];
  return {
    id,
    label,
    shortLabel: getZoneLabel(id),
    description: qualitative.description,
    intensity,
    metrics,
    physiologicalFocus: qualitative.physiologicalFocus,
    methodLinks: qualitative.methodLinks,
    sourceNote
  };
}

const genericZones: ResistanceZone[] = ([
  ["R0", "R0 · Recuperación"],
  ["R1", "R1 · Baja intensidad"],
  ["R1_PLUS", "R1+ · Transición aeróbica"],
  ["R2", "R2 · MLSS / umbral funcional"],
  ["R3", "R3 · Umbral anaeróbico"],
  ["R3_PLUS", "R3+ · VO2max"],
  ["R4", "R4 · Repeticiones largas"],
  ["R5", "R5 · Repeticiones medias"],
  ["R6", "R6 · Repeticiones cortas"]
] as const).map(([id, label]) => zone(id, label));

const runningSource = "Captura docente aportada por Rafa. Tabla: Estimación doblemente indirecta de ritmos o zonas de entrenamiento aeróbico - Carrera. Cerezula et al., 2018.";
const cyclingSource = "Captura docente aportada por Rafa. Tabla: Estimación doblemente indirecta de ritmos o zonas de entrenamiento aeróbico - Ciclismo. Pallarés et al., 2016.";

const runningZones: ResistanceZone[] = [
  zone("R0", "R0 · Umbral aeróbico 70%-90%", { masPercent: "<60%", hrMaxPercent: "<71%", hrrPercent: "<63%", rpe: "8-10" }, "Umbral aeróbico 70%-90%", runningSource),
  zone("R1", "R1 · Umbral aeróbico 90%-100%", { masPercent: "60%-65%", hrMaxPercent: "71%-79%", hrrPercent: "65%-72%", rpe: "10-11" }, "Umbral aeróbico 90%-100%", runningSource),
  zone("R1_PLUS", "R1+ · Umbral aeróbico 100%-110%", { masPercent: "65%-70%", hrMaxPercent: "79%-84%", hrrPercent: "72%-78%", rpe: "11-12" }, "Umbral aeróbico 100%-110%", runningSource),
  zone("R2", "R2 · MLSS 90%-100%", { masPercent: "70%-80%", hrMaxPercent: "84%-89%", hrrPercent: "78%-85%", rpe: "12-14" }, "MLSS 90%-100%", runningSource),
  zone("R3", "R3 · Umbral anaeróbico 95%-105%", { masPercent: "80%-94%", hrMaxPercent: "89%-95%", hrrPercent: "85%-94%", rpe: "14-17" }, "Umbral anaeróbico 95%-105%", runningSource),
  zone("R3_PLUS", "R3+ · VO2max 95%-105%", { masPercent: "94%-105%", hrMaxPercent: "95%-100%", hrrPercent: "94%-100%", rpe: "17-20" }, "VO2max 95%-105%", runningSource)
];

const cyclingZones: ResistanceZone[] = [
  zone("R0", "R0 · Umbral aeróbico 70%-90%", { mapPercent: "<47%", vo2maxPercent: "<51%", hrMaxPercent: "<67%", hrrPercent: "<60%", mlssPowerPercent: "<69%", rpe: "<11" }, "Umbral aeróbico 70%-90%", cyclingSource),
  zone("R1", "R1 · Umbral aeróbico 90%-100%", { mapPercent: "47%-53%", vo2maxPercent: "51%-58%", hrMaxPercent: "67%-74%", hrrPercent: "60%-68%", mlssPowerPercent: "69%-78%", rpe: "11-12" }, "Umbral aeróbico 90%-100%", cyclingSource),
  zone("R1_PLUS", "R1+ · Umbral aeróbico 100%-110%", { mapPercent: "53%-60%", vo2maxPercent: "58%-64%", hrMaxPercent: "74%-82%", hrrPercent: "68%-80%", mlssPowerPercent: "78%-90%", rpe: "12-13" }, "Umbral aeróbico 100%-110%", cyclingSource),
  zone("R2", "R2 · MLSS 90%-110%", { mapPercent: "60%-77%", vo2maxPercent: "64%-78%", hrMaxPercent: "82%-87%", hrrPercent: "80%-85%", mlssPowerPercent: "90%-110%", rpe: "13-15" }, "MLSS 90%-110%", cyclingSource),
  zone("R3", "R3 · Umbral anaeróbico 95%-105%", { mapPercent: "77%-86%", vo2maxPercent: "78%-89%", hrMaxPercent: "87%-95%", hrrPercent: "85%-94%", mlssPowerPercent: "110%-131%", rpe: "15-17" }, "Umbral anaeróbico 95%-105%", cyclingSource),
  zone("R3_PLUS", "R3+ · VO2max 95%-105%", { mapPercent: "86%-105%", vo2maxPercent: "89%-100%", hrMaxPercent: "95%-100%", hrrPercent: "94%-100%", mlssPowerPercent: "131%-155%", rpe: "17-20" }, "VO2max 95%-105%", cyclingSource)
];

const swimmingZones: ResistanceZone[] = genericZones.map((entry) => ({
  ...entry,
  sourceNote: "Pendiente de individualizar con CSS o test específico. No hay tabla porcentual añadida todavía."
}));

export const sportZoneProfiles: SportZoneProfile[] = [
  {
    sport: "generic",
    name: "Genérico",
    mainReferenceMetric: "RPE / respuesta individual",
    secondaryMetrics: ["duración", "pausa", "método de entrenamiento"],
    zones: genericZones,
    notes: "Guía cualitativa para orientar métodos cuando no hay tabla específica del deporte.",
    source: "Capturas docentes aportadas por Rafa."
  },
  {
    sport: "running",
    name: "Carrera / Atletismo",
    mainReferenceMetric: "MAS / VAM",
    secondaryMetrics: ["HRmax", "HRR", "RPE"],
    zones: runningZones,
    notes: "Guía metodológica. Las zonas deben individualizarse con test, deporte, nivel y contexto.",
    source: runningSource
  },
  {
    sport: "cycling",
    name: "Ciclismo",
    mainReferenceMetric: "MAP",
    secondaryMetrics: ["VO2max", "HRmax", "HRR", "W-MLSS", "RPE"],
    zones: cyclingZones,
    notes: "Guía metodológica. Las zonas deben individualizarse con test, deporte, nivel y contexto.",
    source: cyclingSource
  },
  {
    sport: "swimming",
    name: "Natación",
    mainReferenceMetric: "ritmo por 100 m",
    secondaryMetrics: ["RPE", "tiempo de repetición", "pausa", "CSS en futuro"],
    zones: swimmingZones,
    notes: "Pendiente de individualizar con CSS o test específico. No hay tabla porcentual añadida todavía.",
    source: "Capturas docentes aportadas por Rafa. Sin tabla porcentual específica añadida para natación."
  }
];

export function getZoneLabel(id: ResistanceZoneId) {
  if (id === "R1_PLUS") return "R1+";
  if (id === "R3_PLUS") return "R3+";
  return id;
}

export function getResistanceZones() {
  return genericZones;
}

export function getResistanceZoneById(id: ResistanceZoneId) {
  return genericZones.find((zoneItem) => zoneItem.id === id) ?? null;
}

export function getSportZoneProfiles() {
  return sportZoneProfiles;
}

export function getSportZoneProfile(sport: ResistanceSport) {
  return sportZoneProfiles.find((profile) => profile.sport === sport) ?? sportZoneProfiles[0];
}
