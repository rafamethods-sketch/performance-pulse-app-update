export type TargetTrainingSession = {
  clientId?: string;
  draftSessionSummary?: string;
  draftSessionType?: string;
  sessionDate?: string;
  sessionIndex?: number;
};

export type CoachSessionRecordForViews = {
  actualDurationMinutes?: number | string | null;
  athleteQuickFeedback?: "up" | "down" | null;
  athleteQuickFeedbackNote?: string | null;
  cardioResult?: unknown;
  completed?: boolean;
  date: string;
  discomfort?: unknown;
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: Array<{
    techniqueVideoNote?: string | null;
    techniqueVideoUrl?: string | null;
  }>;
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  status?: string | null;
  summary: string;
  time?: string | null;
  type: string;
};

export type CoachClientForViews = {
  id: string;
  injuries?: string | null;
  modality?: string | null;
  name: string;
  nextEvent?: string | null;
  planning: {
    currentBlock: string;
    currentWeek: string;
    eventDate?: string;
    eventName?: string;
    nextSessions?: string[];
  };
  sessionRecords?: CoachSessionRecordForViews[];
  sport?: string | null;
};
