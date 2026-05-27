# Currant Cash — Claude Code Instructions

Cash-specific guidance. See the repo-root `CLAUDE.md` for suite-wide
conventions (deployment model, monorepo layout, cross-app patterns).

## What this app is

Currant Cash is the finance vertical of the suite: bank-export ingest,
categorisation, transaction browsing, forecasting, accounts, and FIRE
projections. Local-first browser storage, optional Supabase cloud sync,
optional OpenAI categorisation.

## Commands

**From repo root:**
```bash
npm run cash             # dev server (alias: npm run web)
npm run build:cash       # production build
```

**From this directory (`apps/cash/`):**
```bash
npx tsc --noEmit         # type-check
npm test                 # unit tests (vitest, domain only)
npm run test:coverage    # coverage report
npm run ios              # build → cap sync → open Xcode
```

## Layers

```
src/
├─ App.tsx              Shell: auth state, cloud sync effects, route to <Dashboard/>
├─ main.tsx
├─ domain/              Pure TypeScript — no React, no localStorage. All business logic.
├─ store/               Zustand slices with localStorage persistence via PersistStorage adapters.
├─ hooks/               Thin wrappers around stores + useDashboardState (derived).
├─ features/            One folder per tab (transactions, categories, expenses, …).
├─ components/          Shared layout (Dashboard, Sidebar, WorkspaceHeader, ErrorBoundary).
└─ styles.css           Cash palette + component CSS. Imports @currant/ui/tokens.css.
```

## Cash-specific conventions

- **Derived state in `useDashboardState`.** All `useMemo` chains that compute
  from raw store data belong there — not in `App.tsx` or feature components.
- **localStorage keys are constants.** Defined in `src/domain/constants.ts`.
  Don't add direct `localStorage.getItem/setItem` calls anywhere outside a
  store — go through the store.
- **Sample mode** is the first-time-user experience: pre-loaded fixture data
  the user can dismiss to start fresh. See `domain/sampleData.ts`.
- **Currant berry** is the cash accent palette. Defined in `src/styles.css`
  `:root` and dark-mode override. Don't change without coordinating with the
  shared design tokens in `packages/ui/`.

## Adding a feature

1. Add types to `domain/types.ts`.
2. Add pure logic to `domain/<name>.ts`, export from `domain/index.ts`.
3. Add a store slice in `store/` if state needs persistence.
4. Add a hook in `hooks/` if the feature needs a thin wrapper.
5. Create `features/<name>/<Name>Tab.tsx`.
6. Wire the tab: add to `DashboardTab` union in `domain/types.ts`, register
   in `components/dashboard/Dashboard.tsx` (`TAB_META`, `OUTPUT_TABS`/`INPUT_TABS`,
   tab render block), pass props through `App.tsx`.

## Testing

Tests live in `src/domain/__tests__/`. Only pure domain functions are tested
— components have no unit tests yet. 160 tests across 8 files at the time of
writing.

## Supabase / auth

Configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. When
not configured, `isSupabaseConfigured` is `false` and all auth UI is hidden —
the app works fully without Supabase.

## FIRE Insights

Free-tier feature (not premium). Settings (currentAge, annualReturn,
multiplier) are persisted in `src/store/fire.ts` under the `fire_settings`
localStorage key.

## iOS

Capacitor wraps the web build in a `WKWebView`. Bundle id is `au.currant.cash`
(see `capacitor.config.ts`). Joins the shared App Group `group.au.currant` so
the Life app can read cash data.
