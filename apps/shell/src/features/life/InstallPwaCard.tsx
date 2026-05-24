import { useEffect, useState } from "react";

/*
 * Install-as-PWA prompt for the Life dashboard.
 *
 * Auto-hides when:
 *   - The shell is already running in standalone mode (the user has already
 *     installed Currant as a PWA), or
 *   - The user has previously dismissed the card.
 *
 * Tailored to iOS Safari since that's the friction-killer use case — Android
 * Chrome has its own native install prompt. Desktop users see the same card;
 * they can just dismiss it.
 */

const DISMISS_KEY = "shell_pwa_install_dismissed_v1";

interface InstallOption {
  label: string;
  short: string;
  href: string;
  dotClass: string;
}

const INSTALL_OPTIONS: InstallOption[] = [
  { label: "Currant (Life dashboard)", short: "Currant", href: "/", dotClass: "dot-life" },
  { label: "Currant Cash", short: "Cash", href: "/cash/", dotClass: "dot-cash" },
  { label: "Currant Health", short: "Health", href: "/health/", dotClass: "dot-health" },
  { label: "Currant Mind", short: "Mind", href: "/mind/", dotClass: "dot-mind" }
];

export function InstallPwaCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed — running as a standalone PWA.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari pre-iOS 13 used a navigator flag instead of the media query.
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Tip</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Install Currant on your phone
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Each app installs as its own home-screen icon, so a daily check-in is one tap from your lock screen.
            No App Store, no account required beyond what you already have.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install instructions"
          className="-mr-1 -mt-1 flex-none rounded-full p-2 text-muted transition hover:bg-accent-soft hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          How to install on iPhone
        </p>
        <ol className="mt-3 space-y-2 text-sm text-ink">
          <li className="flex gap-3">
            <Step n={1} />
            <span>Open the link below in <strong className="font-semibold">Safari</strong> on your iPhone.</span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>Tap the <strong className="font-semibold">Share</strong> button (square with up arrow).</span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>Scroll down and tap <strong className="font-semibold">Add to Home Screen</strong>.</span>
          </li>
          <li className="flex gap-3">
            <Step n={4} />
            <span>Confirm the name and tap <strong className="font-semibold">Add</strong>. The icon appears on your home screen.</span>
          </li>
        </ol>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
          Install separately — one icon per app
        </p>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {INSTALL_OPTIONS.map((opt) => (
            <li key={opt.href}>
              <a
                href={opt.href}
                className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-accent-soft"
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${opt.dotClass}`} aria-hidden />
                  <span className="text-sm font-medium text-ink">{opt.label}</span>
                </span>
                <span className="text-xs text-muted" aria-hidden>
                  Open →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-muted">
          All four apps share your sign-in and your data — installing them separately just gives you faster
          access to each vertical's daily flow. Tap "Open" above to navigate, then add to home screen from there.
        </p>
      </div>
    </section>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
      {n}
    </span>
  );
}
