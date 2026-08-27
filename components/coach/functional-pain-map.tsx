"use client";

type PainMapPoint = { label: string; x: number; y: number };

export function FunctionalPainMap({
  disabled = false,
  onChange,
  points,
  value
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  points: PainMapPoint[];
  value?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-panel/25 p-3">
      <p className="text-xs font-semibold uppercase text-ink/45">Mapa orientativo</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[150px_1fr] sm:items-center">
        <svg aria-label="Mapa anatómico funcional" className="mx-auto h-52 w-36" viewBox="0 0 140 220">
          <path d="M50 8 C44 48 43 88 48 118 C51 138 44 164 38 194 L64 207 L72 164 L78 207 L104 194 C96 160 89 139 92 116 C97 79 95 42 89 8 Z" fill="var(--color-panel, #f3f1eb)" stroke="currentColor" strokeWidth="2" />
          <path d="M46 120 Q70 132 94 120 M42 176 Q70 185 99 176" fill="none" opacity="0.25" stroke="currentColor" />
          {points.map((point) => (
            <g key={point.label} onClick={() => !disabled && onChange(point.label)} role="button" tabIndex={disabled ? -1 : 0}>
              <circle className={disabled ? "cursor-default" : "cursor-pointer"} cx={point.x} cy={point.y} fill={value === point.label ? "#315f4a" : "#d9a441"} opacity={value === point.label ? 1 : 0.72} r={value === point.label ? 8 : 6} stroke="white" strokeWidth="2" />
            </g>
          ))}
        </svg>
        <div className="grid gap-1.5 text-xs text-ink/60">
          {points.map((point) => (
            <button className={`rounded-md border px-2 py-1.5 text-left ${value === point.label ? "border-moss bg-mint font-semibold text-moss" : "border-line bg-white"}`} disabled={disabled} key={point.label} onClick={() => onChange(point.label)} type="button">{point.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
