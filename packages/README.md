# packages/

Shared workspace packages used by apps in `apps/*`.

Empty for now. Extract code here only when a second consumer appears — don't
speculatively abstract from a single app. When `apps/health` (or any new
vertical) lands and starts duplicating something from `apps/cash`, lift it
into a package here.

## Planned packages (create lazily, when actually shared)

- **`@currant/ui`** — design tokens, Tailwind preset, shared primitive components,
  layout shell (Sidebar, ErrorBoundary). Each app picks its own accent colour on
  top of shared tokens.
- **`@currant/domain-core`** — pure cross-domain types & helpers (dates, money,
  ids). No React, no storage.
- **`@currant/storage`** — the local-first persistence pattern: Zustand
  `PersistStorage` adapters and the optional Supabase sync layer. Currently
  living inside `apps/cash/src/store/`.
- **`@currant/auth`** — Supabase client construction + auth slice. Shared so
  every app uses the same login session.

## Conventions when extracting

- Workspace name: `@currant/<name>`
- `"type": "module"`, `"main": "src/index.ts"` (consumed directly by Vite/Vitest
  via TS source — no build step needed inside the monorepo).
- Apps import as `import { x } from "@currant/ui"`.
- Each package owns its own `tsconfig.json` extending a future root
  `tsconfig.base.json` once we have one.
