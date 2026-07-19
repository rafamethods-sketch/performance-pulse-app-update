import type { MuscleFatigueLevel, MuscleFatigueResult } from "@/lib/muscle-fatigue";

type BodyFatigueMapProps = {
  muscles: MuscleFatigueResult[];
};

const levelStyles: Record<MuscleFatigueLevel, { badge: string; fill: string; label: string }> = {
  high: {
    badge: "bg-orange-50 text-orange-700",
    fill: "#fb923c",
    label: "Alta"
  },
  low: {
    badge: "bg-blue-50 text-blue-700",
    fill: "#93c5fd",
    label: "Baja"
  },
  moderate: {
    badge: "bg-amber-100 text-amber-800",
    fill: "#facc15",
    label: "Moderada"
  },
  none: {
    badge: "bg-panel text-ink/45",
    fill: "#dbe7df",
    label: "Sin carga"
  },
  very_high: {
    badge: "bg-red-50 text-red-700",
    fill: "#ef4444",
    label: "Muy alta"
  }
};

function getMuscle(musclesByKey: Map<string, MuscleFatigueResult>, key: string) {
  return musclesByKey.get(key);
}

function getMuscleFill(musclesByKey: Map<string, MuscleFatigueResult>, key: string) {
  const level = getMuscle(musclesByKey, key)?.level ?? "none";
  return levelStyles[level].fill;
}

export function BodyFatigueMap({ muscles }: BodyFatigueMapProps) {
  const musclesByKey = new Map(muscles.map((muscle) => [muscle.key, muscle]));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.95fr)_1fr] lg:items-start">
      <div className="rounded-md border border-line bg-panel/35 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-center text-xs font-semibold uppercase text-ink/45">Anterior</p>
            <svg aria-label="Mapa muscular anterior" className="mx-auto h-auto w-full max-w-[210px]" role="img" viewBox="0 0 220 380">
              <circle cx="110" cy="28" fill="#eef4f0" r="22" stroke="#d3ded8" strokeWidth="2" />
              <path d="M82 62 Q110 48 138 62 L132 118 Q110 132 88 118 Z" fill={getMuscleFill(musclesByKey, "chest")} stroke="#ffffff" strokeWidth="3" />
              <path d="M88 121 Q110 135 132 121 L138 188 Q110 203 82 188 Z" fill={getMuscleFill(musclesByKey, "core")} stroke="#ffffff" strokeWidth="3" />
              <path d="M72 68 Q50 82 43 116 L34 161" fill="none" stroke={getMuscleFill(musclesByKey, "delts")} strokeLinecap="round" strokeWidth="22" />
              <path d="M148 68 Q170 82 177 116 L186 161" fill="none" stroke={getMuscleFill(musclesByKey, "delts")} strokeLinecap="round" strokeWidth="22" />
              <path d="M39 124 L31 178" stroke={getMuscleFill(musclesByKey, "biceps")} strokeLinecap="round" strokeWidth="17" />
              <path d="M181 124 L189 178" stroke={getMuscleFill(musclesByKey, "biceps")} strokeLinecap="round" strokeWidth="17" />
              <ellipse cx="110" cy="204" fill={getMuscleFill(musclesByKey, "glutes")} rx="42" ry="22" stroke="#ffffff" strokeWidth="3" />
              <path d="M91 225 L80 318" stroke={getMuscleFill(musclesByKey, "quadriceps")} strokeLinecap="round" strokeWidth="30" />
              <path d="M129 225 L140 318" stroke={getMuscleFill(musclesByKey, "quadriceps")} strokeLinecap="round" strokeWidth="30" />
              <path d="M78 323 L73 356" stroke={getMuscleFill(musclesByKey, "calves")} strokeLinecap="round" strokeWidth="20" />
              <path d="M142 323 L147 356" stroke={getMuscleFill(musclesByKey, "calves")} strokeLinecap="round" strokeWidth="20" />
            </svg>
          </div>

          <div>
            <p className="mb-2 text-center text-xs font-semibold uppercase text-ink/45">Posterior</p>
            <svg aria-label="Mapa muscular posterior" className="mx-auto h-auto w-full max-w-[210px]" role="img" viewBox="0 0 220 380">
              <circle cx="110" cy="28" fill="#eef4f0" r="22" stroke="#d3ded8" strokeWidth="2" />
              <path d="M78 66 Q110 50 142 66 L134 147 Q110 166 86 147 Z" fill={getMuscleFill(musclesByKey, "back")} stroke="#ffffff" strokeWidth="3" />
              <path d="M74 68 Q50 84 42 118 L34 160" fill="none" stroke={getMuscleFill(musclesByKey, "delts")} strokeLinecap="round" strokeWidth="22" />
              <path d="M146 68 Q170 84 178 118 L186 160" fill="none" stroke={getMuscleFill(musclesByKey, "delts")} strokeLinecap="round" strokeWidth="22" />
              <path d="M39 123 L31 178" stroke={getMuscleFill(musclesByKey, "triceps")} strokeLinecap="round" strokeWidth="17" />
              <path d="M181 123 L189 178" stroke={getMuscleFill(musclesByKey, "triceps")} strokeLinecap="round" strokeWidth="17" />
              <ellipse cx="110" cy="204" fill={getMuscleFill(musclesByKey, "glutes")} rx="44" ry="25" stroke="#ffffff" strokeWidth="3" />
              <path d="M88 226 C76 256 72 292 75 320" fill="none" stroke={getMuscleFill(musclesByKey, "hamstrings")} strokeLinecap="round" strokeWidth="28" />
              <path d="M132 226 C144 256 148 292 145 320" fill="none" stroke={getMuscleFill(musclesByKey, "hamstrings")} strokeLinecap="round" strokeWidth="28" />
              <path d="M76 323 L70 356" stroke={getMuscleFill(musclesByKey, "calves")} strokeLinecap="round" strokeWidth="20" />
              <path d="M144 323 L150 356" stroke={getMuscleFill(musclesByKey, "calves")} strokeLinecap="round" strokeWidth="20" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-md border border-line bg-panel/35 p-3">
          <p className="text-xs font-semibold uppercase text-ink/45">Leyenda</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["none", "low", "moderate", "high", "very_high"] as MuscleFatigueLevel[]).map((level) => (
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${levelStyles[level].badge}`} key={level}>
                {levelStyles[level].label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {muscles.map((muscle) => {
            const style = levelStyles[muscle.level];

            return (
              <div className="rounded-md border border-line bg-panel/35 p-3" key={muscle.key}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{muscle.label}</p>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full" style={{ backgroundColor: style.fill, width: `${muscle.relative}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-ink/50">{muscle.relative}% relativo</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
