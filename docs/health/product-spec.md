# Product Spec — Currant Health

**Scope:** the Health vertical (body/fitness). Suite-wide concerns live in
[`suite-overview.md`](../suite-overview.md).

**Status:** scaffolded but functional. The flow below is implemented; the
checklist captures what exists today versus what's still open.

Legend: `[x]` shipped, `[ ]` not shipped.

## Flow

```
Onboarding → Dashboard → Weekly Check-in
```

`App.tsx` routes between these based on profile state (no onboarding profile →
wizard; otherwise the dashboard, with the weekly check-in surfaced when due).

## Onboarding

- [x] Onboarding wizard to capture initial profile / baseline.
- [ ] (Document the exact steps once they stabilise.)

## Dashboard

- [x] Body/fitness dashboard summarising current state and recent check-ins.
- [ ] Measurement trend charts.

## Weekly check-in

- [x] Weekly check-in form (the Health cadence is weekly, vs Cash's monthly).
- [ ] Reminder/nudge when a check-in is due.

## Not yet started

- [ ] Workout logging.
- [ ] Measurements history as a first-class entity.
- [ ] Cloud sync (Supabase) — Health currently local-first only.
- [ ] Feed into the Life dashboard via `verticalData.ts`.

> Source of truth is the code under `apps/health/src/features/` (`onboarding`,
> `dashboard`, `checkIn`). Update this spec as features land.
