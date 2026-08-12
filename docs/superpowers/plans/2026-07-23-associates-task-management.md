# Associates Task Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Associates team table with the supplied functional Associates Task Management dashboard.

**Architecture:** Build small Associates-specific display components for action buttons, recent record rows, and task controls, with `AssociatesPage` owning normalized data and interactions. Reuse the existing Layout, routes, demo data, Tailwind tokens, Lucide icons, and toast context.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide React, Vite, Playwright browser automation

---

## File structure

- Create `src/components/associates/AssociateQuickActions.jsx`: header navigation actions.
- Create `src/components/associates/RecentCandidatesCard.jsx`: candidate summary rows and stage controls.
- Create `src/components/associates/RecentJobsCard.jsx`: job summary rows and status pills.
- Create `src/components/associates/AssociatesTasksCard.jsx`: task search, filters, selection, editable pills, archive, and table.
- Replace `src/pages/AssociatesPage.jsx`: data normalization, state, navigation, and page composition.
- Produce `associates-final.png`: final reference screenshot.

### Task 1: Associates dashboard components

**Files:**
- Create: `src/components/associates/AssociateQuickActions.jsx`
- Create: `src/components/associates/RecentCandidatesCard.jsx`
- Create: `src/components/associates/RecentJobsCard.jsx`
- Create: `src/components/associates/AssociatesTasksCard.jsx`

- [ ] **Step 1: Build quick actions**

Render four bordered actions with `Plus`, `UserRound`, `CalendarDays`, and `BriefcaseBusiness`. Accept `onAddCandidate`, `onViewCandidates`, `onBookAppointment`, and `onViewJobs`. Match the reference dimensions and wrap below desktop width.

- [ ] **Step 2: Build recent candidate rows**

Render the section heading, recent count, View All Candidates action, and five numbered rows. Each row displays name, position, company, salary, email, phone, and a locally editable Onboarding stage select.

- [ ] **Step 3: Build recent job rows**

Render the section heading, count, View All Jobs action, and two numbered rows. Display title, company, location, type, salary/date metadata, and green Active or red Closed status pills.

- [ ] **Step 4: Build task management card**

Accept tasks, selection, search/filter values, and callbacks. Render exact reference headings and controls. Task rows display title/details, assignee/creator, due date, and select controls for priority, category, and status. Wrap the table in `overflow-x-auto` while keeping the page width constrained.

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: PASS with the existing large-chunk warning allowed.

### Task 2: Associates page data and behavior

**Files:**
- Replace: `src/pages/AssociatesPage.jsx`

- [ ] **Step 1: Normalize reference data**

Import `demoCandidates`, `demoTotalCandidates`, `demoJobs`, and `demoTasks`. Normalize candidate salary to `Ksh 1,100.00`, phone to `+000-000-0000`, task details to the exact reference descriptions, and job salary/date labels to the reference format.

- [ ] **Step 2: Add dashboard state**

Store candidates, jobs, tasks, selected task IDs, search, status filter, and priority filter. Derive filtered tasks with `useMemo`.

- [ ] **Step 3: Add navigation**

Use `useNavigate` for `/candidates`, `/candidates?action=add`, `/appointments?action=book`, and `/jobs`.

- [ ] **Step 4: Add local editing behavior**

Implement candidate stage updates and task priority/category/status updates through immutable state setters.

- [ ] **Step 5: Add selection and archive behavior**

Implement row selection, Select All over currently filtered tasks, and Archive Completed with `window.confirm`. Remove archived completed records and stale selected IDs, then show a success toast.

- [ ] **Step 6: Compose exact page layout**

Use `Layout title="Admin Dashboard"`. Render the title/subtitle beside quick actions, followed by Recent Candidates, Recent Jobs, and All Tasks with the reference spacing, max width, typography, borders, and shadows.

- [ ] **Step 7: Build and lint**

Run: `npm run build`
Expected: PASS with only the existing chunk warning.

Run: `npm run lint`
Expected: no errors; report existing warnings separately.

### Task 3: Production browser verification

**Files:**
- Produce: `associates-final.png`

- [ ] **Step 1: Restart production preview**

Stop the existing preview task and run:

`npm run preview -- --host 127.0.0.1 --port 3000`

Expected: `http://127.0.0.1:3000/associates` responds.

- [ ] **Step 2: Verify exact static content**

Use Playwright at 1366 × 1962. Assert title/subtitle; four quick actions; “Recent Candidates (165 recent)”; five exact candidate rows; “Recent Jobs (2)”; two exact jobs; “All Tasks”; two exact tasks; status/priority/category labels; and no browser errors.

- [ ] **Step 3: Verify interactions**

Exercise candidate stage selection; task search; status and priority filters; row and Select All checkboxes; priority/category/status changes; cancelled archive; confirmed archive; and each navigation action’s destination.

- [ ] **Step 4: Regression-test Documents and shell**

Visit `/documents`, click every document tab, and assert expected content. Confirm Associates remains the active sidebar destination and the header/sidebar render without browser errors.

- [ ] **Step 5: Verify responsive behavior**

At 390 × 844 assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Confirm quick actions wrap and task overflow remains contained within the card.

- [ ] **Step 6: Capture and inspect final preview**

Restore 1366 × 1962, reload Associates to reset demo state, capture full page as `associates-final.png`, and inspect layout, card heights, row spacing, typography, pills, and reference fidelity.

- [ ] **Step 7: Finish**

Keep production preview running on port 3000, cancel the five-minute progress schedule, and present the screenshot, URL, build/lint result, and concise verification summary. Do not commit unless explicitly requested.
