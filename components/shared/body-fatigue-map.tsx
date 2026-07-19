import type { FatigueZoneLevel, FatigueZoneResult } from "@/lib/fatigue-zones";

type BodyFatigueMapProps = {
  zones: FatigueZoneResult[];
};

const bodyZoneLabels: Record<string, string> = {
  anteriorLower: "Tren inferior anterior",
  posteriorLower: "Tren inferior posterior",
  glutesHip: "Glúteos / cadera",
  upperPush: "Empuje superior",
  upperPull: "Tirón superior",
  core: "Core"
};

const levelStyles: Record<FatigueZoneLevel, { badge: string; fill: string; label: string }> = {
  high: {
    badge: "bg-red-50 text-red-700",
    fill: "#ef4444",
    label: "Alto"
  },
  low: {
    badge: "bg-panel text-ink/45",
    fill: "#dbe7df",
    label: "Bajo"
  },
  moderate: {
    badge: "bg-amber-100 text-amber-800",
    fill: "#f59e0b",
    label: "Moderado"
  }
};

function getZoneLevel(zonesByKey: Map<string, FatigueZoneResult>, key: string): FatigueZoneLevel {
  return zonesByKey.get(key)?.level ?? "low";
}

function getZoneScore(zonesByKey: Map<string, FatigueZoneResult>, key: string) {
  return zonesByKey.get(key)?.score ?? 0;
}

export function BodyFatigueMap({ zones }: BodyFatigueMapProps) {
  const zonesByKey = new Map(zones.map((zone) => [zone.key, zone]));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_1fr] lg:items-center">
      <div className="rounded-md border border-line bg-panel/35 p-4">
        <svg aria-label="Mapa corporal de fatiga" className="mx-auto h-auto w-full max-w-xs" role="img" viewBox="0 0 240 360">
          <circle cx="120" cy="34" fill="#eef4f0" r="24" stroke="#d3ded8" strokeWidth="2" />
          <rect fill={levelStyles[getZoneLevel(zonesByKey, "upperPush")].fill} height="58" rx="22" stroke="#ffffff" strokeWidth="3" width="96" x="72" y="68" />
          <path d="M72 78 C42 98 34 128 31 165" fill="none" stroke={levelStyles[getZoneLevel(zonesByKey, "upperPull")].fill} strokeLinecap="round" strokeWidth="22" />
          <path d="M168 78 C198 98 206 128 209 165" fill="none" stroke={levelStyles[getZoneLevel(zonesByKey, "upperPull")].fill} strokeLinecap="round" strokeWidth="22" />
          <rect fill={levelStyles[getZoneLevel(zonesByKey, "core")].fill} height="72" rx="20" stroke="#ffffff" strokeWidth="3" width="74" x="83" y="116" />
          <ellipse cx="120" cy="198" fill={levelStyles[getZoneLevel(zonesByKey, "glutesHip")].fill} rx="48" ry="25" stroke="#ffffff" strokeWidth="3" />
          <path d="M98 220 L86 322" stroke={levelStyles[getZoneLevel(zonesByKey, "anteriorLower")].fill} strokeLinecap="round" strokeWidth="28" />
          <path d="M142 220 L154 322" stroke={levelStyles[getZoneLevel(zonesByKey, "anteriorLower")].fill} strokeLinecap="round" strokeWidth="28" />
          <path d="M84 226 C63 255 57 290 61 326" fill="none" stroke={levelStyles[getZoneLevel(zonesByKey, "posteriorLower")].fill} strokeLinecap="round" strokeWidth="14" />
          <path d="M156 226 C177 255 183 290 179 326" fill="none" stroke={levelStyles[getZoneLevel(zonesByKey, "posteriorLower")].fill} strokeLinecap="round" strokeWidth="14" />
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(bodyZoneLabels).map(([key, label]) => {
          const level = getZoneLevel(zonesByKey, key);
          const score = getZoneScore(zonesByKey, key);
          const style = levelStyles[level];

          return (
            <div className="rounded-md border border-line bg-panel/35 p-3" key={key}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{label}</p>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${style.badge}`}>
                  {style.label}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-ink/50">
                {score > 0 ? `${score} señales esta semana` : "Sin señales registradas"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 lg:col-span-2">
        {(["low", "moderate", "high"] as FatigueZoneLevel[]).map((level) => (
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${levelStyles[level].badge}`} key={level}>
            {levelStyles[level].label}
          </span>
        ))}
      </div>
    </div>
  );
}
