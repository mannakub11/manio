# manio

A single-user PWA for logging cardio minutes, installed to an iPhone Home
Screen. One person types minutes in; the app shows the week against a goal.

**Read `docs/DESIGN.md` before touching any UI.** It is the design system this
app is built from, and the tokens in `src/styles/tokens.css` come straight out
of it.

## The shape of the thing

- **A week runs Sunday → Saturday** and is identified by its Sunday's date.
  That string is the week's id and its URL (`/week/2026-09-20`).
- **Entries are minutes and nothing else.** A day can hold several.
- **The weekly goal is the only setting** that changes behaviour (default 200).
- **Everything lives in `localStorage` on one device.** No account, no server,
  no sync. The backup buttons in Settings are the only way data leaves.

## Deliberate non-goals

These were each considered and cut. Re-adding one is a product decision, not a
missing feature:

heart rate / Zone 2 · activity types · per-entry notes · dark mode · the gold
Rewards colour · a daily GitHub-style heatmap · swipe to change week ·
IndexedDB · a backend, D1, or cross-device sync · a charting library ·
multiple users

## Layout

```
src/
├─ routes/     one file per screen; they own URL params and layout only
├─ components/ BarRow · GoalBar · DaySheet · PeriodNav · AppShell · FrapButton
│  └─ ui/      Button · Card · Sheet — the design-system primitives
├─ data/
│  ├─ storage.ts   THE ONLY FILE THAT TOUCHES localStorage
│  ├─ queries.ts   TanStack Query hooks wrapping storage.ts
│  ├─ totals.ts    pure aggregation (day totals, week totals)
│  └─ types.ts     Entry · Settings · Snapshot
├─ lib/week.ts     ALL date maths, with tests in week.test.ts
└─ styles/         fonts.css · tokens.css · index.css
```

## Rules that will bite you if you break them

**Never build a `Date` from a date string.** `new Date("2026-09-20")` parses as
UTC, which drops a Saturday-night session into the next week. `lib/week.ts`
constructs every Date from numbers. Add new date maths there, not inline.

**A week belongs to the month its Sunday falls in.** That is why the month
screen shows 4–5 weeks, why a month total is not the calendar month's days, and
why no week is ever split in half. `monthWeeks()` is the one implementation.

**`storage.ts` is async even though localStorage is not.** That is the seam:
swapping in an HTTP backend changes that file and nothing else.

**Edits save while you type**, not on blur. iOS fires no blur when the app is
backgrounded or the screen locks, and a blur-only commit loses the edit.

## Common changes

| Task | Touch |
|---|---|
| Add a field to an entry | `data/types.ts` (type + `isEntry` guard in `storage.ts`), `components/DaySheet.tsx` |
| Change what a week looks like | `routes/WeekRoute.tsx`, `components/BarRow.tsx` |
| Change date/week behaviour | `lib/week.ts` + a case in `lib/week.test.ts` |
| Add a screen | `routes/`, then a `<Route>` in `App.tsx` and a link in `AppShell.tsx` |
| Change a colour or radius | `styles/tokens.css` only — never a hex in a component |
| Bump the schema | add a `version` branch in `importSnapshot()` |

## Token names

Tailwind v4 generates utilities from its own namespaces, so the names differ
from `docs/DESIGN.md`. Same values, different labels:

| DESIGN.md | here | value |
|---|---|---|
| Starbucks Green | `brand-green` | `#006241` — headings |
| Green Accent | `accent-green` | `#00754A` — filled CTAs, bars |
| House Green | `house-green` | `#1E3932` — dark bands, goal panel |
| Green Uplift | `uplift-green` | `#2b5148` |
| Green Light | `light-green` | `#d4e9e2` |
| Neutral Warm | `canvas` | `#f2f0eb` — the page, never white |
| Ceramic | `ceramic` | `#edebe9` — empty bar troughs |
| Text Black | `ink` | `rgb(0 0 0 / .87)` — never pure black |
| Text Black Soft | `ink-soft` | `rgb(0 0 0 / .58)` |
| `--cardBorderRadius` | `rounded-card` | 12px |
| `--buttonBorderRadius` | `rounded-pill` | 50px |
| `--space-3` (1.6rem) | `p-4`, `gap-4` | 16px |

Two departures from DESIGN.md, both on purpose:

1. **`1rem = 16px`, not the `font-size: 62.5%` trick.** Every pixel value
   matches the source; only the rem arithmetic differs, so Tailwind's scale
   lines up. DESIGN.md's `--space-3: 1.6rem` is this project's `p-4`.
2. **Inter replaces SoDoSans**, which is licensed to Starbucks and not
   available. DESIGN.md names Inter as a substitute. Numbers use
   `class="tnum"` for tabular figures so totals do not shuffle as they change.

Buttons keep DESIGN.md's `scale(0.95)` press via the `tap` utility, but are
padded to a 44px minimum touch target — the document's `7px 16px` lands at
~32px, which is too small for a phone-only app.

## Commands

```bash
npm run dev      # vite dev server
npm test         # vitest — lib/week.ts only, the one place logic hides
npm run lint     # oxlint
npm run build    # tsc -b && vite build, emits the service worker
npm run icons    # regenerate public/*.png from scripts/icon.svg
```

The Inter subset in `public/fonts/` is copied from the
`@fontsource-variable/inter` devDependency (`files/inter-latin-wght-normal.woff2`).
Only the latin subset is vendored — the other six would be precached and never
rendered. Re-copy it after bumping that package.

## Deploy

Cloudflare Pages, build `npm run build`, output `dist`. `public/_redirects`
gives the SPA its deep-link fallback; without it `/week/2026-09-20` 404s on a
cold load.

The service worker precaches everything, so the app opens with no signal. A new
deploy takes effect on the next launch (`registerType: 'autoUpdate'`).
