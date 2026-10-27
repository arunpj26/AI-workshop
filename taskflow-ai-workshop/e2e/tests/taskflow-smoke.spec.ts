import { test, expect } from "@playwright/test";
test("TaskFlow displays the task list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TaskFlow" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Task" })).toBeVisible();
  await expect(page.getByText("5 tasks loaded")).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();
});
