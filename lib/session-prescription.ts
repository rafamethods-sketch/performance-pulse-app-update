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

function parseBoundedValue(value: string) {
  return Number(value.trim().replace(",", "."));
}

export function isPrescriptionIntensityValueValid(value: string | undefined, min: number, max: number) {
  if (!hasValue(value)) return false;
  const parts = value!.trim().split(/\s*[-–]\s*/);
  if (parts.length > 2 || parts.some((part) => !part.trim())) return false;
  return parts.every((part) => {
    const parsed = parseBoundedValue(part);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max;
  });
}

export function isPrescriptionIntensityInputAllowed(value: string, min: number, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^\d+(?:[.,]\d+)?[-–]?$/.test(trimmed)) {
    const first = parseBoundedValue(trimmed.replace(/[-–]$/, ""));
    return Number.isFinite(first) && first >= min && first <= max;
  }
  return isPrescriptionIntensityValueValid(trimmed, min, max);
}

function formatRestSeconds(seconds: number) {
  const wholeSeconds = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function formatPrescriptionRest(value?: string): string {
  const raw = value?.trim();
  if (!raw) return "";
  const clock = raw.match(/^(\d+):(\d{2})\s*(?:s|seg|sec)?$/i);
  if (clock && Number(clock[2]) < 60) return `${clock[1].padStart(2, "0")}:${clock[2]}`;

  const range = raw.split(/\s*[-–]\s*/);
  if (range.length === 2) {
    const formatted = range.map((part) => formatPrescriptionRest(part));
    return formatted.every(Boolean) ? formatted.join("–") : raw;
  }

  const minutes = raw.match(/^(\d+(?:[.,]\d+)?)\s*min$/i);
  if (minutes) return formatRestSeconds(Number(minutes[1].replace(",", ".")) * 60);
  const compactClock = raw.match(/^\d{3,4}$/);
  if (compactClock) {
    const seconds = Number(raw.slice(-2));
    if (seconds < 60) return `${raw.slice(0, -2).padStart(2, "0")}:${raw.slice(-2)}`;
  }
  const seconds = raw.match(/^(\d+(?:[.,]\d+)?)\s*(?:s|seg|sec)?$/i);
  if (seconds) return formatRestSeconds(Number(seconds[1].replace(",", ".")));
  return raw;
}

function hasIntensityValue(exercise: ContextualPrescriptionDraft) {
  switch (exercise.intensityMethod) {
    case "rpe":
      return isPrescriptionIntensityValueValid(exercise.targetRpe, 1, 10);
    case "percent_1rm":
      return hasValue(exercise.percent1RM);
    case "velocity":
      return hasValue(exercise.targetVelocity);
    case "kg":
    case "external_load":
      return hasValue(exercise.load);
    case "rir":
      return isPrescriptionIntensityValueValid(exercise.targetRir, 0, 6);
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
