export type TargetTrainingSession = {
  clientId: string;
  sessionDate?: string;
  sessionIndex?: number;
};

export type CoachSessionRecordForViews = {
  actualDurationMinutes?: number | string | null;
  completed?: boolean;
  date: string;
  duration?: number | string | null;
  finalNotes?: string | null;
  finalRpe?: number | string | null;
  notes?: string | null;
  performedExercises?: unknown[];
  reviewStatus?: "pending" | "reviewed";
  rpe?: number | string | null;
  sRPE?: number | string | null;
  srpe?: number | string | null;
  status?: string | null;
  summary: string;
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
