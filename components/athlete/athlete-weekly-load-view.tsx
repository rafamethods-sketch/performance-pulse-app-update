"use client";

import { useMemo } from "react";
import { BodyFatigueMap } from "@/components/shared/body-fatigue-map";
import { calculateSessionLoad } from "@/lib/client-metrics";
import { getExerciseById } from "@/lib/exercises";
import { calculateWeeklyMuscleFatigue, type MuscleFatigueExercise, type MuscleFatigueLevel } from "@/lib/muscle-fatigue";

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
  cardioZones?: CardioZoneInput | null;
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
  timeInZones?: CardioZoneInput | null;
  type: string;
  zones?: CardioZoneInput | null;
  zoneTimes?: CardioZoneInput | null;
};

type AthleteWeeklyClient = {
  sessionRecords?: AthleteWeeklySession[];
};

type MuscleGroupConfig = {
  keys: string[];
  label: string;
};

const cardioZones: CardioZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5"];

const muscleGroups: MuscleGroupConfig[] = [
  { label: "Cuádriceps", keys: ["quadriceps"] },
  { label: "Isquiosurales", keys: ["hamstrings"] },
  { label: "Glúteos", keys: ["glutes", "gluteMed"] },
  { label: "Gemelos / sóleo", keys: ["calves", "soleus"] },
  { label: "Pectoral", keys: ["chest"] },
  { label: "Espalda / dorsales", keys: ["lats", "midBack", "upperBack", "lowerTraps"] },
  { label: "Deltoides", keys: ["anteriorDelts", "lateralDelts", "rearDelts", "shoulders"] },
  { label: "Bíceps", keys: ["biceps"] },
  { label: "Tríceps", keys: ["triceps"] },
  { label: "Core", keys: ["core", "obliques", "transverseAbdominis", "rectusAbdominis", "lumbarStabilizers"] }
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

function calculateMuscleEffectiveSets(sessions: AthleteWeeklySession[]) {
  const scores = Object.fromEntries(muscleGroups.map((group) => [group.label, 0])) as Record<string, number>;

  sessions.forEach((session) => {
    getSessionExercises(session).forEach((exercise) => {
      if (!exercise.exerciseId) return;
      const libraryExercise = getExerciseById(exercise.exerciseId);
      if (!libraryExercise?.fatigueMap) return;

      const sets = getExerciseSets(exercise);
      if (sets <= 0) return;

      muscleGroups.forEach((group) => {
        const contribution = group.keys.reduce((total, key) => {
          const value = libraryExercise.fatigueMap[key as keyof typeof libraryExercise.fatigueMap];
          return total + (typeof value === "number" ? value : 0);
        }, 0);
        scores[group.label] += sets * contribution;
      });
    });
  });

  return muscleGroups.map((group) => ({
    label: group.label,
    value: scores[group.label] ?? 0
  }));
}

function getEffectiveSetsRange(value: number) {
  if (value >= 20) return { className: "bg-red-50 text-red-700", label: "Muy alto", barClassName: "bg-red-500" };
  if (value >= 10) return { className: "bg-mint text-moss", label: "Óptimo", barClassName: "bg-moss" };
  if (value >= 5) return { className: "bg-amber-100 text-amber-800", label: "Moderado", barClassName: "bg-amber-500" };
  return { className: "bg-panel text-ink/50", label: "Bajo", barClassName: "bg-ink/20" };
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
      className: "bg-red-50 text-red-700",
      label: "Muy alta",
      message: "Carga muy alta. Coméntalo con tu entrenador si notas fatiga."
    };
  }
  if (totalSrpe >= 450) {
    return {
      barClassName: "bg-amber-500",
      className: "bg-amber-100 text-amber-800",
      label: "Alta",
      message: "Carga alta. Cuida la recuperación."
    };
  }
  if (totalSrpe >= 200) {
    return {
      barClassName: "bg-steel",
      className: "bg-blue-50 text-blue-700",
      label: "Moderada",
      message: "Carga moderada."
    };
  }
  return {
    barClassName: "bg-moss",
    className: "bg-mint text-moss",
    label: "Baja",
    message: "Carga baja esta semana."
  };
}

function getMuscleLevelLabel(level: MuscleFatigueLevel) {
  if (level === "very_high") return "muy alta";
  if (level === "high") return "alta";
  if (level === "moderate") return "moderada";
  if (level === "low") return "baja";
  return "sin carga";
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
  const plannedThisWeek = (client?.sessionRecords ?? []).filter((session) => isThisWeek(session.date)).length;
  const adherence = plannedThisWeek > 0 ? Math.round((weeklySessions.length / plannedThisWeek) * 100) : null;
  const maxSrpe = Math.max(1, ...weeklySessions.map((session) => getSessionSrpe(session) ?? 0));
  const loadIndex = getLoadIndex(totalSrpe);
  const muscleFatigue = calculateWeeklyMuscleFatigue(weeklySessions);
  const totalTonnage = calculateWeeklyTonnage(weeklySessions);
  const strengthSessions = weeklySessions.filter(isStrengthSession);
  const cardioSessions = weeklySessions.filter(isCardioSession);
  const muscleSets = calculateMuscleEffectiveSets(weeklySessions);
  const maxMuscleSets = Math.max(1, ...muscleSets.map((item) => item.value));
  const hasMuscleSetData = muscleSets.some((item) => item.value > 0);
  const cardioZoneTotals = calculateWeeklyCardioZones(cardioSessions);
  const totalCardioZoneMinutes = Object.values(cardioZoneTotals).reduce((total, value) => total + value, 0);
  const maxCardioZoneMinutes = Math.max(1, ...Object.values(cardioZoneTotals));

  if (!client || weeklySessions.length === 0) {
    return (
      <div className="mt-5 rounded-md border border-dashed border-line bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        Todavía no hay suficientes sesiones registradas esta semana.
      </div>
    );
  }

  return (
    <section className="mt-5 grid gap-5">
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
          <ClientInfoCard label="sRPE semanal" value={`${totalSrpe} UA`} />
          <ClientInfoCard label="Tonelaje total" value={`${Math.round(totalTonnage).toLocaleString("es-ES")} kg`} />
          <ClientInfoCard label="Sesiones de fuerza" value={`${strengthSessions.length}`} />
          <ClientInfoCard label="Sesiones de cardio" value={`${cardioSessions.length}`} />
        </div>
        {adherence !== null ? (
          <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm font-semibold text-ink/70">
            Adherencia semanal: {adherence}%
          </div>
        ) : null}
        <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-ink">Índice visual de carga</p>
            <p className="text-sm font-medium text-ink/65">{loadIndex.message}</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
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
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${(srpe / maxSrpe) * 100}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </article>

      <section className="grid gap-4">
        <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
          <h3 className="font-semibold text-ink">Series efectivas por grupo muscular</h3>
          <p className="mt-1 text-sm text-ink/60">Estimación orientativa según los ejercicios registrados esta semana.</p>
          {hasMuscleSetData ? (
            <div className="mt-4 grid gap-3">
              {muscleSets.map((item) => {
                const range = getEffectiveSetsRange(item.value);

                return (
                  <div className="rounded-md border border-line bg-panel/35 p-3" key={item.label}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink/70">{item.value.toFixed(1)} series</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${range.className}`}>
                          {range.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                      <div className={`h-full rounded-full ${range.barClassName}`} style={{ width: `${Math.min(100, (item.value / Math.max(20, maxMuscleSets)) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
              Sin datos suficientes para estimar series efectivas.
            </p>
          )}
          <p className="mt-4 rounded-md border border-line bg-panel/35 px-3 py-2 text-xs font-medium text-ink/60">
            Rangos orientativos de volumen semanal. Ajustar según objetivo, nivel, fase de la temporada, proximidad al fallo y tolerancia individual.
          </p>
        </article>

        <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
          <h3 className="font-semibold text-ink">Mapa de fatiga muscular</h3>
          <p className="mt-1 text-sm text-ink/60">Estimación visual según ejercicios realizados, series, repeticiones, RPE e implicación muscular.</p>
          {muscleFatigue.hasData ? (
            <div className="mt-4 grid gap-4">
              <BodyFatigueMap muscles={muscleFatigue.results} />
              <div className="rounded-md border border-line bg-panel/35 p-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Top 3 músculos más cargados</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {muscleFatigue.topMuscles.map((muscle) => (
                    <div className="rounded-md border border-line bg-white px-3 py-2" key={muscle.key}>
                      <p className="text-sm font-semibold text-ink">{muscle.label}</p>
                      <p className="mt-1 text-xs font-medium text-ink/55">
                        {muscle.relative}% relativo · {getMuscleLevelLabel(muscle.level)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs font-medium text-ink/55">
                  Intensidad relativa respecto al músculo más cargado de la semana.
                </p>
                {muscleFatigue.incomplete ? (
                  <p className="mt-2 text-xs font-medium text-amber-800">
                    Estimación parcial: algunas sesiones no tienen RPE registrado.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm font-semibold text-ink/55">
              Sin datos suficientes para estimar la fatiga muscular esta semana.
            </p>
          )}
        </article>
      </section>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
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
    </section>
  );
}
