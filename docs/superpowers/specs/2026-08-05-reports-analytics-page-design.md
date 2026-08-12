# Reports & Analytics Page Design

**Date:** 2026-08-05
**Status:** Approved for implementation planning
**Route:** `/reports`
**Reference:** User-supplied 1366×2439 Reports & Analytics screenshot

## Goal

Replace the current chart-tab Reports page with a screenshot-faithful, single-page Reports & Analytics dashboard. The page will use the exact fixed figures and placement records shown in the reference while providing functional search, format selection, export, print, sortable columns, and responsive behavior. Existing routes, completed pages, and the shared application shell must remain unchanged.

## Confirmed product decisions

- The report uses **fixed reference figures**, not live CRM totals.
- The page search filters **Recent Successful Placements** and **Placement History** only. KPI and summary values remain fixed.
- The **CSV Format** control becomes an output-format selector with CSV, Excel, and PDF choices.
- **Export Report** downloads the currently filtered Placement History in the selected format.
- The page uses a **componentized snapshot** architecture rather than placing every concern in `ReportsPage.jsx` or building an unnecessary general-purpose analytics framework.
- No commit, push, or publication is part of this implementation unless separately requested.

## Visual composition

The page remains inside the existing Naim CRM `Layout` and shared sidebar/header. The Reports icon stays active in the sidebar. The report content follows the screenshot from top to bottom:

1. Page heading and subtitle:
   - **Reports & Analytics**
   - **Track performance and analyze recruitment metrics**
2. A top action row containing:
   - Search input with placeholder **Search reports data...**
   - Output-format selector showing **CSV Format**, **Excel Format**, or **PDF Format**
   - Gold **Export Report** button
   - Gold-outlined **Print Report** button
3. Six KPI cards:
   - Total Candidates — 165
   - Total Jobs — 3
   - Total Tasks — 2
   - Completed Tasks — 1, using the reference green accent
   - Total Appointments — 1
   - Pending Tasks — 0, using the reference clock icon
4. **Candidates by Stage** card with subtitle **Real-time data synced across all pages** and four equal summary tiles:
   - 158 Onboarding
   - 4 Offer
   - 1 Interviewing
   - 2 Hired
5. Two-column dashboard area:
   - **Recent Successful Placements** list on the left
   - **Live Performance Dashboard** on the right
6. Full-width **Placement History** sortable table.

Cards use white surfaces, subtle cream borders, soft shadows, and rounded corners consistent with the reference and the existing CRM design tokens. Gold is reserved for headings, actions, icons, and emphasized values. Blue backgrounds identify country summaries, green identifies completed work, pale yellow identifies pending/neutral stage summaries, and standard ink colors remain readable in screen and print contexts.

## Fixed report data

A focused report data module will define immutable arrays and objects for the exact screenshot dataset. It will not mutate `demoData.js` or depend on Supabase configuration.

### KPI metrics

The six fixed KPI values are those listed above.

### Candidate stages

The stage summary contains Onboarding 158, Offer 4, Interviewing 1, and Hired 2.

### Recent successful placements

The list contains:

- TERESIAH WAMBERE KARIUKI — DOMESTIC WORKER · KENYA — Ksh 90.00
- JANE NYAMBURA NJOROGE — DOMESTIC WORKER · KENYA — Ksh 90.00

### Live performance dashboard

The dashboard contains three semantic summary groups rather than decorative charts:

- Candidate Stage Distribution: Onboarding 158, Offer 4, Interviewing 1, Hired 2.
- Applications by Country: SAUDI ARABIA 118, KENYA 34, Saudi Arabia 2, MOMBASA, KENYA 1, LEBANON 2, Kuwait 4, Kenya 1, Unknown 3.
- Task Performance by Assignee: Completed 1, Pending 0, Active Jobs 2.

This treatment matches the screenshot, avoids introducing visualization forms absent from the approved reference, and preserves text/table accessibility.

### Placement history

The module contains the 20 visible rows in screenshot order. Each record has a stable unique ID and display fields for:

- Date
- Sequence number
- Candidate
- Position
- Country
- Salary
- Status
- Departure

The date display remains **Invalid Date** and departure remains **Not set** where shown in the reference. The table must preserve duplicate names as separate rows. The screenshot-visible candidate order and values are the source of truth.

## Component architecture

### `src/pages/ReportsPage.jsx`

Owns page-level state and orchestration only:

- Search query
- Selected export format
- Placement History sort descriptor
- Derived filtered placements
- Export and print event handlers

It composes the report components and uses the fixed data module. It does not query candidate, job, task, or appointment services.

### `src/components/reports/reportsData.js`

Exports the fixed KPI, stage, recent-placement, live-dashboard, and placement-history datasets. All records are plain immutable objects with stable IDs. This keeps screenshot data separate from presentation and makes it testable without rendering React.

### `src/components/reports/ReportMetricCard.jsx`

A presentational card accepting label, value, icon, and accent. It renders the six KPI cards with consistent dimensions and icon alignment.

### `src/components/reports/CandidatesByStageCard.jsx`

Renders the card title, reference subtitle, and four stage tiles. It is a semantic list rather than a chart because the reference displays direct-value tiles.

### `src/components/reports/RecentSuccessfulPlacements.jsx`

Renders the filtered successful-placement rows, including candidate, position, country, and salary. It renders a clear empty state when search excludes both records.

### `src/components/reports/LivePerformanceDashboard.jsx`

Renders the three fixed summary groups with semantic headings and rows. Each row includes a text label and number, so meaning never depends on color alone.

### `src/components/reports/PlacementHistoryTable.jsx`

Renders the table in a horizontally scrollable card. Sortable header buttons expose the active direction through `aria-sort` and an icon. It receives already filtered data and emits sort changes. Empty search results render a full-width message inside the table region.

## Interaction design

### Search

Search is case-insensitive and trims leading/trailing whitespace. It matches normalized text across candidate name, position, country, salary, status, departure, and displayed date.

The same query filters Recent Successful Placements and Placement History. Summary values and live performance rows remain fixed, as explicitly approved. Clearing the field restores the original screenshot order.

### Sorting

Each Placement History column is sortable. Selecting a header sorts ascending; selecting the same header again reverses direction. Selecting a different header starts ascending.

- Candidate, position, country, salary display, status, departure, and date display use locale-aware text comparison.
- Sequence uses numeric comparison.
- Sorting never mutates the source array.
- When search is cleared and sorting has not been activated, the source screenshot order is retained.

### Export

The format selector exposes CSV, Excel, and PDF. Its visible labels preserve the screenshot's initial **CSV Format** wording.

Export Report maps the currently filtered and sorted history rows to user-facing column names. It invokes the existing `exportToCSV`, `exportToExcel`, or `exportToPDF` utility and uses stable filenames:

- `placement-history-report.csv`
- `placement-history-report.xlsx`
- `placement-history-report.pdf`

If no rows match, export is blocked and an error toast explains that there is no report data to export. A successful invocation shows the existing success toast.

### Print

Print Report calls `window.print()`. Print styles:

- Hide the application sidebar, global header controls, page search, format selector, and action buttons.
- Remove app-shell left offsets.
- Preserve card borders, background colors, and legible ink with `print-color-adjust: exact`.
- Avoid splitting compact KPI and summary cards when practical.
- Allow the Placement History table to continue over multiple print pages with repeated table headers.
- Set the printed report title and subtitle at the top.

### Accessibility

- The page has one visible H1 and hierarchical H2/H3 headings.
- Search has a programmatic label.
- Format selection has a programmatic label.
- Icon-only meaning is never used; all controls retain visible labels.
- Sort buttons announce column and direction.
- Summary data uses lists/tables so values remain accessible without color.
- Keyboard focus follows the visual order: search, format, export, print, dashboard content, sortable table.

## Responsive behavior

At the reference desktop width, all six KPI cards occupy one row, the stage card spans the content width, and the placement/dashboard cards form two balanced columns.

At medium widths:

- The action row wraps without overlapping.
- KPI cards use two or three rows.
- The two dashboard cards stack when their content would become cramped.

At mobile widths:

- Heading and controls stack vertically.
- All KPI and content cards use one column.
- Stage tiles use two columns, then one if needed.
- Placement History scrolls inside its own card; the document root must not gain horizontal overflow.
- Touch targets remain at least 40 pixels tall.

## Error and empty states

Because source figures are local fixed data, initial loading and Supabase errors are unnecessary. Only interaction-specific outcomes remain:

- No search results: both filtered sections show contextual empty states.
- Empty export: error toast and no file operation.
- Export exception: error toast; page state remains intact.
- Print availability follows the browser's native dialog. No asynchronous loading state is required.

## Preservation constraints

- Do not alter shared routes or sidebar navigation.
- Do not change completed Documents, Appointments, Associates, Receptionist View, Tasks, Jobs, or Job Generator behavior.
- Do not modify Supabase credentials, permission configuration, or repository settings.
- Do not introduce new dependencies; existing Lucide, export utilities, React, and Tailwind facilities are sufficient.
- Do not commit or push.

## Verification contract

A dedicated Playwright contract at `artifacts/reports-verification.spec.js` will verify:

1. `/reports` renders without console or page errors.
2. Exact title, subtitle, six KPI labels/values, stage values, successful-placement entries, dashboard groups, and all 20 placement rows appear.
3. Search filters both placement sections and clearing restores them.
4. Every sortable header toggles direction and changes the first visible row when the data allows differentiation.
5. The format selector exposes CSV, Excel, and PDF.
6. CSV and Excel downloads have the expected filename and contain the filtered records; the PDF action initiates successfully.
7. Print Report calls the browser print function while print-only CSS is present.
8. At 390×844, the document root has no horizontal overflow and the history table remains internally scrollable.
9. Previously completed primary routes can be opened without browser errors.
10. A 1366×2439 full-page screenshot is captured and visually inspected against the supplied reference.

The final quality gate is:

- Targeted oxlint with zero errors; any warnings are reported.
- Fresh `npm run build` with exit code 0; the existing chunk-size warning is reported separately if it remains.
- Dedicated Reports Playwright contract passes.
- Relevant broader browser regression checks pass or unrelated failures are reported accurately.
- Final screenshot inspection confirms reference-aligned layout, spacing, typography, colors, icon placement, row density, and responsive behavior.
