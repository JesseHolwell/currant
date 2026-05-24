/*
 * Marketing landing for currant.au — shown to signed-out visitors only.
 *
 * Once a user signs in, the shell swaps to LifeDashboard. So this surface
 * is purely about "what is Currant" and "create your account".
 */

type VerticalStatus = "shipping" | "scaffolded" | "planned";

type Vertical = {
  id: "cash" | "health" | "mind";
  name: string;
  tagline: string;
  description: string;
  status: VerticalStatus;
  devPort?: number;
  productionPath: string;
};

const VERTICALS: Vertical[] = [
  {
    id: "cash",
    name: "Currant Cash",
    tagline: "Money you can see.",
    description:
      "Import bank CSVs, categorise spending, forecast cash flow, and run FIRE projections — all local-first.",
    status: "shipping",
    devPort: 5174,
    productionPath: "/cash/"
  },
  {
    id: "health",
    name: "Currant Health",
    tagline: "Body you can measure.",
    description:
      "Workouts, weekly check-ins, and body measurements. Low-friction logging, useful graphs.",
    status: "scaffolded",
    devPort: 5175,
    productionPath: "/health/"
  },
  {
    id: "mind",
    name: "Currant Mind",
    tagline: "Wellbeing you can track.",
    description:
      "Daily habits, mood, and reflection. Tap your tasks off, set a mood, watch your trends.",
    status: "scaffolded",
    devPort: 5176,
    productionPath: "/mind/"
  }
];

const STATUS_LABEL: Record<VerticalStatus, string> = {
  shipping: "Shipping",
  scaffolded: "In progress",
  planned: "Planned"
};

function hrefFor(vertical: Vertical): string {
  if (import.meta.env.DEV && vertical.devPort) {
    return `http://localhost:${vertical.devPort}`;
  }
  return vertical.productionPath;
}

export function LandingPage({
  onSignIn,
  canSignIn
}: {
  onSignIn: () => void;
  canSignIn: boolean;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
      <Hero />
      <SignInPrompt onSignIn={onSignIn} canSignIn={canSignIn} />
      <VerticalGrid />
      <WhatYouGetSection />
      <SuiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="mb-12">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">A suite of local-first life trackers</p>
      <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
        Track your money,<br />body, and mind.<br />
        <span className="text-accent">All in one place.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Three small apps that share one login and one dataset. Your data lives on your device by
        default. When you want it everywhere, sync turns on with a switch.
      </p>
    </section>
  );
}

function SignInPrompt({ onSignIn, canSignIn }: { onSignIn: () => void; canSignIn: boolean }) {
  if (!canSignIn) {
    return (
      <section className="mb-12 rounded-2xl border border-line bg-surface p-6">
        <p className="font-semibold text-ink">Local-only mode</p>
        <p className="mt-1 text-sm text-muted">
          Cloud sync isn't configured for this build. The verticals work fully offline — open
          one below to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-12 rounded-2xl border border-line bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="font-semibold text-ink">One account, every vertical</p>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Sign in once and Cash, Health, and Mind all unlock together. After sign-in, your home
          becomes a dashboard across all three.
        </p>
      </div>
      <button
        onClick={onSignIn}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:mt-0 sm:w-auto"
      >
        Sign in with Google
      </button>
    </section>
  );
}

function VerticalGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {VERTICALS.map((v) => (
        <VerticalCard key={v.id} vertical={v} />
      ))}
    </section>
  );
}

function VerticalCard({ vertical }: { vertical: Vertical }) {
  const clickable = vertical.status !== "planned";
  const href = hrefFor(vertical);

  const cardClasses =
    "group relative flex flex-col rounded-2xl border border-line bg-surface p-6 transition" +
    (clickable
      ? " hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
      : " opacity-70");

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full dot-${vertical.id}`} aria-hidden />
          <span className="font-display text-lg font-semibold text-ink">{vertical.name}</span>
        </div>
        <StatusBadge status={vertical.status} />
      </div>
      <p className="mt-3 font-display text-xl font-medium italic text-ink">{vertical.tagline}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{vertical.description}</p>
      {clickable && (
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          Try it
          <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
        </span>
      )}
    </>
  );

  if (!clickable) {
    return <div className={cardClasses}>{inner}</div>;
  }

  return (
    <a href={href} className={cardClasses}>
      {inner}
    </a>
  );
}

function StatusBadge({ status }: { status: VerticalStatus }) {
  const tone = {
    shipping: "bg-accent-soft text-accent",
    scaffolded: "bg-accent-soft text-accent",
    planned: "bg-transparent text-muted"
  }[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function WhatYouGetSection() {
  return (
    <section className="mt-16 grid gap-6 sm:grid-cols-2">
      <Block
        title="Local-first by default"
        body="Every vertical writes to your browser first. No account required to use the apps. Cloud sync turns on only when you want your data on another device."
      />
      <Block
        title="One signed-in home"
        body="When you sign in to currant.au, you get a Life dashboard — your current weight, mood streak, net worth, and the things you need to log today. All in one place."
      />
    </section>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function SuiteFooter() {
  return (
    <footer className="mt-20 border-t border-line pt-6 text-xs text-muted">
      <p>Currant is local-first. Your data lives on your device. Cloud sync is optional.</p>
      <p className="mt-1">currant.au · one suite, one login, three apps.</p>
    </footer>
  );
}
