import { getExerciseById } from "./exercises";

export type SessionExerciseExecutionMode = "completion_only" | "set_tracking";

export type SessionExerciseCompletion = {
  completed: boolean;
  completedAt?: string;
};

export type SessionExerciseEffort = {
  type: "rpe" | "rir";
  value: number;
};

export type SessionSetExecution = {
  setNumber?: number | null;
};

export type SessionExecutionInput = {
  completion?: SessionExerciseCompletion | null;
  exerciseEffort?: SessionExerciseEffort | null;
  executionMode?: SessionExerciseExecutionMode | null;
  exerciseId?: string | null;
  omittedSetNumbers?: number[] | null;
};

export function getSessionExerciseExecutionMode(exercise?: SessionExecutionInput | null): SessionExerciseExecutionMode {
  return exercise?.executionMode === "completion_only" ? "completion_only" : "set_tracking";
}

export function getDefaultSessionExerciseExecutionMode(exerciseId?: string | null): SessionExerciseExecutionMode {
  return getExerciseById(exerciseId ?? "")?.exerciseType === "mobility" ? "completion_only" : "set_tracking";
}

export function isCompletionOnlyExercise(exercise?: SessionExecutionInput | null) {
  return getSessionExerciseExecutionMode(exercise) === "completion_only";
}

export function resolveSessionSetNumbers<T extends SessionSetExecution>(setDetails?: readonly T[] | null) {
  const details = setDetails ?? [];
  const explicitNumbers = details.map((detail) => detail.setNumber);
  const reliable = explicitNumbers.every((value) => Number.isInteger(value) && Number(value) > 0) && new Set(explicitNumbers).size === explicitNumbers.length;
  return details.map((detail, index) => ({ detail, setNumber: reliable ? Number(detail.setNumber) : index + 1 }));
}

export function getSessionSetByNumber<T extends SessionSetExecution>(setDetails: readonly T[] | null | undefined, setNumber: number) {
  return resolveSessionSetNumbers(setDetails).find((entry) => entry.setNumber === setNumber)?.detail;
}
