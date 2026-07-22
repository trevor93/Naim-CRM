# Documents → CVs Reference Replica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Naim CRM `/documents` CVs view to match the supplied 1366×3344 reference image, with exact demo content, functional controls, and preserved Supabase behavior.

**Architecture:** Keep shared layout chrome unchanged and replace only `DocumentsPage` content. Put exact reference records in `demoData.js`, isolate visual sections into focused components under `components/documents`, and branch page data/mutations on `isSupabaseConfigured` so demo mode is deterministic while production mode continues through existing services.

**Tech Stack:** React 19 JSX, Vite 5, Tailwind CSS 3, lucide-react, react-router-dom 7, Supabase, custom ToastContext, and the session’s installed browser-driving capability for screenshot verification.

---

## File Structure

- Modify `src/services/demoData.js`: export the 17 exact CV draft records shown in the template.
- Create `src/components/documents/DocumentsTabs.jsx`: render the six tabs and unavailable-tab feedback.
- Create `src/components/documents/CVUploadButton.jsx`: hidden regular/camera file inputs and mode-aware callbacks.
- Create `src/components/documents/CVDocumentSection.jsx`: reusable empty/document section card.
- Create `src/components/documents/CVIntegrationBanner.jsx`: banner copy and clear-all control.
- Create `src/components/documents/CVDraftRow.jsx`: one exact draft row and four actions.
- Create `src/components/documents/CVDraftsSection.jsx`: header, Select All, row list, and empty state.
- Modify `src/pages/DocumentsPage.jsx`: compose the page, load demo or Supabase data, and implement safe actions.
- Modify `docs/superpowers/specs/2026-07-22-documents-cvs-reference-replica-design.md`: record the user’s mandatory demo/Supabase branch rule.
- Create `scripts/verify-documents.mjs`: browser-level behavior assertions and target screenshot capture.
- Modify `package.json`: add a deterministic `verify:documents` command only if the browser verifier can run without adding an unapproved runtime dependency.

The project has no test framework. TDD for this page uses a dependency-free Node fixture contract check first, then lint/build, followed by browser end-to-end verification and screenshot comparison.

### Task 1: Lock the exact reference data contract

**Files:**
- Create: `scripts/check-documents-fixtures.mjs`
- Modify: `src/services/demoData.js:258-290`

- [ ] **Step 1: Write the failing fixture-contract check**

Create `scripts/check-documents-fixtures.mjs`:

```js
import { demoCVDrafts } from '../src/services/demoData.js'

const expectedNames = [
  'MWASITI JUMA BAKARI',
  'JOLINE CHELIMO KENTEIA',
  'MWATSENZE MESAIDI BAKARI',
  'MWANAISHA IDI BOHORA',
  'MARIAMU JUMA MBARAK',
  'GRACE KAZUNGU JEFA',
  'JULIA KEYA BARASA',
  'PHANICE KWEKWE KHAMIS',
  'RECHAL NDIKULI NZANGA',
  'MWANAKMKUU JUMA MWATWENYE CV',
  'LINDA MUTHONI WAMBUI CV',
  'MARGARET TEMBO MWALUMBI CV',
  'EMILY WANGUI MAINA CV',
  'MICHELLE KAHANDARI CV',
  'JANE MWELU MUSAU CV',
  'LEAH SALAMA KAZUNGU CV',
  'TERESIAH WAMBERE KARIUKI CV',
]

if (demoCVDrafts.length !== 17) {
  throw new Error(`Expected 17 CV drafts, received ${demoCVDrafts.length}`)
}

for (const [index, draft] of demoCVDrafts.entries()) {
  if (draft.number !== index + 1) throw new Error(`Draft ${index + 1} has wrong number`)
  if (draft.name !== expectedNames[index]) throw new Error(`Draft ${index + 1} has wrong name`)
  for (const key of ['id', 'kind', 'title', 'size', 'uploadedAt', 'uploadedBy', 'description']) {
    if (!draft[key]) throw new Error(`Draft ${index + 1} is missing ${key}`)
  }
}

console.log('Documents CV fixtures: 17 exact rows present')
```

- [ ] **Step 2: Run the contract check to verify it fails**

Run:

```bash
node scripts/check-documents-fixtures.mjs
```

Expected: FAIL because `demoCVDrafts` is not exported.

- [ ] **Step 3: Add the exact 17 template rows to demo data**

Append an exported `demoCVDrafts` array to `src/services/demoData.js`. Use this object contract for every row:

```js
{
  id: 'cv-draft-1',
  number: 1,
  name: 'MWASITI JUMA BAKARI',
  kind: 'Auto-saved Draft',
  title: 'MWASITI JUMA BAKARI - Auto-saved Draft',
  size: '496.74 KB',
  uploadedAt: 'Jul 14, 2026, 11:59 AM',
  uploadedBy: 'CV Builder Auto-save',
  description: 'Auto-saved draft for MWASITI JUMA BAKARI',
}
```

Transcribe rows 2–17 exactly from the supplied image, preserving visible capitalization, spelling, sizes, dates, times, `Auto-saved Draft`/`Manual Draft`, uploader wording, and last-updated wording. Do not normalize names that differ from other app fixtures.

- [ ] **Step 4: Run the contract check to verify it passes**

Run:

```bash
node scripts/check-documents-fixtures.mjs
```

Expected: `Documents CV fixtures: 17 exact rows present`.

- [ ] **Step 5: Commit the fixture contract**

```bash
git add scripts/check-documents-fixtures.mjs src/services/demoData.js
git commit -m "Add Documents CV reference fixtures"
```

### Task 2: Build the tabs, upload controls, and empty document cards

**Files:**
- Create: `src/components/documents/DocumentsTabs.jsx`
- Create: `src/components/documents/CVUploadButton.jsx`
- Create: `src/components/documents/CVDocumentSection.jsx`

- [ ] **Step 1: Create the exact tab component**

Implement `DocumentsTabs` with this fixed model:

```jsx
const DOCUMENT_TABS = [
  ['cvs', 'CVs'],
  ['medical-reports', 'Medical Reports'],
  ['contracts', 'Contracts'],
  ['licenses-certifications', 'Licenses & Certifications'],
  ['adverts-marketing', 'Adverts/Marketing'],
  ['reports', 'Reports'],
]

export default function DocumentsTabs({ onUnavailable }) {
  return (
    <nav aria-label="Document categories" className="overflow-x-auto border-b border-gray-200">
      <div className="flex min-w-max">
        {DOCUMENT_TABS.map(([id, label]) => {
          const active = id === 'cvs'
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => !active && onUnavailable(label)}
              className={`-mb-px border-b-2 px-5 py-3 text-[13px] font-medium transition-colors ${active ? 'border-gold-light text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create a reusable regular/camera upload button**

Implement `CVUploadButton` with `useRef`, a hidden `<input type="file" accept=".pdf,.doc,.docx,image/*">`, optional `capture="environment"`, `Upload`/`Camera` icon selection, and `onFile(file)` callback. Reset the input value after callback so selecting the same file twice still fires.

Use the reference button classes:

```jsx
className={camera
  ? 'inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-[13px] font-medium text-blue-600 shadow-sm hover:bg-blue-100'
  : 'inline-flex items-center gap-2 rounded-full border border-cream bg-white px-4 py-1.5 text-[13px] font-medium text-primary shadow-sm hover:bg-cream-warm'
}
```

- [ ] **Step 3: Create the reusable document section shell**

Implement `CVDocumentSection({ id, icon: Icon, title, subtitle, documents, onUpload, onCamera })`. It must render:

- `<section id={id}>` with white rounded card;
- pale-gold 36×36 icon tile;
- exact title/subtitle hierarchy;
- Upload and Camera controls aligned right;
- when empty: centered `FolderOpen`, `No documents uploaded yet`, and `Click the upload button to add documents`;
- when populated in Supabase mode: compact rows using `file_name`, `document_type`, and formatted size, without changing the card header geometry.

- [ ] **Step 4: Run static verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 5: Commit foundational Documents components**

```bash
git add src/components/documents/DocumentsTabs.jsx src/components/documents/CVUploadButton.jsx src/components/documents/CVDocumentSection.jsx
git commit -m "Build Documents CV section controls"
```

### Task 3: Build the integration banner and exact draft rows

**Files:**
- Create: `src/components/documents/CVIntegrationBanner.jsx`
- Create: `src/components/documents/CVDraftRow.jsx`
- Create: `src/components/documents/CVDraftsSection.jsx`

- [ ] **Step 1: Build the CV Builder Integration banner**

Implement `CVIntegrationBanner({ onClear })` with:

```jsx
<h2>CV Builder Integration</h2>
<p>
  CVs created in the CV Builder are automatically saved here. You can also upload external CVs manually. All CVs are linked to their respective candidates for easy access and management.
</p>
<button type="button" onClick={onClear}>Clear All CV Drafts</button>
```

Use a pale-blue background, blue border/text, `rounded-lg`, and a compact red `rounded-md` clear action aligned right on desktop and below copy on narrow screens.

- [ ] **Step 2: Build one draft row**

Implement `CVDraftRow({ draft, selected, onSelect, onPreview, onEdit, onDownload, onDelete })` as an `<article>` with:

- checkbox labeled `Select ${draft.name}`;
- exact numbered gold badge;
- `Files` icon;
- title, metadata, and description lines;
- metadata separators using `<span className="mx-1 text-gray-300">•</span>`;
- icon buttons: `Eye`, `SquarePen`, `Download`, `Trash2`;
- `aria-label` and `title` on each action;
- row classes matching the template’s compact pale-gray strip, border, and spacing.

- [ ] **Step 3: Build selection-aware drafts section**

Implement `CVDraftsSection` with props:

```jsx
{
  drafts,
  selectedIds,
  onToggle,
  onToggleAll,
  onUpload,
  onCamera,
  onPreview,
  onEdit,
  onDownload,
  onDelete,
}
```

Use a ref on the Select All checkbox and set:

```js
selectAllRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < drafts.length
```

Render the exact heading `CV Drafts`, subtitle `Draft CVs that are work in progress`, Select All, Upload, Camera, then every `CVDraftRow`. If drafts are cleared, show the same centered folder empty state rather than collapsing the card.

- [ ] **Step 4: Run static verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 5: Commit the draft-list components**

```bash
git add src/components/documents/CVIntegrationBanner.jsx src/components/documents/CVDraftRow.jsx src/components/documents/CVDraftsSection.jsx
git commit -m "Build Documents CV draft list"
```

### Task 4: Replace DocumentsPage with mode-aware composition

**Files:**
- Modify: `src/pages/DocumentsPage.jsx:1-111`

- [ ] **Step 1: Replace generic page state and imports**

Import:

```jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Upload } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import DocumentsTabs from '../components/documents/DocumentsTabs'
import CVIntegrationBanner from '../components/documents/CVIntegrationBanner'
import CVDocumentSection from '../components/documents/CVDocumentSection'
import CVDraftsSection from '../components/documents/CVDraftsSection'
import { demoCVDrafts } from '../services/demoData'
import { getDocuments, uploadDocument, deleteDocument, downloadDocument } from '../services/documentService'
import { getCVDrafts, deleteCVDraft } from '../services/cvDraftService'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'
```

Use state for `builderCVs`, `uploadedCVs`, `drafts`, `selectedIds`, `previewDraft`, `loading`, and a candidate-ID upload prompt only in Supabase mode.

- [ ] **Step 2: Implement demo/Supabase loading**

On mount:

```js
if (!isSupabaseConfigured) {
  setBuilderCVs([])
  setUploadedCVs([])
  setDrafts(demoCVDrafts)
  setLoading(false)
  return
}

const [documents, cvDrafts] = await Promise.all([
  getDocuments({ documentType: 'Resume/CV' }),
  getCVDrafts(),
])
setBuilderCVs(documents.filter((doc) => doc.source === 'cv-builder'))
setUploadedCVs(documents.filter((doc) => doc.source !== 'cv-builder'))
setDrafts(cvDrafts.map(normalizeSupabaseDraft))
```

Define `normalizeSupabaseDraft` in the page so every live row satisfies the draft component contract. On failure, show `toast.error('Failed to load CV documents')` and retain empty arrays.

- [ ] **Step 3: Implement safe page actions**

Implement:

- unavailable tab → `toast.info('${label} will be built from its template image next.')`;
- demo upload/camera → success toast with filename, fixture stays unchanged;
- Supabase upload → request candidate ID with a small modal, then call `uploadDocument(file, candidateId, 'Resume/CV')`, reload, and toast success/error;
- Select All/individual selection → immutable `Set` updates;
- Preview → set `previewDraft`;
- Edit → `navigate('/cv-builder')`;
- Download demo → Blob containing title, size/upload metadata, and description; live draft without a stored file also uses this text fallback;
- Delete demo → confirmation then local removal;
- Delete Supabase draft → confirmation then `deleteCVDraft(id)`, reload, toast success/error;
- Clear demo → confirmation then clear local drafts;
- Clear Supabase → confirmation, `Promise.all(drafts.map(draft => deleteCVDraft(draft.id)))`, reload, toast success/error.

Do not invoke Supabase mutations in demo mode.

- [ ] **Step 4: Compose exact page markup**

Return:

```jsx
<Layout title="Admin Dashboard">
  <div id="documents-cvs-page" className="mx-auto max-w-[1190px] animate-fade-in px-2 pb-8 pt-6 sm:px-4 lg:px-6">
    <header className="mb-5">
      <h1 className="text-2xl font-bold text-primary">Documents</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage contracts, licenses, certifications, and other important documents
      </p>
    </header>
    <DocumentsTabs onUnavailable={handleUnavailableTab} />
    <div className="mt-5 space-y-5">
      <CVIntegrationBanner onClear={handleClearDrafts} />
      <CVDocumentSection
        id="cv-builder-cvs"
        icon={FileText}
        title="CV Builder CVs"
        subtitle="CVs created and saved from the CV Builder application"
        documents={builderCVs}
        onUpload={(file) => handleUpload(file, 'cv-builder')}
        onCamera={(file) => handleUpload(file, 'cv-builder')}
      />
      <CVDocumentSection
        id="uploaded-cvs"
        icon={Upload}
        title="Uploaded CVs"
        subtitle="CVs uploaded manually by users"
        documents={uploadedCVs}
        onUpload={(file) => handleUpload(file, 'manual')}
        onCamera={(file) => handleUpload(file, 'manual')}
      />
      <CVDraftsSection
        drafts={drafts}
        selectedIds={selectedIds}
        onToggle={handleToggleDraft}
        onToggleAll={handleToggleAll}
        onUpload={(file) => handleUpload(file, 'draft')}
        onCamera={(file) => handleUpload(file, 'draft')}
        onPreview={setPreviewDraft}
        onEdit={() => navigate('/cv-builder')}
        onDownload={handleDownloadDraft}
        onDelete={handleDeleteDraft}
      />
    </div>
    <Modal
      isOpen={Boolean(previewDraft)}
      onClose={() => setPreviewDraft(null)}
      title={previewDraft?.title || 'CV Draft Preview'}
    >
      <dl className="grid gap-3 text-sm">
        <div><dt className="font-semibold">File size</dt><dd>{previewDraft?.size}</dd></div>
        <div><dt className="font-semibold">Uploaded</dt><dd>{previewDraft?.uploadedAt} • {previewDraft?.uploadedBy}</dd></div>
        <div><dt className="font-semibold">Description</dt><dd>{previewDraft?.description}</dd></div>
      </dl>
    </Modal>
    <Modal
      isOpen={Boolean(pendingUpload)}
      onClose={() => setPendingUpload(null)}
      title="Link CV to candidate"
    >
      <label htmlFor="upload-candidate-id" className="text-sm font-medium">Candidate ID</label>
      <input id="upload-candidate-id" value={candidateId} onChange={(event) => setCandidateId(event.target.value)} />
      <button type="button" onClick={confirmSupabaseUpload}>Upload CV</button>
    </Modal>
  </div>
</Layout>
```

Do not modify `Layout.jsx`, `Header.jsx`, `Sidebar.jsx`, Dashboard, or Candidates.

- [ ] **Step 5: Run static verification**

Run:

```bash
node scripts/check-documents-fixtures.mjs
npm run lint
npm run build
```

Expected: fixture contract message, lint exit 0, production build exit 0.

- [ ] **Step 6: Commit the integrated page**

```bash
git add src/pages/DocumentsPage.jsx
git commit -m "Rebuild Documents CVs page from template"
```

### Task 5: Add browser verification and capture the reference viewport

**Files:**
- Create: `scripts/verify-documents.mjs`
- Modify: `package.json:6-11` only if a local Playwright-compatible executable/package already exists
- Create: `artifacts/documents-cvs-1366.png` during verification (do not commit unless the repository already tracks verification artifacts)

- [ ] **Step 1: Detect the available browser driver**

Run:

```bash
node -e "try{console.log(require.resolve('playwright'))}catch{process.exit(1)}"
```

If Playwright is unavailable, use the environment’s browser-driving tool rather than adding a dependency without approval. The verifier must still perform the assertions below.

- [ ] **Step 2: Write the browser verification script**

When Playwright is available, create `scripts/verify-documents.mjs` that:

```js
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 })
await page.goto('http://127.0.0.1:3000/documents', { waitUntil: 'networkidle' })
await page.getByRole('heading', { name: 'Documents', exact: true }).waitFor()
await page.getByText('CV Builder Integration').waitFor()
await page.getByText('CV Builder CVs', { exact: true }).waitFor()
await page.getByText('Uploaded CVs', { exact: true }).waitFor()
await page.getByText('CV Drafts', { exact: true }).waitFor()
const rows = page.locator('[data-cv-draft-row]')
if (await rows.count() !== 17) throw new Error('Expected 17 CV draft rows')
await page.getByLabel('Select all CV drafts').check()
if (await page.locator('[data-cv-draft-row] input[type=checkbox]:checked').count() !== 17) throw new Error('Select All failed')
await page.getByLabel('Preview MWASITI JUMA BAKARI').click()
await page.getByRole('dialog').waitFor()
await page.keyboard.press('Escape')
await page.screenshot({ path: 'artifacts/documents-cvs-1366.png', fullPage: true })
await browser.close()
```

Add semantic `data-cv-draft-row` and dialog semantics to components if the script exposes missing accessibility hooks.

- [ ] **Step 3: Build and serve the production app on port 3000**

Run:

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 3000
```

Keep the preview server running in the background for the next steps.

- [ ] **Step 4: Run end-to-end verification**

Run either:

```bash
node scripts/verify-documents.mjs
```

or the equivalent environment browser tool against `http://127.0.0.1:3000/documents`.

Expected: all assertions pass and `artifacts/documents-cvs-1366.png` is created.

- [ ] **Step 5: Compare the screenshot against the supplied template**

Open the captured full-page screenshot and compare, section by section:

- header title and existing chrome;
- Documents heading/description position;
- six tab labels and active underline;
- banner dimensions/copy/button;
- both card headers, buttons, and empty states;
- CV Drafts header controls;
- all 17 rows’ names, metadata, spacing, icons, and density;
- page background, card borders, radii, and vertical rhythm.

Record every mismatch before editing. Fix concrete differences in the narrowest component. Rebuild and recapture until no visible mismatch remains within practical font/browser rendering tolerance.

- [ ] **Step 6: Verify interactive controls**

Exercise and observe:

- unavailable tab toast;
- regular upload and Camera file picker trigger;
- individual checkbox and Select All;
- preview modal open/close and outside/Escape behavior;
- edit navigation to `/cv-builder`;
- demo download creates a `.txt` file;
- delete confirmation removes one local row;
- clear confirmation empties the local list;
- reload restores deterministic 17-row demo state.

Expected: each action has visible behavior and no console error.

- [ ] **Step 7: Run final quality gates**

Run:

```bash
node scripts/check-documents-fixtures.mjs
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all commands pass; only intended files are modified/untracked.

- [ ] **Step 8: Commit verification assets/scripts**

```bash
git add scripts/verify-documents.mjs package.json
git commit -m "Add Documents CV browser verification"
```

Skip `package.json` if no script was added. Do not commit generated screenshots unless project policy explicitly tracks them.

### Task 6: Review, final commit, and publish

**Files:**
- Review all changed files from Tasks 1–5
- Modify only files required by verified review findings

- [ ] **Step 1: Run code review**

Invoke the project’s code-review workflow at high effort on the full feature diff. Verify every finding before changing code. Pay special attention to production-mode mutations, accessibility, object URL cleanup, stale selection IDs, and shared-page regressions.

- [ ] **Step 2: Apply verified fixes and re-run all checks**

Run:

```bash
node scripts/check-documents-fixtures.mjs
npm run lint
npm run build
node scripts/verify-documents.mjs
git diff --check
```

Expected: all pass after fixes.

- [ ] **Step 3: Inspect the complete diff**

Run:

```bash
git status --short
git diff --stat HEAD~4..HEAD
git diff HEAD~4..HEAD -- src/pages/DocumentsPage.jsx src/components/documents src/services/demoData.js
```

Confirm no shared layout, Dashboard, or Candidates file changed.

- [ ] **Step 4: Commit any review corrections**

```bash
git add src/pages/DocumentsPage.jsx src/components/documents src/services/demoData.js scripts docs package.json
git commit -m "Polish Documents CVs template fidelity"
```

Only commit if review produced changes.

- [ ] **Step 5: Push the verified main branch**

Because the user explicitly authorized the project workflow to push each finished page to `main`, run:

```bash
git push origin main
```

Expected: remote `main` advances successfully and Netlify deployment starts.

- [ ] **Step 6: Confirm the deployed page**

Open the project’s configured Netlify URL at `/documents`. Confirm the deployment serves the new commit, the page renders all reference sections, and no console/runtime error occurs. If the live URL is not recorded in repository config or output, report that deployment was triggered and provide the local preview URL rather than inventing one.

- [ ] **Step 7: Report completion**

Report:

- local and live preview URL (when known);
- pushed commit hash;
- build/lint/browser-verification results;
- exact section checklist;
- any explicit assumption caused by text too small to read in the source image;
- readiness for the Medical Reports template.
