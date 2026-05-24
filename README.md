# Currant

A suite of local-first life-tracking apps. Each vertical is its own product;
they share auth, design language, and an eventual cross-app aggregator
(Currant Life) plus AI layer.

Production domain: `currant.au` *(suite goes live here once Life is ready;
Cash is currently solo on `currant.cash`)*.

## The suite

| Vertical | What it tracks | Status |
|---|---|---|
| [Currant Cash](apps/cash/) | Finance — transactions, categories, forecasts, FIRE | shipping |
| [Currant Health](apps/health/) | Body — workouts, weekly check-ins, measurements | scaffolded |
| [Currant Mind](apps/mind/) | Mental wellbeing — daily tasks, mood, reflection | scaffolded |
| Currant Life | Cross-vertical dashboard at `currant.au/` | shell's signed-in mode |

## Privacy model

- All user data stays in the browser on the user's device by default.
- Optional Supabase cloud sync enables cross-device access.
- iOS apps share an App Group so the Life aggregator can read across
  verticals on device without requiring the network.

## Tech stack

- **Monorepo:** Node.js + npm workspaces
- **Web:** React 18 + Vite 5 + TypeScript 5 + Tailwind 4
- **State:** Zustand with `localStorage` persistence
- **Cloud (optional):** Supabase (auth + Postgres)
- **iOS:** Capacitor, one app per vertical, App Group `group.au.currant`
- **Testing:** Vitest (domain-only unit tests)

## Quick start

```bash
npm install              # install all workspaces
npm run shell            # suite landing + auth on http://localhost:5170
npm run cash             # Currant Cash on http://localhost:5174
npm run health           # Currant Health on http://localhost:5175
```

The shell's vertical cards link to each app — in dev they point at the Vite
ports above; in production they resolve to relative paths on `currant.au`.

Each app has its own README with vertical-specific instructions:

- [`apps/shell/README.md`](apps/shell/README.md)
- [`apps/cash/README.md`](apps/cash/README.md)
- [`apps/health/README.md`](apps/health/README.md)

## Repo layout

```text
.
├─ apps/
│  ├─ shell/         Suite landing + auth + vertical switcher (currant.au/)
│  ├─ cash/          Currant Cash — finance (currant.au/cash)
│  ├─ health/        Currant Health — body/fitness (currant.au/health)
│  └─ cli/           Bank-export ingest CLI for cash (deprecated)
├─ packages/
│  ├─ auth/          @currant/auth — Supabase client + useAuth hook
│  └─ ui/            @currant/ui — shared design tokens
├─ data/             Cash ingest inputs (raw + processed CSVs)
├─ rules/            Cash categorisation + payroll rules
├─ supabase/         Migrations + edge functions (shared across apps)
├─ docs/             Product docs
├─ CLAUDE.md         Suite-level Claude Code instructions
└─ README.md         You are here
```

## How the suite fits together

**Web — per-app builds on one origin.** Each vertical builds independently
to its own `dist/`. The host (Vercel/Cloudflare/nginx) rewrites paths to
the right vertical: `/` → shell, `/cash/*` → cash, `/health/*` → health.
Same origin matters because `localStorage` and Supabase cookies are
origin-scoped and the Life aggregator needs to read across every vertical.

Per-app builds (instead of a single SPA with lazy routes) keeps each
vertical standalone — no shared mount points, independent deploys, better
cache hits per app.

**iOS** ships one App Store app per vertical (one icon, one purpose). They
share an App Group container; the Life app reads JSON the verticals write
into the shared container.

**Auth + sync** flows through one Supabase project consumed via
[`@currant/auth`](packages/auth/). One sign-in, every vertical sees the
session. Per-app Postgres schemas keep tables namespaced (`cash.*`,
`health.*`, `mind.*`).

## Commands

```bash
npm run shell            # Shell (landing + auth) dev server :5170
npm run cash             # Cash dev server :5174 (alias: npm run web)
npm run health           # Health dev server :5175
npm run ingest           # Cash CLI: ingest a bank-export CSV
npm run build:shell      # Build shell for production
npm run build:cash       # Build Cash for production
npm run build:health     # Build Health for production
```

Per-app test/build/iOS scripts live in each app's `package.json`.

## Adding a new vertical

See the "Adding a new vertical" section of [`CLAUDE.md`](CLAUDE.md) for the
recipe. Short version: scaffold `apps/<name>/` as a sibling, add
`"@currant/ui": "*"`, declare the required palette vars in `:root`, and add a
per-app `CLAUDE.md` + `README.md`.

## Deploying

See [`DEPLOY.md`](DEPLOY.md). Single Vercel project builds all apps and
serves them under one origin (`currant.au/`, `/cash`, `/health`, `/mind`).

## Product spec

Feature scope and delivery status: [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md)
