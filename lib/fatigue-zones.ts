import { getExerciseById } from "@/lib/exercises";

export type FatigueZoneLevel = "low" | "moderate" | "high";

export type FatigueZoneResult = {
  key: string;
  label: string;
  level: FatigueZoneLevel;
  score: number;
};

type FatigueZone = {
  key: string;
  label: string;
  keywords: string[];
};

export type FatigueZoneExercise = {
  block?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  name?: string | null;
  section?: string | null;
};

export type FatigueZoneSession = {
  performedExercises?: FatigueZoneExercise[];
  plannedExercises?: FatigueZoneExercise[];
};

export const fatigueZones: FatigueZone[] = [
  {
    key: "anteriorLower",
    label: "Tren inferior anterior",
    keywords: ["squat", "sentadilla", "prensa", "hack", "lunge", "zancada", "split", "quad", "cuadriceps", "extensión"]
  },
  {
    key: "posteriorLower",
    label: "Tren inferior posterior",
    keywords: ["hinge", "deadlift", "peso muerto", "rumano", "rdl", "curl femoral", "femoral", "isquio", "hamstring"]
  },
  {
    key: "glutesHip",
    label: "Glúteos / cadera",
    keywords: ["glute", "glúteo", "cadera", "hip thrust", "puente", "bridge", "abducción"]
  },
  {
    key: "upperPush",
    label: "Empuje superior",
    keywords: ["press", "bench", "banca", "push", "empuje", "flexión", "fondos", "hombro"]
  },
  {
    key: "upperPull",
    label: "Tirón superior",
    keywords: ["pull", "row", "remo", "dominada", "chin", "jalón", "tirón", "tracción"]
  },
  {
    key: "core",
    label: "Core",
    keywords: ["core", "plank", "plancha", "dead bug", "bird dog", "pallof", "anti", "carry"]
  }
];

function getExerciseText(exercise: FatigueZoneExercise) {
  const libraryExercise = exercise.exerciseId ? getExerciseById(exercise.exerciseId) : null;
  return [
    exercise.exerciseName,
    exercise.name,
    libraryExercise?.name,
    libraryExercise?.pattern,
    exercise.block,
    exercise.section
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSessionExercises(session: FatigueZoneSession) {
  return session.performedExercises?.length ? session.performedExercises : session.plannedExercises ?? [];
}

function getZoneLevel(score: number, maxScore: number): FatigueZoneLevel {
  if (score <= 0 || maxScore <= 0) return "low";
  const ratio = score / maxScore;
  if (ratio >= 0.67) return "high";
  if (ratio >= 0.34) return "moderate";
  return "low";
}

export function calculateFatigueZones(sessions: FatigueZoneSession[]): FatigueZoneResult[] {
  const scores = Object.fromEntries(fatigueZones.map((zone) => [zone.key, 0])) as Record<string, number>;

  sessions.forEach((session) => {
    getSessionExercises(session).forEach((exercise) => {
      const text = getExerciseText(exercise);
      fatigueZones.forEach((zone) => {
        if (zone.keywords.some((keyword) => text.includes(keyword))) {
          scores[zone.key] += 1;
        }
      });
    });
  });

  const maxScore = Math.max(0, ...Object.values(scores));
  if (maxScore <= 0) return [];

  return fatigueZones.map((zone) => ({
    key: zone.key,
    label: zone.label,
    level: getZoneLevel(scores[zone.key] ?? 0, maxScore),
    score: scores[zone.key] ?? 0
  }));
}
