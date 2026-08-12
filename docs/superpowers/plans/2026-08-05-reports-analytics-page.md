# Reports & Analytics Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/reports` with a functional, responsive replica of the approved 1366×2439 Reports & Analytics reference using the exact fixed figures and rows shown in the screenshot.

**Architecture:** Keep immutable report snapshot data and pure filtering/sorting/export selectors in `src/components/reports/reportsData.js`. Build small presentational report components, then let `ReportsPage.jsx` own only search, format, sorting, export, and print orchestration. Verify behavior through a dedicated Playwright contract before screenshot inspection.

**Tech Stack:** React 19, Vite 5, Tailwind CSS 3, Lucide React, existing CSV/XLSX/jsPDF utilities, Playwright, oxlint.

**Constraints:** Preserve completed pages and the shared shell. Add no dependencies. Do not query Supabase for this approved fixed snapshot. Do not commit or push. Do not overwrite the source `reports-final.png`; capture implementation evidence as `reports-analytics-implemented.png`.

---

## File map

- Create `src/components/reports/reportsData.js` — fixed reference datasets plus pure search, sort, and export-row helpers.
- Create `src/components/reports/ReportMetricCard.jsx` — one KPI card.
- Create `src/components/reports/CandidatesByStageCard.jsx` — four reference stage totals.
- Create `src/components/reports/RecentSuccessfulPlacements.jsx` — filtered successful placements.
- Create `src/components/reports/LivePerformanceDashboard.jsx` — stage, country, and task summary groups.
- Create `src/components/reports/PlacementHistoryTable.jsx` — accessible sortable history table.
- Replace `src/pages/ReportsPage.jsx` — compose the page and own interactions.
- Modify `src/index.css` — report-scoped print rules.
- Create `artifacts/reports-verification.spec.js` — browser contract and screenshot capture.

---

### Task 1: Write the failing browser contract

**Files:**
- Create: `artifacts/reports-verification.spec.js`
- Reference: `artifacts/playwright.config.js`

- [ ] **Step 1: Create a Playwright contract that asserts the approved page**

The test must navigate to `http://127.0.0.1:3000/reports`, collect console/page errors, and assert:

```js
await expect(page.getByRole('heading', { name: 'Reports & Analytics', exact: true }).last()).toBeVisible()
await expect(page.getByText('Track performance and analyze recruitment metrics')).toBeVisible()
for (const [label, value] of [
  ['Total Candidates', '165'], ['Total Jobs', '3'], ['Total Tasks', '2'],
  ['Completed Tasks', '1'], ['Total Appointments', '1'], ['Pending Tasks', '0'],
]) {
  const card = page.getByTestId(`report-metric-${label.toLowerCase().replaceAll(' ', '-')}`)
  await expect(card).toContainText(label)
  await expect(card).toContainText(value)
}
```

Assert stage values, the two successful placements, the three live-dashboard groups, and 20 history rows. Exercise search with `KITHUKA`, clear it, click `Sort by Candidate` twice and check `data-direction`, select CSV/Excel/PDF, verify a CSV download filename, stub `window.print`, check mobile root overflow, and capture:

```js
await page.setViewportSize({ width: 1366, height: 2439 })
await page.screenshot({
  path: 'C:/Users/user/Desktop/Naim-CRM/reports-analytics-implemented.png',
  fullPage: true,
})
expect(errors).toEqual([])
```

- [ ] **Step 2: Run the contract and confirm red state**

Run after serving the current production build:

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM exec -- playwright test /c/Users/user/Desktop/Naim-CRM/artifacts/reports-verification.spec.js --config /c/Users/user/Desktop/Naim-CRM/artifacts/playwright.config.js
```

Expected: FAIL because the current Reports page lacks the approved subtitle, KPI cards, fixed dashboard, and history table.

---

### Task 2: Add immutable report data and pure selectors

**Files:**
- Create: `src/components/reports/reportsData.js`
- Test: `artifacts/reports-verification.spec.js`

- [ ] **Step 1: Define fixed KPI, stage, successful-placement, and dashboard data**

Export frozen arrays with these exact values:

```js
export const REPORT_METRICS = Object.freeze([
  { label: 'Total Candidates', value: 165, icon: 'users', accent: 'gold' },
  { label: 'Total Jobs', value: 3, icon: 'briefcase', accent: 'gold' },
  { label: 'Total Tasks', value: 2, icon: 'tasks', accent: 'gold' },
  { label: 'Completed Tasks', value: 1, icon: 'completed', accent: 'green' },
  { label: 'Total Appointments', value: 1, icon: 'calendar', accent: 'gold' },
  { label: 'Pending Tasks', value: 0, icon: 'pending', accent: 'orange' },
])

export const CANDIDATE_STAGES = Object.freeze([
  { label: 'Onboarding', value: 158 },
  { label: 'Offer', value: 4 },
  { label: 'Interviewing', value: 1 },
  { label: 'Hired', value: 2 },
])

export const RECENT_SUCCESSFUL_PLACEMENTS = Object.freeze([
  { id: 'recent-1', candidate: 'TERESIAH WAMBERE KARIUKI', position: 'DOMESTIC WORKER', country: 'KENYA', salary: 'Ksh 90.00' },
  { id: 'recent-2', candidate: 'JANE NYAMBURA NJOROGE', position: 'DOMESTIC WORKER', country: 'KENYA', salary: 'Ksh 90.00' },
])
```

Also export stage distribution matching `CANDIDATE_STAGES`, country rows `SAUDI ARABIA 118`, `KENYA 34`, `Saudi Arabia 2`, `MOMBASA, KENYA 1`, `LEBANON 2`, `Kuwait 4`, `Kenya 1`, `Unknown 3`, and task rows `Completed 1`, `Pending 0`, `Active Jobs 2`.

- [ ] **Step 2: Define the 20 reference history rows**

Every row has `id`, `date: 'Invalid Date'`, numeric `sequence`, `candidate`, `position`, `country`, numeric `salary`, `status: 'Onboarding'`, and `departure: 'Not set'`. Use this exact order:

1–3 AMINA ALI KAKAWA / DOMESTIC WORKER / SAUDI ARABIA / 1100; 4–5 LYDIA MAPENZI KITSAO / DOMESTIC WORKER / SAUDI ARABIA / 1100; 6 MWATSENZE MESAIDI BAKARI / NONE / SAUDI ARABIA / 0; 7–8 JOLINE CHELIMO KENTEYIA / DOMESTIC WORKER / SAUDI ARABIA / 0; 9–10 ALICE DAMA KITSAO / DOMESTIC WORKER / SAUDI ARABIA / 1100; 11 KITHUKA AGNES KATHEU / FEMALE DRIVER / KENYA / 1500; 12 ROSEMARY MUKAMI NDUMIA / DOMESTIC WORKER / SAUDI ARABIA / 1100; 13–16 JOYCE MMBONE OUMA / DOMESTIC WORKER / KENYA / 900; 17 CAROLINE WAMBUI KAMAU / DOMESTIC WORKER / SAUDI ARABIA / 1100; 18 VERONICA WAMBUI MACHARIA / DOMESTIC WORKER / SAUDI ARABIA / 1100; 19 CYNTHIA KERUBO OMWOYO / DOMESTIC WORKER / KENYA / 900; 20 BEATRICE KANZE LWAMBI / DOMESTIC WORKER / SAUDI ARABIA / 1100.

- [ ] **Step 3: Add pure filter, sort, and export helpers**

Implement:

```js
export function filterReportRows(rows, query) {
  const term = query.trim().toLocaleLowerCase()
  if (!term) return rows
  return rows.filter((row) => [row.date, row.sequence, row.candidate, row.position, row.country, formatSalary(row.salary), row.status, row.departure]
    .some((value) => String(value).toLocaleLowerCase().includes(term)))
}

export function sortReportRows(rows, sort) {
  if (!sort?.key) return rows
  const direction = sort.direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    if (sort.key === 'sequence' || sort.key === 'salary') return (a[sort.key] - b[sort.key]) * direction
    return String(a[sort.key]).localeCompare(String(b[sort.key]), undefined, { numeric: true }) * direction
  })
}

export function formatSalary(value) {
  return `Ksh ${Number(value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function toExportRows(rows) {
  return rows.map((row) => ({ Date: row.date, Number: row.sequence, Candidate: row.candidate, Position: row.position, Country: row.country, Salary: formatSalary(row.salary), Status: row.status, Departure: row.departure }))
}
```

- [ ] **Step 4: Run targeted lint**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM run lint -- /c/Users/user/Desktop/Naim-CRM/src/components/reports/reportsData.js
```

Expected: zero errors.

---

### Task 3: Build the screenshot-aligned report components

**Files:**
- Create: `src/components/reports/ReportMetricCard.jsx`
- Create: `src/components/reports/CandidatesByStageCard.jsx`
- Create: `src/components/reports/RecentSuccessfulPlacements.jsx`
- Create: `src/components/reports/LivePerformanceDashboard.jsx`
- Create: `src/components/reports/PlacementHistoryTable.jsx`
- Test: `artifacts/reports-verification.spec.js`

- [ ] **Step 1: Implement `ReportMetricCard`**

Map icon keys to Lucide `Users`, `BriefcaseBusiness`, `SquareCheckBig`, `CalendarDays`, and `Clock3`. Render a compact white card with `data-testid`, visible label/value, an icon at the right, and accent classes. Keep text ink neutral; use icon/value accents only.

- [ ] **Step 2: Implement `CandidatesByStageCard`**

Render a white card with heading `Candidates by Stage`, subtitle `Real-time data synced across all pages`, and a responsive four-tile grid. Each pale-gold tile exposes its label/value as text.

- [ ] **Step 3: Implement the placements and live dashboard cards**

`RecentSuccessfulPlacements` receives `placements` and renders two pale-gold list rows or `No successful placements match your search.`

`LivePerformanceDashboard` receives stage, country, and task arrays. Render semantic group headings and two-column summary rows using pale gold for stage, pale blue for countries, pale green for completed, pale yellow for pending, and pale blue for active jobs. Each value is text, never color-only.

- [ ] **Step 4: Implement `PlacementHistoryTable`**

Props:

```js
{ rows, sort, onSort }
```

Define columns for date, sequence/candidate, position, country, salary, status, and departure. Every sortable heading is a button with `aria-label="Sort by <Column>"`, `data-direction`, and `aria-sort`. Candidate cells show a numbered cream badge beside the gold candidate name. Salary uses `formatSalary`; status uses a pale-yellow pill. Wrap only the table in `overflow-x-auto` and set a stable minimum table width.

- [ ] **Step 5: Re-run the browser contract**

Expected: still FAIL because `ReportsPage.jsx` has not composed the new components.

---

### Task 4: Compose the page and interactions

**Files:**
- Replace: `src/pages/ReportsPage.jsx`
- Reuse: `src/utils/exportUtils.js`
- Test: `artifacts/reports-verification.spec.js`

- [ ] **Step 1: Replace service loading and chart tabs with local page state**

Use state:

```js
const [search, setSearch] = useState('')
const [format, setFormat] = useState('csv')
const [sort, setSort] = useState({ key: null, direction: null })
```

Derive filtered successful placements separately and derive filtered/sorted history with the pure helpers. `handleSort(key)` starts ascending for a new key and toggles asc/desc for the current key.

- [ ] **Step 2: Implement export and print**

Map current sorted history through `toExportRows`. If empty, call `toast.error('No report data to export')`. Otherwise call the existing utility matching `format`, with filenames `placement-history-report.csv`, `.xlsx`, or `.pdf`, then show `toast.success('Report exported!')`. Catch failures and show `toast.error('Failed to export report')`.

`Print Report` calls `window.print()`.

- [ ] **Step 3: Compose the approved visual hierarchy**

Use `<Layout title="Admin Dashboard">` to match the shell in the reference. Inside `<section id="reports-print-area">`, render:

- H1 `Reports & Analytics` and the approved subtitle.
- Search with `aria-label="Search reports data"`.
- Select with `aria-label="Report export format"` and CSV/Excel/PDF options whose labels end in `Format`.
- Gold Export Report and outlined Print Report buttons.
- Six KPI cards in a 1/2/3/6-column responsive grid.
- Stage card.
- Two-column recent/live cards.
- History table.

Search and actions wrap at medium widths and stack at mobile widths.

- [ ] **Step 4: Run targeted lint and build**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM run lint -- /c/Users/user/Desktop/Naim-CRM/src/components/reports /c/Users/user/Desktop/Naim-CRM/src/pages/ReportsPage.jsx
npm --prefix /c/Users/user/Desktop/Naim-CRM run build
```

Expected: lint has zero errors; build exits 0. Report the existing chunk-size warning separately if present.

---

### Task 5: Add print behavior and complete browser verification

**Files:**
- Modify: `src/index.css`
- Test: `artifacts/reports-verification.spec.js`

- [ ] **Step 1: Add scoped print rules**

Append an `@media print` block that hides `#app-sidebar`, the shared shell header, and `.reports-no-print`; removes shell/main offsets and padding; sets `#reports-print-area` width/margins; applies `print-color-adjust: exact`; avoids card breaks where practical; repeats table headers; and allows table rows to continue across pages without clipping.

- [ ] **Step 2: Build the fresh production bundle**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM run build
```

Expected: exit 0.

- [ ] **Step 3: Start the fresh production preview and wait for `/reports`**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM run preview -- --host 127.0.0.1 --port 3000
```

Wait until `http://127.0.0.1:3000/reports` returns successfully before testing.

- [ ] **Step 4: Run the dedicated Reports browser contract**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM exec -- playwright test /c/Users/user/Desktop/Naim-CRM/artifacts/reports-verification.spec.js --config /c/Users/user/Desktop/Naim-CRM/artifacts/playwright.config.js
```

Expected: 1 passed, zero failures.

- [ ] **Step 5: Run relevant regression browser checks**

Run the available Documents, Tasks, Jobs, Appointments, Associates, Receptionist View, and Job Generator specs against the same fresh preview. Report any unrelated environment failure without misrepresenting it as a Reports failure.

- [ ] **Step 6: Inspect `reports-analytics-implemented.png`**

Open the 1366×2439 screenshot and compare it with the source `reports-final.png`. Correct discrepancies in shell title, page width, card heights, six-card density, gold/blue/green backgrounds, typography, table row spacing, and footer whitespace. Rebuild and rerun the dedicated contract after every source correction.

- [ ] **Step 7: Run final quality gates**

```bash
npm --prefix /c/Users/user/Desktop/Naim-CRM run lint -- /c/Users/user/Desktop/Naim-CRM/src/components/reports /c/Users/user/Desktop/Naim-CRM/src/pages/ReportsPage.jsx
npm --prefix /c/Users/user/Desktop/Naim-CRM run build
```

Then rerun the dedicated Playwright contract. Only after all commands complete successfully may Task #20 be marked complete and the verified URL/screenshot be presented. Do not claim the preview remains running if its process later stops.
