# AIW-5: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-5 / https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-5
- Type, status, priority, assignee: Story, To Do, Medium, Akhil Vishnu
- Description: "As a UVJTaskFlow user, I want a modern, personalized task-management dashboard with UVJ Technologies branding, so that I can easily view, organize, and track my tasks through an intuitive and visually appealing interface." Redesign TaskFlow as UVJTaskFlow using the attached reference, the official logo, a green/grey/white palette, and a responsive dashboard while retaining existing functionality. Do not hardcode the sample user "Arun Janardhanan" or any person's name, email, image, or role. Branding: use the UVJTaskFlow name/logo in the sidebar, UVJ branding in the footer, and consistent typography, spacing, icons, rounded cards, and subtle shadows. Profile: dynamically show the current user's name in the welcome message and name, image or initials, and role in top navigation; use an existing authentication context, profile API, or configured source; show initials when the image is unavailable; show a generic greeting when the name is missing; update on account switch; do not expose sensitive information. Dashboard: compute Total Tasks, Completed, In Progress, and To Do counts from task data. Board: show To Do, In Progress, Completed, and On Hold columns. Cards show available title, description, priority, Jira key, assignee(s), effort/time, and comment/activity count where supported. Add visual status/priority indicators. Navigation: Dashboard, Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, Settings; only implement destinations supported by the app or explicitly agreed, and do not add nonfunctional items. Controls: global and task search, project and date selectors where supported, priority/status filters, assignee filter where supported, Create Task, Add Task within board columns, and Clear filters. Existing task creation/retrieval/filtering must continue to work. Responsive: desktop/tablet/mobile, no horizontal overflow or overlap, readable text, accessible contrast, and focus states. Technical notes: inspect architecture/auth/user APIs before changes; reuse existing profile/auth functionality; do not introduce authentication solely for this redesign; do not hardcode task counts, user data, statuses, or profile data when available from a source; identify needed backend changes; preserve behavior and add tests. Expected result is a responsive branded dashboard using real application data and correct user information, aligned with the supplied reference.
- Acceptance criteria (from the Jira description): (1) Display UVJTaskFlow and official UVJ logo. (2) Use a logo-inspired consistent palette. (3) Display the actual logged-in user's name, not the sample name. (4) Display profile image or initials fallback. (5) Retrieve profile data dynamically, not hardcoded. (6) Switching accounts displays that account's profile. (7) Missing profile data is handled without null/undefined/sample personal details. (8) Summary counts reflect task data. (9) Board has To Do, In Progress, Completed, On Hold columns using the existing model where applicable. (10) Cards show available title, description, priority, and related task information. (11) Search, filters, and task actions work wherever implemented. (12) Existing features and API behavior are preserved. (13) UI works on desktop, tablet, and mobile. (14) Automated tests cover dynamic profile, fallback, dashboard, and task behavior. (15) Final UI is reviewed against the attached reference.
- Attachments (id, filename, mime type; note which are logo/design images): 10026, "UVJ logo.png", image/png (logo); 10027, "UVJTaskFlow Kanban Dashboard.png", image/png (design/reference). Planner cannot download or view attachments; frontend-developer downloads and inspects both before UI work.
- Comments relevant to scope: One comment says "Initiated the work at 2026-10-31 07:44:12 UTC+00:00"; it adds no product requirements.

## Requirements
- Confirmed requirements:
  - Rebrand the application as UVJTaskFlow and use the provided UVJ Technologies logo and brand-inspired green, grey, and white palette.
  - Use the reference design for a clean, professional, responsive dashboard.
  - Display the logo and app name in the sidebar and UVJ branding in the footer.
  - Show current-user profile data dynamically; never hardcode the sample person's identity or expose sensitive profile data. Use initials for a missing image and a generic greeting when the name is unavailable.
  - Compute the four dashboard summary counts from task data.
  - Render To Do, In Progress, Completed, and On Hold board columns and show available task fields; optional Jira/assignee/effort/activity fields are conditional on API support.
  - Provide working global/task search, priority/status filters, clear-filters, and task create/add actions; only implement destinations and optional project/date/assignee controls that are supported or explicitly agreed.
  - Preserve existing behavior and test the dashboard, user fallbacks, task behavior, and responsive layouts.
- Existing capability facts:
  - `GET /api/tasks` returns five seeded tasks with `id`, `title`, `description`, `status`, and `priority`. The `Task` record has no Jira key, assignee, effort, or activity fields. The service uses an immutable in-memory list; the API currently has no create/update endpoint and no search/filter query parameters.
  - `GET /api/users/current` returns configured `name`, `role`, and `imageUrl`; no authentication/account-switching mechanism exists.
  - The priority-filter requirement already in `docs/requirements/task-priority-filter.md` specifies optional `priority` filtering on `GET /api/tasks`, supported values LOW/MEDIUM/HIGH, all tasks when omitted, and HTTP 400 for invalid values. It leaves case-sensitivity, empty input, and error-body shape open.
- Assumptions:
  - Use the existing profile API/configuration source; do not add authentication. This satisfies dynamic rendering from an existing configured source but cannot demonstrate switching authenticated accounts unless an identity source is added.
  - Map existing `OPEN` tasks to the requested To Do lane, preserve `IN_PROGRESS` and `COMPLETED`, and show an empty On Hold lane unless product scope explicitly adds that status/data. Do not invent drag-and-drop behavior.
  - Compute summary counts from the returned tasks. Global/task search and status filtering can operate on loaded task data. Project/date/assignee controls and card fields without backend support are omitted rather than presented as nonfunctional controls.
- Open questions:
  - Acceptance criterion 6 requires switching accounts, but this application has no authentication/account-switch feature and the story says not to add authentication solely for this redesign. Should criterion 6 be deferred until an existing identity source is integrated, or is an explicitly scoped account-selection mechanism expected?
  - The story requires Create Task/Add Task and says task creation/filtering must continue to work, but the existing API has no task creation behavior or persistence. Should this feature add a task creation API and storage, and if so what fields are required, how should status/priority defaults and validation work, and must created tasks survive an app restart? No task lifecycle behavior is specified.
  - The board requires On Hold, but the current task data has only OPEN, IN_PROGRESS, and COMPLETED. Should On Hold remain an empty lane, or should the data/API support an ON_HOLD status?
  - For the existing priority-filter contract, confirm case sensitivity, whether `?priority=` is invalid or equivalent to omission, and the HTTP 400 body/error schema.
  - Should priority filtering be performed through the documented `GET /api/tasks?priority=...` API contract, or client-side over the currently loaded tasks? The repository requirements prescribe the API contract, but its edge semantics remain open.
- Edge cases and risks:
  - Missing profile fields must render safely; the existing API returns null for missing values and unsafe image URLs.
  - Mapping raw task status `OPEN` to the product label To Do must not mutate the existing API contract; empty task data and unknown statuses need an intentional display policy.
  - Task creation cannot be implemented coherently without agreed request fields, validation, persistence, and status/priority behavior.
  - Account switching cannot be verified without an existing user identity source or agreed scope change.
  - The logo/reference assets cannot be viewed in planning; their dimensions and details may affect layout.

## Backend plan  (owner: task-api-developer)
Likely affected files: `src/main/java/com/example/taskflow/task/TaskController.java`, `TaskService.java`, and possibly `Task.java`/a request DTO; `src/test/java/com/example/taskflow/task/TaskControllerTest.java`. No auth work is planned; current profile API and its tests already cover configured/default/missing/unsafe values.
1. Implement the repository's specified optional priority filter on `GET /api/tasks` while preserving the no-parameter response contract, after resolving case sensitivity, empty input, and error response shape.
2. Do not add task creation or ON_HOLD support until the open questions establish the request/data contract, validation, persistence expectations, and permitted statuses. If approved, extend the service/controller and add focused MockMvc tests for valid, invalid, boundary, and regression cases.
3. Keep the existing task response fields stable. New Jira/assignee/effort/activity data requires an agreed source and API model; none exists currently.

## Frontend plan  (owner: frontend-developer)
Affected files: `src/main/resources/static/index.html`, `src/main/resources/static/styles.css`, `src/main/resources/static/app.js`, and `src/main/resources/static/images/` for the supplied logo asset.
1. Download and inspect both Jira PNG attachments before UI work; use the logo and reference as the visual source.
2. Build the branded dashboard shell, supported sidebar destinations, dynamic profile area, summary cards, four board lanes, and branded footer.
3. Fetch `/api/users/current`; show its available name/role/image dynamically, use initials when the image is absent, use a generic greeting when the name is absent, and avoid personal-data placeholders. Do not add account switching unless separately approved.
4. Fetch `/api/tasks`, derive the summary counts, render available task fields, map OPEN to To Do, and preserve loading/error/refresh behavior. Keep the On Hold lane present; its data behavior depends on the decision above.
5. Add working search, priority/status filters, and clear-filters. Keep optional project/date/assignee filters absent unless data support is agreed. Create/Add Task UI and behavior depends on the backend decision above; do not ship nonfunctional buttons.
6. Implement accessible, keyboard-operable responsive layouts for desktop/tablet/mobile and omit unsupported navigation destinations rather than adding inert menu items.

## Test plan  (owner: test-engineer)
- AC 1-2: Playwright verifies UVJTaskFlow branding, official logo placement, and expected palette/reference alignment; frontend-developer inspects the actual supplied reference before visual review.
- AC 3-7: Playwright stubs `/api/users/current` with non-default name, role, and image; checks initials and generic greeting for missing fields and ensures no sample personal data is shown. Existing user API tests verify configured and missing/unsafe values. AC 6 needs a product decision and an actual identity source before it can be verified.
- AC 8-10: Playwright checks summary totals are derived from task fixtures; checks all four lanes and task title/description/priority, mapping OPEN to To Do. Conditional metadata is asserted only if an agreed API source exists.
- AC 11-12: Test task/global search, priority/status filtering, clear-filters, creation actions if approved, API errors, refresh, and unchanged omitted-parameter API behavior. JUnit/MockMvc covers priority valid values, invalid values, omitted and clarified empty input; creation cases only if scope is approved.
- AC 13-15: Verify mobile/tablet/desktop layouts, no horizontal overflow or overlap, accessible names/focus, and capture/inspect a browser view against the supplied reference.
- Run `bash ./mvnw test` and `npm run test:e2e`; start the Spring Boot app as required by Playwright's configured base URL. Do not report AC 6 or task creation as covered until their scope is resolved.

## Jira status
Current status when planned: To Do. The first developer agent to start implementation moves the issue to In Progress.
