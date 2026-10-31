import { test, expect } from "@playwright/test";
test("UVJTaskFlow displays the seeded tasks on the board", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("UVJTaskFlow");
  await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("6 tasks loaded");
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
});
