# AIW-7: Redesign TaskFlow UI with UVJ Technologies Branding and Kanban Dashboard

Plan status: APPROVED
Saved: 2026-11-01

## Jira information (copied as untrusted data)
- Key / URL: AIW-7 / https://arunpj26.atlassian.net/browse/AIW-7
- Type, status, priority, assignee: Story | In Progress | Medium | Priya Sojan
- Description:
  - Redesign the existing TaskFlow application as UVJTaskFlow following the attached UI reference image.
  - Apply UVJ Technologies branding: logo, green/grey/white palette, responsive dashboard, and improved task navigation.
  - Retain existing functionality while improving visual presentation, organization, and user experience.
  - Username and profile details must be dynamic and must not be hardcoded.
- Acceptance criteria:
  - Rename branding to UVJTaskFlow and display official UVJ logo and footer branding.
  - Display the logged-in user name and profile details dynamically from application data.
  - Show dashboard summary counts for Total Tasks, Completed, In Progress, and To Do.
  - Present a Kanban board with status columns and task cards using the available task data.
  - Keep the app responsive and preserve existing task functionality.
  - Use semantics and accessible UI patterns with visible focus states.
- Attachments (id, filename, mime type; note which are logo/design images):
  - 10002 | UVJ logo.png | image/png | logo image
  - 10003 | UVJTaskFlow Kanban Dashboard.png | image/png | design reference image
- Comments relevant to scope:
  - No comments were attached to this story, so requirements are taken from the issue description and current repository state.

## Requirements
- Confirmed requirements:
  - Update branding from TaskFlow to UVJTaskFlow with UVJ logo and green/grey/white theme.
  - Load the active user’s name, role, and optional profile image from the application context or user profile endpoint.
  - Display dynamic summary cards for task totals and state counts.
  - Render a Kanban board with To Do, In Progress, Completed, and On Hold columns.
  - Preserve current task functionality and API behavior while improving UX.
  - Support responsive, mobile-friendly layouts without breaking current interactions.
- Assumptions:
  - Existing backend endpoints continue to provide user and task data via /api/users/current and /api/tasks.
  - A user profile may be missing or may contain blank values; the UI should fall back safely instead of showing null or unsafe values.
  - Placeholder "Create Task" and "Add Task" controls are acceptable for a UI refresh if the underlying CRUD workflow is not part of this story.
  - The Kanban board is primarily a read/visualization layer unless explicitly expanded in later work.
- Open questions:
  - Is drag-and-drop task movement in scope for this story, or is the board meant to remain read-only for now?
  - Are the Add Task and Create Task buttons expected to open a real form in this issue, or is a future enhancement acceptable?
  - Should the sidebar navigation be purely visual, or does each item need working page routing?
- Edge cases and risks:
  - Missing or blank user-name values must not render broken UI.
  - Unsafe image URLs should be rejected or ignored before insertion into the DOM.
  - Empty task lists should display a meaningful empty-state message instead of a blank board.
  - The app must stay readable on smaller screens without horizontal overflow.
  - Summary counts must reflect actual task data and not hardcoded numbers.

## Backend plan (owner: task-api-developer)
Affected files, ordered steps, API contract, backend unit/MockMvc tests.

### Affected files
- src/main/java/com/example/taskflow/user/UserController.java
- src/main/java/com/example/taskflow/user/UserProfile.java
- src/main/java/com/example/taskflow/user/UserProfileService.java
- src/main/java/com/example/taskflow/task/TaskController.java
- src/main/java/com/example/taskflow/task/TaskService.java
- src/main/java/com/example/taskflow/task/Task.java
- src/test/java/com/example/taskflow/user/UserControllerConfiguredUserTest.java
- src/test/java/com/example/taskflow/user/UserControllerMissingProfileTest.java
- src/test/java/com/example/taskflow/task/TaskControllerTest.java

### Ordered steps
1. Validate the current user profile contract for name, role, and optional image URL.
2. Confirm the task endpoint continues to return the fields needed for the dashboard and Kanban cards.
3. Check for any missing task metadata needed for UI rendering (priority, status, assignee, effort, comments).
4. Preserve the contract and add only minimal validation or fallback handling required to keep the UI safe.
5. Keep backend tests focused on positive and edge-case responses for user/profile and task list payloads.

### API contract
- GET /api/users/current
  - Returns the active user profile payload used by the dashboard.
  - Expected fields: name, role, imageUrl (may be null/blank).
- GET /api/tasks
  - Returns the list of tasks used for summary counts and Kanban placement.
  - Expected fields include id, title, description, status, priority, and optional fields such as assignee, effort, comments.

### Backend unit/MockMvc tests
- Existing tests already cover:
  - Normal user profile response when values are configured.
  - Missing/blank/unsafe user profile values.
  - Seeded tasks list with required fields and variations in status and assignee.
- Additional regression checks if needed:
  - Blank user name falls back to a graceful default value in the UI contract rather than null.
  - Empty task list returns an empty JSON array instead of an error.

## Frontend plan (owner: frontend-developer)
Affected files, ordered steps, UI states, attachments to download.

### Affected files
- src/main/resources/static/index.html
- src/main/resources/static/styles.css
- src/main/resources/static/app.js
- src/main/resources/static/images/UVJ logo.png (existing branding asset)

### Ordered steps
1. Download and review the design reference and logo attachments from Jira before final styling decisions.
2. Update the page shell to a UVJTaskFlow layout: sidebar, top header, dashboard summary, and footer branding.
3. Replace default static labels with dynamic user data loaded from /api/users/current.
4. Build the summary cards so counts are calculated from /api/tasks rather than hardcoded values.
5. Create the Kanban board structure and render tasks by normalized status into each column.
6. Add filter/search controls and maintain safe handling for missing task fields.
7. Add accessible labels, keyboard visibility, and responsive breakpoints for tablet/mobile layouts.
8. Verify empty-state, loading, and API-error behaviors.
9. Confirm that existing task functionality still works after the redesign.

### UI states
- Loading state while fetching user and task data.
- User profile loaded with name, role, and initials or image fallback.
- Summary counts rendered from the live task list.
- Kanban columns populated by task status with zero-state handling.
- Filtered or searched views that still preserve valid empty states.
- API error state with visible fallback messaging.

### Attachments to download
- UVJ logo.png
- UVJTaskFlow Kanban Dashboard.png

## Test plan (owner: test-engineer)
Acceptance criteria mapped to backend tests, Playwright tests and manual checks.

### Acceptance criteria mapping
- Branding and logo: verify the page title and branding appear in the DOM and match the reference design.
- Dynamic user profile: verify /api/users/current data populates the welcome banner and avatar area without hardcoded names.
- Task summary counts: verify the cards reflect the current task list from /api/tasks.
- Kanban layout: verify columns render, counts update, and tasks appear under the correct status.
- Responsive UI: verify no overflow on mobile/tablet/desktop layouts.
- Regression safety: verify existing task flows continue to work after the redesign.

### Validation commands
- Backend tests: mvn test
- Full build: mvn clean package
- Browser-level verification: npx playwright test --config=playwright.config.ts
- Manual review: run the app locally and compare the dashboard to the provided reference image.

### Relevant existing tests
- src/test/java/com/example/taskflow/user/UserControllerConfiguredUserTest.java
- src/test/java/com/example/taskflow/user/UserControllerMissingProfileTest.java
- src/test/java/com/example/taskflow/task/TaskControllerTest.java

## Jira status
Current status when planned: In Progress.
The first developer agent to start implementation should continue from this state and maintain the issue as In Progress while working.
