"use client";

import { formatExerciseTempo, type ExerciseTempo } from "@/lib/exercise-tempo";
import { getExerciseById } from "@/lib/exercises";
import type { ClusterConfig, SetMethod } from "@/lib/training-prescription";

type SessionSetDetail = {
  load?: number | string | null;
  percent1RM?: number | string | null;
  reps?: number | string | null;
  rir?: number | string | null;
  rpe?: number | string | null;
  setNumber?: number;
  velocity?: number | string | null;
};

export type SessionComparisonExercise = {
  block?: string | null;
  clusterConfig?: ClusterConfig | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  id?: string | null;
  intensityMethod?: string | null;
  load?: number | string | null;
  name?: string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  plannedSetReps?: Array<number | string> | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  section?: string | null;
  sessionBlock?: "activation" | "main" | "complementary" | null;
  setDetails?: SessionSetDetail[] | null;
  setMethod?: SetMethod | null;
  sets?: number | string | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
  tempo?: ExerciseTempo | null;
};

export function getSessionPlanVsActualProgress({
  performedExercises,
  plannedExercises
}: {
  performedExercises: SessionComparisonExercise[];
  plannedExercises: SessionComparisonExercise[];
}) {
  const rows = Array.from({ length: Math.max(plannedExercises.length, performedExercises.length) }, (_, index) => ({
    performed: performedExercises[index],
    planned: plannedExercises[index]
  }));
  const completedSets = rows.reduce((total, row) => total + (row.performed?.setDetails ?? []).filter(isRecordedSet).length, 0);
  const plannedSets = rows.reduce((total, row) => total + getPlannedSetCount(row.planned ?? row.performed), 0);

  return { completedSets, plannedSets, rows };
}

type BlockKey = "activation" | "main" | "complementary";

const comparisonBlocks: Array<{ key: BlockKey; label: string }> = [
  { key: "activation", label: "Activación" },
  { key: "main", label: "Bloque principal" },
  { key: "complementary", label: "Bloque complementario" }
];

function hasValue(value: unknown) {
  return value !== undefined && value !== null && `${value}`.trim() !== "";
}

function hasPositiveLoad(value: unknown) {
  if (!hasValue(value)) return false;
  const parsed = Number(`${value}`.trim().replace(/\s*kg$/i, "").replace(",", "."));
  return !Number.isFinite(parsed) || parsed > 0;
}

function formatValue(value: unknown) {
  if (!hasValue(value)) return "";
  if (typeof value === "number") return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value);
  return `${value}`.trim();
}

function getExerciseBlock(exercise?: SessionComparisonExercise): BlockKey {
  if (exercise?.sessionBlock) return exercise.sessionBlock;
  const legacy = `${exercise?.block ?? exercise?.section ?? ""}`.toLowerCase();
  if (legacy === "activation") return "activation";
  if (["auxiliary", "accessory", "complementary"].includes(legacy)) return "complementary";
  return "main";
}

function getExerciseName(exercise?: SessionComparisonExercise) {
  if (!exercise) return "Ejercicio sin especificar";
  return exercise.exerciseName || exercise.name || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
}

function isRecordedSet(detail?: SessionSetDetail) {
  if (!detail) return false;
  return [detail.load, detail.reps, detail.rir, detail.rpe, detail.percent1RM, detail.velocity].some(hasValue);
}

function readSetCount(exercise?: SessionComparisonExercise) {
  const raw = exercise?.plannedSets ?? exercise?.sets;
  const parsed = Number(`${raw ?? ""}`.trim().replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

function getPlannedSetCount(exercise?: SessionComparisonExercise) {
  const sequenceCount = exercise?.plannedSetReps?.filter(hasValue).length ?? 0;
  return Math.max(readSetCount(exercise), sequenceCount);
}

function getPlannedReps(exercise: SessionComparisonExercise | undefined, setIndex: number) {
  const sequenceValue = exercise?.plannedSetReps?.[setIndex];
  if (hasValue(sequenceValue)) return formatValue(sequenceValue);
  if (exercise?.setMethod === "cluster") {
    const cluster = exercise.clusterConfig?.repsPerMiniSet?.filter(hasValue) ?? [];
    if (cluster.length > 0) return cluster.map(formatValue).join("+");
  }
  return formatValue(exercise?.plannedReps ?? exercise?.reps);
}

function getEffortLabel(exercise: SessionComparisonExercise | undefined, detail?: SessionSetDetail) {
  const usesRpe = exercise?.intensityMethod === "rpe" || (!hasValue(exercise?.plannedRir ?? exercise?.targetRir) && hasValue(exercise?.plannedRpe ?? exercise?.targetRpe));
  const value = usesRpe
    ? detail ? detail.rpe : exercise?.plannedRpe ?? exercise?.targetRpe
    : detail ? detail.rir : exercise?.plannedRir ?? exercise?.targetRir;
  return hasValue(value) ? `${usesRpe ? "RPE" : "RIR"} ${formatValue(value)}` : "";
}

function formatPlannedSet(exercise: SessionComparisonExercise | undefined, setIndex: number) {
  if (!exercise) return "—";
  const load = exercise.plannedLoad ?? exercise.load;
  const reps = getPlannedReps(exercise, setIndex);
  const effort = getEffortLabel(exercise);
  return [hasPositiveLoad(load) ? `${formatValue(load)} kg` : "", reps ? `${reps} reps` : "", effort].filter(Boolean).join(" × ").replace(" × R", " · R") || "—";
}

function formatActualSet(exercise: SessionComparisonExercise | undefined, detail?: SessionSetDetail) {
  if (!isRecordedSet(detail)) return "—";
  const load = detail?.load;
  const reps = formatValue(detail?.reps);
  const effort = getEffortLabel(exercise, detail);
  return [hasPositiveLoad(load) ? `${formatValue(load)} kg` : "", reps ? `${reps} reps` : "", effort].filter(Boolean).join(" × ").replace(" × R", " · R") || "—";
}

function getMethodLabel(method?: SetMethod | null) {
  if (method === "ascending") return "Ascendente";
  if (method === "descending") return "Descendente";
  if (method === "cluster") return "Cluster";
  return "";
}

export function SessionPlanVsActual({
  date,
  performedExercises,
  plannedExercises,
  summary,
  type,
  showHeader = true
}: {
  date: string;
  performedExercises: SessionComparisonExercise[];
  plannedExercises: SessionComparisonExercise[];
  summary: string;
  type: string;
  showHeader?: boolean;
}) {
  const { completedSets, plannedSets, rows } = getSessionPlanVsActualProgress({ performedExercises, plannedExercises });

  if (completedSets === 0) {
    return <p className="rounded-xl border border-line bg-panel/35 p-4 text-sm text-ink/60">Sin ejecución registrada.</p>;
  }

  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-soft sm:p-5">
      {showHeader ? <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Planificado vs realizado</p>
          <h3 className="mt-1 text-lg font-bold text-ink">{summary}</h3>
          <p className="mt-1 text-sm text-ink/55">{date} · {type}</p>
        </div>
        {plannedSets > 0 ? <span className="w-fit rounded-full border border-line bg-panel/45 px-3 py-1 text-xs font-semibold text-ink/65">{completedSets}/{plannedSets} series realizadas</span> : null}
      </div> : null}

      <div className={`${showHeader ? "mt-5" : ""} grid gap-4`}>
        {comparisonBlocks.map((block) => {
          const blockRows = rows.filter((row) => getExerciseBlock(row.planned ?? row.performed) === block.key);
          if (blockRows.length === 0) return null;
          const blockCompleted = blockRows.reduce((total, row) => total + (row.performed?.setDetails ?? []).filter(isRecordedSet).length, 0);
          const blockPlanned = blockRows.reduce((total, row) => total + getPlannedSetCount(row.planned ?? row.performed), 0);
          return (
            <section className="rounded-xl border border-line bg-panel/25 p-3 sm:p-4" key={block.key}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink/55">{block.label}</h4>
                {blockPlanned > 0 ? <span className="text-xs font-semibold text-ink/50">{blockCompleted}/{blockPlanned} series realizadas</span> : null}
              </div>
              <div className="mt-3 grid gap-3">
                {blockRows.map((row, exerciseIndex) => {
                  const reference = row.planned ?? row.performed;
                  const actualSets = row.performed?.setDetails ?? [];
                  const totalSets = Math.max(getPlannedSetCount(reference), actualSets.length);
                  const exerciseCompleted = actualSets.filter(isRecordedSet).length;
                  const method = getMethodLabel(reference?.setMethod);
                  const tempo = formatExerciseTempo(reference?.tempo);
                  return (
                    <article className="min-w-0 rounded-xl border border-line bg-white p-3 sm:p-4" key={reference?.id || `${getExerciseName(reference)}-${exerciseIndex}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="break-words text-sm font-bold text-ink sm:text-base">{getExerciseName(reference)}</h5>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/50">
                            {method ? <span>{method}</span> : null}
                            {tempo ? <span>Tempo {tempo}</span> : null}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-ink/50">{exerciseCompleted}/{totalSets} series realizadas</span>
                      </div>
                      <div className="mt-3 hidden grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-line px-2 pb-2 text-[10px] font-bold uppercase tracking-wide text-ink/40 sm:grid">
                        <span>Serie</span><span>Plan</span><span>Real</span>
                      </div>
                      <div className="mt-2 grid gap-2">
                        {Array.from({ length: totalSets }, (_, setIndex) => {
                          const detail = actualSets[setIndex];
                          return (
                            <div className="rounded-lg border border-line bg-panel/20 p-3 sm:grid sm:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-3 sm:border-0 sm:bg-transparent sm:px-2 sm:py-2" key={setIndex}>
                              <p className="text-xs font-bold text-ink/55">Serie {setIndex + 1}</p>
                              <p className="mt-2 break-words text-sm text-ink/65 sm:mt-0"><span className="font-semibold text-ink sm:hidden">Plan · </span>{formatPlannedSet(reference, setIndex)}</p>
                              <p className="mt-1 break-words text-sm font-semibold text-ink sm:mt-0"><span className="text-ink sm:hidden">Real · </span>{formatActualSet(reference, detail)}</p>
                            </div>
                          );
                        })}
                      </div>
                      {reference?.setMethod === "cluster" ? <p className="mt-3 text-xs text-ink/45">La ejecución corresponde a la serie externa; los mini-bloques no se registran por separado.</p> : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
