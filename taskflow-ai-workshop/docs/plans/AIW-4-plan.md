# AIW-4: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: [AIW-4](https://uvjtech-team-noqysi5v.atlassian.net/browse/AIW-4)
- Type, status, priority, assignee: Story, To Do, Medium, Bobin Abraham.
- Description: Redesign TaskFlow as UVJTaskFlow with official UVJ Technologies branding, a modern responsive task-management dashboard, dynamic current-user personalization, and a Kanban-oriented presentation while retaining existing application functionality. The sample user shown in the reference must not be hardcoded.
- Acceptance criteria: The Jira description confirms the branding, logo, green/grey/white visual direction, sidebar/footer branding, dynamic user details, and preservation of existing application behaviour. Exact status-to-column mapping and the source of authenticated user data require confirmation before implementation.
- Attachments (id, filename, mime type; note which are logo/design images): `10011`, `UVJ logo.png`, `image/png` (logo); `10010`, `UVJTaskFlow Kanban Dashboard.png`, `image/png` (design reference). The planner cannot download or view Jira attachments. `frontend-developer` must download and inspect them before UI work.
- Comments relevant to scope: None; Jira returned zero comments.

## Requirements
- Confirmed requirements:
  - Rebrand the UI to UVJTaskFlow using the official UVJ Technologies logo and green, grey, and white branding.
  - Show the logo and application name in the sidebar and UVJ branding in the footer.
  - Render the current user's name and available profile information dynamically; do not hardcode the sample user from the reference.
  - Preserve existing application functionality and API contracts.
  - Deliver a responsive, accessible, modern dashboard inspired by the attached reference.
  - Add automated regression coverage for the changed UI and preserved functionality.
- Assumptions:
  - Existing `GET /api/tasks` and `GET /api/users/current` remain the data sources.
  - The lightweight static HTML/CSS/JavaScript architecture remains in use; no framework or external CDN is added.
  - Summary counts and task placement will be derived from returned task data, not hardcoded.
- Open questions:
  - What is the real authenticated profile source? The current endpoint is configuration-backed and defaults to `Demo User` / `Project Member`; no authentication integration is present.
  - Should those backend defaults remain as local fallback data, or must the profile source be changed as part of this story?
  - Are the repository copies under `static/images/` the approved Jira assets, or must the frontend developer download the Jira attachments?
  - What exact task statuses and user actions must the Kanban dashboard support? Current inspected backend exposes only `GET /api/tasks` and statuses `OPEN`, `IN_PROGRESS`, and `COMPLETED`.
  - How should unknown/missing statuses and `ON_HOLD` map, and should summary counts include unknown tasks?
- Edge cases and risks:
  - Missing/null profile name, image, or role; one-word and multi-word names; broken image URLs.
  - Empty task list, duplicate/unknown statuses, and API failures must not produce misleading counts.
  - Removing configured profile defaults may break existing backend tests and local behavior.
  - A logo/design image may be a reference rather than an approved production asset.
  - Responsive Kanban layouts can become horizontally inaccessible on narrow screens.

## Backend plan  (owner: task-api-developer)
No backend API change is planned unless the profile decision requires it.
1. Verify `TaskController`, `TaskService`, `UserController`, and `UserProfileService` contracts before frontend work.
2. Preserve the existing task response shape and safe image URL filtering.
3. If an approved authenticated profile source exists, adapt only the profile boundary and retain constructor injection and existing null/unsafe-value behavior.
4. If no source exists, do not invent authentication; document the limitation and keep the configuration-backed endpoint unchanged.
5. Run the existing MockMvc/service regression tests and add only tests required by an approved backend contract change.

## Frontend plan  (owner: frontend-developer)
Affected files: `src/main/resources/static/index.html`, `styles.css`, `app.js`; possibly approved assets under `static/images/`.
1. Download and inspect Jira logo/design attachments when accessible, compare with repository assets, and use only the approved official asset.
2. Replace TaskFlow starter copy with a UVJTaskFlow semantic shell, logo, navigation/header, profile area, summary cards, and the Kanban layout required by the approved design.
3. Fetch `/api/users/current` and `/api/tasks`; render profile name/role/image dynamically and generate accessible initials fallback when no usable image/name exists.
4. Derive total and per-column summary counts from the task response, centralizing status normalization/mapping after the status decision is confirmed.
5. Preserve refresh and existing task behavior; surface loading, empty, API-error, and image-fallback states visibly.
6. Implement responsive layouts, keyboard-operable controls, semantic headings/regions, labels, focus states, and sufficient contrast without a framework.

## Test plan  (owner: test-engineer)
- Backend regression: `TaskControllerTest` and existing user-profile tests continue to pass; add MockMvc coverage only if the API contract changes.
- Playwright: verify UVJTaskFlow branding/logo, dynamic profile rendering with initials fallback, task-driven counts, confirmed Kanban headings and placement, loading/error/empty states, and refresh behavior.
- Accessibility/responsive: use role/name/label assertions, verify keyboard-operable controls and visible focus, and exercise a narrow viewport without brittle selectors.
- Regression: confirm existing task fields and API response shape remain unchanged and no sample user text is hardcoded in the rendered UI.
- Manual checks: inspect the approved logo/reference attachment, image fallback, contrast, touch/keyboard usability, and API failure messaging.
- Validation commands: `mvnw.cmd test`; start with `mvnw.cmd spring-boot:run`; then run `npx playwright test` from the repository root.

## Jira status
Current status: To Do. The first developer agent to start moves the issue to In Progress after approval; the planner does not change Jira.
