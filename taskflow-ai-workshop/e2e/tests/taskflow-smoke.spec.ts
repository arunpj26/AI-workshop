import { test, expect, type Page } from "@playwright/test";

type TestTask = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
};

type TestProfile = {
  name: string;
  role: string;
  imageUrl: string;
};

const tasks: TestTask[] = [
  { id: 1, title: "Implement login", description: "Add login form validation", status: "IN_PROGRESS", priority: "HIGH" },
  { id: 2, title: "Update user profile", description: "Allow users to edit profile details", status: "OPEN", priority: "MEDIUM" },
  { id: 3, title: "Fix button alignment", description: "Correct spacing on the task page", status: "COMPLETED", priority: "LOW" },
  { id: 4, title: "Add API documentation", description: "Document task endpoints", status: "OPEN", priority: "MEDIUM" },
  { id: 5, title: "Improve error handling", description: "Return consistent API errors", status: "IN_PROGRESS", priority: "HIGH" }
];

async function mockDashboard(page: Page, fixtureTasks: TestTask[], profile: TestProfile) {
  await page.route("**/api/tasks", (route) => route.fulfill({ json: fixtureTasks }));
  await page.route("**/api/users/current", (route) => route.fulfill({ json: profile }));
}

test("renders the branded dashboard and the profile returned by the current-user API", async ({ page }) => {
  await mockDashboard(page, tasks, { name: "Asha Iyer", role: "Project Member", imageUrl: "/avatar.svg" });
  await page.route("**/avatar.svg", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="green"/></svg>'
  }));

  await page.goto("/");

  await expect(page.getByRole("link", { name: /UVJTaskFlow/i })).toBeVisible();
  await expect(page.locator(".brand > img")).toHaveAttribute("src", "/images/uvj-logo.png");
  await expect(page.getByText("Powered by UVJ Technologies")).toBeVisible();
  await expect(page.locator("#profile-name")).toHaveText("Asha Iyer");
  await expect(page.locator("#greeting-name")).toHaveText("Asha Iyer");
  await expect(page.locator("#profile-role")).toHaveText("Project Member");
  await expect(page.locator("#profile-image")).toBeVisible();
  await expect(page.locator("#profile-initials")).toBeHidden();

  await expect(page.locator("#total-count")).toHaveText("5");
  await expect(page.locator("#todo-count")).toHaveText("2");
  await expect(page.locator("#progress-count")).toHaveText("2");
  await expect(page.locator("#completed-count")).toHaveText("1");

  await expect(page.getByRole("heading", { name: "To Do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In Progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Completed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "On Hold" })).toBeVisible();
  await expect(page.getByText("Implement login")).toBeVisible();
  await expect(page.getByText("Add login form validation")).toBeVisible();
  await expect(page.getByText("Task #1")).toBeVisible();
  await expect(page.getByText("Update user profile")).toBeVisible();
});

test("supports search, priority filtering, and clearing task filters", async ({ page }) => {
  await mockDashboard(page, tasks, { name: "Demo User", role: "Project Member", imageUrl: "" });
  await page.goto("/");

  await page.getByLabel("Search tasks").fill("login");
  await expect(page.getByText("Implement login")).toBeVisible();
  await expect(page.getByText("Update user profile")).not.toBeVisible();

  await page.getByLabel("Search tasks").fill("");
  await page.getByLabel("Priority").selectOption("HIGH");
  await expect(page.getByText("Implement login")).toBeVisible();
  await expect(page.getByText("Improve error handling")).toBeVisible();
  await expect(page.getByText("Update user profile")).not.toBeVisible();

  await page.getByLabel("Priority").selectOption("LOW");
  await expect(page.getByText("Fix button alignment")).toBeVisible();
  await expect(page.getByText("Implement login")).not.toBeVisible();

  await page.getByLabel("Priority").selectOption("ALL");
  await page.locator("#status-filter").selectOption("COMPLETED");
  await expect(page.getByText("Fix button alignment")).toBeVisible();
  await expect(page.getByText("Update user profile")).not.toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("Update user profile")).toBeVisible();
});

test("uses initials and generic text when profile fields are missing or unsafe", async ({ page }) => {
  await mockDashboard(page, [], { name: "", role: "   ", imageUrl: "javascript:alert(1)" });
  await page.goto("/");

  await expect(page.locator("#profile-name")).toHaveText("Guest");
  await expect(page.locator("#greeting-name")).toHaveText("there");
  await expect(page.locator("#profile-role")).toBeHidden();
  await expect(page.locator("#profile-image")).toBeHidden();
  await expect(page.locator("#profile-initials")).toHaveText("G");
  await expect(page.locator("#task-status")).toHaveText("No tasks yet. Use Refresh to check again.");
  await expect(page.getByText(/\b(?:null|undefined)\b/i)).toHaveCount(0);
});

test("falls back to initials when the configured profile image cannot load", async ({ page }) => {
  await mockDashboard(page, tasks, { name: "Jordan Lee", role: "", imageUrl: "/missing-avatar.png" });
  await page.route("**/missing-avatar.png", (route) => route.abort());
  await page.goto("/");

  await expect(page.locator("#profile-image")).toBeHidden();
  await expect(page.locator("#profile-initials")).toHaveText("JL");
});

test("shows visible errors when task and profile requests fail", async ({ page }) => {
  await page.route("**/api/tasks", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.route("**/api/users/current", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/");

  await expect(page.locator("#task-status")).toHaveText("Unable to load tasks: Request failed (503)");
  await expect(page.locator("#profile-notice")).toHaveText("Profile unavailable. Showing a generic profile.");
  await expect(page.locator("#profile-notice")).toBeVisible();
});

test("keeps the task board within tablet and mobile viewport widths", async ({ page }) => {
  await mockDashboard(page, tasks, { name: "Demo User", role: "", imageUrl: "" });
  await page.goto("/");

  for (const width of [768, 375]) {
    await page.setViewportSize({ width, height: 812 });
    await expect.poll(() => page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
