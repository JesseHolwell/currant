/**
 * Small pure helpers shared across the health domain.
 *
 * Keep these dependency-free — no React, no storage, no date libraries.
 * If a helper grows beyond a screen of code, lift it into its own module.
 */

/**
 * Client-side id. crypto.randomUUID() is available in modern browsers and
 * Capacitor's WKWebView; fall back to a timestamp-prefixed random string
 * in case we ever pre-render somewhere that lacks it.
 */
export function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Today's date as `YYYY-MM-DD` in local time. */
export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
