"use client";

import { useMemo } from "react";
import { Bike, CheckCircle2, Dumbbell, TrendingUp } from "lucide-react";
import { BodyFatigueMap } from "@/components/shared/body-fatigue-map";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { getSessionImpact, getSessionImpactStyle, type SessionImpactLevel } from "@/lib/session-impact";
import { getExerciseById } from "@/lib/exercises";
import { calculateWeeklyMuscleFatigue, type MuscleFatigueExercise } from "@/lib/muscle-fatigue";
import {
  getWeeklyResistanceZoneDistribution,
  type ResistanceZoneIntensityBucket
} from "@/lib/resistance-zone-distribution";
import type { ResistanceSport, ResistanceZoneId } from "@/lib/resistance-zones";

type AthleteWeeklyExercise = MuscleFatigueExercise & {
  actualRpe?: number | string | null;
  exerciseName?: string | null;
  exerciseRpe?: number | string | null;
  load?: number | string | null;
  perceivedExertion?: number | string | null;
  plannedLoad?: number | string | null;
  plannedReps?: number | string | null;
  plannedSets?: number | string | null;
  reps?: number | string | null;
  rpe?: number | string | null;
  sets?: number | string | null;
  setDetails?: Array<{
    reps?: number | string | null;
    setNumber: number;
  }>;
};

type CardioZone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5";
type CardioZoneInput =
  | Partial<Record<CardioZone, number | string | null>>
  | Array<{
      duration?: number | string | null;
      minutes?: number | string | null;
      time?: number | string | null;
      value?: number | string | null;
      zone?: string | null;
    }>;

type AthleteWeeklySession = {
  actualDurationMinutes?: number | string | null;
  cardioPlan?: unknown;
  cardioResult?: {
    durationMinutes?: number | string | null;
  } | null;
  cardioZones?: CardioZoneInput | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  durationMinutes?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: AthleteWeeklyExercise[];
  plannedDurationMinutes?: number | string | null;
  plannedExercises?: AthleteWeeklyExercise[];
  resistanceSport?: ResistanceSport;
  rpe?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  summary?: string | null;
  targetResistanceZoneId?: ResistanceZoneId | string | null;
  timeInZones?: CardioZoneInput | null;
  type: string;
  zones?: CardioZoneInput | null;
  zoneTimes?: CardioZoneInput | null;
};

type AthleteWeeklyClient = {
  sessionRecords?: AthleteWeeklySession[];
};

const cardioZones: CardioZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5"];

const movementPatternOrder = [
  "Squat / Vertical Force",
  "Hinge / Horizontal Force",
  "Lunge / Unilateral Force",
  "Push / Upper Body Press",
  "Pull / Upper Body Pull",
  "Olympic derivatives",
  "Plyometrics / Jumps",
  "Core / Trunk Control",
  "Gait & Carry",
  "Mobility / Movement Prep",
  "Lower Body Accessories",
  "Upper Body Accessories",
  "Speed & Agility Skills",
  "Otros"
];

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function parsePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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

function getSessionExercises(session: AthleteWeeklySession) {
  return session.performedExercises?.length ? session.performedExercises : session.plannedExercises ?? [];
}

function getExerciseSets(exercise: AthleteWeeklyExercise) {
  return parsePositiveNumber(exercise.sets ?? exercise.plannedSets);
}

function getExerciseSeriesCount(exercise: AthleteWeeklyExercise) {
  const setDetailsCount = exercise.setDetails?.length ?? 0;
  if (setDetailsCount > 0) return setDetailsCount;
  return getExerciseSets(exercise);
}

function getExerciseReps(exercise: AthleteWeeklyExercise) {
  const setDetailsRepSum = getSetDetailsRepSum(exercise);
  if (setDetailsRepSum > 0) return setDetailsRepSum;
  return parsePositiveNumber(exercise.reps ?? exercise.plannedReps);
}

function getExerciseLoad(exercise: AthleteWeeklyExercise) {
  return parsePositiveNumber(exercise.load ?? exercise.plannedLoad);
}

function getSetDetailsRepSum(exercise: AthleteWeeklyExercise) {
  return (exercise.setDetails ?? []).reduce((total, detail) => total + parsePositiveNumber(detail.reps), 0);
}

function calculateWeeklyTonnage(sessions: AthleteWeeklySession[]) {
  return sessions.reduce((sessionTotal, session) => (
    sessionTotal + getSessionExercises(session).reduce((exerciseTotal, exercise) => {
      const load = getExerciseLoad(exercise);
      if (load <= 0) return exerciseTotal;
      const setDetailsRepSum = getSetDetailsRepSum(exercise);
      const totalReps = setDetailsRepSum > 0 ? setDetailsRepSum : getExerciseSets(exercise) * getExerciseReps(exercise);
      return exerciseTotal + totalReps * load;
    }, 0)
  ), 0);
}

function isCardioSession(session: AthleteWeeklySession) {
  const type = session.type.toLowerCase();
  return ["cardio", "running", "carrera", "ciclismo", "natación", "natacion", "resistencia", "remo"].some((keyword) =>
    type.includes(keyword)
  );
}

function isStrengthSession(session: AthleteWeeklySession) {
  const type = session.type.toLowerCase();
  if (isCardioSession(session)) return false;
  return ["fuerza", "strength", "hipertrofia", "potencia", "pliometría", "pliometria"].some((keyword) =>
    type.includes(keyword)
  ) || getSessionExercises(session).length > 0;
}

function calculateWeeklyPatternSets(sessions: AthleteWeeklySession[]) {
  const scores: Record<string, number> = {};

  sessions.forEach((session) => {
    getSessionExercises(session).forEach((exercise) => {
      const sets = getExerciseSeriesCount(exercise);
      if (sets <= 0) return;

      const pattern = exercise.exerciseId ? getExerciseById(exercise.exerciseId)?.pattern : null;
      const patternLabel = pattern || "Otros";
      scores[patternLabel] = (scores[patternLabel] ?? 0) + sets;
    });
  });

  return Object.entries(scores)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => {
      const aIndex = movementPatternOrder.indexOf(a.label);
      const bIndex = movementPatternOrder.indexOf(b.label);
      const normalizedA = aIndex === -1 ? movementPatternOrder.length : aIndex;
      const normalizedB = bIndex === -1 ? movementPatternOrder.length : bIndex;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return b.value - a.value;
    });
}

function getPatternSetsRange(value: number) {
  if (value > 16) return { className: "bg-coral/10 text-coral", label: "Muy alto", barClassName: "bg-red-500" };
  if (value >= 11) return { className: "bg-wheat text-clay", label: "Alto", barClassName: "bg-amber-500" };
  if (value >= 6) return { className: "bg-mint text-moss", label: "Moderado", barClassName: "bg-steel" };
  if (value >= 1) return { className: "bg-panel text-ink/60", label: "Bajo", barClassName: "bg-ink/25" };
  return { className: "bg-panel text-ink/45", label: "Sin carga", barClassName: "bg-ink/10" };
}

function getResistanceZoneBucketStyles(bucket: ResistanceZoneIntensityBucket) {
  if (bucket === "veryHigh") return { barClassName: "bg-red-500", badgeClassName: "bg-coral/10 text-coral", label: "Muy alto" };
  if (bucket === "high") return { barClassName: "bg-amber-500", badgeClassName: "bg-wheat text-clay", label: "Alto" };
  if (bucket === "moderate") return { barClassName: "bg-steel", badgeClassName: "bg-mint text-moss", label: "Moderado" };
  return { barClassName: "bg-ink/25", badgeClassName: "bg-panel text-ink/60", label: "Bajo" };
}

function emptyCardioZones() {
  return Object.fromEntries(cardioZones.map((zone) => [zone, 0])) as Record<CardioZone, number>;
}

function readCardioZoneSource(source?: CardioZoneInput | null) {
  const zones = emptyCardioZones();
  if (!source) return zones;

  if (Array.isArray(source)) {
    source.forEach((entry) => {
      const zone = `${entry.zone ?? ""}`.toUpperCase() as CardioZone;
      if (!cardioZones.includes(zone)) return;
      zones[zone] += parsePositiveNumber(entry.minutes ?? entry.duration ?? entry.time ?? entry.value);
    });
    return zones;
  }

  cardioZones.forEach((zone) => {
    zones[zone] += parsePositiveNumber(source[zone]);
  });
  return zones;
}

function getSessionCardioZones(session: AthleteWeeklySession) {
  const zones = emptyCardioZones();
  [session.timeInZones, session.cardioZones, session.zones, session.zoneTimes].forEach((source) => {
    const sourceZones = readCardioZoneSource(source);
    cardioZones.forEach((zone) => {
      zones[zone] += sourceZones[zone];
    });
  });
  return zones;
}

function calculateWeeklyCardioZones(sessions: AthleteWeeklySession[]) {
  const zones = emptyCardioZones();
  sessions.forEach((session) => {
    const sessionZones = getSessionCardioZones(session);
    cardioZones.forEach((zone) => {
      zones[zone] += sessionZones[zone];
    });
  });
  return zones;
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
      barClassName: "bg-red-500",
      className: "bg-coral/10 text-coral",
      label: "A vigilar",
      message: "Conviene revisar cómo te has sentido con tu entrenador."
    };
  }
  if (totalSrpe >= 450) {
    return {
      barClassName: "bg-amber-500",
      className: "bg-wheat text-clay",
      label: "Conviene revisar",
      message: "Semana exigente: prioriza descanso y recuperación."
    };
  }
  if (totalSrpe >= 200) {
    return {
      barClassName: "bg-steel",
      className: "bg-mint text-moss",
      label: "En línea",
      message: "Actividad reciente dentro de una semana moderada."
    };
  }
  return {
    barClassName: "bg-moss",
    className: "bg-mint text-moss",
    label: "Semana ligera",
    message: "Poca actividad completada esta semana."
  };
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md border border-line bg-panel/35 px-3 py-2 ${className}`}>
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
  const totalSrpe = weeklySessions.reduce((total, session) => total + (getSessionSrpe(session) ?? 0), 0);
  const impactCounts = weeklySessions.reduce<Record<SessionImpactLevel, number>>((counts, session) => {
    counts[getSessionImpact(session).level] += 1;
    return counts;
  }, { low: 0, moderate: 0, high: 0, unknown: 0 });
  const plannedThisWeek = (client?.sessionRecords ?? []).filter((session) => isThisWeek(session.date)).length;
  const adherence = plannedThisWeek > 0 ? Math.round((weeklySessions.length / plannedThisWeek) * 100) : null;
  const maxSrpe = Math.max(1, ...weeklySessions.map((session) => getSessionSrpe(session) ?? 0));
  const loadIndex = getLoadIndex(totalSrpe);
  const muscleFatigue = calculateWeeklyMuscleFatigue(weeklySessions);
  const totalTonnage = calculateWeeklyTonnage(weeklySessions);
  const strengthSessions = weeklySessions.filter(isStrengthSession);
  const cardioSessions = weeklySessions.filter(isCardioSession);
  const patternSets = calculateWeeklyPatternSets(weeklySessions);
  const maxPatternSets = Math.max(1, ...patternSets.map((item) => item.value));
  const hasPatternSetData = patternSets.some((item) => item.value > 0);
  const cardioZoneTotals = calculateWeeklyCardioZones(cardioSessions);
  const totalCardioZoneMinutes = Object.values(cardioZoneTotals).reduce((total, value) => total + value, 0);
  const maxCardioZoneMinutes = Math.max(1, ...Object.values(cardioZoneTotals));
  const resistanceZoneDistribution = getWeeklyResistanceZoneDistribution(client?.sessionRecords ?? []);
  const maxResistanceZoneMinutes = Math.max(1, ...resistanceZoneDistribution.zones.map((zone) => zone.minutes));

  const consistencyMessage = plannedThisWeek === 0
    ? "Semana en construcción. Todavía no hay sesiones planificadas."
    : weeklySessions.length === plannedThisWeek
      ? "Buen ritmo de trabajo esta semana: has completado todo lo planificado."
      : `Has completado ${weeklySessions.length} de ${plannedThisWeek} sesiones esta semana.`;

  if (!client) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        No hay deportista seleccionado.
      </div>
    );
  }

  return (
    <section className="mt-4 grid w-full min-w-0 gap-4 sm:mt-5 sm:gap-5">
      <article className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-300">Resumen semanal</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Así va tu semana</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">{consistencyMessage}</p>
            </div>
            {plannedThisWeek > 0 ? (
              <span className="w-fit rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-blue-100">
                {adherence}% completado
              </span>
            ) : null}
          </div>

          {plannedThisWeek > 0 ? (
            <div className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold">{weeklySessions.length} <span className="text-lg font-medium text-white/50">de {plannedThisWeek}</span></p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/55">sesiones completadas</p>
                </div>
                <TrendingUp aria-hidden="true" className="text-blue-300" size={26} />
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${Math.min(100, adherence ?? 0)}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/65">
              Sin sesiones planificadas esta semana.
            </p>
          )}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-panel/35 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-moss"><CheckCircle2 aria-hidden="true" size={19} /></span>
            <div><p className="text-lg font-bold text-ink">{weeklySessions.length}</p><p className="text-xs font-medium text-ink/50">Completadas</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-panel/35 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-moss"><Dumbbell aria-hidden="true" size={19} /></span>
            <div><p className="text-lg font-bold text-ink">{strengthSessions.length}</p><p className="text-xs font-medium text-ink/50">Fuerza</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-panel/35 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-wheat text-clay"><Bike aria-hidden="true" size={19} /></span>
            <div><p className="text-lg font-bold text-ink">{cardioSessions.length}</p><p className="text-xs font-medium text-ink/50">Resistencia</p></div>
          </div>
        </div>
      </article>

      <article className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-semibold text-ink">Impacto de la semana</h3>
        <p className="mt-1 text-sm text-ink/60">Demanda de tus sesiones completadas.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            { level: "low", label: "Bajo" },
            { level: "moderate", label: "Medio" },
            { level: "high", label: "Alto" },
            { level: "unknown", label: "Sin datos" }
          ] as const).map(({ level, label }) => {
            const impactStyle = getSessionImpactStyle(level);
            return (
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${impactStyle.badgeClassName}`} key={level}>
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${impactStyle.dotClassName}`} />
                {label} <span className="font-bold tabular-nums">{impactCounts[level]}</span>
              </span>
            );
          })}
        </div>
        {weeklySessions.length === 0 ? <p className="mt-3 text-sm text-ink/55">Sin sesiones completadas esta semana.</p> : null}
      </article>

      {weeklySessions.length > 0 ? (
        <article className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <h3 className="font-semibold text-ink">Actividad de la semana</h3>
          <p className="mt-1 text-sm text-ink/55">Tus sesiones completadas, en orden de registro.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {weeklySessions.map((session, index) => (
              <div className="rounded-xl border border-line bg-panel/35 p-3" key={`${session.date}-${index}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{displayValue(session.type, "Sesión")}</p>
                    <p className="mt-1 text-xs font-medium text-ink/50">{displayValue(session.date, "Sin fecha")}</p>
                  </div>
                  <CheckCircle2 aria-hidden="true" className="shrink-0 text-moss" size={18} />
                </div>
                {session.summary?.trim() ? <p className="mt-3 text-sm leading-relaxed text-ink/60">{session.summary.trim()}</p> : null}
              </div>
            ))}
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center shadow-soft">
          <p className="font-semibold text-ink">Aún no hay actividad completada esta semana.</p>
          <p className="mt-2 text-sm text-ink/55">Cuando completes una sesión, aparecerá aquí.</p>
        </div>
      )}

      {weeklySessions.length > 0 ? (
      <details className="group rounded-2xl border border-line bg-white shadow-soft">
        <summary className="cursor-pointer list-none p-4 font-semibold text-ink sm:p-5">
          Detalle de entrenamiento
          <span className="ml-2 text-sm font-medium text-ink/50 group-open:hidden">+</span>
          <span className="ml-2 hidden text-sm font-medium text-ink/50 group-open:inline">−</span>
        </summary>
        <div className="grid gap-4 border-t border-line p-3 sm:p-5">
          <article className="min-w-0 rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Carga reciente por sesión</h3>
                <p className="mt-1 text-sm text-ink/60">Lectura orientativa basada en duración y esfuerzo registrado.</p>
              </div>
              <span className={`w-fit rounded-md px-3 py-1 text-sm font-semibold ${loadIndex.className}`}>{loadIndex.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-ink/65">{loadIndex.message}</p>
            <div className="mt-4 grid gap-3">
              {weeklySessions.map((session, index) => {
                const srpe = getSessionSrpe(session) ?? 0;
                return (
                  <div className="rounded-md border border-line bg-panel/35 p-3" key={`${session.date}-load-${index}`}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="font-semibold text-ink">{displayValue(session.type, "Sesión")}</p><p className="text-sm text-ink/55">{displayValue(session.date, "Sin fecha")}</p></div>
                      <span className="text-sm font-semibold text-moss">Carga {srpe} UA</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${(srpe / maxSrpe) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </article>
          <div className="grid grid-cols-2 gap-2">
            <ClientInfoCard label="Carga acumulada" value={`${totalSrpe} UA`} />
            <ClientInfoCard label="Volumen de fuerza" value={`${Math.round(totalTonnage).toLocaleString("es-ES")} kg`} />
          </div>
          <p className="text-xs text-ink/50">UA resume duración × esfuerzo percibido; úsalo como referencia para comparar semanas.</p>
      <section className="grid gap-4">
        <article className="min-w-0 rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
          <h3 className="font-semibold text-ink">Series semanales por patrón de movimiento</h3>
          <p className="mt-1 text-sm text-ink/60">Estimación según ejercicios registrados esta semana.</p>
          {hasPatternSetData ? (
            <div className="mt-4 grid gap-2">
              {patternSets.map((item) => {
                const range = getPatternSetsRange(item.value);

                return (
                  <div className="rounded-md border border-line bg-panel/35 px-3 py-2.5" key={item.label}>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{item.label}</p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                          <div className={`h-full rounded-full ${range.barClassName}`} style={{ width: `${Math.min(100, (item.value / Math.max(16, maxPatternSets)) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className="text-sm font-semibold text-ink/70">{item.value} series</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${range.className}`}>
                          {range.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
              Sin datos suficientes para estimar series por patrón.
            </p>
          )}
        </article>

        <article className="min-w-0 rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
          <h3 className="font-semibold text-ink">Mapa de fatiga muscular</h3>
          <p className="mt-1 text-sm text-ink/60">Estimación visual según ejercicios realizados, series, repeticiones, RPE e implicación muscular.</p>
          {muscleFatigue.hasData ? (
            <div className="mt-4 grid gap-4">
              <BodyFatigueMap muscles={muscleFatigue.results} />
              {muscleFatigue.incomplete ? (
                <p className="rounded-md border border-line bg-panel/35 px-3 py-2 text-xs font-medium text-clay">
                  Estimación parcial: algunas sesiones no tienen RPE registrado.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
              Sin datos suficientes para estimar la fatiga muscular esta semana.
            </p>
          )}
        </article>
      </section>

      <article className="min-w-0 rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Cardio / resistencia</h3>
            <p className="mt-1 text-sm text-ink/60">Tiempo por zonas registrado en sesiones de cardio completadas.</p>
          </div>
          <span className="w-fit rounded-md bg-panel px-2 py-1 text-xs font-semibold text-ink/55">
            {cardioSessions.length} sesiones
          </span>
        </div>
        {totalCardioZoneMinutes > 0 ? (
          <div className="mt-4 grid gap-3">
            {cardioZones.map((zone) => {
              const minutes = cardioZoneTotals[zone];

              return (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={zone}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{zone}</p>
                    <span className="text-sm font-semibold text-ink/70">{minutes} min</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-steel to-moss" style={{ width: `${(minutes / maxCardioZoneMinutes) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
            Sin datos suficientes de cardio esta semana.
          </p>
        )}
      </article>

      <article className="min-w-0 rounded-md border border-line bg-white p-3 shadow-soft sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Distribución semanal por zonas de resistencia</h3>
            <p className="mt-1 text-sm text-ink/60">Minutos registrados esta semana según la zona objetivo planificada.</p>
          </div>
          <span className="w-fit rounded-md bg-panel px-2 py-1 text-xs font-semibold text-ink/55">
            {Math.round(resistanceZoneDistribution.totalMinutes)} min
          </span>
        </div>

        {resistanceZoneDistribution.zones.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {resistanceZoneDistribution.zones.map((zone) => {
              const bucket = getResistanceZoneBucketStyles(zone.intensityBucket);
              const roundedMinutes = Math.round(zone.minutes);

              return (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={`${zone.sport}-${zone.zoneId}`}>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{zone.zoneLabel}</p>
                      <p className="mt-1 text-xs font-medium text-ink/50">
                        {zone.sportLabel} · {roundedMinutes} min · {zone.sessionCount} {zone.sessionCount === 1 ? "sesión" : "sesiones"}
                      </p>
                    </div>
                    <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${bucket.badgeClassName}`}>
                      {bucket.label}
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                    <div className={`h-full rounded-full ${bucket.barClassName}`} style={{ width: `${(zone.minutes / maxResistanceZoneMinutes) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
            Sin zonas de resistencia registradas esta semana.
          </p>
        )}

        {resistanceZoneDistribution.missingDurationCount > 0 ? (
          <p className="mt-4 rounded-md border border-line bg-panel/35 px-3 py-2 text-xs font-medium text-ink/55">
            Hay sesiones con zona objetivo sin duración registrada.
          </p>
        ) : null}
      </article>
        </div>
      </details>
      ) : null}
    </section>
  );
}
