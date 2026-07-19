"use client";

import { useMemo } from "react";

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
  if (session.reviewStatus === "reviewed") return "Revisada";
  if (hasRealSessionData(session)) return session.reviewStatus === "pending" ? "Pendiente de revisar" : "Completada";
  return "Planificada";
}

function getStatusClass(status: string) {
  if (status === "Revisada") return "bg-mint text-moss";
  if (status === "Pendiente de revisar") return "bg-amber-100 text-amber-800";
  if (status === "Completada") return "bg-blue-50 text-blue-700";
  if (status === "Planificada") return "bg-blue-50 text-blue-700";
  return "bg-panel text-ink/45";
}

export function AthleteCalendarView({ client }: { client: AthleteCalendarClient | null }) {
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

  if (!client) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        No hay deportista seleccionado.
      </div>
    );
  }

  return (
    <section className="mt-5 grid gap-5">
      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Calendario</h2>
            <p className="mt-1 text-sm text-ink/60">Semana actual de entrenamientos de {displayValue(client.name, "tu planificación")}.</p>
          </div>
          <span className="w-fit rounded-md bg-panel px-3 py-1 text-xs font-semibold text-ink/55">
            Lunes a domingo
          </span>
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate.get(day.key) ?? [];

          return (
            <article className="rounded-md border border-line bg-white p-4 shadow-soft" key={day.key}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{day.label}</h3>
                  <p className="text-xs font-medium text-ink/50">{day.shortDate}</p>
                </div>
                {daySessions.length === 0 ? (
                  <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${getStatusClass("Sin sesión")}`}>
                    Sin sesión
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2">
                {daySessions.length > 0 ? daySessions.map((session, index) => {
                  const status = getAthleteSessionStatus(session);

                  return (
                    <div className="rounded-md border border-line bg-panel/35 p-3" key={`${day.key}-${index}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{displayValue(session.type, "Sesión")}</p>
                        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-ink/60">
                        {displayValue(session.summary, "Sin resumen")}
                      </p>
                    </div>
                  );
                }) : (
                  <p className="rounded-md border border-dashed border-line bg-panel/35 p-4 text-center text-xs font-semibold text-ink/45">
                    Sin sesión
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
