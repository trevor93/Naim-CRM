# Job Generator Page Design

## Goal

Rebuild `/job-generator` to match the supplied 1366×2044 Job Generator reference and the supplied Select Candidates modal reference, while preserving every completed page, the shared application shell, and the existing dirty working tree.

The page must provide a fully functional generator in demo mode and when Supabase is configured. The final preview remains withheld until build, lint, dedicated browser testing, full regression testing, responsive checks, and screenshot inspection pass.

## Architecture

Use a focused page rebuild rather than refactoring the verified Jobs page or expanding the database schema.

- `JobGeneratorPage.jsx` coordinates loading, controlled form state, validation, payload creation, generation, and navigation.
- Focused Job Generator components contain the large builder form, location controls, position list, and candidate-linking modal.
- Existing UI primitives, `Layout`, `useToast`, `jobService`, `candidateService`, demo data, constants, and Supabase configuration detection remain the integration boundaries.
- The existing `/job-generator` route, sidebar entry, and permission slug remain unchanged.
- The verified `JobsPage.jsx` is modified only as narrowly as necessary to receive and expose the newly generated demo job after navigation.

No new database table or column is required. Existing extended Jobs columns store the reference fields.

## Page Layout

The page uses `Layout` with the shared Admin Dashboard shell and reproduces the reference’s tall desktop presentation.

### Page header

- Heading: **Job Generator**
- Subtitle: **Create job postings quickly with ready-made sections and checkboxes**

### Builder card

A large white card has a light border, rounded corners, subtle shadow, and the heading **Quick Job Builder** with a document icon. Its body uses two columns on desktop and one column on mobile.

### Left column

1. **Gender**
   - Male
   - Female
2. **Qualifications**
   - Primary School
   - Secondary School
   - High School
   - Diploma
   - Bachelor's Degree
   - Master's Degree
   - PhD/Doctorate
3. **Locations**
   - Country selector
   - Dependent City selector
   - Add Location button
   - Removable list of added country/city pairs
4. Salary
5. Company Name
6. Number of Vacancies, default `1`
7. **Accommodation**
   - Yes
   - No
8. Age Maximum Range
9. Nationality
10. Duty Hours
11. Work Days
12. **Overtime**
    - Available
    - Not Available
13. **Transport Provision**
    - Provided
    - Not Provided
14. Contract Period

### Country and city data

Country options use this exact order:

1. Select Country
2. Saudi Arabia
3. UAE
4. Kuwait
5. Qatar
6. Bahrain
7. Oman

City options are dependent on the country and use these exact labels and order:

- Saudi Arabia: Riyadh, Jeddah, Mecca, Medina, Dammam, Khobar
- UAE: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah
- Kuwait: Kuwait City, Hawalli, Salmiya, Jahra, Ahmadi
- Qatar: Doha, Al Rayyan, Al Wakrah, Al Khor, Dukhan
- Bahrain: Manama, Riffa, Muharraq, Hamad Town, Isa Town
- Oman: Muscat, Salalah, Nizwa, Sur, Sohar

Changing country resets the pending city. Add Location requires both values, prevents duplicates, and adds a removable pair. The first added pair becomes the primary `country` and `city` used by Jobs filtering. Remaining locations are preserved in Additional Details.

### Right column

The positions retain the exact visible ordering and grouping from the reference:

1. Housemaids
2. Waiters/Waitress
3. Baristas
4. Cleaners
5. Caregivers
6. Drivers
7. Truck Drivers
8. Security Services
9. Emergency Services
10. A visible `Specify...` disclosure row
11. Nurses
12. Teachers
13. Plant Technicians
14. A second visible `Specify...` disclosure row
15. Erectors
16. Fabrication Foreman
17. Fabricator
18. Fitter
19. CNC Machine Operator
20. Welder
21. Forman - Steel factory
22. Welder (stainless steel)
23. Steel structure draftsman
24. Helper
25. Diesel Engine Mechanic
26. Hydraulic Mechanic
27. Tyre Man
28. Auto Electrician
29. Mechanic Helper
30. Mechanic Foreman
31. Car Denter
32. Car Painter
33. Helper (Painting)
34. Central - AC Tech.
35. Mobile crane driver
36. Other
37. Custom `Specify position...` field

The remaining controls are:

- Experience
- Additional Details
- Upload Files
- Link Candidates

A centered gold **Generate Job** button appears at the bottom of the card.

## Interactions

### Selection controls

Gender, qualifications, and positions are multi-select checkboxes. Accommodation, overtime, and transport are mutually exclusive radio groups.

The two `Specify...` rows behave as accessible disclosures. They preserve the reference’s collapsed appearance by default and reveal a focused custom text field when expanded. The final custom-position field remains available for Other or any unlisted role.

### File selection

Choose Files supports multiple images, PDFs, documents, and videos. The page displays selected filenames and provides remove actions before generation. It retains name, MIME type, and size metadata in the generated Jobs `uploads` value. Demo mode and configured mode use the same schema-safe metadata representation; this iteration does not add a storage bucket.

### Candidate linking

Select Candidates opens a modal matching the supplied reference.

Desktop modal structure:

- Title: **Select Candidates to Link**
- Close icon in the upper-right
- Left heading: **Available Candidates**
- Right heading: **Linked Candidates (N)**
- Scrollable available list
- Each candidate card displays name, position, and email
- Gold **+ Link** action
- Linked candidates move to the right and gain an **Unlink** action
- Empty right side displays a people icon, **No candidates linked yet.**, and **Select candidates from the left to link them.**
- Outlined **Done** button in the lower-right

The default modal does not add a visible search field because it is absent from the reference. Mobile stacks Available and Linked sections and keeps both independently usable.

Demo mode uses `demoCandidatesList`. Configured mode loads candidates through `getCandidates`. Selection is page-local until generation. Selected IDs are retained in the generated navigation state, while the existing `linked_candidates` column stores the count.

## Validation

Generation requires:

- At least one gender
- At least one selected or custom position
- Company name
- Salary
- A vacancy count of at least one
- At least one added country/city location

Errors are displayed next to their sections using accessible descriptions. The first invalid control receives focus. Optional fields remain optional. A failed configured-mode request retains all entered state.

## Job Mapping

The generator creates an object compatible with `addJob` and the extended Jobs schema.

- `title`: selected positions joined clearly; a single custom position is used directly
- `gender`: selected genders joined when more than one is selected
- `country`, `city`: first added location
- `company`: Company Name
- `salary_min`, `salary_max`: parsed from the salary input; a single value is stored in both fields
- `currency`: `SAR`
- `status`: `Active`
- `requirements`: selected qualifications plus disclosed/custom role requirements
- `experience`: Experience
- `accommodation`: selected Accommodation value
- `age_range`: Age Maximum Range
- `nationality`: Nationality
- `duty_hours`: Duty Hours
- `work_days`: Work Days
- `overtime`: selected Overtime value
- `transport`: selected Transport Provision value
- `contract_period` and `contract_duration`: Contract Period
- `vacancies_left`: Number of Vacancies
- `linked_candidates`: selected candidate count
- `uploads`: serialized file metadata
- `additional_details`: user Additional Details plus non-primary locations
- `description`: concise generated summary of positions, location, company, and vacancies

## Generation Flow

1. Validate the form.
2. Build the schema-safe payload.
3. In demo mode, generate a stable temporary ID and preserve the complete record in navigation state.
4. With Supabase configured, call `addJob` and use the returned record.
5. Show the existing `Job created!` success toast.
6. Navigate to `/jobs` with the generated record and a request to expose it.
7. The Jobs page merges a navigation-state demo record without mutating the locked `demoJobs` fixtures, then opens or highlights it.
8. On failure, show `Failed to create job` and keep the form intact.

## Responsive Design

- Desktop reproduces the reference’s two-column builder and tall full-page composition.
- The candidate modal uses two columns on desktop.
- At mobile widths, the builder becomes one column, controls fill available width, and the candidate modal stacks Available and Linked sections.
- No page-level horizontal overflow is permitted at 390×844.
- Long position labels, filenames, candidate emails, and location chips wrap safely.

## Accessibility

- Every input, select, checkbox, radio, file control, disclosure, and action has an explicit accessible name.
- Fieldsets and legends group checkboxes and radio groups.
- Validation messages are associated with controls and announced.
- The shared Modal supplies focus trapping, Escape handling, overlay close, `aria-modal`, and heading association.
- Candidate Link and Unlink labels include the candidate name.
- Added-location remove labels include country and city.
- Generate Job exposes a busy state during submission.

## Error Handling

- Candidate-loading failure shows an error toast and leaves the modal usable with an empty state.
- Duplicate or incomplete location attempts show focused inline feedback.
- Unsupported file selections show an error and are not added.
- Configured-mode creation failure rolls back no state because persistence occurs before navigation.
- Browser console and page errors are treated as verification failures.

## Verification

Before showing the final preview:

1. Add `artifacts/job-generator-verification.spec.js` as a dedicated Playwright contract and run it red against the old page.
2. Verify exact heading, subtitle, card title, section labels, options, position ordering, and reference placeholders.
3. Exercise country-dependent city lists for all six countries, duplicate prevention, add, and remove.
4. Exercise validation and focus behavior.
5. Exercise multi-file selection and removal using temporary fixtures.
6. Exercise candidate modal empty state, Link, Unlink, count, Done, and close behavior.
7. Generate a demo job, navigate to Jobs, and verify the new record is exposed with mapped values.
8. Verify configured-mode code remains schema-safe through the service boundary.
9. Run targeted Oxlint on all touched Job Generator and narrow Jobs integration files.
10. Run a fresh production build.
11. Run the complete Playwright regression suite for every completed page.
12. Verify 390×844 has no page-level horizontal overflow and that modal/page controls remain usable.
13. Capture a full-page desktop screenshot at the 1366 reference width and inspect it against both supplied references.
14. Confirm the production preview returns HTTP 200.

The existing non-blocking Vite chunk-size warning is reported separately if it remains. No commit or push is performed.