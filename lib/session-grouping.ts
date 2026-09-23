export type SessionGroupingFields = {
  block?: string | null;
  blockName?: string | null;
  date?: string | null;
  mesocycle?: string | null;
  mesocycleName?: string | null;
  phase?: string | null;
  sessionNumber?: number | string | null;
  week?: number | string | null;
  weekLabel?: string | null;
  weekNumber?: number | string | null;
};

export type GroupedSessionEntry<T> = {
  originalIndex: number;
  session: T;
};

export type SessionWeekGroup<T> = {
  label: string;
  sessions: Array<GroupedSessionEntry<T>>;
};

export type SessionBlockGroup<T> = {
  label: string;
  weeks: Array<SessionWeekGroup<T>>;
};

function cleanLabel(value: unknown) {
  return typeof value === "string" ? value.trim() : value === null || value === undefined ? "" : `${value}`.trim();
}

function getDateTime(value?: string | null) {
  if (!value) return null;
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year)
      && date.getMonth() === Number(month) - 1
      && date.getDate() === Number(day)
      ? date.getTime()
      : null;
  }
  const localizedDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (localizedDate) {
    const [, day, month, year] = localizedDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.getFullYear() === Number(year)
      && date.getMonth() === Number(month) - 1
      && date.getDate() === Number(day)
      ? date.getTime()
      : null;
  }
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getBlockLabel(session: SessionGroupingFields) {
  return cleanLabel(session.blockName)
    || cleanLabel(session.mesocycleName)
    || cleanLabel(session.block)
    || cleanLabel(session.mesocycle)
    || cleanLabel(session.phase)
    || "Sin bloque asignado";
}

function getWeekLabel(session: SessionGroupingFields) {
  const rawWeek = cleanLabel(session.weekLabel) || cleanLabel(session.weekNumber) || cleanLabel(session.week);
  if (!rawWeek) return "Semana sin asignar";
  return /^semana\b/i.test(rawWeek) ? rawWeek : `Semana ${rawWeek}`;
}

function getWeekNumber(label: string) {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function groupSessionsByBlockAndWeek<T extends SessionGroupingFields>(sessions: readonly T[]): Array<SessionBlockGroup<T>> {
  const blocks = new Map<string, {
    latestDate: number | null;
    label: string;
    originalIndex: number;
    weeks: Map<string, { latestDate: number | null; label: string; originalIndex: number; sessions: Array<GroupedSessionEntry<T>> }>;
  }>();

  sessions.forEach((session, originalIndex) => {
    const blockLabel = getBlockLabel(session);
    const weekLabel = getWeekLabel(session);
    const dateTime = getDateTime(session.date);
    const block = blocks.get(blockLabel) ?? { latestDate: dateTime, label: blockLabel, originalIndex, weeks: new Map() };
    const week = block.weeks.get(weekLabel) ?? { latestDate: dateTime, label: weekLabel, originalIndex, sessions: [] };

    week.sessions.push({ originalIndex, session });
    if (dateTime !== null && (week.latestDate === null || dateTime > week.latestDate)) week.latestDate = dateTime;
    if (dateTime !== null && (block.latestDate === null || dateTime > block.latestDate)) block.latestDate = dateTime;
    block.weeks.set(weekLabel, week);
    blocks.set(blockLabel, block);
  });

  return [...blocks.values()]
    .sort((left, right) => {
      if (left.latestDate === null && right.latestDate !== null) return 1;
      if (left.latestDate !== null && right.latestDate === null) return -1;
      if (left.latestDate !== right.latestDate) return (right.latestDate ?? 0) - (left.latestDate ?? 0);
      return left.originalIndex - right.originalIndex;
    })
    .map((block) => ({
      label: block.label,
      weeks: [...block.weeks.values()]
        .sort((left, right) => {
          if (left.latestDate === null && right.latestDate !== null) return 1;
          if (left.latestDate !== null && right.latestDate === null) return -1;
          if (left.latestDate !== right.latestDate) return (right.latestDate ?? 0) - (left.latestDate ?? 0);
          const leftNumber = getWeekNumber(left.label);
          const rightNumber = getWeekNumber(right.label);
          if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) return rightNumber - leftNumber;
          return left.originalIndex - right.originalIndex;
        })
        .map((week) => ({
          label: week.label,
          sessions: [...week.sessions].sort((left, right) => {
            const leftDate = getDateTime(left.session.date);
            const rightDate = getDateTime(right.session.date);
            if (leftDate === null && rightDate !== null) return 1;
            if (leftDate !== null && rightDate === null) return -1;
            if (leftDate !== rightDate) return (rightDate ?? 0) - (leftDate ?? 0);
            return left.originalIndex - right.originalIndex;
          })
        }))
    }));
}
