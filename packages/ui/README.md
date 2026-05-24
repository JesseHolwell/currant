# @currant/ui

Shared design system for the Currant suite. Imported by every vertical so the
typography, shape, and core color slots stay coherent across Cash, Health,
Mind, and Life.

## What's in here

- **`src/tokens.css`** — fonts, radii, the Tailwind `@theme` mapping that
  binds utility classes (`bg-accent`, `text-ink`, …) to per-app CSS vars,
  and universal element resets. Imported via `@import "@currant/ui/tokens.css"`.

## What's NOT in here

- Component CSS (buttons, form controls, layout primitives) — those belong
  in `apps/<vertical>/` for now. Lift them up when a second vertical reaches
  for the same component.
- Per-app palettes — each vertical declares its own `:root` colour values.
  Cash uses currant-berry, Health uses verdant-green, etc.

## Contract apps must honour

Every app's `styles.css` must define these CSS vars in `:root` (and a dark
variant under `prefers-color-scheme: dark` / `[data-theme="dark"]`):

```
--accent        --accent-soft   /* brand accent + a low-alpha companion */
--ink           --muted         /* text */
--bg-main       --bg-surface    /* backgrounds */
--line                          /* borders */
--danger                        /* status */
```

Beyond that, an app can define whatever extra tokens it wants — they stay
local. Don't put app-specific tokens here; the moment a second app reaches
for the same token, then lift it.
