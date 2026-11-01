import { test, expect } from "@playwright/test";

test("UVJ Branding - Title and Logo", async ({ page }) => {
  await page.goto("/");
  
  // Verify UVJTaskFlow title
  await expect(page).toHaveTitle("UVJTaskFlow | Dashboard");
  
  // Verify logo is present
  const logo = page.locator('img[alt="UVJ Technologies Logo"]');
  await expect(logo).toBeVisible();
  
  // Verify main heading
  await expect(page.getByRole("heading", { name: "UVJTaskFlow", exact: true })).toBeVisible();
  
  // Verify tagline
  await expect(page.getByText("Plan · Track · Deliver")).toBeVisible();
});

test("User Profile - Dynamic Name Display", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    contentType: "application/json",
    json: { name: "Taylor Morgan", role: "Project Member", imageUrl: null }
  }));
  await page.goto("/");
  
  const userName = page.locator("#user-name");
  await expect(userName).toHaveText("Taylor Morgan");
  
  const userRole = page.locator("#user-role");
  await expect(userRole).toContainText("Project Member");
});

test("Dashboard Summary Cards", async ({ page }) => {
  await page.goto("/");
  
  // Verify summary cards are present
  const summaryCards = page.locator(".summary-card");
  const count = await summaryCards.count();
  expect(count).toBeGreaterThanOrEqual(4);
  
  // Verify card labels are present
  await expect(page.locator(".summary-label").first()).toContainText(/Total Tasks|Completed|In Progress|To Do/);
});

test("Kanban Board - Four Columns", async ({ page }) => {
  await page.goto("/");
  
  // Verify all four Kanban columns are present
  const columns = page.locator(".kanban-column");
  const columnCount = await columns.count();
  expect(columnCount).toBe(4);
  
  // Verify column headers
  await expect(page.locator(".column-title").first()).toContainText("To Do");
});

test("Task Cards Display Required Fields", async ({ page }) => {
  await page.goto("/");
  
  // Wait for tasks to load
  await page.waitForSelector(".task-card", { timeout: 5000 });
  
  // Find the first task card
  const taskCard = page.locator(".task-card").first();
  await expect(taskCard).toBeVisible();
  
  // Should have title
  const title = taskCard.locator(".task-title");
  await expect(title).toBeVisible();
  
  // Should have priority badge
  const priority = taskCard.locator(".task-priority");
  await expect(priority).toBeVisible();
});

test("Priority Filter Functionality", async ({ page }) => {
  await page.goto("/");
  
  const priorityFilter = page.locator("#priority-filter");
  await expect(priorityFilter).toBeVisible();
  await priorityFilter.selectOption("HIGH");
  await expect(page.locator(".task-card").first().locator(".task-priority")).toHaveText("HIGH");

  const clearBtn = page.locator("#clear-filters");
  await clearBtn.click();
  await expect(priorityFilter).toHaveValue("");
});

test("Search Functionality", async ({ page }) => {
  await page.goto("/");
  
  await page.waitForSelector(".task-card", { timeout: 5000 });
  const searchInput = page.locator("#task-search");
  await expect(searchInput).toBeVisible();
  await searchInput.fill("login");
  await expect(page.locator(".task-title").filter({ hasText: "login" }).first()).toBeVisible();
});

test("Task filters, summaries, unmapped statuses, and task text use retrieved data", async ({ page }) => {
  const tasks = [
    { id: 1, title: "<img src=x onerror=alert(1)>", description: "Login API", status: "OPEN", priority: "HIGH", assignee: "Taylor Morgan", effort: 5, comments: 2, jiraIssueKey: "AIW-TEST" },
    { id: 2, title: "Review dashboard", description: "Check overview", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "Jordan Lee", effort: 3 },
    { id: 3, title: "Publish release", description: "Release notes", status: "COMPLETED", priority: "LOW", assignee: "Taylor Morgan", effort: 2, comments: 0 },
    { id: 4, title: "Update dependencies", description: "Review packages", status: "ON_HOLD", priority: "HIGH", assignee: "Jordan Lee", effort: 4, comments: 3 },
    { id: 5, title: "Investigate import", description: "Inspect mapping", status: "WAITING", priority: "URGENT", assignee: "Jordan Lee", effort: 1, comments: 0 }
  ];
  await page.route("**/api/tasks", (route) => route.fulfill({ contentType: "application/json", json: tasks }));
  await page.goto("/");

  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.locator("#in-progress-count")).toHaveText("1");
  await expect(page.locator("#to-do-count")).toHaveText("1");
  await expect(page.locator("#unmapped-status-note")).toContainText("1 task has a status that is not represented");
  await expect(page.locator("#tasks-TODO .task-title")).toHaveText("<img src=x onerror=alert(1)>");
  await expect(page.locator("#tasks-TODO img")).toHaveCount(0);
  await expect(page.locator("#tasks-TODO")).toContainText("AIW-TEST");
  await expect(page.locator("#tasks-TODO .task-card").first().locator(".task-comments")).toHaveText("Comments: 2");
  await expect(page.locator(".task-card").filter({ hasText: "Review dashboard" }).locator(".task-comments")).toHaveCount(0);

  await page.locator("#assignee-filter").selectOption("Jordan Lee");
  await expect(page.locator(".task-card")).toHaveCount(2);
  await expect(page.locator("#tasks-TODO .task-card")).toHaveCount(0);

  await page.locator("#clear-filters").click();
  await page.locator("#status-filter").selectOption("ON_HOLD");
  await expect(page.locator(".task-card")).toHaveCount(1);
  await expect(page.locator("#tasks-ON_HOLD")).toContainText("Update dependencies");

  await page.locator("#clear-filters").click();
  await page.locator("#priority-filter").selectOption("HIGH");
  await expect(page.locator(".task-card")).toHaveCount(2);
  await expect(page.locator(".task-priority")).toHaveText(["HIGH", "HIGH"]);
});

test("Empty task response renders zero counts and an informative state", async ({ page }) => {
  await page.route("**/api/tasks", (route) => route.fulfill({ contentType: "application/json", json: [] }));
  await page.goto("/");

  await expect(page.locator("#total-count")).toHaveText("0");
  await expect(page.locator("#completed-count")).toHaveText("0");
  await expect(page.locator("#in-progress-count")).toHaveText("0");
  await expect(page.locator("#to-do-count")).toHaveText("0");
  await expect(page.locator("#empty-state")).toContainText("No tasks have been returned yet.");
});

test("Sidebar Navigation", async ({ page }) => {
  await page.goto("/");
  
  const sidebar = page.locator(".sidebar");
  await expect(sidebar).toBeVisible();
  
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link")).toHaveCount(2);
  await expect(navigation.getByRole("link").nth(0)).toHaveAccessibleName("Dashboard");
  await expect(navigation.getByRole("link").nth(1)).toHaveAccessibleName("Board");
  await navigation.getByRole("link", { name: "Board", exact: true }).click();
  await expect(page.locator("#task-board-section")).toBeInViewport();
  await expect(navigation.getByRole("link", { name: "Board", exact: true })).toHaveAttribute("aria-current", "page");
});

test("Unsupported task actions and navigation destinations are not shown", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: /create task|add task|notifications/i })).toHaveCount(0);
  await expect(page.locator(".view-btn")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link")).toHaveCount(2);
});

test("Accessibility - Aria Labels", async ({ page }) => {
  await page.goto("/");
  
  // Verify filter selects have aria-labels
  const priorityFilter = page.locator("#priority-filter");
  const ariaLabel = await priorityFilter.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
});

test("App Loads and Renders Without Errors", async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  
  await page.goto("/");
  
  // Verify basic structure is loaded
  await expect(page.locator(".app-container")).toBeVisible();
  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".main-content")).toBeVisible();
  
  // Check that no critical errors occurred
  expect(errors.filter(e => !e.includes("favicon"))).toHaveLength(0);
});
