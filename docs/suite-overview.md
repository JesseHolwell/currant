# Currant — Suite Overview

Currant is a suite of local-first life-tracking apps that share auth, a design
language, storage patterns, and an eventual cross-app aggregator + AI layer.
This doc is the suite-level map; each vertical owns its own product docs under
`docs/<vertical>/`.

> Architecture decisions (deployment model, monorepo layout, iOS strategy,
> cross-app conventions) live in the root [`CLAUDE.md`](../CLAUDE.md). This doc
> is the product-facing companion to that engineering reference.

## Verticals

| Vertical | What it tracks | Status | Docs |
|---|---|---|---|
| **Cash** | Finance — transactions, categories, forecasts, FIRE | shipping | [`docs/cash/`](./cash/) |
| **Health** | Body — workouts, weekly check-ins, measurements | scaffolded (functional) | [`docs/health/`](./health/) |
| **Mind** | Mental wellbeing — daily tasks, mood, reflection | scaffolded (functional) | [`docs/mind/`](./mind/) |
| **Life** | Cross-vertical dashboard | shell's signed-in mode | [`docs/shell/`](./shell/) |

**Life is not a separate app** — it is the shell's signed-in mode. Signed-out
visitors at the origin root see the marketing landing; signed-in visitors see
the Life dashboard (cross-vertical stats + nudges) at the same URL. The
cross-app reader lives in `apps/shell/src/lib/verticalData.ts` and is the only
place that reads other verticals' localStorage directly.

## One origin, per-app builds

Every vertical builds independently to its own `dist/` and is served under one
origin so that origin-scoped `localStorage` is shared and the Life aggregator
can read across verticals:

```
currant.cash/         → apps/shell/dist     (landing signed-out, Life signed-in)
currant.cash/cash/*   → apps/cash/dist
currant.cash/health/* → apps/health/dist
currant.cash/mind/*   → apps/mind/dist
```

In dev each app runs its own Vite server (shell 5170, cash 5174, health 5175).

## Shared foundations

- **Auth** — one Supabase project for the whole suite via `@currant/auth`.
  Google OAuth; guest mode when Supabase env vars are absent
  (`isSupabaseConfigured === false`). Sign-in carries across verticals on the
  same origin.
- **Design tokens** — `@currant/ui` ships fonts, radii, and color-slot
  bindings; each vertical declares its own palette. The suite design language
  is documented in [`style-guide.md`](./style-guide.md).
- **Storage** — apps never touch `localStorage` directly; they go through
  Zustand store slices with `PersistStorage` adapters. Domain logic is pure
  TypeScript in `apps/<name>/src/domain/` and is the only unit-tested layer.

## iOS

Capacitor wraps each web build in a `WKWebView` — one App Store app per
vertical (`au.currant.cash`, `au.currant.health`, `au.currant.mind`), plus the
shell as `au.currant.life`. All share App Group `group.au.currant` so Life can
read what the verticals write into the shared container.

## Where to look next

- Per-vertical product specs and flows: `docs/<vertical>/`
- Engineering conventions: root `CLAUDE.md` + per-app `CLAUDE.md`
- Design system: [`style-guide.md`](./style-guide.md)
