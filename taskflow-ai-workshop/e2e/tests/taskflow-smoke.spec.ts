import { test, expect } from "@playwright/test";
test("TaskFlow displays the task list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "UVJTaskFlow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "To Do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed" })).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();
});
