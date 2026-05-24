import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HealthGoal, HealthProfile } from "../domain/types";
import { newId, nowIso } from "../domain/utils";
import { HEALTH_PROFILE_KEY } from "../domain/constants";

interface ProfileState {
  profile: HealthProfile | null;
  /** True only while we're loading from localStorage on first paint. */
  hydrated: boolean;

  /** Create the profile during onboarding. Replaces any existing profile. */
  completeOnboarding: (input: {
    heightCm: number;
    startingWeightKg: number;
    goals: Array<Omit<HealthGoal, "id" | "createdAt">>;
  }) => void;

  /** Patch existing profile fields. No-op if not onboarded. */
  updateProfile: (patch: Partial<Omit<HealthProfile, "goals" | "createdAt" | "updatedAt">>) => void;

  addGoal: (goal: Omit<HealthGoal, "id" | "createdAt">) => void;
  removeGoal: (goalId: string) => void;

  /** Wipe everything — useful for "start over" during testing. */
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      hydrated: false,

      completeOnboarding: ({ heightCm, startingWeightKg, goals }) => {
        const timestamp = nowIso();
        set({
          profile: {
            heightCm,
            startingWeightKg,
            goals: goals.map((g) => ({
              ...g,
              id: newId(),
              createdAt: timestamp
            })),
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      },

      updateProfile: (patch) => {
        const existing = get().profile;
        if (!existing) return;
        set({
          profile: {
            ...existing,
            ...patch,
            updatedAt: nowIso()
          }
        });
      },

      addGoal: (goal) => {
        const existing = get().profile;
        if (!existing) return;
        const newGoal: HealthGoal = {
          ...goal,
          id: newId(),
          createdAt: nowIso()
        };
        set({
          profile: {
            ...existing,
            goals: [...existing.goals, newGoal],
            updatedAt: nowIso()
          }
        });
      },

      removeGoal: (goalId) => {
        const existing = get().profile;
        if (!existing) return;
        set({
          profile: {
            ...existing,
            goals: existing.goals.filter((g) => g.id !== goalId),
            updatedAt: nowIso()
          }
        });
      },

      reset: () => {
        set({ profile: null });
      }
    }),
    {
      name: HEALTH_PROFILE_KEY,
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      }
    }
  )
);
