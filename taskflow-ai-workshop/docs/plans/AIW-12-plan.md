# AIW-12: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED  
Saved: 2026-10-31

## Jira information (copied as untrusted data)
- **Key / URL:** AIW-12 / https://uvjtech-team-c7my2s53.atlassian.net/browse/AIW-12
- **Type, status, priority, assignee:** Story | To Do | Medium | Mithran Mani
- **Description:** Redesign existing TaskFlow application as UVJTaskFlow with UVJ Technologies branding, Kanban dashboard, dynamic user personalization, and responsive design. Must retain existing functionality.
- **Acceptance Criteria:** 15 criteria covering branding, dynamic user info, dashboard summary, Kanban board, responsive design, accessibility, and feature preservation.
- **Attachments:** Referenced but not yet listed; must include UVJ logo, dashboard reference image.
- **Comments:** None yet.

## Requirements

### Confirmed Requirements
1. **Branding:** Rename to UVJTaskFlow; display official UVJ Technologies logo; use green/grey/white palette.
2. **Dynamic User Personalization:** Display currently authenticated user's name, profile image (or initials), and role—retrieved from existing `/api/users/current` endpoint. No hardcoding of "Arun Janardhanan" or any individual's details.
3. **Dashboard Summary:** Display dynamic counts for Total Tasks, Completed, In Progress, To Do (calculated from task data, not hardcoded).
4. **Kanban Board:** Four columns: To Do, In Progress, Completed, On Hold. Task cards show: title, description, priority, Jira key (if available), assignee(s), effort, comments.
5. **Navigation:** Sidebar with Dashboard, Tasks, My Tasks, Board, Timeline, Reports, Milestones, Team, Settings (only implement supported destinations).
6. **Controls:** Global search, task search, project selector, date-range selector, priority filter, status filter, assignee filter, Create Task, Add Task within columns, Clear filters.
7. **Responsive Design:** Support desktop, tablet, mobile; prevent horizontal overflow; ensure readable text and clear focus states.
8. **Preserve Existing Functionality:** All current task retrieval, filtering, and creation behavior must continue to work.
9. **Testing:** Automated tests for dynamic user info, fallback behavior, dashboard rendering, task functionality.

### Assumptions
- Existing `/api/users/current` endpoint is available and returns `UserProfile` with `name`, `role`, `imageUrl` (may be null).
- Existing `/api/tasks` endpoint returns list of tasks with fields: id, title, description, status, priority.
- Current authentication mechanism remains in place.
- UI reference image will be provided as an attachment before implementation starts.
- "On Hold" status may not exist in current data model; implementation will use available status values and note gaps.
- Profile image fallback (initials) is acceptable when `imageUrl` is null/empty.

### Open Questions
1. Does the Kanban board need to persist task column moves (drag-and-drop and update), or is it read-only for MVP?
2. Should "Comments" field on task cards be a count (e.g., "2 comments") or editable within the card?
3. Does "My Tasks" sidebar navigation differ from the Board view in filtering/display, or is it the same view?
4. Should task data also return a Jira issue key, or must this be inferred/added separately?
5. Does the existing application support task assignments to multiple users, or is it single-assignee?
6. What is the source of the "On Hold" status if it's not currently used in the backend?

### Edge Cases and Risks
- **Null/missing user info:** If user not authenticated or profile unavailable, display generic greeting (e.g., "Welcome") instead of null/undefined.
- **Missing profile image:** Fall back to user's initials; if name is also missing, use a generic avatar.
- **Empty task list:** Handle gracefully; display empty state message.
- **Large task list performance:** Current `/api/tasks` returns all tasks; consider pagination/lazy loading if dataset grows.
- **Responsive layout:** Sidebar collapse on mobile; ensure task cards remain readable on small screens.
- **Jira key field:** If backend doesn't provide Jira key, it cannot be displayed; document this limitation.

## Backend plan (owner: task-api-developer)
**Status:** No new backend endpoints required; reuse existing APIs.

### Affected Files
- `src/main/java/com/example/taskflow/user/UserController.java` – Already provides `/api/users/current`.
- `src/main/java/com/example/taskflow/task/TaskController.java` – Already provides `/api/tasks`; consider adding optional filters (priority, status, assignee) if needed for advanced filtering, but not mandatory for MVP.
- `src/main/java/com/example/taskflow/user/UserProfile.java` – Already defined with name, role, imageUrl.
- `src/main/java/com/example/taskflow/task/Task.java` – Verify it includes all fields referenced in AC (title, description, priority, status).

### Ordered Steps
1. Verify existing `/api/users/current` returns user profile with all needed fields (name, role, imageUrl).
2. Verify existing `/api/tasks` includes id, title, description, status, priority, assignee (if multi-assign supported).
3. Check Task model for any missing fields required by AC (Jira key, effort, comment count).
4. If fields are missing, add them with appropriate defaults; update TaskService and tests.
5. Ensure UserController and TaskController have unit/MockMvc tests for happy-path and edge cases (missing profile, empty task list).
6. No migration or data seed required.

### Validation
- Unit tests pass: `mvn test -Dtest=UserController*,TaskController*`
- API contract verified: `curl http://localhost:8080/api/users/current` and `curl http://localhost:8080/api/tasks`

## Frontend plan (owner: frontend-developer)
**Status:** Full redesign of existing static HTML/CSS/JavaScript.

### Affected Files
1. **`src/main/resources/static/index.html`** – Complete redesign:
   - Add UVJ logo and branding header.
   - Add sidebar navigation with menu items.
   - Add welcome section with dynamic user name and profile.
   - Add dashboard summary cards (Total, Completed, In Progress, To Do).
   - Add Kanban board with four columns (To Do, In Progress, Completed, On Hold).
   - Add controls: search, filters (priority, status, assignee), Create Task button.
   - Add footer with UVJ branding.

2. **`src/main/resources/static/styles.css`** – Full redesign:
   - Replace current simple layout with sidebar + main content area.
   - Implement green/grey/white color scheme inspired by UVJ logo.
   - Style Kanban columns, task cards, summary cards, filters, responsive breakpoints.
   - Ensure accessibility: sufficient contrast, readable font sizes, focus states.

3. **`src/main/resources/static/app.js`** – Rewrite logic:
   - Fetch `/api/users/current` on page load; display name, role, profile image (or initials).
   - Fetch `/api/tasks` and group into Kanban columns by status.
   - Implement task card rendering with all available fields.
   - Implement filter logic: by priority, status, assignee.
   - Implement search (global and task-specific).
   - Implement Create Task action (form or modal; details TBD).
   - Handle edge cases: missing user info, empty task list, API errors.

### Ordered Steps
1. **Download and review UI reference image** (from Jira attachment).
2. **Design layout:** Sketch sidebar, header, summary cards, Kanban board structure in HTML.
3. **Branding:** Add UVJ logo; define green/grey/white CSS variables.
4. **User profile section:** Add welcome message; fetch and display user name, profile image or initials.
5. **Summary cards:** Calculate and display task counts from fetched data.
6. **Kanban board:** Build column headers and empty card containers.
7. **Task rendering:** Fetch tasks and populate Kanban columns by status.
8. **Filters and search:** Add filter controls (priority, status, assignee); implement filter logic.
9. **Create Task action:** Add button and basic action (full CRUD TBD).
10. **Responsive design:** Test and adjust layouts for tablet and mobile.
11. **Accessibility:** Add labels, ARIA attributes, keyboard navigation, focus states.
12. **Error handling:** Display user-friendly error messages for API failures.
13. **Testing:** Write Playwright tests for each feature.

### API Contract (Frontend → Backend)
| Endpoint | Method | Description | Frontend Usage |
|----------|--------|-------------|----------------|
| `/api/users/current` | GET | Returns `{name, role, imageUrl}` | Fetch on load; display user profile |
| `/api/tasks` | GET | Returns `[{id, title, description, status, priority, ...}]` | Fetch on load; populate Kanban |
| `/api/tasks` (future) | POST | Create new task (if supported) | Create Task button |

### UI States
- **On load:** Show loading spinner; fetch user and tasks.
- **User info loaded:** Display welcome message, name, role, profile or initials.
- **Tasks loaded:** Populate Kanban columns; show task counts in summary.
- **No tasks:** Display empty-state message in each column.
- **Filter applied:** Show filtered task set; offer "Clear filters" action.
- **Search active:** Highlight matching tasks; show result count.
- **API error:** Display error message; offer "Retry" button.

### Attachments to Download (before implementation)
- UVJ Technologies logo (for branding).
- UVJTaskFlow dashboard reference image (for design inspiration).

## Test plan (owner: test-engineer)

### Mapping: Acceptance Criteria → Tests

| AC # | Criterion | Test Type | Test Coverage |
|------|-----------|-----------|----------------|
| 1 | App displays "UVJTaskFlow" and logo | Unit / E2E | Verify logo and title in DOM; screenshot comparison |
| 2 | Consistent green/grey/white palette | Unit / Visual | Check CSS color variables; screenshot |
| 3 | Logged-in user's name displayed (not sample name) | Unit / E2E | Mock user API; assert name in welcome section |
| 4 | Profile image displayed or initials fallback | Unit / E2E | Mock user with imageUrl; mock user without; verify fallback |
| 5 | User info retrieved dynamically, not hardcoded | Unit | Grep codebase; verify no hardcoded "Arun Janardhanan" |
| 6 | Switching user accounts updates profile info | E2E | Logout → login as different user; verify profile updates |
| 7 | Missing user info handled gracefully (no null/undefined display) | Unit / E2E | Mock null name, null imageUrl; verify graceful fallback |
| 8 | Dashboard summary counts reflect task data | Unit / E2E | Mock task list with 5 tasks (2 complete, 2 in-progress, 1 to-do); verify counts |
| 9 | Kanban board displays 4 columns and uses existing data | Unit / E2E | Mock tasks with different statuses; verify columns and card placement |
| 10 | Task cards display available title, description, priority, info | Unit / E2E | Mock task; verify card renders all fields |
| 11 | Search, filters, actions work correctly | Unit / E2E | Test priority filter, status filter, search; verify results update |
| 12 | Existing app features and API behavior not broken | Regression / E2E | Run all existing tests; verify task CRUD still works |
| 13 | Responsive design usable on desktop, tablet, mobile | E2E / Visual | Run Playwright on desktop, tablet, mobile viewports; no horizontal overflow |
| 14 | Automated tests cover dynamic user info, fallback, dashboard, task features | Unit / E2E | Minimum coverage: 80% of JavaScript logic |
| 15 | Verified against reference image | Manual / E2E | Screenshot comparison; manual review against design |

### Backend Unit/MockMvc Tests
- Existing `UserControllerTest`, `UserControllerMissingProfileTest`, `UserControllerConfiguredUserTest` – verify `/api/users/current` returns correct profile.
- Existing `TaskControllerTest` – verify `/api/tasks` returns task list with required fields.
- Add test: missing/null profile fields (name, imageUrl) handled gracefully.
- Add test: empty task list handled correctly.

### Playwright E2E Tests (new and updated)
- **`e2e/tests/uvjbranding.spec.ts`** (new): Verify logo, title, color scheme.
- **`e2e/tests/user-profile.spec.ts`** (new): Verify user name, profile image, initials fallback, null/undefined handling.
- **`e2e/tests/dashboard-summary.spec.ts`** (new): Verify task counts match data.
- **`e2e/tests/kanban-board.spec.ts`** (new): Verify columns, task placement, card content.
- **`e2e/tests/filters-search.spec.ts`** (new): Verify priority filter, status filter, search.
- **`e2e/tests/responsive.spec.ts`** (new): Verify layout on desktop, tablet, mobile viewports.
- **`e2e/tests/taskflow-smoke.spec.ts`** (updated): Ensure existing smoke tests still pass.

### Validation Commands
1. **Build:** `mvn clean package`
2. **Backend tests:** `mvn test`
3. **Start app:** `mvn spring-boot:run` (or equivalent)
4. **Playwright tests:** `npx playwright test --config=playwright.config.ts`
5. **Manual review:** Open http://localhost:8080 in browser; verify against reference image.

## Jira Status Handoff
- **Current Jira status:** To Do (not yet In Progress)
- **Handoff note:** When the first developer (task-api-developer or frontend-developer) begins implementation, they will move this issue to **In Progress** in Jira.

## Summary for Planning Review
This plan redesigns the TaskFlow UI as UVJTaskFlow with UVJ branding, a Kanban dashboard, and dynamic user personalization. It reuses existing `/api/users/current` and `/api/tasks` endpoints and requires no new backend APIs for MVP. Frontend work focuses on HTML/CSS/JavaScript redesign within the existing static file structure. All acceptance criteria are testable via unit, MockMvc, and Playwright E2E tests. Key risks are missing UI reference image (needed before start), unclear Kanban interactions (read-only vs. drag-drop for MVP), and potential performance issues with large task lists (deferred for post-MVP).
