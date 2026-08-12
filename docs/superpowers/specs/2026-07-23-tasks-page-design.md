# Tasks Page Design

## Goal

Replace the current generic tabbed Tasks table with the fully functional Tasks dashboard shown in the supplied 1366×785 reference. Preserve completed Documents, Receptionist View, Associates, and shared shell behavior.

## Architecture

`TasksPage.jsx` owns task loading, local optimistic state, search, filters, sorting, selection, modal visibility, summary counts, archive behavior, and auto-delete settings. Focused reusable controls may be created under `src/components/tasks/` for status/priority/category menus and modal composition. Existing shared `Layout`, `Modal`, form controls, toast notifications, and Lucide icons remain unchanged unless a verified blocker requires a narrowly scoped fix.

The existing task service remains the persistence boundary. It will be extended only for the specific archive/auto-delete operations required by this page. Demo mode uses the established `demoTasks` data and performs complete in-memory workflows. Supabase mode calls service functions and keeps the visible state optimistic with rollback on failure.

## Reference Layout

The page remains under `Layout title="Tasks"` and renders:

1. A page heading and subtitle: “Manage and track all tasks across your recruitment process”.
2. An outlined Auto-Delete button aligned to the upper right.
3. Five summary cards: Total, Pending, In Progress, Completed, and Overdue. Each card has a matching icon and status color.
4. A rounded All Tasks panel containing:
   - All Tasks heading and Add Task button.
   - Search input.
   - All Status and All Priority filters.
   - Select All checkbox.
   - Archive Completed button.
   - A sortable task table with Task, Assigned To, Due Date, Priority, Category, and Status columns.
5. A responsive card representation of each task at narrow widths so the page has no horizontal overflow.

The desktop view matches the supplied gold, cream, white, blue, green, yellow, and red visual treatment, including compact status pills, subtle borders, generous spacing, and restrained shadows.

## Task Data

Each task supports:

- `id`
- `title`
- `description`
- `assignee`
- `created_by`
- `due_date`
- `priority`: Low, Medium, High, or Urgent
- `category`: Follow-up, Medical, Interview, Documentation, Administration, or Other
- `status`: Pending, In Progress, Completed, or Overdue
- `archived_at` when supported by persistence
- `completed_at` when completed

The reference demo rows remain “Follow up with Qatar Medical Center” and “Schedule Medical Exam for James Omondi”.

## Interactions

### Add, edit, and delete

Add Task opens a modal containing title, description, assignee, due date, priority, category, and status. Title is required. Edit opens the same modal with existing values. Delete uses a confirmation dialog and removes the task only after confirmation.

### Inline updates

Priority, category, and status are controlled by accessible pill menus. Selecting a new value updates the row and summary cards immediately. Supabase failures restore the previous task and show an error toast.

### Search, filters, and sorting

Search matches title, description, assignee, and category. Status and priority filters combine with search. Sortable columns toggle ascending and descending order; due dates sort chronologically, and text columns use case-insensitive comparisons.

### Selection and archive

Each row has a selection checkbox and Select All applies to the currently visible filtered rows. Archive Completed asks for confirmation, archives all currently completed tasks, clears their selection, updates counts, and shows an accessible success toast. If no completed tasks are visible, the button is disabled.

### Auto-delete

Auto-Delete opens a settings modal with Disabled, 7 days, 30 days, and 90 days. The approved default is 30 days. Saving persists the setting locally for demo mode and through the existing application storage pattern if one exists. In configured mode, completed tasks older than the retention threshold can be deleted through the task service. No destructive action runs merely by opening the modal.

## Error Handling

Loading uses the project spinner. Empty search/filter results show “No tasks found.” Service errors retain or restore prior visible data and show targeted toast messages. Archive and delete operations require explicit confirmation. Modal validation prevents incomplete submissions.

## Accessibility and Responsiveness

All icon-only controls have meaningful accessible labels. Menus expose button/menu semantics and close on selection, outside click, or Escape. Modal focus uses the existing shared focus trap. Table headers remain semantic. At 390px, cards stack, toolbar controls wrap, and the document width does not exceed the viewport.

## Verification

A dedicated Playwright test will cover:

- exact page title, subtitle, summary cards, toolbar, table headings, and demo rows;
- add, edit, and delete cancellation/confirmation;
- inline status, priority, and category changes;
- live KPI count updates;
- search and combined filters;
- sortable columns;
- row selection and Select All;
- Archive Completed cancellation and confirmation;
- Auto-Delete modal, 30-day default, persistence, and Disabled/7/90 options;
- navigation regression to Receptionist View and Documents;
- 390px page-level overflow check;
- browser console and page errors;
- final screenshot at 1366×785 with no open overlay.

Before completion, run a fresh production build, repository lint, the dedicated task test, and all existing Playwright specs. Keep the production preview on port 3000. Do not commit or push changes.
