# Documents Reports Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully functional Documents > Reports tab matching the supplied reference image while preserving all completed document tabs.

**Architecture:** Define report categories in a focused `ReportsPanel` and render them through the existing reusable document-section component. Extend `DocumentsPage` with report state and route reports through the existing upload, selection, preview, edit, download, delete, demo, and Supabase paths.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide React, Supabase, Vite, Playwright browser automation

---

## File structure

- Create `src/components/documents/ReportsPanel.jsx`: owns report category metadata, green banner, and section composition.
- Modify `src/components/documents/DocumentsTabs.jsx`: makes Reports selectable.
- Modify `src/pages/DocumentsPage.jsx`: owns report data, selection, grouping, Supabase normalization, shared-handler routing, and Reports rendering.
- Create `scripts/verify-reports.mjs`: performs production-browser assertions and interaction checks.
- Produce `reports-final.png`: final inspected desktop screenshot.

### Task 1: Reports panel

**Files:**
- Create: `src/components/documents/ReportsPanel.jsx`

- [ ] **Step 1: Create exact report metadata and panel composition**

```jsx
import { BarChart3, FileBarChart, FileText, Shield } from 'lucide-react'
import MedicalDocumentSection from './MedicalDocumentSection'

export const REPORT_SECTIONS = [
  { id: 'financial', type: 'Financial Report', title: 'Financial Reports', subtitle: 'Monthly, quarterly, and annual financial reports', icon: BarChart3 },
  { id: 'performance', type: 'Performance Report', title: 'Performance Reports', subtitle: 'Staff performance and business metrics reports', icon: FileText },
  { id: 'compliance', type: 'Compliance Report', title: 'Compliance Reports', subtitle: 'Regulatory compliance and audit reports', icon: Shield },
  { id: 'analytics', type: 'Analytics Report', title: 'Analytics Reports', subtitle: 'Data analytics and business intelligence reports', icon: FileBarChart },
]

export default function ReportsPanel({ documentsBySection, selectedBySection, onToggle, onToggleAll, onUpload, onPreview, onEdit, onDownload, onDelete }) {
  return (
    <div className="mt-6 space-y-6">
      <aside className="rounded-lg border border-green-200 bg-green-50 px-4 py-5 text-green-900">
        <h2 className="text-sm font-semibold text-green-900">Reports & Analytics</h2>
        <p className="mt-2 text-xs leading-6 text-green-700">Store and manage all business reports including financial statements, performance metrics, compliance documents, and analytics reports. Maintain organized records for audits and strategic planning.</p>
      </aside>
      {REPORT_SECTIONS.map((section) => (
        <MedicalDocumentSection key={section.id} section={section} documents={documentsBySection[section.id] || []} selectedIds={selectedBySection[section.id] || new Set()} onToggle={(id) => onToggle(section.id, id)} onToggleAll={() => onToggleAll(section.id)} onUpload={(file) => onUpload(file, section, 'manual')} onCamera={(file) => onUpload(file, section, 'camera')} onPreview={onPreview} onEdit={onEdit} onDownload={onDownload} onDelete={onDelete} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: Vite completes successfully; the existing chunk-size warning may remain.

### Task 2: Enable and integrate Reports

**Files:**
- Modify: `src/components/documents/DocumentsTabs.jsx:16`
- Modify: `src/pages/DocumentsPage.jsx`

- [ ] **Step 1: Enable the Reports tab**

Append `|| id === 'reports'` to the existing `available` expression.

- [ ] **Step 2: Import report composition**

Add:

```jsx
import ReportsPanel, { REPORT_SECTIONS } from '../components/documents/ReportsPanel'
```

- [ ] **Step 3: Add report state**

Add beside the marketing state:

```jsx
const [reportDocuments, setReportDocuments] = useState([])
const [reportSelected, setReportSelected] = useState({ financial: new Set(), performance: new Set(), compliance: new Set(), analytics: new Set() })
```

- [ ] **Step 4: Reset and normalize report records**

In demo loading, call `setReportDocuments([])`. In Supabase normalization, build:

```jsx
const reportSectionByType = new Map(REPORT_SECTIONS.map((section) => [section.type, section.id]))
```

Then set records with:

```jsx
setReportDocuments(allDocuments.filter((document) => reportSectionByType.has(document.document_type)).map((document) => normalizeDocument(document, reportSectionByType.get(document.document_type), 'Current User')))
```

- [ ] **Step 5: Route demo uploads to report state**

In `handleUpload`, add before the medical fallback:

```jsx
else if (documentKind === 'report') setReportDocuments((current) => [...current, document])
```

- [ ] **Step 6: Add report grouping and selection**

```jsx
const reportsBySection = useMemo(() => Object.fromEntries(REPORT_SECTIONS.map((section) => [
  section.id,
  reportDocuments.filter((document) => document.section === section.id),
])), [reportDocuments])

function toggleReport(sectionId, id) {
  setReportSelected((current) => {
    const next = new Set(current[sectionId])
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return { ...current, [sectionId]: next }
  })
}

function toggleAllReports(sectionId) {
  const ids = reportsBySection[sectionId].map((document) => document.id)
  setReportSelected((current) => ({
    ...current,
    [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
  }))
}
```

- [ ] **Step 7: Route report edit and delete operations**

Add `report` branches to `saveMedicalEdit` and `handleDocumentDelete`, updating `reportDocuments`. Use “Report” or “report” in success/error labels. Add report-aware edit and candidate-link modal titles.

- [ ] **Step 8: Render ReportsPanel**

```jsx
{activeTab === 'reports' && (
  <ReportsPanel
    documentsBySection={reportsBySection}
    selectedBySection={reportSelected}
    onToggle={toggleReport}
    onToggleAll={toggleAllReports}
    onUpload={(file, section, source) => handleUpload(file, source, section, 'report')}
    onPreview={setPreviewMedical}
    onEdit={(document) => beginDocumentEdit(document, 'report')}
    onDownload={handleMedicalDownload}
    onDelete={(document) => handleDocumentDelete(document, 'report')}
  />
)}
```

- [ ] **Step 9: Build and lint**

Run: `npm run build`
Expected: PASS with only the existing non-blocking chunk warning.

Run: `npm run lint`
Expected: PASS, or report unrelated pre-existing findings separately.

### Task 3: Browser verification

**Files:**
- Create: `scripts/verify-reports.mjs`
- Produce: `reports-final.png`

- [ ] **Step 1: Write browser assertions**

Create a Playwright script that opens `http://127.0.0.1:3000/documents`, clicks Reports, and asserts:

```js
const expectedSections = [
  ['Financial Reports', 'Monthly, quarterly, and annual financial reports'],
  ['Performance Reports', 'Staff performance and business metrics reports'],
  ['Compliance Reports', 'Regulatory compliance and audit reports'],
  ['Analytics Reports', 'Data analytics and business intelligence reports'],
]
```

Assert exact banner title/body, four Upload labels, four Camera labels, four `input[capture="environment"]` elements, four empty-state messages, zero initial Select All labels, and no browser console/page errors.

- [ ] **Step 2: Start production preview**

Run: `npm run preview -- --host 127.0.0.1 --port 3000`
Expected: Vite serves the production bundle at `http://127.0.0.1:3000`.

- [ ] **Step 3: Verify report interactions**

Use Playwright `setInputFiles` with an in-memory PDF in the Financial section. Assert the row appears only in Financial, Select All appears, row selection toggles, preview opens, description edit saves, download initiates, deletion cancel keeps the row, and confirmed deletion restores the empty state.

- [ ] **Step 4: Regression-test every completed tab**

Click CVs, Medical Reports, Contracts, Licenses & Certifications, Adverts/Marketing, and Reports. Assert each expected root content appears and no page errors occur.

- [ ] **Step 5: Verify narrow layout**

Set viewport to 390 × 844 and assert:

```js
await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
```

- [ ] **Step 6: Capture and inspect final desktop screenshot**

Set viewport to 1366 × 1962, return to Reports, capture full page as `reports-final.png`, and inspect it for banner color, active tab, card spacing, icon sizing, empty-state alignment, and reference fidelity.

- [ ] **Step 7: Keep preview available and cancel progress schedule**

Leave the production preview running on port 3000. Cancel the five-minute progress job after all checks pass, then present only the final screenshot, verified URL, build result, and concise verification summary.
