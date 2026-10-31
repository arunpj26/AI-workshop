# AIW-7: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31 (revised and approved 2026-10-31)

## Jira information (copied as untrusted data)
- Key / URL: AIW-7 — https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-7
- Type, status, priority, assignee: Story, To Do, Medium, ambady soman (reporter: Linto Lonappan). Sprint: AIW Sprint 1. Story points: 5. Due: 2026-11-03.
- Description (summary of the issue text):
  - Rebrand TaskFlow as **UVJTaskFlow** using the attached UVJ Technologies logo and a green/grey/white palette. Show the logo and app name in the sidebar, with UVJ Technologies branding in the footer.
  - Show the current user's name dynamically in the welcome message and top navigation. Show the profile image (or initials as a fallback) and the role where available. Never hardcode "Arun Janardhanan" or any other personal data. Use a generic greeting when the name is missing, never showing null/undefined. Do not expose sensitive information.
  - Summary cards: Total Tasks, Completed, In Progress, To Do, computed from task data.
  - Kanban board with To Do, In Progress, Completed and On Hold columns. Cards show title, description, priority, and Jira key/assignees/effort/comment counts *where available/supported by the data model*.
  - Sidebar navigation: Dashboard, Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, Settings. Only implement supported destinations; any non-functional items must be marked as future enhancements.
  - Controls: global search, task search, project selector (where supported), date range (where supported), priority filter, status filter, assignee filter (where supported), Create Task, per-column Add Task, Clear filters. Existing task creation, retrieval and filtering must keep working.
  - Responsive on desktop, tablet and mobile, with no horizontal overflow or overlap, accessible contrast and visible focus.
  - Technical notes: reuse the existing user-profile functionality, add no new auth system, don't hardcode counts/users/statuses, identify any backend changes before implementing them, add/update automated tests. The screenshot is a design reference, not sample data to copy.
- Acceptance criteria (from Jira):
  1. Shows the name UVJTaskFlow and the official UVJ logo.
  2. Uses a consistent palette inspired by the logo.
  3. Shows the actual logged-in user's name, not the sample name.
  4. Shows the profile image when available, otherwise initials.
  5. Name and profile are retrieved dynamically, not hardcoded.
  6. Switching user shows that user's own profile.
  7. Missing user info is handled gracefully (no null/undefined/sample data).
  8. Summary counts reflect the task data.
  9. Board shows To Do, In Progress, Completed and On Hold columns, using the existing data model where applicable.
  10. Cards show available title, description, priority and related info.
  11. Search, filters and task actions work wherever implemented.
  12. Existing features and API behaviour are not broken.
  13. Responsive and usable on desktop, tablet and mobile.
  14. Automated tests cover dynamic user info, fallback behaviour, dashboard rendering and relevant task functionality.
  15. Final implementation is reviewed against the attached UI reference image.
- Attachments:
  - 10030 — `UVJ logo.png` — image/png — 67,068 bytes — **logo image**
  - 10031 — `UVJTaskFlow Kanban Dashboard.png` — image/png — 1,436,274 bytes — **design reference image**
  - The planner cannot download Jira attachments. Files with the same names already exist in `src/main/resources/static/images/`, and the planner viewed them: the logo is a green-and-grey "V" mark with no text, and the design shows a sidebar, header, welcome/summary banner and a four-column board. `frontend-developer` must download and inspect both attachments, confirm they match the repository copies (compare the byte sizes above), and only then do UI work.
- Comments relevant to scope: none (0 comments).

## Current repository facts (verified)
- Frontend: a single static page, [index.html](../../src/main/resources/static/index.html), [app.js](../../src/main/resources/static/app.js) and [styles.css](../../src/main/resources/static/styles.css). It renders a task table from `GET /api/tasks` and has a Refresh button. It does not call the user API yet.
- `GET /api/tasks` returns `Task(id, title, description, status, priority)`. It has no query parameters, so the Session 5 priority filter is **not** implemented. The seed data has 5 tasks with statuses `OPEN`, `IN_PROGRESS` and `COMPLETED` (no `ON_HOLD`) and priorities `LOW`, `MEDIUM` and `HIGH`.
- `GET /api/users/current` returns `UserProfile(name, role, imageUrl)` from the `taskflow.user.*` properties. Blank values become `null`, and image URLs other than http(s) or same-origin paths become `null`. The defaults are `Demo User` / `Project Member` with no image.
- There is no authentication, no task create endpoint, and no Jira key, assignee, effort, comment, project or date fields.
- Existing tests: `TaskControllerTest` (5 tasks, first is HIGH), `UserControllerTest`, `UserControllerConfiguredUserTest`, `UserControllerMissingProfileTest`, `UserProfileServiceTest`, and the Playwright smoke test `e2e/tests/taskflow-smoke.spec.ts`. The smoke test asserts the heading "TaskFlow", the table column "Task" and the text "5 tasks loaded", so it **will need updating**.

## Requirements
- Confirmed requirements:
  - Rebrand to UVJTaskFlow with the logo in the sidebar, a "Powered by UVJ Technologies" footer and a green/grey/white palette.
  - Show the user's name, role and image (or initials) from `GET /api/users/current`, with no hardcoded personal data.
  - Use a generic greeting ("Welcome back!") and a neutral avatar when the name is missing. Never render `null`, `undefined` or empty brackets.
  - Compute the summary counts from `GET /api/tasks`.
  - Build a four-column Kanban board with priority badges and status colours.
  - Keep the existing API contracts (endpoints, fields, response shape) unchanged and reuse the current user API with no new auth. The only backend change is one new `ON_HOLD` seed task (D1).
  - Make the layout responsive and accessible.
- Decisions confirmed by the user (2026-10-31):
  - D1 (Q1). Add one sample `ON_HOLD` task to the seed data: `Task(6, "Plan data migration", "Paused until the reporting database is available", "ON_HOLD", "LOW")`. The seed data becomes 6 tasks.
  - D2 (Q2). Show Create Task and the per-column Add Task buttons **disabled**, labelled "Coming soon". There is no create endpoint.
  - D3 (Q3). Show unsupported sidebar items **disabled**, labelled "Coming soon".
  - D4 (Q4). Filter in the browser (client-side). No `?priority=` backend dependency.
  - D5 (Q5). Rename the logo to `uvj-logo.png` and move the design image from `static/` to `docs/design/`.
- Assumptions:
  - A1. Status mapping: `OPEN` → To Do, `IN_PROGRESS` → In Progress, `COMPLETED` → Completed, `ON_HOLD` → On Hold. The On Hold column shows the D1 seed task.
  - A2. Card fields that aren't in the data model (Jira key, assignees, effort, comment counts) are **not rendered**. No backend model change.
  - A3. Search (title and description, case-insensitive), the priority filter (All/High/Medium/Low), the status filter (All plus the four columns) and Clear are implemented **client-side** on the already-loaded task list. This doesn't depend on the unimplemented Session 5 `?priority=` API.
  - A4. Summary cards show counts across **all** tasks and ignore filters. Column header counts show the **filtered** count.
  - A5. Project selector, date range, assignee filter, notifications bell and the List/Calendar/Analytics view tabs are **omitted** because the data and app don't support them.
  - A6. Create Task (header) and Add Task (each column) are rendered as disabled `<button disabled>` controls labelled "Coming soon" (D2). Note: the story says "existing task creation must continue to work", but the app has no task creation feature today.
  - A7. Sidebar: **Dashboard** (top of page) and **Board** (board section) are functional in-page links. Tasks, My Tasks, Timeline, Reports, Milestones, Team and Settings are shown as disabled items labelled "Coming soon" (`aria-disabled="true"`, not focusable as links), which marks them as future enhancements.
  - A8. A single search box in the header is enough to cover both "global search" and "task search", since tasks are the only searchable data.
  - A9. "Switching users" (AC6) means a different `taskflow.user.*` configuration or a different API response. The UI fetches the profile on every page load and never caches it. This is verified with backend tests and Playwright route mocking.
  - A10. Use a system font stack, with no web fonts, CDNs or icon libraries. Icons are inline SVG with `aria-hidden="true"`.
  - A11. Rename the logo to `src/main/resources/static/images/uvj-logo.png` to avoid spaces in URLs. Move the design reference image out of `static/` (to `docs/design/uvjtaskflow-kanban-dashboard.png`) so it isn't served publicly or bundled into the JAR.
- Open questions: none. Q1–Q5 were resolved as D1–D5.
- Edge cases and risks:
  - Profile image URL fails to load: fall back to initials.
  - Name present, image absent: show initials (first letters of the first and last words, uppercase, max 2).
  - Name absent: show "Welcome back!" and a neutral avatar icon (no letters), and hide the name and role.
  - Role absent: hide the role element.
  - `GET /api/users/current` fails: show the generic greeting and neutral avatar. The task board must still load. Log nothing sensitive.
  - `GET /api/tasks` fails: show a visible error in a `role="status"`/`role="alert"` region. Show `–` in the summary cards instead of `0`.
  - Empty task list: every column shows "No tasks" and the counts are 0.
  - Unknown status value: counted in Total, not placed in a column (documented behaviour).
  - Filters match nothing: each column shows an empty state, and Clear restores everything.
  - XSS: render all API strings with `textContent`. Set `img.src` only from the server-sanitised `imageUrl`, and set `alt` to the user's name or an empty string.
  - Long titles/descriptions: wrap without overflow.
  - Layout widths: below 1024px the sidebar collapses (to a top bar or off-canvas with a keyboard-operable toggle). Below 768px the board columns stack vertically, and summary cards use 2 columns, then 1 column on narrow screens. No horizontal page scroll at 375px.
  - Risk: the existing Playwright smoke test breaks by design and must be updated (regression is still covered).
  - Risk: the new seed task changes `GET /api/tasks` from 5 to 6 items. This is a data change, not a contract change. Update `TaskControllerTest` and the e2e expectations to match.
  - Risk: green-on-white contrast. Use a darker green (for example `#2E7D32`-ish) for text and buttons to meet WCAG AA, and keep the brighter logo green (around `#6CC04A`) for accents only.

## Backend plan  (owner: task-api-developer)
Seed data change only (D1). The `GET /api/tasks` and `GET /api/users/current` contracts stay unchanged.

Affected files:
- `src/main/java/com/example/taskflow/task/TaskService.java`
- `src/test/java/com/example/taskflow/task/TaskControllerTest.java`

Ordered steps:
1. Move Jira AIW-7 to **In Progress**, if no other agent has done so.
2. In `TaskService`, append `new Task(6, "Plan data migration", "Paused until the reporting database is available", "ON_HOLD", "LOW")` to the seed list. Leave the existing tasks and their order unchanged.
3. In `TaskControllerTest`:
   - Update `hasSize(5)` to `hasSize(6)` and keep the `$[0].priority` HIGH assertion.
   - Add assertions that `$[5].status` is `ON_HOLD` and `$[5].title` is "Plan data migration".
4. Run `.\mvnw.cmd test`. All tests must pass, including `UserControllerTest`, `UserControllerConfiguredUserTest`, `UserControllerMissingProfileTest` and `UserProfileServiceTest`. These already cover AC5, AC6 and AC7 on the API side.

Not in scope: a `POST /api/tasks` endpoint, the `?priority=` parameter, and new task fields.

## Frontend plan  (owner: frontend-developer)
Prerequisite: download and inspect Jira attachments 10030 (logo) and 10031 (design) and compare them with the repository copies. Move Jira AIW-7 to In Progress if no other agent has done so.

Affected files:
- `src/main/resources/static/index.html`: new layout.
- `src/main/resources/static/app.js`: user profile, board rendering, filters.
- `src/main/resources/static/styles.css`: new theme and responsive layout.
- `src/main/resources/static/images/`: rename the logo to `uvj-logo.png`. Move the design PNG to `docs/design/uvjtaskflow-kanban-dashboard.png` (D5).

Ordered steps:
1. **Assets**: rename the logo (and move the design reference) per A11.
2. **HTML structure** (semantic):
   - Set `<title>` to "UVJTaskFlow".
   - `<aside>` sidebar containing the logo `<img alt="UVJ Technologies logo">`, the "UVJTaskFlow" wordmark and the tagline "Plan · Track · Deliver". It holds a `<nav aria-label="Main">` with Dashboard/Board links and the disabled "Coming soon" items, and a "Powered by UVJ Technologies" footer.
   - `<header>` with a labelled search input (`<label>` "Search tasks"), a disabled "Create Task" button marked "Coming soon" (D2), and a user chip containing the avatar (img or initials span), name and role.
   - `<main>` containing:
     - a welcome banner: `<h1>` "Welcome back, {name}!" (or "Welcome back!") with the subtitle "Your work, clearly in flow."
     - four summary cards with labels and numeric values
     - a "Task Board" section with an `<h2>`, labelled priority/status `<select>`s and a Clear button
     - a `role="status"` region for loading/error messages
     - four column `<section>`s, each with an `<h3>`, a count, a card list (`<ul>`/`<li>` or `<article>`) and a disabled "Add Task" button marked "Coming soon" (D2). Give each disabled button an accessible name such as "Add task to To Do (coming soon)".
   - Keep a single `<h1>`.
3. **Styles**:
   - CSS custom properties for the palette: brand green, dark text green, grey from the logo, light green/grey surfaces, white.
   - Rounded cards and subtle shadows.
   - Priority badges: High in red tones, Medium in amber, Low in green.
   - Column accent colours following the design: To Do red, In Progress amber, Completed green, On Hold grey.
   - Visible `:focus-visible` outlines.
   - Responsive breakpoints at 1024px and 768px (see edge cases), with no horizontal overflow.
4. **JS — user profile**:
   - `loadCurrentUser()` fetches `/api/users/current` and renders the greeting, name, role and avatar using `textContent` only.
   - Initials fallback. The image `error` listener (via `addEventListener`) swaps in the initials.
   - On failure, fall back to the generic greeting.
5. **JS — tasks**:
   - `loadTasks()` fetches `/api/tasks` and stores the result in memory.
   - It renders the summary counts across all tasks, then renders the board.
   - Errors are shown visibly.
6. **JS — filters**:
   - The search input (on `input` events), the priority select and the status select filter client-side.
   - Clear resets all controls and re-renders.
   - Column counts and empty states update after each change.
   - The status filter hides the non-matching columns' cards (columns remain, showing empty states).
7. **Remove** the old table, the Refresh button and the "Sample data only…" footer text. Use the brand footer instead.
8. Manually check the page against the design reference at about 1440px, 820px and 375px widths.

UI states to handle:
- loading
- tasks error
- user error/missing name
- missing role
- missing or broken image
- empty board
- no filter results

## Test plan  (owner: test-engineer)
Commands (Windows, from the repository root):
- Backend: `.\mvnw.cmd test`
- App: `.\mvnw.cmd spring-boot:run` (serves http://127.0.0.1:8080, per `playwright.config.ts`)
- E2E: `npx playwright test`

Update `e2e/tests/taskflow-smoke.spec.ts` (regression, AC1/AC12) and add `e2e/tests/uvjtaskflow-dashboard.spec.ts`. Use `getByRole`/`getByLabel`/`getByText`, no sleeps. Use `page.route('**/api/users/current', …)` for deterministic user scenarios. Tasks come from the real seeded API.

| AC | Check | Type |
|---|---|---|
| 1 | Heading/wordmark "UVJTaskFlow" is visible. The logo `img` with alt "UVJ Technologies logo" is visible and loaded (`naturalWidth > 0`). The footer shows "UVJ Technologies". | Playwright |
| 2 | Visual review against the design reference; contrast spot-check | Manual |
| 3, 5 | Real API (`Demo User`): the greeting contains "Demo User". The page never contains "Arun Janardhanan". | Playwright |
| 3, 5, 6 | Mocked user A, then a reload with mocked user B: each shows its own name and role | Playwright |
| 4 | Mocked `imageUrl` (route-served image): the avatar `img` is visible. Mocked `imageUrl: null` with name "Test User" shows initials "TU". | Playwright |
| 4, 7 | Mocked image URL that returns 404: initials are shown | Playwright |
| 7 | Mocked `{name:null, role:null, imageUrl:null}`: "Welcome back!" is shown. The body text contains no `null` or `undefined`, and no role is displayed. | Playwright |
| 7 | Mocked 500 on `/api/users/current`: generic greeting, and the board still loads 6 tasks | Playwright |
| 7 | Blank/unsafe config values become null | Existing `UserControllerMissingProfileTest` |
| 8 | Seed data: Total 6, Completed 1, In Progress 2, To Do 2 (On Hold column count 1) | Playwright |
| 8 | `GET /api/tasks` returns 6 tasks and the 6th is `ON_HOLD` | `TaskControllerTest` |
| 9 | All four column headings are visible. On Hold contains "Plan data migration". | Playwright |
| 10 | The "Implement login" card shows its description and the "HIGH"/"High" priority badge in the In Progress column | Playwright |
| 11 | Priority High: only the 2 HIGH tasks are visible. Status "Completed": only "Fix button alignment". Status "On Hold": only "Plan data migration". Search "documentation": only "Add API documentation". A no-match search shows empty states. Clear restores 6 tasks. | Playwright |
| 11 | Create Task and each column's Add Task are visible, disabled and labelled "Coming soon". Disabled sidebar items show "Coming soon". Dashboard and Board links work. | Playwright |
| 11 | Mocked 500 on `/api/tasks`: a visible error message | Playwright |
| 12 | `.\mvnw.cmd test` passes (API contracts intact; only the seed count changes) | Backend regression |
| 13 | Viewports 1440×900, 820×1180 and 375×812: no horizontal overflow (`scrollWidth <= clientWidth`), and the board and summary cards are visible. Keyboard Tab reaches the search, filters and Clear, with a visible focus outline. | Playwright and manual |
| 14 | All of the above | Summary |
| 15 | Side-by-side screenshot comparison with attachment 10031, saved to `test-results/` (confirm the files exist before reporting) | Manual/review |

## Jira status
AIW-7 was **To Do** when planned (2026-10-31). The planner does not change Jira. The plan was approved on 2026-10-31. The first developer agent to start (`task-api-developer`, `frontend-developer`, or the `jira-to-pr` orchestrator) moves AIW-7 to **In Progress**.

Suggested order: `task-api-developer` (seed task and test), then `frontend-developer`, then `test-engineer`.
