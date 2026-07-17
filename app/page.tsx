"use client";

import {
  ClipboardCheck,
  Lock,
  Plus,
  Search,
  Send,
  Settings2,
  Trash2,
  Unlock,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import {
  acwrRanges,
  calculateACWR,
  calculateHooperIndex,
  calculateMonotony,
  calculateSessionLoad,
  calculateStrain,
  calculateWeeklyLoad,
  getMetricStatus,
  monotonyRanges,
  strainRanges
} from "@/lib/client-metrics";
import {
  getPlanningMethodDescription,
  getPlanningMethodLabel,
  planningConfig,
  type PlanningMethod,
  type WeeklyDistribution
} from "@/lib/planning-config";
import {
  bodyRegionLabels,
  bodyRegions,
  exerciseLibrary,
  getExerciseById,
  getExercisePatternsByBodyRegion,
  getExercisesByPattern,
  searchExercises,
  type BodyRegion,
  type ExerciseDefinition,
  type ExercisePattern
} from "@/lib/exercises";
import {
  calculateExternalLoadByPattern,
  calculateSessionExternalLoad,
  calculateSessionMuscleSets,
  calculateWeeklyExternalLoad,
  calculateWeeklyExternalLoadByPattern,
  calculateWeeklyMuscleSets,
  type TrainingSessionInput
} from "@/lib/session-load";
import { supabase } from "@/lib/supabase";
import {
  assessmentCategories,
  assessmentGoals,
  athleteAdherence,
  coachClients,
  coachCompletionMessage,
  calendarSessions,
  decisionDashboard,
  decisionMetrics,
  fatigueLegend,
  hooperQuestions,
  plannedSession,
  posturalAssessmentFields,
  pastSessions,
  messageThreads,
  sessionQuantifiers,
  sports,
  weeklyLoadSeries,
  type AssessmentGoal,
  type GoalType,
  type SheetId,
  type UserRole
} from "@/lib/data";

type CalendarViewMode = "Dia" | "Semana" | "Mes";
type TrainingAvailability = {
  consecutiveDays: boolean;
  daysPerWeek: number;
};
type TrainerClientPanel = "list" | "dashboard" | "details";

export default function ClientsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [goalType, setGoalType] = useState<GoalType>("health");
  const [activeSheet, setActiveSheet] = useState<SheetId>("clients");
  const [trainerClientPanel, setTrainerClientPanel] = useState<TrainerClientPanel>("list");
  const [clients, setClients] = useState<CoachClient[]>(coachClients);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [scopedClientId, setScopedClientId] = useState("");
  const [hooperDone, setHooperDone] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [trainingAvailability, setTrainingAvailability] = useState<TrainingAvailability>({
    consecutiveDays: true,
    daysPerWeek: 2
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null;
      if (email) {
        setRole("coach");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      if (email) {
        setRole("coach");
      } else {
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("rafa-methods-sidebar-collapsed");
    if (stored) {
      setIsSidebarCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("rafa-methods-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  if (!role) {
    return <LoginCover onLogin={setRole} />;
  }

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ?? null;
  const scopedClient =
    clients.find((client) => client.id === scopedClientId) ?? null;

  function handleSheetChange(sheet: SheetId) {
    setActiveSheet(sheet);
    setScopedClientId("");
    if (sheet === "clients") {
      setTrainerClientPanel("list");
    }
  }

  function openClientPanel(clientId: string, panel: Exclude<TrainerClientPanel, "list">) {
    setSelectedClientId(clientId);
    setTrainerClientPanel(panel);
    setActiveSheet("clients");
  }

  function openClientSheet(clientId: string, sheet: SheetId) {
    setScopedClientId(clientId);
    setActiveSheet(sheet);
  }

  return (
    <main className="min-h-screen lg:flex">
      <Sidebar
        activeSheet={activeSheet}
        collapsed={isSidebarCollapsed}
        onSheetChange={handleSheetChange}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        role={role}
      />
      <div className="min-w-0 flex-1">
        <MobileNav activeSheet={activeSheet} onSheetChange={handleSheetChange} role={role} />
        <section
          className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="flex min-w-0 flex-col gap-4 border-b border-line pb-4 sm:pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-ink sm:text-2xl">
                {activeSheet === "clients"
                  ? role === "coach" && trainerClientPanel === "dashboard"
                    ? `Dashboard - ${selectedClient?.name ?? "cliente"}`
                    : role === "coach" && trainerClientPanel === "details"
                      ? `Ficha inicial - ${selectedClient?.name ?? "cliente"}`
                      : "Clientes"
                  : activeSheet === "training"
                    ? role === "coach" ? "Sesiones" : "Mi entrenamiento"
                  : activeSheet === "assessments"
                    ? "Valoraciones"
                  : activeSheet === "calendar"
                    ? "Calendario"
                  : activeSheet === "fatigue"
                    ? "Fatiga"
                  : activeSheet === "weeklyLoad"
                    ? role === "coach" ? "Metricas" : "Carga semanal"
                  : activeSheet === "planning"
                    ? "Planificación"
                  : activeSheet === "progressions"
                    ? "Ejercicios"
                  : activeSheet === "routines"
                    ? "Rutinas"
                  : activeSheet === "messages"
                    ? "Mensajes"
                    : "Dashboard"}
              </h1>
            </div>

          </div>

          {role === "coach" && ((activeSheet === "clients" && trainerClientPanel !== "list" && selectedClient) || scopedClient) ? (
            <ActiveClientBar
              activeSheet={activeSheet}
              client={scopedClient ?? selectedClient!}
              onOpenClientSheet={openClientSheet}
              onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
              onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
              trainerClientPanel={trainerClientPanel}
            />
          ) : null}

          {activeSheet === "clients" ? (
            role === "coach" ? (
              <CoachClientsView
                client={selectedClient}
                clients={clients}
                onBack={() => setTrainerClientPanel("list")}
                onGoToSheet={handleSheetChange}
                onOpenClientSheet={openClientSheet}
                onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
                onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
                panel={trainerClientPanel}
                setClients={setClients}
              />
            ) : (
              <AthleteClientForm
                goalType={goalType}
                setGoalType={setGoalType}
                trainingAvailability={trainingAvailability}
                setTrainingAvailability={setTrainingAvailability}
              />
            )
          ) : activeSheet === "training" ? (
            role === "coach" ? <CoachTrainingPlanner client={scopedClient} clients={clients} /> : (
              <AthleteTrainingView
                hooperDone={hooperDone}
                onCompleteHooper={() => setHooperDone(true)}
              />
            )
          ) : activeSheet === "assessments" ? (
            <AssessmentsView client={role === "coach" ? scopedClient : null} />
          ) : activeSheet === "calendar" ? (
            <CalendarView client={role === "coach" ? null : selectedClient} clients={clients} />
          ) : activeSheet === "fatigue" ? (
            <FatigueMapView />
          ) : activeSheet === "weeklyLoad" ? (
            <WeeklyLoadView client={role === "coach" ? scopedClient : null} />
          ) : activeSheet === "planning" ? (
            role === "coach" ? <PlanningView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "progressions" ? (
            role === "coach" ? <ExerciseProgressionsView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "routines" ? (
            role === "coach" ? <RoutinesView clients={clients} trainingAvailability={trainingAvailability} /> : <DecisionDashboardView />
          ) : activeSheet === "messages" ? (
            <MessagesView client={scopedClient} clients={clients} />
          ) : (
            <DecisionDashboardView />
          )}
        </section>
      </div>
    </main>
  );
}

function LoginCover({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  async function handleGoogleLogin() {
    if (!supabase) {
      setAuthMessage("Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined
      }
    });

    if (error) {
      setAuthMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(64,86,214,0.18),transparent_28rem),linear-gradient(135deg,#f6faff_0%,#d9f0ff_52%,#d8fff0_100%)]">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div className="flex min-h-[42vh] flex-col items-center justify-center rounded-md border border-white/70 bg-white/45 p-6 shadow-soft backdrop-blur sm:p-10 lg:min-h-[58vh]">
          <Image
            alt="Rafa Methods"
            className="h-auto w-full max-w-lg"
            height={333}
            src="/rafa-methods-logo-clean.png"
            priority
            width={1161}
          />
          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-[0.28em] text-ink/70 sm:text-base">
            Train with intelligence
          </p>
        </div>

        <section className="rounded-md border border-white/70 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold text-ink">Acceder</h2>

          <button
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-ink text-sm font-semibold text-white transition hover:bg-ink/90"
            onClick={handleGoogleLogin}
            type="button"
          >
            <span className="grid size-6 place-items-center rounded-full bg-white text-xs font-bold text-ink">G</span>
            Continuar con Google
          </button>
          {authMessage && (
            <p className="mt-3 rounded-md bg-wheat px-3 py-2 text-sm text-ink/70">
              {authMessage}
            </p>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className="rounded-md bg-gradient-to-br from-steel to-moss px-4 py-4 text-left text-white transition hover:opacity-95"
              onClick={() => onLogin("coach")}
              type="button"
            >
              <span className="block text-sm font-semibold">Entrar como entrenador</span>
              <span className="mt-2 block text-xs text-white/60">Panel, clientes, calendario y mensajes.</span>
            </button>
            <button
              className="rounded-md border border-line bg-panel/45 px-4 py-4 text-left text-ink transition hover:bg-panel"
              onClick={() => onLogin("athlete")}
              type="button"
            >
              <span className="block text-sm font-semibold">Entrar como deportista</span>
              <span className="mt-2 block text-xs text-ink/55">Mi entrenamiento, Hooper y registro.</span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

type BaseCoachClient = (typeof coachClients)[number];
type CoachClient = BaseCoachClient & {
  availableEquipment?: string;
  planning: BaseCoachClient["planning"] & {
    blocks?: EditablePlanningBlock[];
    eventDate?: string;
    eventName?: string;
    eventNotes?: string;
    method?: PlanningMethod;
  };
};
type ClientSessionRecord = CoachClient["sessionRecords"][number];
type ClientAssessment = CoachClient["assessments"][number];
type DashboardDetailSection = "status" | "load" | "acwr" | "monotony" | "strain" | "hooper" | "fatigue-map";

function getMonotonyStatus(value: number) {
  return getMetricStatus(value, monotonyRanges);
}

function getAcwrStatus(value: number) {
  return getMetricStatus(value, acwrRanges);
}

function getStrainStatus(value: number) {
  return getMetricStatus(value, strainRanges);
}

function getHooperStatus(value: number) {
  if (value >= 12) return "Alto";
  if (value >= 9) return "Vigilar";
  return "Controlado";
}

function getLoadTrend(currentLoad: number, chronicLoad: number) {
  const difference = currentLoad - chronicLoad;
  const sign = difference >= 0 ? "+" : "";
  return `${sign}${difference.toFixed(0)} UA vs referencia`;
}

function getClientLoadData(client: CoachClient) {
  const weeklyLoad = calculateWeeklyLoad(client.sessionRecords);
  const monotony = calculateMonotony(client.dailyLoads);
  const strain = calculateStrain(weeklyLoad, monotony);
  const acwr = calculateACWR(weeklyLoad, client.chronicLoad);
  const hooper = calculateHooperIndex(client.hooper);

  return {
    acwr,
    acwrStatus: getAcwrStatus(acwr),
    hooper,
    hooperStatus: getHooperStatus(hooper),
    monotony,
    monotonyStatus: getMonotonyStatus(monotony),
    strain,
    strainStatus: getStrainStatus(strain),
    weeklyLoad,
    weeklyTrend: getLoadTrend(weeklyLoad, client.chronicLoad)
  };
}

function clientStatusClass(status: string) {
  switch (status) {
    case "Alto":
    case "Riesgo":
      return "border-red-200 bg-red-50 text-red-800";
    case "Vigilar":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
}

function ClientQuickNav({
  activeSheet,
  client,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  trainerClientPanel
}: {
  activeSheet: SheetId;
  client: CoachClient;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  trainerClientPanel: TrainerClientPanel;
}) {
  const links = [
    {
      active: activeSheet === "clients" && trainerClientPanel === "dashboard",
      label: "Dashboard",
      onClick: () => onOpenDashboard(client.id)
    },
    {
      active: activeSheet === "clients" && trainerClientPanel === "details",
      label: "Detalles",
      onClick: () => onOpenDetails(client.id)
    },
    {
      active: activeSheet === "assessments",
      label: "Valoraciones",
      onClick: () => onOpenClientSheet(client.id, "assessments")
    },
    {
      active: activeSheet === "planning",
      label: "Planificación",
      onClick: () => onOpenClientSheet(client.id, "planning")
    },
    {
      active: activeSheet === "training",
      label: "Sesiones",
      onClick: () => onOpenClientSheet(client.id, "training")
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {links.map((link) => (
        <button
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
            link.active
              ? "bg-ink text-white"
              : "border border-line bg-white text-ink/70 hover:bg-panel"
          }`}
          key={link.label}
          onClick={link.onClick}
          type="button"
        >
          {link.label}
        </button>
      ))}
    </div>
  );
}

function ActiveClientBar({
  activeSheet,
  client,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  trainerClientPanel
}: {
  activeSheet: SheetId;
  client: CoachClient;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  trainerClientPanel: TrainerClientPanel;
}) {
  return (
    <section className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-white px-4 py-3 shadow-soft lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink">{client.name}</span>
        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
          Activo
        </span>
      </div>
      <ClientQuickNav
        activeSheet={activeSheet}
        client={client}
        onOpenClientSheet={onOpenClientSheet}
        onOpenDashboard={onOpenDashboard}
        onOpenDetails={onOpenDetails}
        trainerClientPanel={trainerClientPanel}
      />
    </section>
  );
}

function SelectClientFirst({ onGoClients }: { onGoClients: () => void }) {
  return (
    <section className="mt-6 rounded-md border border-line bg-white p-6 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Selecciona primero un cliente desde Clientes.</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink/55">
        Las paginas del entrenador se filtran por deportista para que calendario, sesiones, planificación, mensajes y valoraciones pertenezcan al cliente activo.
      </p>
      <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onGoClients} type="button">
        Ir a Clientes
      </button>
    </section>
  );
}

function CoachClientsView({
  client,
  clients,
  onBack,
  onGoToSheet,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  panel,
  setClients
}: {
  client: CoachClient | null;
  clients: CoachClient[];
  onBack: () => void;
  onGoToSheet: (sheet: SheetId) => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  panel: TrainerClientPanel;
  setClients: React.Dispatch<React.SetStateAction<CoachClient[]>>;
}) {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientStep, setNewClientStep] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [goalFilter, setGoalFilter] = useState<"all" | "Salud" | "Rendimiento">("all");
  const [newClientDraft, setNewClientDraft] = useState({
    age: 30,
    availability: "",
    availableEquipment: "",
    eventDate: "",
    eventName: "",
    eventNotes: "",
    goalType: "Rendimiento" as CoachClient["goalType"],
    injuries: "",
    initialNotes: "",
    modality: "General",
    name: "",
    objective: "",
    planningBlocks: [] as EditablePlanningBlock[],
    planningMethod: "" as PlanningMethod
  });
  const healthClients = clients.filter((listedClient) => listedClient.goalType === "Salud").length;
  const performanceClients = clients.filter((listedClient) => listedClient.goalType === "Rendimiento").length;
  const healthPercent = clients.length > 0 ? Math.round((healthClients / clients.length) * 100) : 0;
  const performancePercent = clients.length > 0 ? Math.round((performanceClients / clients.length) * 100) : 0;
  const filteredClients = clients.filter((listedClient) => {
    const matchesGoal = goalFilter === "all" || listedClient.goalType === goalFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      [listedClient.name, listedClient.modality, listedClient.status, listedClient.nextEvent]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesGoal && matchesSearch;
  });

  function resetNewClientDraft() {
    setNewClientDraft({
      age: 30,
      availability: "",
      availableEquipment: "",
      eventDate: "",
      eventName: "",
      eventNotes: "",
      goalType: "Rendimiento",
      injuries: "",
      initialNotes: "",
      modality: "General",
      name: "",
      objective: "",
      planningBlocks: [],
      planningMethod: ""
    });
    setNewClientStep(1);
  }

  function addClientMesocycle() {
    const nextIndex = newClientDraft.planningBlocks.length + 1;
    setNewClientDraft((draft) => ({
      ...draft,
      planningBlocks: [
        ...draft.planningBlocks,
        {
          durationWeeks: 4,
          id: `new-client-mesocycle-${Date.now()}`,
          mainMetrics: [],
          name: `Mesociclo ${nextIndex}`,
          notes: "",
          primaryObjective: draft.objective,
          secondaryObjective: "",
          weeklyDistribution: "Lineal"
        }
      ]
    }));
  }

  function updateClientMesocycle(blockId: string, updates: Partial<EditablePlanningBlock>) {
    setNewClientDraft((draft) => ({
      ...draft,
      planningBlocks: draft.planningBlocks.map((block) => block.id === blockId ? { ...block, ...updates } : block)
    }));
  }

  function deleteClientMesocycle(blockId: string) {
    setNewClientDraft((draft) => ({
      ...draft,
      planningBlocks: draft.planningBlocks.filter((block) => block.id !== blockId)
    }));
  }

  function buildClientId(name: string) {
    const baseId = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `cliente-${Date.now()}`;
    if (!clients.some((listedClient) => listedClient.id === baseId)) return baseId;
    return `${baseId}-${Date.now()}`;
  }

  function addClient() {
    const name = newClientDraft.name.trim();
    if (!name) return;

    const id = buildClientId(name);
    const firstBlock = newClientDraft.planningBlocks[0] ?? null;
    const planningBlocks = newClientDraft.planningBlocks.map((block) => ({
      ...block,
      mainMetrics: [...block.mainMetrics]
    }));
    const nextEvent = newClientDraft.eventName.trim()
      ? `${newClientDraft.eventName.trim()}${newClientDraft.eventDate ? ` - ${newClientDraft.eventDate}` : ""}`
      : "Sin evento definido";

    const createdClient: CoachClient = {
      activeBlocks: planningBlocks.length > 0 ? planningBlocks.map((block) => block.name) : ["Sin asignar"],
      age: newClientDraft.age,
      assessments: [],
      availability: newClientDraft.availability.trim() || "Pendiente",
      availableEquipment: newClientDraft.availableEquipment.trim() || "Pendiente",
      chronicLoad: 0,
      coachNotes: newClientDraft.initialNotes.trim() || "Nuevo cliente pendiente de completar ficha inicial.",
      dailyLoads: [0, 0, 0, 0, 0, 0, 0],
      goalType: newClientDraft.goalType,
      history: "Pendiente de completar.",
      hooper: { sleep: 0, fatigue: 0, stress: 0, soreness: 0, mood: 0 },
      id,
      injuries: newClientDraft.injuries.trim() || "Pendiente de completar.",
      lastActivity: "Sin sesiones registradas",
      level: "Pendiente",
      loadMetric: "Sin datos de carga",
      metrics: ["Sin metricas registradas"],
      modality: newClientDraft.modality,
      name,
      nextEvent,
      planning: {
        blocks: planningBlocks,
        currentBlock: firstBlock?.name || "Sin asignar",
        currentWeek: "Pendiente",
        distribution: firstBlock?.weeklyDistribution || "Pendiente",
        eventDate: newClientDraft.eventDate,
        eventName: newClientDraft.eventName,
        eventNotes: newClientDraft.eventNotes,
        method: newClientDraft.planningMethod,
        nextSessions: [],
        primaryGoal: firstBlock?.primaryObjective || newClientDraft.objective || "Pendiente",
        secondaryGoal: firstBlock?.secondaryObjective || "Pendiente"
      },
      readiness: 0,
      recentSessions: [],
      sessionRecords: [],
      sport: newClientDraft.modality,
      status: "Ficha pendiente"
    };

    setClients((currentClients) => [createdClient, ...currentClients]);
    resetNewClientDraft();
    setShowNewClientForm(false);
  }

  if (panel === "dashboard") {
    if (!client) return <SelectClientFirst onGoClients={onBack} />;

    return (
      <ClientDashboardView
        client={client}
        onBack={onBack}
        onOpenClientSheet={onOpenClientSheet}
        onOpenDetails={() => onOpenDetails(client.id)}
      />
    );
  }

  if (panel === "details") {
    if (!client) return <SelectClientFirst onGoClients={onBack} />;

    return (
      <ClientDetailsView
        client={client}
        onBack={() => onOpenDashboard(client.id)}
        onSave={() => onGoToSheet("planning")}
      />
    );
  }

  return (
    <>
      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-3">
            <ClientStatTile label="Clientes registrados" value={clients.length} />
            <ClientStatTile label="Salud" percent={healthPercent} value={healthClients} />
            <ClientStatTile label="Rendimiento" percent={performancePercent} value={performanceClients} />
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-steel to-moss px-4 text-sm font-semibold text-white transition hover:opacity-95"
            onClick={() => setShowNewClientForm((current) => !current)}
            type="button"
          >
            <Plus size={18} />
            Anadir cliente
          </button>
        </div>

        {showNewClientForm && (
          <div className="mt-5 rounded-md border border-line bg-panel/45 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Nuevo cliente</h3>
                <p className="mt-1 text-sm text-ink/55">Paso {newClientStep} de 4</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    className={`size-8 rounded-md text-sm font-semibold ${
                      newClientStep === step ? "bg-ink text-white" : "border border-line bg-white text-ink/60"
                    }`}
                    key={step}
                    onClick={() => setNewClientStep(step)}
                    type="button"
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {newClientStep === 1 && (
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-2">
                  Nombre
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, name: event.target.value }))}
                    placeholder="Nombre completo"
                    value={newClientDraft.name}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Edad
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    min={1}
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, age: Number(event.target.value) }))}
                    type="number"
                    value={newClientDraft.age}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Contexto
                  <select
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, goalType: event.target.value as CoachClient["goalType"] }))}
                    value={newClientDraft.goalType}
                  >
                    <option>Rendimiento</option>
                    <option>Salud</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-2">
                  Disciplina / deporte
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, modality: event.target.value }))}
                    placeholder="Ej. Running, fuerza, salud..."
                    value={newClientDraft.modality}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-2">
                  Disponibilidad semanal
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, availability: event.target.value }))}
                    placeholder="Ej: 3 días/semana, 60 min por sesión"
                    value={newClientDraft.availability}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-2">
                  Material disponible
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, availableEquipment: event.target.value }))}
                    placeholder="Ej: gimnasio completo, mancuernas, barra, poleas"
                    value={newClientDraft.availableEquipment}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-2">
                  Lesiones o limitaciones
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, injuries: event.target.value }))}
                    placeholder="Ej. tendinopatía, dolor lumbar, sin limitaciones..."
                    value={newClientDraft.injuries}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75 md:col-span-4">
                  Notas iniciales
                  <textarea
                    className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, initialNotes: event.target.value }))}
                    placeholder="Notas del entrenador"
                    value={newClientDraft.initialNotes}
                  />
                </label>
              </div>
            )}

            {newClientStep === 2 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Objetivo principal
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, objective: event.target.value }))}
                    placeholder="Ej. fuerza máxima, salud metabólica, 10K..."
                    value={newClientDraft.objective}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Próxima competición / test / pico de forma
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, eventName: event.target.value }))}
                    placeholder="Ej. Test fuerza máxima"
                    value={newClientDraft.eventName}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Fecha objetivo
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, eventDate: event.target.value }))}
                    type="date"
                    value={newClientDraft.eventDate}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Notas del objetivo
                  <input
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, eventNotes: event.target.value }))}
                    placeholder="Prioridades, restricciones, fecha flexible..."
                    value={newClientDraft.eventNotes}
                  />
                </label>
              </div>
            )}

            {newClientStep === 3 && (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Modelo de periodización
                  <select
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setNewClientDraft((draft) => ({ ...draft, planningMethod: event.target.value as PlanningMethod }))}
                    value={newClientDraft.planningMethod}
                  >
                    <option value="">Sin seleccionar</option>
                    <option value="linear">Lineal</option>
                    <option value="undulating">Ondulante</option>
                    <option value="block">Bloques</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </label>
                <div className="space-y-2 text-sm font-medium text-ink/75">
                  Número de mesociclos
                  <div className="flex h-11 items-center rounded-md border border-line bg-white px-3 text-lg font-semibold text-ink">
                    {newClientDraft.planningBlocks.length}
                  </div>
                </div>
                </div>

                <button
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
                  onClick={addClientMesocycle}
                  type="button"
                >
                  <Plus size={16} />
                  Añadir mesociclo
                </button>

                {newClientDraft.planningBlocks.length === 0 ? (
                  <div className="rounded-md bg-white px-3 py-3 text-sm text-ink/60">
                    Puedes crear el cliente sin mesociclos y completar la planificación después.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {newClientDraft.planningBlocks.map((block, index) => (
                      <section className="rounded-md border border-line bg-white p-4" key={block.id}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-ink">Mesociclo {index + 1}</h4>
                          <button
                            aria-label="Eliminar mesociclo"
                            className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700"
                            onClick={() => deleteClientMesocycle(block.id)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Nombre
                            <input
                              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateClientMesocycle(block.id, { name: event.target.value })}
                              value={block.name}
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Duración
                            <input
                              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                              min={1}
                              onChange={(event) => updateClientMesocycle(block.id, { durationWeeks: Number(event.target.value) })}
                              type="number"
                              value={block.durationWeeks}
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Objetivo principal
                            <input
                              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateClientMesocycle(block.id, { primaryObjective: event.target.value })}
                              value={block.primaryObjective}
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Objetivo secundario
                            <input
                              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateClientMesocycle(block.id, { secondaryObjective: event.target.value })}
                              value={block.secondaryObjective}
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Distribución semanal
                            <select
                              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateClientMesocycle(block.id, { weeklyDistribution: event.target.value as WeeklyDistribution })}
                              value={block.weeklyDistribution}
                            >
                              {planningConfig.weeklyDistributionOptions.map((distribution) => (
                                <option key={distribution}>{distribution}</option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2 text-sm font-medium text-ink/75">
                            Notas
                            <textarea
                              className="min-h-10 w-full rounded-md border border-line bg-panel/35 px-3 py-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateClientMesocycle(block.id, { notes: event.target.value })}
                              placeholder="Notas del mesociclo"
                              value={block.notes}
                            />
                          </label>
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            )}

            {newClientStep === 4 && (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-md border border-line bg-white p-4 shadow-soft">
                  <h4 className="font-semibold text-ink">Datos del cliente</h4>
                  <div className="mt-3 grid gap-2 text-sm text-ink/65">
                    <p><span className="font-semibold text-ink">Nombre:</span> {newClientDraft.name || "Sin nombre"}</p>
                    <p><span className="font-semibold text-ink">Edad:</span> {newClientDraft.age} años</p>
                    <p><span className="font-semibold text-ink">Disciplina:</span> {newClientDraft.modality}</p>
                    <p><span className="font-semibold text-ink">Contexto:</span> {newClientDraft.goalType}</p>
                    <p><span className="font-semibold text-ink">Disponibilidad:</span> {newClientDraft.availability || "Pendiente"}</p>
                    <p><span className="font-semibold text-ink">Material:</span> {newClientDraft.availableEquipment || "Pendiente"}</p>
                  </div>
                </div>
                <div className="rounded-md border border-line bg-white p-4 shadow-soft">
                  <h4 className="font-semibold text-ink">Objetivo</h4>
                  <div className="mt-3 grid gap-2 text-sm text-ink/65">
                    <p><span className="font-semibold text-ink">Objetivo principal:</span> {newClientDraft.objective || "Sin definir"}</p>
                    <p><span className="font-semibold text-ink">Evento:</span> {newClientDraft.eventName || "Sin evento definido"}</p>
                    <p><span className="font-semibold text-ink">Fecha:</span> {newClientDraft.eventDate || "Sin fecha"}</p>
                    {newClientDraft.eventNotes ? (
                      <p><span className="font-semibold text-ink">Notas:</span> {newClientDraft.eventNotes}</p>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-md border border-line bg-white p-4 shadow-soft">
                  <h4 className="font-semibold text-ink">Planificación inicial</h4>
                  <div className="mt-3 grid gap-2 text-sm text-ink/65">
                    <p><span className="font-semibold text-ink">Modelo:</span> {newClientDraft.planningMethod ? getPlanningMethodLabel(newClientDraft.planningMethod) : "Sin modelo"}</p>
                    <p><span className="font-semibold text-ink">Mesociclos:</span> {newClientDraft.planningBlocks.length}</p>
                    <p><span className="font-semibold text-ink">Bloque inicial:</span> {newClientDraft.planningBlocks[0]?.name ?? "Sin asignar"}</p>
                    {newClientDraft.planningBlocks.length > 0 ? (
                      <div className="mt-1 grid gap-1">
                        {newClientDraft.planningBlocks.map((block, index) => (
                          <p className="rounded-md bg-panel/45 px-2 py-1" key={block.id}>
                            Mesociclo {index + 1} · {block.durationWeeks} semanas
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-between gap-2">
              <button
                className="h-10 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink/70"
                onClick={() => {
                  resetNewClientDraft();
                  setShowNewClientForm(false);
                }}
                type="button"
              >
                Cancelar
              </button>
              <div className="flex gap-2">
                <button
                  className="h-10 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink/70 disabled:opacity-40"
                  disabled={newClientStep === 1}
                  onClick={() => setNewClientStep((step) => Math.max(1, step - 1))}
                  type="button"
                >
                  Anterior
                </button>
                {newClientStep < 4 ? (
                  <button
                    className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-white"
                    onClick={() => setNewClientStep((step) => Math.min(4, step + 1))}
                    type="button"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:opacity-40"
                    disabled={!newClientDraft.name.trim()}
                    onClick={addClient}
                    type="button"
                  >
                    Crear cliente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Clientes registrados</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              aria-label="Buscar cliente"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink/70"
              onClick={() => setShowSearch((current) => !current)}
              title="Buscar cliente"
              type="button"
            >
              <Search size={18} />
              Buscar
            </button>
            <button
              aria-label="Filtros"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink/70"
              onClick={() => setShowFilters((current) => !current)}
              title="Filtros"
              type="button"
            >
              <Settings2 size={18} />
              Filtrar
            </button>
          </div>
        </div>

        {(showSearch || showFilters) && (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            {showSearch && (
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Buscar por nombre, deporte, estado o evento
                <input
                  className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Ej. Lucia, running, carga alta..."
                  value={searchTerm}
                />
              </label>
            )}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Todos", value: "all" },
                  { label: "Salud", value: "Salud" },
                  { label: "Rendimiento", value: "Rendimiento" }
                ].map((filter) => (
                  <button
                    className={`h-11 rounded-md px-4 text-sm font-semibold ${
                      goalFilter === filter.value
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-ink/70"
                    }`}
                    key={filter.value}
                    onClick={() => setGoalFilter(filter.value as typeof goalFilter)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {filteredClients.map((listedClient) => {
            const visibleBadges = [listedClient.goalType, listedClient.status].filter(
              (badge) => badge && badge !== "Datos completos"
            );

            return (
              <article
                className="rounded-md border border-line bg-panel/45 p-4"
                key={listedClient.id}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h3 className="mr-1 font-semibold text-ink">{listedClient.name}</h3>
                    {visibleBadges.map((badge) => (
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          badge === listedClient.goalType ? "bg-white text-ink/70" : "bg-wheat text-ink/70"
                        }`}
                        key={badge}
                      >
                        {badge}
                      </span>
                    ))}
                    <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-moss">
                      {listedClient.readiness}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
                  <button
                    className="rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-white"
                    onClick={() => onOpenDashboard(listedClient.id)}
                    type="button"
                  >
                    Dashboard
                  </button>
                  <button
                    aria-label={`Detalles de ${listedClient.name}`}
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenDetails(listedClient.id)}
                    title={`Detalles de ${listedClient.name}`}
                    type="button"
                  >
                    Detalles
                  </button>
                  <button
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenClientSheet(listedClient.id, "assessments")}
                    type="button"
                  >
                    Valoraciones
                  </button>
                  <button
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenClientSheet(listedClient.id, "planning")}
                    type="button"
                  >
                    Planificación
                  </button>
                  <button
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenClientSheet(listedClient.id, "training")}
                    type="button"
                  >
                    Sesiones
                  </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1 text-xs font-medium text-ink/55 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-4">
                  <span>{listedClient.age} anos · {listedClient.modality ?? listedClient.sport}</span>
                  <span>Ultima actividad: {listedClient.lastActivity}</span>
                  <span>Evento: {listedClient.nextEvent}</span>
                </div>
              </article>
            );
          })}
          {filteredClients.length === 0 && (
            <div className="rounded-md border border-line bg-panel/35 p-5 text-center text-sm text-ink/55">
              No hay clientes que coincidan con la busqueda o el filtro.
            </div>
          )}
        </div>
      </section>

    </>
  );
}

function ClientStatTile({ label, percent, value }: { label: string; percent?: number; value: number }) {
  return (
    <article className="rounded-md border border-line bg-panel/35 p-4">
      <p className="text-sm font-semibold text-ink/55">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-4xl font-semibold text-steel">{value}</p>
        {percent !== undefined && (
          <span className="rounded-md bg-mint px-2 py-1 text-sm font-semibold text-moss">
            {percent}%
          </span>
        )}
      </div>
    </article>
  );
}

function ClientDashboardView({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  const [dashboardDetail, setDashboardDetail] = useState<DashboardDetailSection | null>(null);
  const loadData = getClientLoadData(client);

  return (
    <div className="mt-6 grid gap-6">
      <ClientHeader client={client} onBack={onBack} onOpenClientSheet={onOpenClientSheet} onOpenDetails={onOpenDetails} />
      <LoadSummaryCards client={client} loadData={loadData} onOpenDetail={setDashboardDetail} />
      {dashboardDetail ? (
        <DashboardDetailPanel
          client={client}
          loadData={loadData}
          onClose={() => setDashboardDetail(null)}
          section={dashboardDetail}
        />
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <WellnessCards client={client} loadData={loadData} onOpenDetail={setDashboardDetail} />
        <RiskControlCards client={client} loadData={loadData} onOpenDetail={setDashboardDetail} />
      </div>
      <FatigueHeatmap client={client} loadData={loadData} onOpenDetail={setDashboardDetail} />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ActivePlanning client={client} onOpenClientSheet={onOpenClientSheet} />
        <RecentSessions clientId={client.id} onOpenClientSheet={onOpenClientSheet} sessions={client.sessionRecords} />
      </div>
      <ClientAssessmentsSummary assessments={client.assessments} clientId={client.id} onOpenClientSheet={onOpenClientSheet} />
      <QuickAccess client={client} onOpenClientSheet={onOpenClientSheet} onOpenDetails={onOpenDetails} />
    </div>
  );
}

function ClientHeader({
  client,
  onBack,
  onOpenClientSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button className="mb-3 text-sm font-semibold text-moss" onClick={onBack} type="button">
            Volver a clientes
          </button>
          <h2 className="text-xl font-semibold text-ink">{client.name}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {client.modality} - {client.level} - {client.goalType}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink"
            onClick={onOpenDetails}
            type="button"
          >
            Detalles
          </button>
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onOpenClientSheet(client.id, "assessments")}
            type="button"
          >
            Valoraciones
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <ClientInfoCard label="Estado actual" value={client.status} />
        <ClientInfoCard label="Readiness" value={`${client.readiness}%`} />
        <ClientInfoCard className="md:col-span-2" label="Proximo evento" value={client.nextEvent} />
      </div>
    </section>
  );
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`rounded-md bg-panel/55 p-4 ${className}`}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm font-semibold text-moss">{value}</p>
    </article>
  );
}

function DashboardDetailPanel({
  client,
  loadData,
  onClose,
  section
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getClientLoadData>;
  onClose: () => void;
  section: DashboardDetailSection;
}) {
  const content: Record<DashboardDetailSection, { items: [string, string][]; title: string }> = {
    "acwr": {
      title: "Detalle ACWR",
      items: [
        ["Carga aguda", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Carga cronica", `${client.chronicLoad} UA`],
        ["Ratio actual", loadData.acwr.toFixed(2)],
        ["Interpretacion", loadData.acwrStatus]
      ]
    },
    "fatigue-map": {
      title: "Detalle mapa de fatiga",
      items: [
        ["Carga semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Hooper", `${loadData.hooper}/25`],
        ["DOMS", `${client.hooper.soreness}/5`],
        ["Sueno", `${client.hooper.sleep}/5`]
      ]
    },
    "hooper": {
      title: "Detalle Hooper",
      items: [
        ["Sueno", `${client.hooper.sleep}/5`],
        ["Fatiga", `${client.hooper.fatigue}/5`],
        ["Estres", `${client.hooper.stress}/5`],
        ["DOMS", `${client.hooper.soreness}/5`],
        ["Estado de animo", `${client.hooper.mood ?? 0}/5`]
      ]
    },
    "load": {
      title: "Detalle sRPE semanal",
      items: [
        ["sRPE semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Tendencia", loadData.weeklyTrend],
        ["Sesiones recientes", client.sessionRecords.map((session) => `${session.type} ${calculateSessionLoad(session.rpe, session.duration)} UA`).join(" | ")]
      ]
    },
    "monotony": {
      title: "Detalle monotonia",
      items: [
        ["Cargas diarias", client.dailyLoads.join(" / ")],
        ["Monotonia", loadData.monotony.toFixed(2)],
        ["Estado", loadData.monotonyStatus]
      ]
    },
    "status": {
      title: "Detalle estado global",
      items: [
        ["Estado actual", client.status],
        ["Readiness", `${client.readiness}%`],
        ["Notas", client.coachNotes],
        ["Indices implicados", `ACWR ${loadData.acwr.toFixed(2)}, Hooper ${loadData.hooper}/25, Strain ${loadData.strain.toFixed(0)}`]
      ]
    },
    "strain": {
      title: "Detalle strain",
      items: [
        ["Carga semanal", `${loadData.weeklyLoad.toFixed(0)} UA`],
        ["Monotonia", loadData.monotony.toFixed(2)],
        ["Strain", loadData.strain.toFixed(0)],
        ["Estado", loadData.strainStatus]
      ]
    }
  };
  const selected = content[section];

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-moss">Clientes / {client.name} / Dashboard</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{selected.title}</h3>
        </div>
        <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={onClose} type="button">
          Cerrar
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {selected.items.map(([label, value]) => (
          <ClientInfoCard key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function LoadSummaryCards({
  client,
  loadData,
  onOpenDetail
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getClientLoadData>;
  onOpenDetail: (section: DashboardDetailSection) => void;
}) {
  const cards = [
    { label: "Estado global", value: client.status, detail: "estado actual del cliente", section: "status" as DashboardDetailSection, status: loadData.acwrStatus },
    { label: "sRPE semanal", value: `${loadData.weeklyLoad.toFixed(0)} UA`, detail: loadData.weeklyTrend, section: "load" as DashboardDetailSection, status: loadData.acwrStatus },
    { label: "Monotonia", value: loadData.monotony.toFixed(2), detail: "variabilidad de cargas", section: "monotony" as DashboardDetailSection, status: loadData.monotonyStatus },
    { label: "Strain", value: loadData.strain.toFixed(0), detail: "carga semanal x monotonia", section: "strain" as DashboardDetailSection, status: loadData.strainStatus }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article className={`rounded-md border p-4 ${clientStatusClass(card.status)}`} key={card.label}>
          <p className="text-sm font-semibold">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          <p className="mt-2 text-xs font-medium opacity-75">{card.detail}</p>
          <button className="mt-3 text-xs font-semibold underline" onClick={() => onOpenDetail(card.section)} type="button">
            Ver detalle
          </button>
        </article>
      ))}
    </section>
  );
}

function WellnessCards({
  client,
  loadData,
  onOpenDetail
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getClientLoadData>;
  onOpenDetail: (section: DashboardDetailSection) => void;
}) {
  const hooperItems = [
    ["Sueno", client.hooper.sleep],
    ["Fatiga", client.hooper.fatigue],
    ["Estres", client.hooper.stress],
    ["DOMS", client.hooper.soreness],
    ["Mood", client.hooper.mood ?? 0]
  ];

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">Fatiga / wellness</h3>
          <p className="mt-1 text-sm text-ink/55">Ultimo registro Hooper del cliente.</p>
        </div>
        <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${clientStatusClass(loadData.hooperStatus)}`}>
          {loadData.hooper}/25
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {hooperItems.map(([label, value]) => (
          <article className="rounded-md bg-panel/50 p-3 text-center" key={label}>
            <p className="text-xs font-semibold text-ink/55">{label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
          </article>
        ))}
      </div>
      <HooperTrendChart currentValue={loadData.hooper} />
      <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenDetail("hooper")} type="button">
        Ver detalle
      </button>
      <p className="mt-4 rounded-md bg-mint px-3 py-3 text-sm font-medium text-moss">
        Alerta: {loadData.hooperStatus === "Controlado" ? "mantener plan previsto" : "revisar carga antes de progresar"}
      </p>
    </section>
  );
}

function HooperTrendChart({ currentValue }: { currentValue: number }) {
  const values = [currentValue - 2, currentValue - 1, currentValue, currentValue + 1, currentValue, currentValue - 1, currentValue].map((value) => Math.max(value, 1));
  const maxValue = Math.max(...values, 12);

  return (
    <div className="mt-4 flex h-24 items-end gap-2 rounded-md bg-panel/45 p-3">
      {values.map((value, index) => (
        <div className="flex flex-1 flex-col items-center gap-1" key={`${value}-${index}`}>
          <div
            className="w-full rounded-t bg-gradient-to-t from-moss to-steel"
            style={{ height: `${Math.max(16, (value / maxValue) * 72)}px` }}
          />
          <span className="text-[10px] font-semibold text-ink/45">{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function FatigueHeatmap({
  client,
  loadData,
  onOpenDetail
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getClientLoadData>;
  onOpenDetail: (section: DashboardDetailSection) => void;
}) {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const maxLoad = Math.max(...client.dailyLoads, 1);

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Mapa de fatiga</h3>
          <p className="mt-1 text-sm text-ink/55">Carga diaria, Hooper y tendencia de riesgo del cliente activo.</p>
        </div>
        <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${clientStatusClass(loadData.acwrStatus)}`}>
          ACWR {loadData.acwr.toFixed(2)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {client.dailyLoads.map((load, index) => {
          const intensity = load / maxLoad;
          const colorClass = intensity > 0.8 ? "bg-red-100 text-red-800" : intensity > 0.45 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800";

          return (
            <article className={`rounded-md border border-line p-3 text-center ${colorClass}`} key={`${days[index]}-${load}`}>
              <p className="text-xs font-semibold">{days[index]}</p>
              <p className="mt-2 text-lg font-semibold">{load}</p>
              <p className="mt-1 text-[11px] font-medium">UA</p>
            </article>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ClientInfoCard label="Hooper" value={`${loadData.hooper}/25`} />
        <ClientInfoCard label="DOMS" value={`${client.hooper.soreness}/5`} />
        <ClientInfoCard label="Sueno" value={`${client.hooper.sleep}/5`} />
      </div>
      <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenDetail("fatigue-map")} type="button">
        Ver detalle
      </button>
    </section>
  );
}

function RiskControlCards({
  client,
  loadData,
  onOpenDetail
}: {
  client: CoachClient;
  loadData: ReturnType<typeof getClientLoadData>;
  onOpenDetail: (section: DashboardDetailSection) => void;
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Riesgo / control</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricPill label="ACWR" status={loadData.acwrStatus} value={loadData.acwr.toFixed(2)} />
        <MetricPill label="Readiness" status={client.readiness < 80 ? "Vigilar" : "Controlado"} value={`${client.readiness}%`} />
        <MetricPill label="Carga 7 dias" status={loadData.acwrStatus} value={`${loadData.weeklyLoad.toFixed(0)} UA`} />
        <MetricPill label="Referencia 28 dias" status="Controlado" value={`${client.chronicLoad} UA`} />
      </div>
      <p className="mt-4 text-sm text-ink/60">{client.coachNotes}</p>
      <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenDetail("acwr")} type="button">
        Ver detalle ACWR
      </button>
    </section>
  );
}

function MetricPill({ label, status, value }: { label: string; status: string; value: string }) {
  return (
    <article className={`rounded-md border p-3 ${clientStatusClass(status)}`}>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs font-semibold">{status}</p>
    </article>
  );
}

function ActivePlanning({
  client,
  onOpenClientSheet
}: {
  client: CoachClient;
  onOpenClientSheet?: (clientId: string, sheet: SheetId) => void;
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Planificación activa</h3>
      <div className="mt-4 rounded-md bg-panel/55 p-4">
        <p className="text-lg font-semibold text-ink">{client.planning.currentBlock}</p>
        <p className="mt-1 text-sm text-ink/55">{client.planning.currentWeek} - {client.planning.distribution}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ClientInfoCard label="Objetivo principal" value={client.planning.primaryGoal} />
          <ClientInfoCard label="Objetivo secundario" value={client.planning.secondaryGoal} />
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {client.planning.nextSessions.map((session) => (
          <p className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/70" key={session}>
            {session}
          </p>
        ))}
      </div>
      {onOpenClientSheet ? (
        <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenClientSheet(client.id, "planning")} type="button">
          Ver detalle
        </button>
      ) : null}
    </section>
  );
}

function RecentSessions({
  clientId,
  onOpenClientSheet,
  sessions
}: {
  clientId?: string;
  onOpenClientSheet?: (clientId: string, sheet: SheetId) => void;
  sessions: ClientSessionRecord[];
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Sesiones recientes</h3>
      <div className="mt-4 grid gap-3">
        {sessions.map((session) => (
          <article className="rounded-md border border-line bg-panel/35 p-3" key={`${session.date}-${session.summary}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-ink">{session.type}</p>
                <p className="mt-1 text-sm text-ink/65">{session.summary}</p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">
                {calculateSessionLoad(session.rpe, session.duration)} UA
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/50">{session.date} - RPE {session.rpe} - {session.duration} min</p>
          </article>
        ))}
      </div>
      {clientId && onOpenClientSheet ? (
        <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenClientSheet(clientId, "training")} type="button">
          Ver detalle
        </button>
      ) : null}
    </section>
  );
}

function ClientAssessmentsSummary({
  assessments,
  clientId,
  onOpenClientSheet
}: {
  assessments: ClientAssessment[];
  clientId?: string;
  onOpenClientSheet?: (clientId: string, sheet: SheetId) => void;
}) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-ink">Valoraciones</h3>
        <button className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="button">
          Nueva valoracion
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {assessments.map((assessment) => (
          <article className="rounded-md border border-line bg-panel/35 p-4" key={`${assessment.date}-${assessment.name}`}>
            <p className="text-xs font-semibold uppercase text-moss">{assessment.type}</p>
            <p className="mt-2 font-semibold text-ink">{assessment.name}</p>
            <p className="mt-1 text-sm text-ink/65">{assessment.result}</p>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink/50">
              <span>{assessment.date}</span>
              <button className="font-semibold text-moss" type="button">{assessment.action}</button>
            </div>
          </article>
        ))}
      </div>
      {clientId && onOpenClientSheet ? (
        <button className="mt-4 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenClientSheet(clientId, "assessments")} type="button">
          Ver detalle
        </button>
      ) : null}
    </section>
  );
}

function QuickAccess({
  client,
  onOpenClientSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  const quickLinks: { label: string; sheet?: SheetId; action?: () => void }[] = [
    { label: "Planificación", sheet: "planning" },
    { label: "Sesiones", sheet: "training" },
    { label: "Metricas", sheet: "weeklyLoad" },
    { label: "Valoraciones", sheet: "assessments" },
    { label: "Ficha inicial", action: onOpenDetails }
  ];

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Accesos rapidos</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {quickLinks.map((link) => (
          <button
            className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white"
            key={link.label}
            onClick={() => (link.sheet ? onOpenClientSheet(client.id, link.sheet) : link.action?.())}
            type="button"
          >
            {link.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ClientDetailsView({
  client,
  onBack,
  onSave
}: {
  client: CoachClient;
  onBack: () => void;
  onSave: () => void;
}) {
  const details = [
    ["Nombre", client.name],
    ["Edad", `${client.age} anos`],
    ["Modalidad deportiva", client.modality],
    ["Nivel", client.level],
    ["Objetivo / evento", client.nextEvent],
    ["Disponibilidad semanal", client.availability],
    ["Material disponible", client.availableEquipment ?? "Pendiente"],
    ["Historial deportivo", client.history],
    ["Lesiones / limitaciones", client.injuries],
    ["Notas del entrenador", client.coachNotes]
  ];

  return (
    <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button className="mb-3 text-sm font-semibold text-moss" onClick={onBack} type="button">
            Volver al dashboard
          </button>
          <h2 className="text-xl font-semibold text-ink">Ficha inicial</h2>
          <p className="mt-1 text-sm text-ink/60">{client.name}</p>
        </div>
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onSave} type="button">
          Guardar ficha inicial
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {details.map(([label, value]) => (
          <article className="rounded-md border border-line bg-panel/35 p-4" key={label}>
            <p className="text-sm font-semibold text-ink">{label}</p>
            <p className="mt-2 text-sm text-ink/70">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DecisionDashboardView() {
  const primaryMetrics = decisionDashboard.metrics.filter((metric) =>
    ["sRPE semanal", "Hooper", "ACWR EWMA", "Mapa de fatiga"].includes(metric.label)
  );

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-md border border-line bg-white/90 p-5 text-ink shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-moss">
              {decisionDashboard.athlete} - {decisionDashboard.week}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Dashboard</h2>
          </div>
          <div className={`rounded-md border px-4 py-3 ${decisionToneClass(decisionDashboard.recommendationTone)}`}>
            <p className="text-sm font-semibold">Recomendacion</p>
            <p className="mt-1 text-lg font-semibold">{decisionDashboard.recommendation}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <article className={`rounded-md border p-4 ${decisionToneClass(metric.status)}`} key={metric.label}>
              <p className="text-sm font-semibold">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              <span className="mt-3 inline-flex rounded-md bg-white/70 px-2 py-1 text-xs font-semibold">
                {metric.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Acciones sugeridas</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {decisionDashboard.actions.map((action) => (
            <p className="rounded-md bg-panel/60 px-3 py-3 text-sm font-medium text-ink/75" key={action}>
              {action}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function WeeklyLoadView({ client }: { client?: CoachClient | null }) {
  const loadData = client ? getClientLoadData(client) : null;
  const weeklyTrainingSessions = getMockWeeklyTrainingSessions();
  const previewSession = weeklyTrainingSessions[0];
  const sessionExternalLoad = calculateSessionExternalLoad(previewSession, exerciseLibrary);
  const sessionExternalLoadByPattern = calculateExternalLoadByPattern(previewSession, exerciseLibrary);
  const sessionMuscleSets = calculateSessionMuscleSets(previewSession, exerciseLibrary);
  const weeklyExternalLoad = calculateWeeklyExternalLoad(weeklyTrainingSessions, exerciseLibrary);
  const weeklyExternalLoadByPattern = calculateWeeklyExternalLoadByPattern(weeklyTrainingSessions, exerciseLibrary);
  const weeklyMuscleSets = calculateWeeklyMuscleSets(weeklyTrainingSessions, exerciseLibrary);
  const maxPatternLoad = Math.max(1, ...Object.values(weeklyExternalLoadByPattern));
  const muscleSetEntries = Object.entries(weeklyMuscleSets).sort(([, a], [, b]) => b - a).slice(0, 8);
  const weeklySessionCount = weeklyTrainingSessions.length;

  return (
    <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Carga semanal</h2>
        </div>
        <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
          Ultimas 6 semanas
        </span>
      </div>

      {client && loadData ? (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <MetricPill label="sRPE semanal" status={loadData.acwrStatus} value={`${loadData.weeklyLoad.toFixed(0)} UA`} />
          <MetricPill label="Monotonia" status={loadData.monotonyStatus} value={loadData.monotony.toFixed(2)} />
          <MetricPill label="Strain" status={loadData.strainStatus} value={loadData.strain.toFixed(0)} />
          <MetricPill label="ACWR" status={loadData.acwrStatus} value={loadData.acwr.toFixed(2)} />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MetricPill
          label="Carga externa semanal"
          status="kg"
          value={`${Math.round(weeklyExternalLoad).toLocaleString("es-ES")} kg`}
        />
        <MetricPill
          label="Carga externa sesion"
          status="prevision"
          value={`${Math.round(sessionExternalLoad).toLocaleString("es-ES")} kg`}
        />
        <MetricPill
          label="Sesiones incluidas"
          status="semana"
          value={`${weeklySessionCount}`}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <MetricChart chartType="bar" title="sRPE semanal" field="srpe" suffix=" UA" />
        <MetricChart chartType="points" title="Monotonia" field="monotony" />
        <MetricChart chartType="bar" title="Strain" field="strain" />
        <MetricChart chartType="line" title="ACWR EWMA" field="acwr" />
        <MetricChart chartType="points" title="Hooper" field="hooper" suffix="/20" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-md border border-line bg-panel/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">Carga externa semanal por patron</h3>
            <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-ink">
              {Math.round(weeklyExternalLoad).toLocaleString("es-ES")} kg
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {Object.entries(weeklyExternalLoadByPattern).map(([pattern, load]) => (
              <div className="grid gap-2" key={pattern}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">{pattern}</span>
                  <span className="text-ink/65">
                    {Math.round(load).toLocaleString("es-ES")} kg
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-moss to-steel"
                    style={{ width: `${(load / maxPatternLoad) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">Series efectivas semanales por musculo</h3>
          <div className="mt-4 grid gap-2">
            {muscleSetEntries.map(([muscle, score]) => (
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm" key={muscle}>
                <span className="font-medium text-ink/70">{formatFatigueKey(muscle)}</span>
                <span className="font-semibold text-ink">{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-line bg-white p-4">
          <h3 className="font-semibold text-ink">Carga externa de la sesion por patron</h3>
          <div className="mt-3 grid gap-2">
            {Object.entries(sessionExternalLoadByPattern).map(([pattern, load]) => (
              <p className="flex justify-between rounded-md bg-panel/45 px-3 py-2 text-sm" key={pattern}>
                <span className="text-ink/70">{pattern}</span>
                <span className="font-semibold text-ink">{Math.round(load).toLocaleString("es-ES")} kg</span>
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h3 className="font-semibold text-ink">Series efectivas de la sesion</h3>
          <div className="mt-3 grid gap-2">
            {Object.entries(sessionMuscleSets).map(([muscle, sets]) => (
              <p className="flex justify-between gap-3 rounded-md bg-panel/45 px-3 py-2 text-sm" key={muscle}>
                <span className="text-ink/70">{formatFatigueKey(muscle)}</span>
                <span className="font-semibold text-ink">{sets.toFixed(1)}</span>
              </p>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function getMockWeeklyTrainingSessions(): TrainingSessionInput[] {
  return [
    {
      completed: true,
      performedExercises: [
        createSessionExercise("Back squat", 4, 5, 82.5),
        createSessionExercise("Romanian deadlift", 3, 8, 70),
        createSessionExercise("Walking lunge", 3, 10, 24),
        createSessionExercise("Plank", 3, 1, 0)
      ]
    },
    {
      completed: true,
      performedExercises: [
        createSessionExercise("Bench press", 4, 6, 75),
        createSessionExercise("T-bar row", 4, 8, 60),
        createSessionExercise("Overhead press / Press militar", 3, 6, 40)
      ]
    },
    {
      completed: false,
      plannedExercises: [
        createSessionExercise("Goblet squat", 3, 10, 24),
        createSessionExercise("Hip thrust", 4, 8, 90),
        createSessionExercise("Pull-up / Chin-up", 4, 5, 0)
      ]
    }
  ];
}

function createSessionExercise(
  exerciseName: string,
  sets: number,
  reps: number,
  load: number
) {
  const exercise = exerciseLibrary.find((item) => item.name === exerciseName);
  return {
    exerciseId: exercise?.id,
    exerciseName,
    load,
    reps,
    sets
  };
}

type PlanningEventType = "Competicion" | "Test" | "Pico de forma" | "Control / seguimiento" | "Sin evento definido";
type EditablePlanningBlock = {
  durationWeeks: number;
  id: string;
  mainMetrics: string[];
  name: string;
  notes: string;
  primaryObjective: string;
  secondaryObjective: string;
  weeklyDistribution: WeeklyDistribution;
};

const planningEventTypes: PlanningEventType[] = [
  "Competicion",
  "Test",
  "Pico de forma",
  "Control / seguimiento",
  "Sin evento definido"
];

function parsePlanningDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPlanningWeeks(peakDate: string, eventType: PlanningEventType) {
  if (eventType === "Sin evento definido") return 12;
  const start = new Date();
  const peak = parsePlanningDate(peakDate);
  if (!start || !peak || peak <= start) return 0;
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((peak.getTime() - start.getTime()) / dayMs / 7));
}

function downloadPlanningCalendarCsv({
  blocks,
  eventName,
  peakDate,
  eventType
}: {
  blocks: EditablePlanningBlock[];
  eventName: string;
  peakDate: string;
  eventType: PlanningEventType;
}) {
  if (blocks.length === 0 || typeof window === "undefined") return;

  const header = ["Bloque", "Duracion", "Objetivo principal", "Objetivo secundario", "Distribucion semanal", "Notas"];
  const rows = blocks.map((block, index) => [
    index + 1,
    `${block.durationWeeks} semanas`,
    block.primaryObjective,
    block.secondaryObjective,
    block.weeklyDistribution,
    block.notes
  ]);
  const csv = [
    [`Evento`, eventName || eventType, `Fecha objetivo`, peakDate || "Sin fecha"].join(","),
    header.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `planificacion-${(eventName || eventType).toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function PlanningView({
  client
}: {
  client?: CoachClient | null;
}) {
  const [planningEventType, setPlanningEventType] = useState<PlanningEventType>("Competicion");
  const [planningPeakDate, setPlanningPeakDate] = useState(client?.planning.eventDate ?? "");
  const [planningEventName, setPlanningEventName] = useState(client?.planning.eventName ?? "");
  const [planningMethod, setPlanningMethod] = useState<PlanningMethod>(client?.planning.method ?? "");
  const [planningBlocks, setPlanningBlocks] = useState<EditablePlanningBlock[]>(client?.planning.blocks ?? []);
  const planningWeeks = getPlanningWeeks(planningPeakDate, planningEventType);
  const totalWeeks = planningBlocks.reduce((total, block) => total + block.durationWeeks, 0);
  const roadmapBlocks = planningBlocks.reduce<
    Array<EditablePlanningBlock & { endWeek: number; startWeek: number }>
  >((items, block) => {
    const startWeek = items.length > 0 ? items[items.length - 1].endWeek + 1 : 1;
    const endWeek = startWeek + block.durationWeeks - 1;
    return [...items, { ...block, endWeek, startWeek }];
  }, []);
  const selectedPlan = {
    blocks: planningBlocks,
    clientName: client?.name ?? "",
    planningMethod,
    planningEventName,
    planningPeakDate,
    planningEventType,
    planningWeeks
  };

  useEffect(() => {
    setPlanningBlocks(client?.planning.blocks ?? []);
    setPlanningEventName(client?.planning.eventName ?? "");
    setPlanningPeakDate(client?.planning.eventDate ?? "");
    setPlanningMethod(client?.planning.method ?? "");
  }, [client?.id, client?.planning.blocks, client?.planning.eventDate, client?.planning.eventName, client?.planning.method]);

  function addMesocycle() {
    const nextIndex = planningBlocks.length + 1;
    setPlanningBlocks((blocks) => [
      ...blocks,
      {
        durationWeeks: 4,
        id: `mesocycle-${Date.now()}`,
        mainMetrics: [],
        name: `Mesociclo ${nextIndex}`,
        notes: "",
        primaryObjective: "",
        secondaryObjective: "",
        weeklyDistribution: "Lineal"
      }
    ]);
  }

  function updateBlock(blockId: string, updates: Partial<EditablePlanningBlock>) {
    setPlanningBlocks((blocks) =>
      blocks.map((block) => block.id === blockId ? { ...block, ...updates } : block)
    );
  }

  function deleteBlock(blockId: string) {
    setPlanningBlocks((blocks) => blocks.filter((block) => block.id !== blockId));
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    setPlanningBlocks((blocks) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) return blocks;
      const nextBlocks = [...blocks];
      const [movedBlock] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, movedBlock);
      return nextBlocks;
    });
  }

  if (!client) {
    return (
      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-ink">
          Selecciona primero un cliente desde Clientes para ver su planificación.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Cliente</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">{client.name}</h2>
            <p className="mt-1 text-sm text-ink/55">{client.modality} - {client.nextEvent}</p>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-sm font-semibold text-moss">
            {planningBlocks.length} mesociclos - {totalWeeks} semanas
          </span>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ClientInfoCard label="Modelo" value={getPlanningMethodLabel(planningMethod) || "Sin seleccionar"} />
          <ClientInfoCard label="Mesociclos" value={String(planningBlocks.length)} />
          <ClientInfoCard label="Bloque actual" value={client.planning.currentBlock || "Sin asignar"} />
          <ClientInfoCard label="Objetivo principal" value={client.planning.primaryGoal || "Pendiente"} />
          <ClientInfoCard label="Duracion total" value={`${totalWeeks} semanas`} />
        </div>

        <div className="mt-5">
          <h3 className="font-semibold text-ink">Roadmap de mesociclos</h3>
          {planningBlocks.length === 0 ? (
            <div className="mt-3 rounded-md bg-panel/50 px-3 py-3 text-sm text-ink/65">
              Sin asignar
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:flex-wrap">
              {roadmapBlocks.map((block, index) => (
                <div className="flex min-w-0 flex-1 items-stretch gap-3 md:min-w-[220px]" key={block.id}>
                  <div className="min-w-0 flex-1 rounded-md border border-line bg-panel/35 p-4">
                    <p className="text-xs font-semibold uppercase text-moss">Mesociclo {index + 1}</p>
                    <p className="mt-1 font-semibold text-ink">{block.name}</p>
                    <div className="mt-3 grid gap-1 text-sm text-ink/60">
                      <p>{block.durationWeeks} semanas</p>
                      <p>Semana {block.startWeek}-{block.endWeek}</p>
                      <p>Objetivo: {block.primaryObjective || "Sin definir"}</p>
                      <p>Distribucion: {block.weeklyDistribution || "Sin asignar"}</p>
                    </div>
                  </div>
                  {index < roadmapBlocks.length - 1 ? (
                    <div className="hidden items-center text-ink/35 md:flex">→</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Metodo de planificación</h2>
        <label className="mt-5 block space-y-2 text-sm font-medium text-ink/75">
          Metodo de planificación
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setPlanningMethod(event.target.value as PlanningMethod)}
            value={planningMethod}
          >
            {planningConfig.methodOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {planningMethod && (
          <p className="mt-3 rounded-md bg-sky px-3 py-2 text-sm font-semibold text-ink">
            {getPlanningMethodDescription(planningMethod)}
          </p>
        )}

        <PlanningStep step="1" title="Evento objetivo">
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setPlanningEventType(event.target.value as PlanningEventType)}
            value={planningEventType}
          >
            {planningEventTypes.map((eventType) => (
              <option key={eventType}>{eventType}</option>
            ))}
          </select>
        </PlanningStep>

        {planningEventType !== "Sin evento definido" && (
          <PlanningStep step="2" title="Fecha objetivo">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Nombre
                <input
                  className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => setPlanningEventName(event.target.value)}
                  placeholder="Ej. Campeonato regional"
                  value={planningEventName}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Fecha objetivo
                <input
                  className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => setPlanningPeakDate(event.target.value)}
                  type="date"
                  value={planningPeakDate}
                />
              </label>
            </div>
            <p className="mt-3 rounded-md bg-wheat px-3 py-2 text-sm font-semibold text-ink">
              Semanas disponibles: {planningWeeks > 0 ? planningWeeks : "Selecciona una fecha valida"}
            </p>
          </PlanningStep>
        )}

        {planningEventType === "Sin evento definido" && (
          <PlanningStep step="2" title="Nombre del ciclo">
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Nombre del ciclo
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setPlanningEventName(event.target.value)}
                placeholder="Ej. Desarrollo general"
                value={planningEventName}
              />
            </label>
            <p className="mt-3 rounded-md bg-wheat px-3 py-2 text-sm font-semibold text-ink">
              Planificación sin fecha clave. El entrenador decide los mesociclos manualmente.
            </p>
          </PlanningStep>
        )}

        <PlanningStep step="3" title="Mesociclos">
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
            onClick={addMesocycle}
            type="button"
          >
            <Plus size={18} />
            Anadir mesociclo
          </button>
        </PlanningStep>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <PlanningStep step="4" title="Mesociclos editables">
          {planningBlocks.length === 0 ? (
            <div className="rounded-md bg-panel/50 px-3 py-3 text-sm text-ink/65">
              Bloque / mesociclo: Sin asignar. Pulsa + Anadir mesociclo para crear la estructura manualmente.
            </div>
          ) : (
            <div className="grid gap-4">
              {planningBlocks.map((block, index) => (
                <section className="rounded-md border border-line bg-panel/25 p-4" key={block.id}>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">Bloque {index + 1} - {block.name}</h3>
                      <p className="mt-1 text-sm text-ink/55">{block.durationWeeks} semanas - {block.weeklyDistribution}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65" disabled={index === 0} onClick={() => moveBlock(block.id, -1)} type="button">
                        Subir
                      </button>
                      <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65" disabled={index === planningBlocks.length - 1} onClick={() => moveBlock(block.id, 1)} type="button">
                        Bajar
                      </button>
                      <button className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" onClick={() => deleteBlock(block.id)} type="button">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Nombre del bloque
                      <input
                        className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => updateBlock(block.id, { name: event.target.value })}
                        placeholder={planningConfig.mesocycleNameExamples[0]}
                        value={block.name}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Duracion en semanas
                      <input
                        className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                        min={1}
                        onChange={(event) => updateBlock(block.id, { durationWeeks: Number(event.target.value) })}
                        type="number"
                        value={block.durationWeeks}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Objetivo principal
                      <input
                        list={`primary-objectives-${block.id}`}
                        className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => updateBlock(block.id, { primaryObjective: event.target.value })}
                        placeholder="Ej. Fuerza maxima"
                        value={block.primaryObjective}
                      />
                      <datalist id={`primary-objectives-${block.id}`}>
                        {planningConfig.primaryObjectiveExamples.map((goal) => (
                          <option key={goal} value={goal} />
                        ))}
                      </datalist>
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Objetivo secundario
                      <input
                        list={`secondary-objectives-${block.id}`}
                        className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => updateBlock(block.id, { secondaryObjective: event.target.value })}
                        placeholder="Ej. Tecnica"
                        value={block.secondaryObjective}
                      />
                      <datalist id={`secondary-objectives-${block.id}`}>
                        {planningConfig.secondaryObjectiveExamples.map((goal) => (
                          <option key={goal} value={goal} />
                        ))}
                      </datalist>
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                      Distribucion semanal
                      <select
                        className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                        onChange={(event) => updateBlock(block.id, { weeklyDistribution: event.target.value as WeeklyDistribution })}
                        value={block.weeklyDistribution}
                      >
                        {planningConfig.weeklyDistributionOptions.map((distribution) => (
                          <option key={distribution}>{distribution}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
                    Notas
                    <textarea
                      className="min-h-12 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-moss"
                      onChange={(event) => updateBlock(block.id, { notes: event.target.value })}
                      placeholder="Notas del mesociclo"
                      value={block.notes}
                    />
                  </label>
                </section>
              ))}
            </div>
          )}
        </PlanningStep>

        <PlanningSummary selectedPlan={selectedPlan} />
        <PlanningCalendarPreview
          blocks={planningBlocks}
          eventName={planningEventName}
          peakDate={planningPeakDate}
          eventType={planningEventType}
        />
      </section>
    </div>
  );
}

function PlanningStep({
  children,
  step,
  title
}: {
  children: React.ReactNode;
  step: string;
  title: string;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-ink text-xs font-semibold text-white">{step}</span>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PlanningSummary({
  selectedPlan
}: {
  selectedPlan: {
    blocks: EditablePlanningBlock[];
    clientName: string;
    planningMethod: PlanningMethod;
    planningEventName: string;
    planningEventType: PlanningEventType;
    planningPeakDate: string;
    planningWeeks: number;
  };
}) {
  const totalWeeks = selectedPlan.blocks.reduce((total, block) => total + block.durationWeeks, 0);

  return (
    <section className="mt-5 rounded-md border border-line bg-ink p-4 text-white">
      <h3 className="font-semibold">Resumen de planificación</h3>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p className="rounded-md bg-white/10 px-3 py-2">Cliente: {selectedPlan.clientName}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Metodo: {getPlanningMethodLabel(selectedPlan.planningMethod) || "Sin seleccionar"}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Evento objetivo: {selectedPlan.planningEventType}</p>
        {selectedPlan.planningEventType !== "Sin evento definido" && (
          <p className="rounded-md bg-white/10 px-3 py-2">Fecha objetivo: {selectedPlan.planningPeakDate || "Sin fecha"}</p>
        )}
        <p className="rounded-md bg-white/10 px-3 py-2">Numero de mesociclos: {selectedPlan.blocks.length}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Duracion total: {totalWeeks} semanas</p>
        {selectedPlan.planningEventName && (
          <p className="rounded-md bg-white/10 px-3 py-2 sm:col-span-2">Nombre: {selectedPlan.planningEventName}</p>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {selectedPlan.blocks.map((block, index) => (
          <div className="rounded-md bg-white/10 px-3 py-3 text-sm" key={block.id}>
            <p className="font-semibold">
              {index + 1}. {block.name} - {block.durationWeeks} semanas
            </p>
            <p className="mt-2 text-white/80">Objetivo principal: {block.primaryObjective || "Sin definir"}</p>
            <p className="text-white/80">Objetivo secundario: {block.secondaryObjective || "Sin definir"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanningCalendarPreview({
  blocks,
  eventName,
  eventType,
  peakDate
}: {
  blocks: EditablePlanningBlock[];
  eventName: string;
  eventType: PlanningEventType;
  peakDate: string;
}) {
  return (
    <section className="mt-5 rounded-md border border-line bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-ink">Calendario descargable</h3>
        <button
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/35"
          disabled={blocks.length === 0}
          onClick={() => downloadPlanningCalendarCsv({ blocks, eventName, eventType, peakDate })}
          type="button"
        >
          Descargar CSV
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="mt-4 rounded-md bg-panel/50 px-3 py-3 text-sm text-ink/65">
          Anade mesociclos para crear el calendario descargable.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-panel/60 text-xs uppercase text-ink/55">
              <tr>
                <th className="px-3 py-2">Bloque</th>
                <th className="px-3 py-2">Duracion</th>
                <th className="px-3 py-2">Objetivo principal</th>
                <th className="px-3 py-2">Distribucion</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, index) => (
                <tr className="border-t border-line" key={block.id}>
                  <td className="px-3 py-2 font-semibold text-ink">{index + 1}. {block.name}</td>
                  <td className="px-3 py-2 text-ink/70">{block.durationWeeks} semanas</td>
                  <td className="px-3 py-2 text-ink">{block.primaryObjective || "Sin definir"}</td>
                  <td className="px-3 py-2 text-ink/70">{block.weeklyDistribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function ExerciseProgressionsView({ client }: { client?: CoachClient | null }) {
  const [activeBodyRegion, setActiveBodyRegion] = useState<BodyRegion>("lower_body");
  const availablePatterns = getExercisePatternsByBodyRegion(activeBodyRegion);
  const [activePattern, setActivePattern] = useState<ExercisePattern>(availablePatterns[0]);
  const patternExercises = getExercisesByPattern(activePattern);
  const familyGroups = getExerciseFamilyGroups(patternExercises);
  const [selectedFamilyKey, setSelectedFamilyKey] = useState("");
  const selectedFamilyGroup =
    familyGroups.find((group) => group.key === selectedFamilyKey) ?? familyGroups[0];
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const selectedExercise =
    selectedFamilyGroup?.exercises.find((exercise) => exercise.id === selectedExerciseId) ??
    selectedFamilyGroup?.exercises[0];
  const fatigueEntries = selectedExercise
    ? Object.entries(selectedExercise.fatigueMap).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-lg font-semibold text-ink">Biblioteca por familias</h2>
          {client ? (
            <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">
              {client.name}
            </span>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Región corporal
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => {
                const nextRegion = event.target.value as BodyRegion;
                const nextPattern = getExercisePatternsByBodyRegion(nextRegion)[0];
                setActiveBodyRegion(nextRegion);
                setActivePattern(nextPattern);
                setSelectedFamilyKey("");
                setSelectedExerciseId("");
              }}
              value={activeBodyRegion}
            >
              {bodyRegions.map((region) => (
                <option key={region} value={region}>
                  {bodyRegionLabels[region]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Patrón
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => {
                setActivePattern(event.target.value as ExercisePattern);
                setSelectedFamilyKey("");
                setSelectedExerciseId("");
              }}
              value={activePattern}
            >
              {availablePatterns.map((pattern) => (
                <option key={pattern}>{pattern}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Bloque
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => {
                setSelectedFamilyKey(event.target.value);
                setSelectedExerciseId("");
              }}
              value={selectedFamilyGroup?.key ?? ""}
            >
              {familyGroups.map((group) => (
                <option key={group.key} value={group.key}>{group.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Ejercicio
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              value={selectedExercise?.id ?? ""}
            >
              {selectedFamilyGroup?.exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.rank}. {exercise.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        {selectedExercise ? (
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">{selectedExercise.name}</h2>
                <p className="mt-1 text-sm text-ink/55">
                  {bodyRegionLabels[selectedExercise.bodyRegion]} - {selectedExercise.pattern} - {selectedExercise.block} - #{selectedExercise.rank}
                </p>
              </div>
              <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">
                {selectedExercise.equipment.join(" / ")}
              </span>
            </div>

            <div className="mt-5 rounded-md bg-panel/45 p-4">
              <h3 className="text-sm font-semibold text-ink">Descripción técnica</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{selectedExercise.technicalDescription}</p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-line p-4">
                <h3 className="text-sm font-semibold text-ink">Errores a evitar</h3>
                <div className="mt-3 grid gap-2">
                  {selectedExercise.errorsToAvoid.map((error) => (
                    <p className="rounded-md bg-panel/55 px-3 py-2 text-sm text-ink/70" key={error}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-line p-4">
                <h3 className="text-sm font-semibold text-ink">Músculos implicados</h3>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-ink/45">Principales</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {selectedExercise.primaryMuscles.join(", ") || "Pendiente de completar"}
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-ink/45">Secundarios</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {selectedExercise.secondaryMuscles.join(", ") || "Pendiente de completar"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-line p-4">
              <h3 className="text-sm font-semibold text-ink">Mapa de fatiga</h3>
              {fatigueEntries.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {fatigueEntries.map(([muscle, value]) => (
                    <div className="grid grid-cols-[130px_1fr_42px] items-center gap-3" key={muscle}>
                      <span className="text-sm font-medium text-ink/65">{formatFatigueKey(muscle)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-panel">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-moss to-steel"
                          style={{ width: `${Math.round(value * 100)}%` }}
                        />
                      </span>
                      <span className="text-right text-sm font-semibold text-ink">{value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-md bg-panel/45 px-3 py-3 text-sm text-ink/55">
                  Pendiente de completar para este ejercicio.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm text-ink/50">
            Selecciona un ejercicio para ver su ficha.
          </div>
        )}
      </section>
    </div>
  );
}

function formatFatigueKey(key: string) {
  const labels: Record<string, string> = {
    adductors: "Aductores",
    calves: "Gemelos",
    core: "Core",
    forearms: "Antebrazos",
    anteriorDelts: "Deltoides anterior",
    biceps: "Bíceps",
    chest: "Pectoral",
    glutes: "Glúteos",
    gluteMed: "Glúteo medio",
    hamstrings: "Isquios",
    hips: "Caderas",
    hipFlexors: "Flexores cadera",
    cervicalSpine: "Columna cervical",
    neckFlexors: "Flexores cervicales",
    ankles: "Tobillos",
    lats: "Dorsal",
    lateralDelts: "Deltoides lateral",
    lowerTraps: "Trapecio inferior",
    lumbarStabilizers: "Estabilizadores lumbares",
    midBack: "Espalda media",
    obliques: "Oblicuos",
    quadriceps: "Cuádriceps",
    rectusAbdominis: "Recto abdominal",
    rearDelts: "Deltoides posterior",
    rotatorCuff: "Manguito rotador",
    serratusAnterior: "Serrato anterior",
    shoulders: "Hombros",
    soleus: "Sóleo",
    spinalErectors: "Erectores",
    thoracicSpine: "Columna torácica",
    tibialisAnterior: "Tibial anterior",
    traps: "Trapecio",
    triceps: "Tríceps",
    transverseAbdominis: "Transverso abdominal",
    upperTraps: "Trapecio superior",
    upperBack: "Upper back"
  };

  return labels[key] ?? key;
}

function getExerciseFamilyGroups(exercises: ExerciseDefinition[]) {
  const grouped = exercises.reduce<
    Record<string, { exercises: ExerciseDefinition[]; key: string; label: string }>
  >((acc, exercise) => {
    const key = `${exercise.pattern}__${exercise.block}`;
    acc[key] ??= {
      exercises: [],
      key,
      label: exercise.block
    };
    acc[key].exercises.push(exercise);
    return acc;
  }, {});

  return Object.values(grouped).map((group) => ({
    ...group,
    exercises: [...group.exercises].sort((a, b) => a.rank - b.rank)
  }));
}

function getRoutineExerciseAlternatives(pattern: string) {
  const mappedPatterns: Record<string, ExercisePattern[]> = {
    "Empuje tren inferior": ["Squat / Vertical Force", "Lunge / Unilateral Force"],
    "Empuje tren superior": ["Push / Upper Body Press"],
    "Traccion tren inferior": ["Hinge / Horizontal Force"],
    "Traccion tren superior": ["Pull / Upper Body Pull"]
  };
  const patterns = mappedPatterns[pattern] ?? [];
  const names = exerciseLibrary
    .filter((exercise) => patterns.includes(exercise.pattern))
    .map((exercise) => exercise.name);

  return names.length > 0 ? names : [];
}

type RoutineTemplate = {
  exercises: {
    exercise: string;
    pattern: string;
    reps: string;
    rest: string;
    rir: string;
    sets: string;
  }[];
  goal: "Salud" | "Hipertrofia" | "Rendimiento" | "Readaptacion";
  id: string;
  name: string;
  profile: "Persona mayor" | "Principiante" | "Intermedio" | "Avanzado";
  type: string;
};

const routineTemplates: RoutineTemplate[] = [
  {
    id: "older-upper-lower",
    name: "Persona mayor torso-pierna",
    goal: "Salud",
    profile: "Persona mayor",
    type: "Torso-pierna",
    exercises: [
      { exercise: "Sentadilla en silla sin apoyo", pattern: "Empuje tren inferior", sets: "2-3", reps: "8-10", rir: "3-4", rest: "90 s" },
      { exercise: "Puente de gluteo en suelo", pattern: "Traccion tren inferior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
      { exercise: "Press pared", pattern: "Empuje tren superior", sets: "2-3", reps: "8-12", rir: "3-4", rest: "60 s" },
      { exercise: "Remo con banda elastica", pattern: "Traccion tren superior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" }
    ]
  },
  {
    id: "older-strength-a",
    name: "Fuerza base persona mayor",
    goal: "Salud",
    profile: "Persona mayor",
    type: "Full body",
    exercises: [
      { exercise: "Sentadilla en silla con apoyo de manos", pattern: "Empuje tren inferior", sets: "2-3", reps: "8-10", rir: "3-4", rest: "90 s" },
      { exercise: "Remo con banda elastica", pattern: "Traccion tren superior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
      { exercise: "Puente de gluteo en suelo", pattern: "Traccion tren inferior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
      { exercise: "Press pared", pattern: "Empuje tren superior", sets: "2", reps: "8-12", rir: "3-4", rest: "60 s" }
    ]
  },
  {
    id: "health-upper-lower",
    name: "Salud torso-pierna",
    goal: "Salud",
    profile: "Principiante",
    type: "Torso-pierna",
    exercises: [
      { exercise: "Goblet squat", pattern: "Empuje tren inferior", sets: "3", reps: "8-12", rir: "2-3", rest: "90 s" },
      { exercise: "Peso muerto rumano con mancuernas", pattern: "Traccion tren inferior", sets: "3", reps: "8-10", rir: "2-3", rest: "90 s" },
      { exercise: "Press mancuernas en banco", pattern: "Empuje tren superior", sets: "3", reps: "8-12", rir: "2-3", rest: "90 s" },
      { exercise: "Lat pulldown", pattern: "Traccion tren superior", sets: "3", reps: "10-12", rir: "2-3", rest: "75 s" }
    ]
  },
  {
    id: "health-full-body",
    name: "Salud full body",
    goal: "Salud",
    profile: "Principiante",
    type: "Full body",
    exercises: [
      { exercise: "Goblet squat", pattern: "Empuje tren inferior", sets: "3", reps: "8-12", rir: "2-3", rest: "90 s" },
      { exercise: "Peso muerto rumano con mancuernas", pattern: "Traccion tren inferior", sets: "3", reps: "8-10", rir: "2-3", rest: "90 s" },
      { exercise: "Press mancuernas en banco", pattern: "Empuje tren superior", sets: "3", reps: "8-12", rir: "2-3", rest: "90 s" },
      { exercise: "Lat pulldown", pattern: "Traccion tren superior", sets: "3", reps: "10-12", rir: "2-3", rest: "75 s" }
    ]
  },
  {
    id: "hypertrophy-upper-lower",
    name: "Hipertrofia base",
    goal: "Hipertrofia",
    profile: "Intermedio",
    type: "Torso-pierna",
    exercises: [
      { exercise: "Back squat", pattern: "Empuje tren inferior", sets: "4", reps: "6-10", rir: "1-3", rest: "2 min" },
      { exercise: "Peso muerto rumano con barra", pattern: "Traccion tren inferior", sets: "3-4", reps: "8-10", rir: "1-3", rest: "2 min" },
      { exercise: "Press banca", pattern: "Empuje tren superior", sets: "4", reps: "6-10", rir: "1-3", rest: "2 min" },
      { exercise: "Remo con barra", pattern: "Traccion tren superior", sets: "4", reps: "8-12", rir: "1-3", rest: "90 s" }
    ]
  },
  {
    id: "performance-power",
    name: "Fuerza-potencia",
    goal: "Rendimiento",
    profile: "Avanzado",
    type: "Potencia",
    exercises: [
      { exercise: "Jump squat con carga ligera", pattern: "Empuje tren inferior", sets: "4", reps: "3-5", rir: "3", rest: "2-3 min" },
      { exercise: "Peso muerto trap bar desde suelo", pattern: "Traccion tren inferior", sets: "4", reps: "3-5", rir: "2", rest: "2-3 min" },
      { exercise: "Push press", pattern: "Empuje tren superior", sets: "4", reps: "3-5", rir: "2-3", rest: "2 min" },
      { exercise: "Dominada", pattern: "Traccion tren superior", sets: "4", reps: "4-6", rir: "2", rest: "2 min" }
    ]
  }
];

const routineGoals = ["Salud", "Hipertrofia", "Rendimiento", "Readaptacion"] as const;
const routineProfiles = ["Persona mayor", "Principiante", "Intermedio", "Avanzado"] as const;

function recommendTrainingDistribution(availability: TrainingAvailability) {
  const { consecutiveDays, daysPerWeek } = availability;

  if (daysPerWeek === 1) {
    return {
      name: "Full body",
      reason: "Con un solo dia semanal conviene tocar los patrones principales en una sesion.",
      templateType: "Full body"
    };
  }

  if (daysPerWeek === 2 && consecutiveDays) {
    return {
      name: "Torso-pierna",
      reason: "Si los dos dias son seguidos, separar tren inferior y superior reduce solapamiento de fatiga.",
      templateType: "Torso-pierna"
    };
  }

  if (daysPerWeek === 2) {
    return {
      name: "Full body A/B",
      reason: "Con dos dias alternos puede repetirse full body variando enfasis e intensidad.",
      templateType: "Full body"
    };
  }

  if (daysPerWeek === 3) {
    return {
      name: consecutiveDays ? "Empuje-traccion-pierna" : "Full body ondulante",
      reason: consecutiveDays
        ? "Tres dias seguidos encajan mejor separando patrones para controlar fatiga local."
        : "Tres dias alternos permiten repetir patrones con cambios de carga.",
      templateType: consecutiveDays ? "Empuje-traccion-pierna" : "Full body"
    };
  }

  return {
    name: "Torso-pierna / enfasis por patrones",
    reason: "Con mas frecuencia semanal se puede distribuir por patrones y controlar mejor volumen por grupo muscular.",
    templateType: "Torso-pierna"
  };
}

function RoutinesView({ clients, trainingAvailability }: { clients: CoachClient[]; trainingAvailability: TrainingAvailability }) {
  const [selectedGoal, setSelectedGoal] = useState<RoutineTemplate["goal"]>("Salud");
  const [selectedProfile, setSelectedProfile] = useState<RoutineTemplate["profile"]>("Persona mayor");
  const recommendedDistribution = recommendTrainingDistribution(trainingAvailability);
  const profileGoalTemplates = routineTemplates.filter(
    (template) => template.goal === selectedGoal && template.profile === selectedProfile
  );
  const distributionTemplates = profileGoalTemplates.filter(
    (template) => template.type === recommendedDistribution.templateType
  );
  const availableTemplates = distributionTemplates.length > 0
    ? distributionTemplates
    : profileGoalTemplates.length > 0
      ? profileGoalTemplates
    : routineTemplates.filter((template) => template.goal === selectedGoal);
  const [selectedTemplateId, setSelectedTemplateId] = useState(routineTemplates[0].id);
  const selectedTemplate =
    availableTemplates.find((template) => template.id === selectedTemplateId) ??
    availableTemplates[0] ??
    routineTemplates[0];
  const [routineExercises, setRoutineExercises] = useState(selectedTemplate.exercises);

  useEffect(() => {
    setSelectedTemplateId(selectedTemplate.id);
    setRoutineExercises(selectedTemplate.exercises);
  }, [
    selectedGoal,
    selectedProfile,
    selectedTemplate,
    trainingAvailability.consecutiveDays,
    trainingAvailability.daysPerWeek
  ]);

  function applyTemplate(template: RoutineTemplate) {
    setSelectedTemplateId(template.id);
    setRoutineExercises(template.exercises);
  }

  function updateRoutineExercise(index: number, exercise: string) {
    setRoutineExercises((current) =>
      current.map((item, itemIndex) => itemIndex === index ? { ...item, exercise } : item)
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Biblioteca de plantillas</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Objetivo
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSelectedGoal(event.target.value as RoutineTemplate["goal"])}
              value={selectedGoal}
            >
              {routineGoals.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Perfil
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSelectedProfile(event.target.value as RoutineTemplate["profile"])}
              value={selectedProfile}
            >
              {routineProfiles.map((profile) => (
                <option key={profile}>{profile}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-md border border-line bg-sky p-4">
          <p className="text-sm font-semibold text-steel">Distribucion recomendada</p>
          <p className="mt-1 text-lg font-semibold text-ink">{recommendedDistribution.name}</p>
          <p className="mt-2 text-sm text-ink/65">{recommendedDistribution.reason}</p>
        </div>

        <div className="mt-5 grid gap-3">
          {availableTemplates.map((template) => (
            <button
              className={`rounded-md border p-4 text-left transition ${
                selectedTemplate.id === template.id
                  ? "border-moss bg-mint"
                  : "border-line bg-panel/35 hover:bg-panel"
              }`}
              key={template.id}
              onClick={() => applyTemplate(template)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{template.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{template.type} - {template.profile}</p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">
                  Usar
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Editor de rutina</h2>
            <p className="mt-1 text-sm text-ink/55">{selectedTemplate.name}</p>
          </div>
          <select className="h-10 rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss">
            {clients.map((client) => (
              <option key={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[960px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-2">Patrón</th>
                <th className="px-3 py-2">Ejercicio</th>
                <th className="px-3 py-2">Series</th>
                <th className="px-3 py-2">Reps</th>
                <th className="px-3 py-2">RIR</th>
                <th className="px-3 py-2">Descanso</th>
                <th className="px-3 py-2">Cambiar por progresion</th>
              </tr>
            </thead>
            <tbody>
              {routineExercises.map((exercise, index) => {
                const alternatives = getRoutineExerciseAlternatives(exercise.pattern);
                const selectableAlternatives =
                  alternatives.length > 0 ? alternatives : [exercise.exercise];

                return (
                  <tr className="bg-panel/45" key={`${exercise.pattern}-${index}`}>
                    <td className="rounded-l-md px-3 py-3 font-medium text-moss">{exercise.pattern}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{exercise.exercise}</td>
                    <td className="px-3 py-3 text-ink/70">{exercise.sets}</td>
                    <td className="px-3 py-3 text-ink/70">{exercise.reps}</td>
                    <td className="px-3 py-3 text-ink/70">{exercise.rir}</td>
                    <td className="px-3 py-3 text-ink/70">{exercise.rest}</td>
                    <td className="rounded-r-md px-3 py-3">
                      <select
                        className="h-10 w-full rounded-md border border-line bg-white px-2 text-ink outline-none focus:border-moss"
                        onChange={(event) => updateRoutineExercise(index, event.target.value)}
                        value={exercise.exercise}
                      >
                        {selectableAlternatives.map((alternative) => (
                          <option key={alternative}>{alternative}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white" type="button">
            <Send size={17} />
            Enviar al calendario
          </button>
          <button className="h-11 rounded-md border border-line px-4 text-sm font-semibold text-ink/70" type="button">
            Guardar como plantilla propia
          </button>
        </div>
      </section>
    </div>
  );
}

function MessagesView({ client, clients }: { client?: CoachClient | null; clients: CoachClient[] }) {
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0].id);
  const [selectedMessageClient, setSelectedMessageClient] = useState(client?.name ?? "Todos");
  const clientThreads = client
    ? messageThreads.filter((thread) => thread.athlete === client.name)
    : selectedMessageClient === "Todos"
      ? messageThreads
      : messageThreads.filter((thread) => thread.athlete === selectedMessageClient);
  const fallbackClient =
    client ?? clients.find((listedClient) => listedClient.name === selectedMessageClient) ?? null;
  const visibleThreads = clientThreads.length > 0 ? clientThreads : fallbackClient ? [
    {
      athlete: fallbackClient.name,
      id: `client-${fallbackClient.id}`,
      lastMessage: fallbackClient.coachNotes,
      messages: [
        { author: "coach", text: fallbackClient.coachNotes, time: "Nota inicial" },
        { author: "athlete", text: "Pendiente de nueva conversacion.", time: "Sistema" }
      ],
      status: fallbackClient.status,
      unread: 0
    }
  ] : messageThreads;
  const selectedThread =
    visibleThreads.find((thread) => thread.id === selectedThreadId) ?? visibleThreads[0];

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Conversaciones</h2>
          <span className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
            {visibleThreads.reduce((total, thread) => total + thread.unread, 0)} sin leer
          </span>
        </div>
        {!client ? (
          <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
            Filtrar por cliente
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => {
                setSelectedMessageClient(event.target.value);
                setSelectedThreadId(messageThreads[0].id);
              }}
              value={selectedMessageClient}
            >
              <option>Todos</option>
              {clients.map((listedClient) => (
                <option key={listedClient.id}>{listedClient.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mt-4 space-y-2">
          {visibleThreads.map((thread) => (
            <button
              className={`w-full rounded-md border p-3 text-left transition ${
                selectedThreadId === thread.id
                  ? "border-ink bg-panel"
                  : "border-line bg-panel/35 hover:bg-panel"
              }`}
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{thread.athlete}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/60">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <span className="grid size-6 place-items-center rounded-full bg-clay text-xs font-semibold text-white">
                    {thread.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">{selectedThread.athlete}</h2>
            <p className="text-sm text-ink/50">{selectedThread.status}</p>
          </div>
          <button className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white" type="button">
            Nueva nota
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {selectedThread.messages.map((message) => (
            <div
              className={`flex ${message.author === "coach" ? "justify-end" : "justify-start"}`}
              key={`${message.time}-${message.text}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-4 py-3 text-sm ${
                  message.author === "coach"
                    ? "bg-ink text-white"
                    : "bg-panel text-ink"
                }`}
              >
                <p>{message.text}</p>
                <p className={`mt-2 text-xs ${message.author === "coach" ? "text-white/50" : "text-ink/45"}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <input
            className="h-11 flex-1 rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Escribe un mensaje"
            type="text"
          />
          <button className="rounded-md bg-ink px-4 text-sm font-medium text-white" type="button">
            Enviar
          </button>
        </div>
      </section>
    </div>
  );
}

type ChartField = "srpe" | "monotony" | "strain" | "acwr" | "hooper";

function MetricChart({
  chartType,
  field,
  suffix = "",
  title
}: {
  chartType: "bar" | "line" | "points";
  field: ChartField;
  suffix?: string;
  title: string;
}) {
  const values = weeklyLoadSeries.map((point) => Number(point[field]));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const points = weeklyLoadSeries
    .map((point, index) => {
      const x = 28 + index * 54;
      const y = 120 - ((Number(point[field]) - minValue) / range) * 82;
      return `${x},${y}`;
    })
    .join(" ");
  const lastValue = values[values.length - 1];

  return (
    <article className="rounded-md border border-line bg-panel/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink/55">
            Actual: {lastValue}
            {suffix}
          </p>
        </div>
      </div>
      <svg className="mt-4 h-40 w-full" preserveAspectRatio="none" viewBox="0 0 330 145">
        {chartType === "bar" ? (
          weeklyLoadSeries.map((point, index) => {
            const value = Number(point[field]);
            const height = 18 + ((value - minValue) / range) * 86;
            const x = 16 + index * 54;
            const y = 126 - height;
            return (
              <rect
                fill="#51665a"
                height={height}
                key={`${field}-${point.week}-bar`}
                rx="4"
                width="24"
                x={x}
                y={y}
              />
            );
          })
        ) : chartType === "line" ? (
          <polyline
            fill="none"
            points={points}
            stroke="#51665a"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : null}
        {weeklyLoadSeries.map((point, index) => {
          const x = 28 + index * 54;
          const y = 120 - ((Number(point[field]) - minValue) / range) * 82;
          return (
            <circle
              cx={x}
              cy={y}
              fill={chartType === "points" ? "#b66a4f" : "#151515"}
              key={`${field}-${point.week}`}
              r={chartType === "points" ? "7" : "4"}
            />
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-6 gap-1 text-center text-xs text-ink/50">
        {weeklyLoadSeries.map((point) => (
          <span key={`${field}-${point.week}-label`}>{point.week}</span>
        ))}
      </div>
    </article>
  );
}

function decisionToneClass(status: string) {
  switch (status) {
    case "Rojo":
      return "border-red-200 bg-red-50 text-red-800";
    case "Naranja":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "Amarillo":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
}

function AssessmentsView({ client }: { client?: CoachClient | null }) {
  const [selectedGoal, setSelectedGoal] = useState<AssessmentGoal>("Salud general");
  const [selectedTests, setSelectedTests] = useState<Record<string, string>>({});
  const posturalCategory = "Postural";
  const [activeAssessmentCategory, setActiveAssessmentCategory] = useState(
    assessmentCategories[0].category
  );
  const isPosturalAssessment = activeAssessmentCategory === posturalCategory;
  const activeCategory = assessmentCategories.find(
    (category) => category.category === activeAssessmentCategory
  );
  const recommendedTests = (activeCategory?.tests ?? []).filter((test) =>
    test.goals.includes(selectedGoal)
  );
  const fallbackTests =
    recommendedTests.length > 0 ? recommendedTests : activeCategory?.tests ?? [];
  const selectedTestName =
    activeCategory && fallbackTests.length > 0
      ? selectedTests[activeCategory.category] ?? fallbackTests[0].name
      : "";
  const selectedTest =
    fallbackTests.find((test) => test.name === selectedTestName) ?? fallbackTests[0];
  const unit = selectedTest ? assessmentUnitForTest(selectedTest.name) : "texto";

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {client ? (
        <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Valoraciones de {client.name}</h2>
              <p className="mt-1 text-sm text-ink/55">Historial asociado al cliente activo.</p>
            </div>
            <button className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="button">
              Nueva valoracion
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {client.assessments.map((assessment) => (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={`${assessment.date}-${assessment.name}`}>
                <p className="text-xs font-semibold uppercase text-moss">{assessment.type}</p>
                <p className="mt-2 font-semibold text-ink">{assessment.name}</p>
                <p className="mt-1 text-sm text-ink/65">{assessment.result}</p>
                <p className="mt-2 text-xs text-ink/45">{assessment.date}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Objetivo de la valoracion</h2>

        <label className="mt-5 block space-y-2 text-sm font-medium text-ink/75">
          Objetivo
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setSelectedGoal(event.target.value as AssessmentGoal)}
            value={selectedGoal}
          >
            {assessmentGoals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </label>

        <div className="mt-5 rounded-md border border-line bg-panel/45 p-4">
          <h3 className="font-semibold text-ink">Criterio de recomendacion</h3>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Tests recomendados</h2>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
            {selectedGoal}
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-md border border-line bg-panel/45 p-1">
            {[...assessmentCategories.map((category) => category.category), posturalCategory].map((category) => (
              <button
                className={`rounded px-3 py-2 text-sm font-semibold transition ${
                  activeAssessmentCategory === category
                    ? "bg-ink text-white"
                    : "text-ink/65 hover:bg-white"
                }`}
                key={category}
                onClick={() => setActiveAssessmentCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isPosturalAssessment ? (
          <article className="mt-4 rounded-md border border-line bg-panel/35 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <h3 className="font-semibold text-ink">Valoracion postural y disquinesias</h3>
              <label className="space-y-2 text-sm font-medium text-ink/75 lg:w-52">
                Dia de valoracion
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  type="date"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {posturalAssessmentFields.map((field) => (
                <label className="space-y-2 text-sm font-medium text-ink/75" key={field.label}>
                  {field.label}
                  <textarea
                    className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>
          </article>
        ) : selectedTest && activeCategory ? (
          <article className="mt-4 rounded-md border border-line bg-panel/35 p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <h3 className="font-semibold text-ink">{activeCategory.category}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {fallbackTests.map((test) => (
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-ink/65" key={test.name}>
                      {test.name}
                    </span>
                  ))}
                </div>
                <label className="mt-3 block space-y-2 text-sm font-medium text-ink/75">
                  Elegir test
                  <select
                    className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) =>
                      setSelectedTests((current) => ({
                        ...current,
                        [activeCategory.category]: event.target.value
                      }))
                    }
                    value={selectedTest.name}
                  >
                    {fallbackTests.map((test) => (
                      <option key={test.name}>{test.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-sm font-semibold text-ink">{selectedTest.name}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Dia de valoracion
                    <input
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      type="date"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Resultado ({unit})
                    <input
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      placeholder={`Introduce ${unit}`}
                      type={unit === "texto" ? "text" : "number"}
                    />
                  </label>
                </div>
                <label className="mt-3 block space-y-2 text-sm font-medium text-ink/75">
                  Observaciones
                  <textarea
                    className="min-h-20 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
                    placeholder="Notas breves de la prueba"
                  />
                </label>
              </div>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}

function assessmentUnitForTest(testName: string) {
  const lower = testName.toLowerCase();
  if (lower.includes("1rm") || lower.includes("handgrip")) return "kg";
  if (lower.includes("perimetros") || lower.includes("cintura") || lower.includes("pliegues")) return "cm/mm";
  if (lower.includes("5sts") || lower.includes("timed") || lower.includes("rockport")) return "segundos";
  if (lower.includes("vam") || lower.includes("navette")) return "km/h";
  if (lower.includes("css")) return "seg/100m";
  if (lower.includes("cmj")) return "cm";
  if (lower.includes("sf-") || lower.includes("eq-") || lower.includes("psqi") || lower.includes("poms") || lower.includes("dass") || lower.includes("pss") || lower.includes("restq")) return "puntos";
  return "texto";
}

type GlobalCalendarEvent = {
  athlete: string;
  date: string;
  id: string;
  title: string;
  type: "Competicion" | "Test" | "Pico de forma" | "Control / seguimiento" | "Sesion";
};

const calendarShortMonths: Record<string, string> = {
  Abr: "04",
  Ago: "08",
  Dic: "12",
  Ene: "01",
  Feb: "02",
  Jul: "07",
  Jun: "06",
  Mar: "03",
  May: "05",
  Nov: "11",
  Oct: "10",
  Sep: "09"
};

const calendarMonthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

function getCalendarEventTone(type: GlobalCalendarEvent["type"]) {
  switch (type) {
    case "Competicion":
      return "border-red-200 bg-red-50 text-red-800";
    case "Test":
      return "border-steel/20 bg-sky text-ink";
    case "Pico de forma":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "Control / seguimiento":
      return "border-moss/20 bg-mint text-moss";
    case "Sesion":
      return "border-steel/20 bg-sky text-steel";
    default:
      return "border-line bg-white text-ink/70";
  }
}

function inferCalendarEventType(label: string): GlobalCalendarEvent["type"] {
  const lower = label.toLowerCase();
  if (lower.includes("compet") || lower.includes("10k") || lower.includes("carrera")) return "Competicion";
  if (lower.includes("test")) return "Test";
  if (lower.includes("pico")) return "Pico de forma";
  return "Control / seguimiento";
}

function parseDateFromLabel(label: string) {
  const match = label.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseCalendarSessionDate(label: string, year: number) {
  const [day, monthLabel] = label.split(" ");
  const month = calendarShortMonths[monthLabel];
  if (!day || !month) return null;

  return `${year}-${month}-${day.padStart(2, "0")}`;
}

function buildGlobalCalendarEvents(): GlobalCalendarEvent[] {
  const currentYear = new Date().getFullYear();
  const nextEvents = coachClients.flatMap((listedClient) => {
    const date = parseDateFromLabel(listedClient.nextEvent);
    if (!date) return [];

    const title = listedClient.nextEvent.split(" - ")[0] || listedClient.nextEvent;
    return [{
      athlete: listedClient.name,
      date,
      id: `${listedClient.id}-next-event`,
      title,
      type: inferCalendarEventType(listedClient.nextEvent)
    }];
  });

  const assessments = coachClients.flatMap((listedClient) =>
    listedClient.assessments.map((assessment) => ({
      athlete: listedClient.name,
      date: assessment.date,
      id: `${listedClient.id}-${assessment.date}-${assessment.name}`,
      title: assessment.name,
      type: assessment.type === "Fuerza" || assessment.type === "Resistencia" ? "Test" : "Control / seguimiento" as GlobalCalendarEvent["type"]
    }))
  );

  const plannedSessions = calendarSessions.flatMap((session) => {
    const date = parseCalendarSessionDate(session.date, currentYear);
    if (!date) return [];

    return [{
      athlete: session.athlete,
      date,
      id: `${session.athlete}-${session.date}-${session.time}-${session.title}`,
      title: session.title,
      type: "Sesion" as GlobalCalendarEvent["type"]
    }];
  });

  return [...nextEvents, ...assessments, ...plannedSessions];
}

function CalendarView({ client, clients }: { client?: CoachClient | null; clients: CoachClient[] }) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("Semana");
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);
  const [calendarClientFilter, setCalendarClientFilter] = useState("Todos");
  const [calendarDateFrom, setCalendarDateFrom] = useState("");
  const [calendarDateTo, setCalendarDateTo] = useState("");
  const [calendarEventTypeFilter, setCalendarEventTypeFilter] = useState<"Todos" | GlobalCalendarEvent["type"]>("Todos");
  const weekDays = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const weekDates = ["22", "23", "24", "25", "26", "27", "28"];
  const monthDays = Array.from({ length: 35 }, (_, index) => index + 1);
  const visibleCalendarSessions = calendarClientFilter === "Todos"
    ? calendarSessions
    : calendarSessions.filter((session) => session.athlete === calendarClientFilter);
  const todaySessions = visibleCalendarSessions.filter((session) => session.day === "Lunes");
  const globalEvents = buildGlobalCalendarEvents();
  const filteredGlobalEvents = calendarClientFilter === "Todos"
    ? globalEvents
    : globalEvents.filter((event) => event.athlete === calendarClientFilter);
  const visibleGlobalEvents = filteredGlobalEvents.filter((event) => {
    const matchesType = calendarEventTypeFilter === "Todos" || event.type === calendarEventTypeFilter;
    const matchesFrom = !calendarDateFrom || event.date >= calendarDateFrom;
    const matchesTo = !calendarDateTo || event.date <= calendarDateTo;
    return matchesType && matchesFrom && matchesTo;
  });

  return (
    <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {client ? "Calendario del cliente" : "Mapa de sesiones planificadas"}
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            {client ? "Sesiones, valoraciones y eventos del deportista seleccionado." : "Vista global de sesiones, tests y eventos de todos los deportistas."}
          </p>
        </div>
        <div className="grid grid-cols-3 rounded-md border border-line bg-panel/45 p-1">
          {(["Dia", "Semana", "Mes"] as CalendarViewMode[]).map((mode) => (
            <button
              className={`rounded px-4 py-2 text-sm font-medium ${
                viewMode === mode ? "bg-ink text-white" : "text-ink/65"
              }`}
              key={mode}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {client ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ClientInfoCard label="Evento objetivo" value={client.nextEvent} />
          <ClientInfoCard label="Ultima sesion" value={client.lastActivity} />
          <ClientInfoCard label="Valoracion reciente" value={client.assessments[0]?.name ?? "Sin valorar"} />
        </div>
      ) : null}

      {!client ? (
        <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <p className="text-sm font-semibold text-ink">Filtrar</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
          <label className="block space-y-2 text-sm font-medium text-ink/75">
            Cliente
            <select
              className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setCalendarClientFilter(event.target.value)}
              value={calendarClientFilter}
            >
              <option>Todos</option>
              {clients.map((listedClient) => (
                <option key={listedClient.id}>{listedClient.name}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-ink/75">
            Tipo de evento
            <select
              className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setCalendarEventTypeFilter(event.target.value as "Todos" | GlobalCalendarEvent["type"])}
              value={calendarEventTypeFilter}
            >
              <option>Todos</option>
              <option>Sesion</option>
              <option>Competicion</option>
              <option>Test</option>
              <option>Pico de forma</option>
              <option>Control / seguimiento</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-ink/75">
            Desde
            <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setCalendarDateFrom(event.target.value)} type="date" value={calendarDateFrom} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-ink/75">
            Hasta
            <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setCalendarDateTo(event.target.value)} type="date" value={calendarDateTo} />
          </label>
          </div>
        </div>
      ) : null}

      {viewMode === "Dia" ? (
        <div className="mt-6 grid gap-3">
          {client ? client.sessionRecords.map((session) => (
            <article className="rounded-md border border-line bg-panel/35 p-3" key={`${session.date}-${session.summary}`}>
              <p className="text-xs font-semibold text-clay">{session.date}</p>
              <h4 className="mt-1 font-semibold text-ink">{session.type}</h4>
              <p className="mt-1 text-sm text-ink/60">{session.summary}</p>
              <p className="mt-2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">
                {session.duration} min - RPE {session.rpe} - {calculateSessionLoad(session.rpe, session.duration)} UA
              </p>
            </article>
          )) : todaySessions.map((session) => (
            <CalendarSessionCard key={`${session.day}-${session.time}-${session.athlete}`} session={session} />
          ))}
        </div>
      ) : viewMode === "Semana" ? (
        <div className="mt-6">
          <div className="grid gap-2 rounded-md border border-line bg-line p-2 md:grid-cols-7">
          {weekDays.map((day, index) => {
            const daySessions = visibleCalendarSessions.filter((session) => session.day === day);

            return (
              <div className="min-h-44 rounded-md bg-panel/35 p-2 md:min-h-72 md:p-3" key={day}>
                <div className="border-b border-line pb-3">
                  <p className="text-xs font-semibold text-ink md:text-sm">{day}</p>
                  <p className="mt-1 text-xl font-semibold text-moss md:text-2xl">{weekDates[index]}</p>
                </div>
                <div className="mt-3 space-y-2">
                  {daySessions.length > 0 ? (
                    daySessions.map((session) => (
                      <CalendarSessionCard
                        compact
                        key={`${session.day}-${session.time}-${session.athlete}`}
                        session={session}
                      />
                    ))
                  ) : (
                    <p className="rounded-md bg-white px-3 py-4 text-center text-xs text-ink/45">
                      Sin sesiones
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        client ? (
          <div className="mt-6 overflow-hidden rounded-md border border-line">
            <div className="grid grid-cols-7 border-b border-line bg-ink text-center text-xs font-semibold uppercase tracking-wide text-white">
              {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                <div className="border-r border-white/15 p-2 last:border-r-0" key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const sessions = calendarSessions.filter((session) => {
                  const dateNumber = Number(session.date.split(" ")[0]);
                  return dateNumber === day;
                });

                return (
                  <div className="min-h-28 border-r border-t border-line bg-panel/25 p-2 last:border-r-0" key={day}>
                    <p className="text-sm font-semibold text-ink/65">{day}</p>
                    <div className="mt-2 space-y-1">
                      {sessions.map((session) => (
                        <div className="rounded bg-white px-2 py-1 text-xs font-medium text-moss" key={`${day}-${session.time}`}>
                          {session.time} {session.type}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <GlobalMonthCalendar
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            events={visibleGlobalEvents}
            selectedMonthIndex={selectedMonthIndex}
            setSelectedMonthIndex={setSelectedMonthIndex}
          />
        )
      )}
    </section>
  );
}

function GlobalMonthCalendar({
  currentMonthIndex,
  currentYear,
  events,
  selectedMonthIndex,
  setSelectedMonthIndex
}: {
  currentMonthIndex: number;
  currentYear: number;
  events: GlobalCalendarEvent[];
  selectedMonthIndex: number;
  setSelectedMonthIndex: (monthIndex: number) => void;
}) {
  const daysInMonth = new Date(currentYear, selectedMonthIndex + 1, 0).getDate();
  const firstDay = new Date(currentYear, selectedMonthIndex, 1).getDay();
  const leadingEmptyDays = firstDay === 0 ? 6 : firstDay - 1;
  const monthEvents = events.filter((event) => {
    const eventDate = new Date(`${event.date}T00:00:00`);
    return eventDate.getFullYear() === currentYear && eventDate.getMonth() === selectedMonthIndex;
  });

  return (
    <section className="mt-6 overflow-hidden rounded-md border border-line bg-panel/25">
      <div className="flex flex-col gap-3 border-b border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">{calendarMonthNames[selectedMonthIndex]} {currentYear}</h3>
          <p className="mt-1 text-sm text-ink/55">{monthEvents.length} fechas conectadas</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 disabled:opacity-40"
            disabled={selectedMonthIndex <= currentMonthIndex}
            onClick={() => setSelectedMonthIndex(Math.max(currentMonthIndex, selectedMonthIndex - 1))}
            type="button"
          >
            Anterior
          </button>
          <button
            className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={selectedMonthIndex >= 11}
            onClick={() => setSelectedMonthIndex(Math.min(11, selectedMonthIndex + 1))}
            type="button"
          >
            Siguiente
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-ink text-center text-[11px] font-semibold uppercase text-white">
        {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
          <div className="p-2" key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: leadingEmptyDays }).map((_, index) => (
          <div className="min-h-20 border-r border-t border-line bg-white/35 p-1" key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const isoDate = `${currentYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = events.filter((event) => event.date === isoDate);

          return (
            <div className="min-h-20 border-r border-t border-line bg-white/65 p-1.5" key={day}>
              <p className="text-xs font-semibold text-ink/60">{day}</p>
              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <div className={`rounded border px-1.5 py-1 text-[11px] font-semibold leading-tight ${getCalendarEventTone(event.type)}`} key={event.id}>
                    <span className="block truncate">{event.title}</span>
                    <span className="block truncate font-medium opacity-75">{event.athlete}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type CalendarSessionCardProps = {
  compact?: boolean;
  session: (typeof calendarSessions)[number];
};

function CalendarSessionCard({ compact = false, session }: CalendarSessionCardProps) {
  const statusClass = session.status === "Alta carga"
    ? "bg-red-50 text-red-700"
    : session.status === "Pendiente wellness"
      ? "bg-amber-50 text-amber-700"
      : "bg-mint text-moss";

  return (
    <article className="rounded-md border border-line bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-clay">{session.time} - {session.date}</p>
          <h4 className={`mt-1 font-semibold text-ink ${compact ? "text-sm" : ""}`}>
            {session.title}
          </h4>
          {!compact && (
            <p className="mt-1 text-sm text-ink/60">{session.athlete}</p>
          )}
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass}`}>
          {session.type}
        </span>
      </div>
      <p className={`mt-3 rounded-md px-2 py-1 text-xs font-medium ${statusClass}`}>
        {session.status}
      </p>
    </article>
  );
}

function FatigueMapView() {
  const calculatedFatigue = calculateMuscleFatigue();
  const frontalMuscles = calculatedFatigue.filter((item) => item.side === "Frontal");
  const posteriorMuscles = calculatedFatigue.filter((item) => item.side === "Posterior");
  const highPriority = calculatedFatigue.filter((item) => ["Rojo", "Naranja"].includes(item.status));
  const [bodySex, setBodySex] = useState<"Hombre" | "Mujer">("Hombre");

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Mapa corporal</h2>
          </div>
          <div className="grid grid-cols-2 rounded-md border border-line bg-panel/45 p-1">
            {(["Hombre", "Mujer"] as const).map((sex) => (
              <button
                className={`rounded px-3 py-2 text-sm font-semibold ${
                  bodySex === sex ? "bg-ink text-white" : "text-ink/65"
                }`}
                key={sex}
                onClick={() => setBodySex(sex)}
                type="button"
              >
                {sex}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <BodySilhouette sex={bodySex} title="Frontal" muscles={frontalMuscles} />
          <BodySilhouette sex={bodySex} title="Posterior" muscles={posteriorMuscles} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-4">
          {fatigueLegend.map((item) => (
            <div className="rounded-md border border-line bg-panel/35 p-3" key={item.status}>
              <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${fatigueColorClass(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-md border border-line bg-ink p-5 text-white shadow-soft">
        <h2 className="text-lg font-semibold">Decisiones rapidas</h2>
        <div className="mt-5 space-y-3">
          {highPriority.map((item) => (
            <article className="rounded-md bg-white/10 p-4" key={item.muscle}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{item.muscle}</h3>
                  <p className="mt-1 text-sm text-white/60">{item.lastStimulus}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${fatigueColorClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/80">{item.recommendation}</p>
              <p className="mt-2 text-xs text-white/50">{item.supportingData}</p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

type FatigueMuscle = ReturnType<typeof calculateMuscleFatigue>[number];

function BodySilhouette({
  muscles,
  sex,
  title
}: {
  muscles: FatigueMuscle[];
  sex: "Hombre" | "Mujer";
  title: "Frontal" | "Posterior";
}) {
  return (
    <div className="rounded-md border border-line bg-panel/35 p-4">
      <h3 className="text-center font-semibold text-ink">{title}</h3>
      <svg className="mx-auto mt-4 h-[430px] w-full max-w-xs" viewBox="0 0 240 430" role="img" aria-label={`${sex} ${title}`}>
        <g fill="#ffffff" stroke="#8d99a6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <HumanOutline sex={sex} title={title} />
        </g>
        {muscles.map((item) => (
          <FatigueMuscleShape item={item} key={item.muscle} side={title} />
        ))}
      </svg>
    </div>
  );
}

function HumanOutline({ sex, title }: { sex: "Hombre" | "Mujer"; title: "Frontal" | "Posterior" }) {
  const isWoman = sex === "Mujer";
  const torsoPath = isWoman
    ? "M82 102 C78 136 76 168 88 202 C97 220 143 220 152 202 C164 168 162 136 158 102 C148 92 92 92 82 102 Z"
    : "M76 102 C72 136 78 178 90 204 C102 214 138 214 150 204 C162 178 168 136 164 102 C150 92 90 92 76 102 Z";
  const hipPath = isWoman
    ? "M88 204 C94 234 146 234 152 204 C142 218 98 218 88 204 Z"
    : "M92 204 C100 222 140 222 148 204 C137 214 103 214 92 204 Z";

  return (
    <>
      <path d={title === "Frontal" ? "M94 38 C94 20 146 20 146 38 C148 66 138 84 120 84 C102 84 92 66 94 38 Z" : "M94 38 C94 18 146 18 146 38 C148 68 138 84 120 84 C102 84 92 68 94 38 Z"} />
      <path d={torsoPath} />
      <path d={hipPath} />
      <path d="M78 112 C50 124 43 172 39 222 C37 244 53 246 58 224 C64 177 70 148 88 130" />
      <path d="M162 112 C190 124 197 172 201 222 C203 244 187 246 182 224 C176 177 170 148 152 130" />
      <path d="M96 218 C88 260 86 318 91 385 C92 410 112 410 113 384 C115 322 116 272 120 224" />
      <path d="M144 218 C152 260 154 318 149 385 C148 410 128 410 127 384 C125 322 124 272 120 224" />
      <path d="M102 388 C92 402 88 416 112 416" />
      <path d="M138 388 C148 402 152 416 128 416" />
      {title === "Frontal" ? (
        <>
          <path d="M101 126 C108 122 114 122 120 126 C126 122 132 122 139 126" fill="none" />
          <path d="M116 165 L124 165" fill="none" />
        </>
      ) : (
        <>
          <path d="M96 112 C108 128 132 128 144 112" fill="none" />
          <path d="M104 132 C108 160 108 180 104 198" fill="none" />
          <path d="M136 132 C132 160 132 180 136 198" fill="none" />
        </>
      )}
      {isWoman && title === "Frontal" && <path d="M91 148 C105 160 135 160 149 148" fill="none" />}
      {isWoman && title === "Posterior" && <path d="M93 156 C106 166 134 166 147 156" fill="none" />}
    </>
  );
}

function FatigueMuscleShape({ item, side }: { item: FatigueMuscle; side: "Frontal" | "Posterior" }) {
  const shape = muscleShape(item.muscle, side);
  if (!shape) return null;

  return (
    <g>
      <title>{`${item.muscle}: ${item.fatigueScore}/100 - ${item.supportingData}`}</title>
      <ellipse
        cx={shape.cx}
        cy={shape.cy}
        fill={fatigueSvgColor(item.status)}
        opacity="0.82"
        rx={shape.rx}
        ry={shape.ry}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      {shape.mirror && (
        <ellipse
          cx={240 - shape.cx}
          cy={shape.cy}
          fill={fatigueSvgColor(item.status)}
          opacity="0.82"
          rx={shape.rx}
          ry={shape.ry}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      )}
    </g>
  );
}

function muscleShape(muscle: string, side: "Frontal" | "Posterior") {
  const frontal: Record<string, { cx: number; cy: number; mirror?: boolean; rx: number; ry: number }> = {
    Pectoral: { cx: 107, cy: 130, mirror: true, rx: 14, ry: 11 },
    Deltoides: { cx: 75, cy: 126, mirror: true, rx: 10, ry: 16 },
    Cuadriceps: { cx: 103, cy: 274, mirror: true, rx: 13, ry: 38 }
  };
  const posterior: Record<string, { cx: number; cy: number; mirror?: boolean; rx: number; ry: number }> = {
    Dorsal: { cx: 104, cy: 145, mirror: true, rx: 16, ry: 33 },
    Gluteo: { cx: 104, cy: 214, mirror: true, rx: 16, ry: 15 },
    Isquios: { cx: 104, cy: 286, mirror: true, rx: 12, ry: 36 },
    Gemelo: { cx: 103, cy: 358, mirror: true, rx: 10, ry: 28 }
  };

  return side === "Frontal" ? frontal[muscle] : posterior[muscle];
}

function fatigueSvgColor(status: string) {
  switch (status) {
    case "Rojo":
      return "#ef4444";
    case "Naranja":
      return "#f97316";
    case "Amarillo":
      return "#f59e0b";
    default:
      return "#22c55e";
  }
}

function fatigueColorClass(status: string) {
  switch (status) {
    case "Rojo":
      return "border-red-200 bg-red-50 text-red-800";
    case "Naranja":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "Amarillo":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
}

function calculateMuscleFatigue() {
  const weeklyMuscleSets = calculateWeeklyMuscleSets(
    getMockWeeklyTrainingSessions(),
    exerciseLibrary
  );
  const grouped = Object.entries(weeklyMuscleSets).reduce<
    Record<string, { muscle: string; rawSets: number; side: string }>
  >((acc, [muscleKey, weightedSets]) => {
    const group = getFatigueDisplayGroup(muscleKey);
    if (!group) return acc;

    const current = acc[group.muscle] ?? {
      muscle: group.muscle,
      rawSets: 0,
      side: group.side
    };

    current.rawSets += weightedSets;
    acc[group.muscle] = current;
    return acc;
  }, {});

  return Object.values(grouped).map((item) => {
    const fatigueScore = Math.min(100, Math.round(item.rawSets * 10));
    const status =
      fatigueScore >= 76
        ? "Rojo"
        : fatigueScore >= 51
          ? "Naranja"
          : fatigueScore >= 26
            ? "Amarillo"
            : "Verde";
    const recommendation =
      status === "Rojo"
        ? `Evitar carga intensa de ${item.muscle.toLowerCase()} hoy.`
        : status === "Naranja"
          ? `Usar tecnica, movilidad o volumen moderado para ${item.muscle.toLowerCase()}.`
          : status === "Amarillo"
            ? `Permite trabajo moderado si no hay molestias.`
            : "Disponible para carga normal.";

    return {
      fatigueScore,
      lastStimulus: "Semana actual",
      muscle: item.muscle,
      recommendation,
      side: item.side,
      status,
      supportingData: `${item.rawSets.toFixed(1)} series efectivas ponderadas`
    };
  });
}

function getFatigueDisplayGroup(muscleKey: string) {
  const groups: Record<string, { muscle: string; side: string }> = {
    anteriorDelts: { muscle: "Deltoides", side: "Frontal" },
    biceps: { muscle: "Dorsal", side: "Posterior" },
    calves: { muscle: "Gemelo", side: "Posterior" },
    chest: { muscle: "Pectoral", side: "Frontal" },
    glutes: { muscle: "Gluteo", side: "Posterior" },
    hamstrings: { muscle: "Isquios", side: "Posterior" },
    lats: { muscle: "Dorsal", side: "Posterior" },
    midBack: { muscle: "Dorsal", side: "Posterior" },
    quadriceps: { muscle: "Cuadriceps", side: "Frontal" },
    rearDelts: { muscle: "Deltoides", side: "Posterior" },
    triceps: { muscle: "Pectoral", side: "Frontal" },
    upperBack: { muscle: "Dorsal", side: "Posterior" },
    upperTraps: { muscle: "Deltoides", side: "Posterior" }
  };

  return groups[muscleKey] ?? null;
}

type CoachSessionType = "Fuerza" | "Cardio" | "Mixta";
type CoachSessionPanel = "planner" | "history" | null;
type StrengthSessionBlock = "activation" | "auxiliary" | "main";
type PlannedStrengthExerciseDraft = {
  block: StrengthSessionBlock;
  exerciseId: string;
  exerciseSearch: string;
  id: string;
  load: string;
  observation: string;
  reps: string;
  rest: string;
  sets: string;
  targetRir: string;
  targetRpe: string;
};
type CoachSessionQuantifier = {
  fields: string[];
  primary: string[];
};

const coachSessionQuantifiers: Record<CoachSessionType, CoachSessionQuantifier> = {
  Cardio: {
    primary: ["sRPE", "iTRIMP", "tiempo en zona", "distancia", "ritmo/potencia"],
    fields: [
      "Duracion planificada",
      "RPE esperado",
      "FC media objetivo",
      "FC maxima estimada",
      "Tiempo Z1-Z2",
      "Tiempo Z3-Z4",
      "Distancia / metros",
      "Ritmo, potencia o VAM/CSS/CP",
      "Cadencia / brazada"
    ]
  },
  Fuerza: {
    primary: ["tonelaje", "series duras", "RPE/RIR", "volumen-carga", "velocidad"],
    fields: [
      "Ejercicio",
      "Patrón de movimiento",
      "Series",
      "Repeticiones",
      "Carga",
      "Descanso",
      "RPE/RIR",
      "Velocidad o perdida de velocidad",
      "Observaciones"
    ]
  },
  Mixta: {
    primary: ["sRPE", "volumen-carga", "tiempo de trabajo", "rounds/esfuerzos", "carga semanal"],
    fields: [
      "Bloque de fuerza",
      "Bloque metabolico",
      "Duracion total",
      "RPE esperado",
      "Rounds / esfuerzos",
      "Tiempo de trabajo",
      "Volumen-carga",
      "FC objetivo",
      "Notas de transicion"
    ]
  }
};

const cardioSessionModes = ["Carrera", "Ciclismo", "Natacion", "Remo / ergometro", "Otro"];

function getPlanningWeekNumber(currentWeek: string) {
  const match = currentWeek.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function CoachTrainingPlanner({ client, clients }: { client?: CoachClient | null; clients: CoachClient[] }) {
  const [activeSessionPanel, setActiveSessionPanel] = useState<CoachSessionPanel>("planner");
  const [selectedSessionClientId, setSelectedSessionClientId] = useState(client?.id ?? clients[0]?.id ?? "");
  const activeSessionClient =
    client ?? clients.find((listedClient) => listedClient.id === selectedSessionClientId) ?? clients[0]!;
  const activePlanningWeek = getPlanningWeekNumber(activeSessionClient.planning.currentWeek);
  const [selectedBlockWeek, setSelectedBlockWeek] = useState(activePlanningWeek);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState<CoachSessionType>("Fuerza");
  const [strengthExercises, setStrengthExercises] = useState<PlannedStrengthExerciseDraft[]>([]);
  const plannedTonnage = strengthExercises.reduce(
    (total, exercise) => total + Number(exercise.sets || 0) * Number(exercise.reps || 0) * Number(exercise.load || 0),
    0
  );
  const plannedSessionsInSelectedWeek =
    selectedBlockWeek > 0
      ? calendarSessions.filter((session) => session.athlete === activeSessionClient.name).length
      : 0;
  const calculatedSessionNumber =
    selectedBlockWeek > 0
      ? (selectedBlockWeek === activePlanningWeek ? plannedSessionsInSelectedWeek : 0) + 1
      : null;
  const currentBlockLabel = activeSessionClient.planning.currentBlock || "Sin asignar";
  const fatigueAlerts = calculateMuscleFatigue()
    .filter((item) => ["Rojo", "Naranja"].includes(item.status))
    .slice(0, 4);
  useEffect(() => {
    setSelectedBlockWeek(activePlanningWeek);
  }, [activePlanningWeek, activeSessionClient.id]);
  const addStrengthExercise = (block: StrengthSessionBlock) => {
    setStrengthExercises((current) => [
      ...current,
      {
        block,
        exerciseId: "",
        exerciseSearch: "",
        id: `exercise-${Date.now()}-${current.length}`,
        load: "",
        observation: "",
        reps: "",
        rest: "",
        sets: "",
        targetRir: "",
        targetRpe: ""
      }
    ]);
  };
  const updateStrengthExercise = (
    exerciseId: string,
    updates: Partial<PlannedStrengthExerciseDraft>
  ) => {
    setStrengthExercises((current) =>
      current.map((exercise) => exercise.id === exerciseId ? { ...exercise, ...updates } : exercise)
    );
  };
  const removeStrengthExercise = (exerciseId: string) => {
    setStrengthExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
  };
  const renderStrengthBlock = (block: StrengthSessionBlock, title: string, buttonLabel: string) => {
    const blockExercises = strengthExercises.filter((exercise) => exercise.block === block);

    return (
      <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-ink">{title}</h3>
          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => addStrengthExercise(block)}
            type="button"
          >
            <Plus size={16} />
            {buttonLabel}
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {blockExercises.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-white px-4 py-5 text-sm font-medium text-ink/45">
              Sin ejercicios añadidos.
            </div>
          ) : blockExercises.map((exercise) => {
            const sessionSection = block === "activation" ? "activation" : block === "main" ? "main" : "accessory";
            const exerciseSuggestions = searchExercises(exercise.exerciseSearch, { section: sessionSection });
            const selectedLibraryExercise = getExerciseById(exercise.exerciseId);

            return (
            <article className="rounded-md border border-line bg-white p-3" key={exercise.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink/65">
                  Ejercicio {blockExercises.findIndex((item) => item.id === exercise.id) + 1}
                </p>
                <button
                  aria-label="Eliminar ejercicio"
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-ink/45 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => removeStrengthExercise(exercise.id)}
                  title="Eliminar ejercicio"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
                <div className="space-y-1 text-xs font-semibold text-ink/55">
                  Ejercicio
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    onChange={(event) =>
                      updateStrengthExercise(exercise.id, {
                        exerciseId: "",
                        exerciseSearch: event.target.value
                      })
                    }
                    placeholder="Buscar ejercicio..."
                    type="search"
                    value={exercise.exerciseSearch}
                  />
                  {exercise.exerciseSearch && !exercise.exerciseId ? (
                    <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-line bg-white shadow-soft">
                      {exerciseSuggestions.length > 0 ? exerciseSuggestions.map((libraryExercise) => (
                        <button
                          className="block w-full border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-panel/50"
                          key={libraryExercise.id}
                          onClick={() =>
                            updateStrengthExercise(exercise.id, {
                              exerciseId: libraryExercise.id,
                              exerciseSearch: libraryExercise.name
                            })
                          }
                          type="button"
                        >
                          <span className="block text-sm font-semibold text-ink">{libraryExercise.name}</span>
                          <span className="mt-0.5 block text-xs font-medium text-ink/55">
                            {libraryExercise.pattern} · {libraryExercise.block} · {libraryExercise.equipment.join(" / ")}
                          </span>
                        </button>
                      )) : (
                        <p className="px-3 py-3 text-sm font-medium text-ink/50">Sin coincidencias.</p>
                      )}
                    </div>
                  ) : null}
                </div>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Observaciones
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-medium text-ink outline-none focus:border-moss"
                    onChange={(event) => updateStrengthExercise(exercise.id, { observation: event.target.value })}
                    placeholder="Notas del ejercicio"
                    value={exercise.observation}
                  />
                </label>
              </div>
              {selectedLibraryExercise ? (
                <div className="mt-3 rounded-md bg-mint px-3 py-3 text-sm text-moss">
                  <p className="font-semibold">
                    {selectedLibraryExercise.pattern} - {selectedLibraryExercise.block} - {selectedLibraryExercise.equipment.join(" / ")}
                  </p>
                  <p className="mt-1 text-moss/80">
                    Principales: {selectedLibraryExercise.primaryMuscles.join(", ") || "pendiente"} - Secundarios:{" "}
                    {selectedLibraryExercise.secondaryMuscles.join(", ") || "pendiente"}
                  </p>
                </div>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Series
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    min={0}
                    onChange={(event) => updateStrengthExercise(exercise.id, { sets: event.target.value })}
                    type="number"
                    value={exercise.sets}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Reps
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    min={0}
                    onChange={(event) => updateStrengthExercise(exercise.id, { reps: event.target.value })}
                    type="number"
                    value={exercise.reps}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Carga
                  <div className="flex h-10 overflow-hidden rounded-md border border-line bg-panel/35 focus-within:border-moss">
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink outline-none"
                      min={0}
                      onChange={(event) => updateStrengthExercise(exercise.id, { load: event.target.value })}
                      type="number"
                      value={exercise.load}
                    />
                    <span className="flex items-center bg-white px-2 text-xs font-semibold text-ink/50">kg</span>
                  </div>
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Descanso
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    onChange={(event) => updateStrengthExercise(exercise.id, { rest: event.target.value })}
                    placeholder="Descanso"
                    value={exercise.rest}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  RIR
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    min={0}
                    onChange={(event) => updateStrengthExercise(exercise.id, { targetRir: event.target.value })}
                    type="number"
                    value={exercise.targetRir}
                  />
                </label>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="mt-5 xl:mt-6">
      <div className="rounded-md border border-line bg-white p-2 shadow-soft">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className={`flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
              activeSessionPanel === "planner" ? "bg-ink text-white shadow-soft" : "bg-panel/45 text-ink/70 hover:bg-panel"
            }`}
            onClick={() => setActiveSessionPanel("planner")}
            type="button"
          >
            Planificar sesion
          </button>
          <button
            className={`flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
              activeSessionPanel === "history" ? "bg-ink text-white shadow-soft" : "bg-panel/45 text-ink/70 hover:bg-panel"
            }`}
            onClick={() => setActiveSessionPanel("history")}
            type="button"
          >
            Sesiones anteriores
          </button>
        </div>
      </div>

      <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5 xl:mt-6">
        {activeSessionPanel === "planner" ? (
        <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Planificar sesion</h2>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
            {sessionType}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Lesiones / limitaciones</p>
            <p className="mt-2 text-sm text-amber-800">{activeSessionClient.injuries || "Sin lesiones registradas."}</p>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900">Fatiga muscular a vigilar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fatigueAlerts.length > 0 ? fatigueAlerts.map((item) => (
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-red-700" key={item.muscle}>
                  {item.muscle} {item.fatigueScore}%
                </span>
              )) : (
                <span className="text-sm text-red-800">Sin grupos en alerta alta.</span>
              )}
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <h3 className="font-semibold text-ink">Datos de sesion</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Deportista
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              disabled={Boolean(client)}
              onChange={(event) => setSelectedSessionClientId(event.target.value)}
              value={activeSessionClient.id}
            >
              {clients.map((listedClient) => (
                <option key={listedClient.id} value={listedClient.id}>
                  {listedClient.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Fecha
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSessionDate(event.target.value)}
              type="date"
              value={sessionDate}
            />
          </label>
          <div className="space-y-2 text-sm font-medium text-ink/75">
            Bloque / mesociclo
            <div className="flex min-h-11 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink">
              {currentBlockLabel || "Sin asignar"}
            </div>
          </div>
          <div className="space-y-2 text-sm font-medium text-ink/75">
            Semana y sesion
            <div className="flex min-h-11 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink">
              {calculatedSessionNumber
                ? `Semana ${selectedBlockWeek} - Sesion ${calculatedSessionNumber}`
                : "Sesion pendiente de asignar"}
            </div>
          </div>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Tipo de sesion
            <select
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setSessionType(event.target.value as CoachSessionType)}
              value={sessionType}
            >
              {Object.keys(coachSessionQuantifiers).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            RPE objetivo
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              max={10}
              min={0}
              placeholder="0-10"
              type="number"
            />
          </label>
        </div>
        </section>

        <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Resumen / objetivo de la sesion
            <textarea
              className="min-h-16 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-moss"
              defaultValue={plannedSession.title}
              placeholder="Ej: Fuerza tren inferior + zona 2"
            />
          </label>
        </section>

        {sessionType === "Fuerza" ? (
          <>
            <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-ink">Bloques de fuerza</h3>
                <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-moss">
                  Tonelaje planificado: {plannedTonnage.toLocaleString("es-ES")} kg
                </span>
              </div>
            </div>
            {renderStrengthBlock("activation", "Activacion", "Anadir ejercicio de activacion")}
            {renderStrengthBlock("main", "Bloque principal", "Anadir ejercicio")}
            {renderStrengthBlock("auxiliary", "Bloque auxiliar / opcional", "Anadir ejercicio auxiliar")}
          </>
        ) : sessionType === "Cardio" ? (
          <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Sesion de cardio</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Modalidad
                <select className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss">
                  {cardioSessionModes.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Duracion estimada
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 45 min" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Tiempo por zona
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. Z2 30 min + Z4 6x2 min" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Distancia / metros
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 8 km / 1800 m" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Intensidad externa
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="%VAM, %CP, %CSS, ritmo o potencia" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                FC estimada
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 145-165 ppm" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                Cadencia / brazada
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 176 ppm carrera / 34 brazadas min" />
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Sesion mixta</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Bloque de fuerza
                <textarea className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss" placeholder="Ejercicios, series, reps, carga, RPE/RIR" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Bloque metabolico / especifico
                <textarea className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss" placeholder="Rounds, esfuerzos, tiempos, pausas, distancia" />
              </label>
            </div>
          </div>
        )}

        <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Observaciones finales
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
              placeholder="Notas finales de la sesion"
            />
          </label>
        </section>

        <details className="mt-5 rounded-md border border-line bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Escala RPE
          </summary>
          <div className="mt-3 grid gap-2 text-sm text-ink/65 sm:grid-cols-2">
            <p className="rounded-md bg-panel/45 px-3 py-2">1-2: muy suave</p>
            <p className="rounded-md bg-panel/45 px-3 py-2">3-4: suave / controlado</p>
            <p className="rounded-md bg-panel/45 px-3 py-2">5-6: moderado</p>
            <p className="rounded-md bg-panel/45 px-3 py-2">7-8: duro</p>
            <p className="rounded-md bg-panel/45 px-3 py-2">9: muy duro</p>
            <p className="rounded-md bg-panel/45 px-3 py-2">10: maximo</p>
          </div>
        </details>

        <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white sm:w-auto" type="button">
          <Send size={18} />
          Enviar al deportista
        </button>
        </>
        ) : activeSessionPanel === "history" ? (
          <SessionHistoryPanel client={activeSessionClient} />
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-line bg-panel/35 p-8 text-center">
            <p className="text-sm font-semibold text-ink/55">
              Selecciona Planificar sesion o Sesiones anteriores.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SessionHistoryPanel({ client }: { client: CoachClient }) {
  const [selectedSessionKey, setSelectedSessionKey] = useState(
    client.sessionRecords[0] ? `${client.sessionRecords[0].date}-${client.sessionRecords[0].summary}` : ""
  );
  const selectedSession =
    client.sessionRecords.find((session) => `${session.date}-${session.summary}` === selectedSessionKey) ??
    client.sessionRecords[0];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Sesiones anteriores</h2>
          <p className="mt-1 text-sm text-ink/55">{client.name}</p>
        </div>
        <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">
          {client.sessionRecords.length} sesiones
        </span>
      </div>

      {client.sessionRecords.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-2">
            {client.sessionRecords.map((session) => {
              const sessionKey = `${session.date}-${session.summary}`;
              const load = calculateSessionLoad(session.rpe, session.duration);

              return (
                <button
                  className={`rounded-md border p-3 text-left ${
                    selectedSessionKey === sessionKey
                      ? "border-moss bg-mint"
                      : "border-line bg-panel/35 hover:bg-panel"
                  }`}
                  key={sessionKey}
                  onClick={() => setSelectedSessionKey(sessionKey)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{session.type}</p>
                      <p className="mt-1 text-sm text-ink/60">{session.summary}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">
                      {load} UA
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink/50">{session.date} - RPE {session.rpe} - {session.duration} min</p>
                </button>
              );
            })}
          </div>

          {selectedSession ? (
            <article className="rounded-md border border-line bg-panel/35 p-4">
              <p className="text-xs font-semibold uppercase text-moss">{selectedSession.date}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{selectedSession.type}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ClientInfoCard label="Duracion" value={`${selectedSession.duration} min`} />
                <ClientInfoCard label="RPE" value={`${selectedSession.rpe}/10`} />
                <ClientInfoCard label="sRPE" value={`${calculateSessionLoad(selectedSession.rpe, selectedSession.duration)} UA`} />
              </div>
              <p className="mt-4 rounded-md bg-white px-3 py-3 text-sm font-medium text-ink/70">
                {selectedSession.summary}
              </p>
              <p className="mt-3 text-sm text-ink/60">{selectedSession.notes}</p>
              <button className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" type="button">
                Reutilizar como base
              </button>
            </article>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-8 text-center text-sm text-ink/55">
          Todavia no hay sesiones registradas para este deportista.
        </div>
      )}
    </div>
  );
}

type AthleteTrainingViewProps = {
  hooperDone: boolean;
  onCompleteHooper: () => void;
};

function AthleteTrainingView({ hooperDone, onCompleteHooper }: AthleteTrainingViewProps) {
  const [performedExercises, setPerformedExercises] = useState(
    plannedSession.strengthExercises.map((exercise) => ({ ...exercise }))
  );
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionMissed, setSessionMissed] = useState(false);
  const [selectedPastSessionId, setSelectedPastSessionId] = useState(pastSessions[0].id);
  const [actualDurationMinutes, setActualDurationMinutes] = useState(0);
  const [finalRpe, setFinalRpe] = useState(0);
  const [athleteSessionNotes, setAthleteSessionNotes] = useState("");
  const [completedSessionRecord, setCompletedSessionRecord] = useState<{
    actualDurationMinutes: number;
    finalRpe: number;
    sRpe: number;
  } | null>(null);

  const performedTonnage = performedExercises.reduce(
    (total, exercise) => total + exercise.sets * exercise.reps * exercise.load,
    0
  );
  const completedSessionSrpe =
    actualDurationMinutes > 0 && finalRpe > 0 ? actualDurationMinutes * finalRpe : null;
  function updateExercise(
    index: number,
    field: "sets" | "reps" | "load" | "targetRpe" | "targetRir" | "rest" | "observation",
    value: number | string
  ) {
    setPerformedExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  return (
    <div className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-[0.9fr_1.1fr] xl:gap-6">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Test de wellness</h2>
          </div>
          {hooperDone ? (
            <Unlock className="text-moss" size={22} />
          ) : (
            <Lock className="text-clay" size={22} />
          )}
        </div>

        <div className="mt-5 space-y-4">
          {hooperQuestions.map((question) => (
            <div className="rounded-md border border-line bg-panel/35 p-4" key={question.key}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-ink">{question.label}</p>
                <span className="text-xs text-ink/55">{question.helper}</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    className="grid h-10 place-items-center rounded-md border border-line bg-white text-sm font-medium text-ink/70 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
                    key={`${question.key}-${value}`}
                  >
                    <input className="sr-only" name={question.key} type="radio" />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white"
          onClick={onCompleteHooper}
          type="button"
        >
          <Unlock size={18} />
          Desbloquear sesion
        </button>
      </section>

      <div className="space-y-5 xl:space-y-6">
        <AdherenceCard />
        <section className={`rounded-md border border-line p-4 shadow-soft sm:p-5 ${hooperDone ? "bg-white" : "bg-white/60"}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Sesion planificada</h2>
              <p className="mt-1 text-sm text-ink/60">
                {hooperDone
                  ? "Ya puedes verla y registrarla al terminar."
                  : "Completa primero el test de wellness."}
              </p>
            </div>
            <span className={`rounded-md px-3 py-1 text-xs font-medium ${hooperDone ? "bg-mint text-moss" : "bg-wheat text-ink/70"}`}>
              {hooperDone ? "Visible" : "Bloqueada"}
            </span>
          </div>

          {hooperDone ? (
            <div className="mt-5">
              <div className="rounded-md bg-panel/45 p-4">
                <h3 className="font-semibold text-ink">{plannedSession.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{plannedSession.objective}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
                  <span className="rounded-md bg-mint px-3 py-1 text-moss">
                    Objetivo: {plannedSession.strengthObjective}
                  </span>
                  <span className="rounded-md bg-white px-3 py-1 text-moss">
                    Duracion estimada: {plannedSession.estimatedMinutes} min
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-semibold text-ink">Ajusta lo realizado antes de registrar</h4>
                  <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-moss">
                    Tonelaje realizado: {performedTonnage.toLocaleString("es-ES")} kg
                  </span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[1180px] border-separate border-spacing-y-2 text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-ink/50">
                      <tr>
                        <th className="px-3 py-2">Ejercicio</th>
                        <th className="px-3 py-2">Patrón</th>
                        <th className="px-3 py-2">Musculo</th>
                        <th className="px-3 py-2">Series</th>
                        <th className="px-3 py-2">Reps</th>
                        <th className="px-3 py-2">Carga</th>
                        <th className="px-3 py-2">Descanso</th>
                        <th className="px-3 py-2">RPE</th>
                        <th className="px-3 py-2">RIR</th>
                        <th className="px-3 py-2">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performedExercises.map((exercise, index) => (
                        <tr className="bg-white" key={exercise.name}>
                          <td className="rounded-l-md px-3 py-2 font-medium text-ink">{exercise.name}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.pattern}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.muscleGroup}</td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Series ${exercise.name}`}
                              className="h-9 w-16 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "sets", Number(event.target.value))}
                              type="number"
                              value={exercise.sets}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Repeticiones ${exercise.name}`}
                              className="h-9 w-16 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "reps", Number(event.target.value))}
                              type="number"
                              value={exercise.reps}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Carga ${exercise.name}`}
                              className="h-9 w-20 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "load", Number(event.target.value))}
                              type="number"
                              value={exercise.load}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Descanso ${exercise.name}`}
                              className="h-9 w-24 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "rest", event.target.value)}
                              value={exercise.rest}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`RPE ${exercise.name}`}
                              className="h-9 w-16 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              max={10}
                              min={0}
                              onChange={(event) => updateExercise(index, "targetRpe", Number(event.target.value))}
                              type="number"
                              value={exercise.targetRpe}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`RIR ${exercise.name}`}
                              className="h-9 w-16 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "targetRir", Number(event.target.value))}
                              type="number"
                              value={exercise.targetRir}
                            />
                          </td>
                          <td className="rounded-r-md px-3 py-2">
                            <input
                              aria-label={`Notas ${exercise.name}`}
                              className="h-9 w-56 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "observation", event.target.value)}
                              value={exercise.observation}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SessionRpeSliders
                actualDurationMinutes={actualDurationMinutes}
                athleteNotes={athleteSessionNotes}
                finalRpe={finalRpe}
                onAthleteNotesChange={setAthleteSessionNotes}
                onDurationChange={setActualDurationMinutes}
                onFinalRpeChange={setFinalRpe}
                sRpe={completedSessionSrpe}
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  className="flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-white"
                  onClick={() => {
                    setCompletedSessionRecord(
                      completedSessionSrpe
                        ? {
                            actualDurationMinutes,
                            finalRpe,
                            sRpe: completedSessionSrpe
                          }
                        : null
                    );
                    setSessionCompleted(true);
                    setSessionMissed(false);
                  }}
                  type="button"
                >
                  Marcar como completada
                </button>
                <button
                  className="flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-medium text-ink"
                  onClick={() => {
                    setSessionMissed(true);
                    setSessionCompleted(false);
                    setCompletedSessionRecord(null);
                  }}
                  type="button"
                >
                  No he realizado la sesion
                </button>
              </div>

              {sessionCompleted && (
                <>
                  <CompletedSessionSummary record={completedSessionRecord} />
                  <CoachCompletionMessage />
                </>
              )}
              {sessionMissed && <MissedSessionReason />}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-line bg-panel/45 p-6 text-center text-sm text-ink/55">
              La sesion se desbloquea al completar las cuatro preguntas.
            </div>
          )}
        </section>

        <PastSessionsList
          selectedSessionId={selectedPastSessionId}
          onSelectSession={setSelectedPastSessionId}
        />
        <FreeSessionForm />
      </div>
    </div>
  );
}

function AdherenceCard() {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Adherencia semanal</h2>
        </div>
        <strong className="text-3xl text-ink">{athleteAdherence.percentage}%</strong>
      </div>
      <div className="mt-4 h-3 rounded-full bg-panel">
        <div
          className="h-3 rounded-full bg-moss"
          style={{ width: `${athleteAdherence.percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-ink/60">
        {athleteAdherence.completed} de {athleteAdherence.planned} sesiones completadas.
      </p>
    </section>
  );
}

function CoachCompletionMessage() {
  return (
    <section className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
      <h4 className="font-semibold">{coachCompletionMessage.title}</h4>
      <p className="mt-2 text-sm leading-6">{coachCompletionMessage.body}</p>
    </section>
  );
}

function CompletedSessionSummary({
  record
}: {
  record: { actualDurationMinutes: number; finalRpe: number; sRpe: number } | null;
}) {
  return (
    <section className="mt-4 rounded-md border border-line bg-white p-4">
      <h4 className="font-semibold text-ink">Sesion completada</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ClientInfoCard
          label="Duracion real"
          value={record ? `${record.actualDurationMinutes} min` : "Pendiente"}
        />
        <ClientInfoCard
          label="RPE total"
          value={record ? `${record.finalRpe}/10` : "Pendiente"}
        />
        <ClientInfoCard
          label="sRPE"
          value={record ? `${record.sRpe} UA` : "Pendiente"}
        />
      </div>
    </section>
  );
}

function MissedSessionReason() {
  return (
    <section className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <h4 className="font-semibold text-amber-900">CuÃ©ntanos por que no se realizo</h4>
      <p className="mt-1 text-sm text-amber-800">
        Esta informacion ayuda al entrenador a ajustar la planificación.
      </p>
      <textarea
        className="mt-3 min-h-24 w-full rounded-md border border-amber-200 bg-white px-3 py-3 text-ink outline-none focus:border-amber-500"
        placeholder="Ej. falta de tiempo, molestias, cansancio, viaje, problemas de material..."
      />
    </section>
  );
}

type PastSessionsListProps = {
  onSelectSession: (sessionId: string) => void;
  selectedSessionId: string;
};

function PastSessionsList({
  onSelectSession,
  selectedSessionId
}: PastSessionsListProps) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Sesiones pasadas</h2>
      <div className="mt-5 grid gap-3">
        {pastSessions.map((session) => {
          const isOpen = selectedSessionId === session.id;

          return (
            <article
              className={`rounded-md border transition ${
                isOpen ? "border-moss bg-panel" : "border-line bg-panel/35"
              }`}
              key={session.id}
            >
              <button
                className="w-full p-4 text-left"
                onClick={() => onSelectSession(isOpen ? "" : session.id)}
                type="button"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-clay">{session.date} - {session.type}</p>
                    <h3 className="mt-1 font-semibold text-ink">{session.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{session.summary}</p>
                  </div>
                  <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-moss">
                    sRPE {session.srpe}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-line px-4 pb-4 pt-3">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p className="rounded-md bg-white px-3 py-2 text-ink/70">
                      Duracion: {session.details.duration}
                    </p>
                    <p className="rounded-md bg-white px-3 py-2 text-ink/70">
                      RPE: {session.details.rpe}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {session.details.exercises.map((exercise) => (
                      <p className="rounded-md bg-white px-3 py-2 text-sm text-ink/70" key={exercise}>
                        {exercise}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-ink/70">
                    {session.details.notes}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

type SessionRpeSlidersProps = {
  actualDurationMinutes: number;
  athleteNotes: string;
  finalRpe: number;
  onAthleteNotesChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onFinalRpeChange: (value: number) => void;
  sRpe: number | null;
};

function SessionRpeSliders({
  actualDurationMinutes,
  athleteNotes,
  finalRpe,
  onAthleteNotesChange,
  onDurationChange,
  onFinalRpeChange,
  sRpe
}: SessionRpeSlidersProps) {
  return (
    <section className="mt-4 rounded-md border border-line bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-semibold text-ink">Registro final de sesion</h4>
          <p className="mt-1 text-sm text-ink/60">
            Completa estos datos al terminar para calcular la carga interna real.
          </p>
        </div>
        <span className="rounded-md bg-panel/60 px-3 py-1 text-sm font-semibold text-ink">
          sRPE: {sRpe ? `${sRpe} UA` : "Pendiente"}
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SliderField
          label="Duracion real de la sesion"
          max={180}
          min={0}
          onChange={onDurationChange}
          suffix="min"
          value={actualDurationMinutes}
        />
        <SliderField
          label="RPE total de sesion"
          max={10}
          min={0}
          onChange={onFinalRpeChange}
          value={finalRpe}
        />
      </div>
      <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
        Notas del deportista
        <textarea
          className="min-h-24 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
          onChange={(event) => onAthleteNotesChange(event.target.value)}
          placeholder="Sensaciones, molestias o cambios realizados"
          value={athleteNotes}
        />
      </label>
    </section>
  );
}

type SliderFieldProps = {
  label: string;
  max: number;
  min: number;
  onChange?: (value: number) => void;
  suffix?: string;
  value: number;
};

function SliderField({ label, max, min, onChange, suffix = "", value }: SliderFieldProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const displayValue = onChange ? value : currentValue;

  return (
    <label className="rounded-md border border-line bg-panel/35 p-3 text-sm font-medium text-ink/75">
      <span className="flex items-center justify-between gap-3">
        {label}
        <strong className="text-ink">
          {displayValue}
          {suffix}
        </strong>
      </span>
      <input
        className="mt-3 w-full accent-moss"
        max={max}
        min={min}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (onChange) {
            onChange(nextValue);
          } else {
            setCurrentValue(nextValue);
          }
        }}
        type="range"
        value={displayValue}
      />
    </label>
  );
}

function FreeSessionForm() {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Registrar sesion no planificada</h2>
      <p className="mt-1 text-sm text-ink/60">
        Para entrenamientos realizados por cuenta propia o cambios de ultima hora.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink/75">
          Tipo de sesion
          <select className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss">
            <option>Fuerza</option>
            <option>Cardio - Carrera</option>
            <option>Cardio - Ciclismo</option>
            <option>Cardio - Natacion</option>
            <option>Mixta</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          Duracion total
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Minutos"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          RPE global
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="1-10"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          RPE cardiaco
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="1-10"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          Tonelaje
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Kg totales"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          iTRIMP
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Valor estimado"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
          Comentarios
          <textarea
            className="min-h-24 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
            placeholder="Sensaciones, modificaciones, molestias, zonas de intensidad..."
          />
        </label>
      </div>

      <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white sm:w-auto" type="button">
        <ClipboardCheck size={18} />
        Guardar sesion libre
      </button>
    </section>
  );
}

type AthleteClientFormProps = {
  goalType: GoalType;
  setGoalType: (goalType: GoalType) => void;
  setTrainingAvailability: (availability: TrainingAvailability) => void;
  trainingAvailability: TrainingAvailability;
};

function AthleteClientForm({
  goalType,
  setGoalType,
  setTrainingAvailability,
  trainingAvailability
}: AthleteClientFormProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Datos basicos</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Nombre completo
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              placeholder="Ej. Rafa Garcia"
              type="text"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Edad
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              placeholder="Ej. 34"
              type="number"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
            Deporte principal
            <select className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss">
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-ink/75">Objetivo principal</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <button
              className={`rounded-md border p-4 text-left transition ${
                goalType === "health"
                  ? "border-moss bg-mint text-ink"
                  : "border-line bg-panel/35 text-ink/70"
              }`}
              onClick={() => setGoalType("health")}
              type="button"
            >
              <span className="font-semibold">Salud</span>
              <span className="mt-2 block text-sm">
                Bienestar, constancia, composicion corporal y control de molestias.
              </span>
            </button>
            <button
              className={`rounded-md border p-4 text-left transition ${
                goalType === "performance"
                  ? "border-steel bg-wheat text-ink"
                  : "border-line bg-panel/35 text-ink/70"
              }`}
              onClick={() => setGoalType("performance")}
              type="button"
            >
              <span className="font-semibold">Rendimiento</span>
              <span className="mt-2 block text-sm">
                Carga, intensidad, fatiga, marcas y disponibilidad para entrenar.
              </span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            <p className="text-sm font-medium text-ink/75">Disponibilidad semanal</p>
            <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Dias por semana
                <select
                  className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) =>
                    setTrainingAvailability({
                      ...trainingAvailability,
                      daysPerWeek: Number(event.target.value)
                    })
                  }
                  value={trainingAvailability.daysPerWeek}
                >
                  {[1, 2, 3, 4, 5, 6].map((days) => (
                    <option key={days} value={days}>{days}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Distribucion de dias
                <select
                  className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) =>
                    setTrainingAvailability({
                      ...trainingAvailability,
                      consecutiveDays: event.target.value === "consecutivos"
                    })
                  }
                  value={trainingAvailability.consecutiveDays ? "consecutivos" : "alternos"}
                >
                  <option value="consecutivos">Dias seguidos</option>
                  <option value="alternos">Dias alternos</option>
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <p className="text-sm font-medium text-ink/75">Tipos de sesion habituales</p>
            <div className="grid gap-3 md:grid-cols-2">
              {sessionQuantifiers.map((group) => (
                <label
                  className="flex items-start gap-3 rounded-md border border-line bg-panel/35 p-4 text-sm text-ink/75"
                  key={group.type}
                >
                  <input className="mt-1 size-4 accent-moss" defaultChecked type="checkbox" />
                  <span>
                    <span className="block font-semibold text-ink">{group.type}</span>
                    <span className="mt-1 block text-ink/60">{group.items.join(", ")}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="space-y-2 text-sm font-medium text-ink/75">
            Lesiones o molestias
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              placeholder="Ej. Rodilla izquierda"
              type="text"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Experiencia entrenando
            <select className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss">
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
            Comentarios para el entrenador
            <textarea
              className="min-h-28 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
              placeholder="Horarios, limitaciones, preferencias, material disponible..."
            />
          </label>
        </div>
      </section>

      <aside className="rounded-md border border-line bg-ink p-5 text-white shadow-soft">
        <h2 className="text-lg font-semibold">Dashboard</h2>

        <div className="mt-5 grid gap-3">
          {decisionMetrics.map((metric) => (
            <div className="rounded-md bg-white/10 px-4 py-3" key={metric.name}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-white">{metric.name}</p>
                <span className="text-xs text-white/45">{metric.source}</span>
              </div>
              <p className="mt-2 rounded bg-white/10 px-2 py-1 text-xs text-white/75">
                {metric.formula}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/15 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Cuantificadores por sesion
          </h3>
          <div className="mt-3 grid gap-3">
            {sessionQuantifiers.map((group) => (
              <div className="rounded-md bg-white/10 p-3" key={group.type}>
                <p className="text-sm font-semibold text-white">{group.type}</p>
                <p className="mt-1 text-sm text-white/65">{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
