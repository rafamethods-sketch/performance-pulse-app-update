"use client";

import {
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Lock,
  Plus,
  Search,
  Send,
  Settings2,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
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

export default function ClientsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [goalType, setGoalType] = useState<GoalType>("health");
  const [activeSheet, setActiveSheet] = useState<SheetId>("clients");
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

  return (
    <main className="min-h-screen lg:flex">
      <Sidebar activeSheet={activeSheet} onSheetChange={setActiveSheet} role={role} />
      <div className="flex-1">
        <MobileNav activeSheet={activeSheet} onSheetChange={setActiveSheet} role={role} />
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-line pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-ink">
                {activeSheet === "clients"
                  ? "Clientes"
                  : activeSheet === "training"
                    ? "Mi entrenamiento"
                  : activeSheet === "assessments"
                    ? "Valoraciones"
                  : activeSheet === "calendar"
                    ? "Calendario"
                  : activeSheet === "fatigue"
                    ? "Fatiga"
                  : activeSheet === "weeklyLoad"
                    ? "Carga semanal"
                  : activeSheet === "planning"
                    ? "Planificacion"
                  : activeSheet === "progressions"
                    ? "Progresiones"
                  : activeSheet === "routines"
                    ? "Rutinas"
                  : activeSheet === "messages"
                    ? "Mensajes"
                    : "Dashboard"}
              </h1>
            </div>

          </div>

          {activeSheet === "clients" ? (
            role === "coach" ? (
              <CoachClientsView
                setTrainingAvailability={setTrainingAvailability}
                trainingAvailability={trainingAvailability}
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
            role === "coach" ? <CoachTrainingPlanner /> : (
              <AthleteTrainingView
                hooperDone={hooperDone}
                onCompleteHooper={() => setHooperDone(true)}
              />
            )
          ) : activeSheet === "assessments" ? (
            <AssessmentsView />
          ) : activeSheet === "calendar" ? (
            <CalendarView />
          ) : activeSheet === "fatigue" ? (
            <FatigueMapView />
          ) : activeSheet === "weeklyLoad" ? (
            <WeeklyLoadView />
          ) : activeSheet === "planning" ? (
            role === "coach" ? <PlanningView /> : <DecisionDashboardView />
          ) : activeSheet === "progressions" ? (
            role === "coach" ? <ExerciseProgressionsView /> : <DecisionDashboardView />
          ) : activeSheet === "routines" ? (
            role === "coach" ? <RoutinesView trainingAvailability={trainingAvailability} /> : <DecisionDashboardView />
          ) : activeSheet === "messages" ? (
            <MessagesView />
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
    <main className="min-h-screen bg-panel">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-md bg-ink text-white">
              <Dumbbell size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">Rafa Methods</p>
              <p className="text-xs text-ink/55">Training intelligence</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Entrenamiento, carga y recuperacion en una sola app
          </h1>
        </div>

        <section className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">Acceder</h2>
          <p className="mt-1 text-sm text-ink/55">Usa tu correo Gmail o entra en modo demo.</p>

          <button
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-line bg-white text-sm font-semibold text-ink transition hover:bg-panel"
            onClick={handleGoogleLogin}
            type="button"
          >
            <span className="grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-white">G</span>
            Continuar con Google
          </button>
          {authMessage && (
            <p className="mt-3 rounded-md bg-wheat px-3 py-2 text-sm text-ink/70">
              {authMessage}
            </p>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs uppercase tracking-wide text-ink/40">demo</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="rounded-md bg-ink px-4 py-4 text-left text-white transition hover:bg-ink/90"
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

          <label className="mt-5 block space-y-2 text-sm font-medium text-ink/70">
            Correo Gmail
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              placeholder="tuemail@gmail.com"
              type="email"
            />
          </label>
        </section>
      </section>
    </main>
  );
}

function CoachClientsView({
  setTrainingAvailability,
  trainingAvailability
}: {
  setTrainingAvailability: (availability: TrainingAvailability) => void;
  trainingAvailability: TrainingAvailability;
}) {
  const distribution = recommendTrainingDistribution(trainingAvailability);

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {coachStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Disponibilidad de entrenamiento</h2>
            <p className="mt-1 text-sm text-ink/55">
              Distribucion recomendada: {distribution.name}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
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
              Distribucion
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
      </section>

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
              className="grid gap-4 rounded-md border border-line bg-panel/45 p-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center"
              key={client.name}
            >
              <div>
                <h3 className="font-semibold text-ink">{client.name}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  {client.age} anos - {client.sport}
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
              <p className="text-sm font-medium text-moss">{client.loadMetric}</p>
              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <span className="text-sm font-semibold text-moss">{client.readiness}%</span>
                <button
                  aria-label={`Abrir ${client.name}`}
                  className="grid size-9 place-items-center rounded-md bg-ink text-white"
                  title={`Abrir ${client.name}`}
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

function WeeklyLoadView() {
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

type PlanningBaseCategory = "strength" | "endurance" | "mixed" | "custom";
type PeriodizationModel = "linear" | "block" | "undulating" | "flexible";
type SportModality =
  | "General"
  | "Powerlifting"
  | "Halterofilia"
  | "Culturismo / hipertrofia"
  | "Running"
  | "Ciclismo"
  | "Natacion"
  | "Triatlon"
  | "Trail"
  | "Futbol"
  | "Baloncesto"
  | "Rugby"
  | "Balonmano"
  | "Tenis"
  | "Padel"
  | "Badminton"
  | "Boxeo"
  | "MMA"
  | "Judo"
  | "Kickboxing"
  | "CrossFit"
  | "HYROX"
  | "Readaptacion"
  | "Otro";
type PlanningFocus =
  | "Fuerza"
  | "Resistencia"
  | "Mixto - resistencia dominante"
  | "Mixto - fuerza dominante"
  | "Mixto - intermitente / equipo"
  | "Mixto - intermitente / raqueta"
  | "Mixto - combate"
  | "Mixto - concurrente"
  | "Personalizado";
type PlanningConfig = {
  goals: string[];
  metricOptions: string[];
  subtypes: Partial<Record<PeriodizationModel, string[]>>;
};

const sportModalities: SportModality[] = [
  "General",
  "Powerlifting",
  "Halterofilia",
  "Culturismo / hipertrofia",
  "Running",
  "Ciclismo",
  "Natacion",
  "Triatlon",
  "Trail",
  "Futbol",
  "Baloncesto",
  "Rugby",
  "Balonmano",
  "Tenis",
  "Padel",
  "Badminton",
  "Boxeo",
  "MMA",
  "Judo",
  "Kickboxing",
  "CrossFit",
  "HYROX",
  "Readaptacion",
  "Otro"
];

const planningFocusOptions: PlanningFocus[] = [
  "Fuerza",
  "Resistencia",
  "Mixto - resistencia dominante",
  "Mixto - fuerza dominante",
  "Mixto - intermitente / equipo",
  "Mixto - intermitente / raqueta",
  "Mixto - combate",
  "Mixto - concurrente",
  "Personalizado"
];

const suggestedFocusBySport: Record<SportModality, PlanningFocus> = {
  Badminton: "Mixto - intermitente / raqueta",
  Baloncesto: "Mixto - intermitente / equipo",
  Balonmano: "Mixto - intermitente / equipo",
  Boxeo: "Mixto - combate",
  "Culturismo / hipertrofia": "Fuerza",
  Ciclismo: "Resistencia",
  CrossFit: "Mixto - concurrente",
  Futbol: "Mixto - intermitente / equipo",
  General: "Personalizado",
  HYROX: "Mixto - concurrente",
  Halterofilia: "Fuerza",
  Judo: "Mixto - combate",
  Kickboxing: "Mixto - combate",
  MMA: "Mixto - combate",
  Natacion: "Resistencia",
  Otro: "Personalizado",
  Padel: "Mixto - intermitente / raqueta",
  Powerlifting: "Fuerza",
  Readaptacion: "Personalizado",
  Rugby: "Mixto - intermitente / equipo",
  Running: "Resistencia",
  Tenis: "Mixto - intermitente / raqueta",
  Trail: "Resistencia",
  Triatlon: "Mixto - resistencia dominante"
};

const planningFocusBaseCategory: Record<PlanningFocus, PlanningBaseCategory> = {
  Fuerza: "strength",
  "Mixto - combate": "mixed",
  "Mixto - concurrente": "mixed",
  "Mixto - fuerza dominante": "mixed",
  "Mixto - intermitente / equipo": "mixed",
  "Mixto - intermitente / raqueta": "mixed",
  "Mixto - resistencia dominante": "mixed",
  Personalizado: "custom",
  Resistencia: "endurance"
};

const periodizationLabels: Record<PeriodizationModel, string> = {
  block: "Bloques",
  flexible: "Flexible / personalizada",
  linear: "Lineal",
  undulating: "Ondulante"
};

const planningConfig: Record<PlanningBaseCategory, PlanningConfig> = {
  strength: {
    goals: [
      "Fuerza maxima",
      "Hipertrofia / volumen estructural",
      "Potencia",
      "RFD / fuerza rapida",
      "Fuerza reactiva",
      "Braking / excentrica",
      "Resistencia muscular local",
      "Mantenimiento",
      "Readaptacion"
    ],
    metricOptions: [
      "%1RM",
      "e1RM",
      "RIR",
      "RPE",
      "velocidad",
      "perdida de velocidad",
      "volumen-carga",
      "series duras",
      "repeticiones efectivas"
    ],
    subtypes: {
      block: [
        "ATR: Acumulacion -> Transmutacion -> Realizacion",
        "Hipertrofia -> Fuerza -> Potencia",
        "Volumen -> Intensificacion -> Pico",
        "Low -> High -> Fast -> Long Force",
        "Bloque personalizado"
      ],
      flexible: ["Flexible por readiness", "Personalizada por calendario", "Personalizada por respuesta individual"],
      linear: [
        "Lineal clasica: volumen ↓ intensidad ↑",
        "Lineal inversa: intensidad ↓ volumen ↑",
        "Progresion por carga: kg ↑",
        "Progresion por repeticiones: reps ↑",
        "Progresion por densidad: descanso ↓",
        "Lineal con taper"
      ],
      undulating: [
        "Ondulante diaria",
        "Ondulante semanal",
        "Fuerza / potencia / volumen",
        "High / Fast / Low",
        "Flexible por readiness"
      ]
    }
  },
  endurance: {
    goals: [
      "Recuperacion",
      "Base aerobica",
      "Capacidad aerobica",
      "Umbral",
      "VO2max",
      "Capacidad anaerobica",
      "Repeated Sprint Ability",
      "Competicion / puesta a punto",
      "Mantenimiento"
    ],
    metricOptions: [
      "tiempo en zona",
      "ritmo",
      "potencia",
      "frecuencia cardiaca",
      "RPE",
      "duracion",
      "distancia",
      "carga semanal"
    ],
    subtypes: {
      block: [
        "ATR resistencia",
        "Bloque aerobico",
        "Bloque umbral",
        "Bloque VO2max",
        "Bloque anaerobico",
        "Bloque competitivo"
      ],
      flexible: ["Flexible por respuesta diaria", "Personalizada por disponibilidad", "Personalizada por competicion"],
      linear: [
        "Base -> especifico -> taper",
        "Volumen progresivo",
        "Intensidad progresiva",
        "Lineal inversa",
        "Base -> tempo -> umbral -> VO2max -> taper"
      ],
      undulating: ["Piramidal", "Polarizada", "Threshold", "HIIT-focused", "Mixta"]
    }
  },
  mixed: {
    goals: [
      "Concurrente fuerza + resistencia",
      "Rendimiento mixto",
      "Preparacion para combate",
      "Deporte intermitente",
      "Resistencia dominante con fuerza de soporte",
      "Fuerza dominante con acondicionamiento",
      "Salud general",
      "Mantenimiento",
      "Readaptacion"
    ],
    metricOptions: [
      "RPE",
      "RIR",
      "tiempo en zona",
      "frecuencia cardiaca",
      "volumen-carga",
      "carga semanal",
      "duracion",
      "rounds",
      "tiempo de trabajo",
      "potencia",
      "fuerza",
      "velocidad"
    ],
    subtypes: {
      block: ["Bloques alternos fuerza/resistencia", "Bloque fuerza -> bloque resistencia", "Bloque resistencia -> bloque fuerza"],
      flexible: ["Personalizada por prioridad semanal", "Flexible por readiness", "Flexible por calendario"],
      linear: ["Base general -> especifico -> taper", "Progresion por prioridad principal", "Lineal con descarga"],
      undulating: ["Ondulante por dias", "Fuerza alta / resistencia baja", "Resistencia alta / fuerza baja", "Mixta"]
    }
  },
  custom: {
    goals: [
      "Rendimiento",
      "Salud general",
      "Mantenimiento",
      "Readaptacion",
      "Objetivo personalizado"
    ],
    metricOptions: [
      "RPE",
      "RIR",
      "tiempo en zona",
      "frecuencia cardiaca",
      "volumen-carga",
      "carga semanal",
      "duracion",
      "notas subjetivas"
    ],
    subtypes: {
      block: ["Bloques personalizados", "Bloques por prioridad", "Bloques por disponibilidad"],
      flexible: ["Flexible / personalizada", "Flexible por readiness", "Flexible por calendario"],
      linear: ["Lineal personalizada", "Progresion simple", "Lineal con descarga"],
      undulating: ["Ondulante personalizada", "Variacion semanal", "Variacion por respuesta"]
    }
  }
};

const defaultMetricSelection: Record<PlanningBaseCategory, string[]> = {
  custom: ["RPE", "duracion", "notas subjetivas"],
  endurance: ["tiempo en zona", "potencia", "frecuencia cardiaca", "RPE"],
  mixed: ["RPE", "RIR", "tiempo en zona", "volumen-carga"],
  strength: ["%1RM", "RIR", "velocidad", "volumen-carga"]
};

const defaultMetricsByPlanningFocus: Partial<Record<PlanningFocus, string[]>> = {
  "Mixto - combate": ["RPE", "rounds", "tiempo de trabajo", "potencia", "fuerza", "velocidad"],
  "Mixto - concurrente": ["RPE", "tiempo en zona", "potencia", "volumen-carga", "carga semanal"],
  "Mixto - resistencia dominante": ["tiempo en zona", "potencia", "frecuencia cardiaca", "RPE"],
  "Mixto - intermitente / equipo": ["RPE", "distancia", "tiempo de trabajo", "velocidad", "carga semanal"],
  "Mixto - intermitente / raqueta": ["RPE", "tiempo de trabajo", "velocidad", "potencia", "carga semanal"]
};

const defaultGoalByPlanningFocus: Partial<Record<PlanningFocus, string>> = {
  "Mixto - combate": "Preparacion para combate",
  "Mixto - concurrente": "Concurrente fuerza + resistencia",
  "Mixto - fuerza dominante": "Fuerza dominante con acondicionamiento",
  "Mixto - intermitente / equipo": "Deporte intermitente",
  "Mixto - intermitente / raqueta": "Deporte intermitente",
  "Mixto - resistencia dominante": "Resistencia dominante con fuerza de soporte",
  Personalizado: "Objetivo personalizado"
};

function PlanningView() {
  const [sportModality, setSportModality] = useState<SportModality>("General");
  const [planningFocus, setPlanningFocus] = useState<PlanningFocus>(suggestedFocusBySport.General);
  const baseCategory = planningFocusBaseCategory[planningFocus];
  const [goal, setGoal] = useState(planningConfig.custom.goals[0]);
  const [periodizationModel, setPeriodizationModel] = useState<PeriodizationModel>("linear");
  const [periodizationSubtype, setPeriodizationSubtype] = useState(planningConfig.custom.subtypes.linear?.[0] ?? "");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultMetricSelection.custom);
  const [targetVolume, setTargetVolume] = useState("Medio");
  const [targetIntensity, setTargetIntensity] = useState("Media-alta");
  const [targetFatigue, setTargetFatigue] = useState("Controlada");
  const [notes, setNotes] = useState("");

  const currentConfig = planningConfig[baseCategory];
  const subtypeOptions = currentConfig.subtypes[periodizationModel] ?? [];
  const selectedPlan = {
    mainLoadMetrics: selectedMetrics,
    notes,
    periodizationModel,
    periodizationSubtype,
    planningFocus,
    sportModality,
    targetFatigue,
    targetIntensity,
    targetVolume,
    goal
  };

  function applyPlanningFocus(focus: PlanningFocus) {
    const nextCategory = planningFocusBaseCategory[focus];
    const nextConfig = planningConfig[nextCategory];
    const nextGoal = defaultGoalByPlanningFocus[focus] ?? nextConfig.goals[0];
    const nextSubtype = nextConfig.subtypes[periodizationModel]?.[0] ?? nextConfig.subtypes.linear?.[0] ?? "";
    setPlanningFocus(focus);
    setGoal(nextGoal);
    setPeriodizationSubtype(nextSubtype);
    setSelectedMetrics(defaultMetricsByPlanningFocus[focus] ?? defaultMetricSelection[nextCategory]);
  }

  function handleSportModalityChange(modality: SportModality) {
    setSportModality(modality);
    applyPlanningFocus(suggestedFocusBySport[modality]);
  }

  function handleFocusChange(focus: PlanningFocus) {
    applyPlanningFocus(focus);
  }

  function handleModelChange(model: PeriodizationModel) {
    const nextSubtype = currentConfig.subtypes[model]?.[0] ?? "";
    setPeriodizationModel(model);
    setPeriodizationSubtype(nextSubtype);
  }

  function toggleMetric(metric: string) {
    setSelectedMetrics((current) =>
      current.includes(metric)
        ? current.filter((item) => item !== metric)
        : [...current, metric]
    );
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">Estructura de planificacion</h2>

        <PlanningStep step="1" title="Modalidad deportiva">
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => handleSportModalityChange(event.target.value as SportModality)}
            value={sportModality}
          >
            {sportModalities.map((modality) => (
              <option key={modality}>{modality}</option>
            ))}
          </select>
        </PlanningStep>

        <PlanningStep step="2" title="Enfoque de planificacion">
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => handleFocusChange(event.target.value as PlanningFocus)}
            value={planningFocus}
          >
            {planningFocusOptions.map((focus) => (
              <option key={focus}>{focus}</option>
            ))}
          </select>
          <p className="mt-2 rounded-md bg-sky px-3 py-2 text-xs font-medium text-ink/70">
            Sugerido por modalidad: {suggestedFocusBySport[sportModality]}. Puedes modificarlo manualmente.
          </p>
        </PlanningStep>

        <PlanningStep step="3" title="Objetivo">
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setGoal(event.target.value)}
            value={goal}
          >
            {currentConfig.goals.map((goalOption) => (
              <option key={goalOption}>{goalOption}</option>
            ))}
          </select>
        </PlanningStep>

        <PlanningStep step="4" title="Modelo de periodizacion">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(periodizationLabels) as PeriodizationModel[]).map((model) => (
              <button
                className={`rounded-md border p-3 text-left text-sm font-semibold transition ${
                  periodizationModel === model ? "border-steel bg-sky text-ink" : "border-line bg-panel/35 text-ink/70"
                }`}
                key={model}
                onClick={() => handleModelChange(model)}
                type="button"
              >
                {periodizationLabels[model]}
              </button>
            ))}
          </div>
        </PlanningStep>

        <PlanningStep step="5" title="Subtipo / distribucion">
          <select
            className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
            onChange={(event) => setPeriodizationSubtype(event.target.value)}
            value={periodizationSubtype}
          >
            {subtypeOptions.map((subtype) => (
              <option key={subtype}>{subtype}</option>
            ))}
          </select>
          {baseCategory === "endurance" && periodizationModel === "undulating" && (
            <p className="mt-2 rounded-md bg-wheat px-3 py-2 text-xs font-medium text-ink/70">
              Piramidal y polarizada son distribuciones de intensidad, no modelos puros.
            </p>
          )}
        </PlanningStep>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <PlanningStep step="6" title="Metricas principales">
          <div className="flex flex-wrap gap-2">
            {currentConfig.metricOptions.map((metric) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  selectedMetrics.includes(metric)
                    ? "border-moss bg-mint text-moss"
                    : "border-line bg-panel/35 text-ink/65"
                }`}
                key={metric}
                onClick={() => toggleMetric(metric)}
                type="button"
              >
                {metric}
              </button>
            ))}
          </div>
        </PlanningStep>

        <PlanningStep step="7" title="Volumen, intensidad, fatiga y notas">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Volumen objetivo
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setTargetVolume(event.target.value)}
                value={targetVolume}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Intensidad objetivo
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setTargetIntensity(event.target.value)}
                value={targetIntensity}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/75">
              Fatiga objetivo
              <input
                className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                onChange={(event) => setTargetFatigue(event.target.value)}
                value={targetFatigue}
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
            Notas
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-panel/35 px-3 py-3 text-ink outline-none focus:border-moss"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto del deportista, competiciones, restricciones, preferencias..."
              value={notes}
            />
          </label>
        </PlanningStep>

        <PlanningSummary selectedPlan={selectedPlan} />
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
    goal: string;
    mainLoadMetrics: string[];
    notes: string;
    periodizationModel: PeriodizationModel;
    periodizationSubtype: string;
    planningFocus: PlanningFocus;
    sportModality: SportModality;
    targetFatigue: string;
    targetIntensity: string;
    targetVolume: string;
  };
}) {
  return (
    <section className="mt-5 rounded-md border border-line bg-ink p-4 text-white">
      <h3 className="font-semibold">Resumen final</h3>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p className="rounded-md bg-white/10 px-3 py-2">Modalidad deportiva: {selectedPlan.sportModality}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Enfoque de planificacion: {selectedPlan.planningFocus}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Objetivo: {selectedPlan.goal}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Periodizacion: {periodizationLabels[selectedPlan.periodizationModel]}</p>
        <p className="rounded-md bg-white/10 px-3 py-2 sm:col-span-2">Subtipo: {selectedPlan.periodizationSubtype}</p>
        <p className="rounded-md bg-white/10 px-3 py-2 sm:col-span-2">
          Metricas principales: {selectedPlan.mainLoadMetrics.join(", ") || "Sin seleccionar"}
        </p>
        <p className="rounded-md bg-white/10 px-3 py-2">Volumen: {selectedPlan.targetVolume}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Intensidad: {selectedPlan.targetIntensity}</p>
        <p className="rounded-md bg-white/10 px-3 py-2">Fatiga: {selectedPlan.targetFatigue}</p>
        {selectedPlan.notes && (
          <p className="rounded-md bg-white/10 px-3 py-2 sm:col-span-2">Notas: {selectedPlan.notes}</p>
        )}
      </div>
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

function ExerciseProgressionsView() {
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
                        {isSelected ? "Añadido" : "Añadir"}
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

function MessagesView() {
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0].id);
  const selectedThread =
    messageThreads.find((thread) => thread.id === selectedThreadId) ?? messageThreads[0];

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Conversaciones</h2>
          <span className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
            {messageThreads.reduce((total, thread) => total + thread.unread, 0)} sin leer
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {messageThreads.map((thread) => (
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

function AssessmentsView() {
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

function CalendarView() {
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

      {viewMode === "Dia" ? (
        <div className="mt-6 grid gap-3">
          {todaySessions.map((session) => (
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

function CoachTrainingPlanner() {
  const plannedTonnage = plannedSession.strengthExercises.reduce(
    (total, exercise) => total + exercise.sets * exercise.reps * exercise.load,
    0
  );

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Planificar sesion</h2>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
            Objetivo: {plannedSession.strengthObjective}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Deportista
            <select className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss">
              {coachClients.map((client) => (
                <option key={client.name}>{client.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Fecha
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
              type="date"
            />
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

        <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-white sm:w-auto" type="button">
          <Send size={18} />
          Enviar al deportista
        </button>
      </section>

      <aside className="rounded-md border border-line bg-ink p-5 text-white shadow-soft">
        <h2 className="text-lg font-semibold">Datos que pedira la app</h2>
        <p className="mt-2 text-sm text-white/65">
          Al registrar la sesion se calculara carga interna y cuantificadores especificos.
        </p>
        <div className="mt-5 grid gap-3">
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-sm font-semibold">Carga interna comun</p>
            <p className="mt-1 text-sm text-white/65">Duracion, RPE, sRPE de sesion y wellness Hooper previo.</p>
          </div>
          {sessionQuantifiers.map((group) => (
            <div className="rounded-md bg-white/10 p-4" key={group.type}>
              <p className="text-sm font-semibold">{group.type}</p>
              <p className="mt-1 text-sm text-white/65">{group.items.join(", ")}</p>
            </div>
          ))}
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
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
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
              <div className="mt-3 grid grid-cols-5 gap-2">
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

      <div className="space-y-6">
        <AdherenceCard />
        <section className={`rounded-md border border-line p-5 shadow-soft ${hooperDone ? "bg-white" : "bg-white/60"}`}>
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
              <div className="mt-4 rounded-md border border-line bg-panel/35 p-4">
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

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
      <h4 className="font-semibold text-amber-900">Cuéntanos por que no se realizo</h4>
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
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
            <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
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
            <div className="grid gap-3 sm:grid-cols-2">
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
