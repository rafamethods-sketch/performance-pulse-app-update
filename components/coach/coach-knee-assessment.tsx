"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { FunctionalPainMap } from "@/components/coach/functional-pain-map";
import { calculateKneeDifference, getKneeDomainStatuses, kneeAssessmentConfig, kneeDomainLabels, kneeStatusLabels, type KneeAssessment, type KneeDomain, type KneeDomainStatus } from "@/lib/knee-assessment";

const domains: KneeDomain[] = ["tolerance", "rom", "strength", "control", "performance"];
const statusOrder: Record<KneeDomainStatus, number> = { priority: 0, finding: 1, adequate: 2, incomplete: 3 };
const painLocations = ["Cara anterior de la rodilla", "Cara medial", "Cara lateral", "Cara posterior", "Región rotuliana", "Tendón rotuliano", "Región cuadricipital distal", "Línea articular medial", "Línea articular lateral", "Hueco poplíteo", "Tibia proximal", "Otra"];
const tasks = ["Sentadilla", "Zancada / split squat", "Subir / bajar escaleras", "Correr", "Salto", "Aterrizaje", "Cambio de dirección", "Arrodillarse", "Otra"];
const visualExtensionOptions = [
  { label: "Completa / casi completa", value: "full" },
  { label: "Falta leve", value: "slightly_limited" },
  { label: "Falta clara", value: "clearly_limited" },
  { label: "No valorable", value: "not_assessed" }
];
const visualFlexionOptions = [
  { label: "Alta / funcional", value: "high" },
  { label: "Moderadamente limitada", value: "moderately_limited" },
  { label: "Claramente limitada", value: "clearly_limited" },
  { label: "No valorable", value: "not_assessed" }
];
const visualSymmetryOptions = [
  { label: "Similar", value: "similar" },
  { label: "Ligera diferencia visual", value: "slight_difference" },
  { label: "Diferencia clara", value: "clear_difference" },
  { label: "No concluyente", value: "not_clear" }
];
const kneeMapPoints = [
  { height: 12, label: "Región cuadricipital distal", view: "front" as const, width: 24, x: 38, y: 24 },
  { height: 16, label: "Cara anterior de la rodilla", view: "front" as const, width: 22, x: 39, y: 36 },
  { height: 12, label: "Región rotuliana", view: "front" as const, width: 16, x: 42, y: 38 },
  { height: 10, label: "Tendón rotuliano", view: "front" as const, width: 14, x: 43, y: 50 },
  { height: 12, label: "Tibia proximal", view: "front" as const, width: 22, x: 39, y: 58 },
  { height: 18, label: "Cara medial", view: "front" as const, width: 14, x: 28, y: 38 },
  { height: 18, label: "Cara lateral", view: "front" as const, width: 14, x: 58, y: 38 },
  { height: 8, label: "Línea articular medial", view: "front" as const, width: 14, x: 30, y: 45 },
  { height: 8, label: "Línea articular lateral", view: "front" as const, width: 14, x: 57, y: 45 },
  { height: 18, label: "Cara posterior", view: "posterior" as const, width: 24, x: 38, y: 37 },
  { height: 12, label: "Hueco poplíteo", view: "posterior" as const, width: 20, x: 40, y: 40 }
];

const emptyKneeAssessment = (): KneeAssessment => ({
  id: `knee-${Date.now()}`,
  date: new Date().toISOString().slice(0, 10),
  rom: { extensionLeft: null, extensionRight: null, flexionLeft: null, flexionRight: null },
  strength: { left: null, right: null },
  control: {},
  performance: { left: null, right: null }
});

function numberOrNull(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

function statusTone(status: KneeDomainStatus) {
  if (status === "priority") return "border-orange-200 bg-orange-50 text-orange-800";
  if (status === "finding") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "adequate") return "border-moss/20 bg-mint text-moss";
  return "border-line bg-panel text-ink/50";
}

function statusDot(status: KneeDomainStatus) {
  if (status === "priority") return "bg-orange-500";
  if (status === "finding") return "bg-amber-500";
  if (status === "adequate") return "bg-moss";
  return "bg-ink/25";
}

function VisualScale({ disabled, label, onChange, options, value }: { disabled: boolean; label: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; value?: string }) {
  return (
    <div className="rounded-md border border-line bg-panel/25 p-3">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {options.map((option) => <button className={`rounded-md border px-2 py-2 text-left text-xs font-semibold transition ${value === option.value ? "border-moss/30 bg-mint text-moss" : "border-line bg-white text-ink/55"}`} disabled={disabled} key={option.value} onClick={() => onChange(option.value)} type="button">{option.label}</button>)}
      </div>
    </div>
  );
}

function Pair({ disabled, label, left, onChange, right, unit }: { disabled: boolean; label: string; left: number | null; onChange: (side: "left" | "right", value: number | null) => void; right: number | null; unit?: string }) {
  const difference = calculateKneeDifference(right, left);
  return (
    <div className="rounded-md border border-line bg-panel/35 p-3">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-ink/55">Derecha<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-panel" disabled={disabled} onChange={(event) => onChange("right", numberOrNull(event.target.value))} type="number" value={right ?? ""} /></label>
        <label className="text-xs font-semibold text-ink/55">Izquierda<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm disabled:bg-panel" disabled={disabled} onChange={(event) => onChange("left", numberOrNull(event.target.value))} type="number" value={left ?? ""} /></label>
      </div>
      <p className="mt-2 text-xs text-ink/50">Diferencia: {difference.absolute ?? "—"}{difference.absolute !== null && unit ? ` ${unit}` : ""} · Asimetría: {difference.asymmetryPct === null ? "—" : `${difference.asymmetryPct}%`}</p>
    </div>
  );
}

function YesNo({ children, disabled, onChange, value }: { children: ReactNode; disabled: boolean; onChange: (value: boolean | undefined) => void; value?: boolean }) {
  return <label className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_220px]"><span>{children}</span><select className="h-10 rounded-md border border-line bg-white px-3 disabled:bg-panel" disabled={disabled} onChange={(event) => onChange(event.target.value ? event.target.value === "yes" : undefined)} value={value === undefined ? "" : value ? "yes" : "no"}><option value="">Sin responder</option><option value="yes">Sí</option><option value="no">No</option></select></label>;
}

export function CoachKneeAssessment({ assessment, clientName, history, onClose, onSave, readOnly = false }: { assessment?: KneeAssessment; clientName: string; history: KneeAssessment[]; onClose: () => void; onSave?: (assessment: KneeAssessment) => void; readOnly?: boolean }) {
  const [draft, setDraft] = useState(() => assessment ?? emptyKneeAssessment());
  const [domain, setDomain] = useState<KneeDomain | null>(null);
  const [showSafety, setShowSafety] = useState(Boolean(assessment?.safetyFlag || assessment?.safetyNote));
  const [showAdvancedRom, setShowAdvancedRom] = useState(Boolean(assessment?.rom.rotationInternalRight != null || assessment?.rom.rotationExternalRight != null));
  const [showAdvancedStrength, setShowAdvancedStrength] = useState(Boolean(assessment?.strength.flexorMethod));
  const [showAdvancedPerformance, setShowAdvancedPerformance] = useState(Boolean(assessment?.performance.advancedTest));
  const statuses = useMemo(() => getKneeDomainStatuses(draft), [draft]);
  const sortedDomains = [...domains].sort((left, right) => statusOrder[statuses[left]] - statusOrder[statuses[right]]);
  const previous = history.find((item) => item.id !== draft.id);
  const selectedPainLocations = draft.painLocations ?? (draft.painLocation ? [draft.painLocation] : []);
  const hasMeasuredRom = [draft.rom.extensionRight, draft.rom.extensionLeft, draft.rom.flexionRight, draft.rom.flexionLeft].every((value) => value !== null);
  const hasVisualRom = Boolean(draft.rom.visualExtension?.right || draft.rom.visualExtension?.left || draft.rom.visualFlexion?.right || draft.rom.visualFlexion?.left || draft.rom.visualSymmetry);
  const romMethod = draft.rom.romMethod ?? (hasMeasuredRom ? "measured" : hasVisualRom ? "visual" : "");
  const update = <K extends keyof KneeAssessment>(key: K, value: KneeAssessment[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updatePainLocations = (values: string[]) => setDraft((current) => ({ ...current, painLocation: undefined, painLocations: values }));

  return (
    <div aria-modal="true" className="assessment-modal-overlay" role="dialog">
      <section className="assessment-modal-panel max-h-[92vh] max-w-3xl overflow-y-auto">
        <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
          <div><p className="text-xs font-semibold uppercase text-moss">Valoración funcional breve</p><h2 className="text-xl font-semibold text-ink">Rodilla v1 · {clientName}</h2><p className="mt-1 text-sm text-ink/55">{readOnly ? `Valoración del ${draft.date}` : "Resumen breve con detalle progresivo por dominios."}</p></div>
          <button aria-label="Cerrar valoración de rodilla" className="grid size-9 place-items-center rounded-md border border-line bg-white" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className="assessment-modal-body grid gap-4 px-5 py-5">
          {domain === null ? (
            <>
              <section className="grid gap-3 rounded-md border border-line bg-white p-3">
                <div><p className="text-sm font-semibold text-ink">Localización del dolor / molestia</p><p className="mt-1 text-xs text-ink/50">Puedes seleccionar más de una zona.</p></div>
                <div className="rounded-md border border-line bg-panel/25 p-2.5">
                  {selectedPainLocations.length ? <div className="flex flex-wrap gap-1.5">{selectedPainLocations.map((location) => <span className="rounded-full border border-moss/20 bg-mint px-2 py-1 text-[11px] font-semibold text-moss" key={location}>{location}</span>)}</div> : <p className="text-xs text-ink/45">Sin zonas seleccionadas</p>}
                </div>
                {!readOnly ? <details className="rounded-md border border-line bg-white"><summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink/60">Elegir zonas</summary><div className="flex flex-wrap gap-1.5 border-t border-line p-2.5">{painLocations.map((location) => { const selected = selectedPainLocations.includes(location); return <button className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition ${selected ? "border-moss/30 bg-mint text-moss" : "border-line bg-white text-ink/55"}`} key={location} onClick={() => updatePainLocations(selected ? selectedPainLocations.filter((item) => item !== location) : [...selectedPainLocations, location])} type="button">{location}</button>; })}</div></details> : null}
                {selectedPainLocations.includes("Otra") ? <label className="text-sm font-semibold text-ink">¿Dónde la notas?<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" disabled={readOnly} onChange={(event) => update("customPainLocation", event.target.value)} value={draft.customPainLocation ?? ""} /></label> : null}
                <FunctionalPainMap disabled={readOnly} frontImageSrc="/body-maps/knee-front.png" imageAlt="Mapa orientativo de rodilla" onValuesChange={updatePainLocations} points={kneeMapPoints} posteriorImageSrc="/body-maps/knee-posterior.png" values={selectedPainLocations} />
              </section>

              <section className="rounded-md border border-line bg-panel/25 p-3">
                <button className="flex w-full items-center justify-between text-left" onClick={() => setShowSafety((current) => !current)} type="button"><span><span className="block text-sm font-semibold text-ink">Filtro inicial de seguridad</span><span className="mt-1 block text-xs text-ink/50">¿Hay algún motivo para detener o ampliar la valoración?</span></span><span className="text-xs font-semibold text-ink/50">{draft.safetyFlag === undefined ? "Sin responder" : draft.safetyFlag ? "Sí" : "No"}</span></button>
                {showSafety ? <div className="mt-3 grid gap-3 border-t border-line pt-3"><p className="text-xs text-ink/50">Apoyo claramente limitado, inflamación marcada, síntomas en reposo llamativos u otro motivo que haga prudente ampliar la valoración.</p><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("safetyFlag", event.target.value === "" ? undefined : event.target.value === "yes")} value={draft.safetyFlag === undefined ? "" : draft.safetyFlag ? "yes" : "no"}><option value="">Sin responder</option><option value="no">No</option><option value="yes">Sí</option></select>{draft.safetyFlag ? <><p className="rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">Considera valoración adicional / derivación si procede</p><textarea className="min-h-16 rounded-md border border-line bg-white p-3 text-sm" disabled={readOnly} onChange={(event) => update("safetyNote", event.target.value)} placeholder="Observación de seguridad" value={draft.safetyNote ?? ""} /></> : null}</div> : null}
              </section>

              <section className="grid gap-3">
                <div><h3 className="text-lg font-semibold text-ink">Resumen Rodilla</h3><p className="mt-1 text-sm text-ink/55">Simple por fuera; abre un dominio para consultar el detalle.</p></div>
                {sortedDomains.map((item) => <button className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border border-line bg-white p-3 text-left hover:bg-panel/40" key={item} onClick={() => setDomain(item)} type="button"><span><span className="font-semibold text-ink">{kneeDomainLabels[item]}</span><span className="mt-1 block text-xs text-ink/50">{statuses[item] === "incomplete" ? "Abre el dominio para registrar datos." : statuses[item] === "adequate" ? "Datos completos sin aspectos relevantes a vigilar." : statuses[item] === "finding" ? "Hay aspectos útiles para revisar." : "Conviene revisar antes de progresar."}</span></span><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(statuses[item])}`}><span className={`size-2 rounded-full ${statusDot(statuses[item])}`} />{kneeStatusLabels[statuses[item]]}</span><ChevronRight className="text-ink/35" size={17} /></button>)}
                {sortedDomains.some((item) => ["priority", "finding"].includes(statuses[item])) ? <div className="rounded-md border border-line bg-panel/25 p-3"><p className="text-xs font-semibold uppercase text-ink/45">Dominios a revisar</p><p className="mt-2 text-sm text-ink/65">{sortedDomains.filter((item) => ["priority", "finding"].includes(statuses[item])).map((item) => kneeDomainLabels[item]).join(" · ")}</p></div> : null}
                <p className="rounded-md border border-line bg-panel/35 p-3 text-xs text-ink/55">{kneeAssessmentConfig.note}</p>
              </section>
              <label className="text-sm font-semibold text-ink">Nota del entrenador<textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white p-3 font-normal" disabled={readOnly} onChange={(event) => update("notes", event.target.value)} value={draft.notes ?? ""} /></label>
              <div className="flex justify-end gap-2"><button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={onClose} type="button">Cerrar</button>{!readOnly && onSave ? <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => { onSave(draft); onClose(); }} type="button">Guardar valoración</button> : null}</div>
            </>
          ) : (
            <section className="grid gap-4">
              <div className="flex items-center justify-between"><button className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65" onClick={() => setDomain(null)} type="button"><ArrowLeft size={16} />Volver al resumen</button><span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(statuses[domain])}`}><span className={`size-2 rounded-full ${statusDot(statuses[domain])}`} />{kneeStatusLabels[statuses[domain]]}</span></div>

              {domain === "tolerance" ? <div className="grid gap-3"><h3 className="font-semibold text-ink">Tolerancia · Tarea problemática</h3><label className="text-sm font-semibold">Tarea<select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" disabled={readOnly} onChange={(event) => update("task", event.target.value)} value={draft.task ?? ""}><option value="">Sin responder</option>{tasks.map((task) => <option key={task}>{task}</option>)}</select></label>{draft.task === "Otra" ? <input className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("customTask", event.target.value)} placeholder="¿Qué tarea es?" value={draft.customTask ?? ""} /> : null}<label className="text-sm font-semibold">Estado funcional<select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" disabled={readOnly} onChange={(event) => update("taskStatus", (event.target.value || undefined) as KneeAssessment["taskStatus"])} value={draft.taskStatus ?? ""}><option value="">Sin responder</option><option value="normal">Puede realizarla normalmente</option><option value="discomfort">Puede realizarla con molestias</option><option value="avoids">La evita / no puede realizarla</option></select></label>{draft.taskStatus === "discomfort" || draft.taskStatus === "avoids" ? <><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("regression", event.target.value)} value={draft.regression ?? ""}><option value="">Selecciona una modificación</option>{["Reducir carga", "Reducir ROM", "Reducir velocidad", "Cambiar soporte", "Cambiar variante", "Reducir impacto"].map((item) => <option key={item}>{item}</option>)}</select><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("regressionResponse", (event.target.value || undefined) as KneeAssessment["regressionResponse"])} value={draft.regressionResponse ?? ""}><option value="">Respuesta tras modificar</option><option value="better">Mejor</option><option value="same">Igual</option><option value="worse">Peor</option></select></> : null}</div> : null}

              {domain === "rom" ? (
                <div className="grid gap-3">
                  <h3 className="font-semibold">ROM</h3>
                  <label className="text-sm font-semibold">
                    Método de registro
                    <select
                      className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal"
                      disabled={readOnly}
                      onChange={(event) => update("rom", {
                        ...draft.rom,
                        romMethod: (event.target.value || undefined) as KneeAssessment["rom"]["romMethod"]
                      })}
                      value={romMethod}
                    >
                      <option value="">Selecciona un método</option>
                      <option value="measured">Medición en grados</option>
                      <option value="visual">Estimación visual aproximada</option>
                    </select>
                  </label>

                  {romMethod === "measured" ? (
                    <>
                      <Pair disabled={readOnly} label="Extensión (grados)" left={draft.rom.extensionLeft} right={draft.rom.extensionRight} unit="°" onChange={(side, value) => update("rom", { ...draft.rom, [`extension${side === "left" ? "Left" : "Right"}`]: value })} />
                      <Pair disabled={readOnly} label="Flexión (grados)" left={draft.rom.flexionLeft} right={draft.rom.flexionRight} unit="°" onChange={(side, value) => update("rom", { ...draft.rom, [`flexion${side === "left" ? "Left" : "Right"}`]: value })} />
                      {showAdvancedRom ? (
                        <div className="grid gap-3 rounded-md border border-line bg-panel/25 p-3">
                          <Pair disabled={readOnly} label="Rotación tibial interna" left={draft.rom.rotationInternalLeft ?? null} right={draft.rom.rotationInternalRight ?? null} onChange={(side, value) => update("rom", { ...draft.rom, [`rotationInternal${side === "left" ? "Left" : "Right"}`]: value })} />
                          <Pair disabled={readOnly} label="Rotación tibial externa" left={draft.rom.rotationExternalLeft ?? null} right={draft.rom.rotationExternalRight ?? null} onChange={(side, value) => update("rom", { ...draft.rom, [`rotationExternal${side === "left" ? "Left" : "Right"}`]: value })} />
                        </div>
                      ) : !readOnly ? (
                        <button className="w-fit rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold" onClick={() => setShowAdvancedRom(true)} type="button">+ Profundizar ROM</button>
                      ) : null}
                    </>
                  ) : null}

                  {romMethod === "visual" ? (
                    <div className="grid gap-3 rounded-md border border-line bg-panel/25 p-3">
                      <div><h4 className="text-sm font-semibold text-ink">ROM visual aproximado</h4><p className="mt-1 text-xs text-ink/55">Estimación visual orientativa. Úsala para registrar limitaciones evidentes, no para comparar diferencias pequeñas entre lados.</p></div>
                      <VisualScale disabled={readOnly} label="Extensión derecha" onChange={(value) => update("rom", { ...draft.rom, visualExtension: { ...draft.rom.visualExtension, right: value as NonNullable<KneeAssessment["rom"]["visualExtension"]>["right"] } })} options={visualExtensionOptions} value={draft.rom.visualExtension?.right} />
                      <VisualScale disabled={readOnly} label="Extensión izquierda" onChange={(value) => update("rom", { ...draft.rom, visualExtension: { ...draft.rom.visualExtension, left: value as NonNullable<KneeAssessment["rom"]["visualExtension"]>["left"] } })} options={visualExtensionOptions} value={draft.rom.visualExtension?.left} />
                      <VisualScale disabled={readOnly} label="Flexión derecha" onChange={(value) => update("rom", { ...draft.rom, visualFlexion: { ...draft.rom.visualFlexion, right: value as NonNullable<KneeAssessment["rom"]["visualFlexion"]>["right"] } })} options={visualFlexionOptions} value={draft.rom.visualFlexion?.right} />
                      <VisualScale disabled={readOnly} label="Flexión izquierda" onChange={(value) => update("rom", { ...draft.rom, visualFlexion: { ...draft.rom.visualFlexion, left: value as NonNullable<KneeAssessment["rom"]["visualFlexion"]>["left"] } })} options={visualFlexionOptions} value={draft.rom.visualFlexion?.left} />
                      <VisualScale disabled={readOnly} label="Simetría observada" onChange={(value) => update("rom", { ...draft.rom, visualSymmetry: value as KneeAssessment["rom"]["visualSymmetry"] })} options={visualSymmetryOptions} value={draft.rom.visualSymmetry} />
                      <label className="text-sm font-semibold">
                        Nota sobre calidad de movimiento
                        <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white p-3 font-normal" disabled={readOnly} onChange={(event) => update("rom", { ...draft.rom, movementQualityNote: event.target.value })} value={draft.rom.movementQualityNote ?? ""} />
                      </label>
                    </div>
                  ) : null}

                  {romMethod ? <p className="text-xs text-ink/50">Puedes conservar ambos registros; el estado usará el método seleccionado.</p> : null}

                  {romMethod ? (
                    <label className="text-sm font-semibold">
                      ¿Lo observado afecta a la tarea problemática?
                      <select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" disabled={readOnly} onChange={(event) => update("rom", { ...draft.rom, affectsTask: (event.target.value || undefined) as KneeAssessment["rom"]["affectsTask"] })} value={draft.rom.affectsTask ?? ""}>
                        <option value="">Sin responder</option>
                        <option value="yes">Sí</option>
                        <option value="no">No</option>
                        <option value="inconclusive">No concluyente</option>
                      </select>
                    </label>
                  ) : null}
                  <p className="text-xs text-ink/50">{previous ? `Histórico disponible: ${previous.date}.` : "Primera medición; el histórico aparecerá en el retest."}</p>
                </div>
              ) : null}

              {domain === "strength" ? <div className="grid gap-3"><h3 className="font-semibold">Fuerza · extensora / cuádriceps</h3><label className="text-sm font-semibold">Método<select className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-normal" disabled={readOnly} onChange={(event) => update("strength", { ...draft.strength, method: (event.target.value || undefined) as KneeAssessment["strength"]["method"] })} value={draft.strength.method ?? ""}><option value="">Sin responder</option><option value="dynamometer">Dinamometría de extensión</option><option value="machine">Knee extension unilateral en máquina</option></select></label><input className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("strength", { ...draft.strength, unit: event.target.value })} placeholder="Unidad (kg, N...)" value={draft.strength.unit ?? ""} /><Pair disabled={readOnly} label="Resultado principal" left={draft.strength.left} right={draft.strength.right} unit={draft.strength.unit} onChange={(side, value) => update("strength", { ...draft.strength, [side]: value })} /><YesNo disabled={readOnly} onChange={(value) => update("strength", { ...draft.strength, limitsTask: value })} value={draft.strength.limitsTask}>¿Limita claramente la tarea problemática?</YesNo>{showAdvancedStrength ? <div className="grid gap-3 rounded-md border border-line bg-panel/25 p-3"><p className="text-sm font-semibold">Fuerza flexora · opcional</p><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("strength", { ...draft.strength, flexorMethod: (event.target.value || undefined) as KneeAssessment["strength"]["flexorMethod"] })} value={draft.strength.flexorMethod ?? ""}><option value="">Método</option><option value="dynamometer">Dinamometría</option><option value="machine">Máquina</option></select><input className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("strength", { ...draft.strength, flexorUnit: event.target.value })} placeholder="Unidad" value={draft.strength.flexorUnit ?? ""} /><Pair disabled={readOnly} label="Resultado flexor" left={draft.strength.flexorLeft ?? null} right={draft.strength.flexorRight ?? null} unit={draft.strength.flexorUnit} onChange={(side, value) => update("strength", { ...draft.strength, [`flexor${side === "left" ? "Left" : "Right"}`]: value })} /></div> : !readOnly ? <button className="w-fit rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold" onClick={() => setShowAdvancedStrength(true)} type="button">+ Fuerza flexora</button> : null}<p className="text-xs text-ink/50">El histórico se compara por método; no se mezclan métodos como equivalentes.</p></div> : null}

              {domain === "control" ? <div className="grid gap-3"><h3 className="font-semibold">Control / Estabilidad · Lateral Step-Down</h3><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, balance: value })} value={draft.control.balance}>¿Mantiene equilibrio?</YesNo><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, descentControl: value })} value={draft.control.descentControl}>¿Controla el descenso?</YesNo><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, stableTrajectory: value })} value={draft.control.stableTrajectory}>¿La trayectoria de la rodilla es estable / repetible?</YesNo><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, trunkPelvisControl: value })} value={draft.control.trunkPelvisControl}>¿Controla razonablemente pelvis y tronco?</YesNo><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, symptomsLimit: value })} value={draft.control.symptomsLimit}>¿Los síntomas limitan el test?</YesNo><YesNo disabled={readOnly} onChange={(value) => update("control", { ...draft.control, lessStable: value })} value={draft.control.lessStable}>¿Sientes esta rodilla menos estable?</YesNo><label className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_220px]"><span>¿Alguna vez sientes que “se te va”?</span><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("control", { ...draft.control, givesWay: (event.target.value || undefined) as KneeAssessment["control"]["givesWay"] })} value={draft.control.givesWay ?? ""}><option value="">Sin responder</option><option value="never">Nunca</option><option value="occasionally">Ocasionalmente</option><option value="frequently">Frecuentemente</option></select></label><label className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_220px]"><span>¿Confías al correr, saltar, aterrizar o cambiar de dirección?</span><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("control", { ...draft.control, confidence: (event.target.value || undefined) as KneeAssessment["control"]["confidence"] })} value={draft.control.confidence ?? ""}><option value="">Sin responder</option><option value="yes">Sí</option><option value="partially">Parcialmente</option><option value="no">No</option></select></label>{draft.control.givesWay === "frequently" ? <p className="rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">Conviene ampliar la valoración antes de progresar.</p> : null}<p className="text-xs text-ink/45">Arquitectura preparada para ampliar cuestionarios funcionales en el futuro.</p></div> : null}

              {domain === "performance" ? <div className="grid gap-3"><h3 className="font-semibold">Performance · Single-Leg Hop for Distance</h3><Pair disabled={readOnly} label="Distancia" left={draft.performance.left} right={draft.performance.right} onChange={(side, value) => update("performance", { ...draft.performance, [side]: value })} />{showAdvancedPerformance ? <div className="grid gap-3 rounded-md border border-line bg-panel/25 p-3"><select className="h-10 rounded-md border border-line bg-white px-3" disabled={readOnly} onChange={(event) => update("performance", { ...draft.performance, advancedTest: (event.target.value || undefined) as KneeAssessment["performance"]["advancedTest"] })} value={draft.performance.advancedTest ?? ""}><option value="">Selecciona test avanzado</option><option value="vertical-jump">Single-Leg Vertical Jump</option><option value="drop-jump">Drop Jump</option><option value="side-hop">Side Hop</option></select><Pair disabled={readOnly} label="Resultado avanzado" left={draft.performance.advancedLeft ?? null} right={draft.performance.advancedRight ?? null} onChange={(side, value) => update("performance", { ...draft.performance, [`advanced${side === "left" ? "Left" : "Right"}`]: value })} /></div> : !readOnly ? <button className="w-fit rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold" onClick={() => setShowAdvancedPerformance(true)} type="button">+ Test avanzado</button> : null}<p className="text-xs text-ink/50">{previous ? `Histórico disponible: ${previous.date}.` : "Primera medición; el histórico aparecerá en el retest."}</p></div> : null}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
