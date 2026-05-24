# Currant — Suite-level Claude Code Instructions

These instructions apply to the whole monorepo. Per-app guidance lives in
each app's own `CLAUDE.md` (e.g. `apps/cash/CLAUDE.md`) and is automatically
picked up when working inside that directory.

## What Currant is

Currant is a suite of local-first life-tracking apps. Each vertical is its
own product, but they share auth, design language, storage patterns, and an
eventual cross-app aggregator + AI layer.

| Vertical | What it tracks | Status |
|---|---|---|
| Currant Cash | Finance — transactions, categories, forecasts, FIRE | shipping |
| Currant Health | Body — workouts, weekly check-ins, measurements | scaffolded |
| Currant Mind | Mental wellbeing — journal, mood, meditation | not started |
| Currant Life | Meta — aggregates from every vertical, AI layer | not started |

## Repo layout

```
apps/cash/      Currant Cash — finance dashboard (React + Vite)
apps/health/    Currant Health — body/fitness tracker (React + Vite)
apps/cli/       Bank-export ingest CLI for Cash (deprecated, optional)
packages/ui/    Shared design tokens — fonts, radii, color slot bindings
packages/       Other shared packages get extracted here lazily — see packages/README.md
data/           Raw / processed CSV + JSON for the ingest CLI (Cash-only)
rules/          Category + payroll rules for the ingest CLI (Cash-only)
supabase/       Shared migrations + edge functions across the suite
docs/           Product docs
```

## Deployment model (committed direction)

**Production domain:** `currant.au`. The previously-owned `currant.cash` will
likely redirect once the suite ships.

**Web:** single origin, path-based — `currant.au/`, `/cash`, `/health`,
`/mind`, `/life`. Same origin matters because `localStorage` is origin-scoped
and the Life aggregator needs to read across every vertical.

**iOS:** separate App Store app per vertical (one icon, one purpose). Bundle
ids follow reverse-DNS: `au.currant.cash`, `au.currant.health`, etc. Apps
share an App Group (`group.au.currant`) so the Life app can read JSON the
verticals write into the shared container.

## Conventions across all apps

- **Domain functions are pure.** No React, no `localStorage`, no fetch — pure
  TypeScript in `apps/<name>/src/domain/`. All business logic lives there
  and is the only thing unit-tested.
- **Zustand stores own persistence.** Apps don't read/write `localStorage`
  directly — they go through their store slices, which use custom
  `PersistStorage` adapters when multiple keys are involved. The storage
  pattern is currently in `apps/cash/src/store/`; extract to a shared package
  the second time a vertical needs it.
- **Feature components are prop-driven.** No tab/feature component reads
  directly from a Zustand store — data flows in from the app shell.
- **Updater-pattern setters.** Store setters accept `T | ((prev: T) => T)`.

## Adding a new vertical (apps/mind, future)

1. Scaffold `apps/<name>/` as a sibling of cash/health — copy the Vite +
   TS + Tailwind 4 setup.
2. Set `"name": "@currant/<name>"` in its `package.json`. npm workspaces
   auto-detects it from the `apps/*` glob.
3. Add `"@currant/ui": "*"` to its dependencies; have its `styles.css` do
   `@import "@currant/ui/tokens.css"` and declare the required palette vars
   in `:root` (contract documented in `packages/ui/README.md`).
4. Add a per-app `CLAUDE.md` + `README.md`.
5. As soon as a second pattern duplicates (auth, storage adapter, ErrorBoundary),
   extract into `packages/<name>` rather than copying again. The Rule of Three
   doesn't apply here — Rule of Two is fine for cross-vertical extraction.

## Common commands (from repo root)

```bash
npm install                      # install all workspaces

npm run cash                     # start cash dev server (alias: npm run web)
npm run health                   # start health dev server
npm run ingest                   # cash CLI: ingest a bank-export CSV
npm run build                    # build cash for production
npm run build:cash               # same as above, explicit
npm run build:health             # build health for production
```

Per-app scripts (tests, capacitor sync, etc.) live in each app's `package.json`.

## Supabase / auth

One Supabase project for the whole suite. Auth is shared (`auth.users` table).
Per-app schemas: `cash.*`, `health.*`, `mind.*`, with `public.profiles` keyed
by user id for cross-app metadata.

Cash currently runs fully local-first; cloud sync via Supabase is optional
and gated by `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Health will
inherit the same pattern when its storage layer lands.

## Memory

Durable suite-level decisions (naming, domain, iOS strategy) are stored in
your auto-memory. Refer there before relitigating architecture choices.
