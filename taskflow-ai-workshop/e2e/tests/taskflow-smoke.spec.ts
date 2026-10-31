import { expect, test, type Page } from "@playwright/test";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
};

const dashboardTasks: Task[] = [
  { id: 1, title: "Open QA task", description: "Validate the dashboard response", status: "OPEN", priority: "HIGH" },
  { id: 2, title: "Second todo", description: "Review the API checklist", status: "OPEN", priority: "LOW" },
  { id: 3, title: "In progress task", description: "Prepare the release", status: "IN_PROGRESS", priority: "MEDIUM" },
  { id: 4, title: "Done release", description: "Publish the release notes", status: "COMPLETED", priority: "HIGH" },
];

async function stubApi(page: Page, profile: object = { name: "Morgan Lee", role: "QA Lead", imageUrl: null }, tasks: Task[] = dashboardTasks) {
  await page.route("**/api/users/current", (route) => route.fulfill({ json: profile }));
  await page.route("**/api/tasks**", (route) => {
    const priority = new URL(route.request().url()).searchParams.get("priority");
    const matchingTasks = priority ? tasks.filter((task) => task.priority === priority) : tasks;
    return route.fulfill({ json: matchingTasks });
  });
}

test("renders UVJTaskFlow branding and the configured profile", async ({ page }) => {
  await stubApi(page, { name: "Morgan Lee", role: "QA Lead", imageUrl: "https://example.test/morgan.png" });
  await page.goto("/");

  await expect(page.getByText("UVJTaskFlow", { exact: true })).toBeVisible();
  const logo = page.getByRole("img", { name: "UVJ Technologies logo" });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "Morgan Lee!" })).toBeVisible();
  await expect(page.locator("#profileName")).toHaveText("Morgan Lee");
  await expect(page.locator("#profileRole")).toHaveText("QA Lead");
  await expect.poll(() => page.locator("#profileAvatar").evaluate((avatar) => (avatar as HTMLElement).style.backgroundImage))
    .toContain("morgan.png");
  await expect(page.getByText("UVJ Technologies", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/Janardhanan/);
});

test("uses initials and a generic greeting when profile fields are missing", async ({ page }) => {
  await stubApi(page, {}, []);
  await page.goto("/");

  await Promise.all([
    expect(page.locator("#profileName")).toHaveText("User"),
    expect(page.locator("#profileRole")).toHaveText("Team member"),
    expect(page.locator("#profileAvatar")).toHaveText("U"),
    expect(page.locator("#status")).toHaveText("0 tasks loaded"),
    expect(page.locator("body")).not.toContainText(/Janardhanan/),
  ]);
  await expect(page.locator("#welcomeName")).toHaveText("Welcome!");
});

test("derives task summaries and renders all board lanes and available card fields", async ({ page }) => {
  await stubApi(page);
  await page.goto("/");

  await expect(page.locator("#summaryTotal")).toHaveText("4");
  await expect(page.locator("#summaryCompleted")).toHaveText("1");
  await expect(page.locator("#summaryInProgress")).toHaveText("1");
  await expect(page.locator("#summaryTodo")).toHaveText("2");
  await expect(page.getByRole("heading", { name: "To Do 2" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On Hold 0" })).toBeVisible();

  const taskCard = page.locator(".task-card").filter({ has: page.getByRole("heading", { name: "Open QA task" }) });
  await expect(taskCard).toContainText("Validate the dashboard response");
  await expect(taskCard).toContainText("High");
  await expect(page.locator("#status")).toHaveText("4 tasks loaded");
});

test("supports global and task search, status and priority filters, and clearing filters", async ({ page }) => {
  await stubApi(page);
  await page.goto("/");

  const globalSearch = page.getByRole("searchbox", { name: "Search tasks, people, or keywords" });
  const taskSearch = page.getByRole("searchbox", { name: "Search tasks" });
  await globalSearch.fill("API");
  await expect(taskSearch).toHaveValue("API");
  await expect(page.getByRole("heading", { name: "Second todo" })).toBeVisible();

  await taskSearch.fill("release");
  await expect(globalSearch).toHaveValue("release");
  await expect(page.getByRole("heading", { name: "Done release" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Second todo" })).toHaveCount(0);

  await taskSearch.fill("");
  await page.locator("#statusFilter").selectOption("COMPLETED");
  await expect(page.getByRole("heading", { name: "Done release" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Open QA task" })).toHaveCount(0);

  await page.locator("#statusFilter").selectOption("ALL");
  const priorityResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/tasks" && url.searchParams.get("priority") === "HIGH";
  });
  await page.locator("#priorityFilter").selectOption("HIGH");
  await priorityResponse;
  await expect(page.getByRole("heading", { name: "Open QA task" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Done release" })).toBeVisible();
  await expect(page.locator("#status")).toHaveText("2 tasks loaded");

  const clearedResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/tasks" && !url.searchParams.has("priority");
  });
  await page.getByRole("button", { name: "Clear" }).click();
  await clearedResponse;
  await expect(globalSearch).toHaveValue("");
  await expect(taskSearch).toHaveValue("");
  await expect(page.locator("#statusFilter")).toHaveValue("ALL");
  await expect(page.locator("#priorityFilter")).toHaveValue("ALL");
  await expect(page.locator("#status")).toHaveText("4 tasks loaded");
});

test("recovers task loading after an API error when refreshed", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({ json: { name: "Morgan Lee" } }));
  let taskRequests = 0;
  await page.route("**/api/tasks**", (route) => {
    taskRequests += 1;
    return taskRequests === 1
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.fulfill({ json: dashboardTasks });
  });
  await page.goto("/");

  await expect(page.locator("#status")).toHaveText("Unable to load tasks: Request failed (503)");
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.locator("#status")).toHaveText("4 tasks loaded");
  await expect(page.getByRole("heading", { name: "Open QA task" })).toBeVisible();
});

test("keeps the dashboard within desktop, tablet, and mobile viewports", async ({ page }) => {
  await stubApi(page);
  await page.goto("/");

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 900, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();
    await expect(page.locator("#board")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
