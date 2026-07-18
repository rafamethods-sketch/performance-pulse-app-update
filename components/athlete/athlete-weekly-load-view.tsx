"use client";

import { useMemo } from "react";
import { calculateSessionLoad } from "@/lib/client-metrics";

type AthleteWeeklySession = {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: unknown[];
  rpe?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  type: string;
};

type AthleteWeeklyClient = {
  sessionRecords?: AthleteWeeklySession[];
};

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function hasRealSessionData(session: AthleteWeeklySession) {
  return Boolean(
    session.completed ||
    hasDisplayValue(session.duration) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function getSessionSrpe(session: AthleteWeeklySession) {
  if (hasDisplayValue(session.sRPE)) {
    const parsedSrpe = Number(session.sRPE);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }
  if (hasDisplayValue(session.srpe)) {
    const parsedSrpe = Number(session.srpe);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }

  const duration = Number(session.actualDurationMinutes ?? session.duration);
  const rpe = Number(session.finalRpe ?? session.rpe);

  if (!Number.isFinite(duration) || !Number.isFinite(rpe) || duration <= 0 || rpe <= 0) return null;
  return calculateSessionLoad(rpe, duration);
}

function getAthleteSessionDuration(session: AthleteWeeklySession) {
  return session.actualDurationMinutes ?? session.duration ?? null;
}

function getAthleteSessionRpe(session: AthleteWeeklySession) {
  return session.finalRpe ?? session.rpe ?? null;
}

function getAthleteDate(value?: string | null) {
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

function isThisWeek(value?: string | null) {
  const date = getAthleteDate(value);
  if (!date) return false;

  const start = new Date();
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md bg-panel/45 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function AthleteWeeklyLoadView({ client }: { client: AthleteWeeklyClient | null }) {
  const weeklySessions = useMemo(
    () => ((client?.sessionRecords ?? []) as AthleteWeeklySession[])
      .filter((session) => hasRealSessionData(session) && isThisWeek(session.date)),
    [client?.sessionRecords]
  );
  const totalDuration = weeklySessions.reduce((total, session) => total + Number(getAthleteSessionDuration(session) ?? 0), 0);
  const totalSrpe = weeklySessions.reduce((total, session) => total + (getSessionSrpe(session) ?? 0), 0);
  const rpeValues = weeklySessions
    .map((session) => Number(getAthleteSessionRpe(session)))
    .filter((value) => Number.isFinite(value) && value > 0);
  const averageRpe = rpeValues.length > 0
    ? rpeValues.reduce((total, value) => total + value, 0) / rpeValues.length
    : null;
  const plannedThisWeek = (client?.sessionRecords ?? []).filter((session) => isThisWeek(session.date)).length;
  const adherence = plannedThisWeek > 0 ? Math.round((weeklySessions.length / plannedThisWeek) * 100) : null;
  const maxSrpe = Math.max(1, ...weeklySessions.map((session) => getSessionSrpe(session) ?? 0));

  if (!client || weeklySessions.length === 0) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        Todavía no hay suficientes sesiones registradas esta semana.
      </div>
    );
  }

  return (
    <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
      <h2 className="text-lg font-semibold text-ink">Carga semanal</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ClientInfoCard label="Sesiones completadas" value={`${weeklySessions.length}`} />
        <ClientInfoCard label="Duración total" value={`${totalDuration} min`} />
        <ClientInfoCard label="sRPE semanal" value={`${totalSrpe} UA`} />
        <ClientInfoCard label="RPE medio" value={averageRpe !== null ? `${averageRpe.toFixed(1)}/10` : "Pendiente"} />
      </div>
      {adherence !== null ? (
        <div className="mt-4 rounded-md bg-panel/45 p-3 text-sm font-semibold text-ink/70">
          Adherencia semanal: {adherence}%
        </div>
      ) : null}
      <div className="mt-5 grid gap-3">
        {weeklySessions.map((session, index) => {
          const srpe = getSessionSrpe(session) ?? 0;

          return (
            <article className="rounded-md border border-line bg-panel/35 p-3" key={`${session.date}-${index}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">{displayValue(session.type, "Sesión")}</p>
                  <p className="text-sm text-ink/55">{displayValue(session.date, "Sin fecha")}</p>
                </div>
                <span className="text-sm font-semibold text-moss">{srpe} UA</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${(srpe / maxSrpe) * 100}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
