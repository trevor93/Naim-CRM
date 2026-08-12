# Receptionist View Design

## Goal
Replace the current candidate-lookup-only Receptionist View with the dashboard shown in the supplied reference while preserving the shared shell and all completed Documents work. The page provides reception staff with quick navigation, live summary counts, recent candidates, recent jobs, task status management, and an in-app email compose flow.

## Layout
The page remains wrapped in `Layout` with the title `Receptionist View`. It will render, in order:

1. Page title and the existing subtitle: “Manage daily reception activities and candidate interactions”.
2. A `Quick Actions` card with six visible reference actions: Create CV, Add Candidate, View Candidate, Schedule Appointment, View Tasks, and Send Email.
3. Four KPI cards: Total Candidates, Total Jobs, Total Appointments, and Pending Tasks. Each shows a live numeric value and “Live data”.
4. A Recent Candidates card showing up to five candidates with number, initials avatar, role/contact/passport/salary information, and a stage selector. Its “View All Candidates” link navigates to the existing candidates route.
5. A Recent Jobs card showing up to two jobs with number, icon, job metadata, and status indicator. Its “View All Jobs” link navigates to the existing jobs route.
6. A My Task Progress card with an All Statuses filter and up to three task rows. Each row exposes a functional status selector.

The desktop layout follows the reference proportions. On narrow screens, quick actions wrap, KPI cards become two columns, and rows stack or truncate safely without page-level horizontal overflow.

## Architecture and Data
`ReceptionistViewPage.jsx` owns loading, local optimistic state, filters, navigation, and email-modal visibility. Small receptionist-specific presentation components may be added only where the existing shared components do not support the reference layout.

The page reuses current services and shared patterns:

- `candidateService` for counts, recent candidates, and stage updates.
- `jobService` for counts and recent jobs.
- `taskService` for pending-task counts, recent tasks, filtering, and status updates.
- Appointment service if it already provides a count; otherwise the existing dashboard’s appointment pattern is reused.
- Existing demo-mode behavior remains supported when Supabase is not configured.
- Existing `Layout`, `Card`, `Button`, `Modal`, badges, toast notifications, and Lucide icons are reused.

No Documents components, shared header/sidebar behavior, credentials, permission settings, or backend schema are changed.

## Quick Action Behaviour

- **Create CV:** navigate to the existing CV builder route.
- **Add Candidate:** navigate to the existing add-candidate route.
- **View Candidate:** navigate to the existing candidates route.
- **Schedule Appointment:** navigate to the existing appointments route.
- **View Tasks:** navigate to the existing tasks route.
- **Send Email:** open an in-app modal with recipient, subject, and message fields. Required fields validate inline; a successful simulated send shows an accessible success toast. In preview/demo mode, no external email is sent.

## Interactive Lists

Candidate stage changes update the visible row immediately and persist through the existing candidate service when available. Task status selections update immediately and persist through the task service. The task filter updates the displayed task list. All list links and action controls are keyboard accessible and have meaningful labels.

## Error Handling

Loading states use the project’s existing spinner/empty-state patterns. Service failures preserve the current visible data where possible and report a toast error. Email validation does not submit incomplete forms.

## Verification

A dedicated Playwright verification spec will cover:

- page shell, headings, reference sections, initial demo/live content, and all Quick Actions;
- email modal validation, close behavior, and success toast;
- candidate stage and task status changes;
- candidates/jobs/tasks navigation links;
- 390px responsive page-level horizontal-overflow check;
- browser console and page-error collection;
- a 1366px full-page screenshot after the final state;
- regression navigation to the completed Documents page.

Before completion, run the production build and lint. Keep the production preview on port 3000 available for browser testing. Do not commit or push changes unless explicitly requested.
