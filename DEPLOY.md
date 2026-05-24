# Deploying Currant

The whole suite ships as **one Vercel project** that builds every app
(shell + cash + health + mind), stitches them into a single `dist/`, and
serves them under one origin:

```
<origin>/         → apps/shell/dist   (landing + Life dashboard)
<origin>/cash/    → apps/cash/dist
<origin>/health/  → apps/health/dist
<origin>/mind/    → apps/mind/dist
```

Same origin matters — `localStorage` is origin-scoped and the Life
dashboard reads across every vertical. Subdomains would break that.

**Current production URL:** `currant.cash` (or the project's `*.vercel.app`
URL — both work, both are the same origin family from Vercel's perspective).
`currant.au` may be acquired later; nothing in the code requires it.

## How it works

- **[`vercel.json`](vercel.json)** tells Vercel to run `npm run build:all`
  and serve `dist/`. `trailingSlash: true` ensures `/cash` 308-redirects to
  `/cash/` so the browser uses the sub-path as the base URL for relative
  assets.
- **[`package.json` `build:all`](package.json)** runs each app's individual
  build, then [`scripts/assemble-dist.mjs`](scripts/assemble-dist.mjs)
  copies each `apps/*/dist` into a single `dist/` tree.
- Each vertical's Vite config uses `base: "./"` so its `index.html`
  references `./assets/...` — relative paths resolve correctly under any
  sub-path.

## Migrating the existing Vercel project

There's already a Vercel project deployed for Currant Cash from before the
monorepo restructure. It needs a small reconfiguration to pick up the new
multi-app build.

1. **Open the project in Vercel → Settings → General.**
2. **Root Directory:** make sure this is **empty / `.`** (repo root), not
   `web` or `apps/cash`. The `vercel.json` lives at the repo root and
   handles routing for all four apps. If Root Directory points at a
   sub-folder, Vercel will look for `vercel.json` inside that folder and
   miss the suite-wide config.
3. **Framework Preset:** `Other` (let `vercel.json` drive the build).
4. **Build Command:** leave blank (inherits `npm run build:all` from
   `vercel.json`).
5. **Output Directory:** leave blank (inherits `dist` from `vercel.json`).
6. **Install Command:** `npm install` (default).
7. **Node Version:** 20.x or 22.x.

Click **Save**, then trigger a redeploy from the **Deployments** tab
(latest commit → ⋯ → Redeploy).

If anything goes wrong and the project is too tangled to debug, you can
also delete the old project and re-import — DNS for `currant.cash` and the
Supabase URL allow-list are the only things to re-wire (see below).

## Environment variables

Set these in Vercel **Project Settings → Environment Variables**, scope to
**Production + Preview + Development**:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

Vercel injects these at build time. Every app that uses `@currant/auth`
(currently shell + cash) picks them up automatically.

> Health and Mind don't use Supabase yet — env vars are harmless if
> present.

## Supabase redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**, the
allowed redirect list needs every origin that might initiate sign-in:

```
https://currant.cash
https://currant.cash/
https://*.vercel.app          # preview deploys
http://localhost:5170         # shell
http://localhost:5174         # cash
http://localhost:5175         # health (no auth yet — harmless)
http://localhost:5176         # mind   (no auth yet — harmless)
```

The auth flow uses `window.location.origin` as the `redirectTo`, so every
origin you might sign in from needs to be allow-listed. Add additional
URLs (e.g. `currant.au`) later as you acquire them.

## Custom domain

`currant.cash` should already be pointed at the existing Vercel project. If
not, in **Vercel → Domains**, add `currant.cash` and `www.currant.cash`,
then follow Vercel's DNS instructions at your registrar.

The Vercel preview URL (`<project>.vercel.app`) is always live and is fine
to share / test against.

## Verifying a deploy

After Vercel finishes building, check on whichever origin you're using:

- `<origin>/` — marketing landing (signed-out)
- `<origin>/cash/` — Cash SPA loads, no console errors
- `<origin>/health/` — Health SPA loads
- `<origin>/mind/` — Mind SPA loads
- Sign in via Google → returns to `<origin>/` showing the Life dashboard

## Local production-mode preview

Reproduce the production build + serve locally any time:

```bash
npm run build:all
npx serve dist -l 4321
```

Then open `http://localhost:4321/`, `/cash/`, `/health/`, `/mind/`.
Note: `serve`'s trailing-slash behavior isn't identical to Vercel — visit
URLs with the trailing slash explicitly during local testing.

## Adding a new vertical

When you add `apps/<name>` later:

1. Add `build:<name>` to root `package.json` mirroring the existing build scripts.
2. Append `&& npm run build:<name>` to `build:all`.
3. Add an entry to `APPS` in [`scripts/assemble-dist.mjs`](scripts/assemble-dist.mjs).
4. Add the vertical to the shell's landing + Life dashboard card lists.

Vercel picks up the changes on the next push — no project-level reconfig
needed.

## Installing as a PWA on iPhone

Every vertical (and the shell) ships as a Progressive Web App — you can add
each one to your iPhone home screen as a standalone "app" with its own
icon, no App Store required.

### Add to Home Screen

For each app you want as a homescreen icon, on the iPhone:

1. Open Safari (not Chrome — iOS requires Safari for PWA install) and
   navigate to the app's URL:
   - **Currant (Life dashboard):** `<origin>/`
   - **Currant Cash:** `<origin>/cash/`
   - **Currant Health:** `<origin>/health/`
   - **Currant Mind:** `<origin>/mind/`
2. Tap the **Share** button (square with up arrow).
3. Scroll down → **Add to Home Screen**.
4. Confirm the name and tap **Add**.

The icon lands on your home screen. Tapping it opens the app in standalone
mode — no Safari URL bar, no tabs, no back button. Direct to the surface,
which is the friction-killer point of this whole exercise.

### What's installed

| Tap this icon | Opens directly to |
|---|---|
| Currant      | Life dashboard (signed-in) / marketing landing (signed-out) |
| Cash         | Cash tabs (Dashboard, Transactions, etc.) |
| Health       | Health dashboard / onboarding |
| Mind         | Mind's Today tab — straight to mood + tasks for the day |

All four installs share the same `localStorage` because they're on the
same origin — your Cash data and Mind data are visible to each other,
which is exactly what the Life dashboard needs.

### Caveats

- iOS PWAs sometimes get evicted from cache if the app is unused for
  long stretches. Your `localStorage` data persists across that; only the
  app shell needs to reload. Adding a service worker would smooth this out
  (offline launches even when iOS evicts the cache) — not done yet.
- iOS doesn't currently support push notifications for PWAs added to
  the home screen unless you're on iOS 16.4+ AND the PWA is installed via
  Add to Home Screen (Safari only).
- If you sign in to Cash via the standalone PWA, the Supabase session
  cookie is stored in Safari's WebView, scoped to the PWA. Sign in once
  per installed app.

### Customising the icons later

Placeholder icons are generated by
[`scripts/generate-pwa-assets.mjs`](scripts/generate-pwa-assets.mjs) —
flat coloured square + serif letter per vertical. To swap them for real
artwork:

**Quick path** — drop replacement PNGs directly into each app's `public/`:
- `apps/<app>/public/apple-touch-icon.png` (180×180, used by iOS)
- `apps/<app>/public/icon-192.png` (192×192, used by Android + manifest)
- `apps/<app>/public/icon-512.png` (512×512, used by manifest)

The manifests and index.html already reference these filenames, so no
config changes needed. Just push and the new icons ship.

**Regenerating from a single source** — edit the `APPS` array in
`scripts/generate-pwa-assets.mjs` (change `bg`, `glyph`, etc.) and run:

```bash
npm run generate:pwa
```

That regenerates icons + manifests in one go.

## Things that aren't deployed (yet)

- **Native iOS apps via App Store.** Capacitor wrappers per vertical ship
  via TestFlight, not Vercel. Bundle ids are `au.currant.{cash,health,mind,life}`
  — aspirational (not tied to a domain you need to own; reverse-DNS is just
  a naming convention). For most use cases the PWA install above covers
  the same friction-reduction goal without App Store overhead.
- **`@currant/cli`.** The bank-CSV ingest CLI is a local dev tool.
