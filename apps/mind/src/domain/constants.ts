export const MIND_TASKS_KEY = "mind_tasks";
export const MIND_LOGS_KEY = "mind_logs";

/**
 * Seed tasks shown on a fresh install. The user can delete or rename any
 * of them. Picked to be broad — covers physical, mental, and life buckets.
 */
export const SEED_TASKS: Array<{ name: string; emoji: string }> = [
  { name: "Meditated", emoji: "🧘" },
  { name: "Hit nutrition goal", emoji: "🥗" },
  { name: "Went to gym", emoji: "💪" },
  { name: "Did yoga", emoji: "🤸" },
  { name: "Read for an hour", emoji: "📖" }
];
