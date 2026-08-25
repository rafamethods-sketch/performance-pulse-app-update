"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  ankleAssessmentConfig,
  ankleDomainLabels,
  ankleStatusLabels,
  calculateSideDifference,
  getAnkleDomainStatuses,
  type AnkleAssessment
} from "@/lib/ankle-assessment";

const domainOrder = ["tolerance", "rom", "strength", "control", "performance"] as const;
const statusOrder = { priority: 0, finding: 1, adequate: 2 } as const;
const emptyAssessment = (): AnkleAssessment => ({
  id: `ankle-${Date.now()}`,
  date: new Date().toISOString().slice(0, 10),
  anchorTask: "Caminar",
  taskStatus: "normal",
  rom: { left: null, right: null },
  strength: { left: null, right: null },
  control: { anteriorLeft: null, anteriorRight: null, posterolateralLeft: null, posterolateralRight: null, posteromedialLeft: null, posteromedialRight: null },
  performance: { left: null, right: null }
});

function numericValue(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function PairFields({ label, left, onChange, right }: { label: string; left: number | null; right: number | null; onChange: (side: "left" | "right", value: number | null) => void }) {
  const difference = calculateSideDifference(right, left);
  return (
    <div className="rounded-md border border-line bg-panel/35 p-3">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-ink/55">Derecho<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm" min="0" onChange={(event) => onChange("right", numericValue(event.target.value))} type="number" value={right ?? ""} /></label>
        <label className="text-xs font-semibold text-ink/55">Izquierdo<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm" min="0" onChange={(event) => onChange("left", numericValue(event.target.value))} type="number" value={left ?? ""} /></label>
      </div>
      <p className="mt-2 text-xs text-ink/50">Diferencia: {difference.absolute ?? "—"} · Asimetría: {difference.asymmetryPct !== null ? `${difference.asymmetryPct}%` : "—"}</p>
    </div>
  );
}

export function CoachAnkleAssessment({ clientName, history, onClose, onSave }: { clientName: string; history: AnkleAssessment[]; onClose: () => void; onSave: (assessment: AnkleAssessment) => void }) {
  const [draft, setDraft] = useState(emptyAssessment);
  const [activeDomain, setActiveDomain] = useState<(typeof domainOrder)[number]>("tolerance");
  const [showSummary, setShowSummary] = useState(false);
  const statuses = useMemo(() => getAnkleDomainStatuses(draft), [draft]);
  const historical = history[0];
  const sortedDomains = [...domainOrder].sort((left, right) => statusOrder[statuses[left]] - statusOrder[statuses[right]]);
  const update = <K extends keyof AnkleAssessment>(key: K, value: AnkleAssessment[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <div aria-modal="true" className="assessment-modal-overlay" role="dialog">
      <section className="assessment-modal-panel max-h-[92vh] max-w-5xl overflow-y-auto">
        <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
          <div><p className="text-xs font-semibold uppercase text-moss">Valoración funcional breve</p><h2 className="text-xl font-semibold text-ink">Tobillo v1 · {clientName}</h2><p className="mt-1 text-sm text-ink/55">Ordena hallazgos para apoyar la decisión del entrenador. No sustituye una valoración clínica.</p></div>
          <button aria-label="Cerrar valoración de tobillo" className="grid size-9 place-items-center rounded-md border border-line bg-white" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className="assessment-modal-body grid gap-4 px-5 py-5">
          <section className="rounded-md border border-line bg-panel/35 p-3"><p className="text-sm font-semibold text-ink">Safety · filtro separado</p><p className="mt-1 text-xs text-ink/55">Registra aquí cualquier motivo para detener o derivar la valoración. No modifica los estados de los dominios.</p><textarea className="mt-2 min-h-16 w-full rounded-md border border-line bg-white p-3 text-sm" onChange={(event) => update("safetyNote", event.target.value)} placeholder="Sin observaciones" value={draft.safetyNote ?? ""} /></section>

          {showSummary ? (
            <section className="grid gap-3">
              <div><h3 className="text-lg font-semibold text-ink">Resumen Tobillo</h3><p className="text-sm text-ink/55">Prioridades primero; sin puntuación global.</p></div>
              {sortedDomains.map((domain) => (
                <button className="flex items-center justify-between rounded-md border border-line bg-white p-3 text-left" key={domain} onClick={() => { setActiveDomain(domain); setShowSummary(false); }} type="button">
                  <span><span className="font-semibold text-ink">{ankleDomainLabels[domain]}</span><span className="mt-1 block text-xs text-ink/50">Abrir resultados y motivo orientativo</span></span>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statuses[domain] === "priority" ? "bg-red-50 text-red-700" : statuses[domain] === "finding" ? "bg-amber-100 text-amber-800" : "bg-mint text-moss"}`}>{ankleStatusLabels[statuses[domain]]}</span>
                </button>
              ))}
              <p className="rounded-md border border-line bg-panel/35 p-3 text-xs text-ink/55">{ankleAssessmentConfig.note}</p>
            </section>
          ) : (
            <>
              <nav className="flex gap-2 overflow-x-auto pb-1">{domainOrder.map((domain) => <button className={`shrink-0 rounded-md border px-3 py-2 text-sm font-semibold ${activeDomain === domain ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/65"}`} key={domain} onClick={() => setActiveDomain(domain)} type="button">{ankleDomainLabels[domain]}</button>)}</nav>
              {activeDomain === "tolerance" ? <section className="grid gap-3"><h3 className="font-semibold text-ink">Tolerancia · Tarea Ancla</h3><select className="h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => update("anchorTask", event.target.value)} value={draft.anchorTask}>{["Caminar","Squat","Lunge","Correr","Saltar","Aterrizar","Cambio de dirección","Otra"].map((item) => <option key={item}>{item}</option>)}</select><select className="h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => update("taskStatus", event.target.value as AnkleAssessment["taskStatus"])} value={draft.taskStatus}><option value="normal">Puede realizarla normalmente</option><option value="discomfort">Puede realizarla con molestias</option><option value="avoids">La evita / no puede realizarla</option></select>{draft.taskStatus !== "normal" ? <><select className="h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => update("regression", event.target.value)} value={draft.regression ?? ""}><option value="">Selecciona una regresión</option>{["Reducir carga","Reducir ROM","Cambiar variante o soporte","Reducir velocidad","Reducir impacto"].map((item) => <option key={item}>{item}</option>)}</select><select className="h-11 rounded-md border border-line bg-white px-3 text-sm" onChange={(event) => update("regressionResponse", event.target.value as AnkleAssessment["regressionResponse"])} value={draft.regressionResponse ?? ""}><option value="">Respuesta tras modificar</option><option value="better">Mejor</option><option value="same">Igual</option><option value="worse">Peor</option></select></> : null}</section> : null}
              {activeDomain === "rom" ? <section className="grid gap-3"><h3 className="font-semibold text-ink">ROM · Knee-to-Wall Test</h3><PairFields label="Distancia (cm)" left={draft.rom.left} right={draft.rom.right} onChange={(side, value) => update("rom", { ...draft.rom, [side]: value })} /><label className="text-sm font-semibold text-ink">¿Modificar la demanda de dorsiflexión mejora claramente la Tarea Ancla?<select className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3" onChange={(event) => update("rom", { ...draft.rom, taskImproves: event.target.value as AnkleAssessment["rom"]["taskImproves"] })} value={draft.rom.taskImproves ?? ""}><option value="">Sin responder</option><option value="yes">Sí</option><option value="no">No</option><option value="inconclusive">No concluyente</option></select></label>{historical ? <p className="text-xs text-ink/50">Comparación disponible con {historical.date}.</p> : <p className="text-xs text-ink/50">Primera medición; la comparación aparecerá en el retest.</p>}</section> : null}
              {activeDomain === "strength" ? <section className="grid gap-3"><h3 className="font-semibold text-ink">Fuerza · Single-Leg Heel Raise</h3><PairFields label="Repeticiones" left={draft.strength.left} right={draft.strength.right} onChange={(side, value) => update("strength", { ...draft.strength, [side]: value })} />{[["consistentHeight","¿Alcanza una altura consistente?"],["maintainsRom","¿Mantiene un ROM similar hasta el final?"],["clearDeviation","¿Existe desviación clara del talón/tobillo?"],["symptomsLimit","¿Los síntomas limitan el test?"]].map(([key,label]) => <label className="flex items-center justify-between gap-3 text-sm" key={key}><span>{label}</span><select className="rounded-md border border-line bg-white px-2 py-1" onChange={(event) => update("strength", { ...draft.strength, [key]: event.target.value === "yes" })}><option value="">—</option><option value="yes">Sí</option><option value="no">No</option></select></label>)}<select className="h-11 rounded-md border border-line bg-white px-3" onChange={(event) => update("strength", { ...draft.strength, stopReason: event.target.value })} value={draft.strength.stopReason ?? ""}><option value="">¿Por qué terminó?</option>{["Fatiga local","Dolor/molestia","Pérdida de técnica","Equilibrio","Otro"].map((item) => <option key={item}>{item}</option>)}</select></section> : null}
              {activeDomain === "control" ? <section className="grid gap-3"><h3 className="font-semibold text-ink">Control / Estabilidad · Y-Balance Test</h3>{[["Anterior","anterior"],["Posteromedial","posteromedial"],["Posterolateral","posterolateral"]].map(([label,key]) => <PairFields key={key} label={`${label} (datos brutos)`} left={draft.control[`${key}Left` as keyof AnkleAssessment["control"]] as number | null} right={draft.control[`${key}Right` as keyof AnkleAssessment["control"]] as number | null} onChange={(side,value) => update("control", { ...draft.control, [`${key}${side === "left" ? "Left" : "Right"}`]: value })} />)}<p className="text-xs text-ink/50">Normalización por longitud de miembro preparada; se muestran datos brutos mientras no esté disponible.</p><label className="text-sm">¿Sientes este tobillo menos estable?<select className="ml-2 rounded-md border border-line bg-white px-2 py-1" onChange={(event) => update("control", { ...draft.control, lessStable: event.target.value === "yes" })}><option value="">—</option><option value="yes">Sí</option><option value="no">No</option></select></label><label className="text-sm">¿Sientes que el tobillo “se te va”?<select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3" onChange={(event) => update("control", { ...draft.control, givesWay: event.target.value as AnkleAssessment["control"]["givesWay"] })}><option value="never">Nunca</option><option value="occasionally">Ocasionalmente</option><option value="frequently">Frecuentemente</option></select></label><label className="text-sm">¿Confías al correr, saltar o cambiar de dirección?<select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3" onChange={(event) => update("control", { ...draft.control, confidence: event.target.value as AnkleAssessment["control"]["confidence"] })}><option value="yes">Sí</option><option value="partially">Parcialmente</option><option value="no">No</option></select></label>{statuses.control !== "adequate" ? <p className="rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">Profundizar evaluación de estabilidad</p> : null}<p className="text-xs text-ink/45">Espacio reservado para CAIT; no implementado en esta versión.</p></section> : null}
              {activeDomain === "performance" ? <section className="grid gap-3"><h3 className="font-semibold text-ink">Performance · Single-Leg Hop</h3><PairFields label="Resultado" left={draft.performance.left} right={draft.performance.right} onChange={(side, value) => update("performance", { ...draft.performance, [side]: value })} /><button className="w-fit rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold text-ink/50" disabled type="button">+ Test avanzado · próximamente</button>{historical ? <p className="text-xs text-ink/50">Comparación disponible con {historical.date}.</p> : <p className="text-xs text-ink/50">Primera medición; la comparación aparecerá en el retest.</p>}</section> : null}
            </>
          )}
          <textarea className="min-h-20 rounded-md border border-line bg-white p-3 text-sm" onChange={(event) => update("notes", event.target.value)} placeholder="Nota orientativa del entrenador" value={draft.notes ?? ""} />
          <div className="flex flex-wrap justify-end gap-2"><button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => setShowSummary((current) => !current)} type="button">{showSummary ? "Volver a dominios" : "Ver resumen"}</button><button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => { onSave(draft); onClose(); }} type="button">Guardar valoración</button></div>
        </div>
      </section>
    </div>
  );
}
