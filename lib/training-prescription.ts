export type SetMethod = "straight" | "ascending" | "descending" | "cluster";

export type ClusterConfig = {
  intraClusterRestSeconds?: number | string | null;
  repsPerMiniSet?: Array<number | string> | null;
};

type PrescriptionInput = {
  clusterConfig?: ClusterConfig | null;
  plannedReps?: number | string | null;
  plannedSetReps?: Array<number | string> | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  setMethod?: SetMethod | null;
  sets?: number | string | null;
};

export type RepetitionTotal = {
  complete: boolean;
  maximum: number | null;
  minimum: number | null;
};

function readPositiveNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseRepetitionRange(value: unknown): RepetitionTotal {
  if (typeof value === "number") {
    const parsed = readPositiveNumber(value);
    return { complete: parsed !== null, maximum: parsed, minimum: parsed };
  }
  if (typeof value !== "string") return { complete: false, maximum: null, minimum: null };
  const parts = value.split(/[-–]/).map((part) => readPositiveNumber(part));
  if (parts.length === 1 && parts[0] !== null) return { complete: true, maximum: parts[0], minimum: parts[0] };
  if (parts.length === 2 && parts[0] !== null && parts[1] !== null) {
    return { complete: true, maximum: Math.max(parts[0], parts[1]), minimum: Math.min(parts[0], parts[1]) };
  }
  return { complete: false, maximum: null, minimum: null };
}

export function getPlannedRepetitionTotal(input: PrescriptionInput): RepetitionTotal {
  const method = input.setMethod ?? "straight";
  if (method === "ascending" || method === "descending") {
    const sequence = input.plannedSetReps ?? [];
    if (sequence.length === 0) return { complete: false, maximum: null, minimum: null };
    const ranges = sequence.map(parseRepetitionRange);
    if (ranges.some((range) => !range.complete)) return { complete: false, maximum: null, minimum: null };
    return {
      complete: true,
      maximum: ranges.reduce((total, range) => total + (range.maximum ?? 0), 0),
      minimum: ranges.reduce((total, range) => total + (range.minimum ?? 0), 0)
    };
  }
  const sets = readPositiveNumber(input.plannedSets ?? input.sets);
  if (sets === null) return { complete: false, maximum: null, minimum: null };
  if (method === "cluster") {
    const miniSets = input.clusterConfig?.repsPerMiniSet ?? [];
    const reps = miniSets.map(readPositiveNumber);
    if (reps.length === 0 || reps.some((value) => value === null)) return { complete: false, maximum: null, minimum: null };
    const repetitionsPerSet = reps.reduce<number>((total, value) => total + (value ?? 0), 0);
    return { complete: true, maximum: sets * repetitionsPerSet, minimum: sets * repetitionsPerSet };
  }
  const reps = parseRepetitionRange(input.plannedReps ?? input.reps);
  if (!reps.complete) return reps;
  return {
    complete: true,
    maximum: sets * (reps.maximum ?? 0),
    minimum: sets * (reps.minimum ?? 0)
  };
}

export function formatRepetitionTotal(total: RepetitionTotal, suffix = "reps") {
  if (!total.complete || total.minimum === null || total.maximum === null) return "Datos insuficientes";
  const value = total.minimum === total.maximum ? `${total.minimum}` : `${total.minimum}–${total.maximum}`;
  return `${value} ${suffix}`;
}
