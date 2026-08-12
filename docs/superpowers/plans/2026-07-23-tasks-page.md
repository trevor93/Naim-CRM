# Tasks Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reference-matched Tasks dashboard with complete task CRUD, inline controls, search, filtering, sorting, selection, archiving, and auto-delete settings.

**Architecture:** Replace the generic `Table` composition in `TasksPage.jsx` with a focused responsive Tasks dashboard, reusing project UI primitives and demo data. Extend `taskService.js` only for batched archive/delete behavior, and use a dedicated Playwright spec as the interaction contract.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide React, Supabase, Vite, Oxlint, Playwright.

**Constraint:** Do not commit or push. Use working-tree checkpoints instead.

---

## File Structure

- Modify `src/pages/TasksPage.jsx`: state, data loading, reference layout, CRUD, menus, search/filter/sort, selection, archive, auto-delete.
- Modify `src/services/taskService.js`: add explicit batch archive/delete helpers used only in configured mode.
- Modify `src/services/demoData.js`: normalize reference task fields if needed.
- Create `artifacts/tasks-page-verification.spec.js`: end-to-end Tasks contract and screenshot.
- Preserve completed Documents, Receptionist View, Associates, and shared layout files.

### Task 1: Write the failing Tasks browser contract

**Files:**
- Create: `artifacts/tasks-page-verification.spec.js`

- [ ] Write one Playwright test using `import { test, expect } from 'playwright/test'`, URL `http://127.0.0.1:3000/tasks`, console/page-error capture, and exact assertions for `Tasks`, the subtitle, `Auto-Delete`, five metric labels, `All Tasks`, `Add Task`, search, filters, `Select All`, `Archive Completed`, sortable headings, and both demo rows.
- [ ] Add workflows for Add Task validation/success, edit, delete cancellation/confirmation, inline priority/category/status changes, metric updates, search, combined status/priority filters, sorting, row selection/Select All, archive cancellation/confirmation, and the Auto-Delete modal with default `30 days` plus Disabled/7/90 choices.
- [ ] Add regression navigation assertions for `/receptionist-view` and `/documents`, a 390×844 horizontal-overflow assertion, and a final 1366×785 screenshot at `C:/Users/user/Desktop/Naim-CRM/tasks-final.png` with no open overlay.
- [ ] Run `npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js" --grep "Tasks Page reference layout"` and expect failure against the current page.
- [ ] Check `git status --short`; do not commit.

### Task 2: Extend task persistence safely

**Files:**
- Modify: `src/services/taskService.js`

- [ ] Add `archiveTasks(ids)` that updates matching IDs with `archived_at` and `updated_at` timestamps and throws on Supabase error.
- [ ] Add `deleteCompletedTasksBefore(cutoff)` that deletes rows with status `Completed` and `completed_at < cutoff`, returning without action when cutoff is absent.
- [ ] Update `getTasks` to exclude archived rows when `archived_at` exists in the schema; if the current schema does not have archive columns, retain page-local archive behavior and do not invent a migration.
- [ ] Run `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run lint`; ensure no new service warning/error.
- [ ] Checkpoint without committing.

### Task 3: Build the Tasks dashboard data and interactions

**Files:**
- Modify: `src/pages/TasksPage.jsx`
- Reuse: `src/services/demoData.js`, `src/supabase/client.js`, `src/contexts/ToastContext.jsx`

- [ ] Replace tab/page state with `tasks`, `selectedIds`, `search`, `statusFilter`, `priorityFilter`, `sort`, modal states, and `autoDeleteDays` initialized from `localStorage.getItem('tasks:autoDeleteDays') || '30'`.
- [ ] Load `demoTasks` directly when Supabase is not configured. In configured mode call `getTasks({ pageSize: 100 })`; show `Failed to load tasks` on failure.
- [ ] Derive filtered/sorted visible tasks and metrics with `useMemo`. Pending, In Progress, Completed, and Overdue values must update after every mutation.
- [ ] Implement optimistic add, edit, delete, inline update, selection, Select All, archive completed, and auto-delete setting persistence. Supabase failures restore prior state and show targeted error toasts.
- [ ] Ensure completing a task sets `completed_at`; moving away from Completed clears it.
- [ ] Checkpoint without committing.

### Task 4: Match the reference layout

**Files:**
- Modify: `src/pages/TasksPage.jsx`

- [ ] Render a title/subtitle header with the outlined Auto-Delete button.
- [ ] Render five responsive cards with exact labels and icons: Total, Pending, In Progress, Completed, Overdue.
- [ ] Render the rounded All Tasks panel toolbar with Add Task, Search, All Status, and All Priority.
- [ ] Render Select All and Archive Completed controls.
- [ ] Render a desktop semantic table matching the supplied columns, numbered rows, assignee metadata, date icon, edit/delete controls, and styled native-select pills for priority/category/status.
- [ ] Render a mobile card list below `lg`, keeping all controls accessible and avoiding page-level horizontal overflow.
- [ ] Use exact accessible labels: `Search tasks`, `Filter tasks by status`, `Filter tasks by priority`, `Select all tasks`, `Select task <title>`, `Edit <title>`, `Delete <title>`, `Priority for <title>`, `Category for <title>`, and `Status for <title>`.
- [ ] Checkpoint without committing.

### Task 5: Build Add/Edit and Auto-Delete modals

**Files:**
- Modify: `src/pages/TasksPage.jsx`
- Reuse: `src/components/ui/Modal.jsx`, `Input.jsx`, `Textarea.jsx`, `Select.jsx`, `Button.jsx`

- [ ] Add one controlled task form with Title, Description, Assigned To, Due Date, Priority, Category, and Status. Title is required with visible `Title is required` feedback.
- [ ] Use modal titles `Add Task` and `Edit Task`; buttons `Create Task` and `Update Task`.
- [ ] Add delete confirmation through the browser confirm dialog and use exact prompt `Delete this task?`.
- [ ] Add an `Auto-Delete Settings` modal with a labeled retention select and Disabled, 7 days, 30 days, and 90 days; default to 30 days and save with accessible success toast `Auto-delete settings saved`.
- [ ] Ensure Cancel, Escape, close button, and overlay behavior are inherited from Modal.
- [ ] Run targeted lint via `npx --prefix "C:\Users\user\Desktop\Naim-CRM" oxlint "C:\Users\user\Desktop\Naim-CRM\src\pages\TasksPage.jsx" "C:\Users\user\Desktop\Naim-CRM\src\services\taskService.js"` and expect no new errors.
- [ ] Checkpoint without committing.

### Task 6: Make the dedicated browser test pass

**Files:**
- Modify only confirmed defects in Tasks files and `artifacts/tasks-page-verification.spec.js`.

- [ ] Run `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build`; expect exit 0.
- [ ] Keep or start `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run preview -- --host 127.0.0.1 --port 3000` in the background.
- [ ] Run the dedicated Tasks test and diagnose any locator failures from Playwright error context rather than weakening correct assertions.
- [ ] Expect `1 passed` and confirm `C:\Users\user\Desktop\Naim-CRM\tasks-final.png` exists.
- [ ] Checkpoint without committing.

### Task 7: Full verification and visual review

**Files:**
- Verification only.

- [ ] Run a fresh `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run build`; report the existing non-blocking bundle warning separately.
- [ ] Run `npm --prefix "C:\Users\user\Desktop\Naim-CRM" run lint`; report existing warnings accurately and fix only warnings introduced by Tasks changes.
- [ ] Run all Playwright specs with `npx --prefix "C:\Users\user\Desktop\Naim-CRM" playwright test --config "C:\Users\user\Desktop\Naim-CRM\artifacts\playwright.config.js"`.
- [ ] Inspect `tasks-final.png` against the reference: title/subtitle, Auto-Delete, five metric cards, complete toolbar, two rows, status colors, spacing, no clipping, no open overlay.
- [ ] Leave the production preview available on port 3000.
- [ ] Cancel the 10-minute progress cron after completion.
- [ ] Run final `git -C "C:\Users\user\Desktop\Naim-CRM" status --short`; confirm no commit/push and list intentional files.
