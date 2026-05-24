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
| Currant Mind | Mental wellbeing — journal, mood, meditation | not started |
| Currant Life | Cross-vertical aggregator + AI analytics | not started |

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
npm run cash             # start Currant Cash on http://localhost:5174
npm run health           # start Currant Health on http://localhost:5175
```

Each app has its own README with vertical-specific instructions:

- [`apps/cash/README.md`](apps/cash/README.md)
- [`apps/health/README.md`](apps/health/README.md)

## Repo layout

```text
.
├─ apps/
│  ├─ cash/          Currant Cash — finance dashboard
│  ├─ health/        Currant Health — body/fitness tracker
│  └─ cli/           Bank-export ingest CLI for cash (deprecated)
├─ packages/
│  └─ ui/            @currant/ui — shared design tokens
├─ data/             Cash ingest inputs (raw + processed CSVs)
├─ rules/            Cash categorisation + payroll rules
├─ supabase/         Migrations + edge functions (shared across apps)
├─ docs/             Product docs
├─ CLAUDE.md         Suite-level Claude Code instructions
└─ README.md         You are here
```

## How the suite fits together

**Web** is a single origin (`currant.au`) with path-based routes per
vertical — `/cash`, `/health`, `/mind`, `/life`. Same-origin matters because
`localStorage` is origin-scoped and the Life aggregator needs to read across
every vertical.

**iOS** ships one App Store app per vertical (one icon, one purpose). They
share an App Group container; the Life app reads JSON the verticals write
into the shared container.

**Auth + sync** happens through one shared Supabase project. Auth is in
`auth.users`; per-app schemas keep their tables namespaced (`cash.*`,
`health.*`, `mind.*`).

## Commands

```bash
npm run cash             # Cash dev server (alias: npm run web)
npm run health           # Health dev server
npm run ingest           # Cash CLI: ingest a bank-export CSV
npm run build:cash       # Build Cash for production
npm run build:health     # Build Health for production
```

Per-app test/build/iOS scripts live in each app's `package.json`.

## Adding a new vertical

See the "Adding a new vertical" section of [`CLAUDE.md`](CLAUDE.md) for the
recipe. Short version: scaffold `apps/<name>/` as a sibling, add
`"@currant/ui": "*"`, declare the required palette vars in `:root`, and add a
per-app `CLAUDE.md` + `README.md`.

## Product spec

Feature scope and delivery status: [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md)
