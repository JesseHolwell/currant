import { useAuth, isSupabaseConfigured } from "@currant/auth";

type VerticalStatus = "shipping" | "scaffolded" | "planned";

type Vertical = {
  id: "cash" | "health" | "mind" | "life";
  name: string;
  tagline: string;
  description: string;
  status: VerticalStatus;
  /**
   * Where to send the user in dev. In production this becomes a path on the
   * same origin (e.g. `/cash`). For now we link to each app's Vite dev port.
   */
  devUrl?: string;
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
    devUrl: "http://localhost:5174",
    productionPath: "/cash"
  },
  {
    id: "health",
    name: "Currant Health",
    tagline: "Body you can measure.",
    description:
      "Workouts, weekly check-ins, and body measurements. Low-friction logging, useful graphs.",
    status: "scaffolded",
    devUrl: "http://localhost:5175",
    productionPath: "/health"
  },
  {
    id: "mind",
    name: "Currant Mind",
    tagline: "Wellbeing you can track.",
    description:
      "Journal, mood, meditation. The quiet companion to the other verticals.",
    status: "planned",
    productionPath: "/mind"
  },
  {
    id: "life",
    name: "Currant Life",
    tagline: "Everything, together.",
    description:
      "The meta dashboard. Read across every vertical, spot patterns, and ask Currant AI questions about your whole life.",
    status: "planned",
    productionPath: "/life"
  }
];

const STATUS_LABEL: Record<VerticalStatus, string> = {
  shipping: "Shipping",
  scaffolded: "In progress",
  planned: "Planned"
};

export default function App() {
  const { user, authLoading, signInWithGoogle, signOut } = useAuth();

  if (authLoading) {
    return <CenteredPage>Loading…</CenteredPage>;
  }

  return (
    <div className="min-h-dvh">
      <Header user={user?.email ?? null} onSignOut={signOut} />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-16">
        <Hero />
        {!user && <SignInPrompt onSignIn={signInWithGoogle} />}
        {user && <SwitcherIntro />}
        <VerticalGrid signedIn={Boolean(user)} />
        <SuiteFooter />
      </main>
    </div>
  );
}

function Header({ user, onSignOut }: { user: string | null; onSignOut: () => void }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Currant
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">suite</span>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user}</span>
            <button
              onClick={onSignOut}
              className="rounded-full border border-line px-3 py-1 text-ink hover:bg-accent-soft"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
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
        Four small apps that share one login and one dataset. Your data lives on your device by
        default. When you want it everywhere, sync turns on with a switch.
      </p>
    </section>
  );
}

function SignInPrompt({ onSignIn }: { onSignIn: () => void }) {
  if (!isSupabaseConfigured) {
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
          Sign in once and Cash, Health, Mind, and Life all unlock together. Or skip — the
          apps work fully without an account.
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

function SwitcherIntro() {
  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-semibold text-ink">Pick a vertical</h2>
      <p className="mt-1 text-sm text-muted">
        You're signed in across the suite. Open any of these to start working.
      </p>
    </section>
  );
}

function VerticalGrid({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {VERTICALS.map((v) => (
        <VerticalCard key={v.id} vertical={v} signedIn={signedIn} />
      ))}
    </section>
  );
}

function VerticalCard({ vertical, signedIn }: { vertical: Vertical; signedIn: boolean }) {
  const clickable = vertical.status !== "planned";
  const href = vertical.devUrl ?? vertical.productionPath;

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
          {signedIn ? "Open" : "Try it"}
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

function SuiteFooter() {
  return (
    <footer className="mt-20 border-t border-line pt-6 text-xs text-muted">
      <p>
        Currant is local-first. Your data lives on your device. Cloud sync is optional.
      </p>
      <p className="mt-1">
        currant.au · one suite, one login, four apps.
      </p>
    </footer>
  );
}

function CenteredPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center text-muted">{children}</div>
  );
}
