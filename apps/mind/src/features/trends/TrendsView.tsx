import { useMemo } from "react";
import type { MindDayLog, MindTask, Mood } from "../../domain/types";
import { addDaysIso, todayIso } from "../../domain/utils";
import { useTasksStore } from "../../store/tasks";
import { useLogsStore } from "../../store/logs";

/*
 * Trends — the output. Stays deliberately plain at this stage:
 *   - Summary stats (avg mood, days logged in last 30)
 *   - 30-day completion heatmap
 *   - Per-task completion rate
 *
 * No charting library yet. Drop one in (Recharts, already used by Cash)
 * when the trends grow beyond what HTML+CSS can express clearly.
 */

const WINDOW_DAYS = 30;

export function TrendsView() {
  const allTasks = useTasksStore((s) => s.tasks);
  const tasks = useMemo(
    () => allTasks.filter((t) => !t.archived).sort((a, b) => a.order - b.order),
    [allTasks]
  );
  const logs = useLogsStore((s) => s.logs);

  const window30 = useMemo(() => buildWindow(WINDOW_DAYS, logs), [logs]);
  const stats = useMemo(() => summarise(window30, tasks.length), [window30, tasks.length]);
  const perTask = useMemo(() => perTaskRates(tasks, window30), [tasks, window30]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Trends</h1>
        <p className="mt-2 text-sm text-muted">Last {WINDOW_DAYS} days.</p>
      </header>

      <SummaryGrid stats={stats} />

      <section>
        <h2 className="text-sm font-medium text-ink">Daily completion</h2>
        <p className="mt-1 text-xs text-muted">
          Each square is one day. Darker = more tasks done. Today is on the right.
        </p>
        <Heatmap days={window30} totalTasks={tasks.length} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink">Per-task completion rate</h2>
        {perTask.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
            No tasks yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {perTask.map((row) => (
              <li
                key={row.task.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
              >
                {row.task.emoji && (
                  <span className="text-lg" aria-hidden>
                    {row.task.emoji}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{row.task.name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-[width]"
                      style={{ width: `${row.rate * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm tabular-nums">
                  <p className="font-semibold text-ink">{Math.round(row.rate * 100)}%</p>
                  <p className="text-xs text-muted">
                    {row.completedDays}/{row.totalDays}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryGrid({ stats }: { stats: Summary }) {
  return (
    <section className="grid grid-cols-3 gap-3">
      <Stat label="Days logged" value={`${stats.daysLogged}`} hint={`of ${WINDOW_DAYS}`} />
      <Stat label="Avg mood" value={stats.avgMood !== null ? stats.avgMood.toFixed(1) : "—"} hint="out of 5" />
      <Stat
        label="Completion"
        value={`${Math.round(stats.avgCompletion * 100)}%`}
        hint="of tasks done"
      />
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </div>
  );
}

function Heatmap({ days, totalTasks }: { days: DayWindow[]; totalTasks: number }) {
  return (
    <div className="mt-3 grid grid-cols-15 gap-1.5 sm:grid-cols-30" style={{ gridTemplateColumns: `repeat(${WINDOW_DAYS}, minmax(0, 1fr))` }}>
      {days.map((d) => {
        const intensity = totalTasks === 0 ? 0 : (d.completedCount ?? 0) / totalTasks;
        return (
          <span
            key={d.date}
            title={`${formatShort(d.date)}: ${d.completedCount ?? 0}/${totalTasks}${d.mood ? ` · mood ${d.mood}` : ""}`}
            className="block h-6 rounded-sm transition"
            style={{
              backgroundColor:
                d.log === null
                  ? "var(--line)"
                  : intensityColor(intensity)
            }}
          />
        );
      })}
    </div>
  );
}

interface DayWindow {
  date: string;
  log: MindDayLog | null;
  completedCount: number | null;
  mood: Mood | undefined;
}

interface Summary {
  daysLogged: number;
  avgMood: number | null;
  avgCompletion: number;
}

interface PerTaskRow {
  task: MindTask;
  completedDays: number;
  totalDays: number;
  rate: number;
}

function buildWindow(windowDays: number, logs: MindDayLog[]): DayWindow[] {
  const start = addDaysIso(todayIso(), -(windowDays - 1));
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const out: DayWindow[] = [];
  for (let i = 0; i < windowDays; i += 1) {
    const date = addDaysIso(start, i);
    const log = byDate.get(date) ?? null;
    out.push({
      date,
      log,
      completedCount: log ? log.completedTaskIds.length : null,
      mood: log?.mood
    });
  }
  return out;
}

function summarise(days: DayWindow[], totalTasks: number): Summary {
  let logged = 0;
  let moodSum = 0;
  let moodCount = 0;
  let completionSum = 0;
  for (const d of days) {
    if (d.log) {
      logged += 1;
      if (d.mood !== undefined) {
        moodSum += d.mood;
        moodCount += 1;
      }
      if (totalTasks > 0) {
        completionSum += (d.completedCount ?? 0) / totalTasks;
      }
    }
  }
  return {
    daysLogged: logged,
    avgMood: moodCount === 0 ? null : moodSum / moodCount,
    avgCompletion: logged === 0 ? 0 : completionSum / logged
  };
}

function perTaskRates(tasks: MindTask[], days: DayWindow[]): PerTaskRow[] {
  const loggedDays = days.filter((d) => d.log !== null);
  return tasks.map((task) => {
    const completedDays = loggedDays.filter((d) => d.log!.completedTaskIds.includes(task.id)).length;
    return {
      task,
      completedDays,
      totalDays: loggedDays.length,
      rate: loggedDays.length === 0 ? 0 : completedDays / loggedDays.length
    };
  });
}

function intensityColor(intensity: number): string {
  // Map [0, 1] → alpha [0.08, 0.95] over the accent color.
  const clamped = Math.min(1, Math.max(0, intensity));
  const alpha = 0.08 + clamped * 0.87;
  return `color-mix(in srgb, var(--accent) ${Math.round(alpha * 100)}%, var(--bg-surface))`;
}

function formatShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}
