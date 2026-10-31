# AIW-2: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-2 / https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-2
- Type, status, priority, assignee: Story / To Do / Medium / Abin T Mathew
- Description: Redesign the existing TaskFlow application as UVJTaskFlow, following the attached UI reference image. Preserve existing functionality while adding UVJ branding, dynamic current-user personalization, task summaries, a Kanban board, supported controls, and a responsive layout. The sample reference name is not to be implemented as user data.
- Acceptance criteria: Display UVJTaskFlow and its official logo; use the supplied brand palette; load the actual configured/current user and profile image or initials; handle missing profile values gracefully; derive task counts and board columns from API task data; preserve existing task behavior; support responsive desktop, tablet, and mobile layouts; add focused automated coverage.
- Attachments (id, filename, mime type; note which are logo/design images):
  - 10020 / UVJ logo.png / image/png / official logo image; cannot download or inspect attachments in the planner environment.
  - 10021 / UVJTaskFlow Kanban Dashboard.png / image/png / dashboard design reference image; cannot download or inspect attachments in the planner environment. `frontend-developer` must download and inspect both images before UI implementation.
- Comments relevant to scope: None.

## Requirements
- Confirmed requirements:
  - Rebrand the dashboard as UVJTaskFlow and use the supplied visual assets.
  - Load name, role, and optional image from the existing `/api/users/current` profile source.
  - Use API-provided tasks to calculate summary counts and render supported board statuses.
  - Preserve existing `/api/tasks` retrieval behavior and profile API behavior.
  - Provide accessible, responsive UI with visible focus and no horizontal overflow.
  - Use initials when no profile image is available and never display null-like or sample personal values.
  - Add and run focused automated tests for profile fallbacks, dashboard rendering, and task behavior.
- Assumptions:
  - The existing static frontend and Spring Boot profile/task APIs are the implementation foundation.
  - OPEN tasks represent the To Do column and IN_PROGRESS tasks represent In Progress; COMPLETED tasks represent Completed.
  - The On Hold column is rendered only when the existing data contains an ON_HOLD-compatible status, and is not populated with invented tasks.
  - Existing profile configuration is the agreed current-user source for this workshop unless authentication is added elsewhere.
- Open questions:
  - Which navigation labels beyond Dashboard and supported task views are in scope; the story forbids non-functional menu items.
  - Are task creation, adding tasks, and project/date/assignee filtering expected to change backend contracts, or should unsupported controls remain absent or clearly marked as future work?
  - Does the existing data model support Jira keys, assignees, effort, comments, or another source? The current `Task` record contains only id, title, description, status, and priority.
  - Can profile switching be simulated through configuration/test profiles, or is authentication required by the surrounding environment?
- Edge cases and risks:
  - Empty task lists must produce zero counts and empty supported board columns without breaking rendering.
  - Unknown task statuses must not disappear silently or break summary calculations.
  - Missing profile fields must produce a generic greeting and initials fallback without null-like text.
  - Untrusted profile text and task text must be rendered with `textContent`; profile image URLs must remain constrained by the existing backend validation.
  - Attachment inspection is a dependency for accurate visual fidelity and logo placement.
  - The reference image contains sample personal information that must not be copied into the application.

## Backend plan (owner: task-api-developer)
Affected files: `src/main/java/com/example/taskflow/task/Task.java`, `src/main/java/com/example/taskflow/task/TaskController.java`, `src/main/java/com/example/taskflow/task/TaskService.java`, and profile APIs/tests only if implementation gaps are confirmed.

1. Confirm that the existing profile endpoint already provides name, role, and sanitized imageUrl; retain the existing JSON contract unless tests expose a requirement gap.
2. Confirm current task statuses and decide a stable API status contract. Map OPEN, IN_PROGRESS, COMPLETED, and any ON_HOLD-compatible value without changing existing values for OPEN and IN_PROGRESS clients.
3. Preserve existing GET `/api/tasks` behavior and optional priority filtering contract. Do not add task creation unless `Create Task` is approved and the task model/controller contract is explicitly added in a revised plan.
4. If assignee, Jira key, effort, or comments are required in the new board but are unsupported by the existing model, identify this in the revised plan rather than fabricating values or changing API shape without approval.
5. Add or update focused MockMvc/JUnit coverage for profile fallback behavior, task status data, summary inputs, empty lists, unknown statuses, and preservation of existing endpoints where backend changes are made.

Backend API contract to preserve:
- `GET /api/users/current` returns `name`, `role`, and optional `imageUrl`.
- `GET /api/tasks` returns tasks with `id`, `title`, `description`, `status`, and `priority`.

## Frontend plan (owner: frontend-developer)
Affected files: `src/main/resources/static/index.html`, `src/main/resources/static/app.js`, `src/main/resources/static/styles.css`, and perhaps the approved image asset location under `src/main/resources/static/images/`.

1. Download and inspect both Jira attachments before implementation; verify the logo format and the dashboard reference layout, spacing, navigation, and branding.
2. Replace the starter page with semantic UVJTaskFlow dashboard structure: sidebar brand/navigation, responsive top bar/current-user area, welcome heading, summary cards, supported filters/search, and Kanban columns.
3. Fetch `/api/users/current` and `/api/tasks` independently. Render profile values safely, use initials when imageUrl is absent, and use a generic greeting when name is absent.
4. Compute summary counts from task statuses and render OPEN/IN_PROGRESS/COMPLETED and any approved ON_HOLD-compatible status using clear labels and visual indicators. Do not hardcode counts or task sample data.
5. Render task cards from the fields that actually exist: title, description, priority, and status. Only render Jira key, assignee, effort, comments, or other metadata when the API/model supports them.
6. Implement supported global/task search, priority/status filtering, clear filters, and existing task data refresh behavior. Do not add controls whose backend actions are not implemented without approval.
7. Implement only navigation destinations supported by existing application routes/views; label unsupported Jira story items as future enhancements rather than creating dead controls.
8. Add responsive sidebar behavior, mobile board handling, accessible labels, keyboard controls, visible focus states, readable contrast, and overflow protection.
9. Preserve task loading and API error presentation so failed profile or task requests are visible rather than silently ignored.
10. Update/remove old starter copy and Playwright assertions that expect the TaskFlow name and table-only layout.

## Test plan (owner: test-engineer)
Acceptance criteria mapped to focused tests:
1-2. Playwright verifies UVJTaskFlow branding and the official logo asset; code review/manual visual check compares desktop rendering with the supplied dashboard reference.
3-7. Existing MockMvc profile tests and Playwright tests cover configured name, role, image, image fallback, missing values, and profile switching test fixtures where supported.
8. Backend/Playwright tests verify summary counts calculated from mocked/API task sets, including zero and empty task cases.
9-10. Playwright verifies supported To Do, In Progress, Completed, and approved On Hold columns plus title, description, priority, and status rendering.
11. Playwright covers search, priority/status filters, clear filters, refresh, and any approved create/add action against real HTTP behavior.
12. Run existing backend tests and the smoke suite to detect Task API/profile regressions.
13. Playwright checks desktop, tablet, and mobile viewports for viewport overflow, overlapping controls, and responsive navigation.
14. Add JUnit, MockMvc, frontend unit/effective rendering coverage where available, plus Playwright tests for dynamic profile and dashboard behavior.
15. Perform final desktop/mobile visual comparison against the attached dashboard image; record the logo limitation until the frontend agent downloads the Jira assets.

Validation commands:
- `./mvnw test` on Windows: `mvnw.cmd test`
- `npm test` or the repository's declared Playwright command in `package.json`
- Narrowed Playwright: `npx playwright test e2e/tests/taskflow-smoke.spec.ts`

## Jira status
Current status when planned: To Do.
The first developer agent to start implementation moves the issue to In Progress. After approval, the task-planner does not implement code or change Jira status.
