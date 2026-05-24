# Deploying Currant

The whole suite ships as **one Vercel project** that builds every app
(shell + cash + health + mind), stitches them into a single `dist/`, and
serves them under one origin:

```
currant.au/         → apps/shell/dist   (landing + Life dashboard)
currant.au/cash/    → apps/cash/dist
currant.au/health/  → apps/health/dist
currant.au/mind/    → apps/mind/dist
```

Same origin matters — `localStorage` is origin-scoped and the Life
dashboard reads across every vertical. Subdomains would break that.

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

## First-time setup

### 1. Vercel project

1. **Import** the repo in Vercel.
2. **Framework Preset:** `Other` (Vercel reads `vercel.json` for the rest).
3. **Root Directory:** repo root (default).
4. **Install Command:** `npm install` (default).
5. **Build Command:** leave as inherited from `vercel.json`.
6. **Output Directory:** leave as inherited from `vercel.json`.
7. **Node Version:** 20.x or 22.x (both work).

### 2. Environment variables

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

### 3. Supabase redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**, add both
the production and local origins to the allowed redirect list:

```
https://currant.au
https://currant.au/
https://*.vercel.app          # preview deploys
http://localhost:5170         # shell
http://localhost:5174         # cash
http://localhost:5175         # health (no auth yet, but harmless)
http://localhost:5176         # mind   (no auth yet, but harmless)
```

The auth flow uses `window.location.origin` as the `redirectTo`, so every
origin you might sign in from needs to be allow-listed.

### 4. Custom domain

1. In **Vercel → Domains**, add `currant.au` and `www.currant.au`.
2. In your DNS provider, point an `A` record (or `ALIAS`/`ANAME`) for
   `currant.au` to Vercel's IPs, and a `CNAME` for `www.currant.au` to
   `cname.vercel-dns.com`. Vercel's UI walks you through the exact values.
3. Vercel auto-provisions a TLS cert via Let's Encrypt.

## Verifying a deploy

After Vercel finishes building, check:

- `https://currant.au/` — marketing landing (signed-out)
- `https://currant.au/cash/` — Cash SPA loads, no console errors
- `https://currant.au/health/` — Health SPA loads
- `https://currant.au/mind/` — Mind SPA loads
- Sign in via Google → returns to `currant.au/` showing the Life dashboard

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

## Things that aren't deployed (yet)

- **iOS apps.** Capacitor wrappers per vertical ship via TestFlight, not
  Vercel. See [`apps/cash/README.md`](apps/cash/README.md) for the iOS
  build process. Bundle ids: `au.currant.{cash,health,mind,life}`.
- **`@currant/cli`.** The bank-CSV ingest CLI is a local dev tool, not a
  shippable artifact.
