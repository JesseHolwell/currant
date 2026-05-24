/**
 * Health domain types — initial sketch.
 *
 * Conventions match apps/cash:
 *   - ISO date strings (YYYY-MM-DD) for calendar dates; full ISO timestamps for moments.
 *   - All measurements stored in canonical units (kg, cm, seconds). UI converts for display.
 *   - IDs are opaque strings (uuid or short id) generated client-side; survive cloud sync.
 *   - Domain types are pure data — no methods, no React, no storage concerns.
 */

// ─── Identity & units ──────────────────────────────────────────────────

export type Id = string;
export type IsoDate = string;       // e.g. "2026-05-24"
export type IsoTimestamp = string;  // e.g. "2026-05-24T18:30:00.000Z"

export type WeightUnit = "kg" | "lb";
export type LengthUnit = "cm" | "in";

// ─── Onboarding profile ────────────────────────────────────────────────

export type Sex = "male" | "female" | "other" | "prefer_not_to_say";

export type GoalKind =
  | "lose_weight"
  | "gain_weight"
  | "build_muscle"
  | "maintain"
  | "improve_endurance"
  | "improve_strength";

export interface HealthGoal {
  id: Id;
  kind: GoalKind;
  /** Free-text detail, e.g. "drop to 78kg by August". */
  notes?: string;
  /** Optional numeric target tied to the goal kind (kg for weight goals, etc.). */
  target?: number;
  targetDate?: IsoDate;
  createdAt: IsoTimestamp;
}

export interface HealthProfile {
  birthDate?: IsoDate;
  sex?: Sex;
  heightCm: number;
  /**
   * Starting weight captured during onboarding. Living weight series lives
   * in WeeklyCheckIn[] — don't read this for "current weight".
   */
  startingWeightKg: number;
  goals: HealthGoal[];
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}

// ─── Weekly check-in ───────────────────────────────────────────────────

/**
 * Limb circumferences. All optional — the user records what they care about.
 * Stored in cm regardless of display unit.
 */
export interface LimbMeasurements {
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftBicepCm?: number;
  rightBicepCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
}

export interface WeeklyCheckIn {
  id: Id;
  date: IsoDate;
  weightKg: number;
  measurements?: LimbMeasurements;
  notes?: string;
  createdAt: IsoTimestamp;
}

// ─── Workout session ───────────────────────────────────────────────────

/**
 * A single performed set: how many reps at what weight.
 *
 * Why store reps + weight per set rather than a single rep range:
 *   - Real sets drift (10/8/6 to failure). Capturing each set lets us graph
 *     volume (sets × reps × weight) and one-rep-max estimates accurately.
 *   - The trajectory app's AI layer wants per-set granularity to spot
 *     plateau / overreach patterns.
 *
 * Bodyweight or assisted variants: weightKg can be 0 (bodyweight) or
 * negative (assisted, e.g. -20kg on assisted pull-ups). UI shows accordingly.
 */
export interface ExerciseSet {
  reps: number;
  weightKg: number;
  /** Optional per-set notes — RPE, tempo, failure flag. */
  rpe?: number;
  toFailure?: boolean;
}

/**
 * A "performed exercise" within a session — points at a canonical Exercise
 * by id and holds the actual sets done. Catalog stays separate so renaming
 * "Bench Press" → "Barbell Bench Press" doesn't rewrite history.
 */
export interface PerformedExercise {
  id: Id;
  exerciseId: Id;
  /** Sets in the order they were performed. */
  sets: ExerciseSet[];
  notes?: string;
}

/**
 * Canonical exercise definition. Lives in a user-editable catalog so the
 * "add exercise" flow stays fast — pick from recent / favourites, or add new.
 */
export type ExerciseCategory =
  | "push"
  | "pull"
  | "legs"
  | "core"
  | "cardio"
  | "mobility"
  | "other";

export interface Exercise {
  id: Id;
  name: string;
  category: ExerciseCategory;
  /** Primary equipment — informs the input UI (barbell shows plate math, etc.). */
  equipment?: "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "kettlebell" | "other";
  /** Soft-delete: hide from picker but keep history intact. */
  archived?: boolean;
  createdAt: IsoTimestamp;
}

export interface WorkoutSession {
  id: Id;
  /** When the session was performed (local date). */
  date: IsoDate;
  /** Optional name — "Push A", "Leg day", or left blank. */
  name?: string;
  startedAt?: IsoTimestamp;
  endedAt?: IsoTimestamp;
  exercises: PerformedExercise[];
  notes?: string;
  createdAt: IsoTimestamp;
}

// ─── Top-level state shape (informs the eventual Zustand stores) ───────

export interface HealthState {
  profile: HealthProfile | null;
  checkIns: WeeklyCheckIn[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
}
