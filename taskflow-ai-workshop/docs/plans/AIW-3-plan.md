# AIW-3: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-3 — https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-3
- Type, status, priority, assignee: Story; To Do; Medium; Abitha Antony.
- Description:

  > Redesign TaskFlow UI with UVJ Technologies Branding and Dynamic User Personalization
  >
  > ### 1. User Story
  >
  > As a UVJTaskFlow user, I want a modern, personalized task-management dashboard with UVJ Technologies branding, so that I can easily view, organize, and track my tasks through an intuitive and visually appealing interface.
  >
  > ### 2. Description
  >
  > Redesign the existing TaskFlow application as **UVJTaskFlow**, following the attached UI reference image.
  >
  > The new interface should provide a clean, professional, responsive dashboard inspired by the reference design, using the official UVJ Technologies logo and its green and grey brand colours.
  >
  > The implementation must retain existing application functionality while improving the visual presentation, navigation, task organization, and user experience.
  >
  > **Important:** The username displayed in the reference image, "Arun Janardhanan", is only sample content. The application must display the actual logged-in user's name and relevant profile information dynamically. Do not hardcode any individual's name, email, profile image, or role.
  >
  > ### 3. Functional Requirements
  >
  > **A. UVJTaskFlow Branding**
  > - Rename the application branding from TaskFlow to UVJTaskFlow.
  > - Use the official UVJ Technologies logo provided with the story.
  > - Apply a consistent green, grey, and white colour palette inspired by the logo.
  > - Display the logo and application name in the sidebar.
  > - Include appropriate UVJ Technologies branding in the application footer.
  > - Use consistent typography, spacing, icons, rounded cards, and subtle shadows.
  >
  > **B. Dynamic User Profile and Personalization**
  > - Display the currently authenticated user's name in the dashboard welcome message.
  > - Display the user's name, profile image or initials, and role where available in the top navigation.
  > - Retrieve user details from the application's existing authentication context, user profile API, or configured user source.
  > - Do not hardcode the sample name "Arun Janardhanan" or any other user's details.
  > - If a profile image is unavailable, display the user's initials as a fallback.
  > - If the user's name is unavailable, display a suitable generic greeting without showing null, undefined, or placeholder values.
  > - Ensure the displayed information belongs to the current user and updates appropriately when a different user logs in.
  > - Do not expose sensitive user information.
  >
  > **C. Dashboard Summary**
  > Display summary cards for Total Tasks, Completed, In Progress, and To Do. Calculate counts from available task data rather than hardcoding sample values.
  >
  > **D. Task Board**
  > Implement To Do, In Progress, Completed, and On Hold columns. Each card displays available relevant information: task title, description, priority, Jira issue key where available, assignee(s) where supported, estimated effort/time where available, and comments or related activity counts where supported. Use clear status and priority indicators.
  >
  > **E. Navigation and Task Controls**
  > Provide navigation for Dashboard, Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, and Settings. Only implement destinations supported by the existing application or explicitly included in the agreed scope; do not add non-functional menu items without identifying them as future enhancements.
  >
  > Provide global search, task search, project selector where supported, date-range selector where supported, priority filter, status filter, assignee filter where supported, Create Task, Add Task within relevant board columns, and Clear filters. Existing task creation, retrieval, and filtering behaviour must continue to work correctly.
  >
  > **F. Responsive Design**
  > Support desktop, tablet, and mobile layouts; prevent horizontal overflow and overlap; provide readable text, accessible contrast, and clear focus indicators.
  >
  > ### 4. Acceptance Criteria
  > 1. Display the name **UVJTaskFlow** and the official UVJ Technologies logo.
  > 2. Use a consistent palette inspired by the supplied logo.
  > 3. Display the actual logged-in user's name, not the sample name.
  > 4. Display the profile image when available; otherwise display initials.
  > 5. Retrieve user name/profile dynamically; do not hardcode it in the UI.
  > 6. Switching accounts displays that account's profile information.
  > 7. Handle missing user information without null, undefined, or sample personal details.
  > 8. Summary counts reflect available task data.
  > 9. Show To Do, In Progress, Completed, and On Hold using the existing data model where applicable.
  > 10. Show available title, description, priority, and related task information on cards.
  > 11. Search, filters, and task actions work correctly wherever implemented.
  > 12. Do not break existing application features or API behaviour.
  > 13. Be responsive and usable on desktop, tablet, and mobile.
  > 14. Automated tests cover dynamic user information, fallback behaviour, dashboard rendering, and relevant task functionality.
  > 15. Review and verify the implementation against the attached UI reference image.
  >
  > ### 5. Technical and Implementation Notes
  > Inspect the architecture, authentication, user model, APIs, and frontend. Reuse existing authentication/profile functionality; do not introduce a new authentication system solely for this redesign. Do not hardcode data when an existing source is available. Identify required backend changes before implementation. Preserve functionality, follow repository standards, add/update tests, and use the screenshot as a design reference rather than literal sample data.
  >
  > ### 6. Reference
  > Attachments: the UVJ Technologies logo and generated UVJTaskFlow dashboard design.
  >
  > **Expected outcome:** A branded, responsive UVJTaskFlow dashboard that matches the design direction of the reference image while displaying real application data and the correct information for each logged-in user.
- Acceptance criteria: See the numbered criteria copied above (1–15).
- Attachments:
  - ID 10022 — `UVJ logo.png` — image/png; official logo image.
  - ID 10023 — `UVJTaskFlow Kanban Dashboard.png` — image/png; UI/design reference.
  - The repository's local logo and dashboard-reference files were visually reviewed, and their duplicate workspace copies have matching SHA-256 hashes. Their bytes were not compared directly with Jira attachments, so exact attachment identity remains unverified.
- Comments relevant to scope: None (Jira returned zero comments).

## Requirements
- Confirmed requirements:
  - Rebrand the page as UVJTaskFlow and use the logo/reference direction, green/grey/white palette, and responsive accessible UI.
  - Use the existing profile/task data sources; render name/role/image or initials and graceful missing-name fallback without embedding personal sample data in the UI.
  - Calculate totals from task data and present the requested four board columns and available task information.
  - Preserve supported behavior and avoid non-functional navigation or controls.
- Scope decisions confirmed by the user on 2026-10-31:
  - Account switching is out of scope. Use the existing `/api/users/current` configured profile source; do not introduce authentication or multi-user infrastructure. Acceptance criterion 6 (switching accounts) is not delivered by this UI-only change.
  - Task creation is out of scope. Do not add Create Task/Add Task controls or a new backend write API; preserve the current task API contract except for its optional priority filter.
- Implementation constraints and mappings:
  - Only supported in-page navigation destinations are exposed (Dashboard and Board). Unsupported global/project/date/assignee controls and card fields are omitted rather than shown as nonfunctional placeholders.
  - Map existing `OPEN` tasks to the To Do column. Show On Hold as an empty column because the current model has no `ON_HOLD` tasks; do not change the status model.
  - Current application task data is in-memory and contains five tasks with `OPEN`, `IN_PROGRESS`, and `COMPLETED` status values; profile defaults are configured as `Demo User` / `Project Member`.
- Open questions: None for the approved implementation scope.
- Edge cases and risks:
  - Empty tasks, unexpected/missing profile values, absent/broken profile image, zero-count columns, no search/filter matches, and narrow viewport layout.
  - Existing `OPEN` tasks map to To Do; On Hold remains empty because the current status model has no `ON_HOLD` value. Adding new task statuses is out of scope.
  - Account switching and task creation remain out of scope, as confirmed by the user.
  - Profile role/image may be absent; no sensitive profile fields should be surfaced.

## Backend plan  (owner: task-api-developer)
- Existing profile contract: keep `GET /api/users/current` and its `UserProfile(name, role, imageUrl)` response; no authentication changes. Existing endpoint already cleans blank values and rejects unsafe image URL schemes.
- Do not add a login/account-switching system or a task-create endpoint; both are out of scope.
- The task API's optional priority filter is implemented in `TaskController`/`TaskService`; `GET /api/tasks` without the parameter preserves its current response contract. MockMvc tests cover valid filters, case/whitespace normalization, invalid values, and omitted-parameter regression.
- Do not add task statuses. Existing `OPEN` tasks populate To Do and On Hold remains an empty display column.

## Frontend plan  (owner: frontend-developer)
Affected files:
- `src/main/resources/static/index.html`
- `src/main/resources/static/styles.css`
- `src/main/resources/static/app.js`
- `src/main/resources/static/images/UVJ logo.png` (reuse/replace only after comparing with the Jira logo)
- `e2e/tests/taskflow-smoke.spec.ts`

Ordered steps:
1. Download and inspect both Jira image attachments before UI work; confirm whether existing local images are the supplied assets. Use the dashboard image as reference, not as literal sample data.
2. Replace the single table presentation with semantic sidebar/header/dashboard/board regions; use UVJ branding, accessible labels/focus states, and responsive layouts. Expose only functional in-page destinations; omit unsupported navigation destinations or clearly label them as future work after user confirmation.
3. Fetch `/api/users/current` and `/api/tasks`; render dynamic profile, initials/image fallback, safe generic greeting, task-derived totals, and task cards with fields actually returned by the API.
4. Add task search, priority/status filtering, and clear-filter behavior over fetched tasks. Do not add Create/Add Task controls or a task-write API; both are out of scope.
5. Map existing `OPEN` status to To Do and show On Hold as an empty column; handle empty columns and empty filtered results without changing the task status model.
6. Preserve visible loading/error states and safe DOM insertion for API values.

## Test plan  (owner: test-engineer)
- Profile: browser tests cover dynamic name/role/image, broken-image initials fallback, and missing-name generic greeting. Existing JUnit tests cover configured and missing values in `/api/users/current`.
- Dashboard and board: browser tests verify branding/logo, responsive layout at desktop/tablet/mobile widths, no horizontal overflow, task-derived counts, columns, and card title/description/priority.
- Search/filters: browser tests verify priority/status filtering, task search, no-match feedback, and clear filters. Task creation is excluded from scope and has no create controls or API.
- Regression: retain the current task-list/API behavior and existing smoke assertions; ensure failed API requests remain visibly reported.
- Manual visual check: compare desktop/tablet/mobile layouts with both inspected attachments; keyboard navigation, focus visibility, contrast, overflow, and image fallback.
- Validation after implementation: `./mvnw --batch-mode test`; if backend changes, also `./mvnw --batch-mode verify`; for frontend/API/browser changes, run the app and `npm run test:e2e` using the repository instructions. Do not run these during planning.

## Jira status
AIW-3 was verified as In Progress on 2026-10-31 after implementation began. No further Jira status change was made during review.
