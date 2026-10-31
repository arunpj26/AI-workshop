# AIW-7: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-7 / https://uvjtech-team-c7my2s53.atlassian.net/browse/AIW-7
- Type, status, priority, assignee: Story / To Do / Medium / George Abraham
- Description: Redesign the existing TaskFlow application as UVJTaskFlow, following the attached dashboard reference. Preserve existing functionality while improving branding, personalization, task organization, responsive layout, navigation, and user experience. The username shown in the reference image is sample content only; the implementation must use dynamic current-user profile information and provide safe fallbacks.
- Acceptance criteria:
  1. Display UVJTaskFlow branding and the official UVJ Technologies logo.
  2. Use the green, grey, and white logo-inspired palette consistently.
  3. Show the actual current user's name instead of sample personal data.
  4. Display the user's profile image or initials fallback.
  5. Retrieve profile information dynamically and do not hardcode it.
  6. Switching users displays the selected user's own profile information.
  7. Handle missing profile information without null, undefined, or sample personal details.
  8. Calculate summary counts from available task data.
  9. Render To Do, In Progress, Completed, and On Hold columns from existing task status data.
  10. Render available task title, description, priority, and supported related information.
  11. Make implemented search, filters, and task actions work correctly.
  12. Preserve existing API behaviour and task functionality.
  13. Support usable desktop, tablet, and mobile layouts without overflow or overlap.
  14. Add automated coverage for profile dynamics and fallbacks, dashboard rendering, and task functionality.
  15. Review the final UI against the attached reference image.
- Attachments (id, filename, mime type; note which are logo/design images):
  - 10002, UVJ logo.png, image/png, official logo/design asset.
  - 10003, UVJTaskFlow Kanban Dashboard.png, image/png, dashboard design reference.
  Both attachments are present in `src/main/resources/static/images/` in the workspace; the frontend developer will verify the official files and inspect the logo/reference image before UI work.
- Comments relevant to scope: None.

## Requirements
- Confirmed requirements:
  - Rename and brand the dashboard as UVJTaskFlow.
  - Use the official logo and green/grey/white visual direction.
  - Dynamically render profile name, role, and image/initials fallback.
  - Render four Kanban statuses and task summary counts from task records.
  - Preserve existing task APIs and dashboard task functionality.
  - Retain only navigation destinations that are supported by the application; no placeholder menu destinations.
  - Support search/filter controls wherever implemented.
  - Add automated backend and browser coverage.
  - Use the supplied screenshot as visual direction, not as literal sample data.
- Assumptions:
  - The existing `taskflow.user.*` and `taskflow.demo.profiles` configuration are the repository's current user-profile source.
  - The demo profile switcher is a workshop stand-in and must remain separated from claims of production authentication.
  - Existing task fields are title, description, status, priority, and ID; no Jira key, assignee, effort, comments, activity, or project fields are confirmed in the API.
  - Existing supported actions are task retrieval, search, priority/status filtering, profile switching, and rendering; task creation and editing are not currently implemented.
- Open questions:
  - Should the implementation integrate an actual authentication context, or is the configured demo profile source considered the approved replacement for the workshop?
  - Is profile switching required as a production user/account feature, or only as a demo control that must be visually maintained?
  - Should Create/Add Task be implemented in this story, given that no task creation endpoint or business fields are present?
  - Which navigation entries other than Dashboard, Tasks, and Board are backed by implemented routes/views and approved scope?
  - Which task fields or API extensions are required beyond the existing title, description, status, and priority data?
  - Are assignee, estimated effort, comments, and Jira key expected as UI-only data fields, with optional rendering when supplied, or should new API data be introduced?
- Edge cases and risks:
  - Profile name/image/role can be missing; generic text and initials must be used with no null/undefined output.
  - Unknown statuses from task data must remain safe; the existing frontend maps unknown status values to On Hold.
  - Images and external URLs must use the existing backend validation rules.
  - Summary counts should use all available tasks; filtering must not silently replace the dashboard summary totals.
  - Four-column rendering can cause horizontal overflow if responsive constraints are wrong.
  - Demo profile switching can be misrepresented as real authentication.
  - The reference attachment may differ from current viewport proportions; visual review and screenshots are required.

## Backend plan (owner: task-api-developer)
Affected files:
- `src/main/java/com/example/taskflow/user/UserProfile.java`
- `src/main/java/com/example/taskflow/user/UserController.java`
- `src/main/java/com/example/taskflow/user/UserProfileService.java`
- `src/main/java/com/example/taskflow/user/DemoUserProperties.java`
- `src/main/java/com/example/taskflow/task/Task.java`
- `src/main/java/com/example/taskflow/task/TaskController.java`
- relevant files in `src/test/java/`
- `src/main/resources/application.properties` only if approved profile configuration changes are required

Ordered implementation steps:
1. Use the existing current-profile API as the dynamic profile source; clarify real authentication before replacing or extending it.
2. Preserve `/api/users/current`, `/api/users/profiles`, and `/api/tasks` response shapes unless a missing field has an explicit approved contract.
3. If optional task metadata is approved, extend the `Task` contract and seed data without changing existing field names or removing existing values.
4. If the story-approved Create Task behavior is included, add a documented POST contract, service method, validation, and regression tests; do not add it without that approval.
5. Keep controllers thin and service logic responsible for business behavior.
6. Keep profile image URL validation and missing-value cleaning consistent with the existing service.

API contract:
- No required backend contract change is currently confirmed beyond the existing endpoints:
  - `GET /api/users/current` returns `name`, `role`, and `imageUrl`.
  - `GET /api/users/current?profile=<id>` returns the selected demo profile.
  - `GET /api/users/profiles` returns configured profiles.
  - `GET /api/tasks` returns existing task objects.
- Add new fields or mutations only after the open questions are resolved.

Backend tests:
- Extend MockMvc coverage for default profile, missing profile values, image fallback data, known profile switching, unknown profile rejection, null-safe profile fields, and unchanged task retrieval.
- Add task/status/priority boundary coverage if the task model or filtering is changed.

## Frontend plan (owner: frontend-developer)
Affected files:
- `src/main/resources/static/index.html`
- `src/main/resources/static/styles.css`
- `src/main/resources/static/app.js`
- `src/main/resources/static/images/UVJ logo.png`
- `src/main/resources/static/images/UVJTaskFlow Kanban Dashboard.png`
- `e2e/tests/taskflow-smoke.spec.ts` may be updated by frontend or test owner for UI assertions.

Ordered implementation steps:
1. Inspect the two attached assets against the current implementation; use the logo directly and the dashboard screenshot only as visual direction.
2. Finish the UVJTaskFlow shell: sidebar branding, logo, app name, concise navigation for supported destinations, and footer branding.
3. Keep the profile area connected to `/api/users/profiles` and `/api/users/current`; render role when available and initials when image data is absent.
4. Replace any generic welcome text with the dynamic name while preserving safe generic fallback text.
5. Preserve summary cards, but calculate all four counts from the unfiltered task collection returned by `/api/tasks`.
6. Preserve/complete the four-column Kanban board and card rendering for title, description, priority, status indicator, and any future optional fields approved in the API contract.
7. Keep global search, task search, priority/status filters, and clear filters functional; add visible loading, empty, and error states.
8. Do not render unsupported Create/Add Task, timeline, reports, milestones, team, settings, assignee, effort, comments, or Jira-key controls unless their behavior and API/model support are explicitly included.
9. Rework responsive behavior for desktop, tablet, and mobile; preserve fixed navigation, filter usability, board scrolling without page overflow, focus states, and contrast.
10. Review the rendered desktop/mobile result against the supplied reference screenshot and record visual limitations.

UI states:
- Loading profile/tasks: visible status text with no misleading values.
- Profile missing: generic welcome and initials fallback.
- Image unavailable: initials-only avatar.
- No matching tasks: visible empty state and zero/matching summary behavior clearly separated.
- API failure: visible error message without silent fallback data.

## Test plan (owner: test-engineer)
Acceptance criteria mapped to verification:
- AC 1-2: Playwright assertions for UVJTaskFlow name, logo image, footer branding, and computed visual layout against the reference image.
- AC 3-7: Playwright tests for default profile, fallback name, role/image behavior, profile switching, missing profile, and initials rendering; MockMvc tests for profile response/fallback cases.
- AC 8: Playwright assertions for total/completed/in-progress/to-do counts derived from seeded task data; add a task-data fixture/check where stable.
- AC 9-10: Playwright assertions for four status columns and visible title/description/priority; MockMvc assertions for existing task fields.
- AC 11: Playwright tests for global and task search, priority/status filters, clear filters, empty result state, and existing API regression behavior.
- AC 12: Run existing MockMvc task and user suites plus Playwright smoke tests to confirm endpoint/UI compatibility.
- AC 13: Playwright desktop/tablet/mobile checks for clipping, horizontal page overflow, overlap, keyboard focus, sidebar/header adaptation, and readable board controls.
- AC 14: Add focused backend and browser coverage as described above.
- AC 15: Capture desktop and mobile screenshots, inspect them, and compare them with Jira attachment 10003 and the logo; attach results only if requested.

Exact validation commands:
- `./mvnw test`
- `npm run test:e2e`
- optional focused backend test: `./mvnw -Dtest=TaskControllerTest,UserControllerTest,UserControllerConfiguredUserTest,UserControllerMissingProfileTest,UserProfileServiceTest test`
- optional focused browser test: `npm run test:e2e -- e2e/tests/taskflow-smoke.spec.ts`

Manual checks:
- Start the application and confirm the dashboard loads on desktop, tablet, and mobile.
- Switch the configured demo profiles and verify that profile details change and image/initial fallback is correct.
- Confirm task totals and board columns match `/api/tasks` data.
- Verify search and filters use existing task behavior and clear cleanly.
- Compare the final rendered dashboard with the Jira reference screenshot.

## Jira status
Current status when planned: To Do.
The first developer agent to start implementation should move AIW-7 to In Progress after the user approves the plan.

## Approval gate
This plan has unresolved authentication and scope decisions. Do not begin implementation or add the resolved contract until the user reviews them.

APPROVE, REVISE, or CANCEL.
