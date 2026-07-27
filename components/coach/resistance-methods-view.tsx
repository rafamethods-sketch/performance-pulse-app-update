"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  resistanceMethods,
  type ResistanceMethod,
  type ResistanceMethodStatus
} from "@/lib/resistance-methods";
import {
  getSportZoneProfile,
  getSportZoneProfiles,
  type ResistanceSport,
  type ResistanceZone
} from "@/lib/resistance-zones";

type ExerciseLibraryMode = "strength" | "resistance";
type ResistanceMethodFilter = "all" | "continuous" | "fractional" | "taper" | "complete" | "pending";

type ResistanceMethodsViewProps = {
  libraryMode: ExerciseLibraryMode;
  setLibraryMode: (mode: ExerciseLibraryMode) => void;
};

const resistanceMethodFilters: Array<{ label: string; value: ResistanceMethodFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Continuos", value: "continuous" },
  { label: "Fraccionados", value: "fractional" },
  { label: "Puesta a punto", value: "taper" },
  { label: "Completos", value: "complete" },
  { label: "Pendientes", value: "pending" }
];

const sportZoneProfiles = getSportZoneProfiles();

const zoneMetricLabels: Array<{ key: keyof NonNullable<ResistanceZone["metrics"]>; label: string }> = [
  { key: "masPercent", label: "MAS" },
  { key: "mapPercent", label: "MAP" },
  { key: "vo2maxPercent", label: "VO2max" },
  { key: "hrMaxPercent", label: "HRmax" },
  { key: "hrrPercent", label: "HRR" },
  { key: "mlssPowerPercent", label: "W-MLSS" },
  { key: "rpe", label: "RPE" }
];

function getResistanceStatusClass(status: ResistanceMethodStatus) {
  return status === "complete"
    ? "border border-line bg-mint text-moss"
    : "border border-line bg-panel/70 text-ink/55";
}

function getResistanceStatusLabel(status: ResistanceMethodStatus) {
  return status === "complete" ? "Completo" : "Pendiente";
}

function methodMatchesResistanceFilter(method: ResistanceMethod, filter: ResistanceMethodFilter) {
  if (filter === "continuous") return method.family === "Métodos continuos";
  if (filter === "fractional") return method.family === "Métodos fraccionados";
  if (filter === "taper") return method.family === "Métodos puesta a punto";
  if (filter === "complete") return method.status === "complete";
  if (filter === "pending") return method.status === "pending";
  return true;
}

function methodMatchesResistanceSearch(method: ResistanceMethod, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  return [
    method.method,
    method.name,
    method.intensity,
    method.examples.join(" "),
    method.trainingEffects.join(" ")
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function getResistanceMeta(method: ResistanceMethod) {
  return [method.family, method.group, method.subgroup].filter(Boolean).join(" · ");
}

function ResistanceInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel/35 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ResistanceDetailSection({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-4 rounded-md border border-line bg-panel/35 p-4">
      <p className="text-xs font-semibold uppercase text-ink/45">{title}</p>
      <ul className="mt-2 grid gap-2 text-sm text-ink/70">
        {items.map((item) => (
          <li className="rounded-md bg-white px-3 py-2" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function getZoneMetrics(zoneItem: ResistanceZone) {
  return zoneMetricLabels
    .map((metric) => {
      const value = zoneItem.metrics?.[metric.key];
      return value ? `${metric.label}: ${value}` : "";
    })
    .filter(Boolean);
}

export function ResistanceMethodsView({ libraryMode, setLibraryMode }: ResistanceMethodsViewProps) {
  const [resistanceFilter, setResistanceFilter] = useState<ResistanceMethodFilter>("all");
  const [resistanceSearch, setResistanceSearch] = useState("");
  const [selectedResistanceMethod, setSelectedResistanceMethod] = useState<ResistanceMethod | null>(null);
  const [selectedZoneSport, setSelectedZoneSport] = useState<ResistanceSport>("generic");
  const selectedZoneProfile = getSportZoneProfile(selectedZoneSport);
  const filteredResistanceMethods = resistanceMethods.filter((method) =>
    methodMatchesResistanceFilter(method, resistanceFilter) &&
    methodMatchesResistanceSearch(method, resistanceSearch)
  );

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Biblioteca de resistencia</h2>
            <p className="mt-1 text-sm text-ink/55">
              Catálogo metodológico construido desde docs/Métodos de entrenamiento.xlsx.
            </p>
          </div>
          <div className="flex w-fit rounded-md border border-line bg-panel/35 p-1">
            {([
              ["strength", "Fuerza"],
              ["resistance", "Resistencia"]
            ] as const).map(([mode, label]) => (
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  libraryMode === mode ? "bg-ink text-white" : "text-ink/65 hover:bg-white"
                }`}
                key={mode}
                onClick={() => setLibraryMode(mode)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex h-11 items-center gap-2 rounded-md border border-line bg-panel/35 px-3 text-sm text-ink">
            <Search className="text-ink/40" size={16} />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/35"
              onChange={(event) => setResistanceSearch(event.target.value)}
              placeholder="Buscar por método, intensidad, ejemplos o efectos"
              value={resistanceSearch}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {resistanceMethodFilters.map((filter) => (
              <button
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  resistanceFilter === filter.value
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink/65 hover:bg-panel"
                }`}
                key={filter.value}
                onClick={() => setResistanceFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ink/45">Zonas de entrenamiento</p>
            <h3 className="mt-1 text-lg font-semibold text-ink">{selectedZoneProfile.name}</h3>
            <p className="mt-1 text-sm text-ink/55">
              Guía metodológica. Las zonas deben individualizarse con test, deporte, nivel y contexto.
            </p>
          </div>
          <label className="w-full max-w-xs space-y-2 text-sm font-semibold text-ink/70">
            Deporte
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSelectedZoneSport(event.target.value as ResistanceSport)}
              value={selectedZoneSport}
            >
              {sportZoneProfiles.map((profile) => (
                <option key={profile.sport} value={profile.sport}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <ResistanceInfoCard label="Métrica principal" value={selectedZoneProfile.mainReferenceMetric} />
          <ResistanceInfoCard label="Métricas secundarias" value={selectedZoneProfile.secondaryMetrics.join(" · ") || "Sin especificar"} />
          <ResistanceInfoCard label="Fuente" value={selectedZoneProfile.source || "Capturas docentes aportadas por Rafa"} />
        </div>

        {selectedZoneProfile.notes ? (
          <p className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm font-medium text-ink/65">
            {selectedZoneProfile.notes}
          </p>
        ) : null}

        <div className="mt-4 grid gap-3">
          {selectedZoneProfile.zones.map((zoneItem) => {
            const metrics = getZoneMetrics(zoneItem);

            return (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={`${selectedZoneProfile.sport}-${zoneItem.id}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-ink/45">{zoneItem.shortLabel}</p>
                    <h4 className="mt-1 font-semibold text-ink">{zoneItem.label}</h4>
                    <p className="mt-2 text-sm text-ink/65">{zoneItem.description}</p>
                  </div>
                  {zoneItem.intensity ? (
                    <span className="w-fit rounded-md border border-line bg-white px-3 py-1 text-xs font-semibold text-ink/65">
                      {zoneItem.intensity}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-md border border-line bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-ink/45">Porcentajes / RPE</p>
                    {metrics.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {metrics.map((metric) => (
                          <span className="rounded-md bg-panel/70 px-2 py-1 text-xs font-semibold text-ink/65" key={metric}>
                            {metric}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-ink/55">Sin porcentajes añadidos para este perfil.</p>
                    )}
                  </div>

                  <div className="rounded-md border border-line bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-ink/45">Foco fisiológico</p>
                    <p className="mt-2 text-sm font-medium text-ink/65">{zoneItem.physiologicalFocus?.join(" · ") || "Sin especificar"}</p>
                  </div>

                  <div className="rounded-md border border-line bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-ink/45">Métodos relacionados</p>
                    <p className="mt-2 text-sm font-medium text-ink/65">{zoneItem.methodLinks?.join(" · ") || "Sin especificar"}</p>
                  </div>
                </div>

                {zoneItem.sourceNote ? (
                  <p className="mt-3 text-xs font-medium text-ink/45">{zoneItem.sourceNote}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredResistanceMethods.map((method) => (
          <button
            className="rounded-md border border-line bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-moss"
            key={method.id}
            onClick={() => setSelectedResistanceMethod(method)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-ink/45">{method.method}</p>
                <h3 className="mt-1 text-base font-semibold text-ink">{method.name}</h3>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getResistanceStatusClass(method.status)}`}>
                {getResistanceStatusLabel(method.status)}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-ink/50">{getResistanceMeta(method)}</p>
            {method.status === "pending" ? (
              <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-3 text-sm font-medium text-ink/55">
                Pendiente de completar en el documento base.
              </p>
            ) : (
              <div className="mt-4 grid gap-2 text-sm text-ink/70">
                <p><span className="font-semibold text-ink">Intensidad:</span> {method.zones.length > 0 ? method.zones.join(" / ") : method.intensity}</p>
                <p><span className="font-semibold text-ink">Duración:</span> {method.sessionDuration}</p>
                {method.examples.length > 0 ? (
                  <div>
                    <p className="font-semibold text-ink">Ejemplos:</p>
                    <ul className="mt-1 space-y-1">
                      {method.examples.slice(0, 2).map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </button>
        ))}
      </section>

      {filteredResistanceMethods.length === 0 ? (
        <section className="rounded-md border border-dashed border-line bg-white p-8 text-center text-sm text-ink/55">
          No hay métodos que coincidan con el filtro actual.
        </section>
      ) : null}

      {selectedResistanceMethod ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-ink/45">{selectedResistanceMethod.method}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{selectedResistanceMethod.name}</h3>
                <p className="mt-2 text-sm text-ink/55">{getResistanceMeta(selectedResistanceMethod)}</p>
              </div>
              <button
                className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink"
                onClick={() => setSelectedResistanceMethod(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>

            {selectedResistanceMethod.status === "pending" ? (
              <p className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/55">
                Pendiente de completar en el documento base.
              </p>
            ) : (
              <>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    ["Tiempo total de sesión", selectedResistanceMethod.sessionDuration],
                    ["Nº repeticiones", selectedResistanceMethod.repetitions],
                    ["Duración repeticiones", selectedResistanceMethod.repetitionDuration],
                    ["Recuperación entre repeticiones", selectedResistanceMethod.recoveryBetweenRepetitions],
                    ["Nº series", selectedResistanceMethod.series],
                    ["Recuperación entre series", selectedResistanceMethod.recoveryBetweenSeries],
                    ["Intensidad", selectedResistanceMethod.intensity],
                    ["Fuente", selectedResistanceMethod.source]
                  ].map(([label, value]) => (
                    <ResistanceInfoCard key={label} label={label} value={value || "Sin datos"} />
                  ))}
                </div>

                <ResistanceDetailSection title="Ejemplos" items={selectedResistanceMethod.examples} />
                <ResistanceDetailSection title="Efectos del entrenamiento" items={selectedResistanceMethod.trainingEffects} />

                <section className="mt-4 rounded-md border border-line bg-panel/35 p-4">
                  <p className="text-xs font-semibold uppercase text-ink/45">Bibliografía</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{selectedResistanceMethod.bibliography || "Sin datos"}</p>
                </section>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
