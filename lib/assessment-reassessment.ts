export type AssessmentReassessmentState = {
  label: "" | "Programada" | "Reevaluar pronto" | "En periodo" | "Fuera de plazo";
  tone: string;
};

const DAY_IN_MS = 86_400_000;

function getNaturalDay(date: Date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_IN_MS);
}

export function parseAssessmentDateKey(dateKey?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function getAssessmentReassessmentState(startDateKey?: string, endDateKey?: string, referenceDate = new Date()): AssessmentReassessmentState {
  const startDate = parseAssessmentDateKey(startDateKey);
  if (!startDate) return { label: "", tone: "" };

  const parsedEndDate = parseAssessmentDateKey(endDateKey);
  const startDay = getNaturalDay(startDate);
  const endDay = parsedEndDate && getNaturalDay(parsedEndDate) >= startDay ? getNaturalDay(parsedEndDate) : startDay;
  const today = getNaturalDay(referenceDate);

  if (today < startDay) {
    if (startDay - today <= 7) return { label: "Reevaluar pronto", tone: "border-amber-200 bg-amber-50 text-amber-700" };
    return { label: "Programada", tone: "border-blue-200 bg-blue-50 text-blue-700" };
  }
  if (today <= endDay) return { label: "En periodo", tone: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Fuera de plazo", tone: "border-red-200 bg-red-50 text-red-700" };
}

export function isAssessmentReassessmentDue(startDateKey?: string, endDateKey?: string, referenceDate = new Date(), upcomingDays = 7) {
  const startDate = parseAssessmentDateKey(startDateKey);
  if (!startDate) return false;
  const state = getAssessmentReassessmentState(startDateKey, endDateKey, referenceDate);
  if (state.label === "En periodo" || state.label === "Fuera de plazo") return true;
  return getNaturalDay(startDate) - getNaturalDay(referenceDate) <= upcomingDays;
}

export function formatAssessmentReassessmentPeriod(startDateKey?: string, endDateKey?: string, formatter: (dateKey: string) => string = (dateKey) => dateKey) {
  if (!parseAssessmentDateKey(startDateKey)) return "Sin programar";
  const validEndDate = parseAssessmentDateKey(endDateKey);
  if (!validEndDate || endDateKey === startDateKey || getNaturalDay(validEndDate) < getNaturalDay(parseAssessmentDateKey(startDateKey) as Date)) {
    return formatter(startDateKey as string);
  }
  return `${formatter(startDateKey as string)} – ${formatter(endDateKey as string)}`;
}
