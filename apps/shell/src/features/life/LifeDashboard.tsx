import { useEffect, useState } from "react";
import type { CashSummary, HealthSummary, MindSummary, SuiteSummary } from "../../lib/verticalData";
import { readSuiteSummary } from "../../lib/verticalData";

/*
 * The signed-in mode of the shell — what Currant Life used to mean.
 *
 * Reads cross-vertical data from localStorage on mount (and again whenever
 * the page is refocused, since the user typically navigates away to a
 * vertical and comes back).
 *
 * Three sections:
 *   - Pending: actionable nudges (overdue health check-in, no mood logged
 *     today, etc.). Hides itself when nothing's pending.
 *   - Numbers: a card per vertical with the most useful primary stat.
 *   - Open: the vertical switcher cards, sorted by "what you actually use".
 *
 * Suggestions for verticals you haven't tried are folded into the Numbers
 * cards — an "untouched" vertical shows a "Try it" CTA in place of stats
 * rather than being hidden away in its own section.
 */

const VERTICAL_DEV_PORT: Record<"cash" | "health" | "mind", number> = {
  cash: 5174,
  health: 5175,
  mind: 5176
};

const VERTICAL_PRODUCTION_PATH: Record<"cash" | "health" | "mind", string> = {
  cash: "/cash/",
  health: "/health/",
  mind: "/mind/"
};

function hrefFor(id: "cash" | "health" | "mind"): string {
  if (import.meta.env.DEV) return `http://localhost:${VERTICAL_DEV_PORT[id]}`;
  return VERTICAL_PRODUCTION_PATH[id];
}

export function LifeDashboard({ userEmail }: { userEmail: string | null }) {
  const [summary, setSummary] = useState<SuiteSummary>(() => readSuiteSummary());

  // Re-read when the user returns from a vertical (tab focus / visibility).
  useEffect(() => {
    function refresh() {
      setSummary(readSuiteSummary());
    }
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const pending = buildPendingItems(summary);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
      <Greeting userEmail={userEmail} />

      {pending.length > 0 && <PendingBanner items={pending} />}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">Your week</h2>
        <p className="mt-1 text-sm text-muted">
          A snapshot across the suite. Tap any card to dive in.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <CashCard summary={summary.cash} />
          <HealthCard summary={summary.health} />
          <MindCard summary={summary.mind} />
        </div>
      </section>

      <SuiteFooter />
    </main>
  );
}

// ─── Greeting ──────────────────────────────────────────────────────────

function Greeting({ userEmail }: { userEmail: string | null }) {
  const greeting = timeOfDayGreeting();
  const name = userEmail ? prettyName(userEmail) : null;
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{today()}</p>
      <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
        {greeting}
        {name ? `, ${name}` : ""}.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Your overview across Cash, Health, and Mind.
      </p>
    </section>
  );
}

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function prettyName(email: string): string {
  const local = email.split("@")[0] ?? email;
  const first = local.split(/[._-]/)[0] ?? local;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function today(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

// ─── Pending banner ────────────────────────────────────────────────────

interface PendingItem {
  id: string;
  label: string;
  hint: string;
  vertical: "cash" | "health" | "mind";
}

function buildPendingItems(s: SuiteSummary): PendingItem[] {
  const items: PendingItem[] = [];

  if (s.health.onboarded && s.health.daysSinceLastCheckIn !== null && s.health.daysSinceLastCheckIn >= 7) {
    items.push({
      id: "health-checkin",
      vertical: "health",
      label: "Health check-in due",
      hint:
        s.health.lastCheckInDate === null
          ? "You haven't logged a check-in yet."
          : `Last logged ${s.health.daysSinceLastCheckIn} days ago.`
    });
  }

  if (s.mind.hasData && !s.mind.loggedToday) {
    items.push({
      id: "mind-today",
      vertical: "mind",
      label: "Mind: today's log",
      hint: s.mind.streak > 0 ? `Don't drop your ${s.mind.streak}-day streak.` : "How was your day?"
    });
  }

  if (s.cash.hasData && s.cash.lastImportedAt) {
    const days = daysSinceIso(s.cash.lastImportedAt);
    if (days >= 30) {
      items.push({
        id: "cash-import",
        vertical: "cash",
        label: "Cash: import recent transactions",
        hint: `Last import was ${days} days ago.`
      });
    }
  }

  return items;
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso);
  return Math.floor((Date.now() - then.getTime()) / 86_400_000);
}

function PendingBanner({ items }: { items: PendingItem[] }) {
  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft">
      <div className="border-b border-accent/15 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {items.length === 1 ? "1 thing for you" : `${items.length} things for you`}
        </p>
      </div>
      <ul className="divide-y divide-accent/15">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={hrefFor(item.vertical)}
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-accent/10"
            >
              <span className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full dot-${item.vertical}`} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block text-xs text-muted">{item.hint}</span>
                </span>
              </span>
              <span aria-hidden className="text-accent">→</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Vertical cards ────────────────────────────────────────────────────

function CashCard({ summary }: { summary: CashSummary }) {
  if (!summary.hasData) {
    return (
      <VerticalCardShell
        verticalId="cash"
        title="Currant Cash"
        href={hrefFor("cash")}
        empty
        emptyCta="Import a CSV →"
        emptyHint="Drop in a bank export to see your money flow."
      />
    );
  }

  const netWorthLabel = summary.netWorth === null ? "—" : formatCurrencyShort(summary.netWorth);

  return (
    <VerticalCardShell
      verticalId="cash"
      title="Currant Cash"
      href={hrefFor("cash")}
      primary={netWorthLabel}
      primaryLabel={summary.netWorth === null ? "no accounts yet" : "net worth"}
      sub={
        summary.lastImportedAt
          ? `${summary.transactionCount} txns · last imported ${formatRelative(summary.lastImportedAt)}`
          : `${summary.transactionCount} transactions`
      }
    />
  );
}

function HealthCard({ summary }: { summary: HealthSummary }) {
  if (!summary.onboarded) {
    return (
      <VerticalCardShell
        verticalId="health"
        title="Currant Health"
        href={hrefFor("health")}
        empty
        emptyCta="Set up your profile →"
        emptyHint="Height, starting weight, goals. Two minutes."
      />
    );
  }

  const weight = summary.currentWeightKg !== null ? `${summary.currentWeightKg} kg` : "—";
  const sub = (() => {
    if (summary.lastCheckInDate) {
      return `${summary.checkInCount} check-in${summary.checkInCount === 1 ? "" : "s"} · ${formatRelative(summary.lastCheckInDate)}`;
    }
    return "No check-ins yet";
  })();

  return (
    <VerticalCardShell
      verticalId="health"
      title="Currant Health"
      href={hrefFor("health")}
      primary={weight}
      primaryLabel="current weight"
      sub={sub}
    />
  );
}

function MindCard({ summary }: { summary: MindSummary }) {
  if (!summary.hasData) {
    return (
      <VerticalCardShell
        verticalId="mind"
        title="Currant Mind"
        href={hrefFor("mind")}
        empty
        emptyCta="Log your first day →"
        emptyHint="Pick a mood, tick what you did. Ten seconds."
      />
    );
  }

  const mood = summary.avgMood === null ? "—" : summary.avgMood.toFixed(1);
  const sub = `${summary.daysLoggedLast30}/30 days logged${summary.streak > 0 ? ` · ${summary.streak}-day streak` : ""}`;

  return (
    <VerticalCardShell
      verticalId="mind"
      title="Currant Mind"
      href={hrefFor("mind")}
      primary={mood}
      primaryLabel="avg mood (30d)"
      sub={sub}
    />
  );
}

function VerticalCardShell(props: {
  verticalId: "cash" | "health" | "mind";
  title: string;
  href: string;
  primary?: string;
  primaryLabel?: string;
  sub?: string;
  empty?: boolean;
  emptyCta?: string;
  emptyHint?: string;
}) {
  const { verticalId, title, href, primary, primaryLabel, sub, empty, emptyCta, emptyHint } = props;
  const classes =
    "group flex flex-col rounded-2xl border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-lg " +
    (empty ? "border-dashed border-line hover:border-accent/40" : "border-line hover:border-accent");

  return (
    <a href={href} className={classes}>
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full dot-${verticalId}`} aria-hidden />
        <span className="font-display text-base font-semibold text-ink">{title}</span>
      </div>

      {empty ? (
        <div className="mt-4">
          <p className="text-sm text-muted">{emptyHint}</p>
          <p className="mt-4 text-sm font-semibold text-accent">{emptyCta}</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="font-display text-4xl font-semibold tabular-nums text-ink">{primary}</p>
          {primaryLabel && (
            <p className="mt-1 text-xs uppercase tracking-wider text-muted">{primaryLabel}</p>
          )}
          {sub && <p className="mt-3 text-xs text-muted">{sub}</p>}
        </div>
      )}
    </a>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────

function SuiteFooter() {
  return (
    <footer className="mt-20 border-t border-line pt-6 text-xs text-muted">
      <p>Currant is local-first. Your data lives on your device. Cloud sync is optional.</p>
      <p className="mt-1">currant.au · one suite, one login, three apps.</p>
    </footer>
  );
}

// ─── Formatting helpers ───────────────────────────────────────────────

function formatCurrencyShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}k`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

function formatRelative(isoOrDate: string): string {
  // Compare local-midnight to local-midnight to avoid timezone drift —
  // straight `Date.now() - then` overcounts whole days for users east of UTC.
  const datePart = isoOrDate.length >= 10 ? isoOrDate.slice(0, 10) : isoOrDate;
  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  if (datePart === today) return "today";

  const todayMidnight = new Date(`${today}T00:00:00`);
  const thenMidnight = new Date(`${datePart}T00:00:00`);
  const days = Math.round((todayMidnight.getTime() - thenMidnight.getTime()) / 86_400_000);

  if (days === 1) return "1d ago";
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return thenMidnight.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
