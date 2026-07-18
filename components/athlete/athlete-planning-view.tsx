"use client";

import { getPlanningMethodLabel, type PlanningMethod, type WeeklyDistribution } from "@/lib/planning-config";

type AthletePlanningBlock = {
  durationWeeks: number;
  id?: string;
  name: string;
  primaryObjective: string;
  secondaryObjective?: string;
  weeklyDistribution?: WeeklyDistribution;
};

type AthletePlanning = {
  blocks?: AthletePlanningBlock[];
  currentBlock?: string;
  currentWeek?: string;
  eventDate?: string;
  eventName?: string;
  method?: PlanningMethod;
  nextSessions?: string[];
  primaryGoal?: string;
  secondaryGoal?: string;
};

type AthletePlanningClient = {
  planning?: AthletePlanning;
};

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md bg-panel/45 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function AthletePlanningView({ client }: { client: AthletePlanningClient | null }) {
  const planning = client?.planning;
  const blocks = planning?.blocks ?? [];
  const hasPlanning = Boolean(planning && (blocks.length > 0 || planning.currentBlock || planning.primaryGoal || planning.eventName));
  let weekStart = 1;

  if (!client || !planning || !hasPlanning) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        Tu entrenador todavía no ha asignado una planificación.
      </div>
    );
  }

  return (
    <section className="mt-5 grid gap-4">
      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Planificación</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ClientInfoCard label="Modelo" value={planning.method ? getPlanningMethodLabel(planning.method) : "Sin especificar"} />
          <ClientInfoCard label="Bloque actual" value={displayValue(planning.currentBlock, "Sin asignar")} />
          <ClientInfoCard label="Semana actual" value={displayValue(planning.currentWeek, "Sin asignar")} />
          <ClientInfoCard label="Objetivo principal" value={displayValue(planning.primaryGoal, "Sin especificar")} />
        </div>
        {planning.secondaryGoal ? (
          <div className="mt-3 rounded-md bg-panel/45 p-3 text-sm text-ink/65">
            <span className="font-semibold text-ink">Objetivo secundario: </span>{planning.secondaryGoal}
          </div>
        ) : null}
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-semibold text-ink">Roadmap de mesociclos</h3>
        {blocks.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {blocks.map((block, index) => {
              const start = weekStart;
              const duration = block.durationWeeks || 0;
              const end = duration > 0 ? weekStart + duration - 1 : weekStart;
              weekStart = end + 1;

              return (
                <div className="rounded-md border border-line bg-panel/35 p-4" key={block.id ?? `${block.name}-${index}`}>
                  <p className="text-xs font-semibold uppercase text-moss">Mesociclo {index + 1}</p>
                  <h4 className="mt-1 font-semibold text-ink">{displayValue(block.name, "Sin nombre")}</h4>
                  <p className="mt-1 text-sm text-ink/60">{duration ? `${duration} semanas` : "Duración sin especificar"}</p>
                  <p className="mt-1 text-sm text-ink/60">Semana {start}-{end}</p>
                  <p className="mt-2 text-sm text-ink/70">{displayValue(block.primaryObjective, "Objetivo sin especificar")}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
            Tu entrenador todavía no ha asignado mesociclos.
          </p>
        )}
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-semibold text-ink">Próximo evento y sesiones</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ClientInfoCard label="Evento" value={displayValue(planning.eventName, "Sin evento asignado")} />
          <ClientInfoCard label="Fecha" value={displayValue(planning.eventDate, "Sin fecha")} />
        </div>
        {(planning.nextSessions?.length ?? 0) > 0 ? (
          <div className="mt-4 grid gap-2">
            {planning.nextSessions?.map((session, index) => (
              <p className="rounded-md bg-panel/45 px-3 py-2 text-sm font-medium text-ink/70" key={`${session}-${index}`}>
                {session}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-md bg-panel/45 px-3 py-2 text-sm text-ink/55">
            No hay próximas sesiones listadas.
          </p>
        )}
      </article>
    </section>
  );
}
