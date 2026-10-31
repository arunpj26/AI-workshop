import { test, expect } from "@playwright/test";

test("UVJTaskFlow displays the dashboard and task board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "UVJTaskFlow dashboard" })).toBeVisible();
  await expect(page.getByRole("img", { name: "UVJ Technologies" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Welcome back(?:, .+)?$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task board" })).toBeVisible();
  await expect(page.getByText("5 tasks loaded")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByText("Add login form validation")).toBeVisible();
  const loginCard = page.locator(".task-card").filter({
    has: page.getByRole("heading", { name: "Implement login" }),
  });
  await expect(loginCard.locator(".priority-badge")).toHaveText("High");

  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.locator("#progress-count")).toHaveText("2");
  await expect(page.locator("#todo-count")).toHaveText("2");

  for (const column of ["To do", "In progress", "Completed", "On hold"]) {
    await expect(page.getByRole("region", { name: column })).toBeVisible();
  }
});

test("task search and filters can be cleared", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Priority").selectOption("HIGH");
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Update user profile" })).toHaveCount(0);

  await page.getByLabel("Status").selectOption("COMPLETED");
  await expect(page.getByText("No tasks match these filters.")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("heading", { name: "Update user profile" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search tasks" }).fill("profile");
  await expect(page.getByRole("heading", { name: "Update user profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Implement login" })).toHaveCount(0);
});

test("profile name, role, and image are rendered dynamically", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    json: {
      name: "Taylor Sample",
      role: "Product Owner",
      imageUrl: "/images/UVJ%20logo.png",
    },
  }));
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Welcome back, Taylor Sample" })).toBeVisible();
  await expect(page.getByText("Product Owner", { exact: true })).toBeVisible();
  await expect(page.locator("#profile-avatar img")).toBeVisible();
});

test("a broken profile image falls back to user initials", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    json: { name: "Taylor Sample", role: "Product Owner", imageUrl: "/missing-avatar.png" },
  }));
  await page.route("**/missing-avatar.png", (route) => route.fulfill({ status: 404 }));
  await page.goto("/");

  await expect(page.locator("#profile-avatar")).toHaveText("TS");
});

test("missing profile name falls back to a generic greeting and avatar", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    json: { name: null, role: null, imageUrl: null },
  }));
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByText("User", { exact: true })).toBeVisible();
  await expect(page.locator("#profile-avatar")).toHaveText("U");
  await expect(page.getByText(/null|undefined/i)).toHaveCount(0);
});

test("task loading failures are shown to the user", async ({ page }) => {
  await page.route("**/api/tasks", (route) => route.fulfill({ status: 500 }));
  await page.goto("/");

  await expect(page.getByText("Tasks could not be loaded.")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Unable to load tasks: Request failed (500)");
});

test("dashboard remains usable without horizontal overflow at desktop, tablet, and mobile widths", async ({ page }) => {
  await page.goto("/");

  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("heading", { name: "Task board" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search tasks" })).toBeVisible();
    await expect(page.locator(".board-column")).toHaveCount(4);
    await expect.poll(() => page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )).toBe(true);
  }
});
