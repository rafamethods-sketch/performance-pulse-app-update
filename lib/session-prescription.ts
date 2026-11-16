export type SessionPrescriptionContext = "activation" | "main" | "complementary";

export type ContextualPrescriptionDraft = {
  exerciseId?: string;
  exerciseSearch?: string;
  intensityMethod?: string;
  load?: string;
  percent1RM?: string;
  prescriptionRole?: string;
  prescriptionSource?: "default" | "custom" | "legacy";
  reps?: string;
  rest?: string;
  sessionBlock?: SessionPrescriptionContext;
  sets?: string;
  targetRir?: string;
  targetRpe?: string;
  targetVelocity?: string;
};

export type ContextualPrescriptionRules = {
  requireIntensity: boolean;
  requireRest: boolean;
  requireRole: boolean;
  showAdvancedByDefault: boolean;
  showRole: boolean;
};

export function getContextualPrescriptionRules(context?: SessionPrescriptionContext): ContextualPrescriptionRules {
  if (context === "activation") {
    return {
      requireIntensity: false,
      requireRest: false,
      requireRole: false,
      showAdvancedByDefault: false,
      showRole: false
    };
  }

  if (context === "main") {
    return {
      requireIntensity: false,
      requireRest: false,
      requireRole: true,
      showAdvancedByDefault: true,
      showRole: true
    };
  }

  return {
    requireIntensity: false,
    requireRest: false,
    requireRole: false,
    showAdvancedByDefault: true,
    showRole: true
  };
}

function hasValue(value?: string) {
  return Boolean(value?.trim());
}

function hasIntensityValue(exercise: ContextualPrescriptionDraft) {
  switch (exercise.intensityMethod) {
    case "rpe":
      return hasValue(exercise.targetRpe);
    case "percent_1rm":
      return hasValue(exercise.percent1RM);
    case "velocity":
      return hasValue(exercise.targetVelocity);
    case "kg":
    case "external_load":
      return hasValue(exercise.load);
    case "rir":
      return hasValue(exercise.targetRir);
    default:
      return true;
  }
}

export function getContextualPrescriptionMissingFields(exercise: ContextualPrescriptionDraft) {
  if (exercise.prescriptionSource === "legacy") return [];

  const rules = getContextualPrescriptionRules(exercise.sessionBlock);
  const missing: string[] = [];

  if (!hasValue(exercise.exerciseId) && !hasValue(exercise.exerciseSearch)) missing.push("exercise");
  if (!hasValue(exercise.sets)) missing.push("sets");
  if (!hasValue(exercise.reps)) missing.push("reps");
  if (rules.requireRole && !hasValue(exercise.prescriptionRole)) missing.push("role");
  if (rules.requireRest && !hasValue(exercise.rest)) missing.push("rest");
  if (exercise.sessionBlock !== "activation" && hasValue(exercise.intensityMethod) && !hasIntensityValue(exercise)) {
    missing.push("intensity");
  }

  return missing;
}

export function isContextualPrescriptionComplete(exercise: ContextualPrescriptionDraft) {
  return getContextualPrescriptionMissingFields(exercise).length === 0;
}
