# Jobs Page Design Spec

## Goal

Replace the generic-table `JobsPage.jsx` with a reference-matched "Job Openings" dashboard at `/jobs` that renders all ~22 columns, supports add/edit/delete, search, status/company/country filters, row selection with Select All, inline status changes, an extended New/Edit modal, and demo/Supabase persistence — preserving every completed page and the shared shell.

## Scope

- Modify `src/pages/JobsPage.jsx`: rebuild as the focused reference dashboard.
- Modify `src/services/jobService.js`: future-safe payload that sends all schema columns (existing columns + 16 new migration columns) when configured.
- Modify `src/services/demoData.js`: extend `demoJobs` with all reference display fields.
- Modify `supabase-schema.sql`: append a dated migration adding the 16 new columns.
- Create `artifacts/jobs-verification.spec.js`: dedicated end-to-end Playwright contract and 1366×785 screenshot.
- Preserve Tasks, Appointments, Documents, Receptionist View, Associates, and all shared shell behavior.

Out of scope: actually running the migration against a live Supabase backend (the local environment runs demo mode; no `.env` / CLI). The migration SQL is written for the user to apply later.

## Architecture

One focused `JobsPage.jsx` (state + render), an extended `jobService.js` (persistence boundary), an enriched `demoJobs` seed, a SQL migration appended to `supabase-schema.sql`, and a dedicated Playwright contract. The app runs in demo mode locally (`isSupabaseConfigured()` is false: no `.env`, Supabase CLI unavailable on Windows), so the reference renders from the demo seed + page-local state. The service layer is written future-safe so configured mode persists all fields once the migration is applied.

**Tech stack:** React 19, React Router, Tailwind CSS, Lucide React, Supabase, Vite, Oxlint, Playwright.

**Constraints:** Preserve the working tree and completed pages. No commit/push. Production preview stays on port 3000. Preview withheld until build/lint/browser/screenshot checks pass. 10-minute progress loop set after implementation begins.

## Data Model

### Normalized page record

```
{
  id, title, gender, salaryDisplay, salary_min, salary_max, currency, status,
  city, country, company, experience, accommodation, ageRange, nationality,
  dutyHours, workDays, overtime, transport, contractPeriod, vacanciesLeft,
  linkedCandidates, uploads, additionalDetails, requirements, responsibilities,
  schedule, contract_duration, description, createdAt, deletedAt,
}
```

### Reference demo values

| Field | Cleaners | Personal Driver (Female) |
|---|---|---|
| title | `Cleaners` | `Personal Driver (Female)` |
| gender | `Male` | `Any` |
| salary show | `Negotiable` | `350 - 450 KWD` |
| city | `Dammam` | empty → `N/A` |
| country | `Saudi Arabia` | empty → `N/A` |
| company | `Naim Investments` | `Elite Chauffeur Services` |
| experience | empty → `Not specified` | empty → `Not specified` |
| accommodation | `Yes` | empty → `Not specified` |
| ageRange | empty → `Not specified` | empty → `Not specified` |
| nationality | `Any` | `Any` |
| dutyHours | empty → `Not specified` | empty → `Not specified` |
| workDays | empty → `Not specified` | empty → `Not specified` |
| overtime | `Available` (green) | empty → `Not specified` (yellow) |
| transport | `Provided` (green) | empty + female → `Not specified (Female)` (yellow) |
| contractPeriod | empty → `Not specified` | empty → `Not specified` |
| vacanciesLeft | `1` → `1 left` pill | `1` → `1 left` pill |
| linkedCandidates | `0` → `0 linked` chip | `0` → `0 linked` chip |
| uploads | empty → `None` | empty → `None` |
| status | `Active` (green) | `Closed` (gray) |
| additionalDetails | empty → `None` | empty → `None` |

### demoJobs seed update

The existing `demoJobs` must be updated to match the reference exactly. Notably, the Personal Driver (Female) row currently carries `country: 'Kuwait'` and `location: 'Kuwait City, Kuwait'` in the file, but the reference renders row 2 country and city as `N/A`. The enriched seed therefore sets row 2 `country` and `city` to empty strings so the fallback tokens render. All 14 new fields are added to both rows with the reference values above (snake_case keys to match the future schema).

### Empty-field rendering contract

Empty optional fields render as a muted placeholder token per column — never blank — matching the reference fallback text:

- city, country → `N/A`
- experience, accommodation, ageRange, dutyHours, workDays, contractPeriod → `Not specified`
- overtime → `Not specified` (or `Not specified (Female)` when gender includes `Female`)
- transport → `Not specified` (or `Not specified (Female)` when gender includes `Female`)
- uploads, additionalDetails → `None`
- salary (row 1) → `Negotiable`; salary numeric (row 2) → `<min> - <max> <currency>`

These tokens are render-time concerns derived from empty stored values; nothing is sent to the DB. The page computes them in `normalizeJob`/render helpers.

### SQL migration (appended to `supabase-schema.sql`)

```sql
-- Migration 2026-07-24: Jobs extended fields (reference-match Job Openings page)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS accommodation TEXT,
  ADD COLUMN IF NOT EXISTS age_range TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS duty_hours TEXT,
  ADD COLUMN IF NOT EXISTS work_days TEXT,
  ADD COLUMN IF NOT EXISTS overtime TEXT,
  ADD COLUMN IF NOT EXISTS transport TEXT,
  ADD COLUMN IF NOT EXISTS contract_period TEXT,
  ADD COLUMN IF NOT EXISTS vacancies_left INTEGER,
  ADD COLUMN IF NOT EXISTS linked_candidates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uploads TEXT,
  ADD COLUMN IF NOT EXISTS additional_details TEXT;
```

### Service payload contract

`toServicePayload` sends all schema columns (existing columns + 16 new migration columns) when configured:

- `salary_min`, `salary_max`, `vacancies_left` → coerced to number or `null`
- `linked_candidates` → coerced to number (default `0`) or `null`
- empty text strings → `null` for nullable text columns
- `status` constrained to existing CHECK `('Active', 'Draft', 'Closed')`
- never sends computed display tokens (`N/A`, `Not specified`, `None`, `Negotiable`)

## Layout

### Page header block (inside Layout)

- H1 `Job Openings` (deep navy, bold)
- Subtitle `Manage available job positions and track applications`

### Toolbar panel (white rounded card labeled `All Positions`)

- Left: Briefcase icon (orange) + `Available Positions` chip with count `(N)` = non-deleted jobs
- Outlined `Add Job` button with `+` icon
- Center: `Search jobs, companies, locations...` pill input with magnifier icon
- Right: three compact dropdowns — `All Status ▾`, `All Companies ▾`, `All Countries ▾`; each lists distinct values present in the data plus an `All` reset option

### Bulk row

- `Select All` checkbox (left-aligned): toggles all visible (filtered) rows on; unchecked clears all

### Jobs table (dense, `lg` and up)

Columns in reference order:

1. checkbox (per-row)
2. Position — numbered badge `1.`, `2.` then title; wraps to two lines for long titles
3. Gender
4. Salary
5. City
6. Country
7. Company Name
8. Experience
9. Accommodation
10. Age Range
11. Nationality
12. Duty Hours
13. Work Days
14. Overtime — light green `Available` or yellow `Not specified`
15. Transport — light green `Provided` or yellow `Not specified (Female)`
16. Contract Period
17. Vacancies Left — cyan-amber `N left` pill
18. Linked Candidates — purple-blue `N linked` chip
19. Uploads — `None`
20. Status — green `Active▾` or gray `Closed▾` inline pill-select
21. Additional Details — `None`
22. Actions — gold eye `View`, orange pencil `Edit`, red trash `Delete`

Header row carries a `↑↓` sort caret affordance on Position. The table panel scrolls horizontally for the 22 columns with the checkbox + Position columns sticky.

### Mobile (below `lg`)

Stacked job cards retaining every field and control. No page-level horizontal overflow at 390×844.

## Interactions

- **Add Job** → `New Job` modal (empty form). **Edit** → `Edit Job` modal pre-filled.
- **Validation:** `Title is required` shown visibly on empty submit.
- **Inline status:** per-row Status pill-select changes status optimistically (page-local in demo; `updateJob` in configured). Constrained to Active/Draft/Closed.
- **Selection:** per-row checkbox tracked in `selectedIds`; `Select All` toggles all visible rows; `selectedIds` cleared of any deleted id.
- **Delete:** `confirm('Delete this job?')`; dismiss keeps the row; accept removes optimistically with rollback + `Job deleted` toast.
- **Search:** filters across title, company, country, city (case-insensitive). Combines with dropdown filters.
- **Filters:** Status exact; Company exact; Country exact; `All` resets that filter.
- **Empty state:** `No jobs found.` when filters yield nothing.
- **Loading:** `PageSpinner` during configured-mode fetch; `Failed to load jobs` toast on error.

### Accessible labels

`Search jobs`, `Filter jobs by status`, `Filter jobs by company`, `Filter jobs by country`, `Select job <title>`, `Select all jobs`, `View job <title>`, `Edit job <title>`, `Delete job <title>`, `Status for job <title>`.

## New/Edit Modal

- Titles: `New Job` and `Edit Job`. Actions: `Create Job` and `Update Job`.
- `Job Title *` (Input)
- `Negotiable` checkbox — when checked, disables min/max/currency and the page renders `Negotiable`; when unchecked, enables `Min Salary`, `Max Salary`, `Currency`
- `Gender` (Select: `Any`, `Male`, `Female`)
- `City` (Input), `Country` (`COUNTRIES`-backed Select), `Company Name` (Input)
- `Experience` (Input), `Accommodation` (Select: `Yes`, `No`, `Not specified`), `Age Range` (Input), `Nationality` (Input)
- `Duty Hours` (Input), `Work Days` (Input), `Overtime` (Select: `Available`, `Not specified`), `Transport` (Select: `Provided`, `Not specified`)
- `Contract Period` (Input), `Vacancies Left` (number Input), `Additional Details` (Textarea)
- `Description`, `Requirements` (Textarea)
- `Status` (Select: Active/Draft/Closed)
- Cancel, Escape, close button, overlay click inherited from `Modal`.
- Validation blocks submit with visible `Title is required`.

Empty optional fields saved as empty string; rendered via the display-value fallback contract. No placeholder token is stored.

## Error Handling

- Demo mode: all mutations succeed locally with rollback on internal failure (none expected).
- Configured mode: `getJobs` failure → `Failed to load jobs` toast + empty table; `addJob`/`updateJob`/`deleteJob` failures roll back to prior state with targeted toasts (`Failed to create job`, `Failed to update job`, `Failed to delete job`).
- Optimistic add uses a temporary id replaced by the returned record on success.

## Edge Cases

- Long titles wrap to two lines in the Position cell; row height grows; badge stays top-aligned.
- `Negotiable` salary renders the literal token; numeric salary renders `<min> - <max> <currency>`.
- Female-gendered rows with no transport render `Not specified (Female)`; non-female render `Not specified`.
- `vacancies_left` / `linked_candidates` coerce to numbers; non-numeric or empty becomes the fallback pill/chip (`0`).
- After migration, configured-mode round-trip re-normalizes new columns into the page model; before migration, configured-mode writes the schema columns but reads them as null (rendered as fallback tokens) — no crash.
- Delete clears the deleted id from `selectedIds`.
- Filters + search compose in `useMemo`; `Select All` reflects only visible rows.

## Verification Plan

1. Fresh `npm run build` → exit 0; report the existing chunk-size warning separately.
2. Targeted Oxlint on `JobsPage.jsx`, `jobService.js`, `demoData.js`, `supabase-schema.sql` → no Jobs-introduced warnings.
3. Restart Vite preview at `127.0.0.1:3000`; confirm `/jobs` returns HTTP 200.
4. Dedicated Playwright contract (`artifacts/jobs-verification.spec.js`): assert header/subtitle, `Available Positions (N)`, Add Job button, search + 3 filters; assert both reference rows with all column display values including `Negotiable`, `350 - 450 KWD`, `Dammam`, `N/A` country, overtime/transport green+yellow pills, `1 left`, `0 linked`, `None`, Active/Closed; exercise add (validation + success), edit, inline status change, selection + Select All, delete cancel + accept, search, combined filters, mobile 390×844 no-overflow, regression nav to /tasks /documents /receptionist-view /associates /appointments, console-error check, and capture `jobs-final.png` at 1366×785.
5. Full Playwright regression suite → all specs pass (no regressions to completed pages).
6. Inspect `jobs-final.png` against the reference: columns, pills, colors, no clipping, no open overlay.
7. Cancel the 10-minute progress cron after completion; no commit/push.

## Permission-mode note

Auto/bypass permission mode is a Claude Code session setting, not an application change. Do not modify repository settings, credentials, or permission configuration for this task.
