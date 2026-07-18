"use client";

import { useMemo } from "react";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { getExerciseById } from "@/lib/exercises";

type AthleteWeeklyExercise = {
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  name?: string | null;
  section?: string | null;
};

type AthleteWeeklySession = {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: AthleteWeeklyExercise[];
  plannedExercises?: AthleteWeeklyExercise[];
  rpe?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  summary?: string | null;
  type: string;
};

type AthleteWeeklyClient = {
  sessionRecords?: AthleteWeeklySession[];
};

type FatigueZone = {
  key: string;
  label: string;
  keywords: string[];
};

const fatigueZones: FatigueZone[] = [
  {
    key: "anteriorLower",
    label: "Tren inferior anterior",
    keywords: ["squat", "sentadilla", "prensa", "hack", "lunge", "zancada", "split", "quad", "cuadriceps", "extensión"]
  },
  {
    key: "posteriorLower",
    label: "Tren inferior posterior",
    keywords: ["hinge", "deadlift", "peso muerto", "rumano", "rdl", "curl femoral", "femoral", "isquio", "hamstring"]
  },
  {
    key: "glutesHip",
    label: "Glúteos / cadera",
    keywords: ["glute", "glúteo", "cadera", "hip thrust", "puente", "bridge", "abducción"]
  },
  {
    key: "upperPush",
    label: "Empuje superior",
    keywords: ["press", "bench", "banca", "push", "empuje", "flexión", "fondos", "hombro"]
  },
  {
    key: "upperPull",
    label: "Tirón superior",
    keywords: ["pull", "row", "remo", "dominada", "chin", "jalón", "tirón", "tracción"]
  },
  {
    key: "core",
    label: "Core",
    keywords: ["core", "plank", "plancha", "dead bug", "bird dog", "pallof", "anti", "carry"]
  }
];

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

function getLoadIndex(totalSrpe: number) {
  if (totalSrpe >= 700) {
    return {
      label: "Muy alta",
      message: "Carga muy alta. Coméntalo con tu entrenador si notas fatiga.",
      className: "bg-red-50 text-red-700",
      barClassName: "bg-red-500"
    };
  }
  if (totalSrpe >= 450) {
    return {
      label: "Alta",
      message: "Carga alta. Cuida la recuperación.",
      className: "bg-amber-100 text-amber-800",
      barClassName: "bg-amber-500"
    };
  }
  if (totalSrpe >= 200) {
    return {
      label: "Moderada",
      message: "Carga moderada.",
      className: "bg-blue-50 text-blue-700",
      barClassName: "bg-steel"
    };
  }
  return {
    label: "Baja",
    message: "Carga baja esta semana.",
    className: "bg-mint text-moss",
    barClassName: "bg-moss"
  };
}

function getExerciseText(exercise: AthleteWeeklyExercise) {
  const libraryExercise = exercise.exerciseId ? getExerciseById(exercise.exerciseId) : null;
  return [
    exercise.exerciseName,
    exercise.name,
    libraryExercise?.name,
    libraryExercise?.pattern,
    exercise.block,
    exercise.section
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSessionExercises(session: AthleteWeeklySession) {
  return session.performedExercises?.length ? session.performedExercises : session.plannedExercises ?? [];
}

function getFatigueZoneScores(sessions: AthleteWeeklySession[]) {
  const scores = Object.fromEntries(fatigueZones.map((zone) => [zone.key, 0])) as Record<string, number>;

  sessions.forEach((session) => {
    getSessionExercises(session).forEach((exercise) => {
      const text = getExerciseText(exercise);
      fatigueZones.forEach((zone) => {
        if (zone.keywords.some((keyword) => text.includes(keyword))) {
          scores[zone.key] += 1;
        }
      });
    });
  });

  return scores;
}

function getZoneLevel(score: number, maxScore: number) {
  if (score <= 0 || maxScore <= 0) return { label: "Bajo", className: "bg-panel text-ink/45" };
  const ratio = score / maxScore;
  if (ratio >= 0.67) return { label: "Alto", className: "bg-amber-100 text-amber-800" };
  if (ratio >= 0.34) return { label: "Moderado", className: "bg-blue-50 text-blue-700" };
  return { label: "Bajo", className: "bg-mint text-moss" };
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
  const loadIndex = getLoadIndex(totalSrpe);
  const zoneScores = getFatigueZoneScores(weeklySessions);
  const maxZoneScore = Math.max(0, ...Object.values(zoneScores));

  if (!client || weeklySessions.length === 0) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        Todavía no hay suficientes sesiones registradas esta semana.
      </div>
    );
  }

  return (
    <section className="mt-5 grid gap-4">
      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Carga semanal</h2>
            <p className="mt-1 text-sm text-ink/60">Resumen simple de las sesiones completadas esta semana.</p>
          </div>
          <span className={`w-fit rounded-md px-3 py-1 text-sm font-semibold ${loadIndex.className}`}>
            {loadIndex.label}
          </span>
        </div>
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
        <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-ink">Índice visual de carga</p>
            <p className="text-sm font-medium text-ink/65">{loadIndex.message}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${loadIndex.barClassName}`} style={{ width: `${Math.min(100, (totalSrpe / 700) * 100)}%` }} />
          </div>
        </div>
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-semibold text-ink">Sesiones de la semana</h3>
        <div className="mt-4 grid gap-3">
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
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-semibold text-ink">Mapa de fatiga por zonas</h3>
        {maxZoneScore > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {fatigueZones.map((zone) => {
              const score = zoneScores[zone.key] ?? 0;
              const width = maxZoneScore > 0 ? (score / maxZoneScore) * 100 : 0;
              const level = getZoneLevel(score, maxZoneScore);

              return (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={zone.key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{zone.label}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${level.className}`}>
                      {level.label}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
            Sin datos suficientes para estimar fatiga por zonas.
          </p>
        )}
      </article>
    </section>
  );
}
