/**
 * Currant Mind domain — a minimum task-tracker + mood log.
 *
 * Intentionally plain. The goal at this stage is to prove the suite's
 * architecture absorbs a new vertical quickly, not to build a sophisticated
 * habits product. Iterate later.
 *
 * Conventions match the rest of the suite:
 *   - ISO date strings (YYYY-MM-DD) for calendar dates.
 *   - Full ISO timestamps for moments (created/updated).
 *   - Client-side ids that survive cloud sync.
 *   - Pure data — no methods, no React, no storage concerns.
 */

export type Id = string;
export type IsoDate = string;
export type IsoTimestamp = string;

/** Mood is 1 (worst) to 5 (best). Single integer keeps the input dead simple. */
export type Mood = 1 | 2 | 3 | 4 | 5;

/**
 * A user-defined trackable item — "Meditated", "Went to gym", "1hr reading".
 * Stored separately from the daily logs so renaming or adding an emoji
 * doesn't rewrite history.
 */
export interface MindTask {
  id: Id;
  /** Display name. */
  name: string;
  /** Optional single-glyph emoji for the row. Keeps the checklist visual. */
  emoji?: string;
  /** Soft-delete: hide from the daily checklist but keep history readable. */
  archived?: boolean;
  /** Stable insertion order; surfaces respect this. */
  order: number;
  createdAt: IsoTimestamp;
}

/**
 * One day's log. Keyed by `date` (YYYY-MM-DD) so there's exactly one per
 * calendar day. Editing a log replaces fields in place; we don't keep a
 * revision history.
 */
export interface MindDayLog {
  date: IsoDate;
  /** Task ids the user ticked off for this day. */
  completedTaskIds: Id[];
  /** Optional mood score for the day. */
  mood?: Mood;
  /** Optional free-text reflection. */
  notes?: string;
  updatedAt: IsoTimestamp;
}

export interface MindState {
  tasks: MindTask[];
  logs: MindDayLog[];
}
