# Product Spec — Currant Cash

**Scope:** the Cash vertical only. Suite-wide concerns (the marketing landing,
the signed-in Life dashboard, auth) live in the shell — see
[`suite-overview.md`](../suite-overview.md) and [`docs/shell/`](../shell/).

Feature checklist for the product.  
Legend: `[x]` shipped, `[ ]` not shipped.

## Homepage / Landing page

> Note: the suite-level marketing landing now lives in the **shell**
> (`currant.cash/`), not in Cash. Cash still renders its own lightweight
> pre-onboarding entry point.

- [x] Standalone landing page shown before the app shell loads (unauthenticated entry point).
- [x] App name, tagline, and brief description of core functionality.
- [x] Feature highlights section (Dashboard, Expenses, FIRE Insights, Auto-categorisation, etc.).
- [x] Free vs premium tier comparison (what you get on each tier).
- [x] Three CTAs: `Sign up`, `Log in`, `Continue with free tier`.
- [x] `Continue with free tier` bypasses auth and goes straight to the app (local storage mode).
- [x] Signed-in users are redirected past the landing page directly into the app.

## Navigation and layout

- [x] Sidebar navigation. Current tabs in order: `Dashboard`, `Expenses`, `FIRE`,
  `Income`, `Accounts`, `Goals`, `Categories`, `Transactions`, `Imports`.
- [x] Honeyjar-inspired two-pane layout (left nav + right workspace).
- [x] Keep these tabs out of scope for now: `Cards`, `Investments`, `Scenarios`, `Projections`, `Reimburse`.

## Dashboard tab

> Formerly "Forecast". The net-worth forecast is now one card within the
> Dashboard, alongside the savings-rate gauge, FIRE timeline, net-worth
> summary, account trend, asset allocation, and spending breakdowns.

- [x] Line chart forecast for projected net worth over upcoming months.
- [x] Input for start net worth value.
- [x] Input for monthly delta override.
- [x] Inferred monthly delta from historical transaction cash flow.
- [x] Goal overlay line on forecast chart when goals exist.
- [ ] Compare multiple forecast scenarios.

## Accounts tab

- [x] User-defined accounts list with editable rows.
- [x] User-defined account categories (for bank, crypto, stocks, etc).
- [x] Asset vs liability account type (`Credit`/`Debit` style impact on net worth).
- [x] Automatic net worth calculation from account balances.
- [x] Account breakdown summary by category.
- [ ] CSV/account import for balances.

## Income tab

- [x] In-app payroll configuration editor (values aligned to payroll YAML concept).
- [x] Editable fields: net pay, gross pay, tax, super, tolerance, employer keywords.
- [x] Generated YAML snippet preview for `payroll.private.yml`.
- [x] Local browser persistence for income settings.
- [x] Make income configuration country-agnostic: user can add, remove, and rename arbitrary income/deduction fields (e.g. replace `super` with `401k`, remove tax fields entirely, etc.).
- [x] Remove hard-coded Australian payroll field assumptions from the data model and UI labels.

## Expenses tab

- [x] Sankey flow visualization from uploaded CSV transactions.
- [x] Chart mode toggle (`Raw Deposits`, `Modeled Salary`, `Expense Overview`).
- [x] Timeline filtering (`All data` and month selection).
- [x] Merchant detail mode toggle (`Summary` / `Detailed`).
- [x] Expense pie chart for category breakdown.
- [ ] Month-over-month comparison chart.

## Categories tab

- [x] Category taxonomy editor (category + subcategory definitions).
- [x] Add/delete/reset category setup from UI.
- [x] Transaction rule editor for categorization and nicknames.
- [x] Filter rules view by `Needs Category` or `All Debits`.
- [x] Apply manual rules to similar transactions.
- [x] Local browser persistence for category setup and rules.
- [ ] Rule suggestion helper from uncategorized transactions.

## Transactions tab

- [x] Transaction browser: list, drill-down, edit merchant/category/nickname.
- [x] Apply a manual edit to similar transactions (batch update).
- [x] Surface CSV import warnings/errors.

## Imports tab

> Formerly "Transaction Data".

- [x] Uploaded CSV batch list with local browser persistence.
- [x] Editable coverage start/end dates per CSV.
- [x] Coverage calendar showing which days are covered across uploaded files.
- [x] Delete individual CSV batches or clear all CSV data.

## Goals

- [x] Goal list with editable name/current/target values.
- [x] Three tracking modes: `manual`, `accounts` (sum selected accounts), `netWorth`.
- [x] Goal progress bars on the Dashboard and in the sidebar.
- [ ] Optionally mark goals as distinct so the funds are not counted twice.

## FIRE Insights tab

- [x] Dedicated tab in sidebar navigation (`FIRE`).
- [x] FIRE number calculator: target net worth = annual expenses × chosen multiplier (default 25×).
- [x] Projected retirement age based on current net worth, monthly savings rate, and assumed growth rate.
- [x] Savings rate tracker: monthly savings as a % of gross income.
- [x] Configurable inputs: expected annual return, safe withdrawal rate multiplier, current age.
- [x] Net worth projection chart (age vs net worth with FIRE number overlay).
- [x] Two-phase (bridge + post-preservation) model with `lockedUntilAge` super accounts and a preservation-age setting.
- [x] Two-Phase FIRE milestone cards displayed.
- [ ] Coast FIRE / Barista FIRE milestone numbers (see ideas.md #6).
- [ ] Milestone markers on the forecast chart (e.g. "Coast FIRE", "Lean FIRE", "Full FIRE").
- [ ] Spending vs net worth combined chart over time.

## Authentication

- [x] SSO sign-in (Google OAuth).
- [x] Anonymous / guest mode retained for users who don't sign in (local storage only, no sync).
- [x] Session persistence across browser tabs.
- [x] Settings tab handles display name, currency, birth year, and sign-out.
- [ ] Manage connected OAuth providers from settings.
- [ ] Auth gating: premium features require a signed-in account.

## Premium Tier

> The free tier continues to work fully offline with local browser storage. Premium unlocks cloud sync, AI features, and future paid capabilities.

- [ ] Define free vs premium feature boundary (see individual sections for per-feature flags).
- [ ] Paywall / upgrade prompt UI shown when a user attempts to access a premium feature.
- [ ] Premium status stored server-side and checked on sign-in (no payment integration yet — manual flag or invite code for initial rollout).
- [ ] Graceful degradation: if a user's subscription lapses, their data remains readable but cloud sync and AI features are paused.
- [ ] Foundation for future Stripe or similar payment integration (stub only, not implemented).

## Cloud Persistence (Premium)

> Sync is snapshot-based: the full app state serialises to a single Supabase
> `user_data` row per user (not per-entity tables).

- [x] Supabase backend (`user_data` snapshot row per user).
- [x] Real-time sync across devices/browsers via a Supabase Realtime channel (own-write dedupe).
- [x] Free tier continues to use local storage exclusively — no data sent to server.
- [x] Conflict resolution strategy for offline edits (last-write-wins as initial approach).
- [x] Data export/import: download or restore the full app state as JSON from Settings.
- [ ] On sign-in, offer to migrate existing local storage data to cloud (download/upload primitives exist; first-run migration flow not yet wired).

## Auto-categorisation (Premium)

- [x] Send uncategorised transactions to OpenAI for a first-pass category suggestion (`store/ai.ts` + `lib/openai`).
- [x] Suggestions displayed inline in the Categories tab with accept / reject / accept-all actions.
- [x] User can trigger re-categorisation on demand.
- [x] OpenAI API key configurable in settings (user-supplied key).
- [x] Free tier: no LLM categorisation; manual rules only.
- [ ] Accepted suggestions auto-create a transaction rule for future uploads.
- [ ] Category suggestions proposed for missing category definitions (new merchant types).

## Mobile App

> Implemented with **Capacitor** (wraps the web build in a `WKWebView`), not
> React Native/Expo. Bundle id `au.currant.cash`; shares App Group
> `group.au.currant` so the Life app can read Cash data.

- [x] Capacitor iOS wrapper (`npm run ios` → build → `cap sync ios` → Xcode).
- [x] Feature parity with web (it is the web build).
- [ ] CSV upload via iOS share sheet or Files app picker.
- [ ] Deployed to TestFlight for internal / beta testing.
- [ ] App Store submission out of scope for initial milestone.
- [x] Shared business logic is pure TypeScript in `domain/` (no DOM dependencies).

## Data ingestion

- [x] Upload bank CSV directly from web UI.
- [x] Persist uploaded CSV batches and merged transaction data in browser storage.
- [x] Normalize source rows into deterministic transaction records with stable IDs.
- [x] Support current CSV format (`Debit Amount`, `Credit Amount`, `Narrative`, and related fields).
- [x] Infer observed CSV date range from parsed transactions.
- [x] Allow manual coverage-date adjustments for historical period tracking.
- [ ] Ingest additional bank CSV formats.
- [ ] Add output JSON schema contracts.
- [ ] Add regression tests for classification and artifact stability.
- [x] Provide sample dataset to preview app before onboarding
