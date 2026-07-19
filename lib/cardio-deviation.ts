export type CardioZone = "z1" | "z2" | "z3" | "z4" | "z5";

export type CardioPlan = {
  notes?: string;
  sport?: "run" | "ride" | "swim" | "row" | "walk" | "other";
  targetDistanceMeters?: number;
  targetDurationMinutes?: number;
  targetRpeMax?: number;
  targetRpeMin?: number;
  targetZone?: CardioZone;
};

export type CardioResult = {
  avgHeartRate?: number;
  avgPaceSecondsPerKm?: number;
  avgPower?: number;
  distanceMeters?: number;
  durationMinutes?: number;
  elevationGainMeters?: number;
  linkedCardioActivityId?: string;
  maxHeartRate?: number;
  normalizedPower?: number;
  perceivedRpe?: number;
  source?: "manual" | "intervals";
  timeInZones?: Partial<Record<CardioZone, number>>;
};

export type CardioDeviationStatus =
  | "below"
  | "slightly-below"
  | "completed"
  | "above"
  | "unknown";

export type CardioZoneStatus = "completed" | "partial" | "outside" | "unknown";
export type CardioRpeStatus = "expected" | "harder" | "easier" | "unknown";

export type CardioDeviationSummary = {
  distanceCompletionPct: number | null;
  distanceStatus: CardioDeviationStatus;
  durationCompletionPct: number | null;
  durationStatus: CardioDeviationStatus;
  reading: string;
  rpeLabel: string;
  rpeStatus: CardioRpeStatus;
  targetZonePct: number | null;
  timeAboveTargetZoneSeconds: number | null;
  timeBelowTargetZoneSeconds: number | null;
  zoneStatus: CardioZoneStatus;
  zoneStatusLabel: string;
};

const cardioZones: CardioZone[] = ["z1", "z2", "z3", "z4", "z5"];

function getPositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getCompletionStatus(completionPct: number | null, upperCompleted = 110): CardioDeviationStatus {
  if (completionPct === null) return "unknown";
  if (completionPct < 80) return "below";
  if (completionPct < 95) return "slightly-below";
  if (completionPct <= upperCompleted) return "completed";
  return "above";
}

function getCompletionLabel(status: CardioDeviationStatus) {
  if (status === "below") return "por debajo de lo previsto";
  if (status === "slightly-below") return "ligeramente por debajo";
  if (status === "completed") return "cumplido";
  if (status === "above") return "por encima de lo previsto";
  return "Sin datos suficientes";
}

function getZoneStatus(targetZonePct: number | null): CardioZoneStatus {
  if (targetZonePct === null) return "unknown";
  if (targetZonePct >= 70) return "completed";
  if (targetZonePct >= 50) return "partial";
  return "outside";
}

function getZoneStatusLabel(status: CardioZoneStatus) {
  if (status === "completed") return "zona cumplida";
  if (status === "partial") return "parcialmente cumplida";
  if (status === "outside") return "fuera de zona objetivo";
  return "Sin datos de zonas suficientes";
}

function getTimeAroundTargetZone(timeInZones: CardioResult["timeInZones"], targetZone?: CardioZone) {
  if (!timeInZones || !targetZone) {
    return {
      targetZonePct: null,
      timeAboveTargetZoneSeconds: null,
      timeBelowTargetZoneSeconds: null
    };
  }

  const targetZoneIndex = cardioZones.indexOf(targetZone);
  const totalZoneSeconds = cardioZones.reduce((total, zone) => total + (getPositiveNumber(timeInZones[zone]) ?? 0), 0);
  if (targetZoneIndex < 0 || totalZoneSeconds <= 0) {
    return {
      targetZonePct: null,
      timeAboveTargetZoneSeconds: null,
      timeBelowTargetZoneSeconds: null
    };
  }

  const targetZoneSeconds = getPositiveNumber(timeInZones[targetZone]) ?? 0;
  const timeBelowTargetZoneSeconds = cardioZones
    .slice(0, targetZoneIndex)
    .reduce((total, zone) => total + (getPositiveNumber(timeInZones[zone]) ?? 0), 0);
  const timeAboveTargetZoneSeconds = cardioZones
    .slice(targetZoneIndex + 1)
    .reduce((total, zone) => total + (getPositiveNumber(timeInZones[zone]) ?? 0), 0);

  return {
    targetZonePct: (targetZoneSeconds / totalZoneSeconds) * 100,
    timeAboveTargetZoneSeconds,
    timeBelowTargetZoneSeconds
  };
}

function getRpeDeviation(plan?: CardioPlan, result?: CardioResult) {
  const perceivedRpe = getPositiveNumber(result?.perceivedRpe);
  const targetRpeMin = getPositiveNumber(plan?.targetRpeMin);
  const targetRpeMax = getPositiveNumber(plan?.targetRpeMax);

  if (perceivedRpe === null || targetRpeMin === null || targetRpeMax === null) {
    return {
      rpeLabel: "Sin RPE de cardio suficiente",
      rpeStatus: "unknown" as CardioRpeStatus
    };
  }

  if (perceivedRpe > targetRpeMax) {
    return {
      rpeLabel: "más duro de lo previsto",
      rpeStatus: "harder" as CardioRpeStatus
    };
  }

  if (perceivedRpe < targetRpeMin) {
    return {
      rpeLabel: "más fácil de lo previsto",
      rpeStatus: "easier" as CardioRpeStatus
    };
  }

  return {
    rpeLabel: "esfuerzo dentro de lo previsto",
    rpeStatus: "expected" as CardioRpeStatus
  };
}

function buildCardioReading(summary: Omit<CardioDeviationSummary, "reading">) {
  if (summary.durationStatus === "completed" && summary.zoneStatus === "completed" && summary.rpeStatus !== "harder") {
    return "La sesión de cardio se completó dentro de lo previsto.";
  }

  if (summary.durationStatus === "below" || summary.durationStatus === "slightly-below") {
    return "La sesión quedó por debajo de la duración planificada.";
  }

  if (summary.durationStatus === "completed" && summary.timeAboveTargetZoneSeconds !== null && summary.timeAboveTargetZoneSeconds > 0 && summary.zoneStatus !== "completed") {
    return "La duración se cumplió, pero parte del trabajo se realizó por encima de la zona objetivo.";
  }

  if (summary.rpeStatus === "harder") {
    return "El RPE fue más alto de lo previsto.";
  }

  return "Lectura orientativa de cardio disponible para revisar con el contexto de la sesión.";
}

export function analyzeCardioDeviation(cardioPlan?: CardioPlan, cardioResult?: CardioResult): CardioDeviationSummary {
  const targetDuration = getPositiveNumber(cardioPlan?.targetDurationMinutes);
  const durationReal = getPositiveNumber(cardioResult?.durationMinutes);
  const durationCompletionPct = targetDuration !== null && durationReal !== null
    ? (durationReal / targetDuration) * 100
    : null;
  const durationStatus = getCompletionStatus(durationCompletionPct);

  const targetDistance = getPositiveNumber(cardioPlan?.targetDistanceMeters);
  const distanceReal = getPositiveNumber(cardioResult?.distanceMeters);
  const distanceCompletionPct = targetDistance !== null && distanceReal !== null
    ? (distanceReal / targetDistance) * 100
    : null;
  const distanceStatus = getCompletionStatus(distanceCompletionPct);
  const zoneAnalysis = getTimeAroundTargetZone(cardioResult?.timeInZones, cardioPlan?.targetZone);
  const zoneStatus = getZoneStatus(zoneAnalysis.targetZonePct);
  const rpeAnalysis = getRpeDeviation(cardioPlan, cardioResult);
  const summary = {
    distanceCompletionPct,
    distanceStatus,
    durationCompletionPct,
    durationStatus,
    ...rpeAnalysis,
    targetZonePct: zoneAnalysis.targetZonePct,
    timeAboveTargetZoneSeconds: zoneAnalysis.timeAboveTargetZoneSeconds,
    timeBelowTargetZoneSeconds: zoneAnalysis.timeBelowTargetZoneSeconds,
    zoneStatus,
    zoneStatusLabel: getZoneStatusLabel(zoneStatus)
  };

  return {
    ...summary,
    reading: buildCardioReading(summary)
  };
}

export function generateCardioFeedbackSuggestion(cardioDeviation: CardioDeviationSummary) {
  return cardioDeviation.reading;
}

export function getCardioCompletionLabel(status: CardioDeviationStatus) {
  return getCompletionLabel(status);
}
