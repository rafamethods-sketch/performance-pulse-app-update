"use client";

import {
  ChevronRight,
  ClipboardCheck,
  Lock,
  Plus,
  Search,
  Send,
  Settings2,
  Unlock,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
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
import { supabase } from "@/lib/supabase";
import {
  assessmentCategories,
  assessmentGoals,
  athleteAdherence,
  coachClients,
  coachCompletionMessage,
  coachStats,
  calendarSessions,
  cardioModes,
  cardioZones,
  decisionDashboard,
  decisionMetrics,
  fatigueLegend,
  hooperQuestions,
  muscleVolumeTargets,
  plannedSession,
  posturalAssessmentFields,
  pastSessions,
  messageThreads,
  recentStrengthLoads,
  sessionQuantifiers,
  strengthDecisionTargets,
  sports,
  weeklyLoadSeries,
  type AssessmentGoal,
  type CardioMode,
  type GoalType,
  type MovementPattern,
  type MuscleGroup,
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
  const [selectedClientId, setSelectedClientId] = useState("");
  const [hooperDone, setHooperDone] = useState(false);
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

  if (!role) {
    return <LoginCover onLogin={setRole} />;
  }

  const selectedClient =
    coachClients.find((client) => client.id === selectedClientId) ?? null;
  const needsActiveClient = role === "coach" && ["calendar", "training", "planning", "messages", "assessments", "weeklyLoad"].includes(activeSheet);

  function handleSheetChange(sheet: SheetId) {
    setActiveSheet(sheet);
    if (sheet === "clients") {
      setTrainerClientPanel("list");
    }
  }

  function openClientPanel(clientId: string, panel: Exclude<TrainerClientPanel, "list">) {
    setSelectedClientId(clientId);
    setTrainerClientPanel(panel);
    setActiveSheet("clients");
  }

  return (
    <main className="min-h-screen lg:flex">
      <Sidebar activeSheet={activeSheet} onSheetChange={handleSheetChange} role={role} />
      <div className="min-w-0 flex-1">
        <MobileNav activeSheet={activeSheet} onSheetChange={handleSheetChange} role={role} />
        <section className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
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
                    ? "Planificacion"
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

          {role === "coach" && activeSheet !== "clients" && selectedClient ? (
            <ActiveClientBar
              client={selectedClient}
              onGoToSheet={handleSheetChange}
              onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
              onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
            />
          ) : null}

          {needsActiveClient && !selectedClient ? (
            <SelectClientFirst onGoClients={() => handleSheetChange("clients")} />
          ) : activeSheet === "clients" ? (
            role === "coach" ? (
              <CoachClientsView
                client={selectedClient}
                onBack={() => setTrainerClientPanel("list")}
                onGoToSheet={handleSheetChange}
                onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
                onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
                panel={trainerClientPanel}
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
            role === "coach" && selectedClient ? <CoachTrainingPlanner client={selectedClient} /> : (
              <AthleteTrainingView
                hooperDone={hooperDone}
                onCompleteHooper={() => setHooperDone(true)}
              />
            )
          ) : activeSheet === "assessments" ? (
            <AssessmentsView client={role === "coach" ? selectedClient : null} />
          ) : activeSheet === "calendar" ? (
            <CalendarView client={selectedClient} />
          ) : activeSheet === "fatigue" ? (
            <FatigueMapView />
          ) : activeSheet === "weeklyLoad" ? (
            <WeeklyLoadView client={role === "coach" ? selectedClient : null} />
          ) : activeSheet === "planning" ? (
            role === "coach" && selectedClient ? (
              <PlanningView client={selectedClient} />
            ) : <DecisionDashboardView />
          ) : activeSheet === "progressions" ? (
            role === "coach" ? <ExerciseProgressionsView client={selectedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "routines" ? (
            role === "coach" ? <RoutinesView trainingAvailability={trainingAvailability} /> : <DecisionDashboardView />
          ) : activeSheet === "messages" ? (
            <MessagesView client={selectedClient} />
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

type CoachClient = (typeof coachClients)[number];
type ClientSessionRecord = CoachClient["sessionRecords"][number];
type ClientAssessment = CoachClient["assessments"][number];

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

function ActiveClientBar({
  client,
  onGoToSheet,
  onOpenDashboard,
  onOpenDetails
}: {
  client: CoachClient;
  onGoToSheet: (sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
}) {
  const quickLinks: { label: string; sheet?: SheetId; action?: () => void }[] = [
    { label: "Dashboard", action: () => onOpenDashboard(client.id) },
    { label: "Calendario", sheet: "calendar" },
    { label: "Sesiones", sheet: "training" },
    { label: "Planificacion", sheet: "planning" },
    { label: "Ejercicios", sheet: "progressions" },
    { label: "Mensajes", sheet: "messages" },
    { label: "Ficha inicial", action: () => onOpenDetails(client.id) },
    { label: "Valoraciones", sheet: "assessments" }
  ];

  return (
    <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-moss">Cliente activo</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{client.name}</h2>
          <p className="mt-1 text-sm text-ink/55">{client.modality} - {client.status} - {client.nextEvent}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-wrap xl:justify-end xl:pb-0">
          {quickLinks.map((link) => (
            <button
              className="shrink-0 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-white"
              key={link.label}
              onClick={() => (link.sheet ? onGoToSheet(link.sheet) : link.action?.())}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectClientFirst({ onGoClients }: { onGoClients: () => void }) {
  return (
    <section className="mt-6 rounded-md border border-line bg-white p-6 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Selecciona primero un cliente desde Clientes.</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink/55">
        Las paginas del entrenador se filtran por deportista para que calendario, sesiones, planificacion, mensajes y valoraciones pertenezcan al cliente activo.
      </p>
      <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onGoClients} type="button">
        Ir a Clientes
      </button>
    </section>
  );
}

function CoachClientsView({
  client,
  onBack,
  onGoToSheet,
  onOpenDashboard,
  onOpenDetails,
  panel
}: {
  client: CoachClient | null;
  onBack: () => void;
  onGoToSheet: (sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  panel: TrainerClientPanel;
}) {
  if (panel === "dashboard") {
    if (!client) return <SelectClientFirst onGoClients={onBack} />;

    return (
      <ClientDashboardView
        client={client}
        onBack={onBack}
        onGoToSheet={onGoToSheet}
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {coachStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Clientes registrados</h2>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Buscar cliente"
              className="grid size-10 place-items-center rounded-md border border-line text-ink/70"
              title="Buscar cliente"
              type="button"
            >
              <Search size={18} />
            </button>
            <button
              aria-label="Filtros"
              className="grid size-10 place-items-center rounded-md border border-line text-ink/70"
              title="Filtros"
              type="button"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {coachClients.map((client) => (
            <article
              className="grid gap-4 rounded-md border border-line bg-panel/45 p-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-center"
              key={client.id}
            >
              <div>
                <h3 className="font-semibold text-ink">{client.name}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  {client.age} anos - {client.modality ?? client.sport}
                </p>
                <p className="mt-1 text-xs font-medium text-ink/50">
                  Ultima actividad: {client.lastActivity}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-md bg-white px-3 py-1 text-ink/70">
                  {client.goalType}
                </span>
                <span className="rounded-md bg-wheat px-3 py-1 text-ink/70">
                  {client.status}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-moss">{client.loadMetric}</p>
                <p className="mt-1 text-ink/55">Evento: {client.nextEvent}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <span className="rounded-md bg-mint px-2 py-1 text-sm font-semibold text-moss">{client.readiness}%</span>
                <button
                  className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => onOpenDashboard(client.id)}
                  type="button"
                >
                  Ver dashboard
                </button>
                <button
                  aria-label={`Detalles de ${client.name}`}
                  className="grid size-9 place-items-center rounded-md border border-line bg-white text-ink/70"
                  onClick={() => onOpenDetails(client.id)}
                  title={`Detalles de ${client.name}`}
                  type="button"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

    </>
  );
}

function ClientDashboardView({
  client,
  onBack,
  onGoToSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onGoToSheet: (sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  const loadData = getClientLoadData(client);

  return (
    <div className="mt-6 grid gap-6">
      <ClientHeader client={client} onBack={onBack} onGoToSheet={onGoToSheet} onOpenDetails={onOpenDetails} />
      <LoadSummaryCards client={client} loadData={loadData} />
      <div className="grid gap-6 xl:grid-cols-2">
        <WellnessCards client={client} loadData={loadData} />
        <RiskControlCards client={client} loadData={loadData} />
      </div>
      <FatigueHeatmap client={client} loadData={loadData} />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ActivePlanning client={client} />
        <RecentSessions sessions={client.sessionRecords} />
      </div>
      <ClientAssessmentsSummary assessments={client.assessments} />
      <QuickAccess onGoToSheet={onGoToSheet} onOpenDetails={onOpenDetails} />
    </div>
  );
}

function ClientHeader({
  client,
  onBack,
  onGoToSheet,
  onOpenDetails
}: {
  client: CoachClient;
  onBack: () => void;
  onGoToSheet: (sheet: SheetId) => void;
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
            onClick={() => onGoToSheet("assessments")}
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

function LoadSummaryCards({ client, loadData }: { client: CoachClient; loadData: ReturnType<typeof getClientLoadData> }) {
  const cards = [
    { label: "Carga diaria", value: `${calculateSessionLoad(client.sessionRecords[0].rpe, client.sessionRecords[0].duration)} UA`, detail: client.sessionRecords[0].summary, status: "Controlado" },
    { label: "sRPE semanal", value: `${loadData.weeklyLoad.toFixed(0)} UA`, detail: loadData.weeklyTrend, status: loadData.acwrStatus },
    { label: "Monotonia", value: loadData.monotony.toFixed(2), detail: "variabilidad de cargas", status: loadData.monotonyStatus },
    { label: "Strain", value: loadData.strain.toFixed(0), detail: "carga semanal x monotonia", status: loadData.strainStatus }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article className={`rounded-md border p-4 ${clientStatusClass(card.status)}`} key={card.label}>
          <p className="text-sm font-semibold">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          <p className="mt-2 text-xs font-medium opacity-75">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}

function WellnessCards({ client, loadData }: { client: CoachClient; loadData: ReturnType<typeof getClientLoadData> }) {
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

function FatigueHeatmap({ client, loadData }: { client: CoachClient; loadData: ReturnType<typeof getClientLoadData> }) {
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
    </section>
  );
}

function RiskControlCards({ client, loadData }: { client: CoachClient; loadData: ReturnType<typeof getClientLoadData> }) {
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

function ActivePlanning({ client }: { client: CoachClient }) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">Planificacion activa</h3>
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
    </section>
  );
}

function RecentSessions({ sessions }: { sessions: ClientSessionRecord[] }) {
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
    </section>
  );
}

function ClientAssessmentsSummary({ assessments }: { assessments: ClientAssessment[] }) {
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
    </section>
  );
}

function QuickAccess({
  onGoToSheet,
  onOpenDetails
}: {
  onGoToSheet: (sheet: SheetId) => void;
  onOpenDetails: () => void;
}) {
  const quickLinks: { label: string; sheet?: SheetId; action?: () => void }[] = [
    { label: "Planificacion", sheet: "planning" },
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
            onClick={() => (link.sheet ? onGoToSheet(link.sheet) : link.action?.())}
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

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <MetricChart chartType="bar" title="sRPE semanal" field="srpe" suffix=" UA" />
        <MetricChart chartType="points" title="Monotonia" field="monotony" />
        <MetricChart chartType="bar" title="Strain" field="strain" />
        <MetricChart chartType="line" title="ACWR EWMA" field="acwr" />
        <MetricChart chartType="points" title="Hooper" field="hooper" suffix="/20" />
      </div>
    </section>
  );
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

const allPlanningMetrics = planningConfig.metricGroups.flatMap((group) => group.metrics);

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

  const header = ["Bloque", "Duracion", "Objetivo principal", "Objetivo secundario", "Distribucion semanal", "Metricas", "Notas"];
  const rows = blocks.map((block, index) => [
    index + 1,
    `${block.durationWeeks} semanas`,
    block.primaryObjective,
    block.secondaryObjective,
    block.weeklyDistribution,
    block.mainMetrics.join(" | "),
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
  client: CoachClient;
}) {
  const [planningEventType, setPlanningEventType] = useState<PlanningEventType>("Competicion");
  const [planningPeakDate, setPlanningPeakDate] = useState("");
  const [planningEventName, setPlanningEventName] = useState("");
  const [planningMethod, setPlanningMethod] = useState<PlanningMethod>("");
  const [planningBlocks, setPlanningBlocks] = useState<EditablePlanningBlock[]>([]);
  const planningWeeks = getPlanningWeeks(planningPeakDate, planningEventType);
  const totalWeeks = planningBlocks.reduce((total, block) => total + block.durationWeeks, 0);
  const selectedPlan = {
    blocks: planningBlocks,
    clientName: client.name,
    planningMethod,
    planningEventName,
    planningPeakDate,
    planningEventType,
    planningWeeks
  };

  function addMesocycle() {
    const nextIndex = planningBlocks.length + 1;
    setPlanningBlocks((blocks) => [
      ...blocks,
      {
        durationWeeks: 4,
        id: `mesocycle-${Date.now()}`,
        mainMetrics: ["RPE", "sRPE"],
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

  function toggleBlockMetric(blockId: string, metric: string) {
    setPlanningBlocks((blocks) =>
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        const mainMetrics = block.mainMetrics.includes(metric)
          ? block.mainMetrics.filter((item) => item !== metric)
          : [...block.mainMetrics, metric];
        return { ...block, mainMetrics };
      })
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

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Metodo de planificacion</h2>
        <label className="mt-5 block space-y-2 text-sm font-medium text-ink/75">
          Metodo de planificacion
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
              Planificacion sin fecha clave. El entrenador decide los mesociclos manualmente.
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
              Pulsa + Anadir mesociclo para crear la estructura manualmente.
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
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-ink/75">Metricas principales</p>
                    <div className="flex flex-wrap gap-2">
                      {allPlanningMetrics.map((metric) => (
                        <button
                          className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                            block.mainMetrics.includes(metric)
                              ? "border-moss bg-mint text-moss"
                              : "border-line bg-white text-ink/65"
                          }`}
                          key={metric}
                          onClick={() => toggleBlockMetric(block.id, metric)}
                          type="button"
                        >
                          {metric}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
                    Notas
                    <textarea
                      className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => updateBlock(block.id, { notes: event.target.value })}
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
      <h3 className="font-semibold">Resumen de planificacion</h3>
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
            <p className="text-white/80">Metricas: {block.mainMetrics.join(", ") || "Sin definir"}</p>
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
                <th className="px-3 py-2">Metricas</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, index) => (
                <tr className="border-t border-line" key={block.id}>
                  <td className="px-3 py-2 font-semibold text-ink">{index + 1}. {block.name}</td>
                  <td className="px-3 py-2 text-ink/70">{block.durationWeeks} semanas</td>
                  <td className="px-3 py-2 text-ink">{block.primaryObjective || "Sin definir"}</td>
                  <td className="px-3 py-2 text-ink/70">{block.weeklyDistribution}</td>
                  <td className="px-3 py-2 text-ink/70">{block.mainMetrics.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
type ProgressionPattern = {
  criteria: string[];
  levels: string[];
  name: string;
  objective: string;
  warning: string;
};

const progressionPatterns: ProgressionPattern[] = [
  {
    name: "Empuje tren inferior",
    objective: "Sentadilla, zancada y patrones dominantes de rodilla.",
    warning: "Regresar si hay valgo dinamico, dolor anterior de rodilla o perdida de rango.",
    criteria: ["Rango estable", "Rodilla alineada", "RIR 2-4", "Dolor 0-2/10"],
    levels: [
      "Sentadilla en silla con apoyo de manos",
      "Sentadilla en silla sin apoyo",
      "Sit to stand con tempo controlado",
      "Box squat alto",
      "Box squat bajo",
      "Goblet squat",
      "Split squat asistido",
      "Split squat cargado",
      "Front squat",
      "Back squat",
      "Jump squat con carga ligera"
    ]
  },
  {
    name: "Traccion tren inferior",
    objective: "Bisagra de cadera, peso muerto y cadena posterior.",
    warning: "Regresar si pierde columna neutra, no controla pelvis o aparece dolor lumbar.",
    criteria: ["Bisagra limpia", "Control lumbopelvico", "Isquios toleran carga", "Sin dolor irradiado"],
    levels: [
      "Puente de gluteo en suelo",
      "Bisagra con pared",
      "Bisagra con palo",
      "Pull through con banda",
      "Peso muerto rumano con mancuernas ligeras",
      "Peso muerto rumano con mancuernas",
      "Hip thrust",
      "Peso muerto trap bar elevado",
      "Peso muerto trap bar desde suelo",
      "Peso muerto rumano con barra",
      "Peso muerto convencional"
    ]
  },
  {
    name: "Empuje tren superior",
    objective: "Press horizontal y vertical con control escapular.",
    warning: "Regresar si hay dolor de hombro, compensacion lumbar o perdida de control escapular.",
    criteria: ["Escapula estable", "Rango sin dolor", "Costillas controladas", "RIR 2-3"],
    levels: [
      "Press pared",
      "Flexion inclinada alta",
      "Flexion inclinada baja",
      "Press mancuernas en banco",
      "Press maquina convergente",
      "Press banca",
      "Press landmine",
      "Press hombro sentado con mancuernas",
      "Press militar",
      "Push press",
      "Lanzamiento balon medicinal"
    ]
  },
  {
    name: "Traccion tren superior",
    objective: "Remo, dominada y fuerza dorsal escapular.",
    warning: "Regresar si hay elevacion excesiva de hombros, dolor cervical o perdida de ritmo escapular.",
    criteria: ["Depresion escapular", "Cuello relajado", "Tiron simetrico", "Control excentrico"],
    levels: [
      "Retracciones escapulares sentado",
      "Remo con banda elastica",
      "Remo en polea ligero",
      "Jalon al pecho ligero",
      "Remo mancuerna apoyado",
      "Jalon al pecho",
      "Remo en TRX inclinado",
      "Remo con barra",
      "Dominada asistida",
      "Dominada",
      "Dominada lastrada"
    ]
  }
];

function ExerciseProgressionsView({ client }: { client?: CoachClient | null }) {
  const [activePattern, setActivePattern] = useState(progressionPatterns[0].name);
  const [routineExercises, setRoutineExercises] = useState<string[]>([]);
  const selectedPattern =
    progressionPatterns.find((pattern) => pattern.name === activePattern) ?? progressionPatterns[0];
  const addExerciseToRoutine = (exercise: string) => {
    setRoutineExercises((current) => current.includes(exercise) ? current : [...current, exercise]);
  };
  const removeExerciseFromRoutine = (exercise: string) => {
    setRoutineExercises((current) => current.filter((item) => item !== exercise));
  };

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      {client ? (
        <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
          <h2 className="text-lg font-semibold text-ink">Ejercicios recomendados para {client.name}</h2>
          <p className="mt-2 text-sm text-ink/55">
            Modalidad: {client.modality}. Nivel: {client.level}. Precauciones: {client.injuries}
          </p>
        </section>
      ) : null}

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Patrones principales</h2>
        <div className="mt-5 grid gap-2">
          {progressionPatterns.map((pattern) => (
            <button
              className={`rounded-md border p-4 text-left transition ${
                selectedPattern.name === pattern.name
                  ? "border-moss bg-mint"
                  : "border-line bg-panel/35 hover:bg-panel"
              }`}
              key={pattern.name}
              onClick={() => setActivePattern(pattern.name)}
              type="button"
            >
              <p className="font-semibold text-ink">{pattern.name}</p>
              <p className="mt-1 text-sm text-ink/60">{pattern.objective}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{selectedPattern.name}</h2>
            <p className="mt-1 text-sm text-ink/60">{selectedPattern.objective}</p>
          </div>
          <span className="rounded-md bg-wheat px-3 py-1 text-xs font-medium text-ink/70">
            Fuerza
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-2">Nivel</th>
                <th className="px-3 py-2">Ejercicio</th>
                <th className="px-3 py-2">Uso</th>
                <th className="px-3 py-2">Rutina</th>
              </tr>
            </thead>
            <tbody>
              {selectedPattern.levels.map((exercise, index) => {
                const isSelected = routineExercises.includes(exercise);
                return (
                  <tr className="bg-panel/45" key={exercise}>
                    <td className="rounded-l-md px-3 py-3 font-semibold text-moss">{index + 1}</td>
                    <td className="px-3 py-3 font-medium text-ink">{exercise}</td>
                    <td className="px-3 py-3 text-ink/65">{progressionLevelUse(index, selectedPattern.levels.length)}</td>
                    <td className="rounded-r-md px-3 py-3">
                      <button
                        className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                          isSelected ? "bg-mint text-moss" : "bg-ink text-white"
                        }`}
                        onClick={() => addExerciseToRoutine(exercise)}
                        type="button"
                      >
                        <Plus size={15} />
                        {isSelected ? "AÃ±adido" : "AÃ±adir"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Criterios para progresar</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPattern.criteria.map((criterion) => (
                <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-moss" key={criterion}>
                  {criterion}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-900">Criterio para regresar</h3>
            <p className="mt-2 text-sm text-amber-800">{selectedPattern.warning}</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Rutina provisional</h2>
            <p className="mt-1 text-sm text-ink/55">{routineExercises.length} ejercicios seleccionados</p>
          </div>
          <button
            className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/65"
            onClick={() => setRoutineExercises([])}
            type="button"
          >
            Vaciar
          </button>
        </div>

        {routineExercises.length > 0 ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {routineExercises.map((exercise) => (
              <div className="flex items-center justify-between gap-3 rounded-md bg-panel/60 px-3 py-2" key={exercise}>
                <span className="text-sm font-medium text-ink">{exercise}</span>
                <button
                  className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-clay"
                  onClick={() => removeExerciseFromRoutine(exercise)}
                  type="button"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm text-ink/50">
            Selecciona ejercicios de las progresiones para crear una rutina base.
          </div>
        )}
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
        <h2 className="text-lg font-semibold text-ink">Criterios PubMed usados</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <a
            className="rounded-md bg-panel/60 px-3 py-3 text-sm text-ink/70 hover:bg-panel"
            href="https://pubmed.ncbi.nlm.nih.gov/19204579/"
            rel="noreferrer"
            target="_blank"
          >
            Progresion de carga, volumen y complejidad tecnica.
          </a>
          <a
            className="rounded-md bg-panel/60 px-3 py-3 text-sm text-ink/70 hover:bg-panel"
            href="https://pubmed.ncbi.nlm.nih.gov/28781339/"
            rel="noreferrer"
            target="_blank"
          >
            Progresar segun tolerancia, control motor y fase del proceso.
          </a>
          <a
            className="rounded-md bg-panel/60 px-3 py-3 text-sm text-ink/70 hover:bg-panel"
            href="https://pubmed.ncbi.nlm.nih.gov/22777332/"
            rel="noreferrer"
            target="_blank"
          >
            Control de tecnica, potencia y especificidad en ejercicios explosivos.
          </a>
        </div>
      </section>
    </div>
  );
}

function progressionLevelUse(index: number, total: number) {
  const ratio = index / Math.max(1, total - 1);
  if (ratio < 0.25) return "Persona mayor / readaptacion";
  if (ratio < 0.5) return "Base tecnica";
  if (ratio < 0.75) return "Fuerza general";
  return "Fuerza avanzada / potencia";
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
      { exercise: "Jalon al pecho", pattern: "Traccion tren superior", sets: "3", reps: "10-12", rir: "2-3", rest: "75 s" }
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
      { exercise: "Jalon al pecho", pattern: "Traccion tren superior", sets: "3", reps: "10-12", rir: "2-3", rest: "75 s" }
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

function RoutinesView({ trainingAvailability }: { trainingAvailability: TrainingAvailability }) {
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
            {coachClients.map((client) => (
              <option key={client.name}>{client.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[960px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-2">Patron</th>
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
                const pattern = progressionPatterns.find((item) => item.name === exercise.pattern);
                const alternatives = pattern?.levels ?? [exercise.exercise];

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
                        {alternatives.map((alternative) => (
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

function MessagesView({ client }: { client?: CoachClient | null }) {
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0].id);
  const clientThreads = client
    ? messageThreads.filter((thread) => thread.athlete === client.name)
    : messageThreads;
  const visibleThreads = clientThreads.length > 0 ? clientThreads : client ? [
    {
      athlete: client.name,
      id: `client-${client.id}`,
      lastMessage: client.coachNotes,
      messages: [
        { author: "coach", text: client.coachNotes, time: "Nota inicial" },
        { author: "athlete", text: "Pendiente de nueva conversacion.", time: "Sistema" }
      ],
      status: client.status,
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

function CalendarView({ client }: { client?: CoachClient | null }) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("Semana");
  const weekDays = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const weekDates = ["22", "23", "24", "25", "26", "27", "28"];
  const monthDays = Array.from({ length: 35 }, (_, index) => index + 1);
  const todaySessions = calendarSessions.filter((session) => session.day === "Lunes");

  return (
    <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Calendario de sesiones</h2>
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
        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-7 overflow-hidden rounded-md border border-line">
          {weekDays.map((day, index) => {
            const daySessions = calendarSessions.filter((session) => session.day === day);

            return (
              <div className="min-h-72 border-r border-line bg-panel/35 p-3 last:border-r-0" key={day}>
                <div className="border-b border-line pb-3">
                  <p className="text-sm font-semibold text-ink">{day}</p>
                  <p className="mt-1 text-2xl font-semibold text-moss">{weekDates[index]}</p>
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
      )}
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
  const grouped = recentStrengthLoads.reduce<
    Record<
      string,
      {
        exercises: string[];
        hoursAgo: number;
        muscle: string;
        score: number;
        sets: number;
        side: string;
      }
    >
  >((acc, load) => {
    const rirStress = Math.max(0, 5 - load.rir) * 8;
    const rpeStress = Math.max(0, load.rpe - 5) * 5;
    const volumeStress = load.sets * 6;
    const tonnageStress = Math.min(18, (load.sets * load.reps * load.load) / 250);
    const timeDecay = Math.max(0.15, 1 - load.hoursAgo / 120);
    const score = (rirStress + rpeStress + volumeStress + tonnageStress) * timeDecay;

    const current = acc[load.muscleGroup] ?? {
      exercises: [],
      hoursAgo: load.hoursAgo,
      muscle: load.muscleGroup,
      score: 0,
      sets: 0,
      side: load.side
    };

    current.exercises.push(load.exercise);
    current.hoursAgo = Math.min(current.hoursAgo, load.hoursAgo);
    current.score += score;
    current.sets += load.sets;
    acc[load.muscleGroup] = current;
    return acc;
  }, {});

  return Object.values(grouped).map((item) => {
    const fatigueScore = Math.min(100, Math.round(item.score));
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
      lastStimulus: `Hace ${item.hoursAgo} h`,
      muscle: item.muscle,
      recommendation,
      side: item.side,
      status,
      supportingData: `${item.sets} series - ${item.exercises.join(", ")}`
    };
  });
}

type CoachSessionType = "Fuerza" | "Cardio" | "Mixta";
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
      "Patron de movimiento",
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

function CoachTrainingPlanner({ client }: { client: CoachClient }) {
  const [sessionType, setSessionType] = useState<CoachSessionType>("Fuerza");
  const plannedTonnage = plannedSession.strengthExercises.reduce(
    (total, exercise) => total + exercise.sets * exercise.reps * exercise.load,
    0
  );
  const activeQuantifiers = coachSessionQuantifiers[sessionType];

  return (
    <div className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Planificar sesion</h2>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
            {sessionType}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Deportista
            <select className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss" disabled value={client.name}>
              <option>{client.name}</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Fecha
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              type="date"
            />
          </label>
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
          <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
            Nombre de la sesion
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              defaultValue={plannedSession.title}
              type="text"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
            Objetivo
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
              defaultValue={plannedSession.objective}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Sesiones guardadas", "Fuerza maxima tren inferior", "Potencia", "Base aerobica", "HIIT", "Tecnica", "Sparring", "Recuperacion", "Movilidad"].map((template) => (
            <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70" key={template} type="button">
              {template}
            </button>
          ))}
        </div>

        {sessionType === "Fuerza" ? (
        <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-ink">Ejercicios de fuerza</h3>
            <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-moss">
              Tonelaje planificado: {plannedTonnage.toLocaleString("es-ES")} kg
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-3 py-2">Ejercicio</th>
                  <th className="px-3 py-2">Patron</th>
                  <th className="px-3 py-2">Musculo</th>
                  <th className="px-3 py-2">Series</th>
                  <th className="px-3 py-2">Reps</th>
                  <th className="px-3 py-2">Carga</th>
                  <th className="px-3 py-2">Descanso</th>
                  <th className="px-3 py-2">RPE/RIR</th>
                  <th className="px-3 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {plannedSession.strengthExercises.map((exercise) => (
                  <tr className="bg-white" key={exercise.name}>
                    <td className="rounded-l-md px-3 py-2 font-medium text-ink">{exercise.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.pattern}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.muscleGroup}</td>
                    <td className="px-3 py-2 text-ink/65">{exercise.sets}</td>
                    <td className="px-3 py-2 text-ink/65">{exercise.reps}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.load} kg</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.rest}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink/65">
                      RPE {exercise.targetRpe} / RIR {exercise.targetRir}
                    </td>
                    <td className="rounded-r-md px-3 py-2 text-ink/65">{exercise.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Duracion total
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 70 min" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                RPE esperado
                <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" placeholder="Ej. 7/10" />
              </label>
            </div>
          </div>
        )}

        <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white sm:w-auto" type="button">
          <Send size={18} />
          Enviar al deportista
        </button>
      </section>

      <aside className="rounded-md border border-white/30 bg-gradient-to-br from-steel to-moss p-4 text-white shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold">Cuantificacion</h2>
        <div className="mt-5 grid gap-3">
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-sm font-semibold">Indices principales</p>
            <p className="mt-1 text-sm text-white/65">{activeQuantifiers.primary.join(", ")}</p>
          </div>
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-sm font-semibold">Datos que pedira la app</p>
            <p className="mt-1 text-sm text-white/65">{activeQuantifiers.fields.join(", ")}</p>
          </div>
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-sm font-semibold">Carga interna comun</p>
            <p className="mt-1 text-sm text-white/65">Duracion, RPE, sRPE y wellness Hooper previo.</p>
          </div>
        </div>
        <div className="mt-5 rounded-md bg-white/10 p-4">
          <p className="text-sm font-semibold">Sesiones del cliente</p>
          <div className="mt-3 grid gap-2">
            {client.sessionRecords.map((session) => (
              <p className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/75" key={`${session.date}-${session.summary}`}>
                {session.date} - {session.type} - {calculateSessionLoad(session.rpe, session.duration)} UA
              </p>
            ))}
          </div>
        </div>
      </aside>
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

  const performedTonnage = performedExercises.reduce(
    (total, exercise) => total + exercise.sets * exercise.reps * exercise.load,
    0
  );
  const performedSetsByPattern = performedExercises.reduce<Record<MovementPattern, number>>(
    (acc, exercise) => {
      acc[exercise.pattern as MovementPattern] =
        (acc[exercise.pattern as MovementPattern] ?? 0) + exercise.sets;
      return acc;
    },
    {
      "Dominante rodilla": 0,
      "Bisagra cadera": 0,
      Empuje: 0,
      Traccion: 0,
      Core: 0
    }
  );
  const performedSetsByMuscle = performedExercises.reduce<Record<MuscleGroup, number>>(
    (acc, exercise) => {
      acc[exercise.muscleGroup as MuscleGroup] =
        (acc[exercise.muscleGroup as MuscleGroup] ?? 0) + exercise.sets;
      return acc;
    },
    {
      Cuadriceps: 0,
      Isquios: 0,
      Gluteo: 0,
      Pectoral: 0,
      Dorsal: 0,
      Deltoides: 0,
      Biceps: 0,
      Triceps: 0,
      Gemelo: 0,
      Core: 0
    }
  );

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "load" | "targetRpe" | "targetRir",
    value: number
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
                  <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-ink/50">
                      <tr>
                        <th className="px-3 py-2">Ejercicio</th>
                        <th className="px-3 py-2">Patron</th>
                        <th className="px-3 py-2">Musculo</th>
                        <th className="px-3 py-2">Series</th>
                        <th className="px-3 py-2">Reps</th>
                        <th className="px-3 py-2">Carga</th>
                        <th className="px-3 py-2">RIR</th>
                        <th className="px-3 py-2">Descanso</th>
                        <th className="px-3 py-2">Observaciones</th>
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
                              aria-label={`RIR ${exercise.name}`}
                              className="h-9 w-16 rounded-md border border-line bg-panel/35 px-2 text-ink outline-none focus:border-moss"
                              onChange={(event) => updateExercise(index, "targetRir", Number(event.target.value))}
                              type="number"
                              value={exercise.targetRir}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-ink/65">{exercise.rest}</td>
                          <td className="rounded-r-md px-3 py-2 text-ink/65">{exercise.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SessionRpeSliders />
              <CardioSessionForm />
              <GoalBasedStrengthSummary
                performedTonnage={performedTonnage}
                plannedTonnage={plannedSession.strengthExercises.reduce(
                  (total, exercise) => total + exercise.sets * exercise.reps * exercise.load,
                  0
                )}
                setsByMuscle={performedSetsByMuscle}
                setsByPattern={performedSetsByPattern}
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  className="flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-white"
                  onClick={() => {
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
                  }}
                  type="button"
                >
                  No he realizado la sesion
                </button>
              </div>

              {sessionCompleted && <CoachCompletionMessage />}
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

function MissedSessionReason() {
  return (
    <section className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <h4 className="font-semibold text-amber-900">CuÃ©ntanos por que no se realizo</h4>
      <p className="mt-1 text-sm text-amber-800">
        Esta informacion ayuda al entrenador a ajustar la planificacion.
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

type NumberFieldProps = {
  label: string;
  onChange: (value: number) => void;
  value: number;
};

function NumberField({ label, onChange, value }: NumberFieldProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-ink/75">
      {label}
      <input
        className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function SessionRpeSliders() {
  return (
    <section className="mt-4 rounded-md border border-line bg-white p-4">
      <h4 className="font-semibold text-ink">Carga interna final</h4>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SliderField label="RPE global de sesion" max={10} min={1} value={7} />
        <SliderField label="Duracion de sesion" max={180} min={10} suffix="min" value={72} />
        <SliderField label="RPE muscular final" max={10} min={1} value={8} />
        <SliderField label="RPE cardiaco final" max={10} min={1} value={5} />
      </div>
    </section>
  );
}

function CardioSessionForm() {
  const [mode, setMode] = useState<CardioMode>("Carrera");
  const selectedMode = cardioModes.find((item) => item.mode === mode) ?? cardioModes[0];
  const [averageHr, setAverageHr] = useState(145);
  const [maxHr, setMaxHr] = useState(190);
  const [duration, setDuration] = useState(40);
  const [rpe, setRpe] = useState(6);
  const itrimpPreview = maxHr > 0 ? Math.round(duration * rpe * (averageHr / maxHr)) : 0;

  return (
    <section className="mt-4 rounded-md border border-line bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-semibold text-ink">Cardio planificado o realizado</h4>
          <p className="mt-1 text-sm text-ink/60">
            Campos especificos segun carrera, ciclismo o natacion.
          </p>
        </div>
        <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
          iTRIMP estimado: {itrimpPreview}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink/75">
          Modalidad
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setMode(event.target.value as CardioMode)}
            value={mode}
          >
            {cardioModes.map((item) => (
              <option key={item.mode}>{item.mode}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          {selectedMode.distanceLabel} totales
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Ej. 6000"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          {selectedMode.paceLabel} objetivo
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder={selectedMode.pacePlaceholder}
            type="text"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          FC estimada por el entrenador
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Ej. 135-148 ppm"
            type="text"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          Intensidad relativa ({selectedMode.intensityReference})
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder="Ej. 82"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink/75">
          {selectedMode.techniqueLabel} ({selectedMode.techniqueUnit})
          <input
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            placeholder={mode === "Natacion" ? "Ej. 36" : "Ej. 172"}
            type="number"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {cardioZones.map((zone) => (
          <label className="space-y-2 text-sm font-medium text-ink/75" key={zone.zone}>
            {zone.zone}
            <input
              className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              placeholder="min"
              type="number"
            />
            <span className="block text-xs text-ink/50">
              {zone.label}
            </span>
            <span className="block text-xs text-moss">
              {Math.round((maxHr * zone.minPercentHrMax) / 100)}-
              {Math.round((maxHr * zone.maxPercentHrMax) / 100)} ppm
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="rounded-md border border-line bg-panel/35 p-3 text-sm font-medium text-ink/75">
          <span className="flex items-center justify-between gap-3">
            RPE cardio
            <strong className="text-ink">{rpe}</strong>
          </span>
          <input
            className="mt-3 w-full accent-moss"
            max={10}
            min={1}
            onChange={(event) => setRpe(Number(event.target.value))}
            type="range"
            value={rpe}
          />
        </label>
        <label className="rounded-md border border-line bg-panel/35 p-3 text-sm font-medium text-ink/75">
          <span className="flex items-center justify-between gap-3">
            Duracion cardio
            <strong className="text-ink">{duration}min</strong>
          </span>
          <input
            className="mt-3 w-full accent-moss"
            max={180}
            min={5}
            onChange={(event) => setDuration(Number(event.target.value))}
            type="range"
            value={duration}
          />
        </label>
        <NumberField label="FC media" onChange={setAverageHr} value={averageHr} />
        <NumberField label="FC max" onChange={setMaxHr} value={maxHr} />
      </div>
    </section>
  );
}

type SliderFieldProps = {
  label: string;
  max: number;
  min: number;
  suffix?: string;
  value: number;
};

function SliderField({ label, max, min, suffix = "", value }: SliderFieldProps) {
  const [currentValue, setCurrentValue] = useState(value);

  return (
    <label className="rounded-md border border-line bg-panel/35 p-3 text-sm font-medium text-ink/75">
      <span className="flex items-center justify-between gap-3">
        {label}
        <strong className="text-ink">
          {currentValue}
          {suffix}
        </strong>
      </span>
      <input
        className="mt-3 w-full accent-moss"
        max={max}
        min={min}
        onChange={(event) => setCurrentValue(Number(event.target.value))}
        type="range"
        value={currentValue}
      />
    </label>
  );
}

type GoalBasedStrengthSummaryProps = {
  performedTonnage: number;
  plannedTonnage: number;
  setsByMuscle: Record<MuscleGroup, number>;
  setsByPattern: Record<MovementPattern, number>;
};

function GoalBasedStrengthSummary({
  performedTonnage,
  plannedTonnage,
  setsByMuscle,
  setsByPattern
}: GoalBasedStrengthSummaryProps) {
  const tonnageCompliance = plannedTonnage > 0
    ? Math.round((performedTonnage / plannedTonnage) * 100)
    : 0;

  return (
    <div className="mt-4 grid gap-4">
      <section className="rounded-md border border-line bg-white p-4">
        <h4 className="font-semibold text-ink">Hipertrofia / composicion corporal</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {muscleVolumeTargets.map((target) => {
            const sets = setsByMuscle[target.muscleGroup as MuscleGroup] ?? 0;
            const status =
              sets >= target.developmentTargetSets
                ? "Desarrollo"
                : sets >= target.minimumEffectiveSets
                  ? "Minimo efectivo"
                  : "Por debajo";
            const statusClass =
              status === "Desarrollo"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : status === "Minimo efectivo"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200";

            return (
              <article className={`rounded-md border p-3 ${statusClass}`} key={target.muscleGroup}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{target.muscleGroup}</p>
                    <p className="mt-1 text-sm opacity-80">
                      {sets} series / minimo {target.minimumEffectiveSets}
                    </p>
                  </div>
                  <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium">
                    {status}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4">
        <h4 className="font-semibold text-ink">Fuerza / rendimiento</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-md border border-line bg-panel/35 p-3">
            <p className="font-semibold text-ink">Cumplimiento de tonelaje</p>
            <p className="mt-1 text-sm text-ink/60">
              {tonnageCompliance}% del tonelaje planificado
            </p>
          </article>
          {Object.entries(setsByPattern).map(([pattern, sets]) => (
            <article className="rounded-md border border-line bg-panel/35 p-3" key={pattern}>
              <p className="font-semibold text-ink">{pattern}</p>
              <p className="mt-1 text-sm text-ink/60">{sets} series realizadas</p>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {strengthDecisionTargets.map((target) => (
            <article className="rounded-md border border-line bg-panel/35 p-3" key={target.metric}>
              <p className="font-semibold text-ink">{target.metric}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800">
                  Verde
                </span>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                  Ambar
                </span>
                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-red-800">
                  Rojo
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
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
