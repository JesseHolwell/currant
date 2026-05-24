import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MindTask } from "../domain/types";
import { newId, nowIso } from "../domain/utils";
import { MIND_TASKS_KEY, SEED_TASKS } from "../domain/constants";

interface TasksState {
  tasks: MindTask[];

  addTask: (input: { name: string; emoji?: string }) => void;
  updateTask: (id: string, patch: Partial<Pick<MindTask, "name" | "emoji" | "archived" | "order">>) => void;
  removeTask: (id: string) => void;
  reorder: (orderedIds: string[]) => void;

  /** Wipe everything. Reset back to seeds. */
  reset: () => void;
}

function makeSeedTasks(): MindTask[] {
  const ts = nowIso();
  return SEED_TASKS.map((s, i) => ({
    id: newId(),
    name: s.name,
    emoji: s.emoji,
    order: i,
    createdAt: ts
  }));
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: makeSeedTasks(),

      addTask: ({ name, emoji }) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const tasks = get().tasks;
        const nextOrder = tasks.length === 0 ? 0 : Math.max(...tasks.map((t) => t.order)) + 1;
        set({
          tasks: [
            ...tasks,
            {
              id: newId(),
              name: trimmed,
              emoji: emoji?.trim() || undefined,
              order: nextOrder,
              createdAt: nowIso()
            }
          ]
        });
      },

      updateTask: (id, patch) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }));
      },

      reorder: (orderedIds) => {
        set((state) => {
          const byId = new Map(state.tasks.map((t) => [t.id, t]));
          const reordered: MindTask[] = [];
          orderedIds.forEach((id, i) => {
            const t = byId.get(id);
            if (t) reordered.push({ ...t, order: i });
          });
          // Append any tasks that weren't in orderedIds (defensive).
          state.tasks.forEach((t) => {
            if (!orderedIds.includes(t.id)) reordered.push(t);
          });
          return { tasks: reordered };
        });
      },

      reset: () => {
        set({ tasks: makeSeedTasks() });
      }
    }),
    {
      name: MIND_TASKS_KEY,
      partialize: (state) => ({ tasks: state.tasks })
    }
  )
);

