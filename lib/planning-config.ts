export type PlanningMethod = "" | "linear" | "undulating" | "blocks" | "flexible";
export type WeeklyDistribution = "Lineal" | "Ondulante" | "Flexible" | "Personalizada";
export type PlanningPhaseId = "adaptation" | "accumulation" | "intensification" | "realization" | "taper" | "deload" | "maintenance" | "return_to_training" | "other";
export type PlanningGoalId = "motor_control_technique" | "structural_balance" | "hypertrophy" | "functional_hypertrophy" | "max_strength" | "eccentric_strength" | "strength_velocity" | "power" | "work_capacity" | "aerobic_base" | "aerobic_capacity" | "aerobic_power_vam" | "threshold" | "anaerobic_capacity" | "anaerobic_power" | "repeated_sprint_ability" | "mobility_rom" | "return_to_activity" | "specific_preparation" | "maintenance" | "other";
export type PlanningSessionTypeId = "strength" | "endurance" | "power_speed" | "hybrid" | "mobility_recovery" | "technique_motor_control" | "assessment_test" | "other";
export type PlanningSessionGoalId = PlanningGoalId | "plyometrics" | "sprint_speed" | "agility_change_direction" | "mobility" | "rom" | "recovery" | "regenerative_work" | "motor_control" | "technical_learning" | "stability_control" | "specific_technique" | "strength_assessment" | "jump_power_assessment" | "endurance_assessment" | "functionality_assessment" | "anthropometry_assessment" | "strength_endurance" | "strength_power" | "power_endurance" | "general_preparation";
export type PlanningEffortScale = "rir" | "rpe";
export type PlanningPrescriptionRoleId = "principal" | "secondary" | "accessory";

export type PlanningPrescriptionPresetRole = {
  effortMax?: string;
  effortMin?: string;
  effortScale?: PlanningEffortScale;
  repsMax: string;
  repsMin: string;
  restMaxSeconds: string;
  restMinSeconds: string;
  seriesReferenceMax: string;
  seriesReferenceMin: string;
};

export type PlanningPrescriptionPreset = {
  label: string;
  roles: Record<PlanningPrescriptionRoleId, PlanningPrescriptionPresetRole>;
};

export type PlanningTaxonomyOption<T extends string> = {
  description?: string;
  id: T;
  label: string;
};

export const planningPhaseOptions: PlanningTaxonomyOption<PlanningPhaseId>[] = [
  { description: "Entrada al proceso y construcción de tolerancia.", id: "adaptation", label: "Adaptación" },
  { description: "Mayor énfasis en volumen y desarrollo de capacidades.", id: "accumulation", label: "Acumulación" },
  { description: "Aumento progresivo de intensidad y especificidad.", id: "intensification", label: "Intensificación" },
  { description: "Expresión del rendimiento desarrollado.", id: "realization", label: "Realización" },
  { description: "Reducción de fatiga previa a competición o test.", id: "taper", label: "Puesta a punto" },
  { description: "Reducción deliberada de carga.", id: "deload", label: "Descarga" },
  { description: "Conservar capacidades mientras otra prioridad domina.", id: "maintenance", label: "Mantenimiento" },
  { description: "Reintroducción progresiva tras pausa o reducción de carga.", id: "return_to_training", label: "Retorno / Reacondicionamiento" },
  { id: "other", label: "Otro" }
];

export const planningGoalGroups: Array<{ id: string; label: string; options: PlanningTaxonomyOption<PlanningGoalId>[] }> = [
  {
    id: "neuromuscular",
    label: "Neuromuscular",
    options: [
      { id: "motor_control_technique", label: "Control motor / Técnica" },
      { id: "structural_balance", label: "Equilibrio estructural" },
      { id: "hypertrophy", label: "Hipertrofia" },
      { id: "functional_hypertrophy", label: "Hipertrofia funcional" },
      { id: "max_strength", label: "Fuerza máxima" },
      { id: "eccentric_strength", label: "Fuerza excéntrica" },
      { id: "strength_velocity", label: "Fuerza-velocidad" },
      { id: "power", label: "Potencia" }
    ]
  },
  {
    id: "work_capacity",
    label: "Capacidad de trabajo / Resistencia",
    options: [
      { id: "work_capacity", label: "Capacidad de trabajo" },
      { id: "aerobic_base", label: "Base aeróbica" },
      { id: "aerobic_capacity", label: "Capacidad aeróbica" },
      { id: "aerobic_power_vam", label: "Potencia aeróbica / VAM" },
      { id: "threshold", label: "Umbral" },
      { id: "anaerobic_capacity", label: "Capacidad anaeróbica" },
      { id: "anaerobic_power", label: "Potencia anaeróbica" },
      { id: "repeated_sprint_ability", label: "Repeated Sprint Ability" }
    ]
  },
  {
    id: "other",
    label: "Otros",
    options: [
      { id: "mobility_rom", label: "Movilidad / ROM" },
      { id: "return_to_activity", label: "Retorno a la actividad" },
      { id: "specific_preparation", label: "Preparación específica" },
      { id: "maintenance", label: "Mantenimiento" },
      { id: "other", label: "Otro" }
    ]
  }
];

export const planningSessionTypeOptions: PlanningTaxonomyOption<PlanningSessionTypeId>[] = [
  { id: "strength", label: "Fuerza" },
  { id: "endurance", label: "Resistencia / Cardio" },
  { id: "power_speed", label: "Potencia / Velocidad" },
  { id: "hybrid", label: "Híbrida" },
  { id: "mobility_recovery", label: "Movilidad / Recuperación" },
  { id: "technique_motor_control", label: "Técnica / Control motor" },
  { id: "assessment_test", label: "Valoración / Test" },
  { id: "other", label: "Otro" }
];

const sessionGoal = (id: PlanningSessionGoalId, label: string): PlanningTaxonomyOption<PlanningSessionGoalId> => ({ id, label });

export const planningSessionGoalsByType: Record<PlanningSessionTypeId, PlanningTaxonomyOption<PlanningSessionGoalId>[]> = {
  strength: [sessionGoal("hypertrophy", "Hipertrofia"), sessionGoal("functional_hypertrophy", "Hipertrofia funcional"), sessionGoal("max_strength", "Fuerza máxima"), sessionGoal("eccentric_strength", "Fuerza excéntrica"), sessionGoal("strength_velocity", "Fuerza-velocidad"), sessionGoal("structural_balance", "Equilibrio estructural")],
  power_speed: [sessionGoal("power", "Potencia"), sessionGoal("strength_velocity", "Fuerza-velocidad"), sessionGoal("plyometrics", "Pliometría"), sessionGoal("sprint_speed", "Velocidad / Sprint"), sessionGoal("agility_change_direction", "Agilidad / Cambio de dirección")],
  endurance: [sessionGoal("aerobic_base", "Base aeróbica"), sessionGoal("aerobic_capacity", "Capacidad aeróbica"), sessionGoal("aerobic_power_vam", "Potencia aeróbica / VAM"), sessionGoal("threshold", "Umbral"), sessionGoal("anaerobic_capacity", "Capacidad anaeróbica"), sessionGoal("anaerobic_power", "Potencia anaeróbica"), sessionGoal("repeated_sprint_ability", "Repeated Sprint Ability")],
  mobility_recovery: [sessionGoal("mobility", "Movilidad"), sessionGoal("rom", "ROM"), sessionGoal("recovery", "Recuperación"), sessionGoal("regenerative_work", "Trabajo regenerativo")],
  technique_motor_control: [sessionGoal("motor_control", "Control motor"), sessionGoal("technical_learning", "Aprendizaje técnico"), sessionGoal("stability_control", "Estabilidad / Control"), sessionGoal("specific_technique", "Técnica específica")],
  assessment_test: [sessionGoal("strength_assessment", "Fuerza"), sessionGoal("jump_power_assessment", "Potencia / Salto"), sessionGoal("endurance_assessment", "Resistencia"), sessionGoal("functionality_assessment", "Funcionalidad"), sessionGoal("anthropometry_assessment", "Antropometría"), sessionGoal("other", "Otro")],
  hybrid: [sessionGoal("strength_endurance", "Fuerza + Resistencia"), sessionGoal("strength_power", "Fuerza + Potencia"), sessionGoal("power_endurance", "Potencia + Resistencia"), sessionGoal("general_preparation", "Preparación general"), sessionGoal("specific_preparation", "Preparación específica"), sessionGoal("other", "Otro")],
  other: [sessionGoal("other", "Otro")]
};

export const planningGoalOptions = planningGoalGroups.flatMap((group) => group.options);

export function getPlanningPhase(id?: string) {
  return planningPhaseOptions.find((option) => option.id === id || option.label.toLocaleLowerCase("es") === id?.trim().toLocaleLowerCase("es"));
}

export function getPlanningGoal(id?: string) {
  return planningGoalOptions.find((option) => option.id === id || option.label.toLocaleLowerCase("es") === id?.trim().toLocaleLowerCase("es"));
}

export function getPlanningSessionType(id?: string) {
  return planningSessionTypeOptions.find((option) => option.id === id || option.label.toLocaleLowerCase("es") === id?.trim().toLocaleLowerCase("es"));
}

export function getPlanningSessionGoal(typeId?: PlanningSessionTypeId, id?: string) {
  if (!typeId) return undefined;
  return planningSessionGoalsByType[typeId].find((option) => option.id === id || option.label.toLocaleLowerCase("es") === id?.trim().toLocaleLowerCase("es"));
}

function prescriptionRole(
  seriesReference: [string, string],
  reps: [string, string],
  effort: [PlanningEffortScale | undefined, string?, string?],
  rest: [string, string]
): PlanningPrescriptionPresetRole {
  return {
    effortScale: effort[0], effortMin: effort[1], effortMax: effort[2],
    repsMin: reps[0], repsMax: reps[1],
    restMinSeconds: rest[0], restMaxSeconds: rest[1],
    seriesReferenceMin: seriesReference[0], seriesReferenceMax: seriesReference[1]
  };
}

const prescriptionPresets: Record<string, PlanningPrescriptionPreset> = {
  "adaptation:*": {
    label: "Adaptación / Retorno",
    roles: {
      principal: prescriptionRole(["2", "3"], ["6", "10"], ["rir", "3", "4"], ["90", "180"]),
      secondary: prescriptionRole(["2", "3"], ["8", "12"], ["rir", "3", "4"], ["60", "120"]),
      accessory: prescriptionRole(["2", "3"], ["10", "15"], ["rir", "3", "4"], ["60", "90"])
    }
  },
  "return_to_training:*": {
    label: "Adaptación / Retorno",
    roles: {
      principal: prescriptionRole(["2", "3"], ["6", "10"], ["rir", "3", "4"], ["90", "180"]),
      secondary: prescriptionRole(["2", "3"], ["8", "12"], ["rir", "3", "4"], ["60", "120"]),
      accessory: prescriptionRole(["2", "3"], ["10", "15"], ["rir", "3", "4"], ["60", "90"])
    }
  },
  "accumulation:hypertrophy": {
    label: "Acumulación · Hipertrofia",
    roles: {
      principal: prescriptionRole(["3", "5"], ["6", "10"], ["rir", "1", "3"], ["120", "180"]),
      secondary: prescriptionRole(["3", "4"], ["8", "12"], ["rir", "1", "3"], ["90", "150"]),
      accessory: prescriptionRole(["2", "4"], ["10", "15"], ["rir", "1", "3"], ["60", "120"])
    }
  },
  "accumulation:functional_hypertrophy": {
    label: "Acumulación · Hipertrofia funcional",
    roles: {
      principal: prescriptionRole(["3", "5"], ["5", "8"], ["rir", "1", "3"], ["120", "180"]),
      secondary: prescriptionRole(["3", "4"], ["6", "10"], ["rir", "1", "3"], ["90", "150"]),
      accessory: prescriptionRole(["2", "4"], ["8", "15"], ["rir", "1", "3"], ["60", "120"])
    }
  },
  "intensification:max_strength": {
    label: "Intensificación · Fuerza máxima",
    roles: {
      principal: prescriptionRole(["3", "6"], ["1", "5"], ["rir", "1", "3"], ["180", "300"]),
      secondary: prescriptionRole(["3", "5"], ["3", "6"], ["rir", "1", "3"], ["120", "240"]),
      accessory: prescriptionRole(["2", "4"], ["6", "12"], ["rir", "1", "3"], ["60", "120"])
    }
  },
  "intensification:strength_velocity": {
    label: "Intensificación · Fuerza-velocidad",
    roles: {
      principal: prescriptionRole(["3", "5"], ["2", "5"], ["rir", "2", "4"], ["180", "300"]),
      secondary: prescriptionRole(["3", "4"], ["3", "6"], ["rir", "2", "4"], ["120", "240"]),
      accessory: prescriptionRole(["2", "3"], ["6", "10"], ["rir", "2", "4"], ["90", "150"])
    }
  },
  "realization:power": {
    label: "Realización · Potencia",
    roles: {
      principal: prescriptionRole(["2", "5"], ["1", "5"], [undefined], ["180", "300"]),
      secondary: prescriptionRole(["2", "4"], ["2", "6"], [undefined], ["120", "240"]),
      accessory: prescriptionRole(["2", "3"], ["6", "10"], [undefined], ["90", "150"])
    }
  },
  "*:structural_balance": {
    label: "Equilibrio estructural",
    roles: {
      principal: prescriptionRole(["2", "4"], ["6", "10"], ["rir", "2", "4"], ["90", "180"]),
      secondary: prescriptionRole(["2", "4"], ["8", "12"], ["rir", "2", "4"], ["60", "120"]),
      accessory: prescriptionRole(["2", "3"], ["10", "15"], ["rir", "2", "4"], ["60", "90"])
    }
  },
  "*:motor_control_technique": {
    label: "Control motor",
    roles: {
      principal: prescriptionRole(["2", "4"], ["6", "10"], ["rir", "2", "4"], ["90", "180"]),
      secondary: prescriptionRole(["2", "4"], ["8", "12"], ["rir", "2", "4"], ["60", "120"]),
      accessory: prescriptionRole(["2", "3"], ["10", "15"], ["rir", "2", "4"], ["60", "90"])
    }
  }
};

export function getPrescriptionPreset(phaseId?: PlanningPhaseId, primaryGoalId?: PlanningGoalId) {
  if (!phaseId || phaseId === "deload" || !primaryGoalId) return undefined;
  const strengthStructuredGoals: PlanningGoalId[] = [
    "motor_control_technique", "structural_balance", "hypertrophy", "functional_hypertrophy",
    "max_strength", "eccentric_strength", "strength_velocity", "power", "return_to_activity"
  ];
  const phaseFallback = strengthStructuredGoals.includes(primaryGoalId) ? prescriptionPresets[`${phaseId}:*`] : undefined;
  return prescriptionPresets[`${phaseId}:${primaryGoalId}`]
    ?? phaseFallback
    ?? prescriptionPresets[`*:${primaryGoalId}`];
}

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
      label: "Bloques / ATR",
      value: "blocks"
    },
    {
      description: "La estructura se ajusta segun el contexto manteniendo decisiones explicitas del entrenador.",
      label: "Flexible",
      value: "flexible"
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
