# Currant

A suite of local-first life-tracking apps. Each vertical is its own product;
they share auth, design language, and an eventual cross-app aggregator
(Currant Life) plus AI layer.

Production domain: `currant.cash` (or the Vercel preview URL). `currant.au`
may be acquired later but nothing in the code requires it.

## The suite

| Vertical | What it tracks | Status |
|---|---|---|
| [Currant Cash](apps/cash/) | Finance — transactions, categories, forecasts, FIRE | shipping |
| [Currant Health](apps/health/) | Body — workouts, weekly check-ins, measurements | scaffolded |
| [Currant Mind](apps/mind/) | Mental wellbeing — daily tasks, mood, reflection | scaffolded |
| Currant Life | Cross-vertical dashboard at `currant.cash/` | shell's signed-in mode |

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
npm run mind             # Currant Mind on http://localhost:5176
```

The shell's vertical cards link to each app — in dev they point at the Vite
ports above; in production they resolve to relative paths on `currant.cash`.

Each app has its own README with vertical-specific instructions:

- [`apps/shell/README.md`](apps/shell/README.md)
- [`apps/cash/README.md`](apps/cash/README.md)
- [`apps/health/README.md`](apps/health/README.md)
- [`apps/mind/README.md`](apps/mind/README.md)

## Repo layout

```text
.
├─ apps/
│  ├─ shell/         Suite landing + auth + Life dashboard (currant.cash/)
│  ├─ cash/          Currant Cash — finance (currant.cash/cash)
│  ├─ health/        Currant Health — body/fitness (currant.cash/health)
│  ├─ mind/          Currant Mind — daily tasks + mood (currant.cash/mind)
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
to its own `dist/`. A single Vercel project serves them under one origin:
`/` → shell, `/cash/*` → cash, `/health/*` → health, `/mind/*` → mind. Same
origin matters because `localStorage` and Supabase cookies are origin-scoped
and the Life dashboard needs to read across every vertical.

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
npm run mind             # Mind dev server :5176
npm run ingest           # Cash CLI: ingest a bank-export CSV
npm run build:shell      # Build shell for production
npm run build:cash       # Build Cash for production
npm run build:health     # Build Health for production
npm run build:mind       # Build Mind for production
```

Per-app test/build/iOS scripts live in each app's `package.json`.

## Adding a new vertical

See the "Adding a new vertical" section of [`CLAUDE.md`](CLAUDE.md) for the
recipe. Short version: scaffold `apps/<name>/` as a sibling, add
`"@currant/ui": "*"`, declare the required palette vars in `:root`, and add a
per-app `CLAUDE.md` + `README.md`.

## Deploying

See [`DEPLOY.md`](DEPLOY.md). Single Vercel project builds all apps and
serves them under one origin (`currant.cash/`, `/cash`, `/health`, `/mind`).

## Product docs

Suite map and per-vertical specs live under [`docs/`](docs/):

- [`docs/suite-overview.md`](docs/suite-overview.md) — suite-level overview
- [`docs/cash/`](docs/cash/) — Cash product spec, user flows, ideas
- [`docs/health/`](docs/health/) · [`docs/mind/`](docs/mind/) · [`docs/shell/`](docs/shell/)
- [`docs/style-guide.md`](docs/style-guide.md) — suite design system
