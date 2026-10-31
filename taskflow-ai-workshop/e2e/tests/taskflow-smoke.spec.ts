import { test, expect } from "@playwright/test";

test("UVJTaskFlow dashboard renders the branded profile and board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "UVJTaskFlow" })).toBeVisible();
  await expect(page.getByText("Demo User")).toBeVisible();
  await expect(page.getByText("Total Tasks")).toBeVisible();
  await expect(page.getByRole("heading", { name: "To Do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On Hold" })).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();
  await expect(page.getByText("5 tasks loaded")).toBeVisible();
});
