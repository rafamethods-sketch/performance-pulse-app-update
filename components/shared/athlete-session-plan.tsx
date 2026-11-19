"use client";

import { ExternalLink } from "lucide-react";
import { formatExerciseTempo, type ExerciseTempo } from "@/lib/exercise-tempo";
import { getExerciseById } from "@/lib/exercises";
import type { ClusterConfig, SetMethod } from "@/lib/training-prescription";

export type AthleteSessionPlanExercise = {
  bandColor?: string | null;
  bandResistance?: string | null;
  block?: string | null;
  clusterConfig?: ClusterConfig | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  id?: string | null;
  intensityMethod?: string | null;
  load?: number | string | null;
  name?: string | null;
  observation?: string | null;
  percent1RM?: number | string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  plannedSetReps?: Array<number | string> | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rest?: number | string | null;
  section?: string | null;
  selectedEquipment?: string | null;
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  sessionBlock?: "activation" | "main" | "complementary" | null;
  setMethod?: SetMethod | null;
  sets?: number | string | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
  targetVelocity?: number | string | null;
  tempo?: ExerciseTempo | null;
  videoNote?: string | null;
  videoUrl?: string | null;
};

const equipmentOnlySessionVariantIds = new Set([
  "push-press-variant-dumbbells",
  "push-press-variant-kettlebells",
  "push-press-variant-landmine"
]);

type BlockKey = "activation" | "main" | "complementary";

const blocks: Array<{ key: BlockKey; label: string }> = [
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

function formatRest(value: unknown) {
  if (!hasValue(value)) return "";
  const raw = `${value}`.trim();
  const range = raw.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)$/);
  if (range) {
    const start = Number(range[1].replace(",", "."));
    const end = Number(range[2].replace(",", "."));
    if (start >= 60 && end >= 60 && start % 60 === 0 && end % 60 === 0) return `${start / 60}-${end / 60} min`;
    return `${range[1]}-${range[2]} s`;
  }
  const seconds = raw.match(/^(\d+(?:[.,]\d+)?)\s*(?:s|seg|sec)?$/i);
  if (seconds) {
    const total = Number(seconds[1].replace(",", "."));
    if (total >= 60 && total % 60 === 0) return `${total / 60} min`;
    return `${seconds[1]} s`;
  }
  return raw;
}

function getBlockKey(exercise: AthleteSessionPlanExercise): BlockKey {
  if (exercise.sessionBlock) return exercise.sessionBlock;
  const legacy = `${exercise.block ?? exercise.section ?? ""}`.toLowerCase();
  if (legacy === "activation") return "activation";
  if (["auxiliary", "accessory", "complementary"].includes(legacy)) return "complementary";
  return "main";
}

function getExerciseName(exercise: AthleteSessionPlanExercise) {
  return exercise.exerciseName || exercise.name || getExerciseById(exercise.exerciseId || "")?.name || "Ejercicio sin especificar";
}

function getIntensity(exercise: AthleteSessionPlanExercise) {
  const rir = exercise.plannedRir ?? exercise.targetRir;
  const rpe = exercise.plannedRpe ?? exercise.targetRpe;
  if (exercise.intensityMethod === "rpe" && hasValue(rpe)) return `RPE ${rpe}`;
  if (exercise.intensityMethod === "rir" && hasValue(rir)) return `RIR ${rir}`;
  if (exercise.intensityMethod === "velocity" && hasValue(exercise.targetVelocity)) return `${exercise.targetVelocity} m/s`;
  if (exercise.intensityMethod === "percent_1rm" && hasValue(exercise.percent1RM)) return `${exercise.percent1RM}% 1RM`;
  if (hasValue(rir)) return `RIR ${rir}`;
  if (hasValue(rpe)) return `RPE ${rpe}`;
  if (hasValue(exercise.targetVelocity)) return `${exercise.targetVelocity} m/s`;
  if (hasValue(exercise.percent1RM)) return `${exercise.percent1RM}% 1RM`;
  return "";
}

function getVolume(exercise: AthleteSessionPlanExercise) {
  const sets = exercise.plannedSets ?? exercise.sets;
  const reps = exercise.plannedReps ?? exercise.reps;
  const method = exercise.setMethod ?? "straight";
  const cluster = (exercise.clusterConfig?.repsPerMiniSet ?? []).filter((value) => hasValue(value));
  if (method === "cluster" && hasValue(sets) && cluster.length > 0) return `${sets} × (${cluster.join(" + ")})`;
  if (hasValue(sets) && hasValue(reps)) return `${sets} × ${reps}`;
  if (hasValue(sets)) return `${sets} series`;
  if (hasValue(reps)) return `${reps} reps`;
  return "Prescripción por definir";
}

function TempoHelp({ tempo }: { tempo: ExerciseTempo }) {
  return (
    <details className="rounded-md border border-line bg-panel/35 px-3 py-2 text-xs text-ink/65">
      <summary className="cursor-pointer font-semibold text-ink">Tempo {formatExerciseTempo(tempo)}</summary>
      <div className="mt-2 grid gap-1">
        <p>{tempo.eccentric} s excéntrica</p>
        <p>{tempo.postEccentricPause} s pausa</p>
        <p>{tempo.concentric.toUpperCase() === "X" ? "X concéntrica con intención máxima" : `${tempo.concentric} s concéntrica`}</p>
        <p>{tempo.postConcentricPause} s pausa</p>
      </div>
    </details>
  );
}

export function AthleteSessionPlan({ exercises }: { exercises: AthleteSessionPlanExercise[] }) {
  if (exercises.length === 0) {
    return <p className="rounded-md border border-line bg-panel/35 p-4 text-sm text-ink/60">Esta sesión todavía no tiene ejercicios detallados.</p>;
  }

  return (
    <div className="grid gap-4">
      {blocks.map((block) => {
        const blockExercises = exercises.filter((exercise) => getBlockKey(exercise) === block.key);
        if (blockExercises.length === 0) return null;
        return (
          <section className="rounded-xl border border-line bg-panel/30 p-3 sm:p-4" key={block.key}>
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-ink/55">
              {block.label} · {blockExercises.length} {blockExercises.length === 1 ? "ejercicio" : "ejercicios"}
            </h4>
            <div className="mt-3 grid gap-2">
              {blockExercises.map((exercise, index) => {
                const method = exercise.setMethod ?? "straight";
                const sequence = (exercise.plannedSetReps ?? []).filter((value) => hasValue(value));
                const rest = formatRest(exercise.plannedRest ?? exercise.rest);
                const load = exercise.plannedLoad ?? exercise.load;
                const intensity = getIntensity(exercise);
                const tempo = formatExerciseTempo(exercise.tempo);
                const libraryExercise = getExerciseById(exercise.exerciseId || "");
                const selectedVariant = libraryExercise?.variants?.find((variant) =>
                  variant.id === exercise.selectedVariantId || (!exercise.selectedVariantId && variant.name === exercise.selectedVariantName)
                );
                const equipmentOnlyVariant = selectedVariant && equipmentOnlySessionVariantIds.has(selectedVariant.id) ? selectedVariant : null;
                const equipment = equipmentOnlyVariant?.equipment?.[0] ?? exercise.selectedEquipment;
                const variant = equipmentOnlyVariant ? "" : exercise.selectedVariantName;
                const material = [equipment, exercise.bandColor, exercise.bandResistance].filter(hasValue).join(" · ");
                const hasDetail = method !== "straight" || sequence.length > 0 || Boolean(tempo) || Boolean(exercise.videoNote) || Boolean(exercise.videoUrl) || Boolean(variant);
                return (
                  <details className="group min-w-0 rounded-xl border border-line bg-white p-3 shadow-sm" key={exercise.id || `${getExerciseName(exercise)}-${index}`}>
                    <summary className="cursor-pointer list-none pr-1 marker:hidden">
                      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,auto)] sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink sm:text-base">{getExerciseName(exercise)}</p>
                          <p className="mt-1 text-xl font-bold tracking-tight text-ink">{getVolume(exercise)}</p>
                          {exercise.observation ? <p className="mt-1 truncate text-xs font-medium text-ink/55">Nota · {exercise.observation}</p> : null}
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-ink/65 sm:justify-end">
                          {hasPositiveLoad(load) ? <span className="rounded-md bg-panel/55 px-2.5 py-1.5 text-ink">{load} kg</span> : null}
                          {intensity ? <span className="rounded-md bg-panel/55 px-2.5 py-1.5">{intensity}</span> : null}
                          {rest ? <span className="rounded-md bg-panel/55 px-2.5 py-1.5">Descanso {rest}</span> : null}
                          {material ? <span className="rounded-md bg-panel/55 px-2.5 py-1.5">{material}</span> : null}
                          {hasDetail ? <span className="ml-auto text-lg text-ink/35 transition group-open:rotate-180 sm:ml-1">⌄</span> : null}
                          </div>
                      </div>
                    </summary>
                    {hasDetail ? (
                      <div className="mt-4 grid gap-3 border-t border-line pt-3 text-sm text-ink/65">
                        {(method === "ascending" || method === "descending") && sequence.length > 0 ? (
                          <div>
                            <p className="font-semibold text-ink">{method === "ascending" ? "Secuencia ascendente" : "Secuencia descendente"}</p>
                            <div className="mt-2 grid gap-1 sm:grid-cols-2">
                              {sequence.map((reps, setIndex) => <p key={`${exercise.id}-set-${setIndex}`}>Serie {setIndex + 1} · {reps} reps</p>)}
                            </div>
                          </div>
                        ) : null}
                        {method === "cluster" && exercise.clusterConfig?.intraClusterRestSeconds ? <p><span className="font-semibold text-ink">Pausa entre mini-bloques:</span> {formatRest(exercise.clusterConfig.intraClusterRestSeconds)}</p> : null}
                        {tempo && exercise.tempo ? <TempoHelp tempo={exercise.tempo} /> : null}
                        {variant ? <p><span className="font-semibold text-ink">Variante:</span> {variant}</p> : null}
                        {exercise.videoNote ? <p className="rounded-md bg-panel/45 px-3 py-2"><span className="font-semibold text-ink">Clave técnica:</span> {exercise.videoNote}</p> : null}
                        {exercise.videoUrl ? <a className="inline-flex w-fit items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink" href={exercise.videoUrl} rel="noreferrer" target="_blank">Ver técnica <ExternalLink size={14} /></a> : null}
                      </div>
                    ) : null}
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
