# Currant Mind

The mental wellbeing vertical of the [Currant suite](../../README.md). A
minimum daily task tracker plus a 1-5 mood log. Intentionally plain — built
to prove the suite's architecture absorbs new verticals quickly, not to be
a sophisticated habits product.

## What it does

- **Tasks** — user-defined trackable items ("Meditated", "Hit nutrition goal",
  "Went to gym", etc.). Five seed tasks ship out of the box; edit / add /
  delete in the Tasks tab.
- **Today** — set today's mood (1-5 emoji buttons), tick tasks off, optional
  notes. Total interaction targets <10 seconds.
- **Trends** — 30-day window with summary stats (days logged, avg mood,
  completion %), a CSS heatmap (each square = one day, darker = more tasks
  done), and per-task completion-rate bars.

Local-first. Stores live in `localStorage` under `mind_tasks` and
`mind_logs`. No cloud sync wired yet — will mirror Cash's pattern when added.

## Run it

From the repo root:

```bash
npm install
npm run mind             # opens on http://localhost:5176
```

From this directory (`apps/mind/`):

```bash
npm test                 # unit tests (none yet)
npx tsc --noEmit         # type-check
npm run build            # production build
```

## Project layers

```text
src/
├─ App.tsx              Shell: tab nav between Today / Trends / Tasks
├─ main.tsx
├─ domain/              Pure types + utils + constants + seed task list
├─ store/               Zustand persisted slices (tasks, logs)
├─ features/
│  ├─ today/            TodayView — mood, checklist, notes
│  ├─ tasks/            TasksManager — add / inline-edit / delete
│  └─ trends/           TrendsView — stats, heatmap, per-task bars
└─ styles.css           Mind palette (purple). Imports @currant/ui/tokens.css.
```

## Conventions / gotchas

- Don't pass a selector that returns a fresh array/object to
  `useStore(selector)` — it triggers infinite re-renders. Subscribe to raw
  state and derive with `useMemo`. (Past mistake, see suite-level memory.)
- Seed tasks live in `domain/constants.ts`. `Reset` wipes user tasks and
  re-seeds.
- Today's log is keyed by `date` (YYYY-MM-DD). One log per calendar day —
  editing replaces fields in place.

## iOS

Will ship as a separate App Store app (`au.currant.mind`) under the shared
App Group `group.au.currant`. Not yet configured.
