# Appointments Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reference-matched Appointments dashboard with functional scheduling, editing, deletion, inline controls, search, combined filters, selection, live metrics, responsive behavior, and demo/Supabase support.

**Architecture:** Replace the generic `Table` composition in `AppointmentsPage.jsx` with a focused responsive dashboard using normalized appointment state and derived views. Reuse the existing UI primitives and appointment service; add only schema-safe service behavior and a dedicated Playwright interaction contract.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide React, Supabase, Vite, Oxlint, Playwright.

**Constraint:** Preserve the existing working tree and completed pages. Do not commit or push; use working-tree checkpoints.

---

## File Structure

- Modify `src/pages/AppointmentsPage.jsx`: normalized data, reference layout, CRUD, inline controls, search, filters, selection, responsive records, and modals.
- Modify `src/services/appointmentService.js`: retain schema-safe CRUD/filtering and make configured-mode payload boundaries explicit if required.
- Modify `src/services/demoData.js`: export the exact reference appointment used in demo mode.
- Create `artifacts/appointments-verification.spec.js`: complete end-to-end contract and screenshot.
- Preserve Tasks, Documents, Receptionist View, Associates, and all shared shell behavior.

### Task 1: Write the failing Appointments browser contract

**Files:**
- Create: `artifacts/appointments-verification.spec.js`

- [ ] Create one Playwright test with `import { test, expect } from 'playwright/test'`, base URL `http://127.0.0.1:3000`, and console/page-error capture.
- [ ] Assert the exact page heading `Appointments`, subtitle `Schedule and manage candidate interviews and meetings`, metric labels `Today's Appointments`, `Upcoming`, `Completed`, and `No Shows`, `All Appointments`, `Schedule Appointment`, search/date/status/stage filters, and the reference `dogo` record metadata.
- [ ] Exercise schedule validation by submitting an empty form and expecting visible required feedback for candidate/title and date.
- [ ] Create `Jane Candidate` with type `Medical`, a future date/time, location, coordinator, email, phone, stage `Onboarding`, and status `Scheduled`; expect it only once in the appointment collection.
- [ ] Edit it to `Jane Updated` and expect the new title.
- [ ] Change the reference appointment stage to `Offer` and status to `Completed`; assert controls and the Completed metric update.
- [ ] Exercise search, date, combined status/stage filters, and filter clearing.
- [ ] Check the reference row selection checkbox.
- [ ] Dismiss deletion once and assert the record remains; accept deletion and assert removal.
- [ ] Navigate to `/tasks`, `/documents`, `/receptionist-view`, and `/associates`; assert each completed page renders, then return to `/appointments`.
- [ ] Set a 390×844 viewport and assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- [ ] Restore 1366×785, close all overlays, capture `C:/Users/user/Desktop/Naim-CRM/appointments-final.png`, and assert the error array is empty.
- [ ] Run `npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js" --grep "Appointments Page reference layout"`; expect failure against the current generic table.
- [ ] Run `git -C "C:\Users\user\Desktop\Naim-CRM" status --short`; do not commit.

### Task 2: Add exact demo appointment data

**Files:**
- Modify: `src/services/demoData.js`

- [ ] Export `demoAppointments` with one normalized record containing:

```js
export const demoAppointments = [{
  id: 'appointment-dogo',
  title: 'dogo',
  type: 'Initial Interview',
  candidate_id: '',
  candidateName: 'dogo',
  candidateEmail: 'dogo@gmail.com',
  candidatePhone: '02145666',
  date: '2025-09-23',
  time: '01:00',
  location: 'Naim Investments Office - Room A',
  coordinator: 'Ali',
  stage: 'Interviewing',
  status: 'Scheduled',
  notes: '',
}]
```

- [ ] Ensure the new export does not alter existing demo exports or consumers.
- [ ] Run `npx --prefix "C:\Users\user\Desktop\Naim-CRM" oxlint "C:\Users\user\Desktop\Naim-CRM\src\services\demoData.js"`; expect no new error.
- [ ] Checkpoint with `git status --short`; do not commit.

### Task 3: Normalize Appointments state and persistence

**Files:**
- Modify: `src/pages/AppointmentsPage.jsx`
- Inspect/modify only if required: `src/services/appointmentService.js`

- [ ] Define constants for statuses `Scheduled`, `Completed`, `Cancelled`, `Rescheduled`, and `No Show`; stages `Onboarding`, `Interviewing`, `Offer`, `Hired`, and `Rejected`; and a complete empty form.
- [ ] Implement `normalizeAppointment` so joined `candidates.name/email/phone` populate presentation fields while page-local fields receive explicit defaults.
- [ ] Load `demoAppointments.map(normalizeAppointment)` directly when `isSupabaseConfigured` is false.
- [ ] In configured mode call `getAppointments({ pageSize: 100 })`, normalize data, and show `Failed to load appointments` on failure.
- [ ] Replace server pagination state with `appointments`, `selectedIds`, `search`, `dateFilter`, `statusFilter`, `stageFilter`, form/modal state, and validation state.
- [ ] Derive visible appointments and metrics with `useMemo`. Today uses the local ISO date; Upcoming counts future appointments not completed/cancelled/no-show; Completed and No Shows use exact status values.
- [ ] Add `toServicePayload` returning only `title`, `candidate_id`, `date`, `time`, `type`, `status`, and `notes`, omitting empty `candidate_id`. Never send `stage`, `location`, `coordinator`, email, or phone to Supabase.
- [ ] Reject `No Show` persistence in configured mode before the service call with an explicit toast because the current schema constraint excludes it; preserve the prior state.
- [ ] Keep the existing `appointmentService.js` CRUD signatures. Modify it only if a confirmed payload/filter defect requires a schema-safe correction.
- [ ] Run targeted lint and checkpoint without committing.

### Task 4: Implement complete Appointments interactions

**Files:**
- Modify: `src/pages/AppointmentsPage.jsx`

- [ ] Implement `openForm` with normalized record-to-form mapping and clean add defaults.
- [ ] Validate candidate/title and date with visible `Candidate or title is required` and `Date is required` messages.
- [ ] Implement optimistic add and edit. Demo mode updates local state and succeeds; configured mode uses `addAppointment`/`updateAppointment`, replaces temporary records with normalized returned data, and rolls back with targeted error toasts.
- [ ] Implement inline stage updates page-locally and inline status updates optimistically. Persist only schema-supported statuses in configured mode.
- [ ] Implement individual selection and remove deleted IDs from selection.
- [ ] Implement deletion with exact confirmation `Delete this appointment?`, optimistic removal, Supabase rollback, and `Appointment deleted` success toast.
- [ ] Ensure all metric values update after add, edit, status changes, and deletion.
- [ ] Checkpoint without committing.

### Task 5: Match the reference desktop and mobile layout

**Files:**
- Modify: `src/pages/AppointmentsPage.jsx`

- [ ] Render the `Appointments` title and exact subtitle using the reference typography and spacing.
- [ ] Render four responsive white metric cards with gold, blue, green, and orange values/icons matching the screenshot.
- [ ] Render the rounded All Appointments panel with calendar icon, two-line heading, outlined Schedule Appointment button, inline search, date, status, and stage controls.
- [ ] Render desktop semantic appointment records matching the reference: checkbox and numbered badge; candidate/title and type; stage/status pills; edit/delete actions; date, time, location, coordinator, email, and phone metadata with icons.
- [ ] Render stacked appointment cards below `lg`, retaining every control and preventing page-level horizontal overflow.
- [ ] Use exact accessible labels:
  - `Search appointments`
  - `Filter appointments by date`
  - `Filter appointments by status`
  - `Filter appointments by stage`
  - `Select appointment <title>`
  - `Edit <title>`
  - `Delete <title>`
  - `Stage for <title>`
  - `Status for <title>`
- [ ] Render `No appointments found.` when filters produce no records.
- [ ] Checkpoint without committing.

### Task 6: Build the Schedule/Edit modal

**Files:**
- Modify: `src/pages/AppointmentsPage.jsx`
- Reuse: `src/components/ui/Modal.jsx`, `Input.jsx`, `Textarea.jsx`, `Select.jsx`, `Button.jsx`

- [ ] Use modal titles `Schedule Appointment` and `Edit Appointment`, with actions `Schedule` and `Update`.
- [ ] Add labeled controls for Candidate or Title, Appointment Type, Date, Time, Location, Coordinator, Email, Phone, Stage, Status, and Notes.
- [ ] Use appointment-type options `Initial Interview`, `Follow-up`, `Medical`, `Document Collection`, `Visa`, and `Other`.
- [ ] Keep Cancel, Escape, close button, and overlay behavior inherited from `Modal`.
- [ ] Run `npx --prefix "C:\Users\user\Desktop\Naim-CRM" oxlint "C:\Users\user\Desktop\Naim-CRM\src\pages\AppointmentsPage.jsx" "C:\Users\user\Desktop\Naim-CRM\src\services\appointmentService.js" "C:\Users\user\Desktop\Naim-CRM\src\services\demoData.js"`; expect no Appointments-introduced warnings/errors.
- [ ] Checkpoint without committing.

### Task 7: Make the dedicated browser test pass

**Files:**
- Modify only confirmed defects in Appointments files and `artifacts/appointments-verification.spec.js`.

- [ ] Run `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build`; expect exit 0 and report the existing chunk-size warning separately.
- [ ] Ensure `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run preview -- --host 127.0.0.1 --port 3000` serves the new production bundle.
- [ ] Run the dedicated Appointments Playwright test and diagnose locator failures from error context instead of weakening valid assertions.
- [ ] Expect `1 passed` and confirm `C:\Users\user\Desktop\Naim-CRM\appointments-final.png` exists.
- [ ] Checkpoint without committing.

### Task 8: Full verification and visual review

**Files:**
- Verification only; modify only confirmed Appointments defects.

- [ ] Run a fresh production build; expect exit 0 and record the existing non-blocking bundle warning.
- [ ] Run full project lint. Fix only warnings introduced by Appointments work and report unrelated warnings accurately.
- [ ] Run all Playwright specs with `npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"`; expect all tests to pass.
- [ ] Inspect `appointments-final.png` against the reference for title/subtitle, four metric cards, toolbar, reference record, colored controls, metadata spacing, no clipping, and no open overlay.
- [ ] Confirm `http://127.0.0.1:3000/appointments` returns HTTP 200 and leave the production preview available.
- [ ] Cancel the 10-minute progress cron after completion.
- [ ] Run final `git -C "C:\Users\user\Desktop\Naim-CRM" status --short`; confirm no commit/push and list intentional Appointments files.
