export type CardioTimeInZones = {
  z1?: number;
  z2?: number;
  z3?: number;
  z4?: number;
  z5?: number;
};

export type CardioActivitySummary = {
  avgHeartRate?: number;
  avgPaceSecondsPerKm?: number;
  avgPower?: number;
  clientId: string;
  date: string;
  distanceMeters?: number;
  durationSeconds: number;
  elevationGainMeters?: number;
  externalId: string;
  id: string;
  maxHeartRate?: number;
  normalizedPower?: number;
  perceivedRpe?: number;
  source: "intervals";
  sourceLoad?: number;
  sport: string;
  syncedAt: string;
  timeInZones?: CardioTimeInZones;
};

export type CardioConnectionStatus = {
  lastSyncAt?: string;
  provider: "intervals";
  status: "not_connected" | "pending" | "connected";
};

type IntervalsActivitySummaryInput = {
  avgHeartRate?: unknown;
  avgHr?: unknown;
  avgPaceSecondsPerKm?: unknown;
  avgPower?: unknown;
  clientLoad?: unknown;
  date?: unknown;
  distance?: unknown;
  distanceMeters?: unknown;
  duration?: unknown;
  durationSeconds?: unknown;
  elevationGain?: unknown;
  elevationGainMeters?: unknown;
  externalId?: unknown;
  id?: unknown;
  load?: unknown;
  maxHeartRate?: unknown;
  maxHr?: unknown;
  name?: unknown;
  normalizedPower?: unknown;
  perceivedRpe?: unknown;
  rpe?: unknown;
  sourceLoad?: unknown;
  sport?: unknown;
  startDate?: unknown;
  timeInZones?: Partial<Record<keyof CardioTimeInZones, unknown>>;
  type?: unknown;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asPositiveNumber(value: unknown) {
  const parsed = asNumber(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function normalizeTimeInZones(rawZones?: IntervalsActivitySummaryInput["timeInZones"]) {
  if (!rawZones) return undefined;

  const timeInZones: CardioTimeInZones = {};
  (["z1", "z2", "z3", "z4", "z5"] as const).forEach((zone) => {
    const seconds = asPositiveNumber(rawZones[zone]);
    if (seconds !== undefined) timeInZones[zone] = seconds;
  });

  return Object.keys(timeInZones).length > 0 ? timeInZones : undefined;
}

// The raw Intervals payload must be discarded after mapping it to CardioActivitySummary.
// Real integration must run from a backend/API route/Supabase Edge Function, never from the frontend with exposed API keys.
export function mapIntervalsActivityToSummary(
  rawActivity: IntervalsActivitySummaryInput,
  clientId: string
): CardioActivitySummary {
  const externalId = asString(rawActivity.externalId ?? rawActivity.id, `intervals-${Date.now()}`);
  const date = asString(rawActivity.date ?? rawActivity.startDate, new Date().toISOString());
  const sport = asString(rawActivity.sport ?? rawActivity.type ?? rawActivity.name, "Cardio");

  return {
    avgHeartRate: asPositiveNumber(rawActivity.avgHeartRate ?? rawActivity.avgHr),
    avgPaceSecondsPerKm: asPositiveNumber(rawActivity.avgPaceSecondsPerKm),
    avgPower: asPositiveNumber(rawActivity.avgPower),
    clientId,
    date,
    distanceMeters: asPositiveNumber(rawActivity.distanceMeters ?? rawActivity.distance),
    durationSeconds: asPositiveNumber(rawActivity.durationSeconds ?? rawActivity.duration) ?? 0,
    elevationGainMeters: asPositiveNumber(rawActivity.elevationGainMeters ?? rawActivity.elevationGain),
    externalId,
    id: `intervals-${clientId}-${externalId}`,
    maxHeartRate: asPositiveNumber(rawActivity.maxHeartRate ?? rawActivity.maxHr),
    normalizedPower: asPositiveNumber(rawActivity.normalizedPower),
    perceivedRpe: asPositiveNumber(rawActivity.perceivedRpe ?? rawActivity.rpe),
    source: "intervals",
    sourceLoad: asPositiveNumber(rawActivity.sourceLoad ?? rawActivity.load ?? rawActivity.clientLoad),
    sport,
    syncedAt: new Date().toISOString(),
    timeInZones: normalizeTimeInZones(rawActivity.timeInZones)
  };
}
