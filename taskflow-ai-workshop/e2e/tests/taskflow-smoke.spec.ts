import { test, expect, type Page } from "@playwright/test";

const mockTasks = [
  { id: 1, title: "Implement login", description: "Add login form validation and error messages", status: "OPEN", priority: "HIGH" },
  { id: 2, title: "Improve error handling", description: "Return consistent API errors", status: "IN_PROGRESS", priority: "HIGH" },
  { id: 3, title: "Update user profile", description: "Allow users to edit profile details", status: "COMPLETED", priority: "LOW" },
  { id: 4, title: "Fix button alignment", description: "Correct spacing on the task page", status: "IN_PROGRESS", priority: "MEDIUM" }
];

async function mockDashboardApi(page: Page, profile: Record<string, unknown>) {
  await page.route("**/api/users/current", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", json: profile });
  });
  await page.route("**/api/tasks", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", json: mockTasks });
  });
}

test("UVJTaskFlow dashboard renders profile, data-derived summary, columns, and cards", async ({ page }) => {
  await mockDashboardApi(page, { name: "Taylor Morgan", role: "Project Lead", imageUrl: "" });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "UVJTaskFlow" })).toBeVisible();
  await expect(page.getByRole("img", { name: "UVJ Technologies logo" })).toBeVisible();
  await expect(page.getByText("Welcome back,")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Taylor Morgan" })).toBeVisible();
  await expect(page.getByText("Project Lead")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();

  const summary = page.getByLabel("Task summary");
  await expect(summary.getByText("Total Tasks").locator("..").getByText("4", { exact: true })).toBeVisible();
  await expect(summary.getByText("Completed").locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(summary.getByText("In Progress").locator("..").getByText("2", { exact: true })).toBeVisible();
  await expect(summary.getByText("To Do").locator("..").getByText("1", { exact: true })).toBeVisible();

  const board = page.locator("#board-grid");
  const columns = [
    { status: "OPEN", heading: "To Do", count: 1, title: "Implement login" },
    { status: "IN_PROGRESS", heading: "In Progress", count: 2, title: "Improve error handling" },
    { status: "COMPLETED", heading: "Completed", count: 1, title: "Update user profile" },
    { status: "ON_HOLD", heading: "On Hold", count: 0, title: null }
  ];

  for (const columnData of columns) {
    const column = board.locator(`[data-status="${columnData.status}"]`);
    await expect(column.getByRole("heading", { name: columnData.heading })).toBeVisible();
    await expect(column.getByRole("article")).toHaveCount(columnData.count);
    if (columnData.title) {
      await expect(column.getByRole("heading", { name: columnData.title })).toBeVisible();
    }
  }

  const loginCard = board.locator('[data-status="OPEN"]').getByRole("article");
  await expect(loginCard.getByText("HIGH")).toBeVisible();
  await expect(loginCard.getByText("Add login form validation and error messages")).toBeVisible();
  await expect(board.getByRole("heading", { name: "Fix button alignment" })).toBeVisible();
});

test("profile image is shown when the current profile provides one", async ({ page }) => {
  await mockDashboardApi(page, { name: "Taylor Morgan", role: "Project Lead", imageUrl: "/profile/taylor.svg" });
  await page.route("**/profile/taylor.svg", async route => {
    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="green"/></svg>'
    });
  });
  await page.goto("/");

  const avatar = page.getByLabel("Taylor Morgan profile image");
  await expect(avatar.locator("img")).toBeVisible();
});

test("profile without an image falls back to the current user's initials", async ({ page }) => {
  await mockDashboardApi(page, { name: "Jordan Lee", role: "Designer", imageUrl: null });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Jordan Lee" })).toBeVisible();
  await expect(page.getByLabel("Jordan Lee initials")).toHaveText("JL");
});

test("missing profile values use generic details and never render null or undefined", async ({ page }) => {
  await mockDashboardApi(page, { name: null, role: null, imageUrl: null });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "User", exact: true })).toBeVisible();
  await expect(page.getByText("Team Member", { exact: true })).toBeVisible();
  await expect(page.getByLabel("User initials")).toHaveText("US");
  const renderedText = await page.locator("body").innerText();
  expect(renderedText).not.toMatch(/\b(null|undefined)\b/i);
  expect(renderedText).not.toContain("Taylor Morgan");
  expect(renderedText).not.toContain("Jordan Lee");
});

test("search, priority and status filters work and Clear filters restores current tasks", async ({ page }) => {
  await mockDashboardApi(page, { name: "Taylor Morgan", role: "Project Lead", imageUrl: "" });
  await page.goto("/");

  const board = page.locator("#board-grid");
  const search = page.getByRole("searchbox", { name: "Search tasks" });
  await expect(board.getByRole("article")).toHaveCount(4);

  await search.fill("consistent API errors");
  await expect(board.getByRole("article")).toHaveCount(1);
  await expect(board.getByRole("heading", { name: "Improve error handling" })).toBeVisible();
  await expect(board.getByRole("heading", { name: "Implement login" })).toHaveCount(0);

  await search.fill("no matching task");
  await expect(board.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("No tasks match");

  await search.fill("");
  await page.getByLabel("Priority filter").selectOption("HIGH");
  await page.getByLabel("Status filter").selectOption("IN_PROGRESS");
  await expect(board.getByRole("article")).toHaveCount(1);
  await expect(board.getByRole("heading", { name: "Improve error handling" })).toBeVisible();

  await search.fill("no matching task");
  await expect(board.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();

  await expect(search).toHaveValue("");
  await expect(page.getByLabel("Priority filter")).toHaveValue("ALL");
  await expect(page.getByLabel("Status filter")).toHaveValue("ALL");
  await expect(board.getByRole("article")).toHaveCount(4);
  await expect(board.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(board.getByRole("heading", { name: "Improve error handling" })).toBeVisible();
  await expect(board.getByRole("heading", { name: "Update user profile" })).toBeVisible();
  await expect(board.getByRole("heading", { name: "Fix button alignment" })).toBeVisible();
});


test("task load failures stay visible until a refresh succeeds", async ({ page }) => {
  await page.route("**/api/users/current", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", json: { name: "Taylor Morgan" } });
  });
  let taskRequests = 0;
  await page.route("**/api/tasks", async route => {
    taskRequests += 1;
    if (taskRequests === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", json: { error: "Service unavailable" } });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", json: mockTasks });
  });
  await page.goto("/");

  const taskStatus = page.getByRole("status");
  await expect(taskStatus).toContainText("Unable to load tasks");
  await page.getByRole("searchbox", { name: "Search tasks" }).fill("login");
  await page.getByLabel("Priority filter").selectOption("HIGH");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(taskStatus).toContainText("Unable to load tasks");

  await page.getByRole("button", { name: "Refresh tasks" }).click();
  await expect(page.locator("#board-grid").getByRole("article")).toHaveCount(4);
  await expect(taskStatus).toBeEmpty();
});
