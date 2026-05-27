# Currant Cash

The finance vertical of the [Currant suite](../../README.md). Turn bank CSV
exports into a clear, local-first money dashboard with minimal friction.

## What it does

- Drop-zone import for CSV exports (Papa Parse, client-side).
- Auto-categorisation against editable rules (keyword + override files).
- Dashboard, Expenses, FIRE, Income, Accounts, Goals, Categories,
  Transactions, and Imports tabs.
- Optional AI-assisted categorisation (BYOK — bring your own OpenAI key).
- Optional Supabase cloud sync (works fully without it).
- iOS app via Capacitor (`au.currant.cash`, shipping under the suite's
  shared App Group).

## Privacy model

All transaction data stays in the browser on the user's device. CSVs are
parsed client-side. No backend or server-side financial storage is required.
Cloud sync is opt-in; without it, the app is fully local.

## Run it

From the repo root:

```bash
npm install
npm run cash             # opens on http://localhost:5174
```

From this directory (`apps/cash/`):

```bash
npm test                 # unit tests (Vitest, domain-only)
npm run test:watch
npm run test:coverage
npx tsc --noEmit         # type-check
npm run ios              # build → cap sync → open Xcode
```

## Personal config

To keep personal aliases, categories, accounts, or goals out of git, copy
[`src/domain/config/profile.example.json`](src/domain/config/profile.example.json)
to `src/domain/config/profile.local.json` and edit the local copy. The
`.local.json` file is gitignored and overrides the committed example.

## Core workflow

1. Export CSV from your bank.
2. `npm run cash`.
3. Upload CSV in the app's `Data Source` panel.
4. Adjust coverage dates in the `Imports` tab.
5. Review the Dashboard, Accounts, Income, Expenses, and Categories tabs.
6. Tune categories and rules directly in the UI.

## Project layers

```text
src/
├─ App.tsx              Shell: auth, cloud sync, route to <Dashboard/>
├─ main.tsx
├─ domain/              Pure business logic (no React, no localStorage)
├─ store/               Zustand slices with localStorage persistence
├─ hooks/               Thin wrappers + useDashboardState (derived)
├─ features/            One folder per tab
├─ components/          Shared layout (Dashboard, Sidebar, …)
└─ styles.css           Cash palette + components. Imports @currant/ui/tokens.css.
```

For per-feature conventions and "how to add a new feature", see
[`CLAUDE.md`](CLAUDE.md) in this directory.

## Tests

Tests live in `src/domain/__tests__/`. Only pure domain functions are tested
(components have no unit tests yet). Currently 160 tests across 8 files.

## iOS / TestFlight

Prerequisites: macOS, Xcode, Apple Developer account.

```bash
npm run ios              # build → cap sync → open Xcode
```

Or step by step:

```bash
npm run build            # compile to dist/
npx cap sync ios         # copy dist/ into the Xcode project
npx cap open ios         # open Xcode
```

In Xcode: select your team under _Signing & Capabilities_,
**Product → Archive**, then upload to TestFlight via Xcode Organizer.

> Re-run `npx cap sync ios` (or `npm run ios`) after every web code change.
