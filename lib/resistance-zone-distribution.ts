import { getSportZoneProfile, getZoneLabel, type ResistanceSport, type ResistanceZoneId } from "@/lib/resistance-zones";

type ResistanceZoneDistributionSession = {
  actualDurationMinutes?: number | string | null;
  cardioPlan?: unknown;
  cardioResult?: {
    durationMinutes?: number | string | null;
  } | null;
  completed?: boolean;
  date?: string | null;
  durationMinutes?: number | string | null;
  plannedDurationMinutes?: number | string | null;
  resistanceSport?: ResistanceSport;
  status?: string | null;
  targetResistanceZoneId?: ResistanceZoneId | string | null;
  type?: string | null;
};

export type ResistanceZoneIntensityBucket = "low" | "moderate" | "high" | "veryHigh";

export type WeeklyResistanceZoneDistributionItem = {
  intensityBucket: ResistanceZoneIntensityBucket;
  minutes: number;
  sessionCount: number;
  sport: ResistanceSport;
  sportLabel: string;
  zoneId: ResistanceZoneId;
  zoneLabel: string;
};

export type WeeklyResistanceZoneDistribution = {
  missingDurationCount: number;
  totalMinutes: number;
  zones: WeeklyResistanceZoneDistributionItem[];
};

const resistanceZoneOrder: ResistanceZoneId[] = ["R0", "R1", "R1_PLUS", "R2", "R3", "R3_PLUS", "R4", "R5", "R6"];

function parsePositiveNumber(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getSessionDate(value?: string | null) {
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

function isDateInCurrentWeek(value?: string | null) {
  const date = getSessionDate(value);
  if (!date) return false;

  const start = new Date();
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function isResistanceSession(session: ResistanceZoneDistributionSession) {
  const type = `${session.type ?? ""}`.toLowerCase();
  return Boolean(
    session.cardioPlan ||
    session.cardioResult ||
    session.targetResistanceZoneId ||
    type.includes("cardio") ||
    type.includes("resistencia")
  );
}

function isCompletedSession(session: ResistanceZoneDistributionSession) {
  const status = `${session.status ?? ""}`.toLowerCase();
  return Boolean(session.completed || session.cardioResult || status.includes("completada") || status.includes("completado"));
}

function normalizeZoneId(value?: string | null): ResistanceZoneId | null {
  if (!value) return null;
  if (value === "R1+") return "R1_PLUS";
  if (value === "R3+") return "R3_PLUS";
  return resistanceZoneOrder.includes(value as ResistanceZoneId) ? (value as ResistanceZoneId) : null;
}

function getDistributionDurationMinutes(session: ResistanceZoneDistributionSession) {
  return parsePositiveNumber(
    session.cardioResult?.durationMinutes ??
      session.actualDurationMinutes ??
      session.plannedDurationMinutes ??
      session.durationMinutes
  );
}

function getIntensityBucket(zoneId: ResistanceZoneId): ResistanceZoneIntensityBucket {
  if (zoneId === "R0" || zoneId === "R1" || zoneId === "R1_PLUS") return "low";
  if (zoneId === "R2") return "moderate";
  if (zoneId === "R3" || zoneId === "R3_PLUS") return "high";
  return "veryHigh";
}

export function getWeeklyResistanceZoneDistribution(sessions: ResistanceZoneDistributionSession[]): WeeklyResistanceZoneDistribution {
  const grouped = new Map<string, WeeklyResistanceZoneDistributionItem>();
  let missingDurationCount = 0;

  sessions
    .filter((session) => isDateInCurrentWeek(session.date))
    .filter(isResistanceSession)
    .filter(isCompletedSession)
    .forEach((session) => {
      const zoneId = normalizeZoneId(session.targetResistanceZoneId);
      if (!zoneId) return;

      const minutes = getDistributionDurationMinutes(session);
      if (minutes <= 0) {
        missingDurationCount += 1;
        return;
      }

      const sport = session.resistanceSport ?? "generic";
      const profile = getSportZoneProfile(sport);
      const zone = profile.zones.find((item) => item.id === zoneId);
      const key = `${sport}-${zoneId}`;
      const current = grouped.get(key);

      if (current) {
        current.minutes += minutes;
        current.sessionCount += 1;
        return;
      }

      grouped.set(key, {
        intensityBucket: getIntensityBucket(zoneId),
        minutes,
        sessionCount: 1,
        sport,
        sportLabel: profile.name,
        zoneId,
        zoneLabel: zone?.label ?? getZoneLabel(zoneId)
      });
    });

  const zones = Array.from(grouped.values()).sort((a, b) => {
    const zoneDiff = resistanceZoneOrder.indexOf(a.zoneId) - resistanceZoneOrder.indexOf(b.zoneId);
    if (zoneDiff !== 0) return zoneDiff;
    return a.sportLabel.localeCompare(b.sportLabel, "es");
  });

  return {
    missingDurationCount,
    totalMinutes: zones.reduce((total, zone) => total + zone.minutes, 0),
    zones
  };
}
