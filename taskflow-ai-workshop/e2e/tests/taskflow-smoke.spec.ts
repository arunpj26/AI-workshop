import { test, expect } from "@playwright/test";

test("UVJTaskFlow displays branded dashboard and seeded task counts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Demo User" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();
  await expect(page.locator(".brand-logo")).toBeVisible();
  await expect(page.locator("#profile-avatar")).toHaveText("DU");
  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.locator("#progress-count")).toHaveText("2");
  await expect(page.locator("#todo-count")).toHaveText("2");
  await expect(page.getByText("5 of 5 tasks shown")).toBeVisible();

  for (const name of ["To Do", "In Progress", "Completed", "On Hold"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
  await expect(page.getByText("Implement login", { exact: true })).toBeVisible();
  await expect(page.getByText("Fix button alignment", { exact: true })).toBeVisible();
});

test("UVJTaskFlow switches profiles and applies search and filters", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Demo profile").selectOption("demo-admin");
  await expect(page.locator("#profile-name")).toHaveText("UVJ Administrator");
  await expect(page.locator("#profile-role")).toHaveText("Administrator");
  await expect(page.locator("#profile-avatar")).toHaveText("UA");

  await page.getByRole("searchbox", { name: "Search", exact: true }).fill("login");
  await expect(page.getByText("1 of 5 tasks shown")).toBeVisible();
  await expect(page.getByText("Implement login", { exact: true })).toBeVisible();
  await expect(page.getByText("Update user profile", { exact: true })).not.toBeVisible();
  await expect(page.locator("#total-count")).toHaveText("5");

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("5 of 5 tasks shown")).toBeVisible();

  await page.getByLabel("Priority").selectOption("MEDIUM");
  await expect(page.getByText("2 of 5 tasks shown")).toBeVisible();
  await page.getByLabel("Status").selectOption("OPEN");
  await expect(page.getByText("2 of 5 tasks shown")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Search tasks").fill("no matching task");
  await expect(page.getByText("0 of 5 tasks shown")).toBeVisible();
});

test("UVJTaskFlow mobile layout has no page-level horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Demo User" })).toBeVisible();

  const hasPageOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasPageOverflow).toBe(false);
});
