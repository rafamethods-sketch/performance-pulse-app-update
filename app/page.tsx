"use client";

import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  LogOut,
  Moon,
  Plus,
  Search,
  Send,
  Settings2,
  Sun,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { AthleteCalendarView } from "@/components/athlete/athlete-calendar-view";
import { AthleteHistoryView } from "@/components/athlete/athlete-history-view";
import { AthleteIntakeQuestionnaire } from "@/components/athlete/athlete-intake-questionnaire";
import { AthletePlanningView } from "@/components/athlete/athlete-planning-view";
import { AthleteProfileView } from "@/components/athlete/athlete-profile-view";
import { AthleteTodayView } from "@/components/athlete/athlete-today-view";
import { AthleteWeeklyLoadView } from "@/components/athlete/athlete-weekly-load-view";
import { CalendarView } from "@/components/coach/coach-calendar-view";
import { CoachAttentionCenter } from "@/components/coach/coach-attention-center";
import { CoachAnkleAssessment } from "@/components/coach/coach-ankle-assessment";
import { CoachKneeAssessment } from "@/components/coach/coach-knee-assessment";
import { CoachAnalyticsView } from "@/components/coach/coach-analytics-view";
import { ClientDashboardView } from "@/components/coach/client-dashboard-view";
import { CoachMessagesView } from "@/components/coach/coach-messages-view";
import { CoachResourcesView, type ResourceLink } from "@/components/coach/coach-resources-view";
import { CoachTodayView } from "@/components/coach/coach-today-view";
import { ResistanceMethodsView } from "@/components/coach/resistance-methods-view";
import { RepetitionSpectrum } from "@/components/shared/repetition-spectrum";
import { ExerciseTempoEditor } from "@/components/shared/exercise-tempo-editor";
import type { CoachDecisionLogEntry, TargetTrainingSession } from "@/components/coach/types";
import { ankleStatusLabels, getAnkleDomainStatuses, type AnkleAssessment, type AnkleDomainStatus } from "@/lib/ankle-assessment";
import { getKneeDomainStatuses, kneeStatusLabels, type KneeAssessment, type KneeDomainStatus } from "@/lib/knee-assessment";
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
import { getPlannedSessionImpact, getSessionImpact, getSessionImpactStyle } from "@/lib/session-impact";
import {
  assessmentAnalysisRequirements,
  assessmentCatalog,
  getAssessmentCatalogTest,
  getBilateralAssessmentResult,
  getAssessmentCatalogCategory,
  getNormalizedAssessmentMetric,
  type AssessmentCatalogCategoryId,
  type AssessmentMetricValue,
  type AssessmentCatalogTest,
  type LoadVelocityPoint,
  type LoadVelocityProfile
} from "@/lib/assessment-catalog";
import { getNextSessionCompatibility, getSessionCompatibilityStyle } from "@/lib/session-compatibility";
import { groupSessionsByBlockAndWeek } from "@/lib/session-grouping";
import { formatRepetitionTotal, getPlannedRepetitionTotal, type ClusterConfig, type SetMethod } from "@/lib/training-prescription";
import { formatExerciseTempo, isCompleteExerciseTempo, normalizeExerciseTempo, type ExerciseTempo } from "@/lib/exercise-tempo";
import {
  getWeeklyCoachReview,
  getWeeklyReviewStyle,
  type WeeklyReviewSession
} from "@/lib/weekly-review";
import {
  getPlanningGoal,
  getPlanningMethodDescription,
  getPlanningMethodLabel,
  getPlanningPhase,
  getPrescriptionPreset,
  getPlanningSessionGoal,
  getPlanningSessionType,
  planningConfig,
  planningGoalGroups,
  planningPhaseOptions,
  planningSessionGoalsByType,
  planningSessionTypeOptions,
  type PlanningGoalId,
  type PlanningEffortScale,
  type PlanningMethod,
  type PlanningPhaseId,
  type PlanningSessionGoalId,
  type PlanningSessionTypeId,
  type WeeklyDistribution
} from "@/lib/planning-config";
import {
  bodyRegionLabels,
  bodyRegions,
  exercisePatterns,
  exerciseLibrary,
  getExerciseById,
  getExercisePatternsByBodyRegion,
  getExercisesByPattern,
  patternBodyRegions,
  searchExercises,
  type BodyRegion,
  type ExerciseDefinition,
  type ExercisePattern,
  type ExerciseVariantDifficulty,
  type ExerciseVariantType
} from "@/lib/exercises";
import {
  activationRoleLabels,
  evidenceStrengthLabels,
  getActivationMusclesByRole,
  getExerciseActivationEvidence
} from "@/lib/exercise-activation-evidence";
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
import {
  getCompleteResistanceMethods,
  getResistanceMethodById,
  resistanceMethods,
  type ResistanceMethod
} from "@/lib/resistance-methods";
import {
  getSportZoneProfile,
  getSportZoneProfiles,
  type ResistanceSport,
  type ResistanceZone
} from "@/lib/resistance-zones";
import {
  estimateMenstrualPhase,
  getCycleTrainingContext,
  getLatestMenstrualEntry,
  getMenstrualSymptomSummary,
  type ClientSex,
  type MenstrualTracking
} from "@/lib/menstrual-cycle";
import {
  buildInitialIntakeQuestionnaire,
  getIntakeAnswerLabel,
  intakeRestrictionLabels,
  intakeSessionDurationLabels,
  intakeSleepLabels,
  intakeStrengthExperienceLabels,
  intakeStressLabels,
  intakeTrainingLocationLabels,
  intakeYesNoLabels,
  isIntakeRequiredAndIncomplete,
  mergeIntakeAnswers,
  type IntakeQuestionnaire
} from "@/lib/intake-questionnaire";
import { supabase } from "@/lib/supabase";
import {
  coachClients,
  decisionDashboard,
  fatigueLegend,
  plannedSession,
  type SheetId,
  type UserRole
} from "@/lib/data";

type ResistanceCardioResult = CardioResult & {
  intensityCompleted?: string;
  intervalsCompleted?: string;
  notes?: string;
  recoveryCompleted?: string;
};

type PlannedResistanceZoneId = ResistanceZone["id"] | "";

type TrainingAvailability = {
  consecutiveDays: boolean;
  daysPerWeek: number;
};
type TrainerClientPanel = "list" | "dashboard" | "details";
type ManagementSection = "clients" | "metrics" | "access";
type ThemePreference = "light" | "dark";

const themeStorageKey = "coach_theme_preference";

export default function ClientsPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetId>("attention");
  const [managementSection, setManagementSection] = useState<ManagementSection>("clients");
  const [trainerClientPanel, setTrainerClientPanel] = useState<TrainerClientPanel>("list");
  const [clients, setClients] = useState<CoachClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [scopedClientId, setScopedClientId] = useState("");
  const [targetTrainingSession, setTargetTrainingSession] = useState<TargetTrainingSession | null>(null);
  const [ankleAssessmentClientId, setAnkleAssessmentClientId] = useState("");
  const [kneeAssessmentClientId, setKneeAssessmentClientId] = useState("");
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
        setActiveSheet("attention");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      if (email) {
        setRole("coach");
        setActiveSheet("attention");
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

  function activateDemoAthlete() {
    const demoClient = buildDemoClient();

    setClients((currentClients) => [
      demoClient,
      ...currentClients.filter((listedClient) => !isDemoClient(listedClient))
    ]);
    setSelectedClientId(demoClient.id);
    setRole("athlete");
    setActiveSheet("today");
  }

  function handleLogin(nextRole: UserRole) {
    if (nextRole === "athlete") {
      activateDemoAthlete();
      return;
    }

    setRole(nextRole);
    setActiveSheet("attention");
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
  const athleteNeedsIntake = role === "athlete" && isIntakeRequiredAndIncomplete(athleteClient?.intakeQuestionnaire);

  function handleSheetChange(sheet: SheetId) {
    setActiveSheet(sheet);
    setScopedClientId("");
    if (sheet === "management") {
      setManagementSection("clients");
      setTrainerClientPanel("list");
    }
    if (sheet === "clients") {
      setTrainerClientPanel("list");
    }
  }

  function returnToManagement() {
    setActiveSheet("management");
    setManagementSection("clients");
    setTrainerClientPanel("list");
    setScopedClientId("");
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setRole(null);
    setActiveSheet("attention");
    setManagementSection("clients");
    setTrainerClientPanel("list");
    setSelectedClientId("");
    setScopedClientId("");
    setTargetTrainingSession(null);
  }

  function openClientPanel(clientId: string, panel: Exclude<TrainerClientPanel, "list">) {
    setSelectedClientId(clientId);
    setTrainerClientPanel(panel);
    setManagementSection("clients");
    setActiveSheet("management");
  }

  function openClientSheet(clientId: string, sheet: SheetId) {
    setScopedClientId(clientId);
    setActiveSheet(sheet);
  }

  function openTrainingSession(clientId: string, target?: TargetTrainingSession) {
    setTargetTrainingSession(target ?? null);
    openClientSheet(clientId, "training");
  }

  function openAnkleAssessment(clientId: string) {
    setAnkleAssessmentClientId(clientId);
    openClientSheet(clientId, "assessments");
  }

  function openKneeAssessment(clientId: string) {
    setKneeAssessmentClientId(clientId);
    openClientSheet(clientId, "assessments");
  }

  function openTrainingDraft(target: TargetTrainingSession) {
    setTargetTrainingSession(target);
    setScopedClientId(target.clientId ?? "");
    setActiveSheet("training");
  }

  function getPlannedSessionCopy(session: ClientSessionRecord) {
    const legacyExercises = (session as ClientSessionRecord & { exercises?: ConnectedSessionExercise[] }).exercises ?? [];
    const sourceExercises = (session.plannedExercises?.length ? session.plannedExercises : legacyExercises) ?? [];

    return sourceExercises.map((exercise) => ({
      ...exercise,
      actualRest: undefined,
      athleteNotes: undefined,
      exerciseRpe: undefined,
      performedRpe: undefined,
      planningSlotId: undefined,
      setDetails: undefined,
      techniqueReview: undefined,
      techniqueVideoNote: undefined,
      techniqueVideoUrl: undefined,
      techniqueVideoView: undefined
    }));
  }

  function createPlannedSessionCopy(sourceSession: ClientSessionRecord, date: string, time?: string, idSuffix = `${Date.now()}`): ClientSessionRecord {
    return {
      ...sourceSession,
      actualDurationMinutes: undefined,
      athleteQuickFeedback: null,
      athleteQuickFeedbackNote: undefined,
      cardioResult: undefined,
      completed: false,
      date,
      discomfort: undefined,
      duration: undefined,
      finalNotes: undefined,
      finalRpe: undefined,
      id: `session-${idSuffix}`,
      linkedCardioActivityId: undefined,
      notes: undefined,
      performedExercises: [],
      plannedExercises: getPlannedSessionCopy(sourceSession),
      planningOrigin: undefined,
      reviewedAt: undefined,
      reviewNotes: undefined,
      reviewStatus: undefined,
      rpe: undefined,
      sRPE: undefined,
      srpe: undefined,
      status: "Planificada",
      time: time || sourceSession.time || undefined,
      wellness: undefined,
      wellnessConfirmedAt: undefined
    };
  }

  function duplicateCalendarSession(clientId: string, sessionIndex: number, newDate: string, newTime?: string) {
    setClients((currentClients) =>
      currentClients.map((listedClient) => {
        if (listedClient.id !== clientId) return listedClient;
        const sourceSession = listedClient.sessionRecords?.[sessionIndex];
        if (!sourceSession) return listedClient;
        const duplicatedSession = createPlannedSessionCopy(sourceSession, newDate, newTime);

        return {
          ...listedClient,
          sessionRecords: [duplicatedSession, ...(listedClient.sessionRecords ?? [])]
        };
      })
    );
  }

  function moveCalendarSession(clientId: string, sessionIndex: number, newDate: string, newTime?: string) {
    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              sessionRecords: (listedClient.sessionRecords ?? []).map((session, index) =>
                index === sessionIndex
                  ? {
                      ...session,
                      date: newDate,
                      time: newTime || session.time || undefined
                    }
                  : session
              )
            }
          : listedClient
      )
    );
  }

  function moveCalendarSessionFromCalendar(clientId: string, sessionIndex: number, newDate: string) {
    const clientForMove = clients.find((listedClient) => listedClient.id === clientId);
    const session = clientForMove?.sessionRecords?.[sessionIndex];
    if (!clientForMove || !session) return { ok: false, message: "No se ha encontrado la sesión." };

    if (hasCalendarSessionRegisteredData(session)) {
      return { ok: false, message: "No se puede mover desde el calendario una sesión con datos registrados." };
    }

    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              sessionRecords: (listedClient.sessionRecords ?? []).map((listedSession, index) =>
                index === sessionIndex
                  ? {
                      ...listedSession,
                      date: newDate
                    }
                  : listedSession
              )
            }
          : listedClient
      )
    );

    return { ok: true, message: "Sesión movida al día seleccionado." };
  }

  function deleteCalendarSession(clientId: string, sessionIndex: number) {
    const clientForDelete = clients.find((listedClient) => listedClient.id === clientId);
    const session = clientForDelete?.sessionRecords?.[sessionIndex];
    if (!clientForDelete || !session) return { ok: false, message: "No se ha encontrado la sesión." };

    if (hasCalendarSessionRegisteredData(session)) {
      return { ok: false, message: "No se puede eliminar desde papelera una sesión con datos registrados." };
    }

    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              sessionRecords: (listedClient.sessionRecords ?? []).filter((_, index) => index !== sessionIndex)
            }
          : listedClient
      )
    );

    return { ok: true, message: "Sesión eliminada del calendario." };
  }

  function createCalendarEvent(clientId: string, event: Omit<CoachCalendarEvent, "id">) {
    const createdEvent: CoachCalendarEvent = {
      ...event,
      clientId,
      id: `calendar-event-${Date.now()}`
    };

    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              calendarEvents: [createdEvent, ...(listedClient.calendarEvents ?? [])]
            }
          : listedClient
      )
    );

    return createdEvent;
  }

  function deleteCalendarEvent(clientId: string, eventId: string) {
    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              calendarEvents: (listedClient.calendarEvents ?? []).filter((event) => event.id !== eventId)
            }
          : listedClient
      )
    );

    return { ok: true, message: "Evento eliminado del calendario." };
  }

  function moveCalendarEvent(clientId: string, eventId: string, newDate: string) {
    setClients((currentClients) =>
      currentClients.map((listedClient) => listedClient.id === clientId
        ? { ...listedClient, calendarEvents: (listedClient.calendarEvents ?? []).map((event) => event.id === eventId ? { ...event, date: newDate } : event) }
        : listedClient)
    );
    return { ok: true, message: "Evento movido en el calendario." };
  }

  function updateCalendarEventTime(clientId: string, eventId: string, time?: string) {
    setClients((currentClients) =>
      currentClients.map((listedClient) => listedClient.id === clientId
        ? {
            ...listedClient,
            calendarEvents: (listedClient.calendarEvents ?? []).map((event) =>
              event.id === eventId ? { ...event, time: time || undefined } : event
            )
          }
        : listedClient)
    );
    return { ok: true, message: time ? "Hora del evento actualizada." : "Evento movido a Sin hora." };
  }

  function createRecurringCalendarSessions(clientId: string, sessionIndex: number, dates: string[], time?: string) {
    const clientForCheck = clients.find((listedClient) => listedClient.id === clientId);
    const sourceSession = clientForCheck?.sessionRecords?.[sessionIndex];
    if (!clientForCheck || !sourceSession || dates.length === 0) return 0;

    const duplicateCount = dates.filter((date) =>
      (clientForCheck.sessionRecords ?? []).some((session) =>
        session.date === date &&
        session.summary === sourceSession.summary &&
        session.type === sourceSession.type
      )
    ).length;

    if (
      duplicateCount > 0 &&
      !window.confirm("Ya existe una sesión parecida en alguna fecha seleccionada. ¿Quieres crearla igualmente?")
    ) {
      return 0;
    }

    const createdSessions = dates.map((date, index) =>
      createPlannedSessionCopy(sourceSession, date, time, `${Date.now()}-${index}`)
    );

    setClients((currentClients) =>
      currentClients.map((listedClient) =>
        listedClient.id === clientId
          ? {
              ...listedClient,
              sessionRecords: [...createdSessions, ...(listedClient.sessionRecords ?? [])]
            }
          : listedClient
      )
    );

    return createdSessions.length;
  }

  const activeClientForTitle =
    scopedClient ??
    (((activeSheet === "clients" || activeSheet === "management") && trainerClientPanel !== "list") ? selectedClient : null);
  const pageTitle = (() => {
    if (activeSheet === "today") return role === "coach" ? "Resumen del día" : "Hoy";
    if (activeSheet === "clients" || activeSheet === "management") {
      if (role === "coach" && trainerClientPanel === "dashboard") return `Resumen - ${selectedClient?.name ?? "cliente"}`;
      if (role === "coach" && trainerClientPanel === "details") return `Información - ${selectedClient?.name ?? "cliente"}`;
      return "Gestión";
    }
    if (activeSheet === "attention") return "Centro de control";
    if (activeSheet === "analytics") return "Métricas";
    if (activeSheet === "training") return role === "coach" && scopedClient ? `Sesiones - ${scopedClient.name}` : role === "coach" ? "Entrenamiento" : "Historial";
    if (activeSheet === "assessments") return role === "coach" && scopedClient ? `Valoraciones - ${scopedClient.name}` : "Valoraciones";
    if (activeSheet === "calendar") return role === "coach" ? "Calendario" : "Semana";
    if (activeSheet === "clientProgress") return role === "coach" && scopedClient ? `Progreso - ${scopedClient.name}` : "Progreso";
    if (activeSheet === "clientWellness") return role === "coach" && scopedClient ? `Bienestar - ${scopedClient.name}` : "Bienestar";
    if (activeSheet === "fatigue") return "Fatiga";
    if (activeSheet === "weeklyLoad") return role === "coach" ? "Métricas" : "Progreso";
    if (activeSheet === "planning") return role === "coach" && scopedClient ? `Planificación - ${scopedClient.name}` : "Planificación";
    if (activeSheet === "athleteProfile") return "Perfil";
    if (activeSheet === "progressions") return "Biblioteca";
    if (activeSheet === "resources") return "Recursos";
    if (activeSheet === "routines") return "Rutinas";
    if (activeSheet === "messages") return role === "coach" ? "Comunicación" : "Mensajes";
    return "Dashboard";
  })();

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
              <h1 className="text-xl font-semibold text-ink sm:text-2xl">{pageTitle}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeSelector
                onThemeChange={setThemePreference}
                themePreference={themePreference}
              />
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink/70 shadow-soft transition hover:text-ink"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
            </div>
          </div>

          {role === "coach" && activeClientForTitle ? (
            <ActiveClientBar
              activeSheet={activeSheet}
              client={activeClientForTitle}
              onBack={returnToManagement}
              onOpenClientSheet={openClientSheet}
              onOpenDashboard={(clientId) => openClientPanel(clientId, "dashboard")}
              onOpenDetails={(clientId) => openClientPanel(clientId, "details")}
              trainerClientPanel={trainerClientPanel}
            />
          ) : null}

          {role === "athlete" && athleteClient && athleteNeedsIntake ? (
            <AthleteIntakeQuestionnaire
              client={athleteClient}
              onUpdateClient={(updatedClient) =>
                setClients((currentClients) =>
                  currentClients.map((listedClient) =>
                    listedClient.id === updatedClient.id ? updatedClient : listedClient
                  )
                )
              }
            />
          ) : activeSheet === "today" ? (
            role === "coach" ? (
              <CoachTodayView clients={clients} onOpenTrainingSession={openTrainingSession} />
            ) : getClientAccessInfo(athleteClient).status === "expired" ? (
              <AthleteAccessEndedNotice
                client={athleteClient}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
              />
            ) : (
              <AthleteTodayView
                client={athleteClient}
                onShowCalendar={() => setActiveSheet("calendar")}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
                onShowProfile={() => setActiveSheet("athleteProfile")}
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
          ) : activeSheet === "management" ? (
            role === "coach" ? (
              <CoachManagementView
                activeSection={managementSection}
                client={selectedClient}
                clients={clients}
                onBack={returnToManagement}
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
                onSectionChange={setManagementSection}
                panel={trainerClientPanel}
                setClients={setClients}
              />
            ) : getClientAccessInfo(athleteClient).status === "expired" ? (
              <AthleteAccessEndedNotice
                client={athleteClient}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
              />
            ) : (
              <AthleteTodayView
                client={athleteClient}
                onShowCalendar={() => setActiveSheet("calendar")}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
                onShowProfile={() => setActiveSheet("athleteProfile")}
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
                onBack={returnToManagement}
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
            ) : getClientAccessInfo(athleteClient).status === "expired" ? (
              <AthleteAccessEndedNotice
                client={athleteClient}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
              />
            ) : (
              <AthleteTodayView
                client={athleteClient}
                onShowCalendar={() => setActiveSheet("calendar")}
                onShowHistory={() => setActiveSheet("training")}
                onShowPlanning={() => setActiveSheet("planning")}
                onShowProfile={() => setActiveSheet("athleteProfile")}
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
                onGoClients={() => setActiveSheet("management")}
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
          ) : activeSheet === "attention" ? (
            role === "coach" ? (
              <CoachAttentionCenter
                clients={clients}
                onOpenAnkleAssessment={openAnkleAssessment}
                onOpenKneeAssessment={openKneeAssessment}
                onOpenClientAssessments={(clientId) => openClientSheet(clientId, "assessments")}
                onOpenClientDetails={(clientId) => openClientPanel(clientId, "details")}
                onOpenClientProgress={(clientId) => openClientSheet(clientId, "clientProgress")}
                onOpenTrainingSession={openTrainingSession}
              />
            ) : <DecisionDashboardView />
          ) : activeSheet === "analytics" ? (
            role === "coach" ? <CoachAnalyticsView clients={clients} /> : <DecisionDashboardView />
          ) : activeSheet === "assessments" ? (
            <AssessmentsView
              client={role === "coach" ? scopedClient : null}
              onConsumeAnkleRequest={() => setAnkleAssessmentClientId("")}
              onConsumeKneeRequest={() => setKneeAssessmentClientId("")}
              openAnkleOnLoad={Boolean(scopedClient && ankleAssessmentClientId === scopedClient.id)}
              openKneeOnLoad={Boolean(scopedClient && kneeAssessmentClientId === scopedClient.id)}
              onUpdateClient={(updatedClient) =>
                setClients((currentClients) =>
                  currentClients.map((listedClient) =>
                    listedClient.id === updatedClient.id ? updatedClient : listedClient
                  )
                )
              }
            />
          ) : activeSheet === "clientProgress" ? (
            role === "coach" ? (
              <ClientProgressView
                client={scopedClient}
                onOpenAssessments={(clientId) => openClientSheet(clientId, "assessments")}
                onOpenTraining={(clientId) => openClientSheet(clientId, "training")}
                onOpenWellness={(clientId) => openClientSheet(clientId, "clientWellness")}
              />
            ) : <DecisionDashboardView />
          ) : activeSheet === "clientWellness" ? (
            role === "coach" ? (
              <ClientWellnessView
                client={scopedClient}
                onOpenTrainingSession={openTrainingSession}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) =>
                    currentClients.map((listedClient) =>
                      listedClient.id === updatedClient.id ? updatedClient : listedClient
                    )
                  )
                }
              />
            ) : <DecisionDashboardView />
          ) : activeSheet === "calendar" ? (
            role === "coach" ? (
              <CalendarView
                client={null}
                clients={clients}
                draftClient={scopedClient}
                onCreateCalendarEvent={createCalendarEvent}
                onCreateRecurringSessions={createRecurringCalendarSessions}
                onDeleteCalendarEvent={deleteCalendarEvent}
                onDeleteSession={deleteCalendarSession}
                onDuplicateSession={duplicateCalendarSession}
                onMoveSession={moveCalendarSession}
                onMoveCalendarEvent={moveCalendarEvent}
                onMoveSessionFromCalendar={moveCalendarSessionFromCalendar}
                onOpenTrainingDraft={openTrainingDraft}
                onOpenTrainingSession={openTrainingSession}
                onUpdateCalendarEventTime={updateCalendarEventTime}
              />
            ) : (
              <AthleteCalendarView client={athleteClient} />
            )
          ) : activeSheet === "fatigue" ? (
            <FatigueMapView />
          ) : activeSheet === "weeklyLoad" ? (
            role === "coach" ? <WeeklyLoadView client={scopedClient} /> : <AthleteWeeklyLoadView client={athleteClient} />
          ) : activeSheet === "planning" ? (
            role === "coach" ? (
              <PlanningView
                client={scopedClient}
                onDeleteSession={deleteCalendarSession}
                onDuplicateSession={duplicateCalendarSession}
                onOpenAssessments={(clientId) => openClientSheet(clientId, "assessments")}
                onOpenTrainingDraft={openTrainingDraft}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) => currentClients.map((listedClient) => listedClient.id === updatedClient.id ? updatedClient : listedClient))
                }
              />
            ) : <AthletePlanningView client={athleteClient} />
          ) : activeSheet === "athleteProfile" ? (
            role === "athlete" ? (
              <AthleteProfileView
                client={athleteClient}
                onUpdateClient={(updatedClient) =>
                  setClients((currentClients) =>
                    currentClients.map((listedClient) =>
                      listedClient.id === updatedClient.id ? updatedClient : listedClient
                    )
                  )
                }
              />
            ) : <DecisionDashboardView />
          ) : activeSheet === "progressions" ? (
            role === "coach" ? <ExerciseProgressionsView client={scopedClient} /> : <DecisionDashboardView />
          ) : activeSheet === "resources" ? (
            role === "coach" ? <CoachResourcesView resources={resources} setResources={setResources} /> : <DecisionDashboardView />
          ) : activeSheet === "routines" ? (
            role === "coach" ? <RoutinesView clients={clients} trainingAvailability={trainingAvailability} /> : <DecisionDashboardView />
          ) : activeSheet === "messages" ? (
            <CoachMessagesView
              key={`${role}-${role === "athlete" ? athleteClient?.id ?? "none" : "coach"}`}
              client={role === "athlete" ? athleteClient : scopedClient}
              clients={clients}
              mode={role}
            />
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
  const themeOptions: Array<{ icon: ReactNode; label: string; value: ThemePreference }> = [
    { icon: <Sun size={14} />, label: "Claro", value: "light" },
    { icon: <Moon size={14} />, label: "Oscuro", value: "dark" }
  ];

  return (
    <div className="flex w-fit items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5 text-xs font-semibold text-ink/65 shadow-soft">
      <span className="hidden text-ink/55 sm:inline">Apariencia</span>
      <div aria-label="Apariencia" className="flex rounded-md border border-line bg-panel/60 p-0.5" role="group">
        {themeOptions.map((option) => {
          const isActive = themePreference === option.value;

          return (
            <button
              aria-pressed={isActive}
              className={`flex min-h-8 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-ink text-white shadow-soft"
                  : "text-ink/55 hover:bg-white/70 hover:text-ink"
              }`}
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              title={`Modo ${option.label.toLowerCase()}`}
              type="button"
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
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
    <main className="relative min-h-[100dvh] bg-white xl:h-[100dvh] xl:overflow-hidden">
      <div className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4">
        <ThemeSelector onThemeChange={onThemeChange} themePreference={themePreference} />
      </div>

      <section className="grid min-h-[100dvh] xl:h-[100dvh] xl:grid-cols-[minmax(0,1.55fr)_minmax(400px,1fr)]">
        <div className="relative flex min-h-[280px] overflow-hidden bg-slate-950 text-white sm:min-h-[320px] md:min-h-[360px] xl:min-h-[100dvh]">
          <Image
            alt="Entrenamiento de fuerza en gimnasio"
            className="object-cover object-[center_38%]"
            fill
            priority
            sizes="(min-width: 1280px) 61vw, 100vw"
            src="/login/rac-login-hero.png"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/78 via-slate-950/38 to-blue-950/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />

          <div className="relative z-10 flex w-full flex-col justify-end px-5 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10 xl:px-16 xl:pb-24 xl:pt-14">
            <div className="max-w-2xl">
              <p className="text-[clamp(2rem,5vw,4.8rem)] font-black uppercase leading-[0.94] tracking-[-0.04em] drop-shadow-lg">
                Entrenamiento
                <span className="mt-1 block text-[#2589ff]">inteligente.</span>
                <span className="mt-1 block">Resultados reales.</span>
              </p>
            </div>

            <div className="mt-6 grid max-w-xl grid-cols-3 gap-1.5 border-t border-white/20 pt-4 sm:mt-8 sm:gap-5 sm:pt-5 xl:mt-14">
              {[
                { icon: <CalendarDays size={18} strokeWidth={1.8} />, label: "Planifica" },
                { icon: <BarChart3 size={18} strokeWidth={1.8} />, label: "Monitoriza" },
                { icon: <Target size={18} strokeWidth={1.8} />, label: "Progresa" }
              ].map((item) => (
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white/85 sm:gap-2 sm:text-xs sm:tracking-[0.13em]" key={item.label}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-[#4da0ff] backdrop-blur-sm sm:size-8">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 hidden h-12 items-center border-t border-white/10 bg-slate-950/30 px-8 backdrop-blur-sm xl:flex">
            <p className="w-full truncate text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25">
              RAC System · Train with intelligence · Planifica · Monitoriza · Progresa
            </p>
          </div>
        </div>

        <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 sm:py-12 lg:px-14 xl:px-10 xl:py-14 2xl:px-14">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <Image
                alt="RAC System"
                className="h-auto w-full max-w-[240px] object-contain sm:max-w-[280px] xl:max-w-[300px]"
                height={724}
                priority
                src="/login/rac-system-logo.png"
                width={2172}
              />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
                Train with intelligence
              </p>
            </div>

            <button
              className="mt-9 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#1677ff] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(22,119,255,0.22)] transition hover:bg-[#0f65d9] hover:shadow-[0_12px_28px_rgba(22,119,255,0.28)]"
              onClick={handleGoogleLogin}
              type="button"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white text-xs font-black text-[#1677ff]">G</span>
              Continuar con Google
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
              Accede con tu cuenta para guardar tu información y mantener tu progreso.
            </p>

            {authMessage && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {authMessage}
              </p>
            )}

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">o prueba la app como</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3">
              <button
                className="group flex min-h-16 w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 shadow-sm transition hover:border-[#1677ff]/45 hover:bg-blue-50/40 hover:shadow-md"
                onClick={() => onLogin("coach")}
                type="button"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white transition group-hover:bg-[#1677ff]">
                  <ClipboardCheck size={20} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-sm font-bold">Ver demo entrenador</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Gestiona planificación, clientes y seguimiento.</span>
                </span>
              </button>

              <button
                className="group flex min-h-16 w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 shadow-sm transition hover:border-[#1677ff]/45 hover:bg-blue-50/40 hover:shadow-md"
                onClick={() => onLogin("athlete")}
                type="button"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#1677ff] transition group-hover:bg-[#1677ff] group-hover:text-white">
                  <Dumbbell size={20} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-sm font-bold">Ver demo deportista</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Consulta tu entrenamiento y registra tu progreso.</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

type BaseCoachClient = (typeof coachClients)[number];
type ClientWellness = {
  calm?: number;
  energy?: number;
  fatigue: number;
  motivation: number;
  recovery?: number;
  sleep: number;
  soreness: number;
  stress: number;
};
type TechniqueVideoView = "front" | "side" | "back" | "other";
type TechniqueReviewStatus = "not_reviewed" | "ok" | "minor_compensation" | "moderate_compensation" | "high_compensation";
type TechniqueAssessmentStatus = "ok" | "watch" | "issue";
type TechniqueAssessmentSide = "left" | "right" | "both" | "not_applicable";
type TechniqueAssessmentSeverity = "low" | "moderate" | "high";
type TechniqueGlobalScore = "good" | "acceptable" | "needs_work" | "high_priority";
type TechniquePlanningDecision =
  | "keep_progression"
  | "repeat_exercise"
  | "regress"
  | "reduce_load"
  | "change_exercise"
  | "mobility_or_control_focus"
  | "";

type TechniqueAssessmentItem = {
  id: string;
  label: string;
  note?: string;
  severity?: TechniqueAssessmentSeverity;
  side?: TechniqueAssessmentSide;
  status: TechniqueAssessmentStatus;
};

type TechniqueReview = {
  checklist?: TechniqueAssessmentItem[];
  coachFeedback?: string;
  compensationTags?: string[];
  globalScore?: TechniqueGlobalScore;
  markedAsReference?: boolean;
  planningDecision?: TechniquePlanningDecision;
  status?: TechniqueReviewStatus;
};

type CoachPrivateNoteCategory = "training" | "injury" | "communication" | "technical" | "admin" | "other";

type CoachPrivateNote = {
  category?: CoachPrivateNoteCategory;
  createdAt: string;
  id: string;
  pinned?: boolean;
  text: string;
  title?: string;
  updatedAt?: string;
};

type ConnectedSessionExercise = SessionExerciseInput & {
  actualRest?: number | string | null;
  athleteNotes?: string | null;
  bandColor?: string | null;
  bandResistance?: string | null;
  block?: string | null;
  exerciseRpe?: number | string | null;
  id?: string | null;
  intensityMethod?: StrengthIntensityMethod | null;
  observation?: string | null;
  percent1RM?: number | string | null;
  plannedRest?: number | string | null;
  plannedRir?: number | string | null;
  plannedRpe?: number | string | null;
  planningSlotId?: string | null;
  rest?: number | string | null;
  rir?: number | string | null;
  section?: string | null;
  sessionBlock?: "activation" | "main" | "complementary" | null;
  selectedEquipment?: string | null;
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  setDetails?: Array<{ reps?: number | string | null; setNumber: number }>;
  plannedSetReps?: Array<number | string> | null;
  setMethod?: SetMethod | null;
  clusterConfig?: ClusterConfig | null;
  tempo?: ExerciseTempo | null;
  targetVelocity?: string | null;
  targetRir?: number | string | null;
  techniqueReview?: TechniqueReview;
  techniqueVideoNote?: string | null;
  techniqueVideoUrl?: string | null;
  techniqueVideoView?: TechniqueVideoView | null;
  videoNote?: string | null;
  videoUrl?: string | null;
  prescriptionBlockId?: string | null;
  prescriptionRole?: PlanningPrescriptionRole | null;
  prescriptionSource?: "default" | "custom" | "legacy" | null;
};
type ClientSessionRecord = Partial<BaseCoachClient["sessionRecords"][number]> & {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: ResistanceCardioResult;
  completed?: boolean;
  date: string;
  discomfort?: SessionDiscomfort & { reviewedAt?: string };
  enduranceMethod?: EnduranceIntensityMethod;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  id?: string;
  isDemo?: boolean;
  linkedCardioActivityId?: string;
  performedExercises?: ConnectedSessionExercise[];
  plannedExercises?: ConnectedSessionExercise[];
  planningOrigin?: {
    blockId: string;
    templateDayIndex: number;
    weekNumber: number;
  };
  resistanceMethodId?: string;
  resistanceSport?: ResistanceSport;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewStatus?: "pending" | "reviewed";
  sessionNumber?: number | string | null;
  sessionGoalId?: PlanningSessionGoalId;
  sessionTypeId?: PlanningSessionTypeId;
  srpe?: number | string | null;
  sRPE?: number | string | null;
  status?: string | null;
  strengthMethod?: StrengthIntensityMethod;
  summary: string;
  targetResistanceZoneId?: ResistanceZone["id"];
  targetRpe?: number | string | null;
  time?: string | null;
  type: string;
  week?: number | string | null;
  weekLabel?: string | null;
  wellness?: ClientWellness;
  wellnessConfirmedAt?: string;
};

function hasCalendarSessionRegisteredData(session: ClientSessionRecord) {
  const hasTechniqueVideo = (session.performedExercises ?? []).some((exercise) =>
    hasDisplayValue(exercise.techniqueVideoUrl) || hasDisplayValue(exercise.techniqueVideoNote)
  );

  return Boolean(
    session.completed ||
    session.status === "Completada" ||
    session.reviewStatus === "reviewed" ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.duration) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    Boolean(session.athleteQuickFeedback) ||
    hasDisplayValue(session.athleteQuickFeedbackNote) ||
    Boolean(session.cardioResult) ||
    Boolean(session.discomfort) ||
    (session.performedExercises?.length ?? 0) > 0 ||
    hasTechniqueVideo
  );
}

type CoachCalendarEvent = {
  clientId?: string;
  clientName?: string;
  date: string;
  id: string;
  notes?: string;
  status: "planned" | "active";
  time?: string;
  title: string;
  type: string;
};
type CoachClient = Omit<BaseCoachClient, "assessments" | "sessionRecords"> & {
  accessEndDate?: string;
  accessStartDate?: string;
  assessmentPreferences?: AssessmentPreferences;
  assessments: Array<BaseCoachClient["assessments"][number] & {
    id?: string;
    isDemo?: boolean;
    metrics?: AssessmentMetricValue[];
    loadVelocityProfile?: LoadVelocityProfile;
    protocolId?: string;
  }>;
  ankleAssessments?: AnkleAssessment[];
  kneeAssessments?: KneeAssessment[];
  availableEquipment?: string;
  business?: ClientBusinessData;
  calendarEvents?: CoachCalendarEvent[];
  cardioActivities?: CardioActivitySummary[];
  cardioConnections?: CardioConnectionStatus[];
  coachPrivateNotes?: CoachPrivateNote[];
  decisionLog?: CoachDecisionLogEntry[];
  intakeQuestionnaire?: IntakeQuestionnaire;
  isDemo?: boolean;
  menstrualTracking?: MenstrualTracking;
  onboarding?: ClientOnboarding;
  performanceTests?: {
    entries: PerformanceTestEntry[];
  };
  planning: BaseCoachClient["planning"] & {
    blocks?: EditablePlanningBlock[];
    eventDate?: string;
    eventName?: string;
    eventNotes?: string;
    method?: PlanningMethod;
    planName?: string;
    primaryObjective?: string;
    secondaryObjective?: string;
    startDate?: string;
    weeklyFrequency?: number;
    exerciseSlots?: PlanningExerciseSlot[];
  };
  sex?: ClientSex;
  sessionRecords: ClientSessionRecord[];
};
type ClientAssessment = CoachClient["assessments"][number];

type AssessmentImprovementDirection = "higher_is_better" | "lower_is_better" | "neutral";
type AssessmentPreferences = {
  favoriteTests?: string[];
  reassessmentDates?: Record<string, string>;
};

type ClientBusinessStatus = "active" | "paused" | "inactive";
type ClientAcquisitionSource = "instagram" | "referral" | "website" | "gym" | "event" | "friend" | "other" | "";

type ClientBusinessData = {
  acquisitionSource?: ClientAcquisitionSource;
  acquisitionSourceDetail?: string;
  exitReason?: string;
  joinedAt?: string;
  status?: ClientBusinessStatus;
  statusChangedAt?: string;
};

const coachPrivateNoteCategoryLabels: Record<CoachPrivateNoteCategory, string> = {
  admin: "Gestión",
  communication: "Comunicación",
  injury: "Molestias / lesión",
  other: "Otro",
  technical: "Técnica",
  training: "Entrenamiento"
};

const coachPrivateNoteCategoryOptions: Array<{ label: string; value: CoachPrivateNoteCategory }> = [
  { label: "Entrenamiento", value: "training" },
  { label: "Molestias / lesión", value: "injury" },
  { label: "Comunicación", value: "communication" },
  { label: "Técnica", value: "technical" },
  { label: "Gestión", value: "admin" },
  { label: "Otro", value: "other" }
];

type PerformanceTestCategory =
  | "strength"
  | "endurance"
  | "cycling"
  | "running"
  | "swimming"
  | "jump"
  | "mobility"
  | "body_composition"
  | "other";

type PerformanceTestEntry = {
  category: PerformanceTestCategory;
  date: string;
  id: string;
  notes?: string;
  testName: string;
  unit?: string;
  value: string;
};

type ClientOnboarding = {
  baselineTests?: {
    bodyComposition?: string;
    enduranceTests?: string;
    mobilityTests?: string;
    otherTests?: string;
    strengthTests?: string;
  };
  communication?: {
    feedbackFrequency?: "daily" | "weekly" | "after_session" | "only_when_needed" | "";
    notes?: string;
    preferredContact?: "app" | "whatsapp" | "email" | "in_person" | "";
  };
  completed?: boolean;
  completedAt?: string;
  equipmentAccess?: {
    availableEquipment?: string[];
    equipmentNotes?: string;
    gymAccess?: boolean;
    homeTraining?: boolean;
  };
  goals?: {
    mainGoal?: string;
    notes?: string;
    priority?: "performance" | "health" | "body_composition" | "return_to_play" | "general_fitness" | "";
    secondaryGoal?: string;
    targetDate?: string;
  };
  limitations?: {
    contraindications?: string;
    injuries?: string;
    medicalNotes?: string;
    movementLimitations?: string;
    painAreas?: string[];
  };
  sportProfile?: {
    competitiveLevel?: "beginner" | "intermediate" | "advanced" | "competitive" | "elite" | "";
    nextCompetitionDate?: string;
    nextCompetitionName?: string;
    primarySport?: string;
    secondarySports?: string[];
    sportCategory?: "strength" | "endurance" | "mixed" | "team" | "combat" | "other" | "";
  };
  trainingAvailability?: {
    daysPerWeek?: number;
    preferredTrainingDays?: string[];
    scheduleNotes?: string;
    sessionDurationMinutes?: number;
  };
};

const clientSexLabels: Record<ClientSex, string> = {
  female: "Mujer",
  male: "Hombre",
  other: "Otro",
  prefer_not_to_say: "Prefiero no decirlo"
};

const businessStatusLabels: Record<ClientBusinessStatus, string> = {
  active: "Activo",
  inactive: "Baja",
  paused: "Pausado"
};

const acquisitionSourceLabels: Record<ClientAcquisitionSource, string> = {
  "": "Sin especificar",
  event: "Evento",
  friend: "Amigo / conocido",
  gym: "Centro / gimnasio",
  instagram: "Instagram / redes sociales",
  other: "Otro",
  referral: "Recomendación",
  website: "Web"
};

const acquisitionSourceOptions: Array<{ label: string; value: ClientAcquisitionSource }> = [
  { label: "Sin especificar", value: "" },
  { label: "Instagram / redes sociales", value: "instagram" },
  { label: "Recomendación", value: "referral" },
  { label: "Web", value: "website" },
  { label: "Centro / gimnasio", value: "gym" },
  { label: "Evento", value: "event" },
  { label: "Amigo / conocido", value: "friend" },
  { label: "Otro", value: "other" }
];

const performanceTestCategoryLabels: Record<PerformanceTestCategory, string> = {
  body_composition: "Composición corporal",
  cycling: "Ciclismo",
  endurance: "Resistencia",
  jump: "Saltos",
  mobility: "Movilidad",
  other: "Otros",
  running: "Carrera",
  strength: "Fuerza",
  swimming: "Natación"
};

const performanceTestSuggestions: Record<PerformanceTestCategory, string[]> = {
  body_composition: ["peso", "perímetro cintura", "perímetro cadera", "pliegues", "porcentaje graso si lo aporta un dispositivo"],
  cycling: ["FTP", "MAP", "Test 20 min", "Potencia 5 min", "Potencia 1 min", "FC reposo", "FC máxima"],
  endurance: ["test personalizado"],
  jump: ["CMJ", "SJ", "Drop jump", "RSI", "Salto horizontal"],
  mobility: ["dorsiflexión tobillo", "flexión hombro", "movilidad cadera", "sit and reach"],
  other: ["test personalizado"],
  running: ["VAM", "Cooper 12 min", "Test 6 min", "1000 m", "3000 m", "5 km", "FC reposo", "FC máxima"],
  strength: ["1RM estimado", "3RM", "5RM", "Peso corporal", "Dominadas máximas", "Push-ups máximas"],
  swimming: ["CSS", "400 m", "200 m", "100 m", "Ritmo /100 m"]
};

const performanceTestCategoryOrder: PerformanceTestCategory[] = [
  "strength",
  "endurance",
  "running",
  "cycling",
  "swimming",
  "jump",
  "mobility",
  "body_composition",
  "other"
];

function getClientSexLabel(sex?: ClientSex) {
  return sex ? clientSexLabels[sex] : "Sin especificar";
}

function getClientBusinessStatus(client: CoachClient): ClientBusinessStatus {
  return client.business?.status ?? "active";
}

function getClientJoinedAt(client: CoachClient) {
  const maybeCreatedAt = (client as CoachClient & { createdAt?: string }).createdAt;
  return client.business?.joinedAt || maybeCreatedAt || client.accessStartDate || "";
}

function getClientAcquisitionSource(client: CoachClient): ClientAcquisitionSource {
  return client.business?.acquisitionSource ?? "";
}

function splitOnboardingList(value?: string | string[]) {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinOnboardingList(value?: string[]) {
  return (value ?? []).join(", ");
}

function getOnboardingValue(value?: number | string | string[] | null) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "";
  if (value === undefined || value === null) return "";
  return `${value}`.trim();
}

function getOnboardingSummary(client: Pick<CoachClient, "availableEquipment" | "availability" | "injuries" | "modality" | "nextEvent" | "onboarding" | "planning" | "sport">) {
  const onboarding = client.onboarding;
  const equipment = [
    ...(onboarding?.equipmentAccess?.availableEquipment ?? []),
    onboarding?.equipmentAccess?.gymAccess ? "Gimnasio" : "",
    onboarding?.equipmentAccess?.homeTraining ? "Casa" : ""
  ].filter(Boolean);

  return {
    availability: getOnboardingValue(onboarding?.trainingAvailability?.daysPerWeek)
      ? `${onboarding?.trainingAvailability?.daysPerWeek} días/semana${onboarding?.trainingAvailability?.sessionDurationMinutes ? ` · ${onboarding.trainingAvailability.sessionDurationMinutes} min` : ""}`
      : getOnboardingValue(client.availability),
    equipment: equipment.length > 0 ? equipment.join(", ") : getOnboardingValue(client.availableEquipment),
    limitations: getOnboardingValue(onboarding?.limitations?.injuries || onboarding?.limitations?.movementLimitations || client.injuries),
    mainGoal: getOnboardingValue(onboarding?.goals?.mainGoal || client.planning?.primaryGoal),
    nextEvent: getOnboardingValue(onboarding?.sportProfile?.nextCompetitionName || client.planning?.eventName || client.nextEvent),
    primarySport: getOnboardingValue(onboarding?.sportProfile?.primarySport || client.modality || client.sport)
  };
}

function getOnboardingCompletion(client: Pick<CoachClient, "availableEquipment" | "availability" | "injuries" | "modality" | "nextEvent" | "onboarding" | "planning" | "sport">) {
  if (client.onboarding?.completed) return { label: "Completa", isComplete: true };
  const summary = getOnboardingSummary(client);
  const filledCount = Object.values(summary).filter((value) => value && !["Pendiente", "Pendiente de completar.", "Sin evento definido"].includes(value)).length;
  return {
    isComplete: filledCount >= 4,
    label: filledCount >= 4 ? "Completa" : "Pendiente"
  };
}

function formatPerformanceTestValue(entry: PerformanceTestEntry) {
  return [entry.value, entry.unit].filter(Boolean).join(" ");
}

function getSortedPerformanceTests(client?: CoachClient | null) {
  return [...(client?.performanceTests?.entries ?? [])].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return (Number.isFinite(timeB) ? timeB : 0) - (Number.isFinite(timeA) ? timeA : 0);
  });
}

function getRecentPerformanceTestReferences(client?: CoachClient | null, sessionType?: CoachSessionType, sport?: ResistanceSport) {
  const entries = getSortedPerformanceTests(client);
  const sportCategories: PerformanceTestCategory[] =
    sport === "running" ? ["running", "endurance"] :
    sport === "cycling" ? ["cycling", "endurance"] :
    sport === "swimming" ? ["swimming", "endurance"] :
    ["endurance", "running", "cycling", "swimming"];
  const preferredCategories: PerformanceTestCategory[] =
    sessionType === "Fuerza" ? ["strength", "jump", "body_composition"] :
    sessionType === "Cardio" ? [...sportCategories, "body_composition"] :
    ["strength", "jump", ...sportCategories, "body_composition"];

  return entries.filter((entry) => preferredCategories.includes(entry.category)).slice(0, 5);
}

function getCoachIntakeStatusLabel(intake?: IntakeQuestionnaire) {
  if (!intake?.required) return "No requerido";
  if (intake.completed !== true) return "Pendiente";
  if (intake.needsCoachReview) return "Actualizado por revisar";
  if (intake.lastReviewedAt) return "Revisado";
  return "Completado";
}

function getCoachIntakeStatusClass(intake?: IntakeQuestionnaire) {
  if (!intake?.required) return "border-line bg-panel/50 text-ink/55";
  if (intake.completed !== true) return "border-amber-200 bg-amber-50 text-amber-800";
  if (intake.needsCoachReview) return "border-blue-200 bg-blue-50 text-blue-800";
  if (intake.lastReviewedAt) return "border-moss/30 bg-mint text-moss";
  return "border-line bg-panel/60 text-ink/70";
}

function compactIntakeValue(value?: string | null) {
  return value && value.trim() ? value.trim() : "";
}

function addIntakeItem(items: Array<[string, string]>, label: string, value?: string | null) {
  const cleanValue = compactIntakeValue(value);
  if (cleanValue) items.push([label, cleanValue]);
}

function getCoachIntakeReview(client: CoachClient) {
  const answers = mergeIntakeAnswers(client.intakeQuestionnaire?.answers);
  const contextItems: Array<[string, string]> = [];
  const logisticsItems: Array<[string, string]> = [];
  const healthItems: Array<[string, string]> = [];
  const preferenceItems: Array<[string, string]> = [];
  const impactItems: string[] = [];

  addIntakeItem(contextItems, "Deporte / modalidad", answers.currentSportDetails || client.modality || client.sport);
  addIntakeItem(contextItems, "Objetivo principal", answers.mainGoal || client.planning.primaryGoal);
  addIntakeItem(contextItems, "Objetivo a 3 meses", answers.threeMonthGoal);
  addIntakeItem(contextItems, "Próxima competición / test", answers.targetDateOrEvent || client.planning.eventName || client.nextEvent);
  addIntakeItem(contextItems, "Experiencia previa", answers.previousTraining || (answers.strengthTrainingExperience ? intakeStrengthExperienceLabels[answers.strengthTrainingExperience] : ""));

  addIntakeItem(logisticsItems, "Disponibilidad semanal", answers.availableDaysPerWeek ? `${answers.availableDaysPerWeek} días/semana` : "");
  addIntakeItem(logisticsItems, "Tiempo por sesión", answers.sessionDuration ? intakeSessionDurationLabels[answers.sessionDuration] : "");
  addIntakeItem(logisticsItems, "Lugar de entrenamiento", answers.trainingLocation ? intakeTrainingLocationLabels[answers.trainingLocation] : "");
  addIntakeItem(logisticsItems, "Material disponible", answers.availableEquipment || client.availableEquipment);

  if (answers.diagnosedCondition === "yes") addIntakeItem(healthItems, "Condición declarada", answers.diagnosedConditionDetails || intakeYesNoLabels.yes);
  if (answers.currentMedication === "yes") addIntakeItem(healthItems, "Medicación actual", answers.currentMedicationDetails || intakeYesNoLabels.yes);
  if (answers.recentInjuryOrSurgery === "yes") addIntakeItem(healthItems, "Lesión / operación reciente", answers.recentInjuryOrSurgeryDetails || intakeYesNoLabels.yes);
  if (answers.currentPain === "yes") addIntakeItem(healthItems, "Molestia actual", answers.currentPainDetails || intakeYesNoLabels.yes);
  if (answers.medicalExerciseRestriction === "yes" || answers.medicalExerciseRestriction === "not_sure") {
    addIntakeItem(
      healthItems,
      "Restricción para ejercicio",
      `${intakeRestrictionLabels[answers.medicalExerciseRestriction]}${answers.medicalExerciseRestrictionDetails ? ` · ${answers.medicalExerciseRestrictionDetails}` : ""}`
    );
  }
  const exerciseSymptoms = (answers.exerciseSymptoms ?? []).filter((item) => item !== "Ninguno");
  addIntakeItem(healthItems, "Síntomas durante ejercicio", exerciseSymptoms.join(", "));
  addIntakeItem(healthItems, "Limitaciones relevantes", client.injuries);

  addIntakeItem(preferenceItems, "Recuperación / sueño", answers.sleepHours ? intakeSleepLabels[answers.sleepHours] : "");
  addIntakeItem(preferenceItems, "Estrés", answers.stressLevel ? intakeStressLabels[answers.stressLevel] : "");
  addIntakeItem(preferenceItems, "Hábitos de recuperación", (answers.recoveryHabits ?? []).join(", "));
  addIntakeItem(preferenceItems, "Objetivos secundarios", (answers.secondaryGoals ?? []).join(", "));
  addIntakeItem(preferenceItems, "Otros datos relevantes", answers.otherRelevantInfo);

  if (answers.availableDaysPerWeek && Number(answers.availableDaysPerWeek) <= 2) impactItems.push("Disponibilidad limitada");
  if (answers.sessionDuration === "<30") impactItems.push("Sesiones cortas");
  if (answers.trainingLocation === "home" || answers.availableEquipment) impactItems.push("Revisar material disponible");
  if (healthItems.length > 0) impactItems.push("Revisar limitaciones antes de planificar");
  if (answers.mainGoal || client.planning.primaryGoal) impactItems.push("Objetivo principal como referencia de programación");
  if (answers.targetDateOrEvent || client.planning.eventName || client.nextEvent) impactItems.push("Próxima competición/test como hito");
  if (answers.sleepHours === "<7" || answers.stressLevel === "high") impactItems.push("Recuperación declarada limitada");

  return {
    blocks: [
      { items: contextItems, title: "Contexto deportivo" },
      { items: logisticsItems, title: "Disponibilidad y logística" },
      { items: healthItems, title: "Salud / limitaciones" },
      { items: preferenceItems, title: "Preferencias y observaciones" }
    ],
    fullRows: [
      ["Nombre completo", getIntakeAnswerLabel(answers.fullName)],
      ["Edad", getIntakeAnswerLabel(answers.age)],
      ["Género", getIntakeAnswerLabel(answers.gender)],
      ["Teléfono", getIntakeAnswerLabel(answers.phone)],
      ["Contacto de emergencia", getIntakeAnswerLabel(answers.emergencyContact)],
      ["Sueño", answers.sleepHours ? intakeSleepLabels[answers.sleepHours] : "Sin especificar"],
      ["Estrés", answers.stressLevel ? intakeStressLabels[answers.stressLevel] : "Sin especificar"],
      ["Actividad física actual", getIntakeAnswerLabel(answers.currentSportPractice)],
      ["Detalle deporte / actividad", getIntakeAnswerLabel(answers.currentSportDetails)],
      ["Objetivo principal", getIntakeAnswerLabel(answers.mainGoal)],
      ["Objetivo a 3 meses", getIntakeAnswerLabel(answers.threeMonthGoal)],
      ["Fecha / evento objetivo", getIntakeAnswerLabel(answers.targetDateOrEvent)],
      ["Días disponibles", getIntakeAnswerLabel(answers.availableDaysPerWeek ? `${answers.availableDaysPerWeek} días/semana` : "")],
      ["Tiempo por sesión", answers.sessionDuration ? intakeSessionDurationLabels[answers.sessionDuration] : "Sin especificar"],
      ["Lugar de entrenamiento", answers.trainingLocation ? intakeTrainingLocationLabels[answers.trainingLocation] : "Sin especificar"],
      ["Material disponible", getIntakeAnswerLabel(answers.availableEquipment)],
      ["Experiencia de fuerza", answers.strengthTrainingExperience ? intakeStrengthExperienceLabels[answers.strengthTrainingExperience] : "Sin especificar"],
      ["Entrenamiento previo", getIntakeAnswerLabel(answers.previousTraining)],
      ["Condición diagnosticada", answers.diagnosedCondition ? intakeYesNoLabels[answers.diagnosedCondition] : "Sin especificar"],
      ["Detalle condición", getIntakeAnswerLabel(answers.diagnosedConditionDetails)],
      ["Medicación actual", answers.currentMedication ? intakeYesNoLabels[answers.currentMedication] : "Sin especificar"],
      ["Detalle medicación", getIntakeAnswerLabel(answers.currentMedicationDetails)],
      ["Lesión / operación reciente", answers.recentInjuryOrSurgery ? intakeYesNoLabels[answers.recentInjuryOrSurgery] : "Sin especificar"],
      ["Detalle lesión / operación", getIntakeAnswerLabel(answers.recentInjuryOrSurgeryDetails)],
      ["Molestia actual", answers.currentPain ? intakeYesNoLabels[answers.currentPain] : "Sin especificar"],
      ["Detalle molestia", getIntakeAnswerLabel(answers.currentPainDetails)],
      ["Síntomas durante ejercicio", (answers.exerciseSymptoms ?? []).join(", ") || "Sin especificar"],
      ["Restricción para ejercicio", answers.medicalExerciseRestriction ? intakeRestrictionLabels[answers.medicalExerciseRestriction] : "Sin especificar"],
      ["Detalle restricción", getIntakeAnswerLabel(answers.medicalExerciseRestrictionDetails)],
      ["Apoyo profesional", (answers.currentProfessionalSupport ?? []).join(", ") || "Sin especificar"],
      ["Hábitos de recuperación", (answers.recoveryHabits ?? []).join(", ") || "Sin especificar"],
      ["Objetivos secundarios", (answers.secondaryGoals ?? []).join(", ") || "Sin especificar"],
      ["Ocupación", getIntakeAnswerLabel(answers.occupation)],
      ["Otra información relevante", getIntakeAnswerLabel(answers.otherRelevantInfo)]
    ],
    impactItems: Array.from(new Set(impactItems)).slice(0, 6)
  };
}

function OnboardingSummaryCard({ client, compact = false, title = "Ficha inicial" }: { client: CoachClient; compact?: boolean; title?: string }) {
  const summary = getOnboardingSummary(client);
  const completion = getOnboardingCompletion(client);
  const items = [
    ["Deporte principal", summary.primarySport],
    ["Objetivo principal", summary.mainGoal],
    ["Disponibilidad", summary.availability],
    ["Próxima competición/test", summary.nextEvent],
    ["Limitaciones relevantes", summary.limitations],
    ["Material disponible", summary.equipment]
  ].filter(([, value]) => value);

  return (
    <section className={`rounded-md border border-line bg-panel/35 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink/55">
            {completion.isComplete ? "Contexto inicial disponible para planificar." : "Ficha inicial pendiente de completar."}
          </p>
        </div>
        <span className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold ${completion.isComplete ? "border-moss/30 bg-mint text-moss" : "border-line bg-white text-ink/55"}`}>
          {completion.label}
        </span>
      </div>
      {items.length > 0 ? (
        <div className={`mt-3 grid gap-2 ${compact ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
          {items.map(([label, value]) => (
            <div className="rounded-md border border-line bg-white px-3 py-2" key={label}>
              <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-line bg-white p-3 text-sm font-semibold text-ink/50">
          Ficha inicial pendiente de completar.
        </p>
      )}
      {!compact ? (
        <p className="mt-3 text-xs font-medium text-ink/45">
          Registra solo información necesaria para la planificación. Los datos se guardan localmente en este navegador.
        </p>
      ) : null}
    </section>
  );
}

function getSharedMenstrualContext(client?: CoachClient | null) {
  const tracking = client?.menstrualTracking;
  if (!client || client.sex !== "female" || !tracking?.enabled) return null;

  if (tracking.shareWithCoach !== true) {
    return {
      isShared: false,
      text: "Seguimiento del ciclo activado por la deportista, no compartido con entrenador."
    };
  }

  const phase = estimateMenstrualPhase({
    averageBleedingDays: tracking.averageBleedingDays,
    averageCycleLength: tracking.averageCycleLength,
    date: getRelativeDateKey(0),
    lastPeriodStartDate: tracking.lastPeriodStartDate
  });
  const latestEntry = getLatestMenstrualEntry(tracking.entries);
  const symptoms = getMenstrualSymptomSummary(latestEntry).slice(0, 4);
  const symptomText = symptoms.length > 0
    ? symptoms.map((symptom) => `${symptom.label.toLowerCase()} ${symptom.level === 1 ? "leve" : symptom.level === 2 ? "moderado" : "alto"}`).join(", ")
    : "Sin síntomas recientes registrados";
  const guidance = getCycleTrainingContext(latestEntry);

  return {
    guidance,
    isShared: true,
    latestEntry,
    phase,
    symptomText,
    tracking
  };
}

function MenstrualCoachContextCard({ client, compact = false }: { client?: CoachClient | null; compact?: boolean }) {
  const context = getSharedMenstrualContext(client);
  if (!context) return null;

  if (!context.isShared) {
    return (
      <section className={`rounded-md border border-line bg-panel/35 ${compact ? "p-3" : "p-4"}`}>
        <h3 className="font-semibold text-ink">Contexto ciclo menstrual</h3>
        <p className="mt-2 text-sm text-ink/60">{context.text}</p>
      </section>
    );
  }

  if (!context.phase) return null;

  return (
    <section className={`rounded-md border border-line border-l-4 border-l-violet bg-panel/35 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-ink">Contexto ciclo menstrual</h3>
          <p className="mt-1 text-sm text-ink/65">
            Fase estimada: {context.phase.label}
            {context.phase.cycleDay ? ` · día ${context.phase.cycleDay} del ciclo` : ""}
          </p>
        </div>
        <span className="w-fit rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">
          {context.phase.confidence === "estimated" ? "Estimación orientativa" : "Sin estimación"}
        </span>
      </div>
      <p className="mt-3 text-sm text-ink/65">Síntomas recientes: {context.symptomText}.</p>
      {context.latestEntry?.notes ? (
        <p className="mt-2 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/65">
          Nota deportista: “{context.latestEntry.notes}”
        </p>
      ) : null}
      <p className="mt-3 text-xs font-medium text-ink/50">
        {context.guidance} Usar como contexto. Individualiza según síntomas, recuperación y respuesta de la deportista.
      </p>
      {context.tracking?.cycleRegularity === "irregular" ? (
        <p className="mt-2 text-xs font-medium text-ink/45">Ciclo marcado como irregular: la fase puede ser menos precisa.</p>
      ) : null}
    </section>
  );
}

function isDemoClient(client: Pick<CoachClient, "id"> & { isDemo?: boolean }) {
  return client.id === "demo-client" || client.id.startsWith("demo-") || client.isDemo === true;
}

function getRelativeDateKey(daysOffset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

function getDemoReviewedAt(dayOffset: number) {
  return getRelativeDateKey(Math.min(dayOffset + 1, 0));
}

type ClientAccessStatus = "active" | "expiringSoon" | "expired" | "none";

function parseAccessDate(dateKey?: string | null) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTodayDateOnly() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatAccessDate(dateKey?: string | null) {
  const date = parseAccessDate(dateKey);
  if (!date) return "";
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function getClientAccessInfo(client?: Pick<CoachClient, "accessEndDate"> | null): {
  badgeClass: string;
  label: string;
  status: ClientAccessStatus;
  text: string;
} {
  const endDate = parseAccessDate(client?.accessEndDate);
  if (!endDate) {
    return {
      badgeClass: "border-line bg-panel/60 text-ink/60",
      label: "Sin fecha de acceso",
      status: "none",
      text: "Sin fecha de acceso"
    };
  }

  const today = getTodayDateOnly();
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
  const formattedDate = formatAccessDate(client?.accessEndDate);

  if (daysRemaining < 0) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      label: "Acceso finalizado",
      status: "expired",
      text: `Acceso finalizado desde ${formattedDate}`
    };
  }

  if (daysRemaining <= 7) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      label: "Caduca pronto",
      status: "expiringSoon",
      text: `Caduca pronto: ${formattedDate}`
    };
  }

  return {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Acceso activo",
    status: "active",
    text: `Acceso activo hasta ${formattedDate}`
  };
}

function getAccessProgress(startDateKey?: string | null, endDateKey?: string | null) {
  const startDate = parseAccessDate(startDateKey);
  const endDate = parseAccessDate(endDateKey);
  if (!startDate || !endDate || endDate <= startDate) return null;

  const today = getTodayDateOnly();
  const totalDays = endDate.getTime() - startDate.getTime();
  const elapsedDays = today.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
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

function getDemoWeekDayOffset(dayIndex: number) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const monday = new Date(today);
  const currentDayIndex = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - currentDayIndex);

  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayIndex);

  return Math.round((targetDate.getTime() - today.getTime()) / 86400000);
}
function createDemoSession({
  athleteQuickFeedback,
  athleteQuickFeedbackNote,
  dayOffset,
  discomfort,
  duration,
  exercises,
  finalRpe,
  id,
  reviewStatus = "reviewed",
  summary,
  type,
  wellness,
  weekLabel = "Semana demo"
}: {
  athleteQuickFeedback?: "up" | "down";
  athleteQuickFeedbackNote?: string;
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
  weekLabel?: string;
}): ClientSessionRecord {
  const date = getRelativeDateKey(dayOffset);

  return {
    actualDurationMinutes: duration,
    athleteQuickFeedback,
    athleteQuickFeedbackNote,
    block: "Demo rendimiento mixto",
    completed: true,
    date,
    discomfort,
    finalNotes: "Sesión demo para probar historial, carga y revisión.",
    finalRpe,
    id,
    isDemo: true,
    performedExercises: exercises.map((exercise, index) => createDemoPerformedExercise(exercise, finalRpe, index === 1 ? -2 : 0)),
    plannedExercises: exercises,
    reviewedAt: reviewStatus === "reviewed" ? getDemoReviewedAt(dayOffset) : undefined,
    reviewNotes: reviewStatus === "reviewed" ? "Buen trabajo. Mantener progresion y vigilar sensaciones locales." : "",
    reviewStatus,
    sessionNumber: 1,
    sRPE: duration * finalRpe,
    status: "Completada",
    summary,
    type,
    weekLabel,
    wellness
  };
}

function createDemoCardioSession({
  athleteQuickFeedback,
  athleteQuickFeedbackNote,
  dayOffset,
  id,
  interval = false,
  weekLabel = "Semana demo"
}: {
  athleteQuickFeedback?: "up" | "down";
  athleteQuickFeedbackNote?: string;
  dayOffset: number;
  id: string;
  interval?: boolean;
  weekLabel?: string;
}): ClientSessionRecord {
  const duration = interval ? 38 : 45;
  const finalRpe = interval ? 8 : 5;
  const date = getRelativeDateKey(dayOffset);
  const resistanceMethodId = interval ? "IEM" : "CE";
  const targetResistanceZoneId = interval ? "R3" : "R1";

  return {
    actualDurationMinutes: duration,
    athleteQuickFeedback,
    athleteQuickFeedbackNote,
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
      intensityCompleted: interval ? "R3 controlado en bloques principales" : "R1 estable",
      intervalsCompleted: interval ? "5 x 3 min" : "Continuo 45 min",
      notes: interval ? "Bloques exigentes con buena tolerancia." : "Rodaje comodo para acumular base aerobica.",
      perceivedRpe: finalRpe,
      recoveryCompleted: interval ? "2 min suaves entre repeticiones" : "Sin pausas",
      source: "manual",
      timeInZones: interval
        ? { z1: 300, z2: 600, z3: 480, z4: 780, z5: 120 }
        : { z1: 420, z2: 1980, z3: 300 }
    },
    completed: true,
    date,
    finalNotes: interval ? "Intervalos exigentes, recuperacion completa." : "Rodaje comodo y estable.",
    finalRpe,
    id,
    isDemo: true,
    performedExercises: [],
    plannedExercises: [],
    resistanceMethodId,
    resistanceSport: "running",
    reviewedAt: interval ? undefined : getDemoReviewedAt(dayOffset),
    reviewNotes: interval ? "" : "Ritmo estable y esfuerzo bien controlado.",
    reviewStatus: interval ? "pending" : "reviewed",
    sessionNumber: interval ? 2 : 1,
    sRPE: duration * finalRpe,
    status: "Completada",
    summary: interval ? "Intervalos controlados Z4" : "Cardio Z2 continuo",
    targetResistanceZoneId,
    type: "Cardio",
    weekLabel,
    wellness: interval
      ? { fatigue: 4, motivation: 4, sleep: 3, soreness: 3, stress: 3 }
      : { fatigue: 2, motivation: 4, sleep: 4, soreness: 2, stress: 2 }
  };
}

function createDemoCyclingResistanceSession({
  athleteQuickFeedback,
  athleteQuickFeedbackNote,
  dayOffset,
  id,
  weekLabel = "Semana demo"
}: {
  athleteQuickFeedback?: "up" | "down";
  athleteQuickFeedbackNote?: string;
  dayOffset: number;
  id: string;
  weekLabel?: string;
}): ClientSessionRecord {
  const duration = 32;
  const finalRpe = 6;

  return {
    actualDurationMinutes: duration,
    athleteQuickFeedback,
    athleteQuickFeedbackNote,
    block: "Demo resistencia",
    cardioPlan: {
      sport: "ride",
      targetDurationMinutes: duration,
      targetRpeMax: 7,
      targetRpeMin: 5,
      targetZone: "z3"
    },
    cardioResult: {
      distanceMeters: 18500,
      durationMinutes: duration,
      intensityCompleted: "R2 sostenido",
      intervalsCompleted: "2 x 12 min",
      notes: "Trabajo sostenido en bicicleta para probar zona R2.",
      perceivedRpe: finalRpe,
      recoveryCompleted: "4 min suaves",
      source: "manual",
      timeInZones: { z1: 240, z2: 420, z3: 1020, z4: 240 }
    },
    completed: true,
    date: getRelativeDateKey(dayOffset),
    finalNotes: "Sesión demo de ciclismo con zona objetivo.",
    finalRpe,
    id,
    isDemo: true,
    performedExercises: [],
    plannedExercises: [],
    resistanceMethodId: "CV1",
    resistanceSport: "cycling",
    reviewedAt: getDemoReviewedAt(dayOffset),
    reviewNotes: "Buena continuidad en los bloques sostenidos.",
    reviewStatus: "reviewed",
    sessionNumber: 3,
    sRPE: duration * finalRpe,
    status: "Completada",
    summary: "Ciclismo R2 sostenido",
    targetResistanceZoneId: "R2",
    type: "Cardio",
    weekLabel,
    wellness: { fatigue: 3, motivation: 4, sleep: 4, soreness: 2, stress: 2 }
  };
}

function buildDemoClient(): CoachClient {
  const lowerExercises = [
    createDemoPlannedExercise({ block: "activation", name: "World greatest stretch", reps: 6, rpe: 5, sets: 2 }),
    createDemoPlannedExercise({ block: "activation", name: "Pogo jump bilateral", reps: 8, rpe: 6, sets: 3 }),
    createDemoPlannedExercise({ block: "main", name: "Goblet squat", reps: 8, rpe: 7, sets: 4, load: 32 }),
    createDemoPlannedExercise({ block: "main", name: "Romanian deadlift", reps: 8, rir: 2, sets: 4, load: 82.5 }),
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
    createDemoPlannedExercise({ block: "auxiliary", name: "Leg extension", reps: 14, sets: 4, velocity: "0.25" })
  ];
  const upperExercises = [
    createDemoPlannedExercise({ block: "main", name: "Bench press", reps: 6, rpe: 7, sets: 4, load: 72.5 }),
    createDemoPlannedExercise({ block: "main", name: "Pull-up / Chin-up", reps: 6, rir: 2, sets: 4 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Seated cable row", reps: 10, rpe: 7, sets: 3, load: 55 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Face pull", reps: 14, rpe: 6, sets: 3, load: 18 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Lateral raise", reps: 12, rpe: 7, sets: 3, load: 8 })
  ];
  const powerExercises = [
    createDemoPlannedExercise({ block: "activation", name: "Pogo jump bilateral", reps: 8, rpe: 6, sets: 3 }),
    createDemoPlannedExercise({ block: "main", name: "Drop jump", reps: 4, rpe: 7, sets: 4 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Medicine ball chest pass", reps: 6, rpe: 6, sets: 3 })
  ];
  const coreExercises = [
    createDemoPlannedExercise({ block: "main", name: "Pallof press", reps: 10, rpe: 7, sets: 3, load: 16 }),
    createDemoPlannedExercise({ block: "main", name: "Dead bug", reps: 8, rpe: 6, sets: 3 }),
    createDemoPlannedExercise({ block: "auxiliary", name: "Plank", reps: 3, rpe: 7, sets: 3 })
  ];
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const currentWeekStrengthOffset = -Math.min(2, currentDayIndex);
  const currentWeekCardioOffset = -Math.min(1, currentDayIndex);
  const futureDemoSessions: ClientSessionRecord[] = currentDayIndex < 6
    ? [{
        block: "Demo semana actual",
        completed: false,
        date: getRelativeDateKey(getDemoWeekDayOffset(Math.min(6, currentDayIndex + 2))),
        id: "demo-session-current-future-cardio",
        isDemo: true,
        performedExercises: [],
        plannedExercises: [],
        resistanceSport: "running",
        sessionNumber: 4,
        status: "Planificada",
        summary: "Rodaje suave planificado para cerrar la semana",
        targetResistanceZoneId: "R1",
        targetRpe: 5,
        type: "Cardio",
        weekLabel: "Semana actual"
      }]
    : [];
  const sessionRecords: ClientSessionRecord[] = [
    {
      block: "Demo semana actual",
      completed: false,
      date: getRelativeDateKey(0),
      id: "demo-session-current-today-planned",
      isDemo: true,
      performedExercises: [],
      plannedExercises: lowerExercises,
      sessionNumber: 3,
      status: "Planificada",
      summary: "Fuerza de tren inferior con técnica controlada",
      targetRpe: 7,
      type: "Fuerza",
      weekLabel: "Semana actual"
    },
    createDemoSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Buenas sensaciones y ritmo estable.",
      dayOffset: currentWeekStrengthOffset,
      duration: 60,
      exercises: upperExercises,
      finalRpe: 7,
      id: "demo-session-current-strength",
      summary: "Fuerza de tren superior con ejecución estable",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 5, sleep: 4, soreness: 2, stress: 2 },
      weekLabel: "Semana actual"
    }),
    createDemoCardioSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Ritmo cómodo y respiración controlada.",
      dayOffset: currentWeekCardioOffset,
      id: "demo-session-current-cardio-z2",
      weekLabel: "Semana actual"
    }),
    ...futureDemoSessions,
    createDemoSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Buenas sensaciones y control del esfuerzo.",
      dayOffset: -8,
      duration: 68,
      exercises: lowerExercises,
      finalRpe: 8,
      id: "demo-session-week-minus-1-lower",
      summary: "Fuerza de tren inferior con control de RIR",
      type: "Fuerza",
      wellness: { fatigue: 3, motivation: 4, sleep: 4, soreness: 3, stress: 2 },
      weekLabel: "Semana anterior"
    }),
    createDemoCardioSession({
      dayOffset: -10,
      id: "demo-session-week-minus-1-cardio-intervals",
      interval: true,
      weekLabel: "Semana anterior"
    }),
    createDemoSession({
      athleteQuickFeedback: "down",
      athleteQuickFeedbackNote: "Algo más cansado de lo habitual, sin necesidad de cambios durante la sesión.",
      dayOffset: -12,
      discomfort: {
        bodyArea: "Tobillo derecho",
        exerciseName: "Pogo jump bilateral",
        hasDiscomfort: true,
        intensity: 3,
        notes: "Molestia leve al final del bloque, sin cambios durante la sesión.",
        phase: "Final de la serie"
      },
      duration: 50,
      exercises: powerExercises,
      finalRpe: 7,
      id: "demo-session-week-minus-1-power",
      reviewStatus: "pending",
      summary: "Potencia y pliometría con volumen moderado",
      type: "Fuerza",
      wellness: { fatigue: 4, motivation: 3, sleep: 3, soreness: 3, stress: 3 },
      weekLabel: "Semana anterior"
    }),
    createDemoSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Técnica sólida en las series principales.",
      dayOffset: -15,
      discomfort: {
        bodyArea: "Rodilla izquierda",
        exerciseName: "Goblet squat",
        hasDiscomfort: true,
        intensity: 2,
        notes: "Molestia leve en las últimas repeticiones.",
        phase: "Final de la serie"
      },
      duration: 66,
      exercises: lowerExercises,
      finalRpe: 7,
      id: "demo-session-week-minus-2-lower",
      summary: "Fuerza de tren inferior y control unilateral",
      type: "Fuerza",
      wellness: { fatigue: 3, motivation: 4, sleep: 4, soreness: 3, stress: 2 },
      weekLabel: "Hace dos semanas"
    }),
    createDemoCyclingResistanceSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Cadencia estable durante los dos bloques.",
      dayOffset: -17,
      id: "demo-session-week-minus-2-cycling-r2",
      weekLabel: "Hace dos semanas"
    }),
    createDemoSession({
      dayOffset: -19,
      duration: 58,
      exercises: upperExercises,
      finalRpe: 6,
      id: "demo-session-week-minus-2-upper",
      summary: "Fuerza de tren superior técnica",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 4, sleep: 4, soreness: 2, stress: 2 },
      weekLabel: "Hace dos semanas"
    }),
    createDemoSession({
      athleteQuickFeedback: "up",
      athleteQuickFeedbackNote: "Sesión dinámica y buena coordinación.",
      dayOffset: -22,
      duration: 52,
      exercises: powerExercises,
      finalRpe: 6,
      id: "demo-session-week-minus-3-power",
      summary: "Potencia y coordinación",
      type: "Fuerza",
      wellness: { fatigue: 2, motivation: 5, sleep: 5, soreness: 2, stress: 1 },
      weekLabel: "Hace tres semanas"
    }),
    createDemoCardioSession({
      dayOffset: -24,
      id: "demo-session-week-minus-3-cardio-z2",
      weekLabel: "Hace tres semanas"
    }),
    createDemoSession({
      dayOffset: -26,
      duration: 42,
      exercises: coreExercises,
      finalRpe: 6,
      id: "demo-session-week-minus-3-core",
      summary: "Core y accesorios para control postural",
      type: "Fuerza",
      wellness: { fatigue: 3, motivation: 4, sleep: 3, soreness: 2, stress: 2 },
      weekLabel: "Hace tres semanas"
    })
  ];

  return {
    accessEndDate: getRelativeDateKey(30),
    accessStartDate: getRelativeDateKey(-45),
    activeBlocks: ["Demo acumulacion", "Demo fuerza + resistencia"],
    age: 34,
    assessments: [
      { action: "Ver historial", date: getRelativeDateKey(-28), id: "demo-assessment-strength-1", isDemo: true, name: "3RM sentadilla", result: "105 kg", type: "Fuerza" },
      { action: "Ver historial", date: getRelativeDateKey(-21), id: "demo-assessment-jump-1", isDemo: true, name: "CMJ", result: "38 cm", type: "Salto" },
      { action: "Ver historial", date: getRelativeDateKey(-18), id: "demo-assessment-cardio-1", isDemo: true, name: "Test 6 min", result: "1420 m", type: "Resistencia" },
      { action: "Ver historial", date: getRelativeDateKey(-12), id: "demo-assessment-body-1", isDemo: true, name: "Peso corporal", result: "76.4 kg", type: "Antropometría" }
    ],
    availability: "4 días / semana",
    availableEquipment: "Barra, mancuernas, polea, cajón, balón medicinal",
    chronicLoad: 1780,
    coachNotes: "Cliente demo para probar dashboard, calendario, historial, fatiga y wellness.",
    dailyLoads: [476, 225, 420, 312, 304, 560, 600],
    goalType: "Rendimiento",
    history: "Perfil ficticio para pruebas visuales. No contiene datos personales reales.",
    hooper: { fatigue: 3, mood: 2, sleep: 2, soreness: 3, stress: 2 },
    id: "demo-client",
    injuries: "Molestias leves registradas de prueba, sin diagnósticos.",
    isDemo: true,
    lastActivity: "Core y accesorios - esta semana",
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
      active: (activeSheet === "clients" || activeSheet === "management") && trainerClientPanel === "dashboard",
      label: "Resumen",
      onClick: () => onOpenDashboard(client.id)
    },
    {
      active: (activeSheet === "clients" || activeSheet === "management") && trainerClientPanel === "details",
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
      label: "Valoraciones",
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
  onBack,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  trainerClientPanel
}: {
  activeSheet: SheetId;
  client: CoachClient;
  onBack: () => void;
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
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-moss transition hover:bg-panel" onClick={onBack} type="button">
          ← Volver a Gestión
        </button>
        <ClientQuickNav
          activeSheet={activeSheet}
          client={client}
          onOpenClientSheet={onOpenClientSheet}
          onOpenDashboard={onOpenDashboard}
          onOpenDetails={onOpenDetails}
          trainerClientPanel={trainerClientPanel}
        />
      </div>
    </section>
  );
}

function SelectClientFirst({ onGoClients }: { onGoClients: () => void }) {
  return (
    <section className="mt-6 rounded-md border border-line bg-white p-6 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Selecciona primero un cliente desde Gestión / Clientes.</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink/55">
        Las páginas del entrenador se filtran por deportista para que calendario, sesiones, planificación, mensajes y tests pertenezcan al cliente activo.
      </p>
      <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onGoClients} type="button">
        Ir a Gestión
      </button>
    </section>
  );
}

function AthleteAccessEndedNotice({
  client,
  onShowHistory,
  onShowPlanning
}: {
  client: CoachClient | null;
  onShowHistory: () => void;
  onShowPlanning: () => void;
}) {
  return (
    <section className="mt-6 rounded-md border border-line border-l-4 border-l-coral bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase text-coral">Acceso finalizado</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Tu acceso activo ha finalizado</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink/65">
        Puedes seguir entrando a la app, pero no tienes una planificación activa. Contacta con tu entrenador para revisar tu acceso.
      </p>
      {client ? (
        <p className="mt-3 text-sm font-semibold text-ink/55">{getClientAccessInfo(client).text}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onShowHistory} type="button">
          Ver historial
        </button>
        <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={onShowPlanning} type="button">
          Ver planificación
        </button>
      </div>
    </section>
  );
}

function CoachManagementView({
  activeSection,
  client,
  clients,
  onBack,
  onLoadDemoData,
  onOpenClientSheet,
  onOpenDashboard,
  onOpenDetails,
  onRemoveDemoData,
  onSectionChange,
  panel,
  setClients
}: {
  activeSection: ManagementSection;
  client: CoachClient | null;
  clients: CoachClient[];
  onBack: () => void;
  onLoadDemoData: () => void;
  onOpenClientSheet: (clientId: string, sheet: SheetId) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenDetails: (clientId: string) => void;
  onRemoveDemoData: () => void;
  onSectionChange: (section: ManagementSection) => void;
  panel: TrainerClientPanel;
  setClients: React.Dispatch<React.SetStateAction<CoachClient[]>>;
}) {
  const tabs: Array<{ id: ManagementSection; label: string }> = [
    { id: "clients", label: "Clientes" },
    { id: "metrics", label: "Métricas" },
    { id: "access", label: "Accesos" }
  ];

  return (
    <div className="mt-5 space-y-4">
      {panel === "list" ? (
        <section className="coach-surface rounded-md p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-moss">Gestión</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Centro de gestión de clientes</h2>
              <p className="mt-1 text-sm text-ink/55">
                Gestiona deportistas, estado de acceso, cuestionarios, seguimiento y datos principales.
              </p>
            </div>
            <div className="flex w-fit rounded-md border border-line bg-panel/35 p-1">
              {tabs.map((tab) => (
                <button
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    activeSection === tab.id ? "bg-ink text-white" : "text-ink/65 hover:bg-white"
                  }`}
                  key={tab.id}
                  onClick={() => onSectionChange(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "metrics" && panel === "list" ? (
        <CoachAnalyticsView clients={clients} />
      ) : activeSection === "access" && panel === "list" ? (
        <CoachAccessManagementView clients={clients} />
      ) : (
        <CoachClientsView
          client={client}
          clients={clients}
          onBack={onBack}
          onLoadDemoData={onLoadDemoData}
          onOpenClientSheet={onOpenClientSheet}
          onOpenDashboard={onOpenDashboard}
          onOpenDetails={onOpenDetails}
          onRemoveDemoData={onRemoveDemoData}
          panel={panel}
          setClients={setClients}
        />
      )}
    </div>
  );
}

function CoachAccessManagementView({ clients }: { clients: CoachClient[] }) {
  const sortedClients = [...clients].sort((left, right) => {
    const leftDate = left.accessEndDate ? new Date(left.accessEndDate).getTime() : Number.POSITIVE_INFINITY;
    const rightDate = right.accessEndDate ? new Date(right.accessEndDate).getTime() : Number.POSITIVE_INFINITY;
    return leftDate - rightDate;
  });
  const relevantClients = sortedClients.filter((client) => {
    const accessInfo = getClientAccessInfo(client);
    return ["expiringSoon", "expired", "none"].includes(accessInfo.status);
  });

  return (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Accesos</h2>
          <p className="mt-1 text-sm text-ink/55">Seguimiento simple de accesos activos, próximos a finalizar o sin fecha registrada.</p>
        </div>
        <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">
          {relevantClients.length} a revisar
        </span>
      </div>

      {relevantClients.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {relevantClients.map((client) => {
            const accessInfo = getClientAccessInfo(client);

            return (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={client.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-ink">{client.name}</h3>
                    <p className="mt-1 text-sm text-ink/55">{client.modality || client.sport || "Sin modalidad"}</p>
                  </div>
                  <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${accessInfo.badgeClass}`}>
                    {accessInfo.label}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-ink/65">{accessInfo.text}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
          Sin accesos próximos a finalizar, expirados o sin fecha registrada.
        </p>
      )}
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
  const CLIENTS_PER_PAGE = 15;
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientStep, setNewClientStep] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [goalFilter, setGoalFilter] = useState<"all" | "Salud" | "Rendimiento">("all");
  const [clientPage, setClientPage] = useState(1);
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
  const reviewReferenceDate = new Date();
  reviewReferenceDate.setHours(0, 0, 0, 0);
  const reviewedClients = [...filteredClients]
    .sort((left, right) => left.name.localeCompare(right.name, "es", { sensitivity: "base" }))
    .map((listedClient) => {
      const nextSession = (listedClient.sessionRecords ?? [])
        .map((session) => {
          const rawDate = session.date?.trim();
          const date = rawDate
            ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T00:00:00` : rawDate)
            : null;
          return { date: date && !Number.isNaN(date.getTime()) ? date : null, session };
        })
        .filter((entry) =>
          entry.date &&
          entry.date >= reviewReferenceDate &&
          !hasRealSessionData(entry.session as ReviewSessionRecord)
        )
        .sort((left, right) => (left.date?.getTime() ?? 0) - (right.date?.getTime() ?? 0))[0]?.session ?? null;
      const review = getWeeklyCoachReview({
        nextSession: nextSession as WeeklyReviewSession | null,
        referenceDate: reviewReferenceDate,
        sessions: (listedClient.sessionRecords ?? []) as WeeklyReviewSession[]
      });

      return { listedClient, review };
    });
  const clientPageCount = Math.max(1, Math.ceil(reviewedClients.length / CLIENTS_PER_PAGE));
  const visibleClientPage = Math.min(clientPage, clientPageCount);
  const paginatedClients = reviewedClients.slice(
    (visibleClientPage - 1) * CLIENTS_PER_PAGE,
    visibleClientPage * CLIENTS_PER_PAGE
  );
  const clientPageItems: Array<number | "ellipsis-start" | "ellipsis-end"> = clientPageCount <= 7
    ? Array.from({ length: clientPageCount }, (_, index) => index + 1)
    : [
        1,
        ...(visibleClientPage > 3 ? ["ellipsis-start" as const] : []),
        ...Array.from(
          { length: Math.min(clientPageCount - 2, 3) },
          (_, index) => Math.max(2, Math.min(visibleClientPage - 1, clientPageCount - 3)) + index
        ),
        ...(visibleClientPage < clientPageCount - 2 ? ["ellipsis-end" as const] : []),
        clientPageCount
      ];

  useEffect(() => {
    if (clientPage > clientPageCount) setClientPage(clientPageCount);
  }, [clientPage, clientPageCount]);

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
    const initialOnboarding: ClientOnboarding = {
      completed: false,
      equipmentAccess: {
        availableEquipment: splitOnboardingList(newClientDraft.availableEquipment),
        equipmentNotes: newClientDraft.availableEquipment.trim()
      },
      goals: {
        mainGoal: newClientDraft.objective.trim(),
        notes: newClientDraft.eventNotes.trim(),
        priority: newClientDraft.goalType === "Rendimiento" ? "performance" : "health",
        targetDate: newClientDraft.eventDate
      },
      limitations: {
        injuries: newClientDraft.injuries.trim()
      },
      sportProfile: {
        nextCompetitionDate: newClientDraft.eventDate,
        nextCompetitionName: newClientDraft.eventName.trim(),
        primarySport: newClientDraft.modality,
        sportCategory: "other"
      },
      trainingAvailability: {
        scheduleNotes: newClientDraft.availability.trim()
      }
    };

    const createdClient: CoachClient = {
      activeBlocks: planningBlocks.length > 0 ? planningBlocks.map((block) => block.name) : ["Sin asignar"],
      age: newClientDraft.age,
      assessments: [],
      availability: newClientDraft.availability.trim() || "Pendiente",
      availableEquipment: newClientDraft.availableEquipment.trim() || "Pendiente",
      business: {
        joinedAt: new Date().toISOString().slice(0, 10),
        status: "active",
        statusChangedAt: new Date().toISOString().slice(0, 10)
      },
      chronicLoad: 0,
      coachNotes: newClientDraft.initialNotes.trim() || "Nuevo cliente pendiente de completar ficha inicial.",
      dailyLoads: [0, 0, 0, 0, 0, 0, 0],
      goalType: newClientDraft.goalType,
      history: "Pendiente de completar.",
      hooper: { sleep: 0, fatigue: 0, stress: 0, soreness: 0, mood: 0 },
      id,
      intakeQuestionnaire: buildInitialIntakeQuestionnaire(),
      injuries: newClientDraft.injuries.trim() || "Pendiente de completar.",
      lastActivity: "Sin sesiones registradas",
      level: "Pendiente",
      loadMetric: "Sin datos de carga",
      metrics: ["Sin métricas registradas"],
      modality: newClientDraft.modality,
      name,
      nextEvent,
      onboarding: initialOnboarding,
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
        onDeleteDecision={(decisionId) =>
          setClients((currentClients) =>
            currentClients.map((listedClient) => listedClient.id === client.id
              ? { ...listedClient, decisionLog: (listedClient.decisionLog ?? []).filter((entry) => entry.id !== decisionId) }
              : listedClient
            )
          )
        }
        onOpenClientSheet={onOpenClientSheet}
        onOpenDetails={() => onOpenDetails(client.id)}
        onSaveDecision={(entry) =>
          setClients((currentClients) =>
            currentClients.map((listedClient) => listedClient.id === client.id
              ? { ...listedClient, decisionLog: [entry, ...(listedClient.decisionLog ?? [])] }
              : listedClient
            )
          )
        }
      />
    );
  }

  if (panel === "details") {
    if (!client) return <SelectClientFirst onGoClients={onBack} />;

    return (
      <ClientDetailsView
        client={client}
        onBack={onBack}
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
      {showNewClientForm ? (
        <section className="coach-surface mt-4 rounded-md p-4">
          <div className="rounded-md border border-line bg-panel/45 p-4">
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
        </section>
      ) : null}

      <section className="coach-subtle-card mt-4 rounded-md px-4 py-3">
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

      <section className="coach-surface mt-4 rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Clientes registrados</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-steel to-moss px-3 text-sm font-semibold text-white transition hover:opacity-95"
              onClick={() => setShowNewClientForm((current) => !current)}
              type="button"
            >
              <Plus size={18} />
              Añadir cliente
            </button>
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
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setClientPage(1);
                  }}
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
                    onClick={() => {
                      setGoalFilter(filter.value as typeof goalFilter);
                      setClientPage(1);
                    }}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {clientPageCount > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-1.5" aria-label="Paginación de clientes">
            {clientPageItems.map((pageItem) => pageItem === "ellipsis-start" || pageItem === "ellipsis-end" ? (
              <span className="px-1 text-sm text-ink/45" key={pageItem} aria-hidden="true">…</span>
            ) : (
              <button
                aria-current={pageItem === visibleClientPage ? "page" : undefined}
                aria-label={`Página ${pageItem}`}
                className={`inline-flex size-9 items-center justify-center rounded-md border text-sm font-semibold transition ${
                  pageItem === visibleClientPage
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink/70 hover:border-moss/50 hover:text-ink"
                }`}
                key={pageItem}
                onClick={() => setClientPage(pageItem)}
                type="button"
              >
                {pageItem}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {paginatedClients.map(({ listedClient, review }) => {
            const onboardingCompletion = getOnboardingCompletion(listedClient);
            const reviewStyle = getWeeklyReviewStyle(review.level);
            const accessInfo = getClientAccessInfo(listedClient);
            const accessHasEnded = accessInfo.status === "expired";

            return (
              <article
                className="coach-subtle-card rounded-md px-3 py-2.5 transition hover:border-moss/40 sm:px-4"
                key={listedClient.id}
              >
                <div className="flex min-w-0 flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
                  <div className="min-w-0 flex-1 lg:basis-48">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="min-w-0 break-words text-sm font-semibold text-ink sm:text-base">{listedClient.name}</h3>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        accessHasEnded
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : reviewStyle.badgeClassName
                      }`}>
                        <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${accessHasEnded ? "bg-red-500" : reviewStyle.dotClassName}`} />
                        {accessHasEnded ? accessInfo.label : review.label}
                      </span>
                    </div>
                    {!accessHasEnded && review.primaryReason?.label ? (
                      <p className="mt-1 truncate text-xs text-ink/60" title={review.primaryReason.label}>{review.primaryReason.label}</p>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
                  <button
                    className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={() => onOpenDashboard(listedClient.id)}
                    type="button"
                  >
                    Abrir seguimiento
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
                  {!onboardingCompletion.isComplete ? (
                    <button
                      className="rounded-md border border-moss/30 bg-mint px-2.5 py-1.5 text-xs font-semibold text-moss"
                      onClick={() => onOpenDetails(listedClient.id)}
                      type="button"
                    >
                      Completar ficha
                    </button>
                  ) : null}
                  </div>
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

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <article className={`coach-metric-card rounded-md px-3.5 py-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </article>
  );
}

function CoachInfoModal({
  children,
  onClose,
  title
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="assessment-modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-label={title}
        aria-modal="true"
        className="assessment-modal-panel max-w-5xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <button
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-md border border-line bg-panel text-ink/70 transition hover:bg-mint"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </header>
        <div className="assessment-modal-body grid gap-4 px-5 py-5">
          {children}
        </div>
      </section>
    </div>
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
    baselineBodyComposition: sourceClient.onboarding?.baselineTests?.bodyComposition ?? "",
    baselineEnduranceTests: sourceClient.onboarding?.baselineTests?.enduranceTests ?? "",
    baselineMobilityTests: sourceClient.onboarding?.baselineTests?.mobilityTests ?? "",
    baselineOtherTests: sourceClient.onboarding?.baselineTests?.otherTests ?? "",
    baselineStrengthTests: sourceClient.onboarding?.baselineTests?.strengthTests ?? "",
    coachNotes: sourceClient.coachNotes ?? "",
    communicationNotes: sourceClient.onboarding?.communication?.notes ?? "",
    competitiveLevel: sourceClient.onboarding?.sportProfile?.competitiveLevel ?? "",
    completed: sourceClient.onboarding?.completed ?? false,
    contraindications: sourceClient.onboarding?.limitations?.contraindications ?? "",
    equipmentList: joinOnboardingList(sourceClient.onboarding?.equipmentAccess?.availableEquipment),
    equipmentNotes: sourceClient.onboarding?.equipmentAccess?.equipmentNotes ?? "",
    eventDate: sourceClient.planning.eventDate ?? "",
    eventName: sourceClient.planning.eventName ?? "",
    eventNotes: sourceClient.planning.eventNotes ?? "",
    feedbackFrequency: sourceClient.onboarding?.communication?.feedbackFrequency ?? "",
    goalType: sourceClient.goalType,
    gymAccess: sourceClient.onboarding?.equipmentAccess?.gymAccess ?? false,
    homeTraining: sourceClient.onboarding?.equipmentAccess?.homeTraining ?? false,
    injuries: sourceClient.injuries ?? "",
    mainGoal: sourceClient.onboarding?.goals?.mainGoal ?? sourceClient.planning.primaryGoal ?? "",
    medicalNotes: sourceClient.onboarding?.limitations?.medicalNotes ?? "",
    modality: sourceClient.modality ?? sourceClient.sport ?? "",
    movementLimitations: sourceClient.onboarding?.limitations?.movementLimitations ?? "",
    name: sourceClient.name ?? "",
    nextCompetitionDate: sourceClient.onboarding?.sportProfile?.nextCompetitionDate ?? sourceClient.planning.eventDate ?? "",
    nextCompetitionName: sourceClient.onboarding?.sportProfile?.nextCompetitionName ?? sourceClient.planning.eventName ?? "",
    onboardingInjuries: sourceClient.onboarding?.limitations?.injuries ?? sourceClient.injuries ?? "",
    painAreas: joinOnboardingList(sourceClient.onboarding?.limitations?.painAreas),
    preferredContact: sourceClient.onboarding?.communication?.preferredContact ?? "",
    preferredTrainingDays: joinOnboardingList(sourceClient.onboarding?.trainingAvailability?.preferredTrainingDays),
    primaryGoal: sourceClient.planning.primaryGoal ?? "",
    priority: sourceClient.onboarding?.goals?.priority ?? "",
    scheduleNotes: sourceClient.onboarding?.trainingAvailability?.scheduleNotes ?? "",
    secondaryGoal: sourceClient.onboarding?.goals?.secondaryGoal ?? sourceClient.planning.secondaryGoal ?? "",
    secondarySports: joinOnboardingList(sourceClient.onboarding?.sportProfile?.secondarySports),
    sessionDurationMinutes: sourceClient.onboarding?.trainingAvailability?.sessionDurationMinutes ? String(sourceClient.onboarding.trainingAvailability.sessionDurationMinutes) : "",
    sex: sourceClient.sex ?? "prefer_not_to_say",
    sportCategory: sourceClient.onboarding?.sportProfile?.sportCategory ?? "",
    targetDate: sourceClient.onboarding?.goals?.targetDate ?? sourceClient.planning.eventDate ?? "",
    trainingDaysPerWeek: sourceClient.onboarding?.trainingAvailability?.daysPerWeek ? String(sourceClient.onboarding.trainingAvailability.daysPerWeek) : "",
    status: sourceClient.status ?? ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<"anamnesis" | "details" | "intake" | "notes" | null>(null);
  const [draft, setDraft] = useState(() => createDetailsDraft(client));
  const [accessDraft, setAccessDraft] = useState({
    accessEndDate: client.accessEndDate ?? "",
    accessStartDate: client.accessStartDate ?? ""
  });
  const [performanceTestDraft, setPerformanceTestDraft] = useState({
    category: "strength" as PerformanceTestCategory,
    customTestName: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    suggestedTestName: performanceTestSuggestions.strength[0] ?? "",
    unit: "",
    value: ""
  });
  const [privateNoteDraft, setPrivateNoteDraft] = useState<{
    category: CoachPrivateNoteCategory;
    text: string;
    title: string;
  }>({
    category: "training",
    text: "",
    title: ""
  });
  const [editingPrivateNoteId, setEditingPrivateNoteId] = useState<string | null>(null);
  const [businessDraft, setBusinessDraft] = useState({
    acquisitionSource: getClientAcquisitionSource(client),
    acquisitionSourceDetail: client.business?.acquisitionSourceDetail ?? "",
    exitReason: client.business?.exitReason ?? "",
    joinedAt: getClientJoinedAt(client),
    status: getClientBusinessStatus(client),
    statusChangedAt: client.business?.statusChangedAt ?? ""
  });

  useEffect(() => {
    setDraft(createDetailsDraft(client));
    setAccessDraft({
      accessEndDate: client.accessEndDate ?? "",
      accessStartDate: client.accessStartDate ?? ""
    });
    setBusinessDraft({
      acquisitionSource: getClientAcquisitionSource(client),
      acquisitionSourceDetail: client.business?.acquisitionSourceDetail ?? "",
      exitReason: client.business?.exitReason ?? "",
      joinedAt: getClientJoinedAt(client),
      status: getClientBusinessStatus(client),
      statusChangedAt: client.business?.statusChangedAt ?? ""
    });
    setPerformanceTestDraft({
      category: "strength",
      customTestName: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      suggestedTestName: performanceTestSuggestions.strength[0] ?? "",
      unit: "",
      value: ""
    });
    setPrivateNoteDraft({
      category: "training",
      text: "",
      title: ""
    });
    setEditingPrivateNoteId(null);
    setIsEditing(false);
    setActiveInfoPanel(null);
  }, [client]);

  const displayValue = (value?: number | string | null) => {
    if (value === undefined || value === null || String(value).trim() === "") return "Sin especificar";
    return String(value);
  };

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };
  const updatePerformanceTestDraft = (field: keyof typeof performanceTestDraft, value: string) => {
    setPerformanceTestDraft((currentDraft) => {
      if (field === "category") {
        const category = value as PerformanceTestCategory;
        return {
          ...currentDraft,
          category,
          customTestName: "",
          suggestedTestName: performanceTestSuggestions[category][0] ?? ""
        };
      }

      return { ...currentDraft, [field]: value };
    });
  };

  const handleAddPerformanceTest = () => {
    const testName = performanceTestDraft.customTestName.trim() || performanceTestDraft.suggestedTestName.trim();
    const value = performanceTestDraft.value.trim();
    if (!testName || !value) return;

    const entry: PerformanceTestEntry = {
      category: performanceTestDraft.category,
      date: performanceTestDraft.date || new Date().toISOString().slice(0, 10),
      id: `performance-test-${Date.now()}`,
      notes: performanceTestDraft.notes.trim() || undefined,
      testName,
      unit: performanceTestDraft.unit.trim() || undefined,
      value
    };

    onUpdateClient({
      ...client,
      performanceTests: {
        entries: [entry, ...(client.performanceTests?.entries ?? [])]
      }
    });
    setPerformanceTestDraft((currentDraft) => ({
      ...currentDraft,
      customTestName: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      unit: "",
      value: ""
    }));
  };

  const handleDeletePerformanceTest = (entryId: string) => {
    onUpdateClient({
      ...client,
      performanceTests: {
        entries: (client.performanceTests?.entries ?? []).filter((entry) => entry.id !== entryId)
      }
    });
  };

  const sortedPrivateNotes = [...(client.coachPrivateNotes ?? [])].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) return left.pinned ? -1 : 1;
    return new Date(right.updatedAt ?? right.createdAt).getTime() - new Date(left.updatedAt ?? left.createdAt).getTime();
  });

  const resetPrivateNoteDraft = () => {
    setPrivateNoteDraft({ category: "training", text: "", title: "" });
    setEditingPrivateNoteId(null);
  };

  const handleSavePrivateNote = () => {
    const text = privateNoteDraft.text.trim();
    if (!text) return;

    const now = new Date().toISOString();
    const currentNotes = client.coachPrivateNotes ?? [];
    const nextNotes = editingPrivateNoteId
      ? currentNotes.map((note) =>
          note.id === editingPrivateNoteId
            ? {
                ...note,
                category: privateNoteDraft.category,
                text,
                title: privateNoteDraft.title.trim() || undefined,
                updatedAt: now
              }
            : note
        )
      : [
          {
            category: privateNoteDraft.category,
            createdAt: now,
            id: `coach-private-note-${Date.now()}`,
            text,
            title: privateNoteDraft.title.trim() || undefined
          },
          ...currentNotes
        ];

    onUpdateClient({
      ...client,
      coachPrivateNotes: nextNotes
    });
    resetPrivateNoteDraft();
  };

  const handleEditPrivateNote = (note: CoachPrivateNote) => {
    setEditingPrivateNoteId(note.id);
    setPrivateNoteDraft({
      category: note.category ?? "other",
      text: note.text,
      title: note.title ?? ""
    });
  };

  const handleDeletePrivateNote = (noteId: string) => {
    if (typeof window !== "undefined" && !window.confirm("¿Eliminar esta nota interna?")) return;
    onUpdateClient({
      ...client,
      coachPrivateNotes: (client.coachPrivateNotes ?? []).filter((note) => note.id !== noteId)
    });
    if (editingPrivateNoteId === noteId) resetPrivateNoteDraft();
  };

  const handleTogglePrivateNotePin = (noteId: string) => {
    onUpdateClient({
      ...client,
      coachPrivateNotes: (client.coachPrivateNotes ?? []).map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    });
  };

  const handleCancel = () => {
    setDraft(createDetailsDraft(client));
    setBusinessDraft({
      acquisitionSource: getClientAcquisitionSource(client),
      acquisitionSourceDetail: client.business?.acquisitionSourceDetail ?? "",
      exitReason: client.business?.exitReason ?? "",
      joinedAt: getClientJoinedAt(client),
      status: getClientBusinessStatus(client),
      statusChangedAt: client.business?.statusChangedAt ?? ""
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    const parsedAge = Number(draft.age);
    const parsedDaysPerWeek = Number(draft.trainingDaysPerWeek);
    const parsedSessionDuration = Number(draft.sessionDurationMinutes);
    const cleanEventName = draft.eventName.trim();
    const cleanEventDate = draft.eventDate.trim();
    const onboarding: ClientOnboarding = {
      baselineTests: {
        bodyComposition: draft.baselineBodyComposition.trim(),
        enduranceTests: draft.baselineEnduranceTests.trim(),
        mobilityTests: draft.baselineMobilityTests.trim(),
        otherTests: draft.baselineOtherTests.trim(),
        strengthTests: draft.baselineStrengthTests.trim()
      },
      communication: {
        feedbackFrequency: draft.feedbackFrequency as NonNullable<ClientOnboarding["communication"]>["feedbackFrequency"],
        notes: draft.communicationNotes.trim(),
        preferredContact: draft.preferredContact as NonNullable<ClientOnboarding["communication"]>["preferredContact"]
      },
      completed: draft.completed,
      completedAt: draft.completed ? (client.onboarding?.completedAt ?? new Date().toISOString()) : undefined,
      equipmentAccess: {
        availableEquipment: splitOnboardingList(draft.equipmentList),
        equipmentNotes: draft.equipmentNotes.trim(),
        gymAccess: draft.gymAccess,
        homeTraining: draft.homeTraining
      },
      goals: {
        mainGoal: draft.mainGoal.trim(),
        notes: draft.eventNotes.trim(),
        priority: draft.priority as NonNullable<ClientOnboarding["goals"]>["priority"],
        secondaryGoal: draft.secondaryGoal.trim(),
        targetDate: draft.targetDate
      },
      limitations: {
        contraindications: draft.contraindications.trim(),
        injuries: draft.onboardingInjuries.trim(),
        medicalNotes: draft.medicalNotes.trim(),
        movementLimitations: draft.movementLimitations.trim(),
        painAreas: splitOnboardingList(draft.painAreas)
      },
      sportProfile: {
        competitiveLevel: draft.competitiveLevel as NonNullable<ClientOnboarding["sportProfile"]>["competitiveLevel"],
        nextCompetitionDate: draft.nextCompetitionDate,
        nextCompetitionName: draft.nextCompetitionName.trim(),
        primarySport: draft.modality.trim(),
        secondarySports: splitOnboardingList(draft.secondarySports),
        sportCategory: draft.sportCategory as NonNullable<ClientOnboarding["sportProfile"]>["sportCategory"]
      },
      trainingAvailability: {
        daysPerWeek: Number.isFinite(parsedDaysPerWeek) && parsedDaysPerWeek > 0 ? parsedDaysPerWeek : undefined,
        preferredTrainingDays: splitOnboardingList(draft.preferredTrainingDays),
        scheduleNotes: draft.scheduleNotes.trim(),
        sessionDurationMinutes: Number.isFinite(parsedSessionDuration) && parsedSessionDuration > 0 ? parsedSessionDuration : undefined
      }
    };
    const nextEvent = cleanEventName
      ? `${cleanEventName}${cleanEventDate ? ` - ${cleanEventDate}` : ""}`
      : client.nextEvent;

    onUpdateClient({
      ...client,
      age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : client.age,
      availability: draft.availability.trim() || "Sin especificar",
      availableEquipment: draft.availableEquipment.trim() || "Sin especificar",
      business: {
        ...client.business,
        acquisitionSource: businessDraft.acquisitionSource as ClientAcquisitionSource,
        acquisitionSourceDetail: businessDraft.acquisitionSourceDetail.trim() || undefined,
        exitReason: businessDraft.exitReason.trim() || undefined,
        joinedAt: businessDraft.joinedAt || undefined,
        status: businessDraft.status as ClientBusinessStatus,
        statusChangedAt: businessDraft.statusChangedAt || undefined
      },
      coachNotes: draft.coachNotes.trim() || "Sin especificar",
      goalType: draft.goalType as CoachClient["goalType"],
      injuries: draft.injuries.trim() || "Sin especificar",
      modality: draft.modality.trim() || "Sin especificar",
      name: draft.name.trim() || client.name,
      nextEvent,
      onboarding,
      planning: {
        ...client.planning,
        eventDate: cleanEventDate,
        eventName: cleanEventName,
        eventNotes: draft.eventNotes.trim(),
        primaryGoal: draft.primaryGoal.trim() || draft.mainGoal.trim() || "Sin especificar",
        secondaryGoal: draft.secondaryGoal.trim() || client.planning.secondaryGoal
      },
      sex: draft.sex as ClientSex,
      sport: draft.modality.trim() || client.sport,
      status: draft.status.trim() || "Sin especificar"
    });
    setIsEditing(false);
  };
  const handleSaveAccess = () => {
    onUpdateClient({
      ...client,
      accessEndDate: accessDraft.accessEndDate || undefined,
      accessStartDate: accessDraft.accessStartDate || undefined
    });
  };
  const handleClearAccess = () => {
    setAccessDraft({ accessEndDate: "", accessStartDate: "" });
    onUpdateClient({
      ...client,
      accessEndDate: undefined,
      accessStartDate: undefined
    });
  };
  const accessInfo = getClientAccessInfo(client);
  const accessProgress = getAccessProgress(client.accessStartDate, client.accessEndDate);
  const performanceTestEntries = getSortedPerformanceTests(client);
  const coachIntakeStatus = getCoachIntakeStatusLabel(client.intakeQuestionnaire);
  const intakeReview = getCoachIntakeReview(client);
  const onboardingCompletion = getOnboardingCompletion(client);
  const healthReviewBlock = intakeReview.blocks.find((block) => block.title === "Salud / limitaciones");
  const anamnesisCandidates: Array<[string, string]> = [
    ...(healthReviewBlock?.items ?? []).map(([label, value]): [string, string] => [label, value]),
    ["Contraindicaciones comunicadas", client.onboarding?.limitations?.contraindications ?? ""],
    ["Lesiones previas", client.onboarding?.limitations?.injuries ?? ""],
    ["Notas médicas comunicadas", client.onboarding?.limitations?.medicalNotes ?? ""],
    ["Limitaciones de movimiento", client.onboarding?.limitations?.movementLimitations ?? ""],
    ["Zonas con molestias", (client.onboarding?.limitations?.painAreas ?? []).join(", ")]
  ];
  const anamnesisItems = anamnesisCandidates.filter(([, value], index, entries) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || [
      "ninguna",
      "ninguno",
      "no",
      "pendiente de completar.",
      "sin datos",
      "sin especificar",
      "sin registrar"
    ].includes(normalized)) return false;
    return entries.findIndex(([label, listedValue]) => label === entries[index][0] && listedValue === value) === index;
  });
  const anamnesisStatus = anamnesisItems.length > 0
    ? "Revisar"
    : client.intakeQuestionnaire?.completed || client.onboarding?.completed
      ? "Sin antecedentes relevantes"
      : "Pendiente";
  const latestPrivateNote = sortedPrivateNotes[0];

  const updateIntakeQuestionnaire = (intakeQuestionnaire: IntakeQuestionnaire) => {
    onUpdateClient({
      ...client,
      intakeQuestionnaire
    });
  };

  const handleMarkIntakeReviewed = () => {
    if (!client.intakeQuestionnaire) return;
    updateIntakeQuestionnaire({
      ...client.intakeQuestionnaire,
      lastReviewedAt: new Date().toISOString(),
      needsCoachReview: false
    });
  };

  const handleMarkIntakePending = () => {
    const currentIntake = client.intakeQuestionnaire ?? buildInitialIntakeQuestionnaire();
    updateIntakeQuestionnaire({
      ...currentIntake,
      completed: false,
      needsCoachReview: true,
      required: true,
      updatedAt: new Date().toISOString()
    });
  };

  const handleMarkIntakeCompleted = () => {
    const now = new Date().toISOString();
    const currentIntake = client.intakeQuestionnaire ?? buildInitialIntakeQuestionnaire();
    updateIntakeQuestionnaire({
      ...currentIntake,
      completed: true,
      completedAt: currentIntake.completedAt ?? now,
      lastReviewedAt: now,
      needsCoachReview: false,
      required: true,
      updatedAt: currentIntake.updatedAt ?? now
    });
  };

  const detailSections = [
    {
      fields: [
        ["Nombre", displayValue(client.name)],
        ["Edad", `${displayValue(client.age)} años`],
        ["Disciplina / deporte", displayValue(client.modality || client.sport)],
        ["Sexo", getClientSexLabel(client.sex)],
        ["Contexto", displayValue(client.goalType)],
        ["Estado", displayValue(client.status)]
      ],
      title: "Datos básicos"
    },
    {
      fields: [
        ["Fecha de alta", formatAccessDate(getClientJoinedAt(client)) || "Sin especificar"],
        ["Estado del cliente", businessStatusLabels[getClientBusinessStatus(client)]],
        ["Fecha de cambio de estado", formatAccessDate(client.business?.statusChangedAt) || "Sin especificar"],
        ["Motivo de baja / pausa", displayValue(client.business?.exitReason)],
        ["Cómo conoció mis servicios", acquisitionSourceLabels[getClientAcquisitionSource(client)]],
        ["Detalle del origen", displayValue(client.business?.acquisitionSourceDetail)]
      ],
      title: "Datos de gestión"
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
    <section className="coach-surface mt-4 rounded-md p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button className="mb-3 text-sm font-semibold text-moss" onClick={onBack} type="button">
            ← Volver a Gestión
          </button>
          <h2 className="text-xl font-semibold text-ink">Información del cliente</h2>
          <p className="mt-1 text-sm text-ink/60">{client.name} · Acceso y documentación relevante</p>
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
        ) : null}
      </div>

      <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Acceso</h3>
            <p className="mt-1 text-sm font-semibold text-ink/65">{accessInfo.text}</p>
          </div>
          <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${accessInfo.badgeClass}`}>
            {accessInfo.label}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-ink/70">
            Fecha de inicio del acceso
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => setAccessDraft((currentDraft) => ({ ...currentDraft, accessStartDate: event.target.value }))}
              type="date"
              value={accessDraft.accessStartDate}
            />
          </label>
          <label className="text-sm font-semibold text-ink/70">
            Acceso activo hasta
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => setAccessDraft((currentDraft) => ({ ...currentDraft, accessEndDate: event.target.value }))}
              type="date"
              value={accessDraft.accessEndDate}
            />
          </label>
        </div>
        {accessProgress !== null ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-panel">
              <div className="h-full rounded-full bg-moss" style={{ width: `${accessProgress}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-ink/50">{accessProgress}% del periodo registrado.</p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSaveAccess} type="button">
            Guardar
          </button>
          <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleClearAccess} type="button">
            Quitar fecha
          </button>
        </div>
      </section>

      {!isEditing ? (
        <section className="mt-5">
          <div>
            <h3 className="font-semibold text-ink">Información del cliente</h3>
            <p className="mt-1 text-sm text-ink/55">Accede al detalle solo cuando necesites consultarlo o actualizarlo.</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                action: "Abrir",
                detail: onboardingCompletion.isComplete ? "Contexto inicial disponible." : "Pendiente de completar.",
                panel: "details" as const,
                status: onboardingCompletion.isComplete ? "Completa" : "Pendiente",
                title: "Ficha inicial"
              },
              {
                action: "Ver respuestas",
                detail: client.intakeQuestionnaire?.updatedAt ? `Actualizado ${formatDisplayDate(client.intakeQuestionnaire.updatedAt)}` : "Sin respuestas registradas.",
                panel: "intake" as const,
                status: coachIntakeStatus,
                title: "Cuestionario de ingreso"
              },
              {
                action: "Abrir",
                detail: latestPrivateNote ? `Última nota: ${formatDisplayDate(latestPrivateNote.updatedAt ?? latestPrivateNote.createdAt)}` : "Sin notas internas.",
                panel: "notes" as const,
                status: sortedPrivateNotes.length === 0 ? "Sin notas" : `${sortedPrivateNotes.length} ${sortedPrivateNotes.length === 1 ? "nota" : "notas"}`,
                title: "Notas internas"
              },
              {
                action: "Abrir",
                detail: anamnesisItems.length > 0 ? "Información comunicada que conviene consultar." : "Sin información relevante registrada.",
                panel: "anamnesis" as const,
                status: anamnesisStatus,
                title: "Anamnesis"
              }
            ].map((item) => {
              const statusClass = item.status === "Completa" || item.status === "Completo" || item.status === "Sin antecedentes relevantes"
                ? "border-moss/30 bg-mint text-moss"
                : item.status === "Revisar" || item.status === "Pendiente" || item.status === "Sin revisar"
                  ? "border-clay/35 bg-clay/10 text-clay"
                  : "border-line bg-panel/60 text-ink/55";
              return (
                <article className="coach-surface flex min-h-40 flex-col rounded-md p-4" key={item.title}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-semibold text-ink">{item.title}</h4>
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClass}`}>{item.status}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/55">{item.detail}</p>
                  <button className="mt-auto pt-4 text-left text-xs font-semibold text-moss" onClick={() => setActiveInfoPanel(item.panel)} type="button">
                    {item.action} →
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {!isEditing ? (
        <section className="hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-ink">Cuestionario de ingreso</h3>
              <p className="mt-1 text-sm text-ink/55">
                Resumen práctico de las respuestas del deportista para revisar antes de planificar.
              </p>
            </div>
            <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${getCoachIntakeStatusClass(client.intakeQuestionnaire)}`}>
              {coachIntakeStatus}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ClientInfoCard label="Última actualización" value={client.intakeQuestionnaire?.updatedAt ? formatDisplayDateTime(client.intakeQuestionnaire.updatedAt) : "Sin actualizar"} />
            <ClientInfoCard label="Última revisión" value={client.intakeQuestionnaire?.lastReviewedAt ? formatDisplayDateTime(client.intakeQuestionnaire.lastReviewedAt) : "Sin revisar"} />
            <ClientInfoCard label="Estado" value={coachIntakeStatus} />
          </div>

          {client.intakeQuestionnaire?.completed ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {intakeReview.blocks.map((block) => (
                <article className="rounded-md border border-line bg-white p-3" key={block.title}>
                  <h4 className="text-sm font-semibold text-ink">{block.title}</h4>
                  {block.items.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {block.items.map(([label, value]) => (
                        <div className="rounded-md border border-line bg-panel/40 px-3 py-2" key={label}>
                          <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-ink/75">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 px-3 py-3 text-sm font-semibold text-ink/50">
                      Sin registrar.
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-line bg-white p-3 text-sm font-semibold text-ink/60">
              El deportista todavía no ha completado el cuestionario de ingreso.
            </p>
          )}

          <article className="mt-4 rounded-md border border-line bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-ink">Impacto en planificación</h4>
                <p className="mt-1 text-xs font-medium text-ink/50">Recordatorios orientativos para revisar antes de programar.</p>
              </div>
              <span className="w-fit rounded-md border border-line bg-panel/60 px-2.5 py-1 text-xs font-semibold text-ink/60">
                Revisar antes de planificar
              </span>
            </div>
            {intakeReview.impactItems.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {intakeReview.impactItems.map((item) => (
                  <span className="rounded-md border border-line bg-panel/60 px-2.5 py-1 text-xs font-semibold text-ink/65" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink/50">Sin condicionantes declarados en el cuestionario.</p>
            )}
          </article>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setActiveInfoPanel("intake")} type="button">
              Ver cuestionario completo
            </button>
            {client.intakeQuestionnaire?.completed ? (
              <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleMarkIntakeReviewed} type="button">
                Marcar como revisado
              </button>
            ) : (
              <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleMarkIntakeCompleted} type="button">
                Marcar como completado
              </button>
            )}
            <button className="rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleMarkIntakePending} type="button">
              Marcar como pendiente
            </button>
          </div>
        </section>
      ) : null}

      {!isEditing ? (
        <section className="hidden">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="font-semibold text-ink">Acciones secundarias</h3>
              <p className="mt-1 text-sm text-ink/55">
                Los detalles largos quedan bajo demanda para mantener esta ficha corta.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-mint" onClick={() => setActiveInfoPanel("details")} type="button">
                Ver ficha completa
              </button>
              <button className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-mint" onClick={() => setActiveInfoPanel("intake")} type="button">
                Ver cuestionario completo
              </button>
              <button className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-mint" onClick={() => setActiveInfoPanel("notes")} type="button">
                Notas internas ({sortedPrivateNotes.length})
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Notas internas</h3>
            <p className="mt-1 text-sm text-ink/55">Solo visibles para el entrenador.</p>
          </div>
          <span className="w-fit rounded-md border border-line bg-panel/50 px-2 py-1 text-xs font-semibold text-ink/50">
            Nota privada. No visible para el deportista.
          </span>
        </div>

        <div className="coach-subtle-card mt-4 rounded-md px-4 py-3">
          <div className="grid gap-3 lg:grid-cols-[0.9fr_0.7fr]">
            <label className="text-sm font-semibold text-ink/70">
              Título
              <input
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
                placeholder="Opcional"
                value={privateNoteDraft.title}
              />
            </label>
            <label className="text-sm font-semibold text-ink/70">
              Categoría
              <select
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, category: event.target.value as CoachPrivateNoteCategory }))}
                value={privateNoteDraft.category}
              >
                {coachPrivateNoteCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink/70 lg:col-span-2">
              Nota
              <textarea
                className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, text: event.target.value }))}
                placeholder="Recordatorio, decisión pendiente, punto técnico o idea para la próxima sesión."
                value={privateNoteDraft.text}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!privateNoteDraft.text.trim()}
              onClick={handleSavePrivateNote}
              type="button"
            >
              {editingPrivateNoteId ? "Guardar nota" : "Añadir nota"}
            </button>
            {editingPrivateNoteId ? (
              <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={resetPrivateNoteDraft} type="button">
                Cancelar edición
              </button>
            ) : null}
          </div>
        </div>

        {sortedPrivateNotes.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {sortedPrivateNotes.map((note) => (
              <article className={`rounded-md border border-line bg-panel/35 p-4 ${note.pinned ? "border-l-4 border-l-moss" : ""}`} key={note.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/60">
                        {coachPrivateNoteCategoryLabels[note.category ?? "other"]}
                      </span>
                      {note.pinned ? (
                        <span className="rounded-md border border-moss/30 bg-mint px-2 py-1 text-xs font-semibold text-moss">
                          Fijada
                        </span>
                      ) : null}
                    </div>
                    {note.title ? <h4 className="mt-3 font-semibold text-ink">{note.title}</h4> : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{note.text}</p>
                    <p className="mt-2 text-xs font-medium text-ink/45">
                      {note.updatedAt ? `Actualizada ${formatDisplayDate(note.updatedAt)}` : `Creada ${formatDisplayDate(note.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/70"
                      onClick={() => handleTogglePrivateNotePin(note.id)}
                      type="button"
                    >
                      {note.pinned ? "Desfijar" : "Fijar"}
                    </button>
                    <button
                      className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/70"
                      onClick={() => handleEditPrivateNote(note)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                      onClick={() => handleDeletePrivateNote(note.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 px-4 py-4 text-sm font-semibold text-ink/50">
            Aún no hay notas internas para este cliente.
          </p>
        )}
      </section>

      <section className="hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Tests y valores de referencia</h3>
            <p className="mt-1 text-sm text-ink/55">Guarda referencias iniciales por deporte o contexto sin calcular zonas ni cargas automáticamente.</p>
          </div>
          <span className="w-fit rounded-md border border-line bg-panel/50 px-2 py-1 text-xs font-semibold text-ink/50">
            {performanceTestEntries.length} registros
          </span>
        </div>
        <p className="mt-3 rounded-md border border-line bg-panel/35 p-3 text-xs font-semibold text-ink/55">
          Registra solo datos necesarios para la planificación. Algunos valores pueden ser sensibles.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1fr_0.8fr_0.7fr]">
          <label className="text-sm font-semibold text-ink/70">
            Categoría
            <select
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("category", event.target.value)}
              value={performanceTestDraft.category}
            >
              {performanceTestCategoryOrder.map((category) => (
                <option key={category} value={category}>{performanceTestCategoryLabels[category]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink/70">
            Test sugerido
            <select
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("suggestedTestName", event.target.value)}
              value={performanceTestDraft.suggestedTestName}
            >
              {performanceTestSuggestions[performanceTestDraft.category].map((testName) => (
                <option key={testName} value={testName}>{testName}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink/70">
            Fecha
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("date", event.target.value)}
              type="date"
              value={performanceTestDraft.date}
            />
          </label>
          <label className="text-sm font-semibold text-ink/70">
            Unidad
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("unit", event.target.value)}
              placeholder="kg, W, cm..."
              value={performanceTestDraft.unit}
            />
          </label>
          <label className="text-sm font-semibold text-ink/70 lg:col-span-2">
            Test personalizado
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("customTestName", event.target.value)}
              placeholder="Opcional: sobrescribe el test sugerido"
              value={performanceTestDraft.customTestName}
            />
          </label>
          <label className="text-sm font-semibold text-ink/70">
            Valor
            <input
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("value", event.target.value)}
              placeholder="120 kg, 4:20 min/km..."
              value={performanceTestDraft.value}
            />
          </label>
          <button
            className="mt-6 h-10 rounded-md bg-ink px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!(performanceTestDraft.customTestName.trim() || performanceTestDraft.suggestedTestName.trim()) || !performanceTestDraft.value.trim()}
            onClick={handleAddPerformanceTest}
            type="button"
          >
            Guardar test
          </button>
          <label className="text-sm font-semibold text-ink/70 lg:col-span-4">
            Notas
            <textarea
              className="mt-1 min-h-16 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
              onChange={(event) => updatePerformanceTestDraft("notes", event.target.value)}
              placeholder="Contexto del test, protocolo, material o condiciones."
              value={performanceTestDraft.notes}
            />
          </label>
        </div>

        {performanceTestEntries.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {performanceTestEntries.map((entry) => (
              <article className="rounded-md border border-line bg-panel/35 p-3" key={entry.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{entry.testName}</p>
                    <p className="mt-1 text-sm text-moss">{formatPerformanceTestValue(entry)}</p>
                    <p className="mt-1 text-xs font-medium text-ink/45">
                      {formatDisplayDate(entry.date)} · {performanceTestCategoryLabels[entry.category]}
                    </p>
                    {entry.notes ? <p className="mt-2 text-sm text-ink/60">{entry.notes}</p> : null}
                  </div>
                  <button
                    className="w-fit rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                    onClick={() => handleDeletePerformanceTest(entry.id)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 px-4 py-4 text-sm font-semibold text-ink/50">
            Añadir test de referencia.
          </p>
        )}
      </section>

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
              <label className="text-sm font-semibold text-ink/70">
                Sexo
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("sex", event.target.value)} value={draft.sex}>
                  <option value="female">Mujer</option>
                  <option value="male">Hombre</option>
                  <option value="other">Otro</option>
                  <option value="prefer_not_to_say">Prefiero no decirlo</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Estado
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("status", event.target.value)} value={draft.status} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Datos de gestión</h3>
            <p className="mt-1 text-sm text-ink/55">Información interna para analítica de clientes. No afecta a sesiones, acceso activo ni datos deportivos.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Fecha de alta
                <input
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, joinedAt: event.target.value }))}
                  type="date"
                  value={businessDraft.joinedAt}
                />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Estado del cliente
                <select
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, status: event.target.value as ClientBusinessStatus }))}
                  value={businessDraft.status}
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="inactive">Baja</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Fecha de cambio de estado
                <input
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, statusChangedAt: event.target.value }))}
                  type="date"
                  value={businessDraft.statusChangedAt}
                />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Cómo conoció mis servicios
                <select
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, acquisitionSource: event.target.value as ClientAcquisitionSource }))}
                  value={businessDraft.acquisitionSource}
                >
                  {acquisitionSourceOptions.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Motivo de baja / pausa
                <input
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, exitReason: event.target.value }))}
                  placeholder="Opcional"
                  value={businessDraft.exitReason}
                />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Detalle del origen
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
                  onChange={(event) => setBusinessDraft((currentDraft) => ({ ...currentDraft, acquisitionSourceDetail: event.target.value }))}
                  placeholder="Ej. referido por otro cliente, campaña concreta, evento..."
                  value={businessDraft.acquisitionSourceDetail}
                />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink">Ficha inicial</h3>
                <p className="mt-1 text-sm text-ink/55">Completa solo lo necesario para planificar mejor.</p>
              </div>
              <label className="flex w-fit items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70">
                <input
                  checked={draft.completed}
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, completed: event.target.checked }))}
                  type="checkbox"
                />
                Marcar completa
              </label>
            </div>
            <p className="mt-3 rounded-md border border-line bg-white p-3 text-xs font-semibold text-ink/55">
              Registra solo información necesaria para la planificación. Los datos se guardan localmente en este navegador.
            </p>
            {draft.sex === "female" ? (
              <p className="mt-2 rounded-md border border-line bg-white p-3 text-xs font-semibold text-ink/55">
                El seguimiento del ciclo menstrual se activa desde la cuenta deportista y es opcional.
              </p>
            ) : null}
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Deporte y contexto</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Deporte principal
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("modality", event.target.value)} value={draft.modality} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Categoría deportiva
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("sportCategory", event.target.value)} value={draft.sportCategory}>
                  <option value="">Sin especificar</option>
                  <option value="strength">Fuerza</option>
                  <option value="endurance">Resistencia</option>
                  <option value="mixed">Mixto</option>
                  <option value="team">Equipo</option>
                  <option value="combat">Combate</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Nivel competitivo
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("competitiveLevel", event.target.value)} value={draft.competitiveLevel}>
                  <option value="">Sin especificar</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                  <option value="competitive">Competitivo</option>
                  <option value="elite">Élite</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Deportes secundarios
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("secondarySports", event.target.value)} placeholder="Separados por coma" value={draft.secondarySports} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Próxima competición / test
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("nextCompetitionName", event.target.value)} value={draft.nextCompetitionName} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Fecha
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("nextCompetitionDate", event.target.value)} type="date" value={draft.nextCompetitionDate} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Disponibilidad semanal</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Días por semana
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" inputMode="numeric" onChange={(event) => updateDraft("trainingDaysPerWeek", event.target.value)} type="text" value={draft.trainingDaysPerWeek} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Duración por sesión
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" inputMode="numeric" onChange={(event) => updateDraft("sessionDurationMinutes", event.target.value)} placeholder="Minutos" type="text" value={draft.sessionDurationMinutes} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Días preferidos
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("preferredTrainingDays", event.target.value)} placeholder="Ej. lunes, miércoles, viernes" value={draft.preferredTrainingDays} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Notas de horario
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("scheduleNotes", event.target.value)} value={draft.scheduleNotes} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Objetivos</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Objetivo principal
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("mainGoal", event.target.value)} value={draft.mainGoal} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Objetivo secundario
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("secondaryGoal", event.target.value)} value={draft.secondaryGoal} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Prioridad
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("priority", event.target.value)} value={draft.priority}>
                  <option value="">Sin especificar</option>
                  <option value="performance">Rendimiento</option>
                  <option value="health">Salud</option>
                  <option value="body_composition">Composición corporal</option>
                  <option value="return_to_play">Return to play</option>
                  <option value="general_fitness">Fitness general</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Fecha objetivo
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("targetDate", event.target.value)} type="date" value={draft.targetDate} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Lesiones / limitaciones</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Lesiones o antecedentes relevantes
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("onboardingInjuries", event.target.value)} value={draft.onboardingInjuries} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Zonas de dolor
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("painAreas", event.target.value)} placeholder="Separadas por coma" value={draft.painAreas} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Limitaciones de movimiento
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("movementLimitations", event.target.value)} value={draft.movementLimitations} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Notas médicas
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("medicalNotes", event.target.value)} value={draft.medicalNotes} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Contraindicaciones
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("contraindications", event.target.value)} value={draft.contraindications} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Material disponible</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70">
                <input checked={draft.gymAccess} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, gymAccess: event.target.checked }))} type="checkbox" />
                Acceso a gimnasio
              </label>
              <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70">
                <input checked={draft.homeTraining} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, homeTraining: event.target.checked }))} type="checkbox" />
                Entrenamiento en casa
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Material disponible
                <input className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("equipmentList", event.target.value)} placeholder="Separado por coma" value={draft.equipmentList} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Notas de material
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("equipmentNotes", event.target.value)} value={draft.equipmentNotes} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Tests iniciales</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Fuerza
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("baselineStrengthTests", event.target.value)} value={draft.baselineStrengthTests} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Resistencia
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("baselineEnduranceTests", event.target.value)} value={draft.baselineEnduranceTests} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Movilidad
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("baselineMobilityTests", event.target.value)} value={draft.baselineMobilityTests} />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Composición corporal
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("baselineBodyComposition", event.target.value)} value={draft.baselineBodyComposition} />
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Otros tests
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("baselineOtherTests", event.target.value)} value={draft.baselineOtherTests} />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Comunicación</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink/70">
                Contacto preferido
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("preferredContact", event.target.value)} value={draft.preferredContact}>
                  <option value="">Sin especificar</option>
                  <option value="app">App</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="in_person">Presencial</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Frecuencia de feedback
                <select className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("feedbackFrequency", event.target.value)} value={draft.feedbackFrequency}>
                  <option value="">Sin especificar</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="after_session">Después de sesión</option>
                  <option value="only_when_needed">Solo cuando haga falta</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                Notas de comunicación
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => updateDraft("communicationNotes", event.target.value)} value={draft.communicationNotes} />
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
        <div className="hidden">
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
          <MenstrualCoachContextCard client={client} />
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

      {activeInfoPanel === "details" ? (
        <CoachInfoModal onClose={() => setActiveInfoPanel(null)} title="Ficha completa">
          <div className="flex justify-end">
            <button
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setActiveInfoPanel(null);
                setIsEditing(true);
              }}
              type="button"
            >
              Editar ficha
            </button>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {detailSections.map((section) => (
              <article className="rounded-md border border-line bg-panel/35 p-4" key={section.title}>
                <h3 className="font-semibold text-ink">{section.title}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {section.fields.map(([label, value]) => (
                    <div className="rounded-md border border-line bg-panel/50 px-3 py-3" key={label}>
                      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            <MenstrualCoachContextCard client={client} />
            <article className="rounded-md border border-line bg-panel/35 p-4">
              <h3 className="font-semibold text-ink">Conexiones</h3>
              <div className="mt-4 rounded-md border border-line bg-panel/50 p-4">
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
                  <ClientInfoCard label="Estado" value={getCardioConnectionLabel(intervalsConnection?.status)} />
                  <ClientInfoCard label="Última sincronización" value={formatCardioSyncDate(intervalsConnection?.lastSyncAt)} />
                </div>
              </div>
            </article>
          </div>
        </CoachInfoModal>
      ) : null}

      {activeInfoPanel === "intake" ? (
        <CoachInfoModal onClose={() => setActiveInfoPanel(null)} title="Cuestionario de ingreso">
          <div className="grid gap-3 md:grid-cols-4">
            <ClientInfoCard label="Estado" value={coachIntakeStatus} />
            <ClientInfoCard label="Completado" value={client.intakeQuestionnaire?.completedAt ? formatDisplayDateTime(client.intakeQuestionnaire.completedAt) : "Sin completar"} />
            <ClientInfoCard label="Última actualización" value={client.intakeQuestionnaire?.updatedAt ? formatDisplayDateTime(client.intakeQuestionnaire.updatedAt) : "Sin actualizar"} />
            <ClientInfoCard label="Última revisión" value={client.intakeQuestionnaire?.lastReviewedAt ? formatDisplayDateTime(client.intakeQuestionnaire.lastReviewedAt) : "Sin revisar"} />
          </div>
          {client.intakeQuestionnaire?.completed ? (
            <div className="grid gap-3 md:grid-cols-2">
              {intakeReview.fullRows.map(([label, value]) => (
                <article className="rounded-md border border-line bg-panel/35 p-3" key={label}>
                  <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-ink/75">{value}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-line bg-panel/35 p-3 text-sm font-semibold text-ink/60">
              El deportista todavía no ha completado el cuestionario de ingreso.
            </p>
          )}
          <article className="rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Impacto en planificación</h3>
            <p className="mt-1 text-xs font-medium text-ink/50">Recordatorios existentes para revisar antes de programar.</p>
            {intakeReview.impactItems.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {intakeReview.impactItems.map((item) => (
                  <span className="rounded-md border border-line bg-panel/60 px-2.5 py-1 text-xs font-semibold text-ink/65" key={item}>{item}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink/50">Sin condicionantes declarados en el cuestionario.</p>
            )}
          </article>
          <div className="flex flex-wrap gap-2">
            {client.intakeQuestionnaire?.completed ? (
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleMarkIntakeReviewed} type="button">
                Marcar como revisado
              </button>
            ) : (
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleMarkIntakeCompleted} type="button">
                Marcar como completado
              </button>
            )}
            <button className="rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink/70" onClick={handleMarkIntakePending} type="button">
              Marcar como pendiente
            </button>
          </div>
        </CoachInfoModal>
      ) : null}

      {activeInfoPanel === "anamnesis" ? (
        <CoachInfoModal onClose={() => setActiveInfoPanel(null)} title="Anamnesis">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-line bg-panel/35 p-4">
            <div>
              <p className="font-semibold text-ink">Antecedentes comunicados</p>
              <p className="mt-1 text-sm text-ink/55">Información declarada por el cliente o registrada por el entrenador. Sin interpretación clínica.</p>
            </div>
            <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${anamnesisItems.length > 0 ? "border-clay/35 bg-clay/10 text-clay" : "border-moss/30 bg-mint text-moss"}`}>
              {anamnesisStatus}
            </span>
          </div>
          {anamnesisItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {anamnesisItems.map(([label, value], index) => (
                <article className="rounded-md border border-line bg-panel/35 p-3" key={`${label}-${index}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-ink/75">{value}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-ink/50">Sin antecedentes relevantes registrados.</p>
          )}
        </CoachInfoModal>
      ) : null}

      {activeInfoPanel === "notes" ? (
        <CoachInfoModal onClose={() => setActiveInfoPanel(null)} title="Notas internas">
          <p className="rounded-md border border-line bg-panel/35 p-3 text-xs font-semibold text-ink/55">
            Nota privada. Solo visible para el entrenador.
          </p>
          <div className="coach-subtle-card rounded-md px-4 py-3">
            <div className="grid gap-3 lg:grid-cols-[0.9fr_0.7fr]">
              <label className="text-sm font-semibold text-ink/70">
                Título
                <input
                  className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink"
                  onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
                  placeholder="Opcional"
                  value={privateNoteDraft.title}
                />
              </label>
              <label className="text-sm font-semibold text-ink/70">
                Categoría
                <select
                  className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink"
                  onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, category: event.target.value as CoachPrivateNoteCategory }))}
                  value={privateNoteDraft.category}
                >
                  {coachPrivateNoteCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-ink/70 lg:col-span-2">
                Nota
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink"
                  onChange={(event) => setPrivateNoteDraft((currentDraft) => ({ ...currentDraft, text: event.target.value }))}
                  placeholder="Recordatorio, decisión pendiente, punto técnico o idea para la próxima sesión."
                  value={privateNoteDraft.text}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45" disabled={!privateNoteDraft.text.trim()} onClick={handleSavePrivateNote} type="button">
                {editingPrivateNoteId ? "Guardar nota" : "Añadir nota"}
              </button>
              {editingPrivateNoteId ? (
                <button className="rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink/70" onClick={resetPrivateNoteDraft} type="button">
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </div>
          {sortedPrivateNotes.length > 0 ? (
            <div className="grid gap-3">
              {sortedPrivateNotes.map((note) => (
                <article className={`rounded-md border border-line bg-panel/35 p-4 ${note.pinned ? "border-l-4 border-l-moss" : ""}`} key={note.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md border border-line bg-panel px-2 py-1 text-xs font-semibold text-ink/60">
                          {coachPrivateNoteCategoryLabels[note.category ?? "other"]}
                        </span>
                        {note.pinned ? (
                          <span className="rounded-md border border-moss/30 bg-mint px-2 py-1 text-xs font-semibold text-moss">Fijada</span>
                        ) : null}
                      </div>
                      {note.title ? <h4 className="mt-3 font-semibold text-ink">{note.title}</h4> : null}
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{note.text}</p>
                      <p className="mt-2 text-xs font-medium text-ink/45">
                        {note.updatedAt ? `Actualizada ${formatDisplayDate(note.updatedAt)}` : `Creada ${formatDisplayDate(note.createdAt)}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button className="rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink/70" onClick={() => handleTogglePrivateNotePin(note.id)} type="button">
                        {note.pinned ? "Desfijar" : "Fijar"}
                      </button>
                      <button className="rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-ink/70" onClick={() => handleEditPrivateNote(note)} type="button">
                        Editar
                      </button>
                      <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700" onClick={() => handleDeletePrivateNote(note.id)} type="button">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-line bg-panel/35 px-4 py-4 text-sm font-semibold text-ink/50">
              Aún no hay notas internas para este cliente.
            </p>
          )}
        </CoachInfoModal>
      ) : null}
    </section>
  );
}

type TechniqueVideoHistoryItem = {
  exerciseId?: string | null;
  exerciseIndex: number;
  exerciseName: string;
  exercisePattern?: string | null;
  finalRpe?: number | string | null;
  id: string;
  review: TechniqueReview;
  sessionDate: string;
  sessionId?: string;
  sessionIndex: number;
  sessionType?: string | null;
  srpe?: number | string | null;
  techniqueVideoNote?: string | null;
  techniqueVideoUrl: string;
  techniqueVideoView?: TechniqueVideoView | null;
};

function getTechniqueVideoHistoryItems(client?: CoachClient | null): TechniqueVideoHistoryItem[] {
  const items: TechniqueVideoHistoryItem[] = [];

  (client?.sessionRecords ?? []).forEach((session, sessionIndex) => {
    (session.performedExercises ?? []).forEach((exercise, exerciseIndex) => {
        const techniqueVideoUrl = `${exercise.techniqueVideoUrl ?? ""}`.trim();
        if (!techniqueVideoUrl) return;
        const exerciseName =
          exercise.exerciseName ||
          (exercise as ConnectedSessionExercise & { name?: string | null }).name ||
          getExerciseById(exercise.exerciseId || "")?.name ||
          "Ejercicio sin especificar";
        const exercisePattern = getExerciseById(exercise.exerciseId || "")?.pattern ?? null;
        const legacySessionSrpe = (session as ClientSessionRecord & { srpe?: number | string | null }).srpe;

        items.push({
          exerciseId: exercise.exerciseId,
          exerciseIndex,
          exerciseName,
          exercisePattern,
          finalRpe: session.finalRpe,
          id: `${session.id ?? session.date}-${sessionIndex}-${exercise.id ?? exerciseIndex}`,
          review: exercise.techniqueReview ?? { compensationTags: [], markedAsReference: false, status: "not_reviewed" },
          sessionDate: session.date,
          sessionId: session.id,
          sessionIndex,
          sessionType: session.type,
          srpe: session.sRPE ?? legacySessionSrpe,
          techniqueVideoNote: exercise.techniqueVideoNote,
          techniqueVideoUrl,
          techniqueVideoView: exercise.techniqueVideoView
        });
      });
  });

  return items.sort((a, b) => (parseAccessDate(b.sessionDate)?.getTime() ?? 0) - (parseAccessDate(a.sessionDate)?.getTime() ?? 0));
}

function getTechniqueVideoStatusLabel(status?: TechniqueReviewStatus) {
  return techniqueReviewStatusLabels[status ?? "not_reviewed"];
}

function ClientProgressView({
  client,
  onOpenAssessments,
  onOpenTraining,
  onOpenWellness
}: {
  client?: CoachClient | null;
  onOpenAssessments: (clientId: string) => void;
  onOpenTraining: (clientId: string) => void;
  onOpenWellness: (clientId: string) => void;
}) {
  const assessments = client?.assessments ?? [];
  const assessmentGroups = buildAssessmentGroups(assessments as AssessmentEntry[]);
  const favoriteTests = client?.assessmentPreferences?.favoriteTests ?? [];
  const reassessmentDates = client?.assessmentPreferences?.reassessmentDates ?? {};
  const favoriteAssessmentGroups = assessmentGroups.filter((group) => favoriteTests.includes(group.key));
  const recentAssessmentGroups = [...favoriteAssessmentGroups, ...assessmentGroups.filter((group) => !favoriteTests.includes(group.key))]
    .filter((group, index, list) => list.findIndex((item) => item.key === group.key) === index)
    .sort((left, right) => getAssessmentDateValue(right.entries[right.entries.length - 1]?.date) - getAssessmentDateValue(left.entries[left.entries.length - 1]?.date));
  const recentChanges = recentAssessmentGroups.slice(0, 6);
  const sessionRecords = client?.sessionRecords ?? [];
  const recentSessions = [...sessionRecords].sort((left, right) => (getReviewSessionDate(right.date)?.getTime() ?? 0) - (getReviewSessionDate(left.date)?.getTime() ?? 0));
  const completedSessions = sessionRecords.filter((session) => session.completed || session.status === "Completada");
  const pendingReviewSessions = sessionRecords.filter((session) => session.completed && session.reviewStatus !== "reviewed");
  const plannedSessions = sessionRecords.length;
  const adherence = plannedSessions > 0 ? Math.round((completedSessions.length / plannedSessions) * 100) : null;
  const latestCompletedSession = recentSessions.find((session) => session.completed || session.status === "Completada");
  const nextPlannedSession = recentSessions
    .filter((session) => !session.completed && session.date && (getReviewSessionDate(session.date)?.getTime() ?? 0) >= getTodayDateOnly().getTime())
    .sort((left, right) => (getReviewSessionDate(left.date)?.getTime() ?? 0) - (getReviewSessionDate(right.date)?.getTime() ?? 0))[0];
  const techniqueVideos = getTechniqueVideoHistoryItems(client);
  const pendingTechniqueVideos = techniqueVideos.filter((video) => (video.review.status ?? "not_reviewed") === "not_reviewed");
  const relevantTechniqueVideos = techniqueVideos.filter((video) => video.review.status === "moderate_compensation" || video.review.status === "high_compensation" || video.review.globalScore === "high_priority");
  const referenceTechniqueVideos = techniqueVideos.filter((video) => video.review.markedAsReference);
  const wellnessRecords = recentSessions.filter((session) => session.wellness);
  const latestWellness = wellnessRecords[0]?.wellness;
  const positiveWellnessValue = (wellness: ClientWellness | undefined, key: "calm" | "energy" | "motivation" | "recovery" | "sleep") => {
    if (!wellness) return 0;
    if (key === "energy") return wellness.energy ?? Math.max(1, 6 - wellness.fatigue);
    if (key === "recovery") return wellness.recovery ?? Math.max(1, 6 - wellness.soreness);
    if (key === "calm") return wellness.calm ?? Math.max(1, 6 - wellness.stress);
    return wellness[key] ?? 0;
  };
  const readinessValues = latestWellness
    ? [
        positiveWellnessValue(latestWellness, "sleep"),
        positiveWellnessValue(latestWellness, "energy"),
        positiveWellnessValue(latestWellness, "recovery"),
        positiveWellnessValue(latestWellness, "calm"),
        positiveWellnessValue(latestWellness, "motivation")
      ].filter((value) => value > 0)
    : [];
  const latestReadiness = readinessValues.length > 0
    ? readinessValues.reduce((total, value) => total + value, 0) / readinessValues.length
    : 0;
  const discomfortSessions = recentSessions.filter((session) => session.discomfort?.hasDiscomfort || session.discomfort?.notes).slice(0, 3);
  const negativeFeedbackSessions = recentSessions.filter((session) => session.athleteQuickFeedback === "down").slice(0, 2);
  const dueReassessments = favoriteAssessmentGroups
    .map((group) => ({
      group,
      state: getAssessmentReassessmentState(reassessmentDates[group.key]),
      targetDate: reassessmentDates[group.key]
    }))
    .filter((item) => item.state.label === "Reevaluación pendiente" || item.state.label === "Reevaluar pronto");
  const warningSignals = [
    ...discomfortSessions.map((session) => ({
      action: "Ir a Sesiones",
      date: session.date,
      onClick: () => client && onOpenTraining(client.id),
      text: session.discomfort?.notes || session.discomfort?.bodyArea || "Molestia registrada por el deportista.",
      type: "Molestias"
    })),
    ...negativeFeedbackSessions.map((session) => ({
      action: "Ir a Sesiones",
      date: session.date,
      onClick: () => client && onOpenTraining(client.id),
      text: session.athleteQuickFeedbackNote || "Feedback negativo tras la sesión.",
      type: "Feedback"
    })),
    ...(latestReadiness > 0 && latestReadiness < 3 ? [{
      action: "Ir a Bienestar",
      date: wellnessRecords[0]?.date,
      onClick: () => client && onOpenWellness(client.id),
      text: `Readiness reciente ${latestReadiness.toFixed(1)}/5.`,
      type: "Wellness"
    }] : []),
    ...dueReassessments.map((item) => ({
      action: "Ir a Valoraciones",
      date: item.targetDate,
      onClick: () => client && onOpenAssessments(client.id),
      text: `${item.group.name}: ${item.state.label.toLowerCase()}.`,
      type: "Reevaluación"
    })),
    ...pendingReviewSessions.slice(0, 2).map((session) => ({
      action: "Ir a Sesiones",
      date: session.date,
      onClick: () => client && onOpenTraining(client.id),
      text: session.summary || "Sesión completada pendiente de revisar.",
      type: "Revisión"
    }))
  ].slice(0, 6);
  const warningSignalCategoryByType: Record<string, string> = {
    Feedback: "Feedback",
    Molestias: "Molestias",
    Reevaluación: "Revisiones",
    Revisión: "Revisiones",
    Wellness: "Otras señales"
  };
  const warningSignalCategoryOrder = ["Molestias", "Feedback", "Revisiones", "Técnica", "Adherencia / sesiones", "Carga", "Otras señales"];
  const groupedWarningSignals = warningSignalCategoryOrder
    .map((category) => ({
      category,
      signals: warningSignals.filter((signal) => (warningSignalCategoryByType[signal.type] ?? "Otras señales") === category)
    }))
    .filter((group) => group.signals.length > 0);
  const strengthFavoriteCount = favoriteAssessmentGroups.filter((group) => group.category === "Fuerza" || group.category === "Salto").length;
  const enduranceFavoriteCount = favoriteAssessmentGroups.filter((group) => group.category === "Resistencia").length;
  const progressStatusCards = [
    {
      label: "Estado general",
      status: warningSignals.length > 0 ? "A vigilar" : completedSessions.length > 0 || favoriteAssessmentGroups.length > 0 ? "Estable" : "Sin datos suficientes",
      text: warningSignals.length > 0 ? `${warningSignals.length} señales recientes` : completedSessions.length > 0 ? "Sin señales prioritarias" : "Añade sesiones o valoraciones"
    },
    {
      label: "Fuerza",
      status: strengthFavoriteCount > 0 ? "En seguimiento" : "Sin datos suficientes",
      text: strengthFavoriteCount > 0 ? `${strengthFavoriteCount} principales` : "Marca tests principales"
    },
    {
      label: "Resistencia",
      status: enduranceFavoriteCount > 0 ? "En seguimiento" : "Sin datos suficientes",
      text: enduranceFavoriteCount > 0 ? `${enduranceFavoriteCount} principales` : "Sin referencia principal"
    },
    {
      label: "Técnica",
      status: pendingTechniqueVideos.length > 0 ? "Pendiente de revisar" : relevantTechniqueVideos.length > 0 ? "A vigilar" : techniqueVideos.length > 0 ? "Revisado" : "Sin datos suficientes",
      text: pendingTechniqueVideos.length > 0 ? `${pendingTechniqueVideos.length} vídeos pendientes` : techniqueVideos.length > 0 ? `${techniqueVideos.length} vídeos` : "Sin vídeos recientes"
    },
    {
      label: "Adherencia",
      status: adherence === null ? "Sin datos suficientes" : adherence >= 80 ? "Estable" : "A vigilar",
      text: adherence === null ? "Sin sesiones suficientes" : `${adherence}% de sesiones completadas`
    }
  ];

  if (!client) return <SelectClientFirst onGoClients={() => undefined} />;

  const renderAssessmentSummaryCard = (group: AssessmentGroup) => {
    const latestEntry = group.entries[group.entries.length - 1];
    const previousEntry = group.entries[group.entries.length - 2] ?? null;
    const numericEntries = group.entries.filter((entry) => entry.parsedValue !== null);
    const bestEntry = numericEntries.length > 0
      ? numericEntries.reduce((best, entry) => {
          if (group.direction === "lower_is_better") return (entry.parsedValue ?? Infinity) < (best.parsedValue ?? Infinity) ? entry : best;
          return (entry.parsedValue ?? -Infinity) > (best.parsedValue ?? -Infinity) ? entry : best;
        }, numericEntries[0])
      : latestEntry;
    const reassessmentDate = reassessmentDates[group.key];
    const reassessmentState = getAssessmentReassessmentState(reassessmentDate);
    const changeLabel = getAssessmentChangeLabel(previousEntry?.parsedValue ?? null, latestEntry.parsedValue, group.unit);

    return (
      <article className="coach-subtle-card rounded-md p-3" key={group.key}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">{group.category}</p>
            <h4 className="mt-1 font-semibold text-ink">{group.name}</h4>
          </div>
          <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/55">
            {getAssessmentStatusLabel(group)}
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-ink/65 sm:grid-cols-2">
          <p>Último: <span className="font-semibold text-ink">{latestEntry.result}</span></p>
          <p>Mejor: <span className="font-semibold text-ink">{bestEntry.result}</span></p>
          <p>Cambio: <span className="font-semibold text-ink">{changeLabel}</span></p>
          <p>Fecha: <span className="font-semibold text-ink">{formatDisplayDate(latestEntry.date)}</span></p>
        </div>
        {reassessmentDate ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink/50">Próxima reevaluación: {formatDisplayDate(reassessmentDate)}</span>
            {reassessmentState.label ? <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${reassessmentState.tone}`}>{reassessmentState.label}</span> : null}
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <div className="mt-6 grid gap-5">
      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Progreso - {client.name}</h2>
            <p className="mt-1 text-sm text-ink/55">Resumen visual de evolución, adherencia y señales relevantes del deportista.</p>
          </div>
          <button
            className="h-10 rounded-md border border-line bg-panel px-3 text-sm font-semibold text-ink/70 transition hover:bg-white"
            onClick={() => onOpenAssessments(client.id)}
            type="button"
          >
            Ir a Valoraciones
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {progressStatusCards.map((card) => (
          <article className="coach-metric-card rounded-md p-4" key={card.label}>
            <p className="text-xs font-semibold uppercase text-ink/45">{card.label}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{card.status}</h3>
            <p className="mt-1 text-sm text-ink/55">{card.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="coach-surface rounded-md p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-ink">Cambios recientes</h3>
              <p className="mt-1 text-sm text-ink/55">Últimos cambios relevantes sin duplicar el detalle de Valoraciones.</p>
            </div>
            <button className="w-fit rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenAssessments(client.id)} type="button">
              Ver evolución completa
            </button>
          </div>
          {recentChanges.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {recentChanges.map((group) => {
                const latestEntry = group.entries[group.entries.length - 1];
                const previousEntry = group.entries[group.entries.length - 2] ?? null;
                return (
                  <article className="coach-subtle-card rounded-md p-3" key={group.key}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{group.name}</p>
                        <p className="mt-1 text-xs font-medium text-ink/45">{group.category} · {formatDisplayDate(latestEntry.date)}</p>
                      </div>
                      <span className="w-fit rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/60">
                        {getAssessmentStatusLabel(group)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/65">
                      Último: <span className="font-semibold text-ink">{latestEntry.result}</span>
                      {previousEntry ? <> · Cambio: <span className="font-semibold text-ink">{getAssessmentChangeLabel(previousEntry.parsedValue, latestEntry.parsedValue, group.unit)}</span></> : <> · Seguimiento inicial</>}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              Sin cambios recientes suficientes. Registra o marca valoraciones principales para ver evolución aquí.
            </p>
          )}
        </div>

        <div className="coach-surface rounded-md p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">Valoraciones principales</h3>
              <p className="mt-1 text-sm text-ink/55">Solo tests marcados como principales en Valoraciones.</p>
            </div>
            <button className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenAssessments(client.id)} type="button">
              Ir a Valoraciones
            </button>
          </div>
          {favoriteAssessmentGroups.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {favoriteAssessmentGroups.slice(0, 4).map(renderAssessmentSummaryCard)}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              Marca valoraciones principales para verlas aquí.
            </p>
          )}
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-2">
        <article className="coach-surface rounded-md p-4">
          <h3 className="font-semibold text-ink">Técnica</h3>
          <p className="mt-1 text-sm text-ink/55">Resumen de vídeos y revisiones técnicas recientes.</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Vídeos enviados</span>
              <span className="font-semibold text-ink">{techniqueVideos.length}</span>
            </p>
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Pendientes de revisar</span>
              <span className="font-semibold text-ink">{pendingTechniqueVideos.length}</span>
            </p>
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Referencias técnicas</span>
              <span className="font-semibold text-ink">{referenceTechniqueVideos.length}</span>
            </p>
          </div>
          {relevantTechniqueVideos.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {relevantTechniqueVideos.slice(0, 3).map((video) => (
                <p className="rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/65" key={video.id}>
                  <span className="font-semibold text-ink">{video.exerciseName}</span> · {getTechniqueVideoStatusLabel(video.review.status)}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-3 text-sm font-semibold text-ink/50">
              {techniqueVideos.length > 0 ? "Sin vídeos pendientes prioritarios." : "Sin vídeos técnicos recientes."}
            </p>
          )}
        </article>

        <article className="coach-surface rounded-md p-4">
          <h3 className="font-semibold text-ink">Adherencia y sesiones</h3>
          <p className="mt-1 text-sm text-ink/55">Lectura simple de sesiones registradas.</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Completadas</span>
              <span className="font-semibold text-ink">{completedSessions.length}/{plannedSessions}</span>
            </p>
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Adherencia</span>
              <span className="font-semibold text-ink">{adherence !== null ? `${adherence}%` : "Sin datos"}</span>
            </p>
            <p className="flex justify-between gap-3 rounded-md border border-line bg-panel/35 px-3 py-2">
              <span className="text-ink/55">Pendientes de revisar</span>
              <span className="font-semibold text-ink">{pendingReviewSessions.length}</span>
            </p>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-ink/65">
            <p>Última sesión: <span className="font-semibold text-ink">{latestCompletedSession ? formatDisplayDate(latestCompletedSession.date) : "Sin sesiones completadas"}</span></p>
            <p>Próxima sesión: <span className="font-semibold text-ink">{nextPlannedSession ? formatDisplayDate(nextPlannedSession.date) : "Sin sesión planificada"}</span></p>
          </div>
          <button className="mt-4 rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink/70" onClick={() => onOpenTraining(client.id)} type="button">
            Ir a Sesiones
          </button>
        </article>

        <article className="coach-surface rounded-md p-4 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">Señales a vigilar</h3>
              <p className="mt-1 text-sm text-ink/55">Lectura orientativa agrupada por tipo de seguimiento.</p>
            </div>
            {warningSignals.length > 0 ? (
              <span className="rounded-md border border-line bg-panel/60 px-2.5 py-1 text-xs font-semibold text-ink/55">
                {warningSignals.length} {warningSignals.length === 1 ? "señal" : "señales"}
              </span>
            ) : null}
          </div>
          {warningSignals.length > 0 ? (
            <div className="mt-4 grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
              {groupedWarningSignals.map((group) => (
                <section className="min-w-0 rounded-md border border-line bg-panel/25 p-3" key={group.category}>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-ink">{group.category}</h4>
                    <span className="rounded-md border border-line bg-white px-2 py-0.5 text-xs font-semibold text-ink/50">{group.signals.length}</span>
                  </div>
                  <div className="mt-2 grid gap-2">
                    {group.signals.map((signal, index) => (
                      <div className="rounded-md border border-line bg-white p-2.5" key={`${signal.type}-${signal.date}-${index}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-ink/55">{signal.type}</span>
                          <span className="text-xs font-semibold text-ink/40">{formatDisplayDate(signal.date)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink/65" title={signal.text}>{signal.text}</p>
                        <button className="mt-1.5 text-xs font-semibold text-moss" onClick={signal.onClick} type="button">
                          {signal.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              Sin señales relevantes con los datos actuales.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
function ClientWellnessView({
  client,
  onOpenTrainingSession,
  onUpdateClient
}: {
  client?: CoachClient | null;
  onOpenTrainingSession: (clientId: string, target?: TargetTrainingSession) => void;
  onUpdateClient: (client: CoachClient) => void;
}) {
  const [wellnessRange, setWellnessRange] = useState<7 | 14 | 28>(7);
  const [wellnessMetric, setWellnessMetric] = useState<"calm" | "energy" | "readiness" | "recovery" | "sleep">("readiness");
  const [showWellnessDetails, setShowWellnessDetails] = useState(false);
  const [showAllWellnessNotes, setShowAllWellnessNotes] = useState(false);
  const records = client?.sessionRecords ?? [];
  const wellnessRecords = records
    .filter((session) => session.wellness)
    .sort((a, b) => (getReviewSessionDate(b.date)?.getTime() ?? 0) - (getReviewSessionDate(a.date)?.getTime() ?? 0));
  const latestWellness = wellnessRecords[0]?.wellness;
  const discomfortRecords = records
    .filter((session) => session.discomfort?.hasDiscomfort || session.discomfort?.notes)
    .sort((left, right) => {
      const reviewOrder = Number(Boolean(left.discomfort?.reviewedAt)) - Number(Boolean(right.discomfort?.reviewedAt));
      if (reviewOrder !== 0) return reviewOrder;
      return (getReviewSessionDate(right.date)?.getTime() ?? 0) - (getReviewSessionDate(left.date)?.getTime() ?? 0);
    });
  const positiveWellnessValue = (wellness: ClientWellness | undefined, key: "calm" | "energy" | "motivation" | "recovery" | "sleep") => {
    if (!wellness) return 0;
    if (key === "energy") return wellness.energy ?? Math.max(1, 6 - wellness.fatigue);
    if (key === "recovery") return wellness.recovery ?? Math.max(1, 6 - wellness.soreness);
    if (key === "calm") return wellness.calm ?? Math.max(1, 6 - wellness.stress);
    return wellness[key] ?? 0;
  };
  const readinessScore = (wellness: ClientWellness | undefined) => {
    if (!wellness) return 0;
    const values = [
      positiveWellnessValue(wellness, "sleep"),
      positiveWellnessValue(wellness, "energy"),
      positiveWellnessValue(wellness, "recovery"),
      positiveWellnessValue(wellness, "calm"),
      positiveWellnessValue(wellness, "motivation")
    ].filter((value) => value > 0);
    if (values.length === 0) return 0;
    return values.reduce((total, value) => total + value, 0) / values.length;
  };
  const visibleWellnessRecords = wellnessRecords.slice(0, wellnessRange).reverse();
  const latestReadiness = readinessScore(latestWellness);
  const wellnessMetricOptions: Array<{ label: string; value: typeof wellnessMetric }> = [
    { label: "Readiness", value: "readiness" },
    { label: "Sueño", value: "sleep" },
    { label: "Energía", value: "energy" },
    { label: "Recuperación", value: "recovery" },
    { label: "Calma", value: "calm" }
  ];
  const getWellnessMetricScore = (wellness: ClientWellness | undefined) => {
    if (wellnessMetric === "readiness") return readinessScore(wellness);
    return positiveWellnessValue(wellness, wellnessMetric);
  };
  const wellnessChartPoints = visibleWellnessRecords.map((session, index) => {
    const score = getWellnessMetricScore(session.wellness);
    const x = visibleWellnessRecords.length <= 1 ? 52 : 10 + (index / (visibleWellnessRecords.length - 1)) * 86;
    const y = 88 - ((Math.max(1, Math.min(5, score)) - 1) / 4) * 78;
    return { date: session.date, score, x, y };
  });
  const wellnessCurvePath = wellnessChartPoints.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previousPoint = wellnessChartPoints[index - 1];
    const middleX = (previousPoint.x + point.x) / 2;
    return `${path} C ${middleX} ${previousPoint.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const detailWellness = latestWellness;
  const detailBars = detailWellness ? [
    ["Sueño", positiveWellnessValue(detailWellness, "sleep")],
    ["Energía", positiveWellnessValue(detailWellness, "energy")],
    ["Recuperación", positiveWellnessValue(detailWellness, "recovery")],
    ["Calma / ánimo", positiveWellnessValue(detailWellness, "calm")],
    ["Motivación", positiveWellnessValue(detailWellness, "motivation")]
  ] : [];

  function markDiscomfortReviewed(session: ClientSessionRecord) {
    if (!client || session.discomfort?.reviewedAt) return;
    const recordIndex = records.indexOf(session);
    if (recordIndex < 0) return;

    onUpdateClient({
      ...client,
      sessionRecords: records.map((record, index) => index === recordIndex
        ? {
            ...record,
            discomfort: record.discomfort
              ? { ...record.discomfort, reviewedAt: new Date().toISOString() }
              : record.discomfort
          }
        : record)
    });
  }

  function openDiscomfortSession(session: ClientSessionRecord) {
    if (!client || !session.id) return;
    onOpenTrainingSession(client.id, { clientId: client.id, sessionDate: session.date, sessionId: session.id });
  }

  function renderWellnessNote(session: ClientSessionRecord, compact = false) {
    const reviewed = Boolean(session.discomfort?.reviewedAt);
    return (
      <article
        className={`rounded-md border p-3 transition ${reviewed ? "border-line bg-panel/25 opacity-70" : "border-clay/35 bg-clay/5"}`}
        key={session.id ?? `${session.date}-${session.summary}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`size-1.5 rounded-full ${reviewed ? "bg-steel" : "bg-clay"}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Molestia</span>
          </div>
          <span className="text-xs font-semibold text-ink/45">{formatDisplayDate(session.date)}</span>
        </div>
        <p className={`mt-2 text-sm leading-relaxed text-ink/65 ${compact ? "line-clamp-2" : ""}`}>
          {session.discomfort?.notes || "Molestia registrada sin notas."}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {session.id ? (
            <button
              className="rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-ink/65 transition hover:bg-mint"
              onClick={() => openDiscomfortSession(session)}
              type="button"
            >
              Ver sesión
            </button>
          ) : null}
          {reviewed ? (
            <span className="text-xs font-semibold text-ink/45">✓ Revisada</span>
          ) : (
            <button
              aria-label="Marcar molestia como revisada"
              className="rounded-md border border-moss/30 bg-mint px-2.5 py-1.5 text-xs font-semibold text-moss transition hover:border-moss/50"
              onClick={() => markDiscomfortReviewed(session)}
              title="Marcar como revisada"
              type="button"
            >
              ✓ Marcar como revisada
            </button>
          )}
        </div>
      </article>
    );
  }

  if (!client) return <SelectClientFirst onGoClients={() => undefined} />;

  return (
    <div className="mt-6 grid gap-5">
      <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="highlight-summary-card min-h-64 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Último readiness</p>
            {latestReadiness > 0 ? (
              <>
                <p className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">{latestReadiness.toFixed(1)}<span className="ml-1 text-2xl font-medium text-white/45">/5</span></p>
                <p className="mt-3 text-sm font-medium text-white/70">Lectura orientativa del último registro disponible.</p>
                <p className="mt-1 text-xs text-white/45">{wellnessRecords[0]?.date ? formatDisplayDate(wellnessRecords[0].date) : "Sin fecha disponible"}</p>
              </>
            ) : (
              <>
                <p className="mt-3 text-2xl font-semibold">Sin datos todavía</p>
                <p className="mt-2 text-sm text-white/60">Añade registros para consultar la evolución.</p>
              </>
            )}
          </div>
          <div className="coach-surface min-h-64 rounded-md p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-ink">Notas y molestias recientes</h2>
                <p className="mt-1 text-sm text-ink/55">Pendientes primero; las revisadas se mantienen al final.</p>
              </div>
              <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/50">{discomfortRecords.length}</span>
            </div>
            {discomfortRecords.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {discomfortRecords.slice(0, 4).map((session) => renderWellnessNote(session, true))}
                {discomfortRecords.length > 4 ? (
                  <button className="w-fit text-xs font-semibold text-moss" onClick={() => setShowAllWellnessNotes(true)} type="button">
                    Ver todas ({discomfortRecords.length})
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-ink/45">Sin notas o molestias recientes.</p>
            )}
          </div>
      </section>

      <section className="coach-surface min-w-0 rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Evolución diaria del bienestar</h3>
            <p className="mt-1 text-sm text-ink/55">Lectura visual de readiness, sueño, energía, recuperación y calma.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink transition hover:bg-mint"
              onClick={() => setShowWellnessDetails(true)}
              type="button"
            >
              Ver detalles
            </button>
            <div className="flex w-fit rounded-md border border-line bg-panel/35 p-1">
              {[7, 14, 28].map((range) => (
                <button
                  className={`rounded px-3 py-1 text-xs font-semibold transition ${wellnessRange === range ? "bg-ink text-white" : "text-ink/60 hover:bg-white"}`}
                  key={range}
                  onClick={() => setWellnessRange(range as 7 | 14 | 28)}
                  type="button"
                >
                  {range} días
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {wellnessMetricOptions.map((option) => (
            <button
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${wellnessMetric === option.value ? "border-moss bg-mint text-moss" : "border-line bg-panel/45 text-ink/60 hover:bg-panel"}`}
              key={option.value}
              onClick={() => setWellnessMetric(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {visibleWellnessRecords.length > 0 ? (
          <div className="mt-5 grid min-w-0 gap-4">
            <div className="min-w-0 overflow-hidden rounded-md border border-line bg-panel/35 p-3 sm:p-4">
              <svg aria-label={`Evolución temporal de ${wellnessMetricOptions.find((option) => option.value === wellnessMetric)?.label ?? "bienestar"}, escala de 1 a 5`} className="h-64 w-full overflow-visible sm:h-72" preserveAspectRatio="none" viewBox="0 0 100 100">
                {[5, 4, 3, 2, 1].map((value) => {
                  const y = 88 - ((value - 1) / 4) * 78;
                  return (
                    <g key={value}>
                      <line className="stroke-line" strokeWidth="0.4" x1="9" x2="98" y1={y} y2={y} />
                      <text className="fill-ink/50 text-[4px] font-semibold" textAnchor="end" x="6.5" y={y + 1.4}>{value}</text>
                    </g>
                  );
                })}
                {wellnessChartPoints.length > 1 ? (
                  <path className="stroke-moss" d={wellnessCurvePath} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                ) : null}
                {wellnessChartPoints.map((point, index) => (
                  <g key={`${point.date}-${index}`}>
                    <circle className="fill-panel stroke-moss" cx={point.x} cy={point.y} r="2" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
                      <title>{`${wellnessMetricOptions.find((option) => option.value === wellnessMetric)?.label ?? "Bienestar"} · ${formatDisplayDate(point.date)} · ${point.score.toFixed(1)}/5`}</title>
                    </circle>
                  </g>
                ))}
              </svg>
              <div className="mt-2 flex min-w-0 justify-between gap-2 text-[10px] font-semibold text-ink/45">
                {visibleWellnessRecords.map((session, index) => (
                  <span className="min-w-0 truncate" key={`${session.date}-${index}`}>{formatDisplayDate(session.date)}</span>
                ))}
              </div>
            </div>
            <p className="text-xs font-semibold text-ink/50">
              {latestReadiness > 0 && wellnessRecords[0]?.date
                ? `Último readiness registrado: ${latestReadiness.toFixed(1)}/5 · ${formatDisplayDate(wellnessRecords[0].date)}`
                : "Sin un último readiness registrado."}
            </p>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Sueño", positiveWellnessValue(latestWellness, "sleep")],
                ["Energía", positiveWellnessValue(latestWellness, "energy")],
                ["Recuperación", positiveWellnessValue(latestWellness, "recovery")],
                ["Calma", positiveWellnessValue(latestWellness, "calm")]
              ].map(([label, value]) => (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{label}</p>
                    <span className="text-sm font-semibold text-ink/70">{Number(value) > 0 ? `${value}/5` : "Sin datos"}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-steel" style={{ width: `${Math.min(100, (Number(value) / 5) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-ink/50">Aún no hay suficientes registros para mostrar la evolución.</p>
        )}
      </section>

      <MenstrualCoachContextCard client={client} />

      {showAllWellnessNotes ? (
        <div className="assessment-modal-overlay" onClick={() => setShowAllWellnessNotes(false)} role="presentation">
          <section
            aria-label="Todas las notas y molestias recientes"
            aria-modal="true"
            className="assessment-modal-panel max-h-[88vh] max-w-3xl overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Notas y molestias</h3>
                <p className="mt-1 text-sm text-ink/55">Pendientes de revisar primero; las revisadas permanecen disponibles.</p>
              </div>
              <button
                aria-label="Cerrar notas y molestias"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-ink/70 transition hover:bg-mint"
                onClick={() => setShowAllWellnessNotes(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </header>
            <div className="assessment-modal-body grid gap-3 px-5 py-5">
              {discomfortRecords.map((session) => renderWellnessNote(session))}
            </div>
          </section>
        </div>
      ) : null}

      {showWellnessDetails ? (
        <div className="assessment-modal-overlay" onClick={() => setShowWellnessDetails(false)} role="presentation">
          <section
            aria-modal="true"
            className="assessment-modal-panel max-h-[88vh] max-w-3xl overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Detalle de bienestar</h3>
                <p className="mt-1 text-sm text-ink/55">Desglose del último registro disponible.</p>
              </div>
              <button
                aria-label="Cerrar detalle de bienestar"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-ink/70 transition hover:bg-mint"
                onClick={() => setShowWellnessDetails(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </header>
            <div className="assessment-modal-body grid gap-3 px-5 py-5">
              {detailBars.length > 0 ? detailBars.map(([label, value]) => (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{label}</p>
                    <span className="text-sm font-semibold text-ink/70">{Number(value) > 0 ? `${value}/5` : "Sin datos"}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-moss" style={{ width: `${Math.min(100, (Number(value) / 5) * 100)}%` }} />
                  </div>
                </div>
              )) : (
                <p className="rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
                  Sin registros de bienestar todavía.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
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

      <section className="coach-surface rounded-md p-4">
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
    <section className="coach-surface mt-4 rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Carga semanal</h2>
        </div>
        <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
          Últimas 6 semanas
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
          label="Carga externa sesión"
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
          <h3 className="font-semibold text-ink">Carga externa de la sesión por patron</h3>
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
                Sin datos de ejercicios para esta sesión.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h3 className="font-semibold text-ink">Series efectivas de la sesión</h3>
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
                Sin datos de ejercicios para esta sesión.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

type PlanningEventType = "Competicion" | "Test" | "Pico de forma" | "Control / seguimiento" | "Otro" | "Sin evento definido";
type PlanningPrescriptionRole = "principal" | "secondary" | "accessory";
type PlanningPrescriptionDefault = {
  effortScale?: PlanningEffortScale;
  repsMax: string;
  repsMin: string;
  rpeMax?: string;
  rpeMin?: string;
  restMaxSeconds: string;
  restMinSeconds: string;
  rirMax: string;
  rirMin: string;
  seriesReferenceMax?: string;
  seriesReferenceMin?: string;
  sets: string;
};
type PlanningWeeklyTemplateDay = {
  dayIndex: number;
  notes: string;
  sessionGoal?: string;
  sessionGoalId?: PlanningSessionGoalId;
  sessionGoalOther?: string;
  sessionName: string;
  sessionType: string;
  sessionTypeId?: PlanningSessionTypeId;
  sessionTypeOther?: string;
};
type PlanningExerciseSlot = {
  dayIndex: number;
  exerciseByBlock: Record<string, string | null>;
  id: string;
  order: number;
  role: PlanningPrescriptionRole;
};

type PlanningSessionCreationTarget = {
  day: PlanningWeeklyTemplateDay;
  weekNumber: number;
};
type EditablePlanningBlock = {
  durationWeeks: number;
  phaseId?: PlanningPhaseId;
  phaseOther?: string;
  id: string;
  mainMetrics: string[];
  name: string;
  notes: string;
  primaryObjective: string;
  primaryGoalId?: PlanningGoalId;
  primaryGoalOther?: string;
  secondaryObjective: string;
  secondaryGoalIds?: PlanningGoalId[];
  secondaryGoalOther?: string;
  weeklyDistribution: WeeklyDistribution;
  prescriptionDefaults?: Partial<Record<PlanningPrescriptionRole, PlanningPrescriptionDefault>>;
  weeklyTemplate?: PlanningWeeklyTemplateDay[];
};
type PlanningRoadmapBlock = EditablePlanningBlock & { endWeek: number; startWeek: number };

const planningEventTypes: PlanningEventType[] = [
  "Competicion",
  "Test",
  "Pico de forma",
  "Control / seguimiento",
  "Otro",
  "Sin evento definido"
];

const planningWeeklyDistributionOptions = [
  "Lineal",
  "Ondulante",
  "Concentrada",
  "Alterna",
  "Técnica / baja carga",
  "Personalizada"
];

const planningPrescriptionRoles: Array<{ id: PlanningPrescriptionRole; label: string }> = [
  { id: "principal", label: "Principal" },
  { id: "secondary", label: "Auxiliar" },
  { id: "accessory", label: "Accesorio" }
];

function createEmptyPrescriptionDefault(): PlanningPrescriptionDefault {
  return {
    effortScale: "rir",
    repsMax: "",
    repsMin: "",
    restMaxSeconds: "",
    restMinSeconds: "",
    rirMax: "",
    rirMin: "",
    sets: ""
  };
}

function getBlockPrescriptionDefault(block: EditablePlanningBlock | undefined, role: PlanningPrescriptionRole) {
  return block?.prescriptionDefaults?.[role] ?? createEmptyPrescriptionDefault();
}

function getPrescriptionRange(minimum: string, maximum: string) {
  if (minimum && maximum && minimum !== maximum) return `${minimum}-${maximum}`;
  return minimum || maximum;
}

function getPrescriptionDefaultSummary(defaults: PlanningPrescriptionDefault) {
  const volume = [defaults.sets, getPrescriptionRange(defaults.repsMin, defaults.repsMax)].filter(Boolean).join("×");
  const effortScale = defaults.effortScale ?? "rir";
  const effort = effortScale === "rpe"
    ? getPrescriptionRange(defaults.rpeMin ?? "", defaults.rpeMax ?? "")
    : getPrescriptionRange(defaults.rirMin, defaults.rirMax);
  const rest = getPrescriptionRange(defaults.restMinSeconds, defaults.restMaxSeconds);
  return [volume, effort ? `${effortScale.toUpperCase()} ${effort}` : "", rest ? `${rest} s` : ""].filter(Boolean).join(" · ") || "Sin definir";
}

function isPrescriptionDefaultEmpty(defaults: PlanningPrescriptionDefault) {
  return !defaults.sets && !defaults.repsMin && !defaults.repsMax && !defaults.rirMin && !defaults.rirMax
    && !defaults.rpeMin && !defaults.rpeMax && !defaults.restMinSeconds && !defaults.restMaxSeconds;
}

function getPrescriptionFromPreset(role: PlanningPrescriptionRole, block: EditablePlanningBlock): PlanningPrescriptionDefault | null {
  const preset = getPrescriptionPreset(block.phaseId, getBlockPrimaryGoalId(block));
  if (!preset) return null;
  const rolePreset = preset.roles[role];
  return {
    ...createEmptyPrescriptionDefault(),
    effortScale: rolePreset.effortScale ?? "rir",
    repsMin: rolePreset.repsMin,
    repsMax: rolePreset.repsMax,
    restMinSeconds: rolePreset.restMinSeconds,
    restMaxSeconds: rolePreset.restMaxSeconds,
    rirMin: rolePreset.effortScale === "rir" ? rolePreset.effortMin ?? "" : "",
    rirMax: rolePreset.effortScale === "rir" ? rolePreset.effortMax ?? "" : "",
    rpeMin: rolePreset.effortScale === "rpe" ? rolePreset.effortMin ?? "" : "",
    rpeMax: rolePreset.effortScale === "rpe" ? rolePreset.effortMax ?? "" : "",
    seriesReferenceMin: rolePreset.seriesReferenceMin,
    seriesReferenceMax: rolePreset.seriesReferenceMax
  };
}

function getBlockPhaseLabel(block: EditablePlanningBlock) {
  if (block.phaseId === "other") return block.phaseOther?.trim() || "Otro";
  return getPlanningPhase(block.phaseId)?.label ?? "Sin fase";
}

function getBlockPrimaryGoalId(block: EditablePlanningBlock) {
  return block.primaryGoalId ?? getPlanningGoal(block.primaryObjective)?.id;
}

function getBlockPrimaryGoalLabel(block: EditablePlanningBlock) {
  const goalId = getBlockPrimaryGoalId(block);
  if (goalId === "other") return block.primaryGoalOther?.trim() || block.primaryObjective || "Otro";
  return getPlanningGoal(goalId)?.label ?? (block.primaryObjective || "Sin definir");
}

function getBlockSecondaryGoalIds(block: EditablePlanningBlock) {
  if (block.secondaryGoalIds) return block.secondaryGoalIds;
  const legacyGoal = getPlanningGoal(block.secondaryObjective)?.id;
  return legacyGoal ? [legacyGoal] : [];
}

function getBlockSecondaryGoalLabels(block: EditablePlanningBlock) {
  const goalIds = getBlockSecondaryGoalIds(block);
  if (goalIds.length === 0) return block.secondaryObjective ? [block.secondaryObjective] : [];
  return goalIds.map((goalId) => goalId === "other"
    ? block.secondaryGoalOther?.trim() || "Otro"
    : getPlanningGoal(goalId)?.label ?? goalId);
}

function getPlanningDaySessionTypeId(day?: PlanningWeeklyTemplateDay) {
  return day?.sessionTypeId ?? getPlanningSessionType(day?.sessionType)?.id;
}

function getPlanningDaySessionTypeLabel(day?: PlanningWeeklyTemplateDay) {
  const typeId = getPlanningDaySessionTypeId(day);
  if (typeId === "other") return day?.sessionTypeOther?.trim() || day?.sessionType || "Otro";
  return getPlanningSessionType(typeId)?.label || day?.sessionType || "Sin tipo";
}

function getPlanningDaySessionGoalLabel(day?: PlanningWeeklyTemplateDay) {
  const typeId = getPlanningDaySessionTypeId(day);
  if (day?.sessionGoalId === "other") return day.sessionGoalOther?.trim() || day.sessionGoal || "Otro";
  return getPlanningSessionGoal(typeId, day?.sessionGoalId ?? day?.sessionGoal)?.label || day?.sessionGoal || "Sin objetivo";
}

function createPlanningBlockDraft(index: number): EditablePlanningBlock {
  return {
    durationWeeks: 4,
    id: "",
    mainMetrics: [],
    name: `Mesociclo ${index + 1}`,
    notes: "",
    primaryObjective: "",
    secondaryObjective: "",
    weeklyDistribution: "Lineal",
    prescriptionDefaults: {
      accessory: createEmptyPrescriptionDefault(),
      principal: createEmptyPrescriptionDefault(),
      secondary: createEmptyPrescriptionDefault()
    },
    weeklyTemplate: []
  };
}

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

  const header = ["Bloque", "Duración", "Objetivo principal", "Objetivo secundario", "Distribución semanal", "Notas"];
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

const planningWeekdayLabels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
type PlanningSessionKind = "strength" | "resistance" | "concurrent" | "activeRecovery" | "test" | "other";

type PlanningCalendarSession = {
  date: Date;
  session: ReviewSessionRecord;
  sessionIndex: number;
};

type PlanningCalendarWeek = {
  endDate: Date;
  sessions: PlanningCalendarSession[];
  startDate: Date;
  weekNumber: number;
  counts: Record<PlanningSessionKind, number>;
  total: number;
  trainingSessions: PlanningCalendarSession[];
};

function getPlanningDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addPlanningDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function getPlanningTemplateSessionDate(startDate: string | undefined, weekNumber: number, dayIndex: number) {
  const parsedStartDate = parsePlanningDate(startDate ?? "");
  if (!parsedStartDate) return "";
  return getPlanningDateKey(addPlanningDays(parsedStartDate, (weekNumber - 1) * 7 + dayIndex));
}

function getPlanningExerciseSection(role: PlanningPrescriptionRole): StrengthSessionBlock {
  return role === "accessory" ? "auxiliary" : "main";
}

function getPlanningWeekStart(date: Date) {
  const weekStart = new Date(date);
  const day = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function parsePlanningSessionDate(value?: string | null) {
  if (!value) return null;
  const isoMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const parsed = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const slashMatch = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!slashMatch) return null;
  const parsed = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPlanningWeekIndex(date: Date, firstWeekStart: Date) {
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((getPlanningWeekStart(date).getTime() - firstWeekStart.getTime()) / dayMs / 7));
}

function getPlanningSessionKind(session: ReviewSessionRecord): PlanningSessionKind {
  const label = `${session.type ?? ""} ${session.summary ?? ""}`.toLowerCase();
  if (label.includes("test")) return "test";
  if (label.includes("concurrent") || label.includes("mixt")) return "concurrent";
  if (label.includes("descanso") || label.includes("recovery") || label.includes("recuperaci")) return "activeRecovery";
  if (label.includes("resistencia") || label.includes("cardio") || label.includes("z2") || label.includes("series")) return "resistance";
  if (label.includes("fuerza") || label.includes("strength")) return "strength";
  return "other";
}

function getPlanningSessionKindLabel(kind: PlanningSessionKind) {
  const labels: Record<PlanningSessionKind, string> = {
    activeRecovery: "Descanso activo",
    concurrent: "Concurrente",
    other: "Otro",
    resistance: "Resistencia",
    strength: "Fuerza",
    test: "Test"
  };
  return labels[kind];
}

function getPlanningSessionKindClass(kind: PlanningSessionKind) {
  const classes: Record<PlanningSessionKind, string> = {
    activeRecovery: "border-moss/25 bg-mint text-moss",
    concurrent: "border-clay/25 bg-wheat text-clay",
    other: "border-line bg-panel text-ink/60",
    resistance: "border-steel/25 bg-sky text-steel",
    strength: "border-indigo-300/50 bg-indigo-100 text-indigo-800",
    test: "border-violet/40 bg-violet/20 text-ink"
  };
  return classes[kind];
}

function getPlanningSessionMetricLabel(session: ReviewSessionRecord) {
  const duration = session.cardioPlan?.targetDurationMinutes ?? session.actualDurationMinutes ?? session.duration;
  if (hasDisplayValue(duration)) return `${duration} min`;
  if (hasDisplayValue(session.targetRpe)) return `RPE ${session.targetRpe}`;
  if (hasDisplayValue(session.finalRpe ?? session.rpe)) return `RPE ${session.finalRpe ?? session.rpe}`;
  return "";
}

function PlanningView({
  client,
  onDeleteSession,
  onDuplicateSession,
  onOpenAssessments,
  onOpenTrainingDraft,
  onUpdateClient
}: {
  client?: CoachClient | null;
  onDeleteSession?: (clientId: string, sessionIndex: number) => { ok: boolean; message: string };
  onDuplicateSession?: (clientId: string, sessionIndex: number, newDate: string, newTime?: string) => void;
  onOpenAssessments?: (clientId: string) => void;
  onOpenTrainingDraft?: (target: TargetTrainingSession) => void;
  onUpdateClient: (updatedClient: CoachClient) => void;
}) {
  const [planningEventType, setPlanningEventType] = useState<PlanningEventType>(
    client?.planning.eventDate || client?.planning.eventName ? "Competicion" : "Sin evento definido"
  );
  const [planningPeakDate, setPlanningPeakDate] = useState(client?.planning.eventDate ?? "");
  const [planningEventName, setPlanningEventName] = useState(client?.planning.eventName ?? "");
  const [planningMethod, setPlanningMethod] = useState<PlanningMethod>(client?.planning.method || "blocks");
  const [planningBlocks, setPlanningBlocks] = useState<EditablePlanningBlock[]>(client?.planning.blocks ?? []);
  const [newPlanningBlock, setNewPlanningBlock] = useState<EditablePlanningBlock>(() => createPlanningBlockDraft(client?.planning.blocks?.length ?? 0));
  const [selectedPlanningBlockId, setSelectedPlanningBlockId] = useState<string | null>(null);
  const [showPlanningGlobalReview, setShowPlanningGlobalReview] = useState(false);
  const [planningActionMessage, setPlanningActionMessage] = useState("");
  const [showAdvancedPlanning, setShowAdvancedPlanning] = useState(false);
  const [planningWizardStep, setPlanningWizardStep] = useState(0);
  const [planningPlanName, setPlanningPlanName] = useState(client?.planning.planName ?? "");
  const [planningStartDate, setPlanningStartDate] = useState(client?.planning.startDate ?? "");
  const [planningPrimaryObjective, setPlanningPrimaryObjective] = useState(client?.planning.primaryObjective ?? "");
  const [planningSecondaryObjective, setPlanningSecondaryObjective] = useState(client?.planning.secondaryObjective ?? "");
  const [planningWeeklyFrequency, setPlanningWeeklyFrequency] = useState(client?.planning.weeklyFrequency ?? 3);
  const [planningExerciseSlots, setPlanningExerciseSlots] = useState<PlanningExerciseSlot[]>(client?.planning.exerciseSlots ?? []);
  const [pendingPlanningDurationChange, setPendingPlanningDurationChange] = useState<{
    blockId: string;
    direction: -1 | 1;
  } | null>(null);
  const [copiedPlanningWeek, setCopiedPlanningWeek] = useState<{
    sessions: Array<{ dayOffset: number; sessionIndex: number; time?: string | null }>;
    sourceWeekNumber: number;
  } | null>(null);
  const planningWeeks = getPlanningWeeks(planningPeakDate, planningEventType);
  const totalWeeks = planningBlocks.reduce((total, block) => total + block.durationWeeks, 0);
  const roadmapBlocks = planningBlocks.reduce<PlanningRoadmapBlock[]>((items, block) => {
    const startWeek = items.length > 0 ? items[items.length - 1].endWeek + 1 : 1;
    const endWeek = startWeek + block.durationWeeks - 1;
    return [...items, { ...block, endWeek, startWeek }];
  }, []);
  const currentPlanningBlockId = client?.planning.blocks?.find((block) => block.name === client.planning.currentBlock)?.id;
  const currentRoadmapBlockIndex = roadmapBlocks.findIndex((block) => block.id === currentPlanningBlockId || block.name === client?.planning.currentBlock);
  const selectedPlanningBlock =
    selectedPlanningBlockId ? roadmapBlocks.find((block) => block.id === selectedPlanningBlockId) ?? null : null;
  const selectedPlan = {
    blocks: planningBlocks,
    clientName: client?.name ?? "",
    planningMethod,
    planningEventName,
    planningPeakDate,
    planningEventType,
    planningWeeks
  };
  const datedPlanningSessions = (client?.sessionRecords ?? [])
    .map((session, sessionIndex) => ({
      date: parsePlanningSessionDate(session.date),
      session: session as ReviewSessionRecord,
      sessionIndex
    }))
    .filter((item): item is { date: Date; session: ReviewSessionRecord; sessionIndex: number } => Boolean(item.date));
  const firstSessionWeekStart = datedPlanningSessions.length > 0
    ? getPlanningWeekStart(new Date(Math.min(...datedPlanningSessions.map((item) => item.date.getTime()))))
    : getPlanningWeekStart(new Date());
  const latestSessionWeekIndex = datedPlanningSessions.reduce(
    (latest, item) => Math.max(latest, getPlanningWeekIndex(item.date, firstSessionWeekStart)),
    0
  );
  const basePlanningWeekCount = Math.max(totalWeeks, datedPlanningSessions.length > 0 ? latestSessionWeekIndex + 1 : 4);
  const visualPlanningWeekCount = basePlanningWeekCount;
  const planningWeekRows = Array.from({ length: visualPlanningWeekCount }, (_, weekIndex) => {
    const startDate = addPlanningDays(firstSessionWeekStart, weekIndex * 7);
    const sessions = datedPlanningSessions.filter((item) => getPlanningWeekIndex(item.date, firstSessionWeekStart) === weekIndex);
    return { endDate: addPlanningDays(startDate, 6), sessions, startDate, weekNumber: weekIndex + 1 };
  });
  const trainingPlanningKinds: PlanningSessionKind[] = ["strength", "resistance", "concurrent", "activeRecovery"];
  const currentPlanningWeekNumber =
    planningWeekRows.find((week) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today >= week.startDate && today <= week.endDate;
    })?.weekNumber ?? null;
  const planningDistribution = planningWeekRows.map((week) => {
    const trainingSessions = week.sessions.filter((item) => trainingPlanningKinds.includes(getPlanningSessionKind(item.session)));
    const counts = trainingSessions.reduce<Record<PlanningSessionKind, number>>((current, item) => {
      const kind = getPlanningSessionKind(item.session);
      return { ...current, [kind]: current[kind] + 1 };
    }, { activeRecovery: 0, concurrent: 0, other: 0, resistance: 0, strength: 0, test: 0 });

    return { ...week, counts, total: trainingSessions.length, trainingSessions };
  });
  const maxWeeklySessions = Math.max(1, ...planningDistribution.map((week) => week.total));
  const hasPlanningDistributionData = planningDistribution.some((week) => week.total > 0);
  const planningAssessmentGroups = buildAssessmentGroups((client?.assessments ?? []) as AssessmentEntry[]);
  const planningFavoriteGroups = planningAssessmentGroups.filter((group) => client?.assessmentPreferences?.favoriteTests?.includes(group.key));
  const planningReassessmentDates = client?.assessmentPreferences?.reassessmentDates ?? {};
  const planningReferenceCount =
    planningFavoriteGroups.length +
    Object.keys(planningReassessmentDates).length +
    (planningEventName || client?.nextEvent || planningPeakDate ? 1 : 0);

  useEffect(() => {
    setPlanningBlocks(client?.planning.blocks ?? []);
    setPlanningEventName(client?.planning.eventName ?? "");
    setPlanningPeakDate(client?.planning.eventDate ?? "");
    setPlanningEventType(client?.planning.eventDate || client?.planning.eventName ? "Competicion" : "Sin evento definido");
    setPlanningMethod(client?.planning.method || "blocks");
    setPlanningPlanName(client?.planning.planName ?? "");
    setPlanningStartDate(client?.planning.startDate ?? "");
    setPlanningPrimaryObjective(client?.planning.primaryObjective ?? "");
    setPlanningSecondaryObjective(client?.planning.secondaryObjective ?? "");
    setPlanningWeeklyFrequency(client?.planning.weeklyFrequency ?? 3);
    setPlanningExerciseSlots(client?.planning.exerciseSlots ?? []);
    setPlanningWizardStep(0);
    setNewPlanningBlock(createPlanningBlockDraft(client?.planning.blocks?.length ?? 0));
    setSelectedPlanningBlockId(null);
    setShowPlanningGlobalReview(false);
    setPlanningActionMessage("");
    setShowAdvancedPlanning(false);
    setPendingPlanningDurationChange(null);
    setCopiedPlanningWeek(null);
  }, [client?.id, client?.planning.blocks, client?.planning.eventDate, client?.planning.eventName, client?.planning.exerciseSlots, client?.planning.method, client?.planning.planName, client?.planning.primaryObjective, client?.planning.secondaryObjective, client?.planning.startDate, client?.planning.weeklyFrequency]);

  function openPlanningWizard() {
    setPlanningWizardStep(0);
    setShowAdvancedPlanning(true);
  }

  function updatePlanningBlockDraft(blockId: string, updates: Partial<EditablePlanningBlock>) {
    setPlanningBlocks((blocks) => blocks.map((block) => block.id === blockId ? { ...block, ...updates } : block));
  }

  function updateBlockWeeklyDay(blockId: string, dayIndex: number, updates: Partial<PlanningWeeklyTemplateDay>) {
    setPlanningBlocks((blocks) => blocks.map((block) => {
      if (block.id !== blockId) return block;
      const currentDays = block.weeklyTemplate ?? [];
      const currentDay = currentDays.find((day) => day.dayIndex === dayIndex);
      const nextDays = currentDay
        ? currentDays.map((day) => day.dayIndex === dayIndex ? { ...day, ...updates } : day)
        : [...currentDays, { dayIndex, notes: "", sessionGoal: "", sessionName: "", sessionType: "", ...updates }];
      return { ...block, weeklyTemplate: nextDays.filter((day) => day.sessionName.trim() || day.sessionType.trim() || day.sessionGoal?.trim() || day.notes.trim()) };
    }));
  }

  function updateBlockPrescriptionDefault(blockId: string, role: PlanningPrescriptionRole, updates: Partial<PlanningPrescriptionDefault>) {
    setPlanningBlocks((blocks) => blocks.map((block) => block.id === blockId ? {
      ...block,
      prescriptionDefaults: {
        ...block.prescriptionDefaults,
        [role]: { ...getBlockPrescriptionDefault(block, role), ...updates }
      }
    } : block));
  }

  function copyBlockConfiguration(sourceIndex: number, targetIndex: number, mode: "week" | "prescription") {
    const source = planningBlocks[sourceIndex];
    const target = planningBlocks[targetIndex];
    if (!source || !target) return;
    updatePlanningBlockDraft(target.id, mode === "week"
      ? { weeklyTemplate: (source.weeklyTemplate ?? []).map((day) => ({ ...day })) }
      : { prescriptionDefaults: Object.fromEntries(Object.entries(source.prescriptionDefaults ?? {}).map(([role, defaults]) => [role, { ...defaults }])) }
    );
  }

  function addPlanningExerciseSlot(dayIndex: number, role: PlanningPrescriptionRole) {
    const nextOrder = planningExerciseSlots
      .filter((slot) => slot.dayIndex === dayIndex && slot.role === role)
      .reduce((highestOrder, slot) => Math.max(highestOrder, slot.order + 1), 0);
    setPlanningExerciseSlots((slots) => [...slots, {
      dayIndex,
      exerciseByBlock: {},
      id: `exercise-slot-${Date.now()}-${dayIndex}-${role}`,
      order: nextOrder,
      role
    }]);
  }

  function updatePlanningExerciseSlot(slotId: string, blockId: string, exerciseId: string | null) {
    setPlanningExerciseSlots((slots) => slots.map((slot) => slot.id === slotId ? {
      ...slot,
      exerciseByBlock: { ...slot.exerciseByBlock, [blockId]: exerciseId }
    } : slot));
  }

  function copyPlanningExerciseForward(slotId: string, sourceBlockIndex: number) {
    setPlanningExerciseSlots((slots) => slots.map((slot) => {
      if (slot.id !== slotId) return slot;
      const sourceBlock = planningBlocks[sourceBlockIndex];
      const exerciseId = sourceBlock ? slot.exerciseByBlock[sourceBlock.id] ?? null : null;
      const exerciseByBlock = { ...slot.exerciseByBlock };
      planningBlocks.slice(sourceBlockIndex + 1).forEach((block) => { exerciseByBlock[block.id] = exerciseId; });
      return { ...slot, exerciseByBlock };
    }));
  }

  function copyPlanningExercisesFromBlock(sourceBlockIndex: number, targetBlockIndex: number) {
    const sourceBlock = planningBlocks[sourceBlockIndex];
    const targetBlock = planningBlocks[targetBlockIndex];
    if (!sourceBlock || !targetBlock) return;
    setPlanningExerciseSlots((slots) => slots.map((slot) => ({
      ...slot,
      exerciseByBlock: {
        ...slot.exerciseByBlock,
        [targetBlock.id]: slot.exerciseByBlock[sourceBlock.id] ?? null
      }
    })));
  }

  function deletePlanningExerciseSlot(slotId: string) {
    const slot = planningExerciseSlots.find((candidate) => candidate.id === slotId);
    if (!slot) return;
    const hasConfiguredExercises = Object.values(slot.exerciseByBlock).some(Boolean);
    if (hasConfiguredExercises && !window.confirm("¿Eliminar este slot de la planificación? Las sesiones reales existentes no se modificarán.")) return;
    setPlanningExerciseSlots((slots) => slots.filter((candidate) => candidate.id !== slotId));
  }

  function savePlanningWizard() {
    if (!client) return;
    const activeExerciseDayIndexes = new Set(planningBlocks.flatMap((block) =>
      (block.weeklyTemplate ?? []).filter((day) => day.sessionName.trim()).map((day) => day.dayIndex)
    ));
    const previousBlocks = client.planning.blocks ?? [];
    const changedDefaults = planningBlocks.filter((block) => {
      const previous = previousBlocks.find((candidate) => candidate.id === block.id);
      return previous && JSON.stringify(previous.prescriptionDefaults ?? {}) !== JSON.stringify(block.prescriptionDefaults ?? {});
    });
    const inheritedExercises = (client.sessionRecords ?? []).flatMap((session) => session.planningOrigin ? [] : session.plannedExercises ?? []).filter((exercise) =>
      exercise.prescriptionSource === "default" && changedDefaults.some((block) => block.id === exercise.prescriptionBlockId)
    );
    const shouldUpdateInherited = inheritedExercises.length > 0
      ? window.confirm(`La prescripción del mesociclo ha cambiado. Hay ${inheritedExercises.length} ejercicios creados con el default anterior.\n\nAceptar: actualizar solo los heredados.\nCancelar: conservar como están.`)
      : false;
    const nextSessions = shouldUpdateInherited ? (client.sessionRecords ?? []).map((session) => session.planningOrigin ? session : ({
      ...session,
      plannedExercises: (session.plannedExercises ?? []).map((exercise) => {
        if (exercise.prescriptionSource !== "default" || !exercise.prescriptionRole || !exercise.prescriptionBlockId) return exercise;
        const block = planningBlocks.find((candidate) => candidate.id === exercise.prescriptionBlockId);
        const defaults = getBlockPrescriptionDefault(block, exercise.prescriptionRole);
        return {
          ...exercise,
          plannedReps: getPrescriptionRange(defaults.repsMin, defaults.repsMax),
          plannedRest: getPrescriptionRange(defaults.restMinSeconds, defaults.restMaxSeconds),
          plannedRir: (defaults.effortScale ?? "rir") === "rir" ? getPrescriptionRange(defaults.rirMin, defaults.rirMax) : undefined,
          plannedRpe: defaults.effortScale === "rpe" ? getPrescriptionRange(defaults.rpeMin ?? "", defaults.rpeMax ?? "") : undefined,
          plannedSets: defaults.sets
        };
      })
    })) : client.sessionRecords;

    onUpdateClient({
      ...client,
      planning: {
        ...client.planning,
        blocks: planningBlocks,
        eventDate: planningPeakDate,
        eventName: planningEventName,
        method: planningMethod,
        planName: planningPlanName.trim(),
        primaryObjective: planningPrimaryObjective.trim(),
        secondaryObjective: planningSecondaryObjective.trim(),
        startDate: planningStartDate,
        weeklyFrequency: planningWeeklyFrequency,
        exerciseSlots: planningExerciseSlots.filter((slot) => activeExerciseDayIndexes.has(slot.dayIndex))
      },
      sessionRecords: nextSessions
    });
    setPlanningActionMessage("Planificación guardada.");
    setShowAdvancedPlanning(false);
  }

  function addMesocycle() {
    const nextBlock = { ...newPlanningBlock, id: `mesocycle-${Date.now()}` };
    setPlanningBlocks((blocks) => [...blocks, nextBlock]);
    setNewPlanningBlock(createPlanningBlockDraft(planningBlocks.length + 1));
    setPlanningActionMessage(`${nextBlock.name} creado. Puedes abrir su detalle para editarlo o añadir sesiones.`);
  }

  function updateBlock(blockId: string, updates: Partial<EditablePlanningBlock>) {
    const nextBlocks = planningBlocks.map((block) => block.id === blockId ? { ...block, ...updates } : block);
    setPlanningBlocks(nextBlocks);
    if (!showAdvancedPlanning && client) {
      onUpdateClient({ ...client, planning: { ...client.planning, blocks: nextBlocks } });
    }
  }

  function applyPlanningBlockDuration(blockId: string, direction: -1 | 1) {
    const block = roadmapBlocks.find((roadmapBlock) => roadmapBlock.id === blockId);
    if (!block) return;

    updateBlock(blockId, { durationWeeks: block.durationWeeks + direction });
    setPlanningActionMessage(direction === 1 ? "Semana añadida al mesociclo." : "Semana quitada del mesociclo.");
  }

  function changePlanningBlockDuration(blockId: string, direction: -1 | 1) {
    const blockIndex = roadmapBlocks.findIndex((roadmapBlock) => roadmapBlock.id === blockId);
    const block = roadmapBlocks[blockIndex];
    if (!block) return;

    if (direction === -1) {
      if (block.durationWeeks <= 1) return;
      const lastWeek = planningDistribution.find((week) => week.weekNumber === block.endWeek);
      if ((lastWeek?.sessions.length ?? 0) > 0) {
        setPlanningActionMessage("No puedes quitar esta semana porque contiene sesiones.");
        return;
      }
    }

    const laterBlocks = roadmapBlocks.slice(blockIndex + 1);
    const hasAffectedLaterSessions = laterBlocks.some((laterBlock) =>
      planningDistribution.some(
        (week) => week.weekNumber >= laterBlock.startWeek && week.weekNumber <= laterBlock.endWeek && week.sessions.length > 0
      )
    );

    if (hasAffectedLaterSessions) {
      setPendingPlanningDurationChange({ blockId, direction });
      return;
    }

    applyPlanningBlockDuration(blockId, direction);
  }

  function confirmPlanningDurationChange() {
    if (!pendingPlanningDurationChange) return;
    applyPlanningBlockDuration(pendingPlanningDurationChange.blockId, pendingPlanningDurationChange.direction);
    setPendingPlanningDurationChange(null);
  }

  function openPlanningSessionDraft(date: Date, weekNumber: number) {
    if (!client || !onOpenTrainingDraft) return;
    onOpenTrainingDraft({
      clientId: client.id,
      draftSessionSummary: `Semana ${weekNumber}`,
      sessionDate: getPlanningDateKey(date)
    });
  }

  function copyPlanningWeek(week: typeof planningDistribution[number]) {
    const sessions = week.trainingSessions.map((item) => ({
      dayOffset: Math.round((item.date.getTime() - week.startDate.getTime()) / 86400000),
      sessionIndex: item.sessionIndex,
      time: item.session.time
    }));
    if (sessions.length === 0) {
      setPlanningActionMessage("Esta semana no tiene sesiones de entrenamiento para copiar.");
      return;
    }
    setCopiedPlanningWeek({ sessions, sourceWeekNumber: week.weekNumber });
    setPlanningActionMessage(`Semana ${week.weekNumber} preparada para duplicar como microciclo tipo.`);
  }

  function pastePlanningWeek(week: typeof planningDistribution[number]) {
    if (!copiedPlanningWeek || !client || !onDuplicateSession) return;
    if (week.trainingSessions.length > 0) {
      const shouldContinue = window.confirm("Esta semana ya tiene sesiones. ¿Quieres añadir las sesiones copiadas sin borrar las existentes?");
      if (!shouldContinue) return;
    }
    copiedPlanningWeek.sessions.forEach((item) => {
      const targetDate = addPlanningDays(week.startDate, item.dayOffset);
      onDuplicateSession(client.id, item.sessionIndex, getPlanningDateKey(targetDate), item.time ?? undefined);
    });
    setPlanningActionMessage(`Semana ${copiedPlanningWeek.sourceWeekNumber} duplicada en semana ${week.weekNumber}.`);
  }

  function duplicatePlanningSession(sessionIndex: number, date: Date, time?: string | null) {
    if (!client || !onDuplicateSession) return;
    if (!window.confirm("¿Duplicar esta sesión planificada?")) return;
    onDuplicateSession(client.id, sessionIndex, getPlanningDateKey(date), time ?? undefined);
    setPlanningActionMessage("Sesión duplicada en la misma fecha.");
  }

  function deletePlanningSession(sessionIndex: number, session: ReviewSessionRecord) {
    if (!client || !onDeleteSession) return;
    if (hasCalendarSessionRegisteredData(session)) {
      setPlanningActionMessage("No se puede eliminar una sesión con datos registrados.");
      return;
    }
    if (!window.confirm("¿Eliminar esta sesión planificada?")) return;
    const result = onDeleteSession(client.id, sessionIndex);
    setPlanningActionMessage(result.message);
  }

  function createSessionFromPlanning(block: PlanningRoadmapBlock, target: PlanningSessionCreationTarget) {
    if (!client) return;
    const duplicateSession = (client.sessionRecords ?? []).some((session) =>
      session.planningOrigin?.blockId === block.id &&
      session.planningOrigin.weekNumber === target.weekNumber &&
      session.planningOrigin.templateDayIndex === target.day.dayIndex
    );
    if (duplicateSession) {
      setPlanningActionMessage("Esta sesión ya existe para la semana y el día seleccionados.");
      return;
    }

    const plannedExercises = planningExerciseSlots.flatMap<ConnectedSessionExercise>((slot) => {
      if (slot.dayIndex !== target.day.dayIndex) return [];
      const exerciseId = slot.exerciseByBlock[block.id];
      const exercise = exerciseId ? getExerciseById(exerciseId) : null;
      if (!exerciseId || !exercise) return [];
      const defaults = getBlockPrescriptionDefault(block, slot.role);
      const section = getPlanningExerciseSection(slot.role);

      return [{
        block: section,
        exerciseId,
        exerciseName: exercise.name,
        id: `planned-exercise-${Date.now()}-${slot.id}`,
        intensityMethod: "rir",
        planningSlotId: slot.id,
        prescriptionBlockId: block.id,
        prescriptionRole: slot.role,
        prescriptionSource: "default",
        sessionBlock: slot.role === "principal" ? "main" : "complementary",
        setMethod: "straight",
        plannedReps: getPrescriptionRange(defaults.repsMin, defaults.repsMax) || undefined,
        plannedRest: getPrescriptionRange(defaults.restMinSeconds, defaults.restMaxSeconds) || undefined,
        plannedRir: (defaults.effortScale ?? "rir") === "rir" ? getPrescriptionRange(defaults.rirMin, defaults.rirMax) || undefined : undefined,
        plannedRpe: defaults.effortScale === "rpe" ? getPrescriptionRange(defaults.rpeMin ?? "", defaults.rpeMax ?? "") || undefined : undefined,
        plannedSets: defaults.sets || undefined,
        section
      }];
    });
    const sessionNumber = (client.sessionRecords ?? []).filter((session) => Number(session.week) === target.weekNumber).length + 1;
    const sessionId = `session-${Date.now()}`;
    const plannedRecord: ClientSessionRecord = {
      block: block.name,
      completed: false,
      date: getPlanningTemplateSessionDate(planningStartDate || client.planning.startDate, target.weekNumber, target.day.dayIndex),
      notes: target.day.notes || undefined,
      id: sessionId,
      performedExercises: [],
      plannedExercises,
      planningOrigin: {
        blockId: block.id,
        templateDayIndex: target.day.dayIndex,
        weekNumber: target.weekNumber
      },
      sessionGoalId: target.day.sessionGoalId,
      sessionNumber,
      sessionTypeId: target.day.sessionTypeId,
      status: "Planificada",
      summary: target.day.sessionName.trim() || getPlanningDaySessionGoalLabel(target.day),
      type: getPlanningDaySessionTypeLabel(target.day),
      week: target.weekNumber,
      weekLabel: `Semana ${target.weekNumber}`
    };

    onUpdateClient({
      ...client,
      sessionRecords: [plannedRecord, ...(client.sessionRecords ?? [])]
    });
    setPlanningActionMessage("Sesión creada correctamente.");
  }

  function openCreatedPlanningSession(session: ClientSessionRecord) {
    if (!client || !onOpenTrainingDraft) return;
    onOpenTrainingDraft({ clientId: client.id, sessionDate: session.date, sessionId: session.id });
  }

  if (!client) {
    return (
      <section className="coach-surface mt-4 rounded-md p-4">
        <p className="text-sm font-semibold text-ink">
          Selecciona primero un cliente desde Clientes para ver su planificación.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6">
      <section className="coach-surface rounded-md px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">Plan actual · {client.name}</p>
            <h2 className="mt-1 text-base font-semibold text-ink">{getPlanningMethodLabel(planningMethod)} · {planningBlocks.length} {planningBlocks.length === 1 ? "mesociclo" : "mesociclos"} · {totalWeeks} {totalWeeks === 1 ? "semana" : "semanas"}</h2>
            <p className="mt-1 text-sm text-ink/60">Actual: {roadmapBlocks[currentRoadmapBlockIndex]?.name || client.planning.currentBlock || "Sin bloque asignado"} · {client.planning.currentWeek?.replace(/\s+de\s+\d+$/i, "") || "Semana sin asignar"}</p>
          </div>
          <p className="text-xs font-medium text-ink/50">{planningEventName || client.nextEvent || "Sin evento objetivo"}</p>
        </div>
      </section>

      <details className="coach-surface rounded-md p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Referencias de planificación · {planningReferenceCount} disponibles</summary>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Referencias de planificación</h3>
            <p className="mt-1 text-sm text-ink/55">Evento objetivo y valoraciones principales del cliente.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">
              {planningReferenceCount} referencias
            </span>
            {onOpenAssessments ? (
              <button
                className="rounded-md border border-line bg-panel px-3 py-1 text-xs font-semibold text-ink/70 transition hover:bg-mint"
                onClick={() => onOpenAssessments(client.id)}
                type="button"
              >
                Ir a Valoraciones
              </button>
            ) : null}
          </div>
        </div>
        {(planningEventName || client.nextEvent || planningPeakDate) ? (
          <article className="highlight-summary-card mt-3 flex flex-col gap-2 rounded-md px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-blue-300">Evento objetivo</p>
              <h4 className="mt-0.5 truncate font-semibold text-white">{planningEventName || client.nextEvent || "Evento sin nombre"}</h4>
            </div>
            {planningPeakDate ? (
              <p className="w-fit shrink-0 rounded-md border border-white/15 bg-white/[0.08] px-2.5 py-1.5 text-xs font-semibold text-white/70">Fecha objetivo · {formatDisplayDate(planningPeakDate)}</p>
            ) : null}
          </article>
        ) : null}
        {planningFavoriteGroups.length > 0 ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {planningFavoriteGroups.map((group) => {
              const latestEntry = group.entries[group.entries.length - 1];
              const numericEntries = group.entries.filter((entry) => entry.parsedValue !== null);
              const bestEntry = numericEntries.length > 0
                ? numericEntries.reduce((best, entry) => {
                    if (group.direction === "lower_is_better") return (entry.parsedValue ?? Infinity) < (best.parsedValue ?? Infinity) ? entry : best;
                    return (entry.parsedValue ?? -Infinity) > (best.parsedValue ?? -Infinity) ? entry : best;
                  }, numericEntries[0])
                : latestEntry;
              const reassessmentDate = planningReassessmentDates[group.key];
              const reassessmentState = getAssessmentReassessmentState(reassessmentDate);

              return (
                <article className="rounded-md border border-line bg-panel/35 px-3 py-2.5" key={group.key}>
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase text-moss">{group.category}</p>
                      <h4 className="mt-0.5 truncate text-sm font-semibold text-ink">{group.name}</h4>
                    </div>
                    {reassessmentState.label ? <span className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold ${reassessmentState.tone}`}>{reassessmentState.label}</span> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
                    <p>Último: <span className="font-semibold text-ink">{latestEntry.result}</span></p>
                    <p>Mejor: <span className="font-semibold text-ink">{bestEntry.result}</span></p>
                    {reassessmentDate ? <p className="text-ink/50">Reevaluación: {formatDisplayDate(reassessmentDate)}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 px-3 py-2.5 text-sm font-semibold text-ink/55">
            Sin valoraciones principales. Añade una para usarla como referencia.
          </p>
        )}
      </details>

      <section className="coach-surface rounded-md p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Timeline de mesociclos</h3>
            <p className="mt-1 text-sm text-ink/55">Del primer bloque al siguiente. Selecciona uno para consultar semanas, sesiones y edición.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {planningBlocks.length > 0 ? (
              <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-moss" onClick={() => setShowPlanningGlobalReview(true)} type="button">
                Revisión global
              </button>
            ) : null}
            <button
              className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              onClick={openPlanningWizard}
              type="button"
            >
              {planningBlocks.length > 0 ? "Configurar plan" : "Crear planificación"}
            </button>
          </div>
        </div>
        {planningBlocks.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm text-ink/60">
            <p>Aún no hay mesociclos en esta planificación.</p>
            <button className="mt-2 text-sm font-semibold text-moss hover:underline" onClick={openPlanningWizard} type="button">Crear planificación</button>
          </div>
        ) : (
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {roadmapBlocks.map((block, index) => {
              const isCurrent = index === currentRoadmapBlockIndex;
              const periodLabel = currentRoadmapBlockIndex < 0 ? "Planificado" : isCurrent ? "Actual" : index < currentRoadmapBlockIndex ? "Anterior" : "Posterior";

              return (
                <li className="relative min-w-0 border-l-2 border-line pl-4 xl:border-l-0 xl:border-t-2 xl:pl-0 xl:pt-4" key={block.id}>
                  <span aria-hidden="true" className={`absolute -left-[5px] top-4 size-2 rounded-full xl:-top-[5px] xl:left-4 ${isCurrent ? "bg-moss" : "bg-steel/45"}`} />
                  <button
                    className={`flex h-full w-full min-w-0 flex-col rounded-md border p-4 text-left transition hover:border-moss hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-moss ${isCurrent ? "border-moss/45 bg-mint/25 shadow-soft" : "border-line bg-panel/35"}`}
                    onClick={() => setSelectedPlanningBlockId(block.id)}
                    type="button"
                  >
                    <div className="flex w-full min-w-0 items-start justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{index + 1} · {periodLabel}</p>
                      {isCurrent ? <span className="rounded-md border border-moss/25 bg-mint px-2 py-0.5 text-[11px] font-semibold text-moss">Actual</span> : null}
                    </div>
                    <h4 className="mt-3 break-words text-base font-semibold text-ink">{block.name}</h4>
                    <p className="mt-2 text-sm font-medium text-ink/65">Semanas {block.startWeek}–{block.endWeek} · {block.durationWeeks} {block.durationWeeks === 1 ? "semana" : "semanas"}</p>
                    <p className="mt-3 text-xs text-ink/50">Objetivo principal</p>
                    <p className="mt-1 break-words text-sm font-semibold text-ink/75">{block.primaryObjective || "Sin definir"}</p>
                    <span className="mt-auto pt-4 text-xs font-semibold text-moss">Ver detalle</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-4 text-xs text-ink/50">El calendario semanal y las sesiones se consultan dentro del detalle de cada mesociclo.</p>
      </section>

      <section className="hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Distribución semanal</h3>
            <p className="mt-1 text-sm text-ink/55">Sesiones existentes agrupadas por semana y tipo. No usa cargas ni datos inventados.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {(["strength", "resistance", "concurrent", "activeRecovery", "test"] as PlanningSessionKind[]).map((kind) => (
              <span className={`rounded-md border px-2 py-1 ${getPlanningSessionKindClass(kind)}`} key={kind}>
                {getPlanningSessionKindLabel(kind)}
              </span>
            ))}
          </div>
        </div>
        {hasPlanningDistributionData ? (
          <div className="mt-5 grid gap-3">
            {planningDistribution.map((week) => (
              <div className="grid gap-3 rounded-md border border-line bg-panel/35 p-3 md:grid-cols-[92px_1fr]" key={`chart-${week.weekNumber}`}>
                <div>
                  <p className="text-sm font-semibold text-ink">Semana {week.weekNumber}</p>
                  <p className="mt-1 text-xs text-ink/45">{week.total} sesiones</p>
                </div>
                <div className="flex min-h-8 overflow-hidden rounded-md bg-white">
                  {(["strength", "resistance", "concurrent", "activeRecovery", "test", "other"] as PlanningSessionKind[])
                    .filter((kind) => week.counts[kind] > 0)
                    .map((kind) => (
                      <div
                        className={`flex items-center justify-center border-r border-white/70 px-2 text-[11px] font-semibold last:border-r-0 ${getPlanningSessionKindClass(kind)}`}
                        key={kind}
                        style={{ width: `${Math.max(12, (week.counts[kind] / maxWeeklySessions) * 100)}%` }}
                        title={`${getPlanningSessionKindLabel(kind)}: ${week.counts[kind]}`}
                      >
                        {getPlanningSessionKindLabel(kind)} {week.counts[kind]}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
            Añade sesiones a la planificación para ver la distribución semanal.
          </div>
        )}
      </section>

      {selectedPlanningBlock ? (
        <PlanningBlockDetail
          block={selectedPlanningBlock}
          client={client}
          copiedPlanningWeek={Boolean(copiedPlanningWeek)}
          currentPlanningWeekNumber={currentPlanningWeekNumber}
          isCurrentBlock={selectedPlanningBlock.id === roadmapBlocks[currentRoadmapBlockIndex]?.id}
          onAddSession={openPlanningSessionDraft}
          onBack={() => setSelectedPlanningBlockId(null)}
          onCopyWeek={copyPlanningWeek}
          onDeleteSession={deletePlanningSession}
          onDuplicateSession={duplicatePlanningSession}
          onPasteWeek={pastePlanningWeek}
          onChangeDuration={changePlanningBlockDuration}
          onCreateSession={createSessionFromPlanning}
          onOpenCreatedSession={openCreatedPlanningSession}
          onUpdateBlock={updateBlock}
          exerciseSlots={planningExerciseSlots}
          planningActionMessage={planningActionMessage}
          planningDistribution={planningDistribution}
        />
      ) : null}

      {showAdvancedPlanning ? (
        <PlanningWizard
          blocks={roadmapBlocks}
          clientName={client.name}
          eventName={planningEventName}
          eventType={planningEventType}
          newBlock={newPlanningBlock}
          exerciseSlots={planningExerciseSlots}
          onAddExerciseSlot={addPlanningExerciseSlot}
          onAddBlock={addMesocycle}
          onChangeBlockDuration={changePlanningBlockDuration}
          onClose={() => setShowAdvancedPlanning(false)}
          onCopyBlockConfiguration={copyBlockConfiguration}
          onCopyExerciseForward={copyPlanningExerciseForward}
          onCopyExercisesFromBlock={copyPlanningExercisesFromBlock}
          onDeleteExerciseSlot={deletePlanningExerciseSlot}
          onFinish={savePlanningWizard}
          onSetEventName={setPlanningEventName}
          onSetEventType={setPlanningEventType}
          onSetMethod={setPlanningMethod}
          onSetNewBlock={setNewPlanningBlock}
          onSetPeakDate={setPlanningPeakDate}
          onSetPlanName={setPlanningPlanName}
          onSetPrimaryObjective={setPlanningPrimaryObjective}
          onSetSecondaryObjective={setPlanningSecondaryObjective}
          onSetStartDate={setPlanningStartDate}
          onSetStep={setPlanningWizardStep}
          onSetWeeklyFrequency={setPlanningWeeklyFrequency}
          onUpdateBlock={updatePlanningBlockDraft}
          onUpdateDay={updateBlockWeeklyDay}
          onUpdatePrescription={updateBlockPrescriptionDefault}
          onUpdateExerciseSlot={updatePlanningExerciseSlot}
          peakDate={planningPeakDate}
          planName={planningPlanName}
          planningMethod={planningMethod}
          primaryObjective={planningPrimaryObjective}
          secondaryObjective={planningSecondaryObjective}
          startDate={planningStartDate}
          step={planningWizardStep}
          weeklyFrequency={planningWeeklyFrequency}
        />
      ) : null}

      {showPlanningGlobalReview ? (
        <PlanningGlobalReview
          blocks={roadmapBlocks}
          exerciseSlots={planningExerciseSlots}
          onClose={() => setShowPlanningGlobalReview(false)}
          planName={planningPlanName}
          weeklyFrequency={planningWeeklyFrequency}
        />
      ) : null}

      {false && showAdvancedPlanning ? (
        <div className="assessment-modal-overlay" onClick={() => setShowAdvancedPlanning(false)} role="presentation">
          <section
            aria-modal="true"
            className="assessment-modal-panel max-h-[88vh] max-w-6xl overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="assessment-modal-header sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Crear mesociclo</h2>
                <p className="mt-1 text-sm text-ink/55">Define una referencia y crea los bloques uno a uno.</p>
              </div>
              <button
                aria-label="Cerrar configuración avanzada"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-ink/70 transition hover:bg-mint"
                onClick={() => setShowAdvancedPlanning(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </header>
            <div className="assessment-modal-body grid gap-4 px-5 py-5">
              <section className="rounded-md border border-line bg-panel/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">Modelo de planificación</p>
                    <h3 className="mt-1 font-semibold text-ink">Por bloques</h3>
                  </div>
                  <span className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/60">{planningBlocks.length} mesociclos</span>
                </div>
              </section>

              <section className="rounded-md border border-line bg-panel/35 p-4">
                <h3 className="font-semibold text-ink">¿Hay una fecha objetivo o evento deportivo a tener en cuenta?</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${planningEventType !== "Sin evento definido" ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink/65"}`}
                    onClick={() => setPlanningEventType("Competicion")}
                    type="button"
                  >
                    Sí
                  </button>
                  <button
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${planningEventType === "Sin evento definido" ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink/65"}`}
                    onClick={() => setPlanningEventType("Sin evento definido")}
                    type="button"
                  >
                    No / todavía no
                  </button>
                </div>
                {planningEventType !== "Sin evento definido" ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Tipo de evento
                      <select className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setPlanningEventType(event.target.value as PlanningEventType)} value={planningEventType}>
                        {planningEventTypes.filter((eventType) => eventType !== "Sin evento definido").map((eventType) => <option key={eventType}>{eventType}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Nombre del evento
                      <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setPlanningEventName(event.target.value)} placeholder="Ej. Campeonato regional" value={planningEventName} />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/75">
                      Fecha objetivo
                      <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setPlanningPeakDate(event.target.value)} type="date" value={planningPeakDate} />
                    </label>
                    <p className="text-xs font-semibold text-ink/50 sm:col-span-3">Semanas disponibles: {planningWeeks > 0 ? planningWeeks : "Selecciona una fecha válida"}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">Puedes crear mesociclos sin definir todavía una fecha objetivo.</p>
                )}
              </section>

              <section className="rounded-md border border-line bg-panel/35 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-moss">Nuevo mesociclo</p>
                  <h3 className="mt-1 font-semibold text-ink">Crea un bloque cada vez</h3>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Nombre
                    <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setNewPlanningBlock((block) => ({ ...block, name: event.target.value }))} value={newPlanningBlock.name} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Duración
                    <select className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setNewPlanningBlock((block) => ({ ...block, durationWeeks: Number(event.target.value) }))} value={newPlanningBlock.durationWeeks}>
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((weeks) => <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? "semana" : "semanas"}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Distribución semanal
                    <select className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss" onChange={(event) => setNewPlanningBlock((block) => ({ ...block, weeklyDistribution: event.target.value as WeeklyDistribution }))} value={newPlanningBlock.weeklyDistribution}>
                      {planningWeeklyDistributionOptions.map((distribution) => <option key={distribution}>{distribution}</option>)}
                    </select>
                  </label>
                  <PlanningBlockTaxonomyFields block={newPlanningBlock} onUpdate={(updates) => setNewPlanningBlock((block) => ({ ...block, ...updates }))} />
                  <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                    Notas opcionales
                    <textarea className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-moss" onChange={(event) => setNewPlanningBlock((block) => ({ ...block, notes: event.target.value }))} placeholder="Notas del mesociclo" value={newPlanningBlock.notes} />
                  </label>
                </div>
                <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white" onClick={addMesocycle} type="button">
                  <Plus size={18} />
                  Crear mesociclo
                </button>
                {planningActionMessage ? <p className="mt-3 text-sm font-semibold text-moss">{planningActionMessage}</p> : null}
              </section>

              <details className="group rounded-md border border-line bg-panel/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink">
                  Resumen y exportación
                  <span className="text-ink/45 group-open:hidden">+</span>
                  <span className="hidden text-ink/45 group-open:inline">−</span>
                </summary>
                <div className="border-t border-line p-4">
                  <PlanningSummary selectedPlan={selectedPlan} />
                  <PlanningCalendarPreview blocks={planningBlocks} eventName={planningEventName} eventType={planningEventType} peakDate={planningPeakDate} />
                </div>
              </details>
            </div>
          </section>
        </div>
      ) : null}

      {pendingPlanningDurationChange ? (
        <div className="assessment-modal-overlay" onClick={() => setPendingPlanningDurationChange(null)} role="presentation">
          <section
            aria-labelledby="planning-duration-warning-title"
            aria-modal="true"
            className="assessment-modal-panel !w-[calc(100%-2rem)] !max-w-lg"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="assessment-modal-header px-4 py-4 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-clay">Cambio de estructura</p>
              <h2 className="mt-1 text-lg font-semibold text-ink" id="planning-duration-warning-title">Revisar rangos posteriores</h2>
            </header>
            <div className="assessment-modal-body px-4 py-4 sm:px-5">
              <p className="text-sm leading-6 text-ink/70">
                Este cambio modificará el rango de los mesociclos posteriores.
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Las sesiones ya planificadas mantendrán sus fechas actuales y no se recolocarán automáticamente. Al cambiar los rangos, alguna sesión puede quedar fuera del mesociclo al que estaba asociada.
              </p>
              <p className="mt-3 rounded-md border border-line bg-panel/45 px-3 py-2 text-xs font-medium text-ink/55">
                No se moverá, modificará ni eliminará ninguna sesión.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-mint"
                  onClick={() => setPendingPlanningDurationChange(null)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  onClick={confirmPlanningDurationChange}
                  type="button"
                >
                  Mantener fechas y continuar
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

const planningWizardSteps = ["Contexto", "Mesociclos", "Semana", "Prescripción", "Ejercicios", "Revisión"];

function PlanningBlockTaxonomyFields({
  block,
  onUpdate
}: {
  block: EditablePlanningBlock;
  onUpdate: (updates: Partial<EditablePlanningBlock>) => void;
}) {
  const phaseId = block.phaseId ?? getPlanningPhase(block.name)?.id ?? "";
  const primaryGoalId = getBlockPrimaryGoalId(block) ?? "";
  const secondaryGoalIds = getBlockSecondaryGoalIds(block).slice(0, 2);
  const hasLegacyPrimary = Boolean(block.primaryObjective && !getPlanningGoal(block.primaryObjective) && !block.primaryGoalId);
  const hasLegacySecondary = Boolean(block.secondaryObjective && !getPlanningGoal(block.secondaryObjective) && !block.secondaryGoalIds);
  const updateSecondaryGoals = (nextIds: PlanningGoalId[]) => {
    const uniqueIds = nextIds.filter((goalId, index) => goalId && nextIds.indexOf(goalId) === index && goalId !== primaryGoalId).slice(0, 2);
    const labels = uniqueIds.map((goalId) => goalId === "other"
      ? block.secondaryGoalOther?.trim() || "Otro"
      : getPlanningGoal(goalId)?.label ?? goalId);
    onUpdate({ secondaryGoalIds: uniqueIds, secondaryObjective: labels.join(" · ") });
  };

  return (
    <>
      <label className="space-y-1 text-xs font-semibold text-ink/60">
        Fase
        <select className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" onChange={(event) => onUpdate({ phaseId: event.target.value as PlanningPhaseId || undefined, phaseOther: event.target.value === "other" ? block.phaseOther : undefined })} value={phaseId}>
          <option value="">Sin fase</option>
          {planningPhaseOptions.map((phase) => <option key={phase.id} value={phase.id}>{phase.label}</option>)}
        </select>
      </label>
      {phaseId === "other" ? <label className="space-y-1 text-xs font-semibold text-ink/60">Otra fase<input className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" maxLength={80} onChange={(event) => onUpdate({ phaseOther: event.target.value })} value={block.phaseOther ?? ""} /></label> : null}
      {phaseId ? <p className="text-xs leading-relaxed text-ink/45 sm:col-span-2">{getPlanningPhase(phaseId)?.description}</p> : null}
      <label className="space-y-1 text-xs font-semibold text-ink/60">
        Objetivo principal
        <select className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" onChange={(event) => {
          const nextId = event.target.value as PlanningGoalId;
          if (!nextId || event.target.value === "__legacy__") return;
          const nextSecondaryIds = secondaryGoalIds.filter((goalId) => goalId !== nextId);
          onUpdate({
            primaryGoalId: nextId,
            primaryGoalOther: nextId === "other" ? block.primaryGoalOther : undefined,
            primaryObjective: nextId === "other" ? block.primaryGoalOther?.trim() || "Otro" : getPlanningGoal(nextId)?.label ?? "",
            secondaryGoalIds: nextSecondaryIds,
            secondaryObjective: nextSecondaryIds.map((goalId) => getPlanningGoal(goalId)?.label ?? goalId).join(" · ")
          });
        }} value={hasLegacyPrimary ? "__legacy__" : primaryGoalId}>
          <option value="">Selecciona un objetivo</option>
          {hasLegacyPrimary ? <option value="__legacy__">Actual: {block.primaryObjective}</option> : null}
          {planningGoalGroups.map((group) => <optgroup key={group.id} label={group.label}>{group.options.map((goal) => <option key={goal.id} value={goal.id}>{goal.label}</option>)}</optgroup>)}
        </select>
      </label>
      {primaryGoalId === "other" ? <label className="space-y-1 text-xs font-semibold text-ink/60">Otro objetivo principal<input className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" maxLength={100} onChange={(event) => onUpdate({ primaryGoalOther: event.target.value, primaryObjective: event.target.value })} value={block.primaryGoalOther ?? ""} /></label> : null}
      {[0, 1].map((secondaryIndex) => {
        const selectedId = secondaryGoalIds[secondaryIndex] ?? "";
        return <label className="space-y-1 text-xs font-semibold text-ink/60" key={secondaryIndex}>Secundario {secondaryIndex + 1}<select className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" onChange={(event) => { if (event.target.value === "__legacy__") return; const nextIds = [...secondaryGoalIds]; if (event.target.value) nextIds[secondaryIndex] = event.target.value as PlanningGoalId; else nextIds.splice(secondaryIndex, 1); updateSecondaryGoals(nextIds); }} value={secondaryIndex === 0 && hasLegacySecondary ? "__legacy__" : selectedId}><option value="">Sin objetivo</option>{secondaryIndex === 0 && hasLegacySecondary ? <option value="__legacy__">Actual: {block.secondaryObjective}</option> : null}{planningGoalGroups.map((group) => <optgroup key={group.id} label={group.label}>{group.options.map((goal) => <option disabled={goal.id === primaryGoalId || secondaryGoalIds.some((selected, index) => index !== secondaryIndex && selected === goal.id)} key={goal.id} value={goal.id}>{goal.label}</option>)}</optgroup>)}</select></label>;
      })}
      {secondaryGoalIds.includes("other") ? <label className="space-y-1 text-xs font-semibold text-ink/60 sm:col-span-2">Otro objetivo secundario<input className="h-10 w-full rounded-md border border-line bg-white px-2 text-sm text-ink" maxLength={100} onChange={(event) => onUpdate({ secondaryGoalOther: event.target.value, secondaryObjective: getBlockSecondaryGoalLabels({ ...block, secondaryGoalOther: event.target.value }).join(" · ") })} value={block.secondaryGoalOther ?? ""} /></label> : null}
    </>
  );
}

function PlanningSessionTaxonomyFields({
  day,
  onUpdate
}: {
  day?: PlanningWeeklyTemplateDay;
  onUpdate: (updates: Partial<PlanningWeeklyTemplateDay>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeTypeId, setActiveTypeId] = useState<PlanningSessionTypeId | null>(null);
  const typeId = getPlanningDaySessionTypeId(day);
  const goalId = day?.sessionGoalId ?? getPlanningSessionGoal(typeId, day?.sessionGoal)?.id;
  const hasLegacyType = Boolean(day?.sessionType && !getPlanningSessionType(day.sessionType) && !day.sessionTypeId);
  const hasLegacyGoal = Boolean(day?.sessionGoal && !getPlanningSessionGoal(typeId, day.sessionGoal) && !day.sessionGoalId);

  useEffect(() => {
    if (!open) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveTypeId(null);
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  const selectGoal = (nextTypeId: PlanningSessionTypeId, nextGoalId: PlanningSessionGoalId) => {
    const nextType = getPlanningSessionType(nextTypeId);
    const nextGoal = getPlanningSessionGoal(nextTypeId, nextGoalId);
    onUpdate({
      sessionGoal: nextGoalId === "other" ? day?.sessionGoalOther ?? "Otro" : nextGoal?.label ?? "",
      sessionGoalId: nextGoalId,
      sessionGoalOther: nextGoalId === "other" ? day?.sessionGoalOther : undefined,
      sessionType: nextTypeId === "other" ? day?.sessionTypeOther ?? "Otro" : nextType?.label ?? "",
      sessionTypeId: nextTypeId,
      sessionTypeOther: nextTypeId === "other" ? day?.sessionTypeOther : undefined
    });
    setOpen(false);
    setActiveTypeId(null);
  };

  return (
    <div className="relative mt-2">
      <button aria-expanded={open} aria-haspopup="menu" className="w-full rounded-md border border-line bg-panel/30 px-3 py-2 text-left" onClick={() => { setOpen((current) => !current); setActiveTypeId(typeId ?? null); }} type="button">
        <span className="block text-xs font-semibold text-ink">{hasLegacyGoal ? day?.sessionGoal : getPlanningDaySessionGoalLabel(day)}</span>
        <span className="mt-0.5 block text-[11px] text-ink/45">{hasLegacyType ? day?.sessionType : getPlanningDaySessionTypeLabel(day)}</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 grid max-h-72 w-full min-w-64 overflow-hidden rounded-md border border-line bg-white shadow-xl sm:w-[34rem] sm:grid-cols-2" role="menu">
          <div className={`${activeTypeId ? "hidden sm:block" : "block"} overflow-y-auto border-line p-2 sm:border-r`}>
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/40">Seleccionar tipo</p>
            {planningSessionTypeOptions.map((type) => (
              <button className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm font-semibold ${activeTypeId === type.id ? "bg-mint text-moss" : "text-ink hover:bg-panel"}`} key={type.id} onClick={() => setActiveTypeId(type.id)} onMouseEnter={() => setActiveTypeId(type.id)} role="menuitem" type="button"><span>{type.label}</span><span aria-hidden>›</span></button>
            ))}
          </div>
          <div className={`${activeTypeId ? "block" : "hidden sm:block"} overflow-y-auto p-2`}>
            {activeTypeId ? (
              <>
                <button className="mb-1 w-full rounded px-2 py-2 text-left text-xs font-semibold text-steel sm:hidden" onClick={() => setActiveTypeId(null)} type="button">← Tipos de sesión</button>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink/40">{getPlanningSessionType(activeTypeId)?.label}</p>
                {planningSessionGoalsByType[activeTypeId].map((goal) => <button className="w-full rounded px-2 py-2 text-left text-sm text-ink hover:bg-panel focus:bg-panel" key={goal.id} onClick={() => selectGoal(activeTypeId, goal.id)} role="menuitem" type="button">{goal.label}</button>)}
              </>
            ) : <p className="p-3 text-sm text-ink/45">Selecciona un tipo para ver sus objetivos.</p>}
          </div>
        </div>
      ) : null}
      {typeId === "other" ? <input aria-label="Otro tipo de sesión" className="mt-2 h-9 w-full rounded border border-line bg-panel/30 px-2 text-xs text-ink" maxLength={80} onChange={(event) => onUpdate({ sessionType: event.target.value, sessionTypeOther: event.target.value })} placeholder="Describe el tipo" value={day?.sessionTypeOther ?? ""} /> : null}
      {goalId === "other" ? <input aria-label="Otro objetivo de sesión" className="mt-2 h-9 w-full rounded border border-line bg-panel/30 px-2 text-xs text-ink" maxLength={100} onChange={(event) => onUpdate({ sessionGoal: event.target.value, sessionGoalOther: event.target.value })} placeholder="Describe el objetivo" value={day?.sessionGoalOther ?? ""} /> : null}
    </div>
  );
}

function PlanningPrescriptionRow({
  defaults,
  label,
  onUpdate
}: {
  defaults: PlanningPrescriptionDefault;
  label: string;
  onUpdate: (updates: Partial<PlanningPrescriptionDefault>) => void;
}) {
  const effortScale = defaults.effortScale ?? "rir";
  const effortMin = effortScale === "rpe" ? defaults.rpeMin ?? "" : defaults.rirMin;
  const effortMax = effortScale === "rpe" ? defaults.rpeMax ?? "" : defaults.rirMax;
  const reference = getPrescriptionRange(defaults.seriesReferenceMin ?? "", defaults.seriesReferenceMax ?? "");
  const compactInput = "h-9 min-w-0 rounded border border-line bg-panel/30 px-2 text-center text-sm text-ink";
  return (
    <article className="rounded-md border border-line bg-white p-3">
      <div className="grid gap-3 xl:grid-cols-[110px_minmax(105px,0.75fr)_minmax(145px,1fr)_minmax(190px,1.2fr)_minmax(150px,1fr)] xl:items-end">
        <p className="text-xs font-semibold uppercase tracking-wide text-moss xl:self-center">{label}</p>
        <label className="text-xs font-semibold text-ink/55">Series
          <input className={`${compactInput} mt-1 w-full`} inputMode="numeric" onChange={(event) => onUpdate({ sets: event.target.value })} value={defaults.sets} />
          {reference ? <span className="mt-1 block text-[10px] font-normal text-ink/40">Rango habitual {reference}</span> : null}
        </label>
        <fieldset><legend className="text-xs font-semibold text-ink/55">Reps</legend><div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1"><input aria-label={`${label}: repeticiones mínimas`} className={compactInput} onChange={(event) => onUpdate({ repsMin: event.target.value })} value={defaults.repsMin} /><span className="text-ink/35">–</span><input aria-label={`${label}: repeticiones máximas`} className={compactInput} onChange={(event) => onUpdate({ repsMax: event.target.value })} value={defaults.repsMax} /></div></fieldset>
        <fieldset><legend className="text-xs font-semibold text-ink/55">Esfuerzo</legend><div className="mt-1 grid grid-cols-[72px_1fr_auto_1fr] items-center gap-1"><select aria-label={`${label}: escala de esfuerzo`} className={`${compactInput} px-1`} onChange={(event) => onUpdate({ effortScale: event.target.value as PlanningEffortScale })} value={effortScale}><option value="rir">RIR</option><option value="rpe">RPE</option></select><input aria-label={`${label}: esfuerzo mínimo`} className={compactInput} onChange={(event) => onUpdate(effortScale === "rpe" ? { rpeMin: event.target.value } : { rirMin: event.target.value })} value={effortMin} /><span className="text-ink/35">–</span><input aria-label={`${label}: esfuerzo máximo`} className={compactInput} onChange={(event) => onUpdate(effortScale === "rpe" ? { rpeMax: event.target.value } : { rirMax: event.target.value })} value={effortMax} /></div></fieldset>
        <fieldset><legend className="text-xs font-semibold text-ink/55">Descanso</legend><div className="mt-1 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-1"><input aria-label={`${label}: descanso mínimo`} className={compactInput} onChange={(event) => onUpdate({ restMinSeconds: event.target.value })} value={defaults.restMinSeconds} /><span className="text-ink/35">–</span><input aria-label={`${label}: descanso máximo`} className={compactInput} onChange={(event) => onUpdate({ restMaxSeconds: event.target.value })} value={defaults.restMaxSeconds} /><span className="text-xs text-ink/45">s</span></div></fieldset>
      </div>
    </article>
  );
}

function PlanningWizard({
  blocks,
  clientName,
  eventName,
  eventType,
  exerciseSlots,
  newBlock,
  onAddExerciseSlot,
  onAddBlock,
  onChangeBlockDuration,
  onClose,
  onCopyBlockConfiguration,
  onCopyExerciseForward,
  onCopyExercisesFromBlock,
  onDeleteExerciseSlot,
  onFinish,
  onSetEventName,
  onSetEventType,
  onSetMethod,
  onSetNewBlock,
  onSetPeakDate,
  onSetPlanName,
  onSetPrimaryObjective,
  onSetSecondaryObjective,
  onSetStartDate,
  onSetStep,
  onSetWeeklyFrequency,
  onUpdateBlock,
  onUpdateDay,
  onUpdateExerciseSlot,
  onUpdatePrescription,
  peakDate,
  planName,
  planningMethod,
  primaryObjective,
  secondaryObjective,
  startDate,
  step,
  weeklyFrequency
}: {
  blocks: PlanningRoadmapBlock[];
  clientName: string;
  eventName: string;
  eventType: PlanningEventType;
  exerciseSlots: PlanningExerciseSlot[];
  newBlock: EditablePlanningBlock;
  onAddExerciseSlot: (dayIndex: number, role: PlanningPrescriptionRole) => void;
  onAddBlock: () => void;
  onChangeBlockDuration: (blockId: string, direction: -1 | 1) => void;
  onClose: () => void;
  onCopyBlockConfiguration: (sourceIndex: number, targetIndex: number, mode: "week" | "prescription") => void;
  onCopyExerciseForward: (slotId: string, sourceBlockIndex: number) => void;
  onCopyExercisesFromBlock: (sourceBlockIndex: number, targetBlockIndex: number) => void;
  onDeleteExerciseSlot: (slotId: string) => void;
  onFinish: () => void;
  onSetEventName: (value: string) => void;
  onSetEventType: (value: PlanningEventType) => void;
  onSetMethod: (value: PlanningMethod) => void;
  onSetNewBlock: Dispatch<SetStateAction<EditablePlanningBlock>>;
  onSetPeakDate: (value: string) => void;
  onSetPlanName: (value: string) => void;
  onSetPrimaryObjective: (value: string) => void;
  onSetSecondaryObjective: (value: string) => void;
  onSetStartDate: (value: string) => void;
  onSetStep: (value: number) => void;
  onSetWeeklyFrequency: (value: number) => void;
  onUpdateBlock: (blockId: string, updates: Partial<EditablePlanningBlock>) => void;
  onUpdateDay: (blockId: string, dayIndex: number, updates: Partial<PlanningWeeklyTemplateDay>) => void;
  onUpdateExerciseSlot: (slotId: string, blockId: string, exerciseId: string | null) => void;
  onUpdatePrescription: (blockId: string, role: PlanningPrescriptionRole, updates: Partial<PlanningPrescriptionDefault>) => void;
  peakDate: string;
  planName: string;
  planningMethod: PlanningMethod;
  primaryObjective: string;
  secondaryObjective: string;
  startDate: string;
  step: number;
  weeklyFrequency: number;
}) {
  const totalWeeks = blocks.reduce((total, block) => total + block.durationWeeks, 0);
  const canContinue = step !== 1 || blocks.length > 0;

  useEffect(() => {
    if (step !== 3) return;
    blocks.forEach((block) => {
      const preset = getPrescriptionPreset(block.phaseId, getBlockPrimaryGoalId(block));
      if (!preset) return;
      const rolesAreEmpty = planningPrescriptionRoles.every((role) => isPrescriptionDefaultEmpty(getBlockPrescriptionDefault(block, role.id)));
      if (!rolesAreEmpty) return;
      onUpdateBlock(block.id, {
        prescriptionDefaults: Object.fromEntries(planningPrescriptionRoles.map((role) => [role.id, getPrescriptionFromPreset(role.id, block)])) as Partial<Record<PlanningPrescriptionRole, PlanningPrescriptionDefault>>
      });
    });
  }, [blocks, onUpdateBlock, step]);

  return (
    <div className="assessment-modal-overlay" onClick={onClose} role="presentation">
      <section aria-labelledby="planning-wizard-title" aria-modal="true" className="assessment-modal-panel !max-h-[92vh] !w-full !max-w-6xl" onClick={(event) => event.stopPropagation()} role="dialog">
        <header className="assessment-modal-header px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-moss">Paso {step + 1} de {planningWizardSteps.length} · {clientName}</p>
              <h2 className="mt-1 text-xl font-semibold text-ink" id="planning-wizard-title">Construir planificación</h2>
            </div>
            <button aria-label="Cerrar asistente" className="grid size-9 place-items-center rounded-md border border-line bg-panel text-ink/65" onClick={onClose} type="button"><X size={16} /></button>
          </div>
          <ol className="mt-4 grid grid-cols-6 gap-1" aria-label="Progreso de configuración">
            {planningWizardSteps.map((label, index) => (
              <li className={`min-w-0 rounded-md border px-2 py-2 text-center text-[10px] font-semibold sm:text-xs ${index === step ? "border-moss bg-mint text-moss" : index < step ? "border-steel/25 bg-sky text-steel" : "border-line bg-panel/40 text-ink/40"}`} key={label}>
                <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{index + 1}</span>
              </li>
            ))}
          </ol>
        </header>

        <div className="assessment-modal-body px-4 py-5 sm:px-6">
          {step === 0 ? (
            <div className="grid gap-5">
              <div><h3 className="text-xl font-semibold text-ink">¿Qué quieres construir?</h3><p className="mt-1 text-sm text-ink/55">Define el contexto fundamental. RAC no elegirá el modelo por ti.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-ink/65">Nombre del plan<input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-ink" onChange={(event) => onSetPlanName(event.target.value)} placeholder="Ej. Preparación temporada" value={planName} /></label>
                <label className="text-sm font-semibold text-ink/65">Fecha de inicio<input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-ink" onChange={(event) => onSetStartDate(event.target.value)} type="date" value={startDate} /></label>
                <label className="text-sm font-semibold text-ink/65">Objetivo principal<input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-ink" onChange={(event) => onSetPrimaryObjective(event.target.value)} value={primaryObjective} /></label>
                <label className="text-sm font-semibold text-ink/65">Objetivo secundario<input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-ink" onChange={(event) => onSetSecondaryObjective(event.target.value)} value={secondaryObjective} /></label>
                <label className="text-sm font-semibold text-ink/65">Frecuencia semanal<input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-ink" min="1" onChange={(event) => onSetWeeklyFrequency(Math.max(1, Number(event.target.value) || 1))} type="number" value={weeklyFrequency} /></label>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Modelo de periodización</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {planningConfig.methodOptions.filter((option) => option.value).map((option) => (
                    <button className={`rounded-md border p-3 text-left ${planningMethod === option.value ? "border-moss bg-mint/45" : "border-line bg-panel/30"}`} key={option.value} onClick={() => onSetMethod(option.value as PlanningMethod)} type="button">
                      <span className="block font-semibold text-ink">{option.label}</span>
                      <span className="mt-2 block font-mono text-sm tracking-widest text-steel">{option.value === "linear" ? "▂▄▆█" : option.value === "undulating" ? "▂▇▃▆▂▇" : option.value === "blocks" ? "██ ▓▓ ▒▒" : "▂▄▃▆▄▇"}</span>
                      <span className="mt-2 block text-xs leading-relaxed text-ink/50">{getPlanningMethodDescription(option.value as PlanningMethod)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <details className="rounded-md border border-line bg-panel/25 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-ink">Evento objetivo opcional</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <select className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onSetEventType(event.target.value as PlanningEventType)} value={eventType}>{planningEventTypes.map((type) => <option key={type}>{type}</option>)}</select>
                  <input className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onSetEventName(event.target.value)} placeholder="Nombre del evento" value={eventName} />
                  <input className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onSetPeakDate(event.target.value)} type="date" value={peakDate} />
                </div>
              </details>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-semibold text-ink">¿Cómo se divide el plan?</h3><p className="mt-1 text-sm text-ink/55">{totalWeeks} semanas · {blocks.length} mesociclos</p></div></div>
              <div className="grid gap-3 md:grid-cols-2">
                {blocks.map((block, index) => (
                  <article className="rounded-md border border-line bg-panel/30 p-3" key={block.id}>
                    <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold uppercase text-moss">Mesociclo {index + 1}</p><span className="text-xs font-semibold text-ink/45">Semanas {block.startWeek}-{block.endWeek}</span></div>
                    <label className="mt-2 block space-y-1 text-xs font-semibold text-ink/60">Nombre<input className="h-10 w-full rounded-md border border-line bg-white px-3 font-semibold text-ink" onChange={(event) => onUpdateBlock(block.id, { name: event.target.value })} value={block.name} /></label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2"><PlanningBlockTaxonomyFields block={block} onUpdate={(updates) => onUpdateBlock(block.id, updates)} /></div>
                    <details className="mt-2 rounded-md border border-line bg-white/60 px-3 py-2"><summary className="cursor-pointer text-xs font-semibold text-ink/55">Notas opcionales</summary><textarea className="mt-2 min-h-16 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink" onChange={(event) => onUpdateBlock(block.id, { notes: event.target.value })} value={block.notes} /></details>
                    <div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-semibold text-ink">{block.durationWeeks} semanas</span><div className="flex gap-2"><button className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40" disabled={block.durationWeeks <= 1} onClick={() => onChangeBlockDuration(block.id, -1)} type="button">− Semana</button><button className="rounded-md border border-moss/25 bg-mint px-3 py-1.5 text-xs font-semibold text-moss" onClick={() => onChangeBlockDuration(block.id, 1)} type="button">+ Semana</button></div></div>
                  </article>
                ))}
              </div>
              <section className="rounded-md border border-dashed border-line p-3"><p className="text-sm font-semibold text-ink">Añadir mesociclo</p><div className="mt-2 grid gap-2 sm:grid-cols-[1fr_140px_auto]"><input className="h-10 rounded-md border border-line bg-white px-3 text-sm text-ink" onChange={(event) => onSetNewBlock((block) => ({ ...block, name: event.target.value }))} value={newBlock.name} /><select className="h-10 rounded-md border border-line bg-white px-2 text-sm text-ink" onChange={(event) => onSetNewBlock((block) => ({ ...block, durationWeeks: Number(event.target.value) }))} value={newBlock.durationWeeks}>{Array.from({ length: 12 }, (_, index) => index + 1).map((weeks) => <option key={weeks} value={weeks}>{weeks} sem.</option>)}</select><button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onAddBlock} type="button">Añadir</button></div></section>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <div><h3 className="text-xl font-semibold text-ink">¿Cómo se organiza una semana tipo?</h3><p className="mt-1 text-sm text-ink/55">Los días vacíos son descanso. La frecuencia es una referencia y no bloquea decisiones.</p></div>
              {blocks.map((block, blockIndex) => {
                const configuredCount = (block.weeklyTemplate ?? []).filter((day) => Boolean(day.sessionName.trim() || day.sessionType.trim() || day.sessionGoal?.trim())).length;
                const exceedsFrequency = configuredCount > weeklyFrequency;
                return <section className="rounded-md border border-line bg-panel/25 p-3" key={block.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h4 className="font-semibold text-ink">{block.name}</h4><p className="mt-1 text-xs text-ink/50">Frecuencia prevista: {weeklyFrequency} sesiones/semana</p><p className={`mt-0.5 text-xs font-semibold ${configuredCount === weeklyFrequency ? "text-moss" : exceedsFrequency ? "text-clay" : "text-steel"}`}>Configuradas: {configuredCount} de {weeklyFrequency}</p>{exceedsFrequency ? <p className="mt-1 text-xs text-clay">Has configurado {configuredCount} sesiones, pero la frecuencia prevista es {weeklyFrequency}.</p> : null}</div>
                    {blockIndex > 0 ? <button className="text-xs font-semibold text-moss" onClick={() => onCopyBlockConfiguration(blockIndex - 1, blockIndex, "week")} type="button">Copiar semana anterior</button> : null}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{planningWeekdayLabels.map((day, dayIndex) => {
                    const value = block.weeklyTemplate?.find((item) => item.dayIndex === dayIndex);
                    const hasSession = Boolean(value && (value.sessionName.trim() || value.sessionType.trim() || value.sessionGoal?.trim() || value.notes.trim()));
                    return <article className="rounded-md border border-line bg-white p-3" key={day}>
                      <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{day}</p>{hasSession ? <button className="text-xs font-semibold text-ink/45 hover:text-clay" onClick={() => onUpdateDay(block.id, dayIndex, { notes: "", sessionGoal: "", sessionGoalId: undefined, sessionGoalOther: undefined, sessionName: "", sessionType: "", sessionTypeId: undefined, sessionTypeOther: undefined })} type="button">Quitar</button> : null}</div>
                      {hasSession ? <><input aria-label={`${day}: nombre de sesión`} className="mt-2 h-9 w-full rounded border border-line bg-panel/30 px-2 text-sm font-semibold text-ink" onChange={(event) => onUpdateDay(block.id, dayIndex, { sessionName: event.target.value })} placeholder="Nombre de sesión" value={value?.sessionName ?? ""} /><PlanningSessionTaxonomyFields day={value} onUpdate={(updates) => onUpdateDay(block.id, dayIndex, updates)} /><input aria-label={`${day}: notas opcionales`} className="mt-2 h-9 w-full rounded border border-line bg-panel/30 px-2 text-xs text-ink" onChange={(event) => onUpdateDay(block.id, dayIndex, { notes: event.target.value })} placeholder="Notas opcionales" value={value?.notes ?? ""} /></> : <div className="mt-3"><p className="text-sm text-ink/45">Descanso / Sin sesión</p><button className="mt-3 rounded-md border border-line bg-panel/35 px-3 py-2 text-xs font-semibold text-steel" onClick={() => onUpdateDay(block.id, dayIndex, { sessionName: "Nueva sesión" })} type="button">+ Añadir sesión</button></div>}
                    </article>;
                  })}</div>
                </section>;
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4"><div><h3 className="text-xl font-semibold text-ink">Prescripción por defecto</h3><p className="mt-1 text-sm text-ink/55">Una propuesta inicial editable por rol. Cada ejercicio podrá personalizarse después.</p></div>{blocks.map((block, blockIndex) => { const preset = getPrescriptionPreset(block.phaseId, getBlockPrimaryGoalId(block)); return <section className="rounded-md border border-line bg-panel/25 p-3" key={block.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold text-ink">{block.name}</h4><p className="mt-1 text-xs font-semibold text-steel">{preset ? `Propuesta inicial basada en fase y objetivo · ${preset.label}` : block.phaseId === "deload" ? "Sin propuesta automática · ajusta respecto al bloque anterior" : "Sin propuesta automática para este objetivo"}</p></div><div className="flex flex-wrap gap-3">{preset ? <button className="text-xs font-semibold text-moss" onClick={() => onUpdateBlock(block.id, { prescriptionDefaults: Object.fromEntries(planningPrescriptionRoles.map((role) => [role.id, getPrescriptionFromPreset(role.id, block)])) as Partial<Record<PlanningPrescriptionRole, PlanningPrescriptionDefault>> })} type="button">Restaurar propuesta</button> : null}{blockIndex > 0 ? <button className="text-xs font-semibold text-moss" onClick={() => onCopyBlockConfiguration(blockIndex - 1, blockIndex, "prescription")} type="button">Copiar anterior</button> : null}<button className="text-xs font-semibold text-steel" onClick={() => blocks.forEach((candidate, index) => index > blockIndex && onCopyBlockConfiguration(blockIndex, index, "prescription"))} type="button">Aplicar al resto</button></div></div><div className="mt-3 grid gap-2">{planningPrescriptionRoles.map((role) => <PlanningPrescriptionRow defaults={getBlockPrescriptionDefault(block, role.id)} key={role.id} label={role.label} onUpdate={(updates) => onUpdatePrescription(block.id, role.id, updates)} />)}</div></section>; })}</div>
          ) : null}

          {step === 4 ? (
            <PlanningExerciseMatrix
              blocks={blocks}
              exerciseSlots={exerciseSlots}
              onAddSlot={onAddExerciseSlot}
              onCopyForward={onCopyExerciseForward}
              onCopyFromBlock={onCopyExercisesFromBlock}
              onDeleteSlot={onDeleteExerciseSlot}
              onUpdateSlot={onUpdateExerciseSlot}
            />
          ) : null}

          {step === 5 ? (
            <div className="grid gap-4"><div><h3 className="text-xl font-semibold text-ink">Revisa la planificación</h3><p className="mt-1 text-sm text-ink/55">Comprueba la estructura antes de volver al timeline.</p></div><section className="highlight-summary-card rounded-md p-4"><p className="text-xs font-semibold uppercase text-blue-300">Plan</p><h4 className="mt-1 text-lg font-semibold text-white">{planName || "Plan sin nombre"}</h4><p className="mt-1 text-sm text-white/65">{getPlanningMethodLabel(planningMethod)} · {totalWeeks} semanas · {weeklyFrequency} sesiones/semana</p></section><div className="grid gap-3 md:grid-cols-2">{blocks.map((block, index) => { const activeDayIndexes = new Set(blocks.flatMap((candidate) => (candidate.weeklyTemplate ?? []).filter((day) => day.sessionName.trim()).map((day) => day.dayIndex))); const activeSlots = exerciseSlots.filter((slot) => activeDayIndexes.has(slot.dayIndex)); const exerciseCount = activeSlots.filter((slot) => slot.exerciseByBlock[block.id]).length; const changeCount = index === 0 ? 0 : activeSlots.filter((slot) => (slot.exerciseByBlock[block.id] ?? null) !== (slot.exerciseByBlock[blocks[index - 1].id] ?? null)).length; const secondaryGoals = getBlockSecondaryGoalLabels(block); return <article className="rounded-md border border-line bg-panel/30 p-3" key={block.id}><p className="text-xs font-semibold uppercase text-moss">M{index + 1} · {block.durationWeeks} semanas</p><h4 className="mt-1 font-semibold text-ink">{block.name}</h4><p className="mt-1 text-xs font-semibold text-steel">{getBlockPhaseLabel(block)}</p><p className="mt-1 text-sm text-ink/65">{getBlockPrimaryGoalLabel(block)}</p>{secondaryGoals.length > 0 ? <p className="mt-1 text-xs text-ink/50">Secundarios: {secondaryGoals.join(" · ")}</p> : null}<div className="mt-3 flex flex-wrap gap-1.5">{planningPrescriptionRoles.map((role) => <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55" key={role.id}>{role.label}: {getPrescriptionDefaultSummary(getBlockPrescriptionDefault(block, role.id))}</span>)}</div><p className="mt-3 text-xs leading-relaxed text-ink/50">Semana tipo: {(block.weeklyTemplate ?? []).map((day) => `${planningWeekdayLabels[day.dayIndex].slice(0, 1)} · ${getPlanningDaySessionTypeLabel(day)} · ${getPlanningDaySessionGoalLabel(day)}`).join(" · ") || "Sin sesiones tipo"}</p><p className="mt-2 text-xs font-semibold text-steel">Ejercicios: {exerciseCount}{index > 0 ? ` · ${changeCount} cambios` : ""}</p></article>; })}</div></div>
          ) : null}
        </div>

        <footer className="assessment-modal-footer flex items-center justify-between gap-3 px-4 py-4 sm:px-6"><button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/65 disabled:opacity-40" disabled={step === 0} onClick={() => onSetStep(Math.max(0, step - 1))} type="button">Atrás</button>{step < planningWizardSteps.length - 1 ? <button className="rounded-md bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={!canContinue} onClick={() => onSetStep(step + 1)} type="button">Continuar</button> : <button className="rounded-md bg-ink px-5 py-2 text-sm font-semibold text-white" onClick={onFinish} type="button">Guardar planificación</button>}</footer>
      </section>
    </div>
  );
}

function PlanningExerciseCell({
  blockIndex,
  changed,
  exerciseId,
  onChange,
  onCopyForward,
  showCopyForward
}: {
  blockIndex: number;
  changed: boolean;
  exerciseId: string | null;
  onChange: (exerciseId: string | null) => void;
  onCopyForward: () => void;
  showCopyForward: boolean;
}) {
  const selectedExercise = exerciseId ? getExerciseById(exerciseId) : null;
  const [query, setQuery] = useState("");
  const matches = searchExercises(query).slice(0, 8);

  return (
    <div className={`min-w-44 rounded-md border p-2 ${changed ? "border-steel/50 bg-sky/35" : "border-line bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase text-ink/40">M{blockIndex + 1}</span>
        {changed ? <span className="text-[10px] font-semibold text-steel">Cambio</span> : null}
      </div>
      <input
        className="mt-1 h-8 w-full rounded border border-line bg-panel/30 px-2 text-xs text-ink"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={selectedExercise?.name ?? "Buscar ejercicio"}
        value={query}
      />
      <select
        aria-label={`Ejercicio M${blockIndex + 1}`}
        className="mt-1 h-9 w-full rounded border border-line bg-white px-2 text-xs font-semibold text-ink"
        onChange={(event) => { onChange(event.target.value || null); setQuery(""); }}
        value={exerciseId ?? ""}
      >
        <option value="">Sin ejercicio</option>
        {selectedExercise && !matches.some((exercise) => exercise.id === selectedExercise.id) ? <option value={selectedExercise.id}>{selectedExercise.name}</option> : null}
        {matches.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
      </select>
      {showCopyForward && exerciseId ? <button className="mt-1 text-[11px] font-semibold text-moss" onClick={onCopyForward} type="button">Copiar hacia delante</button> : null}
    </div>
  );
}

function PlanningExerciseMatrix({
  blocks,
  exerciseSlots,
  onAddSlot,
  onCopyForward,
  onCopyFromBlock,
  onDeleteSlot,
  onUpdateSlot
}: {
  blocks: PlanningRoadmapBlock[];
  exerciseSlots: PlanningExerciseSlot[];
  onAddSlot: (dayIndex: number, role: PlanningPrescriptionRole) => void;
  onCopyForward: (slotId: string, sourceBlockIndex: number) => void;
  onCopyFromBlock: (sourceBlockIndex: number, targetBlockIndex: number) => void;
  onDeleteSlot: (slotId: string) => void;
  onUpdateSlot: (slotId: string, blockId: string, exerciseId: string | null) => void;
}) {
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [mobileBlockId, setMobileBlockId] = useState(blocks[0]?.id ?? "");
  const [newRoleByDay, setNewRoleByDay] = useState<Record<number, PlanningPrescriptionRole>>({});
  const roleOrder = new Map(planningPrescriptionRoles.map((role, index) => [role.id, index]));
  const sortSlots = (first: PlanningExerciseSlot, second: PlanningExerciseSlot) =>
    (roleOrder.get(first.role) ?? 0) - (roleOrder.get(second.role) ?? 0) || first.order - second.order;
  const configuredDayIndexes = planningWeekdayLabels
    .map((_, dayIndex) => dayIndex)
    .filter((dayIndex) => blocks.some((block) => block.weeklyTemplate?.some((day) => day.dayIndex === dayIndex && day.sessionName.trim())));
  const activeExerciseSlots = exerciseSlots.filter((slot) => configuredDayIndexes.includes(slot.dayIndex));
  const visibleSlots = activeExerciseSlots.filter((slot) => {
    if (!onlyChanges) return true;
    return blocks.some((block, index) => index > 0 && (slot.exerciseByBlock[block.id] ?? null) !== (slot.exerciseByBlock[blocks[index - 1].id] ?? null));
  });
  const activeMobileBlockIndex = Math.max(0, blocks.findIndex((block) => block.id === mobileBlockId));
  const activeMobileBlock = blocks[activeMobileBlockIndex] ?? blocks[0];
  const roleLabel = (role: PlanningPrescriptionRole) => planningPrescriptionRoles.find((item) => item.id === role)?.label ?? role;
  const getSessionLabel = (dayIndex: number) => {
    const day = blocks.flatMap((block) => block.weeklyTemplate ?? []).find((item) => item.dayIndex === dayIndex && item.sessionName.trim());
    return `${planningWeekdayLabels[dayIndex]}${day ? ` · ${day.sessionName}` : ""}`;
  };
  const getSlotLabel = (slot: PlanningExerciseSlot) => {
    const sameRole = exerciseSlots.filter((candidate) => candidate.dayIndex === slot.dayIndex && candidate.role === slot.role).sort((a, b) => a.order - b.order);
    return `${roleLabel(slot.role)} ${sameRole.findIndex((candidate) => candidate.id === slot.id) + 1}`;
  };

  if (configuredDayIndexes.length === 0) {
    return <div className="rounded-md border border-dashed border-line bg-panel/30 p-5"><h3 className="font-semibold text-ink">Ejercicios</h3><p className="mt-1 text-sm text-ink/55">Configura primero al menos una sesión en la semana tipo.</p></div>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h3 className="text-xl font-semibold text-ink">Evolución de ejercicios</h3><p className="mt-1 text-sm text-ink/55">Configura M1, copia lo repetido y modifica solo las excepciones.</p></div>
        <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/65"><input checked={onlyChanges} onChange={(event) => setOnlyChanges(event.target.checked)} type="checkbox" />Solo cambios</label>
      </div>
      {activeExerciseSlots.length > 0 && blocks.length > 1 ? <button className="w-fit rounded-md border border-moss/25 bg-mint px-3 py-2 text-sm font-semibold text-moss" onClick={() => blocks.slice(1).forEach((_, index) => onCopyFromBlock(0, index + 1))} type="button">Copiar M1 al resto</button> : null}

      <div className="hidden overflow-x-auto rounded-md border border-line md:block">
        <div style={{ minWidth: `${260 + blocks.length * 210}px` }}>
          <div className="grid border-b border-line bg-panel/55" style={{ gridTemplateColumns: `260px repeat(${blocks.length}, minmax(190px, 1fr))` }}>
            <div className="sticky left-0 z-10 bg-panel/95 p-3 text-xs font-semibold uppercase text-ink/45">Sesión / slot</div>
            {blocks.map((block, index) => <div className="border-l border-line p-3" key={block.id}><p className="text-xs font-semibold text-moss">M{index + 1}</p><p className="truncate text-sm font-semibold text-ink">{block.name}</p>{index > 0 ? <button className="mt-1 text-xs font-semibold text-steel" onClick={() => onCopyFromBlock(index - 1, index)} type="button">Copiar anterior</button> : null}</div>)}
          </div>
          {configuredDayIndexes.map((dayIndex) => {
            const daySlots = visibleSlots.filter((slot) => slot.dayIndex === dayIndex).sort(sortSlots);
            return <section className="border-b border-line last:border-b-0" key={dayIndex}><div className="bg-panel/35 px-3 py-2 text-xs font-semibold uppercase text-ink/55">{getSessionLabel(dayIndex)}</div>{daySlots.map((slot) => <div className="grid border-t border-line/70" key={slot.id} style={{ gridTemplateColumns: `260px repeat(${blocks.length}, minmax(190px, 1fr))` }}><div className="sticky left-0 z-10 flex items-center justify-between gap-2 bg-white p-3"><div><p className="text-sm font-semibold text-ink">{getSlotLabel(slot)}</p><p className="text-xs text-ink/45">Rol estable del programa</p></div><button aria-label={`Eliminar ${getSlotLabel(slot)}`} className="grid size-8 place-items-center rounded border border-line text-ink/40" onClick={() => onDeleteSlot(slot.id)} type="button"><Trash2 size={14} /></button></div>{blocks.map((block, index) => { const current = slot.exerciseByBlock[block.id] ?? null; const previous = index > 0 ? slot.exerciseByBlock[blocks[index - 1].id] ?? null : null; return <div className="border-l border-line p-2" key={block.id}><PlanningExerciseCell blockIndex={index} changed={index > 0 && current !== previous} exerciseId={current} onChange={(exerciseId) => onUpdateSlot(slot.id, block.id, exerciseId)} onCopyForward={() => onCopyForward(slot.id, index)} showCopyForward={index < blocks.length - 1} /></div>; })}</div>)}{!onlyChanges ? <div className="flex items-center gap-2 border-t border-line/70 p-2"><select className="h-9 rounded border border-line bg-white px-2 text-xs font-semibold text-ink" onChange={(event) => setNewRoleByDay((current) => ({ ...current, [dayIndex]: event.target.value as PlanningPrescriptionRole }))} value={newRoleByDay[dayIndex] ?? "principal"}>{planningPrescriptionRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select><button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink" onClick={() => onAddSlot(dayIndex, newRoleByDay[dayIndex] ?? "principal")} type="button">+ Añadir ejercicio</button></div> : null}</section>;
          })}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">{blocks.map((block, index) => <button className={`shrink-0 rounded-md border px-3 py-2 text-xs font-semibold ${activeMobileBlock?.id === block.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink/55"}`} key={block.id} onClick={() => setMobileBlockId(block.id)} type="button">M{index + 1}</button>)}</div>
        {activeMobileBlockIndex > 0 ? <button className="w-fit text-xs font-semibold text-steel" onClick={() => onCopyFromBlock(activeMobileBlockIndex - 1, activeMobileBlockIndex)} type="button">Copiar anterior</button> : null}
        {configuredDayIndexes.map((dayIndex) => { const daySlots = visibleSlots.filter((slot) => slot.dayIndex === dayIndex).sort(sortSlots); return <section className="rounded-md border border-line bg-panel/25 p-3" key={dayIndex}><h4 className="text-xs font-semibold uppercase text-ink/55">{getSessionLabel(dayIndex)}</h4><div className="mt-2 grid gap-2">{daySlots.map((slot) => { const current = activeMobileBlock ? slot.exerciseByBlock[activeMobileBlock.id] ?? null : null; const previous = activeMobileBlockIndex > 0 ? slot.exerciseByBlock[blocks[activeMobileBlockIndex - 1].id] ?? null : null; return <article className="rounded-md border border-line bg-white p-2" key={slot.id}><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-ink">{getSlotLabel(slot)}</p><button aria-label={`Eliminar ${getSlotLabel(slot)}`} className="text-ink/40" onClick={() => onDeleteSlot(slot.id)} type="button"><Trash2 size={14} /></button></div>{activeMobileBlock ? <PlanningExerciseCell blockIndex={activeMobileBlockIndex} changed={activeMobileBlockIndex > 0 && current !== previous} exerciseId={current} onChange={(exerciseId) => onUpdateSlot(slot.id, activeMobileBlock.id, exerciseId)} onCopyForward={() => onCopyForward(slot.id, activeMobileBlockIndex)} showCopyForward={activeMobileBlockIndex < blocks.length - 1} /> : null}</article>; })}</div>{!onlyChanges ? <div className="mt-2 flex gap-2"><select className="h-9 min-w-0 flex-1 rounded border border-line bg-white px-2 text-xs font-semibold text-ink" onChange={(event) => setNewRoleByDay((current) => ({ ...current, [dayIndex]: event.target.value as PlanningPrescriptionRole }))} value={newRoleByDay[dayIndex] ?? "principal"}>{planningPrescriptionRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select><button className="rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink" onClick={() => onAddSlot(dayIndex, newRoleByDay[dayIndex] ?? "principal")} type="button">+ Añadir ejercicio</button></div> : null}</section>; })}
      </div>
      {activeExerciseSlots.length === 0 ? <p className="rounded-md border border-dashed border-line p-4 text-sm text-ink/55">Sin estructura de ejercicios configurada.</p> : onlyChanges && visibleSlots.length === 0 ? <p className="rounded-md border border-dashed border-line p-4 text-sm text-ink/55">No hay cambios de ejercicios entre mesociclos.</p> : null}
    </div>
  );
}

type PlanningExerciseChange = {
  currentExerciseId: string | null;
  previousExerciseId: string | null;
  slot: PlanningExerciseSlot;
  type: "added" | "changed" | "removed";
};

function getPlanningActiveDayIndexes(block: EditablePlanningBlock) {
  return new Set((block.weeklyTemplate ?? []).filter((day) => day.sessionName.trim()).map((day) => day.dayIndex));
}

function getPlanningSets(value: string) {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const sets = Number(normalized);
  return sets > 0 ? sets : null;
}

function getPlanningSlotLabel(slot: PlanningExerciseSlot, slots: PlanningExerciseSlot[]) {
  const roleLabel = planningPrescriptionRoles.find((role) => role.id === slot.role)?.label ?? slot.role;
  const roleSlots = slots
    .filter((candidate) => candidate.dayIndex === slot.dayIndex && candidate.role === slot.role)
    .sort((first, second) => first.order - second.order);
  return `${planningWeekdayLabels[slot.dayIndex]} · ${roleLabel} ${roleSlots.findIndex((candidate) => candidate.id === slot.id) + 1}`;
}

function PlanningGlobalReview({
  blocks,
  exerciseSlots,
  onClose,
  planName,
  weeklyFrequency
}: {
  blocks: PlanningRoadmapBlock[];
  exerciseSlots: PlanningExerciseSlot[];
  onClose: () => void;
  planName: string;
  weeklyFrequency: number;
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0]?.id ?? "");
  const selectedBlockIndex = Math.max(0, blocks.findIndex((block) => block.id === selectedBlockId));
  const selectedBlock = blocks[selectedBlockIndex] ?? blocks[0];
  const totalWeeks = blocks.reduce((total, block) => total + block.durationWeeks, 0);
  const configuredSlots = exerciseSlots.filter((slot) => blocks.some((block) =>
    getPlanningActiveDayIndexes(block).has(slot.dayIndex) && Boolean(slot.exerciseByBlock[block.id])
  ));
  const goalOrientation = new Map<string, { primary: number; secondary: number }>();

  blocks.forEach((block) => {
    const primaryLabel = getBlockPrimaryGoalLabel(block);
    if (primaryLabel !== "Sin definir") {
      const current = goalOrientation.get(primaryLabel) ?? { primary: 0, secondary: 0 };
      goalOrientation.set(primaryLabel, { ...current, primary: current.primary + 1 });
    }
    getBlockSecondaryGoalLabels(block).forEach((label) => {
      const current = goalOrientation.get(label) ?? { primary: 0, secondary: 0 };
      goalOrientation.set(label, { ...current, secondary: current.secondary + 1 });
    });
  });

  const blockReviews = blocks.map((block, blockIndex) => {
    const activeDayIndexes = getPlanningActiveDayIndexes(block);
    const activeDays = (block.weeklyTemplate ?? []).filter((day) => day.sessionName.trim());
    const blockSlots = exerciseSlots.filter((slot) => activeDayIndexes.has(slot.dayIndex) && Boolean(slot.exerciseByBlock[block.id]));
    const roleSeries = Object.fromEntries(planningPrescriptionRoles.map((role) => [role.id, 0])) as Record<PlanningPrescriptionRole, number>;
    const invalidSeriesSlots = blockSlots.filter((slot) => {
      const sets = getPlanningSets(getBlockPrescriptionDefault(block, slot.role).sets);
      if (sets === null) return true;
      roleSeries[slot.role] += sets;
      return false;
    });
    const weeklySeries = blockSlots.length > 0 && invalidSeriesSlots.length === 0
      ? Object.values(roleSeries).reduce((total, series) => total + series, 0)
      : null;
    let plyometricMinimum = 0;
    let plyometricMaximum = 0;
    let hasIncompletePlyometricExercise = false;
    blockSlots.forEach((slot) => {
      const exerciseId = slot.exerciseByBlock[block.id];
      const exercise = exerciseId ? getExerciseById(exerciseId) : null;
      if (exercise?.exerciseType !== "plyometric") return;
      const defaults = getBlockPrescriptionDefault(block, slot.role);
      const contacts = getPlannedRepetitionTotal({ plannedReps: getPrescriptionRange(defaults.repsMin, defaults.repsMax), plannedSets: defaults.sets, setMethod: "straight" });
      if (!contacts.complete || contacts.minimum === null || contacts.maximum === null) {
        hasIncompletePlyometricExercise = true;
        return;
      }
      plyometricMinimum += contacts.minimum;
      plyometricMaximum += contacts.maximum;
    });
    const plyometricContacts = hasIncompletePlyometricExercise
      ? null
      : { complete: true, maximum: plyometricMaximum, minimum: plyometricMinimum };
    const sessionTypes = activeDays.reduce<Map<string, number>>((counts, day) => {
      const label = getPlanningDaySessionTypeLabel(day);
      counts.set(label, (counts.get(label) ?? 0) + 1);
      return counts;
    }, new Map());
    const sessionGoals = activeDays.reduce<Map<string, number>>((counts, day) => {
      const label = getPlanningDaySessionGoalLabel(day);
      counts.set(label, (counts.get(label) ?? 0) + 1);
      return counts;
    }, new Map());
    const previousBlock = blockIndex > 0 ? blocks[blockIndex - 1] : null;
    const previousActiveDays = previousBlock ? getPlanningActiveDayIndexes(previousBlock) : new Set<number>();
    const changes: PlanningExerciseChange[] = [];
    let maintained = 0;

    if (previousBlock) {
      exerciseSlots.forEach((slot) => {
        const previousExerciseId = previousActiveDays.has(slot.dayIndex) ? slot.exerciseByBlock[previousBlock.id] ?? null : null;
        const currentExerciseId = activeDayIndexes.has(slot.dayIndex) ? slot.exerciseByBlock[block.id] ?? null : null;
        if (previousExerciseId && currentExerciseId && previousExerciseId === currentExerciseId) maintained += 1;
        else if (previousExerciseId && currentExerciseId) changes.push({ currentExerciseId, previousExerciseId, slot, type: "changed" });
        else if (currentExerciseId) changes.push({ currentExerciseId, previousExerciseId: null, slot, type: "added" });
        else if (previousExerciseId) changes.push({ currentExerciseId: null, previousExerciseId, slot, type: "removed" });
      });
    }

    return {
      activeDays,
      block,
      changes,
      invalidSeriesSlots,
      maintained,
      plyometricContacts,
      roleSeries,
      sessionGoals,
      sessionTypes,
      weeklySeries
    };
  });
  const selectedReview = blockReviews[selectedBlockIndex] ?? blockReviews[0];
  const maxWeeklySeries = Math.max(1, ...blockReviews.map((review) => review.weeklySeries ?? 0));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!selectedBlock || !selectedReview) return null;

  return (
    <div className="assessment-modal-overlay" onClick={onClose} role="presentation">
      <section aria-labelledby="planning-global-review-title" aria-modal="true" className="assessment-modal-panel !max-h-[92vh] !w-full !max-w-7xl" onClick={(event) => event.stopPropagation()} role="dialog">
        <header className="assessment-modal-header flex items-start justify-between gap-4 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">Planificación</p>
            <h2 className="mt-1 text-xl font-semibold text-ink sm:text-2xl" id="planning-global-review-title">Revisión global</h2>
            <p className="mt-1 text-sm text-ink/55">Lectura descriptiva de la configuración planificada.</p>
          </div>
          <button aria-label="Cerrar revisión global" className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-lg font-semibold text-ink/70" onClick={onClose} type="button">×</button>
        </header>

        <div className="assessment-modal-body grid gap-5 px-4 py-4 sm:px-5 sm:py-5">
          <section className="highlight-summary-card rounded-md p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Plan</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{planName || "Plan sin nombre"}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><p className="text-white/55">Duración</p><p className="mt-0.5 font-semibold text-white">{totalWeeks} semanas</p></div>
              <div><p className="text-white/55">Mesociclos</p><p className="mt-0.5 font-semibold text-white">{blocks.length}</p></div>
              <div><p className="text-white/55">Sesiones tipo</p><p className="mt-0.5 font-semibold text-white">{weeklyFrequency > 0 ? `${weeklyFrequency} por semana` : "Sin configurar"}</p></div>
              <div><p className="text-white/55">Ejercicios configurados</p><p className="mt-0.5 font-semibold text-white">{configuredSlots.length} {configuredSlots.length === 1 ? "slot" : "slots"}</p></div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/30 p-4">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-ink">Timeline resumido</h3><p className="mt-1 text-xs text-ink/50">Fase, objetivo principal y duración de cada mesociclo.</p></div></div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {blocks.map((block, index) => <button className={`min-w-[180px] flex-1 rounded-md border p-3 text-left transition ${selectedBlock.id === block.id ? "border-moss bg-mint/45" : "border-line bg-white"}`} key={block.id} onClick={() => setSelectedBlockId(block.id)} type="button"><p className="text-xs font-semibold text-moss">M{index + 1}</p><p className="mt-1 truncate text-sm font-semibold text-ink">{getBlockPhaseLabel(block)}</p><p className="mt-1 truncate text-xs text-ink/60">{getBlockPrimaryGoalLabel(block)}</p><p className="mt-2 text-xs font-semibold text-steel">{block.durationWeeks} {block.durationWeeks === 1 ? "semana" : "semanas"}</p></button>)}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-md border border-line bg-white p-4">
              <h3 className="font-semibold text-ink">Orientación del plan</h3>
              <p className="mt-1 text-xs text-ink/50">Presencia descriptiva de objetivos principales y secundarios.</p>
              {goalOrientation.size > 0 ? <div className="mt-3 grid gap-2">{[...goalOrientation.entries()].map(([label, counts]) => <div className="flex items-center justify-between gap-3 rounded-md bg-panel/45 px-3 py-2 text-sm" key={label}><span className="font-semibold text-ink">{label}</span><span className="text-right text-xs text-ink/55">{counts.primary > 0 ? `${counts.primary} ${counts.primary === 1 ? "principal" : "principales"}` : ""}{counts.primary > 0 && counts.secondary > 0 ? " · " : ""}{counts.secondary > 0 ? `${counts.secondary} ${counts.secondary === 1 ? "secundario" : "secundarios"}` : ""}</span></div>)}</div> : <p className="mt-3 text-sm text-ink/50">Sin objetivos configurados.</p>}
            </section>

            <section className="rounded-md border border-line bg-white p-4">
              <div><h3 className="font-semibold text-ink">Series planificadas / semana</h3><p className="mt-1 text-xs text-ink/50" title="Estimación estructural a partir de los ejercicios configurados y los defaults de prescripción del mesociclo.">Estimación estructural basada en slots configurados y prescripción por rol.</p></div>
              <div className="mt-4 grid gap-3">{blockReviews.map((review, index) => <div className="rounded-md border border-line bg-panel/20 p-2" key={review.block.id}><div className="grid grid-cols-[36px_1fr_auto] items-center gap-2"><span className="text-xs font-semibold text-moss">M{index + 1}</span><div className="h-2 overflow-hidden rounded-full bg-panel"><div className="h-full rounded-full bg-steel" style={{ width: review.weeklySeries === null ? "0%" : `${Math.max(5, (review.weeklySeries / maxWeeklySeries) * 100)}%` }} /></div><span className="min-w-24 text-right text-xs font-semibold text-ink/60">{review.weeklySeries === null ? "Datos insuficientes" : `${review.weeklySeries} series`}</span></div><div className="mt-1 flex items-center justify-between gap-3 pl-9 text-xs"><span className="text-ink/45">Contactos pliométricos</span><span className="font-semibold text-ink/60">{review.plyometricContacts === null ? "Datos insuficientes" : formatRepetitionTotal(review.plyometricContacts, "contactos")}</span></div></div>)}</div>
            </section>
          </div>

          <section className="rounded-md border border-line bg-panel/30 p-4">
            <h3 className="font-semibold text-ink">Tipos y objetivos de sesión</h3>
            <p className="mt-1 text-xs text-ink/50">Conteos de la semana tipo de cada mesociclo.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{blockReviews.map((review, index) => <article className="rounded-md border border-line bg-white p-3" key={review.block.id}><p className="text-xs font-semibold text-moss">M{index + 1} · {review.activeDays.length} {review.activeDays.length === 1 ? "sesión" : "sesiones"}</p><div className="mt-2 grid gap-1">{review.sessionTypes.size > 0 ? [...review.sessionTypes.entries()].map(([label, count]) => <div className="flex justify-between gap-2 text-sm" key={label}><span className="text-ink/65">{label}</span><span className="font-semibold text-ink">{count}</span></div>) : <p className="text-sm text-ink/45">Sin configurar</p>}</div>{review.sessionGoals.size > 0 ? <details className="mt-3 border-t border-line pt-2"><summary className="cursor-pointer text-xs font-semibold text-steel">Objetivos de sesión</summary><div className="mt-2 grid gap-1">{[...review.sessionGoals.entries()].map(([label, count]) => <div className="flex justify-between gap-2 text-xs" key={label}><span className="text-ink/55">{label}</span><span className="font-semibold text-ink/70">{count}</span></div>)}</div></details> : null}</article>)}</div>
          </section>

          <section className="rounded-md border border-line bg-white p-4">
            <h3 className="font-semibold text-ink">Prescripción por rol</h3>
            <p className="mt-1 text-xs text-ink/50">Comparación de series, repeticiones, RIR y descanso configurados. No representa intensidad externa.</p>
            <div className="mt-3 overflow-x-auto rounded-md border border-line">
              <div style={{ minWidth: `${190 + blocks.length * 170}px` }}>
                <div className="grid bg-panel/60" style={{ gridTemplateColumns: `190px repeat(${blocks.length}, minmax(160px, 1fr))` }}><div className="p-3 text-xs font-semibold uppercase text-ink/45">Rol</div>{blocks.map((block, index) => <div className="border-l border-line p-3 text-xs font-semibold text-moss" key={block.id}>M{index + 1}</div>)}</div>
                {planningPrescriptionRoles.map((role) => <details className="border-t border-line" key={role.id} open={role.id === "principal"}><summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-ink">{role.label}</summary><div className="grid border-t border-line/70" style={{ gridTemplateColumns: `190px repeat(${blocks.length}, minmax(160px, 1fr))` }}><div className="p-3 text-xs text-ink/50">Series · Reps · RIR · Descanso</div>{blocks.map((block) => { const defaults = getBlockPrescriptionDefault(block, role.id); return <div className="border-l border-line p-3 text-xs font-semibold text-ink/65" key={block.id}>{getPrescriptionDefaultSummary(defaults)}</div>; })}</div></details>)}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-panel/30 p-4">
            <h3 className="font-semibold text-ink">Continuidad de ejercicios</h3>
            <p className="mt-1 text-xs text-ink/50">Comparación de los slots configurados respecto al mesociclo anterior.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{blockReviews.map((review, index) => { const changed = review.changes.filter((change) => change.type === "changed").length; const added = review.changes.filter((change) => change.type === "added").length; const removed = review.changes.filter((change) => change.type === "removed").length; return <article className="rounded-md border border-line bg-white p-3" key={review.block.id}><p className="text-xs font-semibold text-moss">M{index + 1}</p>{index === 0 ? <p className="mt-2 text-sm text-ink/50">Bloque de referencia</p> : <><p className="mt-2 text-sm font-semibold text-ink">{review.changes.length} {review.changes.length === 1 ? "cambio" : "cambios"}</p><p className="mt-1 text-xs text-ink/50">{review.maintained} se mantienen · {changed} cambian · {added} aparecen · {removed} desaparecen</p>{review.changes.length > 0 ? <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-steel">Ver cambios</summary><div className="mt-2 grid gap-2">{review.changes.map((change) => <div className="rounded bg-panel/55 p-2 text-xs" key={`${review.block.id}-${change.slot.id}`}><p className="font-semibold text-ink/60">{getPlanningSlotLabel(change.slot, exerciseSlots)}</p><p className="mt-1 text-ink/55">{change.previousExerciseId ? getExerciseById(change.previousExerciseId)?.name ?? change.previousExerciseId : "Sin ejercicio"} → {change.currentExerciseId ? getExerciseById(change.currentExerciseId)?.name ?? change.currentExerciseId : "Sin ejercicio"}</p></div>)}</div></details> : null}</>}</article>; })}</div>
          </section>

          <section className="rounded-md border border-moss/25 bg-mint/25 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-moss">M{selectedBlockIndex + 1} · {getBlockPhaseLabel(selectedBlock)}</p><h3 className="mt-1 text-lg font-semibold text-ink">{selectedBlock.name}</h3></div><span className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink/55">{selectedBlock.durationWeeks} semanas</span></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div><p className="text-xs font-semibold text-ink/45">Objetivo principal</p><p className="mt-1 text-sm font-semibold text-ink">{getBlockPrimaryGoalLabel(selectedBlock)}</p>{getBlockSecondaryGoalLabels(selectedBlock).length > 0 ? <p className="mt-1 text-xs text-ink/55">Secundarios: {getBlockSecondaryGoalLabels(selectedBlock).join(" · ")}</p> : null}</div>
              <div><p className="text-xs font-semibold text-ink/45">Semana tipo</p><p className="mt-1 text-sm font-semibold text-ink">{selectedReview.activeDays.length} {selectedReview.activeDays.length === 1 ? "sesión" : "sesiones"}</p></div>
              <div><p className="text-xs font-semibold text-ink/45">Series planificadas</p><p className="mt-1 text-sm font-semibold text-ink">{selectedReview.weeklySeries === null ? "Datos insuficientes" : `${selectedReview.weeklySeries} por semana`}</p></div>
              <div><p className="text-xs font-semibold text-ink/45">Contactos pliométricos</p><p className="mt-1 text-sm font-semibold text-ink">{selectedReview.plyometricContacts === null ? "Datos insuficientes" : formatRepetitionTotal(selectedReview.plyometricContacts, "contactos")}</p></div>
              <div><p className="text-xs font-semibold text-ink/45">Cambios de ejercicio</p><p className="mt-1 text-sm font-semibold text-ink">{selectedBlockIndex === 0 ? "Bloque de referencia" : `${selectedReview.changes.length} respecto a M${selectedBlockIndex}`}</p></div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">{planningPrescriptionRoles.map((role) => <div className="rounded-md border border-line bg-white p-3" key={role.id}><p className="text-xs font-semibold text-moss">{role.label}</p><p className="mt-1 text-xs text-ink/60">{getPrescriptionDefaultSummary(getBlockPrescriptionDefault(selectedBlock, role.id))}</p>{selectedReview.weeklySeries !== null ? <p className="mt-1 text-xs font-semibold text-steel">{selectedReview.roleSeries[role.id]} series/semana</p> : null}</div>)}</div>
          </section>
        </div>
      </section>
    </div>
  );
}

function PlanningBlockDetail({
  block,
  client,
  copiedPlanningWeek,
  currentPlanningWeekNumber,
  exerciseSlots,
  isCurrentBlock,
  onAddSession,
  onBack,
  onCopyWeek,
  onCreateSession,
  onDeleteSession,
  onDuplicateSession,
  onOpenCreatedSession,
  onPasteWeek,
  onChangeDuration,
  onUpdateBlock,
  planningActionMessage,
  planningDistribution
}: {
  block: PlanningRoadmapBlock;
  client: CoachClient;
  copiedPlanningWeek: boolean;
  currentPlanningWeekNumber: number | null;
  exerciseSlots: PlanningExerciseSlot[];
  isCurrentBlock: boolean;
  onAddSession: (date: Date, weekNumber: number) => void;
  onBack: () => void;
  onCopyWeek: (week: PlanningCalendarWeek) => void;
  onCreateSession: (block: PlanningRoadmapBlock, target: PlanningSessionCreationTarget) => void;
  onDeleteSession: (sessionIndex: number, session: ReviewSessionRecord) => void;
  onDuplicateSession: (sessionIndex: number, date: Date, time?: string | null) => void;
  onOpenCreatedSession: (session: ClientSessionRecord) => void;
  onPasteWeek: (week: PlanningCalendarWeek) => void;
  onChangeDuration: (blockId: string, direction: -1 | 1) => void;
  onUpdateBlock: (blockId: string, updates: Partial<EditablePlanningBlock>) => void;
  planningActionMessage: string;
  planningDistribution: PlanningCalendarWeek[];
}) {
  const [creationWeekNumber, setCreationWeekNumber] = useState(block.startWeek);
  const [creationTarget, setCreationTarget] = useState<PlanningSessionCreationTarget | null>(null);
  const status = isCurrentBlock ? "En curso" : getPlanningBlockStatus(block, client.planning.currentBlock);
  const progress = getPlanningBlockProgress(client, block);
  const blockWeeks = planningDistribution.filter(
    (week) => week.weekNumber >= block.startWeek && week.weekNumber <= block.endWeek
  );
  const templateDays = [...(block.weeklyTemplate ?? [])]
    .filter((day) => day.sessionName.trim() || day.sessionType.trim() || day.sessionGoal?.trim())
    .sort((left, right) => left.dayIndex - right.dayIndex);
  const previewExercises = creationTarget ? exerciseSlots.flatMap((slot) => {
    if (slot.dayIndex !== creationTarget.day.dayIndex) return [];
    const exerciseId = slot.exerciseByBlock[block.id];
    const exercise = exerciseId ? getExerciseById(exerciseId) : null;
    return exercise ? [{ defaults: getBlockPrescriptionDefault(block, slot.role), exercise, slot }] : [];
  }) : [];

  useEffect(() => {
    setCreationWeekNumber(block.startWeek);
    setCreationTarget(null);
  }, [block.id, block.startWeek]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBack]);

  return (
    <div
      className="assessment-modal-overlay"
      onClick={onBack}
      role="presentation"
    >
      <section
        aria-labelledby="planning-block-detail-title"
        aria-modal="true"
        className="assessment-modal-panel !max-h-[90vh] !w-full !max-w-6xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="assessment-modal-header flex items-start justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">Detalle del bloque</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate text-xl font-semibold text-ink sm:text-2xl" id="planning-block-detail-title">{block.name}</h2>
              <span className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${getPlanningBlockStatusClass(status)}`}>
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-ink/55">
              {block.durationWeeks} semanas · Semana {block.startWeek}-{block.endWeek}
            </p>
          </div>
          <button
            aria-label="Cerrar detalle del bloque"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-lg font-semibold text-ink/70 transition hover:bg-mint"
            onClick={onBack}
            type="button"
          >
            ×
          </button>
        </header>

        <div className="assessment-modal-body px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-line bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Fase</p>
              <p className="mt-1 text-sm font-semibold text-ink">{getBlockPhaseLabel(block)}</p>
            </div>
            <div className="rounded-md border border-line bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Objetivo principal</p>
              <p className="mt-1 text-sm font-semibold text-ink">{getBlockPrimaryGoalLabel(block)}</p>
            </div>
            <div className="rounded-md border border-line bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Objetivos secundarios</p>
              <p className="mt-1 text-sm font-semibold text-ink">{getBlockSecondaryGoalLabels(block).join(" · ") || "Sin definir"}</p>
            </div>
            <div className="rounded-md border border-line bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Distribución semanal</p>
              <p className="mt-1 text-sm font-semibold text-ink">{block.weeklyDistribution || "Sin asignar"}</p>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-line bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Progreso del bloque</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {progress.totalSessions > 0 ? `${progress.completedSessions}/${progress.totalSessions} sesiones` : "Sin sesiones registradas"}
                </p>
              </div>
              <span className="rounded-md bg-panel px-2.5 py-1 text-sm font-semibold text-ink">{Math.round(progress.completionPct)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel">
              <div className="h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${progress.completionPct}%` }} />
            </div>
          </div>

          {block.notes ? (
            <p className="mt-3 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm text-ink/60">{block.notes}</p>
          ) : null}

          <details className="group mt-3 rounded-md border border-line bg-panel/35">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-semibold text-ink sm:px-4">
              Editar mesociclo
              <span className="text-ink/45 group-open:hidden">+</span>
              <span className="hidden text-ink/45 group-open:inline">−</span>
            </summary>
            <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Nombre
                <input
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => onUpdateBlock(block.id, { name: event.target.value })}
                  value={block.name}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Duración
                <span className="block rounded-md border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink">
                  {block.durationWeeks} {block.durationWeeks === 1 ? "semana" : "semanas"} · Semana {block.startWeek}-{block.endWeek}
                </span>
                <span className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={block.durationWeeks <= 1}
                    onClick={() => onChangeDuration(block.id, -1)}
                    type="button"
                  >
                    − Semana
                  </button>
                  <button
                    className="rounded-md border border-moss/25 bg-mint px-3 py-2 text-xs font-semibold text-moss transition hover:bg-mint/70"
                    onClick={() => onChangeDuration(block.id, 1)}
                    type="button"
                  >
                    + Semana
                  </button>
                </span>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Distribución semanal
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => onUpdateBlock(block.id, { weeklyDistribution: event.target.value as WeeklyDistribution })}
                  value={block.weeklyDistribution}
                >
                  {planningWeeklyDistributionOptions.map((distribution) => <option key={distribution}>{distribution}</option>)}
                </select>
              </label>
              <PlanningBlockTaxonomyFields block={block} onUpdate={(updates) => onUpdateBlock(block.id, updates)} />
              <label className="space-y-2 text-sm font-medium text-ink/75 sm:col-span-2">
                Notas opcionales
                <textarea
                  className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-moss"
                  onChange={(event) => onUpdateBlock(block.id, { notes: event.target.value })}
                  value={block.notes}
                />
              </label>
            </div>
          </details>

          <section className="mt-4 rounded-md border border-line bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-moss">Semana tipo</p>
                <h3 className="mt-1 font-semibold text-ink">Crear una sesión real</h3>
                <p className="mt-1 text-sm text-ink/55">Elige la semana del mesociclo. La sesión se creará como un snapshot independiente.</p>
              </div>
              <label className="w-full text-xs font-semibold text-ink/60 sm:w-44">
                Semana
                <select
                  className="mt-1 h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink"
                  onChange={(event) => setCreationWeekNumber(Number(event.target.value))}
                  value={creationWeekNumber}
                >
                  {Array.from({ length: block.durationWeeks }, (_, index) => block.startWeek + index).map((weekNumber) => (
                    <option key={weekNumber} value={weekNumber}>Semana {weekNumber}</option>
                  ))}
                </select>
              </label>
            </div>
            {templateDays.length > 0 ? (
              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {templateDays.map((day) => {
                  const createdSession = (client.sessionRecords ?? []).find((session) =>
                    session.planningOrigin?.blockId === block.id &&
                    session.planningOrigin.weekNumber === creationWeekNumber &&
                    session.planningOrigin.templateDayIndex === day.dayIndex
                  );
                  const configuredExercises = exerciseSlots.filter((slot) =>
                    slot.dayIndex === day.dayIndex && Boolean(slot.exerciseByBlock[block.id]) && Boolean(getExerciseById(slot.exerciseByBlock[block.id] ?? ""))
                  ).length;

                  return (
                    <article className="rounded-md border border-line bg-panel/30 p-3" key={`${block.id}-${day.dayIndex}`}>
                      <p className="text-xs font-semibold text-moss">{planningWeekdayLabels[day.dayIndex]} · Semana {creationWeekNumber}</p>
                      <h4 className="mt-1 font-semibold text-ink">{day.sessionName || getPlanningDaySessionTypeLabel(day)}</h4>
                      <p className="mt-1 text-xs text-ink/55">{getPlanningDaySessionTypeLabel(day)} · {getPlanningDaySessionGoalLabel(day)}</p>
                      <p className="mt-2 text-xs font-semibold text-ink/45">{configuredExercises} {configuredExercises === 1 ? "ejercicio" : "ejercicios"}</p>
                      {createdSession ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-moss/25 bg-mint px-2.5 py-1.5 text-xs font-semibold text-moss">✓ Sesión creada</span>
                          <button className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70" onClick={() => onOpenCreatedSession(createdSession)} type="button">Abrir sesión</button>
                        </div>
                      ) : (
                        <button className="mt-3 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white" onClick={() => setCreationTarget({ day, weekNumber: creationWeekNumber })} type="button">Crear sesión</button>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-3 text-sm text-ink/55">No hay sesiones configuradas en la semana tipo de este mesociclo.</p>
            )}
          </section>

      <div className="mt-4 rounded-md border border-line bg-white p-3 sm:p-4">
        <div>
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="text-moss" size={18} />
              <h3 className="font-semibold text-ink">Calendario del bloque</h3>
            </div>
            <p className="mt-1 text-sm text-ink/55">Abre una sesión para consultar su resumen y acciones.</p>
          </div>
        </div>
        {planningActionMessage ? <p className="mt-3 text-sm font-semibold text-moss">{planningActionMessage}</p> : null}
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="min-w-[780px] space-y-2">
            <div className="grid grid-cols-[82px_repeat(7,minmax(84px,1fr))] gap-2 text-[11px] font-semibold uppercase text-ink/45">
              <span>Semana</span>
              {planningWeekdayLabels.map((day) => <span key={day}>{day.slice(0, 3)}</span>)}
            </div>
            {blockWeeks.map((week) => {
              const isCurrentWeek = week.weekNumber === currentPlanningWeekNumber;

              return (
                <div className={`grid grid-cols-[82px_repeat(7,minmax(84px,1fr))] gap-2 rounded-md p-1 ${isCurrentWeek ? "border border-moss/30 bg-mint/15" : ""}`} key={week.weekNumber}>
                  <div className="rounded-md border border-line bg-panel/45 p-2">
                    <p className="text-xs font-semibold text-ink">Semana {week.weekNumber}</p>
                    {isCurrentWeek ? <span className="mt-1 inline-flex rounded border border-moss/25 bg-mint px-1.5 py-0.5 text-[9px] font-semibold text-moss">Actual</span> : null}
                    <div className="mt-2 grid gap-1">
                      <button className="rounded border border-line bg-panel px-1.5 py-1 text-[9px] font-semibold text-ink/65" onClick={() => onCopyWeek(week)} type="button">
                        Duplicar
                      </button>
                      {copiedPlanningWeek ? (
                        <button className="rounded border border-moss/25 bg-mint px-1.5 py-1 text-[9px] font-semibold text-moss" onClick={() => onPasteWeek(week)} type="button">
                          Pegar aquí
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {planningWeekdayLabels.map((day, dayIndex) => {
                    const date = addPlanningDays(week.startDate, dayIndex);
                    const daySessions = week.trainingSessions.filter((item) => getPlanningDateKey(item.date) === getPlanningDateKey(date));

                    return (
                      <div className="min-h-20 rounded-md border border-line bg-panel/30 p-1.5" key={`${week.weekNumber}-${day}`}>
                        <div className="mb-1.5 flex items-center justify-between gap-1">
                          <span className="text-[10px] font-semibold text-ink/40">{date.getDate()}</span>
                          <button
                            className="grid size-5 place-items-center rounded border border-line bg-white text-xs font-semibold text-ink transition hover:bg-mint"
                            onClick={() => onAddSession(date, week.weekNumber)}
                            title="Añadir sesión"
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <div className="grid gap-1">
                          {daySessions.map(({ session, sessionIndex }) => {
                            const kind = getPlanningSessionKind(session);
                            const metricLabel = getPlanningSessionMetricLabel(session);
                            const locked = hasCalendarSessionRegisteredData(session);

                            return (
                              <details className={`rounded border ${getPlanningSessionKindClass(kind)}`} key={`${sessionIndex}-${session.summary}`}>
                                <summary className="cursor-pointer list-none px-1.5 py-1 text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                                  <span className="flex min-w-0 items-center gap-1">
                                    <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                    <span className="truncate">{getPlanningSessionKindLabel(kind)}</span>
                                  </span>
                                </summary>
                                <div className="border-t border-current/15 px-1.5 py-1.5 text-[9px]">
                                  <p className="line-clamp-2 opacity-80">{session.summary || "Sesión sin resumen"}</p>
                                  {metricLabel ? <p className="mt-1 font-semibold opacity-70">{metricLabel}</p> : null}
                                  <p className="mt-1 opacity-65">{getSessionStatus(session)}</p>
                                  <div className="mt-1.5 flex gap-1">
                                    <button className="rounded border border-white/50 bg-white/50 px-1 py-0.5 font-semibold" onClick={() => onDuplicateSession(sessionIndex, date, session.time)} type="button">
                                      Duplicar
                                    </button>
                                    <button
                                      className="rounded border border-white/50 bg-white/50 px-1 py-0.5 font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                                      disabled={locked}
                                      onClick={() => onDeleteSession(sessionIndex, session)}
                                      title={locked ? "No se puede eliminar una sesión con datos registrados." : "Eliminar sesión"}
                                      type="button"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
          {creationTarget ? (
            <div className="assessment-modal-overlay !z-[80]" onClick={() => setCreationTarget(null)} role="presentation">
              <section
                aria-labelledby="planning-session-preview-title"
                aria-modal="true"
                className="assessment-modal-panel !max-h-[86vh] !w-[calc(100%-1.5rem)] !max-w-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <header className="assessment-modal-header flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">Crear sesión</p>
                    <h3 className="mt-1 text-xl font-semibold text-ink" id="planning-session-preview-title">{block.name} · Semana {creationTarget.weekNumber}</h3>
                    <p className="mt-1 text-sm text-ink/55">{planningWeekdayLabels[creationTarget.day.dayIndex]} · {getPlanningDaySessionTypeLabel(creationTarget.day)} · {getPlanningDaySessionGoalLabel(creationTarget.day)}</p>
                  </div>
                  <button aria-label="Cancelar creación" className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-panel text-lg text-ink/70" onClick={() => setCreationTarget(null)} type="button">×</button>
                </header>
                <div className="assessment-modal-body px-4 py-4 sm:px-5">
                  <p className="text-sm font-semibold text-ink">{previewExercises.length} {previewExercises.length === 1 ? "ejercicio" : "ejercicios"}</p>
                  {previewExercises.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {previewExercises.map(({ defaults, exercise, slot }) => {
                        const prescription = getPrescriptionDefaultSummary(defaults);
                        const roleLabel = planningPrescriptionRoles.find((role) => role.id === slot.role)?.label ?? slot.role;
                        return (
                          <article className="rounded-md border border-line bg-panel/35 p-3" key={slot.id}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="font-semibold text-ink">{exercise.name}</p>
                              <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">{roleLabel}</span>
                            </div>
                            <p className="mt-2 text-sm text-ink/60">{prescription === "Sin definir" ? "Prescripción sin configurar" : prescription}</p>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-md border border-dashed border-line bg-panel/35 p-3 text-sm text-ink/55">No hay ejercicios configurados para esta sesión. Se creará una sesión vacía que podrás editar después.</p>
                  )}
                  {creationTarget.day.notes ? <p className="mt-3 text-sm text-ink/55">Notas: {creationTarget.day.notes}</p> : null}
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button className="rounded-md border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink/70" onClick={() => setCreationTarget(null)} type="button">Cancelar</button>
                    <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => { onCreateSession(block, creationTarget); setCreationTarget(null); }} type="button">Crear sesión</button>
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </section>
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
                <th className="px-3 py-2">Duración</th>
                <th className="px-3 py-2">Objetivo principal</th>
                <th className="px-3 py-2">Distribución</th>
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

type ExerciseLibraryMode = "strength" | "resistance";
type GuidedLibraryMode = ExerciseLibraryMode | "advanced";

const strengthAdaptations = [
  "Fuerza máxima",
  "Hipertrofia funcional",
  "Potencia",
  "Fuerza excéntrica",
  "Work capacity",
  "Control técnico",
  "Structural balance",
  "Readaptación / baja carga"
];

const resistanceGuidedSports: Array<{ label: string; value: ResistanceSport }> = [
  { label: "General", value: "generic" },
  { label: "Running", value: "running" },
  { label: "Cycling", value: "cycling" },
  { label: "Swimming", value: "swimming" }
];

const resistanceAdaptations = [
  "Recuperación",
  "Base aeróbica",
  "Capacidad aeróbica",
  "Potencia aeróbica",
  "Umbral",
  "Capacidad anaeróbica",
  "Potencia anaeróbica",
  "Puesta a punto"
];

function getRelatedResistanceMethods(adaptation: string) {
  const normalizedAdaptation = adaptation.toLowerCase();

  return resistanceMethods.filter((method) => {
    const haystack = [
      method.family,
      method.group,
      method.subgroup,
      method.name,
      method.intensity,
      method.trainingEffects.join(" ")
    ].join(" ").toLowerCase();

    if (normalizedAdaptation.includes("recuperación")) return haystack.includes("recuper") || method.zones.includes("R0") || method.zones.includes("R1");
    if (normalizedAdaptation.includes("base")) return method.zones.includes("R1") || method.zones.includes("R1+");
    if (normalizedAdaptation.includes("capacidad aeróbica")) return method.zones.includes("R2") || haystack.includes("aeróbic");
    if (normalizedAdaptation.includes("potencia aeróbica")) return method.zones.includes("R3") || method.zones.includes("R3+");
    if (normalizedAdaptation.includes("umbral")) return haystack.includes("umbral") || method.zones.includes("R3");
    if (normalizedAdaptation.includes("capacidad anaeróbica")) return method.zones.includes("R4") || method.zones.includes("R5");
    if (normalizedAdaptation.includes("potencia anaeróbica")) return method.zones.includes("R5") || method.zones.includes("R6");
    if (normalizedAdaptation.includes("puesta")) return method.family === "Métodos puesta a punto";

    return false;
  });
}

function GuidedSelectionButton({
  active,
  children,
  description,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-md border p-4 text-left transition ${
        active
          ? "border-moss bg-mint text-moss shadow-soft"
          : "border-line bg-white text-ink hover:border-moss/40 hover:bg-panel/45"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-sm font-semibold">{children}</span>
      {description ? <span className="mt-2 block text-sm leading-5 opacity-70">{description}</span> : null}
    </button>
  );
}

function ExerciseProgressionsView({ client }: { client?: CoachClient | null }) {
  const [libraryMode, setLibraryMode] = useState<GuidedLibraryMode>("strength");
  const [advancedLibrarySection, setAdvancedLibrarySection] = useState<ExerciseLibraryMode>("strength");
  const [advancedExerciseSearch, setAdvancedExerciseSearch] = useState("");
  const [advancedBodyRegionFilter, setAdvancedBodyRegionFilter] = useState<BodyRegion | "all">("all");
  const [advancedPatternFilter, setAdvancedPatternFilter] = useState<ExercisePattern | "all">("all");
  const [advancedEquipmentFilter, setAdvancedEquipmentFilter] = useState("all");
  const [selectedAdvancedExerciseId, setSelectedAdvancedExerciseId] = useState("");
  const [activeBodyRegion, setActiveBodyRegion] = useState<BodyRegion>("lower_body");
  const availablePatterns = getExercisePatternsByBodyRegion(activeBodyRegion);
  const [activePattern, setActivePattern] = useState<ExercisePattern>(availablePatterns[0]);
  const [selectedStrengthAdaptation, setSelectedStrengthAdaptation] = useState(strengthAdaptations[0]);
  const [selectedResistanceSport, setSelectedResistanceSport] = useState<ResistanceSport>("generic");
  const [selectedResistanceAdaptation, setSelectedResistanceAdaptation] = useState(resistanceAdaptations[0]);
  const patternExercises = getExercisesByPattern(activePattern);
  const familyGroups = getExerciseFamilyGroups(patternExercises);
  const [selectedFamilyKey, setSelectedFamilyKey] = useState("");
  const selectedFamilyGroup = familyGroups.find((group) => group.key === selectedFamilyKey) ?? familyGroups[0];
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const selectedExercise =
    selectedFamilyGroup?.exercises.find((exercise) => exercise.id === selectedExerciseId) ??
    selectedFamilyGroup?.exercises[0];
  const selectedResistanceProfile = getSportZoneProfile(selectedResistanceSport);
  const relatedResistanceMethods = getRelatedResistanceMethods(selectedResistanceAdaptation);
  const advancedEquipmentOptions = useMemo(
    () => Array.from(new Set(exerciseLibrary.flatMap((exercise) => exercise.equipment))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const advancedStrengthExercises = useMemo(() => {
    const query = advancedExerciseSearch.trim().toLowerCase();

    return exerciseLibrary.filter((exercise) => {
      const matchesSearch = !query || [
        exercise.name,
        exercise.pattern,
        exercise.block,
        exercise.technicalDescription,
        exercise.equipment.join(" ")
      ].join(" ").toLowerCase().includes(query);
      const matchesBodyRegion = advancedBodyRegionFilter === "all" || exercise.bodyRegion === advancedBodyRegionFilter;
      const matchesPattern = advancedPatternFilter === "all" || exercise.pattern === advancedPatternFilter;
      const matchesEquipment = advancedEquipmentFilter === "all" || exercise.equipment.includes(advancedEquipmentFilter);

      return matchesSearch && matchesBodyRegion && matchesPattern && matchesEquipment;
    });
  }, [advancedBodyRegionFilter, advancedEquipmentFilter, advancedExerciseSearch, advancedPatternFilter]);
  const selectedAdvancedExercise =
    advancedStrengthExercises.find((exercise) => exercise.id === selectedAdvancedExerciseId) ??
    advancedStrengthExercises[0];

  const handleStrengthPatternChange = (pattern: ExercisePattern) => {
    setActivePattern(pattern);
    setActiveBodyRegion(patternBodyRegions[pattern]);
    setSelectedFamilyKey("");
    setSelectedExerciseId("");
  };

  const libraryModeCards = (
    <section className="coach-surface rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Biblioteca guiada</h2>
          <p className="mt-1 text-sm text-ink/55">Elige primero el tipo de trabajo y después afina por categoría y adaptación.</p>
        </div>
        {client ? <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">{client.name}</span> : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <GuidedSelectionButton
          active={libraryMode === "strength"}
          description="Explora ejercicios según patrón de movimiento y adaptación buscada."
          onClick={() => setLibraryMode("strength")}
        >
          Fuerza
        </GuidedSelectionButton>
        <GuidedSelectionButton
          active={libraryMode === "resistance"}
          description="Explora métodos según deporte, zona y adaptación fisiológica."
          onClick={() => setLibraryMode("resistance")}
        >
          Resistencia
        </GuidedSelectionButton>
        <GuidedSelectionButton
          active={libraryMode === "advanced"}
          description="Mantiene los filtros y el catálogo detallado anterior."
          onClick={() => setLibraryMode("advanced")}
        >
          Búsqueda avanzada
        </GuidedSelectionButton>
      </div>
    </section>
  );

  if (libraryMode === "resistance") {
    return (
      <div className="mt-6 space-y-6">
        {libraryModeCards}
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="coach-surface rounded-md p-4">
            <p className="text-xs font-semibold uppercase text-moss">Biblioteca / Resistencia / {resistanceGuidedSports.find((sport) => sport.value === selectedResistanceSport)?.label} / {selectedResistanceAdaptation}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">Guía de métodos de resistencia</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              La relación con adaptaciones usa zonas, familia y efectos ya presentes en el documento fuente. No se añaden métodos ni zonas nuevas.
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Deporte</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {resistanceGuidedSports.map((sport) => (
                  <GuidedSelectionButton active={selectedResistanceSport === sport.value} key={sport.value} onClick={() => setSelectedResistanceSport(sport.value)}>
                    {sport.label}
                  </GuidedSelectionButton>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Adaptación buscada</p>
              <div className="mt-3 grid gap-2">
                {resistanceAdaptations.map((adaptation) => (
                  <GuidedSelectionButton active={selectedResistanceAdaptation === adaptation} key={adaptation} onClick={() => setSelectedResistanceAdaptation(adaptation)}>
                    {adaptation}
                  </GuidedSelectionButton>
                ))}
              </div>
            </div>
          </section>

          <section className="coach-surface rounded-md p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink">Métodos relacionados</h3>
                <p className="mt-1 text-sm text-ink/55">{selectedResistanceProfile.name}</p>
              </div>
              <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">{relatedResistanceMethods.length} métodos</span>
            </div>

            <div className="coach-subtle-card mt-4 rounded-md px-4 py-3">
              <p className="text-xs font-semibold uppercase text-ink/45">Zonas disponibles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedResistanceProfile.zones.map((zone) => (
                  <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65" key={zone.id}>{zone.shortLabel}</span>
                ))}
              </div>
            </div>

            {relatedResistanceMethods.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {relatedResistanceMethods.map((method) => (
                  <article className="rounded-md border border-line bg-panel/35 p-4" key={method.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-moss">{method.method}</p>
                        <h4 className="mt-1 font-semibold text-ink">{method.name}</h4>
                        <p className="mt-1 text-sm text-ink/55">{[method.family, method.group, method.subgroup].filter(Boolean).join(" · ")}</p>
                      </div>
                      <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${method.status === "complete" ? "bg-mint text-moss" : "border border-line bg-white text-ink/55"}`}>
                        {method.status === "complete" ? "Completo" : "Pendiente"}
                      </span>
                    </div>
                    {method.intensity ? <p className="mt-3 whitespace-pre-line text-sm font-semibold text-ink/70">{method.intensity}</p> : null}
                    {method.sessionDuration ? <p className="mt-2 text-sm text-ink/55">Duración/formato: {method.sessionDuration}</p> : null}
                    {method.trainingEffects.length > 0 ? <p className="mt-2 text-sm text-ink/55">Efectos: {method.trainingEffects.slice(0, 2).join(" · ")}</p> : null}
                    {method.status === "pending" ? <p className="mt-2 rounded-md bg-white px-3 py-2 text-sm text-ink/55">Pendiente de completar en el documento base.</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm font-semibold text-ink/55">
                No hay métodos específicos asociados todavía a esta adaptación con los datos actuales.
              </p>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (libraryMode === "advanced") {
    return (
      <div className="mt-6 space-y-6">
        {libraryModeCards}
        <section className="coach-surface rounded-md p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-moss">Biblioteca / Búsqueda avanzada</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">Encuentra ejercicios o métodos concretos</h3>
              <p className="mt-1 text-sm text-ink/55">Explorar guía la decisión por adaptación; búsqueda avanzada ayuda a localizar contenido específico.</p>
            </div>
            <div className="flex w-fit rounded-md border border-line bg-panel/35 p-1">
              {([
                ["strength", "Fuerza"],
                ["resistance", "Resistencia"]
              ] as const).map(([section, label]) => (
                <button
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    advancedLibrarySection === section ? "bg-ink text-white" : "text-ink/65 hover:bg-white"
                  }`}
                  key={section}
                  onClick={() => setAdvancedLibrarySection(section)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {advancedLibrarySection === "resistance" ? (
          <div className="coach-surface rounded-md p-4">
            <ResistanceMethodsView libraryMode="resistance" setLibraryMode={(mode) => setLibraryMode(mode)} />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="coach-surface rounded-md p-4">
              <h3 className="text-lg font-semibold text-ink">Búsqueda avanzada de fuerza</h3>
              <p className="mt-1 text-sm text-ink/55">Filtra la biblioteca de ejercicios usando solo los campos existentes.</p>

              <div className="mt-5 grid gap-4">
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Buscar
                  <input
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setAdvancedExerciseSearch(event.target.value)}
                    placeholder="Nombre, patrón, bloque, material..."
                    type="search"
                    value={advancedExerciseSearch}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Región corporal
                    <select
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => setAdvancedBodyRegionFilter(event.target.value as BodyRegion | "all")}
                      value={advancedBodyRegionFilter}
                    >
                      <option value="all">Todas</option>
                      {bodyRegions.map((region) => (
                        <option key={region} value={region}>{bodyRegionLabels[region]}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/75">
                    Patrón
                    <select
                      className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                      onChange={(event) => setAdvancedPatternFilter(event.target.value as ExercisePattern | "all")}
                      value={advancedPatternFilter}
                    >
                      <option value="all">Todos</option>
                      {exercisePatterns.map((pattern) => (
                        <option key={pattern} value={pattern}>{pattern}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Material
                  <select
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setAdvancedEquipmentFilter(event.target.value)}
                    value={advancedEquipmentFilter}
                  >
                    <option value="all">Todo el material</option>
                    {advancedEquipmentOptions.map((equipment) => (
                      <option key={equipment} value={equipment}>{equipment}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">Ejercicios encontrados</p>
                  <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">{advancedStrengthExercises.length}</span>
                </div>
                {advancedStrengthExercises.length > 0 ? (
                  <div className="mt-3 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
                    {advancedStrengthExercises.map((exercise) => (
                      <button
                        className={`rounded-md border p-3 text-left transition ${selectedAdvancedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
                        key={exercise.id}
                        onClick={() => setSelectedAdvancedExerciseId(exercise.id)}
                        type="button"
                      >
                        <span className="block text-sm font-semibold">{exercise.name}</span>
                        <span className="mt-1 block text-xs opacity-65">{exercise.pattern} · {exercise.block}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-md border border-dashed border-line bg-white p-5 text-sm font-semibold text-ink/50">No hay ejercicios que coincidan con esos filtros.</p>
                )}
              </div>
            </section>

            <ExerciseDetailCard selectedExercise={selectedAdvancedExercise} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {libraryModeCards}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="coach-surface rounded-md p-4">
          <p className="text-xs font-semibold uppercase text-moss">Biblioteca / Fuerza / {activePattern} / {selectedStrengthAdaptation}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">Guía de ejercicios de fuerza</h3>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            La adaptación seleccionada orienta la búsqueda; la selección final depende de la prescripción de series, repeticiones, carga, tempo y descanso.
          </p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Patrón de movimiento</p>
            <div className="mt-3 grid gap-2">
              {exercisePatterns.map((pattern) => (
                <GuidedSelectionButton active={activePattern === pattern} description={`${getExercisesByPattern(pattern).length} ejercicios disponibles`} key={pattern} onClick={() => handleStrengthPatternChange(pattern)}>
                  {pattern}
                </GuidedSelectionButton>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">Adaptación buscada</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {strengthAdaptations.map((adaptation) => (
                <GuidedSelectionButton active={selectedStrengthAdaptation === adaptation} key={adaptation} onClick={() => setSelectedStrengthAdaptation(adaptation)}>
                  {adaptation}
                </GuidedSelectionButton>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
            <p className="text-sm font-semibold text-ink">Ejercicios disponibles</p>
            <div className="mt-3 grid max-h-[520px] gap-2 overflow-y-auto pr-1">
              {patternExercises.map((exercise) => (
                <button
                  className={`rounded-md border p-3 text-left transition ${selectedExercise?.id === exercise.id ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink hover:border-moss/40"}`}
                  key={exercise.id}
                  onClick={() => {
                    setSelectedFamilyKey(`${exercise.pattern}__${exercise.block}`);
                    setSelectedExerciseId(exercise.id);
                  }}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{exercise.name}</span>
                  <span className="mt-1 block text-xs opacity-65">{exercise.block} · {bodyRegionLabels[exercise.bodyRegion]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <ExerciseDetailCard selectedExercise={selectedExercise} />
      </div>
    </div>
  );
}

function ExerciseDetailCard({ selectedExercise }: { selectedExercise?: ExerciseDefinition }) {
  const fatigueEntries = selectedExercise
    ? Object.entries(selectedExercise.fatigueMap).sort(([, a], [, b]) => b - a)
    : [];
  const activationEvidence = getExerciseActivationEvidence(selectedExercise);
  const activationMusclesByRole = getActivationMusclesByRole(activationEvidence);

  return (
    <section className="coach-surface rounded-md p-4">
      {selectedExercise ? (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">{selectedExercise.name}</h2>
              <p className="mt-1 text-sm text-ink/55">
                {bodyRegionLabels[selectedExercise.bodyRegion]} - {selectedExercise.pattern} - {selectedExercise.block} - #{selectedExercise.rank}
              </p>
            </div>
            <span className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-moss">{selectedExercise.equipment.join(" / ")}</span>
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
                          <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/65">{exerciseVariantTypeLabels[variant.type]}</span>
                          {variant.difficulty ? <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-moss">{exerciseVariantDifficultyLabels[variant.difficulty]}</span> : null}
                        </div>
                      </div>
                      {variant.equipment?.length ? <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/55">{variant.equipment.join(" / ")}</span> : null}
                    </div>
                    {variant.description ? <p className="mt-3 text-sm leading-6 text-ink/70">{variant.description}</p> : null}
                    {variant.coachingNotes ? <p className="mt-2 rounded-md bg-white px-3 py-2 text-sm text-ink/65">{variant.coachingNotes}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-line p-4">
              <h3 className="text-sm font-semibold text-ink">Errores a evitar</h3>
              <div className="mt-3 grid gap-2">
                {selectedExercise.errorsToAvoid.map((error) => <p className="rounded-md bg-panel/55 px-3 py-2 text-sm text-ink/70" key={error}>{error}</p>)}
              </div>
            </div>

            <div className="rounded-md border border-line p-4">
              <h3 className="text-sm font-semibold text-ink">Músculos implicados</h3>
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Principales</p>
                <p className="mt-1 text-sm text-ink/70">{selectedExercise.primaryMuscles.join(", ") || "Pendiente de completar"}</p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Secundarios</p>
                <p className="mt-1 text-sm text-ink/70">{selectedExercise.secondaryMuscles.join(", ") || "Pendiente de completar"}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-line p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Activación muscular basada en evidencia</h3>
                <p className="mt-1 text-xs text-ink/50">Escala cualitativa basada en fuentes PubMed añadidas a la biblioteca.</p>
              </div>
              {activationEvidence ? <span className="w-fit rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65">{evidenceStrengthLabels[activationEvidence.evidenceStrength]}</span> : null}
            </div>
            {activationEvidence ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="grid gap-3">
                  {(["primary", "secondary", "stabilizer"] as const).map((role) => {
                    const entries = activationMusclesByRole[role];

                    return (
                      <div className="rounded-md bg-panel/45 p-3" key={role}>
                        <p className="text-xs font-semibold uppercase text-ink/45">{activationRoleLabels[role]}</p>
                        {entries.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {entries.map((entry) => (
                              <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/70" key={`${role}-${entry.muscle}`} title={entry.note}>
                                {formatFatigueKey(entry.muscle)}
                              </span>
                            ))}
                          </div>
                        ) : <p className="mt-2 text-sm text-ink/45">Sin músculos en este rol.</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-md bg-panel/45 p-3">
                  <p className="text-xs font-semibold uppercase text-ink/45">Fuente PubMed</p>
                  <div className="mt-3 grid gap-2">
                    {activationEvidence.sources.map((source) => (
                      <p className="rounded-md border border-line bg-panel/60 px-3 py-2 text-xs leading-5 text-ink/65" key={source.pmid}>
                        <span className="font-semibold text-ink">PMID {source.pmid}</span> · {source.title}
                      </p>
                    ))}
                  </div>
                  {activationEvidence.notes ? <p className="mt-3 text-sm leading-6 text-ink/60">{activationEvidence.notes}</p> : null}
                </div>
              </div>
            ) : <p className="mt-3 rounded-md bg-panel/45 px-3 py-3 text-sm text-ink/55">Sin evidencia PubMed añadida todavía para este ejercicio.</p>}
          </div>

          <div className="mt-4 rounded-md border border-line p-4">
            <h3 className="text-sm font-semibold text-ink">Mapa de fatiga</h3>
            {fatigueEntries.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {fatigueEntries.map(([muscle, value]) => (
                  <div className="grid grid-cols-[130px_1fr_42px] items-center gap-3" key={muscle}>
                    <span className="text-sm font-medium text-ink/65">{formatFatigueKey(muscle)}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-panel">
                      <span className="block h-full rounded-full bg-gradient-to-r from-moss to-steel" style={{ width: `${Math.round(value * 100)}%` }} />
                    </span>
                    <span className="text-right text-sm font-semibold text-ink">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 rounded-md bg-panel/45 px-3 py-3 text-sm text-ink/55">Pendiente de completar para este ejercicio.</p>}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-center text-sm text-ink/50">Selecciona un ejercicio para ver su ficha.</div>
      )}
    </section>
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
    midBack: "Espalda medía",
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
      { exercise: "Puente de glúteo en suelo", pattern: "Traccion tren inferior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
      { exercise: "Press pared", pattern: "Empuje tren superior", sets: "2-3", reps: "8-12", rir: "3-4", rest: "60 s" },
      { exercise: "Remo con banda elástica", pattern: "Traccion tren superior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" }
    ]
  },
  {
    id: "older-strength-a",
    name: "Fuerza base persona mayor",
    goal: "Salud",
    profile: "Persona mayor",
    type: "Full body",
    exercises: [
      { exercise: "Sentadilla en silla con apoyo de maños", pattern: "Empuje tren inferior", sets: "2-3", reps: "8-10", rir: "3-4", rest: "90 s" },
      { exercise: "Remo con banda elástica", pattern: "Traccion tren superior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
      { exercise: "Puente de glúteo en suelo", pattern: "Traccion tren inferior", sets: "2-3", reps: "10-12", rir: "3", rest: "60 s" },
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
      reason: "Con un solo día semanal conviene tocar los patrones principales en una sesión.",
      templateType: "Full body"
    };
  }

  if (daysPerWeek === 2 && consecutiveDays) {
    return {
      name: "Torso-pierna",
      reason: "Si los dos días son seguidos, separar tren inferior y superior reduce solapamiento de fatiga.",
      templateType: "Torso-pierna"
    };
  }

  if (daysPerWeek === 2) {
    return {
      name: "Full body A/B",
      reason: "Con dos días alternos puede repetirse full body variando enfasis e intensidad.",
      templateType: "Full body"
    };
  }

  if (daysPerWeek === 3) {
    return {
      name: consecutiveDays ? "Empuje-traccion-pierna" : "Full body ondulante",
      reason: consecutiveDays
        ? "Tres días seguidos encajan mejor separando patrones para controlar fatiga local."
        : "Tres días alternos permiten repetir patrones con cambios de carga.",
      templateType: consecutiveDays ? "Empuje-traccion-pierna" : "Full body"
    };
  }

  return {
    name: "Torso-pierna / enfasis por patrones",
    reason: "Con más frecuencia semanal se puede distribuir por patrones y controlar mejor volumen por grupo muscular.",
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
      <section className="coach-surface rounded-md p-4">
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
          <p className="text-sm font-semibold text-steel">Distribución recomendada</p>
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

      <section className="coach-surface rounded-md p-4">
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
  improvementDirection?: AssessmentImprovementDirection;
  notes?: string;
  unit?: string;
};

function isValidStructuredMetricValue(value?: string) {
  if (!value?.trim()) return false;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0;
}

function getStructuredAssessmentDerivedData(assessment: AssessmentEntry) {
  const test = getAssessmentCatalogTest(assessment.protocolId);
  if (!test?.metrics || !assessment.metrics) return null;
  const normalizedMetrics = assessment.metrics.flatMap((metric) => {
    const definition = test.metrics?.find((candidate) => candidate.id === metric.id);
    if (!definition) return [];
    const normalized = getNormalizedAssessmentMetric(definition, metric.value);
    return normalized ? [{ id: metric.id, ...normalized }] : [];
  });
  const bilateral = test.summary?.mode === "bilateral"
    ? getBilateralAssessmentResult(test.metrics, assessment.metrics, test.summary.metricIds)
    : null;
  return { bilateral, normalizedMetrics, test };
}

function StructuredAssessmentDetails({ assessment, includeMeasured = false }: { assessment: AssessmentEntry; includeMeasured?: boolean }) {
  const derived = getStructuredAssessmentDerivedData(assessment);
  if (!derived || (!includeMeasured && derived.normalizedMetrics.length === 0 && !derived.bilateral)) return null;

  return (
    <div className="mt-2 grid gap-1.5 text-xs text-ink/55">
      {includeMeasured ? assessment.metrics?.map((metric) => {
        const normalized = derived.normalizedMetrics.find((item) => item.id === metric.id);
        return (
          <p className="rounded-md border border-line bg-panel/45 px-2 py-1.5" key={metric.id}>
            <span className="font-semibold text-ink/70">{metric.label}</span> {metric.value} {metric.unit}
            {normalized ? <span> · {normalized.value} {normalized.unit}</span> : null}
          </p>
        );
      }) : derived.normalizedMetrics.map((normalized) => {
        const metric = assessment.metrics?.find((item) => item.id === normalized.id);
        return metric ? (
          <p key={metric.id}>
            <span className="font-semibold text-ink/70">{metric.label}</span> {metric.value} {metric.unit} · {normalized.value} {normalized.unit}
          </p>
        ) : null;
      })}
      {derived.bilateral ? (
        <p className="font-semibold text-ink/60">
          Asimetría {derived.bilateral.asymmetryPercent}% · Lado menor: {derived.bilateral.lowerSide}
        </p>
      ) : null}
    </div>
  );
}

type AssessmentMetricSource = {
  assessment: AssessmentEntry;
  value: number;
};

function getLatestAssessmentMetricSource(
  assessments: AssessmentEntry[],
  protocolId: string,
  metricId: string,
  requirePositive = false
): AssessmentMetricSource | null {
  return assessments
    .flatMap((assessment, index) => {
      if (assessment.protocolId !== protocolId) return [];
      const metric = assessment.metrics?.find((candidate) => candidate.id === metricId);
      const value = Number(metric?.value);
      if (!metric || !Number.isFinite(value) || value < 0 || (requirePositive && value === 0)) return [];
      return [{ assessment, index, value }];
    })
    .sort((left, right) => {
      const dateDifference = getAssessmentDateValue(right.assessment.date) - getAssessmentDateValue(left.assessment.date);
      return dateDifference || left.index - right.index;
    })[0] ?? null;
}

function DsiAnalysisCard({ assessments }: { assessments: AssessmentEntry[] }) {
  const ballisticPeakForce = getLatestAssessmentMetricSource(assessments, "cmj", "peak_force");
  const isometricPeakForce = getLatestAssessmentMetricSource(assessments, "imtp", "peak_force", true);
  const ballisticDate = ballisticPeakForce?.assessment.date && ballisticPeakForce.assessment.date !== "Sin fecha"
    ? new Date(`${ballisticPeakForce.assessment.date}T00:00:00`).getTime()
    : null;
  const isometricDate = isometricPeakForce?.assessment.date && isometricPeakForce.assessment.date !== "Sin fecha"
    ? new Date(`${isometricPeakForce.assessment.date}T00:00:00`).getTime()
    : null;
  const testSeparationDays = ballisticDate !== null && isometricDate !== null && Number.isFinite(ballisticDate) && Number.isFinite(isometricDate)
    ? Math.round(Math.abs(ballisticDate - isometricDate) / 86400000)
    : null;
  const dsi = ballisticPeakForce && isometricPeakForce
    ? ballisticPeakForce.value / isometricPeakForce.value
    : null;
  const validDsi = dsi !== null && Number.isFinite(dsi) && dsi >= 0 ? dsi : null;
  const markerPosition = validDsi === null ? null : Math.min(validDsi, 1) * 100;
  const missingLabel = !ballisticPeakForce && !isometricPeakForce
    ? "Faltan datos"
    : !ballisticPeakForce
      ? "Falta Fuerza pico del CMJ"
      : !isometricPeakForce
        ? "Falta IMTP"
        : "Faltan datos";

  return (
    <article className="rounded-md border border-line bg-panel/30 p-4 md:col-span-2 xl:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ink">DSI</h4>
          <p className="mt-1 text-sm text-ink/55">Dynamic Strength Index</p>
        </div>
        <span className="rounded-md border border-line bg-white px-3 py-1 text-sm font-semibold text-ink/70">
          {validDsi === null ? missingLabel : validDsi.toFixed(2)}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3 text-[11px] font-semibold text-ink/55 sm:text-xs">
          <span className="max-w-32">Fuerza máxima iso</span>
          <span className="max-w-32 text-right">Expresión balística</span>
        </div>
        <div className="relative mt-2 h-3 rounded-full border border-line bg-white/75">
          <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-slate-400/30 via-blue-400/30 to-slate-700/35" />
          {markerPosition !== null ? (
            <span
              aria-label={`DSI ${validDsi?.toFixed(2)}`}
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-md"
              role="img"
              style={{ left: `clamp(10px, ${markerPosition}%, calc(100% - 10px))` }}
            />
          ) : null}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-ink/35">
          <span>0</span>
          <span>1</span>
        </div>
        {validDsi !== null && validDsi > 1 ? (
          <p className="mt-2 text-xs font-medium text-ink/50">El valor real supera el rango 0–1 representado en la escala.</p>
        ) : null}
      </div>

      <div className="mt-5 rounded-md border border-line bg-white/65 p-3">
        <h5 className="text-xs font-semibold uppercase text-moss">Datos utilizados</h5>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-ink/45">CMJ · Fuerza pico</p>
            <p className="mt-1 text-sm font-semibold text-ink">{ballisticPeakForce ? `${ballisticPeakForce.value} N` : "Sin dato"}</p>
            {ballisticPeakForce ? <p className="mt-1 text-xs text-ink/45">{formatDisplayDate(ballisticPeakForce.assessment.date)}</p> : null}
          </div>
          <div>
            <p className="text-xs font-semibold text-ink/45">IMTP · Fuerza pico</p>
            <p className="mt-1 text-sm font-semibold text-ink">{isometricPeakForce ? `${isometricPeakForce.value} N` : "Sin dato"}</p>
            {isometricPeakForce ? <p className="mt-1 text-xs text-ink/45">{formatDisplayDate(isometricPeakForce.assessment.date)}</p> : null}
          </div>
          <div>
            <p className="text-xs font-semibold text-ink/45">DSI</p>
            <p className="mt-1 text-sm font-semibold text-ink">{validDsi === null ? "Sin calcular" : validDsi.toFixed(2)}</p>
          </div>
        </div>
        {testSeparationDays !== null ? (
          <p className="mt-3 border-t border-line pt-2 text-xs font-medium text-ink/50">
            {testSeparationDays === 0 ? "Pruebas realizadas el mismo día" : `Separación entre pruebas: ${testSeparationDays} días`}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-1.5 text-xs leading-relaxed text-ink/50">
        <p>El DSI expresa la relación entre la fuerza pico producida en una acción balística y la fuerza máxima isométrica registrada.</p>
        <p>El resultado describe el perfil del deportista y debe interpretarse según las demandas del deporte, posición, nivel, fase de entrenamiento e historial individual.</p>
        <p className="font-medium text-ink/55">Izquierda: predominio relativo de fuerza máxima isométrica · Derecha: mayor expresión balística relativa.</p>
      </div>
    </article>
  );
}

function createLoadVelocityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createLoadVelocityPoint(): LoadVelocityPoint {
  return {
    id: createLoadVelocityId("load"),
    loadKg: "",
    repetitions: [{ excluded: false, id: createLoadVelocityId("rep"), mpv: "" }]
  };
}

function getLoadVelocityProfilePoints(profile?: LoadVelocityProfile) {
  if (!profile) return [];
  return profile.loads.flatMap((load) => {
    if (!load.loadKg.trim()) return [];
    const loadKg = Number(load.loadKg);
    if (!Number.isFinite(loadKg) || loadKg < 0) return [];
    const validMpvValues = load.repetitions
      .filter((repetition) => !repetition.excluded && repetition.mpv.trim())
      .map((repetition) => Number(repetition.mpv))
      .filter((mpv) => Number.isFinite(mpv) && mpv >= 0);
    if (validMpvValues.length === 0) return [];
    return [{ loadId: load.id, loadKg, mpv: Math.max(...validMpvValues) }];
  }).sort((left, right) => left.loadKg - right.loadKg);
}

function LoadVelocityProfileChart({ profile }: { profile: LoadVelocityProfile }) {
  const points = getLoadVelocityProfilePoints(profile);
  if (points.length === 0) {
    return <p className="rounded-md border border-dashed border-line bg-panel/30 p-4 text-sm text-ink/50">Sin puntos válidos para representar.</p>;
  }
  const width = 520;
  const height = 240;
  const padding = { bottom: 40, left: 48, right: 20, top: 20 };
  const minLoad = Math.min(...points.map((point) => point.loadKg));
  const maxLoad = Math.max(...points.map((point) => point.loadKg));
  const minMpv = Math.min(...points.map((point) => point.mpv));
  const maxMpv = Math.max(...points.map((point) => point.mpv));
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const getX = (load: number) => padding.left + (maxLoad === minLoad ? plotWidth / 2 : ((load - minLoad) / (maxLoad - minLoad)) * plotWidth);
  const getY = (mpv: number) => padding.top + (maxMpv === minMpv ? plotHeight / 2 : (1 - (mpv - minMpv) / (maxMpv - minMpv)) * plotHeight);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white/65 p-3">
      <svg aria-label={`Perfil carga–velocidad de ${profile.exercise}`} className="h-auto w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
        <line stroke="currentColor" className="text-ink/20" strokeWidth="1" x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} />
        <line stroke="currentColor" className="text-ink/20" strokeWidth="1" x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} />
        {points.map((point) => (
          <g key={point.loadId}>
            <circle className="fill-blue-600 stroke-white" cx={getX(point.loadKg)} cy={getY(point.mpv)} r="6" strokeWidth="2" />
            <text className="fill-ink/60 text-[10px] font-semibold" textAnchor="middle" x={getX(point.loadKg)} y={getY(point.mpv) - 11}>{point.mpv} m/s</text>
            <text className="fill-ink/45 text-[10px] font-semibold" textAnchor="middle" x={getX(point.loadKg)} y={height - 20}>{point.loadKg}</text>
          </g>
        ))}
        <text className="fill-ink/50 text-[10px] font-semibold" textAnchor="middle" x={width / 2} y={height - 3}>Carga (kg)</text>
        <text className="fill-ink/50 text-[10px] font-semibold" textAnchor="middle" transform={`rotate(-90 12 ${height / 2})`} x="12" y={height / 2}>MPV (m/s)</text>
      </svg>
    </div>
  );
}

function LoadVelocityProfileDetails({ assessment }: { assessment: AssessmentEntry }) {
  const profile = assessment.loadVelocityProfile;
  if (!profile) return null;
  const validPoints = getLoadVelocityProfilePoints(profile);
  return (
    <div className="mt-2 grid gap-3">
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
        <span className="rounded-md border border-line bg-panel/45 px-2 py-1">{profile.exercise || "Ejercicio sin especificar"}</span>
        <span className="rounded-md border border-line bg-panel/45 px-2 py-1">{profile.loads.length} cargas</span>
        <span className="rounded-md border border-line bg-panel/45 px-2 py-1">{validPoints.length} puntos válidos</span>
        {validPoints.length < 2 ? <span className="rounded-md border border-line bg-panel/45 px-2 py-1">Perfil incompleto</span> : null}
      </div>
      <LoadVelocityProfileChart profile={profile} />
      <div className="grid gap-2 sm:grid-cols-2">
        {profile.loads.map((load) => {
          const validRepetitions = load.repetitions.filter((repetition) => !repetition.excluded && isValidStructuredMetricValue(repetition.mpv));
          const bestMpv = validRepetitions.length > 0 ? Math.max(...validRepetitions.map((repetition) => Number(repetition.mpv))) : null;
          return (
            <div className="rounded-md border border-line bg-white/65 p-3" key={load.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{load.loadKg} kg</p>
                <span className="text-xs font-semibold text-ink/50">{bestMpv === null ? "Sin repetición válida" : `Mejor MPV ${bestMpv} m/s`}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {load.repetitions.map((repetition, index) => (
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${repetition.excluded ? "border-line bg-panel text-ink/35 line-through" : Number(repetition.mpv) === bestMpv ? "border-blue-200 bg-blue-50 text-blue-800" : "border-line bg-panel/40 text-ink/55"}`} key={repetition.id}>
                    Rep {index + 1}: {repetition.mpv} m/s{repetition.excluded ? " · Excluida" : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadVelocityAnalysisCard({ assessments }: { assessments: AssessmentEntry[] }) {
  const latestProfile = assessments.find(
    (assessment) => assessment.protocolId === "load_velocity_profile" && assessment.loadVelocityProfile
  );
  const validPointCount = getLoadVelocityProfilePoints(latestProfile?.loadVelocityProfile).length;
  const isAvailable = validPointCount >= 2;

  return (
    <article className="rounded-md border border-line bg-panel/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink">Perfil carga–velocidad</h4>
        <span className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink/55">
          {isAvailable ? "Disponible" : "Faltan datos"}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink/50">
        {isAvailable
          ? `${validPointCount} puntos válidos en el último perfil registrado.`
          : "Necesita al menos dos cargas con una repetición válida."}
      </p>
    </article>
  );
}

const assessmentReadableCategories = [
  ...assessmentCatalog.map((category) => category.label),
  "Salto",
  "Movilidad / FMS",
  "Otro"
];

const assessmentImprovementDirectionLabels: Record<AssessmentImprovementDirection, string> = {
  higher_is_better: "Más alto es mejor",
  lower_is_better: "Más bajo es mejor",
  neutral: "Solo seguimiento / sin interpretación"
};

const emptyAssessmentDraft = {
  category: "Fuerza",
  date: "",
  improvementDirection: "higher_is_better" as AssessmentImprovementDirection,
  name: "",
  notes: "",
  result: "",
  unit: ""
};

type AssessmentGroup = {
  category: string;
  direction: AssessmentImprovementDirection;
  entries: Array<AssessmentEntry & { originalIndex: number; parsedValue: number | null }>;
  key: string;
  name: string;
  unit: string;
};

function normalizeAssessmentCategory(category?: string | null) {
  const value = `${category ?? ""}`.trim();
  if (value === "FMS" || value === "Movilidad") return "Movilidad / FMS";
  if (value === "AntropometrÃ­a") return "Antropometría";
  if (assessmentReadableCategories.includes(value)) return value;
  return "Otro";
}

function normalizeAssessmentKey(value?: string | null) {
  return `${value ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseAssessmentNumber(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const match = `${value}`.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getAssessmentDisplayUnit(assessment: AssessmentEntry) {
  if (assessment.unit?.trim()) return assessment.unit.trim();
  const match = `${assessment.result ?? ""}`.trim().match(/^-?\d+(?:[.,]\d+)?\s*(.*)$/);
  return match?.[1]?.trim() ?? "";
}

function getAssessmentDisplayValue(assessment: AssessmentEntry) {
  const result = `${assessment.result ?? ""}`.trim();
  const unit = getAssessmentDisplayUnit(assessment);
  if (!unit) return result;
  const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return result.replace(new RegExp(`\\s*${escapedUnit}$`, "i"), "").trim() || result;
}

function getAssessmentGroupKey(assessment: AssessmentEntry) {
  const category = normalizeAssessmentCategory(assessment.type);
  const unit = getAssessmentDisplayUnit(assessment);
  return `${normalizeAssessmentKey(category)}|${normalizeAssessmentKey(assessment.name)}|${normalizeAssessmentKey(unit)}`;
}

function getAssessmentDateValue(value?: string | null) {
  if (!value || value === "Sin fecha") return 0;
  const parsed = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getAssessmentStatusLabel(group: AssessmentGroup) {
  const values = group.entries.map((entry) => entry.parsedValue).filter((value): value is number => value !== null);
  if (group.direction === "neutral" || values.length < 2) return "Seguimiento";
  const previous = values[values.length - 2];
  const latest = values[values.length - 1];
  if (latest === previous) return "Estable";
  if (group.direction === "higher_is_better") return latest > previous ? "Mejora" : "Baja";
  return latest < previous ? "Mejora" : "Baja";
}

function getAssessmentChangeLabel(fromValue: number | null, toValue: number | null, unit: string) {
  if (fromValue === null || toValue === null) return "Sin datos";
  const diff = toValue - fromValue;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${Number(diff.toFixed(2))}${unit ? ` ${unit}` : ""}`;
}

function getAssessmentReassessmentState(dateKey?: string) {
  if (!dateKey) return { label: "", tone: "" };
  const target = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(target.getTime())) return { label: "", tone: "" };
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.ceil((target.getTime() - todayOnly.getTime()) / 86400000);
  if (diffDays < 0) return { label: "Reevaluación pendiente", tone: "border-red-200 bg-red-50 text-red-700" };
  if (diffDays <= 7) return { label: "Reevaluar pronto", tone: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Al día", tone: "border-line bg-panel text-ink/60" };
}

function buildAssessmentGroups(assessments: AssessmentEntry[]) {
  const groups = new Map<string, AssessmentGroup>();

  assessments.forEach((assessment, originalIndex) => {
    const category = normalizeAssessmentCategory(assessment.type);
    const unit = getAssessmentDisplayUnit(assessment);
    const key = getAssessmentGroupKey(assessment);
    const direction = assessment.improvementDirection ?? "neutral";
    const entry = { ...assessment, originalIndex, parsedValue: parseAssessmentNumber(assessment.result) };
    const currentGroup = groups.get(key);

    if (!currentGroup) {
      groups.set(key, {
        category,
        direction,
        entries: [entry],
        key,
        name: assessment.name || "Valoración sin nombre",
        unit
      });
      return;
    }

    currentGroup.entries.push(entry);
    if (currentGroup.direction === "neutral" && direction !== "neutral") currentGroup.direction = direction;
  });

  return [...groups.values()].map((group) => ({
    ...group,
    entries: group.entries.sort((left, right) => getAssessmentDateValue(left.date) - getAssessmentDateValue(right.date))
  }));
}
function AssessmentsView({
  client,
  onConsumeAnkleRequest,
  onConsumeKneeRequest,
  openAnkleOnLoad,
  openKneeOnLoad,
  onUpdateClient
}: {
  client?: CoachClient | null;
  onConsumeAnkleRequest?: () => void;
  onConsumeKneeRequest?: () => void;
  openAnkleOnLoad?: boolean;
  openKneeOnLoad?: boolean;
  onUpdateClient?: (updatedClient: CoachClient) => void;
}) {
  const [showNewAssessmentForm, setShowNewAssessmentForm] = useState(false);
  const [showAnkleAssessment, setShowAnkleAssessment] = useState(false);
  const [selectedAnkleAssessment, setSelectedAnkleAssessment] = useState<AnkleAssessment | null>(null);
  const [showKneeAssessment, setShowKneeAssessment] = useState(false);
  const [selectedKneeAssessment, setSelectedKneeAssessment] = useState<KneeAssessment | null>(null);
  const [assessmentDraft, setAssessmentDraft] = useState(emptyAssessmentDraft);
  const [assessmentFlowCategory, setAssessmentFlowCategory] = useState<AssessmentCatalogCategoryId | null>(null);
  const [assessmentFlowStep, setAssessmentFlowStep] = useState<"category" | "tests" | "manual" | "structured" | "loadVelocity">("category");
  const [selectedCatalogTest, setSelectedCatalogTest] = useState<AssessmentCatalogTest | null>(null);
  const [structuredMetricValues, setStructuredMetricValues] = useState<Record<string, string>>({});
  const [loadVelocityProfile, setLoadVelocityProfile] = useState<LoadVelocityProfile>({ exercise: "", loads: [createLoadVelocityPoint()] });
  const [editingAssessmentIndex, setEditingAssessmentIndex] = useState<number | null>(null);
  const [selectedEvolutionKey, setSelectedEvolutionKey] = useState<string | null>(null);
  const assessments: AssessmentEntry[] = client?.assessments ?? [];
  const assessmentGroups = buildAssessmentGroups(assessments);
  const isEditingAssessment = editingAssessmentIndex !== null;
  const favoriteTests = client?.assessmentPreferences?.favoriteTests ?? [];
  const reassessmentDates = client?.assessmentPreferences?.reassessmentDates ?? {};
  const favoriteGroups = assessmentGroups.filter((group) => favoriteTests.includes(group.key));
  const selectedEvolutionGroup = assessmentGroups.find((group) => group.key === selectedEvolutionKey) ?? null;

  useEffect(() => {
    setShowNewAssessmentForm(false);
    setAssessmentDraft(emptyAssessmentDraft);
    setAssessmentFlowCategory(null);
    setAssessmentFlowStep("category");
    setSelectedCatalogTest(null);
    setStructuredMetricValues({});
    setLoadVelocityProfile({ exercise: "", loads: [createLoadVelocityPoint()] });
    setEditingAssessmentIndex(null);
    setSelectedEvolutionKey(null);
    setSelectedAnkleAssessment(null);
    setShowAnkleAssessment(false);
    setSelectedKneeAssessment(null);
    setShowKneeAssessment(false);
  }, [client?.id]);

  useEffect(() => {
    if (!openAnkleOnLoad) return;
    setShowAnkleAssessment(true);
    onConsumeAnkleRequest?.();
  }, [onConsumeAnkleRequest, openAnkleOnLoad]);

  useEffect(() => {
    if (!openKneeOnLoad) return;
    setSelectedKneeAssessment(null);
    setShowKneeAssessment(true);
    onConsumeKneeRequest?.();
  }, [onConsumeKneeRequest, openKneeOnLoad]);

  useEffect(() => {
    if (!showNewAssessmentForm && !selectedEvolutionGroup) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showNewAssessmentForm) resetAssessmentForm();
        setSelectedEvolutionKey(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNewAssessmentForm, selectedEvolutionGroup]);

  const updateAssessmentDraft = (field: keyof typeof assessmentDraft, value: string) => {
    setAssessmentDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const resetAssessmentForm = () => {
    setAssessmentDraft(emptyAssessmentDraft);
    setAssessmentFlowCategory(null);
    setAssessmentFlowStep("category");
    setSelectedCatalogTest(null);
    setStructuredMetricValues({});
    setLoadVelocityProfile({ exercise: "", loads: [createLoadVelocityPoint()] });
    setEditingAssessmentIndex(null);
    setShowNewAssessmentForm(false);
  };

  const openNewAssessmentForm = () => {
    setAssessmentDraft(emptyAssessmentDraft);
    setAssessmentFlowCategory(null);
    setAssessmentFlowStep("category");
    setSelectedCatalogTest(null);
    setStructuredMetricValues({});
    setLoadVelocityProfile({ exercise: "", loads: [createLoadVelocityPoint()] });
    setEditingAssessmentIndex(null);
    setShowNewAssessmentForm(true);
  };

  function openManualAssessment(category = "Otro", name = "") {
    setAssessmentDraft({ ...emptyAssessmentDraft, category, name });
    setAssessmentFlowStep("manual");
  }

  function selectCatalogTest(test: AssessmentCatalogTest) {
    if (test.mode === "ankle") {
      resetAssessmentForm();
      setSelectedAnkleAssessment(null);
      setShowAnkleAssessment(true);
      return;
    }
    if (test.mode === "knee") {
      resetAssessmentForm();
      setSelectedKneeAssessment(null);
      setShowKneeAssessment(true);
      return;
    }

    if (test.mode === "structured") {
      setSelectedCatalogTest(test);
      setStructuredMetricValues({});
      setAssessmentDraft((currentDraft) => ({
        ...currentDraft,
        category: getAssessmentCatalogCategory(assessmentFlowCategory)?.label ?? "Otro",
        name: test.label
      }));
      setAssessmentFlowStep("structured");
      return;
    }

    if (test.mode === "load_velocity") {
      setSelectedCatalogTest(test);
      setLoadVelocityProfile({ exercise: "", loads: [createLoadVelocityPoint()] });
      setAssessmentDraft((currentDraft) => ({
        ...currentDraft,
        category: getAssessmentCatalogCategory(assessmentFlowCategory)?.label ?? "Fuerza",
        name: test.label
      }));
      setAssessmentFlowStep("loadVelocity");
      return;
    }

    const category = getAssessmentCatalogCategory(assessmentFlowCategory);
    openManualAssessment(category?.label ?? "Otro", test.label);
  }

  function updateAssessmentPreferences(nextPreferences: AssessmentPreferences) {
    if (!client || !onUpdateClient) return;
    onUpdateClient({
      ...client,
      assessmentPreferences: {
        favoriteTests: nextPreferences.favoriteTests ?? client.assessmentPreferences?.favoriteTests ?? [],
        reassessmentDates: nextPreferences.reassessmentDates ?? client.assessmentPreferences?.reassessmentDates ?? {}
      }
    });
  }

  function toggleFavoriteAssessment(groupKey: string) {
    const currentFavorites = client?.assessmentPreferences?.favoriteTests ?? [];
    const nextFavorites = currentFavorites.includes(groupKey)
      ? currentFavorites.filter((key) => key !== groupKey)
      : [...currentFavorites, groupKey];
    updateAssessmentPreferences({ favoriteTests: nextFavorites });
  }

  function updateReassessmentDate(groupKey: string, date: string) {
    updateAssessmentPreferences({
      reassessmentDates: {
        ...(client?.assessmentPreferences?.reassessmentDates ?? {}),
        [groupKey]: date
      }
    });
  }

  const handleSaveAssessment = () => {
    if (!client || !onUpdateClient || (!assessmentDraft.name.trim() && !assessmentDraft.result.trim())) return;

    const resultWithUnit = `${assessmentDraft.result.trim()}${assessmentDraft.unit.trim() ? ` ${assessmentDraft.unit.trim()}` : ""}`.trim();
    const newAssessment: AssessmentEntry = {
      action: "Ver evolución",
      date: assessmentDraft.date || "Sin fecha",
      improvementDirection: assessmentDraft.improvementDirection,
      name: assessmentDraft.name.trim() || "Valoración sin nombre",
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
      assessments: [newAssessment, ...(client.assessments ?? [])]
    });
    resetAssessmentForm();
  };

  const handleSaveStructuredAssessment = () => {
    if (!client || !onUpdateClient || !selectedCatalogTest?.metrics) return;

    const missingRequiredMetric = selectedCatalogTest.metrics.some(
      (metric) => metric.required && !isValidStructuredMetricValue(structuredMetricValues[metric.id])
    );
    const hasInvalidMetric = selectedCatalogTest.metrics.some((metric) => {
      const value = structuredMetricValues[metric.id];
      return Boolean(value?.trim()) && !isValidStructuredMetricValue(value);
    });
    if (missingRequiredMetric || hasInvalidMetric) return;

    const metrics = selectedCatalogTest.metrics
      .filter((metric) => structuredMetricValues[metric.id]?.trim())
      .map((metric) => ({
        id: metric.id,
        label: metric.label,
        unit: metric.unit,
        value: structuredMetricValues[metric.id].trim()
      }));
    const primaryMetricDefinition = selectedCatalogTest.metrics.find((metric) => metric.primary);
    const primaryMetric = primaryMetricDefinition
      ? metrics.find((metric) => metric.id === primaryMetricDefinition.id)
      : null;
    const bilateralMetrics = selectedCatalogTest.summary?.mode === "bilateral"
      ? selectedCatalogTest.summary.metricIds.map((metricId) => metrics.find((metric) => metric.id === metricId))
      : [];
    if (!primaryMetric && bilateralMetrics.some((metric) => !metric)) return;
    const result = primaryMetric
      ? `${primaryMetric.value} ${primaryMetric.unit}`
      : bilateralMetrics.map((metric) => `${metric?.label} ${metric?.value} ${metric?.unit}`).join(" · ");
    const summaryUnit = primaryMetric?.unit ?? bilateralMetrics[0]?.unit ?? "";

    const newAssessment: AssessmentEntry = {
      action: "Ver evolución",
      date: assessmentDraft.date || "Sin fecha",
      improvementDirection: assessmentDraft.improvementDirection,
      metrics,
      name: selectedCatalogTest.label,
      notes: assessmentDraft.notes.trim(),
      protocolId: selectedCatalogTest.id,
      result,
      type: assessmentDraft.category,
      unit: summaryUnit
    };

    if (editingAssessmentIndex !== null) {
      onUpdateClient({
        ...client,
        assessments: (client.assessments ?? []).map((assessment, index) =>
          index === editingAssessmentIndex ? newAssessment : assessment
        )
      });
    } else {
      onUpdateClient({ ...client, assessments: [newAssessment, ...(client.assessments ?? [])] });
    }
    resetAssessmentForm();
  };

  const updateLoadVelocityLoad = (loadId: string, value: string) => {
    setLoadVelocityProfile((currentProfile) => ({
      ...currentProfile,
      loads: currentProfile.loads.map((load) => load.id === loadId ? { ...load, loadKg: value } : load)
    }));
  };

  const updateLoadVelocityRepetition = (loadId: string, repetitionId: string, updates: Partial<LoadVelocityPoint["repetitions"][number]>) => {
    setLoadVelocityProfile((currentProfile) => ({
      ...currentProfile,
      loads: currentProfile.loads.map((load) => load.id === loadId
        ? { ...load, repetitions: load.repetitions.map((repetition) => repetition.id === repetitionId ? { ...repetition, ...updates } : repetition) }
        : load)
    }));
  };

  const addLoadVelocityRepetition = (loadId: string) => {
    setLoadVelocityProfile((currentProfile) => ({
      ...currentProfile,
      loads: currentProfile.loads.map((load) => load.id === loadId
        ? { ...load, repetitions: [...load.repetitions, { excluded: false, id: createLoadVelocityId("rep"), mpv: "" }] }
        : load)
    }));
  };

  const removeLoadVelocityRepetition = (loadId: string, repetitionId: string) => {
    setLoadVelocityProfile((currentProfile) => ({
      ...currentProfile,
      loads: currentProfile.loads.map((load) => load.id === loadId && load.repetitions.length > 1
        ? { ...load, repetitions: load.repetitions.filter((repetition) => repetition.id !== repetitionId) }
        : load)
    }));
  };

  const isLoadVelocityProfileValid = Boolean(loadVelocityProfile.exercise.trim()) && loadVelocityProfile.loads.length > 0 && loadVelocityProfile.loads.every((load) =>
    isValidStructuredMetricValue(load.loadKg) && load.repetitions.length > 0 && load.repetitions.every((repetition) => isValidStructuredMetricValue(repetition.mpv))
  );

  const handleSaveLoadVelocityProfile = () => {
    if (!client || !onUpdateClient || !selectedCatalogTest || !isLoadVelocityProfileValid) return;
    const normalizedProfile: LoadVelocityProfile = {
      exercise: loadVelocityProfile.exercise.trim(),
      loads: loadVelocityProfile.loads.map((load) => ({
        ...load,
        loadKg: load.loadKg.trim(),
        repetitions: load.repetitions.map((repetition) => ({ ...repetition, mpv: repetition.mpv.trim() }))
      }))
    };
    const newAssessment: AssessmentEntry = {
      action: "Ver perfil",
      date: assessmentDraft.date || "Sin fecha",
      improvementDirection: "neutral",
      loadVelocityProfile: normalizedProfile,
      name: selectedCatalogTest.label,
      notes: assessmentDraft.notes.trim(),
      protocolId: selectedCatalogTest.id,
      result: `${normalizedProfile.exercise} · ${normalizedProfile.loads.length} ${normalizedProfile.loads.length === 1 ? "carga" : "cargas"}`,
      type: assessmentDraft.category,
      unit: ""
    };
    if (editingAssessmentIndex !== null) {
      onUpdateClient({
        ...client,
        assessments: (client.assessments ?? []).map((assessment, index) => index === editingAssessmentIndex ? newAssessment : assessment)
      });
    } else {
      onUpdateClient({ ...client, assessments: [newAssessment, ...(client.assessments ?? [])] });
    }
    resetAssessmentForm();
  };

  const handleEditAssessment = (assessment: AssessmentEntry, index: number) => {
    const structuredTest = getAssessmentCatalogTest(assessment.protocolId);
    if (structuredTest?.mode === "load_velocity" && assessment.loadVelocityProfile) {
      setAssessmentDraft({
        category: normalizeAssessmentCategory(assessment.type),
        date: assessment.date === "Sin fecha" ? "" : assessment.date,
        improvementDirection: "neutral",
        name: assessment.name,
        notes: assessment.notes ?? "",
        result: "",
        unit: ""
      });
      setLoadVelocityProfile(assessment.loadVelocityProfile);
      setSelectedCatalogTest(structuredTest);
      setAssessmentFlowCategory(null);
      setAssessmentFlowStep("loadVelocity");
      setEditingAssessmentIndex(index);
      setShowNewAssessmentForm(true);
      return;
    }
    if (structuredTest?.metrics && assessment.metrics) {
      setAssessmentDraft({
        category: normalizeAssessmentCategory(assessment.type),
        date: assessment.date === "Sin fecha" ? "" : assessment.date,
        improvementDirection: assessment.improvementDirection ?? "neutral",
        name: assessment.name,
        notes: assessment.notes ?? "",
        result: "",
        unit: ""
      });
      setStructuredMetricValues(Object.fromEntries(assessment.metrics.map((metric) => [metric.id, metric.value])));
      setSelectedCatalogTest(structuredTest);
      setAssessmentFlowCategory(null);
      setAssessmentFlowStep("structured");
      setEditingAssessmentIndex(index);
      setShowNewAssessmentForm(true);
      return;
    }
    setAssessmentDraft({
      category: normalizeAssessmentCategory(assessment.type),
      date: assessment.date === "Sin fecha" ? "" : assessment.date,
      improvementDirection: assessment.improvementDirection ?? "neutral",
      name: assessment.name,
      notes: assessment.notes ?? "",
      result: getAssessmentDisplayValue(assessment),
      unit: assessment.unit ?? getAssessmentDisplayUnit(assessment)
    });
    setAssessmentFlowCategory(null);
    setAssessmentFlowStep("manual");
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

  function deleteKneeAssessment(assessmentId: string) {
    if (!client || !onUpdateClient || !window.confirm("¿Borrar esta valoración? Esta acción no se puede deshacer.")) return;
    onUpdateClient({
      ...client,
      kneeAssessments: (client.kneeAssessments ?? []).filter((assessment) => assessment.id !== assessmentId)
    });
    if (selectedKneeAssessment?.id === assessmentId) {
      setSelectedKneeAssessment(null);
      setShowKneeAssessment(false);
    }
  }

  function deleteAnkleAssessment(assessmentId: string) {
    if (!client || !onUpdateClient || !window.confirm("¿Borrar esta valoración? Esta acción no se puede deshacer.")) return;
    onUpdateClient({
      ...client,
      ankleAssessments: (client.ankleAssessments ?? []).filter((assessment) => assessment.id !== assessmentId)
    });
    if (selectedAnkleAssessment?.id === assessmentId) {
      setSelectedAnkleAssessment(null);
      setShowAnkleAssessment(false);
    }
  }

  function renderAssessmentGroupCard(group: AssessmentGroup) {
    const latestEntry = group.entries[group.entries.length - 1];
    const previousEntry = group.entries[group.entries.length - 2] ?? null;
    const numericEntries = group.entries.filter((entry) => entry.parsedValue !== null);
    const bestEntry = numericEntries.length > 0
      ? numericEntries.reduce((best, entry) => {
          if (group.direction === "lower_is_better") return (entry.parsedValue ?? Infinity) < (best.parsedValue ?? Infinity) ? entry : best;
          return (entry.parsedValue ?? -Infinity) > (best.parsedValue ?? -Infinity) ? entry : best;
        }, numericEntries[0])
      : latestEntry;
    const reassessmentDate = reassessmentDates[group.key];
    const reassessmentState = getAssessmentReassessmentState(reassessmentDate);
    const isFavorite = favoriteTests.includes(group.key);
    const isBilateral = getAssessmentCatalogTest(latestEntry.protocolId)?.summary?.mode === "bilateral";
    const isLoadVelocity = Boolean(latestEntry.loadVelocityProfile);
    const loadVelocityPointCount = getLoadVelocityProfilePoints(latestEntry.loadVelocityProfile).length;

    return (
      <article className="coach-subtle-card flex h-full flex-col rounded-md p-3" key={group.key}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-moss">{group.category}</p>
            <h4 className="mt-1 truncate font-semibold text-ink" title={group.name}>{group.name}</h4>
          </div>
          <button
            aria-label={isFavorite ? `Quitar ${group.name} de valoraciones principales` : `Marcar ${group.name} como valoración principal`}
            className={`grid size-8 shrink-0 place-items-center rounded-md border transition ${isFavorite ? "border-moss bg-mint text-moss" : "border-line bg-white text-ink/55 hover:bg-panel"}`}
            onClick={() => toggleFavoriteAssessment(group.key)}
            title={isFavorite ? "Quitar de principales" : "Marcar como principal"}
            type="button"
          >
            <Target size={15} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ClientInfoCard label="Último" value={`${latestEntry.result}`} />
          <ClientInfoCard
            label={isLoadVelocity ? "Puntos válidos" : isBilateral ? "Registros" : "Mejor"}
            value={isLoadVelocity ? `${loadVelocityPointCount}` : isBilateral ? `${group.entries.length}` : `${bestEntry?.result ?? latestEntry.result}`}
          />
        </div>
        {isLoadVelocity ? null : <StructuredAssessmentDetails assessment={latestEntry} />}

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink/55">
          <span className="rounded-md border border-line bg-white px-2 py-1">{isLoadVelocity ? (loadVelocityPointCount >= 2 ? "Perfil disponible" : "Perfil incompleto") : isBilateral ? "Seguimiento bilateral" : getAssessmentStatusLabel(group)}</span>
          {!isBilateral && !isLoadVelocity ? <span className="rounded-md border border-line bg-white px-2 py-1">Cambio: {getAssessmentChangeLabel(previousEntry?.parsedValue ?? null, latestEntry.parsedValue, group.unit)}</span> : null}
          <span className="px-1">{formatDisplayDate(latestEntry.date)} · {group.entries.length} registros</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <details className="group text-xs text-ink/55">
            <summary className="cursor-pointer font-semibold hover:text-ink">Opciones</summary>
            <label className="mt-2 block min-w-44 font-semibold text-ink/60">
              Próxima reevaluación
              <input
                className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink outline-none focus:border-moss"
                onChange={(event) => updateReassessmentDate(group.key, event.target.value)}
                type="date"
                value={reassessmentDate ?? ""}
              />
            </label>
            {reassessmentState.label ? <span className={`mt-2 inline-flex rounded-md border px-2 py-1 ${reassessmentState.tone}`}>{reassessmentState.label}</span> : null}
          </details>
          <div className="flex gap-1.5">
          <button aria-label={`Ver evolución de ${group.name}`} className="grid size-8 place-items-center rounded-md border border-line bg-white text-ink/65 transition hover:bg-panel hover:text-ink" onClick={() => setSelectedEvolutionKey(group.key)} title="Ver evolución" type="button">
            <Search size={15} />
          </button>
          <button aria-label={`Editar última valoración de ${group.name}`} className="grid size-8 place-items-center rounded-md border border-line bg-white text-ink/65 transition hover:bg-panel hover:text-ink" onClick={() => handleEditAssessment(latestEntry, latestEntry.originalIndex)} title="Editar último" type="button">
            <Settings2 size={15} />
          </button>
          <button aria-label={`Eliminar última valoración de ${group.name}`} className="grid size-8 place-items-center rounded-md border border-coral/35 bg-coral/10 text-coral transition hover:bg-coral/15" onClick={() => handleDeleteAssessment(latestEntry.originalIndex)} title="Eliminar último" type="button">
            <Trash2 size={15} />
          </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="mt-6 grid gap-6">
      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Valoraciones</p>
            <h2 className="text-lg font-semibold text-ink">
              {client ? `Valoraciones de ${client.name}` : "Valoraciones"}
            </h2>
            <p className="mt-1 text-sm text-ink/55">Tests, mediciones y reevaluaciones principales del cliente.</p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!client}
            onClick={openNewAssessmentForm}
            type="button"
          >
            + Añadir valoración
          </button>
        </div>
      </section>

      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Valoraciones funcionales</p>
            <h3 className="mt-1 font-semibold text-ink">Rodilla v1</h3>
            <p className="mt-1 text-sm text-ink/55">Valoración breve de tolerancia, movilidad, fuerza, control y performance.</p>
            <p className="mt-2 text-xs font-semibold text-ink/50">{client?.kneeAssessments?.length ?? 0} valoraciones{client?.kneeAssessments?.length ? ` · última ${formatDisplayDate(client.kneeAssessments[0].date)}` : " · sin registros todavía"}</p>
          </div>
          <button className="w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-45" disabled={!client} onClick={() => { setSelectedKneeAssessment(null); setShowKneeAssessment(true); }} type="button">{client?.kneeAssessments?.length ? "Repetir valoración" : "+ Valoración de rodilla"}</button>
        </div>
        {client?.kneeAssessments?.length ? <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{client.kneeAssessments.map((assessment) => {
          const statuses = getKneeDomainStatuses(assessment);
          const tones: Record<KneeDomainStatus, string> = { incomplete: "bg-panel text-ink/45", adequate: "bg-mint text-moss", finding: "bg-amber-50 text-amber-800", priority: "bg-orange-50 text-orange-800" };
          const dots: Record<KneeDomainStatus, string> = { incomplete: "bg-ink/25", adequate: "bg-moss", finding: "bg-amber-500", priority: "bg-orange-500" };
          const mainStatus = (Object.values(statuses).find((status) => status === "priority") ?? Object.values(statuses).find((status) => status === "finding") ?? Object.values(statuses).find((status) => status === "incomplete") ?? "adequate") as KneeDomainStatus;
          return <article className="flex items-center justify-between gap-3 rounded-md border border-line bg-white p-3" key={assessment.id}><div className="min-w-0"><p className="text-xs font-semibold uppercase text-moss">Rodilla</p><p className="mt-1 text-sm font-semibold text-ink">{formatDisplayDate(assessment.date)}</p><span className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${tones[mainStatus]}`}><span className={`size-1.5 rounded-full ${dots[mainStatus]}`} />{kneeStatusLabels[mainStatus]}</span></div><div className="flex shrink-0 gap-1.5"><button aria-label={`Ver valoración de rodilla del ${formatDisplayDate(assessment.date)}`} className="grid size-8 place-items-center rounded-md border border-line bg-panel text-ink/65 transition hover:text-ink" onClick={() => { setSelectedKneeAssessment(assessment); setShowKneeAssessment(true); }} title="Ver valoración" type="button"><Search size={15} /></button><button aria-label={`Borrar valoración de rodilla del ${formatDisplayDate(assessment.date)}`} className="grid size-8 place-items-center rounded-md border border-coral/35 bg-coral/10 text-coral transition hover:bg-coral/15" onClick={() => deleteKneeAssessment(assessment.id)} title="Borrar" type="button"><Trash2 size={15} /></button></div></article>;
        })}</div> : <p className="mt-4 rounded-md border border-dashed border-line bg-panel/25 p-3 text-sm text-ink/50">Inicia una valoración para crear un primer registro y facilitar futuros retests.</p>}
      </section>

      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Valoraciones funcionales</p>
            <h3 className="mt-1 font-semibold text-ink">Tobillo v1</h3>
            <p className="mt-1 text-sm text-ink/55">Evaluación breve por dominios para ordenar información y facilitar retests.</p>
            <p className="mt-2 text-xs font-semibold text-ink/50">{client?.ankleAssessments?.length ?? 0} valoraciones{client?.ankleAssessments?.length ? ` · última ${formatDisplayDate(client.ankleAssessments[0].date)}` : " · sin registros todavía"}</p>
          </div>
          <button className="w-fit rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-45" disabled={!client} onClick={() => { setSelectedAnkleAssessment(null); setShowAnkleAssessment(true); }} type="button">{client?.ankleAssessments?.length ? "Repetir valoración" : "+ Valoración de tobillo"}</button>
        </div>
        {client?.ankleAssessments?.length ? <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{client.ankleAssessments.map((assessment) => {
          const ankleStatuses = getAnkleDomainStatuses(assessment);
          const ankleTone: Record<AnkleDomainStatus, string> = { incomplete: "bg-panel text-ink/45", adequate: "bg-mint text-moss", finding: "bg-amber-50 text-amber-800", priority: "bg-orange-50 text-orange-800" };
          const ankleDots: Record<AnkleDomainStatus, string> = { incomplete: "bg-ink/25", adequate: "bg-moss", finding: "bg-amber-500", priority: "bg-orange-500" };
          const mainStatus = (Object.values(ankleStatuses).find((status) => status === "priority") ?? Object.values(ankleStatuses).find((status) => status === "finding") ?? Object.values(ankleStatuses).find((status) => status === "incomplete") ?? "adequate") as AnkleDomainStatus;
          return <article className="flex items-center justify-between gap-3 rounded-md border border-line bg-white p-3" key={assessment.id}><div className="min-w-0"><p className="text-xs font-semibold uppercase text-moss">Tobillo</p><p className="mt-1 text-sm font-semibold text-ink">{formatDisplayDate(assessment.date)}</p><span className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${ankleTone[mainStatus]}`}><span className={`size-1.5 rounded-full ${ankleDots[mainStatus]}`} />{ankleStatusLabels[mainStatus]}</span></div><div className="flex shrink-0 gap-1.5"><button aria-label={`Ver valoración de tobillo del ${formatDisplayDate(assessment.date)}`} className="grid size-8 place-items-center rounded-md border border-line bg-panel text-ink/65 transition hover:text-ink" onClick={() => { setSelectedAnkleAssessment(assessment); setShowAnkleAssessment(true); }} title="Ver valoración" type="button"><Search size={15} /></button><button aria-label={`Borrar valoración de tobillo del ${formatDisplayDate(assessment.date)}`} className="grid size-8 place-items-center rounded-md border border-coral/35 bg-coral/10 text-coral transition hover:bg-coral/15" onClick={() => deleteAnkleAssessment(assessment.id)} title="Borrar" type="button"><Trash2 size={15} /></button></div></article>;
        })}</div> : <p className="mt-4 rounded-md border border-dashed border-line bg-panel/25 p-3 text-sm text-ink/50">Inicia una valoración para crear un primer registro y facilitar futuros retests.</p>}
      </section>

      <section className="coach-surface rounded-md p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Valoraciones principales</h3>
            <p className="mt-1 text-sm text-ink/55">Marca las pruebas clave que quieres tener presentes al planificar.</p>
          </div>
          <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">{favoriteGroups.length}</span>
        </div>
        {favoriteGroups.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {favoriteGroups.map((group) => {
              const latestEntry = group.entries[group.entries.length - 1];
              return (
                <article className="rounded-md border border-line bg-panel/35 p-3" key={group.key}>
                  <p className="text-xs font-semibold uppercase text-moss">{group.category}</p>
                  <p className="mt-1 font-semibold text-ink">{group.name}</p>
                  <p className="mt-1 text-sm font-semibold text-ink/70">{latestEntry.result}</p>
                  <p className="mt-2 text-xs font-semibold text-ink/50">{getAssessmentStatusLabel(group)}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/55">
            Marca valoraciones principales para seguirlas en la planificación.
          </p>
        )}
      </section>

      <section className="coach-surface rounded-md p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink">Análisis disponibles</h3>
            <p className="mt-1 text-sm text-ink/55">Análisis derivados de tests compatibles, sin reconstruir datos ausentes.</p>
          </div>
          <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/50">Lectura orientativa</span>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {assessmentAnalysisRequirements.map((analysis) => analysis.id === "dsi" ? (
            <DsiAnalysisCard assessments={assessments} key={analysis.id} />
          ) : analysis.id === "load-velocity" ? (
            <LoadVelocityAnalysisCard assessments={assessments} key={analysis.id} />
          ) : (
            <article className="rounded-md border border-line bg-panel/30 p-3" key={analysis.id}>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-ink">{analysis.label}</h4>
                <span className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink/55">Faltan datos</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink/50">{analysis.requirement}</p>
            </article>
          ))}
        </div>
      </section>

      {assessmentGroups.length > 0 ? (
        <section className="coach-surface rounded-md p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink">Tests y mediciones</h3>
              <p className="mt-1 text-sm text-ink/55">Último valor, mejor registro y cambio reciente.</p>
            </div>
            <span className="rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/60">{assessmentGroups.length}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assessmentGroups.map((group) => renderAssessmentGroupCard(group))}
          </div>
        </section>
      ) : null}

      {assessments.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-panel/35 p-5 text-center text-sm text-ink/55">
          No hay valoraciones registradas todavía.
        </div>
      ) : null}

      {showNewAssessmentForm ? (
        <div aria-labelledby="assessment-modal-title" aria-modal="true" className="assessment-modal-overlay" onClick={resetAssessmentForm} role="dialog">
          <form className="assessment-modal-panel" onClick={(event) => event.stopPropagation()} onSubmit={(event) => event.preventDefault()}>
            <header className="assessment-modal-header flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-ink" id="assessment-modal-title">{isEditingAssessment ? "Editar valoración" : "Añadir valoración"}</h3>
                <p className="mt-1 text-sm text-ink/55">Registra una valoración objetiva sin modificar cálculos de carga.</p>
              </div>
              <button aria-label="Cerrar" className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink/60 transition hover:bg-panel hover:text-ink" onClick={resetAssessmentForm} type="button">
                <X size={18} />
              </button>
            </header>

            <div className="assessment-modal-body px-5 py-5">
              {assessmentFlowStep === "category" ? (
                <div>
                  <h4 className="font-semibold text-ink">¿Qué quieres valorar?</h4>
                  <p className="mt-1 text-sm text-ink/55">Selecciona una categoría para ver los tests disponibles.</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {assessmentCatalog.map((category) => (
                      <button
                        className="rounded-md border border-line bg-white px-3 py-3 text-left text-sm font-semibold text-ink transition hover:border-moss/50 hover:bg-panel"
                        key={category.id}
                        onClick={() => {
                          setAssessmentFlowCategory(category.id);
                          setAssessmentFlowStep("tests");
                        }}
                        type="button"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  <button className="mt-3 rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold text-ink/65" onClick={() => openManualAssessment()} type="button">
                    Otro / Registro manual
                  </button>
                </div>
              ) : null}

              {assessmentFlowStep === "tests" ? (() => {
                const category = getAssessmentCatalogCategory(assessmentFlowCategory);
                if (!category) return null;
                return (
                  <div>
                    <button className="text-sm font-semibold text-moss" onClick={() => setAssessmentFlowStep("category")} type="button">← Volver a categorías</button>
                    <h4 className="mt-3 text-lg font-semibold text-ink">{category.label}</h4>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {category.subcategories.map((subcategory) => (
                        <section className="rounded-md border border-line bg-panel/30 p-3" key={subcategory.id}>
                          <h5 className="text-sm font-semibold text-ink">{subcategory.label}</h5>
                          {subcategory.tests.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {subcategory.tests.map((test) => (
                                <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-moss/50 hover:text-ink" key={test.id} onClick={() => selectCatalogTest(test)} type="button">
                                  {test.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-ink/45">Sin tests activos todavía.</p>
                          )}
                        </section>
                      ))}
                    </div>
                    {category.id !== "functionality" ? (
                      <button className="mt-3 rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold text-ink/65" onClick={() => openManualAssessment(category.label)} type="button">
                        Registro manual en {category.label}
                      </button>
                    ) : null}
                  </div>
                );
              })() : null}

              {assessmentFlowStep === "manual" ? (
                <div>
                  {!isEditingAssessment ? <button className="mb-3 text-sm font-semibold text-moss" onClick={() => setAssessmentFlowStep(assessmentFlowCategory ? "tests" : "category")} type="button">← Volver</button> : null}
                  <div className="mb-4 rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/60">
                    <span className="font-semibold text-ink">Registro manual</span> · {assessmentDraft.category}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                      Nombre del test / valoración
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("name", event.target.value)} value={assessmentDraft.name} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Fecha
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("date", event.target.value)} type="date" value={assessmentDraft.date} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Valor
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("result", event.target.value)} value={assessmentDraft.result} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Unidad
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("unit", event.target.value)} placeholder="kg, cm, segundos, puntos, %, m, W" value={assessmentDraft.unit} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Dirección de mejora
                      <select className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("improvementDirection", event.target.value as AssessmentImprovementDirection)} value={assessmentDraft.improvementDirection}>
                        {Object.entries(assessmentImprovementDirectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                      Notas
                      <textarea className="mt-1 min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("notes", event.target.value)} value={assessmentDraft.notes} />
                    </label>
                  </div>
                </div>
              ) : null}

              {assessmentFlowStep === "structured" && selectedCatalogTest?.metrics ? (
                <div>
                  {!isEditingAssessment ? (
                    <button className="mb-3 text-sm font-semibold text-moss" onClick={() => setAssessmentFlowStep("tests")} type="button">
                      ← Volver
                    </button>
                  ) : null}
                  <div className="mb-4 rounded-md border border-line bg-panel/35 px-3 py-2">
                    <p className="text-sm font-semibold text-ink">{selectedCatalogTest.label}</p>
                    <p className="mt-1 text-xs text-ink/50">Introduce los valores medidos. Las unidades están definidas por el protocolo.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-semibold text-ink/70">
                      Fecha
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("date", event.target.value)} type="date" value={assessmentDraft.date} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Dirección de mejora
                      <select className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("improvementDirection", event.target.value as AssessmentImprovementDirection)} value={assessmentDraft.improvementDirection}>
                        {Object.entries(assessmentImprovementDirectionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                      {selectedCatalogTest.metrics.map((metric) => {
                        const normalized = getNormalizedAssessmentMetric(metric, structuredMetricValues[metric.id] ?? "");
                        return (
                          <label className="text-sm font-semibold text-ink/70" key={metric.id}>
                            <span className="flex items-center justify-between gap-2">
                              <span>{metric.label}</span>
                              <span className="text-xs font-medium text-ink/40">{metric.required ? "Requerida" : "Opcional"}</span>
                            </span>
                            <span className="mt-1 flex h-11 overflow-hidden rounded-md border border-line bg-white focus-within:border-moss">
                              <input
                                aria-label={`${metric.label} en ${metric.unit}`}
                                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none"
                                inputMode="decimal"
                                min="0"
                                onChange={(event) => setStructuredMetricValues((currentValues) => ({ ...currentValues, [metric.id]: event.target.value }))}
                                required={metric.required}
                                step="any"
                                type="number"
                                value={structuredMetricValues[metric.id] ?? ""}
                              />
                              <span className="grid min-w-14 place-items-center border-l border-line bg-panel/55 px-3 text-xs font-semibold text-ink/60">{metric.unit}</span>
                            </span>
                            {normalized ? <span className="mt-1 block text-xs font-medium text-ink/45">≈ {normalized.value} {normalized.unit}</span> : null}
                          </label>
                        );
                      })}
                    </div>
                    {selectedCatalogTest.summary?.mode === "bilateral" ? (() => {
                      const currentMetrics = selectedCatalogTest.metrics
                        .filter((metric) => isValidStructuredMetricValue(structuredMetricValues[metric.id]))
                        .map((metric) => ({ id: metric.id, label: metric.label, unit: metric.unit, value: structuredMetricValues[metric.id] }));
                      const bilateral = getBilateralAssessmentResult(
                        selectedCatalogTest.metrics,
                        currentMetrics,
                        selectedCatalogTest.summary.metricIds
                      );
                      return bilateral ? (
                        <div className="rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink/60 md:col-span-2">
                          <span className="font-semibold text-ink">Asimetría: {bilateral.asymmetryPercent}%</span>
                          <span className="mx-2 text-ink/25">·</span>
                          Lado menor: {bilateral.lowerSide}
                        </div>
                      ) : null;
                    })() : null}
                    <label className="text-sm font-semibold text-ink/70 md:col-span-2">
                      Notas
                      <textarea className="mt-1 min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("notes", event.target.value)} value={assessmentDraft.notes} />
                    </label>
                  </div>
                </div>
              ) : null}

              {assessmentFlowStep === "loadVelocity" ? (
                <div>
                  {!isEditingAssessment ? <button className="mb-3 text-sm font-semibold text-moss" onClick={() => setAssessmentFlowStep("tests")} type="button">← Volver</button> : null}
                  <div className="mb-4 rounded-md border border-line bg-panel/35 px-3 py-2">
                    <p className="text-sm font-semibold text-ink">Perfil carga–velocidad</p>
                    <p className="mt-1 text-xs text-ink/50">Registra todas las repeticiones. La gráfica utiliza la mejor MPV válida de cada carga.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-ink/70">
                      Ejercicio
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => setLoadVelocityProfile((profile) => ({ ...profile, exercise: event.target.value }))} placeholder="Ej. Sentadilla" value={loadVelocityProfile.exercise} />
                    </label>
                    <label className="text-sm font-semibold text-ink/70">
                      Fecha
                      <input className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("date", event.target.value)} type="date" value={assessmentDraft.date} />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {loadVelocityProfile.loads.map((load, loadIndex) => {
                      const validMpvValues = load.repetitions
                        .filter((repetition) => !repetition.excluded && isValidStructuredMetricValue(repetition.mpv))
                        .map((repetition) => Number(repetition.mpv));
                      const bestMpv = validMpvValues.length > 0 ? Math.max(...validMpvValues) : null;
                      return (
                        <section className="rounded-md border border-line bg-panel/30 p-3" key={load.id}>
                          <div className="flex flex-wrap items-end justify-between gap-3">
                            <label className="min-w-40 flex-1 text-sm font-semibold text-ink/70">
                              Carga {loadIndex + 1}
                              <span className="mt-1 flex h-10 overflow-hidden rounded-md border border-line bg-white focus-within:border-moss">
                                <input aria-label={`Carga ${loadIndex + 1} en kg`} className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none" inputMode="decimal" min="0" onChange={(event) => updateLoadVelocityLoad(load.id, event.target.value)} step="any" type="number" value={load.loadKg} />
                                <span className="grid min-w-14 place-items-center border-l border-line bg-panel/55 px-3 text-xs font-semibold text-ink/60">kg</span>
                              </span>
                            </label>
                            {loadVelocityProfile.loads.length > 1 ? (
                              <button aria-label={`Eliminar carga ${loadIndex + 1}`} className="grid size-9 place-items-center rounded-md border border-line bg-white text-ink/50 transition hover:text-coral" onClick={() => setLoadVelocityProfile((profile) => ({ ...profile, loads: profile.loads.filter((candidate) => candidate.id !== load.id) }))} title="Eliminar carga" type="button"><Trash2 size={15} /></button>
                            ) : null}
                          </div>

                          <div className="mt-3 grid gap-2">
                            {load.repetitions.map((repetition, repetitionIndex) => {
                              const isBest = !repetition.excluded && bestMpv !== null && Number(repetition.mpv) === bestMpv;
                              return (
                                <div className={`grid gap-2 rounded-md border p-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center ${repetition.excluded ? "border-line bg-panel/60 opacity-70" : isBest ? "border-blue-200 bg-blue-50/70" : "border-line bg-white"}`} key={repetition.id}>
                                  <label className="text-xs font-semibold text-ink/60">
                                    Rep {repetitionIndex + 1}{isBest ? " · Mejor válida" : ""}
                                    <span className="mt-1 flex h-9 overflow-hidden rounded-md border border-line bg-white focus-within:border-moss">
                                      <input aria-label={`Carga ${loadIndex + 1}, repetición ${repetitionIndex + 1} MPV`} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none" inputMode="decimal" min="0" onChange={(event) => updateLoadVelocityRepetition(load.id, repetition.id, { mpv: event.target.value })} step="any" type="number" value={repetition.mpv} />
                                      <span className="grid min-w-14 place-items-center border-l border-line bg-panel/55 px-2 text-[11px] font-semibold text-ink/60">m/s</span>
                                    </span>
                                  </label>
                                  <label className="flex min-h-9 items-center gap-2 text-xs font-semibold text-ink/55">
                                    <input checked={repetition.excluded} onChange={(event) => updateLoadVelocityRepetition(load.id, repetition.id, { excluded: event.target.checked })} type="checkbox" />
                                    Excluir
                                  </label>
                                  {load.repetitions.length > 1 ? (
                                    <button aria-label={`Eliminar repetición ${repetitionIndex + 1} de carga ${loadIndex + 1}`} className="grid size-9 place-items-center rounded-md border border-line bg-white text-ink/45 transition hover:text-coral" onClick={() => removeLoadVelocityRepetition(load.id, repetition.id)} title="Eliminar repetición" type="button"><Trash2 size={14} /></button>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65" onClick={() => addLoadVelocityRepetition(load.id)} type="button">+ Añadir repetición</button>
                            <span className="text-xs font-semibold text-ink/50">{bestMpv === null ? "Sin repetición válida" : `Punto: ${load.loadKg || "—"} kg · ${bestMpv} m/s`}</span>
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  <button className="mt-3 rounded-md border border-dashed border-line px-3 py-2 text-sm font-semibold text-ink/65" onClick={() => setLoadVelocityProfile((profile) => ({ ...profile, loads: [...profile.loads, createLoadVelocityPoint()] }))} type="button">+ Añadir carga</button>

                  <div className="mt-4">
                    <LoadVelocityProfileChart profile={loadVelocityProfile} />
                    {getLoadVelocityProfilePoints(loadVelocityProfile).length < 2 ? <p className="mt-2 text-xs font-medium text-ink/50">Perfil incompleto · añade al menos dos cargas con una repetición válida para visualizar una relación multipunto.</p> : null}
                  </div>

                  <label className="mt-4 block text-sm font-semibold text-ink/70">
                    Notas
                    <textarea className="mt-1 min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss" onChange={(event) => updateAssessmentDraft("notes", event.target.value)} value={assessmentDraft.notes} />
                  </label>
                </div>
              ) : null}
            </div>

            <footer className="assessment-modal-footer flex flex-wrap justify-end gap-2 px-5 py-4">
              <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={resetAssessmentForm} type="button">Cancelar</button>
              {assessmentFlowStep === "manual" ? (
                <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSaveAssessment} type="button">
                  {isEditingAssessment ? "Guardar cambios" : "Guardar valoración"}
                </button>
              ) : null}
              {assessmentFlowStep === "structured" ? (
                <button
                  className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={selectedCatalogTest?.metrics?.some((metric) => {
                    const value = structuredMetricValues[metric.id];
                    return metric.required ? !isValidStructuredMetricValue(value) : Boolean(value?.trim()) && !isValidStructuredMetricValue(value);
                  })}
                  onClick={handleSaveStructuredAssessment}
                  type="button"
                >
                  {isEditingAssessment ? "Guardar cambios" : "Guardar valoración"}
                </button>
              ) : null}
              {assessmentFlowStep === "loadVelocity" ? (
                <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45" disabled={!isLoadVelocityProfileValid} onClick={handleSaveLoadVelocityProfile} type="button">
                  {isEditingAssessment ? "Guardar cambios" : "Guardar perfil"}
                </button>
              ) : null}
            </footer>
          </form>
        </div>
      ) : null}

      {showAnkleAssessment && client && onUpdateClient ? (
        <CoachAnkleAssessment
          assessment={selectedAnkleAssessment ?? undefined}
          clientName={client.name}
          history={client.ankleAssessments ?? []}
          onClose={() => { setShowAnkleAssessment(false); setSelectedAnkleAssessment(null); }}
          onSave={(assessment) => onUpdateClient({ ...client, ankleAssessments: [assessment, ...(client.ankleAssessments ?? [])] })}
          readOnly={Boolean(selectedAnkleAssessment)}
        />
      ) : null}

      {showKneeAssessment && client && onUpdateClient ? (
        <CoachKneeAssessment
          assessment={selectedKneeAssessment ?? undefined}
          clientName={client.name}
          history={client.kneeAssessments ?? []}
          onClose={() => { setShowKneeAssessment(false); setSelectedKneeAssessment(null); }}
          onSave={(assessment) => onUpdateClient({ ...client, kneeAssessments: [assessment, ...(client.kneeAssessments ?? [])] })}
          readOnly={Boolean(selectedKneeAssessment)}
        />
      ) : null}

      {selectedEvolutionGroup ? (
        <AssessmentEvolutionModal group={selectedEvolutionGroup} onClose={() => setSelectedEvolutionKey(null)} />
      ) : null}
    </div>
  );
}

function AssessmentEvolutionModal({ group, onClose }: { group: AssessmentGroup; onClose: () => void }) {
  const values = group.entries.map((entry) => entry.parsedValue).filter((value): value is number => value !== null);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const latestEntry = group.entries[group.entries.length - 1];
  const firstEntry = group.entries[0];
  const previousEntry = group.entries[group.entries.length - 2] ?? null;
  const isBilateral = getAssessmentCatalogTest(latestEntry.protocolId)?.summary?.mode === "bilateral";
  const isLoadVelocity = Boolean(latestEntry.loadVelocityProfile);
  const bestEntry = values.length > 0
    ? group.entries.filter((entry) => entry.parsedValue !== null).reduce((best, entry) => {
        if (group.direction === "lower_is_better") return (entry.parsedValue ?? Infinity) < (best.parsedValue ?? Infinity) ? entry : best;
        return (entry.parsedValue ?? -Infinity) > (best.parsedValue ?? -Infinity) ? entry : best;
      })
    : latestEntry;

  return (
    <div aria-modal="true" className="assessment-modal-overlay" onClick={onClose} role="dialog">
      <div className="assessment-modal-panel" onClick={(event) => event.stopPropagation()}>
        <header className="assessment-modal-header flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Evolución</p>
            <h3 className="text-xl font-semibold text-ink">{group.name}</h3>
            <p className="mt-1 text-sm text-ink/55">{group.category} · {assessmentImprovementDirectionLabels[group.direction]}</p>
          </div>
          <button aria-label="Cerrar" className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink/60 transition hover:bg-panel hover:text-ink" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <div className="assessment-modal-body grid gap-4 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ClientInfoCard label={isLoadVelocity ? "Último perfil" : "Último valor"} value={latestEntry.result} />
            {isLoadVelocity ? (
              <ClientInfoCard label="Perfiles registrados" value={`${group.entries.length}`} />
            ) : isBilateral ? (
              <ClientInfoCard label="Mediciones" value={`${group.entries.length}`} />
            ) : (
              <>
                <ClientInfoCard label="Mejor valor" value={bestEntry.result} />
                <ClientInfoCard label="Cambio anterior" value={getAssessmentChangeLabel(previousEntry?.parsedValue ?? null, latestEntry.parsedValue, group.unit)} />
                <ClientInfoCard label="Desde inicio" value={getAssessmentChangeLabel(firstEntry.parsedValue, latestEntry.parsedValue, group.unit)} />
              </>
            )}
          </div>
          {!isBilateral && !isLoadVelocity ? <div className="rounded-md border border-line bg-panel/35 p-4">
            <h4 className="font-semibold text-ink">Gráfico simple</h4>
            {values.length > 0 ? (
              <div className="mt-4 flex h-40 items-end gap-2 rounded-md bg-white/60 p-3">
                {group.entries.map((entry) => {
                  const value = entry.parsedValue;
                  const height = value === null ? 8 : 12 + ((value - minValue) / Math.max(1, maxValue - minValue)) * 88;
                  return (
                    <div className="flex flex-1 flex-col items-center gap-2" key={`${entry.date}-${entry.result}`}>
                      <div className="w-full rounded-t bg-moss/80" style={{ height: `${height}%` }} title={entry.result} />
                      <span className="text-[10px] font-semibold text-ink/45">{formatDisplayDate(entry.date).slice(0, 5)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink/55">Sin valores numéricos suficientes para dibujar evolución.</p>
            )}
          </div> : null}
          <div className="rounded-md border border-line bg-panel/35 p-4">
            <h4 className="font-semibold text-ink">Historial de mediciones</h4>
            <div className="mt-3 grid gap-2">
              {group.entries.map((entry) => (
                <div className="rounded-md border border-line bg-white px-3 py-2 text-sm" key={`${entry.date}-${entry.result}-${entry.originalIndex}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{entry.result}</span>
                    <span className="text-ink/50">{formatDisplayDate(entry.date)}</span>
                  </div>
                  {entry.notes ? <p className="mt-2 text-ink/60">{entry.notes}</p> : null}
                  {entry.loadVelocityProfile ? <LoadVelocityProfileDetails assessment={entry} /> : <StructuredAssessmentDetails assessment={entry} includeMeasured />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
      <section className="coach-surface rounded-md p-4">
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
        <div className="mt-4 space-y-2.5">
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
    Cuádriceps: { cx: 103, cy: 274, mirror: true, rx: 13, ry: 38 }
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
    quadriceps: { muscle: "Cuádriceps", side: "Frontal" },
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
type SessionExerciseBlock = "activation" | "main" | "complementary";
type StrengthIntensityMethod = "rir" | "rpe" | "percent_1rm" | "velocity" | "kg" | "external_load";
type EnduranceIntensityMethod = "zones" | "rounds" | "thresholds";
type PlannedStrengthExerciseDraft = {
  bandColor?: string;
  bandResistance?: string;
  block: StrengthSessionBlock;
  exerciseId: string;
  exerciseSearch: string;
  id: string;
  intensityMethod?: "" | StrengthIntensityMethod;
  load: string;
  observation: string;
  percent1RM?: string;
  prescriptionBlockId?: string;
  prescriptionRole?: PlanningPrescriptionRole;
  prescriptionSource?: "default" | "custom" | "legacy";
  prescriptionMode?: "standard" | "custom";
  sessionBlock?: SessionExerciseBlock;
  reps: string;
  rest: string;
  selectedEquipment?: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  plannedSetReps?: string[];
  setMethod?: SetMethod;
  clusterConfig?: ClusterConfig;
  tempo?: ExerciseTempo;
  sets: string;
  targetRir: string;
  targetRpe: string;
  targetVelocity?: string;
  videoNote?: string;
  videoUrl?: string;
};
type SessionTemplateExercise = PlannedStrengthExerciseDraft;
type SessionTemplateCategory = "Fuerza" | "Potencia" | "Resistencia" | "Mixto" | "Recuperación";
type SessionTemplate = {
  cardioPlanDraft?: CardioPlanDraft;
  category?: SessionTemplateCategory;
  createdAt: string;
  description: string;
  durationApprox?: string;
  enduranceMethod?: EnduranceIntensityMethod;
  id: string;
  isSystem?: boolean;
  name: string;
  objective?: string;
  resistanceMethodId?: string;
  resistanceSport?: ResistanceSport;
  sessionType: CoachSessionType;
  strengthMethod?: StrengthIntensityMethod;
  strengthExercises: SessionTemplateExercise[];
  summary: string;
  targetResistanceZoneId?: PlannedResistanceZoneId;
  targetRpe?: string;
};
type CoachSessionQuantifier = {
  fields: string[];
  primary: string[];
};

const setMethodOptions: Array<{ description: string; id: SetMethod; label: string; visual: string }> = [
  { description: "Misma estructura entre series", id: "straight", label: "Lineal", visual: "▆ ▆ ▆ ▆" },
  { description: "Evolución progresiva", id: "ascending", label: "Ascendente", visual: "▂ ▄ ▆ █" },
  { description: "Evolución descendente", id: "descending", label: "Descendente", visual: "█ ▆ ▄ ▂" },
  { description: "Repeticiones agrupadas con pausas breves", id: "cluster", label: "Cluster", visual: "▮▮ · ▮▮ · ▮▮" }
];

function getSetMethodLabel(method?: SetMethod | null) {
  return setMethodOptions.find((option) => option.id === (method ?? "straight"))?.label ?? "Lineal";
}

const coachSessionQuantifiers: Record<CoachSessionType, CoachSessionQuantifier> = {
  Cardio: {
    primary: ["sRPE", "iTRIMP", "tiempo en zona", "distancia", "ritmo/potencia"],
    fields: [
      "Duración planificada",
      "RPE esperado",
      "FC medía objetivo",
      "FC máxima estimada",
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
      "Velocidad o pérdida de velocidad",
      "Observaciones"
    ]
  },
  Mixta: {
    primary: ["sRPE", "volumen-carga", "tiempo de trabajo", "rounds/esfuerzos", "carga semanal"],
    fields: [
      "Bloque de fuerza",
      "Bloque metabólico",
      "Duración total",
      "RPE esperado",
      "Rounds / esfuerzos",
      "Tiempo de trabajo",
      "Volumen-carga",
      "FC objetivo",
      "Notas de transición"
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
const bandColorOptions = ["Amarilla", "Roja", "Verde", "Azul", "Negra", "Otra"];
const resistanceZoneMetricLabels: Array<{ key: keyof NonNullable<ResistanceZone["metrics"]>; label: string }> = [
  { key: "masPercent", label: "MAS" },
  { key: "mapPercent", label: "MAP" },
  { key: "vo2maxPercent", label: "VO2max" },
  { key: "hrMaxPercent", label: "HRmax" },
  { key: "hrrPercent", label: "HRR" },
  { key: "mlssPowerPercent", label: "W-MLSS" },
  { key: "rpe", label: "RPE" }
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

function getResistanceMethodLabel(method?: ResistanceMethod | null) {
  return method ? `${method.method} · ${method.name}` : "";
}

function getResistanceZoneMetrics(zone?: ResistanceZone | null) {
  if (!zone) return [];
  return resistanceZoneMetricLabels
    .map((metric) => {
      const value = zone.metrics?.[metric.key];
      return value ? `${metric.label} ${value}` : "";
    })
    .filter(Boolean);
}

function getResistanceZoneGuide(sport?: ResistanceSport, zoneId?: string | null) {
  const profile = getSportZoneProfile(sport ?? "generic");
  const zone = profile.zones.find((item) => item.id === zoneId) ?? null;
  return { metrics: getResistanceZoneMetrics(zone), profile, zone };
}

const techniqueVideoViewLabels: Record<TechniqueVideoView, string> = {
  back: "Posterior",
  front: "Frontal",
  other: "Otra",
  side: "Lateral"
};

const techniqueReviewStatusLabels: Record<TechniqueReviewStatus, string> = {
  high_compensation: "Compensación alta",
  minor_compensation: "Compensación leve",
  moderate_compensation: "Compensación moderada",
  not_reviewed: "Sin revisar",
  ok: "Técnica correcta"
};

const techniqueCompensationTags = [
  "Valgo dinámico",
  "Asimetría derecha/izquierda",
  "Pérdida de rango",
  "Pérdida de control excéntrico",
  "Flexión lumbar",
  "Compensación lumbar",
  "Elevación de hombro",
  "Inestabilidad pélvica",
  "Técnica correcta",
  "Otro"
];

const techniqueAssessmentStatusLabels: Record<TechniqueAssessmentStatus, string> = {
  issue: "Problema",
  ok: "Correcto",
  watch: "Vigilar"
};

const techniqueAssessmentSideLabels: Record<TechniqueAssessmentSide, string> = {
  both: "Ambos",
  left: "Izquierda",
  not_applicable: "No aplica",
  right: "Derecha"
};

const techniqueAssessmentSeverityLabels: Record<TechniqueAssessmentSeverity, string> = {
  high: "Alta",
  low: "Leve",
  moderate: "Moderada"
};

const techniqueGlobalScoreLabels: Record<TechniqueGlobalScore, string> = {
  acceptable: "Aceptable",
  good: "Bien",
  high_priority: "Prioridad alta",
  needs_work: "Necesita trabajo"
};

const techniquePlanningDecisionLabels: Record<Exclude<TechniquePlanningDecision, "">, string> = {
  change_exercise: "Cambiar ejercicio",
  keep_progression: "Mantener progresión",
  mobility_or_control_focus: "Enfocar movilidad/control",
  reduce_load: "Reducir carga",
  regress: "Regresar ejercicio",
  repeat_exercise: "Repetir ejercicio"
};

const techniqueAssessmentPresets: Record<string, string[]> = {
  "Core / Trunk Control": [
    "Control lumbar",
    "Control pélvico",
    "Respiración / brace",
    "Compensación cervical",
    "Simetría",
    "Pérdida de posición"
  ],
  "Hinge / Horizontal Force": [
    "Bisagra de cadera clara",
    "Columna neutra",
    "Barra/carga cerca del cuerpo",
    "Tensión dorsal",
    "Control de pelvis",
    "Simetría derecha/izquierda",
    "Control excéntrico"
  ],
  "Lunge / Unilateral Force": [
    "Alineación rodilla-pie",
    "Estabilidad pélvica",
    "Control frontal de rodilla",
    "Control excéntrico",
    "Rango adecuado",
    "Simetría derecha/izquierda",
    "Estabilidad del pie"
  ],
  "Olympic derivatives": [
    "Posición de salida",
    "Extensión potente de cadera",
    "Trayectoria de la barra",
    "Recepción estable",
    "Timing",
    "Control del tronco"
  ],
  "Plyometrics / Jumps": [
    "Aterrizaje estable",
    "Valgo dinámico",
    "Rigidez adecuada",
    "Control de tronco",
    "Simetría derecha/izquierda",
    "Contacto reactivo si aplica"
  ],
  "Pull / Upper Body Pull": [
    "Control escapular",
    "Rango adecuado",
    "Compensación cervical",
    "Compensación lumbar",
    "Simetría derecha/izquierda",
    "Control excéntrico"
  ],
  "Push / Upper Body Press": [
    "Control escapular",
    "Rango adecuado",
    "Trayectoria estable",
    "Compensación lumbar",
    "Simetría derecha/izquierda",
    "Control excéntrico"
  ],
  "Squat / Vertical Force": [
    "Alineación rodilla-pie",
    "Profundidad adecuada",
    "Control de pelvis",
    "Columna neutra",
    "Talones apoyados",
    "Simetría derecha/izquierda",
    "Control excéntrico"
  ]
};

const fallbackTechniqueAssessmentPreset = [
  "Rango adecuado",
  "Control técnico",
  "Simetría",
  "Compensaciones visibles",
  "Dolor o molestia reportada",
  "Observaciones del entrenador"
];

function getTechniqueAssessmentPreset(pattern?: string | null): TechniqueAssessmentItem[] {
  const labels = techniqueAssessmentPresets[pattern ?? ""] ?? fallbackTechniqueAssessmentPreset;
  const idPrefix = (pattern ?? "fallback")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return labels.map((label, index) => ({
    id: `${idPrefix}-${index + 1}`,
    label,
    severity: "low",
    side: "not_applicable",
    status: "ok"
  }));
}

function isDirectVideoFileUrl(url?: string | null) {
  return Boolean(url?.trim().match(/\.(mp4|mov|webm|m4v)(\?.*)?$/i));
}

function buildResistanceMethodTemplateNotes(method: ResistanceMethod, sport?: ResistanceSport, zoneId?: string) {
  const zoneGuide = getResistanceZoneGuide(sport, zoneId);
  const zoneMetrics = zoneGuide.metrics.slice(0, 3).join(" · ");
  return [
    `Método de resistencia: ${getResistanceMethodLabel(method)}`,
    sport ? `Deporte: ${zoneGuide.profile.name}` : "",
    zoneGuide.zone ? `Zona objetivo: ${zoneGuide.zone.label}` : "",
    zoneMetrics ? `Guía: ${zoneMetrics}` : "",
    method.intensity ? `Intensidad: ${method.intensity}` : "",
    method.sessionDuration ? `Duración / tiempo total: ${method.sessionDuration}` : "",
    method.repetitions ? `Repeticiones: ${method.repetitions}` : "",
    method.repetitionDuration ? `Duración repeticiones: ${method.repetitionDuration}` : "",
    method.recoveryBetweenRepetitions ? `Recuperación entre repeticiones: ${method.recoveryBetweenRepetitions}` : "",
    method.series ? `Series: ${method.series}` : "",
    method.recoveryBetweenSeries ? `Recuperación entre series: ${method.recoveryBetweenSeries}` : "",
    method.examples[0] ? `Ejemplo: ${method.examples[0]}` : ""
  ].filter(Boolean).join("\n");
}

function createSystemTemplateExercise(
  exerciseId: string,
  block: StrengthSessionBlock,
  prescription: Partial<Pick<PlannedStrengthExerciseDraft, "intensityMethod" | "load" | "observation" | "percent1RM" | "reps" | "rest" | "selectedEquipment" | "sets" | "targetRir" | "targetRpe" | "targetVelocity">> = {}
): SessionTemplateExercise {
  const exercise = getExerciseById(exerciseId);

  return {
    block,
    exerciseId,
    exerciseSearch: exercise?.name ?? "",
    id: `system-template-exercise-${exerciseId}-${block}`,
    intensityMethod: prescription.intensityMethod ?? "rir",
    load: prescription.load ?? "",
    observation: prescription.observation ?? "",
    percent1RM: prescription.percent1RM ?? "",
    reps: prescription.reps ?? "",
    rest: prescription.rest ?? "",
    selectedEquipment: prescription.selectedEquipment ?? "",
    selectedVariantId: "",
    selectedVariantName: "",
    sets: prescription.sets ?? "",
    targetRir: prescription.targetRir ?? "",
    targetRpe: prescription.targetRpe ?? "",
    targetVelocity: prescription.targetVelocity ?? ""
  };
}

const systemSessionTemplates: SessionTemplate[] = [
  {
    category: "Fuerza",
    createdAt: "system",
    description: "Sentadilla, bisagra, unilateral y core para tren inferior.",
    durationApprox: "60-75 min",
    id: "system-strength-lower-body",
    isSystem: true,
    name: "Fuerza tren inferior",
    objective: "Construir fuerza de tren inferior con estructura simple y editable.",
    sessionType: "Fuerza",
    strengthMethod: "rir",
    strengthExercises: [
      createSystemTemplateExercise("squat-vertical-force-strength-5", "main", { reps: "5", rest: "03:00", selectedEquipment: "Barra", sets: "4", targetRir: "2" }),
      createSystemTemplateExercise("hinge-horizontal-force-strength-4", "main", { reps: "6", rest: "02:30", selectedEquipment: "Barra", sets: "3", targetRir: "2" }),
      createSystemTemplateExercise("lunge-unilateral-force-strength-2", "auxiliary", { reps: "8", rest: "02:00", sets: "3", targetRir: "3" }),
      createSystemTemplateExercise("core-trunk-control-anti-flexion-extension-3", "auxiliary", { reps: "30-45 s", rest: "01:00", sets: "3", targetRir: "3" })
    ],
    summary: "Fuerza tren inferior"
  },
  {
    category: "Fuerza",
    createdAt: "system",
    description: "Empuje, tracción, hombro/espalda y core.",
    durationApprox: "55-70 min",
    id: "system-strength-upper-body",
    isSystem: true,
    name: "Fuerza tren superior",
    objective: "Organizar una sesión básica de fuerza de tren superior.",
    sessionType: "Fuerza",
    strengthMethod: "rir",
    strengthExercises: [
      createSystemTemplateExercise("push-upper-body-press-strength-3", "main", { reps: "5", rest: "03:00", selectedEquipment: "Barra", sets: "4", targetRir: "2" }),
      createSystemTemplateExercise("pull-upper-body-pull-hypertrophy-4", "main", { reps: "8", rest: "02:00", selectedEquipment: "Polea", sets: "4", targetRir: "2" }),
      createSystemTemplateExercise("upper-body-accessories-shoulders-4", "auxiliary", { reps: "12", rest: "01:30", selectedEquipment: "Polea", sets: "3", targetRir: "3" }),
      createSystemTemplateExercise("core-trunk-control-anti-rotation-1", "auxiliary", { reps: "10/lado", rest: "01:00", selectedEquipment: "Banda elástica", sets: "3", targetRir: "3" })
    ],
    summary: "Fuerza tren superior"
  },
  {
    category: "Potencia",
    createdAt: "system",
    description: "Aterrizaje, salto reactivo, derivado olímpico y core.",
    durationApprox: "45-60 min",
    id: "system-power-plyometrics",
    isSystem: true,
    name: "Potencia + pliometría",
    objective: "Preparar una sesión sencilla de potencia y reactividad.",
    sessionType: "Fuerza",
    strengthMethod: "rpe",
    strengthExercises: [
      createSystemTemplateExercise("squat-vertical-force-plyometrics-2", "activation", { intensityMethod: "rpe", reps: "3", rest: "01:30", sets: "3", targetRpe: "6" }),
      createSystemTemplateExercise("squat-vertical-force-plyometrics-4", "main", { intensityMethod: "rpe", reps: "6", rest: "02:00", sets: "4", targetRpe: "7" }),
      createSystemTemplateExercise("olympic-derivatives-power-1", "main", { intensityMethod: "rpe", reps: "3", rest: "02:30", selectedEquipment: "Barra", sets: "4", targetRpe: "7" }),
      createSystemTemplateExercise("core-trunk-control-anti-rotation-1", "auxiliary", { intensityMethod: "rpe", reps: "8/lado", rest: "01:00", sets: "3", targetRpe: "6" })
    ],
    summary: "Potencia + pliometría"
  },
  {
    cardioPlanDraft: { notes: "Continuo extensivo editable.", sport: "run", targetDistanceMeters: "", targetDurationMinutes: "45", targetRpeMax: "4", targetRpeMin: "2", targetZone: "" },
    category: "Resistencia",
    createdAt: "system",
    description: "Cardio continuo suave en R1.",
    durationApprox: "40-60 min",
    enduranceMethod: "zones",
    id: "system-endurance-ce-r1",
    isSystem: true,
    name: "Continuo extensivo R1",
    objective: "Planificar una sesión continua extensiva editable.",
    resistanceMethodId: "ce",
    resistanceSport: "running",
    sessionType: "Cardio",
    strengthExercises: [],
    summary: "CE · Continuo extensivo R1",
    targetResistanceZoneId: "R1",
    targetRpe: "3"
  },
  {
    cardioPlanDraft: { notes: "Intervalos medios editables.", sport: "run", targetDistanceMeters: "", targetDurationMinutes: "45", targetRpeMax: "8", targetRpeMin: "6", targetZone: "" },
    category: "Resistencia",
    createdAt: "system",
    description: "Estructura base para intervalos medios.",
    durationApprox: "40-55 min",
    enduranceMethod: "zones",
    id: "system-endurance-iem",
    isSystem: true,
    name: "Intervalos medios",
    objective: "Cargar una base de intervalos medios y ajustar detalles.",
    resistanceMethodId: "iem",
    resistanceSport: "running",
    sessionType: "Cardio",
    strengthExercises: [],
    summary: "IEM · Intervalos medios",
    targetResistanceZoneId: "R3",
    targetRpe: "7"
  },
  {
    cardioPlanDraft: { notes: "Resistencia suave tras fuerza.", sport: "run", targetDistanceMeters: "", targetDurationMinutes: "20", targetRpeMax: "4", targetRpeMin: "2", targetZone: "" },
    category: "Mixto",
    createdAt: "system",
    description: "Fuerza breve y resistencia suave.",
    durationApprox: "55-70 min",
    enduranceMethod: "zones",
    id: "system-mixed-strength-easy-endurance",
    isSystem: true,
    name: "Fuerza + resistencia suave",
    objective: "Combinar fuerza básica con cardio suave editable.",
    resistanceMethodId: "ce",
    resistanceSport: "running",
    sessionType: "Mixta",
    strengthMethod: "rir",
    strengthExercises: [
      createSystemTemplateExercise("squat-vertical-force-strength-2", "main", { reps: "6", rest: "02:00", sets: "3", targetRir: "3" }),
      createSystemTemplateExercise("push-upper-body-press-strength-2", "main", { reps: "8", rest: "01:30", sets: "3", targetRir: "3" }),
      createSystemTemplateExercise("core-trunk-control-anti-rotation-1", "auxiliary", { reps: "10/lado", rest: "01:00", sets: "2", targetRir: "3" })
    ],
    summary: "Fuerza + resistencia suave",
    targetResistanceZoneId: "R1",
    targetRpe: "4"
  },
  {
    category: "Recuperación",
    createdAt: "system",
    description: "Movilidad suave y core de baja carga.",
    durationApprox: "30-45 min",
    id: "system-recovery-mobility-core",
    isSystem: true,
    name: "Movilidad + core",
    objective: "Dar estructura a una sesión suave de movilidad y control.",
    sessionType: "Fuerza",
    strengthMethod: "rpe",
    strengthExercises: [
      createSystemTemplateExercise("mobility-movement-prep-neck-spine-2", "activation", { intensityMethod: "rpe", reps: "6-8", rest: "00:45", sets: "2", targetRpe: "3" }),
      createSystemTemplateExercise("mobility-movement-prep-upper-body-3", "activation", { intensityMethod: "rpe", reps: "8", rest: "00:45", sets: "2", targetRpe: "3" }),
      createSystemTemplateExercise("core-trunk-control-anti-flexion-extension-1", "main", { intensityMethod: "rpe", reps: "8/lado", rest: "01:00", sets: "2", targetRpe: "4" })
    ],
    summary: "Movilidad + core"
  },
  {
    category: "Recuperación",
    createdAt: "system",
    description: "Sesión suave para volver a mover y tolerar carga baja.",
    durationApprox: "35-50 min",
    id: "system-recovery-soft-reconditioning",
    isSystem: true,
    name: "Readaptación suave",
    objective: "Plantilla ligera y editable para retomar movimiento.",
    sessionType: "Fuerza",
    strengthMethod: "rpe",
    strengthExercises: [
      createSystemTemplateExercise("mobility-movement-prep-upper-body-1", "activation", { intensityMethod: "rpe", reps: "5/lado", rest: "00:45", sets: "2", targetRpe: "3" }),
      createSystemTemplateExercise("squat-vertical-force-strength-1", "main", { intensityMethod: "rpe", reps: "8", rest: "01:30", sets: "3", targetRpe: "4" }),
      createSystemTemplateExercise("core-trunk-control-anti-lateral-flexion-1", "auxiliary", { intensityMethod: "rpe", reps: "20 s/lado", rest: "01:00", sets: "2", targetRpe: "4" })
    ],
    summary: "Readaptación suave"
  }
];

const sessionTemplateCategories: Array<"Todas" | SessionTemplateCategory> = ["Todas", "Fuerza", "Potencia", "Resistencia", "Mixto", "Recuperación"];

function getPlanningWeekNumber(currentWeek: string) {
  const match = currentWeek.match(/\d+/);
  return match ? Number(match[0]) : 1;
}

function CoachTrainingPlanner({
  client,
  clients,
  onConsumeTargetTrainingSession,
  onGoClients,
  onUpdateClient,
  sessionTemplates,
  setSessionTemplates,
  targetTrainingSession
}: {
  client?: CoachClient | null;
  clients: CoachClient[];
  onConsumeTargetTrainingSession: () => void;
  onGoClients: () => void;
  onUpdateClient: (updatedClient: CoachClient) => void;
  sessionTemplates: SessionTemplate[];
  setSessionTemplates: React.Dispatch<React.SetStateAction<SessionTemplate[]>>;
  targetTrainingSession: TargetTrainingSession | null;
}) {
  const [activeSessionPanel, setActiveSessionPanel] = useState<CoachSessionPanel>("history");
  const [selectedSessionClientId, setSelectedSessionClientId] = useState(client?.id ?? "");
  const activeSessionClient =
    client ?? clients.find((listedClient) => listedClient.id === selectedSessionClientId) ?? null;
  const activePlanningWeek = activeSessionClient ? getPlanningWeekNumber(activeSessionClient.planning.currentWeek) : 0;
  const [selectedBlockWeek, setSelectedBlockWeek] = useState(activePlanningWeek);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionType, setSessionType] = useState<CoachSessionType>("Fuerza");
  const [sessionStrengthMethod, setSessionStrengthMethod] = useState<StrengthIntensityMethod>("rir");
  const [sessionEnduranceMethod, setSessionEnduranceMethod] = useState<EnduranceIntensityMethod>("zones");
  const [selectedResistanceMethodId, setSelectedResistanceMethodId] = useState("");
  const [selectedResistanceSport, setSelectedResistanceSport] = useState<ResistanceSport>("generic");
  const [targetResistanceZoneId, setTargetResistanceZoneId] = useState<PlannedResistanceZoneId>("");
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
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [sessionWizardStep, setSessionWizardStep] = useState(0);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [localEditSessionId, setLocalEditSessionId] = useState<string | null>(null);
  const [showCardioAdvancedOptions, setShowCardioAdvancedOptions] = useState(false);
  const [strengthExercises, setStrengthExercises] = useState<PlannedStrengthExerciseDraft[]>([]);
  const [openSetMethodExerciseId, setOpenSetMethodExerciseId] = useState("");
  const [collapsedStrengthBlocks, setCollapsedStrengthBlocks] = useState<Record<StrengthSessionBlock, boolean>>({
    activation: false,
    auxiliary: false,
    main: false
  });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<"Todas" | SessionTemplateCategory>("Todas");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const completeResistanceMethods = getCompleteResistanceMethods();
  const selectedResistanceMethod = getResistanceMethodById(selectedResistanceMethodId);
  const resistanceSportProfiles = getSportZoneProfiles();
  const selectedResistanceZoneGuide = getResistanceZoneGuide(selectedResistanceSport, targetResistanceZoneId);
  const recentPerformanceTestReferences = getRecentPerformanceTestReferences(activeSessionClient, sessionType, selectedResistanceSport);
  const pinnedPlanningPrivateNotes = (activeSessionClient?.coachPrivateNotes ?? [])
    .filter((note) => note.pinned && note.text.trim())
    .slice(0, 3);
  const normalizedTemplateSearch = templateSearchTerm.trim().toLowerCase();
  const filterTemplate = (template: SessionTemplate) => {
    const matchesCategory = templateCategoryFilter === "Todas" || template.category === templateCategoryFilter;
    const searchable = [template.name, template.description, template.summary, template.objective, template.category, template.sessionType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesCategory && (!normalizedTemplateSearch || searchable.includes(normalizedTemplateSearch));
  };
  const visibleSystemTemplates = systemSessionTemplates.filter(filterTemplate);
  const visibleCustomTemplates = sessionTemplates.filter(filterTemplate);
  const plannedTonnage = strengthExercises.reduce((total, exercise) => {
    const sets = Number.parseFloat(exercise.sets) || 0;
    const load = Number.parseFloat(exercise.load) || 0;
    const [minimumReps, maximumReps = minimumReps] = exercise.reps
      .split(/[-–]/)
      .map((value) => Number.parseFloat(value.trim()) || 0);
    return {
      maximum: total.maximum + sets * maximumReps * load,
      minimum: total.minimum + sets * minimumReps * load
    };
  }, { maximum: 0, minimum: 0 });
  const plannedTonnageLabel = plannedTonnage.minimum === plannedTonnage.maximum
    ? `${plannedTonnage.minimum.toLocaleString("es-ES")} kg`
    : `${plannedTonnage.minimum.toLocaleString("es-ES")}-${plannedTonnage.maximum.toLocaleString("es-ES")} kg`;
  const plannedSessionsInSelectedWeek =
    activeSessionClient && selectedBlockWeek > 0
      ? (activeSessionClient.sessionRecords ?? []).filter((session) => Number(session.week) === selectedBlockWeek).length
      : 0;
  const calculatedSessionNumber =
    selectedBlockWeek > 0
      ? (selectedBlockWeek === activePlanningWeek ? plannedSessionsInSelectedWeek : 0) + 1
      : null;
  const activePlanningBlocks = activeSessionClient?.planning.blocks ?? [];
  const activePlanningRoadmap = activePlanningBlocks.reduce<Array<EditablePlanningBlock & { startWeek: number; endWeek: number }>>((items, block) => {
    const startWeek = items.length > 0 ? items[items.length - 1].endWeek + 1 : 1;
    return [...items, { ...block, startWeek, endWeek: startWeek + block.durationWeeks - 1 }];
  }, []);
  const selectedSessionPlanningBlock = activePlanningRoadmap.find((block) => selectedBlockWeek >= block.startWeek && selectedBlockWeek <= block.endWeek);
  const currentBlockLabel = selectedSessionPlanningBlock?.name || activeSessionClient?.planning.currentBlock || "Sin asignar";
  const fatigueAlerts = calculateMuscleFatigue(getClientTrainingSessionInputs(activeSessionClient))
    .filter((item) => ["Rojo", "Naranja"].includes(item.status))
    .slice(0, 4);
  const planningLoadData = activeSessionClient ? getClientLoadData(activeSessionClient) : null;
  const planningActionAlerts = [
    ...(planningLoadData && planningLoadData.weeklyLoad >= 2200
      ? [{ label: "sRPE semanal", tone: "high", value: `${Math.round(planningLoadData.weeklyLoad).toLocaleString("es-ES")} UA` }]
      : []),
    ...(planningLoadData && planningLoadData.acwrStatus !== "Controlado"
      ? [{ label: "ACWR", tone: planningLoadData.acwrStatus === "Alto" ? "high" : "moderate", value: planningLoadData.acwr.toFixed(2) }]
      : []),
    ...(planningLoadData && planningLoadData.hooperStatus !== "Controlado"
      ? [{ label: "Wellness", tone: planningLoadData.hooperStatus === "Alto" ? "high" : "moderate", value: `${planningLoadData.hooper}/25` }]
      : []),
    ...(activeSessionClient && activeSessionClient.hooper.sleep > 0 && activeSessionClient.hooper.sleep <= 2
      ? [{ label: "Sueño", tone: "moderate", value: `${activeSessionClient.hooper.sleep}/5` }]
      : []),
    ...(activeSessionClient && activeSessionClient.hooper.fatigue >= 4
      ? [{ label: "Fatiga", tone: "moderate", value: `${activeSessionClient.hooper.fatigue}/5` }]
      : []),
    ...(activeSessionClient?.injuries
      ? [{ label: "Molestias / limitaciones", tone: "moderate", value: "Registradas" }]
      : [])
  ];
  const sessionWizardSteps = [
    { id: 0, label: "Datos básicos" },
    { id: 1, label: "Activación", count: strengthExercises.filter((exercise) => exercise.sessionBlock === "activation").length },
    { id: 2, label: "Bloque principal", count: strengthExercises.filter((exercise) => exercise.sessionBlock === "main").length },
    { id: 3, label: "Bloque complementario", count: strengthExercises.filter((exercise) => exercise.sessionBlock === "complementary").length },
    { id: 4, label: "Revisión" }
  ];
  useEffect(() => {
    setSelectedBlockWeek(activePlanningWeek);
  }, [activePlanningWeek, activeSessionClient?.id]);
  useEffect(() => {
    if (client?.id) setSelectedSessionClientId(client.id);
  }, [client?.id]);
  useEffect(() => {
    if (!activeSessionClient || (!targetTrainingSession && !localEditSessionId)) return;

    const targetSessionId = targetTrainingSession?.sessionId ?? localEditSessionId;
    const existingSessionIndex = targetSessionId
      ? (activeSessionClient.sessionRecords ?? []).findIndex((session) => session.id === targetSessionId)
      : targetTrainingSession?.sessionIndex ?? -1;
    const existingSession = existingSessionIndex >= 0
      ? (activeSessionClient.sessionRecords ?? [])[existingSessionIndex]
      : null;

    if (existingSession) {
      const legacyExercises = (existingSession as ClientSessionRecord & { exercises?: ConnectedSessionExercise[] }).exercises ?? [];
      const sourceExercises = existingSession.plannedExercises?.length ? existingSession.plannedExercises : legacyExercises;
      setEditingSessionId(existingSession.id ?? null);
      setSessionWizardStep(0);
      setSessionDate(existingSession.date ?? "");
      if (["Fuerza", "Cardio", "Mixta"].includes(existingSession.type ?? "")) setSessionType(existingSession.type as CoachSessionType);
      setSessionSummary(existingSession.summary ?? "");
      setSessionTargetRpe(String(existingSession.targetRpe ?? ""));
      setSelectedBlockWeek(Number(existingSession.week) || activePlanningWeek);
      setSessionStrengthMethod(existingSession.strengthMethod ?? "rir");
      setSessionEnduranceMethod(existingSession.enduranceMethod ?? "zones");
      setSelectedResistanceMethodId(existingSession.resistanceMethodId ?? "");
      setSelectedResistanceSport(existingSession.resistanceSport ?? "generic");
      setTargetResistanceZoneId(existingSession.targetResistanceZoneId ?? "");
      setStrengthExercises(sourceExercises.map((exercise, index) => ({
        bandColor: exercise.bandColor ?? "",
        bandResistance: exercise.bandResistance ?? "",
        block: (exercise.block === "activation" || exercise.block === "main" || exercise.block === "auxiliary") ? exercise.block : "main",
        exerciseId: exercise.exerciseId ?? "",
        exerciseSearch: exercise.exerciseName ?? "",
        id: exercise.id ?? `exercise-${Date.now()}-${index}`,
        intensityMethod: exercise.intensityMethod ?? "",
        load: String(exercise.plannedLoad ?? ""),
        observation: exercise.observation ?? "",
        percent1RM: String(exercise.percent1RM ?? ""),
        prescriptionBlockId: exercise.prescriptionBlockId ?? undefined,
        prescriptionRole: exercise.prescriptionRole ?? undefined,
        prescriptionSource: exercise.prescriptionSource ?? "legacy",
        prescriptionMode: (
          (exercise.setMethod && exercise.setMethod !== "straight") ||
          exercise.tempo ||
          (exercise.intensityMethod && exercise.intensityMethod !== "rir" && exercise.intensityMethod !== "rpe") ||
          exercise.videoUrl ||
          exercise.videoNote ||
          exercise.selectedEquipment ||
          exercise.selectedVariantId
        ) ? "custom" : "standard",
        plannedSetReps: exercise.plannedSetReps?.map(String),
        setMethod: exercise.setMethod ?? undefined,
        clusterConfig: exercise.clusterConfig ?? undefined,
        tempo: exercise.tempo ?? undefined,
        reps: String(exercise.plannedReps ?? ""),
        rest: String(exercise.plannedRest ?? ""),
        selectedEquipment: exercise.selectedEquipment ?? "",
        selectedVariantId: exercise.selectedVariantId ?? "",
        selectedVariantName: exercise.selectedVariantName ?? "",
        sessionBlock: exercise.sessionBlock ?? undefined,
        sets: String(exercise.plannedSets ?? ""),
        targetRir: String(exercise.plannedRir ?? exercise.targetRir ?? ""),
        targetRpe: String(exercise.plannedRpe ?? ""),
        targetVelocity: String(exercise.targetVelocity ?? ""),
        videoNote: exercise.videoNote ?? "",
        videoUrl: exercise.videoUrl ?? ""
      })));
      setCardioPlanDraft({
        notes: existingSession.cardioPlan?.notes ?? "",
        sport: existingSession.cardioPlan?.sport ?? "run",
        targetDistanceMeters: String(existingSession.cardioPlan?.targetDistanceMeters ?? ""),
        targetDurationMinutes: String(existingSession.cardioPlan?.targetDurationMinutes ?? ""),
        targetRpeMax: String(existingSession.cardioPlan?.targetRpeMax ?? ""),
        targetRpeMin: String(existingSession.cardioPlan?.targetRpeMin ?? ""),
        targetZone: existingSession.cardioPlan?.targetZone ?? ""
      });
      setActiveSessionPanel("planner");
      setShowPlannerModal(true);
      if (targetTrainingSession) onConsumeTargetTrainingSession();
      setLocalEditSessionId(null);
      return;
    }

    if (targetTrainingSession?.draftSessionType || targetTrainingSession?.draftSessionSummary) {
      if (targetTrainingSession.clientId && targetTrainingSession.clientId !== activeSessionClient.id) return;

      if (targetTrainingSession.sessionDate) setSessionDate(targetTrainingSession.sessionDate);
      if (["Fuerza", "Cardio", "Mixta"].includes(targetTrainingSession.draftSessionType ?? "")) {
        setSessionType(targetTrainingSession.draftSessionType as CoachSessionType);
      }
      if (targetTrainingSession.draftSessionSummary) setSessionSummary(targetTrainingSession.draftSessionSummary);
      setEditingSessionId(null);
      setSessionWizardStep(0);
      setActiveSessionPanel("planner");
      setShowPlannerModal(true);
      onConsumeTargetTrainingSession();
      return;
    }

    if (targetTrainingSession?.clientId === activeSessionClient.id) {
      setActiveSessionPanel("history");
    }
  }, [activePlanningWeek, activeSessionClient, localEditSessionId, onConsumeTargetTrainingSession, targetTrainingSession]);

  if (!activeSessionClient) {
    return (
      <div className="mt-5 xl:mt-6">
        <section className="rounded-md border border-line bg-white p-6 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase text-ink/45">Sesiones</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Selecciona un deportista</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-ink/60">
            Elige un deportista para revisar sus sesiones anteriores o planificar una nueva sesión.
          </p>
          {clients.length > 0 ? (
            <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-[1fr_auto]">
              <select
                className="h-11 rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                onChange={(event) => setSelectedSessionClientId(event.target.value)}
                value={selectedSessionClientId}
              >
                <option value="">Selecciona deportista</option>
                {clients.map((listedClient) => (
                  <option key={listedClient.id} value={listedClient.id}>{listedClient.name}</option>
                ))}
              </select>
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onGoClients} type="button">
                Ir a Gestión
              </button>
            </div>
          ) : (
            <button className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onGoClients} type="button">
              Ir a Gestión
            </button>
          )}
        </section>
      </div>
    );
  }

  const activeSessionAccessInfo = getClientAccessInfo(activeSessionClient);

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
  const addStrengthExercise = (sessionBlock: SessionExerciseBlock) => {
    const block: StrengthSessionBlock = sessionBlock === "complementary" ? "auxiliary" : sessionBlock;
    setStrengthExercises((current) => [
      ...current,
      {
        bandColor: "",
        bandResistance: "",
        block,
        exerciseId: "",
        exerciseSearch: "",
        id: `exercise-${Date.now()}-${current.length}`,
        intensityMethod: "rir",
        load: "",
        observation: "",
        percent1RM: "",
        prescriptionMode: "standard",
        reps: "",
        rest: "",
        sessionBlock,
        setMethod: "straight",
        plannedSetReps: [],
        clusterConfig: { intraClusterRestSeconds: "", repsPerMiniSet: [] },
        tempo: undefined,
        sets: "",
        targetRir: "",
        targetRpe: "",
        targetVelocity: "",
        videoNote: "",
        videoUrl: ""
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
  const updateStrengthPrescription = (exerciseId: string, updates: Partial<PlannedStrengthExerciseDraft>) => {
    setStrengthExercises((current) => current.map((exercise) => exercise.id === exerciseId ? {
      ...exercise,
      ...updates,
      prescriptionSource: exercise.prescriptionSource === "default" ? "custom" : exercise.prescriptionSource ?? "legacy"
    } : exercise));
  };
  const changeStrengthSetMethod = (exerciseId: string, setMethod: SetMethod) => {
    const exercise = strengthExercises.find((candidate) => candidate.id === exerciseId);
    if (!exercise || (exercise.setMethod ?? "straight") === setMethod) return;
    updateStrengthPrescription(exerciseId, {
      clusterConfig: exercise.clusterConfig ?? { intraClusterRestSeconds: "", repsPerMiniSet: [] },
      plannedSetReps: exercise.plannedSetReps ?? [],
      prescriptionMode: "custom",
      setMethod
    });
  };
  const updatePlannedSetSequence = (exerciseId: string, index: number, value: string) => {
    const exercise = strengthExercises.find((candidate) => candidate.id === exerciseId);
    const sequence = [...(exercise?.plannedSetReps ?? [])];
    sequence[index] = value;
    updateStrengthPrescription(exerciseId, { plannedSetReps: sequence });
  };
  const applyStrengthExerciseRole = (exerciseId: string, role: PlanningPrescriptionRole | "") => {
    updateStrengthExercise(exerciseId, {
      prescriptionRole: role || undefined,
      prescriptionSource: strengthExercises.find((exercise) => exercise.id === exerciseId)?.prescriptionSource ?? "legacy"
    });
  };
  const restoreStrengthExerciseDefault = (exerciseId: string) => {
    const exercise = strengthExercises.find((candidate) => candidate.id === exerciseId);
    if (!exercise?.prescriptionRole) return;
    const defaults = getBlockPrescriptionDefault(selectedSessionPlanningBlock, exercise.prescriptionRole);
    updateStrengthExercise(exerciseId, {
      intensityMethod: defaults.effortScale === "rpe" ? "rpe" : "rir",
      prescriptionBlockId: selectedSessionPlanningBlock?.id,
      prescriptionMode: "standard",
      prescriptionSource: "default",
      reps: getPrescriptionRange(defaults.repsMin, defaults.repsMax),
      rest: getPrescriptionRange(defaults.restMinSeconds, defaults.restMaxSeconds),
      sets: defaults.sets,
      tempo: undefined,
      targetRir: defaults.effortScale === "rpe" ? "" : getPrescriptionRange(defaults.rirMin, defaults.rirMax),
      targetRpe: defaults.effortScale === "rpe" ? getPrescriptionRange(defaults.rpeMin ?? "", defaults.rpeMax ?? "") : ""
    });
  };
  const moveStrengthExercise = (exerciseId: string, direction: -1 | 1) => {
    setStrengthExercises((current) => {
      const sourceIndex = current.findIndex((exercise) => exercise.id === exerciseId);
      if (sourceIndex < 0) return current;
      const source = current[sourceIndex];
      const sameBlockIndexes = current
        .map((exercise, index) => ({ exercise, index }))
        .filter(({ exercise }) => exercise.sessionBlock === source.sessionBlock)
        .map(({ index }) => index);
      const position = sameBlockIndexes.indexOf(sourceIndex);
      const targetIndex = sameBlockIndexes[position + direction];
      if (targetIndex === undefined) return current;
      const next = [...current];
      [next[sourceIndex], next[targetIndex]] = [next[targetIndex], next[sourceIndex]];
      return next;
    });
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
  const applyResistanceMethodTemplate = () => {
    if (!selectedResistanceMethod) return;
    const methodNotes = buildResistanceMethodTemplateNotes(selectedResistanceMethod, selectedResistanceSport, targetResistanceZoneId);

    setCardioPlanDraft((current) => ({
      ...current,
      notes: current.notes.trim() ? current.notes : methodNotes
    }));
    if (!sessionSummary.trim()) {
      setSessionSummary(getResistanceMethodLabel(selectedResistanceMethod));
    }
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
  const updateSessionTechniqueReview = (
    sessionIndex: number,
    exerciseIndex: number,
    review: TechniqueReview
  ) => {
    onUpdateClient({
      ...activeSessionClient,
      sessionRecords: (activeSessionClient.sessionRecords ?? []).map((session, index) => {
        if (index !== sessionIndex) return session;
        return {
          ...session,
          performedExercises: (session.performedExercises ?? []).map((exercise, performedIndex) =>
            performedIndex === exerciseIndex
              ? {
                  ...exercise,
                  techniqueReview: review
                }
              : exercise
          )
        };
      })
    });
  };
  const plannedTemplateExercises = strengthExercises.map((exercise) => ({
    bandColor: exercise.bandColor || undefined,
    bandResistance: exercise.bandResistance || undefined,
    block: exercise.block,
    exerciseId: exercise.exerciseId,
    exerciseSearch: exercise.exerciseSearch,
    id: exercise.id,
    intensityMethod: exercise.intensityMethod,
    load: exercise.load,
    observation: exercise.observation,
    percent1RM: exercise.percent1RM,
    prescriptionBlockId: exercise.prescriptionBlockId,
    prescriptionRole: exercise.prescriptionRole,
    prescriptionSource: exercise.prescriptionSource,
    sessionBlock: exercise.sessionBlock,
    plannedSetReps: exercise.plannedSetReps,
    setMethod: exercise.setMethod,
    clusterConfig: exercise.clusterConfig,
    tempo: exercise.tempo,
    reps: exercise.reps,
    rest: exercise.rest,
    selectedEquipment: exercise.selectedEquipment || undefined,
    selectedVariantId: exercise.selectedVariantId || undefined,
    selectedVariantName: exercise.selectedVariantName || undefined,
    sets: exercise.sets,
    targetRir: exercise.targetRir,
    targetRpe: exercise.targetRpe,
    targetVelocity: exercise.targetVelocity || undefined,
    videoNote: exercise.videoNote || undefined,
    videoUrl: exercise.videoUrl || undefined
  }));
  const sendSessionToAthlete = () => {
    if (!sessionDate) {
      setSessionSendMessage("Selecciona una fecha antes de enviar la sesión.");
      return;
    }

    if (strengthExercises.some((exercise) => exercise.tempo && !isCompleteExerciseTempo(exercise.tempo))) {
      setSessionSendMessage("Completa las cuatro fases del tempo o quítalo antes de guardar.");
      return;
    }

    const existingRecord = editingSessionId
      ? (activeSessionClient.sessionRecords ?? []).find((session) => session.id === editingSessionId)
      : undefined;
    const sessionNumber = Number(existingRecord?.sessionNumber) || calculatedSessionNumber || 1;
    const duplicateSession = (activeSessionClient.sessionRecords ?? []).some((session) =>
      session.id !== editingSessionId &&
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
      bandColor: exercise.bandColor || undefined,
      bandResistance: exercise.bandResistance || undefined,
      exerciseId: exercise.exerciseId || null,
      exerciseName: getExerciseById(exercise.exerciseId)?.name ?? (exercise.exerciseSearch.trim() || "Ejercicio sin especificar"),
      id: exercise.id,
      intensityMethod: exercise.intensityMethod || undefined,
      observation: exercise.observation,
      percent1RM: exercise.percent1RM,
      prescriptionBlockId: exercise.prescriptionBlockId,
      prescriptionRole: exercise.prescriptionRole,
      prescriptionSource: exercise.prescriptionSource ?? "legacy",
      sessionBlock: exercise.sessionBlock,
      plannedSetReps: exercise.plannedSetReps?.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0),
      setMethod: exercise.setMethod,
      clusterConfig: exercise.clusterConfig ? {
        intraClusterRestSeconds: Number(exercise.clusterConfig.intraClusterRestSeconds) || undefined,
        repsPerMiniSet: (exercise.clusterConfig.repsPerMiniSet ?? []).map(Number).filter((value) => Number.isFinite(value) && value > 0)
      } : undefined,
      tempo: normalizeExerciseTempo(exercise.tempo),
      plannedLoad: exercise.load,
      plannedReps: exercise.reps,
      plannedRest: exercise.rest,
      plannedRir: exercise.targetRir,
      plannedRpe: exercise.targetRpe,
      plannedSets: exercise.sets,
      targetVelocity: exercise.targetVelocity,
      videoNote: exercise.videoNote || undefined,
      videoUrl: exercise.videoUrl || undefined,
      selectedEquipment: exercise.selectedEquipment || undefined,
      selectedVariantId: exercise.selectedVariantId || undefined,
      selectedVariantName: exercise.selectedVariantName || undefined,
      section: exercise.block
    }));
    const cardioPlan = buildCardioPlanFromDraft(cardioPlanDraft);
    const plannedRecord: ClientSessionRecord = {
      ...existingRecord,
      block: currentBlockLabel || "Sin asignar",
      cardioPlan,
      completed: existingRecord?.completed ?? false,
      date: sessionDate,
      enduranceMethod: sessionEnduranceMethod,
      id: existingRecord?.id ?? `session-${Date.now()}`,
      performedExercises: existingRecord?.performedExercises ?? [],
      plannedExercises,
      resistanceMethodId: sessionType === "Cardio" ? selectedResistanceMethodId || undefined : undefined,
      resistanceSport: sessionType === "Cardio" ? selectedResistanceSport : undefined,
      sessionNumber: existingRecord?.sessionNumber ?? sessionNumber,
      status: existingRecord?.status ?? "Planificada",
      strengthMethod: sessionStrengthMethod,
      summary: sessionSummary.trim() || "Sesión planificada",
      targetResistanceZoneId: sessionType === "Cardio" ? targetResistanceZoneId || undefined : undefined,
      targetRpe: sessionTargetRpe,
      type: sessionType,
      week: selectedBlockWeek,
      weekLabel: `Semana ${selectedBlockWeek}`
    };

    const nextSessionRecords = editingSessionId
      ? (activeSessionClient.sessionRecords ?? []).map((session) => session.id === editingSessionId ? plannedRecord : session)
      : [plannedRecord, ...(activeSessionClient.sessionRecords ?? [])];
    onUpdateClient({
      ...activeSessionClient,
      sessionRecords: nextSessionRecords
    });
    setSessionSendMessage(editingSessionId ? "Sesión actualizada." : "Sesión enviada al deportista.");
    setShowPlannerModal(false);
    setActiveSessionPanel("history");
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
        cardioPlanDraft: sessionType !== "Fuerza" ? cardioPlanDraft : undefined,
        category: sessionType === "Cardio" ? "Resistencia" : sessionType === "Mixta" ? "Mixto" : "Fuerza",
        createdAt: new Date().toISOString(),
        description: templateDescription.trim(),
        durationApprox: cardioPlanDraft.targetDurationMinutes ? `${cardioPlanDraft.targetDurationMinutes} min` : undefined,
        enduranceMethod: sessionEnduranceMethod,
        id: `template-${Date.now()}`,
        name: templateName.trim(),
        objective: sessionSummary.trim(),
        resistanceMethodId: selectedResistanceMethodId || undefined,
        resistanceSport: sessionType !== "Fuerza" ? selectedResistanceSport : undefined,
        sessionType,
        strengthMethod: sessionStrengthMethod,
        strengthExercises: plannedTemplateExercises,
        summary: sessionSummary.trim(),
        targetResistanceZoneId: sessionType !== "Fuerza" ? targetResistanceZoneId || undefined : undefined,
        targetRpe: sessionTargetRpe,
      },
      ...currentTemplates
    ]);
    resetTemplateForm();
  };
  const loadSessionTemplate = (template: SessionTemplate) => {
    const hasCardioContent = Boolean(
      selectedResistanceMethodId ||
      targetResistanceZoneId ||
      sessionTargetRpe ||
      Object.values(cardioPlanDraft).some((value) => String(value).trim())
    );
    const hasCurrentContent =
      strengthExercises.length > 0 ||
      hasCardioContent ||
      Boolean(sessionSummary.trim() && sessionSummary !== plannedSession.title);

    if (hasCurrentContent && !window.confirm("Esto reemplazará el contenido actual de la sesión. ¿Quieres continuar?")) return;

    setSessionType(template.sessionType);
    setSessionStrengthMethod(template.strengthMethod ?? "rir");
    setSessionEnduranceMethod(template.enduranceMethod ?? "zones");
    setSessionSummary(template.summary);
    setSelectedResistanceMethodId(template.resistanceMethodId ?? "");
    setSelectedResistanceSport(template.resistanceSport ?? "generic");
    setTargetResistanceZoneId(template.targetResistanceZoneId ?? "");
    setSessionTargetRpe(template.targetRpe ?? "");
    setCardioPlanDraft(template.cardioPlanDraft ?? {
      notes: "",
      sport: "run",
      targetDistanceMeters: "",
      targetDurationMinutes: "",
      targetRpeMax: "",
      targetRpeMin: "",
      targetZone: ""
    });
    setStrengthExercises(
      template.strengthExercises.map((exercise, index) => ({
        ...exercise,
        id: `exercise-${Date.now()}-${index}`,
        intensityMethod: exercise.intensityMethod ?? "",
        bandColor: exercise.bandColor ?? "",
        bandResistance: exercise.bandResistance ?? "",
        percent1RM: exercise.percent1RM ?? "",
        selectedEquipment: exercise.selectedEquipment ?? "",
        selectedVariantId: exercise.selectedVariantId ?? "",
        selectedVariantName: exercise.selectedVariantName ?? "",
        targetRir: exercise.targetRir ?? "",
        targetRpe: exercise.targetRpe ?? "",
        targetVelocity: exercise.targetVelocity ?? "",
        videoNote: exercise.videoNote ?? "",
        videoUrl: exercise.videoUrl ?? ""
      }))
    );
    setShowTemplateLibrary(false);
    setSessionSendMessage("Plantilla cargada. Revisa y ajusta antes de enviar.");
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
  const isElasticBandEquipment = (value?: string | null) =>
    Boolean(
      value &&
        ["banda", "band", "elastic", "goma", "miniband", "superband"].some((keyword) =>
          value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(keyword)
        )
    );
  const getBandSummary = (exercise: PlannedStrengthExerciseDraft | ConnectedSessionExercise | ReviewSessionExercise) =>
    [exercise.bandColor, exercise.bandResistance].filter(Boolean).join(" · ");
  const getExerciseSummaryLine = (exercise: PlannedStrengthExerciseDraft) => {
    const name = getExerciseById(exercise.exerciseId)?.name ?? (exercise.exerciseSearch.trim() || "Ejercicio sin especificar");
    const method = exercise.setMethod ?? "straight";
    const sequence = (exercise.plannedSetReps ?? []).filter((value) => value.trim());
    const clusterReps = (exercise.clusterConfig?.repsPerMiniSet ?? []).map(String).filter((value) => value.trim());
    const volume = method === "cluster" && clusterReps.length > 0
      ? `${exercise.sets || "—"} × (${clusterReps.join("+")})`
      : (method === "ascending" || method === "descending") && sequence.length > 0
        ? `${exercise.sets || sequence.length} series · ${sequence.join("→")} reps`
        : [exercise.sets, exercise.reps].filter(Boolean).length === 2
          ? `${exercise.sets}×${exercise.reps}`
          : [exercise.sets ? `${exercise.sets} series` : "", exercise.reps ? `${exercise.reps} reps` : ""].filter(Boolean).join(" · ");
    const intensity = getExerciseIntensitySummary(exercise);
    const rest = exercise.rest ? `${exercise.rest} s entre series` : "";
    const intraClusterRest = method === "cluster" && exercise.clusterConfig?.intraClusterRestSeconds
      ? `${exercise.clusterConfig.intraClusterRestSeconds} s intra`
      : "";
    const tempo = formatExerciseTempo(exercise.tempo);
    const prescription = [volume, intensity, intraClusterRest, rest, tempo ? `Tempo ${tempo}` : ""].filter(Boolean).join(" · ");
    const bandSummary = getBandSummary(exercise);
    const variantLine = [
      exercise.selectedVariantName ? `Variante: ${exercise.selectedVariantName}` : "",
      bandSummary ? `Banda elástica: ${bandSummary}` : ""
    ].filter(Boolean).join(" · ");

    return {
      main: [name, prescription].filter(Boolean).join(" · "),
      variant: variantLine
    };
  };
  const renderStrengthBlock = (sessionBlock: SessionExerciseBlock | "unclassified", title: string, description?: string) => {
    const blockExercises = strengthExercises.filter((exercise) =>
      sessionBlock === "unclassified" ? !exercise.sessionBlock : exercise.sessionBlock === sessionBlock
    );
    const legacyBlock: StrengthSessionBlock = sessionBlock === "complementary" ? "auxiliary" : sessionBlock === "unclassified" ? "main" : sessionBlock;
    const isCollapsed = collapsedStrengthBlocks[legacyBlock];
    const blockLabel = title.toUpperCase();
    const exerciseCountLabel = `${blockExercises.length} ${blockExercises.length === 1 ? "ejercicio" : "ejercicios"}`;

    return (
      <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <button
          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-semibold uppercase tracking-wide text-ink transition hover:text-moss"
          onClick={() => setCollapsedStrengthBlocks((current) => ({ ...current, [legacyBlock]: !current[legacyBlock] }))}
          type="button"
        >
          <span className="text-lg leading-none">{isCollapsed ? "›" : "⌄"}</span>
          <span>{blockLabel} · {exerciseCountLabel}</span>
        </button>
        {!isCollapsed ? (
        <>
        {description ? <p className="mt-2 text-sm text-ink/55">{description}</p> : null}
        <div className="mt-3 flex justify-end">
          {sessionBlock !== "unclassified" ? (
          <button
            className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => addStrengthExercise(sessionBlock)}
            type="button"
          >
            <Plus size={16} />
            Añadir ejercicio
          </button>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3">
          {blockExercises.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-white px-4 py-5 text-sm font-medium text-ink/45">
              Sin ejercicios añadidos.
            </div>
          ) : blockExercises.map((exercise) => {
            const sessionSection = sessionBlock === "activation" ? "activation" : sessionBlock === "main" ? "main" : "accessory";
            const exerciseSuggestions = searchExercises(exercise.exerciseSearch, { section: sessionSection });
            const selectedLibraryExercise = getExerciseById(exercise.exerciseId);
            const effectiveIntensityMethod = exercise.intensityMethod || "rir";
            const equipmentOptions = selectedLibraryExercise?.equipment ?? [];
            const selectedVariant =
              selectedLibraryExercise?.variants?.find((variant) => variant.id === exercise.selectedVariantId) ?? null;

            return (
            <article className="rounded-md border border-line bg-white p-3" key={exercise.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink/65">Ejercicio {blockExercises.findIndex((item) => item.id === exercise.id) + 1}</p>
                  <p className="mt-1 text-xs font-semibold text-ink/45">{exercise.prescriptionSource === "default" ? "Default del mesociclo" : exercise.prescriptionSource === "custom" ? "Personalizado" : "Personalizado / Legacy"}</p>
                </div>
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
              <div className="mb-3 flex flex-wrap items-end gap-2 rounded-md border border-line bg-panel/30 p-2">
                <label className="min-w-40 flex-1 text-xs font-semibold text-ink/55">
                  Bloque de sesión
                  <select
                    className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm font-semibold text-ink"
                    onChange={(event) => updateStrengthExercise(exercise.id, {
                      block: event.target.value === "complementary" ? "auxiliary" : event.target.value as StrengthSessionBlock,
                      sessionBlock: event.target.value as SessionExerciseBlock
                    })}
                    value={exercise.sessionBlock ?? ""}
                  >
                    <option disabled value="">Sin clasificar</option>
                    <option value="activation">Activación</option>
                    <option value="main">Bloque principal</option>
                    <option value="complementary">Complementario</option>
                  </select>
                </label>
                <label className="min-w-44 flex-1 text-xs font-semibold text-ink/55">
                  Rol del ejercicio
                  <select className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm font-semibold text-ink" onChange={(event) => applyStrengthExerciseRole(exercise.id, event.target.value as PlanningPrescriptionRole | "")} value={exercise.prescriptionRole ?? ""}>
                    <option value="">Sin rol / Legacy</option>
                    {planningPrescriptionRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                  </select>
                </label>
                {exercise.prescriptionSource === "custom" && exercise.prescriptionRole ? <button className="rounded-md border border-moss/25 bg-mint px-3 py-2 text-xs font-semibold text-moss" onClick={() => restoreStrengthExerciseDefault(exercise.id)} type="button">Restaurar default</button> : null}
                <div className="flex gap-1" aria-label="Orden del ejercicio">
                  <button aria-label="Subir ejercicio" className="grid size-9 place-items-center rounded-md border border-line bg-white text-sm font-bold text-ink/60" onClick={() => moveStrengthExercise(exercise.id, -1)} type="button">↑</button>
                  <button aria-label="Bajar ejercicio" className="grid size-9 place-items-center rounded-md border border-line bg-white text-sm font-bold text-ink/60" onClick={() => moveStrengthExercise(exercise.id, 1)} type="button">↓</button>
                </div>
              </div>
              <div className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
                <div className="space-y-1 text-xs font-semibold text-ink/55">
                  Ejercicio
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                    onChange={(event) =>
                      updateStrengthExercise(exercise.id, {
                        bandColor: "",
                        bandResistance: "",
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
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-ink/45">Prescripción</span>
                {(["standard", "custom"] as const).map((mode) => (
                  <button
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${(exercise.prescriptionMode ?? "standard") === mode ? "border-ink bg-ink text-white" : "border-line bg-panel/35 text-ink/60"}`}
                    key={mode}
                    onClick={() => updateStrengthExercise(exercise.id, { prescriptionMode: mode })}
                    type="button"
                  >
                    {mode === "standard" ? "Estándar" : "Personalizado"}
                  </button>
                ))}
              </div>
              {exercise.prescriptionMode === "custom" ? <>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Enlace vídeo técnico
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-medium text-ink outline-none focus:border-moss"
                    onChange={(event) => updateStrengthExercise(exercise.id, { videoUrl: event.target.value })}
                    placeholder="https://..."
                    type="url"
                    value={exercise.videoUrl ?? ""}
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-ink/55">
                  Clave técnica para el deportista
                  <input
                    className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-medium text-ink outline-none focus:border-moss"
                    onChange={(event) => updateStrengthExercise(exercise.id, { videoNote: event.target.value })}
                    placeholder="Mantén columna neutra y controla la fase excéntrica."
                    type="text"
                    value={exercise.videoNote ?? ""}
                  />
                </label>
                <p className="text-xs font-medium text-ink/45 md:col-span-2">
                  Los vídeos se guardan como enlaces. La app no sube archivos ni analiza automáticamente el movimiento.
                </p>
              </div>
              {selectedLibraryExercise && (equipmentOptions.length > 0 || selectedLibraryExercise.variants?.length) ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {equipmentOptions.length > 0 ? (
                    <label className="space-y-1 text-xs font-semibold text-ink/55">
                      Material
                      <select
                        className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                        onChange={(event) =>
                          updateStrengthExercise(exercise.id, {
                            bandColor: isElasticBandEquipment(event.target.value) ? exercise.bandColor ?? "" : "",
                            bandResistance: isElasticBandEquipment(event.target.value) ? exercise.bandResistance ?? "" : "",
                            selectedEquipment: event.target.value
                          })
                        }
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
                  {isElasticBandEquipment(exercise.selectedEquipment) ? (
                    <div className="grid gap-3 rounded-md border border-line bg-panel/35 p-3 md:col-span-2 md:grid-cols-2">
                      <label className="space-y-1 text-xs font-semibold text-ink/55">
                        Color de la banda
                        <select
                          className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                          onChange={(event) => updateStrengthExercise(exercise.id, { bandColor: event.target.value })}
                          value={exercise.bandColor ?? ""}
                        >
                          <option value="">Sin especificar</option>
                          {bandColorOptions.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-xs font-semibold text-ink/55">
                        Resistencia de la banda
                        <input
                          className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                          onChange={(event) => updateStrengthExercise(exercise.id, { bandResistance: event.target.value })}
                          placeholder="Ligera, media, fuerte, 15-25 kg..."
                          type="text"
                          value={exercise.bandResistance ?? ""}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              ) : null}
              </> : null}
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
                    {strengthIntensityMethodOptions.filter((option) => exercise.prescriptionMode === "custom" || option.value === "rir" || option.value === "rpe").map((option) => (
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
                    onChange={(event) => updateStrengthPrescription(exercise.id, { sets: event.target.value })}
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
                    onChange={(event) => updateStrengthPrescription(exercise.id, { reps: event.target.value })}
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
                    onChange={(event) => updateStrengthPrescription(exercise.id, { rest: event.target.value })}
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
                      onChange={(event) => updateStrengthPrescription(exercise.id, { targetRpe: event.target.value })}
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
                      onChange={(event) => updateStrengthPrescription(exercise.id, { percent1RM: event.target.value })}
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
                        onChange={(event) => updateStrengthPrescription(exercise.id, { targetVelocity: event.target.value })}
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
                      onChange={(event) => updateStrengthPrescription(exercise.id, { targetRir: event.target.value })}
                      onKeyDown={(event) => moveExerciseFieldFocus(event, exercise.id, "intensity")}
                      placeholder="RIR"
                      type="text"
                      value={exercise.targetRir}
                    />
                  </label>
                )}
              </div>
              {exercise.prescriptionMode === "custom" ? <><div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <button
                  className="rounded-md border border-line bg-panel/35 px-3 py-2 text-xs font-semibold text-ink/65"
                  onClick={() => setOpenSetMethodExerciseId((current) => current === exercise.id ? "" : exercise.id)}
                  type="button"
                >
                  Método · {getSetMethodLabel(exercise.setMethod)}{formatExerciseTempo(exercise.tempo) ? ` · Tempo ${formatExerciseTempo(exercise.tempo)}` : ""}
                </button>
                {exercise.reps ? (
                  <details className="group min-w-0 flex-1">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-steel">{exercise.reps} reps · Ver perfil</summary>
                    <div className="mt-2"><RepetitionSpectrum reps={exercise.reps} /></div>
                  </details>
                ) : null}
              </div>
              {openSetMethodExerciseId === exercise.id ? (
                <div className="mt-3 rounded-md border border-line bg-panel/25 p-3">
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {setMethodOptions.map((option) => (
                      <button
                        className={`rounded-md border p-3 text-left transition ${(exercise.setMethod ?? "straight") === option.id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}
                        key={option.id}
                        onClick={() => changeStrengthSetMethod(exercise.id, option.id)}
                        type="button"
                      >
                        <span className="block text-xs font-semibold uppercase">{option.label}</span>
                        <span className="mt-2 block font-mono text-base tracking-wider">{option.visual}</span>
                        <span className={`mt-1 block text-xs ${(exercise.setMethod ?? "straight") === option.id ? "text-white/65" : "text-ink/50"}`}>{option.description}</span>
                      </button>
                    ))}
                  </div>
                  {(exercise.setMethod === "ascending" || exercise.setMethod === "descending") ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-ink/55">Repeticiones por serie</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from({ length: Math.max(1, Number.parseInt(exercise.sets, 10) || exercise.plannedSetReps?.length || 4) }, (_, index) => (
                          <label className="w-20 text-[10px] font-semibold text-ink/45" key={index}>Serie {index + 1}<input className="mt-1 h-9 w-full rounded-md border border-line bg-white px-2 text-sm font-semibold text-ink" inputMode="numeric" onChange={(event) => updatePlannedSetSequence(exercise.id, index, event.target.value)} value={exercise.plannedSetReps?.[index] ?? ""} /></label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {exercise.setMethod === "cluster" ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-ink/55">Estructura cluster<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink" onChange={(event) => updateStrengthPrescription(exercise.id, { clusterConfig: { ...exercise.clusterConfig, repsPerMiniSet: event.target.value.split("+").map((value) => value.trim()).filter(Boolean) } })} placeholder="2+2+2" value={(exercise.clusterConfig?.repsPerMiniSet ?? []).join("+")} /></label>
                      <label className="text-xs font-semibold text-ink/55">Pausa intra-cluster<input className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink" inputMode="numeric" onChange={(event) => updateStrengthPrescription(exercise.id, { clusterConfig: { ...exercise.clusterConfig, intraClusterRestSeconds: event.target.value } })} placeholder="20 s" value={exercise.clusterConfig?.intraClusterRestSeconds ?? ""} /></label>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <details className="mt-3 border-t border-line pt-3">
                <summary className="cursor-pointer list-none text-xs font-semibold text-ink/60">
                  Más opciones{exercise.tempo ? ` · Tempo ${formatExerciseTempo(exercise.tempo) || "incompleto"}` : ""}
                </summary>
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-ink">Tempo</p>
                      <p className="text-[11px] text-ink/45">{exercise.tempo ? formatExerciseTempo(exercise.tempo) || "Configuración incompleta" : "Sin especificar"}</p>
                    </div>
                    {!exercise.tempo ? (
                      <button
                        className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/60"
                        onClick={() => updateStrengthPrescription(exercise.id, { prescriptionMode: "custom", tempo: { concentric: "", eccentric: "", postConcentricPause: "", postEccentricPause: "" } })}
                        type="button"
                      >
                        Configurar
                      </button>
                    ) : null}
                  </div>
                  {exercise.tempo ? (
                    <ExerciseTempoEditor
                      onChange={(tempo) => updateStrengthPrescription(exercise.id, { prescriptionMode: "custom", tempo })}
                      onRemove={() => updateStrengthPrescription(exercise.id, { prescriptionMode: "custom", tempo: undefined })}
                      tempo={exercise.tempo}
                    />
                  ) : null}
                </div>
              </details></> : null}
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
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-line border-l-clay border-l-4 bg-white p-4 shadow-soft">
          <p className="text-sm font-semibold text-ink">Lesiones / limitaciones</p>
          <p className="mt-2 text-sm text-ink/65">{activeSessionClient.injuries || "Sin lesiones registradas."}</p>
        </div>
        <div className="rounded-md border border-line border-l-coral border-l-4 bg-white p-4 shadow-soft">
          <p className="text-sm font-semibold text-ink">Fatiga muscular a vigilar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {fatigueAlerts.length > 0 ? fatigueAlerts.map((item) => (
              <span className="rounded-md border border-line bg-panel/70 px-2 py-1 text-xs font-semibold text-coral" key={item.muscle}>
                {item.muscle} {item.fatigueScore}%
              </span>
            )) : (
              <span className="text-sm text-ink/65">Sin grupos en alerta alta.</span>
            )}
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-4 shadow-soft">
          <p className="text-sm font-semibold text-ink">Indicadores a vigilar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {planningActionAlerts.length > 0 ? planningActionAlerts.map((alert) => (
              <div
                className={`rounded-md border border-line bg-panel/70 px-2 py-1 text-xs font-semibold ${
                  alert.tone === "high" ? "text-coral" : "text-clay"
                }`}
                key={`${alert.label}-${alert.value}`}
              >
                {alert.label} {"\u00b7"} {alert.value}
              </div>
            )) : (
              <span className="text-sm font-medium text-ink/55">Sin alertas relevantes.</span>
            )}
          </div>
        </div>
      </div>

      <button
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ink/90"
        onClick={() => {
          setEditingSessionId(null);
          setSessionWizardStep(0);
          setStrengthExercises([]);
          setSessionSendMessage("");
          setActiveSessionPanel("planner");
          setShowPlannerModal(true);
        }}
        type="button"
      >
        Planificar sesión
      </button>

      <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft sm:p-5 xl:mt-6">
        {activeSessionPanel === "planner" && showPlannerModal ? (
        <div
          aria-labelledby="session-planner-modal-title"
          aria-modal="true"
          className="assessment-modal-overlay"
          onClick={() => {
            setShowPlannerModal(false);
            setActiveSessionPanel("history");
          }}
          role="dialog"
        >
          <div className="assessment-modal-panel max-w-7xl" onClick={(event) => event.stopPropagation()}>
            <header className="assessment-modal-header flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold text-ink" id="session-planner-modal-title">{editingSessionId ? "Editar sesión" : "Crear sesión"}</h2>
                <p className="mt-1 text-sm text-ink/55">{activeSessionClient.name} · Semana {selectedBlockWeek}{sessionDate ? ` · ${formatDisplayDate(sessionDate)}` : ""}</p>
              </div>
              <button
                aria-label="Cerrar planificador"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-white text-ink/60 transition hover:bg-panel hover:text-ink"
                onClick={() => {
                  setShowPlannerModal(false);
                  setActiveSessionPanel("history");
                }}
                type="button"
              >
                <X size={18} />
              </button>
            </header>
            <div className="assessment-modal-body px-5 py-5">
              <nav aria-label="Pasos de la sesión" className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {sessionWizardSteps.map((step) => (
                  <button
                    className={`shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition ${sessionWizardStep === step.id ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/60 hover:text-ink"}`}
                    key={step.id}
                    onClick={() => setSessionWizardStep(step.id)}
                    type="button"
                  >
                    {step.label}{"count" in step ? ` · ${step.count}` : ""}
                  </button>
                ))}
              </nav>
              {sessionWizardStep === 0 ? <details className="rounded-md border border-line bg-white p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink">Contexto resumido del cliente</summary>
                <div className="mt-4">
                  <MenstrualCoachContextCard client={activeSessionClient} compact />
                </div>
                <div className="mt-4">
                  <OnboardingSummaryCard client={activeSessionClient} compact title="Contexto del cliente" />
                </div>
                {pinnedPlanningPrivateNotes.length > 0 ? (
                  <div className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold uppercase text-ink/45">Notas internas fijadas</p>
                      <span className="w-fit rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/50">
                        Solo entrenador
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2 text-sm text-ink/70">
                      {pinnedPlanningPrivateNotes.map((note) => (
                        <li className="rounded-md border border-line bg-white px-3 py-2" key={note.id}>
                          {note.title ? <span className="font-semibold text-ink">{note.title}: </span> : null}
                          {note.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {recentPerformanceTestReferences.length > 0 ? (
                  <div className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                    <p className="text-xs font-semibold uppercase text-ink/45">Tests recientes</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recentPerformanceTestReferences.map((entry) => (
                        <span className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/65" key={entry.id}>
                          {entry.testName}: {formatPerformanceTestValue(entry)} · {formatDisplayDate(entry.date)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </details> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Planificar sesión</h2>
          </div>
          <span className="rounded-md bg-mint px-3 py-1 text-xs font-medium text-moss">
            {sessionType}
          </span>
        </div>

        {activeSessionAccessInfo.status === "expired" ? (
          <div className="mt-4 rounded-md border border-line border-l-4 border-l-coral bg-panel/35 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Acceso finalizado</p>
                <p className="mt-1 text-sm text-ink/65">{activeSessionAccessInfo.text}</p>
              </div>
              <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${activeSessionAccessInfo.badgeClass}`}>
                {activeSessionAccessInfo.label}
              </span>
            </div>
          </div>
        ) : null}

        {sessionWizardStep === 0 ? <section className="mt-5 rounded-md border border-line bg-panel/35 p-4">
        <h3 className="font-semibold text-ink">Datos básicos</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-ink/75 xl:col-span-1">
            Nombre / resumen de la sesión
            <input className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss" onChange={(event) => setSessionSummary(event.target.value)} placeholder="Ej: Fuerza tren inferior" value={sessionSummary} />
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
          <label className="space-y-2 text-sm font-medium text-ink/75">
            Tipo de sesión
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
        </div>
        <p className="mt-3 text-xs text-ink/45">{activeSessionClient.name} · {currentBlockLabel || "Sin mesociclo"} · Semana {selectedBlockWeek}</p>
        </section> : null}

        {sessionWizardStep === 0 ? <details className="mt-5 rounded-md border border-line bg-panel/35 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-ink">Plantillas y opciones de sesión</summary>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-ink">Plantillas de sesión</h3>
              <p className="mt-1 text-sm text-ink/55">Carga una plantilla del sistema o reutiliza una plantilla propia.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex w-fit items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70"
                onClick={() => setShowTemplateLibrary((current) => !current)}
                type="button"
              >
                Usar plantilla
              </button>
              <button
                className="inline-flex w-fit items-center justify-center rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                onClick={() => setShowTemplateForm((current) => !current)}
                type="button"
              >
                Guardar como plantilla
              </button>
            </div>
          </div>

          {showTemplateLibrary ? (
            <div className="mt-4 rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <input
                  className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss"
                  onChange={(event) => setTemplateSearchTerm(event.target.value)}
                  placeholder="Buscar plantilla"
                  value={templateSearchTerm}
                />
                <div className="flex flex-wrap gap-2">
                  {sessionTemplateCategories.map((category) => (
                    <button
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                        templateCategoryFilter === category
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-panel/50 text-ink/60"
                      }`}
                      key={category}
                      onClick={() => setTemplateCategoryFilter(category)}
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-ink/45">Plantillas del sistema</p>
                  {visibleSystemTemplates.length > 0 ? (
                    <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {visibleSystemTemplates.map((template) => (
                        <article className="rounded-md border border-line bg-panel/35 p-4" key={template.id}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-ink">{template.name}</p>
                            <span className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-semibold uppercase text-ink/45">Sistema</span>
                          </div>
                          <p className="mt-1 text-sm text-ink/60">{template.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink/55">
                            <span className="rounded-md border border-line bg-white px-2 py-1">{template.category}</span>
                            <span className="rounded-md border border-line bg-white px-2 py-1">{template.sessionType}</span>
                            {template.durationApprox ? <span className="rounded-md border border-line bg-white px-2 py-1">{template.durationApprox}</span> : null}
                          </div>
                          {template.objective ? <p className="mt-3 text-xs font-medium text-ink/50">{template.objective}</p> : null}
                          <button
                            className="mt-4 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                            onClick={() => loadSessionTemplate(template)}
                            type="button"
                          >
                            Cargar
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 rounded-md border border-dashed border-line bg-panel/35 px-4 py-3 text-sm font-medium text-ink/45">No hay plantillas del sistema con ese filtro.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-ink/45">Mis plantillas guardadas</p>
                  {visibleCustomTemplates.length > 0 ? (
                    <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {visibleCustomTemplates.map((template) => (
                        <article className="rounded-md border border-line bg-white p-4" key={template.id}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-ink">{template.name}</p>
                            <span className="rounded-md border border-line bg-panel/50 px-2 py-1 text-[11px] font-semibold uppercase text-ink/45">Propia</span>
                          </div>
                          {template.description ? (
                            <p className="mt-1 text-sm text-ink/60">{template.description}</p>
                          ) : null}
                          <p className="mt-2 text-xs font-semibold text-moss">
                            {template.sessionType} · {template.strengthExercises.length} ejercicios
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
                    <p className="mt-2 rounded-md border border-dashed border-line bg-panel/35 px-4 py-3 text-sm font-medium text-ink/45">Todavía no hay plantillas propias con ese filtro.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

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
                  Descripción breve
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
        </details> : null}

        {sessionType === "Fuerza" ? (
          <>
            {sessionWizardStep > 0 && sessionWizardStep < 4 ? <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-ink">Bloques de fuerza</h3>
                <span className="rounded-md bg-white px-3 py-1 text-sm font-medium text-moss">
                  Tonelaje planificado: {plannedTonnageLabel}
                </span>
              </div>
            </div> : null}
            {sessionWizardStep === 1 ? renderStrengthBlock("activation", "Activación", "Prepara al deportista para la tarea principal.") : null}
            {sessionWizardStep === 1 && strengthExercises.some((exercise) => !exercise.sessionBlock) ? renderStrengthBlock("unclassified", "Sin clasificar", "Ejercicios legacy. Asigna un bloque solo si deseas editar su estructura.") : null}
            {sessionWizardStep === 2 ? renderStrengthBlock("main", "Bloque principal", "Trabajo prioritario de la sesión.") : null}
            {sessionWizardStep === 3 ? renderStrengthBlock("complementary", "Bloque complementario", "Trabajo accesorio o complementario de la sesión.") : null}
            {sessionWizardStep === 4 ? (
              <section className="mt-5 grid gap-3">
                <div className="rounded-md border border-line bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Datos básicos</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <ClientInfoCard label="Sesión" value={sessionSummary.trim() || "Sin nombre"} />
                    <ClientInfoCard label="Fecha" value={sessionDate ? formatDisplayDate(sessionDate) : "Sin fecha"} />
                    <ClientInfoCard label="Tipo" value={sessionType} />
                  </div>
                  <p className="mt-3 text-xs text-ink/50">{activeSessionClient.name} · {currentBlockLabel || "Sin mesociclo"} · Semana {selectedBlockWeek}</p>
                </div>
                {(["activation", "main", "complementary", "unclassified"] as const).map((blockKey) => {
                  const labels = { activation: "Activación", main: "Bloque principal", complementary: "Bloque complementario", unclassified: "Sin clasificar" };
                  const exercises = strengthExercises.filter((exercise) => blockKey === "unclassified" ? !exercise.sessionBlock : exercise.sessionBlock === blockKey);
                  if (exercises.length === 0) return null;
                  return (
                    <div className="rounded-md border border-line bg-white p-4" key={blockKey}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{labels[blockKey]} · {exercises.length} {exercises.length === 1 ? "ejercicio" : "ejercicios"}</p>
                      <div className="mt-3 grid gap-2">
                        {exercises.map((exercise) => {
                          const summary = getExerciseSummaryLine(exercise);
                          return <div className="rounded-md bg-panel/35 px-3 py-2" key={exercise.id}><p className="text-sm font-semibold text-ink">{summary.main}</p>{exercise.observation ? <p className="mt-1 text-xs text-ink/55">{exercise.observation}</p> : null}</div>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            ) : null}
          </>
        ) : sessionType === "Cardio" && sessionWizardStep === 2 ? (
          <div className="mt-5 rounded-md border border-line bg-panel/35 p-4">
            <h3 className="font-semibold text-ink">Cardio / resistencia</h3>
            <p className="mt-1 text-sm text-ink/55">Bloque opcional para comparar el trabajo planificado con el registro real.</p>
            <div className="mt-4 rounded-md border border-line bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
                <label className="space-y-2 text-sm font-medium text-ink/75">
                  Método de resistencia
                  <select
                    className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none focus:border-moss"
                    onChange={(event) => setSelectedResistanceMethodId(event.target.value)}
                    value={selectedResistanceMethodId}
                  >
                    <option value="">Sin método seleccionado</option>
                    {completeResistanceMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.method} · {method.name}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedResistanceMethod ? (
                  <div className="rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink">{getResistanceMethodLabel(selectedResistanceMethod)}</p>
                        <p className="mt-1 text-xs font-medium text-ink/55">
                          {selectedResistanceMethod.family} · {selectedResistanceMethod.group}
                          {selectedResistanceMethod.subgroup ? ` · ${selectedResistanceMethod.subgroup}` : ""}
                        </p>
                      </div>
                      <button
                        className="w-fit rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={applyResistanceMethodTemplate}
                        type="button"
                      >
                        Usar como plantilla
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <ClientInfoCard label="Intensidad" value={selectedResistanceMethod.intensity || "Sin especificar"} />
                      <ClientInfoCard label="Duración / tiempo total" value={selectedResistanceMethod.sessionDuration || "Sin especificar"} />
                    </div>
                    <button
                      className="mt-3 text-xs font-semibold text-ink/55 underline-offset-4 hover:text-ink hover:underline"
                      onClick={() => setShowCardioAdvancedOptions((current) => !current)}
                      type="button"
                    >
                      {showCardioAdvancedOptions ? "Ocultar opciones avanzadas" : "Opciones avanzadas"}
                    </button>
                    {showCardioAdvancedOptions ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <ClientInfoCard label="Nº repeticiones" value={selectedResistanceMethod.repetitions || "Sin especificar"} />
                        <ClientInfoCard label="Duración repeticiones" value={selectedResistanceMethod.repetitionDuration || "Sin especificar"} />
                        <ClientInfoCard label="Rec. repeticiones" value={selectedResistanceMethod.recoveryBetweenRepetitions || "Sin especificar"} />
                        <ClientInfoCard label="Nº series" value={selectedResistanceMethod.series || "Sin especificar"} />
                        <ClientInfoCard label="Rec. series" value={selectedResistanceMethod.recoveryBetweenSeries || "Sin especificar"} />
                        <div className="rounded-md border border-line bg-panel/35 px-3 py-2">
                          <p className="text-xs font-semibold uppercase text-ink/45">Zona interna Z1-Z5</p>
                          <select
                            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-moss"
                            onChange={(event) => updateCardioPlanDraft("targetZone", event.target.value)}
                            value={cardioPlanDraft.targetZone}
                          >
                            <option value="">Sin zona interna</option>
                            {cardioZoneOptions.map((zone) => (
                              <option key={zone.value} value={zone.value}>{zone.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}
                    {selectedResistanceMethod.trainingEffects.length > 0 ? (
                      <p className="mt-3 text-xs text-ink/55">
                        <span className="font-semibold text-ink/70">Efectos principales: </span>
                        {selectedResistanceMethod.trainingEffects.slice(0, 2).join(" · ")}
                      </p>
                    ) : null}
                    {selectedResistanceMethod.examples.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedResistanceMethod.examples.slice(0, 2).map((example) => (
                          <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink/60" key={example}>
                            {example}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink/55">
                      Guía metodológica. Ajusta el contenido según deporte, nivel y momento de la temporada.
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-24 items-center rounded-md border border-dashed border-line bg-panel/35 p-3 text-sm font-medium text-ink/50">
                    Selecciona un método completo para ver la guía metodológica. CyC sigue pendiente y no aparece como seleccionable.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Deporte
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => {
                    const nextSport = event.target.value as ResistanceSport;
                    setSelectedResistanceSport(nextSport);
                    setTargetResistanceZoneId("");
                  }}
                  value={selectedResistanceSport}
                >
                  {resistanceSportProfiles.map((profile) => (
                    <option key={profile.sport} value={profile.sport}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Zona objetivo
                <select
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-ink outline-none focus:border-moss"
                  onChange={(event) => setTargetResistanceZoneId(event.target.value as PlannedResistanceZoneId)}
                  value={targetResistanceZoneId}
                >
                  <option value="">Sin zona objetivo</option>
                  {selectedResistanceZoneGuide.profile.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </label>
              {selectedResistanceZoneGuide.zone ? (
                <div className="rounded-md border border-line bg-white p-3 text-sm text-ink/65 sm:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-ink/45">Zona objetivo</p>
                      <p className="mt-1 font-semibold text-ink">{selectedResistanceZoneGuide.zone.label}</p>
                      <p className="mt-1">{selectedResistanceZoneGuide.zone.description}</p>
                    </div>
                    <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/65">
                      {selectedResistanceZoneGuide.profile.mainReferenceMetric}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedResistanceZoneGuide.metrics.length > 0 ? selectedResistanceZoneGuide.metrics.map((metric) => (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65" key={metric}>
                        {metric}
                      </span>
                    )) : (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/55">
                        Sin porcentajes añadidos todavía.
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <ClientInfoCard label="Métricas secundarias" value={selectedResistanceZoneGuide.profile.secondaryMetrics.join(" · ") || "Sin especificar"} />
                    <ClientInfoCard label="Foco fisiológico" value={selectedResistanceZoneGuide.zone.physiologicalFocus?.join(" · ") || "Sin especificar"} />
                    <ClientInfoCard label="Métodos relacionados" value={selectedResistanceZoneGuide.zone.methodLinks?.join(" · ") || "Sin especificar"} />
                    <ClientInfoCard label="Guía" value="Individualiza con test, deporte, nivel y contexto." />
                  </div>
                  {selectedResistanceZoneGuide.zone.sourceNote ? (
                    <p className="mt-3 text-xs font-medium text-ink/45">{selectedResistanceZoneGuide.zone.sourceNote}</p>
                  ) : null}
                </div>
              ) : null}
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
            <h3 className="font-semibold text-ink">Sesión mixta</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Bloque de fuerza
                <textarea className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-3 text-ink outline-none focus:border-moss" placeholder="Ejercicios, series, reps, carga, RPE/RIR" />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/75">
                Bloque metabólico / específico
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
              placeholder="Notas finales de la sesión"
            />
          </label>
        </section>


        <footer className="sticky bottom-0 z-10 mt-5 flex items-center justify-between gap-3 border-t border-line bg-white/95 py-4 backdrop-blur">
          <button
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={sessionWizardStep === 0}
            onClick={() => setSessionWizardStep((current) => Math.max(0, current - 1))}
            type="button"
          >
            Atrás
          </button>
          {sessionWizardStep < 4 ? (
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setSessionWizardStep((current) => Math.min(4, current + 1))} type="button">Continuar</button>
          ) : (
            <button className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={sendSessionToAthlete} type="button"><Send size={17} />Guardar sesión</button>
          )}
        </footer>
        {sessionSendMessage ? (
          <p className="mt-3 text-sm font-medium text-ink/65">{sessionSendMessage}</p>
        ) : null}
            </div>
          </div>
        </div>
        ) : activeSessionPanel === "history" ? (
          <SessionHistoryPanel
            client={activeSessionClient}
            onConsumeTargetTrainingSession={onConsumeTargetTrainingSession}
            onMarkSessionReviewed={markSessionAsReviewed}
            onEditSession={(sessionId) => setLocalEditSessionId(sessionId)}
            onPlanNewSession={() => {
              setEditingSessionId(null);
              setSessionWizardStep(0);
              setStrengthExercises([]);
              setActiveSessionPanel("planner");
              setShowPlannerModal(true);
            }}
            onUpdateTechniqueReview={updateSessionTechniqueReview}
            targetTrainingSession={targetTrainingSession}
          />
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-line bg-panel/35 p-8 text-center">
            <p className="text-sm font-semibold text-ink/55">
              Selecciona Planificar sesión o Sesiones anteriores.
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
  bandColor?: string | null;
  bandResistance?: string | null;
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
  selectedVariantId?: string | null;
  selectedVariantName?: string | null;
  setDetails?: Array<{ reps?: number | string | null; setNumber?: number }>;
  intensityMethod?: StrengthIntensityMethod | null;
  targetRir?: number | string | null;
  targetRpe?: number | string | null;
  targetVelocity?: number | string | null;
  techniqueReview?: TechniqueReview;
  techniqueVideoNote?: string | null;
  techniqueVideoUrl?: string | null;
  techniqueVideoView?: TechniqueVideoView | null;
  videoNote?: string | null;
  videoUrl?: string | null;
};

type SessionReviewStatus = "pending" | "reviewed";

type ReviewSessionRecord = ClientSessionRecord & {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  block?: string | null;
  cardioPlan?: CardioPlan;
  cardioResult?: ResistanceCardioResult;
  completed?: boolean;
  discomfort?: SessionDiscomfort;
  exercises?: ReviewSessionExercise[];
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  mesocycle?: string | null;
  performedExercises?: ReviewSessionExercise[];
  plannedExercises?: ReviewSessionExercise[];
  resistanceMethodId?: string;
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

function getAthleteQuickFeedbackLabel(value?: "up" | "down" | null) {
  if (value === "up") return "👍 Feedback positivo";
  if (value === "down") return "👎 Feedback negativo";
  return "";
}

function getBandSummaryLabel(entry?: { bandColor?: string | null; bandResistance?: string | null }) {
  if (!entry) return "";
  return [entry.bandColor, entry.bandResistance].filter((value) => hasDisplayValue(value)).join(" · ");
}

function displayValue(value: unknown, fallback = "Sin especificar") {
  return hasDisplayValue(value) ? `${value}` : fallback;
}

function formatDisplayDate(value?: string | null, fallback = "Sin fecha") {
  if (!value) return fallback;
  const rawValue = value.trim();
  const isoDateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) return `${isoDateMatch[3]}-${isoDateMatch[2]}-${isoDateMatch[1]}`;

  const slashDateMatch = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashDateMatch) {
    return `${slashDateMatch[1].padStart(2, "0")}-${slashDateMatch[2].padStart(2, "0")}-${slashDateMatch[3]}`;
  }

  return rawValue || fallback;
}

function formatDisplayTime(value?: string | null) {
  if (!value) return "";
  const rawValue = value.trim();
  const timeMatch = rawValue.match(/T?(\d{2}):(\d{2})/);
  return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "";
}

function formatDisplayDateTime(value?: string | null, fallback = "Sin fecha") {
  const date = formatDisplayDate(value, fallback);
  const time = formatDisplayTime(value);
  return time ? `${date} · ${time}` : date;
}

function getCardioConnectionLabel(status?: CardioConnectionStatus["status"]) {
  if (status === "connected") return "Conectado";
  if (status === "pending") return "Pendiente";
  return "No conectado";
}

function formatCardioSyncDate(value?: string) {
  if (!value) return "Sin sincronizar";
  return formatDisplayDateTime(value);
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

function parseResistanceNumber(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatResistanceDistance(distanceMeters?: number | string | null) {
  const meters = parseResistanceNumber(distanceMeters);
  if (meters <= 0) return "Sin registrar";
  const kilometers = meters / 1000;
  const formattedKilometers = kilometers >= 10
    ? Math.round(kilometers).toString()
    : kilometers.toFixed(1).replace(".", ",");
  return `${formattedKilometers} km`;
}

function hasResistancePerformedData(session: ReviewSessionRecord) {
  return Boolean(
    session.cardioResult ||
    session.cardioPlan ||
    hasDisplayValue(session.resistanceMethodId) ||
    hasDisplayValue(session.resistanceSport) ||
    hasDisplayValue(session.targetResistanceZoneId)
  );
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
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatReviewLoad(value: unknown) {
  if (!hasDisplayValue(value)) return "";
  const parsed = parseReviewNumber(value);
  if (parsed !== null) return parsed > 0 ? `${parsed.toLocaleString("es-ES")} kg` : "";
  return `${value}`;
}

function getSetDetailsReps(entry?: ReviewSessionExercise) {
  return (entry?.setDetails ?? [])
    .map((detail) => parseReviewNumber(detail.reps))
    .filter((reps): reps is number => reps !== null && reps > 0);
}

function getExerciseMetaLabel(entry?: ReviewSessionExercise) {
  const bandSummary = getBandSummaryLabel(entry);
  const meta = [
    entry?.selectedEquipment ? `Material: ${entry.selectedEquipment}` : "",
    entry?.selectedVariantName ? `Variante: ${entry.selectedVariantName}` : "",
    bandSummary ? `Banda elástica: ${bandSummary}` : ""
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
    const loadLabel = formatReviewLoad(value);
    return loadLabel ? `Carga: ${loadLabel}` : "";
  }

  return "";
}

function getRpeToneClass(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  if (!Number.isFinite(parsed)) return "border-line bg-panel/70 text-ink/65";
  if (parsed <= 3) return "border-moss/30 bg-mint text-moss";
  if (parsed <= 6) return "border-wheat bg-wheat/70 text-ink";
  if (parsed <= 8) return "border-clay/25 bg-clay/10 text-clay";
  return "border-red-300 bg-red-50 text-red-700";
}

function getRirToneClass(value: unknown) {
  const parsed = Number(`${value ?? ""}`.replace(",", "."));
  if (!Number.isFinite(parsed)) return "border-line bg-panel/70 text-ink/65";
  if (parsed >= 5) return "border-moss/30 bg-mint text-moss";
  if (parsed >= 3) return "border-wheat bg-wheat/70 text-ink";
  if (parsed >= 1) return "border-clay/25 bg-clay/10 text-clay";
  return "border-red-300 bg-red-50 text-red-700";
}

function getReviewIntensityToneClass(label: string) {
  const value = label.match(/[-+]?\d+(?:[,.]\d+)?/)?.[0];
  if (label.startsWith("RPE")) return getRpeToneClass(value);
  if (label.startsWith("RIR")) return getRirToneClass(value);
  return "border-line bg-panel/70 text-ink/65";
}

function getCompactExerciseLabel(planned?: ReviewSessionExercise, performed?: ReviewSessionExercise, source: "planned" | "performed" = "planned") {
  const entry = source === "planned" ? planned : performed;
  if (!entry) return source === "planned" ? "Sin datos planificados" : "Sin registro real";
  const pieces = [
    getCompactSetLabel(entry, source),
    source === "planned" ? formatReviewLoad(getPlannedValue(entry, "load")) : "",
    source === "performed" ? formatReviewLoad(getPerformedValue(entry, "load")) : "",
    getReviewIntensityLabel(planned, performed, source)
  ].filter(Boolean);

  return pieces.length > 0 ? pieces.join(" \u00b7 ") : source === "planned" ? "Sin datos planificados" : "Sin registro real";
}

function getSessionHistoryTypeMeta(session: ReviewSessionRecord) {
  const label = `${session.type ?? ""} ${session.summary ?? ""}`.toLowerCase();

  if (label.includes("concurrent") || label.includes("mixt")) {
    return { dotClass: "bg-clay", label: "Concurrente" };
  }
  if (label.includes("resistencia") || label.includes("cardio") || label.includes("z2") || label.includes("series")) {
    return { dotClass: "bg-steel", label: "Resistencia" };
  }
  if (label.includes("descanso") || label.includes("recovery") || label.includes("recuperaci")) {
    return { dotClass: "bg-moss", label: "Descanso activo" };
  }
  if (label.includes("fuerza") || label.includes("strength")) {
    return { dotClass: "bg-indigo-500", label: "Fuerza" };
  }

  return { dotClass: "bg-ink/35", label: "Otro" };
}

function getSessionHistoryTitle(session: ReviewSessionRecord) {
  const typeMeta = getSessionHistoryTypeMeta(session);
  const summary = hasDisplayValue(session.summary) ? `${session.summary}` : "";
  const normalizedSummary = summary.toLowerCase();

  if (!summary) return typeMeta.label;
  if (normalizedSummary.includes(typeMeta.label.toLowerCase())) return summary;
  return `${typeMeta.label} · ${summary}`;
}

function SessionHistoryPanel({
  client,
  onConsumeTargetTrainingSession,
  onEditSession,
  onMarkSessionReviewed,
  onPlanNewSession,
  onUpdateTechniqueReview,
  targetTrainingSession
}: {
  client: CoachClient;
  onConsumeTargetTrainingSession: () => void;
  onEditSession: (sessionId: string) => void;
  onMarkSessionReviewed: (sessionIndex: number, reviewNotes?: string) => void;
  onPlanNewSession: () => void;
  onUpdateTechniqueReview: (sessionIndex: number, exerciseIndex: number, review: TechniqueReview) => void;
  targetTrainingSession: TargetTrainingSession | null;
}) {
  const [openSessionKey, setOpenSessionKey] = useState("");
  const [openSessionBlockStates, setOpenSessionBlockStates] = useState<Record<string, boolean>>({});
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({});
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ReviewExerciseDetail | null>(null);
  const [reviewFeedbackModal, setReviewFeedbackModal] = useState<ReviewFeedbackModal | null>(null);
  const [techniqueReviewDrafts, setTechniqueReviewDrafts] = useState<Record<string, TechniqueReview>>({});
  const sessions = useMemo(
    () => [...(client.sessionRecords ?? [])] as ReviewSessionRecord[],
    [client.sessionRecords]
  );
  const sessionGroups = useMemo(() => groupSessionsByBlockAndWeek(sessions), [sessions]);
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

  function getTechniqueReviewDraft(reviewKey: string, exercise: ReviewSessionExercise): TechniqueReview {
    return techniqueReviewDrafts[reviewKey] ?? exercise.techniqueReview ?? { compensationTags: [], markedAsReference: false, status: "not_reviewed" };
  }

  function updateTechniqueReviewDraft(reviewKey: string, updates: TechniqueReview) {
    setTechniqueReviewDrafts((current) => ({
      ...current,
      [reviewKey]: {
        ...(current[reviewKey] ?? { compensationTags: [], markedAsReference: false, status: "not_reviewed" }),
        ...updates
      }
    }));
  }

  function toggleTechniqueReviewTag(reviewKey: string, exercise: ReviewSessionExercise, tag: string) {
    const currentDraft = getTechniqueReviewDraft(reviewKey, exercise);
    const currentTags = currentDraft.compensationTags ?? [];
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((currentTag) => currentTag !== tag)
      : [...currentTags, tag];
    updateTechniqueReviewDraft(reviewKey, { compensationTags: nextTags });
  }

  function getTechniqueExercisePattern(exercise: ReviewSessionExercise) {
    return getExerciseById(exercise.exerciseId ?? "")?.pattern ?? null;
  }

  function loadTechniqueChecklistPreset(reviewKey: string, exercise: ReviewSessionExercise) {
    const currentDraft = getTechniqueReviewDraft(reviewKey, exercise);
    updateTechniqueReviewDraft(reviewKey, {
      ...currentDraft,
      checklist: getTechniqueAssessmentPreset(getTechniqueExercisePattern(exercise))
    });
  }

  function updateTechniqueChecklistItem(
    reviewKey: string,
    exercise: ReviewSessionExercise,
    itemId: string,
    updates: Partial<TechniqueAssessmentItem>
  ) {
    const currentDraft = getTechniqueReviewDraft(reviewKey, exercise);
    const currentChecklist = currentDraft.checklist?.length
      ? currentDraft.checklist
      : getTechniqueAssessmentPreset(getTechniqueExercisePattern(exercise));

    updateTechniqueReviewDraft(reviewKey, {
      ...currentDraft,
      checklist: currentChecklist.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    });
  }

  useEffect(() => {
    if (targetTrainingSession?.clientId !== client.id) return;

    const targetIndex = targetTrainingSession.sessionId
      ? sessions.findIndex((session) => session.id === targetTrainingSession.sessionId)
      : targetTrainingSession.sessionIndex ??
        sessions.findIndex((session) => session.date === targetTrainingSession.sessionDate);

    if (targetIndex >= 0 && sessions[targetIndex]) {
      setOpenSessionKey(getSessionHistoryKey(sessions[targetIndex], targetIndex));
      const targetBlock = sessionGroups.find((blockGroup) =>
        blockGroup.weeks.some((weekGroup) =>
          weekGroup.sessions.some(({ originalIndex }) => originalIndex === targetIndex)
        )
      );
      if (targetBlock) {
        setOpenSessionBlockStates((current) => ({ ...current, [targetBlock.label]: true }));
      }
    }

    onConsumeTargetTrainingSession();
  }, [client.id, onConsumeTargetTrainingSession, sessionGroups, sessions, targetTrainingSession]);

  useEffect(() => {
    if (!openSessionKey && !selectedExerciseDetail && !reviewFeedbackModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedExerciseDetail) {
        setSelectedExerciseDetail(null);
        return;
      }
      if (reviewFeedbackModal) {
        setReviewFeedbackModal(null);
        return;
      }
      setOpenSessionKey("");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSessionKey, reviewFeedbackModal, selectedExerciseDetail]);

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
        <div className="mt-5 grid gap-4">
          {sessionGroups.map((blockGroup, blockIndex) => {
            const blockSessions = blockGroup.weeks.flatMap((week) => week.sessions.map(({ session }) => session));
            const blockCompleted = blockSessions.filter((session) => getSessionStatus(session) === "Completada").length;
            const blockPending = blockSessions.length - blockCompleted;
            const blockDates = blockSessions
              .map((session) => getReviewSessionDate(session.date))
              .filter((date): date is Date => Boolean(date))
              .sort((left, right) => left.getTime() - right.getTime());
            const firstBlockDate = blockDates[0];
            const lastBlockDate = blockDates.at(-1);
            const blockDateRange = firstBlockDate && lastBlockDate
              ? `${firstBlockDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} – ${lastBlockDate.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`
              : "";

            return (
            <details
              className="coach-surface min-w-0 rounded-md p-3 shadow-soft sm:p-4"
              key={blockGroup.label}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpenSessionBlockStates((current) => current[blockGroup.label] === isOpen
                  ? current
                  : { ...current, [blockGroup.label]: isOpen });
              }}
              open={openSessionBlockStates[blockGroup.label] ?? blockIndex === 0}
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Mesociclo / bloque</p>
                  <h3 className="mt-1 break-words text-base font-semibold text-ink sm:text-lg">{blockGroup.label}</h3>
                  <p className="mt-1 text-xs font-medium text-ink/55">
                    {blockGroup.weeks.length} {blockGroup.weeks.length === 1 ? "semana" : "semanas"} · {blockSessions.length} {blockSessions.length === 1 ? "sesión" : "sesiones"} · {blockCompleted} {blockCompleted === 1 ? "completada" : "completadas"}{blockPending > 0 ? ` · ${blockPending} ${blockPending === 1 ? "pendiente" : "pendientes"}` : ""}
                  </p>
                  {blockDateRange ? <p className="mt-1 text-xs text-ink/45">{blockDateRange}</p> : null}
                </div>
                <span className="shrink-0 rounded-md border border-line bg-panel/60 px-2.5 py-1 text-xs font-semibold text-ink/55">
                  {blockIndex === 0 ? "Bloque reciente" : "Ver bloque"}
                </span>
              </summary>
              <div className="mt-3 grid gap-3">
                {blockGroup.weeks.map((weekGroup) => {
                  const weekSessions = weekGroup.sessions.map(({ session }) => session);
                  const weekCompleted = weekSessions.filter((session) => getSessionStatus(session) === "Completada").length;
                  const weekPending = weekSessions.length - weekCompleted;
                  const weekReviewed = weekSessions.filter((session) => getSessionReviewStatus(session) === "reviewed").length;
                  return (
                  <section className="min-w-0 rounded-md border border-line bg-panel/25 p-3" key={`${blockGroup.label}-${weekGroup.label}`}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-2">
                      <h4 className="text-sm font-semibold text-ink sm:text-base">{weekGroup.label}</h4>
                      <p className="text-xs font-medium text-ink/50">
                        {weekSessions.length} {weekSessions.length === 1 ? "sesión" : "sesiones"} · {weekCompleted} {weekCompleted === 1 ? "completada" : "completadas"}{weekPending > 0 ? ` · ${weekPending} ${weekPending === 1 ? "pendiente" : "pendientes"}` : ""}{weekReviewed > 0 ? ` · ${weekReviewed} ${weekReviewed === 1 ? "revisada" : "revisadas"}` : ""}
                      </p>
                    </div>
                    <div className="grid gap-2">
          {weekGroup.sessions.map(({ session, originalIndex: sessionIndex }) => {
            const sessionKey = getSessionHistoryKey(session, sessionIndex);
            const isOpen = openSessionKey === sessionKey;
            const status = getSessionStatus(session);
            const isRealImpact = hasRealSessionData(session) || status === "Completada";
            const plannedImpact = isRealImpact ? null : getPlannedSessionImpact(session);
            const impact = isRealImpact
              ? getSessionImpact(session)
              : plannedImpact?.level !== "unknown"
                ? plannedImpact
                : null;
            const impactLabel = impact ? `${isRealImpact ? "" : "Previsto: "}${impact.label}` : "";
            const impactStyle = impact ? getSessionImpactStyle(impact.level) : null;
            const compatibility = !isRealImpact ? getNextSessionCompatibility({
              nextSession: session,
              recentSessions: sessions.filter((listedSession) => listedSession !== session),
              recentWellness: sessions.flatMap((listedSession) => listedSession.wellness
                ? [{ date: listedSession.date, ...listedSession.wellness }]
                : [])
            }) : null;
            const compatibilityStyle = compatibility ? getSessionCompatibilityStyle(compatibility.level) : null;
            const reviewStatus = getSessionReviewStatus(session);
            const { plannedExercises, performedExercises } = getReviewExercises(session);
            const exerciseCount = Math.max(plannedExercises.length, performedExercises.length);
            const srpe = getSessionSrpe(session);
            const notes = session.finalNotes ?? session.notes;
            const sessionDeviation = calculateSessionDeviation(session);
            const resistanceMethod = getResistanceMethodById(session.resistanceMethodId);
            const resistanceZoneGuide = getResistanceZoneGuide(session.resistanceSport, session.targetResistanceZoneId);
            const cardioDeviation = session.cardioPlan || session.cardioResult
              ? analyzeCardioDeviation(session.cardioPlan, session.cardioResult)
              : null;
            const athleteQuickFeedbackLabel = getAthleteQuickFeedbackLabel(session.athleteQuickFeedback);
            const hasResistanceData = hasResistancePerformedData(session);
            const resistanceDuration = session.cardioResult?.durationMinutes ?? session.actualDurationMinutes;
            const complianceLabel = sessionDeviation.globalCompletionPct !== null
              ? `${Math.round(sessionDeviation.globalCompletionPct)}%`
              : "";
            const typeMeta = getSessionHistoryTypeMeta(session);
            const rawWeekLabel = `${session.week ?? session.weekLabel ?? ""}`.trim();
            const compactMetaItems = [
              formatDisplayDate(session.date),
              displayValue(session.type, ""),
              session.block || session.mesocycle ? `${session.block ?? session.mesocycle}` : "",
              rawWeekLabel ? (/^semana\b/i.test(rawWeekLabel) ? rawWeekLabel : `Semana ${rawWeekLabel}`) : ""
            ].filter((item) => hasDisplayValue(item));
            const suggestedReviewNotes = [
              sessionDeviation.suggestedReviewNotes,
              cardioDeviation ? generateCardioFeedbackSuggestion(cardioDeviation) : ""
            ].filter(Boolean).join(" ");
            const detailRows = Array.from({ length: exerciseCount }, (_, index) => ({
              performed: performedExercises[index],
              planned: plannedExercises[index]
            }));
            const groupedRows = getGroupedReviewRows(detailRows);
            const techniqueVideoRows = performedExercises
              .map((exercise, index) => ({ exercise, index }))
              .filter(({ exercise }) => hasDisplayValue(exercise.techniqueVideoUrl));
            const hasRealRegister = performedExercises.length > 0 || status === "Completada";
            const canReviewSession = reviewStatus === "reviewed" || reviewStatus === "pending";
            const showStrengthReview = exerciseCount > 0;
            const cardioZoneDistribution = formatCardioZones(session.cardioResult?.timeInZones);
            const resistanceInfoItems = [
              hasDisplayValue(resistanceDuration) ? ["Duración real", `${resistanceDuration} min`] : null,
              parseResistanceNumber(session.cardioResult?.distanceMeters) > 0 ? ["Distancia real", formatResistanceDistance(session.cardioResult?.distanceMeters)] : null,
              hasDisplayValue(session.finalRpe) ? ["RPE final", `${session.finalRpe}/10`] : null,
              resistanceZoneGuide.zone || hasDisplayValue(session.resistanceSport) ? ["Deporte", resistanceZoneGuide.profile.name] : null,
              resistanceZoneGuide.zone || session.cardioPlan?.targetZone ? ["Zona objetivo", resistanceZoneGuide.zone?.label ?? session.cardioPlan?.targetZone?.toUpperCase() ?? ""] : null,
              resistanceMethod ? ["Método", getResistanceMethodLabel(resistanceMethod)] : null,
              session.cardioResult?.intervalsCompleted ? ["Repeticiones / intervalos", session.cardioResult.intervalsCompleted] : null,
              session.cardioResult?.intensityCompleted ? ["Intensidad realizada", session.cardioResult.intensityCompleted] : null,
              session.cardioResult?.recoveryCompleted ? ["Recuperación realizada", session.cardioResult.recoveryCompleted] : null
            ].filter((item): item is [string, string] => Boolean(item && hasDisplayValue(item[1])));
            const cardioDeviationItems = cardioDeviation ? [
              session.cardioPlan?.targetDurationMinutes || session.cardioResult?.durationMinutes
                ? ["Duración planificada vs real", `${session.cardioPlan?.targetDurationMinutes ? `${session.cardioPlan.targetDurationMinutes} min` : "Plan sin especificar"} / ${session.cardioResult?.durationMinutes ? `${session.cardioResult.durationMinutes} min` : "Real sin registrar"}`]
                : null,
              cardioDeviation.durationCompletionPct !== null
                ? ["Cumplimiento de duración", `${Math.round(cardioDeviation.durationCompletionPct)}% · ${getCardioCompletionLabel(cardioDeviation.durationStatus)}`]
                : null,
              session.cardioPlan?.targetZone ? ["Zona objetivo", session.cardioPlan.targetZone.toUpperCase()] : null,
              cardioDeviation.targetZonePct !== null ? ["Tiempo en zona", `${Math.round(cardioDeviation.targetZonePct)}% · ${cardioDeviation.zoneStatusLabel}`] : null,
              (cardioDeviation.timeBelowTargetZoneSeconds ?? 0) > 0 ? ["Por debajo de zona", formatDurationSeconds(cardioDeviation.timeBelowTargetZoneSeconds ?? 0)] : null,
              (cardioDeviation.timeAboveTargetZoneSeconds ?? 0) > 0 ? ["Por encima de zona", formatDurationSeconds(cardioDeviation.timeAboveTargetZoneSeconds ?? 0)] : null,
              session.cardioResult?.perceivedRpe && (session.cardioPlan?.targetRpeMin || session.cardioPlan?.targetRpeMax)
                ? ["RPE objetivo vs real", `${session.cardioPlan?.targetRpeMin ?? "-"}-${session.cardioPlan?.targetRpeMax ?? "-"} / real ${session.cardioResult.perceivedRpe} · ${cardioDeviation.rpeLabel}`]
                : null,
              cardioDeviation.distanceCompletionPct !== null
                ? ["Distancia", `${Math.round(cardioDeviation.distanceCompletionPct)}% · ${getCardioCompletionLabel(cardioDeviation.distanceStatus)}`]
                : null
            ].filter((item): item is [string, string] => Boolean(item && hasDisplayValue(item[1]))) : [];
            const performedSummaryItems = [
              hasDisplayValue(session.actualDurationMinutes ?? session.duration) ? ["Duración real", `${session.actualDurationMinutes ?? session.duration} min`] : null,
              hasDisplayValue(session.finalRpe ?? session.rpe) ? ["RPE final", `${session.finalRpe ?? session.rpe}/10`] : null,
              srpe !== null ? ["sRPE", `${srpe} UA`] : null,
              complianceLabel ? ["Cumplimiento", complianceLabel] : null,
              parseResistanceNumber(session.cardioResult?.distanceMeters) > 0 ? ["Distancia", formatResistanceDistance(session.cardioResult?.distanceMeters)] : null,
              athleteQuickFeedbackLabel ? ["Feedback rápido", athleteQuickFeedbackLabel] : null
            ].filter((item): item is [string, string] => Boolean(item && hasDisplayValue(item[1])));
            const compactResistanceDuration = hasDisplayValue(resistanceDuration) ? `${resistanceDuration} min` : "";
            const compactResistanceDistance = parseResistanceNumber(session.cardioResult?.distanceMeters) > 0
              ? formatResistanceDistance(session.cardioResult?.distanceMeters)
              : "";

            return (
              <article className="min-w-0 rounded-md border border-line bg-white px-3 py-2.5 sm:px-4" key={sessionKey}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className={`mt-1 size-2.5 shrink-0 rounded-full ${typeMeta.dotClass}`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-ink sm:text-base">{getSessionHistoryTitle(session)}</h3>
                        {impact && impactStyle ? (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${impactStyle.badgeClassName}`}>
                            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${impactStyle.dotClassName}`} />
                            {impactLabel}
                          </span>
                        ) : null}
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                        {reviewStatus === "reviewed" ? (
                          <span className="rounded-md border border-line bg-mint px-2 py-0.5 text-[11px] font-semibold text-moss">
                            Revisada
                          </span>
                        ) : canReviewSession ? (
                          <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-[11px] font-semibold text-ink/60">
                            Sin revisar
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold text-ink/50">
                        {compactMetaItems.join(" · ")}
                      </p>
                      {hasDisplayValue(notes) ? (
                        <p className="mt-1 truncate text-xs text-ink/55">
                          <span className="font-semibold text-ink/65">Nota:</span> {notes}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    {srpe !== null ? (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65">
                        sRPE {srpe} UA
                      </span>
                    ) : null}
                    {hasDisplayValue(session.finalRpe ?? session.rpe) ? (
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${getRpeToneClass(session.finalRpe ?? session.rpe)}`}>
                        RPE {session.finalRpe ?? session.rpe}/10
                      </span>
                    ) : null}
                    {complianceLabel ? (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65">
                        Cumpl. {complianceLabel}
                      </span>
                    ) : null}
                    {compactResistanceDuration ? (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65">
                        {compactResistanceDuration}
                      </span>
                    ) : null}
                    {compactResistanceDistance ? (
                      <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-semibold text-ink/65">
                        {compactResistanceDistance}
                      </span>
                    ) : null}
                    <button
                      className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink/85"
                      onClick={() => setOpenSessionKey(sessionKey)}
                      type="button"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div
                    aria-labelledby={`session-detail-title-${sessionIndex}`}
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-3 backdrop-blur-sm sm:p-5"
                    onClick={() => setOpenSessionKey("")}
                    role="dialog"
                  >
                    <div
                      className="max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-x-hidden overflow-y-auto rounded-xl border border-line bg-white p-4 shadow-soft sm:max-h-[90vh] sm:p-5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Detalle de sesi{"\u00f3"}n</p>
                          <h4 className="mt-1 text-xl font-semibold text-ink" id={`session-detail-title-${sessionIndex}`}>{displayValue(session.type, "Tipo sin especificar")}</h4>
                          <p className="mt-1 text-sm text-ink/55">{formatDisplayDate(session.date)} {"\u00b7"} {client.name}</p>
                          {session.planningOrigin ? (
                            <p className="mt-1 text-xs font-semibold text-steel">Desde planificación · {session.block || "Mesociclo"} · Semana {session.planningOrigin.weekNumber} · {planningWeekdayLabels[session.planningOrigin.templateDayIndex]}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {session.id ? (
                            <button
                              className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-mint hover:text-ink"
                              onClick={() => {
                                setOpenSessionKey("");
                                onEditSession(session.id as string);
                              }}
                              type="button"
                            >
                              Editar sesión
                            </button>
                          ) : null}
                          <button
                            aria-label="Cerrar detalle"
                            className="grid size-9 place-items-center rounded-md border border-line bg-panel text-lg font-semibold text-ink transition hover:bg-mint"
                            onClick={() => setOpenSessionKey("")}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <section className="mb-4 rounded-md border border-line bg-panel/25 p-4">
                        {impact && impactStyle ? (
                          <div className="mb-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${impactStyle.badgeClassName}`}>
                              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${impactStyle.dotClassName}`} />
                              {impactLabel}
                            </span>
                            {impact.reasons.length > 0 ? (
                              <details className="mt-2 text-sm text-ink/65">
                                <summary className="cursor-pointer font-semibold">
                                  {isRealImpact ? "Motivos de impacto" : "Motivos de impacto previsto"}
                                </summary>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                  {impact.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                                </ul>
                              </details>
                            ) : null}
                          </div>
                        ) : null}
                        {compatibility && compatibilityStyle ? (
                          <div className={`mb-4 rounded-md border bg-white p-3 ${compatibilityStyle.borderClassName}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Compatibilidad próxima sesión</p>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${compatibilityStyle.badgeClassName}`}>
                                <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${compatibilityStyle.dotClassName}`} />
                                {compatibility.label}
                              </span>
                            </div>
                            {compatibility.primaryReason ? (
                              <p className="mt-2 text-sm text-ink/65">
                                <span className="font-semibold text-ink">Motivo principal:</span> {compatibility.primaryReason.label}
                              </p>
                            ) : null}
                            <p className="mt-1 text-sm text-ink/65">
                              <span className="font-semibold text-ink">Acción sugerida:</span> {compatibility.suggestedAction}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-ink/45">
                              Confianza {compatibility.confidence === "high" ? "alta" : compatibility.confidence === "medium" ? "media" : "baja"}
                            </p>
                            {compatibility.reasons.length > 1 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {compatibility.reasons.slice(1, 3).map((reason) => (
                                  <span className="rounded-md border border-line bg-panel/60 px-2 py-1 text-xs font-medium text-ink/60" key={`${reason.type}-${reason.label}`}>
                                    {reason.label}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-semibold text-ink">Resumen de sesión</h5>
                            <p className="mt-1 text-sm text-ink/55">
                              Vista rápida de lo realizado por el deportista.
                            </p>
                          </div>
                          <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="rounded-md border border-line bg-white p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Realizado</p>
                            {performedSummaryItems.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {performedSummaryItems.map(([label, value]) => (
                                  <span className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${label === "RPE final" ? getRpeToneClass(value) : "border-line bg-panel/60 text-ink/65"}`} key={label}>
                                    {label}: {value}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-sm font-semibold text-ink/50">Sin registro real todavía.</p>
                            )}
                            {hasDisplayValue(notes) ? (
                              <p className="mt-3 line-clamp-2 rounded-md border border-line bg-panel/45 px-3 py-2 text-sm text-ink/70">
                                <span className="font-semibold text-ink">Notas del deportista:</span> {notes}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </section>
                  {showStrengthReview ? (
                  <div className="rounded-md border border-line bg-panel/25 p-4">
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
                                        <span className={`rounded-md border px-2 py-1 ${getReviewIntensityToneClass(intensityLabel)}`}>{intensityLabel}</span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : null}

                  </div>
                  ) : null}

                    {hasResistanceData ? (
                      <section className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                        <h5 className="font-semibold text-ink">Realizado resistencia</h5>
                        {resistanceInfoItems.length > 0 ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {resistanceInfoItems.map(([label, value]) => (
                              <ClientInfoCard key={label} label={label} value={value} />
                            ))}
                          </div>
                        ) : null}
                        {session.cardioResult?.notes ? (
                          <p className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink/70">
                            {session.cardioResult.notes}
                          </p>
                        ) : null}
                      </section>
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
                        {cardioDeviationItems.length > 0 ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {cardioDeviationItems.map(([label, value]) => (
                              <ClientInfoCard key={label} label={label} value={value} />
                            ))}
                          </div>
                        ) : null}
                        {cardioZoneDistribution.length > 0 ? (
                          <div className="mt-3 rounded-md border border-line bg-white p-3">
                            <p className="text-xs font-semibold uppercase text-ink/45">{"Distribuci\u00f3n Z1-Z5"}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {cardioZoneDistribution.map((zone) => (
                                <span className="rounded-md bg-panel/70 px-3 py-1 text-xs font-semibold text-ink/65" key={zone.label}>
                                  {zone.label}: {formatDurationSeconds(zone.seconds)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </section>
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

                    {athleteQuickFeedbackLabel ? (
                      <section className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
                        <h5 className="font-semibold text-ink">Feedback rápido del deportista</h5>
                        <p className="mt-1">{athleteQuickFeedbackLabel}</p>
                        {session.athleteQuickFeedbackNote ? <p className="mt-1">{session.athleteQuickFeedbackNote}</p> : null}
                        <p className="mt-2 text-xs text-ink/45">
                          Este feedback es subjetivo y no sustituye al registro de RPE, molestias o bienestar.
                        </p>
                      </section>
                    ) : null}

                    {techniqueVideoRows.length > 0 ? (
                      <section className="mt-4 rounded-md border border-line bg-panel/35 p-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-semibold text-ink">Vídeos de técnica enviados</h5>
                            <p className="mt-1 text-sm text-ink/55">
                              Revisión manual del entrenador. La app no detecta compensaciones automáticamente.
                            </p>
                          </div>
                          <p className="text-xs font-medium text-ink/45">
                            Descarga o guarda vídeos solo si tienes permiso del deportista.
                          </p>
                        </div>
                        <div className="mt-3 grid gap-3">
                          {techniqueVideoRows.map(({ exercise, index }) => {
                            const reviewKey = `${sessionKey}-${index}-technique`;
                            const reviewDraft = getTechniqueReviewDraft(reviewKey, exercise);
                            const videoUrl = `${exercise.techniqueVideoUrl ?? ""}`;
                            const directFile = isDirectVideoFileUrl(videoUrl);
                            const exercisePattern = getTechniqueExercisePattern(exercise);
                            const checklist = reviewDraft.checklist ?? [];

                            return (
                              <article className="rounded-md border border-line bg-white p-3" key={reviewKey}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <p className="font-semibold text-ink">{getExerciseLabel(exercise)}</p>
                                    <p className="mt-1 text-sm text-ink/60">
                                      Vista: {techniqueVideoViewLabels[exercise.techniqueVideoView ?? "other"]}
                                    </p>
                                    {exercise.techniqueVideoNote ? (
                                      <p className="mt-1 text-sm text-ink/60">Nota del deportista: {exercise.techniqueVideoNote}</p>
                                    ) : null}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <a
                                      className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink"
                                      href={videoUrl}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      Abrir vídeo
                                    </a>
                                    <a
                                      className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                                      download
                                      href={videoUrl}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      {directFile ? "Descargar vídeo" : "Abrir / descargar"}
                                    </a>
                                  </div>
                                </div>
                                <p className="mt-2 text-xs text-ink/45">
                                  La descarga depende de los permisos del enlace. Si no se descarga, ábrelo y guárdalo desde la plataforma.
                                </p>

                                <div className="mt-4 grid gap-3">
                                  <section className="rounded-md border border-line bg-panel/35 p-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <h6 className="font-semibold text-ink">Evaluación técnica</h6>
                                        <p className="mt-1 text-xs text-ink/45">
                                          Evaluación manual del entrenador basada en el vídeo enviado. No es un diagnóstico médico ni un análisis automático.
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-ink/50">
                                          Patrón sugerido: {exercisePattern ?? "Otros / fallback"}
                                        </p>
                                      </div>
                                      <button
                                        className="w-fit rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink"
                                        onClick={() => loadTechniqueChecklistPreset(reviewKey, exercise)}
                                        type="button"
                                      >
                                        Cargar checklist sugerido
                                      </button>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                      <label className="space-y-1 text-xs font-semibold text-ink/55">
                                        Valoración global
                                        <select
                                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                                          onChange={(event) => updateTechniqueReviewDraft(reviewKey, {
                                            ...getTechniqueReviewDraft(reviewKey, exercise),
                                            globalScore: event.target.value ? event.target.value as TechniqueGlobalScore : undefined
                                          })}
                                          value={reviewDraft.globalScore ?? ""}
                                        >
                                          <option value="">Sin valoración</option>
                                          {Object.entries(techniqueGlobalScoreLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                          ))}
                                        </select>
                                      </label>
                                      <label className="space-y-1 text-xs font-semibold text-ink/55">
                                        Decisión para planificación
                                        <select
                                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                                          onChange={(event) => updateTechniqueReviewDraft(reviewKey, {
                                            ...getTechniqueReviewDraft(reviewKey, exercise),
                                            planningDecision: event.target.value as TechniquePlanningDecision
                                          })}
                                          value={reviewDraft.planningDecision ?? ""}
                                        >
                                          <option value="">Sin decisión</option>
                                          {Object.entries(techniquePlanningDecisionLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                          ))}
                                        </select>
                                      </label>
                                    </div>

                                    {checklist.length > 0 ? (
                                      <div className="mt-3 grid gap-2">
                                        {checklist.map((item) => (
                                          <div className="rounded-md border border-line bg-white p-3" key={item.id}>
                                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                              <p className="text-sm font-semibold text-ink">{item.label}</p>
                                              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
                                                <select
                                                  aria-label={`Estado ${item.label}`}
                                                  className="h-9 rounded-md border border-line bg-panel/35 px-2 text-xs font-semibold text-ink outline-none focus:border-moss"
                                                  onChange={(event) => updateTechniqueChecklistItem(reviewKey, exercise, item.id, { status: event.target.value as TechniqueAssessmentStatus })}
                                                  value={item.status}
                                                >
                                                  {Object.entries(techniqueAssessmentStatusLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                  ))}
                                                </select>
                                                <select
                                                  aria-label={`Lado ${item.label}`}
                                                  className="h-9 rounded-md border border-line bg-panel/35 px-2 text-xs font-semibold text-ink outline-none focus:border-moss"
                                                  onChange={(event) => updateTechniqueChecklistItem(reviewKey, exercise, item.id, { side: event.target.value as TechniqueAssessmentSide })}
                                                  value={item.side ?? "not_applicable"}
                                                >
                                                  {Object.entries(techniqueAssessmentSideLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                  ))}
                                                </select>
                                                <select
                                                  aria-label={`Severidad ${item.label}`}
                                                  className="h-9 rounded-md border border-line bg-panel/35 px-2 text-xs font-semibold text-ink outline-none focus:border-moss"
                                                  onChange={(event) => updateTechniqueChecklistItem(reviewKey, exercise, item.id, { severity: event.target.value as TechniqueAssessmentSeverity })}
                                                  value={item.severity ?? "low"}
                                                >
                                                  {Object.entries(techniqueAssessmentSeverityLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                  ))}
                                                </select>
                                              </div>
                                            </div>
                                            <input
                                              className="mt-2 h-9 w-full rounded-md border border-line bg-panel/35 px-3 text-sm text-ink outline-none focus:border-moss"
                                              onChange={(event) => updateTechniqueChecklistItem(reviewKey, exercise, item.id, { note: event.target.value })}
                                              placeholder="Nota breve opcional"
                                              type="text"
                                              value={item.note ?? ""}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="mt-3 rounded-md border border-dashed border-line bg-white p-3 text-sm font-semibold text-ink/50">
                                        Carga el checklist sugerido para revisar este vídeo de forma estructurada.
                                      </p>
                                    )}
                                  </section>
                                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                                    Estado de revisión técnica
                                    <select
                                      className="h-10 w-full rounded-md border border-line bg-panel/35 px-3 text-sm font-semibold text-ink outline-none focus:border-moss"
                                      onChange={(event) => updateTechniqueReviewDraft(reviewKey, { ...getTechniqueReviewDraft(reviewKey, exercise), status: event.target.value as TechniqueReviewStatus })}
                                      value={reviewDraft.status ?? "not_reviewed"}
                                    >
                                      {Object.entries(techniqueReviewStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                      ))}
                                    </select>
                                  </label>
                                  <div>
                                    <p className="text-xs font-semibold text-ink/55">Etiquetas manuales</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {techniqueCompensationTags.map((tag) => {
                                        const selected = reviewDraft.compensationTags?.includes(tag);
                                        return (
                                          <button
                                            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                                              selected ? "border-ink bg-ink text-white" : "border-line bg-panel/60 text-ink/65"
                                            }`}
                                            key={tag}
                                            onClick={() => toggleTechniqueReviewTag(reviewKey, exercise, tag)}
                                            type="button"
                                          >
                                            {tag}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <label className="space-y-1 text-xs font-semibold text-ink/55">
                                    Feedback técnico
                                    <textarea
                                      className="min-h-20 w-full rounded-md border border-line bg-panel/35 px-3 py-2 text-sm text-ink outline-none focus:border-moss"
                                      onChange={(event) => updateTechniqueReviewDraft(reviewKey, { ...getTechniqueReviewDraft(reviewKey, exercise), coachFeedback: event.target.value })}
                                      placeholder="Feedback manual sobre técnica, control o compensaciones observadas."
                                      value={reviewDraft.coachFeedback ?? ""}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 text-sm font-semibold text-ink/65">
                                    <input
                                      checked={Boolean(reviewDraft.markedAsReference)}
                                      onChange={(event) => updateTechniqueReviewDraft(reviewKey, { ...getTechniqueReviewDraft(reviewKey, exercise), markedAsReference: event.target.checked })}
                                      type="checkbox"
                                    />
                                    Marcar como vídeo de referencia
                                  </label>
                                  <button
                                    className="w-fit rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                                    onClick={() => onUpdateTechniqueReview(sessionIndex, index, reviewDraft)}
                                    type="button"
                                  >
                                    Guardar revisión técnica
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    ) : null}

                    {canReviewSession ? (
                      <section className="mt-4 rounded-md border border-line bg-white p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h5 className="font-semibold text-ink">{"Revisi\u00f3n del entrenador"}</h5>
                            {session.reviewedAt ? (
                              <p className="mt-1 text-xs font-medium text-ink/50">
                                Revisada: {formatDisplayDateTime(session.reviewedAt)}
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
                  </div>
                ) : null}
              </article>
            );
          })}
                    </div>
                  </section>
                  );
                })}
              </div>
            </details>
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
