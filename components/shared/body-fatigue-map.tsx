import type { MuscleFatigueLevel, MuscleFatigueResult } from "@/lib/muscle-fatigue";

type BodyFatigueMapProps = {
  muscles: MuscleFatigueResult[];
};

type ZoneShape = {
  d?: string;
  key: string;
  label: string;
  shape: "circle" | "path" | "rect";
  cx?: number;
  cy?: number;
  height?: number;
  r?: number;
  rx?: number;
  strokeWidth?: number;
  view: "front" | "back";
  width?: number;
  x?: number;
  y?: number;
};

const levelStyles: Record<MuscleFatigueLevel, { badge: string; fill: string; label: string }> = {
  high: {
    badge: "border-orange-300/60 bg-orange-500/12 text-orange-700 dark:text-orange-200",
    fill: "#f97316",
    label: "Alta"
  },
  low: {
    badge: "border-teal-300/60 bg-teal-500/12 text-teal-700 dark:text-teal-200",
    fill: "#5eead4",
    label: "Baja"
  },
  moderate: {
    badge: "border-amber-300/70 bg-amber-500/14 text-amber-800 dark:text-amber-200",
    fill: "#facc15",
    label: "Moderada"
  },
  none: {
    badge: "border-line bg-panel/70 text-ink/50",
    fill: "#d8dedb",
    label: "Sin carga"
  },
  very_high: {
    badge: "border-red-300/70 bg-red-500/14 text-red-700 dark:text-red-200",
    fill: "#ef4444",
    label: "Muy alta"
  }
};

const frontZones: ZoneShape[] = [
  { cx: 110, cy: 22, key: "none", label: "Cabeza", r: 18, shape: "circle", view: "front" },
  { height: 19, key: "none", label: "Cuello", rx: 8, shape: "rect", view: "front", width: 22, x: 99, y: 42 },
  { d: "M75 75 C84 59 96 54 110 54 C124 54 136 59 145 75 C138 88 126 96 110 97 C94 96 82 88 75 75Z", key: "chest", label: "Pectoral", shape: "path", view: "front" },
  { d: "M92 96 C101 101 119 101 128 96 L136 154 C128 174 119 183 110 184 C101 183 92 174 84 154Z", key: "core", label: "Core", shape: "path", view: "front" },
  { d: "M72 76 C58 82 49 96 46 116 C58 115 67 107 76 91Z", key: "delts", label: "Deltoides", shape: "path", view: "front" },
  { d: "M148 76 C162 82 171 96 174 116 C162 115 153 107 144 91Z", key: "delts", label: "Deltoides", shape: "path", view: "front" },
  { d: "M45 119 C39 141 36 160 35 183 C47 181 53 162 55 123Z", key: "biceps", label: "Biceps", shape: "path", view: "front" },
  { d: "M175 119 C181 141 184 160 185 183 C173 181 167 162 165 123Z", key: "biceps", label: "Biceps", shape: "path", view: "front" },
  { d: "M34 187 C33 205 36 223 42 238 C51 225 51 204 45 185Z", key: "forearms", label: "Antebrazos", shape: "path", view: "front" },
  { d: "M186 187 C187 205 184 223 178 238 C169 225 169 204 175 185Z", key: "forearms", label: "Antebrazos", shape: "path", view: "front" },
  { d: "M83 160 C95 171 125 171 137 160 C139 181 132 198 110 202 C88 198 81 181 83 160Z", key: "glutes", label: "Gluteos", shape: "path", view: "front" },
  { d: "M75 169 C84 180 91 196 91 215 C78 210 68 194 66 176Z", key: "glutes", label: "Gluteo medio", shape: "path", view: "front" },
  { d: "M145 169 C136 180 129 196 129 215 C142 210 152 194 154 176Z", key: "glutes", label: "Gluteo medio", shape: "path", view: "front" },
  { d: "M85 207 C73 244 70 286 79 323 C94 304 101 250 103 208Z", key: "quadriceps", label: "Cuadriceps", shape: "path", view: "front" },
  { d: "M135 207 C147 244 150 286 141 323 C126 304 119 250 117 208Z", key: "quadriceps", label: "Cuadriceps", shape: "path", view: "front" },
  { d: "M103 212 C99 244 97 276 99 303 C105 287 109 246 109 213Z", key: "adductors", label: "Aductores", shape: "path", view: "front" },
  { d: "M117 212 C121 244 123 276 121 303 C115 287 111 246 111 213Z", key: "adductors", label: "Aductores", shape: "path", view: "front" },
  { d: "M78 326 C72 347 71 365 76 381 C88 372 91 349 88 327Z", key: "tibialisAnterior", label: "Tibial anterior", shape: "path", view: "front" },
  { d: "M142 326 C148 347 149 365 144 381 C132 372 129 349 132 327Z", key: "tibialisAnterior", label: "Tibial anterior", shape: "path", view: "front" },
  { d: "M89 329 C96 350 96 371 88 388 C101 382 106 358 102 329Z", key: "calves", label: "Gemelos / soleo", shape: "path", view: "front" },
  { d: "M131 329 C124 350 124 371 132 388 C119 382 114 358 118 329Z", key: "calves", label: "Gemelos / soleo", shape: "path", view: "front" }
];

const backZones: ZoneShape[] = [
  { cx: 110, cy: 22, key: "none", label: "Cabeza", r: 18, shape: "circle", view: "back" },
  { height: 19, key: "none", label: "Cuello", rx: 8, shape: "rect", view: "back", width: 22, x: 99, y: 42 },
  { d: "M76 76 C86 60 96 55 110 55 C124 55 134 60 144 76 C138 102 127 125 110 138 C93 125 82 102 76 76Z", key: "back", label: "Espalda / dorsales", shape: "path", view: "back" },
  { d: "M99 95 C105 107 115 107 121 95 L126 162 C121 175 116 183 110 187 C104 183 99 175 94 162Z", key: "core", label: "Erectores / core posterior", shape: "path", view: "back" },
  { d: "M72 76 C58 82 49 96 46 116 C58 115 67 107 76 91Z", key: "delts", label: "Deltoides", shape: "path", view: "back" },
  { d: "M148 76 C162 82 171 96 174 116 C162 115 153 107 144 91Z", key: "delts", label: "Deltoides", shape: "path", view: "back" },
  { d: "M45 119 C39 141 36 160 35 183 C47 181 53 162 55 123Z", key: "triceps", label: "Triceps", shape: "path", view: "back" },
  { d: "M175 119 C181 141 184 160 185 183 C173 181 167 162 165 123Z", key: "triceps", label: "Triceps", shape: "path", view: "back" },
  { d: "M34 187 C33 205 36 223 42 238 C51 225 51 204 45 185Z", key: "forearms", label: "Antebrazos", shape: "path", view: "back" },
  { d: "M186 187 C187 205 184 223 178 238 C169 225 169 204 175 185Z", key: "forearms", label: "Antebrazos", shape: "path", view: "back" },
  { d: "M80 160 C95 171 125 171 140 160 C141 187 130 205 110 209 C90 205 79 187 80 160Z", key: "glutes", label: "Gluteos", shape: "path", view: "back" },
  { d: "M76 166 C85 184 90 201 89 219 C76 214 66 196 65 177Z", key: "glutes", label: "Gluteo medio", shape: "path", view: "back" },
  { d: "M144 166 C135 184 130 201 131 219 C144 214 154 196 155 177Z", key: "glutes", label: "Gluteo medio", shape: "path", view: "back" },
  { d: "M85 213 C72 249 72 287 80 323 C95 304 102 253 102 215Z", key: "hamstrings", label: "Isquiosurales", shape: "path", view: "back" },
  { d: "M135 213 C148 249 148 287 140 323 C125 304 118 253 118 215Z", key: "hamstrings", label: "Isquiosurales", shape: "path", view: "back" },
  { d: "M76 326 C68 348 69 370 78 389 C91 377 91 349 87 326Z", key: "calves", label: "Gemelos / soleo", shape: "path", view: "back" },
  { d: "M144 326 C152 348 151 370 142 389 C129 377 129 349 133 326Z", key: "calves", label: "Gemelos / soleo", shape: "path", view: "back" }
];

function getZoneData(musclesByKey: Map<string, MuscleFatigueResult>, key: string) {
  const muscle = musclesByKey.get(key);
  const level = muscle?.level ?? "none";

  return {
    fill: levelStyles[level].fill,
    levelLabel: levelStyles[level].label,
    relative: muscle?.relative ?? 0
  };
}

function getZoneLabel(musclesByKey: Map<string, MuscleFatigueResult>, zone: ZoneShape) {
  const data = getZoneData(musclesByKey, zone.key);
  return `${zone.label} · ${data.levelLabel} · ${data.relative}%`;
}

function MuscleZone({ musclesByKey, zone }: { musclesByKey: Map<string, MuscleFatigueResult>; zone: ZoneShape }) {
  const data = getZoneData(musclesByKey, zone.key);
  const label = getZoneLabel(musclesByKey, zone);
  const commonProps = {
    "aria-label": label,
    fill: data.fill,
    role: "img",
    stroke: "rgba(255,255,255,0.72)",
    strokeLinejoin: "round" as const,
    strokeWidth: zone.strokeWidth ?? 1.4
  };

  if (zone.shape === "circle") {
    return (
      <circle {...commonProps} cx={zone.cx} cy={zone.cy} r={zone.r}>
        <title>{label}</title>
      </circle>
    );
  }

  if (zone.shape === "rect") {
    return (
      <rect {...commonProps} height={zone.height} rx={zone.rx} width={zone.width} x={zone.x} y={zone.y}>
        <title>{label}</title>
      </rect>
    );
  }

  return (
    <path {...commonProps} d={zone.d}>
      <title>{label}</title>
    </path>
  );
}

function MuscleFigure({
  musclesByKey,
  title,
  zones
}: {
  musclesByKey: Map<string, MuscleFatigueResult>;
  title: string;
  zones: ZoneShape[];
}) {
  return (
    <div className="rounded-md border border-line bg-panel/55 p-3 shadow-soft">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{title}</p>
      <svg aria-label={`Mapa muscular ${title.toLowerCase()}`} className="mx-auto h-auto w-full max-w-[260px]" role="img" viewBox="0 0 220 404">
        <g opacity="0.42">
          <path className="text-ink/20" d="M80 67 C89 52 99 47 110 47 C121 47 131 52 140 67 L158 167 C160 188 153 211 140 225 L130 393 L91 393 L80 225 C67 211 60 188 62 167Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path className="text-ink/15" d="M67 83 C46 94 36 126 31 182 C29 204 33 225 43 244" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
          <path className="text-ink/15" d="M153 83 C174 94 184 126 189 182 C191 204 187 225 177 244" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
        </g>
        {zones.map((zone) => (
          <MuscleZone key={`${zone.view}-${zone.label}-${zone.d ?? zone.x ?? zone.cx}`} musclesByKey={musclesByKey} zone={zone} />
        ))}
        <path d="M99 43 C101 57 119 57 121 43" fill="none" stroke="rgba(255,255,255,0.68)" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M110 99 L110 186" fill="none" stroke="rgba(255,255,255,0.5)" strokeLinecap="round" strokeWidth="1" />
        <path d="M110 209 L110 393" fill="none" stroke="rgba(255,255,255,0.45)" strokeLinecap="round" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function BodyFatigueMap({ muscles }: BodyFatigueMapProps) {
  const musclesByKey = new Map(muscles.map((muscle) => [muscle.key, muscle]));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,1fr)_minmax(280px,0.82fr)] xl:items-start">
      <div className="rounded-md border border-line bg-panel/35 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MuscleFigure musclesByKey={musclesByKey} title="Frontal" zones={frontZones} />
          <MuscleFigure musclesByKey={musclesByKey} title="Posterior" zones={backZones} />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-md border border-line bg-panel/45 p-3 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Leyenda</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["none", "low", "moderate", "high", "very_high"] as MuscleFatigueLevel[]).map((level) => (
              <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${levelStyles[level].badge}`} key={level}>
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: levelStyles[level].fill }} />
                {levelStyles[level].label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {muscles.map((muscle) => {
            const style = levelStyles[muscle.level];

            return (
              <div className="rounded-md border border-line bg-panel/45 p-3 shadow-soft" key={muscle.key}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{muscle.label}</p>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/8">
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
