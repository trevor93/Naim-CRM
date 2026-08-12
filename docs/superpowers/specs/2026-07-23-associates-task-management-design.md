# Associates Task Management Page Design

## Goal

Replace the current generic Associates team table with the supplied Associates Task Management dashboard while preserving the completed application shell and Documents work.

## Interface

The page title is **Associates Task Management** with the subtitle “Task management system for associates with full task lifecycle tracking.” Four header actions navigate to Add Candidate, View Candidates, Book Appointment, and View Jobs.

The main content contains three white cards matching the reference:

1. **Recent Candidates** shows five numbered rows, the “165 recent” count, onboarding status controls, and View All Candidates.
2. **Recent Jobs** shows two numbered rows, Active and Closed indicators, and View All Jobs.
3. **All Tasks** contains search, status and priority filters, Select All, Archive Completed, sortable-looking headings, and the two reference task rows.

## Data

Demo mode uses the existing `demoCandidates`, `demoTotalCandidates`, `demoJobs`, and `demoTasks` records, normalized for the exact reference presentation. Configured environments load candidates, jobs, and tasks through the current services where practical, falling back safely to empty collections if a request fails.

## Interactions

- Header and “View All” actions navigate through existing routes.
- Candidate stage controls update local page state.
- Task search matches task title, details, assignee, and category.
- Status and priority filters reduce visible task rows.
- Row and Select All checkboxes update selection.
- Priority, category, and status controls update local task state.
- Archive Completed removes completed tasks after confirmation and clears stale selections.

## Architecture

Keep `AssociatesPage.jsx` focused by moving display units into Associates-specific components when they have independent responsibilities. Reuse the application Layout, Lucide icons, Tailwind design tokens, existing routes, and toast system. Do not refactor unrelated application pages.

## Responsive behavior

Desktop dimensions, spacing, typography, row height, status pills, and card shadows follow the 1366 px reference. Header actions and card controls wrap at narrow widths. The task table may scroll inside its card, but the page itself must not overflow horizontally.

## Error handling

Data-loading failures show concise toasts and leave the relevant section empty without breaking the rest of the page. Archive requires confirmation. Invalid or stale selections are removed whenever task data changes.

## Verification

- Production build and lint.
- Production preview on `127.0.0.1:3000/associates`.
- Exact title, subtitle, section text, counts, candidate/job/task content, status pills, and controls.
- Navigation actions, candidate stage changes, task search/filter/edit/select/archive behavior.
- Regression check for Documents and the application shell.
- Narrow viewport overflow check.
- Capture and visually inspect `associates-final.png` before presenting the final preview.
