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
  type ExerciseType,
  type OlympicFamily,
  type OlympicStage,
  type PlyometricDemand,
  type PlyometricDirection,
  type PlyometricSupport
} from "@/lib/exercises";
import {
  exerciseLibraryFamilyLabels,
  exerciseLibraryFamilyOrder,
  getExerciseLibraryCompactAttribute,
  getExerciseLibraryEquipmentOptions,
  getExerciseLibraryFamilyLabel,
  getExerciseLibraryGroups,
  getNormalizedEquipmentLabel,
  getStrengthLibraryRegion,
  exerciseMatchesNormalizedEquipment,
  resolveExerciseLibraryFamily,
  resolveExerciseLibraryGroup,
  scoreExerciseLibrarySearch,
  strengthLibraryRegionLabels,
  type ExerciseLibraryFamilyResolution,
  type StrengthLibraryRegion
} from "@/lib/exercise-library-navigation";
import {
  plyometricDemandLabels,
  plyometricDirectionLabels,
  plyometricSupportLabels
} from "@/lib/plyometric-profile";
import {
  getOlympicCompactSummary,
  olympicFamilyLabels,
  olympicFamilyOrder,
  olympicStageLabels,
  olympicStageOrder
} from "@/lib/olympic-progression";

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
  const [activeGroup, setActiveGroup] = useState<"all" | string>("all");
  const [strengthRegion, setStrengthRegion] = useState<StrengthLibraryRegion>("lower");
  const [search, setSearch] = useState("");
  const [bodyRegionFilter, setBodyRegionFilter] = useState<BodyRegion | "all">("all");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseType | "all">("all");
  const [patternFilter, setPatternFilter] = useState<ExercisePattern | "all">("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [plyometricSupportFilter, setPlyometricSupportFilter] = useState<PlyometricSupport | "all">("all");
  const [plyometricDirectionFilter, setPlyometricDirectionFilter] = useState<PlyometricDirection | "all">("all");
  const [plyometricDemandFilter, setPlyometricDemandFilter] = useState<PlyometricDemand | "all">("all");
  const [olympicFamilyFilter, setOlympicFamilyFilter] = useState<OlympicFamily | "all">("all");
  const [olympicStageFilter, setOlympicStageFilter] = useState<OlympicStage | "all">("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [visibleResultCount, setVisibleResultCount] = useState(30);

  const equipmentOptions = useMemo(
    () => getExerciseLibraryEquipmentOptions(exerciseLibrary),
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
    equipmentFilter !== "all" ||
    plyometricSupportFilter !== "all" ||
    plyometricDirectionFilter !== "all" ||
    plyometricDemandFilter !== "all";

  const filteredExercises = useMemo(() => exerciseLibrary.map((exercise, catalogIndex) => ({
    catalogIndex,
    exercise,
    searchScore: scoreExerciseLibrarySearch(exercise, search)
  })).filter(({ exercise, searchScore }) => {
    const family = resolveExerciseLibraryFamily(exercise);
    const matchesFamily = activeFamily === "all" || family === activeFamily;
    const matchesStrengthRegion = activeFamily !== "strength" || getStrengthLibraryRegion(exercise) === strengthRegion;
    const matchesGroup = activeFamily === "all" || activeGroup === "all" || resolveExerciseLibraryGroup(exercise) === activeGroup;
    const matchesBodyRegion = bodyRegionFilter === "all" || exercise.bodyRegion === bodyRegionFilter;
    const matchesExerciseType = exerciseTypeFilter === "all" || exercise.exerciseType === exerciseTypeFilter;
    const matchesPattern = patternFilter === "all" || exercise.pattern === patternFilter;
    const matchesEquipment = exerciseMatchesNormalizedEquipment(exercise, equipmentFilter);
    const matchesPlyometricSupport = plyometricSupportFilter === "all" || exercise.plyometricSupport === plyometricSupportFilter;
    const matchesPlyometricDirection = plyometricDirectionFilter === "all" || exercise.plyometricDirection === plyometricDirectionFilter;
    const matchesPlyometricDemand = plyometricDemandFilter === "all" || exercise.plyometricDemand === plyometricDemandFilter;
    const matchesOlympicFamily = olympicFamilyFilter === "all" || exercise.olympicFamily === olympicFamilyFilter;
    const matchesOlympicStage = olympicStageFilter === "all" || exercise.olympicStage === olympicStageFilter;

    return matchesFamily &&
      matchesStrengthRegion &&
      matchesGroup &&
      matchesBodyRegion &&
      matchesExerciseType &&
      matchesPattern &&
      matchesEquipment &&
      matchesPlyometricSupport &&
      matchesPlyometricDirection &&
      matchesPlyometricDemand &&
      matchesOlympicFamily &&
      matchesOlympicStage &&
      searchScore >= 0;
  }).sort((a, b) => search.trim()
    ? b.searchScore - a.searchScore || a.catalogIndex - b.catalogIndex
    : a.catalogIndex - b.catalogIndex
  ).map(({ exercise }) => exercise), [
    activeFamily,
    activeGroup,
    bodyRegionFilter,
    equipmentFilter,
    exerciseTypeFilter,
    patternFilter,
    olympicFamilyFilter,
    olympicStageFilter,
    plyometricDemandFilter,
    plyometricDirectionFilter,
    plyometricSupportFilter,
    search,
    strengthRegion
  ]);

  const selectedExercise = filteredExercises.find((exercise) => exercise.id === selectedExerciseId) ?? filteredExercises[0];
  const showFamilyOverview = activeFamily === "all" && !search.trim() && !hasAdvancedFilters;
  const displayedExercises = filteredExercises.slice(0, visibleResultCount);

  useEffect(() => {
    setVisibleResultCount(30);
  }, [activeFamily, activeGroup, bodyRegionFilter, equipmentFilter, exerciseTypeFilter, olympicFamilyFilter, olympicStageFilter, patternFilter, plyometricDemandFilter, plyometricDirectionFilter, plyometricSupportFilter, search, strengthRegion]);

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

  const clearAdvancedFilters = () => {
    setBodyRegionFilter("all");
    setExerciseTypeFilter("all");
    setPatternFilter("all");
    setEquipmentFilter("all");
    setPlyometricSupportFilter("all");
    setPlyometricDirectionFilter("all");
    setPlyometricDemandFilter("all");
    setOlympicFamilyFilter("all");
    setOlympicStageFilter("all");
  };

  const selectFamily = (family: ActiveExerciseLibraryFamily) => {
    setActiveFamily(family);
    setActiveGroup("all");
    setStrengthRegion("lower");
    clearAdvancedFilters();
    setShowMobileDetail(false);
  };

  const activeGroups = activeFamily !== "all" && activeFamily !== "unclassified"
    ? getExerciseLibraryGroups(activeFamily, activeFamily === "strength" ? strengthRegion : undefined)
    : [];

  const getGroupCount = (groupKey: string) => exerciseLibrary.filter((exercise) =>
    resolveExerciseLibraryFamily(exercise) === activeFamily &&
    (activeFamily !== "strength" || getStrengthLibraryRegion(exercise) === strengthRegion) &&
    resolveExerciseLibraryGroup(exercise) === groupKey
  ).length;
  const activeGroupTotal = activeGroups.reduce((total, group) => total + getGroupCount(group.key), 0);
  const getVisibleGroupLabel = (group: (typeof activeGroups)[number]) => {
    if (activeFamily !== "strength" || !group.key.endsWith("_accessory")) return group.label;
    return strengthRegion === "lower" ? "Accesorios inferiores" : "Accesorios superiores";
  };

  const renderExerciseButton = (exercise: ExerciseDefinition) => (
    <button
      className={`w-full rounded-md border px-3 py-2.5 text-left transition ${selectedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
      key={exercise.id}
      onClick={() => selectExercise(exercise)}
      type="button"
    >
      <span className="block text-sm font-semibold">{exercise.name}</span>
      <span className="mt-1 block text-xs opacity-65">
        {activeFamily === "power_olympic" && activeGroup === "olympic" && getOlympicCompactSummary(exercise)
          ? getOlympicCompactSummary(exercise)
          : activeFamily === "all"
          ? `${getExerciseLibraryFamilyLabel(exercise)} · ${getExerciseLibraryCompactAttribute(exercise)}`
          : `${getExerciseLibraryCompactAttribute(exercise)} · ${getNormalizedEquipmentLabel(exercise.equipment[0] ?? "Sin material")}`}
      </span>
    </button>
  );

  const renderPlyometricResults = () => (
    <div className="grid gap-4">
      {getExerciseLibraryGroups("plyometric").map((group) => {
        const exercises = displayedExercises.filter((exercise) => resolveExerciseLibraryGroup(exercise) === group.key);
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
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition ${selectedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
                  key={exercise.id}
                  onClick={() => selectExercise(exercise)}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{exercise.name}</span>
                  <span className="mt-1 block text-xs opacity-65">{profile}</span>
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

        {!showFamilyOverview ? <details className="mt-4 rounded-md border border-line bg-panel/30 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink/70">Filtros avanzados{hasAdvancedFilters ? " · activos" : ""}</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {activeFamily === "all" ? <FilterSelect label="Región corporal" onChange={(value) => setBodyRegionFilter(value as BodyRegion | "all")} value={bodyRegionFilter}>
              <option value="all">Todas</option>
              {bodyRegions.map((region) => <option key={region} value={region}>{bodyRegionLabels[region]}</option>)}
            </FilterSelect> : null}
            {(activeFamily === "all" || activeFamily === "strength") ? <FilterSelect label="Tipo actual" onChange={(value) => setExerciseTypeFilter(value as ExerciseType | "all")} value={exerciseTypeFilter}>
              <option value="all">Todos</option>
              {exerciseTypeOptions.map((type) => <option key={type} value={type}>{exerciseTypeLabels[type]}</option>)}
            </FilterSelect> : null}
            {(activeFamily === "all" || activeFamily === "power_olympic") ? <FilterSelect label="Patrón" onChange={(value) => setPatternFilter(value as ExercisePattern | "all")} value={patternFilter}>
              <option value="all">Todos</option>
              {exercisePatterns.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}
            </FilterSelect> : null}
            {activeFamily === "plyometric" ? <>
              <FilterSelect label="Apoyo" onChange={(value) => setPlyometricSupportFilter(value as PlyometricSupport | "all")} value={plyometricSupportFilter}>
                <option value="all">Todos</option>
                {Object.entries(plyometricSupportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </FilterSelect>
              <FilterSelect label="Dirección" onChange={(value) => setPlyometricDirectionFilter(value as PlyometricDirection | "all")} value={plyometricDirectionFilter}>
                <option value="all">Todas</option>
                {Object.entries(plyometricDirectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </FilterSelect>
              <FilterSelect label="Demanda" onChange={(value) => setPlyometricDemandFilter(value === "all" ? "all" : Number(value) as PlyometricDemand)} value={String(plyometricDemandFilter)}>
                <option value="all">Todas</option>
                {Object.entries(plyometricDemandLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </FilterSelect>
            </> : null}
            <FilterSelect label="Material" onChange={setEquipmentFilter} value={equipmentFilter}>
              <option value="all">Todo el material</option>
              {equipmentOptions.map((equipment) => <option key={equipment} value={equipment}>{equipment}</option>)}
            </FilterSelect>
          </div>
          {hasAdvancedFilters ? <button className="mt-4 text-sm font-semibold text-moss hover:underline" onClick={clearAdvancedFilters} type="button">Limpiar filtros</button> : null}
        </details> : null}

        {activeFamily !== "all" && activeFamily !== "unclassified" ? (
          <div className="mt-4 rounded-md border border-line bg-panel/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              {exerciseLibraryFamilyLabels[activeFamily]}
            </p>
            {activeFamily === "strength" ? (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink/45">Área</span>
                {(["lower", "upper"] as const).map((region) => (
                  <button
                    className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${strengthRegion === region ? "bg-ink text-white" : "border border-line bg-white text-ink/65"}`}
                    key={region}
                    onClick={() => {
                      setStrengthRegion(region);
                      setActiveGroup("all");
                      setShowMobileDetail(false);
                    }}
                    type="button"
                  >
                    {strengthLibraryRegionLabels[region]}
                  </button>
                ))}
                <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-line" />
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink/45">Patrón</span>
                <button
                  className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeGroup === "all" ? "bg-moss text-white" : "border border-line bg-white text-ink/65"}`}
                  onClick={() => {
                    setActiveGroup("all");
                    setShowMobileDetail(false);
                  }}
                  type="button"
                >
                  Todos · {activeGroupTotal}
                </button>
                {activeGroups.map((group) => (
                  <button
                    className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeGroup === group.key ? "bg-moss text-white" : "border border-line bg-white text-ink/65"}`}
                    key={group.key}
                    onClick={() => {
                      setActiveGroup(group.key);
                      setShowMobileDetail(false);
                    }}
                    type="button"
                  >
                    {getVisibleGroupLabel(group)} · {getGroupCount(group.key)}
                  </button>
                ))}
              </div>
            ) : <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeGroup === "all" ? "bg-moss text-white" : "border border-line bg-white text-ink/65"}`}
                onClick={() => {
                  setActiveGroup("all");
                  setOlympicFamilyFilter("all");
                  setOlympicStageFilter("all");
                  setShowMobileDetail(false);
                }}
                type="button"
              >
                Todos · {activeGroupTotal}
              </button>
              {activeGroups.map((group) => (
                <button
                  className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${activeGroup === group.key ? "bg-moss text-white" : "border border-line bg-white text-ink/65"}`}
                  key={group.key}
                  onClick={() => {
                    setActiveGroup(group.key);
                    setOlympicFamilyFilter("all");
                    setOlympicStageFilter("all");
                    setShowMobileDetail(false);
                  }}
                  type="button"
                >
                  {getVisibleGroupLabel(group)} · {getGroupCount(group.key)}
                </button>
              ))}
            </div>}
            {activeFamily === "power_olympic" && activeGroup === "olympic" ? (
              <div className="mt-3 grid gap-2 border-t border-line pt-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap">
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink/45">Familia</span>
                  <OlympicFilterButton active={olympicFamilyFilter === "all"} label="Todos" onClick={() => setOlympicFamilyFilter("all")} />
                  {olympicFamilyOrder.map((family) => (
                    <OlympicFilterButton active={olympicFamilyFilter === family} key={family} label={olympicFamilyLabels[family]} onClick={() => setOlympicFamilyFilter(family)} />
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap">
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink/45">Etapa</span>
                  <OlympicFilterButton active={olympicStageFilter === "all"} label="Todos" onClick={() => setOlympicStageFilter("all")} />
                  {olympicStageOrder.map((stage) => (
                    <OlympicFilterButton active={olympicStageFilter === stage} key={stage} label={olympicStageLabels[stage]} onClick={() => setOlympicStageFilter(stage)} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {showFamilyOverview ? (
        <section className="coach-surface rounded-md p-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Explorar por familia</h3>
            <p className="mt-1 text-sm text-ink/50">Elige una familia para ver su navegación y sus ejercicios.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFamilies.map((family) => (
              <button className="rounded-md border border-line bg-panel/25 p-4 text-left transition hover:border-moss/40 hover:bg-mint/35" key={family} onClick={() => selectFamily(family)} type="button">
                <span className="block text-sm font-semibold text-ink">{family === "unclassified" ? "Otros" : exerciseLibraryFamilyLabels[family]}</span>
                <span className="mt-1 block text-xs text-ink/45">{familyCounts.get(family) ?? 0} ejercicios</span>
                <span className="mt-4 block text-xs font-semibold text-moss">Ver ejercicios →</span>
              </button>
            ))}
          </div>
        </section>
      ) : <div className="grid items-start gap-5 lg:h-[clamp(38rem,calc(100dvh-10rem),54rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className={`${showMobileDetail ? "hidden lg:flex" : "flex"} coach-surface min-h-0 flex-col rounded-md p-4 lg:h-full`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">Ejercicios</h3>
              <p className="mt-1 text-sm text-ink/50">{filteredExercises.length} resultados</p>
            </div>
            <span className="rounded-md border border-line bg-panel/50 px-2 py-1 text-xs font-semibold text-ink/55">{filteredExercises.length}</span>
          </div>

          {filteredExercises.length > 0 ? (
            <div className="mt-4 min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
              {activeFamily === "plyometric" ? renderPlyometricResults() : <div className="grid gap-2">{displayedExercises.map(renderExerciseButton)}</div>}
              {displayedExercises.length < filteredExercises.length ? (
                <button className="mt-4 w-full rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-moss hover:border-moss/40" onClick={() => setVisibleResultCount((current) => current + 30)} type="button">
                  Mostrar más · {filteredExercises.length - displayedExercises.length} pendientes
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-line bg-panel/25 p-6 text-center">
              <p className="text-sm font-semibold text-ink/50">No hay ejercicios que coincidan con la búsqueda y los filtros.</p>
              {hasAdvancedFilters ? <button className="mt-3 text-sm font-semibold text-moss hover:underline" onClick={clearAdvancedFilters} type="button">Limpiar filtros</button> : null}
            </div>
          )}
        </section>

        <div className={`${showMobileDetail ? "block" : "hidden lg:block"} lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[&>section]:min-h-full`}>
          <button className="mb-3 inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 lg:hidden" onClick={() => setShowMobileDetail(false)} type="button">
            ← Volver a resultados
          </button>
          {renderDetail(selectedExercise)}
        </div>
      </div>}
    </div>
  );
}

function OlympicFilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-steel text-white" : "border border-line bg-white text-ink/65"}`} onClick={onClick} type="button">
      {label}
    </button>
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
