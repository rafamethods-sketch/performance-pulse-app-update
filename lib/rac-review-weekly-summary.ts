export type RacReviewDiscomfort = {
  bodyArea?: string | null;
  intensity?: number | null;
};

export type RacReviewWeeklySession = {
  completed: boolean;
  date?: string | null;
  discomfort?: RacReviewDiscomfort | null;
  load?: number | null;
  readiness?: number | null;
};

export type RacReviewWeeklySummary = {
  load: string;
  sessions: string;
  discomfort: string;
  wellness: string;
  weekLabel: string;
};

function readDate(value?: string | null) {
  if (!value) return null;
  const localized = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const parsed = localized
    ? new Date(Number(localized[3]), Number(localized[2]) - 1, Number(localized[1]))
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getWeekBounds(referenceDate: Date, offset = 0) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { end, start };
}

function selectWeek(sessions: readonly RacReviewWeeklySession[], referenceDate: Date, offset = 0) {
  const { end, start } = getWeekBounds(referenceDate, offset);
  return sessions
    .map((session) => ({ date: readDate(session.date), session }))
    .filter((entry): entry is { date: Date; session: RacReviewWeeklySession } => Boolean(entry.date))
    .filter(({ date }) => date >= start && date < end);
}

function formatWeekLabel(referenceDate: Date) {
  const { end, start } = getWeekBounds(referenceDate);
  const lastDay = new Date(end);
  lastDay.setDate(lastDay.getDate() - 1);
  const startDay = start.getDate();
  const endDay = lastDay.getDate();
  const startMonth = start.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const endMonth = lastDay.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  return startMonth === endMonth
    ? `${startDay}–${endDay} ${endMonth}`
    : `${startDay} ${startMonth}–${endDay} ${endMonth}`;
}

function formatDecimal(value: number) {
  return value.toFixed(1).replace(".", ",");
}

function compactBodyArea(value?: string | null) {
  const compact = (value ?? "")
    .replace(/\b(izquierd[oa]|derech[oa])\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return compact || "Molestia";
}

function getDiscomfortSummary(
  currentWeek: Array<{ date: Date; session: RacReviewWeeklySession }>,
  allSessions: readonly RacReviewWeeklySession[]
) {
  const relevant = currentWeek
    .filter(({ session }) => Boolean(session.discomfort))
    .sort((left, right) => {
      const intensityDifference = (right.session.discomfort?.intensity ?? -1) - (left.session.discomfort?.intensity ?? -1);
      return intensityDifference || right.date.getTime() - left.date.getTime();
    })[0];
  if (!relevant?.session.discomfort) return "Sin molestias";

  const { bodyArea, intensity } = relevant.session.discomfort;
  const normalizedArea = (bodyArea ?? "").trim().toLocaleLowerCase("es-ES");
  const previous = allSessions
    .map((session) => ({ date: readDate(session.date), session }))
    .filter((entry): entry is { date: Date; session: RacReviewWeeklySession } => Boolean(entry.date))
    .filter(({ date, session }) =>
      date < relevant.date &&
      Boolean(session.discomfort) &&
      (session.discomfort?.bodyArea ?? "").trim().toLocaleLowerCase("es-ES") === normalizedArea
    )
    .sort((left, right) => right.date.getTime() - left.date.getTime())[0];
  const previousIntensity = previous?.session.discomfort?.intensity;
  const trend = typeof intensity === "number" && typeof previousIntensity === "number"
    ? intensity < previousIntensity ? " ↓" : intensity > previousIntensity ? " ↑" : " ="
    : "";
  const intensityLabel = typeof intensity === "number" ? ` · ${intensity}/10` : "";
  return `${compactBodyArea(bodyArea)}${intensityLabel}${trend}`;
}

export function getRacReviewWeeklySummary(
  sessions: readonly RacReviewWeeklySession[],
  referenceDate = new Date()
): RacReviewWeeklySummary {
  const currentWeek = selectWeek(sessions, referenceDate);
  const previousWeek = selectWeek(sessions, referenceDate, -1);
  const completedSessions = currentWeek.filter(({ session }) => session.completed).length;
  const currentLoads = currentWeek.map(({ session }) => session.load).filter((load): load is number => typeof load === "number" && Number.isFinite(load));
  const previousLoads = previousWeek.map(({ session }) => session.load).filter((load): load is number => typeof load === "number" && Number.isFinite(load));
  const currentLoad = currentLoads.reduce((total, load) => total + load, 0);
  const previousLoad = previousLoads.reduce((total, load) => total + load, 0);
  const readinessValues = currentWeek
    .map(({ session }) => session.readiness)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const readiness = readinessValues.length > 0
    ? readinessValues.reduce((total, value) => total + value, 0) / readinessValues.length
    : null;
  const loadChange = currentLoads.length > 0 && previousLoads.length > 0 && previousLoad > 0
    ? Math.round(((currentLoad - previousLoad) / previousLoad) * 100)
    : null;

  return {
    sessions: currentWeek.length > 0 ? `${completedSessions}/${currentWeek.length}` : "—",
    load: loadChange === null
      ? currentLoads.length > 0 ? `${Math.round(currentLoad).toLocaleString("es-ES")} UA` : "—"
      : loadChange === 0 ? "=" : `${loadChange > 0 ? "+" : ""}${loadChange}%`,
    wellness: readiness === null ? "—" : `${formatDecimal(readiness)}/5`,
    discomfort: getDiscomfortSummary(currentWeek, sessions),
    weekLabel: formatWeekLabel(referenceDate)
  };
}
