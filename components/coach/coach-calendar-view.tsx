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
import type { CoachClientForViews, CoachSessionRecordForViews, TargetTrainingSession } from "./types";

const primaryCardClass = "mt-6 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5";
const dayCardClass = "min-h-[156px] rounded-md border border-line bg-panel/35 p-3";
const primaryButtonClass = "rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink/90";
const secondaryButtonClass = "rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-panel/60";
const emptyStateClass = "rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm font-semibold text-ink/55";
const compactChipClass = "flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-soft";

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

  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
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
  time?: string | null;
  type: string;
  week?: string;
};

type CalendarSessionAction = "duplicate" | "move" | "recurring";

const recurringWeekdayOptions = [
  { label: "Lunes", value: 0 },
  { label: "Martes", value: 1 },
  { label: "Miércoles", value: 2 },
  { label: "Jueves", value: 3 },
  { label: "Viernes", value: 4 },
  { label: "Sábado", value: 5 },
  { label: "Domingo", value: 6 }
];

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

function getCalendarWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function getWeekdayLabel(date: Date) {
  return recurringWeekdayOptions[getCalendarWeekdayIndex(date)]?.label ?? "";
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
    return { Icon: AlertTriangle, className: "border-coral/30 bg-coral/10 text-coral", label: "Lesión" };
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
    return { Icon: TrendingUp, className: "border-violet/40 bg-violet/20 text-ink", label: "Test salto" };
  }
  if (label.includes("test") && (label.includes("resistencia") || label.includes("aerob") || label.includes("cardio"))) {
    return { Icon: Activity, className: "border-cyan-300/50 bg-cyan-100 text-cyan-800", label: "Test resistencia" };
  }
  if (label.includes("test")) {
    return { Icon: Gauge, className: "border-amber-300/60 bg-amber-100 text-amber-800", label: "Test fuerza" };
  }
  if (label.includes("concurrent") || label.includes("mixto")) {
    return { Icon: Repeat2, className: "border-orange-300/60 bg-orange-100 text-orange-800", label: "Concurrente" };
  }
  if (label.includes("resistencia") || label.includes("cardio") || label.includes("aerob") || label.includes("umbral")) {
    return { Icon: Zap, className: "border-steel/25 bg-sky text-steel", label: "Resistencia" };
  }
  if (label.includes("fuerza") || label.includes("strength")) {
    return { Icon: Dumbbell, className: "border-indigo-300/50 bg-indigo-100 text-indigo-800", label: "Fuerza" };
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
        time: session.time,
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

  return [...sessionsFromRecords, ...sessionsFromPlanning].sort((a, b) => a.date.getTime() - b.date.getTime());
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
  onCreateRecurringSessions: (clientId: string, sessionIndex: number, dates: string[], time?: string) => number;
  onDuplicateSession: (clientId: string, sessionIndex: number, newDate: string, newTime?: string) => void;
  onMoveSession: (clientId: string, sessionIndex: number, newDate: string, newTime?: string) => void;
  onOpenTrainingSession: (clientId: string, target?: TargetTrainingSession) => void;
};

export function CalendarView({ client, clients, onCreateRecurringSessions, onDuplicateSession, onMoveSession, onOpenTrainingSession }: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState<WeeklyCalendarSession | null>(null);
  const [sessionAction, setSessionAction] = useState<CalendarSessionAction | null>(null);
  const [actionDate, setActionDate] = useState("");
  const [actionTime, setActionTime] = useState("");
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringMessage, setRecurringMessage] = useState("");
  const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([]);
  const [recurringWeeks, setRecurringWeeks] = useState("4");
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
    { Icon: Dumbbell, className: "border-indigo-300/50 bg-indigo-100 text-indigo-800", label: "Fuerza" },
    { Icon: Zap, className: "border-steel/25 bg-sky text-steel", label: "Resistencia" },
    { Icon: Repeat2, className: "border-clay/25 bg-wheat text-clay", label: "Concurrente" }
  ];
  const eventLegendItems = [
    { Icon: Gauge, className: "border-amber-300/60 bg-amber-100 text-amber-800", label: "Test fuerza" },
    { Icon: Activity, className: "border-cyan-300/50 bg-cyan-100 text-cyan-800", label: "Test resistencia" },
    { Icon: TrendingUp, className: "border-violet/40 bg-violet/20 text-ink", label: "Test salto" },
    { Icon: Flag, className: "border-clay/25 bg-wheat text-clay", label: "Competición" },
    { Icon: AlertTriangle, className: "border-coral/25 bg-coral/10 text-coral", label: "Lesión" },
    { Icon: FileText, className: "border-line bg-panel/60 text-ink/55", label: "Nota" },
    { Icon: Camera, className: "border-line bg-panel/60 text-ink/55", label: "Foto" },
    { Icon: Paperclip, className: "border-line bg-panel/60 text-ink/55", label: "Archivo" }
  ];
  const recurringDates = getRecurringDates();

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

  function openSessionAction(action: CalendarSessionAction, session: WeeklyCalendarSession) {
    setSelectedSession(session);
    setSessionAction(action);
    setActionDate(getDateKey(session.date));
    setActionTime(session.time ?? "");
    setRecurringEndDate("");
    setRecurringMessage("");
    setRecurringWeekdays([getCalendarWeekdayIndex(session.date)]);
    setRecurringWeeks("4");
  }

  function closeSessionAction() {
    setSessionAction(null);
    setActionDate("");
    setActionTime("");
    setRecurringEndDate("");
    setRecurringMessage("");
    setRecurringWeekdays([]);
    setRecurringWeeks("4");
  }

  function getRecurringDates() {
    if (sessionAction !== "recurring") return [];
    const startDate = parseDateValue(actionDate);
    if (!startDate || recurringWeekdays.length === 0) return [];

    const weekCount = Math.max(1, Number.parseInt(recurringWeeks, 10) || 1);
    const explicitEndDate = parseDateValue(recurringEndDate);
    const endDate = explicitEndDate ?? addCalendarDays(startDate, (weekCount * 7) - 1);
    const dates: Date[] = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (cursor <= endDate) {
      if (recurringWeekdays.includes(getCalendarWeekdayIndex(cursor))) {
        dates.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  function toggleRecurringWeekday(weekday: number) {
    setRecurringWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((value) => value !== weekday)
        : [...current, weekday].sort((a, b) => a - b)
    );
    setRecurringMessage("");
  }

  function submitSessionAction() {
    if (!selectedSession || selectedSession.sessionIndex === undefined || !actionDate) return;

    if (sessionAction === "duplicate") {
      onDuplicateSession(selectedSession.clientId, selectedSession.sessionIndex, actionDate, actionTime);
      closeSessionAction();
      return;
    }

    if (sessionAction === "recurring") {
      const dates = recurringDates.map(getDateKey);
      if (dates.length === 0) {
        setRecurringMessage("Selecciona al menos un día y un rango válido.");
        return;
      }
      const createdCount = onCreateRecurringSessions(selectedSession.clientId, selectedSession.sessionIndex, dates, actionTime);
      setRecurringMessage(
        createdCount > 0
          ? `Se han creado ${createdCount} sesiones recurrentes.`
          : "No se han creado sesiones recurrentes."
      );
      return;
    }

    if (sessionAction === "move") {
      const isCompleted = selectedSession.status === "Completada" || selectedSession.status === "Pendiente de revisar";
      if (isCompleted && !window.confirm("Esta sesión ya está completada. ¿Seguro que quieres moverla?")) return;
      onMoveSession(selectedSession.clientId, selectedSession.sessionIndex, actionDate, actionTime);
      setSelectedSession({
        ...selectedSession,
        date: parseDateValue(actionDate) ?? selectedSession.date,
        sessionDate: actionDate,
        time: actionTime || undefined
      });
      closeSessionAction();
    }
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
              {selectedSession.sessionIndex !== undefined ? (
                <>
                  <button className={secondaryButtonClass} onClick={() => openSessionAction("duplicate", selectedSession)} type="button">
                    Duplicar sesión
                  </button>
                  <button className={secondaryButtonClass} onClick={() => openSessionAction("move", selectedSession)} type="button">
                    Mover sesión
                  </button>
                  <button className={secondaryButtonClass} onClick={() => openSessionAction("recurring", selectedSession)} type="button">
                    Crear recurrencia
                  </button>
                </>
              ) : null}
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

      {sessionAction && selectedSession ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
          onClick={closeSessionAction}
          role="dialog"
        >
          <section
            className="w-full max-w-lg rounded-md border border-line bg-white p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-moss">
                  {sessionAction === "duplicate" ? "Duplicar sesión" : sessionAction === "move" ? "Mover sesión" : "Crear recurrencia"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{selectedSession.summary}</h3>
                <p className="mt-1 text-sm text-ink/55">{selectedSession.clientName}</p>
              </div>
              <button
                aria-label="Cerrar"
                className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink"
                onClick={closeSessionAction}
                type="button"
              >
                Cerrar
              </button>
            </div>
            {sessionAction === "recurring" ? (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ClientInfoCard label="Fecha de inicio" value={formatDateShort(actionDate)} />
                  <ClientInfoCard label="Frecuencia" value="Semanal" />
                </div>
                <label className="space-y-2 text-sm font-semibold text-ink/70">
                  Fecha de inicio
                  <input
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => {
                      setActionDate(event.target.value);
                      setRecurringMessage("");
                    }}
                    type="date"
                    value={actionDate}
                  />
                </label>
                <div>
                  <p className="text-sm font-semibold text-ink/70">Días de la semana</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recurringWeekdayOptions.map((weekday) => (
                      <button
                        aria-pressed={recurringWeekdays.includes(weekday.value)}
                        className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                          recurringWeekdays.includes(weekday.value) ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70"
                        }`}
                        key={weekday.value}
                        onClick={() => toggleRecurringWeekday(weekday.value)}
                        type="button"
                      >
                        {weekday.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-ink/70">
                    Número de semanas
                    <input
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      inputMode="numeric"
                      onChange={(event) => {
                        setRecurringWeeks(event.target.value);
                        setRecurringMessage("");
                      }}
                      type="text"
                      value={recurringWeeks}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-ink/70">
                    O fecha final
                    <input
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => {
                        setRecurringEndDate(event.target.value);
                        setRecurringMessage("");
                      }}
                      type="date"
                      value={recurringEndDate}
                    />
                  </label>
                </div>
                {selectedSession.time || actionTime ? (
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
                    <input
                      checked={Boolean(actionTime)}
                      onChange={(event) => setActionTime(event.target.checked ? selectedSession.time ?? "" : "")}
                      type="checkbox"
                    />
                    Mantener misma hora{selectedSession.time ? ` (${selectedSession.time})` : ""}
                  </label>
                ) : null}
                <div className="rounded-md border border-line bg-panel/35 p-3">
                  <p className="text-sm font-semibold text-ink">
                    Se crearán {recurringDates.length} sesiones para {selectedSession.clientName}
                    {recurringDates.length > 0 ? ` entre ${formatDateShort(getDateKey(recurringDates[0]))} y ${formatDateShort(getDateKey(recurringDates[recurringDates.length - 1]))}.` : "."}
                  </p>
                  {recurringDates.length > 0 ? (
                    <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto">
                      {recurringDates.map((date) => (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 text-sm" key={getDateKey(date)}>
                          <span className="font-semibold text-ink">{formatDateShort(getDateKey(date))}</span>
                          <span className="text-ink/55">{getWeekdayLabel(date)}</span>
                          <span className="truncate text-ink/65">{selectedSession.summary || selectedSession.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-ink/50">Selecciona días y rango para ver el resumen.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3">
                  <ClientInfoCard label="Fecha actual" value={formatDateShort(getDateKey(selectedSession.date))} />
                  <label className="space-y-2 text-sm font-semibold text-ink/70">
                    Nueva fecha
                    <input
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => setActionDate(event.target.value)}
                      type="date"
                      value={actionDate}
                    />
                  </label>
                  {selectedSession.time || actionTime ? (
                    <label className="space-y-2 text-sm font-semibold text-ink/70">
                      Nueva hora
                      <input
                        className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => setActionTime(event.target.value)}
                        type="time"
                        value={actionTime}
                      />
                    </label>
                  ) : null}
                </div>
                {sessionAction === "duplicate" ? (
                  <p className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/60">
                    Se duplicará solo la planificación. No se copiarán registros realizados, vídeos enviados ni revisiones.
                  </p>
                ) : null}
              </>
            )}
            {recurringMessage ? (
              <p className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm font-semibold text-ink/65">
                {recurringMessage}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className={secondaryButtonClass} onClick={closeSessionAction} type="button">
                Cancelar
              </button>
              <button
                className={primaryButtonClass}
                disabled={!actionDate || (sessionAction === "recurring" && recurringDates.length === 0)}
                onClick={submitSessionAction}
                type="button"
              >
                {sessionAction === "duplicate" ? "Duplicar" : sessionAction === "move" ? "Mover" : "Crear sesiones"}
              </button>
            </div>
          </section>
        </div>
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
