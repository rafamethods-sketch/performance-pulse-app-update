"use client";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Lock,
  Plus,
  Search,
  Send,
  Settings2,
  Target,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { AthleteCalendarView } from "@/components/athlete/athlete-calendar-view";
import { AthleteHistoryView } from "@/components/athlete/athlete-history-view";
import { AthletePlanningView } from "@/components/athlete/athlete-planning-view";
import { AthleteTodayView } from "@/components/athlete/athlete-today-view";
import { AthleteWeeklyLoadView } from "@/components/athlete/athlete-weekly-load-view";
import { CalendarView } from "@/components/coach/coach-calendar-view";
import { ClientDashboardView } from "@/components/coach/client-dashboard-view";
import { CoachResourcesView, type ResourceLink } from "@/components/coach/coach-resources-view";
import { CoachTodayView } from "@/components/coach/coach-today-view";
import type { TargetTrainingSession } from "@/components/coach/types";
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
import { calculateFatigueZones, type FatigueZoneLevel } from "@/lib/fatigue-zones";
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
  type ExercisePattern,
  type ExerciseVariantDifficulty,
  type ExerciseVariantType
} from "@/lib/exercises";
import {
  calculateExternalLoadByPattern,
  calculateSessionExternalLoad,
  calculateSessionMuscleSets,
  calculateWeeklyExternalLoad,
  calculateWeeklyExternalLoadByPattern,
  calculateWeeklyMuscleSets,
  type SessionExerciseInput,
  type TrainingSessionInput
} from "@/lib/session-load";
import type { CardioActivitySummary, CardioConnectionStatus } from "@/lib/cardio-activities";
import {
  analyzeCardioDeviation,
  generateCardioFeedbackSuggestion,
  getCardioCompletionLabel,
  type CardioPlan,
  type CardioResult,
  type CardioZone
} from "@/lib/cardio-deviation";
import { calculateSessionDeviation, type SessionDiscomfort } from "@/lib/session-deviation";
import { supabase } from "@/lib/supabase";
import {
  athleteAdherence,
  coachClients,
  coachCompletionMessage,
  decisionDashboard,
  decisionMetrics,
  fatigueLegend,
  hooperQuestions,
  plannedSession,
  pastSessions,
  sessionQuantifiers,
  sports,
  type GoalType,
  type SheetId,
  type UserRole
} from "@/lib/data";

type TrainingAvailability = {
  consecutiveDays: boolean;
  daysPerWeek: number;
};
type TrainerClientPanel = "list" | "dashboard" | "details";
type ThemePreference = "light" | "dark";

const themeStorageKey = "coach_theme_preference";

export default function ClientsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetId>("today");
  const [trainerClientPanel, setTrainerClientPanel] = useState<TrainerClientPanel>("list");
  const [clients, setClients] = useState<CoachClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [scopedClientId, setScopedClientId] = useState("");
  const [targetTrainingSession, setTargetTrainingSession] = useState<TargetTrainingSession | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [coachDataHydrated, setCoachDataHydrated] = useState(false);
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [resourcesHydrated, setResourcesHydrated] = useState(false);
  const [sessionTemplates, setSessionTemplates] = useState<SessionTemplate[]>([]);
  const [themeHydrated, setThemeHydrated] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>("light");
  const [trainingAvailability] = useState<TrainingAvailability>({
    consecutiveDays: true,
    daysPerWeek: 2
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null;
      if (email) {
        setRole("coach");
        setActiveSheet("today");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      if (email) {
        setRole("coach");
        setActiveSheet("today");
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    document.documentElement.dataset.theme = nextTheme;
    setThemePreference(nextTheme);
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated || typeof window === "undefined") return;
    document.documentElement.dataset.theme = themePreference;
    window.localStorage.setItem(themeStorageKey, themePreference);
  }, [themeHydrated, themePreference]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedClients = window.localStorage.getItem("coach_clients_v1");
    if (storedClients) {
      try {
        const parsedClients = JSON.parse(storedClients);
        if (Array.isArray(parsedClients)) {
          setClients(parsedClients);
        }
      } catch {
        setClients([]);
      }
    }

    const storedSessionTemplates = window.localStorage.getItem("coach_session_templates_v1");
    if (storedSessionTemplates) {
      try {
        const parsedSessionTemplates = JSON.parse(storedSessionTemplates);
        if (Array.isArray(parsedSessionTemplates)) {
          setSessionTemplates(parsedSessionTemplates);
        }
      } catch {
        setSessionTemplates([]);
      }
    }

    setCoachDataHydrated(true);
  }, []);

  useEffect(() => {
    if (!coachDataHydrated || typeof window === "undefined") return;
    window.localStorage.setItem("coach_clients_v1", JSON.stringify(clients));
  }, [clients, coachDataHydrated]);

  useEffect(() => {
    if (!coachDataHydrated || typeof window === "undefined") return;
    window.localStorage.setItem("coach_session_templates_v1", JSON.stringify(sessionTemplates));
  }, [sessionTemplates, coachDataHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedResources = window.localStorage.getItem("coach_resources_v1");
    if (storedResources) {
      try {
        const parsedResources = JSON.parse(storedResources);
        if (Array.isArray(parsedResources)) {
          setResources(parsedResources);
        }
      } catch {
        setResources([]);
      }
    }
    setResourcesHydrated(true);
  }, []);

  useEffect(() => {
    if (!resourcesHydrated || typeof window === "undefined") return;
    window.localStorage.setItem("coach_resources_v1", JSON.stringify(resources));
  }, [resources, resourcesHydrated]);

  function handleLogin(nextRole: UserRole) {
    setRole(nextRole);
    setActiveSheet("today");
  }

  if (!role) {
    return (
      <div className="theme-shell min-h-screen" data-theme={themePreference}>
        <LoginCover
          onLogin={handleLogin}
          onThemeChange={setThemePreference}
          themePreference={themePreference}
        />
      </div>
    );
  }

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ?? null;
  const scopedClient =
    clients.find((client) => client.id === scopedClientId) ?? null;
  const athleteClient = selectedClient ?? clients[0] ?? null;

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

  function openTrainingSession(clientId: string, target?: TargetTrainingSession) {
    setTargetTrainingSession(target ?? null);
    openClientSheet(clientId, "training");
  }

  return (
    <main className="theme-shell min-h-screen lg:flex" data-theme={themePreference}>
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
                {activeSheet === "today"
                  ? role === "coach" ? "Resumen del día" : "Hoy"
                  : activeSheet === "clients"
                  ? role === "coach" && trainerClientPanel === "dashboard"
                    ? `Resumen - ${selectedClient?.name ?? "cliente"}`
                    : role === "coach" && trainerClientPanel === "details"
                      ? `Información - ${selectedClient?.name ?? "cliente"}`
                      : "Clientes"
                  : activeSheet === "training"
                    ? role === "coach" ? "Sesiones" : "Historial"
                  : activeSheet === "assessments"
                    ? "Tests"
                  : activeSheet === "calendar"
                    ? "Calendario"
                  : activeSheet === "clientProgress"
                    ? "Progreso"
                  : activeSheet === "clientWellness"
                    ? "Bienestar"
                  : activeSheet === "fatigue"
                    ? "Fatiga"
                  : activeSheet === "weeklyLoad"
                    ? role === "coach" ? "Métricas" : "Carga semanal"
                  : activeSheet === "planning"
                    ? "Planificación"
                  : activeSheet === "progressions"
                    ? "Ejercicios"
                  : activeSheet === "resources"
                    ? "Recursos"
                  : activeSheet === "routines"
                    ? "Rutinas"
                  : activeSheet === "messages"
                    ? "Mensajes"
                    : "Dashboard"}
              </h1>
            </div>
            <ThemeSelector
              onThemeChange={setThemePreference}
              themePreference={themePreference}
            />
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

          {activeSheet === "today" ? (
            role === "coach" ? (
              <CoachTodayView clients={clients} onOpenTrainingSession={openTrainingSession} />
            ) : (
              <AthleteTodayView
                client={athleteClient}
                onShowCalendar={() => setActiveSheet("calendar")}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
                onShowWeeklyLoad={() => setActiveSheet("weeklyLoad")}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) =>
                    currentClients.map((listedClient) =>
                      listedClient.id === updatedClient.id ? updatedClient : listedClient
                    )
                  )
                }
              />
            )
          ) : activeSheet === "clients" ? (
            role === "coach" ? (
              <CoachClientsView
                client={selectedClient}
                clients={clients}
                onBack={() => setTrainerClientPanel("list")}
                onLoadDemoData={() => {
                  setClients((currentClients) => [
                    buildDemoClient(),
                    ...currentClients.filter((listedClient) => !isDemoClient(listedClient))
                  ]);
                }}
                onOpenClientSheet={openClientSheet}
                onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
                onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
                onRemoveDemoData={() => {
                  setClients((currentClients) => currentClients.filter((listedClient) => !isDemoClient(listedClient)));
                }}
                panel={trainerClientPanel}
                setClients={setClients}
              />
            ) : (
              <AthleteTodayView
                client={athleteClient}
                onShowCalendar={() => setActiveSheet("calendar")}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
                onShowWeeklyLoad={() => setActiveSheet("weeklyLoad")}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) =>
                    currentClients.map((listedClient) =>
                      listedClient.id === updatedClient.id ? updatedClient : listedClient
                    )
                  )
                }
              />
            )
          ) : activeSheet === "training" ? (
            role === "coach" ? (
              <CoachTrainingPlanner
                client={scopedClient}
                clients={clients}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) =>
                    currentClients.map((listedClient) =>
                      listedClient.id === updatedClient.id ? updatedClient : listedClient
                    )
                  )
                }
                sessionTemplates={sessionTemplates}
                setSessionTemplates={setSessionTemplates}
                targetTrainingSession={targetTrainingSession}
                onConsumeTargetTrainingSession={() => setTargetTrainingSession(null)}
              />
            ) : (
              <AthleteHistoryView client={athleteClient} />
            )
          ) : activeSheet === "assessments" ? (
            <AssessmentsView
              client={role === "coach" ? scopedClient : null}
              onUpdateClient={(updatedClient) =>
                setClients((currentClients) =>
                  currentClients.map((listedClient) =>
                    listedClient.id === updatedClient.id ? updatedClient : listedClient
                  )
                )
              }
            />
          ) : activeSheet === "clientProgress" ? (
            role === "coach" ? <ClientProgressView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "clientWellness" ? (
            role === "coach" ? <ClientWellnessView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "calendar" ? (
            role === "coach" ? (
              <CalendarView
                client={null}
                clients={clients}
                onOpenTrainingSession={openTrainingSession}
              />
            ) : (
              <AthleteCalendarView client={athleteClient} />
            )
          ) : activeSheet === "fatigue" ? (
            <FatigueMapView />
          ) : activeSheet === "weeklyLoad" ? (
            role === "coach" ? <WeeklyLoadView client={scopedClient} /> : <AthleteWeeklyLoadView client={athleteClient} />
          ) : activeSheet === "planning" ? (
            role === "coach" ? <PlanningView client={scopedClient} /> : <AthletePlanningView client={athleteClient} />
          ) : activeSheet === "progressions" ? (
            role === "coach" ? <ExerciseProgressionsView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "resources" ? (
            role === "coach" ? <CoachResourcesView resources={resources} setResources={setResources} /> : <DecisionDashboardView />
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

function ThemeSelector({
  onThemeChange,
  themePreference
}: {
  onThemeChange: (theme: ThemePreference) => void;
  themePreference: ThemePreference;
}) {
  return (
    <label className="flex w-fit items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65 shadow-soft">
      Apariencia
      <select
        aria-label="Apariencia"
        className="h-8 rounded-md border border-line bg-panel/60 px-2 text-xs font-semibold text-ink outline-none focus:border-moss"
        onChange={(event) => onThemeChange(event.target.value as ThemePreference)}
        value={themePreference}
      >
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>
  );
}

function LoginCover({
  onLogin,
  onThemeChange,
  themePreference
}: {
  onLogin: (role: UserRole) => void;
  onThemeChange: (theme: ThemePreference) => void;
  themePreference: ThemePreference;
}) {
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
    <main className="theme-login-bg min-h-screen">
      <div className="fixed right-4 top-4 z-10">
        <ThemeSelector onThemeChange={onThemeChange} themePreference={themePreference} />
      </div>
      <section className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-center">
        <div className="flex min-h-[36vh] flex-col items-center justify-center px-2 py-8 sm:px-6 lg:min-h-[58vh]">
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

        <section className="p-2 sm:p-4">
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
type ClientWellness = {
  fatigue: number;
  motivation: number;
  sleep: number;
  soreness: number;
  stress: number;
};
type ConnectedSessionExercise = SessionExerciseInput & {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
  block?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  intensityMethod?: StrengthIntensityMethod | null;
  observation?: string | null;
  percent1RM?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  section?: string | null;
  selectedEquipment?: string | null;
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  setDetails?: Array<{ reps?: number | string | null; setNumber: number }>;
  targetVelocity?: string | null;
  targetRir?: number | string | null;
};
type ClientSessionRecord = Partial<BaseCoachClient["sessionRecords"][number]> & {
  actualDurationMinutes?: number | string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: CardioResult;
  completed?: boolean;
  date: string;
  discomfort?: SessionDiscomfort;
  enduranceMethod?: EnduranceIntensityMethod;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  id?: string;
  isDemo?: boolean;
  linkedCardioActivityId?: string;
  performedExercises?: ConnectedSessionExercise[];
  plannedExercises?: ConnectedSessionExercise[];
  reviewedAt?: string;
  reviewNotes?: string;
  reviewStatus?: "pending" | "reviewed";
  sessionNumber?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  strengthMethod?: StrengthIntensityMethod;
  summary: string;
  targetRpe?: number | string | null;
  type: string;
  week?: number | string | null;
  weekLabel?: string | null;
  wellness?: ClientWellness;
};
type CoachClient = Omit<BaseCoachClient, "assessments" | "sessionRecords"> & {
  assessments: Array<BaseCoachClient["assessments"][number] & { id?: string; isDemo?: boolean }>;
  availableEquipment?: string;
  cardioActivities?: CardioActivitySummary[];
  cardioConnections?: CardioConnectionStatus[];
  isDemo?: boolean;
  planning: BaseCoachClient["planning"] & {
    blocks?: EditablePlanningBlock[];
    eventDate?: string;
    eventName?: string;
    eventNotes?: string;
    method?: PlanningMethod;
  };
  sessionRecords: ClientSessionRecord[];
};
type ClientAssessment = CoachClient["assessments"][number];

function isDemoClient(client: Pick<CoachClient, "id"> & { isDemo?: boolean }) {
  return client.id === "demo-client" || client.id.startsWith("demo-") || client.isDemo === true;
}

function getRelativeDateKey(daysOffset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

function getDemoExercise(name: string) {
  return exerciseLibrary.find((exercise) => exercise.name.toLowerCase() === name.toLowerCase());
}

function createDemoPlannedExercise({
  block,
  equipment,
  load,
  name,
  observation,
  percent1RM,
  reps,
  rest = "90 s",
  rir,
  rpe,
  sets,
  variantName,
  velocity
}: {
  block: StrengthSessionBlock;
  equipment?: string;
  load?: number;
  name: string;
  observation?: string;
  percent1RM?: number;
  reps: number;
  rest?: string;
  rir?: number;
  rpe?: number;
  sets: number;
  variantName?: string;
  velocity?: string;
}): ConnectedSessionExercise {
  const exercise = getDemoExercise(name);
  const intensityMethod: StrengthIntensityMethod | undefined = velocity
    ? "velocity"
    : rpe
      ? "rpe"
      : percent1RM
        ? "percent_1rm"
        : rir
          ? "rir"
          : undefined;

  return {
    block,
    exerciseId: exercise?.id ?? null,
    exerciseName: exercise?.name ?? name,
    id: `demo-exercise-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${block}`,
    intensityMethod,
    observation,
    percent1RM,
    plannedLoad: load ?? "",
    plannedReps: reps,
    plannedRest: rest,
    plannedRir: rir,
    plannedRpe: rpe,
    plannedSets: sets,
    selectedEquipment: equipment,
    selectedVariantName: variantName,
    section: block,
    targetVelocity: velocity ?? null
  };
}

function createDemoPerformedExercise(exercise: ConnectedSessionExercise, rpe = 7, loadOffset = 0): ConnectedSessionExercise {
  const sets = Number(exercise.plannedSets ?? 1);
  const reps = Number(exercise.plannedReps ?? 1);
  const load = Number(exercise.plannedLoad ?? 0) + loadOffset;

  return {
    ...exercise,
    athleteNotes: rpe >= 8 ? "Algo mas duro de lo previsto, tecnica estable." : "Buenas sensaciones.",
    exerciseRpe: rpe,
    load,
    reps: reps * sets,
    rir: exercise.plannedRir ?? 2,
    setDetails: Array.from({ length: sets }, (_, index) => ({
      reps: Math.max(reps - (index === sets - 1 && rpe >= 8 ? 1 : 0), 1),
      setNumber: index + 1
    })),
    sets
  };
}

function createDemoSession({
  dayOffset,
  discomfort,
  duration,
  exercises,
  finalRpe,
  id,
  reviewStatus = "reviewed",
  summary,
  type,
  wellness
}: {
  dayOffset: number;
  discomfort?: SessionDiscomfort;
  duration: number;
  exercises: ConnectedSessionExercise[];
  finalRpe: number;
  id: string;
  reviewStatus?: "pending" | "reviewed";
  summary: string;
  type: string;
  wellness: ClientWellness;
}): ClientSessionRecord {
  const date = getRelativeDateKey(dayOffset);

  return {
    actualDurationMinutes: duration,
    block: "Demo rendimiento mixto",
    completed: true,
    date,
    discomfort,
    finalNotes: "Sesion demo para probar historial, carga y revision.",
    finalRpe,
    id,
    isDemo: true,
    performedExercises: exercises.map((exercise, index) => createDemoPerformedExercise(exercise, finalRpe, index === 1 ? -2 : 0)),
    plannedExercises: exercises,
    reviewedAt: getRelativeDateKey(dayOffset + 1),
    reviewNotes: reviewStatus === "reviewed" ? "Buen trabajo. Mantener progresion y vigilar sensaciones locales." : "",
    reviewStatus,
    sessionNumber: 1,
    sRPE: duration * finalRpe,
    status: "Completada",
    summary,
    type,
    weekLabel: "Semana demo",
    wellness
  };
}

function createDemoCardioSession(dayOffset: number, interval = false): ClientSessionRecord {
  const duration = interval ? 38 : 45;
  const finalRpe = interval ? 8 : 5;
  const date = getRelativeDateKey(dayOffset);

  return {
    actualDurationMinutes: duration,
    block: "Demo resistencia",
    cardioPlan: {
      sport: "run",
      targetDurationMinutes: duration,
      targetRpeMax: interval ? 8 : 6,
      targetRpeMin: interval ? 7 : 4,
      targetZone: interval ? "z4" : "z2"
    },
    cardioResult: {
      distanceMeters: interval ? 7200 : 7800,
      durationMinutes: duration,
      perceivedRpe: finalRpe,
      source: "manual",
      timeInZones: interval
        ? { z1: 300, z2: 600, z3: 480, z4: 780, z5: 120 }
        : { z1: 420, z2: 1980, z3: 300 }
    },
    completed: true,
    date,
    finalNotes: interval ? "Intervalos exigentes, recuperacion completa." : "Rodaje comodo y estable.",
    finalRpe,
    id: interval ? "demo-session-intervals" : "demo-session-cardio-z2",
    isDemo: true,
    performedExercises: [],
    plannedExercises: [],
    reviewStatus: interval ? "pending" : "reviewed",
    sessionNumber: interval ? 2 : 1,
    sRPE: duration * finalRpe,
    status: "Completada",
    summary: interval ? "Intervalos controlados Z4" : "Cardio Z2 continuo",
    type: "Cardio",
    weekLabel: "Semana demo",
    wellness: interval
      ? { fatigue: 4, motivation: 4, sleep: 3, soreness: 3, stress: 3 }
      : { fatigue: 2, motivation: 4, sleep: 4, soreness: 2, stress: 2 }
  };
}

function buildDemoClient(): CoachClient {
  const lowerExercises = [
    createDemoPlannedExercise({ block: "activation", name: "World greatest stretch", reps: 6, rpe: 5, sets: 2 }),
    createDemoPlannedExercise({ block: "activation", name: "Pogo jump bilateral", reps: 8, rpe: 6, sets: 3 }),
    createDemoPlannedExercise({ block: "main", name: "Bulgarian split squat", reps: 10, rir: 3, sets: 3, load: 24 }),
    createDemoPlannedExercise({
      block: "main",
      equipment: "Barra",
      name: "Hip thrust",
      reps: 8,
      rir: 2,
      sets: 4,
      load: 90,
      variantName: "Hip thrust unilateral"
    }),
    createDemoPlannedExercise({ block: "main", name: "Leg extension", reps: 14, sets: 4, velocity: "0.25" })
  ];
  const upperExercises = [
    createDemoPlannedExercise({ block: "main", name: "Bench press", reps: 6, rpe: 7, sets: 4, load: 72.5 }),
    createDemoPlannedExercise({ block: "main", name: "Pull-up / Chin-up", reps: 6, rir: 2, sets: 4 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Seated cable row", reps: 10, rpe: 7, sets: 3, load: 55 })
  ];
  const powerExercises = [
    createDemoPlannedExercise({ block: "activation", name: "Pogo jump bilateral", reps: 8, rpe: 6, sets: 3 }),
    createDemoPlannedExercise({ block: "main", name: "Drop jump", reps: 4, rpe: 7, sets: 4 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Medicine ball chest pass", reps: 6, rpe: 6, sets: 3 })
  ];
  const sessionRecords: ClientSessionRecord[] = [
    createDemoSession({
      dayOffset: -25,
      duration: 68,
      exercises: lowerExercises,
      finalRpe: 7,
      id: "demo-session-week-1-lower",
      summary: "Fuerza tren inferior con control de RIR",
      type: "Fuerza",
      wellness: { fatigue: 3, motivation: 4, sleep: 4, soreness: 3, stress: 2 }
    }),
    createDemoCardioSession(-23),
    createDemoSession({
      dayOffset: -20,
      duration: 60,
      exercises: upperExercises,
      finalRpe: 7,
      id: "demo-session-week-1-upper",
      summary: "Fuerza tren superior",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 5, sleep: 4, soreness: 2, stress: 2 }
    }),
    createDemoSession({
      dayOffset: -16,
      duration: 52,
      exercises: powerExercises,
      finalRpe: 6,
      id: "demo-session-week-2-power",
      summary: "Potencia y pliometria",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 4, sleep: 5, soreness: 2, stress: 1 }
    }),
    createDemoCardioSession(-14, true),
    createDemoSession({
      dayOffset: -11,
      discomfort: {
        bodyArea: "Rodilla izquierda",
        exerciseName: "Bulgarian split squat",
        hasDiscomfort: true,
        intensity: 3,
        notes: "Molestia leve durante las ultimas repeticiones.",
        phase: "Final de la serie"
      },
      duration: 70,
      exercises: lowerExercises,
      finalRpe: 8,
      id: "demo-session-week-3-lower",
      reviewStatus: "pending",
      summary: "Fuerza tren inferior con pequena desviacion",
      type: "Fuerza",
      wellness: { fatigue: 4, motivation: 4, sleep: 3, soreness: 4, stress: 3 }
    }),
    createDemoSession({
      dayOffset: -7,
      duration: 58,
      exercises: upperExercises,
      finalRpe: 6,
      id: "demo-session-week-4-upper",
      summary: "Fuerza tren superior tecnica",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 4, sleep: 4, soreness: 2, stress: 2 }
    }),
    {
      block: "Demo semana actual",
      completed: false,
      date: getRelativeDateKey(2),
      id: "demo-session-planned-future",
      isDemo: true,
      performedExercises: [],
      plannedExercises: lowerExercises,
      sessionNumber: 3,
      status: "Planificada",
      summary: "Sesion planificada demo para calendario",
      type: "Fuerza",
      weekLabel: "Semana demo"
    }
  ];

  return {
    activeBlocks: ["Demo acumulacion", "Demo fuerza + resistencia"],
    age: 34,
    assessments: [
      { action: "Ver historial", date: getRelativeDateKey(-28), id: "demo-assessment-strength-1", isDemo: true, name: "3RM sentadilla", result: "105 kg", type: "Fuerza" },
      { action: "Ver historial", date: getRelativeDateKey(-21), id: "demo-assessment-jump-1", isDemo: true, name: "CMJ", result: "38 cm", type: "Salto" },
      { action: "Ver historial", date: getRelativeDateKey(-18), id: "demo-assessment-cardio-1", isDemo: true, name: "Test 6 min", result: "1420 m", type: "Resistencia" },
      { action: "Ver historial", date: getRelativeDateKey(-12), id: "demo-assessment-body-1", isDemo: true, name: "Peso corporal", result: "76.4 kg", type: "Antropometría" }
    ],
    availability: "4 dias / semana",
    availableEquipment: "Barra, mancuernas, polea, cajon, balon medicinal",
    chronicLoad: 1780,
    coachNotes: "Cliente demo para probar dashboard, calendario, historial, fatiga y wellness.",
    dailyLoads: [420, 0, 360, 540, 0, 320, 280],
    goalType: "Rendimiento",
    history: "Perfil ficticio para pruebas visuales. No contiene datos personales reales.",
    hooper: { fatigue: 3, mood: 2, sleep: 2, soreness: 3, stress: 2 },
    id: "demo-client",
    injuries: "Molestias leves registradas de prueba, sin diagnosticos.",
    isDemo: true,
    lastActivity: "Fuerza tren superior tecnica - hace 7 dias",
    level: "Intermedio",
    loadMetric: "ACWR demo 1.08 - monotonia demo 1.3",
    metrics: ["sRPE demo 2180 UA", "Hooper demo 12/25", "Fatiga muscular visible"],
    modality: "Fuerza + resistencia",
    name: "Cliente Demo",
    nextEvent: `Control demo - ${getRelativeDateKey(14)}`,
    planning: {
      blocks: [
        {
          durationWeeks: 4,
          id: "demo-planning-block-1",
          mainMetrics: ["sRPE", "RPE final", "series efectivas"],
          name: "Demo acumulacion",
          notes: "Bloque ficticio para probar planificacion visual.",
          primaryObjective: "Construir tolerancia a fuerza y cardio",
          secondaryObjective: "Mantener movilidad y potencia",
          weeklyDistribution: "Ondulante"
        }
      ],
      currentBlock: "Demo acumulacion",
      currentWeek: "Semana 4 de 4",
      distribution: "Ondulante",
      eventDate: getRelativeDateKey(14),
      eventName: "Control demo",
      eventNotes: "Evento ficticio para probar proximos eventos.",
      method: "blocks",
      nextSessions: ["Fuerza tren inferior", "Cardio Z2", "Potencia / pliometria"],
      primaryGoal: "rendimiento mixto",
      secondaryGoal: "control de carga y wellness"
    },
    readiness: 86,
    recentSessions: ["Hip thrust 4x8 RIR 2", "Cardio Z2 45 min", "Bench press 4x6 RPE 7"],
    sessionRecords,
    sport: "Fuerza + resistencia",
    status: "Demo activo"
  } as CoachClient;
}

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
  const completedLoadRecords = client.sessionRecords.flatMap((session) => {
    const duration = Number(session.actualDurationMinutes ?? session.duration);
    const rpe = Number(session.finalRpe ?? session.rpe);
    return duration > 0 && rpe > 0 ? [{ ...session, duration, rpe }] : [];
  });
  const weeklyLoad = calculateWeeklyLoad(completedLoadRecords);
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
      label: "Resumen",
      onClick: () => onOpenDashboard(client.id)
    },
    {
      active: activeSheet === "clients" && trainerClientPanel === "details",
      label: "Información",
      onClick: () => onOpenDetails(client.id)
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
    },
    {
      active: activeSheet === "assessments",
      label: "Tests",
      onClick: () => onOpenClientSheet(client.id, "assessments")
    },
    {
      active: activeSheet === "clientProgress",
      label: "Progreso",
      onClick: () => onOpenClientSheet(client.id, "clientProgress")
    },
    {
      active: activeSheet === "clientWellness",
      label: "Bienestar",
      onClick: () => onOpenClientSheet(client.id, "clientWellness")
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
        Las paginas del entrenador se filtran por deportista para que calendario, sesiones, planificación, mensajes y tests pertenezcan al cliente activo.
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
  onLoadDemoData,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  onRemoveDemoData,
  panel,
  setClients
}: {
  client: CoachClient | null;
  clients: CoachClient[];
  onBack: () => void;
  onLoadDemoData: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  onRemoveDemoData: () => void;
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
        onUpdateClient={(updatedClient) =>
          setClients((currentClients) =>
            currentClients.map((listedClient) =>
              listedClient.id === updatedClient.id ? updatedClient : listedClient
            )
          )
        }
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

      <section className="mt-4 rounded-md border border-line bg-panel/35 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Datos demo</h2>
            <p className="mt-1 text-xs font-medium text-ink/50">
              Carga o elimina solo el Cliente Demo para probar graficos sin tocar clientes reales.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="h-9 rounded-md bg-ink px-3 text-xs font-semibold text-white"
              onClick={onLoadDemoData}
              type="button"
            >
              Cargar datos demo
            </button>
            <button
              className="h-9 rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink/70"
              onClick={onRemoveDemoData}
              type="button"
            >
              Eliminar datos demo
            </button>
          </div>
        </div>
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
                    Resumen
                  </button>
                  <button
                    aria-label={`Información de ${listedClient.name}`}
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenDetails(listedClient.id)}
                    title={`Información de ${listedClient.name}`}
                    type="button"
                  >
                    Información
                  </button>
                  <button
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => onOpenClientSheet(listedClient.id, "assessments")}
                    type="button"
                  >
                    Tests
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

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`rounded-md bg-panel/55 p-4 ${className}`}>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-sm font-semibold text-moss">{value}</p>
    </article>
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

function ClientDetailsView({
  client,
  onBack,
  onUpdateClient
}: {
  client: CoachClient;
  onBack: () => void;
  onUpdateClient: (updatedClient: CoachClient) => void;
}) {
  const createDetailsDraft = (sourceClient: CoachClient) => ({
    age: String(sourceClient.age ?? ""),
    availableEquipment: sourceClient.availableEquipment ?? "",
    availability: sourceClient.availability ?? "",
    coachNotes: sourceClient.coachNotes ?? "",
    eventDate: sourceClient.planning.eventDate ?? "",
    eventName: sourceClient.planning.eventName ?? "",
    eventNotes: sourceClient.planning.eventNotes ?? "",
    goalType: sourceClient.goalType,
    injuries: sourceClient.injuries ?? "",
    modality: sourceClient.modality ?? sourceClient.sport ?? "",
    name: sourceClient.name ?? "",
    primaryGoal: sourceClient.planning.primaryGoal ?? "",
    status: sourceClient.status ?? ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => createDetailsDraft(client));

  useEffect(() => {
    setDraft(createDetailsDraft(client));
    setIsEditing(false);
  }, [client]);

  const displayValue = (value?: number | string | null) => {
    if (value === undefined || value === null || String(value).trim() === "") return "Sin especificar";
    return String(value);
  };

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handleCancel = () => {
    setDraft(createDetailsDraft(client));
    setIsEditing(false);
  };

  const handleSave = () => {
    const parsedAge = Number(draft.age);
    const cleanEventName = draft.eventName.trim();
    const cleanEventDate = draft.eventDate.trim();
    const nextEvent = cleanEventName
      ? `${cleanEventName}${cleanEventDate ? ` - ${cleanEventDate}` : ""}`
      : client.nextEvent;

    onUpdateClient({
      ...client,
      age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : client.age,
      availability: draft.availability.trim() || "Sin especificar",
      availableEquipment: draft.availableEquipment.trim() || "Sin especificar",
      coachNotes: draft.coachNotes.trim() || "Sin especificar",
      goalType: draft.goalType as CoachClient["goalType"],
      injuries: draft.injuries.trim() || "Sin especificar",
      modality: draft.modality.trim() || "Sin especificar",
      name: draft.name.trim() || client.name,
      nextEvent,
      planning: {
        ...client.planning,
        eventDate: cleanEventDate,
        eventName: cleanEventName,
        eventNotes: draft.eventNotes.trim(),
        primaryGoal: draft.primaryGoal.trim() || "Sin especificar"
      },
      sport: draft.modality.trim() || client.sport,
      status: draft.status.trim() || "Sin especificar"
    });
    setIsEditing(false);
  };

  const detailSections = [
    {
      fields: [
        ["Nombre", displayValue(client.name)],
        ["Edad", `${displayValue(client.age)} años`],
        ["Disciplina / deporte", displayValue(client.modality || client.sport)],
        ["Contexto", displayValue(client.goalType)],
        ["Estado", displayValue(client.status)]
      ],
      title: "Datos básicos"
    },
    {
      fields: [
        ["Objetivo principal", displayValue(client.planning.primaryGoal)],
        ["Evento / test / competición", displayValue(client.planning.eventName || client.nextEvent)],
        ["Fecha objetivo", displayValue(client.planning.eventDate)],
        ["Notas del objetivo", displayValue(client.planning.eventNotes)]
      ],
      title: "Objetivo y calendario"
    },
    {
      fields: [["Disponibilidad semanal", displayValue(client.availability)]],
      title: "Disponibilidad"
    },
    {
      fields: [["Material disponible", displayValue(client.availableEquipment)]],
      title: "Material disponible"
    },
    {
      fields: [
        ["Lesiones o limitaciones", displayValue(client.injuries)],
        ["Observaciones relevantes", displayValue(client.history)]
      ],
      title: "Salud / lesiones / limitaciones"
    },
    {
      fields: [["Notas generales", displayValue(client.coachNotes)]],
      title: "Notas del entrenador"
    }
  ];
  const intervalsConnection = client.cardioConnections?.find((connection) => connection.provider === "intervals");

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
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleCancel} type="button">
              Cancelar
            </button>
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSave} type="button">
              Guardar cambios
            </button>
          </div>
        ) : (
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setIsEditing(true)} type="button">
            Editar detalles
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Datos básicos</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Nombre
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("name", event.target.value)} value={draft.name} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Edad
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" min={0} onChange={(event) => updateDraft("age", event.target.value)} type="number" value={draft.age} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Disciplina / deporte
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("modality", event.target.value)} value={draft.modality} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Contexto
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("goalType", event.target.value)} value={draft.goalType}>
                  <option>Rendimiento</option>
                  <option>Salud</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Estado
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("status", event.target.value)} value={draft.status} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Objetivo y calendario</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Objetivo principal
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("primaryGoal", event.target.value)} value={draft.primaryGoal} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Evento / test / competición
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("eventName", event.target.value)} value={draft.eventName} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Fecha objetivo
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("eventDate", event.target.value)} type="date" value={draft.eventDate} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Notas del objetivo
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("eventNotes", event.target.value)} value={draft.eventNotes} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Disponibilidad</h3>
            <label className="mt-4 block text-sm font-semibold text-ink/70">
              Disponibilidad semanal
              <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("availability", event.target.value)} value={draft.availability} />
            </label>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Material disponible</h3>
            <label className="mt-4 block text-sm font-semibold text-ink/70">
              Material disponible
              <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("availableEquipment", event.target.value)} value={draft.availableEquipment} />
            </label>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Salud / lesiones / limitaciones</h3>
            <label className="mt-4 block text-sm font-semibold text-ink/70">
              Lesiones o limitaciones
              <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("injuries", event.target.value)} value={draft.injuries} />
            </label>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Notas del entrenador</h3>
            <label className="mt-4 block text-sm font-semibold text-ink/70">
              Notas generales
              <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("coachNotes", event.target.value)} value={draft.coachNotes} />
            </label>
          </section>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {detailSections.map((section) => (
            <article className="rounded-md border border-line bg-panel/35 p-4" key={section.title}>
              <h3 className="font-semibold text-ink">{section.title}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {section.fields.map(([label, value]) => (
                  <div className="rounded-md border border-line bg-white px-3 py-3" key={label}>
                    <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
          <article className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Conexiones</h3>
            <div className="mt-4 rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-ink">Intervals.icu</p>
                  <p className="mt-1 text-sm text-ink/55">
                    La app solo guardará un resumen de la actividad, no archivos completos, rutas ni datos segundo a segundo.
                  </p>
                </div>
                <span className="w-fit rounded-md bg-panel/70 px-3 py-1 text-xs font-semibold text-ink/65">
                  {getCardioConnectionLabel(intervalsConnection?.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-line bg-panel/35 px-3 py-3">
                  <p className="text-xs font-semibold uppercase text-ink/45">Estado</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{getCardioConnectionLabel(intervalsConnection?.status)}</p>
                </div>
                <div className="rounded-md border border-line bg-panel/35 px-3 py-3">
                  <p className="text-xs font-semibold uppercase text-ink/45">Última sincronización</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{formatCardioSyncDate(intervalsConnection?.lastSyncAt)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-ink/45">
                La integración real debe hacerse desde backend/API route/Supabase Edge Function.
              </p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function ClientProgressView({ client }: { client?: CoachClient | null }) {
  const assessments = client?.assessments ?? [];
  const strengthTests = assessments.filter((assessment) => assessment.type === "Fuerza");
  const bodyCompositionTests = assessments.filter((assessment) => assessment.type === "Antropometría");
  const otherTests = assessments.filter((assessment) => assessment.type !== "Fuerza" && assessment.type !== "Antropometría");
  const completedSessions = (client?.sessionRecords ?? []).filter((session) => session.completed || session.status === "Completada");

  if (!client) return <SelectClientFirst onGoClients={() => undefined} />;

  return (
    <div className="mt-6 grid gap-5">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Progreso de {client.name}</h2>
        <p className="mt-1 text-sm text-ink/55">Vista inicial para reunir tests, marcas y evolución sin añadir cálculos nuevos.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ClientProgressCard title="Marcas máximas / tests de fuerza" items={strengthTests} />
        <ClientProgressCard title="Otros tests" items={otherTests} />
        <ClientProgressCard title="Composición corporal" items={bodyCompositionTests} />
        <section className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h3 className="font-semibold text-ink">Carga / evolución</h3>
          {completedSessions.length > 0 ? (
            <div className="mt-3 grid gap-2">
              <ClientInfoCard label="Sesiones completadas" value={`${completedSessions.length}`} />
              <ClientInfoCard label="Última actividad" value={client.lastActivity || "Sin datos todavía"} />
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">Sin datos todavía.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function ClientProgressCard({ items, title }: { items: ClientAssessment[]; title: string }) {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <h3 className="font-semibold text-ink">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {items.slice(0, 4).map((item, index) => (
            <article className="rounded-md border border-line bg-panel/35 p-3" key={`${item.date}-${item.name}-${index}`}>
              <p className="text-sm font-semibold text-ink">{item.name}</p>
              <p className="mt-1 text-sm text-moss">{item.result}</p>
              <p className="mt-1 text-xs text-ink/45">{item.date}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">Sin datos todavía.</p>
      )}
    </section>
  );
}

function ClientWellnessView({ client }: { client?: CoachClient | null }) {
  const records = client?.sessionRecords ?? [];
  const wellnessRecords = records.filter((session) => session.wellness);
  const latestWellness = wellnessRecords[0]?.wellness;
  const discomfortRecords = records.filter((session) => session.discomfort?.hasDiscomfort || session.discomfort?.notes);

  if (!client) return <SelectClientFirst onGoClients={() => undefined} />;

  return (
    <div className="mt-6 grid gap-5">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Bienestar de {client.name}</h2>
        <p className="mt-1 text-sm text-ink/55">Vista inicial con datos disponibles de wellness, sesiones y molestias recientes.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ClientInfoCard label="Preparación reciente" value={wellnessRecords.length > 0 ? `${wellnessRecords.length} registros` : "Sin datos todavía"} />
        <ClientInfoCard label="Sueño" value={latestWellness?.sleep ? `${latestWellness.sleep}/5` : "Sin datos todavía"} />
        <ClientInfoCard label="Energía / fatiga" value={latestWellness?.fatigue ? `${latestWellness.fatigue}/5` : "Sin datos todavía"} />
        <ClientInfoCard label="Recuperación muscular" value={latestWellness?.soreness ? `${latestWellness.soreness}/5` : "Sin datos todavía"} />
        <ClientInfoCard label="Ánimo / estrés" value={latestWellness?.stress ? `${latestWellness.stress}/5` : "Sin datos todavía"} />
        <ClientInfoCard label="Molestias recientes" value={discomfortRecords.length > 0 ? `${discomfortRecords.length} registros` : "Sin datos todavía"} />
      </div>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h3 className="font-semibold text-ink">Notas recientes</h3>
        {discomfortRecords.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {discomfortRecords.slice(0, 3).map((session, index) => (
              <article className="rounded-md border border-line bg-panel/35 p-3" key={`${session.date}-${index}`}>
                <p className="text-sm font-semibold text-ink">{session.date}</p>
                <p className="mt-1 text-sm text-ink/60">{session.discomfort?.notes || "Molestia registrada sin notas."}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">Sin datos todavía.</p>
        )}
      </section>
    </div>
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

function getClientTrainingSessionInputs(client?: CoachClient | null): TrainingSessionInput[] {
  return (client?.sessionRecords ?? [])
    .filter((session) =>
      (session.plannedExercises?.length ?? 0) > 0 ||
      (session.performedExercises?.length ?? 0) > 0
    )
    .map((session) => ({
      completed: Boolean(session.completed || session.status === "Completada"),
      performedExercises: session.performedExercises,
      plannedExercises: session.plannedExercises
    }));
}

function WeeklyLoadView({ client }: { client?: CoachClient | null }) {
  const loadData = client ? getClientLoadData(client) : null;
  const weeklyTrainingSessions = getClientTrainingSessionInputs(client);
  const previewSession = weeklyTrainingSessions[0] ?? null;
  const sessionExternalLoad = previewSession ? calculateSessionExternalLoad(previewSession, exerciseLibrary) : 0;
  const sessionExternalLoadByPattern = previewSession ? calculateExternalLoadByPattern(previewSession, exerciseLibrary) : {};
  const sessionMuscleSets = previewSession ? calculateSessionMuscleSets(previewSession, exerciseLibrary) : {};
  const weeklyExternalLoad = calculateWeeklyExternalLoad(weeklyTrainingSessions, exerciseLibrary);
  const weeklyExternalLoadByPattern = calculateWeeklyExternalLoadByPattern(weeklyTrainingSessions, exerciseLibrary);
  const weeklyMuscleSets = calculateWeeklyMuscleSets(weeklyTrainingSessions, exerciseLibrary);
  const maxPatternLoad = Math.max(1, ...Object.values(weeklyExternalLoadByPattern));
  const muscleSetEntries = Object.entries(weeklyMuscleSets).sort(([, a], [, b]) => b - a).slice(0, 8);
  const weeklySessionCount = weeklyTrainingSessions.length;
  const hasWeeklyTrainingData = weeklySessionCount > 0;

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
          value={hasWeeklyTrainingData ? `${Math.round(weeklyExternalLoad).toLocaleString("es-ES")} kg` : "Sin datos"}
        />
        <MetricPill
          label="Carga externa sesion"
          status="prevision"
          value={previewSession ? `${Math.round(sessionExternalLoad).toLocaleString("es-ES")} kg` : "Sin datos"}
        />
        <MetricPill
          label="Sesiones incluidas"
          status="semana"
          value={`${weeklySessionCount}`}
        />
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
            {Object.entries(weeklyExternalLoadByPattern).length > 0 ? (
              Object.entries(weeklyExternalLoadByPattern).map(([pattern, load]) => (
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
              ))
            ) : (
              <p className="rounded-md border border-dashed border-line bg-white/60 p-4 text-sm font-semibold text-ink/50">
                Sin sesiones registradas para calcular carga externa.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">Series efectivas semanales por musculo</h3>
          <div className="mt-4 grid gap-2">
            {muscleSetEntries.length > 0 ? (
              muscleSetEntries.map(([muscle, score]) => (
                <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm" key={muscle}>
                  <span className="font-medium text-ink/70">{formatFatigueKey(muscle)}</span>
                  <span className="font-semibold text-ink">{score.toFixed(1)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-line bg-white/60 p-4 text-sm font-semibold text-ink/50">
                Sin sesiones registradas para calcular series efectivas.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-line bg-white p-4">
          <h3 className="font-semibold text-ink">Carga externa de la sesion por patron</h3>
          <div className="mt-3 grid gap-2">
            {Object.entries(sessionExternalLoadByPattern).length > 0 ? (
              Object.entries(sessionExternalLoadByPattern).map(([pattern, load]) => (
                <p className="flex justify-between rounded-md bg-panel/45 px-3 py-2 text-sm" key={pattern}>
                  <span className="text-ink/70">{pattern}</span>
                  <span className="font-semibold text-ink">{Math.round(load).toLocaleString("es-ES")} kg</span>
                </p>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-line bg-panel/45 p-4 text-sm font-semibold text-ink/50">
                Sin datos de ejercicios para esta sesion.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h3 className="font-semibold text-ink">Series efectivas de la sesion</h3>
          <div className="mt-3 grid gap-2">
            {Object.entries(sessionMuscleSets).length > 0 ? (
              Object.entries(sessionMuscleSets).map(([muscle, sets]) => (
                <p className="flex justify-between gap-3 rounded-md bg-panel/45 px-3 py-2 text-sm" key={muscle}>
                  <span className="text-ink/70">{formatFatigueKey(muscle)}</span>
                  <span className="font-semibold text-ink">{sets.toFixed(1)}</span>
                </p>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-line bg-panel/45 p-4 text-sm font-semibold text-ink/50">
                Sin datos de ejercicios para esta sesion.
              </p>
            )}
          </div>
        </section>
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
type PlanningRoadmapBlock = EditablePlanningBlock & { endWeek: number; startWeek: number };

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

function getPlanningBlockStatus(block: PlanningRoadmapBlock, currentBlock?: string | null) {
  if (currentBlock && block.name === currentBlock) return "En curso";
  if (currentBlock) return "Próximo";
  return block.startWeek === 1 ? "En curso" : "Próximo";
}

function getPlanningBlockStatusClass(status: string) {
  switch (status) {
    case "En curso":
      return "border-moss/25 bg-mint text-moss";
    case "Finalizado":
      return "border-line bg-panel text-ink/55";
    case "Próximo":
    default:
      return "border-steel/25 bg-sky text-steel";
  }
}

function getPlanningBlockSessions(client: CoachClient, blockName: string) {
  const normalizedBlockName = blockName.trim().toLowerCase();
  return (client.sessionRecords ?? []).filter((session) => {
    const blockValue = `${session.block ?? ""}`.trim().toLowerCase();
    return blockValue && blockValue === normalizedBlockName;
  });
}

function getPlanningBlockProgress(client: CoachClient, block: PlanningRoadmapBlock) {
  const blockSessions = getPlanningBlockSessions(client, block.name);
  const completedSessions = blockSessions.filter((session) =>
    hasRealSessionData(session) || session.status === "Completada" || session.completed
  ).length;

  return {
    completedSessions,
    completionPct: blockSessions.length > 0 ? (completedSessions / blockSessions.length) * 100 : 0,
    totalSessions: blockSessions.length
  };
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
  const [selectedPlanningBlockId, setSelectedPlanningBlockId] = useState<string | null>(client?.planning.blocks?.[0]?.id ?? null);
  const planningWeeks = getPlanningWeeks(planningPeakDate, planningEventType);
  const totalWeeks = planningBlocks.reduce((total, block) => total + block.durationWeeks, 0);
  const roadmapBlocks = planningBlocks.reduce<PlanningRoadmapBlock[]>((items, block) => {
    const startWeek = items.length > 0 ? items[items.length - 1].endWeek + 1 : 1;
    const endWeek = startWeek + block.durationWeeks - 1;
    return [...items, { ...block, endWeek, startWeek }];
  }, []);
  const selectedPlanningBlock =
    roadmapBlocks.find((block) => block.id === selectedPlanningBlockId) ?? roadmapBlocks[0] ?? null;
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
    setSelectedPlanningBlockId(client?.planning.blocks?.[0]?.id ?? null);
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
    setSelectedPlanningBlockId((current) => current === blockId ? null : current);
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
          <h3 className="font-semibold text-ink">Bloques de entrenamiento</h3>
          {planningBlocks.length === 0 ? (
            <div className="mt-3 rounded-md bg-panel/50 px-3 py-3 text-sm text-ink/65">
              Sin asignar
            </div>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {roadmapBlocks.map((block, index) => {
                const status = getPlanningBlockStatus(block, client.planning.currentBlock);
                const progress = getPlanningBlockProgress(client, block);

                return (
                <div className="min-w-0" key={block.id}>
                  <button
                    className={`min-w-0 w-full rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${
                      selectedPlanningBlock?.id === block.id ? "border-moss bg-mint/35" : "border-line bg-panel/35"
                    }`}
                    onClick={() => setSelectedPlanningBlockId(block.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-moss">Bloque {index + 1}</p>
                        <p className="mt-1 truncate font-semibold text-ink">{block.name}</p>
                      </div>
                      <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${getPlanningBlockStatusClass(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-ink/60">
                      <p>{block.durationWeeks} semanas</p>
                      <p>Semana {block.startWeek}-{block.endWeek}</p>
                      <p>Objetivo: {block.primaryObjective || "Sin definir"}</p>
                      <p>Distribucion: {block.weeklyDistribution || "Sin asignar"}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-ink/55">
                      <span>
                        {progress.totalSessions > 0
                          ? `${progress.completedSessions}/${progress.totalSessions} sesiones`
                          : "Sesiones pendientes"}
                      </span>
                      <span>{Math.round(progress.completionPct)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-moss to-steel"
                        style={{ width: `${progress.completionPct}%` }}
                      />
                    </div>
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedPlanningBlock ? (
        <PlanningBlockDetail
          block={selectedPlanningBlock}
          client={client}
          onBack={() => setSelectedPlanningBlockId(null)}
        />
      ) : null}

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
                      <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65" disabled={index === 0} onClick={(event) => { event.stopPropagation(); moveBlock(block.id, -1); }} type="button">
                        Subir
                      </button>
                      <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65" disabled={index === planningBlocks.length - 1} onClick={(event) => { event.stopPropagation(); moveBlock(block.id, 1); }} type="button">
                        Bajar
                      </button>
                      <button className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" onClick={(event) => { event.stopPropagation(); deleteBlock(block.id); }} type="button">
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

function PlanningBlockDetail({
  block,
  client,
  onBack
}: {
  block: PlanningRoadmapBlock;
  client: CoachClient;
  onBack: () => void;
}) {
  const status = getPlanningBlockStatus(block, client.planning.currentBlock);
  const progress = getPlanningBlockProgress(client, block);
  const weekRows = Array.from({ length: block.durationWeeks }, (_, index) => block.startWeek + index);
  const weekdays = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft xl:col-span-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-panel/60"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={16} />
            Volver a planificación
          </button>
          <p className="mt-5 text-xs font-semibold uppercase text-moss">Detalle del bloque</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{block.name}</h2>
          <p className="mt-2 max-w-3xl text-sm text-ink/60">
            {block.notes || block.primaryObjective || "Bloque preparado para concretar sesiones desde la vista Sesiones."}
          </p>
        </div>
        <span className={`w-fit rounded-md border px-3 py-1 text-xs font-semibold ${getPlanningBlockStatusClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <ClientInfoCard label="Duración" value={`${block.durationWeeks} semanas`} />
        <ClientInfoCard label="Fechas" value={`Semana ${block.startWeek}-${block.endWeek}`} />
        <ClientInfoCard label="Distribución" value={block.weeklyDistribution || "Sin asignar"} />
        <ClientInfoCard label="Objetivo" value={block.primaryObjective || "Sin definir"} />
        <ClientInfoCard
          label="Progreso"
          value={progress.totalSessions > 0 ? `${progress.completedSessions}/${progress.totalSessions} sesiones` : "Sin sesiones registradas"}
        />
      </div>

      <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Carga semanal del bloque</h3>
            <p className="mt-1 text-sm text-ink/55">Resumen visual basado en sesiones ya registradas para este bloque.</p>
          </div>
          <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-ink">
            {Math.round(progress.completionPct)}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-moss to-steel"
            style={{ width: `${progress.completionPct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-md border border-line bg-white p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-moss" size={18} />
          <h3 className="font-semibold text-ink">Calendario del bloque</h3>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="hidden grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-2 text-xs font-semibold uppercase text-ink/45 md:grid">
            <span>Sem.</span>
            {weekdays.map((day) => <span key={day}>{day}</span>)}
          </div>
          {weekRows.map((weekNumber) => (
            <div className="grid gap-2 rounded-md border border-line bg-panel/35 p-3 md:grid-cols-[72px_repeat(7,minmax(0,1fr))]" key={weekNumber}>
              <div className="text-sm font-semibold text-ink">Semana {weekNumber}</div>
              {weekdays.map((day, dayIndex) => (
                <div className="min-h-12 rounded-md bg-white p-2" key={`${weekNumber}-${day}`}>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-ink/35 md:hidden">{day}</p>
                  {dayIndex === 0 ? (
                    <PlanningMiniChip Icon={Target} label={block.primaryObjective || "Objetivo"} tone="moss" />
                  ) : null}
                  {dayIndex === 2 ? (
                    <PlanningMiniChip Icon={BarChart3} label={block.weeklyDistribution || "Distribución"} tone="steel" />
                  ) : null}
                  {dayIndex === 4 ? (
                    <PlanningMiniChip Icon={Plus} label="Sesiones" tone="ink" />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanningMiniChip({
  Icon,
  label,
  tone
}: {
  Icon: typeof Target;
  label: string;
  tone: "ink" | "moss" | "steel";
}) {
  const className =
    tone === "moss"
      ? "border-moss/25 bg-mint text-moss"
      : tone === "steel"
        ? "border-steel/25 bg-sky text-steel"
        : "border-line bg-panel text-ink/60";

  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${className}`}>
      <Icon className="shrink-0" size={12} />
      <span className="truncate">{label}</span>
    </span>
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
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink/65">
        <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">Cliente: {selectedPlan.clientName}</span>
        <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">Método: {getPlanningMethodLabel(selectedPlan.planningMethod) || "Sin seleccionar"}</span>
        <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">Evento: {selectedPlan.planningEventType}</span>
        {selectedPlan.planningEventType !== "Sin evento definido" ? (
          <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">Fecha: {selectedPlan.planningPeakDate || "Sin fecha"}</span>
        ) : null}
        <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">{selectedPlan.blocks.length} mesociclos</span>
        <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">{totalWeeks} semanas</span>
        {selectedPlan.planningEventName ? (
          <span className="rounded-md border border-line bg-panel/35 px-2.5 py-1.5">{selectedPlan.planningEventName}</span>
        ) : null}
      </div>
      {selectedPlan.blocks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/55">
          {selectedPlan.blocks.map((block, index) => (
            <span className="rounded-md bg-panel/35 px-2.5 py-1.5" key={block.id}>
              {index + 1}. {block.name} · {block.durationWeeks} sem.
            </span>
          ))}
        </div>
      ) : null}
    </div>
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

const exerciseVariantTypeLabels: Record<ExerciseVariantType, string> = {
  complex: "Complejo",
  direction: "Dirección",
  grip: "Agarre",
  material: "Material",
  progression: "Progresión",
  range: "Rango",
  reception: "Recepción",
  regression: "Regresión",
  stance: "Apoyo / posición",
  start_position: "Posición inicial",
  support: "Soporte",
  tempo: "Tempo"
};

const exerciseVariantDifficultyLabels: Record<ExerciseVariantDifficulty, string> = {
  advanced: "Avanzada",
  basic: "Básica",
  intermediate: "Intermedia"
};

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

            {selectedExercise.variants?.length ? (
              <div className="mt-4 rounded-md border border-line p-4">
                <h3 className="text-sm font-semibold text-ink">Variantes</h3>
                <div className="mt-3 grid gap-3">
                  {selectedExercise.variants.map((variant) => (
                    <article className="rounded-md bg-panel/45 p-3" key={variant.id}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-ink">{variant.name}</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">
                              {exerciseVariantTypeLabels[variant.type]}
                            </span>
                            {variant.difficulty ? (
                              <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-moss">
                                {exerciseVariantDifficultyLabels[variant.difficulty]}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {variant.equipment?.length ? (
                          <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">
                            {variant.equipment.join(" / ")}
                          </span>
                        ) : null}
                      </div>
                      {variant.description ? (
                        <p className="mt-3 text-sm leading-6 text-ink/70">{variant.description}</p>
                      ) : null}
                      {variant.coachingNotes ? (
                        <p className="mt-2 rounded-md bg-white px-3 py-2 text-sm text-ink/65">
                          {variant.coachingNotes}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

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

type CoachMessageThread = {
  athlete: string;
  id: string;
  lastMessage: string;
  messages: Array<{ author: "athlete" | "coach"; text: string; time: string }>;
  status: string;
  unread: number;
};

function MessagesView({ client, clients }: { client?: CoachClient | null; clients: CoachClient[] }) {
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedMessageClient, setSelectedMessageClient] = useState(client?.name ?? "Todos");

  const sourceClients = client
    ? [client]
    : selectedMessageClient === "Todos"
      ? clients
      : clients.filter((listedClient) => listedClient.name === selectedMessageClient);
  const visibleThreads: CoachMessageThread[] = sourceClients.map((listedClient) => {
    const note = listedClient.coachNotes?.trim() || "Sin notas registradas todavia.";

    return {
      athlete: listedClient.name,
      id: `client-${listedClient.id}`,
      lastMessage: note,
      messages: [
        { author: "coach", text: note, time: listedClient.coachNotes?.trim() ? "Nota inicial" : "Sistema" }
      ],
      status: listedClient.status,
      unread: 0
    };
  });
  const selectedThread =
    visibleThreads.find((thread) => thread.id === selectedThreadId) ?? visibleThreads[0] ?? null;

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
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
                setSelectedThreadId("");
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
          {visibleThreads.length > 0 ? (
            visibleThreads.map((thread) => (
              <button
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedThread?.id === thread.id
                    ? "border-moss bg-panel"
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
            ))
          ) : (
            <p className="rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              No hay conversaciones todavia.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4 shadow-soft">
        {selectedThread ? (
          <>
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
                    className={`max-w-[80%] rounded-md border px-4 py-3 text-sm ${
                      message.author === "coach"
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-panel/50 text-ink"
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

            <div className="mt-5 flex gap-2 rounded-md border border-line bg-panel/35 p-2">
              <input
                className="h-11 flex-1 rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                placeholder="Escribe un mensaje"
                type="text"
              />
              <button className="rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90" type="button">
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-line bg-panel/35 p-6 text-center">
            <h2 className="text-lg font-semibold text-ink">No hay conversaciones todavia.</h2>
            <p className="mt-2 text-sm text-ink/55">
              Las conversaciones apareceran cuando exista un cliente o una nota asociada.
            </p>
          </div>
        )}
      </section>
    </div>
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

type AssessmentEntry = ClientAssessment & {
  notes?: string;
  unit?: string;
};

const assessmentCategoriesSimple = [
  "Fuerza",
  "Resistencia",
  "Salto",
  "FMS",
  "Movilidad",
  "Antropometría",
  "Cuestionarios",
  "Técnica",
  "Otro"
];

const emptyAssessmentDraft = {
  category: "Fuerza",
  date: "",
  name: "",
  notes: "",
  result: "",
  unit: ""
};

const assessmentQuickActions = [
  { category: "Fuerza", label: "Nuevo test de fuerza" },
  { category: "Resistencia", label: "Nuevo test de resistencia" },
  { category: "Salto", label: "Nuevo test de salto" },
  { category: "FMS", label: "Nuevo test FMS" },
  { category: assessmentCategoriesSimple[5], label: "Nueva antropometr\u00eda" }
];

function AssessmentsView({
  client,
  onUpdateClient
}: {
  client?: CoachClient | null;
  onUpdateClient?: (updatedClient: CoachClient) => void;
}) {
  const [showNewAssessmentForm, setShowNewAssessmentForm] = useState(false);
  const [assessmentDraft, setAssessmentDraft] = useState(emptyAssessmentDraft);
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState<number | null>(null);
  const assessments: AssessmentEntry[] = client?.assessments ?? [];
  const isEditingAssessment = editingAssessmentIndex !== null;
  const assessmentModalTitle = isEditingAssessment
    ? "Editar test"
    : assessmentDraft.category === "Fuerza"
      ? "Nuevo test de fuerza"
      : assessmentDraft.category === "Resistencia"
        ? "Nuevo test de resistencia"
        : assessmentDraft.category === "Salto"
          ? "Nuevo test de salto"
          : assessmentDraft.category === "FMS"
            ? "Nuevo test FMS"
            : assessmentDraft.category === assessmentCategoriesSimple[5]
              ? "Nueva antropometr\u00eda"
              : "Nuevo test";

  useEffect(() => {
    setShowNewAssessmentForm(false);
    setAssessmentDraft(emptyAssessmentDraft);
    setEditingAssessmentIndex(null);
  }, [client?.id]);

  useEffect(() => {
    if (!showNewAssessmentForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") resetAssessmentForm();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNewAssessmentForm]);

  const updateAssessmentDraft = (field: keyof typeof assessmentDraft, value: string) => {
    setAssessmentDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const resetAssessmentForm = () => {
    setAssessmentDraft(emptyAssessmentDraft);
    setEditingAssessmentIndex(null);
    setShowNewAssessmentForm(false);
  };

  const openNewAssessmentForm = (category = "Fuerza") => {
    setAssessmentDraft({ ...emptyAssessmentDraft, category });
    setEditingAssessmentIndex(null);
    setShowNewAssessmentForm(true);
  };

  const handleSaveAssessment = () => {
    if (!client || !onUpdateClient || (!assessmentDraft.name.trim() && !assessmentDraft.result.trim())) return;

    const resultWithUnit = `${assessmentDraft.result.trim()}${assessmentDraft.unit.trim() ? ` ${assessmentDraft.unit.trim()}` : ""}`.trim();

    const newAssessment: AssessmentEntry = {
      action: "Ver historial",
      date: assessmentDraft.date || "Sin fecha",
      name: assessmentDraft.name.trim() || "Test sin nombre",
      notes: assessmentDraft.notes.trim(),
      result: resultWithUnit || "Sin resultado",
      type: assessmentDraft.category,
      unit: assessmentDraft.unit.trim()
    };

    if (editingAssessmentIndex !== null) {
      onUpdateClient({
        ...client,
        assessments: (client.assessments ?? []).map((assessment, index) =>
          index === editingAssessmentIndex ? newAssessment : assessment
        )
      });
      resetAssessmentForm();
      return;
    }

    onUpdateClient({
      ...client,
      assessments: [
        newAssessment,
        ...(client.assessments ?? [])
      ]
    });
    resetAssessmentForm();
  };

  const handleEditAssessment = (assessment: AssessmentEntry, index: number) => {
    setAssessmentDraft({
      category: assessment.type,
      date: assessment.date === "Sin fecha" ? "" : assessment.date,
      name: assessment.name,
      notes: assessment.notes ?? "",
      result: assessment.result,
      unit: assessment.unit ?? ""
    });
    setEditingAssessmentIndex(index);
    setShowNewAssessmentForm(true);
  };

  const handleDeleteAssessment = (targetIndex: number) => {
    if (!client || !onUpdateClient) return;

    onUpdateClient({
      ...client,
      assessments: (client.assessments ?? []).filter((_, index) => index !== targetIndex)
    });

    if (editingAssessmentIndex === targetIndex) resetAssessmentForm();
  };

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {client ? `Tests de ${client.name}` : "Tests"}
            </h2>
            <p className="mt-1 text-sm text-ink/55">Historial asociado al cliente activo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {assessmentQuickActions.map((action) => (
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-3 text-sm font-semibold text-white"
                disabled={!client}
                key={action.label}
                onClick={() => openNewAssessmentForm(action.category)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {showNewAssessmentForm ? (
          <div
            aria-labelledby="assessment-modal-title"
            aria-modal="true"
            className="assessment-modal-overlay"
            onClick={resetAssessmentForm}
            role="dialog"
          >
            <form
              className="assessment-modal-panel"
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => event.preventDefault()}
            >
              <header className="assessment-modal-header flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-ink" id="assessment-modal-title">{assessmentModalTitle}</h3>
                  <p className="mt-1 text-sm text-ink/55">Registra el test en el historial del cliente activo.</p>
                </div>
                <button
                  aria-label="Cerrar"
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink/60 transition hover:bg-panel hover:text-ink"
                  onClick={resetAssessmentForm}
                  type="button"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="assessment-modal-body px-5 py-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold text-ink/70">
                    {"Categor\u00eda"}
                    <select
                      className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("category", event.target.value)}
                      value={assessmentDraft.category}
                    >
                      {assessmentCategoriesSimple.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-ink/70">
                    Test / {"medici\u00f3n"}
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("name", event.target.value)}
                      value={assessmentDraft.name}
                    />
                  </label>
                  <label className="text-sm font-semibold text-ink/70">
                    Fecha
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("date", event.target.value)}
                      type="date"
                      value={assessmentDraft.date}
                    />
                  </label>
                  <label className="text-sm font-semibold text-ink/70">
                    Resultado
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("result", event.target.value)}
                      value={assessmentDraft.result}
                    />
                  </label>
                  <label className="text-sm font-semibold text-ink/70">
                    Unidad
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("unit", event.target.value)}
                      placeholder="kg, cm, segundos, repeticiones, puntos, %, m, W, bpm"
                      value={assessmentDraft.unit}
                    />
                  </label>
                  <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                    Notas
                    <textarea
                      className="mt-1 min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss"
                      onChange={(event) => updateAssessmentDraft("notes", event.target.value)}
                      value={assessmentDraft.notes}
                    />
                  </label>
                </div>
              </div>

              <footer className="assessment-modal-footer flex flex-wrap justify-end gap-2 px-5 py-4">
                <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={resetAssessmentForm} type="button">
                  Cancelar
                </button>
                <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSaveAssessment} type="button">
                  {isEditingAssessment ? "Guardar cambios" : "Guardar test"}
                </button>
              </footer>
            </form>
          </div>
        ) : null}

        {assessments.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assessments.map((assessment, index) => (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={`${assessment.date}-${assessment.name}-${index}`}>
                <p className="text-xs font-semibold uppercase text-moss">{assessment.type}</p>
                <p className="mt-2 font-semibold text-ink">{assessment.name}</p>
                <p className="mt-1 text-sm font-semibold text-ink/70">{assessment.result}</p>
                <p className="mt-2 text-xs text-ink/45">{assessment.date}</p>
                {assessment.notes ? (
                  <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-ink/65">{assessment.notes}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/70"
                    onClick={() => handleEditAssessment(assessment, index)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                    onClick={() => handleDeleteAssessment(index)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm text-ink/55">
            No hay valoraciones registradas todavía.
          </div>
        )}
      </section>
    </div>
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

function calculateMuscleFatigue(sessions: TrainingSessionInput[] = []) {
  const weeklyMuscleSets = calculateWeeklyMuscleSets(
    sessions,
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
type StrengthIntensityMethod = "rir" | "rpe" | "percent_1rm" | "velocity" | "kg" | "external_load";
type EnduranceIntensityMethod = "zones" | "rounds" | "thresholds";
type PlannedStrengthExerciseDraft = {
  block: StrengthSessionBlock;
  exerciseId: string;
  exerciseSearch: string;
  id: string;
  intensityMethod?: "" | StrengthIntensityMethod;
  load: string;
  observation: string;
  percent1RM?: string;
  reps: string;
  rest: string;
  selectedEquipment?: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  sets: string;
  targetRir: string;
  targetRpe: string;
  targetVelocity?: string;
};
type SessionTemplateExercise = PlannedStrengthExerciseDraft;
type SessionTemplate = {
  createdAt: string;
  description: string;
  enduranceMethod?: EnduranceIntensityMethod;
  id: string;
  name: string;
  sessionType: CoachSessionType;
  strengthMethod?: StrengthIntensityMethod;
  strengthExercises: SessionTemplateExercise[];
  summary: string;
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

const cardioSportOptions: Array<{ label: string; value: NonNullable<CardioPlan["sport"]> }> = [
  { label: "Carrera", value: "run" },
  { label: "Ciclismo", value: "ride" },
  { label: "Natación", value: "swim" },
  { label: "Remo", value: "row" },
  { label: "Caminar", value: "walk" },
  { label: "Otro", value: "other" }
];
const cardioZoneOptions: Array<{ label: string; value: CardioZone }> = [
  { label: "Z1", value: "z1" },
  { label: "Z2", value: "z2" },
  { label: "Z3", value: "z3" },
  { label: "Z4", value: "z4" },
  { label: "Z5", value: "z5" }
];
const strengthIntensityMethodOptions: Array<{ label: string; value: StrengthIntensityMethod }> = [
  { label: "RPE", value: "rpe" },
  { label: "RIR", value: "rir" },
  { label: "%1RM", value: "percent_1rm" },
  { label: "Velocidad de barra", value: "velocity" }
];
type CardioPlanDraft = {
  notes: string;
  sport: NonNullable<CardioPlan["sport"]>;
  targetDistanceMeters: string;
  targetDurationMinutes: string;
  targetRpeMax: string;
  targetRpeMin: string;
  targetZone: "" | CardioZone;
};

function buildCardioPlanFromDraft(draft: CardioPlanDraft): CardioPlan | undefined {
  const plan: CardioPlan = {};
  const targetDurationMinutes = Number(draft.targetDurationMinutes);
  const targetDistanceMeters = Number(draft.targetDistanceMeters);
  const targetRpeMin = Number(draft.targetRpeMin);
  const targetRpeMax = Number(draft.targetRpeMax);

  if (draft.sport) plan.sport = draft.sport;
  if (Number.isFinite(targetDurationMinutes) && targetDurationMinutes > 0) plan.targetDurationMinutes = targetDurationMinutes;
  if (draft.targetZone) plan.targetZone = draft.targetZone;
  if (Number.isFinite(targetRpeMin) && targetRpeMin > 0) plan.targetRpeMin = targetRpeMin;
  if (Number.isFinite(targetRpeMax) && targetRpeMax > 0) plan.targetRpeMax = targetRpeMax;
  if (Number.isFinite(targetDistanceMeters) && targetDistanceMeters > 0) plan.targetDistanceMeters = targetDistanceMeters;
  if (draft.notes.trim()) plan.notes = draft.notes.trim();

  return Object.keys(plan).length > 1 || plan.targetDurationMinutes || plan.targetZone || plan.targetDistanceMeters || plan.notes
    ? plan
    : undefined;
}

function getPlanningWeekNumber(currentWeek: string) {
  const match = currentWeek.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function CoachTrainingPlanner({
  client,
  clients,
  onConsumeTargetTrainingSession,
  onUpdateClient,
  sessionTemplates,
  setSessionTemplates,
  targetTrainingSession
}: {
  client?: CoachClient | null;
  clients: CoachClient[];
  onConsumeTargetTrainingSession: () => void;
  onUpdateClient: (updatedClient: CoachClient) => void;
  sessionTemplates: SessionTemplate[];
  setSessionTemplates: React.Dispatch<React.SetStateAction<SessionTemplate[]>>;
  targetTrainingSession: TargetTrainingSession | null;
}) {
  const [activeSessionPanel, setActiveSessionPanel] = useState<CoachSessionPanel>("planner");
  const [selectedSessionClientId, setSelectedSessionClientId] = useState(client?.id ?? clients[0]?.id ?? "");
  const activeSessionClient =
    client ?? clients.find((listedClient) => listedClient.id === selectedSessionClientId) ?? null;
  const activePlanningWeek = activeSessionClient ? getPlanningWeekNumber(activeSessionClient.planning.currentWeek) : 0;
  const [selectedBlockWeek, setSelectedBlockWeek] = useState(activePlanningWeek);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState<CoachSessionType>("Fuerza");
  const [sessionStrengthMethod, setSessionStrengthMethod] = useState<StrengthIntensityMethod>("rir");
  const [sessionEnduranceMethod, setSessionEnduranceMethod] = useState<EnduranceIntensityMethod>("zones");
  const [sessionSummary, setSessionSummary] = useState(plannedSession.title);
  const [sessionTargetRpe, setSessionTargetRpe] = useState("");
  const [cardioPlanDraft, setCardioPlanDraft] = useState<CardioPlanDraft>({
    notes: "",
    sport: "run",
    targetDistanceMeters: "",
    targetDurationMinutes: "",
    targetRpeMax: "",
    targetRpeMin: "",
    targetZone: ""
  });
  const [sessionSendMessage, setSessionSendMessage] = useState("");
  const [showSessionSummaryModal, setShowSessionSummaryModal] = useState(false);
  const [strengthExercises, setStrengthExercises] = useState<PlannedStrengthExerciseDraft[]>([]);
  const [collapsedStrengthBlocks, setCollapsedStrengthBlocks] = useState<Record<StrengthSessionBlock, boolean>>({
    activation: false,
    auxiliary: false,
    main: false
  });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateName, setTemplateName] = useState("");
  const plannedTonnage = strengthExercises.reduce(
    (total, exercise) => total + Number(exercise.sets || 0) * Number(exercise.reps || 0) * Number(exercise.load || 0),
    0
  );
  const plannedSessionsInSelectedWeek =
    activeSessionClient && selectedBlockWeek > 0
      ? (activeSessionClient.sessionRecords ?? []).filter((session) => Number(session.week) === selectedBlockWeek).length
      : 0;
  const calculatedSessionNumber =
    selectedBlockWeek > 0
      ? (selectedBlockWeek === activePlanningWeek ? plannedSessionsInSelectedWeek : 0) + 1
      : null;
  const currentBlockLabel = activeSessionClient?.planning.currentBlock || "Sin asignar";
  const fatigueAlerts = calculateMuscleFatigue(getClientTrainingSessionInputs(activeSessionClient))
    .filter((item) => ["Rojo", "Naranja"].includes(item.status))
    .slice(0, 4);
  const weeklyZoneAlerts = calculateFatigueZones(
    (activeSessionClient?.sessionRecords ?? []).filter((session) => hasRealSessionData(session) && isSessionThisWeek(session.date))
  ).filter((zone) => zone.level === "moderate" || zone.level === "high");
  useEffect(() => {
    setSelectedBlockWeek(activePlanningWeek);
  }, [activePlanningWeek, activeSessionClient?.id]);
  useEffect(() => {
    if (activeSessionClient && targetTrainingSession?.clientId === activeSessionClient.id) {
      setActiveSessionPanel("history");
    }
  }, [activeSessionClient, targetTrainingSession]);
  useEffect(() => {
    if (!showSessionSummaryModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSessionSummaryModal(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSessionSummaryModal]);

  if (!activeSessionClient) {
    return (
      <section className="mt-6 rounded-md border border-dashed border-line bg-white p-6 text-center shadow-soft">
        <h2 className="text-lg font-semibold text-ink">No hay clientes disponibles.</h2>
        <p className="mt-2 text-sm text-ink/55">
          Crea un cliente o carga datos demo para planificar sesiones.
        </p>
      </section>
    );
  }

  const moveExerciseFieldFocus = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    exerciseId: string,
    currentField: string
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    const fieldOrder = ["sets", "reps", "load", "rest", "intensity"];
    const currentIndex = fieldOrder.indexOf(currentField);
    const nextIndex = event.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;
    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= fieldOrder.length) return;

    event.preventDefault();
    document
      .querySelector<HTMLElement>(`[data-planner-field="${exerciseId}-${fieldOrder[nextIndex]}"]`)
      ?.focus();
  };
  const addStrengthExercise = (block: StrengthSessionBlock) => {
    setStrengthExercises((current) => [
      ...current,
      {
        block,
        exerciseId: "",
        exerciseSearch: "",
        id: `exercise-${Date.now()}-${current.length}`,
        intensityMethod: "rir",
        load: "",
        observation: "",
        percent1RM: "",
        reps: "",
        rest: "",
        sets: "",
        targetRir: "",
        targetRpe: "",
        targetVelocity: ""
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
  const selectStrengthLibraryExercise = (draftExerciseId: string, libraryExercise: ExerciseDefinition) => {
    updateStrengthExercise(draftExerciseId, {
      exerciseId: libraryExercise.id,
      exerciseSearch: libraryExercise.name,
      selectedEquipment: libraryExercise.equipment.length === 1 ? libraryExercise.equipment[0] : "",
      selectedVariantId: "",
      selectedVariantName: ""
    });
  };
  const removeStrengthExercise = (exerciseId: string) => {
    setStrengthExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
  };
  const updateCardioPlanDraft = (field: keyof CardioPlanDraft, value: string) => {
    setCardioPlanDraft((current) => ({ ...current, [field]: value }));
  };
  const markSessionAsReviewed = (sessionIndex: number, reviewNotes = "") => {
    onUpdateClient({
      ...activeSessionClient,
      sessionRecords: (activeSessionClient.sessionRecords ?? []).map((session, index) =>
        index === sessionIndex
          ? {
              ...session,
              reviewedAt: new Date().toISOString(),
              reviewNotes,
              reviewStatus: "reviewed"
            }
          : session
      )
    });
  };
  const plannedTemplateExercises = strengthExercises.map((exercise) => ({
    block: exercise.block,
    exerciseId: exercise.exerciseId,
    exerciseSearch: exercise.exerciseSearch,
    id: exercise.id,
    intensityMethod: exercise.intensityMethod,
    load: exercise.load,
    observation: exercise.observation,
    percent1RM: exercise.percent1RM,
    reps: exercise.reps,
    rest: exercise.rest,
    selectedEquipment: exercise.selectedEquipment || undefined,
    selectedVariantId: exercise.selectedVariantId || undefined,
    selectedVariantName: exercise.selectedVariantName || undefined,
    sets: exercise.sets,
    targetRir: exercise.targetRir,
    targetRpe: exercise.targetRpe,
    targetVelocity: exercise.targetVelocity || undefined
  }));
  const sendSessionToAthlete = () => {
    if (!sessionDate) {
      setSessionSendMessage("Selecciona una fecha antes de enviar la sesión.");
      return;
    }

    const sessionNumber = calculatedSessionNumber ?? 1;
    const duplicateSession = (activeSessionClient.sessionRecords ?? []).some((session) =>
      session.date === sessionDate &&
      Number(session.week) === selectedBlockWeek &&
      Number(session.sessionNumber) === sessionNumber
    );

    if (duplicateSession) {
      setSessionSendMessage("Esta sesión ya está asignada al deportista.");
      return;
    }

    const plannedExercises: ConnectedSessionExercise[] = strengthExercises.map((exercise) => ({
      block: exercise.block,
      exerciseId: exercise.exerciseId || null,
      exerciseName: getExerciseById(exercise.exerciseId)?.name ?? (exercise.exerciseSearch.trim() || "Ejercicio sin especificar"),
      id: exercise.id,
      intensityMethod: exercise.intensityMethod || undefined,
      observation: exercise.observation,
      percent1RM: exercise.percent1RM,
      plannedLoad: exercise.load,
      plannedReps: exercise.reps,
      plannedRest: exercise.rest,
      plannedRir: exercise.targetRir,
      plannedRpe: exercise.targetRpe,
      plannedSets: exercise.sets,
      targetVelocity: exercise.targetVelocity,
      selectedEquipment: exercise.selectedEquipment || undefined,
      selectedVariantId: exercise.selectedVariantId || undefined,
      selectedVariantName: exercise.selectedVariantName || undefined,
      section: exercise.block
    }));
    const cardioPlan = buildCardioPlanFromDraft(cardioPlanDraft);
    const plannedRecord: ClientSessionRecord = {
      block: currentBlockLabel || "Sin asignar",
      cardioPlan,
      completed: false,
      date: sessionDate,
      enduranceMethod: sessionEnduranceMethod,
      performedExercises: [],
      plannedExercises,
      sessionNumber,
      status: "Planificada",
      strengthMethod: sessionStrengthMethod,
      summary: sessionSummary.trim() || "Sesión planificada",
      targetRpe: sessionTargetRpe,
      type: sessionType,
      week: selectedBlockWeek,
      weekLabel: `Semana ${selectedBlockWeek}`
    };

    onUpdateClient({
      ...activeSessionClient,
      sessionRecords: [plannedRecord, ...(activeSessionClient.sessionRecords ?? [])]
    });
    setSessionSendMessage("Sesión enviada al deportista.");
  };
  const resetTemplateForm = () => {
    setShowTemplateForm(false);
    setTemplateDescription("");
    setTemplateName("");
  };
  const saveCurrentSessionAsTemplate = () => {
    if (!templateName.trim()) return;
    if (!sessionSummary.trim() && plannedTemplateExercises.length === 0) return;

    setSessionTemplates((currentTemplates) => [
      {
        createdAt: new Date().toISOString(),
        description: templateDescription.trim(),
        enduranceMethod: sessionEnduranceMethod,
        id: `template-${Date.now()}`,
        name: templateName.trim(),
        sessionType,
        strengthMethod: sessionStrengthMethod,
        strengthExercises: plannedTemplateExercises,
        summary: sessionSummary.trim(),
      },
      ...currentTemplates
    ]);
    resetTemplateForm();
  };
  const loadSessionTemplate = (template: SessionTemplate) => {
    if (strengthExercises.length > 0 && !window.confirm("Esto reemplazará los ejercicios actuales. ¿Continuar?")) return;

    setSessionType(template.sessionType);
    setSessionStrengthMethod(template.strengthMethod ?? "rir");
    setSessionEnduranceMethod(template.enduranceMethod ?? "zones");
    setSessionSummary(template.summary);
    setStrengthExercises(
      template.strengthExercises.map((exercise, index) => ({
        ...exercise,
        id: `exercise-${Date.now()}-${index}`,
        intensityMethod: exercise.intensityMethod ?? "",
        percent1RM: exercise.percent1RM ?? "",
        selectedEquipment: exercise.selectedEquipment ?? "",
        selectedVariantId: exercise.selectedVariantId ?? "",
        selectedVariantName: exercise.selectedVariantName ?? "",
        targetRir: exercise.targetRir ?? "",
        targetRpe: exercise.targetRpe ?? "",
        targetVelocity: exercise.targetVelocity ?? ""
      }))
    );
  };
  const deleteSessionTemplate = (templateId: string) => {
    setSessionTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));
  };
  const getExerciseIntensitySummary = (exercise: PlannedStrengthExerciseDraft) => {
    const method = exercise.intensityMethod || "rir";
    if (method === "rpe" && exercise.targetRpe) return `RPE ${exercise.targetRpe}`;
    if (method === "rir" && exercise.targetRir) return `RIR ${exercise.targetRir}`;
    if (method === "percent_1rm" && exercise.percent1RM) return `${exercise.percent1RM}%1RM`;
    if (method === "velocity" && exercise.targetVelocity) return `${exercise.targetVelocity} m/s`;
    return "";
  };
  const getExerciseSummaryLine = (exercise: PlannedStrengthExerciseDraft) => {
    const name = getExerciseById(exercise.exerciseId)?.name ?? (exercise.exerciseSearch.trim() || "Ejercicio sin especificar");
    const volume = [exercise.sets, exercise.reps].filter(Boolean).length === 2
      ? `${exercise.sets}x${exercise.reps}`
      : [exercise.sets ? `${exercise.sets} series` : "", exercise.reps ? `${exercise.reps} reps` : ""].filter(Boolean).join(" · ");
    const intensity = getExerciseIntensitySummary(exercise);
    const mainLine = [name, volume].filter(Boolean).join(" ");
    const variantLine = exercise.selectedVariantName ? `Variante: ${exercise.selectedVariantName}` : "";

    return {
      main: `${mainLine}${intensity ? ` (${intensity})` : ""}`,
      variant: variantLine
    };
  };
  const confirmSendSessionToAthlete = () => {
    sendSessionToAthlete();
    setShowSessionSummaryModal(false);
  };
  const renderStrengthBlock = (block: StrengthSessionBlock, title: string) => {
    const blockExercises = strengthExercises.filter((exercise) => exercise.block === block);
    const isCollapsed = collapsedStrengthBlocks[block];
    const blockLabel = title.toUpperCase();
    const exerciseCountLabel = `${blockExercises.length} ${blockExercises.length === 1 ? "ejercicio" : "ejercicios"}`;

    return (
      <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <button
          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-semibold uppercase tracking-wide text-ink transition hover:text-moss"
          onClick={() => setCollapsedStrengthBlocks((current) => ({ ...current, [block]: !current[block] }))}
          type="button"
        >
          <span className="text-lg leading-none">{isCollapsed ? "›" : "⌄"}</span>
          <span>{blockLabel} · {exerciseCountLabel}</span>
        </button>
        {!isCollapsed ? (
        <>
        <div className="mt-3 flex justify-end">
          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => addStrengthExercise(block)}
            type="button"
          >
            <Plus size={16} />
            Añadir ejercicio
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
            const effectiveIntensityMethod = exercise.intensityMethod || "rir";
            const equipmentOptions = selectedLibraryExercise?.equipment ?? [];
            const selectedVariant =
              selectedLibraryExercise?.variants?.find((variant) => variant.id === exercise.selectedVariantId) ?? null;

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
                        exerciseSearch: event.target.value,
                        selectedEquipment: "",
                        selectedVariantId: "",
                        selectedVariantName: ""
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
                          onClick={() => selectStrengthLibraryExercise(exercise.id, libraryExercise)}
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
              {selectedLibraryExercise && (equipmentOptions.length > 0 || selectedLibraryExercise.variants?.length) ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {equipmentOptions.length > 0 ? (
                    <label className="space-y-1 text-xs font-semibold text-ink/55">
                      Material
                      <select
                        className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                        onChange={(event) => updateStrengthExercise(exercise.id, { selectedEquipment: event.target.value })}
                        value={exercise.selectedEquipment ?? ""}
                      >
                        <option value="">Seleccionar material</option>
                        {equipmentOptions.map((equipment) => (
                          <option key={equipment} value={equipment}>{equipment}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {selectedLibraryExercise.variants?.length ? (
                    <label className="space-y-1 text-xs font-semibold text-ink/55">
                      Variante
                      <select
                        className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                        onChange={(event) => {
                          const variant = selectedLibraryExercise.variants?.find((item) => item.id === event.target.value);
                          updateStrengthExercise(exercise.id, {
                            selectedVariantId: variant?.id ?? "",
                            selectedVariantName: variant?.name ?? ""
                          });
                        }}
                        value={exercise.selectedVariantId ?? ""}
                      >
                        <option value="">Sin variante específica</option>
                        {selectedLibraryExercise.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>{variant.name}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {selectedVariant ? (
                    <div className="rounded-md border border-line bg-panel/35 p-3 text-xs font-medium text-ink/65 md:col-span-2">
                      <p className="font-semibold text-ink">
                        {selectedVariant.difficulty ? exerciseVariantDifficultyLabels[selectedVariant.difficulty] : "Variante"} · {exerciseVariantTypeLabels[selectedVariant.type]}
                      </p>
                      {selectedVariant.coachingNotes ? (
                        <p className="mt-1">{selectedVariant.coachingNotes}</p>
                      ) : selectedVariant.description ? (
                        <p className="mt-1">{selectedVariant.description}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Metodo
                  <select
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-2 text-sm font-semibold text-ink outline-none focus:border-moss"
                    onChange={(event) =>
                      updateStrengthExercise(exercise.id, { intensityMethod: event.target.value as PlannedStrengthExerciseDraft["intensityMethod"] })
                    }
                    value={exercise.intensityMethod || "rir"}
                  >
                    {strengthIntensityMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Series
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    data-planner-field={`${exercise.id}-sets`}
                    inputMode="numeric"
                    onChange={(event) => updateStrengthExercise(exercise.id, { sets: event.target.value })}
                    onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "sets")}
                    type="text"
                    value={exercise.sets}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Reps
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    data-planner-field={`${exercise.id}-reps`}
                    inputMode="numeric"
                    onChange={(event) => updateStrengthExercise(exercise.id, { reps: event.target.value })}
                    onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "reps")}
                    type="text"
                    value={exercise.reps}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Carga
                  <div className="flex h-10 overflow-hidden rounded-md border border-line bg-panel/35 focus-within:border-moss">
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink outline-none"
                      data-planner-field={`${exercise.id}-load`}
                      inputMode="decimal"
                      onChange={(event) => updateStrengthExercise(exercise.id, { load: event.target.value })}
                      onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "load")}
                      type="text"
                      value={exercise.load}
                    />
                    <span className="flex items-center bg-white px-2 text-xs font-semibold text-ink/50">kg</span>
                  </div>
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Descanso
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    data-planner-field={`${exercise.id}-rest`}
                    onChange={(event) => updateStrengthExercise(exercise.id, { rest: event.target.value })}
                    onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "rest")}
                    inputMode="numeric"
                    placeholder="02:30"
                    value={exercise.rest}
                  />
                </label>
                {effectiveIntensityMethod === "rpe" ? (
                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                    RPE
                    <input
                      className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                      data-planner-field={`${exercise.id}-intensity`}
                      inputMode="decimal"
                      onChange={(event) => updateStrengthExercise(exercise.id, { targetRpe: event.target.value })}
                      onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "intensity")}
                      placeholder="0-10"
                      type="text"
                      value={exercise.targetRpe}
                    />
                  </label>
                ) : effectiveIntensityMethod === "percent_1rm" ? (
                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                    %1RM
                    <input
                      className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                      data-planner-field={`${exercise.id}-intensity`}
                      inputMode="decimal"
                      onChange={(event) => updateStrengthExercise(exercise.id, { percent1RM: event.target.value })}
                      onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "intensity")}
                      placeholder="%"
                      type="text"
                      value={exercise.percent1RM ?? ""}
                    />
                  </label>
                ) : effectiveIntensityMethod === "velocity" ? (
                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                    Velocidad
                    <div className="flex h-10 overflow-hidden rounded-md border border-line bg-panel/35 focus-within:border-moss">
                      <input
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-ink outline-none"
                        data-planner-field={`${exercise.id}-intensity`}
                        inputMode="decimal"
                        onChange={(event) => updateStrengthExercise(exercise.id, { targetVelocity: event.target.value })}
                        onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "intensity")}
                        placeholder="m/s"
                        type="text"
                        value={exercise.targetVelocity ?? ""}
                      />
                      <span className="flex items-center bg-white px-2 text-xs font-semibold text-ink/50">m/s</span>
                    </div>
                  </label>
                ) : (
                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                    RIR
                    <input
                      className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                      data-planner-field={`${exercise.id}-intensity`}
                      inputMode="decimal"
                      onChange={(event) => updateStrengthExercise(exercise.id, { targetRir: event.target.value })}
                      onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "intensity")}
                      placeholder="RIR"
                      type="text"
                      value={exercise.targetRir}
                    />
                  </label>
                )}
              </div>
            </article>
            );
          })}
        </div>
        </>
        ) : null}
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

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-line border-l-clay border-l-4 bg-panel/35 p-4">
            <p className="text-sm font-semibold text-ink">Lesiones / limitaciones</p>
            <p className="mt-2 text-sm text-ink/65">{activeSessionClient.injuries || "Sin lesiones registradas."}</p>
          </div>
          <div className="rounded-md border border-line border-l-coral border-l-4 bg-panel/35 p-4">
            <p className="text-sm font-semibold text-ink">Fatiga muscular a vigilar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fatigueAlerts.length > 0 ? fatigueAlerts.map((item) => (
                <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-coral" key={item.muscle}>
                  {item.muscle} {item.fatigueScore}%
                </span>
              )) : (
                <span className="text-sm text-ink/65">Sin grupos en alerta alta.</span>
              )}
            </div>
          </div>
          <div className="rounded-md border border-line bg-panel/35 p-4">
            <p className="text-sm font-semibold text-ink">Zonas a vigilar</p>
            <div className="mt-2 grid gap-2">
              {weeklyZoneAlerts.length > 0 ? weeklyZoneAlerts.map((zone) => (
                <div
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${getPlanningZoneAlertClass(zone.level)}`}
                  key={zone.key}
                >
                  <p>{zone.label}</p>
                  <p className="mt-1 font-medium">
                    {zone.level === "high"
                      ? "Carga alta esta semana. Valora recuperación y objetivo de la sesión."
                      : "Carga moderada esta semana."}
                  </p>
                </div>
              )) : (
                <span className="text-sm font-medium text-ink/55">Sin zonas especialmente cargadas esta semana.</span>
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
              onChange={(event) => setSessionTargetRpe(event.target.value)}
              placeholder="0-10"
              type="number"
              value={sessionTargetRpe}
            />
          </label>
        </div>
        </section>

        <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Resumen / objetivo de la sesion
            <textarea
              className="min-h-16 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-moss"
              onChange={(event) => setSessionSummary(event.target.value)}
              placeholder="Ej: Fuerza tren inferior + zona 2"
              value={sessionSummary}
            />
          </label>
        </section>

        <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-ink">Plantillas guardadas</h3>
              <p className="mt-1 text-sm text-ink/55">Guarda y reutiliza estructuras planificadas sin asociarlas a un cliente.</p>
            </div>
            <button
              className="inline-flex w-fit items-center justify-center rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
              onClick={() => setShowTemplateForm((current) => !current)}
              type="button"
            >
              Guardar como plantilla
            </button>
          </div>

          {showTemplateForm ? (
            <div className="mt-4 rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Nombre de plantilla
                  <input
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setTemplateName(event.target.value)}
                    placeholder="Ej: Fuerza tren inferior"
                    value={templateName}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Descripcion breve
                  <input
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setTemplateDescription(event.target.value)}
                    placeholder="Ej: Sentadilla + hinge + accesorios"
                    value={templateDescription}
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink/70"
                  onClick={resetTemplateForm}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                  onClick={saveCurrentSessionAsTemplate}
                  type="button"
                >
                  Guardar plantilla
                </button>
              </div>
            </div>
          ) : null}

          {sessionTemplates.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sessionTemplates.map((template) => (
                <article className="rounded-md border border-line bg-white p-4" key={template.id}>
                  <p className="font-semibold text-ink">{template.name}</p>
                  {template.description ? (
                    <p className="mt-1 text-sm text-ink/60">{template.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs font-semibold text-moss">
                    {template.sessionType} - {template.strengthExercises.length} ejercicios
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={() => loadSessionTemplate(template)}
                      type="button"
                    >
                      Cargar
                    </button>
                    <button
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                      onClick={() => deleteSessionTemplate(template.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-line bg-white px-4 py-5 text-sm font-medium text-ink/45">
              Todavia no hay plantillas guardadas.
            </div>
          )}
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
            {renderStrengthBlock("activation", "Activación")}
            {renderStrengthBlock("main", "Bloque principal")}
            {renderStrengthBlock("auxiliary", "Bloque auxiliar / opcional")}
          </>
        ) : sessionType === "Cardio" ? (
          <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Cardio / resistencia</h3>
            <p className="mt-1 text-sm text-ink/55">Bloque opcional para comparar el trabajo planificado con el registro real.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Deporte / modalidad
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => updateCardioPlanDraft("sport", event.target.value)}
                  value={cardioPlanDraft.sport}
                >
                  {cardioSportOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Duración objetivo
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  min={0}
                  onChange={(event) => updateCardioPlanDraft("targetDurationMinutes", event.target.value)}
                  placeholder="Minutos"
                  type="number"
                  value={cardioPlanDraft.targetDurationMinutes}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Zona objetivo
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => updateCardioPlanDraft("targetZone", event.target.value)}
                  value={cardioPlanDraft.targetZone}
                >
                  <option value="">Sin zona objetivo</option>
                  {cardioZoneOptions.map((zone) => (
                    <option key={zone.value} value={zone.value}>{zone.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Distancia objetivo
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  min={0}
                  onChange={(event) => updateCardioPlanDraft("targetDistanceMeters", event.target.value)}
                  placeholder="Metros"
                  type="number"
                  value={cardioPlanDraft.targetDistanceMeters}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                RPE objetivo mínimo
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  max={10}
                  min={0}
                  onChange={(event) => updateCardioPlanDraft("targetRpeMin", event.target.value)}
                  placeholder="0-10"
                  type="number"
                  value={cardioPlanDraft.targetRpeMin}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                RPE objetivo máximo
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  max={10}
                  min={0}
                  onChange={(event) => updateCardioPlanDraft("targetRpeMax", event.target.value)}
                  placeholder="0-10"
                  type="number"
                  value={cardioPlanDraft.targetRpeMax}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                Notas
                <textarea
                  className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => updateCardioPlanDraft("notes", event.target.value)}
                  placeholder="Ej: Z2 continua, progresivo suave, evitar picos"
                  value={cardioPlanDraft.notes}
                />
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


        <button
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white sm:w-auto"
          onClick={() => setShowSessionSummaryModal(true)}
          type="button"
        >
          <Send size={18} />
          Enviar al deportista
        </button>
        {sessionSendMessage ? (
          <p className="mt-3 text-sm font-medium text-ink/65">{sessionSendMessage}</p>
        ) : null}
        {showSessionSummaryModal ? (
          <div
            aria-labelledby="session-summary-modal-title"
            aria-modal="true"
            className="assessment-modal-overlay"
            onClick={() => setShowSessionSummaryModal(false)}
            role="dialog"
          >
            <div className="assessment-modal-panel" onClick={(event) => event.stopPropagation()}>
              <header className="assessment-modal-header flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-ink" id="session-summary-modal-title">Resumen de sesión</h3>
                  <p className="mt-1 text-sm text-ink/55">Revisa la sesión antes de enviarla al deportista.</p>
                </div>
                <button
                  aria-label="Cerrar"
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink/60 transition hover:bg-panel hover:text-ink"
                  onClick={() => setShowSessionSummaryModal(false)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="assessment-modal-body grid gap-4 px-5 py-5">
                {strengthExercises.length === 0 ? (
                  <div className="rounded-md border border-dashed border-line bg-white p-4 text-sm font-medium text-ink/55">
                    No hay ejercicios añadidos.
                  </div>
                ) : ([
                  ["activation", "ACTIVACIÓN"],
                  ["main", "BLOQUE PRINCIPAL"],
                  ["auxiliary", "BLOQUE AUXILIAR / OPCIONAL"]
                ] as const).map(([blockKey, blockLabel]) => {
                  const exercisesInBlock = strengthExercises.filter((exercise) => exercise.block === blockKey);
                  if (exercisesInBlock.length === 0) return null;

                  return (
                    <section className="rounded-md border border-line bg-white p-4" key={blockKey}>
                      <p className="text-xs font-semibold uppercase text-ink/45">{blockLabel}</p>
                      <div className="mt-3 grid gap-2">
                        {exercisesInBlock.map((exercise) => {
                          const summary = getExerciseSummaryLine(exercise);

                          return (
                            <div className="rounded-md bg-panel/35 px-3 py-2 text-sm text-ink/70" key={exercise.id}>
                              <p className="font-semibold text-ink">{summary.main}</p>
                              {summary.variant ? <p className="mt-1 text-xs font-medium text-ink/55">{summary.variant}</p> : null}
                              {exercise.selectedEquipment ? <p className="mt-1 text-xs font-medium text-ink/55">Material: {exercise.selectedEquipment}</p> : null}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <footer className="assessment-modal-footer flex flex-wrap justify-end gap-2 px-5 py-4">
                <button
                  className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70"
                  onClick={() => setShowSessionSummaryModal(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
                  onClick={confirmSendSessionToAthlete}
                  type="button"
                >
                  Enviar al deportista
                </button>
              </footer>
            </div>
          </div>
        ) : null}
        </>
        ) : activeSessionPanel === "history" ? (
          <SessionHistoryPanel
            client={activeSessionClient}
            onConsumeTargetTrainingSession={onConsumeTargetTrainingSession}
            onMarkSessionReviewed={markSessionAsReviewed}
            onPlanNewSession={() => setActiveSessionPanel("planner")}
            targetTrainingSession={targetTrainingSession}
          />
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

type ReviewSessionExercise = SessionExerciseInput & {
  actualRest?: number | string | null;
  actualRpe?: number | string | null;
  athleteNotes?: string | null;
  block?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  name?: string | null;
  notes?: string | null;
  observation?: string | null;
  percent1RM?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  perceivedExertion?: number | string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  rpe?: number | string | null;
  section?: string | null;
  selectedEquipment?: string | null;
  selectedVariantName?: string | null;
  setDetails?: Array<{ reps?: number | string | null; setNumber?: number }>;
  intensityMethod?: StrengthIntensityMethod | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
  targetVelocity?: number | string | null;
};

type SessionReviewStatus = "pending" | "reviewed";

type ReviewSessionRecord = ClientSessionRecord & {
  actualDurationMinutes?: number | string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: CardioResult;
  completed?: boolean;
  discomfort?: SessionDiscomfort;
  exercises?: ReviewSessionExercise[];
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  mesocycle?: string | null;
  performedExercises?: ReviewSessionExercise[];
  plannedExercises?: ReviewSessionExercise[];
  reviewedAt?: string;
  reviewNotes?: string;
  reviewStatus?: SessionReviewStatus;
  sessionNumber?: number | string | null;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  week?: number | string | null;
  weekLabel?: string | null;
};

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function getCardioConnectionLabel(status?: CardioConnectionStatus["status"]) {
  if (status === "connected") return "Conectado";
  if (status === "pending") return "Pendiente";
  return "No conectado";
}

function formatCardioSyncDate(value?: string) {
  if (!value) return "Sin sincronizar";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-ES");
}

function formatDurationSeconds(seconds: number | null) {
  if (seconds === null) return "Sin datos";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function formatCardioZones(timeInZones?: CardioResult["timeInZones"]) {
  if (!timeInZones) return [];
  return cardioZoneOptions
    .map((zone) => ({
      label: zone.label,
      seconds: timeInZones[zone.value] ?? 0
    }))
    .filter((zone) => zone.seconds > 0);
}

function formatTrainingBlock(session: ReviewSessionRecord, client: CoachClient) {
  return displayValue(session.block ?? session.mesocycle ?? client.planning.currentBlock);
}

function formatWeekAndSession(session: ReviewSessionRecord, client: CoachClient) {
  const week = session.weekLabel ?? session.week ?? client.planning.currentWeek;
  const sessionNumber = session.sessionNumber;

  if (hasDisplayValue(week) && hasDisplayValue(sessionNumber)) {
    return `${week} · Sesión ${sessionNumber}`;
  }

  return displayValue(week);
}

function getReviewExercises(session: ReviewSessionRecord) {
  const plannedExercises = session.plannedExercises ?? session.exercises ?? [];
  const performedExercises = session.performedExercises ?? [];

  return {
    plannedExercises,
    performedExercises
  };
}

function getExerciseLabel(entry?: ReviewSessionExercise) {
  if (!entry) return "Ejercicio sin especificar";
  if (entry.exerciseName) return entry.exerciseName;
  if (entry.name) return entry.name;
  if (entry.exerciseId) return getExerciseById(entry.exerciseId)?.name ?? entry.exerciseId;
  return "Ejercicio sin especificar";
}

function getPlannedValue(entry: ReviewSessionExercise | undefined, field: "sets" | "reps" | "load" | "rest" | "rir") {
  if (!entry) return undefined;

  switch (field) {
    case "sets":
      return entry.plannedSets ?? entry.sets;
    case "reps":
      return entry.plannedReps ?? entry.reps;
    case "load":
      return entry.plannedLoad ?? entry.load;
    case "rest":
      return entry.plannedRest ?? entry.rest;
    case "rir":
      return entry.plannedRir ?? entry.targetRir ?? entry.rir;
  }
}

function getPerformedValue(entry: ReviewSessionExercise | undefined, field: "sets" | "reps" | "load" | "rest" | "rir") {
  if (!entry) return undefined;

  switch (field) {
    case "sets":
      return entry.sets;
    case "reps":
      return entry.reps;
    case "load":
      return entry.load;
    case "rest":
      return entry.actualRest ?? entry.rest;
    case "rir":
      return entry.rir ?? entry.targetRir;
  }
}

function parseReviewNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getSetDetailsReps(entry?: ReviewSessionExercise) {
  return (entry?.setDetails ?? [])
    .map((detail) => parseReviewNumber(detail.reps))
    .filter((reps): reps is number => reps !== null && reps > 0);
}

function getExerciseMetaLabel(entry?: ReviewSessionExercise) {
  const meta = [
    entry?.selectedEquipment ? `Material: ${entry.selectedEquipment}` : "",
    entry?.selectedVariantName ? `Variante: ${entry.selectedVariantName}` : ""
  ].filter(Boolean);

  return meta.join(" · ");
}

function getExerciseDifferenceLabel(planned?: ReviewSessionExercise, performed?: ReviewSessionExercise) {
  if (!performed) return "Sin registro real";

  const plannedSets = parseReviewNumber(getPlannedValue(planned, "sets"));
  const performedSets = parseReviewNumber(getPerformedValue(performed, "sets"));
  const plannedReps = parseReviewNumber(getPlannedValue(planned, "reps"));
  const setDetailsReps = getSetDetailsReps(performed).reduce((total, reps) => total + reps, 0);
  const performedReps = setDetailsReps > 0 ? setDetailsReps : parseReviewNumber(getPerformedValue(performed, "reps"));
  const plannedLoad = parseReviewNumber(getPlannedValue(planned, "load"));
  const performedLoad = parseReviewNumber(getPerformedValue(performed, "load"));
  const changes: string[] = [];

  if (plannedSets !== null && performedSets !== null && plannedSets !== performedSets) {
    changes.push(`${performedSets - plannedSets > 0 ? "+" : ""}${performedSets - plannedSets} series`);
  }

  if (plannedReps !== null && performedReps !== null) {
    const plannedTotalReps = plannedSets !== null ? plannedSets * plannedReps : plannedReps;
    if (plannedTotalReps !== performedReps) {
      changes.push(`${performedReps - plannedTotalReps > 0 ? "+" : ""}${performedReps - plannedTotalReps} reps`);
    }
  }

  if (plannedLoad !== null && performedLoad !== null && plannedLoad !== performedLoad) {
    changes.push(`${performedLoad - plannedLoad > 0 ? "+" : ""}${performedLoad - plannedLoad} carga`);
  }

  return changes.length > 0 ? changes.join(" · ") : "Dentro de lo previsto";
}

function hasRealSessionData(session: ReviewSessionRecord) {
  return Boolean(
    session.completed ||
    hasDisplayValue(session.duration) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function getReviewSessionDate(value?: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSessionThisWeek(value?: string | null) {
  const date = getReviewSessionDate(value);
  if (!date) return false;

  const start = new Date();
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function getPlanningZoneAlertClass(level: FatigueZoneLevel) {
  if (level === "high") return "border border-line border-l-4 border-l-coral bg-panel/35 text-ink";
  if (level === "moderate") return "border border-line border-l-4 border-l-clay bg-panel/35 text-ink";
  return "border border-line bg-panel text-ink/50";
}

function getSessionReviewStatus(session: ReviewSessionRecord): SessionReviewStatus | null {
  if (session.reviewStatus === "reviewed") return "reviewed";
  if (hasRealSessionData(session)) return "pending";
  return null;
}

function getSessionStatus(session: ReviewSessionRecord) {
  if (session.status) return session.status;
  if (session.completed || hasDisplayValue(session.duration) || hasDisplayValue(session.rpe) || hasDisplayValue(session.finalRpe)) {
    return "Completada";
  }
  if ((session.plannedExercises?.length ?? 0) > 0 || (session.exercises?.length ?? 0) > 0) return "Planificada";
  return "Pendiente";
}

function getStatusBadgeClass(status: string) {
  if (status === "Completada") return "border border-line bg-mint text-moss";
  if (status === "Planificada") return "border border-line bg-panel text-ink/70";
  return "border border-line bg-wheat text-ink";
}

function getSessionSrpe(session: ReviewSessionRecord) {
  if (hasDisplayValue(session.sRPE)) {
    const parsedSrpe = Number(session.sRPE);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }
  if (hasDisplayValue(session.srpe)) {
    const parsedSrpe = Number(session.srpe);
    return Number.isFinite(parsedSrpe) ? parsedSrpe : null;
  }

  const duration = Number(session.actualDurationMinutes ?? session.duration);
  const rpe = Number(session.finalRpe ?? session.rpe);

  if (!Number.isFinite(duration) || !Number.isFinite(rpe) || duration <= 0 || rpe <= 0) return null;
  return calculateSessionLoad(rpe, duration);
}

function getSessionHistoryKey(session: ReviewSessionRecord, sessionIndex: number) {
  return `${session.date}-${session.summary}-${sessionIndex}`;
}

type ReviewExerciseDetail = {
  blockLabel: string;
  differenceLabel: string;
  exerciseName: string;
  metaLabel: string;
  performedLabel: string;
  plannedLabel: string;
};

type ReviewFeedbackModal = {
  sessionIndex: number;
  sessionKey: string;
  suggestedReviewNotes: string;
};

function getReviewBlockKey(entry?: ReviewSessionExercise): StrengthSessionBlock {
  const rawBlock = `${entry?.block ?? entry?.section ?? ""}`.toLowerCase();
  if (rawBlock.includes("activ")) return "activation";
  if (rawBlock.includes("aux") || rawBlock.includes("opcional")) return "auxiliary";
  return "main";
}

function getReviewBlockLabel(block: StrengthSessionBlock) {
  if (block === "activation") return "ACTIVACI\u00d3N";
  if (block === "auxiliary") return "BLOQUE AUXILIAR / OPCIONAL";
  return "BLOQUE PRINCIPAL";
}

function getGroupedReviewRows(rows: Array<{ performed?: ReviewSessionExercise; planned?: ReviewSessionExercise }>) {
  const groups: Array<{
    block: StrengthSessionBlock;
    rows: Array<{ performed?: ReviewSessionExercise; planned?: ReviewSessionExercise; originalIndex: number }>;
  }> = [
    { block: "activation", rows: [] },
    { block: "main", rows: [] },
    { block: "auxiliary", rows: [] }
  ];

  rows.forEach((row, originalIndex) => {
    const block = getReviewBlockKey(row.performed ?? row.planned);
    groups.find((group) => group.block === block)?.rows.push({ ...row, originalIndex });
  });

  return groups.filter((group) => group.rows.length > 0);
}

function getCompactSetLabel(entry?: ReviewSessionExercise, source: "planned" | "performed" = "planned") {
  if (!entry) return "Sin datos";

  if (source === "performed") {
    const setDetails = getSetDetailsReps(entry);
    if (setDetails.length > 0) {
      const allSame = setDetails.every((reps) => reps === setDetails[0]);
      return allSame ? `${setDetails.length}x${setDetails[0]}` : `${setDetails.length}x(${setDetails.join("/")})`;
    }
  }

  const sets = source === "planned" ? getPlannedValue(entry, "sets") : getPerformedValue(entry, "sets");
  const reps = source === "planned" ? getPlannedValue(entry, "reps") : getPerformedValue(entry, "reps");

  if (hasDisplayValue(sets) && hasDisplayValue(reps)) return `${sets}x${reps}`;
  if (hasDisplayValue(reps)) return `${reps} reps`;
  return "Sin datos";
}

function getReviewExerciseRpe(entry?: ReviewSessionExercise) {
  return entry?.exerciseRpe ?? entry?.rpe ?? entry?.actualRpe ?? entry?.perceivedExertion;
}

function getReviewIntensityMethod(planned?: ReviewSessionExercise, performed?: ReviewSessionExercise): StrengthIntensityMethod | null {
  const explicitMethod = performed?.intensityMethod ?? planned?.intensityMethod;
  if (explicitMethod) return explicitMethod;
  if (hasDisplayValue(performed?.targetVelocity ?? planned?.targetVelocity)) return "velocity";
  if (hasDisplayValue(planned?.percent1RM ?? performed?.percent1RM)) return "percent_1rm";
  if (hasDisplayValue(planned?.plannedRpe ?? planned?.targetRpe ?? getReviewExerciseRpe(performed))) return "rpe";
  if (hasDisplayValue(getPlannedValue(planned, "rir") ?? getPerformedValue(performed, "rir"))) return "rir";
  if (hasDisplayValue(getPlannedValue(planned, "load") ?? getPerformedValue(performed, "load"))) return "kg";
  return null;
}

function getReviewIntensityLabel(planned?: ReviewSessionExercise, performed?: ReviewSessionExercise, source: "planned" | "performed" = "performed") {
  const method = getReviewIntensityMethod(planned, performed);

  if (method === "velocity") {
    const value = planned?.targetVelocity ?? performed?.targetVelocity;
    return hasDisplayValue(value) ? `Velocidad: ${value} m/s` : "";
  }

  if (method === "percent_1rm") {
    const value = planned?.percent1RM ?? performed?.percent1RM;
    return hasDisplayValue(value) ? `%1RM: ${value}%` : "";
  }

  if (method === "rpe") {
    const value = source === "planned"
      ? planned?.plannedRpe ?? planned?.targetRpe
      : getReviewExerciseRpe(performed) ?? planned?.plannedRpe ?? planned?.targetRpe;
    return hasDisplayValue(value) ? `RPE: ${value}` : "";
  }

  if (method === "rir") {
    const value = source === "planned" ? getPlannedValue(planned, "rir") : getPerformedValue(performed, "rir");
    return hasDisplayValue(value) ? `RIR: ${value}` : "";
  }

  if (method === "kg" || method === "external_load") {
    const value = source === "planned" ? getPlannedValue(planned, "load") : getPerformedValue(performed, "load");
    return hasDisplayValue(value) ? `Carga: ${value} kg` : "";
  }

  return "";
}

function getCompactExerciseLabel(planned?: ReviewSessionExercise, performed?: ReviewSessionExercise, source: "planned" | "performed" = "planned") {
  const entry = source === "planned" ? planned : performed;
  if (!entry) return source === "planned" ? "Sin datos planificados" : "Sin registro real";
  const pieces = [
    getCompactSetLabel(entry, source),
    source === "planned" && hasDisplayValue(getPlannedValue(entry, "rest")) ? `${getPlannedValue(entry, "rest")}` : "",
    source === "planned" && hasDisplayValue(getPlannedValue(entry, "load")) ? `${getPlannedValue(entry, "load")} kg` : "",
    source === "performed" && hasDisplayValue(getPerformedValue(entry, "load")) ? `${getPerformedValue(entry, "load")} kg` : "",
    getReviewIntensityLabel(planned, performed, source)
  ].filter(Boolean);

  return pieces.length > 0 ? pieces.join(" \u00b7 ") : source === "planned" ? "Sin datos planificados" : "Sin registro real";
}

function SessionHistoryPanel({
  client,
  onConsumeTargetTrainingSession,
  onMarkSessionReviewed,
  onPlanNewSession,
  targetTrainingSession
}: {
  client: CoachClient;
  onConsumeTargetTrainingSession: () => void;
  onMarkSessionReviewed: (sessionIndex: number, reviewNotes?: string) => void;
  onPlanNewSession: () => void;
  targetTrainingSession: TargetTrainingSession | null;
}) {
  const [openSessionKey, setOpenSessionKey] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({});
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ReviewExerciseDetail | null>(null);
  const [reviewFeedbackModal, setReviewFeedbackModal] = useState<ReviewFeedbackModal | null>(null);
  const sessions = useMemo(
    () => (client.sessionRecords ?? []) as ReviewSessionRecord[],
    [client.sessionRecords]
  );
  const feedbackSession = reviewFeedbackModal ? sessions[reviewFeedbackModal.sessionIndex] : null;

  function getReviewDraft(sessionKey: string, session: ReviewSessionRecord, suggestedReviewNotes = "") {
    return reviewDrafts[sessionKey] ?? session.reviewNotes ?? suggestedReviewNotes;
  }

  function updateReviewDraft(sessionKey: string, value: string) {
    setReviewDrafts((current) => ({ ...current, [sessionKey]: value }));
  }

  function openFeedbackModal(sessionIndex: number, sessionKey: string, session: ReviewSessionRecord, suggestedReviewNotes = "") {
    const defaultFeedback = suggestedReviewNotes || "Enhorabuena, buen entreno.";
    updateReviewDraft(sessionKey, getReviewDraft(sessionKey, session, defaultFeedback));
    setReviewFeedbackModal({ sessionIndex, sessionKey, suggestedReviewNotes: defaultFeedback });
  }

  function saveReview(sessionIndex: number, sessionKey: string, session: ReviewSessionRecord, suggestedReviewNotes = "") {
    onMarkSessionReviewed(sessionIndex, getReviewDraft(sessionKey, session, suggestedReviewNotes));
    setReviewFeedbackModal(null);
  }

  useEffect(() => {
    if (targetTrainingSession?.clientId !== client.id) return;

    const targetIndex =
      targetTrainingSession.sessionIndex ??
      sessions.findIndex((session) => session.date === targetTrainingSession.sessionDate);

    if (targetIndex >= 0 && sessions[targetIndex]) {
      setOpenSessionKey(getSessionHistoryKey(sessions[targetIndex], targetIndex));
    }

    onConsumeTargetTrainingSession();
  }, [client.id, onConsumeTargetTrainingSession, sessions, targetTrainingSession]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Sesiones anteriores</h2>
          <p className="mt-1 text-sm text-ink/55">{`Revisi\u00f3n de sesiones planificadas y completadas de ${client.name}.`}</p>
        </div>
        <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">
          {sessions.length} sesiones
        </span>
      </div>

      {sessions.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {sessions.map((session, sessionIndex) => {
            const sessionKey = getSessionHistoryKey(session, sessionIndex);
            const isOpen = openSessionKey === sessionKey;
            const status = getSessionStatus(session);
            const reviewStatus = getSessionReviewStatus(session);
            const { plannedExercises, performedExercises } = getReviewExercises(session);
            const exerciseCount = Math.max(plannedExercises.length, performedExercises.length);
            const plannedExternalLoad = plannedExercises.length > 0
              ? calculateSessionExternalLoad({ completed: false, plannedExercises }, exerciseLibrary)
              : null;
            const performedExternalLoad = performedExercises.length > 0
              ? calculateSessionExternalLoad({ completed: true, performedExercises, plannedExercises }, exerciseLibrary)
              : null;
            const srpe = getSessionSrpe(session);
            const duration = session.actualDurationMinutes ?? session.duration;
            const rpe = session.finalRpe ?? session.rpe;
            const notes = session.finalNotes ?? session.notes;
            const sessionDeviation = calculateSessionDeviation(session);
            const cardioDeviation = session.cardioPlan || session.cardioResult
              ? analyzeCardioDeviation(session.cardioPlan, session.cardioResult)
              : null;
            const suggestedReviewNotes = [
              sessionDeviation.suggestedReviewNotes,
              cardioDeviation ? generateCardioFeedbackSuggestion(cardioDeviation) : ""
            ].filter(Boolean).join(" ");
            const detailRows = Array.from({ length: exerciseCount }, (_, index) => ({
              performed: performedExercises[index],
              planned: plannedExercises[index]
            }));
            const groupedRows = getGroupedReviewRows(detailRows);
            const hasRealRegister = performedExercises.length > 0 || status === "Completada";
            const canReviewSession = reviewStatus === "reviewed" || reviewStatus === "pending";

            return (
              <article className="rounded-md border border-line bg-white p-4 shadow-soft" key={sessionKey}>
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink/55">{displayValue(session.date)}</p>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                      {reviewStatus === "reviewed" ? (
                        <span className="rounded-md border border-line bg-mint px-2 py-1 text-xs font-semibold text-moss">
                          Revisada
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-ink">{displayValue(session.type, "Tipo sin especificar")}</h3>
                    <p className="mt-1 text-sm text-ink/65">{displayValue(session.summary, "Sin resumen especificado")}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-panel/70 px-3 py-2 text-xs font-semibold text-ink/65">
                      Ejercicios: {exerciseCount > 0 ? exerciseCount : "Sin datos"}
                    </span>
                    <span className="rounded-md bg-panel/70 px-3 py-2 text-xs font-semibold text-ink/65">
                      sRPE: {srpe !== null ? `${srpe} UA` : "Pendiente"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <ClientInfoCard label={"Deportista"} value={client.name} />
                  <ClientInfoCard label={"Duraci\u00f3n real"} value={hasDisplayValue(duration) ? `${duration} min` : "Pendiente"} />
                  <ClientInfoCard label={"RPE final"} value={hasDisplayValue(rpe) ? `${rpe}/10` : "Pendiente"} />
                  <ClientInfoCard label={"sRPE"} value={srpe !== null ? `${srpe} UA` : "Pendiente"} />
                  <ClientInfoCard
                    label={"Carga planificada \u2192 real"}
                    value={`${plannedExternalLoad !== null ? `${Math.round(plannedExternalLoad).toLocaleString("es-ES")} kg` : "Sin datos"} \u2192 ${performedExternalLoad !== null ? `${Math.round(performedExternalLoad).toLocaleString("es-ES")} kg` : "Sin registro"}`}
                  />
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <ClientInfoCard label={"Bloque / mesociclo"} value={formatTrainingBlock(session, client)} />
                  <ClientInfoCard label={"Semana y sesi\u00f3n"} value={formatWeekAndSession(session, client)} />
                  <ClientInfoCard label={"Estado"} value={status} />
                  <ClientInfoCard label={"Cumplimiento"} value={sessionDeviation.globalCompletionPct !== null ? `${Math.round(sessionDeviation.globalCompletionPct)}%` : "Sin datos suficientes"} />
                </div>
                {hasDisplayValue(notes) ? (
                  <p className="mt-3 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm text-ink/70">
                    <span className="font-semibold text-ink">{"Notas del deportista:"}</span> {notes}
                  </p>
                ) : null}

                <button
                  className="mt-4 rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
                  onClick={() => setOpenSessionKey(isOpen ? "" : sessionKey)}
                  type="button"
                >
                  {isOpen ? "Ocultar detalle" : "Ver detalle"}
                </button>

                {isOpen ? (
                  <div className="mt-4 rounded-md border border-line bg-panel/25 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-ink">Planificado vs realizado</h4>
                        <p className="mt-1 text-sm text-ink/55">{"Ejercicios agrupados por bloque, con cumplimiento, ca\u00edda e intensidad real."}</p>
                      </div>
                      {!hasRealRegister ? (
                        <span className="rounded-md border border-line bg-wheat px-2 py-1 text-xs font-semibold text-ink">
                          {"Sin registro real todav\u00eda"}
                        </span>
                      ) : null}
                    </div>

                    {exerciseCount > 0 ? (
                      <div className="mt-4 grid gap-4">
                        {groupedRows.map((group) => (
                          <section className="grid gap-2" key={`${sessionKey}-${group.block}`}>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                              {getReviewBlockLabel(group.block)} {"\u00b7"} {group.rows.length} {group.rows.length === 1 ? "ejercicio" : "ejercicios"}
                            </h5>
                            <div className="grid gap-2">
                              {group.rows.map(({ planned, performed, originalIndex }) => {
                                const exerciseName = getExerciseLabel(performed ?? planned);
                                const exerciseMeta = getExerciseMetaLabel(performed ?? planned);
                                const exerciseDeviation = sessionDeviation.exerciseSummaries.find((summary) => summary.exerciseName === exerciseName) ?? sessionDeviation.exerciseSummaries[originalIndex];
                                const completionLabel = exerciseDeviation?.completionPct !== null && exerciseDeviation?.completionPct !== undefined
                                  ? `${Math.round(exerciseDeviation.completionPct)}%`
                                  : "\u2014";
                                const dropLabel = exerciseDeviation?.dropPct !== null && exerciseDeviation?.dropPct !== undefined
                                  ? `${Math.round(exerciseDeviation.dropPct)}%`
                                  : "\u2014";
                                const intensityLabel = getReviewIntensityLabel(planned, performed) || "Intensidad: \u2014";
                                const plannedLabel = getCompactExerciseLabel(planned, performed, "planned");
                                const performedLabel = getCompactExerciseLabel(planned, performed, "performed");
                                const differenceLabel = getExerciseDifferenceLabel(planned, performed);

                                return (
                                  <button
                                    className="rounded-md border border-line bg-white p-3 text-left transition hover:border-moss hover:bg-panel/60"
                                    key={`${sessionKey}-${group.block}-${originalIndex}`}
                                    onClick={() => setSelectedExerciseDetail({
                                      blockLabel: getReviewBlockLabel(group.block),
                                      differenceLabel,
                                      exerciseName,
                                      metaLabel: exerciseMeta,
                                      performedLabel,
                                      plannedLabel
                                    })}
                                    type="button"
                                  >
                                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="min-w-0">
                                        <p className="font-semibold text-ink">{exerciseName}</p>
                                        {exerciseMeta ? <p className="mt-1 text-xs font-medium text-ink/55">{exerciseMeta}</p> : null}
                                      </div>
                                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink/65">
                                        <span className="rounded-md border border-line bg-panel/70 px-2 py-1">Cumplimiento: {completionLabel}</span>
                                        <span className="rounded-md border border-line bg-panel/70 px-2 py-1">{`Ca\u00edda: ${dropLabel}`}</span>
                                        <span className="rounded-md border border-line bg-panel/70 px-2 py-1">{intensityLabel}</span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-ink/50">Sin ejercicios registrados.</p>
                    )}

                    {sessionDeviation.exerciseSummaries.length === 0 ? (
                      <p className="mt-4 text-sm font-semibold text-ink/50">Sin datos suficientes.</p>
                    ) : null}

                    {session.discomfort?.hasDiscomfort ? (
                      <div className="mt-4 rounded-md border border-line border-l-4 border-l-clay bg-white p-3 text-sm text-ink/70">
                        <p className="font-semibold text-ink">Molestia reportada</p>
                        <p className="mt-1">
                          Zona: {session.discomfort.bodyArea || "Sin especificar"} {"\u00b7"} Fase: {session.discomfort.phase || "Sin especificar"} {"\u00b7"} Intensidad: {session.discomfort.intensity ?? "Sin especificar"}/10
                        </p>
                        {session.discomfort.exerciseName ? <p className="mt-1">Ejercicio: {session.discomfort.exerciseName}</p> : null}
                        {session.discomfort.notes ? <p className="mt-1">{session.discomfort.notes}</p> : null}
                      </div>
                    ) : null}

                    {cardioDeviation ? (
                      <section className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-semibold text-ink">Cardio Deviation</h5>
                            <p className="mt-1 text-sm text-ink/55">Lectura orientativa del cardio planificado frente al registrado.</p>
                          </div>
                          <span className="w-fit rounded-md border border-line bg-white px-3 py-1 text-xs font-semibold text-ink/65">
                            {cardioDeviation.reading}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <ClientInfoCard
                            label={"Duraci\u00f3n"}
                            value={`${session.cardioPlan?.targetDurationMinutes ? `${session.cardioPlan.targetDurationMinutes} min` : "Plan sin especificar"} / ${session.cardioResult?.durationMinutes ? `${session.cardioResult.durationMinutes} min` : "Real sin registrar"}`}
                          />
                          <ClientInfoCard
                            label={"Cumplimiento duraci\u00f3n"}
                            value={cardioDeviation.durationCompletionPct !== null ? `${Math.round(cardioDeviation.durationCompletionPct)}% \u00b7 ${getCardioCompletionLabel(cardioDeviation.durationStatus)}` : "Sin datos suficientes"}
                          />
                          <ClientInfoCard
                            label="Zona objetivo"
                            value={session.cardioPlan?.targetZone ? session.cardioPlan.targetZone.toUpperCase() : "Sin especificar"}
                          />
                          <ClientInfoCard
                            label="Tiempo en zona"
                            value={cardioDeviation.targetZonePct !== null ? `${Math.round(cardioDeviation.targetZonePct)}% \u00b7 ${cardioDeviation.zoneStatusLabel}` : "Sin datos de zonas suficientes"}
                          />
                          <ClientInfoCard label="Por debajo de zona" value={formatDurationSeconds(cardioDeviation.timeBelowTargetZoneSeconds)} />
                          <ClientInfoCard label="Por encima de zona" value={formatDurationSeconds(cardioDeviation.timeAboveTargetZoneSeconds)} />
                          <ClientInfoCard
                            label="RPE cardio"
                            value={session.cardioResult?.perceivedRpe ? `${session.cardioPlan?.targetRpeMin ?? "-"}-${session.cardioPlan?.targetRpeMax ?? "-"} / real ${session.cardioResult.perceivedRpe} \u00b7 ${cardioDeviation.rpeLabel}` : "Sin RPE de cardio"}
                          />
                          <ClientInfoCard
                            label="Distancia"
                            value={cardioDeviation.distanceCompletionPct !== null ? `${Math.round(cardioDeviation.distanceCompletionPct)}% \u00b7 ${getCardioCompletionLabel(cardioDeviation.distanceStatus)}` : "Sin datos suficientes"}
                          />
                        </div>
                        {formatCardioZones(session.cardioResult?.timeInZones).length > 0 ? (
                          <div className="mt-3 rounded-md border border-line bg-white p-3">
                            <p className="text-xs font-semibold uppercase text-ink/45">{"Distribuci\u00f3n Z1-Z5"}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {formatCardioZones(session.cardioResult?.timeInZones).map((zone) => (
                                <span className="rounded-md bg-panel/70 px-3 py-1 text-xs font-semibold text-ink/65" key={zone.label}>
                                  {zone.label}: {formatDurationSeconds(zone.seconds)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    ) : null}

                    {canReviewSession ? (
                      <section className="mt-4 rounded-md border border-line bg-white p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-semibold text-ink">{"Revisi\u00f3n del entrenador"}</h5>
                            {session.reviewedAt ? (
                              <p className="mt-1 text-xs font-medium text-ink/50">
                                Revisada: {new Date(session.reviewedAt).toLocaleString("es-ES")}
                              </p>
                            ) : null}
                            {reviewStatus === "reviewed" ? (
                              <p className="mt-2 text-sm text-ink/65">{session.reviewNotes || "Sesi\u00f3n revisada sin comentario."}</p>
                            ) : (
                              <p className="mt-2 text-sm text-ink/55">Pendiente de feedback para el deportista.</p>
                            )}
                          </div>
                          <button
                            className="w-fit rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                            onClick={() => openFeedbackModal(sessionIndex, sessionKey, session, suggestedReviewNotes)}
                            type="button"
                          >
                            {reviewStatus === "reviewed" ? "Editar feedback" : "Marcar como revisada"}
                          </button>
                        </div>
                      </section>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-8 text-center">
          <p className="text-sm font-semibold text-ink">{"No hay sesiones registradas todav\u00eda."}</p>
          <p className="mt-2 text-sm text-ink/55">{"Puedes crear la primera sesi\u00f3n desde el planificador."}</p>
          <button
            className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={onPlanNewSession}
            type="button"
          >
            {"Planificar nueva sesi\u00f3n"}
          </button>
        </div>
      )}

      {selectedExerciseDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{selectedExerciseDetail.blockLabel}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{selectedExerciseDetail.exerciseName}</h3>
                {selectedExerciseDetail.metaLabel ? <p className="mt-1 text-sm text-ink/55">{selectedExerciseDetail.metaLabel}</p> : null}
              </div>
              <button
                className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink"
                onClick={() => setSelectedExerciseDetail(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <section className="rounded-md border border-line bg-panel/35 p-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Planificado</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedExerciseDetail.plannedLabel}</p>
              </section>
              <section className="rounded-md border border-line bg-panel/35 p-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Realizado</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedExerciseDetail.performedLabel}</p>
              </section>
              <section className="rounded-md border border-line bg-panel/35 p-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Diferencia</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedExerciseDetail.differenceLabel}</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {reviewFeedbackModal && feedbackSession ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md border border-line bg-white p-5 shadow-soft">
            <h3 className="text-xl font-semibold text-ink">Enviar feedback al deportista</h3>
            <p className="mt-2 text-sm text-ink/55">{"El comentario se guardar\u00e1 en la sesi\u00f3n revisada."}</p>
            <textarea
              className="mt-4 min-h-32 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-sm text-ink outline-none focus:border-moss"
              onChange={(event) => updateReviewDraft(reviewFeedbackModal.sessionKey, event.target.value)}
              value={getReviewDraft(reviewFeedbackModal.sessionKey, feedbackSession, reviewFeedbackModal.suggestedReviewNotes)}
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70"
                onClick={() => setReviewFeedbackModal(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={() => saveReview(reviewFeedbackModal.sessionIndex, reviewFeedbackModal.sessionKey, feedbackSession, reviewFeedbackModal.suggestedReviewNotes)}
                type="button"
              >
                Marcar como revisada
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
type LegacyAthleteTrainingViewProps = {
  hooperDone: boolean;
  onCompleteHooper: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyAthleteTrainingView({ hooperDone, onCompleteHooper }: LegacyAthleteTrainingViewProps) {
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
      <h4 className="font-semibold text-amber-900">Cuéntanos por qué no se realizó</h4>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
