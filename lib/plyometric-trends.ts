import type { WeeklyPlyometricVolume } from "./plyometric-volume";

export type PlyometricTrendStatus = "comparable" | "incomplete" | "no_change" | "no_reference";

export type PlyometricRelativeTrend = {
  percentage: number | null;
  status: PlyometricTrendStatus;
};

export type PlyometricTrendNotice = {
  id: "total_increase" | "zone3_concentration" | "zone3_increase";
  message: string;
};

export type PlyometricWeeklyTrend = {
  notices: PlyometricTrendNotice[];
  total: PlyometricRelativeTrend;
  zone3: PlyometricRelativeTrend;
};

// Reglas UX orientativas: ayudan a contextualizar cambios, no son límites
// fisiológicos universales ni indicadores de riesgo clínico.
export const plyometricTrendThresholds = {
  minimumIncreasePercentage: 25,
  minimumTotalContacts: 20,
  minimumZone3Contacts: 10,
  zone3ConcentrationRatio: 0.4
} as const;

export function calculateRelativeChange(
  current: number,
  previous: number,
  incomplete = false
): PlyometricRelativeTrend {
  if (incomplete) return { percentage: null, status: "incomplete" };
  if (previous > 0) {
    const percentage = ((current - previous) / previous) * 100;
    return percentage === 0
      ? { percentage: 0, status: "no_change" }
      : { percentage, status: "comparable" };
  }
  if (current > 0) return { percentage: null, status: "no_reference" };
  return { percentage: null, status: "no_change" };
}

export function formatPlyometricTrend(trend: PlyometricRelativeTrend) {
  if (trend.percentage === null || trend.status === "incomplete") return null;
  const rounded = Math.round(trend.percentage);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function calculatePlyometricWeeklyTrend(
  current: WeeklyPlyometricVolume,
  previous: WeeklyPlyometricVolume
): PlyometricWeeklyTrend {
  const hasIncompleteActualData = current.actualIncomplete || previous.actualIncomplete;
  const currentZone3 = current.actualByDemand.zone3;
  const previousZone3 = previous.actualByDemand.zone3;
  const total = calculateRelativeChange(
    current.actualContacts,
    previous.actualContacts,
    hasIncompleteActualData
  );
  const zone3 = calculateRelativeChange(currentZone3, previousZone3, hasIncompleteActualData);

  if (hasIncompleteActualData) return { notices: [], total, zone3 };

  const notices: PlyometricTrendNotice[] = [];
  if (
    currentZone3 >= plyometricTrendThresholds.minimumZone3Contacts &&
    previousZone3 > 0 &&
    (zone3.percentage ?? 0) >= plyometricTrendThresholds.minimumIncreasePercentage
  ) {
    notices.push({
      id: "zone3_increase",
      message: "Mayor exposición a contactos de Zona 3 esta semana."
    });
  }
  if (
    current.actualContacts >= plyometricTrendThresholds.minimumTotalContacts &&
    previous.actualContacts > 0 &&
    (total.percentage ?? 0) >= plyometricTrendThresholds.minimumIncreasePercentage
  ) {
    notices.push({
      id: "total_increase",
      message: "El volumen pliométrico realizado ha aumentado claramente respecto a la semana anterior."
    });
  }
  if (
    current.actualContacts >= plyometricTrendThresholds.minimumTotalContacts &&
    currentZone3 / current.actualContacts >= plyometricTrendThresholds.zone3ConcentrationRatio
  ) {
    notices.push({
      id: "zone3_concentration",
      message: "Una parte elevada del volumen pliométrico de esta semana se concentra en Zona 3."
    });
  }

  return { notices: notices.slice(0, 2), total, zone3 };
}
