import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MindDayLog, Mood } from "../domain/types";
import { nowIso } from "../domain/utils";
import { MIND_LOGS_KEY } from "../domain/constants";

interface LogsState {
  logs: MindDayLog[];

  /** Toggle a task on/off for the given day. Creates the day log if needed. */
  toggleTask: (date: string, taskId: string) => void;

  setMood: (date: string, mood: Mood | undefined) => void;
  setNotes: (date: string, notes: string) => void;

  removeLog: (date: string) => void;
  clearAll: () => void;
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set) => ({
      logs: [],

      toggleTask: (date, taskId) => {
        set((state) => {
          const existing = state.logs.find((l) => l.date === date);
          if (!existing) {
            const newLog: MindDayLog = {
              date,
              completedTaskIds: [taskId],
              updatedAt: nowIso()
            };
            return { logs: insertSortedByDate([...state.logs, newLog]) };
          }
          const has = existing.completedTaskIds.includes(taskId);
          const nextIds = has
            ? existing.completedTaskIds.filter((id) => id !== taskId)
            : [...existing.completedTaskIds, taskId];
          return {
            logs: state.logs.map((l) =>
              l.date === date ? { ...l, completedTaskIds: nextIds, updatedAt: nowIso() } : l
            )
          };
        });
      },

      setMood: (date, mood) => {
        set((state) => {
          const existing = state.logs.find((l) => l.date === date);
          if (!existing) {
            const newLog: MindDayLog = {
              date,
              completedTaskIds: [],
              mood,
              updatedAt: nowIso()
            };
            return { logs: insertSortedByDate([...state.logs, newLog]) };
          }
          return {
            logs: state.logs.map((l) =>
              l.date === date ? { ...l, mood, updatedAt: nowIso() } : l
            )
          };
        });
      },

      setNotes: (date, notes) => {
        set((state) => {
          const trimmed = notes.trim();
          const value = trimmed === "" ? undefined : trimmed;
          const existing = state.logs.find((l) => l.date === date);
          if (!existing) {
            const newLog: MindDayLog = {
              date,
              completedTaskIds: [],
              notes: value,
              updatedAt: nowIso()
            };
            return { logs: insertSortedByDate([...state.logs, newLog]) };
          }
          return {
            logs: state.logs.map((l) =>
              l.date === date ? { ...l, notes: value, updatedAt: nowIso() } : l
            )
          };
        });
      },

      removeLog: (date) => {
        set((state) => ({ logs: state.logs.filter((l) => l.date !== date) }));
      },

      clearAll: () => set({ logs: [] })
    }),
    {
      name: MIND_LOGS_KEY,
      partialize: (state) => ({ logs: state.logs })
    }
  )
);

/** Newest first. */
function insertSortedByDate(list: MindDayLog[]): MindDayLog[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

