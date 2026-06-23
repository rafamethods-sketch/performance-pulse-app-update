export type PlanningMethod = "" | "linear" | "undulating" | "blocks";
export type WeeklyDistribution = "Lineal" | "Ondulante" | "Flexible" | "Personalizada";

export const planningConfig = {
  methodOptions: [
    { description: "", label: "Selecciona un metodo de planificacion", value: "" },
    {
      description: "La carga progresa de forma continua en una direccion principal.",
      label: "Lineal",
      value: "linear"
    },
    {
      description: "Los estimulos varian dentro de la semana o entre semanas.",
      label: "Ondulante",
      value: "undulating"
    },
    {
      description: "La planificacion se organiza en mesociclos con objetivos principales y secundarios.",
      label: "Por bloques",
      value: "blocks"
    }
  ],
  mesocycleNameExamples: [
    "Acumulacion",
    "Desarrollo",
    "Fuerza maxima",
    "Potencia",
    "Base aerobica",
    "Especifico competicion",
    "Puesta a punto",
    "Readaptacion"
  ],
  metricGroups: [
    {
      label: "Fuerza",
      metrics: ["%1RM", "e1RM", "RIR", "RPE", "Velocidad", "Perdida de velocidad", "Volumen-carga", "Series duras"]
    },
    {
      label: "Resistencia",
      metrics: ["Tiempo en zona", "Ritmo", "Potencia", "Frecuencia cardiaca", "RPE", "Duracion", "Distancia", "Carga semanal"]
    },
    {
      label: "Mixtas",
      metrics: ["sRPE", "Tiempo de trabajo", "Rounds", "Numero de esfuerzos", "Sprints", "Aceleraciones", "Desaceleraciones", "Saltos", "Carga semanal", "Hooper"]
    }
  ],
  primaryObjectiveExamples: [
    "Hipertrofia / volumen estructural",
    "Fuerza maxima",
    "Potencia",
    "Base aerobica",
    "Umbral",
    "VO2max",
    "Resistencia especifica",
    "Tecnica",
    "Readaptacion",
    "Puesta a punto"
  ],
  secondaryObjectiveExamples: [
    "Tecnica",
    "Tolerancia de carga",
    "Mantener fuerza maxima",
    "Mantener volumen",
    "Reducir fatiga",
    "Prevencion / robustez",
    "Velocidad",
    "Movilidad",
    "Control motor"
  ],
  weeklyDistributionOptions: ["Lineal", "Ondulante", "Flexible", "Personalizada"] satisfies WeeklyDistribution[]
};

export function getPlanningMethodLabel(method: PlanningMethod) {
  return planningConfig.methodOptions.find((option) => option.value === method)?.label ?? "";
}

export function getPlanningMethodDescription(method: PlanningMethod) {
  return planningConfig.methodOptions.find((option) => option.value === method)?.description ?? "";
}
