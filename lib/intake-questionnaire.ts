export type IntakeGender = "male" | "female" | "prefer_not_to_say" | "other" | "";
export type IntakeSleepHours = "<7" | ">=7" | "variable" | "";
export type IntakeStressLevel = "low" | "medium" | "high" | "";
export type IntakeYesNo = "yes" | "no" | "";
export type IntakeMedicalRestriction = "yes" | "no" | "not_sure" | "";
export type IntakeSessionDuration = "<30" | "30-45" | "45-60" | ">60" | "";
export type IntakeTrainingLocation = "gym" | "home" | "outdoor" | "mixed" | "";
export type IntakeStrengthExperience = "none" | "<6m" | "6m-2y" | ">2y" | "detrained" | "";

export type IntakeQuestionnaireAnswers = {
  age?: string;
  availableDaysPerWeek?: string;
  availableEquipment?: string;
  currentMedication?: IntakeYesNo;
  currentMedicationDetails?: string;
  currentPain?: IntakeYesNo;
  currentPainDetails?: string;
  currentProfessionalSupport?: string[];
  currentSportDetails?: string;
  currentSportPractice?: IntakeYesNo;
  diagnosedCondition?: IntakeYesNo;
  diagnosedConditionDetails?: string;
  emergencyContact?: string;
  exerciseSymptoms?: string[];
  fullName?: string;
  gender?: IntakeGender;
  informationAccuracyAccepted?: boolean;
  mainGoal?: string;
  medicalDisclaimerAccepted?: boolean;
  medicalExerciseRestriction?: IntakeMedicalRestriction;
  medicalExerciseRestrictionDetails?: string;
  occupation?: string;
  otherRelevantInfo?: string;
  phone?: string;
  previousTraining?: string;
  recentInjuryOrSurgery?: IntakeYesNo;
  recentInjuryOrSurgeryDetails?: string;
  recoveryHabits?: string[];
  secondaryGoals?: string[];
  sessionDuration?: IntakeSessionDuration;
  sleepHours?: IntakeSleepHours;
  strengthTrainingExperience?: IntakeStrengthExperience;
  stressLevel?: IntakeStressLevel;
  targetDateOrEvent?: string;
  threeMonthGoal?: string;
  trainingLocation?: IntakeTrainingLocation;
};

export type IntakeQuestionnaire = {
  answers?: IntakeQuestionnaireAnswers;
  completed?: boolean;
  completedAt?: string;
  lastReviewedAt?: string;
  needsCoachReview?: boolean;
  required?: boolean;
  updatedAt?: string;
};

export const emptyIntakeQuestionnaireAnswers: IntakeQuestionnaireAnswers = {
  age: "",
  availableDaysPerWeek: "",
  availableEquipment: "",
  currentMedication: "",
  currentMedicationDetails: "",
  currentPain: "",
  currentPainDetails: "",
  currentProfessionalSupport: [],
  currentSportDetails: "",
  currentSportPractice: "",
  diagnosedCondition: "",
  diagnosedConditionDetails: "",
  emergencyContact: "",
  exerciseSymptoms: [],
  fullName: "",
  gender: "",
  informationAccuracyAccepted: false,
  mainGoal: "",
  medicalDisclaimerAccepted: false,
  medicalExerciseRestriction: "",
  medicalExerciseRestrictionDetails: "",
  occupation: "",
  otherRelevantInfo: "",
  phone: "",
  previousTraining: "",
  recentInjuryOrSurgery: "",
  recentInjuryOrSurgeryDetails: "",
  recoveryHabits: [],
  secondaryGoals: [],
  sessionDuration: "",
  sleepHours: "",
  strengthTrainingExperience: "",
  stressLevel: "",
  targetDateOrEvent: "",
  threeMonthGoal: "",
  trainingLocation: ""
};

export const intakeGenderLabels: Record<Exclude<IntakeGender, "">, string> = {
  female: "Femenino",
  male: "Masculino",
  other: "Otro",
  prefer_not_to_say: "Prefiero no decirlo"
};

export const intakeSleepLabels: Record<Exclude<IntakeSleepHours, "">, string> = {
  ">=7": ">= 7 horas",
  "<7": "< 7 horas",
  variable: "Varía mucho"
};

export const intakeStressLabels: Record<Exclude<IntakeStressLevel, "">, string> = {
  high: "Alto",
  low: "Bajo",
  medium: "Medio"
};

export const intakeYesNoLabels: Record<Exclude<IntakeYesNo, "">, string> = {
  no: "No",
  yes: "Sí"
};

export const intakeRestrictionLabels: Record<Exclude<IntakeMedicalRestriction, "">, string> = {
  no: "No",
  not_sure: "No estoy seguro/a",
  yes: "Sí"
};

export const intakeSessionDurationLabels: Record<Exclude<IntakeSessionDuration, "">, string> = {
  "30-45": "30-45 min",
  "45-60": "45-60 min",
  "<30": "Menos de 30 min",
  ">60": "Más de 60 min"
};

export const intakeTrainingLocationLabels: Record<Exclude<IntakeTrainingLocation, "">, string> = {
  gym: "Gimnasio",
  home: "Casa",
  mixed: "Mixto",
  outdoor: "Exterior"
};

export const intakeStrengthExperienceLabels: Record<Exclude<IntakeStrengthExperience, "">, string> = {
  "6m-2y": "6 meses - 2 años",
  "<6m": "Menos de 6 meses",
  ">2y": "Más de 2 años",
  detrained: "He entrenado, pero llevo tiempo parado/a",
  none: "Nunca he entrenado fuerza"
};

export const recoveryHabitOptions = ["Sueño", "Estrés", "Alimentación", "Tabaco", "Alcohol", "Trabajo físico", "Otro"];
export const professionalSupportOptions = ["Nutricionista", "Psicólogo", "Fisioterapeuta", "Médico", "Ninguno", "Otro"];
export const secondaryGoalOptions = [
  "Mejorar salud general",
  "Aumentar masa muscular",
  "Reducir grasa corporal",
  "Mejorar fuerza",
  "Mejorar rendimiento",
  "Reducir estrés",
  "Sentirme mejor",
  "Otro"
];
export const exerciseSymptomOptions = [
  "Dolor, presión o molestia en el pecho",
  "Mareo, desmayo o pérdida de conciencia",
  "Falta de aire anormal",
  "Palpitaciones fuertes o irregulares",
  "Dolor intenso o limitante",
  "Ninguno"
];

export function buildInitialIntakeQuestionnaire(): IntakeQuestionnaire {
  return {
    answers: { ...emptyIntakeQuestionnaireAnswers },
    completed: false,
    needsCoachReview: false,
    required: true
  };
}

export function mergeIntakeAnswers(answers?: IntakeQuestionnaireAnswers): IntakeQuestionnaireAnswers {
  return {
    ...emptyIntakeQuestionnaireAnswers,
    ...(answers ?? {}),
    currentProfessionalSupport: [...(answers?.currentProfessionalSupport ?? [])],
    exerciseSymptoms: [...(answers?.exerciseSymptoms ?? [])],
    recoveryHabits: [...(answers?.recoveryHabits ?? [])],
    secondaryGoals: [...(answers?.secondaryGoals ?? [])]
  };
}

export function isIntakeRequiredAndIncomplete(intake?: IntakeQuestionnaire) {
  return intake?.required === true && intake.completed !== true;
}

export function getIntakeStatusLabel(intake?: IntakeQuestionnaire) {
  if (!intake?.required) return "No requerido";
  if (intake.completed && intake.needsCoachReview) return "Actualizado pendiente de revisión";
  if (intake.completed) return "Completado";
  return "Pendiente";
}

export function getIntakeAnswerLabel(value?: string | boolean | null, fallback = "Sin especificar") {
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (value === undefined || value === null || `${value}`.trim() === "") return fallback;
  return `${value}`;
}

export function getIntakeSummaryRows(intake?: IntakeQuestionnaire) {
  const answers = mergeIntakeAnswers(intake?.answers);
  const healthFlags = [
    answers.diagnosedCondition === "yes" ? `Condición: ${answers.diagnosedConditionDetails || "Sí"}` : "",
    answers.currentPain === "yes" ? `Dolor/molestia: ${answers.currentPainDetails || "Sí"}` : "",
    answers.recentInjuryOrSurgery === "yes" ? `Lesión/operación: ${answers.recentInjuryOrSurgeryDetails || "Sí"}` : "",
    answers.medicalExerciseRestriction === "yes" || answers.medicalExerciseRestriction === "not_sure"
      ? `Restricción: ${intakeRestrictionLabels[answers.medicalExerciseRestriction] ?? "Sí"}${answers.medicalExerciseRestrictionDetails ? ` · ${answers.medicalExerciseRestrictionDetails}` : ""}`
      : "",
    (answers.exerciseSymptoms ?? []).filter((item) => item !== "Ninguno").length > 0
      ? `Síntomas: ${(answers.exerciseSymptoms ?? []).filter((item) => item !== "Ninguno").join(", ")}`
      : ""
  ].filter(Boolean);

  return [
    ["Objetivo principal", getIntakeAnswerLabel(answers.mainGoal)],
    ["Disponibilidad semanal", getIntakeAnswerLabel(answers.availableDaysPerWeek ? `${answers.availableDaysPerWeek} días/semana` : "")],
    ["Tiempo por sesión", answers.sessionDuration ? intakeSessionDurationLabels[answers.sessionDuration] : "Sin especificar"],
    ["Lugar de entrenamiento", answers.trainingLocation ? intakeTrainingLocationLabels[answers.trainingLocation] : "Sin especificar"],
    ["Experiencia", answers.strengthTrainingExperience ? intakeStrengthExperienceLabels[answers.strengthTrainingExperience] : "Sin especificar"],
    ["Lesiones / salud / restricciones", healthFlags.length > 0 ? healthFlags.join(" · ") : "Sin alertas declaradas"]
  ];
}

export function validateIntakeAnswers(answers: IntakeQuestionnaireAnswers) {
  const missing: string[] = [];
  const requireText = (value: unknown, label: string) => {
    if (value === undefined || value === null || `${value}`.trim() === "") missing.push(label);
  };
  const requireArray = (value: unknown[] | undefined, label: string) => {
    if (!value || value.length === 0) missing.push(label);
  };

  requireText(answers.fullName, "Nombre completo");
  requireText(answers.age, "Edad");
  requireText(answers.gender, "Género");
  requireText(answers.phone, "Número de teléfono");
  requireText(answers.emergencyContact, "Contacto de emergencia");
  requireText(answers.sleepHours, "Sueño");
  requireText(answers.currentSportPractice, "Actividad física actual");
  requireText(answers.mainGoal, "Objetivo principal");
  requireText(answers.availableDaysPerWeek, "Días disponibles por semana");
  requireText(answers.sessionDuration, "Tiempo por sesión");
  requireText(answers.trainingLocation, "Lugar de entrenamiento");
  requireText(answers.strengthTrainingExperience, "Experiencia entrenando fuerza");
  requireText(answers.diagnosedCondition, "Condición médica diagnosticada");
  requireText(answers.currentMedication, "Medicación actual");
  requireText(answers.recentInjuryOrSurgery, "Lesión u operación reciente");
  requireText(answers.currentPain, "Dolor o molestia actual");
  requireArray(answers.exerciseSymptoms, "Síntomas durante ejercicio");
  requireText(answers.medicalExerciseRestriction, "Restricción médica para ejercicio");
  if (!answers.informationAccuracyAccepted) missing.push("Confirmación de información correcta");
  if (!answers.medicalDisclaimerAccepted) missing.push("Confirmación de aviso médico");

  return missing;
}
