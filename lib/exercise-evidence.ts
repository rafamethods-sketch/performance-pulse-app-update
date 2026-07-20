export type MuscleEvidenceLevel = "A" | "B" | "C" | "D";

export type MuscleEvidenceType =
  | "direct_emg"
  | "similar_variant_emg"
  | "systematic_review"
  | "biomechanical_inference"
  | "coach_estimate";

export type MuscleRole = "primary" | "secondary" | "stabilizer";

export type MuscleEvidenceEntry = {
  muscle: string;
  weight: number;
  role: MuscleRole;
  evidenceLevel: MuscleEvidenceLevel;
  evidenceType: MuscleEvidenceType;
  sources?: string[];
  notes?: string;
};

export type ExerciseEvidenceProfile = {
  exerciseId: string;
  profileVersion: string;
  muscleWeights: MuscleEvidenceEntry[];
  summary?: string;
  limitations?: string;
  updatedAt: string;
};

export type ExerciseEvidenceValidationResult = {
  isValid: boolean;
  warnings: string[];
};

const evidenceLevels: MuscleEvidenceLevel[] = ["A", "B", "C", "D"];
const evidenceTypes: MuscleEvidenceType[] = [
  "direct_emg",
  "similar_variant_emg",
  "systematic_review",
  "biomechanical_inference",
  "coach_estimate"
];
const muscleRoles: MuscleRole[] = ["primary", "secondary", "stabilizer"];

// EMG can help document local muscle involvement, but it is not a direct fatigue measure.
// The final muscle-load estimate should still combine exercise involvement with session data
// such as sets, reps, RPE/RIR and the athlete's performed work. This layer only prepares a
// more traceable source for muscle weights; it does not replace the current fatigueMap yet.
export function exerciseEvidenceToFatigueMap(profile: ExerciseEvidenceProfile): Record<string, number> {
  return profile.muscleWeights.reduce<Record<string, number>>((fatigueMap, entry) => {
    if (!entry.muscle.trim()) return fatigueMap;
    fatigueMap[entry.muscle] = entry.weight;
    return fatigueMap;
  }, {});
}

export function validateExerciseEvidenceProfile(profile: ExerciseEvidenceProfile): ExerciseEvidenceValidationResult {
  const warnings: string[] = [];

  if (!profile.exerciseId.trim()) warnings.push("exerciseId is required.");
  if (!profile.profileVersion.trim()) warnings.push("profileVersion is required.");
  if (!profile.updatedAt.trim()) warnings.push("updatedAt is required.");
  if (!Array.isArray(profile.muscleWeights) || profile.muscleWeights.length === 0) {
    warnings.push("At least one muscle weight entry is recommended.");
  }

  const hasPrimaryMuscle = profile.muscleWeights.some((entry) => entry.role === "primary");
  if (profile.muscleWeights.length > 0 && !hasPrimaryMuscle) {
    warnings.push("At least one primary muscle is required when a profile has muscle weights.");
  }

  profile.muscleWeights.forEach((entry, index) => {
    const label = entry.muscle || `entry ${index + 1}`;

    if (!entry.muscle.trim()) warnings.push(`${label}: muscle is required.`);
    if (!Number.isFinite(entry.weight) || entry.weight < 0 || entry.weight > 1) {
      warnings.push(`${label}: weight must be between 0 and 1.`);
    }
    if (!muscleRoles.includes(entry.role)) warnings.push(`${label}: role must be primary, secondary or stabilizer.`);
    if (!evidenceLevels.includes(entry.evidenceLevel)) warnings.push(`${label}: evidenceLevel must be A, B, C or D.`);
    if (!evidenceTypes.includes(entry.evidenceType)) warnings.push(`${label}: evidenceType is not recognized.`);
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

export const EXERCISE_EVIDENCE_PMID_REFERENCES = {
  benchPressInclinations: ["PMID:33049982"],
  coreExercises: ["PMID:32560185"],
  deadliftVariants: ["PMID:32107499", "PMID:28151780"],
  hipThrustDeadliftHexBar: ["PMID:28151780"],
  invertedRow: ["PMID:26422610"],
  pullUpChinUp: ["PMID:21068680", "PMID:24245055"],
  squatVariants: ["PMID:35063016"]
} as const;

export const EXAMPLE_EVIDENCE_PROFILES: ExerciseEvidenceProfile[] = [
  {
    exerciseId: "bench-press",
    profileVersion: "evidence-v0.1",
    summary: "Pilot profile for horizontal pressing patterns.",
    limitations: "Weights are prepared for migration and should be checked against the exact exercise variant before replacing fatigueMap.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "chest",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.benchPressInclinations],
        notes: "Bench press and incline variants show strong pectoral involvement; exact angle and grip can shift emphasis."
      },
      {
        muscle: "triceps",
        weight: 0.75,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.benchPressInclinations]
      },
      {
        muscle: "anteriorDelts",
        weight: 0.65,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.benchPressInclinations]
      }
    ]
  },
  {
    exerciseId: "deadlift",
    profileVersion: "evidence-v0.1",
    summary: "Pilot profile for conventional deadlift patterns.",
    limitations: "Hip height, stance and bar path can alter muscle contribution substantially.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "glutes",
        weight: 0.9,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.deadliftVariants]
      },
      {
        muscle: "hamstrings",
        weight: 0.85,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.deadliftVariants]
      },
      {
        muscle: "erectors",
        weight: 0.8,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.deadliftVariants]
      },
      {
        muscle: "quads",
        weight: 0.45,
        role: "secondary",
        evidenceLevel: "C",
        evidenceType: "biomechanical_inference"
      }
    ]
  },
  {
    exerciseId: "hip-thrust",
    profileVersion: "evidence-v0.1",
    summary: "Pilot profile for hip thrust patterns.",
    limitations: "Setup, range of motion and pelvic control can change glute and hamstring contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "glutes",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.hipThrustDeadliftHexBar]
      },
      {
        muscle: "hamstrings",
        weight: 0.45,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.hipThrustDeadliftHexBar]
      },
      {
        muscle: "quads",
        weight: 0.25,
        role: "stabilizer",
        evidenceLevel: "C",
        evidenceType: "biomechanical_inference"
      }
    ]
  },
  {
    exerciseId: "pull-up",
    profileVersion: "evidence-v0.1",
    summary: "Pilot profile for vertical pulling patterns.",
    limitations: "Grip width and pronated/supinated position can change lat, biceps and scapular muscle contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "lats",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.pullUpChinUp]
      },
      {
        muscle: "biceps",
        weight: 0.65,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.pullUpChinUp]
      },
      {
        muscle: "upperBack",
        weight: 0.7,
        role: "secondary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.pullUpChinUp]
      }
    ]
  },
  {
    exerciseId: "spanish-squat",
    profileVersion: "evidence-v0.1",
    summary: "Pilot profile for Spanish squat / wall squat type knee-dominant patterns.",
    limitations: "Example profile only; confirm the app exerciseId before using it as an active library profile.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "quads",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants]
      },
      {
        muscle: "glutes",
        weight: 0.35,
        role: "secondary",
        evidenceLevel: "C",
        evidenceType: "biomechanical_inference"
      },
      {
        muscle: "calves",
        weight: 0.2,
        role: "stabilizer",
        evidenceLevel: "C",
        evidenceType: "biomechanical_inference"
      }
    ]
  }
];

// First documented layer for Squat / Vertical Force. These profiles use real exerciseLibrary
// ids from lib/exercises.ts, but they are not connected to the current fatigue calculation yet.
// Weights are orientative and should be refined pattern by pattern as better direct evidence is added.
export const SQUAT_VERTICAL_FORCE_EVIDENCE_PROFILES: ExerciseEvidenceProfile[] = [
  {
    exerciseId: "squat-vertical-force-control-3",
    profileVersion: "evidence-v0.1",
    summary: "Wall sit iso evidence profile for knee-dominant isometric squat work.",
    limitations: "Uses squat / wall squat evidence as a close reference; knee angle and duration can shift local demand.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "quadriceps",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants],
        notes: "High quadriceps demand expected in wall-supported isometric squat positions."
      },
      { muscle: "glutes", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-control-4",
    profileVersion: "evidence-v0.1",
    summary: "Spanish squat evidence profile for knee-dominant squat tolerance work.",
    limitations: "Band setup, tibial angle and depth can change quadriceps and hip contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      {
        muscle: "quadriceps",
        weight: 1,
        role: "primary",
        evidenceLevel: "B",
        evidenceType: "similar_variant_emg",
        sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants]
      },
      { muscle: "glutes", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "core", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-strength-1",
    profileVersion: "evidence-v0.1",
    summary: "Sit to Stand profile for bodyweight squat pattern restoration.",
    limitations: "Chair height, arm assistance and speed can substantially change muscular contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "core", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-strength-2",
    profileVersion: "evidence-v0.1",
    summary: "Goblet squat profile for anterior-loaded squat strength work.",
    limitations: "Load position, torso angle and depth alter trunk and hip contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "spinalErectors", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-strength-4",
    profileVersion: "evidence-v0.1",
    summary: "Front squat profile for anterior-loaded barbell squat work.",
    limitations: "Evidence is transferred from squat variants; thoracic position and depth can shift trunk demand.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "spinalErectors", weight: 0.5, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-strength-5",
    profileVersion: "evidence-v0.1",
    summary: "Back squat profile for loaded bilateral squat work.",
    limitations: "Bar position, stance, depth and torso inclination can change hip and spinal erector contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "B", evidenceType: "similar_variant_emg", sources: [...EXERCISE_EVIDENCE_PMID_REFERENCES.squatVariants] },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "spinalErectors", weight: 0.5, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-hypertrophy-1",
    profileVersion: "evidence-v0.1",
    summary: "Leg press profile for machine-based knee and hip extension.",
    limitations: "Foot position and seat angle can shift emphasis between quadriceps, glutes and adductors.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-hypertrophy-2",
    profileVersion: "evidence-v0.1",
    summary: "Hack squat profile for guided knee-dominant machine squatting.",
    limitations: "Machine geometry and foot placement can change hip involvement.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-hypertrophy-3",
    profileVersion: "evidence-v0.1",
    summary: "Pendulum squat profile for guided squat hypertrophy work.",
    limitations: "Machine path and foot placement may alter hip and knee contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 1, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.5, role: "secondary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.25, role: "stabilizer", evidenceLevel: "C", evidenceType: "biomechanical_inference" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-power-1",
    profileVersion: "evidence-v0.1",
    summary: "Countermovement jump provisional profile for explosive vertical force production.",
    limitations: "Provisional plyometric weighting; jump strategy, countermovement depth and landing mechanics can change demand.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "adductors", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "core", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-power-2",
    profileVersion: "evidence-v0.1",
    summary: "Squat jump provisional profile for concentric vertical jump work.",
    limitations: "Provisional plyometric weighting; start position and intent can alter relative muscle contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "core", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "adductors", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-power-4",
    profileVersion: "evidence-v0.1",
    summary: "Loaded jump squat provisional profile for loaded explosive vertical force.",
    limitations: "Provisional weighting; load, bar position and landing strategy can alter contribution and fatigue.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "C", evidenceType: "biomechanical_inference" },
      { muscle: "calves", weight: 0.5, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "spinalErectors", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "adductors", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-plyometrics-1",
    profileVersion: "evidence-v0.1",
    summary: "Drop landing provisional profile for controlled vertical landing absorption.",
    limitations: "Provisional plyometric weighting; box height, landing depth and stiffness strategy can shift demand.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "glutes", weight: 0.5, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "calves", weight: 0.5, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "adductors", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "core", weight: 0.25, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "hamstrings", weight: 0.25, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-plyometrics-4",
    profileVersion: "evidence-v0.1",
    summary: "Depth jump provisional profile for landing-to-jump reactive vertical force.",
    limitations: "Provisional plyometric weighting; ground contact time and box height strongly affect contribution.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "calves", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "adductors", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "hamstrings", weight: 0.25, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  },
  {
    exerciseId: "squat-vertical-force-plyometrics-5",
    profileVersion: "evidence-v0.1",
    summary: "Drop jump provisional profile for short-contact reactive vertical jumping.",
    limitations: "Provisional plyometric weighting; target contact time and stiffness strategy can change muscle demand.",
    updatedAt: "2026-07-20",
    muscleWeights: [
      { muscle: "calves", weight: 1, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "quadriceps", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "glutes", weight: 0.75, role: "primary", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "adductors", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "core", weight: 0.5, role: "stabilizer", evidenceLevel: "D", evidenceType: "coach_estimate" },
      { muscle: "hamstrings", weight: 0.25, role: "secondary", evidenceLevel: "D", evidenceType: "coach_estimate" }
    ]
  }
];
