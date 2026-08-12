# Settings Page Screenshot Replica Design

**Date:** 2026-08-08
**Status:** Written specification awaiting user review
**Route:** `/settings`

## Goal

Replace the existing tabbed Settings interface with a single continuous page that reproduces the supplied Settings screenshot as closely as practical. The initial page must contain only the visible sections, controls, labels, data, and ordering shown in the screenshot. It must retain the existing NAIM CRM shell and work responsively.

## Approved decisions

- Use a componentized stacked layout rather than one large page component.
- Treat the supplied screenshot as the visual and content source of truth.
- Do not add tabs, filters, populated user rows, fields, cards, explanatory copy, or other initial-page content not visible in the screenshot.
- Use the screenshot's fixed development-account values rather than live authenticated profile values.
- Persist editable settings and locally created users in browser `localStorage`.
- Implement password changes as safe local simulations: validate input and report success, but never store a readable password.
- Keep the existing application header, sidebar, and `Layout` component.

## Desktop page structure

Inside `<Layout title="Admin Dashboard">`, render a vertically spaced Settings page with:

1. Page heading and subtitle.
2. Full-width save-status banner.
3. Full-width User Management card.
4. A two-column content grid:
   - Wide left column: Profile Information, Security Settings, Notification Preferences.
   - Narrow right column: Application Settings, Account Information, Settings Management.

The desktop widths, card heights, spacing, borders, rounded corners, shadows, and type hierarchy should visually follow the screenshot. Existing Tailwind theme tokens and Poppins/system fallback typography must be used instead of introducing a second design language. At the supplied 1366 px reference width, the page should target the screenshot geometry: approximately 24 px page gutters, 24 px vertical section gaps, a 2.1:1 left/right content ratio, 16 px card corner radii, restrained gray card shadows, and gold headings/actions.

## Exact initial content

### Page heading

- Heading: `Settings`
- Subtitle: `Manage your account settings and preferences`

### Save-status banner

- Green status dot.
- Primary copy: `All Changes Saved`
- Secondary copy: `All settings are synchronized`
- Right control: save icon and `Saved`
- Initial and post-save state matches the screenshot. While a user has an unsaved editable value, the status may change to `Unsaved Changes`; after a valid save it returns to the screenshot state.

### User Management

- Heading: `User Management`
- Supporting copy: `Manage users, roles, and permissions`
- Outlined action: `Add User`
- Empty table with these headers, in order:
  1. `User`
  2. `Role`
  3. `Status`
  4. `Last Login`
  5. `Permissions`
  6. `Actions`
- The initial table body is empty exactly as shown.

### Profile Information

- Heading: `Profile Information`
- Supporting copy: `Update your personal information and details`
- `Full Name` stored value: `Admin User (Dev Mode - No Auth)`; the desktop control clips the trailing text naturally at the same width as the screenshot, where `Admin User (Dev Mode -` is visible.
- `Email Address` stored value: `admin@naiminvestments.com`; the read-only control clips overflowing text naturally at the same width as the screenshot.
- Helper: `Email cannot be changed`
- `Role` value: `Admin`
- Helper: `Role is assigned by administrator`
- Primary action: `Update Profile`

### Application Settings

- Heading: `Application Settings`
- Supporting copy: `General application preferences`
- `Application Name`: `Recruitment CRM`
- `Default User Role`: `Broker`
- `Data Retention (Days)`: `1 Year`
- `Default Country`: `Kenya`
- `Default Currency`: `Kenyan Shilling (KES)`

### Security Settings

- Heading: `Security Settings`
- Supporting copy: `Manage your password and security preferences`
- Password block:
  - Label: `Change Password`
  - Copy: `Update your password to keep your account secure`
  - Outlined button: `Change Password`
- Two-factor block:
  - Label: `Two-Factor Authentication`
  - Copy: `Add an extra layer of security to your account`
  - Outlined button: `Enable 2FA (Coming Soon)`
- Session block:
  - Label: `Session Management`
  - Copy: `Manage your active sessions and login security`
  - Row label: `Auto-logout after inactivity`
  - Value: `30 minutes`

### Notification Preferences

- Heading: `Notification Preferences`
- Supporting copy: `Choose how you want to be notified`
- Four initially checked controls:
  1. `Email Notifications` — `Receive notifications via email`
  2. `WhatsApp Notifications` — `Receive notifications via WhatsApp`
  3. `Task Reminders` — `Get reminded about upcoming tasks`
  4. `Candidate Updates` — `Notifications when candidate status changes`

### Account Information

- Heading: `Account Information`
- Supporting copy: `Your account details`
- `User ID`: `dev-admin-001`
- `Last Login`: `8/7/2026, 11:55:17 PM`
- `Account Status`: `Active` in green

### Settings Management

- Heading: `Settings Management`
- Supporting copy: `Backup and restore your settings`
- Settings Sync row:
  - Label: `Settings Sync`
  - Copy: `Real-time synchronization across all components`
  - Green status dot and `Live`
- Two outlined actions side by side:
  - `Export Settings`
  - `Import Settings`
- Destructive outlined action: `Reset to Defaults`

## Component boundaries

`SettingsPage.jsx` owns page-level state loading, save-state coordination, modal visibility, and arrangement. Focused presentation/interaction components live under `src/components/settings/`:

- `SettingsSaveBanner`
- `UserManagementCard`
- `ProfileInformationCard`
- `ApplicationSettingsCard`
- `SecuritySettingsCard`
- `NotificationPreferencesCard`
- `AccountInformationCard`
- `SettingsManagementCard`
- `AddUserModal`
- `ChangePasswordModal`

Small constants and normalization helpers may live beside these components or in `settingsService.js`. Shared UI primitives should be reused where they visually fit; screenshot-specific composition remains in Settings components.

## Local persistence and data model

Extend `settingsService.js` around one versioned local-storage document under the existing `recruitment-settings` key. The normalized document contains:

- Application name, default role, retention period, country, currency.
- Profile display name while email and role remain fixed/read-only.
- Auto-logout duration.
- Four notification booleans.
- Locally added user rows.

Loading must merge stored values with defaults so older or partial settings remain valid. Malformed storage must fall back to defaults instead of crashing the route.

Every editable control updates page state. Controls without a separate visible save button, such as application selects and notification checkboxes, persist on change and return the banner to `All Changes Saved`. Profile name persists when `Update Profile` is pressed. The top `Saved` element is a non-interactive status treatment, not a second save action.

## Interaction behavior

### Add User

`Add User` opens an accessible modal. The modal collects: full name, role, status, last-login display text, and permissions summary. Validation requires a non-empty name and last-login value. Role choices are `Admin`, `Manager`, `Broker`, and `User`; status choices are `Active` and `Inactive`. On valid submission, a row is added to the previously empty table with `Edit` and `Delete` actions and is persisted locally. Edit reopens the same fields for that row. Delete requires confirmation. Cancel closes without mutation. This dialog and its rows do not introduce extra content into the initial screenshot state.

### Profile update

`Update Profile` requires a non-empty full name, writes it to local storage, updates the save banner, and produces success feedback. Email and role remain read-only.

### Application settings

The application name is editable. The four select controls expose their displayed screenshot values as defaults. Valid changes persist locally and update the save status.

### Change Password

`Change Password` opens an accessible dialog with new-password and confirmation inputs. Submission requires matching values of at least eight characters. Success clears the inputs and closes the dialog. No password value or password-derived secret is written to local storage.

### Two-factor authentication

`Enable 2FA (Coming Soon)` displays non-error informational feedback and changes no persisted state.

### Session and notifications

Changing the auto-logout duration or any notification checkbox persists immediately. The four notification controls start checked after first load or reset.

### Export

`Export Settings` downloads a JSON file containing the normalized Settings data. It must exclude password inputs and other ephemeral UI state.

### Import

`Import Settings` activates a hidden JSON file input. Valid JSON must be a plain object; recognized Settings fields are type-checked, unknown fields are ignored, and omitted fields inherit screenshot defaults. The normalized result is persisted and reflected in the page. Invalid JSON, arrays, `null`, or recognized fields with incompatible types leave existing data unchanged and display an error.

### Reset

`Reset to Defaults` opens an in-app confirmation dialog before replacing persisted settings with the screenshot defaults, clearing locally added users, and restoring the visible initial state. No native browser confirmation dialog is used.

## Feedback and error handling

- Reuse `ToastContext` for concise success, informational, and error messages.
- Keep field-specific validation messages inside modals where users need to correct input.
- File import and local-storage parse failures must not blank or crash the page.
- Buttons must use explicit `type="button"` or `type="submit"` as appropriate.
- Async-looking operations must not remain indefinitely in a loading state.

## Accessibility

- Preserve logical heading levels and DOM order.
- Every input and select receives a visible label or unambiguous accessible name.
- Notification checkboxes expose their checked state and full label.
- Modals use the existing accessible modal behavior and restore a sensible interaction path when closed.
- Icon-only decoration is hidden from assistive technology.
- Focus indicators and text contrast use existing theme conventions.

## Responsive behavior

- Desktop follows the screenshot's wide-left/narrow-right column proportions.
- Below the desktop breakpoint, cards stack in screenshot reading order without clipping.
- User Management may use an internal horizontal table scroller; the page itself must not overflow horizontally.
- Button groups wrap or stack on narrow screens.
- Inputs and selects remain usable at a 390 × 844 viewport.

## Verification

Create `artifacts/settings-verification.spec.js` and follow the project's existing Chrome/Playwright verification pattern. It must verify:

1. All eight visible page areas and their exact initial labels/data.
2. The empty initial User Management table and its six headers.
3. Add User modal validation, successful row creation, persistence after refresh, and reset clearing the row.
4. Profile update validation and persistence.
5. Application setting changes and persistence.
6. Password simulation validation and proof that password text is absent from exported/local settings.
7. 2FA informational feedback.
8. Auto-logout and all four notification controls.
9. JSON export filename/content, valid import, and invalid-import preservation.
10. Reset confirmation and restoration of screenshot defaults.
11. No page-level horizontal overflow at 390 × 844, with internal table scrolling when needed.
12. A full-page screenshot at the supplied reference width for visual review.
13. No page errors or unexpected console errors during the main workflow and related route smoke checks.

Run fresh lint, production build, the dedicated Settings Playwright test, and a browser network/error trace before reporting completion.

## Out of scope

- Supabase schema changes or cross-device synchronization.
- Real password updates, token revocation, or real 2FA enrollment.
- Live authenticated profile substitution.
- Populating the initial user table.
- Dark mode, language, timezone, avatar upload, audit logs, login-history lists, or any other content absent from the screenshot.
- Changes to the global header/sidebar beyond their normal Settings active state.
