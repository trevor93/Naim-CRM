# Appointments Page Design

## Goal

Rebuild `/appointments` as a responsive, reference-matched scheduling dashboard while preserving every completed page and keeping appointment CRUD functional in both demo and configured-Supabase modes.

## Scope

The page will reproduce the supplied 1366×785 reference: title and subtitle, four summary cards, the All Appointments panel, scheduling control, search/date/status/stage filters, and a detailed appointment record with inline stage/status and row actions. It will also provide complete scheduling, editing, deletion, selection, filtering, metric updates, responsive behavior, and safe persistence.

No unrelated shared-shell or completed-page redesign is included. No database migration, commit, or push will be performed.

## Architecture

`AppointmentsPage.jsx` will become a focused dashboard instead of composing the generic shared `Table`. It will own normalized appointment state, filters, selection, modal state, optimistic mutations, and derived metrics. Existing shared primitives (`Layout`, `Modal`, form controls, buttons, toasts, and Lucide icons) remain in use.

`appointmentService.js` remains the Supabase boundary. Existing CRUD methods will be reused and search/date/status querying retained. The existing appointments schema supports title, candidate, date, time, type, status, and notes only. Reference-only presentation metadata—stage, location, coordinator, and direct candidate contact fields—will be normalized for display and kept page-local unless matching joined candidate data exists. No unsupported columns will be sent to Supabase.

## Data Model and Demo Record

The normalized page model includes:

- `id`
- `title`
- `subtitle` / appointment type
- `candidate_id`
- `candidateName`
- `candidateEmail`
- `candidatePhone`
- `date`
- `time`
- `location`
- `coordinator`
- `stage`
- `status`
- `notes`

Demo mode starts with the reference appointment:

- Candidate/title: `dogo`
- Type/subtitle: `Initial Interview`
- Date: `2025-09-23`
- Time: `01:00`
- Location: `Naim Investments Office - Room A`
- Coordinator: `Ali`
- Email: `dogo@gmail.com`
- Phone: `02145666`
- Stage: `Interviewing`
- Status: `Scheduled`

Configured mode loads up to 100 appointments through `getAppointments`, joins candidate name/email/phone where available, and fills unsupported presentation metadata with explicit defaults.

## Layout

### Page Header

The content header shows `Appointments` and `Schedule and manage candidate interviews and meetings`, matching the reference hierarchy, spacing, colors, and typography.

### Summary Cards

Four responsive cards show:

- Today's Appointments
- Upcoming
- Completed
- No Shows

Counts are derived from current page state and update after every mutation. `No Show` is a page-supported status for demo behavior; because the current Supabase constraint does not allow it, configured persistence will not send unsupported status values and the UI will show a targeted error if attempted.

### All Appointments Panel

The rounded panel contains:

- `All Appointments` heading with calendar icon
- `Schedule Appointment` button
- `Search appointments` field
- date filter
- `All Status` filter
- `All Stages` filter
- appointment selection checkbox

Desktop records use a semantic list/card layout matching the reference’s two-row information arrangement. Narrow screens stack metadata and controls into a mobile card with no page-level horizontal overflow.

Each record provides exact accessible labels for selection, editing, deletion, stage, and status.

## Interactions

### Schedule and Edit

One controlled modal supports candidate/title, appointment type, date, time, location, coordinator, email, phone, stage, status, and notes. Candidate/title and date are required with visible field-level errors. The modal uses `Schedule Appointment` / `Edit Appointment` titles and `Schedule` / `Update` actions.

Demo mode creates or edits state immediately. Configured mode sends only schema-supported fields and candidate IDs. Optimistic failures restore prior state and show targeted error toasts.

### Inline Controls

Stage and status selects update records and metric counts immediately. Configured mode persists supported status updates. Page-local stage updates remain in local state because no appointment stage column exists.

### Search and Filters

Search matches candidate/title, type, email, phone, location, and coordinator. Date, status, and stage filters combine. Clearing filters restores all records.

### Selection

Each record can be selected independently. Selection remains stable across filtering where records remain present and is cleaned up after deletion.

### Delete

Delete uses the exact browser confirmation prompt `Delete this appointment?`. Cancellation leaves state unchanged; confirmation removes the record. Supabase failure restores the previous collection.

## Error Handling

- Load failure: `Failed to load appointments`
- Create failure: `Failed to schedule appointment`
- Update failure: `Failed to update appointment`
- Delete failure: `Failed to delete appointment`
- Unsupported configured status: an explicit persistence limitation toast

No mutation failure may silently discard state.

## Accessibility and Responsiveness

All controls have stable accessible names. The appointment collection uses semantic structure, keyboard-operable native controls, visible focus behavior, and non-color-only text labels. The 390×844 layout must not cause horizontal document overflow. Desktop layout targets 1366×785 without clipped controls or open overlays.

## Verification

A dedicated Playwright specification will assert:

1. Exact header, summary labels, panel title, controls, and reference demo record.
2. Schedule validation and successful creation.
3. Editing.
4. Delete cancellation and confirmation.
5. Inline stage and status updates with metric changes.
6. Search and combined date/status/stage filters.
7. Selection behavior.
8. Responsive horizontal-overflow safety.
9. Regression navigation to Tasks, Documents, Receptionist View, and Associates.
10. No browser console errors or page errors.
11. A final 1366×785 screenshot at `appointments-final.png` with no open overlay.

Final verification requires targeted Appointments lint, a production build, the dedicated browser test, the complete Playwright regression suite, and visual screenshot inspection. The production preview remains available at `http://127.0.0.1:3000/appointments` after completion. The existing non-blocking bundle warning and unrelated project lint warnings will be reported separately.
