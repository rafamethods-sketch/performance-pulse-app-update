export type SessionDiscomfort = {
  bodyArea?: string;
  exerciseId?: string;
  exerciseName?: string;
  hasDiscomfort: boolean;
  intensity?: number;
  notes?: string;
  phase?: string;
};

type SessionDeviationExercise = {
  exerciseId?: string | null;
  exerciseName?: string | null;
  name?: string | null;
  plannedReps?: number | string | null;
  plannedRir?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rpe?: number | string | null;
  actualRpe?: number | string | null;
  exerciseRpe?: number | string | null;
  perceivedExertion?: number | string | null;
  setDetails?: Array<{
    reps?: number | string | null;
    setNumber?: number;
  }>;
  sets?: number | string | null;
  targetRir?: number | string | null;
};

export type SessionDeviationRecord = {
  discomfort?: SessionDiscomfort;
  exercises?: SessionDeviationExercise[];
  performedExercises?: SessionDeviationExercise[];
  plannedExercises?: SessionDeviationExercise[];
};

export type CompletionStatus =
  | "below"
  | "slightly-below"
  | "completed"
  | "above"
  | "unknown";

export type PerformanceDropStatus =
  | "stable"
  | "normal"
  | "moderate"
  | "high"
  | "insufficient";

export type EffortDeviationStatus =
  | "harder"
  | "easier"
  | "expected"
  | "unknown";

export type ExerciseDeviationSummary = {
  completionPct: number | null;
  completionStatus: CompletionStatus;
  completionLabel: string;
  dropLabel: string;
  dropPct: number | null;
  dropStatus: PerformanceDropStatus;
  effortLabel: string;
  effortStatus: EffortDeviationStatus;
  exerciseName: string;
  performedRepsTotal: number | null;
  plannedRepsTotal: number | null;
};

export type SessionDeviationSummary = {
  discomfort?: SessionDiscomfort;
  exerciseSummaries: ExerciseDeviationSummary[];
  globalCompletionPct: number | null;
  hasRelevantDeviation: boolean;
  suggestedReviewNotes: string;
};

function parseNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.replace(",", ".").match(/\d+(\.\d+)?/);
  if (!normalized) return null;
  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPositiveNumber(value: unknown) {
  const parsed = parseNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function getNonNegativeNumber(value: unknown) {
  const parsed = parseNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function getExerciseName(entry?: SessionDeviationExercise) {
  return entry?.exerciseName || entry?.name || entry?.exerciseId || "Ejercicio sin especificar";
}

function getSetDetailsReps(entry?: SessionDeviationExercise) {
  return (entry?.setDetails ?? [])
    .map((detail) => getPositiveNumber(detail.reps))
    .filter((reps): reps is number => reps !== null);
}

function getPlannedRepsTotal(entry?: SessionDeviationExercise) {
  const sets = getPositiveNumber(entry?.plannedSets ?? entry?.sets);
  const reps = getPositiveNumber(entry?.plannedReps ?? entry?.reps);
  if (sets === null || reps === null) return null;
  return sets * reps;
}

function getPerformedRepsTotal(entry?: SessionDeviationExercise) {
  const setDetailsTotal = getSetDetailsReps(entry).reduce((total, reps) => total + reps, 0);
  if (setDetailsTotal > 0) return setDetailsTotal;

  const sets = getPositiveNumber(entry?.sets);
  const reps = getPositiveNumber(entry?.reps);
  if (sets === null || reps === null) return null;
  return sets * reps;
}

function getCompletionStatus(completionPct: number | null): CompletionStatus {
  if (completionPct === null) return "unknown";
  if (completionPct < 80) return "below";
  if (completionPct < 95) return "slightly-below";
  if (completionPct <= 105) return "completed";
  return "above";
}

function getCompletionLabel(status: CompletionStatus) {
  if (status === "below") return "por debajo de lo previsto";
  if (status === "slightly-below") return "ligeramente por debajo";
  if (status === "completed") return "cumplido";
  if (status === "above") return "por encima de lo previsto";
  return "Sin datos suficientes";
}

function getPerformanceDrop(entry?: SessionDeviationExercise) {
  const reps = getSetDetailsReps(entry);
  if (reps.length < 2) {
    return {
      dropLabel: "Sin datos por serie suficientes.",
      dropPct: null,
      dropStatus: "insufficient" as PerformanceDropStatus
    };
  }

  const bestSetReps = Math.max(...reps);
  const lastSetReps = reps[reps.length - 1];
  if (bestSetReps <= 0) {
    return {
      dropLabel: "Sin datos por serie suficientes.",
      dropPct: null,
      dropStatus: "insufficient" as PerformanceDropStatus
    };
  }

  const dropPct = Math.max(0, ((bestSetReps - lastSetReps) / bestSetReps) * 100);
  if (dropPct <= 5) return { dropLabel: "estable", dropPct, dropStatus: "stable" as PerformanceDropStatus };
  if (dropPct <= 15) return { dropLabel: "caída normal", dropPct, dropStatus: "normal" as PerformanceDropStatus };
  if (dropPct <= 25) return { dropLabel: "caída moderada", dropPct, dropStatus: "moderate" as PerformanceDropStatus };
  return { dropLabel: "caída alta", dropPct, dropStatus: "high" as PerformanceDropStatus };
}

function getExerciseRpe(entry?: SessionDeviationExercise) {
  return getPositiveNumber(entry?.exerciseRpe ?? entry?.rpe ?? entry?.actualRpe ?? entry?.perceivedExertion);
}

function getEffortDeviation(planned?: SessionDeviationExercise, performed?: SessionDeviationExercise) {
  const targetRir = getNonNegativeNumber(planned?.plannedRir ?? planned?.targetRir);
  const actualRpe = getExerciseRpe(performed);

  if (targetRir === null || actualRpe === null) {
    return {
      effortLabel: "Sin RPE por ejercicio suficiente.",
      effortStatus: "unknown" as EffortDeviationStatus
    };
  }

  const estimatedTargetRpe = 10 - targetRir;
  if (actualRpe > estimatedTargetRpe + 1) {
    return {
      effortLabel: "más duro de lo previsto",
      effortStatus: "harder" as EffortDeviationStatus
    };
  }
  if (actualRpe < estimatedTargetRpe - 1) {
    return {
      effortLabel: "más fácil de lo previsto",
      effortStatus: "easier" as EffortDeviationStatus
    };
  }
  return {
    effortLabel: "esfuerzo dentro de lo previsto",
    effortStatus: "expected" as EffortDeviationStatus
  };
}

function buildExerciseSummary(planned?: SessionDeviationExercise, performed?: SessionDeviationExercise): ExerciseDeviationSummary {
  const plannedRepsTotal = getPlannedRepsTotal(planned);
  const performedRepsTotal = getPerformedRepsTotal(performed);
  const completionPct =
    plannedRepsTotal !== null && plannedRepsTotal > 0 && performedRepsTotal !== null
      ? (performedRepsTotal / plannedRepsTotal) * 100
      : null;
  const completionStatus = getCompletionStatus(completionPct);
  const drop = getPerformanceDrop(performed);
  const effort = getEffortDeviation(planned, performed);

  return {
    completionPct,
    completionStatus,
    completionLabel: getCompletionLabel(completionStatus),
    ...drop,
    ...effort,
    exerciseName: getExerciseName(performed ?? planned),
    performedRepsTotal,
    plannedRepsTotal
  };
}

function buildSuggestedReviewNotes(summary: Omit<SessionDeviationSummary, "suggestedReviewNotes">) {
  const notes: string[] = [];
  const highDrops = summary.exerciseSummaries.filter((exercise) => exercise.dropStatus === "high");
  const harderExercises = summary.exerciseSummaries.filter((exercise) => exercise.effortStatus === "harder");

  if (summary.globalCompletionPct !== null && summary.globalCompletionPct >= 95 && summary.globalCompletionPct <= 105 && !highDrops.length && !harderExercises.length) {
    notes.push("La sesión se completó dentro de lo previsto.");
  } else {
    notes.push("La sesión muestra alguna desviación respecto a lo planificado. Conviene revisar la respuesta del ejercicio y ajustar la siguiente sesión si se repite.");
  }

  if (highDrops.length > 0) {
    notes.push(`Se observa caída alta de rendimiento en ${highDrops.map((exercise) => exercise.exerciseName).join(", ")}.`);
  }

  if (harderExercises.length > 0) {
    notes.push(`Algunos ejercicios fueron más exigentes de lo previsto: ${harderExercises.map((exercise) => exercise.exerciseName).join(", ")}.`);
  }

  if (summary.discomfort?.hasDiscomfort) {
    const exerciseText = summary.discomfort.exerciseName ? ` de ${summary.discomfort.exerciseName}` : "";
    notes.push(`El deportista reportó molestias en ${summary.discomfort.bodyArea ?? "zona sin especificar"} durante ${summary.discomfort.phase ?? "una fase sin especificar"}${exerciseText}. Conviene revisar tolerancia y ajustar si se repite.`);
  }

  return notes.join(" ");
}

export function calculateSessionDeviation(session: SessionDeviationRecord): SessionDeviationSummary {
  const plannedExercises = session.plannedExercises ?? session.exercises ?? [];
  const performedExercises = session.performedExercises ?? [];
  const exerciseCount = Math.max(plannedExercises.length, performedExercises.length);
  const exerciseSummaries = Array.from({ length: exerciseCount }, (_, index) =>
    buildExerciseSummary(plannedExercises[index], performedExercises[index])
  );
  const totalPlannedReps = exerciseSummaries.reduce((total, exercise) => total + (exercise.plannedRepsTotal ?? 0), 0);
  const totalPerformedReps = exerciseSummaries.reduce((total, exercise) => total + (exercise.performedRepsTotal ?? 0), 0);
  const globalCompletionPct = totalPlannedReps > 0 ? (totalPerformedReps / totalPlannedReps) * 100 : null;
  const hasRelevantDeviation = exerciseSummaries.some((exercise) =>
    ["below", "slightly-below", "above"].includes(exercise.completionStatus) ||
    exercise.dropStatus === "high" ||
    exercise.effortStatus === "harder" ||
    exercise.effortStatus === "easier"
  );
  const summary = {
    discomfort: session.discomfort,
    exerciseSummaries,
    globalCompletionPct,
    hasRelevantDeviation
  };

  return {
    ...summary,
    suggestedReviewNotes: buildSuggestedReviewNotes(summary)
  };
}
