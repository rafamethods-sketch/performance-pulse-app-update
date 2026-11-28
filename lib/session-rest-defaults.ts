export type SessionRestSource = "default" | "custom" | "legacy";

type ResolveSessionRestInput = {
  customRest?: string;
  defaultRest?: string;
  existingRest?: string;
};

type GroupRestDefaults = {
  restBetweenExercises?: string;
  restBetweenRounds?: string;
};

export function hasConfiguredRest(value: string | null | undefined): value is string {
  return value !== undefined && value !== null && value.trim() !== "";
}

export function resolveSessionRest({ customRest, defaultRest, existingRest }: ResolveSessionRestInput) {
  if (hasConfiguredRest(customRest)) return customRest;
  if (hasConfiguredRest(defaultRest)) return defaultRest;
  return existingRest ?? "";
}

export function getExerciseGroupRestDefaults(memberRests: readonly (string | null | undefined)[]): GroupRestDefaults {
  if (memberRests.length < 2) return {};

  const restBetweenExercises = memberRests
    .slice(0, -1)
    .find(hasConfiguredRest);
  const finalExerciseRest = memberRests.at(-1);

  return {
    restBetweenExercises: hasConfiguredRest(restBetweenExercises) ? restBetweenExercises : undefined,
    restBetweenRounds: hasConfiguredRest(finalExerciseRest) ? finalExerciseRest : undefined
  };
}
