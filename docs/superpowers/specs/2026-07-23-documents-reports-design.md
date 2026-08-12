# Documents Reports Tab Design

## Goal

Implement the Documents > Reports tab to match the supplied 1366 px reference while preserving every completed Documents tab and extending the established document-management behavior to report files.

## Interface

Enable the Reports tab with the existing gold active underline and pale active background. The tab content begins with a pale-green, green-bordered banner titled **Reports & Analytics** and the exact body text:

> Store and manage all business reports including financial statements, performance metrics, compliance documents, and analytics reports. Maintain organized records for audits and strategic planning.

Below the banner, render four initially empty document sections:

1. **Financial Reports** — “Monthly, quarterly, and annual financial reports”
2. **Performance Reports** — “Staff performance and business metrics reports”
3. **Compliance Reports** — “Regulatory compliance and audit reports”
4. **Analytics Reports** — “Data analytics and business intelligence reports”

Each section reuses the approved document card, empty-state folder, Upload control, and Camera control. Empty sections omit Select All. Camera inputs use `capture="environment"`.

## Architecture

Add a focused `ReportsPanel` component containing report section metadata and composition. Reuse `MedicalDocumentSection` rather than duplicating document cards. Extend `DocumentsPage` with report state, section grouping, scoped selection, Supabase document-type normalization, and report routing through the existing shared upload, preview, edit, download, and delete handlers.

Report document types are explicit and stable so Supabase uploads round-trip to the correct section:

- Financial Report
- Performance Report
- Compliance Report
- Analytics Report

## Data and interactions

Demo mode starts with all report sections empty. Uploading or capturing a supported file creates a report record only in the selected section. Once populated, the section exposes Select All and the existing row actions. Configured Supabase mode uses the existing document service and candidate-link flow, with report-aware modal labels and success/error messages.

The implementation preserves existing CV, Medical Reports, Contracts, Licenses & Certifications, and Adverts/Marketing behavior.

## Error handling

Reuse existing file validation and toast handling. Require candidate ID in configured Supabase mode. Keep shared fallback download behavior for records without a stored file. Deletion retains its confirmation guard.

## Verification

- Run the production build and report the existing large-chunk warning separately if it remains non-blocking.
- Run the built application on `127.0.0.1:3000`.
- Verify exact banner and section text, four empty states, four Upload controls, four Camera controls, no initial Select All controls, and four environment-capture inputs.
- Upload a temporary report in demo mode and verify section isolation, selection, preview, edit, download, and safe deletion behavior.
- Switch through every completed Documents tab and check for browser errors.
- Check a narrow viewport for page-level horizontal overflow.
- Capture and visually inspect `reports-final.png` before presenting the final preview.
