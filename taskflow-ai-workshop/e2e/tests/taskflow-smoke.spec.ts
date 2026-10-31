import { test, expect } from "@playwright/test";

test("TaskFlow displays the task list and supports priority filtering", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TaskFlow" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Task" })).toBeVisible();
  await expect(page.getByText("5 tasks loaded")).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();

  await page.selectOption("#priority-filter", "HIGH");
  await page.getByRole("button", { name: "Apply filter" }).click();
  await expect(page.getByText("2 tasks loaded")).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();
  await expect(page.getByText("Improve error handling")).toBeVisible();
  await expect(page.getByText("Update user profile")).not.toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByText("5 tasks loaded")).toBeVisible();
});
