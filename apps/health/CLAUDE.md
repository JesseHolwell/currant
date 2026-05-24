# Currant Health — Claude Code Instructions

Health-specific guidance. See the repo-root `CLAUDE.md` for suite-wide
conventions.

## What this app is

Currant Health is the body/fitness vertical of the suite: workout logging,
weekly check-ins (weight + limb measurements), and onboarding (height,
starting weight, goals). Local-first; optional cloud sync via Supabase will
mirror Cash's pattern when added.

## Status

**Scaffold only.** Boots to a stub landing page that reflects an empty
`HealthState`. The domain types in `src/domain/types.ts` are the source of
truth for the data model and have not been wired to a store, hooks, or UI
yet.

## Commands

**From repo root:**
```bash
npm run health           # dev server (port 5175)
npm run build:health     # production build
```

**From this directory (`apps/health/`):**
```bash
npx tsc --noEmit         # type-check
npm test                 # unit tests (none yet)
```

## Planned layers (mirroring cash)

```
src/
├─ App.tsx              Shell: auth state, route to active surface.
├─ main.tsx
├─ domain/              Pure TypeScript — types + business logic.
│  └─ types.ts          Current sketch of the data model. ★ start here ★
├─ store/               Zustand slices (not yet implemented).
├─ hooks/               (not yet implemented)
├─ features/            One folder per surface: onboarding/, checkIn/, workout/.
├─ components/          Shared layout (not yet implemented).
└─ styles.css           Health palette (verdant green). Imports @currant/ui/tokens.css.
```

## Data model decisions baked in

See `src/domain/types.ts` for the full sketch. Key choices:

- **Canonical units in storage** — kg for weight, cm for length. UI converts.
- **Per-set granularity** — `ExerciseSet { reps, weightKg, rpe?, toFailure? }`
  rather than aggregate rep ranges. Costs a few taps; buys accurate volume
  graphs and 1RM estimates.
- **Exercise catalog separate from performed exercises** — renaming
  "Bench Press" doesn't rewrite history.
- **`HealthGoal` is a list** — overlapping goals are real, single-goal would
  force a false choice.
- **`startingWeightKg` is frozen** — current weight derives from latest
  `WeeklyCheckIn`. Don't read profile for current weight.
- **`LimbMeasurements` fully optional** — user records only what they care
  about.

## Deferred (intentionally not modelled yet)

- **Cardio sessions** — walking, cycling, running. Will become a sibling
  `CardioSession` type with distance + duration + optional pace/HR. Doesn't
  fit the reps/sets shape.
- **Photo progress** — front/side/back per check-in. Local blob storage is
  messy; deferred to phase 2.
- **Training experience level** — only add if AI suggestions need it.

## Build order when picking this up

1. Wire the storage layer (mirror cash's `store/` pattern; consider extracting
   the `PersistStorage` adapter into `packages/storage` at this point).
2. Build the onboarding flow first — height, starting weight, goals. Sets the
   profile.
3. Build the workout-entry surface next — it's the highest-friction surface
   and worth designing carefully (one-handed, fast taps, plate math for
   barbell exercises).
4. Weekly check-in last — single screen, optional fields, mostly numeric.

## iOS

Will ship as a separate App Store app (`au.currant.health`). Joins the shared
App Group `group.au.currant` so the Life app can read workout history and
check-in data.
