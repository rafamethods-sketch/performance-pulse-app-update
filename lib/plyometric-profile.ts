import type {
  ExerciseDefinition,
  PlyometricDemand,
  PlyometricDirection,
  PlyometricSupport,
  PlyometricType
} from "@/lib/exercises";

export const plyometricTypeLabels: Record<PlyometricType, string> = {
  jump: "Salto",
  landing: "Aterrizaje",
  reactive: "Reactivo"
};

export const plyometricSupportLabels: Record<PlyometricSupport, string> = {
  alternating: "Alterno",
  bilateral: "Bilateral",
  unilateral: "Unilateral"
};

export const plyometricDirectionLabels: Record<PlyometricDirection, string> = {
  horizontal: "Horizontal",
  lateral: "Lateral",
  vertical: "Vertical"
};

export const plyometricDemandLabels: Record<PlyometricDemand, string> = {
  1: "Zona 1 · Baja",
  2: "Zona 2 · Media",
  3: "Zona 3 · Alta"
};

export function hasPlyometricProfile(exercise?: ExerciseDefinition | null) {
  return Boolean(
    exercise?.exerciseType === "plyometric" &&
      (exercise.plyometricType ||
        exercise.plyometricSupport ||
        exercise.plyometricDirection ||
        exercise.plyometricDemand)
  );
}
