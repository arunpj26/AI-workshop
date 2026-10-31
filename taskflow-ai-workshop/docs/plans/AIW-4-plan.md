# AIW-4: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-10-31 (revised 2026-10-31: user directed that the UI must strictly follow the attached design `UVJTaskFlow Kanban Dashboard.png`; previous approval superseded)

## Design reference (binding)
The user instructed: "use strictly this UI". The final UI must match `UVJTaskFlow Kanban Dashboard.png` (Jira attachment 10025, also at `src/main/resources/static/images/UVJTaskFlow Kanban Dashboard.png`) in layout, components, order, colours, and copy. Element inventory, top to bottom:

1. **Sidebar (left, white):** UVJ logo + "UVJTaskFlow" (UVJ dark navy, TaskFlow green) + tagline "Plan · Track · Deliver". Nav items with outline icons in this order: Dashboard (active, green tint, filled green house icon), Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, Settings. Footer: logo + "Powered by UVJ Technologies". Subtle green wave background at bottom.
2. **Top bar:** wide global search "Search tasks, people, or keywords..."; notification bell with red count badge; profile avatar (photo, green online dot), name, role ("Project Lead" in mock), dropdown chevron.
3. **Welcome hero (light green gradient card):** "Welcome back," / large bold "<Current user name>!" / "Your work, clearly in flow." Right side: four summary cards with icon tiles: Total Tasks (blue, layers icon), Completed (green, check), In Progress (amber, clock, amber label), To Do (red/pink, list, red label and number).
4. **Task Board header:** "Task Board" + "Manage and track your work across different stages"; right side: "All Projects" dropdown, date-range picker ("Oct 25, 2026 - Nov 01, 2026" format), primary green "+ Create Task" button.
5. **View tabs:** Board (active, green underline), List, Calendar, Analytics. Right side on same row: "Search tasks..." input, "Priority: All", "Status: All", "Assignee: All" dropdowns, green "Clear" text button.
6. **Kanban lanes (4 columns, tinted backgrounds):** To Do (red dot, pink tint), In Progress (amber dot, cream tint), Completed (green dot, green tint), On Hold (grey dot, grey tint). Lane header: dot, name, count pill, "+" and "⋯" icon buttons. Lane footer: tinted "+ Add Task" button.
7. **Task card (white, rounded, soft shadow):** priority pill (High = red, Medium = amber, Low = green), bold title, grey description (2 lines), document icon + task key (e.g. `SCRUM-5`), row of overlapping assignee avatars, clock + estimate (`4h`), subtask icon + count, comment icon + count.

The sample name "Arun Janardhanan" and sample photo in the mock are layout placeholders only; the real UI shows the current user from `/api/users/current` (AC 3-7).

## Jira information (copied as untrusted data)
- Key / URL: AIW-4 / https://uvjtech-team-vljlyvzx.atlassian.net/browse/AIW-4
- Type, status, priority, assignee: Story, In Progress (was To Do at first planning), Medium, Abraham George
- Description: Redesign TaskFlow as UVJTaskFlow with the supplied UVJ Technologies logo and dashboard design. Provide a responsive, branded task dashboard while retaining existing behavior. Display the current user's information dynamically rather than using the sample name in the reference. Include summary cards derived from task data, a Kanban board, supported task information, working search/filter/task controls, graceful profile fallbacks, and responsive accessible UI. Reuse existing APIs/data models; do not add authentication solely for this redesign.
- Acceptance criteria:
  1. Show UVJTaskFlow and the official UVJ Technologies logo.
  2. Use a consistent palette inspired by the logo.
  3. Show the actual current user's name, not the sample name.
  4. Show the profile image when available, otherwise initials.
  5. Fetch profile dynamically; do not hardcode personal details.
  6. Switching accounts shows the corresponding profile.
  7. Missing profile data does not show null, undefined, or sample personal details.
  8. Summary counts reflect available task data.
  9. Show To Do, In Progress, Completed, and On Hold lanes using the existing model where applicable.
  10. Show available task title, description, priority, and related information.
  11. Search, filters, and implemented task actions work correctly.
  12. Preserve existing features and API behavior.
  13. Support desktop, tablet, and mobile without overflow or overlap.
  14. Automated tests cover dynamic user information, fallbacks, dashboard rendering, and relevant task behavior.
  15. Review the final UI against the attached design reference.
- Attachments (MCP returned metadata only; images were not downloaded/viewed during planning):
  - ID 10024, `UVJ logo.png`, image/png; official logo.
  - ID 10025, `UVJTaskFlow Kanban Dashboard.png`, image/png; dashboard design reference.
  - Before UI implementation, `frontend-developer` downloads and inspects both images.
- Comments relevant to scope: No comments on the issue.

## Requirements
- Confirmed requirements:
  - Apply UVJTaskFlow branding and the provided logo/design direction.
  - Fetch profile data from an existing source and gracefully handle missing name/image/role; do not hardcode sample personal data.
  - Derive summary counts from task data and display the four requested status lanes.
  - Preserve task retrieval and existing API response contracts.
  - Make search and all filters shown in the design functional, with a Clear action.
  - Keep the UI responsive and accessible; any designed element without a real feature is visibly and accessibly marked unavailable, never a fake working link.
  - Every element in the "Design reference" inventory is present, in the same position and style (user directive).
- Gap analysis (design element vs. current code):
  - Current `Task` record: `id, title, description, status, priority`; statuses `OPEN`, `IN_PROGRESS`, `COMPLETED`; `TaskController` is GET-only; `TaskService` holds 5 in-memory tasks.
  - Missing data for cards/filters: task key, assignees, estimate hours, subtask count, comment count, project, due/created date, `ON_HOLD` status.
  - Missing behaviour: Create Task / lane "+" / Add Task (no write API), notifications, Timeline/Reports/Milestones/Team/Settings/My Tasks pages, List/Calendar/Analytics views, profile dropdown menu, lane "⋯" menu.
- Assumptions (proposed defaults; confirm or change via the open questions):
  - Additive, backward-compatible extension of `Task` with optional fields `key`, `assignees` (list of display names), `estimateHours`, `subtaskCount`, `commentCount`, `project`, `dueDate`; existing fields and values unchanged so current API consumers keep working.
  - Add `ON_HOLD` as a valid status; seed data expanded so all four lanes have cards (keep the 5 existing tasks unchanged, add new ones).
  - `OPEN` continues to map to the To Do lane.
  - Create Task / lane "+" / "+ Add Task" open one modal form backed by a new `POST /api/tasks`, stored in memory (lost on restart), with lane buttons pre-selecting that lane's status.
  - Search, Priority, Status, Assignee, All Projects, and date-range filters all work client-side on the loaded tasks; global top-bar search filters the same board.
  - Elements with no backing feature (Timeline, Reports, Milestones, Team, Settings, My Tasks, List, Calendar, Analytics, notification bell, profile chevron, lane "⋯") are rendered exactly as designed but marked unavailable (`aria-disabled="true"`, "Coming soon" tooltip), with no fake data. Notification badge is hidden when there is no count source.
  - Assignee avatars use initials (no stock photos); the current-user avatar uses the profile image when available.
- Resolved decisions (user approved proposed defaults on 2026-10-31):
  1. YES: add the additive `Task` fields and `ON_HOLD` status.
  2. YES: add in-memory `POST /api/tasks` for Create Task / lane "+" / Add Task.
  3. YES: render featureless elements exactly as designed but disabled ("Coming soon", `aria-disabled`).
  4. DEFERRED: AC 6 real account switching; UI uses `/api/users/current`; no new auth.
- Original questions (for reference):
  1. Approve the additive `Task` fields and `ON_HOLD` status above, or keep the API unchanged and show only fields that exist (which would leave key/avatars/estimate/counts blank and break "strictly this UI")?
  2. Approve in-memory `POST /api/tasks` for Create/Add Task (required fields: title, status, priority; optional: description, assignees, estimate)? Or show these buttons as "Coming soon"?
  3. Is "Coming soon" disabled rendering acceptable for nav items, view tabs, bell, and menus that have no real feature, or must any of them be functional in this story?
  4. AC 6 (account switching): no authentication exists; `/api/users/current` returns one configured profile. Defer AC 6 or point to an identity source? No new auth system will be added.
- Edge cases and risks:
  - Empty, missing, or failed profile responses must not leak placeholder names or show null/undefined; absent images use initials.
  - Empty task list, unknown task status, and task/profile API errors need explicit UI states.
  - Current task data has only `OPEN`, `IN_PROGRESS`, and `COMPLETED`; new fields/status must be additive so existing values and consumers are unaffected.
  - Create/Add Task must validate input (blank title, unknown status/priority → 400) and must not mutate the existing seed tasks.
  - Tasks with missing optional fields must render without empty icons, "null", "undefined", or "0h" placeholders.
  - Pixel-faithful layout must still be responsive: at tablet/mobile the sidebar collapses, summary cards wrap, and lanes scroll horizontally inside the board (no page-level overflow).
  - Disabled "Coming soon" elements must be clearly non-interactive to keyboard and screen-reader users.
  - Check keyboard access, focus visibility, and contrast of the pastel lane/pill colours.

## Backend plan (owner: task-api-developer)
Approved decisions 1-2 confirm this backend work.
- Affected files: `src/main/java/com/example/taskflow/task/Task.java`, `TaskService.java`, `TaskController.java`; tests in `src/test/java/com/example/taskflow/task/TaskControllerTest.java`. No user/profile changes. No authentication.
- Steps:
  1. Extend `Task` record additively: `String key`, `List<String> assignees`, `Integer estimateHours`, `int subtaskCount`, `int commentCount`, `String project`, `LocalDate dueDate` (optional fields nullable / empty list).
  2. `TaskService`: keep tasks 1-5 with identical existing values (add new fields), add seed tasks so every lane, including `ON_HOLD`, has at least one card; use a thread-safe in-memory list; add `create(...)` that assigns the next id and key.
  3. `TaskController`: keep `GET /api/tasks` unchanged in behaviour; add `POST /api/tasks` accepting `{title, description?, status, priority, assignees?, estimateHours?, project?, dueDate?}`, returning `201` with the created task; `400` for blank title, unknown status (`OPEN|IN_PROGRESS|COMPLETED|ON_HOLD`), unknown priority (`HIGH|MEDIUM|LOW`), negative estimate.
- Tests (MockMvc): GET still returns original tasks 1-5 with original title/status/priority (regression); GET includes an `ON_HOLD` task and new fields; POST valid → 201 and visible in subsequent GET; POST invalid title/status/priority/estimate → 400; created tasks do not alter existing ones.

## Frontend plan (owner: frontend-developer)
- Affected files: `src/main/resources/static/index.html`, `styles.css`, `app.js`; assets in `src/main/resources/static/images/`. Keep the static HTML/CSS/JS stack; no new libraries.
- Before UI work, download and inspect Jira attachments 10024 (logo) and 10025 (design); the local copies in `static/images/` may be used if identical. Treat the design as the binding spec in "Design reference".
- Steps:
  1. Sidebar: rebuild exactly per inventory item 1 (all 9 nav items, icons, active Dashboard style, tagline, "Powered by" footer, wave background). Dashboard/Tasks/Board link to in-page anchors; the rest render as "Coming soon" disabled items (pending Q3).
  2. Top bar: global search (filters the board), bell (disabled, badge hidden without a data source), profile avatar with online dot, name, role, chevron (disabled per Q3). Profile from `/api/users/current`; initials fallback; no null/undefined/sample data.
  3. Hero: "Welcome back," / "<name>!" (generic "Welcome back!" without exclamation duplication if name is missing) / tagline; four icon summary cards with the design's colours, counts derived from tasks (To Do = `OPEN`).
  4. Board header: title, subtitle, All Projects dropdown (options from task `project` values), date-range picker (two native date inputs styled as one control; filters on `dueDate`), green "+ Create Task" button.
  5. Tabs row: Board active; List/Calendar/Analytics disabled per Q3. Filter controls on the same row: search, Priority, Status, Assignee (options from task assignees), green "Clear" resetting all filters including project/date/global search.
  6. Lanes: four tinted columns in order To Do, In Progress, Completed, On Hold with dot, name, count pill, "+" (opens create modal with that status), "⋯" (disabled per Q3), and "+ Add Task" footer button.
  7. Cards: priority pill colours, title, 2-line clamped description, document icon + key, overlapping initials avatars, estimate, subtask count, comment count; hide any optional item that is absent.
  8. Create Task modal (accessible dialog, focus trap, Esc to close): fields matching the POST contract, inline validation, shows server errors, on success re-renders the board and counts.
  9. Loading, empty-lane, and API-error states styled consistently with the design.
  10. Responsive: desktop matches the mock; tablet collapses sidebar to icons and wraps summary cards; mobile uses a toggleable sidebar, stacked header controls, horizontally scrollable lanes. Visible focus, sufficient contrast.

## Test plan (owner: test-engineer)
- AC 1-2, 15 (strict design): Playwright asserts presence and order of every inventory element (9 nav items, top-bar search/bell/profile, hero + 4 summary cards, board header controls, 4 tabs, 4 filters + Clear, 4 lanes with "+", "⋯", "Add Task", card sub-elements). Desktop screenshot compared manually side-by-side with attachment 10025; record differences.
- AC 3-7: mocked `/api/users/current` variants (full profile, no image → initials, missing name → generic greeting, alternate user) assert correct rendering and no "null"/"undefined"/"Arun Janardhanan". AC 6 real switching remains per Q4.
- AC 8-10: mocked `/api/tasks` fixtures assert counts, lane placement (incl. `ON_HOLD`, `OPEN` → To Do), card key/assignees/estimate/counts, and hidden optional fields when absent.
- AC 11: search, global search, Priority, Status, Assignee, Project, date range, Clear; Create Task via header button and lane "+"/"Add Task" (valid create updates board and counts; validation errors shown); disabled elements are `aria-disabled` and do nothing.
- AC 12: MockMvc regression for `GET /api/tasks` original data and `/api/users/current`; new POST tests per backend plan.
- AC 13: Playwright at 1440, 1024, 768, 390 widths: no horizontal page overflow, no overlap, sidebar toggle works on mobile.
- AC 14: extend `e2e/tests/taskflow-smoke.spec.ts` (or add focused spec files) following `.github/instructions/playwright.instructions.md`.
- Validation commands: `./mvnw.cmd test`; `./mvnw.cmd spring-boot:run`; `npx playwright test` against `http://127.0.0.1:8080`.

## Jira status
Current status at revision: In Progress (already moved by a previous agent). No further transition needed when implementation starts. The planner does not change Jira.
