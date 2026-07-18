"use client";

import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

export type ResourceType =
  | "Roadmap"
  | "Cuestionario inicial"
  | "Cuestionario de dolor/lesión"
  | "Batería de tests"
  | "Presentación Canva"
  | "PDF"
  | "Documento"
  | "Vídeo"
  | "Web"
  | "Otro";

export type ResourceCategory =
  | "Lesiones"
  | "Valoraciones"
  | "Fuerza"
  | "Resistencia"
  | "Control de carga"
  | "Periodización"
  | "Readiness"
  | "Ejercicios"
  | "Otros";

export type ResourceLink = {
  id: string;
  title: string;
  resourceType: ResourceType;
  category: ResourceCategory;
  athleteProfile?: string;
  injuryArea?: string;
  sportContext?: string;
  description?: string;
  url: string;
  createdAt: string;
};

type ResourceDraft = {
  athleteProfile: string;
  category: ResourceCategory;
  description: string;
  injuryArea: string;
  resourceType: ResourceType;
  sportContext: string;
  title: string;
  url: string;
};

type CoachResourcesViewProps = {
  resources: ResourceLink[];
  setResources: Dispatch<SetStateAction<ResourceLink[]>>;
};

const resourceTypes: ResourceType[] = [
  "Roadmap",
  "Cuestionario inicial",
  "Cuestionario de dolor/lesión",
  "Batería de tests",
  "Presentación Canva",
  "PDF",
  "Documento",
  "Vídeo",
  "Web",
  "Otro"
];

const resourceCategories: ResourceCategory[] = [
  "Lesiones",
  "Valoraciones",
  "Fuerza",
  "Resistencia",
  "Control de carga",
  "Periodización",
  "Readiness",
  "Ejercicios",
  "Otros"
];

const emptyDraft: ResourceDraft = {
  athleteProfile: "",
  category: "Lesiones",
  description: "",
  injuryArea: "",
  resourceType: "Roadmap",
  sportContext: "",
  title: "",
  url: ""
};

function createResourceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `resource-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatResourceDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getShortUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

function normalizeResourceType(value: string): ResourceType {
  if (resourceTypes.includes(value as ResourceType)) return value as ResourceType;
  if (value === "Canva") return "Presentación Canva";
  return "Otro";
}

function normalizeResourceCategory(value: string): ResourceCategory {
  if (resourceCategories.includes(value as ResourceCategory)) return value as ResourceCategory;
  return "Otros";
}

export function CoachResourcesView({ resources, setResources }: CoachResourcesViewProps) {
  const [draft, setDraft] = useState<ResourceDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ResourceCategory>("all");
  const [selectedType, setSelectedType] = useState<"all" | ResourceType>("all");
  const [showForm, setShowForm] = useState(false);

  const filteredResources = useMemo(
    () =>
      resources.filter((resource) => {
        const resourceType = normalizeResourceType(resource.resourceType);
        const category = normalizeResourceCategory(resource.category);
        const typeMatches = selectedType === "all" || resourceType === selectedType;
        const categoryMatches = selectedCategory === "all" || category === selectedCategory;
        return typeMatches && categoryMatches;
      }),
    [resources, selectedCategory, selectedType]
  );

  function updateDraft<K extends keyof ResourceDraft>(field: K, value: ResourceDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function resetForm() {
    setDraft(emptyDraft);
    setError("");
    setShowForm(false);
  }

  function handleSaveResource() {
    const title = draft.title.trim();
    const url = draft.url.trim();

    if (!title) {
      setError("Añade un título para guardar el recurso.");
      return;
    }

    if (!url) {
      setError("Añade una URL para guardar el recurso.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("La URL debe empezar por http:// o https://.");
      return;
    }

    const resource: ResourceLink = {
      athleteProfile: draft.athleteProfile.trim() || undefined,
      category: draft.category,
      createdAt: new Date().toISOString(),
      description: draft.description.trim() || undefined,
      id: createResourceId(),
      injuryArea: draft.injuryArea.trim() || undefined,
      resourceType: draft.resourceType,
      sportContext: draft.sportContext.trim() || undefined,
      title,
      url
    };

    setResources((current) => [resource, ...current]);
    resetForm();
  }

  function handleDeleteResource(resourceId: string) {
    setResources((current) => current.filter((resource) => resource.id !== resourceId));
  }

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Recursos</h2>
            <p className="mt-1 text-sm text-ink/60">
              Organiza tus presentaciones, PDFs y documentos mediante enlaces externos.
            </p>
          </div>
          <button
            className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Añadir recurso
          </button>
        </div>
      </section>

      {showForm ? (
        <section className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-ink">Añadir recurso</h3>
            <p className="text-sm text-ink/55">Guarda solo el enlace externo y los datos útiles para encontrarlo después.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Título
              <input
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="Ej: Roadmap tendinopatía rotuliana"
                value={draft.title}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              URL
              <input
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("url", event.target.value)}
                placeholder="https://www.canva.com/design/..."
                value={draft.url}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Tipo de recurso
              <select
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("resourceType", event.target.value as ResourceType)}
                value={draft.resourceType}
              >
                {resourceTypes.map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Categoría
              <select
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("category", event.target.value as ResourceCategory)}
                value={draft.category}
              >
                {resourceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Perfil del deportista
              <input
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("athleteProfile", event.target.value)}
                placeholder="Ej: corredor popular, fuerza recreativa"
                value={draft.athleteProfile}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Lesión / zona corporal
              <input
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("injuryArea", event.target.value)}
                placeholder="Ej: hombro, rodilla, tendón Aquiles"
                value={draft.injuryArea}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70 md:col-span-2">
              Deporte o contexto
              <input
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("sportContext", event.target.value)}
                placeholder="Ej: fútbol, running, readaptación postlesión"
                value={draft.sportContext}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70 md:col-span-2">
              Descripción / notas
              <textarea
                className="min-h-20 rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => updateDraft("description", event.target.value)}
                placeholder="Notas breves sobre cuándo usar este recurso"
                value={draft.description}
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSaveResource} type="button">
              Guardar recurso
            </button>
            <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={resetForm} type="button">
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Biblioteca de recursos</h3>
            <p className="mt-1 text-sm text-ink/55">Roadmaps, cuestionarios, baterías de tests y enlaces externos organizados.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[30rem]">
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Tipo
              <select
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => setSelectedType(event.target.value as "all" | ResourceType)}
                value={selectedType}
              >
                <option value="all">Todos los tipos</option>
                {resourceTypes.map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink/70">
              Categoría
              <select
                className="rounded-md border border-line px-3 py-2 text-ink outline-none focus:border-moss"
                onChange={(event) => setSelectedCategory(event.target.value as "all" | ResourceCategory)}
                value={selectedCategory}
              >
                <option value="all">Todas las categorías</option>
                {resourceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-5">
            <p className="font-semibold text-ink">No hay recursos todavía.</p>
            <p className="mt-2 text-sm text-ink/60">
              Añade enlaces a tus roadmaps, cuestionarios, baterías de tests o presentaciones para tenerlos organizados sin ocupar espacio en la app.
            </p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
            No hay recursos que coincidan con estos filtros.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => {
              const resourceType = normalizeResourceType(resource.resourceType);
              const category = normalizeResourceCategory(resource.category);
              return (
                <article className="flex min-h-full flex-col rounded-md border border-line bg-panel/35 p-4" key={resource.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">{resourceType}</span>
                    <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">{category}</span>
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-ink">{resource.title}</h4>
                  <div className="mt-3 grid gap-2 text-xs font-semibold text-ink/55">
                    {resource.athleteProfile ? <p>Perfil: {resource.athleteProfile}</p> : null}
                    {resource.injuryArea ? <p>Lesión / zona: {resource.injuryArea}</p> : null}
                    {resource.sportContext ? <p>Contexto: {resource.sportContext}</p> : null}
                  </div>
                  {resource.description ? <p className="mt-3 text-sm text-ink/60">{resource.description}</p> : null}
                  <p className="mt-3 truncate text-xs font-semibold text-ink/45">{getShortUrl(resource.url)}</p>
                  <p className="mt-2 text-xs text-ink/45">Creado: {formatResourceDate(resource.createdAt)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <a
                      className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                      href={resource.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir
                    </a>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                      onClick={() => handleDeleteResource(resource.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
