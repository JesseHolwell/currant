/**
 * Cross-app data reader for the Life dashboard.
 *
 * The shell is the only component that reads other verticals' localStorage
 * directly — every other read goes through that vertical's own store. By
 * isolating this knowledge here we limit the blast radius if a vertical
 * changes its persistence shape.
 *
 * Defensive on purpose: every read is `try/catch`'d and falls back to a
 * null/empty summary so a corrupt key in one vertical never blanks out the
 * whole dashboard.
 */

// ─── Storage keys (must mirror each vertical's constants) ─────────────

const CASH_ACCOUNT_ENTRIES_KEY = "personal-spend-account-entries-v1";
const CASH_TRANSACTION_BATCHES_KEY = "personal-spend-transaction-batches-v1";

const HEALTH_PROFILE_KEY = "health_profile";
const HEALTH_CHECKINS_KEY = "health_checkins";

const MIND_TASKS_KEY = "mind_tasks";
const MIND_LOGS_KEY = "mind_logs";

// ─── Summaries ─────────────────────────────────────────────────────────

export interface CashSummary {
  hasData: boolean;
  /** Net worth in dollars (assets − liabilities) from latest account snapshot. */
  netWorth: number | null;
  /** Number of transactions across all imported batches. */
  transactionCount: number;
  /** ISO timestamp of most recent import. */
  lastImportedAt: string | null;
}

export interface HealthSummary {
  onboarded: boolean;
  currentWeightKg: number | null;
  startingWeightKg: number | null;
  checkInCount: number;
  /** ISO date of most recent check-in. */
  lastCheckInDate: string | null;
  /** Days since last check-in (or since profile created if no check-ins). */
  daysSinceLastCheckIn: number | null;
}

export interface MindSummary {
  hasData: boolean;
  taskCount: number;
  /** Today's log if it exists. */
  loggedToday: boolean;
  /** Average mood (1-5) over last 30 days, or null. */
  avgMood: number | null;
  /** Days logged in the last 30. */
  daysLoggedLast30: number;
  /** Current streak — consecutive days with a log, ending today or yesterday. */
  streak: number;
}

export interface SuiteSummary {
  cash: CashSummary;
  health: HealthSummary;
  mind: MindSummary;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetweenDates(a: string, b: string): number {
  const dA = new Date(`${a}T00:00:00`);
  const dB = new Date(`${b}T00:00:00`);
  return Math.round((dA.getTime() - dB.getTime()) / 86_400_000);
}

// ─── Cash ──────────────────────────────────────────────────────────────

interface AccountEntryShape {
  kind: "asset" | "liability";
  value: number;
}

interface TransactionBatchShape {
  importedAt: string;
  transactionCount: number;
}

function readCashSummary(): CashSummary {
  const entries = readJson<AccountEntryShape[]>(CASH_ACCOUNT_ENTRIES_KEY);
  const batchesStored = readJson<{ state?: { batches?: TransactionBatchShape[] } }>(
    CASH_TRANSACTION_BATCHES_KEY
  );
  const batches: TransactionBatchShape[] = batchesStored?.state?.batches ?? [];

  let netWorth: number | null = null;
  if (Array.isArray(entries) && entries.length > 0) {
    netWorth = entries.reduce((acc, e) => {
      if (!e || typeof e.value !== "number") return acc;
      const signed = e.kind === "liability" ? -e.value : e.value;
      return acc + signed;
    }, 0);
  }

  const transactionCount = batches.reduce(
    (sum, b) => sum + (typeof b.transactionCount === "number" ? b.transactionCount : 0),
    0
  );

  const lastImportedAt = batches
    .map((b) => b.importedAt)
    .filter((t): t is string => typeof t === "string")
    .sort()
    .pop() ?? null;

  return {
    hasData: (entries?.length ?? 0) > 0 || batches.length > 0,
    netWorth,
    transactionCount,
    lastImportedAt
  };
}

// ─── Health ────────────────────────────────────────────────────────────

interface HealthProfileShape {
  state?: {
    profile?: {
      startingWeightKg?: number;
      heightCm?: number;
      createdAt?: string;
    } | null;
  };
}

interface HealthCheckInShape {
  date: string;
  weightKg: number;
}

interface HealthCheckInsStored {
  state?: {
    checkIns?: HealthCheckInShape[];
  };
}

function readHealthSummary(): HealthSummary {
  const profileStored = readJson<HealthProfileShape>(HEALTH_PROFILE_KEY);
  const profile = profileStored?.state?.profile ?? null;

  const checkInsStored = readJson<HealthCheckInsStored>(HEALTH_CHECKINS_KEY);
  const checkIns = (checkInsStored?.state?.checkIns ?? []) as HealthCheckInShape[];

  if (!profile) {
    return {
      onboarded: false,
      currentWeightKg: null,
      startingWeightKg: null,
      checkInCount: 0,
      lastCheckInDate: null,
      daysSinceLastCheckIn: null
    };
  }

  const startingWeightKg = profile.startingWeightKg ?? null;

  // checkIns are stored newest-first; defensively re-find the most recent.
  const sortedByDateDesc = [...checkIns].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = sortedByDateDesc[0] ?? null;

  const today = todayIso();
  let daysSinceLastCheckIn: number | null = null;
  if (latest) {
    daysSinceLastCheckIn = daysBetweenDates(today, latest.date);
  } else if (profile.createdAt) {
    const created = profile.createdAt.slice(0, 10);
    daysSinceLastCheckIn = daysBetweenDates(today, created);
  }

  return {
    onboarded: true,
    currentWeightKg: latest?.weightKg ?? startingWeightKg,
    startingWeightKg,
    checkInCount: checkIns.length,
    lastCheckInDate: latest?.date ?? null,
    daysSinceLastCheckIn
  };
}

// ─── Mind ──────────────────────────────────────────────────────────────

interface MindTaskShape {
  id: string;
  archived?: boolean;
}

interface MindLogShape {
  date: string;
  completedTaskIds: string[];
  mood?: number;
}

interface MindTasksStored {
  state?: { tasks?: MindTaskShape[] };
}

interface MindLogsStored {
  state?: { logs?: MindLogShape[] };
}

function readMindSummary(): MindSummary {
  const tasksStored = readJson<MindTasksStored>(MIND_TASKS_KEY);
  const logsStored = readJson<MindLogsStored>(MIND_LOGS_KEY);

  const tasks = (tasksStored?.state?.tasks ?? []).filter((t) => !t.archived);
  const logs = logsStored?.state?.logs ?? [];

  const today = todayIso();
  const loggedToday = logs.some((l) => l.date === today);

  // Window: last 30 days inclusive.
  const earliestIncluded = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const recent = logs.filter((l) => l.date >= earliestIncluded && l.date <= today);

  const moods = recent.map((l) => l.mood).filter((m): m is number => typeof m === "number");
  const avgMood = moods.length === 0 ? null : moods.reduce((a, b) => a + b, 0) / moods.length;

  // Streak: walk backwards from today.
  const loggedDateSet = new Set(logs.map((l) => l.date));
  let streak = 0;
  let cursor = new Date();
  // Allow streak to start at today OR yesterday (so we don't reset before the
  // user's first log of the day).
  if (!loggedDateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    if (loggedDateSet.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    // hasData = "actively used", not "seeds exist". Tasks ship pre-populated,
    // so logs.length is the honest signal.
    hasData: logs.length > 0,
    taskCount: tasks.length,
    loggedToday,
    avgMood,
    daysLoggedLast30: recent.length,
    streak
  };
}

// ─── Public API ────────────────────────────────────────────────────────

export function readSuiteSummary(): SuiteSummary {
  return {
    cash: readCashSummary(),
    health: readHealthSummary(),
    mind: readMindSummary()
  };
}
