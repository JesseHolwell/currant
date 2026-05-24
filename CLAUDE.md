# Currant — Claude Code Instructions

## Repo layout

This is an npm-workspaces monorepo. Each vertical lives under `apps/`.

```
apps/cash/      The finance dashboard (React + Vite). Local-first, optional Supabase sync, optional OpenAI categorisation.
apps/cli/       Bank-export ingest CLI. Reads from data/raw and rules/, writes JSON into apps/cash/public.
packages/       Shared workspace packages (empty for now — extract lazily; see packages/README.md).
data/           Raw / processed CSV + JSON used by the ingest CLI.
rules/          Category + payroll rules for the ingest CLI.
supabase/       Supabase migrations + edge functions (shared across apps).
docs/           Product docs.
```

**Start cash dev server:** `npm run cash` (alias: `npm run web`) from repo root
**Type-check:** `cd apps/cash && npx tsc --noEmit`
**Build cash:** `cd apps/cash && npm run build` (or `npm run build` from root)
**Tests:** `cd apps/cash && npm test`
**Ingest CSV:** `npm run ingest` from repo root

## apps/cash architecture layers

```
domain/       Pure TypeScript — no React, no localStorage. All business logic lives here.
store/        Zustand slices. Each slice owns its localStorage keys via persist middleware.
hooks/        Thin wrappers around stores + useDashboardState (derived/computed state).
features/     One folder per tab. TabComponent.tsx + any tab-specific sub-components.
components/   Shared layout: Dashboard.tsx, Sidebar.tsx, WorkspaceHeader.tsx, ErrorBoundary.tsx.
App.tsx       Shell only: auth state, cloud sync effects, event handlers, routes to <Dashboard />.
```

## Key conventions

- **Domain functions are pure.** No side effects, no React, no localStorage in `domain/`.
- **Zustand stores own persistence.** Do not read/write localStorage directly for app state — go through the store. Each store uses custom `PersistStorage` adapters when multiple keys are involved (categories, accounts, forecast).
- **Updater pattern on setters.** Store setters accept `T | ((prev: T) => T)` so callers can use either form.
- **Derived state lives in `useDashboardState`.** All `useMemo` chains that compute from raw store data belong there, not in App.tsx or components.
- **Feature components are prop-driven.** No feature component reads directly from a Zustand store — all data flows in from App.tsx via Dashboard.tsx props.

## Adding a new feature (within apps/cash)

1. Add types to `domain/types.ts`
2. Add pure logic to a `domain/*.ts` file, export from `domain/index.ts`
3. Add a store slice in `store/` if state needs persistence
4. Add a hook in `hooks/` if the feature needs a thin wrapper
5. Create `features/<name>/<Name>Tab.tsx`
6. Add the tab to `domain/types.ts` (`DashboardTab` union), `Dashboard.tsx` (`TAB_META`, `OUTPUT_TABS`/`INPUT_TABS`, tab render block), and wire props through `App.tsx`

## Adding a new vertical (apps/health, apps/mindset, …)

1. Scaffold `apps/<name>/` as a sibling of `apps/cash` (same Vite + React + TS + Tailwind stack).
2. Set `"name": "@currant/<name>"` in its package.json — npm workspaces will pick it up automatically.
3. As soon as you find yourself copying code from `apps/cash` (design tokens, the Supabase client, the storage adapter pattern), extract it into `packages/<name>/` and import from there. See `packages/README.md` for the intended package set.

## Testing

Tests live in `apps/cash/src/domain/__tests__/`. Run with `npm test` in `apps/cash/`. Coverage: `npm run test:coverage`.

Only domain functions are unit-tested. Components are not tested yet.

## localStorage keys

Defined as constants in `apps/cash/src/domain/constants.ts`. The stores own these keys — don't add new direct `localStorage.getItem/setItem` calls in components or App.tsx. Use a store.

## Supabase / auth

Configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars. When not configured, `isSupabaseConfigured` is `false` and all auth UI is hidden. The app works fully without Supabase. When additional apps land, they share the same Supabase project — namespace tables by app (e.g. `cash.transactions`, `health.workouts`).

## FIRE Insights

Free-tier feature (not premium). Settings (currentAge, annualReturn, multiplier) are persisted in `apps/cash/src/store/fire.ts` under the `fire_settings` localStorage key.
