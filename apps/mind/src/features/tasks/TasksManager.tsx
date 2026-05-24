import { useMemo, useState } from "react";
import type { MindTask } from "../../domain/types";
import { useTasksStore } from "../../store/tasks";

/*
 * CRUD for the user's task list.
 *
 * Keep this surface plain — most users will tune their list once and
 * forget about it. Inline edit, single emoji + name field, delete with
 * a confirm.
 */

export function TasksManager() {
  const allTasks = useTasksStore((s) => s.tasks);
  const tasks = useMemo(() => [...allTasks].sort((a, b) => a.order - b.order), [allTasks]);
  const addTask = useTasksStore((s) => s.addTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const removeTask = useTasksStore((s) => s.removeTask);

  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  function submit() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addTask({ name: trimmed, emoji: newEmoji.trim() || undefined });
    setNewName("");
    setNewEmoji("");
  }

  function onDelete(t: MindTask) {
    if (confirm(`Delete "${t.name}"? Past check-ins keep their record but new days won't show it.`)) {
      removeTask(t.id);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Tasks</h1>
        <p className="mt-2 text-sm text-muted">
          Anything you want to track daily. Keep the list short — five to seven items is usually
          enough.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-sm font-medium text-ink">Add a task</h2>
        <form
          className="mt-3 flex flex-wrap items-center gap-2 sm:flex-nowrap"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            type="text"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value.slice(0, 2))}
            placeholder="🌱"
            aria-label="Emoji"
            className="w-14 rounded-lg border border-line bg-bg px-3 py-2.5 text-center text-base text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Task name"
            aria-label="Task name"
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium text-ink">Your tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
            No tasks yet. Add one above.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onChange={(patch) => updateTask(t.id, patch)}
                onDelete={() => onDelete(t)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TaskRow({
  task,
  onChange,
  onDelete
}: {
  task: MindTask;
  onChange: (patch: Partial<Pick<MindTask, "name" | "emoji" | "archived">>) => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={
        "flex items-center gap-2 rounded-2xl border bg-surface px-3 py-2 transition " +
        (task.archived ? "border-line opacity-60" : "border-line")
      }
    >
      <input
        type="text"
        value={task.emoji ?? ""}
        onChange={(e) => onChange({ emoji: e.target.value.slice(0, 2) || undefined })}
        aria-label="Emoji"
        className="w-12 rounded-lg border border-transparent bg-transparent px-2 py-2 text-center text-lg text-ink hover:border-line focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />
      <input
        type="text"
        value={task.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm text-ink hover:border-line focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${task.name}`}
        className="rounded-full p-2 text-muted transition hover:bg-accent-soft hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 5h10M6.5 5V3.5h3V5M5 5l.5 8h5L11 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  );
}
