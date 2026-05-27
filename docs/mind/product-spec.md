# Product Spec — Currant Mind

**Scope:** the Mind vertical (mental wellbeing — daily tasks, mood,
reflection). Suite-wide concerns live in
[`suite-overview.md`](../suite-overview.md).

**Status:** scaffolded but functional. Tab-based navigation with working
Zustand stores (`mind_tasks`, `mind_logs`).

Legend: `[x]` shipped, `[ ]` not shipped.

## Navigation

Three tabs: `Today`, `Trends`, `Tasks`.

## Today tab

- [x] Daily task checklist.
- [x] Mood capture for the day.
- [ ] Reflection / journaling prompt.

## Trends tab

- [x] Heatmap of activity/mood over time.
- [ ] Correlations (e.g. mood vs task completion).

## Tasks tab

- [x] Task CRUD (create / edit / delete recurring or one-off tasks).
- [ ] Task scheduling / cadence rules.

## Not yet started

- [ ] Cloud sync (Supabase) — Mind currently local-first only.
- [ ] Feed into the Life dashboard via `verticalData.ts`.

> Source of truth is the code under `apps/mind/src/features/` (`today`,
> `trends`, `tasks`). Update this spec as features land.
