# Currant Mind — Claude Code Instructions

Mind-specific guidance. See the repo-root `CLAUDE.md` for suite-wide
conventions.

## What this app is

The mental wellbeing vertical: daily task tracking + 1-5 mood. Intentionally
plain. Built to prove the suite's architecture absorbs new verticals fast,
not to ship a sophisticated habits product. Iterate later.

## Commands

**From repo root:**
```bash
npm run mind             # dev server (port 5176)
npm run build:mind       # production build
```

**From this directory (`apps/mind/`):**
```bash
npx tsc --noEmit         # type-check
npm test                 # unit tests (none yet)
```

## Layers

```
src/
├─ App.tsx              Shell with tab nav: Today / Trends / Tasks
├─ main.tsx
├─ domain/              Pure types (MindTask, MindDayLog, Mood) + utils + constants + seed tasks
├─ store/               Zustand slices — tasks.ts (catalog), logs.ts (daily entries)
├─ features/
│  ├─ today/            TodayView: mood picker + task checklist + notes
│  ├─ tasks/            TasksManager: add / inline-edit / delete
│  └─ trends/           TrendsView: 30-day window, stats, heatmap, per-task rates
└─ styles.css           Mind palette (purple). Imports @currant/ui/tokens.css.
```

## Conventions

- **Don't return fresh arrays/objects from Zustand selectors.** Subscribe to
  raw state, derive with `useMemo`. Hit this exact bug on first boot. See
  `feedback-zustand-selectors` memory.
- **One log per calendar day.** `MindDayLog.date` (YYYY-MM-DD) is the key.
  Editing today's log replaces fields in place via the store's `toggleTask`,
  `setMood`, `setNotes` actions.
- **Tasks ship with seeds.** Fresh installs get 5 default tasks from
  `domain/constants.ts > SEED_TASKS`. The store seeds on first
  initialisation; `reset()` re-seeds rather than empties.
- **Soft-delete via `archived`.** `removeTask()` hard-deletes; if a task has
  been used in past logs and the user wants to stop showing it without
  rewriting history, set `archived: true` instead. The Today view filters
  archived out; trends compute against active tasks only.

## Adding a feature

1. Add types to `domain/types.ts`.
2. Add pure logic to `domain/<name>.ts`, export from `domain/index.ts`.
3. Add a store slice in `store/` if state needs persistence.
4. Create `features/<name>/<Name>View.tsx`.
5. Wire into `App.tsx` — either as a new tab or as a sub-section of an
   existing surface.

## What this app reads / what reads it

- **Reads:** its own `mind_tasks` + `mind_logs` localStorage keys. Nothing else.
- **Read by:** the shell's Life dashboard (`apps/shell/src/lib/verticalData.ts`)
  reads `mind_tasks` and `mind_logs` to compute the summary card. If you
  change either store's persisted shape, update that reader too.

## iOS

Will ship as `au.currant.mind` under the shared App Group `group.au.currant`.
Not yet configured.
