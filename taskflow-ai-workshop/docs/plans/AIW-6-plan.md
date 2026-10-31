# AIW-6: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-6 / https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-6
- Type, status, priority, assignee: Story, To Do, Medium, Alen
- Description: Redesign the existing TaskFlow application as UVJTaskFlow with UVJ Technologies branding and a clean, professional, responsive dashboard based on the attached UI reference. Preserve existing functionality while improving visual presentation, navigation, task organization, and user experience. The sample name in the reference is not real profile data; display current-user information dynamically, do not hardcode personal details, and do not expose sensitive information.
- Acceptance criteria:
  1. Display UVJTaskFlow and the official UVJ Technologies logo.
  2. Use a consistent palette inspired by the logo.
  3. Display the actual logged-in user's name, not the sample name.
  4. Show the profile image when available, otherwise initials.
  5. Retrieve name/profile dynamically; do not hardcode them.
  6. Switching accounts displays the corresponding user's profile.
  7. Handle missing information without null, undefined, or sample personal details.
  8. Derive dashboard summary counts from available task data.
  9. Show To Do, In Progress, Completed, and On Hold columns, using the existing model where applicable.
  10. Show available task title, description, priority, and related task details.
  11. Search, filters, and task actions work where implemented.
  12. Preserve existing application features and API behavior.
  13. Support desktop, tablet, and mobile without overflow/overlap; provide readable text, contrast, and focus indicators.
  14. Automated tests cover dynamic user information, fallbacks, dashboard rendering, and relevant task functionality.
  15. Review and verify the final UI against the attached reference.
- Attachments (id, filename, mime type; note which are logo/design images):
  - 10028, `UVJ logo.png`, image/png — logo.
  - 10029, `UVJTaskFlow Kanban Dashboard.png`, image/png — dashboard design reference.
  - Jira MCP output did not provide downloadable/viewable attachment content. `frontend-developer` must download and inspect these images before UI work.
- Comments relevant to scope: Not available in the retrieved issue response; comments were not independently retrieved.

## Requirements
- Confirmed requirements:
  - Apply UVJTaskFlow branding and the supplied logo/design direction.
  - Show current-user profile data dynamically with image/initials and missing-name fallbacks.
  - Derive summary counts and board content from available task data.
  - Preserve existing behavior and only add navigation destinations that are supported or explicitly agreed.
  - Maintain responsiveness, readable contrast, and focus visibility.
  - Add tests for profile behavior, dashboard rendering, and relevant task behavior.
- Assumptions:
  - Continue using the existing static HTML/CSS/JavaScript frontend and Spring Boot backend; do not add frameworks or dependencies.
  - Use existing APIs/models first; agree any API changes before implementation.
  - Existing task list/refresh behavior remains part of the regression scope.
- Open questions:
  - What is the authoritative authenticated-user/profile source? The inspected app returns `/api/users/current` from configured properties and has no authentication mechanism in the inspected code; account switching cannot currently be demonstrated against real identities.
  - Should existing `OPEN` tasks map to the requested To Do column? How should On Hold be represented given no corresponding status in the inspected task model?
  - Should task creation and unsupported filters be added to backend APIs, implemented client-side over available data, or left as future work?
  - Which listed navigation destinations are currently supported and should be functional?
  - Can Jira comments be retrieved for any additional scope clarification?
- Edge cases and risks:
  - Missing profile name, image, or role; unsafe or absent image URL.
  - Empty task response and tasks without optional details.
  - Existing statuses do not explicitly include To Do or On Hold; status mapping must not be invented.
  - Existing app has no task creation endpoint; a Create/Add Task control cannot be functional without an agreed data/API path.
  - A configured demo profile is not equivalent to authenticated per-user personalization.
  - Preserve existing API payloads and refresh behavior.

## Backend plan (owner: task-api-developer)
- Affected files to evaluate only after open questions are resolved:
  - `src/main/java/com/example/taskflow/user/UserController.java`
  - `src/main/java/com/example/taskflow/user/UserProfileService.java`
  - `src/main/java/com/example/taskflow/user/UserProfile.java`
  - `src/main/resources/application.properties`
  - `src/main/java/com/example/taskflow/task/TaskController.java`
  - `src/main/java/com/example/taskflow/task/TaskService.java`
  - `src/main/java/com/example/taskflow/task/Task.java`
- Ordered steps:
  1. Confirm whether an authenticated profile source exists outside the inspected code; reuse it if available rather than adding authentication.
  2. Preserve `GET /api/users/current` response shape unless the approved scope requires a documented change.
  3. Identify if task status/fields or task creation/filter APIs need changes based on confirmed decisions; do not add unsupported fields/statuses speculatively.
  4. Add focused MockMvc tests for profile present/missing values and any approved API additions; retain task endpoint regression assertions.
- API contract: Existing endpoints are `GET /api/users/current` returning `name`, `role`, `imageUrl`, and `GET /api/tasks` returning a list of tasks with `id`, `title`, `description`, `status`, `priority`. Any extension requires explicit scope/contract agreement.
- Backend tests: Existing `UserControllerTest`, `UserControllerMissingProfileTest`, `UserControllerConfiguredUserTest`, and `TaskControllerTest`; add tests only for approved backend behavior.

## Frontend plan (owner: frontend-developer)
- Affected files:
  - `src/main/resources/static/index.html`
  - `src/main/resources/static/styles.css`
  - `src/main/resources/static/app.js`
  - `src/main/resources/static/images/` (reuse or replace/augment only after inspecting supplied images)
- Ordered steps:
  1. Download and inspect Jira attachments 10028 and 10029 before UI work; compare existing local image assets.
  2. Build accessible, semantic dashboard markup and UVJ branding in the existing static frontend.
  3. Fetch profile and task data from existing APIs; render profile fallbacks, computed counts, and task cards safely.
  4. Implement board/status presentation and only supported navigation/actions/filters after resolving open questions.
  5. Preserve task refresh/list behavior; provide visible API error states and responsive layouts.
- UI states: loading, populated dashboard, empty tasks, profile image available/unavailable, missing/blank profile values, API errors, filtered/no-results state where filters are agreed.
- Jira attachments to download/inspect: `UVJ logo.png` (logo) and `UVJTaskFlow Kanban Dashboard.png` (design reference). The MCP issue reader could list metadata but not view/download them.

## Test plan (owner: test-engineer)
- Branding/dashboard/board: Playwright verifies UVJTaskFlow name/logo, summary cards, required columns, task details, and existing refresh/list behavior.
- Profile: browser tests cover available profile data, image-to-initials fallback, missing-name generic greeting, and no null/undefined/sample personal data. Exercise multiple mocked profile responses; real account switching remains blocked until an authenticated source is identified.
- Task data: assert summary values are computed from returned tasks; cover empty data and task details supported by the model.
- Controls: test only confirmed functional search, filters, and actions; verify clear/reset and no-results cases where included.
- Responsive/accessibility: Playwright checks narrow and desktop viewports for overflow/overlap and semantic, keyboard-visible controls; manually compare to supplied design image after the frontend owner downloads it.
- Regression: retain backend assertions for the current task/profile API shape and update the smoke test for the new page.
- Commands: `./mvnw test`; `npm run test:e2e`.

## Jira status
Current status when planned: To Do. The first implementation agent to start moves the issue to In Progress; this planner does not change Jira.
