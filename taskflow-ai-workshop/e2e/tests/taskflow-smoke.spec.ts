import { test, expect } from "@playwright/test";

test("AIW-2 dashboard renders branding, profile, tasks, and counts", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("UVJTaskFlow");
  await expect(page.getByRole("img", { name: "UVJ Technologies logo" })).toBeVisible();
  await expect(page.getByText("Demo User!", { exact: true })).toBeVisible();
  await expect(page.getByText("Project Member", { exact: true })).toBeVisible();
  await expect(page.getByText("5 tasks loaded", { exact: true })).toBeVisible();

  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#kanban").getByText("To Do", { exact: true })).toBeVisible();
  await expect(page.locator("#kanban").getByText("In Progress", { exact: true })).toBeVisible();
  await expect(page.locator("#kanban").getByText("Completed", { exact: true })).toBeVisible();
  await expect(page.getByText("Implement login", { exact: true })).toBeVisible();
});

test("AIW-2 task filters update the board without changing the summary", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("5 tasks loaded", { exact: true })).toBeVisible();

  await page.getByLabel("Priority").selectOption("HIGH");
  await expect(page.getByText(/of 5 tasks shown/, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByText("5 tasks loaded", { exact: true })).toBeVisible();

  await page.getByLabel("Status").selectOption("COMPLETED");
  await expect(page.getByText("1 of 5 tasks shown", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear" }).click();

  await page.getByLabel("Search tasks").fill("Implement login");
  await expect(page.getByText("1 of 5 tasks shown", { exact: true })).toBeVisible();
  await expect(page.getByText("Implement login", { exact: true })).toBeVisible();
});

test("AIW-2 dashboard has no horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("5 tasks loaded", { exact: true })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
});
