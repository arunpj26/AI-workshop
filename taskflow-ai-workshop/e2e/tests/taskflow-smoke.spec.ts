import { test, expect } from "@playwright/test";

const tasks = [
  { id: 1, title: "Plan release", description: "Prepare the release checklist", status: "OPEN", priority: "HIGH" },
  { id: 2, title: "Build dashboard", description: "Create the dashboard view", status: "IN_PROGRESS", priority: "MEDIUM" },
  { id: 3, title: "Review copy", description: "Approve the interface wording", status: "COMPLETED", priority: "LOW" },
  { id: 4, title: "Waiting on design", description: "Confirm the final asset", status: "ON_HOLD", priority: "LOW" }
];

async function mockProfile(page, profile = { name: "Ada Lovelace", role: "Lead Engineer" }) {
  await page.route("**/api/users/current", (route) => route.fulfill({ json: profile }));
}

async function mockTasks(page, response = tasks) {
  await page.route("**/api/tasks", (route) => route.fulfill({ json: response }));
}

test("renders UVJTaskFlow branding, dynamic profile, and task-driven board", async ({ page }) => {
  await mockTasks(page);
  await mockProfile(page);

  await page.goto("/");

  await expect(page).toHaveTitle("UVJTaskFlow | Work in flow");
  await expect(page.getByRole("link", { name: "UVJTaskFlow home" })).toBeVisible();
  await expect(page.getByRole("img", { name: "UVJ Technologies" })).toBeVisible();
  await expect(page.locator("footer")).toContainText("UVJ Technologies");
  await expect(page.getByRole("heading", { name: "Welcome back, Ada Lovelace." })).toBeVisible();
  await expect(page.getByText("Lead Engineer")).toBeVisible();
  await expect(page.locator(".avatar-fallback")).toHaveText("AL");
  await expect(page.getByText("Demo User")).toHaveCount(0);

  await expect(page.getByText("4 tasks loaded")).toBeVisible();
  await expect(page.locator("#total-count")).toHaveText("4");
  await expect(page.locator("#completed-count")).toHaveText("1");
  await expect(page.locator("#progress-count")).toHaveText("1");
  await expect(page.locator("#todo-count")).toHaveText("1");
  await expect(page.getByRole("heading", { name: "To do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On hold" })).toBeVisible();

  await expect(page.getByText("Plan release")).toBeVisible();
  await expect(page.getByText("Build dashboard")).toBeVisible();
  await expect(page.getByText("Review copy")).toBeVisible();
  await expect(page.getByText("Waiting on design")).toBeVisible();
  await expect(page.locator("#todo-column-count")).toHaveText("1");
  await expect(page.locator("#progress-column-count")).toHaveText("1");
  await expect(page.locator("#completed-column-count")).toHaveText("1");
  await expect(page.locator("#hold-column-count")).toHaveText("1");
});

test("uses initials fallback and presents an accessible empty state", async ({ page }) => {
  await mockTasks(page, []);
  await mockProfile(page, { name: "Grace Hopper", role: "" });

  await page.goto("/");

  await expect(page.locator(".avatar-fallback")).toHaveText("GH");
  await expect(page.getByText("Grace Hopper")).toHaveCount(2);
  await expect(page.getByText("TaskFlow member")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("No tasks found");
  await expect(page.getByText("No tasks here")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
});

test("reports task API failures and can refresh from a keyboard-operable control", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/tasks", (route) => {
    requestCount += 1;
    if (requestCount === 1) return route.fulfill({ status: 503, body: "Service unavailable" });
    return route.fulfill({ json: [tasks[0]] });
  });
  await mockProfile(page);

  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Unable to load tasks");

  const refresh = page.getByRole("button", { name: "Refresh" });
  await refresh.focus();
  await expect(refresh).toBeFocused();
  await refresh.press("Enter");

  await expect(page.getByRole("status")).toHaveText("1 tasks loaded");
  await expect(page.getByText("Plan release")).toBeVisible();
  expect(requestCount).toBe(2);
});

test("keeps the dashboard usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockTasks(page, [tasks[0]]);
  await mockProfile(page);

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Task board" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
  await expect(page.getByText("Plan release")).toBeVisible();
  await expect(page.getByRole("navigation")).toBeVisible();
});
