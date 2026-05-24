import { useState } from "react";
import type { GoalKind, HealthGoal } from "../../domain/types";
import { useProfileStore } from "../../store/profile";

/*
 * Two-step onboarding: body measurements, then goals.
 *
 * Keep this lean — we deliberately don't ask for sex, birth date, training
 * experience, or anything else until we know we need it. Every extra field
 * is friction the user pays on day one.
 */

type Step = "body" | "goals";

type DraftGoal = {
  kind: GoalKind;
  notes?: string;
  target?: number;
  targetDate?: string;
};

const GOAL_OPTIONS: Array<{ kind: GoalKind; label: string; hint: string }> = [
  { kind: "lose_weight", label: "Lose weight", hint: "Cut body fat" },
  { kind: "gain_weight", label: "Gain weight", hint: "Bulk / mass" },
  { kind: "build_muscle", label: "Build muscle", hint: "Hypertrophy focus" },
  { kind: "improve_strength", label: "Get stronger", hint: "Heavy compound lifts" },
  { kind: "improve_endurance", label: "Improve endurance", hint: "Cardio capacity" },
  { kind: "maintain", label: "Maintain", hint: "Stay where I am" }
];

export function OnboardingWizard() {
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<Step>("body");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<Set<GoalKind>>(new Set());
  const [primaryNotes, setPrimaryNotes] = useState<string>("");

  const heightValid = Number(heightCm) >= 100 && Number(heightCm) <= 250;
  const weightValid = Number(weightKg) >= 30 && Number(weightKg) <= 400;
  const canAdvanceFromBody = heightValid && weightValid;
  const canFinish = selectedGoals.size > 0;

  function toggleGoal(kind: GoalKind) {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  function finish() {
    const goals: Array<Omit<HealthGoal, "id" | "createdAt">> = Array.from(selectedGoals).map((kind, i) => ({
      kind,
      notes: i === 0 && primaryNotes.trim() ? primaryNotes.trim() : undefined
    }));
    completeOnboarding({
      heightCm: Number(heightCm),
      startingWeightKg: Number(weightKg),
      goals
    });
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-10 sm:py-16">
        <Header step={step} />

        <div className="mt-10 flex-1">
          {step === "body" && (
            <BodyStep
              heightCm={heightCm}
              weightKg={weightKg}
              onHeightChange={setHeightCm}
              onWeightChange={setWeightKg}
            />
          )}

          {step === "goals" && (
            <GoalsStep
              selected={selectedGoals}
              onToggle={toggleGoal}
              notes={primaryNotes}
              onNotesChange={setPrimaryNotes}
            />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {step === "goals" ? (
            <button
              type="button"
              onClick={() => setStep("body")}
              className="text-sm font-medium text-muted hover:text-ink"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step === "body" && (
            <button
              type="button"
              disabled={!canAdvanceFromBody}
              onClick={() => setStep("goals")}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          )}

          {step === "goals" && (
            <button
              type="button"
              disabled={!canFinish}
              onClick={finish}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Finish setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ step }: { step: Step }) {
  return (
    <header>
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span className="font-display text-base font-semibold text-ink">Currant Health</span>
      </div>

      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {step === "body" && "Let's start with the basics."}
        {step === "goals" && "What are you working toward?"}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-muted">
        {step === "body" && "Two numbers we'll reference everywhere else. You can change them later."}
        {step === "goals" && "Pick anything that fits — multiple is fine. We'll show your progress against these."}
      </p>

      <StepDots step={step} />
    </header>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="mt-6 flex items-center gap-1.5">
      <Dot active={step === "body"} done={step === "goals"} />
      <Dot active={step === "goals"} done={false} />
    </div>
  );
}

function Dot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <span
      className={
        "h-1.5 rounded-full transition-all " +
        (active ? "w-8 bg-accent" : done ? "w-1.5 bg-accent/60" : "w-1.5 bg-line")
      }
      aria-hidden
    />
  );
}

function BodyStep({
  heightCm,
  weightKg,
  onHeightChange,
  onWeightChange
}: {
  heightCm: string;
  weightKg: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <NumberField
        label="Height"
        unit="cm"
        value={heightCm}
        onChange={onHeightChange}
        placeholder="175"
        min={100}
        max={250}
      />
      <NumberField
        label="Current weight"
        unit="kg"
        value={weightKg}
        onChange={onWeightChange}
        placeholder="78"
        min={30}
        max={400}
        hint="We'll use this as your starting weight. Future weigh-ins go in weekly check-ins."
      />
    </form>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  min,
  max,
  hint
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="relative mt-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="block w-full rounded-xl border border-line bg-surface px-4 py-3 pr-14 text-lg text-ink shadow-sm transition placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
          {unit}
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </label>
  );
}

function GoalsStep({
  selected,
  onToggle,
  notes,
  onNotesChange
}: {
  selected: Set<GoalKind>;
  onToggle: (kind: GoalKind) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {GOAL_OPTIONS.map((g) => {
          const isSelected = selected.has(g.kind);
          return (
            <button
              key={g.kind}
              type="button"
              onClick={() => onToggle(g.kind)}
              className={
                "flex items-start gap-3 rounded-xl border p-4 text-left transition " +
                (isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-accent/40")
              }
            >
              <span
                className={
                  "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition " +
                  (isSelected ? "border-accent bg-accent text-white" : "border-line")
                }
                aria-hidden
              >
                {isSelected && <Check />}
              </span>
              <span>
                <span className="block font-semibold text-ink">{g.label}</span>
                <span className="block text-xs text-muted">{g.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">Anything specific? <span className="text-muted">(optional)</span></span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. drop to 78 kg by August, hit a 100 kg bench"
          className="mt-2 block w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
        />
      </label>
    </div>
  );
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6.5L5 9.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
