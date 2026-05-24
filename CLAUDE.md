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
| Currant Mind | Mental wellbeing — daily tasks, mood, reflection | scaffolded |
| Currant Life | Cross-vertical dashboard | **not a separate vertical** — see below |

**Life is the shell's signed-in mode**, not its own app. Signed-out visitors
at the origin root see the marketing landing; signed-in visitors see a Life
dashboard (cross-vertical stats + pending nudges) at the same URL. The
cross-app data reader lives in `apps/shell/src/lib/verticalData.ts` and is
the only place that reads other verticals' localStorage directly.

## Repo layout

```
apps/shell/     Suite shell — marketing landing (signed out) + Life dashboard (signed in) at currant.au/
apps/cash/      Currant Cash — finance dashboard (currant.au/cash)
apps/health/    Currant Health — body/fitness tracker (currant.au/health)
apps/mind/      Currant Mind — daily tasks + mood (currant.au/mind)
apps/cli/       Bank-export ingest CLI for Cash (deprecated, optional)
packages/auth/  Shared Supabase client + useAuth hook (@currant/auth)
packages/ui/    Shared design tokens — fonts, radii, color slot bindings (@currant/ui)
packages/       Other shared packages get extracted here lazily — see packages/README.md
data/           Raw / processed CSV + JSON for the ingest CLI (Cash-only)
rules/          Category + payroll rules for the ingest CLI (Cash-only)
supabase/       Shared migrations + edge functions across the suite
docs/           Product docs
```

## Deployment model (committed direction)

**Production domain:** `currant.cash` (the only Currant domain currently
owned). `currant.au` is aspirational — may be acquired later, but nothing
in the code requires it.

**Web — per-app builds on one origin.** Each vertical builds independently
to its own `dist/`. Vercel serves them under one origin (currant.cash, or
the project's `*.vercel.app` URL — both work):

```
currant.cash/         → apps/shell/dist     (landing signed-out, Life dashboard signed-in)
currant.cash/cash/*   → apps/cash/dist      (Cash SPA)
currant.cash/health/* → apps/health/dist    (Health SPA)
currant.cash/mind/*   → apps/mind/dist      (Mind SPA)
```

Why same origin matters: `localStorage` is origin-scoped and the Life
aggregator needs to read across every vertical. Subdomains would break that.

Why per-app builds (not a single SPA with lazy routes): each vertical stays
a standalone Vite app — no refactoring of mount points, independent deploys,
better cache hits per app. Cross-vertical navigation is a full document
load, which is fine because state we care about (Supabase session,
localStorage) survives navigation on the same origin.

In dev, each app's Vite server runs on its own port (shell: 5170, cash: 5174,
health: 5175). The shell's vertical-card links use `import.meta.env.DEV` to
switch between `localhost:5174` (dev) and `/cash` (prod).

**iOS:** separate App Store app per vertical (one icon, one purpose). Bundle
ids follow reverse-DNS: `au.currant.cash`, `au.currant.health`, `au.currant.mind`.
The shell ships as `au.currant.life` — the iOS app whose home is the Life
dashboard. All apps share an App Group (`group.au.currant`) so Life can
read JSON the verticals write into the shared container.

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

npm run shell                    # start shell dev server (landing + auth) on :5170
npm run cash                     # start cash dev server (alias: npm run web) on :5174
npm run health                   # start health dev server on :5175
npm run ingest                   # cash CLI: ingest a bank-export CSV

npm run build:shell              # build shell for production
npm run build:cash               # build cash for production
npm run build:health             # build health for production
```

Per-app scripts (tests, capacitor sync, etc.) live in each app's `package.json`.

## Supabase / auth

One Supabase project for the whole suite, consumed via `@currant/auth`. Auth
is shared (`auth.users` table) so sign-in via the shell carries across every
vertical on the same origin. Per-app schemas: `cash.*`, `health.*`, `mind.*`,
with `public.profiles` keyed by user id for cross-app metadata.

Each app reads its own `.env.local`:
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
The shell, cash, and any vertical with cloud sync all point at the same
project. When the env vars are absent, `isSupabaseConfigured` is `false`
and the app runs fully local-first.

## Memory

Durable suite-level decisions (naming, domain, iOS strategy) are stored in
your auto-memory. Refer there before relitigating architecture choices.
