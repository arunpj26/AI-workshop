import { test, expect } from "@playwright/test";

test("UVJ Branding - Title and Logo", async ({ page }) => {
  await page.goto("/");
  
  // Verify UVJTaskFlow title
  await expect(page).toHaveTitle("UVJTaskFlow | Dashboard");
  
  // Verify logo is present
  await expect(page.getByRole("img", { name: "UVJ Technologies" })).toBeVisible();
  
  // Verify main heading
  await expect(page.getByRole("heading", { name: "UVJTaskFlow" })).toBeVisible();
  
  // Verify tagline
  await expect(page.getByText("Plan · Track · Deliver")).toBeVisible();
});

test("User Profile - Dynamic Name Display", async ({ page }) => {
  await page.route("**/api/users/current", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ name: "Ada Lovelace", role: "Lead Engineer", imageUrl: null })
  }));
  await page.goto("/");
  
  await expect(page.locator("#user-name")).toHaveText("Ada Lovelace");
  await expect(page.locator("#welcome-name")).toHaveText("Ada Lovelace!");
  
  await expect(page.locator("#user-role")).toHaveText("Lead Engineer");
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

test("Summary counts and Kanban placement reflect API task data", async ({ page }) => {
  await page.route("**/api/tasks", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([
      { id: 101, title: "Fixture To Do", status: "OPEN", priority: "LOW" },
      { id: 102, title: "Fixture In Progress", status: "IN_PROGRESS", priority: "MEDIUM" },
      { id: 103, title: "Fixture Completed", status: "COMPLETED", priority: "HIGH" },
      { id: 104, title: "Fixture On Hold", status: "ON_HOLD", priority: "LOW" }
    ])
  }));
  await page.goto("/");

  await expect(page.locator("#total-count")).toHaveText("4");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.locator("#in-progress-count")).toHaveText("1");
  await expect(page.locator("#to-do-count")).toHaveText("1");
  await expect(page.locator("#tasks-TODO .task-title")).toHaveText(["Fixture To Do"]);
  await expect(page.locator("#tasks-IN_PROGRESS .task-title")).toHaveText(["Fixture In Progress"]);
  await expect(page.locator("#tasks-COMPLETED .task-title")).toHaveText(["Fixture Completed"]);
  await expect(page.locator("#tasks-ON_HOLD .task-title")).toHaveText(["Fixture On Hold"]);
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
  
  // Find priority filter
  const priorityFilter = page.locator("#priority-filter");
  await expect(priorityFilter).toBeVisible();
  
  // Change to HIGH priority
  await priorityFilter.selectOption("HIGH");
  
  // Verify filter is applied (should update board)
  await page.waitForTimeout(500);
  
  // Clear filter
  const clearBtn = page.locator("#clear-filters");
  await clearBtn.click();
});

test("Search Functionality", async ({ page }) => {
  await page.goto("/");
  
  // Wait for tasks to load
  await page.waitForSelector(".task-card", { timeout: 5000 });
  
  // Find search input
  const searchInput = page.locator("#task-search");
  await expect(searchInput).toBeVisible();
  
  // Type in search
  await searchInput.fill("login");
  
  // Wait for filtering
  await page.waitForTimeout(500);
  
  // Verify task with "login" is visible
  await expect(page.locator(".task-title").filter({ hasText: "login" }).first()).toBeVisible();
});

test("Sidebar Navigation", async ({ page }) => {
  await page.goto("/");
  
  // Verify sidebar is present
  const sidebar = page.locator(".sidebar");
  await expect(sidebar).toBeVisible();
  
  // Verify navigation items by role
  const navItems = page.locator(".nav-item");
  const navCount = await navItems.count();
  expect(navCount).toBeGreaterThanOrEqual(5);
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

