# Currant Shell

The suite entry point. Lives at `currant.cash/` in production. Handles:

- **Marketing landing** — describes each vertical (Cash, Health, Mind, Life)
  with status badges and per-brand accent dots.
- **Auth** — single sign-in via `@currant/auth` (Google OAuth through
  Supabase). Once signed in, the same session carries across every vertical
  on the same origin.
- **Vertical switcher** — clickable cards that link to each app. In dev
  they point at the Vite ports; in production they resolve to relative
  paths under `currant.cash`.

The shell does **not** host the verticals as nested routes. Each vertical
ships as its own standalone Vite build under a path on the same origin —
see the suite-level [`CLAUDE.md`](../../CLAUDE.md) for the deployment model.

## Run it

```bash
# from repo root
npm run shell            # http://localhost:5170
```

```bash
# from this directory
npx tsc --noEmit
npm run build
```

## Auth setup

Copy `.env.example` to `.env.local` and paste the Supabase project values —
the shell points at the same project as Cash. Without env vars the shell
shows a "Local-only mode" notice and the cards still link to each vertical.

## Dev affordance: `?dev=life`

In development (`import.meta.env.DEV`), appending `?dev=life` to the URL
forces the Life dashboard to render with a placeholder email, even when not
signed in. Useful for iterating on the dashboard without going through
Google OAuth each time. Gated to dev builds only — the production bundle
ignores the param.

## What's here vs. what's planned

| | Status |
|---|---|
| Landing hero + vertical grid | shipping |
| Google OAuth sign-in | shipping (when env vars set) |
| Post-auth switcher | shipping |
| Marketing copy / screenshots / pricing | not yet |
| Multi-provider auth (email, magic link, Apple) | not yet |
| Onboarding flow (welcome to the suite) | not yet |
