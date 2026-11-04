"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bodyRegionLabels,
  bodyRegions,
  exerciseLibrary,
  exercisePatterns,
  type BodyRegion,
  type ExerciseDefinition,
  type ExercisePattern,
  type ExerciseType
} from "@/lib/exercises";
import {
  exerciseLibraryFamilyLabels,
  exerciseLibraryFamilyOrder,
  getExerciseLibraryCompactAttribute,
  getExerciseLibraryFamilyLabel,
  matchesExerciseLibrarySearch,
  resolveExerciseLibraryFamily,
  type ExerciseLibraryFamilyResolution
} from "@/lib/exercise-library-navigation";
import {
  plyometricDemandLabels,
  plyometricDirectionLabels,
  plyometricSupportLabels
} from "@/lib/plyometric-profile";

type ActiveExerciseLibraryFamily = "all" | ExerciseLibraryFamilyResolution;

const exerciseTypeLabels: Record<ExerciseType, string> = {
  accessory: "Accesorio",
  conditioning: "Acondicionamiento",
  control: "Control",
  core: "Core",
  hypertrophy: "Hipertrofia",
  mobility: "Movilidad",
  plyometric: "Pliometría",
  power: "Potencia",
  strength: "Fuerza"
};

const plyometricGroups = [
  { key: "jump", label: "Saltos" },
  { key: "reactive", label: "Reactivos" },
  { key: "landing", label: "Aterrizajes" },
  { key: "other", label: "Otros pliométricos" }
] as const;

export function ExerciseLibraryView({
  clientName,
  onOpenResistance,
  renderDetail
}: {
  clientName?: string;
  onOpenResistance: () => void;
  renderDetail: (exercise?: ExerciseDefinition) => ReactNode;
}) {
  const [activeFamily, setActiveFamily] = useState<ActiveExerciseLibraryFamily>("all");
  const [search, setSearch] = useState("");
  const [bodyRegionFilter, setBodyRegionFilter] = useState<BodyRegion | "all">("all");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseType | "all">("all");
  const [patternFilter, setPatternFilter] = useState<ExercisePattern | "all">("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const equipmentOptions = useMemo(
    () => Array.from(new Set(exerciseLibrary.flatMap((exercise) => exercise.equipment))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const exerciseTypeOptions = useMemo(
    () => Array.from(new Set(exerciseLibrary.map((exercise) => exercise.exerciseType))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const familyCounts = useMemo(() => {
    const counts = new Map<ExerciseLibraryFamilyResolution, number>();
    exerciseLibrary.forEach((exercise) => {
      const family = resolveExerciseLibraryFamily(exercise);
      counts.set(family, (counts.get(family) ?? 0) + 1);
    });
    return counts;
  }, []);
  const hasUnclassifiedExercises = (familyCounts.get("unclassified") ?? 0) > 0;
  const visibleFamilies: ExerciseLibraryFamilyResolution[] = hasUnclassifiedExercises
    ? [...exerciseLibraryFamilyOrder, "unclassified"]
    : [...exerciseLibraryFamilyOrder];
  const hasAdvancedFilters = bodyRegionFilter !== "all" ||
    exerciseTypeFilter !== "all" ||
    patternFilter !== "all" ||
    equipmentFilter !== "all";

  const filteredExercises = useMemo(() => exerciseLibrary.filter((exercise) => {
    const family = resolveExerciseLibraryFamily(exercise);
    const matchesFamily = activeFamily === "all" || family === activeFamily;
    const matchesBodyRegion = bodyRegionFilter === "all" || exercise.bodyRegion === bodyRegionFilter;
    const matchesExerciseType = exerciseTypeFilter === "all" || exercise.exerciseType === exerciseTypeFilter;
    const matchesPattern = patternFilter === "all" || exercise.pattern === patternFilter;
    const matchesEquipment = equipmentFilter === "all" || exercise.equipment.includes(equipmentFilter);

    return matchesFamily &&
      matchesBodyRegion &&
      matchesExerciseType &&
      matchesPattern &&
      matchesEquipment &&
      matchesExerciseLibrarySearch(exercise, search);
  }), [activeFamily, bodyRegionFilter, equipmentFilter, exerciseTypeFilter, patternFilter, search]);

  const selectedExercise = filteredExercises.find((exercise) => exercise.id === selectedExerciseId) ?? filteredExercises[0];
  const showFamilyOverview = activeFamily === "all" && !search.trim() && !hasAdvancedFilters;

  useEffect(() => {
    if (!selectedExercise) {
      if (selectedExerciseId) setSelectedExerciseId("");
      return;
    }
    if (selectedExercise.id !== selectedExerciseId) setSelectedExerciseId(selectedExercise.id);
  }, [selectedExercise, selectedExerciseId]);

  const selectExercise = (exercise: ExerciseDefinition) => {
    setSelectedExerciseId(exercise.id);
    setShowMobileDetail(true);
  };

  const selectFamily = (family: ActiveExerciseLibraryFamily) => {
    setActiveFamily(family);
    setShowMobileDetail(false);
  };

  const renderExerciseButton = (exercise: ExerciseDefinition) => (
    <button
      className={`w-full rounded-md border p-3 text-left transition ${selectedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
      key={exercise.id}
      onClick={() => selectExercise(exercise)}
      type="button"
    >
      <span className="block text-sm font-semibold">{exercise.name}</span>
      <span className="mt-1 block text-xs opacity-65">
        {getExerciseLibraryFamilyLabel(exercise)} · {getExerciseLibraryCompactAttribute(exercise)}
      </span>
    </button>
  );

  const renderPlyometricResults = () => (
    <div className="grid gap-4">
      {plyometricGroups.map((group) => {
        const exercises = filteredExercises.filter((exercise) => {
          const hasCompleteLowerBodyProfile = exercise.bodyRegion === "lower_body" &&
            exercise.plyometricType &&
            exercise.plyometricSupport &&
            exercise.plyometricDirection &&
            exercise.plyometricDemand;
          if (group.key === "other") return !hasCompleteLowerBodyProfile;
          return hasCompleteLowerBodyProfile && exercise.plyometricType === group.key;
        });
        if (exercises.length === 0) return null;

        return (
          <div className="grid gap-2" key={group.key}>
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{group.label}</p>
              <span className="text-xs font-semibold text-ink/40">{exercises.length}</span>
            </div>
            {exercises.map((exercise) => {
              const profile = exercise.plyometricSupport && exercise.plyometricDirection && exercise.plyometricDemand
                ? `${plyometricSupportLabels[exercise.plyometricSupport]} · ${plyometricDirectionLabels[exercise.plyometricDirection]} · ${plyometricDemandLabels[exercise.plyometricDemand].split(" · ")[0]}`
                : bodyRegionLabels[exercise.bodyRegion];

              return (
                <button
                  className={`w-full rounded-md border p-3 text-left transition ${selectedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
                  key={exercise.id}
                  onClick={() => selectExercise(exercise)}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{exercise.name}</span>
                  <span className="mt-1 block text-xs opacity-65">Pliometría · {profile}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mt-6 space-y-5">
      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Biblioteca</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">Biblioteca de ejercicios</h2>
            <p className="mt-1 text-sm text-ink/55">Busca primero por nombre o entra en una familia para acotar el catálogo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {clientName ? <span className="rounded-md bg-mint px-3 py-2 text-xs font-semibold text-moss">{clientName}</span> : null}
            <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/65 hover:border-moss/40" onClick={onOpenResistance} type="button">
              Métodos de resistencia
            </button>
          </div>
        </div>

        <label className="mt-5 block space-y-2 text-sm font-semibold text-ink/75">
          Buscar ejercicio
          <input
            className="h-12 w-full rounded-md border border-line bg-panel/35 px-4 text-ink outline-none focus:border-moss"
            onChange={(event) => {
              setSearch(event.target.value);
              setShowMobileDetail(false);
            }}
            placeholder="Nombre, patrón, bloque o material..."
            type="search"
            value={search}
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeFamily === "all" ? "bg-ink text-white" : "border border-line bg-white text-ink/65"}`}
            onClick={() => selectFamily("all")}
            type="button"
          >
            Todos · {exerciseLibrary.length}
          </button>
          {visibleFamilies.map((family) => (
            <button
              className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeFamily === family ? "bg-ink text-white" : "border border-line bg-white text-ink/65"}`}
              key={family}
              onClick={() => selectFamily(family)}
              type="button"
            >
              {family === "unclassified" ? "Otros" : exerciseLibraryFamilyLabels[family]} · {familyCounts.get(family) ?? 0}
            </button>
          ))}
        </div>

        <details className="mt-4 rounded-md border border-line bg-panel/30 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink/70">Filtros avanzados{hasAdvancedFilters ? " · activos" : ""}</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect label="Región corporal" onChange={(value) => setBodyRegionFilter(value as BodyRegion | "all")} value={bodyRegionFilter}>
              <option value="all">Todas</option>
              {bodyRegions.map((region) => <option key={region} value={region}>{bodyRegionLabels[region]}</option>)}
            </FilterSelect>
            <FilterSelect label="Tipo actual" onChange={(value) => setExerciseTypeFilter(value as ExerciseType | "all")} value={exerciseTypeFilter}>
              <option value="all">Todos</option>
              {exerciseTypeOptions.map((type) => <option key={type} value={type}>{exerciseTypeLabels[type]}</option>)}
            </FilterSelect>
            <FilterSelect label="Patrón" onChange={(value) => setPatternFilter(value as ExercisePattern | "all")} value={patternFilter}>
              <option value="all">Todos</option>
              {exercisePatterns.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}
            </FilterSelect>
            <FilterSelect label="Material" onChange={setEquipmentFilter} value={equipmentFilter}>
              <option value="all">Todo el material</option>
              {equipmentOptions.map((equipment) => <option key={equipment} value={equipment}>{equipment}</option>)}
            </FilterSelect>
          </div>
        </details>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className={`${showMobileDetail ? "hidden lg:block" : "block"} coach-surface rounded-md p-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">{showFamilyOverview ? "Explorar por familia" : "Ejercicios"}</h3>
              <p className="mt-1 text-sm text-ink/50">
                {showFamilyOverview ? "Una muestra estable de cada familia." : `${filteredExercises.length} resultados`}
              </p>
            </div>
            {!showFamilyOverview ? <span className="rounded-md border border-line bg-panel/50 px-2 py-1 text-xs font-semibold text-ink/55">{filteredExercises.length}</span> : null}
          </div>

          {showFamilyOverview ? (
            <div className="mt-4 grid gap-4">
              {visibleFamilies.map((family) => {
                const examples = exerciseLibrary.filter((exercise) => resolveExerciseLibraryFamily(exercise) === family).slice(0, 5);
                return (
                  <article className="rounded-md border border-line bg-panel/25 p-3" key={family}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">{family === "unclassified" ? "Otros" : exerciseLibraryFamilyLabels[family]}</h4>
                        <p className="mt-0.5 text-xs text-ink/45">{familyCounts.get(family) ?? 0} ejercicios</p>
                      </div>
                      <button className="text-xs font-semibold text-moss hover:underline" onClick={() => selectFamily(family)} type="button">Ver todos</button>
                    </div>
                    <div className="mt-3 grid gap-2">{examples.map(renderExerciseButton)}</div>
                  </article>
                );
              })}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="mt-4 max-h-[680px] overflow-y-auto pr-1">
              {activeFamily === "plyometric" ? renderPlyometricResults() : <div className="grid gap-2">{filteredExercises.map(renderExerciseButton)}</div>}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/25 p-6 text-center text-sm font-semibold text-ink/50">No hay ejercicios que coincidan con la búsqueda y los filtros.</p>
          )}
        </section>

        <div className={showMobileDetail ? "block" : "hidden lg:block"}>
          <button className="mb-3 inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 lg:hidden" onClick={() => setShowMobileDetail(false)} type="button">
            ← Volver a resultados
          </button>
          {renderDetail(selectedExercise)}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  children,
  label,
  onChange,
  value
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-ink/70">
      {label}
      <select className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}
