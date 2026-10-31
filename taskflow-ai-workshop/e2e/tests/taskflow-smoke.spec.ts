import { test, expect } from "@playwright/test";

const tasks = [
  {
    id: 101,
    title: "Write onboarding outline",
    description: "Locate steps to get started",
    priority: "HIGH",
    status: "OPEN"
  },
  {
    id: 102,
    title: "Analyze usage dashboard",
    description: "Review daily active users",
    priority: "MEDIUM",
    status: "IN_PROGRESS"
  },
  {
    id: 103,
    title: "Publish sprint summary",
    description: "Close the sprint board",
    priority: "LOW",
    status: "COMPLETED"
  },
  {
    id: 104,
    title: "Review onboarding outline",
    description: "Validate the launch checklist",
    priority: "HIGH",
    status: "OPEN"
  }
];

async function mockDashboardApi(page, profile, taskData) {
  let taskRequestCount = 0;
  await page.route("**/api/users/current", (route) =>
    route.fulfill({ status: 200, json: profile })
  );
  await page.route("**/api/tasks", (route) => {
    taskRequestCount += 1;
    return route.fulfill({ status: 200, json: taskData });
  });
  return () => taskRequestCount;
}

async function expectTaskTotals(page) {
  await expect(page.locator("#total-tasks")).toHaveText("4");
  await expect(page.locator("#completed-tasks")).toHaveText("1");
  await expect(page.locator("#in-progress-tasks")).toHaveText("1");
  await expect(page.locator("#todo-tasks")).toHaveText("2");
}

async function expectNoOverlap(first, second, description) {
  const [firstRect, secondRect] = await Promise.all([
    first.evaluate((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    }),
    second.evaluate((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    })
  ]);
  const overlaps = firstRect.left < secondRect.right &&
    firstRect.right > secondRect.left &&
    firstRect.top < secondRect.bottom &&
    firstRect.bottom > secondRect.top;
  expect(overlaps, `${description} overlap`).toBe(false);
}

test("renders branding, configured profile, supported task lanes, and data-derived totals", async ({ page }) => {
  await mockDashboardApi(page, {
    name: "Avery Example",
    role: "Delivery lead",
    imageUrl: "/mock-avatar.svg"
  }, tasks);
  await page.route("**/mock-avatar.svg", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>'
    })
  );

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "UVJTaskFlow" })).toBeVisible();
  const logo = page.getByRole("img", { name: "UVJ Technologies logo" });
  await expect(logo).toHaveAttribute("src", "/images/uvj-logo.png");
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator("#user-name")).toHaveText("Avery Example");
  await expect(page.locator("#user-role")).toHaveText("Delivery lead");
  await expect(page.getByRole("heading", { name: "Welcome back, Avery Example" })).toBeVisible();
  await expect(page.locator("#user-avatar img")).toBeVisible();

  for (const lane of ["To Do", "In Progress", "Completed", "On Hold"]) {
    await expect(page.getByRole("heading", { name: lane })).toBeVisible();
  }
  await expect(page.locator("#count-todo")).toHaveText("2");
  await expect(page.locator("#count-in-progress")).toHaveText("1");
  await expect(page.locator("#count-completed")).toHaveText("1");
  await expect(page.locator("#count-on-hold")).toHaveText("0");
  await expect(page.locator("#tasks-on-hold")).toContainText("No tasks in this lane.");

  const todoCard = page.locator("#tasks-todo .task-card").first();
  await expect(todoCard).toContainText("Write onboarding outline");
  await expect(todoCard).toContainText("Locate steps to get started");
  await expect(todoCard).toContainText("To Do");
  await expect(todoCard).toContainText("High");
  await expect(todoCard).toContainText("#101");
  await expect(page.locator("#page-status")).toHaveText("4 tasks loaded");
  await expectTaskTotals(page);
});

test("search, filters, clear, and refresh preserve task totals without unsupported controls", async ({ page }) => {
  const getTaskRequestCount = await mockDashboardApi(page, {
    name: "Avery Example",
    role: null,
    imageUrl: null
  }, tasks);
  await page.goto("/");
  await expect(page.locator("#page-status")).toHaveText("4 tasks loaded");
  await expect(page.locator("#user-avatar")).toHaveText("AE");

  await page.getByLabel("Search tasks by title or description").fill("Analyze usage");
  await expect(page.locator("#tasks-in-progress")).toContainText("Analyze usage dashboard");
  await expect(page.locator(".task-card")).toHaveCount(1);
  await expectTaskTotals(page);

  await page.getByLabel("Search tasks by title or description").fill("daily active users");
  await expect(page.locator("#tasks-in-progress")).toContainText("Analyze usage dashboard");
  await expect(page.locator(".task-card")).toHaveCount(1);
  await expectTaskTotals(page);

  await page.getByLabel("Search tasks by title or description").fill("");
  await page.getByLabel("Priority").selectOption("HIGH");
  await expect(page.locator(".task-card")).toHaveCount(2);
  await page.locator("#status-filter").selectOption("Completed");
  await expect(page.locator("#board-message")).toHaveText("No tasks match the current search and filters.");
  await expect(page.locator(".task-card")).toHaveCount(0);
  await expectTaskTotals(page);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByLabel("Search tasks by title or description")).toHaveValue("");
  await expect(page.getByLabel("Priority")).toHaveValue("all");
  await expect(page.locator("#status-filter")).toHaveValue("all");
  await expect(page.locator(".task-card")).toHaveCount(4);
  await expectTaskTotals(page);

  await page.getByRole("button", { name: "Refresh tasks" }).click();
  await expect(page.locator("#page-status")).toHaveText("4 tasks loaded");
  expect(getTaskRequestCount()).toBe(2);
  await expectTaskTotals(page);

  const navigation = page.getByRole("navigation", { name: "Dashboard sections" });
  await expect(navigation.getByRole("link")).toHaveCount(2);
  await expect(navigation.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Task board" })).toBeVisible();
  await expect(page.getByRole("button", { name: /create task|add task|move task/i })).toHaveCount(0);
  await expect(page.getByLabel(/project|date|assignee/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /timeline|reports|milestones|team|settings|my tasks/i })).toHaveCount(0);
});

test("handles missing profile and zero tasks", async ({ page }) => {
  await mockDashboardApi(page, { name: null, role: "  ", imageUrl: null }, []);
  await page.goto("/");

  await expect(page.locator("#user-name")).toHaveText("Current user");
  await expect(page.locator("#user-role")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Welcome to UVJTaskFlow" })).toBeVisible();
  await expect(page.locator("#user-avatar")).toHaveText("UV");
  await expect(page.locator("#user-avatar")).toHaveAttribute("aria-label", "Current user profile image");
  await expect(page.locator("#page-status")).toHaveText("0 tasks loaded");
  await expect(page.locator("#board-message")).toHaveText("No tasks are available yet.");
  await expect(page.locator("body")).not.toContainText(/null|undefined|Demo User|Arun Janardhanan/i);
  await expectTaskTotalsForEmptyData(page);
});

test("keeps populated tasks readable and regions separate across desktop, tablet, and mobile", async ({ page }) => {
  await mockDashboardApi(page, {
    name: "Avery Example",
    role: "Delivery lead",
    imageUrl: null
  }, tasks);
  await page.goto("/");
  await expect(page.locator("#page-status")).toHaveText("4 tasks loaded");

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow, `horizontal overflow at ${viewport.width}px`).toBe(false);
    await expect(page.locator(".brand h1")).toHaveText("UVJTaskFlow");
    await expect(page.locator(".board-column")).toHaveCount(4);
    await expect(page.locator(".task-card")).toHaveCount(tasks.length);

    for (const lane of ["To Do", "In Progress", "Completed", "On Hold"]) {
      const column = page.locator(`[data-column="${lane}"]`);
      await expect(column).toBeVisible();
      await expect(column.getByRole("heading", { name: lane })).toBeVisible();
      const columnWidth = await column.evaluate((element) => element.getBoundingClientRect().width);
      expect(columnWidth, `${lane} column width at ${viewport.width}px`).toBeGreaterThan(0);
    }

    for (const task of tasks) {
      await expect(page.getByText(task.title, { exact: true })).toBeVisible();
      await expect(page.getByText(task.description, { exact: true })).toBeVisible();
    }

    const cardLayouts = await page.locator(".task-card").evaluateAll((cards) =>
      cards.map((card) => {
        const cardRect = card.getBoundingClientRect();
        const columnRect = card.closest(".board-column").getBoundingClientRect();
        return {
          width: cardRect.width,
          height: cardRect.height,
          withinColumn: cardRect.left >= columnRect.left && cardRect.right <= columnRect.right,
          contentFits: card.scrollWidth <= card.clientWidth
        };
      })
    );
    for (const cardLayout of cardLayouts) {
      expect(cardLayout.width, `task card width at ${viewport.width}px`).toBeGreaterThan(0);
      expect(cardLayout.height, `task card height at ${viewport.width}px`).toBeGreaterThan(0);
      expect(cardLayout.withinColumn, `task card within its column at ${viewport.width}px`).toBe(true);
      expect(cardLayout.contentFits, `task card content fits at ${viewport.width}px`).toBe(true);
    }

    await expectNoOverlap(page.locator(".search-field"), page.locator(".profile-pill"), `search and profile at ${viewport.width}px`);
    await expectNoOverlap(page.locator(".filter-group"), page.locator(".actions-group"), `filters and actions at ${viewport.width}px`);
  }
});

test("supports keyboard tab order and visible focus across dashboard controls", async ({ page }) => {
  await mockDashboardApi(page, {
    name: "Avery Example",
    role: "Delivery lead",
    imageUrl: null
  }, tasks);
  await page.goto("/");
  await expect(page.locator("#page-status")).toHaveText("4 tasks loaded");

  const tabOrder = [
    page.locator(".brand"),
    page.getByRole("link", { name: "Dashboard", exact: true }),
    page.getByRole("link", { name: "Task board" }),
    page.getByLabel("Search tasks by title or description"),
    page.getByLabel("Priority"),
    page.locator("#status-filter"),
    page.getByRole("button", { name: "Refresh tasks" }),
    page.getByRole("button", { name: "Clear filters" })
  ];

  for (const target of tabOrder) {
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
    await expect.poll(() => target.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  }
});

test("reports API failures and recovers task data after refresh", async ({ page }) => {
  let taskRequestCount = 0;
  await page.route("**/api/users/current", (route) =>
    route.fulfill({ status: 503, json: { message: "Profile unavailable" } })
  );
  await page.route("**/api/tasks", (route) => {
    taskRequestCount += 1;
    if (taskRequestCount === 1) {
      return route.fulfill({ status: 503, json: { message: "Tasks unavailable" } });
    }
    return route.fulfill({ status: 200, json: tasks });
  });

  await page.goto("/");

  await expect(page.locator("#page-status")).toHaveText(
    "Profile details are unavailable. Tasks could not be loaded. Use Refresh to try again."
  );
  await expect(page.locator("#user-name")).toHaveText("Current user");
  await expect(page.locator("#user-avatar")).toHaveText("UV");
  const refreshButton = page.getByRole("button", { name: "Refresh tasks" });
  await expect(refreshButton).toBeEnabled();

  await refreshButton.click();

  await expect(page.locator("#page-status")).toHaveText("Profile details are unavailable.");
  await expect(page.locator("#tasks-todo")).toContainText("Write onboarding outline");
  await expect(page.locator("#tasks-in-progress")).toContainText("Analyze usage dashboard");
  await expect(page.locator("#tasks-completed")).toContainText("Publish sprint summary");
  expect(taskRequestCount).toBe(2);
  await expectTaskTotals(page);
  await expect(refreshButton).toBeEnabled();
});

test("falls back to profile initials when the configured image returns 404", async ({ page }) => {
  let imageRequestCount = 0;
  await mockDashboardApi(page, {
    name: "Avery Example",
    role: "Delivery lead",
    imageUrl: "/broken-avatar.png"
  }, tasks);
  await page.route("**/broken-avatar.png", (route) => {
    imageRequestCount += 1;
    return route.fulfill({ status: 404 });
  });

  await page.goto("/");

  await expect(page.locator("#user-avatar")).toHaveText("AE");
  await expect.poll(() => imageRequestCount).toBe(1);
  await expect(page.locator("#user-avatar img")).toHaveCount(0);
  await expect(page.locator("#user-name")).toHaveText("Avery Example");
  await expect(page.locator("#user-role")).toHaveText("Delivery lead");
  await expect(page.getByRole("heading", { name: "Welcome back, Avery Example" })).toBeVisible();
});

async function expectTaskTotalsForEmptyData(page) {
  await expect(page.locator("#total-tasks")).toHaveText("0");
  await expect(page.locator("#completed-tasks")).toHaveText("0");
  await expect(page.locator("#in-progress-tasks")).toHaveText("0");
  await expect(page.locator("#todo-tasks")).toHaveText("0");
}
