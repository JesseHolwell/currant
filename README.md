# Currant

Turn bank CSV exports into a clear, local-first money dashboard with minimal friction.

`https://currant.cash`

## Privacy model

- All transaction data stays in the browser on the user's device.
- CSVs are parsed client-side.
- No backend or server-side financial data storage is required.
- Clearing browser storage for this app will remove saved CSVs, rules, and settings.

## Tech stack

- `Node.js + npm workspaces` (single command entry points)
- Web: `React + Vite + Recharts (Sankey)`
- Parsing/modeling: `TypeScript + Papa Parse`
- State: `Zustand` with localStorage persistence
- Testing: `Vitest` (domain unit tests)
- iOS: `Capacitor` (wraps the web build in a native `WKWebView`)

## Quick start

```bash
npm install
npm run web
```

Then open the local Vite URL (usually `http://localhost:5173`).
Upload your CSV in the `Data Source` panel.

If you want to keep personal aliases, categories, accounts, or goals out of git,
copy `apps/cash/src/domain/config/profile.example.json` to
`apps/cash/src/domain/config/profile.local.json` and edit the local file instead.
The local profile is gitignored and overrides the committed example defaults.

## Product spec

- Feature scope and delivery status: [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md)

## Core workflow

1. Export CSV from your bank.
2. Start UI: `npm run web`.
3. Upload CSV in the app.
4. Review and adjust coverage dates in the `Transaction Data` tab.
5. Review Forecast, Accounts, Income, Expenses, and Categories tabs.
6. Tune categories and rules directly in the UI.

## Commands

```bash
npm run cash         # Start dev server (alias: npm run web)
```

```bash
# Run from apps/cash/ directory
npm test             # Run unit tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

Tests cover all pure domain functions in `apps/cash/src/domain/` — 7 test files, 132 tests.

### iOS / TestFlight

Prerequisites: macOS, Xcode, Apple Developer account.

```bash
# From apps/cash/
npm run ios          # build → sync to Xcode project → open Xcode
```

Or step by step:

```bash
cd apps/cash
npm run build        # compile to dist/
npx cap sync ios     # copy dist/ into the Xcode project
npx cap open ios     # open Xcode
```

In Xcode:

1. Select your Apple Developer team under _Signing & Capabilities_.
2. **Product → Archive** to build a release binary.
3. Upload to TestFlight via Xcode Organizer.

> Re-run `npx cap sync ios` (or `npm run ios`) after every web code change — it keeps the bundled assets up to date in the Xcode project.

Legacy (deprecated) CLI command:

- `npm run ingest -- --input ./bank-export.csv`

## Project structure

```text
.
├─ README.md
├─ PRODUCT_SPEC.md
├─ CLAUDE.md
├─ apps/
│  ├─ cash/                    # Currant Cash — finance dashboard (React + Vite)
│  │  └─ src/
│  │     ├─ App.tsx            # Thin shell: auth, routing, event handlers
│  │     ├─ main.tsx
│  │     ├─ domain/            # Pure business logic (no React)
│  │     ├─ store/             # Zustand slices with localStorage persistence
│  │     ├─ hooks/             # Thin wrappers + derived state
│  │     ├─ features/          # Tab components (one folder per feature)
│  │     └─ components/        # Shared / layout components
│  └─ cli/                     # Bank-export ingest CLI (legacy, deprecated)
├─ packages/                   # Shared workspace packages — extract lazily
└─ supabase/                   # Migrations + edge functions (shared across apps)
```
