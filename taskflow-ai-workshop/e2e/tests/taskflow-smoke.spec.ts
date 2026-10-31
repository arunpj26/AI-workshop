import { expect, test, type Page } from "@playwright/test";

const sampleTasks = [
  { id: 1, title: "Deploy customer portal", description: "Ship the release candidate", status: "OPEN", priority: "HIGH" },
  { id: 2, title: "Refresh dashboard copy", description: "Update summary labels for the new release", status: "OPEN", priority: "MEDIUM" },
  { id: 3, title: "Fix mobile nav spacing", description: "Tighten the responsive layout on tablet widths", status: "IN_PROGRESS", priority: "HIGH" },
  { id: 4, title: "Archive onboarding notes", description: "Add the final handoff items", status: "COMPLETED", priority: "LOW" },
  { id: 5, title: "Review incident checklist", description: "Prepare the follow-up report", status: "ON_HOLD", priority: "MEDIUM" }
];

async function mockTasks(page: Page) {
  await page.route("**/api/tasks*", async route => {
    const priority = new URL(route.request().url()).searchParams.get("priority");
    const tasks = priority ? sampleTasks.filter(task => task.priority === priority) : sampleTasks;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(tasks)
    });
  });
}

test("UVJTaskFlow renders branding, summary cards, and kanban columns", async ({ page }) => {
  await page.route("**/api/users/current", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ name: "Ava Martin", role: "Engineering Manager", imageUrl: "https://images.example.com/ava.png" })
    });
  });

  await mockTasks(page);

  await page.goto("/");

  await expect(page.locator("body")).toContainText("UVJTaskFlow");
  await expect(page.locator('img[src="/images/uvj-logo.png"]').first()).toBeVisible();
  await expect(page.locator("#profile-name")).toHaveText("Ava Martin");
  await expect(page.locator("#welcome-title")).toHaveText("Ava Martin!");
  await expect(page.getByText("Engineering Manager")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task board" })).toBeVisible();
  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#todo-count")).toHaveText("2");
  await expect(page.locator("#progress-count")).toHaveText("1");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.getByRole("heading", { name: "To Do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On Hold" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deploy customer portal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review incident checklist" })).toBeVisible();
});

test("profile fallback and task controls stay deterministic across search/filter actions", async ({ page }) => {
  await page.route("**/api/users/current", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ name: "   ", role: "  ", imageUrl: "javascript:alert(1)" })
    });
  });

  await mockTasks(page);

  await page.goto("/");

  await expect(page.locator("#profile-name")).toHaveText("Current user");
  await expect(page.locator("#profile-avatar")).toHaveText("U");
  await expect(page.locator("#welcome-label")).toHaveText("YOUR WORKSPACE");

  await page.locator("#task-search").fill("portal");
  await expect(page.locator("#todo-column-count")).toHaveText("1");
  await expect(page.getByRole("heading", { name: "Deploy customer portal" })).toBeVisible();

  await page.locator("#priority-filter").selectOption("HIGH");
  await expect(page.locator("#priority-filter")).toHaveValue("HIGH");
  await expect(page.locator("#todo-column-count")).toHaveText("1");
  await expect(page.locator("#progress-column-count")).toHaveText("0");
  await expect(page.locator("#completed-column-count")).toHaveText("0");
  await expect(page.locator("#total-count")).toHaveText("5");

  await page.locator("#task-search").fill("");
  await expect(page.locator("#todo-column-count")).toHaveText("1");
  await expect(page.locator("#progress-column-count")).toHaveText("1");

  await page.locator("#clear-filters").click();
  await expect(page.locator("#task-search")).toHaveValue("");
  await expect(page.locator("#priority-filter")).toHaveValue("");
  await expect(page.locator("#todo-column-count")).toHaveText("2");
});

test("dashboard fits tablet and mobile viewports without horizontal overflow", async ({ page }) => {
  await page.route("**/api/users/current", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ name: "Ava Martin", role: "Engineering Manager" })
    });
  });
  await mockTasks(page);
  await page.goto("/");

  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
});
