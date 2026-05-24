# @currant/auth

Shared Supabase client + `useAuth` hook for the Currant suite. One project,
one session, every vertical sees the same signed-in user.

## What's in here

- **`supabase`** — the configured client. Use this for any Supabase query
  across the suite; don't construct a second client.
- **`isSupabaseConfigured`** — boolean: are the env vars set? Hide auth UI
  and cloud-sync paths when false; the app should still work fully offline.
- **`useAuth()`** — React hook returning `{ session, user, authLoading,
  signInWithGoogle, signOut }`. Manages the auth state subscription.

## Setup in a consuming app

Each app provides its own env vars (`.env.local`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=ey...
```

Import:

```ts
import { useAuth, isSupabaseConfigured } from "@currant/auth";

const { user, signInWithGoogle, signOut } = useAuth();
```

## Why a shared client matters

Every vertical hits the same `auth.users` row, so once a user signs in via
the shell (or any vertical), every other vertical's `useAuth()` immediately
returns that session. No per-app login. This is also why subdomains were
ruled out — the cookie + localStorage need to be on the same origin.
