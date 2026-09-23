export type ExerciseTempo = {
  concentric: string;
  eccentric: string;
  postConcentricPause: string;
  postEccentricPause: string;
};

const numericTempoPhasePattern = /^\d+(?:[.,]\d+)?$/;

export function isValidTempoPhase(value: string, allowExplosive = false) {
  const normalized = value.trim().toUpperCase();
  if (allowExplosive && normalized === "X") return true;
  return numericTempoPhasePattern.test(normalized) && Number(normalized.replace(",", ".")) >= 0;
}

export function isCompleteExerciseTempo(tempo?: ExerciseTempo | null): tempo is ExerciseTempo {
  return Boolean(
    tempo &&
    isValidTempoPhase(tempo.eccentric) &&
    isValidTempoPhase(tempo.postEccentricPause) &&
    isValidTempoPhase(tempo.concentric, true) &&
    isValidTempoPhase(tempo.postConcentricPause)
  );
}

export function normalizeExerciseTempo(tempo?: ExerciseTempo | null): ExerciseTempo | undefined {
  if (!isCompleteExerciseTempo(tempo)) return undefined;
  return {
    concentric: tempo.concentric.trim().toUpperCase().replace(",", "."),
    eccentric: tempo.eccentric.trim().replace(",", "."),
    postConcentricPause: tempo.postConcentricPause.trim().replace(",", "."),
    postEccentricPause: tempo.postEccentricPause.trim().replace(",", ".")
  };
}

export function formatExerciseTempo(tempo?: ExerciseTempo | null) {
  const normalized = normalizeExerciseTempo(tempo);
  return normalized
    ? `${normalized.eccentric}-${normalized.postEccentricPause}-${normalized.concentric}-${normalized.postConcentricPause}`
    : "";
}
