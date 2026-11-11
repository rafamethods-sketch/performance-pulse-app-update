import type { ExerciseDefinition } from "@/lib/exercises";

export type ExerciseCatalogValidationIssue = {
  exerciseId: string;
  field: "errorsToAvoid" | "intentCue";
  message: string;
};

const MAX_INTENT_CUE_LENGTH = 80;

export function validateExerciseCatalog(
  exercises: ExerciseDefinition[]
): ExerciseCatalogValidationIssue[] {
  const issues: ExerciseCatalogValidationIssue[] = [];

  exercises.forEach((exercise) => {
    const seenErrors = new Set<string>();

    if (exercise.errorsToAvoid.length > 5) {
      issues.push(createIssue(exercise.id, "errorsToAvoid", "Supera el máximo editorial de 5 errores."));
    }

    exercise.errorsToAvoid.forEach((error) => {
      const normalizedError = error.trim();
      const firstLetter = normalizedError.match(/\p{L}/u)?.[0];

      if (!normalizedError) {
        issues.push(createIssue(exercise.id, "errorsToAvoid", "Contiene una frase vacía."));
      }
      if (error !== normalizedError) {
        issues.push(createIssue(exercise.id, "errorsToAvoid", `Contiene espacios exteriores: "${error}".`));
      }
      if (firstLetter && firstLetter === firstLetter.toLocaleLowerCase("es")) {
        issues.push(createIssue(exercise.id, "errorsToAvoid", `Debe comenzar en mayúscula: "${error}".`));
      }

      const duplicateKey = normalizedError.toLocaleLowerCase("es");
      if (normalizedError && seenErrors.has(duplicateKey)) {
        issues.push(createIssue(exercise.id, "errorsToAvoid", `Contiene un duplicado: "${error}".`));
      }
      seenErrors.add(duplicateKey);
    });

    if (exercise.intentCue !== undefined) {
      const normalizedCue = exercise.intentCue.trim();

      if (!normalizedCue) {
        issues.push(createIssue(exercise.id, "intentCue", "La pauta está vacía."));
      }
      if (exercise.intentCue !== normalizedCue) {
        issues.push(createIssue(exercise.id, "intentCue", "La pauta contiene espacios exteriores."));
      }
      if (/\r|\n/.test(exercise.intentCue)) {
        issues.push(createIssue(exercise.id, "intentCue", "La pauta contiene un salto de línea."));
      }
      if (exercise.intentCue.length > MAX_INTENT_CUE_LENGTH) {
        issues.push(createIssue(exercise.id, "intentCue", `La pauta supera ${MAX_INTENT_CUE_LENGTH} caracteres.`));
      }
    }
  });

  return issues;
}

export function assertValidExerciseCatalog(exercises: ExerciseDefinition[]) {
  const issues = validateExerciseCatalog(exercises);

  if (issues.length > 0) {
    const details = issues
      .map((issue) => `${issue.exerciseId} · ${issue.field}: ${issue.message}`)
      .join("\n");
    throw new Error(`El catálogo de ejercicios contiene ${issues.length} errores editoriales:\n${details}`);
  }
}

function createIssue(
  exerciseId: string,
  field: ExerciseCatalogValidationIssue["field"],
  message: string
): ExerciseCatalogValidationIssue {
  return { exerciseId, field, message };
}
