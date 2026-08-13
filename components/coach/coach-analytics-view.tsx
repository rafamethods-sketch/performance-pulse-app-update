"use client";

import { BarChart3 } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";

type AnalyticsPeriod = "7d" | "30d" | "90d" | "month" | "year" | "all";
type ClientBusinessStatus = "active" | "paused" | "inactive";
type ClientAcquisitionSource = "instagram" | "referral" | "website" | "gym" | "event" | "friend" | "other" | "";

type CoachAnalyticsClient = {
  accessEndDate?: string;
  accessStartDate?: string;
  business?: {
    acquisitionSource?: ClientAcquisitionSource;
    exitReason?: string;
    joinedAt?: string;
    status?: ClientBusinessStatus;
    statusChangedAt?: string;
  };
  id: string;
  modality?: string | null;
  name: string;
  onboarding?: {
    goals?: {
      mainGoal?: string;
    };
    sportProfile?: {
      primarySport?: string;
    };
  };
  planning?: {
    primaryGoal?: string;
  };
  sport?: string | null;
};

const analyticsPeriodLabels: Record<AnalyticsPeriod, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
  month: "Este mes",
  year: "Este año",
  all: "Todo"
};

const analyticsPeriodOptions: AnalyticsPeriod[] = ["7d", "30d", "90d", "month", "year", "all"];

const acquisitionSourceLabels: Record<ClientAcquisitionSource, string> = {
  "": "Sin especificar",
  event: "Evento",
  friend: "Amigo / conocido",
  gym: "Centro / gimnasio",
  instagram: "Instagram / redes sociales",
  other: "Otro",
  referral: "Recomendación",
  website: "Web"
};

const acquisitionSourceOptions: Array<{ label: string; value: ClientAcquisitionSource }> = [
  { label: "Sin especificar", value: "" },
  { label: "Instagram / redes sociales", value: "instagram" },
  { label: "Recomendación", value: "referral" },
  { label: "Web", value: "website" },
  { label: "Centro / gimnasio", value: "gym" },
  { label: "Evento", value: "event" },
  { label: "Amigo / conocido", value: "friend" },
  { label: "Otro", value: "other" }
];

const acquisitionDonutColors = ["#6f8f72", "#4f7f8f", "#9a7a46", "#8a6f9b", "#c56b5b", "#58715d", "#9a8f7a", "#6b7280"];

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`rounded-md bg-panel/55 p-4 ${className}`}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm font-semibold text-moss">{value}</p>
    </article>
  );
}

function getClientBusinessStatus(client: CoachAnalyticsClient): ClientBusinessStatus {
  return client.business?.status ?? "active";
}

function getClientJoinedAt(client: CoachAnalyticsClient) {
  const maybeCreatedAt = (client as CoachAnalyticsClient & { createdAt?: string }).createdAt;
  return client.business?.joinedAt || maybeCreatedAt || client.accessStartDate || "";
}

function getClientAcquisitionSource(client: CoachAnalyticsClient): ClientAcquisitionSource {
  return client.business?.acquisitionSource ?? "";
}

function parseAccessDate(dateKey?: string | null) {
  if (!dateKey) return null;
  const parsed = new Date(`${dateKey}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatAccessDate(dateKey?: string | null) {
  const date = parseAccessDate(dateKey);
  if (!date) return "Sin fecha";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function isDateInRange(dateKey: string | undefined, startDate: Date | null, endDate: Date) {
  const date = parseAccessDate(dateKey);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  return date <= endDate;
}

function getMostFrequentValue(items: string[]) {
  const counts = items.reduce<Record<string, number>>((currentCounts, item) => {
    const value = item.trim();
    if (!value) return currentCounts;
    currentCounts[value] = (currentCounts[value] ?? 0) + 1;
    return currentCounts;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? null;
}

function getOnboardingValue(value?: number | string | string[] | null) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "";
  if (value === undefined || value === null) return "";
  return `${value}`.trim();
}

export function CoachAnalyticsView({ clients }: { clients: CoachAnalyticsClient[] }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const periodStart = (() => {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    if (period === "all") return null;
    if (period === "month") return new Date(today.getFullYear(), today.getMonth(), 1);
    if (period === "year") return new Date(today.getFullYear(), 0, 1);
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    start.setDate(start.getDate() - (days - 1));
    return start;
  })();
  const periodLabel = periodStart
    ? `${formatAccessDate(periodStart.toISOString().slice(0, 10))} → ${formatAccessDate(today.toISOString().slice(0, 10))}`
    : "Todo el historial local";
  const activeClients = clients.filter((client) => getClientBusinessStatus(client) === "active");
  const pausedClients = clients.filter((client) => getClientBusinessStatus(client) === "paused");
  const newClients = clients.filter((client) => isDateInRange(getClientJoinedAt(client), periodStart, today));
  const newInactiveClients = clients.filter((client) =>
    getClientBusinessStatus(client) === "inactive" &&
    isDateInRange(client.business?.statusChangedAt, periodStart, today)
  );
  const next14Days = new Date(today);
  next14Days.setDate(next14Days.getDate() + 14);
  const accessEndingSoon = clients.filter((client) => {
    if (getClientBusinessStatus(client) === "inactive") return false;
    const endDate = parseAccessDate(client.accessEndDate);
    return Boolean(endDate && endDate >= today && endDate <= next14Days);
  });
  const netGrowth = newClients.length - newInactiveClients.length;
  const trendSport = getMostFrequentValue(newClients.map((client) =>
    getOnboardingValue(client.onboarding?.sportProfile?.primarySport || client.modality || client.sport)
  ));
  const trendGoal = getMostFrequentValue(newClients.map((client) =>
    getOnboardingValue(client.onboarding?.goals?.mainGoal || client.planning?.primaryGoal)
  ));
  const trendSource = getMostFrequentValue(newClients.map((client) => {
    const source = getClientAcquisitionSource(client);
    return source ? acquisitionSourceLabels[source] : "";
  }));
  const sourceDistribution = acquisitionSourceOptions.map((option) => {
    const count = clients.filter((client) => getClientAcquisitionSource(client) === option.value).length;
    return {
      count,
      label: option.label,
      percent: clients.length > 0 ? Math.round((count / clients.length) * 100) : 0
    };
  });
  const visibleSourceDistribution = sourceDistribution.filter((source) => source.count > 0);
  let accumulatedSourcePct = 0;
  const sourceDonutStops = visibleSourceDistribution.map((source, index) => {
    const start = accumulatedSourcePct;
    const end = accumulatedSourcePct + source.percent;
    accumulatedSourcePct = end;
    return `${acquisitionDonutColors[index % acquisitionDonutColors.length]} ${start}% ${end}%`;
  });
  const sourceDonutStyle: CSSProperties = {
    background: sourceDonutStops.length > 0 ? `conic-gradient(${sourceDonutStops.join(", ")})` : undefined
  };
  const movementItems = clients.flatMap((client) => {
    const items: Array<{ date: string; detail?: string; event: string; id: string; name: string }> = [];
    const joinedAt = getClientJoinedAt(client);
    if (isDateInRange(joinedAt, periodStart, today)) {
      items.push({
        date: joinedAt,
        event: "Alta de cliente",
        id: `${client.id}-joined`,
        name: client.name
      });
    }
    if (isDateInRange(client.business?.statusChangedAt, periodStart, today)) {
      const status = getClientBusinessStatus(client);
      items.push({
        date: client.business?.statusChangedAt ?? "",
        detail: client.business?.exitReason,
        event: status === "inactive" ? "Baja de cliente" : status === "paused" ? "Cliente pausado" : "Cliente reactivado",
        id: `${client.id}-status`,
        name: client.name
      });
    }
    return items;
  }).sort((a, b) => {
    const timeA = parseAccessDate(a.date)?.getTime() ?? 0;
    const timeB = parseAccessDate(b.date)?.getTime() ?? 0;
    return timeB - timeA;
  }).slice(0, 8);
  const hasTrendData = Boolean(trendSport || trendGoal || trendSource);
  const hasAnalyticsData = clients.some((client) =>
    Boolean(getClientJoinedAt(client) || client.business?.status || client.business?.acquisitionSource || client.business?.statusChangedAt)
  );

  return (
    <div className="mt-6 grid gap-5">
      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Métricas del entrenador</h2>
            <p className="mt-1 max-w-3xl text-sm text-ink/60">
              Datos locales de tus clientes. No se envía información a servidores.
            </p>
          </div>
          <label className="w-full text-sm font-semibold text-ink/70 sm:w-64">
            Periodo
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
              onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
              value={period}
            >
              {analyticsPeriodOptions.map((value) => (
                <option key={value} value={value}>{analyticsPeriodLabels[value]}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs font-semibold text-ink/45">{periodLabel}</p>
      </section>

      {!hasAnalyticsData ? (
        <section className="rounded-md border border-dashed border-line bg-white p-6 text-center shadow-soft">
          <BarChart3 className="mx-auto text-ink/35" size={28} />
          <h3 className="mt-3 font-semibold text-ink">Aún no hay datos suficientes.</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-ink/55">
            Completa la fecha de alta, estado y origen de tus clientes para activar la analítica.
          </p>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <ClientInfoCard label="Clientes activos" value={`${activeClients.length}`} />
        <ClientInfoCard label="Altas nuevas" value={`${newClients.length}`} />
        <ClientInfoCard label="Bajas nuevas" value={`${newInactiveClients.length}`} />
        <ClientInfoCard label="Crecimiento neto" value={netGrowth >= 0 ? `+${netGrowth}` : `${netGrowth}`} />
        <ClientInfoCard label="Clientes pausados" value={`${pausedClients.length}`} />
        <ClientInfoCard label="Accesos próximos a finalizar" value={`${accessEndingSoon.length}`} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="coach-surface rounded-md p-4">
          <h3 className="font-semibold text-ink">Perfil que más crece</h3>
          {hasTrendData ? (
            <div className="mt-4 grid gap-3">
              <ClientInfoCard label="Deporte con más altas" value={trendSport ? `${trendSport[0]} · ${trendSport[1]} altas` : "Sin datos"} />
              <ClientInfoCard label="Objetivo más común" value={trendGoal ? `${trendGoal[0]} · ${trendGoal[1]} clientes` : "Sin datos"} />
              <ClientInfoCard label="Canal principal" value={trendSource ? `${trendSource[0]} · ${trendSource[1]} clientes` : "Sin datos"} />
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              Aún no hay suficientes datos para detectar tendencias.
            </p>
          )}
        </section>

        <section className="coach-surface rounded-md p-4">
          <h3 className="font-semibold text-ink">Cómo han conocido tus servicios</h3>
          {visibleSourceDistribution.length > 0 ? (
            <div className="mt-4 grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
              <div
                aria-label="Distribución de origen de clientes"
                className="relative mx-auto size-40 rounded-full border border-line shadow-soft"
                style={sourceDonutStyle}
                title={visibleSourceDistribution.map((source) => `${source.label}: ${source.count} clientes (${source.percent}%)`).join(" | ")}
              >
                <div className="absolute inset-8 grid place-items-center rounded-full border border-line bg-panel text-center">
                  <span className="text-2xl font-semibold text-ink">{clients.length}</span>
                  <span className="text-[11px] font-semibold uppercase text-ink/45">clientes</span>
                </div>
              </div>
              <div className="grid gap-2">
                {visibleSourceDistribution.map((source, index) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm"
                    key={source.label}
                    title={`${source.label}: ${source.count} clientes (${source.percent}%)`}
                  >
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-ink/70">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: acquisitionDonutColors[index % acquisitionDonutColors.length] }}
                      />
                      <span className="truncate">{source.label}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-ink/45">{source.count} · {source.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              Sin datos de origen suficientes.
            </p>
          )}
        </section>
      </div>

      <section className="coach-surface rounded-md p-4">
        <h3 className="font-semibold text-ink">Movimientos recientes</h3>
        {movementItems.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {movementItems.map((item) => (
              <article className="rounded-md border border-line bg-panel/35 px-3 py-2" key={item.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.event}</p>
                    <p className="text-sm text-ink/60">{item.name}{item.detail ? ` · ${item.detail}` : ""}</p>
                  </div>
                  <span className="text-xs font-semibold text-ink/45">{formatAccessDate(item.date) || "Sin fecha"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
            Sin movimientos registrados en este periodo.
          </p>
        )}
      </section>
    </div>
  );
}
