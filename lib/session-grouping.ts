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
  if (!value) return 0;
  const localizedDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (localizedDate) {
    const [, day, month, year] = localizedDate;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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
    firstDate: number;
    label: string;
    weeks: Map<string, { firstDate: number; label: string; sessions: Array<GroupedSessionEntry<T>> }>;
  }>();

  sessions.forEach((session, originalIndex) => {
    const blockLabel = getBlockLabel(session);
    const weekLabel = getWeekLabel(session);
    const dateTime = getDateTime(session.date);
    const block = blocks.get(blockLabel) ?? { firstDate: dateTime, label: blockLabel, weeks: new Map() };
    const week = block.weeks.get(weekLabel) ?? { firstDate: dateTime, label: weekLabel, sessions: [] };

    week.sessions.push({ originalIndex, session });
    if (!week.firstDate || (dateTime && dateTime < week.firstDate)) week.firstDate = dateTime;
    if (!block.firstDate || (dateTime && dateTime < block.firstDate)) block.firstDate = dateTime;
    block.weeks.set(weekLabel, week);
    blocks.set(blockLabel, block);
  });

  return [...blocks.values()]
    .sort((left, right) => right.firstDate - left.firstDate)
    .map((block) => ({
      label: block.label,
      weeks: [...block.weeks.values()]
        .sort((left, right) => {
          const leftNumber = getWeekNumber(left.label);
          const rightNumber = getWeekNumber(right.label);
          if (leftNumber !== null && rightNumber !== null) return leftNumber - rightNumber;
          return left.firstDate - right.firstDate;
        })
        .map((week) => ({
          label: week.label,
          sessions: [...week.sessions].sort((left, right) => {
            const dateDifference = getDateTime(left.session.date) - getDateTime(right.session.date);
            if (dateDifference !== 0) return dateDifference;
            return Number(left.session.sessionNumber ?? 0) - Number(right.session.sessionNumber ?? 0);
          })
        }))
    }));
}
