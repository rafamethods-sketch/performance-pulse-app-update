"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  Dumbbell,
  FileText,
  Flag,
  Gauge,
  Paperclip,
  Repeat2,
  Ruler,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { calendarSessions } from "@/lib/data";
import type { CoachClientForViews, CoachSessionRecordForViews, TargetTrainingSession } from "./types";

const primaryCardClass = "mt-6 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5";
const dayCardClass = "min-h-[156px] rounded-md border border-line bg-panel/35 p-3";
const primaryButtonClass = "rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink/90";
const secondaryButtonClass = "rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-panel/60";
const emptyStateClass = "rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm font-semibold text-ink/55";
const compactChipClass = "flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-soft";

const calendarShortMonths: Record<string, string> = {
  Abr: "04",
  Ago: "08",
  Dic: "12",
  Ene: "01",
  Feb: "02",
  Jul: "07",
  Jun: "06",
  Mar: "03",
  May: "05",
  Nov: "11",
  Oct: "10",
  Sep: "09"
};

function parseDateValue(value?: string | null) {
  if (!value || value === "sin fecha") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateShort(value?: string | null) {
  const date = parseDateValue(value);
  if (!date) return value ?? "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function parseCalendarSessionDate(label: string, year: number) {
  const [day, monthLabel] = label.split(" ");
  const month = calendarShortMonths[monthLabel];
  if (!day || !month) return null;

  return `${year}-${month}-${day.padStart(2, "0")}`;
}

type WeeklyCalendarSession = {
  block?: string;
  clientId: string;
  clientName: string;
  date: Date;
  eventKind?: string;
  rpeTarget?: string;
  sessionDate?: string;
  sessionIndex?: number;
  sessionNumber?: string;
  status: "Planificada" | "Completada" | "Pendiente" | "Pendiente de revisar";
  summary: string;
  type: string;
  week?: string;
};

function addCalendarDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function getWeekStartDate(date: Date) {
  const weekStart = new Date(date);
  const day = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function getWeeklySessionStatus(session: CoachSessionRecordForViews): WeeklyCalendarSession["status"] {
  if (hasDisplayValue(session.duration) && hasDisplayValue(session.rpe) && hasDisplayValue(session.notes)) {
    return "Pendiente de revisar";
  }
  if (hasDisplayValue(session.duration) && hasDisplayValue(session.rpe)) return "Completada";
  return "Pendiente";
}

function getCalendarStatusClass(status: WeeklyCalendarSession["status"]) {
  switch (status) {
    case "Completada":
      return "border-moss/25 bg-mint text-moss";
    case "Pendiente de revisar":
      return "border-clay/25 bg-wheat text-clay";
    case "Pendiente":
      return "border-line bg-panel text-ink/60";
    case "Planificada":
    default:
      return "border-steel/25 bg-sky text-steel";
  }
}

function getCalendarStatusDotClass(status: WeeklyCalendarSession["status"]) {
  switch (status) {
    case "Completada":
      return "bg-moss";
    case "Pendiente de revisar":
      return "bg-clay";
    case "Pendiente":
      return "bg-ink/35";
    case "Planificada":
    default:
      return "bg-steel";
  }
}

function getCalendarTypeConfig(session: Pick<WeeklyCalendarSession, "eventKind" | "summary" | "type">) {
  const label = `${session.type} ${session.summary} ${session.eventKind ?? ""}`.toLowerCase();

  if (label.includes("lesi")) {
    return { Icon: AlertTriangle, className: "border-coral/25 bg-coral/10 text-coral", label: "Lesión" };
  }
  if (label.includes("foto")) {
    return { Icon: Camera, className: "border-line bg-panel/60 text-ink/55", label: "Foto" };
  }
  if (label.includes("archivo")) {
    return { Icon: Paperclip, className: "border-line bg-panel/60 text-ink/55", label: "Archivo" };
  }
  if (label.includes("nota")) {
    return { Icon: FileText, className: "border-line bg-panel/60 text-ink/55", label: "Nota" };
  }
  if (label.includes("compet")) {
    return { Icon: Flag, className: "border-clay/25 bg-wheat text-clay", label: "Competición" };
  }
  if (label.includes("antrop")) {
    return { Icon: Ruler, className: "border-violet/40 bg-violet text-ink", label: "Antropometría" };
  }
  if (label.includes("salto") || label.includes("jump")) {
    return { Icon: TrendingUp, className: "border-moss/25 bg-mint text-moss", label: "Test salto" };
  }
  if (label.includes("test") && (label.includes("resistencia") || label.includes("aerob") || label.includes("cardio"))) {
    return { Icon: Activity, className: "border-steel/25 bg-sky text-steel", label: "Test resistencia" };
  }
  if (label.includes("test")) {
    return { Icon: Gauge, className: "border-clay/25 bg-wheat text-clay", label: "Test fuerza" };
  }
  if (label.includes("concurrent") || label.includes("mixto")) {
    return { Icon: Repeat2, className: "border-clay/25 bg-wheat text-clay", label: "Concurrente" };
  }
  if (label.includes("resistencia") || label.includes("cardio") || label.includes("aerob") || label.includes("umbral")) {
    return { Icon: Zap, className: "border-steel/25 bg-sky text-steel", label: "Resistencia" };
  }
  if (label.includes("fuerza") || label.includes("strength")) {
    return { Icon: Dumbbell, className: "border-coral/25 bg-coral/10 text-coral", label: "Fuerza" };
  }

  return { Icon: Target, className: "border-line bg-white text-ink/70", label: "Sesión" };
}

function getCalendarSessionDetail(session: WeeklyCalendarSession) {
  return [
    `Deportista: ${session.clientName}`,
    `Fecha: ${formatDateShort(getDateKey(session.date))}`,
    `Estado: ${session.status}`,
    `Tipo: ${session.type}`,
    `Sesión: ${session.summary}`,
    `Bloque: ${session.block ?? "Sin asignar"}`,
    `Semana y sesión: ${[session.week, session.sessionNumber].filter(Boolean).join(" - ") || "Sin especificar"}`,
    `RPE objetivo: ${session.rpeTarget ?? "Sin especificar"}`
  ].join("\n");
}

function buildWeeklyCalendarSessions(clients: CoachClientForViews[], weekDates: Date[]) {
  const weekDateKeys = new Set(weekDates.map(getDateKey));
  const currentYear = weekDates[0]?.getFullYear() ?? new Date().getFullYear();
  const sessionsFromRecords: WeeklyCalendarSession[] = clients.flatMap((listedClient) =>
    (listedClient.sessionRecords ?? []).flatMap((session, sessionIndex) => {
      const date = parseDateValue(session.date);
      if (!date || !weekDateKeys.has(getDateKey(date))) return [];

      return [{
        block: listedClient.planning.currentBlock,
        clientId: listedClient.id,
        clientName: listedClient.name,
        date,
        sessionDate: session.date,
        sessionIndex,
        status: getWeeklySessionStatus(session),
        summary: session.summary,
        type: session.type,
        week: listedClient.planning.currentWeek
      } satisfies WeeklyCalendarSession];
    })
  );
  const sessionsFromPlanning: WeeklyCalendarSession[] = clients.flatMap((listedClient) =>
    (listedClient.planning.nextSessions ?? []).map((sessionName, index) => ({
      block: listedClient.planning.currentBlock,
      clientId: listedClient.id,
      clientName: listedClient.name,
      date: weekDates[index % weekDates.length],
      rpeTarget: "Sin especificar",
      sessionNumber: `Sesión ${index + 1}`,
      status: "Planificada" as const,
      summary: sessionName,
      type: listedClient.sport ?? listedClient.modality ?? "Sesión",
      week: listedClient.planning.currentWeek
    }))
  );
  const sessionsFromCalendar: WeeklyCalendarSession[] = calendarSessions.flatMap((session) => {
    const matchedClient = clients.find((listedClient) => listedClient.name === session.athlete);
    const dateLabel = parseCalendarSessionDate(session.date, currentYear);
    const date = dateLabel ? parseDateValue(dateLabel) : null;
    if (!matchedClient || !date || !weekDateKeys.has(getDateKey(date))) return [];

    return [{
      block: matchedClient.planning.currentBlock,
      clientId: matchedClient.id,
      clientName: matchedClient.name,
      date,
      eventKind: session.type,
      status: session.status === "Planificada" ? "Planificada" : "Pendiente" as WeeklyCalendarSession["status"],
      summary: session.title,
      type: session.type,
      week: matchedClient.planning.currentWeek
    } satisfies WeeklyCalendarSession];
  });

  return [...sessionsFromRecords, ...sessionsFromPlanning, ...sessionsFromCalendar].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md bg-panel/45 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

type CalendarViewProps = {
  client?: CoachClientForViews | null;
  clients: CoachClientForViews[];
  onOpenTrainingSession: (clientId: string, target?: TargetTrainingSession) => void;
};

export function CalendarView({ client, clients, onOpenTrainingSession }: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState<WeeklyCalendarSession | null>(null);
  const baseWeekStart = getWeekStartDate(new Date());
  const selectedWeekStart = addCalendarDays(baseWeekStart, weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, index) => addCalendarDays(selectedWeekStart, index));
  const weekLabels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const visibleClients = client ? [client] : clients;
  const weeklySessions = buildWeeklyCalendarSessions(visibleClients, weekDates);
  const sessionsByDay = weekDates.map((date) => ({
    date,
    label: weekLabels[(date.getDay() + 6) % 7],
    sessions: weeklySessions.filter((session) => getDateKey(session.date) === getDateKey(date))
  }));
  const weekEnd = weekDates[6];
  const weekRangeLabel = `Semana del ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(selectedWeekStart)} al ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(weekEnd)}`;
  const sessionLegendItems = [
    { Icon: Dumbbell, className: "border-coral/25 bg-coral/10 text-coral", label: "Fuerza" },
    { Icon: Zap, className: "border-steel/25 bg-sky text-steel", label: "Resistencia" },
    { Icon: Repeat2, className: "border-clay/25 bg-wheat text-clay", label: "Concurrente" }
  ];
  const eventLegendItems = [
    { Icon: Gauge, className: "border-clay/25 bg-wheat text-clay", label: "Test fuerza" },
    { Icon: Activity, className: "border-steel/25 bg-sky text-steel", label: "Test resistencia" },
    { Icon: TrendingUp, className: "border-moss/25 bg-mint text-moss", label: "Test salto" },
    { Icon: Flag, className: "border-clay/25 bg-wheat text-clay", label: "Competición" },
    { Icon: AlertTriangle, className: "border-coral/25 bg-coral/10 text-coral", label: "Lesión" },
    { Icon: FileText, className: "border-line bg-panel/60 text-ink/55", label: "Nota" },
    { Icon: Camera, className: "border-line bg-panel/60 text-ink/55", label: "Foto" },
    { Icon: Paperclip, className: "border-line bg-panel/60 text-ink/55", label: "Archivo" }
  ];

  function openCalendarSession(session: WeeklyCalendarSession) {
    if (session.sessionIndex !== undefined || session.sessionDate) {
      onOpenTrainingSession(session.clientId, {
        clientId: session.clientId,
        sessionDate: session.sessionDate ?? getDateKey(session.date),
        sessionIndex: session.sessionIndex
      });
      return;
    }

    onOpenTrainingSession(session.clientId, { clientId: session.clientId });
  }

  return (
    <section className={primaryCardClass}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {client ? "Semana del cliente" : "Semana de trabajo"}
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            {client ? "Vista semanal de sesiones del deportista seleccionado." : "Vista semanal de sesiones de todos los deportistas."}
          </p>
          <p className="mt-2 text-sm font-semibold text-moss">{weekRangeLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={secondaryButtonClass}
            onClick={() => setWeekOffset((current) => current - 1)}
            type="button"
          >
            Semana anterior
          </button>
          <button
            className={primaryButtonClass}
            onClick={() => setWeekOffset(0)}
            type="button"
          >
            Esta semana
          </button>
          <button
            className={secondaryButtonClass}
            onClick={() => setWeekOffset((current) => current + 1)}
            type="button"
          >
            Semana siguiente
          </button>
        </div>
      </div>

      {client ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ClientInfoCard label="Evento objetivo" value={client.nextEvent ?? "Sin especificar"} />
          <ClientInfoCard label="Bloque / mesociclo" value={client.planning.currentBlock} />
          <ClientInfoCard label="Semana" value={client.planning.currentWeek} />
        </div>
      ) : null}

      {weeklySessions.length === 0 ? (
        <div className={`mt-5 ${emptyStateClass}`}>
          No hay sesiones programadas esta semana.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {sessionsByDay.map(({ date, label, sessions }) => (
            <section className={dayCardClass} key={getDateKey(date)}>
              <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-moss">
                    {new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date)}
                  </p>
                </div>
                <p className="rounded-md bg-white px-2 py-1 text-xs font-semibold uppercase text-ink/45">
                  {new Intl.DateTimeFormat("es-ES", { month: "short" }).format(date)}
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {sessions.length > 0 ? (
                  sessions.map((session, index) => {
                    const typeConfig = getCalendarTypeConfig(session);
                    const Icon = typeConfig.Icon;
                    const detail = getCalendarSessionDetail(session);

                    return (
                      <button
                        aria-label={detail}
                        className={`${compactChipClass} ${typeConfig.className}`}
                        key={`${session.clientId}-${session.summary}-${index}`}
                        onClick={() => setSelectedSession(session)}
                        title={detail}
                        type="button"
                      >
                        <Icon className="shrink-0" size={14} />
                        <span className={`size-1.5 shrink-0 rounded-full ${getCalendarStatusDotClass(session.status)}`} />
                        <span className="truncate">{client ? session.summary : session.clientName}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-1 py-2 text-xs font-semibold text-ink/35">
                    Sin sesiones
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-md border border-line bg-panel/35 p-3">
        <div className="grid gap-3 lg:grid-cols-2">
          <CalendarLegendGroup items={sessionLegendItems} title="Sesiones" />
          <CalendarLegendGroup items={eventLegendItems} title="Eventos" />
        </div>
      </div>

      {selectedSession ? (
        <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-moss">Detalle seleccionado</p>
              <h3 className="mt-1 text-base font-semibold text-ink">{selectedSession.summary}</h3>
              <p className="mt-1 text-sm text-ink/55">{selectedSession.clientName} - {formatDateShort(getDateKey(selectedSession.date))}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${getCalendarStatusClass(selectedSession.status)}`}>
                {selectedSession.status}
              </span>
              <button className={primaryButtonClass} onClick={() => openCalendarSession(selectedSession)} type="button">
                Ver sesión
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ClientInfoCard label="Tipo" value={selectedSession.type || "Sin especificar"} />
            <ClientInfoCard label="Bloque / mesociclo" value={selectedSession.block ?? "Sin asignar"} />
            <ClientInfoCard label="Semana y sesión" value={[selectedSession.week, selectedSession.sessionNumber].filter(Boolean).join(" - ") || "Sin especificar"} />
            <ClientInfoCard label="RPE objetivo" value={selectedSession.rpeTarget ?? "Sin especificar"} />
          </div>
        </section>
      ) : null}
    </section>
  );
}

function CalendarLegendGroup({
  items,
  title
}: {
  items: Array<{ Icon: typeof Dumbbell; className: string; label: string }>;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ink/45">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map(({ Icon, className, label }) => (
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${className}`} key={label}>
            <Icon size={13} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
