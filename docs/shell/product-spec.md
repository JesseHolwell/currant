# Product Spec — Currant Shell (Landing + Life)

**Scope:** the suite shell. The shell is two things at one URL
(`currant.cash/`): the **marketing landing** for signed-out visitors, and the
**Life dashboard** for signed-in visitors. Life is not a separate vertical —
it is the shell's signed-in mode. See
[`suite-overview.md`](../suite-overview.md).

**Status:** shipped.

Legend: `[x]` shipped, `[ ]` not shipped.

## Landing (signed-out)

- [x] Marketing landing at the origin root for unauthenticated visitors.
- [x] Suite framing + vertical cards linking to each app (`localhost:5174` in
  dev, `/cash` etc. in prod via `import.meta.env.DEV`).
- [x] Sign-in entry point (hidden when Supabase is not configured).

## Life dashboard (signed-in)

- [x] Cross-vertical dashboard shown to signed-in visitors at the same URL.
- [x] Cross-app data read via `apps/shell/src/lib/verticalData.ts` — the only
  place that reads other verticals' localStorage directly.
- [x] Aggregate stats across verticals.
- [ ] Pending-nudges surface (cross-vertical "what needs attention").
- [ ] Richer cross-vertical insights / AI layer.

## Auth

- [x] Shared `@currant/auth` — sign-in here carries across every vertical on
  the same origin.

> Source of truth is the code under `apps/shell/src/features/` (`landing`,
> `life`) and `apps/shell/src/lib/verticalData.ts`. Update this spec as the
> Life dashboard grows.
