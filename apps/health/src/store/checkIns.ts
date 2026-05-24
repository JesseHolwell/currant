import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LimbMeasurements, WeeklyCheckIn } from "../domain/types";
import { newId, nowIso } from "../domain/utils";
import { HEALTH_CHECKINS_KEY } from "../domain/constants";

interface CheckInsState {
  checkIns: WeeklyCheckIn[];

  addCheckIn: (input: {
    date: string;
    weightKg: number;
    measurements?: LimbMeasurements;
    notes?: string;
  }) => void;

  updateCheckIn: (id: string, patch: Partial<Omit<WeeklyCheckIn, "id" | "createdAt">>) => void;
  removeCheckIn: (id: string) => void;
  clearAll: () => void;
}

export const useCheckInsStore = create<CheckInsState>()(
  persist(
    (set) => ({
      checkIns: [],

      addCheckIn: ({ date, weightKg, measurements, notes }) => {
        const entry: WeeklyCheckIn = {
          id: newId(),
          date,
          weightKg,
          measurements,
          notes,
          createdAt: nowIso()
        };
        set((state) => ({
          checkIns: insertSortedByDate([...state.checkIns, entry])
        }));
      },

      updateCheckIn: (id, patch) => {
        set((state) => ({
          checkIns: insertSortedByDate(
            state.checkIns.map((c) => (c.id === id ? { ...c, ...patch } : c))
          )
        }));
      },

      removeCheckIn: (id) => {
        set((state) => ({
          checkIns: state.checkIns.filter((c) => c.id !== id)
        }));
      },

      clearAll: () => {
        set({ checkIns: [] });
      }
    }),
    {
      name: HEALTH_CHECKINS_KEY,
      partialize: (state) => ({ checkIns: state.checkIns })
    }
  )
);

/** Newest first. Stable sort by date desc, ties broken by createdAt desc. */
function insertSortedByDate(list: WeeklyCheckIn[]): WeeklyCheckIn[] {
  return [...list].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/** Convenience selector for the most-recent check-in (newest by date). */
export function selectLatestCheckIn(state: CheckInsState): WeeklyCheckIn | null {
  return state.checkIns[0] ?? null;
}
