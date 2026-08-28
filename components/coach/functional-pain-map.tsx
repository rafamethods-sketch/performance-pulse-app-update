"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PainMapView = "front" | "posterior";
type PainMapPoint = { height: number; label: string; view?: PainMapView; width: number; x: number; y: number };

export function FunctionalPainMap({
  disabled = false,
  frontImageSrc,
  imageAlt = "Mapa anatómico funcional",
  imageSrc,
  onChange,
  posteriorImageSrc,
  points,
  value
}: {
  disabled?: boolean;
  frontImageSrc?: string;
  imageAlt?: string;
  imageSrc?: string;
  onChange: (value: string) => void;
  posteriorImageSrc?: string;
  points: PainMapPoint[];
  value?: string;
}) {
  const initialView = points.find((point) => point.label === value)?.view ?? "front";
  const [selectedView, setSelectedView] = useState<PainMapView>(initialView);
  const hasViewSelector = Boolean(frontImageSrc && posteriorImageSrc);
  const selectedImageSrc = selectedView === "posterior"
    ? posteriorImageSrc ?? frontImageSrc ?? imageSrc
    : frontImageSrc ?? imageSrc ?? posteriorImageSrc;
  const visiblePoints = points.filter((point) => (point.view ?? "front") === selectedView);

  useEffect(() => {
    const selectedPoint = points.find((point) => point.label === value);
    if (selectedPoint) setSelectedView(selectedPoint.view ?? "front");
  }, [points, value]);

  return (
    <div className="rounded-md border border-line bg-panel/25 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-ink/45">Mapa orientativo</p>
        {hasViewSelector ? (
          <div className="flex rounded-md border border-line bg-white p-0.5">
            {(["front", "posterior"] as const).map((view) => (
              <button className={`rounded px-2 py-1 text-xs font-semibold ${selectedView === view ? "bg-mint text-moss" : "text-ink/50"}`} key={view} onClick={() => setSelectedView(view)} type="button">{view === "front" ? "Anterior" : "Posterior"}</button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3">
        {selectedImageSrc ? (
          <div className="relative mx-auto w-full max-w-48 overflow-hidden rounded-md">
            <Image alt={`${imageAlt} · vista ${selectedView === "front" ? "anterior" : "posterior"}`} className="block h-auto max-h-96 w-full object-contain" height={384} src={selectedImageSrc} width={192} />
            {visiblePoints.map((point) => (
              <button
                aria-label={point.label}
                className={`absolute rounded-md transition ${disabled ? "cursor-default" : "cursor-pointer hover:bg-moss/10"} ${value === point.label ? "bg-moss/15 ring-1 ring-inset ring-moss/25" : "bg-transparent"}`}
                disabled={disabled}
                key={point.label}
                onClick={() => onChange(point.label)}
                style={{ height: `${point.height}%`, left: `${point.x}%`, top: `${point.y}%`, width: `${point.width}%` }}
                type="button"
              />
            ))}
          </div>
        ) : (
          <div aria-label={imageAlt} className="relative mx-auto h-52 w-36 rounded-full border-2 border-line bg-panel">
            {visiblePoints.map((point) => (
              <button
                aria-label={point.label}
                className={`absolute rounded-md transition ${disabled ? "cursor-default" : "cursor-pointer hover:bg-moss/10"} ${value === point.label ? "bg-moss/15 ring-1 ring-inset ring-moss/25" : "bg-transparent"}`}
                disabled={disabled}
                key={point.label}
                onClick={() => onChange(point.label)}
                style={{ height: `${point.height}%`, left: `${point.x}%`, top: `${point.y}%`, width: `${point.width}%` }}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
