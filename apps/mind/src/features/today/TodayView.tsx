import { useEffect, useMemo, useState } from "react";
import type { Mood } from "../../domain/types";
import { todayIso } from "../../domain/utils";
import { useTasksStore } from "../../store/tasks";
import { useLogsStore } from "../../store/logs";

/*
 * Daily input surface for Currant Mind.
 *
 * The whole point is low friction: open the app, set mood, tap tasks off,
 * close the app. Total interaction should be under 10 seconds on a phone.
 *
 * State persistence happens automatically through the stores' Zustand
 * persist middleware — every interaction writes to localStorage.
 */

const MOOD_OPTIONS: Array<{ value: Mood; emoji: string; label: string }> = [
  { value: 1, emoji: "😣", label: "Awful" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" }
];

export function TodayView() {
  const date = todayIso();
  const allTasks = useTasksStore((s) => s.tasks);
  const tasks = useMemo(
    () => allTasks.filter((t) => !t.archived).sort((a, b) => a.order - b.order),
    [allTasks]
  );
  const logs = useLogsStore((s) => s.logs);
  const log = useMemo(() => logs.find((l) => l.date === date) ?? null, [logs, date]);
  const toggleTask = useLogsStore((s) => s.toggleTask);
  const setMood = useLogsStore((s) => s.setMood);
  const setNotes = useLogsStore((s) => s.setNotes);

  // Local draft for notes so typing doesn't fight the store on every keystroke.
  const [notesDraft, setNotesDraft] = useState(log?.notes ?? "");

  useEffect(() => {
    setNotesDraft(log?.notes ?? "");
  }, [log?.date]);

  const completedSet = new Set(log?.completedTaskIds ?? []);
  const completed = completedSet.size;
  const total = tasks.length;

  function flushNotes() {
    if ((log?.notes ?? "") !== notesDraft) {
      setNotes(date, notesDraft);
    }
  }

  return (
    <div className="space-y-8">
      <Header date={date} completed={completed} total={total} />

      <MoodPicker value={log?.mood} onChange={(m) => setMood(date, m)} />

      <TaskList
        tasks={tasks}
        completedIds={completedSet}
        onToggle={(taskId) => toggleTask(date, taskId)}
      />

      <NotesField
        value={notesDraft}
        onChange={setNotesDraft}
        onBlur={flushNotes}
      />
    </div>
  );
}

function Header({ date, completed, total }: { date: string; completed: number; total: number }) {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{formatLong(date)}</p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Today</h1>
        {total > 0 && (
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">
              {completed}/{total}
            </span>{" "}
            tasks
          </p>
        )}
      </div>
    </header>
  );
}

function MoodPicker({
  value,
  onChange
}: {
  value: Mood | undefined;
  onChange: (mood: Mood | undefined) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-ink">How are you feeling?</h2>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {MOOD_OPTIONS.map((m) => {
          const isSelected = value === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(isSelected ? undefined : m.value)}
              className={
                "flex flex-col items-center gap-1 rounded-xl border py-3 transition " +
                (isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-accent/40")
              }
              aria-pressed={isSelected}
            >
              <span className="text-2xl" aria-hidden>
                {m.emoji}
              </span>
              <span
                className={
                  "text-[11px] font-medium " + (isSelected ? "text-accent" : "text-muted")
                }
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TaskList({
  tasks,
  completedIds,
  onToggle
}: {
  tasks: Array<{ id: string; name: string; emoji?: string }>;
  completedIds: Set<string>;
  onToggle: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-line p-6 text-center">
        <p className="text-sm text-muted">
          No tasks yet. Add a few in the Tasks tab to get started.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-ink">Did you…</h2>
      <ul className="mt-3 space-y-2">
        {tasks.map((t) => {
          const isDone = completedIds.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                aria-pressed={isDone}
                className={
                  "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition " +
                  (isDone
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface hover:border-accent/40")
                }
              >
                <span className="flex items-center gap-3">
                  {t.emoji && (
                    <span className="text-xl" aria-hidden>
                      {t.emoji}
                    </span>
                  )}
                  <span
                    className={
                      "text-base font-medium " + (isDone ? "text-ink" : "text-ink")
                    }
                  >
                    {t.name}
                  </span>
                </span>
                <CheckMark done={isDone} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CheckMark({ done }: { done: boolean }) {
  return (
    <span
      className={
        "flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition " +
        (done ? "border-accent bg-accent text-white" : "border-line bg-transparent")
      }
      aria-hidden
    >
      {done && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2.5 7.5L5.5 10.5L11.5 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function NotesField({
  value,
  onChange,
  onBlur
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <section>
      <label className="block">
        <span className="text-sm font-medium text-ink">
          Notes <span className="text-muted">(optional)</span>
        </span>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Anything worth remembering about today."
          className="mt-2 block w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
        />
      </label>
    </section>
  );
}

function formatLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}
