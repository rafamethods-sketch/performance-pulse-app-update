export type SessionLoadInput = {
  duration: number;
  rpe: number;
};

export type HooperInput = {
  fatigue: number;
  mood?: number;
  sleep: number;
  soreness: number;
  stress: number;
};

export type MetricRange = {
  max?: number;
  min?: number;
  status: "Controlado" | "Vigilar" | "Alto" | "Riesgo";
};

export const acwrRanges: MetricRange[] = [
  { max: 0.7, status: "Riesgo" },
  { min: 0.7, max: 0.8, status: "Vigilar" },
  { min: 0.8, max: 1.3, status: "Controlado" },
  { min: 1.3, max: 1.5, status: "Vigilar" },
  { min: 1.5, status: "Riesgo" }
];

export const monotonyRanges: MetricRange[] = [
  { max: 1.5, status: "Controlado" },
  { min: 1.5, max: 2, status: "Vigilar" },
  { min: 2, status: "Alto" }
];

export const strainRanges: MetricRange[] = [
  { max: 2500, status: "Controlado" },
  { min: 2500, max: 3600, status: "Vigilar" },
  { min: 3600, status: "Alto" }
];

export function calculateSessionLoad(rpe: number, duration: number) {
  return rpe * duration;
}

export function calculateWeeklyLoad(sessions: SessionLoadInput[]) {
  return sessions.reduce((total, session) => total + calculateSessionLoad(session.rpe, session.duration), 0);
}

export function calculateMonotony(dailyLoads: number[]) {
  const activeLoads = dailyLoads.filter((load) => load > 0);
  if (activeLoads.length < 2) return 0;

  const average = activeLoads.reduce((total, load) => total + load, 0) / activeLoads.length;
  const variance = activeLoads.reduce((total, load) => total + (load - average) ** 2, 0) / activeLoads.length;
  const standardDeviation = Math.sqrt(variance);

  return standardDeviation > 0 ? average / standardDeviation : average > 0 ? average : 0;
}

export function calculateStrain(weeklyLoad: number, monotony: number) {
  return weeklyLoad * monotony;
}

export function calculateACWR(acuteLoad: number, chronicLoad: number) {
  return chronicLoad > 0 ? acuteLoad / chronicLoad : 0;
}

export function calculateHooperIndex(values: HooperInput) {
  return values.sleep + values.fatigue + values.stress + values.soreness + (values.mood ?? 0);
}

export function getMetricStatus(value: number, ranges: MetricRange[]) {
  const range = ranges.find((item) => {
    const aboveMin = item.min === undefined || value >= item.min;
    const belowMax = item.max === undefined || value < item.max;
    return aboveMin && belowMax;
  });

  return range?.status ?? "Controlado";
}
