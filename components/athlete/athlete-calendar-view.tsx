"use client";

import { useMemo } from "react";
import { CalendarCheck2, Check, ChevronRight, MoonStar } from "lucide-react";
import { getPlannedSessionImpact, getSessionImpact, getSessionImpactStyle } from "@/lib/session-impact";

type AthleteCalendarSession = {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: unknown[];
  plannedExercises?: unknown[];
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  status?: string | null;
  summary?: string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  type?: string | null;
};

type AthleteCalendarClient = {
  name?: string;
  sessionRecords?: AthleteCalendarSession[];
};

const athleteWeekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const athleteShortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseAthleteCalendarDate(value?: string | null) {
  if (!value) return null;
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

function getWeekStartDate(date = new Date()) {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function hasRealSessionData(session: AthleteCalendarSession) {
  return Boolean(
    session.completed ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function getAthleteSessionStatus(session?: AthleteCalendarSession) {
  if (!session) return "Sin sesión";
  if (hasRealSessionData(session)) return "Completada";
  return "Planificada";
}

function getStatusClass(status: string) {
  if (status === "Revisada") return "bg-mint text-moss";
  if (status === "Pendiente de revisar") return "bg-wheat text-clay";
  if (status === "Completada") return "bg-mint text-moss";
  if (status === "Planificada") return "bg-wheat text-clay";
  return "bg-panel text-ink/45";
}

export function AthleteCalendarView({ client }: { client: AthleteCalendarClient | null }) {
  const todayKey = getLocalDateKey(new Date());
  const weekDays = useMemo(() => {
    const start = getWeekStartDate();
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      return {
        date,
        key: getLocalDateKey(date),
        label: athleteWeekdays[index],
        shortDate: `${date.getDate()} ${athleteShortMonths[date.getMonth()]}`
      };
    });
  }, []);

  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, AthleteCalendarSession[]>();
    (client?.sessionRecords ?? []).forEach((session) => {
      const parsedDate = parseAthleteCalendarDate(session.date);
      if (!parsedDate) return;
      const key = getLocalDateKey(parsedDate);
      grouped.set(key, [...(grouped.get(key) ?? []), session]);
    });
    return grouped;
  }, [client?.sessionRecords]);
  const today = weekDays.find((day) => day.key === todayKey);
  const todaySessions = sessionsByDate.get(todayKey) ?? [];
  const nextDayWithSessions = weekDays.find((day) => day.key > todayKey && (sessionsByDate.get(day.key)?.length ?? 0) > 0);
  const nextSessions = nextDayWithSessions ? sessionsByDate.get(nextDayWithSessions.key) ?? [] : [];
  const weekSessions = weekDays.flatMap((day) => sessionsByDate.get(day.key) ?? []);
  const plannedSessionCount = weekSessions.length;
  const completedSessionCount = weekSessions.filter(hasRealSessionData).length;
  const completionPercentage = plannedSessionCount > 0
    ? Math.round((completedSessionCount / plannedSessionCount) * 100)
    : 0;
  const weekRange = weekDays.length > 0
    ? `${weekDays[0].shortDate} — ${weekDays[weekDays.length - 1].shortDate}`
    : "";

  if (!client) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        No hay deportista seleccionado.
      </div>
    );
  }

  return (
    <section className="mt-5 grid w-full min-w-0 gap-5">
      <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-moss">Plan semanal</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Tu plan, de un vistazo</h2>
              <p className="mt-1 text-sm font-medium text-ink/55">{weekRange}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-panel/60 px-4 py-3">
              <span className="grid size-10 place-items-center rounded-full bg-white text-moss shadow-sm">
                <CalendarCheck2 aria-hidden="true" size={19} />
              </span>
              <div>
                <p className="text-lg font-bold leading-none text-ink">{completedSessionCount} de {plannedSessionCount}</p>
                <p className="mt-1 text-xs font-medium text-ink/50">sesiones completadas</p>
              </div>
            </div>
          </div>

          {plannedSessionCount > 0 ? (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink/55">
                <span>Progreso semanal</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-panel">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-steel to-moss transition-[width]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-line bg-panel/35 px-4 py-3 text-sm font-medium text-ink/55">
              No tienes sesiones planificadas esta semana.
            </p>
          )}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-moss/25 bg-gradient-to-br from-mint/60 to-panel/40 p-4 shadow-soft sm:p-5">
        {todaySessions.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-moss">
              <span className="size-2 rounded-full bg-moss" />
              Hoy · {today?.shortDate}
            </div>
            <p className="mt-2 text-xl font-semibold text-ink">{displayValue(todaySessions[0].type, "Sesión programada")}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/60">{displayValue(todaySessions[0].summary, "Consulta el resumen de tu sesión.")}</p>
            {todaySessions.length > 1 ? (
              <p className="mt-3 text-xs font-semibold text-ink/50">Además tienes {todaySessions.length - 1} {todaySessions.length === 2 ? "sesión" : "sesiones"} hoy.</p>
            ) : null}
          </div>
        ) : nextDayWithSessions ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-moss">
              <ChevronRight aria-hidden="true" size={15} />
              Próxima sesión · {nextDayWithSessions.label} {nextDayWithSessions.shortDate}
            </div>
            <p className="mt-2 text-xl font-semibold text-ink">{displayValue(nextSessions[0]?.type, "Sesión programada")}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/60">{displayValue(nextSessions[0]?.summary, "Hoy descansas. Tu próxima sesión ya está preparada.")}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-moss">
              <MoonStar aria-hidden="true" size={15} />
              Hoy · Descanso
            </div>
            <p className="mt-2 text-xl font-semibold text-ink">No hay más sesiones pendientes esta semana</p>
            <p className="mt-1 text-sm text-ink/60">Revisa debajo lo que ya has completado.</p>
          </div>
        )}
      </article>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate.get(day.key) ?? [];
          const isToday = day.key === todayKey;

          return (
            <article
              className={`min-w-0 rounded-2xl border p-4 shadow-soft ${isToday ? "border-moss/40 bg-mint/40 ring-1 ring-moss/20" : "border-line bg-white"}`}
              key={day.key}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{day.label}</h3>
                    {isToday ? <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold uppercase text-moss">Hoy</span> : null}
                  </div>
                  <p className="text-xs font-medium text-ink/50">{day.shortDate}</p>
                </div>
                {daySessions.length === 0 ? (
                  <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink/45">
                    Descanso
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2">
                {daySessions.length > 0 ? daySessions.map((session, index) => {
                  const status = getAthleteSessionStatus(session);
                  const displayStatus = status === "Planificada" ? "Pendiente" : status;
                  const isPlannedImpact = status !== "Completada";
                  const impact = isPlannedImpact
                    ? getPlannedSessionImpact(session as Parameters<typeof getPlannedSessionImpact>[0])
                    : getSessionImpact(session);
                  const showImpact = !isPlannedImpact || impact.level !== "unknown";
                  const impactStyle = impact ? getSessionImpactStyle(impact.level) : null;

                  return (
                    <div className="rounded-xl border border-line bg-panel/60 p-3" key={`${day.key}-${index}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{displayValue(session.type, "Sesión")}</p>
                        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${getStatusClass(status)}`}>
                          {displayStatus === "Completada" ? <Check aria-hidden="true" className="mr-1 inline" size={12} /> : null}
                          {displayStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-ink/60">
                        {displayValue(session.summary, "Sin resumen")}
                      </p>
                      {showImpact && impactStyle ? (
                        <span className={`mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${impactStyle.badgeClassName}`}>
                          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${impactStyle.dotClassName}`} />
                          {isPlannedImpact ? `Previsto: ${impact.label}` : impact.label}
                        </span>
                      ) : null}
                    </div>
                  );
                }) : (
                  <p className="rounded-xl border border-dashed border-line bg-panel/25 p-4 text-center text-xs font-medium text-ink/45">
                    Día de descanso
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
