import { useState } from "react";
import type { LimbMeasurements, WeeklyCheckIn } from "../../domain/types";
import { todayIso } from "../../domain/utils";
import { useCheckInsStore } from "../../store/checkIns";

/*
 * Single-screen weekly check-in entry.
 *
 * Design constraints:
 *   - Weight is the only required field. Everything else is optional.
 *   - 10 limb measurements would overwhelm by default → hidden behind a
 *     disclosure. Most users won't open it most weeks.
 *   - We don't pre-fill values from the previous check-in (risk of someone
 *     hitting save without realising). Instead the previous value shows as
 *     a placeholder hint per field so it's still fast.
 */

type LimbKey = keyof LimbMeasurements;

const LIMB_FIELDS: Array<{ key: LimbKey; label: string }> = [
  { key: "neckCm", label: "Neck" },
  { key: "chestCm", label: "Chest" },
  { key: "waistCm", label: "Waist" },
  { key: "hipsCm", label: "Hips" },
  { key: "leftBicepCm", label: "Left bicep" },
  { key: "rightBicepCm", label: "Right bicep" },
  { key: "leftThighCm", label: "Left thigh" },
  { key: "rightThighCm", label: "Right thigh" },
  { key: "leftCalfCm", label: "Left calf" },
  { key: "rightCalfCm", label: "Right calf" }
];

export function WeeklyCheckInForm({
  previous,
  onClose
}: {
  previous: WeeklyCheckIn | null;
  onClose: () => void;
}) {
  const addCheckIn = useCheckInsStore((s) => s.addCheckIn);

  const [date, setDate] = useState(todayIso());
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [limbs, setLimbs] = useState<Record<LimbKey, string>>({} as Record<LimbKey, string>);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const weightNum = Number(weightKg);
  const weightValid = weightNum >= 30 && weightNum <= 400;

  function setLimb(key: LimbKey, value: string) {
    setLimbs((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    if (!weightValid) return;

    const measurements = collectMeasurements(limbs);

    addCheckIn({
      date,
      weightKg: weightNum,
      measurements,
      notes: notes.trim() || undefined
    });
    onClose();
  }

  const filledLimbCount = Object.values(limbs).filter((v) => v.trim() !== "").length;

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-xl px-6 py-10">
        <Header onClose={onClose} />

        <form className="mt-10 space-y-6" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <DateField value={date} onChange={setDate} />

          <NumberField
            label="Weight"
            unit="kg"
            value={weightKg}
            onChange={setWeightKg}
            placeholder={previous ? String(previous.weightKg) : "78"}
            hint={previous ? lastValueHint(previous.weightKg, previous.date) : "First weigh-in — set the baseline."}
            autoFocus
          />

          <MeasurementsDisclosure
            isOpen={showMeasurements}
            onToggle={() => setShowMeasurements((v) => !v)}
            filledCount={filledLimbCount}
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {LIMB_FIELDS.map((f) => (
                <CompactNumberField
                  key={f.key}
                  label={f.label}
                  unit="cm"
                  value={limbs[f.key] ?? ""}
                  onChange={(v) => setLimb(f.key, v)}
                  placeholder={
                    previous?.measurements?.[f.key] !== undefined
                      ? String(previous.measurements[f.key])
                      : ""
                  }
                />
              ))}
            </div>
          </MeasurementsDisclosure>

          <NotesField value={notes} onChange={setNotes} />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!weightValid}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function collectMeasurements(limbs: Record<string, string>): LimbMeasurements | undefined {
  const out: LimbMeasurements = {};
  let any = false;
  for (const { key } of LIMB_FIELDS) {
    const raw = limbs[key];
    if (raw === undefined || raw.trim() === "") continue;
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) {
      out[key] = num;
      any = true;
    }
  }
  return any ? out : undefined;
}

function lastValueHint(value: number, date: string): string {
  const when = formatRelativeDate(date);
  const connector = when === "today" || when === "yesterday" ? "" : "on ";
  return `Last check-in: ${value} kg, ${connector}${when}.`;
}

function formatRelativeDate(iso: string): string {
  const today = todayIso();
  if (iso === today) return "today";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === toIso(yesterday)) return "yesterday";

  // Compare local-midnight to local-midnight to avoid timezone drift.
  const todayMidnight = new Date(`${today}T00:00:00`);
  const thenMidnight = new Date(`${iso}T00:00:00`);
  const days = Math.round((todayMidnight.getTime() - thenMidnight.getTime()) / 86_400_000);
  if (days < 14) return `${days} days ago`;
  return thenMidnight.toLocaleDateString();
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <header>
      <button
        type="button"
        onClick={onClose}
        className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Back
      </button>

      <div className="mt-8 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span className="font-display text-base font-semibold text-ink">Currant Health</span>
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        This week's check-in.
      </h1>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Weight is the only required field. Open measurements if you tracked any.
      </p>
    </header>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">Date</span>
      <input
        type="date"
        value={value}
        max={todayIso()}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-sm transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
      />
    </label>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  hint,
  autoFocus
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="relative mt-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
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

function CompactNumberField({
  label,
  unit,
  value,
  onChange,
  placeholder
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="relative mt-1.5">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-line bg-surface px-3 py-2 pr-9 text-sm text-ink shadow-sm transition placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
          {unit}
        </span>
      </div>
    </label>
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        Notes <span className="text-muted">(optional)</span>
      </span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How are you feeling? Sleep, energy, anything else worth recording."
        className="mt-2 block w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
      />
    </label>
  );
}

function MeasurementsDisclosure({
  isOpen,
  onToggle,
  filledCount,
  children
}: {
  isOpen: boolean;
  onToggle: () => void;
  filledCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <span className="text-sm font-medium text-ink">
          Measurements
          <span className="ml-2 text-muted">
            {filledCount === 0 ? "(optional)" : `(${filledCount} filled)`}
          </span>
        </span>
        <span
          className={"text-muted transition-transform " + (isOpen ? "rotate-180" : "")}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {isOpen && children}
    </div>
  );
}
