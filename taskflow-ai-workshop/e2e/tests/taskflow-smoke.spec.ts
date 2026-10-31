import { expect, test, type Page } from "@playwright/test";

const tasks = [
  {
    id: 1,
    title: "Implement login",
    description: "Add form validation",
    status: "IN_PROGRESS",
    priority: "HIGH"
  },
  {
    id: 2,
    title: "Review mockups",
    description: "Review the UVJ board",
    status: "OPEN",
    priority: "MEDIUM"
  },
  {
    id: 3,
    title: "Ship dashboard",
    description: "Publish the finished dashboard",
    status: "COMPLETED",
    priority: "LOW"
  }
];

const configuredProfile = {
  name: "Alex Example",
  role: "Project Lead",
  imageUrl: null
};

async function mockDashboard(
  page: Page,
  profile: unknown = configuredProfile,
  taskList: unknown = tasks
) {
  await page.route("**/api/users/current", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile)
    })
  );
  await page.route("**/api/tasks", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(taskList)
    })
  );
}

test("renders UVJ branding, task-derived summaries, details, and all four columns", async ({ page }) => {
  await mockDashboard(page);
  await page.goto("/");

  await expect(page.getByText("UVJTaskFlow", { exact: true })).toBeVisible();
  const logo = page.getByRole("img", { name: "UVJ Technologies logo" });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await expect(page.getByRole("heading", { name: "Alex Example" })).toBeVisible();
  await expect(page.locator("#user-profile").getByText("Project Lead", { exact: true })).toBeVisible();
  await expect(page.locator("#profile-count")).toHaveText("AE");
  await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();

  await expect(page.locator("#summary-total")).toHaveText("3");
  await expect(page.locator("#summary-completed")).toHaveText("1");
  await expect(page.locator("#summary-in-progress")).toHaveText("1");
  await expect(page.locator("#summary-to-do")).toHaveText("1");

  const toDoColumn = page.getByRole("region", { name: "To Do" });
  await expect(toDoColumn).toBeVisible();
  await expect(toDoColumn.getByRole("heading", { name: "Review mockups" })).toBeVisible();
  await expect(toDoColumn.getByText("Review the UVJ board")).toBeVisible();
  await expect(toDoColumn.getByText("#2")).toBeVisible();
  await expect(page.getByRole("region", { name: "In Progress" }).getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Completed" }).getByRole("heading", { name: "Ship dashboard" })).toBeVisible();
  await expect(page.getByRole("region", { name: "On Hold" }).getByText("No tasks")).toBeVisible();
  await expect(page.getByText("Demo User", { exact: true })).toHaveCount(0);
});

test("uses generic profile initials for missing and unsafe profile fields", async ({ page }) => {
  await mockDashboard(page, {
    name: null,
    role: " ",
    imageUrl: "javascript:alert(1)"
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "TaskFlow User" })).toBeVisible();
  await expect(page.locator("#user-profile")).toContainText("Project Team");
  await expect(page.locator("#profile-count")).toHaveText("TU");
  await expect(page.locator(".avatar")).toHaveText("TU");
  await expect(page.locator(".avatar img")).toHaveCount(0);
  await expect(page.getByText("Demo User", { exact: true })).toHaveCount(0);
});

test("renders a valid current-user profile image", async ({ page }) => {
  await mockDashboard(page, {
    name: "Morgan Rivera",
    role: "Product Owner",
    imageUrl: "/images/UVJ%20logo.png"
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Morgan Rivera" })).toBeVisible();
  const avatar = page.locator("#user-profile .avatar img");
  await expect(avatar).toBeVisible();
  await expect.poll(() => avatar.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("falls back to initials when the configured profile image fails to load", async ({ page }) => {
  await page.route("**/avatar.png", (route) =>
    route.fulfill({ status: 404, contentType: "image/png", body: "" })
  );
  await mockDashboard(page, {
    name: "Jordan Lee",
    role: "Designer",
    imageUrl: "/avatar.png"
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Jordan Lee" })).toBeVisible();
  await expect(page.locator(".avatar")).toHaveText("JL");
  await expect(page.locator(".avatar img")).toHaveCount(0);
});

test("refreshes the profile when the current user changes", async ({ page }) => {
  let profileRequestCount = 0;
  await page.route("**/api/users/current", (route) => {
    profileRequestCount += 1;
    const profile = profileRequestCount === 1
      ? configuredProfile
      : { name: "Blair Chen", role: "Engineer", imageUrl: null };
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile)
    });
  });
  await page.route("**/api/tasks", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(tasks)
    })
  );
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Alex Example" })).toBeVisible();
  await page.getByRole("button", { name: /refresh/i }).click();
  await expect(page.getByRole("heading", { name: "Blair Chen" })).toBeVisible();
  await expect(page.locator("#user-profile").getByText("Engineer", { exact: true })).toBeVisible();
  await expect(page.locator("#profile-count")).toHaveText("BC");
});

test("searches task fields, filters by priority and status, and clears filters", async ({ page }) => {
  await mockDashboard(page);
  await page.goto("/");

  const search = page.getByRole("searchbox", {
    name: "Search tasks by title, description, ID, status, or priority"
  });
  await search.fill("validation");
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review mockups" })).toHaveCount(0);

  await search.fill("1");
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review mockups" })).toHaveCount(0);

  await search.fill("");
  await page.getByLabel("Priority:").selectOption("HIGH");
  await page.getByLabel("Status:").selectOption("In Progress");
  await expect(page.getByRole("heading", { name: "Implement login" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ship dashboard" })).toHaveCount(0);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByLabel("Priority:")).toHaveValue("ALL");
  await expect(page.getByLabel("Status:")).toHaveValue("ALL");
  await expect(page.getByRole("heading", { name: "Review mockups" })).toBeVisible();
});

test("keeps all columns visible for empty data and reports profile and task failures", async ({ page }) => {
  await page.route("**/api/users/current", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" })
  );
  await page.route("**/api/tasks", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" })
  );
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "TaskFlow User" })).toBeVisible();
  await expect(page.locator("#summary-total")).toHaveText("0");
  for (const column of ["To Do", "In Progress", "Completed", "On Hold"]) {
    await expect(page.getByRole("region", { name: column })).toBeVisible();
    await expect(page.getByRole("region", { name: column }).getByText("No tasks")).toBeVisible();
  }
  await expect(page.getByRole("status")).toContainText("Profile unavailable");
  await expect(page.getByRole("status")).toContainText("Unable to load tasks");
});

test("shows unknown task statuses without hiding task data", async ({ page }) => {
  await mockDashboard(page, configuredProfile, [
    { id: 9, title: "Future workflow task", description: "Keep visible", status: "BLOCKED", priority: "HIGH" }
  ]);
  await page.goto("/");

  const holdColumn = page.getByRole("region", { name: "On Hold" });
  await expect(holdColumn.getByRole("heading", { name: "Future workflow task" })).toBeVisible();
  await expect(holdColumn.getByText("Unsupported status: BLOCKED")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("unsupported status");
});

test("supports board navigation and responsive desktop, tablet, and mobile layouts", async ({ page }) => {
  await mockDashboard(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const board = page.locator("#board-columns");
  await expect.poll(() => board.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4);
  await page.keyboard.press("Tab");
  const focusedOutline = await page.evaluate(() =>
    getComputedStyle(document.activeElement as HTMLElement).outlineStyle
  );
  expect(focusedOutline).toBe("solid");
  await page.getByRole("link", { name: "Task Board" }).click();
  await expect(page).toHaveURL(/#task-board$/);

  for (const [width, expectedColumns] of [[900, 2], [390, 1]]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() =>
      board.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)
    ).toBe(expectedColumns);
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  }
});
