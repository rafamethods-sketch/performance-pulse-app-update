"use client";

import { useState } from "react";
import type { SheetId } from "@/lib/data";
import { exerciseLibrary } from "@/lib/exercises";
import {
  acwrRanges,
  calculateACWR,
  calculateHooperIndex,
  calculateMonotony,
  calculateSessionLoad,
  calculateStrain,
  calculateWeeklyLoad,
  getMetricStatus,
  monotonyRanges,
  strainRanges
} from "@/lib/client-metrics";
import {
  calculateWeeklyExternalLoad,
  calculateWeeklyExternalLoadByPattern,
  calculateWeeklyMuscleSets,
  type SessionExerciseInput,
  type TrainingSessionInput
} from "@/lib/session-load";

type DashboardDetailSection = "status" | "load" | "acwr" | "monotony" | "strain" | "hooper" | "fatigue-map";

type DashboardSessionRecord = TrainingSessionInput & {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: SessionExerciseInput[];
  plannedExercises?: SessionExerciseInput[];
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  summary: string;
  type: string;
};

type CoachClient = {
  chronicLoad: number;
  coachNotes: string;
  dailyLoads: number[];
  goalType: string;
  hooper: {
    fatigue: number;
    mood?: number;
    sleep: number;
    soreness: number;
    stress: number;
  };
  id: string;
  injuries?: string | null;
  level: string;
  modality: string;
  name: string;
  nextEvent: string;
  planning: {
    currentBlock: string;
    currentWeek: string;
    distribution: string;
    eventDate?: string;
    nextSessions?: string[];
    primaryGoal: string;
    secondaryGoal: string;
  };
  readiness: number;
  sessionRecords: DashboardSessionRecord[];
  status: string;
};

type ClientDashboardViewProps = {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
};

function getDashboardMonotonyStatus(value: number) {
  return getMetricStatus(value, monotonyRanges);
}

function getDashboardAcwrStatus(value: number) {
  return getMetricStatus(value, acwrRanges);
}

function getDashboardStrainStatus(value: number) {
  return getMetricStatus(value, strainRanges);
}

function getDashboardHooperStatus(value: number) {
  if (value >= 12) return "Alto";
  if (value >= 9) return "Vigilar";
  return "Controlado";
}

function getDashboardLoadTrend(currentLoad: number, chronicLoad: number) {
  const difference = currentLoad - chronicLoad;
  const sign = difference >= 0 ? "+" : "";
  return `${sign}${difference.toFixed(0)} UA vs referencia`;
}

function getDashboardLoadData(client: CoachClient) {
  const weeklyLoad = calculateWeeklyLoad(
    client.sessionRecords.map((session) => ({
      duration: getDashboardNumber(session.actualDurationMinutes ?? session.duration) ?? 0,
      rpe: getDashboardNumber(session.finalRpe ?? session.rpe) ?? 0
    }))
  );
  const monotony = calculateMonotony(client.dailyLoads);
  const strain = calculateStrain(weeklyLoad, monotony);
  const acwr = calculateACWR(weeklyLoad, client.chronicLoad);
  const hooper = calculateHooperIndex(client.hooper);

  return {
    acwr,
    acwrStatus: getDashboardAcwrStatus(acwr),
    hooper,
    hooperStatus: getDashboardHooperStatus(hooper),
    monotony,
    monotonyStatus: getDashboardMonotonyStatus(monotony),
    strain,
    strainStatus: getDashboardStrainStatus(strain),
    weeklyLoad,
    weeklyTrend: getDashboardLoadTrend(weeklyLoad, client.chronicLoad)
  };
}

function dashboardStatusClass(status: string) {
  switch (status) {
    case "Alto":
    case "Riesgo":
      return "border-red-200 bg-red-50 text-red-800";
    case "Vigilar":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
}

function hasDashboardValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function getDashboardNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getDashboardSrpe(session: DashboardSessionRecord) {
  const explicitSrpe = getDashboardNumber(session.sRPE ?? session.srpe);
  if (explicitSrpe !== null) return explicitSrpe;

  const duration = getDashboardNumber(session.actualDurationMinutes ?? session.duration);
  const rpe = getDashboardNumber(session.finalRpe ?? session.rpe);
  if (duration === null || rpe === null || duration <= 0 || rpe <= 0) return null;

  return calculateSessionLoad(rpe, duration);
}

function hasDashboardRealSessionData(session: DashboardSessionRecord) {
  return Boolean(
    session.completed ||
    hasDashboardValue(session.duration) ||
    hasDashboardValue(session.rpe) ||
    hasDashboardValue(session.finalRpe) ||
    hasDashboardValue(session.actualDurationMinutes) ||
    hasDashboardValue(session.sRPE) ||
    hasDashboardValue(session.srpe) ||
    hasDashboardValue(session.finalNotes) ||
    hasDashboardValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function isDashboardPendingReview(session: DashboardSessionRecord) {
  if (session.reviewStatus === "reviewed") return false;
  return hasDashboardRealSessionData(session);
}

function hasDashboardExerciseData(session: DashboardSessionRecord) {
  return Boolean(
    (session.performedExercises?.length ?? 0) > 0 ||
    (session.plannedExercises?.length ?? 0) > 0 ||
    (session.exercises?.length ?? 0) > 0
  );
}

function getDashboardSessionInput(session: DashboardSessionRecord): TrainingSessionInput {
  return {
    completed: session.completed,
    exercises: session.exercises,
    performedExercises: session.performedExercises,
    plannedExercises: session.plannedExercises
  };
}

function getDashboardEventDays(client: CoachClient) {
  const eventDate = client.planning.eventDate ?? client.nextEvent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];
  if (!eventDate || eventDate === "sin fecha") return null;

  const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const slashMatch = eventDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const parsed = dateMatch
    ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
    : slashMatch
      ? new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
      : null;

  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return Math.ceil((parsed.getTime() - today.getTime()) / 86_400_000);
}

function getClientDashboardData(client: CoachClient, loadData: ReturnType<typeof getDashboardLoadData>) {
  const sessions = (client.sessionRecords ?? []) as DashboardSessionRecord[];
  const trainingSessions = sessions.map(getDashboardSessionInput);
  const sessionsWithSrpe = sessions
    .map((session) => ({ session, srpe: getDashboardSrpe(session) }))
    .filter((entry): entry is { session: DashboardSessionRecord; srpe: number } => entry.srpe !== null);
  const hasExerciseData = sessions.some(hasDashboardExerciseData);
  const weeklyExternalLoad = hasExerciseData
    ? calculateWeeklyExternalLoad(trainingSessions, exerciseLibrary)
    : null;
  const loadByPattern = hasExerciseData
    ? calculateWeeklyExternalLoadByPattern(trainingSessions, exerciseLibrary)
    : {};
  const muscleSets = hasExerciseData
    ? calculateWeeklyMuscleSets(trainingSessions, exerciseLibrary)
    : {};
  const plannedSessions = client.planning.nextSessions?.length ?? 0;
  const completedSessions = sessions.filter(hasDashboardRealSessionData).length;
  const adherencePercent = plannedSessions > 0
    ? Math.min(100, Math.round((completedSessions / plannedSessions) * 100))
    : null;
  const pendingReviews = sessions.filter(isDashboardPendingReview).length;
  const latestSession = [...sessions].reverse().find(hasDashboardRealSessionData) ?? sessions.at(-1) ?? null;
  const latestRpe = latestSession ? getDashboardNumber(latestSession.finalRpe ?? latestSession.rpe) : null;
  const eventDays = getDashboardEventDays(client);
  const strongestPattern = Object.entries(loadByPattern).sort(([, a], [, b]) => b - a)[0] ?? null;
  const strongestMuscle = Object.entries(muscleSets).sort(([, a], [, b]) => b - a)[0] ?? null;
  const alerts: string[] = [];

  if (latestRpe !== null && latestRpe >= 8) alerts.push("Última sesión con RPE alto. Revisar recuperación.");
  if (loadData.weeklyLoad >= 2200) alerts.push("sRPE semanal alto. Revisar distribución de carga.");
  if (strongestPattern && weeklyExternalLoad && strongestPattern[1] / weeklyExternalLoad >= 0.55) {
    alerts.push(`Carga concentrada en ${strongestPattern[0]}. Revisar distribución.`);
  }
  if (strongestMuscle && Object.values(muscleSets).reduce((total, value) => total + value, 0) > 0) {
    const totalMuscleSets = Object.values(muscleSets).reduce((total, value) => total + value, 0);
    if (strongestMuscle[1] / totalMuscleSets >= 0.35) alerts.push(`Fatiga concentrada en ${strongestMuscle[0]}. Vigilar tolerancia.`);
  }
  if (adherencePercent !== null && adherencePercent < 70) alerts.push("Adherencia baja. Revisar disponibilidad o ajuste semanal.");
  if (pendingReviews > 0) alerts.push("Hay sesiones pendientes de revisar.");
  if (client.injuries && !client.injuries.toLowerCase().includes("sin lesiones")) alerts.push("Lesiones o limitaciones registradas. Revisar antes de progresar.");
  if (eventDays !== null && eventDays >= 0 && eventDays <= 14) alerts.push("Evento próximo: ajustar carga si procede.");

  const generalStatus = loadData.weeklyLoad >= 2200 || latestRpe !== null && latestRpe >= 8
    ? "Alta carga"
    : pendingReviews > 0 || adherencePercent !== null && adherencePercent < 70
      ? "Revisar"
      : "Estable";

  return {
    adherencePercent,
    alerts,
    completedSessions,
    generalStatus,
    hasExerciseData,
    loadByPattern,
    muscleSets,
    plannedSessions,
    sessions,
    sessionsWithSrpe,
    weeklyExternalLoad
  };
}

export function ClientDashboardView({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: ClientDashboardViewProps) {
  const [dashboardDetail, setDashboardDetail] = useState<DashboardDetailSection | null>(null);
  const loadData = getDashboardLoadData(client);
  const dashboardData = getClientDashboardData(client, loadData);

  return (
    <div className="mt-6 grid gap-6">
      <ClientHeader client={client} onBack={onBack} onOpenClientSheet={onOpenClientSheet} onOpenDetails={onOpenDetails} />
      <DashboardStatusSummary dashboardData={dashboardData} loadData={loadData} onOpenDetail={setDashboardDetail} />
      {dashboardDetail ? (
        <DashboardDetailPanel
          client={client}
          loadData={loadData}
          onClose={() => setDashboardDetail(null)}
          section={dashboardDetail}
        />
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WeeklyLoadDashboardBlock dashboardData={dashboardData} loadData={loadData} />
        <AdherenceDashboardBlock dashboardData={dashboardData} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <PatternDistributionDashboardBlock dashboardData={dashboardData} />
        <MuscleFatigueDashboardBlock dashboardData={dashboardData} />
      </div>
      <DashboardAlertsBlock alerts={dashboardData.alerts} />
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Indicadores de carga</h3>
            <p className="mt-1 text-sm text-ink/55">ACWR, Hooper, monotonía y strain como lectura secundaria.</p>
          </div>
          <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => setDashboardDetail("acwr")} type="button">
            Ver detalle
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricPill label="ACWR" status={loadData.acwrStatus} value={loadData.acwr.toFixed(2)} />
          <MetricPill label="Hooper" status={loadData.hooperStatus} value={`${loadData.hooper}/25`} />
          <MetricPill label="Monotonía" status={loadData.monotonyStatus} value={loadData.monotony.toFixed(2)} />
          <MetricPill label="Strain" status={loadData.strainStatus} value={loadData.strain.toFixed(0)} />
        </div>
      </section>
    </div>
  );
}

function DashboardStatusSummary({
  dashboardData,
  loadData,
  onOpenDetail
}: {
  dashboardData: ReturnType<typeof getClientDashboardData>;
  loadData: ReturnType<typeof getDashboardLoadData>;
  onOpenDetail: (section: DashboardDetailSection) => void;
}) {
  const summaryCards = [
    {
      detail: dashboardData.alerts.length > 0 ? "con puntos a revisar" : "sin alertas principales",
      label: "Estado general",
      status: dashboardData.generalStatus === "Alta carga" ? "Alto" : dashboardData.generalStatus === "Revisar" ? "Vigilar" : "Controlado",
      value: dashboardData.generalStatus
    },
    {
      detail: `${dashboardData.sessionsWithSrpe.length} sesiones con registro`,
      label: "sRPE semanal",
      status: loadData.acwrStatus,
      value: dashboardData.sessionsWithSrpe.length > 0 ? `${Math.round(loadData.weeklyLoad).toLocaleString("es-ES")} UA` : "Sin datos suficientes"
    },
    {
      detail: dashboardData.hasExerciseData ? "tonelaje registrado" : "faltan ejercicios con carga",
      label: "Carga externa semanal",
      status: dashboardData.weeklyExternalLoad && dashboardData.weeklyExternalLoad > 0 ? "Controlado" : "Vigilar",
      value: dashboardData.weeklyExternalLoad !== null && dashboardData.weeklyExternalLoad > 0
        ? `${Math.round(dashboardData.weeklyExternalLoad).toLocaleString("es-ES")} kg`
        : "Sin datos suficientes"
    },
    {
      detail: dashboardData.plannedSessions > 0 ? `${dashboardData.completedSessions}/${dashboardData.plannedSessions} sesiones` : "faltan sesiones planificadas",
      label: "Adherencia",
      status: dashboardData.adherencePercent === null ? "Vigilar" : dashboardData.adherencePercent < 70 ? "Alto" : "Controlado",
      value: dashboardData.adherencePercent !== null ? `${dashboardData.adherencePercent}%` : "Sin datos suficientes"
    }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <article className={`rounded-md border p-4 shadow-soft ${dashboardStatusClass(card.status)}`} key={card.label}>
          <p className="text-sm font-semibold">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          <p className="mt-2 text-xs font-medium opacity-75">{card.detail}</p>
          {card.label === "sRPE semanal" ? (
            <button className="mt-3 text-xs font-semibold underline" onClick={() => onOpenDetail("load")} type="button">
              Ver detalle
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function DashboardEmptyState({ children }: { children: string }) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
      {children}
    </div>
  );
}

function WeeklyLoadDashboardBlock({
  dashboardData,
  loadData
}: {
  dashboardData: ReturnType<typeof getClientDashboardData>;
  loadData: ReturnType<typeof getDashboardLoadData>;
}) {
  const maxSrpe = Math.max(1, ...dashboardData.sessionsWithSrpe.map((entry) => entry.srpe));

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Carga semanal</h3>
          <p className="mt-1 text-sm text-ink/55">Barras por sesión usando sRPE cuando hay duración y RPE.</p>
        </div>
        <span className="w-fit rounded-md bg-panel px-3 py-1 text-sm font-semibold text-ink/70">
          {dashboardData.sessionsWithSrpe.length > 0 ? `${Math.round(loadData.weeklyLoad).toLocaleString("es-ES")} UA` : "Sin datos"}
        </span>
      </div>

      {dashboardData.sessionsWithSrpe.length > 0 ? (
        <>
          <div className="mt-5 flex h-40 items-end gap-2 rounded-md bg-panel/35 p-3">
            {dashboardData.sessionsWithSrpe.map(({ session, srpe }, index) => (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${session.date}-${session.summary}-${index}`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-moss to-steel"
                  style={{ height: `${Math.max(18, (srpe / maxSrpe) * 112)}px` }}
                />
                <span className="max-w-full truncate text-[10px] font-semibold text-ink/45">{session.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ClientInfoCard label="Sesiones con datos" value={`${dashboardData.sessionsWithSrpe.length}`} />
            <ClientInfoCard
              label="Carga externa"
              value={dashboardData.weeklyExternalLoad !== null && dashboardData.weeklyExternalLoad > 0
                ? `${Math.round(dashboardData.weeklyExternalLoad).toLocaleString("es-ES")} kg`
                : "Sin datos suficientes"}
            />
          </div>
        </>
      ) : (
        <DashboardEmptyState>Sin sesiones registradas esta semana.</DashboardEmptyState>
      )}
    </section>
  );
}

function AdherenceDashboardBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Adherencia</h3>
      <p className="mt-1 text-sm text-ink/55">Relación entre sesiones previstas y sesiones con registro real.</p>

      {dashboardData.adherencePercent !== null ? (
        <>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-panel">
            <div className="h-full rounded-full bg-moss" style={{ width: `${dashboardData.adherencePercent}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ClientInfoCard label="Planificadas" value={`${dashboardData.plannedSessions}`} />
            <ClientInfoCard label="Completadas" value={`${dashboardData.completedSessions}`} />
            <ClientInfoCard label="Adherencia" value={`${dashboardData.adherencePercent}%`} />
          </div>
        </>
      ) : (
        <DashboardEmptyState>Sin datos suficientes para calcular adherencia.</DashboardEmptyState>
      )}
    </section>
  );
}

function HorizontalDashboardBars({
  emptyText,
  entries,
  suffix
}: {
  emptyText: string;
  entries: [string, number][];
  suffix: string;
}) {
  const maxValue = Math.max(1, ...entries.map(([, value]) => value));

  if (entries.length === 0) return <DashboardEmptyState>{emptyText}</DashboardEmptyState>;

  return (
    <div className="mt-4 grid gap-3">
      {entries.map(([label, value]) => (
        <div className="rounded-md border border-line bg-panel/35 p-3" key={label}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{label}</p>
            <span className="text-xs font-semibold text-moss">{Math.round(value).toLocaleString("es-ES")} {suffix}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-moss" style={{ width: `${Math.max(6, (value / maxValue) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PatternDistributionDashboardBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const patternEntries = Object.entries(dashboardData.loadByPattern)
    .filter(([, load]) => load > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Distribución de carga por patrón</h3>
      <p className="mt-1 text-sm text-ink/55">Tonelaje acumulado por patrón de movimiento cuando hay ejercicios con carga.</p>
      <HorizontalDashboardBars
        emptyText="Sin datos suficientes para calcular distribución por patrón."
        entries={patternEntries}
        suffix="kg"
      />
    </section>
  );
}

function MuscleFatigueDashboardBlock({ dashboardData }: { dashboardData: ReturnType<typeof getClientDashboardData> }) {
  const muscleEntries = Object.entries(dashboardData.muscleSets)
    .filter(([, sets]) => sets > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Fatiga muscular / series efectivas</h3>
      <p className="mt-1 text-sm text-ink/55">Top de grupos con más series ponderadas por fatigueMap.</p>
      <HorizontalDashboardBars
        emptyText="Sin datos suficientes para calcular fatiga muscular."
        entries={muscleEntries}
        suffix="series"
      />
    </section>
  );
}

function DashboardAlertsBlock({ alerts }: { alerts: string[] }) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Alertas o puntos a revisar</h3>
      <p className="mt-1 text-sm text-ink/55">Avisos orientativos para revisar la sesión, la carga o la recuperación.</p>
      {alerts.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {alerts.map((alert) => (
            <article className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800" key={alert}>
              {alert}
            </article>
          ))}
        </div>
      ) : (
        <DashboardEmptyState>No hay alertas principales ahora.</DashboardEmptyState>
      )}
    </section>
  );
}

function ClientHeader({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button className="mb-3 text-sm font-semibold text-moss" onClick={onBack} type="button">
            Volver a clientes
          </button>
          <h2 className="text-xl font-semibold text-ink">{client.name}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {client.modality} - {client.level} - {client.goalType}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink"
            onClick={onOpenDetails}
            type="button"
          >
            Detalles
          </button>
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onOpenClientSheet(client.id, "assessments")}
            type="button"
          >
            Valoraciones
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <ClientInfoCard label="Estado actual" value={client.status} />
        <ClientInfoCard label="Readiness" value={`${client.readiness}%`} />
        <ClientInfoCard className="md:col-span-2" label="Proximo evento" value={client.nextEvent} />
      </div>
    </section>
  );
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`rounded-md bg-panel/55 p-4 ${className}`}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm font-semibold text-moss">{value}</p>
    </article>
  );
}

function DashboardDetailPanel({
  client,
  loadData,
  onClose,
  section
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getDashboardLoadData>;
  onClose: () => void;
  section: DashboardDetailSection;
}) {
  const content: Record<DashboardDetailSection, { items: [string, string][]; title: string }> = {
    "acwr": {
      title: "Detalle ACWR",
      items: [
        ["Carga aguda", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Carga cronica", `${client.chronicLoad} UA`],
        ["Ratio actual", loadData.acwr.toFixed(2)],
        ["Interpretacion", loadData.acwrStatus]
      ]
    },
    "fatigue-map": {
      title: "Detalle mapa de fatiga",
      items: [
        ["Carga semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Hooper", `${loadData.hooper}/25`],
        ["DOMS", `${client.hooper.soreness}/5`],
        ["Sueno", `${client.hooper.sleep}/5`]
      ]
    },
    "hooper": {
      title: "Detalle Hooper",
      items: [
        ["Sueno", `${client.hooper.sleep}/5`],
        ["Fatiga", `${client.hooper.fatigue}/5`],
        ["Estres", `${client.hooper.stress}/5`],
        ["DOMS", `${client.hooper.soreness}/5`],
        ["Estado de animo", `${client.hooper.mood ?? 0}/5`]
      ]
    },
    "load": {
      title: "Detalle sRPE semanal",
      items: [
        ["sRPE semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Tendencia", loadData.weeklyTrend],
        ["Sesiones recientes", client.sessionRecords.map((session) => `${session.type} ${getDashboardSrpe(session) ?? 0} UA`).join(" | ")]
      ]
    },
    "monotony": {
      title: "Detalle monotonia",
      items: [
        ["Cargas diarias", client.dailyLoads.join(" / ")],
        ["Monotonia", loadData.monotony.toFixed(2)],
        ["Estado", loadData.monotonyStatus]
      ]
    },
    "status": {
      title: "Detalle estado global",
      items: [
        ["Estado actual", client.status],
        ["Readiness", `${client.readiness}%`],
        ["Notas", client.coachNotes],
        ["Indices implicados", `ACWR ${loadData.acwr.toFixed(2)}, Hooper ${loadData.hooper}/25, Strain ${loadData.strain.toFixed(0)}`]
      ]
    },
    "strain": {
      title: "Detalle strain",
      items: [
        ["Carga semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Monotonia", loadData.monotony.toFixed(2)],
        ["Strain", loadData.strain.toFixed(0)],
        ["Estado", loadData.strainStatus]
      ]
    }
  };
  const selected = content[section];

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-moss">Clientes / {client.name} / Dashboard</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{selected.title}</h3>
        </div>
        <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={onClose} type="button">
          Cerrar
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {selected.items.map(([label, value]) => (
          <ClientInfoCard key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function MetricPill({ label, status, value }: { label: string; status: string; value: string }) {
  return (
    <article className={`rounded-md border p-3 ${dashboardStatusClass(status)}`}>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs font-semibold">{status}</p>
    </article>
  );
}
