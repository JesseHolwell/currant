import { useMemo } from "react";
import type { HealthGoal, HealthProfile, WeeklyCheckIn } from "../../domain/types";
import { useCheckInsStore } from "../../store/checkIns";
import { useProfileStore } from "../../store/profile";

/*
 * Signed-in landing surface for Currant Health.
 *
 * Layout:
 *   - Brand + reset (corner)
 *   - Current weight + delta hero
 *   - "Log this week" primary CTA
 *   - Recent check-ins list (or empty state)
 *   - Profile snapshot (height + goals)
 *
 * Surfaces not yet built (workouts, measurements graph) get added as
 * additional sections on this page as they land.
 */

export function Dashboard({ onStartCheckIn }: { onStartCheckIn: () => void }) {
  const profile = useProfileStore((s) => s.profile)!;
  const reset = useProfileStore((s) => s.reset);
  const clearCheckIns = useCheckInsStore((s) => s.clearAll);
  const checkIns = useCheckInsStore((s) => s.checkIns);

  const latest = checkIns[0] ?? null;

  const currentWeightKg = latest?.weightKg ?? profile.startingWeightKg;
  const deltaFromStart = useMemo(
    () => round1(currentWeightKg - profile.startingWeightKg),
    [currentWeightKg, profile.startingWeightKg]
  );

  function fullReset() {
    if (confirm("Clear all your health data? This can't be undone.")) {
      clearCheckIns();
      reset();
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <BrandHeader onReset={fullReset} />

        <WeightHero
          currentKg={currentWeightKg}
          startingKg={profile.startingWeightKg}
          delta={deltaFromStart}
          hasCheckIn={Boolean(latest)}
        />

        <button
          type="button"
          onClick={onStartCheckIn}
          className="mt-6 w-full rounded-2xl bg-accent px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          {latest ? "Log this week's check-in" : "Do your first check-in"}
        </button>

        <CheckInHistory checkIns={checkIns} />

        <ProfileSnapshot profile={profile} />
      </div>
    </div>
  );
}

function BrandHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span className="font-display text-base font-semibold text-ink">Currant Health</span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
      >
        Reset
      </button>
    </header>
  );
}

function WeightHero({
  currentKg,
  startingKg,
  delta,
  hasCheckIn
}: {
  currentKg: number;
  startingKg: number;
  delta: number;
  hasCheckIn: boolean;
}) {
  return (
    <section className="mt-10">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        {hasCheckIn ? "Current weight" : "Starting weight"}
      </p>
      <p className="mt-2 font-display text-6xl font-semibold tracking-tight text-ink">
        {currentKg}
        <span className="ml-2 text-3xl font-medium text-muted">kg</span>
      </p>
      {hasCheckIn && (
        <p className="mt-2 text-sm text-muted">
          <DeltaLabel delta={delta} /> from your starting weight of {startingKg} kg.
        </p>
      )}
    </section>
  );
}

function DeltaLabel({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="font-medium text-ink">No change</span>;
  }
  const sign = delta > 0 ? "+" : "";
  return (
    <span className="font-medium text-ink">
      {sign}
      {delta} kg
    </span>
  );
}

function CheckInHistory({ checkIns }: { checkIns: WeeklyCheckIn[] }) {
  if (checkIns.length === 0) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-line p-6 text-center">
        <p className="text-sm text-muted">
          No check-ins yet. Your history will show here.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold text-ink">Recent check-ins</h2>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {checkIns.slice(0, 12).map((c, i) => {
          const previous = checkIns[i + 1];
          const delta = previous ? round1(c.weightKg - previous.weightKg) : null;
          return (
            <li key={c.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{formatDate(c.date)}</p>
                {c.measurements && (
                  <p className="text-xs text-muted">
                    {Object.keys(c.measurements).length} measurement
                    {Object.keys(c.measurements).length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-ink">{c.weightKg} kg</p>
                {delta !== null && delta !== 0 && (
                  <p className="text-xs text-muted">
                    {delta > 0 ? "+" : ""}
                    {delta} kg
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ProfileSnapshot({ profile }: { profile: HealthProfile }) {
  return (
    <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Your profile</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Height">
          {profile.heightCm} cm
        </Row>
        <Row label="Starting weight">
          {profile.startingWeightKg} kg
        </Row>
        <Row label="Goals">
          <GoalsList goals={profile.goals} />
        </Row>
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

function GoalsList({ goals }: { goals: HealthGoal[] }) {
  if (goals.length === 0) return <span className="text-muted">none</span>;
  return (
    <ul className="space-y-1">
      {goals.map((g) => (
        <li key={g.id}>
          <span className="font-medium">{labelForGoalKind(g.kind)}</span>
          {g.notes && <span className="block text-xs text-muted">"{g.notes}"</span>}
        </li>
      ))}
    </ul>
  );
}

function labelForGoalKind(kind: string): string {
  return ({
    lose_weight: "Lose weight",
    gain_weight: "Gain weight",
    build_muscle: "Build muscle",
    maintain: "Maintain",
    improve_endurance: "Improve endurance",
    improve_strength: "Get stronger"
  } as Record<string, string>)[kind] ?? kind;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric"
  });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
