# Currant Health

The body/fitness vertical of the [Currant suite](../../README.md). Workouts,
weekly check-ins, and onboarding measurements. Local-first; optional cloud
sync via Supabase will mirror Cash's pattern when added.

## Status

**Functional scaffold.** Onboarding → dashboard → weekly check-in works,
backed by Zustand stores (`store/profile.ts`, `store/checkIns.ts`). Workout
logging is the main surface still to build. The domain types in
[`src/domain/types.ts`](src/domain/types.ts) are the source of truth for the
data model.

## Run it

From the repo root:

```bash
npm install
npm run health           # opens on http://localhost:5175
```

From this directory (`apps/health/`):

```bash
npm test                 # unit tests (none yet)
npx tsc --noEmit         # type-check
npm run build            # production build
```

## Scope

**Onboarding** — *built*
- Height, sex (optional), birth date (optional), starting weight, goals.

**Weekly check-in** — *built*
- Weight (required).
- Limb circumferences (all optional — neck, chest, waist, hips, biceps,
  thighs, calves).
- Free-text notes.

**Workout session** — *not yet built*
- Pick exercises from an editable catalog.
- Per-set: reps × weight (+ optional RPE and to-failure flag).
- One-handed, low-friction entry is the design constraint.

See [`CLAUDE.md`](CLAUDE.md) in this directory for the data model rationale
and build order when picking this up.

## Project layers

```text
src/
├─ App.tsx              Shell: routes onboarding → dashboard → check-in
├─ main.tsx
├─ domain/              Pure business logic
│  └─ types.ts          ★ data model — read this first ★
├─ store/               Zustand slices: profile.ts, checkIns.ts
├─ hooks/               (planned) Thin wrappers + derived state
├─ features/            onboarding/, dashboard/, checkIn/ built; workout/ planned
├─ components/          (planned) Shared layout
└─ styles.css           Health palette. Imports @currant/ui/tokens.css.
```

## Deferred (intentionally not modelled yet)

- **Cardio sessions** — distance × duration × optional pace/HR. Will become a
  sibling `CardioSession` type when added.
- **Photo progress** — front/side/back per check-in. Local blob storage is
  messy; phase 2.
- **Training experience level** — only add if AI suggestions need it.

## iOS

Will ship as a separate App Store app (`au.currant.health`) under the shared
App Group `group.au.currant`. Not yet configured.
