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
