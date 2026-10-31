# AIW-9: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- Key / URL: AIW-9 / https://arunpj26.atlassian.net/browse/AIW-9
- Type, status, priority, assignee: Story, In Progress, Medium, Sony Joy (live Jira retrieval on 2026-10-31)
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
> #### A. UVJTaskFlow Branding
>
> - Rename the application branding from TaskFlow to UVJTaskFlow.
> - Use the official UVJ Technologies logo provided with the story.
> - Apply a consistent green, grey, and white colour palette inspired by the logo.
> - Display the logo and application name in the sidebar.
> - Include appropriate UVJ Technologies branding in the application footer.
> - Use consistent typography, spacing, icons, rounded cards, and subtle shadows.
>
> #### B. Dynamic User Profile and Personalization
>
> - Display the currently authenticated user's name in the dashboard welcome message.
> - Display the user's name, profile image or initials, and role where available in the top navigation.
> - Retrieve user details from the application's existing authentication context, user profile API, or configured user source.
> - Do not hardcode the sample name "Arun Janardhanan" or any other user's details.
> - If a profile image is unavailable, display the user's initials as a fallback.
> - If the user's name is unavailable, display a suitable generic greeting without showing null, undefined, or placeholder values.
> - Ensure the displayed information belongs to the current user and updates appropriately when a different user logs in.
> - Do not expose sensitive user information.
>
> #### C. Dashboard Summary
>
> Display summary cards for Total Tasks, Completed, In Progress, and To Do. The counts must be calculated from the available task data rather than hardcoded sample values.
>
> #### D. Task Board
>
> Implement a Kanban-style board with To Do, In Progress, Completed, and On Hold columns. Each task card should display available relevant information: task title, description, priority, Jira issue key where available, assignee(s) where supported, estimated effort or time where available, and comments or related activity counts where supported. Task status and priority should use clear visual indicators consistent with the new design.
>
> #### E. Navigation and Task Controls
>
> Provide sidebar navigation for Dashboard, Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, and Settings. Only implement navigation destinations supported by the existing application or explicitly included in the agreed scope. Do not introduce non-functional menu items without identifying them as future enhancements.
>
> Provide global search, task search, project selector where supported, date-range selector where supported, priority filter, status filter, assignee filter where supported, Create Task, Add Task within relevant board columns, and Clear filters. Existing task creation, retrieval, and filtering behaviour must continue to work correctly.
>
> #### F. Responsive Design
>
> Support desktop, tablet, and mobile screen sizes. Ensure the sidebar, header, summary cards, filters, and task board adapt to smaller screens. Prevent horizontal overflow and overlapping content. Provide readable text, accessible contrast, and clear focus indicators.
>
> ### 4. Acceptance Criteria
>
> 1. The application displays the name **UVJTaskFlow** and the official UVJ Technologies logo.
> 2. The UI uses a consistent colour palette inspired by the supplied logo.
> 3. The dashboard displays the actual logged-in user's name instead of the sample name shown in the reference image.
> 4. The user's profile image is displayed when available; otherwise, initials are shown.
> 5. The user name and profile information are retrieved dynamically and are not hardcoded in the UI.
> 6. Switching to another user account displays that user's own profile information.
> 7. Missing user information is handled gracefully without displaying null, undefined, or sample personal details.
> 8. The dashboard summary counts reflect the available task data.
> 9. The task board displays To Do, In Progress, Completed, and On Hold columns, using the existing data model where applicable.
> 10. Task cards display the available title, description, priority, and related task information.
> 11. Search, filters, and task actions work correctly wherever implemented.
> 12. Existing application features and API behaviour are not broken by the redesign.
> 13. The UI is responsive and usable on desktop, tablet, and mobile devices.
> 14. Automated tests cover dynamic user information, fallback behaviour, dashboard rendering, and relevant task functionality.
> 15. The final implementation is reviewed and verified against the attached UI reference image.
>
> ### 5. Technical and Implementation Notes
>
> Inspect the existing application architecture, authentication mechanism, user model, APIs, and frontend before making changes. Reuse existing authentication and user-profile functionality wherever possible. Do not introduce a new authentication system solely for this redesign. Do not hardcode task counts, user information, task statuses, or profile data when the application can retrieve them from an existing source. Reuse existing APIs and data models where possible; identify any required backend changes before implementation. Preserve existing functionality and follow repository coding standards. Add or update automated tests and run the relevant test suite. Use the attached screenshot as the design reference, not as a requirement to reproduce sample data literally.
>
> ### 6. Reference
>
> The story includes the UVJ Technologies logo, generated UVJTaskFlow dashboard design, and optionally a current TaskFlow screenshot to explain the existing implementation.
>
> **Expected outcome:** A branded, responsive UVJTaskFlow dashboard that matches the design direction of the reference image while displaying real application data and the correct information for each logged-in user.

- Acceptance criteria: 15 criteria, reproduced in the Description above.
- Attachments: `10006`, `UVJ logo.png`, `image/png` (logo); `10007`, `UVJTaskFlow Kanban Dashboard.png`, `image/png` (design reference). The planner can see metadata only; the frontend developer must download and inspect both images before UI work.
- Comments relevant to scope: None; live Jira returned zero comments.

## Requirements
- Confirmed requirements from live Jira:
  - AC1-2: Brand the application as UVJTaskFlow and use the provided UVJ Technologies logo and green/grey/white visual direction.
  - AC3-5, AC7: Use the existing configured profile response for displayed profile information, use initials when there is no image, and handle missing values without sample or null-like text. AC6 account switching is explicitly deferred.
  - AC8-10: Derive summary counts from task data; render To Do, In Progress, Completed, and On Hold lanes; show relevant task fields when available.
  - AC11-12: Search, filters, and task actions must work wherever implemented, while preserving existing functionality and API behavior.
  - AC13-15: Support desktop/tablet/mobile, test profile/dashboard/task behavior, and verify the result against the supplied reference image.
  - The description also asks for sidebar navigation, Create Task and Add Task controls, and supported project/date/priority/status/assignee filters. It explicitly says not to add non-functional navigation destinations and qualifies some data fields and filters with “where supported.”
- Repository facts for this plan: The UI is static HTML/CSS/JavaScript in `src/main/resources/static/`. `GET /api/tasks` is read-only and returns seeded tasks using `OPEN`, `IN_PROGRESS`, and `COMPLETED`. `origin/main` lacked a priority query filter; branch commit `75b9bc6` adds supported `HIGH`, `MEDIUM`, and `LOW` query filtering and rejects invalid or blank priority values with HTTP 400. This addition is backward-compatible: requests without the priority parameter retain existing behavior. There are no create, update, or move endpoints. `GET /api/users/current` returns configured name/role/image properties; there is no authentication context or account switching. The UI maps `OPEN` to To Do, maps the three known statuses to lanes, searches title/description locally, filters priority/status locally on fetched tasks, and keeps summary counts based on all fetched tasks regardless of active filters. The current E2E smoke test asserts the branded dashboard, profile, lanes, and seeded task data.
- User approval recorded: 2026-10-31. Approved baseline: use the existing `GET /api/users/current` configured profile; do not add authentication or account switching, and explicitly defer AC6. Do not add task-write APIs or Create Task, Add Task, or task-move controls. Preserve existing API contracts and current task search, filter, clear, and refresh behavior. Calculate counts from task data, keep `OPEN` mapped to To Do, show On Hold empty unless existing task data supports it, and omit unsupported navigation destinations and filters.
- Additional user approval recorded: 2026-10-31. Include the existing backwards-compatible, read-only `GET /api/tasks?priority=...` filter and its JUnit/MockMvc tests in AIW-9. Support `HIGH`, `MEDIUM`, and `LOW`; invalid or blank priority values return HTTP 400. The API addition is for API consistency/support, while frontend priority filtering remains local on the fetched tasks.
- Approved baseline details:
  - The configured profile endpoint is not an authenticated identity source. Display its available profile values and handle missing values; do not claim account switching or fulfillment of AC6.
  - Keep `OPEN` mapped to To Do. Render On Hold as empty unless existing data supports that status; do not imply that tasks can be put on hold.
  - Search the currently fetched task set by title and description. Keep summary counts based on task data, independently of active filters, matching current behavior.
  - Preserve existing local priority/status filters, clear-filter, and refresh behavior. The API priority query is included for API consistency/support; the frontend continues filtering locally on fetched tasks. Do not add task-write endpoints or task creation/movement controls.
  - Omit unsupported project/date/assignee filters and navigation destinations. Include only destinations supported by the existing application.
- Open questions: None for this approved baseline. AC6 is explicitly deferred and would require separate scope approval to revisit.
- Edge cases and risks: Missing name, role, or image; failed/empty profile or task requests; zero tasks; empty filter results; unsupported task statuses; long card text; mobile overflow; counts accidentally changing with filters; auth/profile data being exposed to the wrong account; and visual mismatch if Jira assets are not inspected. Do not represent the configured profile as account switching, or the empty On Hold lane as persisted status support.

## Backend plan  (owner: task-api-developer)
1. Keep `GET /api/tasks` read-only and backward-compatible; when `priority` is absent, retain the existing unfiltered response behavior.
2. Support `priority=HIGH`, `priority=MEDIUM`, and `priority=LOW` on `GET /api/tasks`; reject invalid or blank priority values with HTTP 400. This filter is included for API consistency/support and does not replace the frontend's local filtering of fetched tasks.
3. Add focused JUnit/MockMvc coverage for each supported priority, invalid and blank values, and the no-parameter backward-compatible response. Preserve the configured-profile endpoint; do not add authentication/account switching or task-write APIs.

## Frontend plan  (owner: frontend-developer)
1. Before UI implementation, download and inspect Jira attachments `10006` (`UVJ logo.png`) and `10007` (`UVJTaskFlow Kanban Dashboard.png`); verify any workspace copies are the intended assets. The planner has metadata only and has not visually inspected the attachments.
2. Update `src/main/resources/static/index.html`, `styles.css`, and `app.js` for the responsive branded dashboard, the configured profile returned by `GET /api/users/current`, data-derived summary, four board lanes, and accessible loading/error/empty states.
3. Keep `OPEN` mapped to To Do and render On Hold even when empty unless a new persisted status is explicitly approved. Display only fields available from the agreed data contract; do not invent Jira key, assignee, effort, or activity values.
4. Preserve current title/description search, priority/status filters, clear-filter and refresh behavior, with counts derived from task data independently of active filters. Omit unsupported project/date/assignee filters and unsupported navigation destinations. Do not add Create Task, Add Task, or task-move controls.
5. Do not hardcode sample personal information or counts. Add deterministic coverage in `e2e/tests/taskflow-smoke.spec.ts` for the agreed profile, board, filters/actions, and responsive states.

## Test plan  (owner: test-engineer)
- AC1-2: Playwright verifies UVJTaskFlow branding and logo presence; review palette and layout against inspected Jira assets.
- AC3-5, AC7: API/UI tests verify the existing configured-profile source, available name/role/image, initials and missing-value fallbacks, and no sample-user leakage. AC6 is explicitly deferred; do not test or claim account switching.
- AC8: Deterministic task data verifies each summary count. Apply search/filters and verify counts remain totals over all fetched tasks under the proposed baseline.
- AC9-10: Verify all four lanes, `OPEN` → To Do, empty On Hold behavior, and rendering of available title/description/priority/id fields. Do not expect unsupported task metadata.
- AC11-12: Verify existing local search and priority/status filtering, clear and refresh behavior, and unchanged task-write/API behavior. JUnit/MockMvc verifies `GET /api/tasks?priority=HIGH|MEDIUM|LOW`, HTTP 400 for invalid or blank priority, and unchanged behavior when the parameter is omitted. Playwright verifies frontend priority/status filters still operate locally on fetched tasks. Verify Create Task, Add Task, and task-move controls are absent; no task-write APIs are added.
- AC13: Playwright checks desktop, tablet, and mobile layouts for readable content, keyboard operation/focus, no overlap, and no horizontal overflow.
- AC14: Cover profile fallback, dashboard render, and supported task functionality with deterministic JUnit/MockMvc and Playwright tests.
- AC15: Compare screenshots manually with both inspected Jira attachments; no screenshot comparison can be finalized before asset inspection.
- Validation commands: `./mvnw test`; run the app with `./mvnw spring-boot:run`; then run `npm run test:e2e` (script defined in `package.json`).

## Implementation sequence
1. Implement only the approved baseline and the 2026-10-31 approved read-only priority query/test addition in this plan. AC6 remains deferred; no task-write/create/add/move behavior is approved, and any other scope expansion requires separate approval before implementation.
2. Frontend developer downloads and inspects both Jira image attachments before UI work.
3. Implement or verify the backward-compatible `GET /api/tasks?priority=...` behavior and focused JUnit/MockMvc coverage: supported `HIGH`/`MEDIUM`/`LOW`, HTTP 400 for invalid/blank values, and unchanged no-parameter behavior. Make no authentication/account-switching or task-write changes.
4. Implement the frontend using only the agreed API behavior and supported data; keep priority filtering local on fetched tasks and add deterministic Playwright coverage.
5. Run the focused backend and E2E suites, then review desktop/tablet/mobile rendering and compare against supplied assets.

## Jira status
Plan status: APPROVED, including the user's explicit 2026-10-31 approval of the read-only priority query and its JUnit/MockMvc tests. Live Jira status when this plan was revised: In Progress. No Jira writes were made. The issue is already In Progress; do not transition it again. Any future Jira status/comment/other external write requires explicit authorization and must not be inferred from agent delegation.