# Documents → CVs Reference Replica Design

**Date:** 2026-07-22  
**Status:** Approved for implementation planning  
**Scope:** Naim CRM `Documents` route, CVs tab only

## 1. Objective

Replace the current generic Documents upload view with a faithful reconstruction of the supplied Documents → CVs reference image. The reference image is the visual and content source of truth for the first preview. The implementation must reproduce every visible CVs-page element, including the 17 sample draft rows, before any sample content is removed or replaced.

This is a focused Documents-page redesign. Existing application chrome, routing, authentication, and unrelated pages must remain intact.

## 2. Existing Application Boundary

The app already has a shared shell that is correct and must be reused:

- collapsed/expandable left sidebar;
- active Documents navigation item;
- top header structure;
- search control;
- notification control and unread badge;
- signed-in administrator identity;
- Logout control;
- existing Naim color tokens, Poppins typography, routing, and authentication.

Do not restyle shared `Header` or `Sidebar` components merely to force this page to match. The Documents route will pass `Admin Dashboard` as its existing header title. The separate `Documents` heading belongs inside the page content beneath that shared header.

Only the current Documents content is replaced:

- remove the generic `Upload Document` card from this route;
- remove the `All Documents` heading and document-type filter from this route;
- remove the current single `No documents` empty state;
- introduce the reference-matching tabbed Documents content.

Existing document and CV-draft service modules remain available and must not be deleted. Real-data policy is deferred until after visual review.

## 3. Page Hierarchy

At the 1366 px desktop reference width, the page renders in this order:

1. Existing shared header with title `Admin Dashboard`.
2. Existing left sidebar with Documents active.
3. Documents content container beneath the header.
4. `Documents` page heading in Naim gold.
5. Description: `Manage contracts, licenses, certifications, and other important documents`.
6. Horizontal document tabs.
7. CV Builder Integration banner.
8. CV Builder CVs card.
9. Uploaded CVs card.
10. CV Drafts card containing all 17 rows.

The content column follows the reference image’s proportions: approximately 56 px left/right inset within the main area, compact typography, pale gray page background, white cards, restrained borders, minimal shadows, and consistent vertical spacing.

## 4. Document Tabs

Render the complete tab bar in this exact order:

1. CVs — active;
2. Medical Reports;
3. Contracts;
4. Licenses & Certifications;
5. Adverts/Marketing;
6. Reports.

The active CVs tab uses the gold text and bottom-border treatment visible in the reference. Inactive tabs use neutral dark-gray text. The row scrolls horizontally at narrow widths rather than wrapping awkwardly.

Only CVs content is implemented in this scope. Clicking any other tab keeps CVs selected and shows an informational toast that its reference design has not been supplied yet. No unapproved tab content is rendered.

## 5. CV Builder Integration Banner

Render a pale-blue, blue-bordered information banner beneath the tabs with:

- heading: `CV Builder Integration`;
- explanatory copy: `CVs created in the CV Builder are automatically saved here. You can also upload external CVs manually. All CVs are linked to their respective candidates for easy access and management.`;
- right-aligned red action: `Clear All CV Drafts`.

The clear action must use a confirmation step. In the reference-replica preview, confirming hides or clears the in-memory demo draft rows only; it must not issue a destructive Supabase request. A page reload may restore deterministic reference fixtures for repeatable visual review.

## 6. CV Builder CVs Card

The first white card contains:

- leading document/folder-style section icon inside a small pale-gold square;
- heading: `CV Builder CVs`;
- subtitle: `CVs created and saved from the CV Builder application`;
- outlined `Upload` button with upload icon;
- blue-accented `Camera` button with camera icon;
- centered empty folder icon;
- line: `No documents uploaded yet`;
- line: `Click the upload button to add documents`.

Upload opens a hidden file input. Camera opens a capture-enabled file input where supported. Selecting a file displays a success toast containing the selected filename and keeps the empty-state fixture unchanged. It must not require a candidate ID or write to Supabase during this deterministic first-preview mode.

## 7. Uploaded CVs Card

The second white card mirrors the first card’s size, alignment, control placement, and empty-state treatment, with:

- leading upload-style section icon inside a pale-gold square;
- heading: `Uploaded CVs`;
- subtitle: `CVs uploaded manually by users`;
- outlined `Upload` and blue-accented `Camera` controls;
- the same centered folder icon and two empty-state lines.

The two cards remain visually distinct sections even when both are empty.

## 8. CV Drafts Card

The third card contains:

- leading copy/document icon inside a pale-gold square;
- heading: `CV Drafts`;
- subtitle: `Draft CVs that are work in progress`;
- `Select All` checkbox control;
- outlined `Upload` button;
- blue-accented `Camera` button;
- 17 compact draft rows matching the supplied image.

### 8.1 Draft-row structure

Each row includes, from left to right:

1. selection checkbox;
2. pale-gold ordinal badge (`1.` through `17.`);
3. small copy/document icon;
4. flexible text block;
5. Preview (eye) action;
6. Edit action;
7. Download action;
8. Delete action.

The text block contains:

- bold draft title/name and `Auto-saved Draft` or `Manual Draft` label;
- metadata line with file size, uploaded date/time, and `by CV Builder` or `by CV Builder Auto-save` wording;
- description line beginning `Auto-saved draft for…` or `CV draft for…`, including last-updated text where shown.

All names, numbering, file sizes, dates, times, labels, metadata, and descriptions visible in the supplied reference are copied into a deterministic local fixture for this first preview. They are presentation/demo records, not asserted to be real candidates and not persisted to Supabase.

### 8.2 Selection behavior

- Selecting a row updates its selected state.
- `Select All` selects all visible draft rows.
- Clicking `Select All` again clears all visible selections.
- If some but not all rows are selected, the control exposes an indeterminate state where the browser/component implementation supports it.

### 8.3 Row actions

- Preview opens a local modal showing the selected draft’s title, file size, upload metadata, and description.
- Edit navigates to the existing `/cv-builder` route. It does not mutate the local fixture.
- Download creates and downloads a UTF-8 `.txt` file containing the draft’s title, metadata, and description.
- Delete asks for confirmation, then removes that row from in-memory preview state only.

Icon-only actions receive accessible labels and visible hover/focus states.

## 9. Component Boundaries

Keep `DocumentsPage` focused on page-level composition and state. Use the following page-local modules:

- `src/components/documents/DocumentsTabs.jsx` — tab order, active styling, and unavailable-tab feedback;
- `src/components/documents/CVIntegrationBanner.jsx` — banner copy and clear action;
- `src/components/documents/CVDocumentSection.jsx` — reusable white section shell for the two empty document groups;
- `src/components/documents/CVDraftsSection.jsx` — selection state and draft-list composition;
- `src/components/documents/CVDraftRow.jsx` — one row’s visual structure and actions;
- `src/components/documents/CVUploadButton.jsx` — regular/camera input behavior;
- `src/services/demoData.js` — deterministic 17-row reference content used only when Supabase is not configured.

Fixture data must not be embedded as an unreadable block inside the page component. When Supabase is configured, `DocumentsPage` loads documents and CV drafts through the existing services instead of mixing demo rows into production data.

## 10. Visual Specification

The supplied 1366×3344 image is the desktop comparison target. Match:

- Poppins font already used by the app;
- Naim gold headings and accents;
- pale gray main background;
- white card surfaces;
- thin low-contrast gray borders;
- blue information-banner colors;
- red clear action;
- pale-gold icon and ordinal backgrounds;
- compact row typography and metadata hierarchy;
- card radii, control radii, button outlines, and icon sizes;
- horizontal and vertical spacing;
- section heights and overall page density;
- alignment of card headers, controls, empty states, and row actions.

Use existing Tailwind tokens when they match. Add narrowly scoped classes or token usage where necessary. Do not apply broad global CSS changes that could alter other pages.

## 11. Responsive Behavior

Desktop fidelity at 1366 px is the primary acceptance target. At narrower widths:

- keep the existing application shell behavior;
- allow tabs to scroll horizontally;
- let section-header controls wrap beneath headings without overlap;
- preserve readable draft metadata;
- keep row actions reachable, wrapping or moving to a secondary line when required;
- avoid horizontal page overflow except the intentional tab scroller.

Responsive adjustments must not change the desktop geometry used for screenshot comparison.

## 12. Data and Safety

For the approved first preview:

- when `isSupabaseConfigured` is false, render all 17 reference rows from `src/services/demoData.js`;
- when `isSupabaseConfigured` is true, load CV documents through `getDocuments()` and drafts through `getCVDrafts()`;
- keep demo fixtures out of production/Supabase mode;
- do not represent fixture names as production candidates;
- in demo mode, clear and delete actions update local state only;
- in Supabase mode, mutations use the existing `documentService` and `cvDraftService` functions after confirmation;
- avoid candidate-ID requirements in demo-mode upload controls; Supabase-mode uploads continue to use the existing document-service contract and must request or derive a candidate ID before upload.

After the visual preview, the user will decide which sample rows or controls to remove.

## 13. Error Handling and Feedback

- File-input cancellation is a no-op.
- Unsupported camera capture falls back to normal file selection.
- Invalid/unreadable local files produce a clear toast or inline message.
- Destructive-looking actions require confirmation.
- Demo preview/download/edit limitations are communicated explicitly rather than failing silently.
- Controls remain keyboard accessible and expose appropriate labels.

## 14. Verification and Acceptance Criteria

The implementation is accepted for first preview when:

1. At 1366 px width, the Documents route visually reproduces the supplied CVs reference image within practical browser-rendering tolerance.
2. The top shared header reads `Admin Dashboard`; the separate `Documents` heading appears below it.
3. Existing sidebar, search, notifications, account, Logout, authentication, and unrelated routes remain functional.
4. All six tabs appear in the exact order with CVs active.
5. The complete banner copy and red action appear.
6. Both empty document cards include all headings, subtitles, icons, controls, and empty-state copy.
7. The CV Drafts card renders all 17 reference rows with every visible text field and action.
8. Select All, individual selection, upload/camera triggers, preview, edit, download, delete, and clear actions provide observable safe behavior.
9. No demo action destructively changes Supabase data.
10. The page remains usable at tablet/mobile widths.
11. `npm run lint` and `npm run build` pass.
12. The running app is exercised end-to-end, and a fresh screenshot at the target viewport is compared against the reference before declaring completion.

## 15. Deferred Work

The following are explicitly outside this implementation:

- deciding which demo rows to remove after preview;
- replacing reference fixtures with production candidate/CV data;
- final Supabase persistence rules for CV uploads and drafts;
- redesigning the standalone CV Builder page;
- implementing Medical Reports, Contracts, Licenses & Certifications, Adverts/Marketing, or Reports content;
- unrelated changes to other application pages or global components.
