function readAssessmentDate(value?: string | null) {
  if (!value || value === "Sin fecha") return null;
  const localized = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const parsed = localized
    ? new Date(Number(localized[3]), Number(localized[2]) - 1, Number(localized[1]))
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatAssessmentAge(value?: string | null, referenceDate = new Date()) {
  const date = readAssessmentDate(value);
  if (!date) return "Sin fecha";
  const reference = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((reference.getTime() - target.getTime()) / 86_400_000);
  if (days < 0) return "Fecha futura";
  if (days === 0) return "Hoy";
  if (days < 7) return `Hace ${days} ${days === 1 ? "día" : "días"}`;
  if (days < 90) {
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }
  const months = Math.floor(days / 30);
  return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
}
