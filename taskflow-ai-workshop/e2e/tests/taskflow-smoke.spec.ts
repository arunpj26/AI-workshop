import { test, expect, type Page } from "@playwright/test";

type ApiTask = { title: string; status: string; priority: string };

const lane = (page: Page, name: string) => page.getByRole("region", { name, exact: true });

test("UVJTaskFlow dashboard loads the profile and tasks from the running API", async ({ page, request }) => {
  const profile = await (await request.get("/api/users/current")).json();
  const tasks: ApiTask[] = await (await request.get("/api/tasks")).json();
  const count = (status: string) => String(tasks.filter((task) => task.status === status).length);

  await page.goto("/");
  await expect(page.getByRole("img", { name: "UVJ Technologies logo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task Board", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Welcome back, ${profile.name}!`);
  await expect(page.locator("#task-status")).toHaveText(`${tasks.length} tasks loaded`);
  await expect(page.locator("#count-total")).toHaveText(String(tasks.length));
  await expect(page.locator("#count-completed")).toHaveText(count("COMPLETED"));
  await expect(page.locator("#count-progress")).toHaveText(count("IN_PROGRESS"));
  await expect(page.locator("#count-todo")).toHaveText(count("OPEN"));
  await expect(page.locator("#task-board").getByRole("heading", { level: 3 }))
    .toHaveText(["To Do", "In Progress", "Completed", "On Hold"]);
  await expect(lane(page, "In Progress").getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(lane(page, "To Do").getByRole("heading", { name: "Update user profile" })).toBeVisible();
  await expect(lane(page, "Completed").getByRole("heading", { name: "Fix button alignment" })).toBeVisible();
  await expect(lane(page, "On Hold").getByRole("heading", { name: "Migrate reporting exports" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/\bnull\b|\bundefined\b|Arun Janardhanan/);
});

test("a task created from a lane is stored by the running API", async ({ page, request }) => {
  const title = `E2E validation task ${Date.now()}`;
  await page.goto("/");
  await page.getByRole("button", { name: "Add task to Completed", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create Task" });
  await expect(dialog.getByLabel("Status")).toHaveValue("COMPLETED");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Priority").selectOption("LOW");
  await dialog.getByRole("button", { name: "Create Task" }).click();
  await expect(dialog).toBeHidden();
  await expect(lane(page, "Completed").getByRole("heading", { name: title })).toBeVisible();

  const tasks: ApiTask[] = await (await request.get("/api/tasks")).json();
  expect(tasks).toContainEqual(expect.objectContaining({ title, status: "COMPLETED", priority: "LOW" }));
  await page.reload();
  await expect(lane(page, "Completed").getByRole("heading", { name: title })).toBeVisible();
});
