# Currant — Frontend Rewrite Spec

> **Purpose.** This document hands off the complete *functional* surface of the
> Currant suite to a frontend/design rewrite. It is deliberately **agnostic of
> visual style** — it names every screen and every element that must appear on
> screen, plus the data that drives each one. It does **not** prescribe layout,
> color, typography, spacing, or component shape. Those are the designer's call.
>
> Treat each bullet as "this information/control must be reachable here," not as
> "render it exactly like this."

---

## 0. The suite at a glance

Currant is a suite of **local-first** life-tracking apps on one origin
(`currant.cash`). There are four frontends to rewrite:

| # | Frontend | Lives at | Role |
|---|----------|----------|------|
| 1 | **Shell** (Home / Landing / Life) | `currant.cash/` | Marketing landing when signed out; cross-vertical "Life" dashboard when signed in |
| 2 | **Cash** | `currant.cash/cash` | Personal finance — net worth, spending, FIRE (the mature app) |
| 3 | **Health** | `currant.cash/health` | Body tracking — weight, measurements, weekly check-ins |
| 4 | **Mind** | `currant.cash/mind` | Mental wellbeing — daily mood, task tracking, trends |

Each is a standalone app, but they share **auth**, a **design-token system**,
and **local-first storage conventions**. A rewrite should make the four feel
like one product.

### Cross-cutting principles (apply to all four)

- **Local-first.** Every app works fully offline with no account. Data lives in
  the browser. Cloud sync is optional and only appears when configured.
- **One account, every vertical.** Auth is shared (Google OAuth). Signing in
  anywhere signs you in everywhere on the origin. Auth is *headless* today —
  each app draws its own sign-in/out controls. The only auth states to design
  for: *loading*, *signed out (auth available)*, *signed out (local-only, no
  auth configured)*, *signed in*.
- **Per-vertical brand accents.** Cash, Health, and Mind each have a distinct
  accent color expressed through shared semantic tokens (`--accent`,
  `--accent-soft`, `--ink`, `--muted`, `--bg-main`, `--bg-surface`, `--line`,
  `--danger`). The shell uses small per-vertical "accent dots" to color-code the
  three verticals. Light and dark mode are both expected.
- **Shared fonts (current):** DM Sans (body), Fraunces (display serif),
  JetBrains Mono (numbers/code). Treat as a starting point, not a constraint.
- **No real backend coupling.** All the data listed below is read from / written
  to local storage through each app's store. The spec lists *what data exists*
  so the design can surface it; it does not require any API.

---

## 1. Shell — Home / Landing / Life

One app, two faces, switched purely by auth state. Persistent global header on
every view.

### 1.1 Global header (all states)
- Currant wordmark / logo + "suite" label → links home (`/`).
- When signed in: user's email (can hide on small screens) + **Sign out**.
- When signed out: no auth controls beyond what the landing offers.

### 1.2 Landing page (signed out)
- **Hero:** eyebrow line ("a suite of local-first life trackers"), main headline
  (money / body / mind, all in one place), supporting paragraph explaining the
  local-first default + optional sync.
- **Sign-in prompt**, conditional on whether auth is configured:
  - Auth available → "one account, every vertical" + **Sign in with Google**.
  - Auth not configured → a "local-only mode" notice (apps still work offline).
- **Vertical grid** — three cards (Cash, Health, Mind). Each card shows:
  - vertical name + brand accent dot,
  - status badge (*Shipping* / *In progress* / *Planned*),
  - a short tagline,
  - a description,
  - a CTA ("Try it →") when the vertical is openable; planned verticals show no CTA.
- **Feature callouts** — two explanatory blurbs: "local-first by default" and
  "one signed-in home."
- **Footer** — local-first messaging + branding line ("one suite, one login,
  three apps").

### 1.3 Life dashboard (signed in)
- **Greeting block:** today's date, a time-of-day greeting with the user's first
  name, and a subheading ("your overview across Cash, Health, and Mind").
- **Pending-actions banner** (only shown when something is pending). A count
  header ("X things for you") plus a list of clickable nudges; each nudge has an
  accent dot, a label, a hint, and links into the relevant vertical. Conditions:
  - Health check-in overdue (7+ days since last),
  - Mind day not logged today,
  - Cash has no import in 30+ days.
- **"Your week" — three vertical stat cards** (Cash / Health / Mind). Each card
  is clickable into its vertical and has an **empty state** and a **populated
  state**:
  - **Cash** — populated: net worth (short-form currency) + transaction count +
    "last imported N days ago." Empty: "Import a CSV →" prompt.
  - **Health** — populated: current weight + check-in count + "last logged N
    days ago." Empty: "Set up your profile →" prompt.
  - **Mind** — populated: average mood over 30 days + "X/30 days logged" +
    optional streak. Empty: "Log your first day →" prompt.
- **Install-PWA card** (only when not already installed *and* not previously
  dismissed): headline, explanation that each app gets its own home-screen icon,
  a dismiss control, step-by-step iPhone install instructions, and four
  "open" links (Life, Cash, Health, Mind).
- **Footer** — same as landing.

### 1.4 Navigation summary
- Landing card / Life card / pending nudge → opens the relevant vertical.
- Sign in with Google / Sign out → auth.
- Logo → home.
- (No modals, no extra routes — the shell is link-and-state-swap only.)

---

## 2. Cash — personal finance

The most mature app. A workspace with a persistent top bar and a tab navigation.
Below: the entry flows, the recurring chrome, then every tab.

### 2.1 Entry flows

**Landing (unauthenticated entry to Cash):**
- App branding, **Continue as guest (free tier)**, **Sign in with Google**,
  **Preview sample data**, and a back control for returning users with data.

**Onboarding wizard (6 steps, with progress indicator + back/skip/next + a
"why this matters" note per step):**
1. **About you** — display name, birth year (with age echo), currency.
2. **Income** — pay frequency, gross per period, net take-home per period,
   optional payroll detail, annualized echo.
3. **Accounts** — add/edit/delete accounts (name, category, asset/liability,
   value) with a running net-worth subtotal.
4. **Upload CSV** — bank export file input with status messages.
5. **Categorize** — category-definition editor (same as Categories tab).
6. **Goals** — add/edit/delete goals (same as Goals tab).

**Monthly check-in wizard (3 steps, auto-triggered when no import in
`payFrequency` days; progress indicator + back/skip/next + exit-to-dashboard):**
1. **Balances** — update account balances.
2. **Import** — upload a CSV.
3. **Categorize** — review/rule transactions.

### 2.2 Persistent chrome
- **Top bar:** app name/logo, sample-mode banner + exit (when in sample mode),
  light/dark toggle, sign-in/sign-out, home link.
- **Tab navigation** (10 tabs): Dashboard, Accounts, Income, Expenses,
  Categories, Transactions, Imports, Goals, FIRE Insights, Settings. Active tab
  highlighted.
- **Reusable stat tile:** small uppercase title, large formatted value, optional
  helper text. Used across many tabs.

### 2.3 Dashboard tab
*Net worth trajectory + account trends.*
- Four stat tiles: assets, liabilities, net worth (liquid; locked-asset footnote
  when relevant), number of accounts.
- **Account-history chart** (net worth over months): month range selectors,
  per-account lines + legend, toggle to hide the locked-in trend.
- **Account-breakdown pie** (allocation by account), clickable to drill in.
- **Monthly expense bar chart** (stacked by category group), clickable to drill
  to transactions.
- **Savings-rate gauge** (percentage + OPTIMAL/GOOD/LOW badge + monthly savings
  amount) — only when income is configured.
- **FIRE timeline card** (projected retirement age + progress bar) and a **FIRE
  insight banner** ("at this rate you could retire at X") — when applicable.
- Controls: timeline period selector; jump to FIRE Insights.

### 2.4 Accounts tab
*Assets and liabilities behind net worth.*
- Same four summary stat tiles as Dashboard.
- **Account breakdown** — editable rows: name, category/bucket, kind
  (asset/liability), optional "locked until age," current balance, delete; plus
  **Add account**.
- **Account history snapshots** — dated rows of per-account balances, edit +
  delete per row, **Add snapshot**, **Import snapshots**.
- **Snapshot import modal** — CSV upload, parsed preview, merge/replace, confirm.

### 2.5 Income tab
*Payroll values for modeled salary flow.*
- Four stat tiles: pay schedule, monthly take-home, annual package, matched
  salary credits.
- **Payroll configuration:** employer name (for matching salary transactions);
  per-pay gross + net with annualized echo; three collapsible dynamic-field
  groups — **tax & deductions**, **employer contributions**, **contribution
  taxes** — each row has label + per-pay amount + delete, plus an add control.
- **Income-breakdown pie** of take-home + all components (annual totals).
- **Effective tax rate** display.

### 2.6 Expenses tab
*Spend behavior.*
- Controls: timeline period; flow-start toggle (income vs. expenses-only);
  income-basis toggle (raw deposits vs. modeled salary); merchant-detail toggle
  (summary vs. full); inline mode descriptions; uncategorized-count badge.
- **Sankey flow diagram** (source → category groups → merchants/subcategories),
  hover tooltips, click-to-drilldown, full-screen expand.
- **Monthly expense bar chart** below it, clickable to drill to transactions.

### 2.7 Categories tab
*Spend-classification taxonomy.*
- **Category setup** header + helper text; **Add category**; **Reset defaults**.
- **Pending-reapply alert** (conditional): "category changes pending for X
  transactions" + **Reapply to existing**.
- **Category cards** (collapsible): parent name, "X children / Y keywords" stat,
  delete; expanded → subcategory rows (name + comma-separated keywords + remove)
  and **Add child category**.

### 2.8 Transactions tab
*Review, rule, and clear uncategorized items.*
- Controls: timeline period; rules filter (needs-rules vs. all); category-group +
  start/end-month filters; **Clear filters**; **Clear all rules** (confirmed);
  uncategorized-count badge.
- **AI-suggestion banner** (conditional): status badge
  (ready/running/done/error/no-key/unauthenticated), **Run AI categorization**
  or **Sign in**, API-key prompt, pending-suggestion count.
- **Transaction list** — per row: date, merchant/description, amount (income vs.
  expense), category-group dropdown, subcategory dropdown, nickname, "apply to
  similar" checkbox, **Save rule** / **Clear rule**, and an AI-suggestion badge
  with accept/reject when present.

### 2.9 Imports tab
*Uploaded CSVs, coverage ranges, historical periods.*
- **CSV library:** helper text, status/error line, **Add CSV**, **Delete all**.
- **Empty state:** icon + "no transaction data yet" + numbered how-to.
- **CSV batch list:** per batch — file name, transaction count, editable coverage
  start/end, date-range display, delete, warnings.
- **Coverage calendar:** 12-month grid showing which days have coverage, with
  per-month covered/total counts.

### 2.10 Goals tab
*Savings & net-worth targets.*
- **Goals** header, **Add goal**, helper text, recommended emergency-fund note
  (from inferred monthly expenses).
- **Goal cards:** name; tracking-mode dropdown (manual / selected accounts / net
  worth); target amount; current value (editable when manual, read-only when
  auto); account checkboxes when tracking selected accounts; progress bar +
  percentage + source label; delete.

### 2.11 FIRE Insights tab
*FIRE number, timeline, milestones. (Free tier — always available.)*
- Four stat tiles: FIRE number (25×), years to FIRE, lean-FIRE number,
  coast-FIRE number.
- Config controls: current age, annual return %, multiplier, preservation age.
- **FIRE projection chart:** net worth vs. age line, reference lines at the FIRE
  number and the preservation age, an "achieved" milestone marker.
- **Milestone cards:** label, description, target, current, progress bar,
  achieved badge, remaining amount.
- **Two-phase model** (when locked assets exist): bridge years + bridge target,
  perpetual target, separate progress bars per phase.

### 2.12 Settings tab
*Storage, backups, resets.*
- **Profile:** signed-in email + sign out (if applicable); display name; birth
  year (with age echo); currency dropdown (8 majors); **Re-do onboarding**.
- **Support:** link to issue tracker.
- **Browser storage:** explanation of the local-only model + status line.
- **Data-management cards:** **Delete all my data** (danger, confirmed),
  **Restore category defaults** (confirmed), **Export all my data** (JSON
  download), **Import data** (JSON restore).

### 2.13 Cash modals & conditionals
- Modals: API-key (OpenAI), auth, cloud-migration ("migrate local data to
  cloud?"), and confirmation dialogs (delete-all, clear-rules, reapply,
  reset-defaults).
- Conditional surfaces: sample mode (fixture data + exit), cloud sync (only when
  configured + signed in), AI categorization (only with key + signed in), locked
  assets (only when an account is locked), monthly check-in trigger.

---

## 3. Health — body tracking

Currently three built screens, gated by whether a profile exists. Persistent
brand indicator ("Currant Health" + accent dot) on every screen. *Note: workout
logging, measurement trend graphs, and goal-progress visualization are intended
but not yet built — design should leave room for them (see §3.5).*

### 3.1 Onboarding wizard (shown when no profile, 2 steps with step dots)
- **Step 1 — body basics:** height (cm) and current weight (kg) inputs with unit
  badges, validation, and a note that current weight becomes the starting
  weight. Continue disabled until valid.
- **Step 2 — goals:** a selectable grid of six goals (lose weight, gain weight,
  build muscle, get stronger, improve endurance, maintain) — multi-select, each
  with a label + short descriptor and a selected indicator; plus an optional
  free-text "anything specific?" field. **Finish setup** disabled until ≥1 goal.
- Header carries the brand indicator + a back control on step 2.

### 3.2 Dashboard (shown when a profile exists)
- Brand indicator + a small **Reset** control (destructive, confirmed).
- **Weight hero:** big current weight (latest check-in, or starting weight if
  none) with unit badge; a delta-from-starting indicator (+/− kg, or "no
  change") when check-ins exist; supporting sentence ("X kg from your starting
  weight of Y").
- **Primary CTA:** "Do your first check-in" / "Log this week's check-in."
- **Recent check-ins:** empty state ("no check-ins yet…") or a list of up to 12
  newest-first rows — each row: date, a measurement-count indicator (when
  measurements exist), weight, and the weight delta from the previous entry.
- **Profile snapshot:** height, starting weight, and goals (each goal's label +
  its optional note; "none" when empty).

### 3.3 Weekly check-in form (reached from the dashboard CTA)
- Header: back control + brand indicator + heading + subheading ("weight is the
  only required field").
- **Date** (defaults today, cannot be future).
- **Weight** (required, 0.1 step, unit badge, autofocus). Hint shows the last
  check-in's weight + relative date, or "first weigh-in — set the baseline."
- **Measurements** (collapsible, collapsed by default; toggle label shows
  "(optional)" or "(X filled)") — a grid of ten optional cm fields: neck, chest,
  waist, hips, left/right bicep, left/right thigh, left/right calf; each
  prefilled with the previous value as placeholder.
- **Notes** (optional textarea).
- Footer: **Cancel** + **Save check-in** (disabled until weight is valid).

### 3.4 Health data driving the screens
- **Profile:** height, starting weight, goals (kind + optional note/target/date).
  (`birthDate` and `sex` exist in the model but aren't captured in the UI yet.)
- **Check-in:** date, weight, optional ten-field measurements, optional notes.

### 3.5 Intended-but-unbuilt (design should anticipate)
- Workout logging (exercise catalog + per-set reps/weight/RPE; workout sessions).
- Cardio sessions.
- Measurement trend graphs and goal-progress visualization.
- Profile editing (today only a reset exists).
- Progress photos (deferred).

---

## 4. Mind — mental wellbeing

Three tabs under a brand header ("Currant Mind" + accent dot) and a pill tab
selector. Fully scaffolded.

### 4.1 Today tab
*Low-friction daily input (target: under 10 seconds).*
- Header: today's date (long format), "Today" title, a "X/Y tasks" completion
  counter (only when tasks exist).
- **Mood picker:** "How are you feeling?" + five toggleable mood buttons
  (emoji + label, scale 1–5: awful / low / OK / good / great). Re-click to clear.
- **Task checklist:** "Did you…" + a row per active task (optional emoji + name +
  check indicator), toggled complete for today; empty state points to the Tasks
  tab.
- **Notes:** optional textarea, saved on blur.

### 4.2 Tasks tab
*Manage the daily trackable list (CRUD).*
- Header: "Tasks" + guidance ("keep it short — five to seven is enough").
- **Add-task form:** emoji input (≤2 chars) + name input + **Add** (disabled when
  name empty).
- **Your tasks list:** inline-editable rows (emoji + name + delete-with-confirm),
  ordered; archived tasks shown faded; empty state ("add one above"). Reordering
  is anticipated (logic exists, no UI yet).

### 4.3 Trends tab
*30-day rolling analytics (no chart library today — plain bars/grid).*
- Header: "Trends" + "last 30 days."
- **Summary stat grid (3):** days logged (of 30), average mood (of 5, "—" when
  none), completion percentage (of tasks done).
- **Daily-completion heatmap:** 30 squares (oldest left, today right), shaded by
  fraction of tasks completed, hover tooltip ("May 27: 3/5 · mood 4").
- **Per-task completion rates:** a row per active task (emoji + name + progress
  bar + percentage + ratio), computed over logged days; empty state when no
  tasks.

### 4.4 Mind data driving the screens
- **Task:** name, optional emoji, order, archived flag.
- **Day log:** date, completed-task ids, optional mood (1–5), optional notes.
- Fresh installs seed five example tasks (meditated, nutrition, gym, yoga, read).

---

## 5. What "one product" means for the rewrite

A few connective requirements the design should honor across all four apps:

1. **Consistent auth controls.** Sign-in/out and the four auth states should look
   and behave the same everywhere; the shell is the canonical example.
2. **Consistent empty vs. populated states.** Every data surface listed above has
   a meaningful empty state — these are first-class, not afterthoughts (the Life
   dashboard, Health dashboard, and Mind tabs all lean on them).
3. **Consistent stat/number treatment.** Currency, weights, moods, and
   percentages recur across apps; a shared numeric treatment ties them together.
4. **Per-vertical accent, shared skeleton.** Cash/Health/Mind differ by accent
   color and content, but header, tabs, cards, stat tiles, and forms should read
   as the same family.
5. **Light + dark mode** throughout.
6. **Cross-vertical links.** The shell links into each vertical, each pending
   nudge deep-links to the relevant app, and verticals can link back home — keep
   the navigation between apps obvious.
