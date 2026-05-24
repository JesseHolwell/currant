import { isSupabaseConfigured, useAuth } from "@currant/auth";
import { LandingPage } from "./features/landing/LandingPage";
import { LifeDashboard } from "./features/life/LifeDashboard";

/**
 * Suite shell, two modes:
 *   - Signed out → marketing landing + sign-in.
 *   - Signed in  → Life dashboard (cross-vertical overview).
 *
 * Life isn't a separate vertical — it's what the shell becomes once you're
 * authenticated. Same URL (`currant.au/`), same codebase, different content.
 */

/**
 * Dev affordance: appending `?dev=life` in development renders the signed-in
 * Life dashboard without requiring an actual Google sign-in. Strictly gated
 * to `import.meta.env.DEV` so the override doesn't exist in production.
 */
function isDevForcedLife(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("dev") === "life";
}

export default function App() {
  const { user, authLoading, signInWithGoogle, signOut } = useAuth();

  if (authLoading) {
    return <CenteredPage>Loading…</CenteredPage>;
  }

  const forceLife = isDevForcedLife();
  const effectiveEmail = user?.email ?? (forceLife ? "dev@currant.au" : null);
  const showLife = Boolean(user) || forceLife;

  return (
    <div className="min-h-dvh">
      <Header user={effectiveEmail} onSignOut={signOut} />
      {showLife ? (
        <LifeDashboard userEmail={effectiveEmail} />
      ) : (
        <LandingPage onSignIn={signInWithGoogle} canSignIn={isSupabaseConfigured} />
      )}
    </div>
  );
}

function Header({ user, onSignOut }: { user: string | null; onSignOut: () => void }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">Currant</span>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">suite</span>
        </a>
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

function CenteredPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center text-muted">{children}</div>
  );
}
