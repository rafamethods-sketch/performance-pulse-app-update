"use client";

import Image from "next/image";
import { useState } from "react";
import type { MuscleFatigueLevel, MuscleFatigueResult } from "@/lib/muscle-fatigue";

type BodyFatigueMapProps = {
  muscles: MuscleFatigueResult[];
};

type ZoneShape = { key: string; label: string; d: string };

const levelStyles: Record<MuscleFatigueLevel, { badge: string; bar: string; label: string; fill: string; opacity: number }> = {
  none: { badge: "border-line bg-panel text-ink/60", bar: "bg-ink/20", label: "Sin carga registrada", fill: "rgb(var(--color-ink))", opacity: 0.04 },
  low: { badge: "border-line bg-mint text-moss", bar: "bg-moss", label: "Baja", fill: "rgb(var(--color-moss))", opacity: 0.25 },
  moderate: { badge: "border-line bg-wheat text-ink", bar: "bg-clay", label: "Media", fill: "rgb(var(--color-clay))", opacity: 0.24 },
  high: { badge: "border-clay/30 bg-clay/10 text-ink", bar: "bg-clay", label: "Alta", fill: "rgb(var(--color-clay))", opacity: 0.42 },
  very_high: { badge: "border-clay/60 bg-clay/20 text-ink", bar: "bg-clay", label: "Muy alta", fill: "rgb(var(--color-clay))", opacity: 0.64 }
};

// Approximate visual zones in the images' 768 × 1024 coordinate space.
// These shapes do not change muscle scores or imply side-specific measurements.
const frontZones: ZoneShape[] = [
  { key: "chest", label: "Pectoral", d: "M326 203 Q370 173 419 190 L418 263 Q365 283 321 247Z M433 190 Q480 173 523 204 L523 247 Q481 283 434 263Z" },
  { key: "core", label: "Core", d: "M359 279 Q420 289 486 279 L480 365 L452 434 L397 434 L365 368Z" },
  { key: "delts", label: "Deltoides", d: "M319 174 Q284 183 282 239 L306 261 L326 207 L359 184Z M518 174 Q553 183 558 239 L537 261 L518 207 L487 184Z" },
  { key: "biceps", label: "Bíceps", d: "M283 247 Q271 275 273 315 L299 333 L320 274 L308 250Z M541 247 Q561 275 563 315 L539 333 L520 274 L532 250Z" },
  { key: "glutes", label: "Glúteos", d: "M342 381 L362 399 L363 454 L329 482 Q316 432 342 381Z M495 381 L476 399 L477 454 L510 482 Q522 432 495 381Z" },
  { key: "quadriceps", label: "Cuádriceps", d: "M329 466 Q340 491 390 472 L397 542 L377 662 L344 684 Q310 592 329 466Z M451 472 Q484 491 510 466 Q527 592 493 684 L460 662 L444 542Z" },
  { key: "calves", label: "Gemelos / sóleo", d: "M342 697 L371 701 Q382 758 366 812 L353 876 L332 876 Q313 777 342 697Z M464 701 L493 697 Q520 777 501 876 L480 876 L469 812 Q453 758 464 701Z" }
];

const backZones: ZoneShape[] = [
  { key: "back", label: "Espalda / dorsales", d: "M270 163 L314 149 L329 174 L333 296 L303 345 L268 300 L245 225Z M355 149 L400 163 L423 225 L399 300 L364 345 L338 296 L340 174Z" },
  { key: "core", label: "Core", d: "M305 312 L330 290 L341 290 L365 312 L378 393 Q335 370 294 393Z" },
  { key: "delts", label: "Deltoides", d: "M257 171 Q220 169 208 233 L232 250 L254 217 L281 181Z M411 171 Q449 169 458 233 L434 250 L413 217 L386 181Z" },
  { key: "triceps", label: "Tríceps", d: "M210 247 L235 254 L253 278 L228 327 L205 307Z M436 254 L458 247 L464 307 L443 327 L419 278Z" },
  { key: "glutes", label: "Glúteos", d: "M277 396 Q307 384 332 409 L331 486 Q285 520 265 477Z M339 409 Q364 384 396 396 L408 477 Q385 520 340 486Z" },
  { key: "hamstrings", label: "Isquiosurales", d: "M263 492 Q289 523 327 503 L320 609 L304 675 L277 680 Q255 596 263 492Z M343 503 Q380 523 409 492 Q417 596 395 680 L366 675 L350 609Z" },
  { key: "calves", label: "Gemelos / sóleo", d: "M277 694 L305 694 Q322 741 305 793 L289 844 L270 843 Q251 769 277 694Z M367 694 L395 694 Q421 769 402 843 L383 844 L367 793 Q350 741 367 694Z" }
];

function getZoneData(musclesByKey: Map<string, MuscleFatigueResult>, key: string) {
  const muscle = musclesByKey.get(key);
  return { muscle, style: levelStyles[muscle?.level ?? "none"] };
}

function getZoneLabel(musclesByKey: Map<string, MuscleFatigueResult>, zone: ZoneShape) {
  const { muscle, style } = getZoneData(musclesByKey, zone.key);
  return muscle ? `${muscle.label} · ${style.label} · ${muscle.relative}% relativo` : `${zone.label} · Sin datos`;
}

function MuscleZone({ musclesByKey, zone }: { musclesByKey: Map<string, MuscleFatigueResult>; zone: ZoneShape }) {
  const { style } = getZoneData(musclesByKey, zone.key);
  const label = getZoneLabel(musclesByKey, zone);
  return (
    <path aria-label={label} d={zone.d} fill={style.fill} fillOpacity={style.opacity} role="img" stroke="rgba(255,255,255,0.6)" strokeWidth={1} vectorEffect="non-scaling-stroke">
      <title>{label}</title>
    </path>
  );
}

const views = {
  front: {
    label: "Anterior",
    image: "/body-maps/fatigue-map-anterior.png",
    zones: frontZones
  },
  back: {
    label: "Posterior",
    image: "/body-maps/fatigue-map-posterior.png",
    zones: backZones
  }
} as const;

const mappedKeys = new Set([...frontZones, ...backZones].map((zone) => zone.key));

function MuscleList({ muscles }: BodyFatigueMapProps) {
  return (
    <ul className="grid min-w-0 gap-2 sm:grid-cols-2">
      {muscles.map((muscle) => {
        const style = levelStyles[muscle.level];

        return (
          <li className="min-w-0 rounded-xl border border-line bg-panel/45 p-3" key={muscle.key}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="break-words text-sm font-semibold text-ink">{muscle.label}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                {style.label}
              </span>
            </div>
            <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${muscle.relative}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-ink/60">{muscle.relative}% relativo</p>
          </li>
        );
      })}
    </ul>
  );
}

export function BodyFatigueMap({ muscles }: BodyFatigueMapProps) {
  const [selectedView, setSelectedView] = useState<keyof typeof views>("front");
  const view = views[selectedView];
  const musclesByKey = new Map<string, MuscleFatigueResult>(muscles.map((muscle) => [muscle.key, muscle]));
  const visibleMuscles = muscles.filter((muscle) => view.zones.some((zone) => zone.key === muscle.key));
  const otherMuscles = muscles.filter((muscle) => !mappedKeys.has(muscle.key));
  const hasData = muscles.some((muscle) => muscle.score > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel/35 p-5 text-center text-sm text-ink/60">
        Aún no hay datos suficientes para estimar la fatiga muscular.
      </div>
    );
  }

  return (
    <section aria-label="Fatiga estimada por grupo muscular" className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">Fatiga estimada</p>
          <p className="mt-1 text-xs text-ink/60">Carga muscular reciente · lectura relativa entre grupos.</p>
        </div>
        <div aria-label="Vista del cuerpo" className="inline-flex rounded-lg border border-line bg-panel p-1" role="group">
          {(["front", "back"] as const).map((key) => (
            <button
              aria-pressed={selectedView === key}
              className={`min-h-10 rounded-md px-3 text-sm font-semibold transition ${selectedView === key ? "bg-mint text-moss" : "text-ink/60 hover:bg-ink/5"}`}
              key={key}
              onClick={() => setSelectedView(key)}
              type="button"
            >
              {views[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
        <figure className="min-w-0 rounded-xl border border-line bg-panel/45 p-3">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] sm:max-w-[280px]">
            <Image
              alt={`Cuerpo humano: vista ${view.label.toLowerCase()} orientativa`}
              className="h-full w-full rounded-lg object-contain mix-blend-multiply [[data-theme=dark]_&]:invert [[data-theme=dark]_&]:mix-blend-screen"
              height={1024}
              src={view.image}
              width={768}
            />
            <svg aria-label={`Zonas de fatiga estimada · ${view.label}`} className="absolute inset-0 h-full w-full" role="group" viewBox="0 0 768 1024">
              {view.zones.map((zone) => <MuscleZone key={zone.key} musclesByKey={musclesByKey} zone={zone} />)}
            </svg>
          </div>
          <figcaption className="mt-3 text-center text-xs leading-relaxed text-ink/55">
            Referencia visual orientativa. La fatiga se estima por grupos musculares según los registros disponibles.
          </figcaption>
        </figure>

        <div className="min-w-0 space-y-3">
          <h4 className="text-sm font-semibold text-ink">Grupos musculares · {view.label}</h4>
          {visibleMuscles.length > 0 ? <MuscleList muscles={visibleMuscles} /> : (
            <p className="text-sm text-ink/60">Sin datos para los grupos de esta vista.</p>
          )}
          {otherMuscles.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-ink">Otros grupos</h4>
              <MuscleList muscles={otherMuscles} />
            </div>
          ) : null}
          <div className="rounded-xl border border-line bg-panel/35 p-3">
            <p className="text-xs font-semibold text-ink/60">Escala de fatiga estimada</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(["none", "low", "moderate", "high", "very_high"] as const).map((level) => (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium ${levelStyles[level].badge}`} key={level}>
                  <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border border-line" style={{ backgroundColor: levelStyles[level].fill, opacity: levelStyles[level].opacity }} />
                  {levelStyles[level].label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink/55">Estimación orientativa según los registros disponibles. Sin carga registrada no equivale a recuperación completa.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
