"use client";

import { formatExerciseTempo, type ExerciseTempo } from "@/lib/exercise-tempo";

type ExerciseTempoEditorProps = {
  onChange: (tempo: ExerciseTempo) => void;
  onRemove: () => void;
  tempo: ExerciseTempo;
};

const phases: Array<{ key: keyof ExerciseTempo; label: string; marker: string; explosive?: boolean }> = [
  { key: "eccentric", label: "Excéntrica", marker: "↓" },
  { key: "postEccentricPause", label: "Pausa tras excéntrica", marker: "•" },
  { key: "concentric", label: "Concéntrica", marker: "↑", explosive: true },
  { key: "postConcentricPause", label: "Pausa tras concéntrica", marker: "•" }
];

export function ExerciseTempoEditor({ onChange, onRemove, tempo }: ExerciseTempoEditorProps) {
  const formattedTempo = formatExerciseTempo(tempo);

  return (
    <div className="rounded-md border border-line bg-panel/25 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {phases.map((phase) => (
          <label className="rounded-md border border-line bg-white p-2 text-[10px] font-semibold text-ink/50" key={phase.key}>
            <span className="flex items-center justify-between gap-2">
              <span>{phase.label}</span>
              <span aria-hidden="true" className="text-base text-steel">{phase.marker}</span>
            </span>
            <input
              aria-label={phase.label}
              className="mt-2 h-9 w-full rounded-md border border-line bg-panel/30 px-2 text-center text-sm font-semibold uppercase text-ink outline-none focus:border-moss"
              inputMode={phase.explosive ? "text" : "decimal"}
              onChange={(event) => {
                const value = phase.explosive ? event.target.value.toUpperCase() : event.target.value;
                if (value && value !== "X" && (!/^\d*(?:[.,]\d*)?$/.test(value) || Number(value.replace(",", ".")) < 0)) return;
                onChange({ ...tempo, [phase.key]: value });
              }}
              placeholder={phase.explosive ? "X o s" : "s"}
              title={phase.explosive ? "X indica intención máxima o explosiva." : `${phase.label} en segundos.`}
              value={tempo[phase.key]}
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-ink">{formattedTempo || "Completa las cuatro fases"}</p>
          <p className="mt-0.5 text-[11px] text-ink/45">X indica intención máxima en la fase concéntrica.</p>
        </div>
        <button className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink/55 hover:bg-white" onClick={onRemove} type="button">Quitar tempo</button>
      </div>
    </div>
  );
}
