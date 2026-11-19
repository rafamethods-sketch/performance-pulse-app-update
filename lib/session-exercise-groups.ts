export type ExerciseGroupSessionBlock = "activation" | "main" | "complementary";

export type ExerciseGroupMethod = "alternating" | "superset" | "contrast" | "circuit";

export type ExerciseGroupRestSource = "default" | "custom";

export type ExerciseGroup = {
  id: string;
  method: ExerciseGroupMethod;
  restBetweenExercises?: string;
  restBetweenExercisesSource?: ExerciseGroupRestSource;
  restBetweenRounds?: string;
  restBetweenRoundsSource?: ExerciseGroupRestSource;
  sessionBlock: ExerciseGroupSessionBlock;
};

export type GroupableExercise = {
  exerciseGroupId?: string | null;
  id?: string | null;
  sessionBlock?: ExerciseGroupSessionBlock | null;
};

const groupMethodLabels: Record<ExerciseGroupMethod, string> = {
  alternating: "Alternado",
  circuit: "Circuito",
  contrast: "Contraste",
  superset: "Biserie"
};

export function getExerciseGroupMethodLabel(method: ExerciseGroupMethod, exerciseCount?: number) {
  if (method === "superset" && exerciseCount !== undefined && exerciseCount !== 2) return "Superserie";
  return groupMethodLabels[method];
}

export function isExerciseGroupCardinalityValid(method: ExerciseGroupMethod, exerciseCount: number) {
  if (method === "superset" || method === "contrast") return exerciseCount === 2;
  return exerciseCount >= 2;
}

export function getExplicitGroupsForSection(
  groups: readonly ExerciseGroup[] | null | undefined,
  sessionBlock: ExerciseGroupSessionBlock,
  exercises?: readonly GroupableExercise[]
) {
  const sectionGroups = (groups ?? []).filter((group) => group.sessionBlock === sessionBlock);
  if (!exercises) return sectionGroups;
  return [...sectionGroups].sort((left, right) => {
    const leftIndex = exercises.findIndex((exercise) => exercise.exerciseGroupId === left.id);
    const rightIndex = exercises.findIndex((exercise) => exercise.exerciseGroupId === right.id);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
}

export function getGroupLabel(groups: readonly ExerciseGroup[] | null | undefined, groupId: string, sessionBlock: ExerciseGroupSessionBlock, exercises?: readonly GroupableExercise[]) {
  const index = getExplicitGroupsForSection(groups, sessionBlock, exercises).findIndex((group) => group.id === groupId);
  if (index < 0) return "";
  let value = index + 1;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function getExercisesForGroup<T extends GroupableExercise>(exercises: readonly T[], groupId: string) {
  return exercises.filter((exercise) => exercise.exerciseGroupId === groupId);
}

export function getExerciseGroupPosition<T extends GroupableExercise>(exercises: readonly T[], exercise: T) {
  if (!exercise.exerciseGroupId) return null;
  const members = getExercisesForGroup(exercises, exercise.exerciseGroupId);
  const index = members.findIndex((member) => member === exercise || (exercise.id && member.id === exercise.id));
  return index < 0 ? null : index + 1;
}

export function groupExercises<T extends GroupableExercise>(
  exercises: readonly T[],
  groups: readonly ExerciseGroup[],
  group: ExerciseGroup,
  exerciseIds: readonly string[]
) {
  const selectedIds = new Set(exerciseIds);
  const selected = exercises.filter((exercise) => exercise.id && selectedIds.has(exercise.id));
  if (!isExerciseGroupCardinalityValid(group.method, selected.length) || selected.some((exercise) => exercise.sessionBlock !== group.sessionBlock || exercise.exerciseGroupId)) {
    return { exercises: [...exercises], groups: [...groups] };
  }
  const firstSelectedIndex = exercises.findIndex((exercise) => exercise.id && selectedIds.has(exercise.id));
  const selectedExercises = exercises
    .filter((exercise) => exercise.id && selectedIds.has(exercise.id))
    .map((exercise) => ({ ...exercise, exerciseGroupId: group.id }));
  const remainingExercises = exercises.filter((exercise) => !exercise.id || !selectedIds.has(exercise.id));
  const insertionIndex = exercises.slice(0, firstSelectedIndex).filter((exercise) => !exercise.id || !selectedIds.has(exercise.id)).length;
  const nextExercises = [
    ...remainingExercises.slice(0, insertionIndex),
    ...selectedExercises,
    ...remainingExercises.slice(insertionIndex)
  ];
  return cleanupOrphanGroups(nextExercises, [...groups, group]);
}

export function ungroupExercises<T extends GroupableExercise>(exercises: readonly T[], groups: readonly ExerciseGroup[], groupId: string) {
  return {
    exercises: exercises.map((exercise) => exercise.exerciseGroupId === groupId ? { ...exercise, exerciseGroupId: undefined } : exercise),
    groups: groups.filter((group) => group.id !== groupId)
  };
}

export function cleanupOrphanGroups<T extends GroupableExercise>(exercises: readonly T[], groups: readonly ExerciseGroup[]) {
  const validGroups = groups.filter((group) => getExercisesForGroup(exercises, group.id).length >= 2);
  const validIds = new Set(validGroups.map((group) => group.id));
  return {
    exercises: exercises.map((exercise) => exercise.exerciseGroupId && !validIds.has(exercise.exerciseGroupId)
      ? { ...exercise, exerciseGroupId: undefined }
      : exercise
    ),
    groups: validGroups
  };
}

export function validateExerciseGroups<T extends GroupableExercise>(exercises: readonly T[], groups: readonly ExerciseGroup[]) {
  const groupIds = new Set(groups.map((group) => group.id));
  return groups.every((group) => isExerciseGroupCardinalityValid(group.method, getExercisesForGroup(exercises, group.id).length)) && exercises.every((exercise) => {
    if (!exercise.exerciseGroupId) return true;
    const group = groups.find((candidate) => candidate.id === exercise.exerciseGroupId);
    return groupIds.has(exercise.exerciseGroupId) && group?.sessionBlock === exercise.sessionBlock;
  });
}
