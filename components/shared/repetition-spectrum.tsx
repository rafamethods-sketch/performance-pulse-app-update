"use client";

import { parseRepetitionRange } from "@/lib/training-prescription";

export function RepetitionSpectrum({ reps }: { reps: number | string | null | undefined }) {
  const range = parseRepetitionRange(reps);
  if (!range.complete || range.minimum === null || range.maximum === null) {
    return <p className="text-xs font-medium text-ink/45">Añade un rango de repeticiones para ver el perfil.</p>;
  }
  const clamp = (value: number) => Math.min(30, Math.max(1, value));
  const start = ((clamp(range.minimum) - 1) / 29) * 100;
  const end = ((clamp(range.maximum) - 1) / 29) * 100;
  const isSingleValue = range.minimum === range.maximum;
  const midpoint = (range.minimum + range.maximum) / 2;
  const profile = midpoint <= 5
    ? "Mayor énfasis en producción de fuerza con cargas relativamente altas."
    : midpoint <= 12
      ? "Facilita acumular volumen con cargas moderadas."
      : "Mayor número de repeticiones y demanda muscular local.";

  return (
    <div className="rounded-md border border-line bg-panel/30 p-3">
      <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-slate-300 via-blue-200 to-slate-200">
        {isSingleValue ? (
          <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-sm" style={{ left: `${start}%` }} />
        ) : (
          <span className="absolute inset-y-0 rounded-full bg-ink" style={{ left: `${start}%`, width: `${Math.max(2, end - start)}%` }} />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink/45"><span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>30+</span></div>
      <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] font-medium text-ink/55 sm:grid-cols-4">
        <span>Fuerza máxima / alta carga</span><span>Fuerza–Hipertrofia</span><span>Hipertrofia / volumen</span><span>Resistencia muscular local</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-ink/65">{profile}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink/45">Los rangos representan énfasis aproximados. La adaptación depende también de carga, esfuerzo, volumen, velocidad y ejercicio.</p>
    </div>
  );
}
