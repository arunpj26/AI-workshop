import { test, expect, type Locator, type Page } from "@playwright/test";

type Json = Record<string, unknown>;

const jordan: Json = { name: "Jordan Rivera", role: "Project lead", imageUrl: null };

// Board order: To Do (1, 5), In Progress (2), Completed (3), On Hold (4).
const boardTasks: Json[] = [
  { id: 1, title: "Prepare release", description: "Review release checklist", status: "OPEN", priority: "HIGH",
    key: "TF-1", assignees: ["Priya Nair", "Daniel Moss"], estimateHours: 8, subtaskCount: 3, commentCount: 4,
    project: "TaskFlow Web", dueDate: "2026-10-28" },
  { id: 2, title: "Review dashboard", description: "Check the task board", status: "IN_PROGRESS", priority: "MEDIUM",
    key: "TF-2", assignees: ["Sara Khan"], estimateHours: 5, subtaskCount: 2, commentCount: 1,
    project: "TaskFlow API", dueDate: "2026-10-30" },
  { id: 3, title: "Update guidance", description: "Publish the final notes", status: "COMPLETED", priority: "LOW",
    key: "TF-3", assignees: ["Leo Fernandes"], estimateHours: 2, subtaskCount: 0, commentCount: 2,
    project: "TaskFlow Web", dueDate: "2026-11-05" },
  { id: 4, title: "Confirm rollout", description: "Wait for approval", status: "ON_HOLD", priority: "MEDIUM",
    key: "TF-4", assignees: ["Sara Khan", "Leo Fernandes"], estimateHours: 3, subtaskCount: 1, commentCount: 0,
    project: "TaskFlow API", dueDate: "2026-11-01" },
  { id: 5, title: "Draft onboarding", status: "OPEN", priority: "LOW" }
];
const allTitles = ["Prepare release", "Draft onboarding", "Review dashboard", "Update guidance", "Confirm rollout"];

async function mockApi(page: Page, { user = jordan as unknown, tasks = boardTasks as unknown } = {}) {
  await page.route("**/api/users/current", (route) => route.fulfill({ json: user }));
  await page.route("**/api/tasks", (route) => route.fulfill({ json: tasks }));
}

async function mockCreatableApi(page: Page) {
  const tasks = [...boardTasks];
  const posted: Json[] = [];
  await page.route("**/api/users/current", (route) => route.fulfill({ json: jordan }));
  await page.route("**/api/tasks", async (route) => {
    if (route.request().method() !== "POST") return route.fulfill({ json: tasks });
    const body = route.request().postDataJSON() as Json;
    posted.push(body);
    const id = tasks.length + 1;
    const created = { id, key: `TF-${id}`, assignees: [], subtaskCount: 0, commentCount: 0, ...body };
    tasks.push(created);
    return route.fulfill({ status: 201, json: created });
  });
  return posted;
}

const lane = (page: Page, name: string) => page.getByRole("region", { name, exact: true });
const card = (page: Page, title: string) =>
  page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
const boardTitles = (page: Page) => page.locator("#task-board").getByRole("heading", { level: 4 });
const createDialog = (page: Page) => page.getByRole("dialog", { name: "Create Task" });
const boardSearch = (page: Page) => page.getByPlaceholder("Search tasks...", { exact: true });
const dashboardLink = (page: Page) => page.getByRole("link", { name: "Dashboard", exact: true });

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  expect(result).not.toBeNull();
  return result!;
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test.describe("AC 1, 2, 15: branded layout follows the design reference", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("sidebar, top bar, hero, board header, toolbar, lanes, and cards render in design order", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");

    const sidebar = page.getByRole("complementary", { name: "Workspace navigation" });
    await expect(sidebar.getByRole("img", { name: "UVJ Technologies logo" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "UVJTaskFlow dashboard" })).toContainText("UVJTaskFlow");
    await expect(sidebar.getByText("Plan · Track · Deliver")).toBeVisible();
    await expect(sidebar.getByText("Powered by UVJ Technologies")).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.locator(".nav-link")).toHaveText([
      "Dashboard", "Tasks", "My Tasks (coming soon)", "Board", "Timeline (coming soon)",
      "Reports (coming soon)", "Milestones (coming soon)", "Team (coming soon)", "Settings (coming soon)"
    ]);
    await expect(dashboardLink(page)).toHaveAttribute("aria-current", "page");

    await expect(page.getByLabel("Search tasks, people, or keywords"))
      .toHaveAttribute("placeholder", "Search tasks, people, or keywords...");
    await expect(page.getByRole("button", { name: "Notifications (coming soon)" })).toBeVisible();
    await expect(page.locator(".notification-badge")).toBeHidden();
    const profile = page.getByRole("group", { name: "Current user profile" });
    await expect(profile).toContainText("Jordan Rivera");
    await expect(profile).toContainText("Project lead");
    await expect(page.getByRole("button", { name: "Profile menu (coming soon)" })).toBeVisible();

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Jordan Rivera!");
    await expect(page.getByText("Your work, clearly in flow.")).toBeVisible();
    await expect(page.getByRole("list", { name: "Task summary" }).getByRole("listitem"))
      .toContainText(["Total Tasks", "Completed", "In Progress", "To Do"]);

    await expect(page.getByRole("heading", { name: "Task Board", exact: true })).toBeVisible();
    await expect(page.getByText("Manage and track your work across different stages")).toBeVisible();
    await expect(page.getByLabel("Filter by project").locator("option:checked")).toHaveText("All Projects");
    const dateRange = page.getByRole("group", { name: "Due date range" });
    await expect(dateRange.getByLabel("Due from")).toBeVisible();
    await expect(dateRange.getByLabel("Due to")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Task" })).toBeEnabled();

    const tabs = page.getByRole("group", { name: "Board views" }).getByRole("button");
    await expect(tabs).toHaveText(["Board", "List (coming soon)", "Calendar (coming soon)", "Analytics (coming soon)"]);
    await expect(tabs.first()).toHaveAttribute("aria-pressed", "true");
    await expect(boardSearch(page)).toHaveAttribute("placeholder", "Search tasks...");
    for (const [label, text] of [["Filter by priority", "Priority: All"], ["Filter by status", "Status: All"], ["Filter by assignee", "Assignee: All"]]) {
      await expect(page.getByLabel(label).locator("option:checked")).toHaveText(text);
    }
    await expect(page.getByRole("button", { name: "Clear filters" })).toHaveText("Clear");

    await expect(page.locator("#task-board").getByRole("heading", { level: 3 }))
      .toHaveText(["To Do", "In Progress", "Completed", "On Hold"]);
    for (const name of ["To Do", "In Progress", "Completed", "On Hold"]) {
      await expect(page.getByRole("button", { name: `Add task to ${name}`, exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: `More actions for ${name} (coming soon)` })).toBeVisible();
      await expect(page.getByRole("button", { name: `Add Task to ${name}`, exact: true })).toBeVisible();
    }

    const prepare = card(page, "Prepare release");
    await expect(prepare.locator(".priority-badge")).toHaveText("High");
    await expect(prepare.locator(".priority-badge")).toHaveClass(/priority-high/);
    await expect(prepare.getByText("Review release checklist")).toBeVisible();
    await expect(prepare.locator(".task-key")).toHaveText("Task key: TF-1");
    await expect(prepare.getByRole("img", { name: "Assignees: Priya Nair, Daniel Moss" })).toHaveText("PNDM");
    await expect(prepare.locator(".task-stat")).toHaveText(["Estimate: 8h", "Subtasks: 3", "Comments: 4"]);
    await expect(card(page, "Review dashboard").locator(".priority-badge")).toHaveClass(/priority-medium/);
    await expect(card(page, "Update guidance").locator(".priority-badge")).toHaveClass(/priority-low/);
  });

  test("elements without a backing feature are disabled and do nothing", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(boardTitles(page)).toHaveText(allTitles);

    const disabled = page.locator("[aria-disabled='true']");
    await expect(disabled).toHaveCount(15);
    for (const element of await disabled.all()) {
      await expect(element).toBeDisabled();
      await expect(element).toHaveAttribute("title", "Coming soon");
      await element.click({ force: true });
    }
    await expect(page).toHaveURL(/\/$/);
    await expect(createDialog(page)).toBeHidden();
    await expect(boardTitles(page)).toHaveText(allTitles);
  });
});

test.describe("AC 3-7: current user profile is dynamic with safe fallbacks", () => {
  test("shows the profile image when one is returned", async ({ page }) => {
    await page.route("https://profile.test/avatar.svg", (route) => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="green"/></svg>'
    }));
    await mockApi(page, { user: { name: "Casey Morgan", role: "Designer", imageUrl: "https://profile.test/avatar.svg" } });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Casey Morgan!");
    await expect(page.locator("#profile-name")).toHaveText("Casey Morgan");
    await expect(page.locator("#profile-role")).toHaveText("Designer");
    await expect(page.locator("#profile-avatar img")).toHaveAttribute("src", "https://profile.test/avatar.svg");
    await expect(page.locator("#profile-avatar img")).toBeVisible();
  });

  test("shows initials when the image is absent", async ({ page }) => {
    await mockApi(page, { user: { name: "Jordan Rivera", role: "Project lead", imageUrl: "" } });
    await page.goto("/");
    await expect(page.locator("#profile-avatar")).toHaveText("JR");
    await expect(page.locator("#profile-avatar img")).toHaveCount(0);
  });

  test("falls back to initials when the image fails to load", async ({ page }) => {
    await page.route("https://profile.test/missing.png", (route) => route.fulfill({ status: 404 }));
    await mockApi(page, { user: { name: "Jordan Rivera", role: "Project lead", imageUrl: "https://profile.test/missing.png" } });
    await page.goto("/");
    await expect(page.locator("#profile-avatar")).toHaveText("JR");
    await expect(page.locator("#profile-avatar img")).toHaveCount(0);
  });

  test("does not render an unsafe image URL", async ({ page }) => {
    await mockApi(page, { user: { name: "Jordan Rivera", role: "Project lead", imageUrl: "javascript:alert(1)" } });
    await page.goto("/");
    await expect(page.locator("#profile-avatar")).toHaveText("JR");
    await expect(page.locator("#profile-avatar img")).toHaveCount(0);
  });

  for (const [label, user] of [
    ["null fields", { name: null, role: null, imageUrl: null }],
    ["blank fields", { name: "   ", role: " ", imageUrl: " " }],
    ["an empty object", {}]
  ] as const) {
    test(`missing profile data (${label}) uses a generic greeting without placeholder text`, async ({ page }) => {
      await mockApi(page, { user, tasks: [] });
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back!");
      await expect(page.locator("#profile-name")).toHaveText("Profile unavailable");
      await expect(page.locator("#profile-role")).toHaveText("");
      await expect(page.locator("#profile-avatar svg")).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText(/\bnull\b|\bundefined\b|Arun Janardhanan/);
    });
  }

  test("a failed profile request shows a fallback and still loads tasks", async ({ page }) => {
    await page.route("**/api/users/current", (route) => route.fulfill({ status: 500, json: { error: "boom" } }));
    await page.route("**/api/tasks", (route) => route.fulfill({ json: boardTasks }));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back!");
    await expect(page.locator("#profile-name")).toHaveText("Profile unavailable");
    await expect(page.locator("#profile-status")).toHaveText("Profile could not be loaded");
    await expect(boardTitles(page)).toHaveText(allTitles);
    await expect(page.locator("body")).not.toContainText(/\bnull\b|\bundefined\b|Arun Janardhanan/);
  });

  test("a different current user is shown after the profile source changes", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Jordan Rivera!");

    await page.unroute("**/api/users/current");
    await page.route("**/api/users/current", (route) => route.fulfill({ json: { name: "Casey Morgan", role: "Designer" } }));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Casey Morgan!");
    await expect(page.locator("#profile-avatar")).toHaveText("CM");
    await expect(page.locator("body")).not.toContainText("Jordan Rivera");
  });
});

test.describe("AC 8-10: summary counts, lanes, and card details come from task data", () => {
  test("counts and lane placement reflect the returned tasks", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");

    await expect(page.locator("#count-total")).toHaveText("5");
    await expect(page.locator("#count-completed")).toHaveText("1");
    await expect(page.locator("#count-progress")).toHaveText("1");
    await expect(page.locator("#count-todo")).toHaveText("2");
    const expected: [string, string[]][] = [
      ["To Do", ["Prepare release", "Draft onboarding"]],
      ["In Progress", ["Review dashboard"]],
      ["Completed", ["Update guidance"]],
      ["On Hold", ["Confirm rollout"]]
    ];
    for (const [name, titles] of expected) {
      await expect(lane(page, name).getByRole("heading", { level: 4 })).toHaveText(titles);
      await expect(lane(page, name).locator(".lane-count")).toHaveText(`${titles.length} ${titles.length === 1 ? "task" : "tasks"}`);
    }
    await expect(lane(page, "Other")).toHaveCount(0);
  });

  test("optional fields that are absent are hidden instead of showing placeholders", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    const minimal = card(page, "Draft onboarding");
    await expect(minimal.locator(".priority-badge")).toHaveText("Low");
    await expect(minimal.locator(".task-description, .task-key, .assignees, .task-stat")).toHaveCount(0);
    await expect(minimal).not.toContainText(/\bnull\b|\bundefined\b|NaN|0h/);
  });

  test("a zero estimate is hidden while zero counts are shown", async ({ page }) => {
    await mockApi(page, { tasks: [{ id: 9, title: "Zero work", status: "OPEN", priority: "LOW", estimateHours: 0, subtaskCount: 0, commentCount: 0 }] });
    await page.goto("/");
    await expect(card(page, "Zero work").locator(".task-stat")).toHaveText(["Subtasks: 0", "Comments: 0"]);
  });

  test("unknown statuses are shown in an Other lane and excluded from status counts", async ({ page }) => {
    await mockApi(page, { tasks: [...boardTasks, { id: 6, title: "Investigate import", status: "BLOCKED", priority: "MEDIUM" }] });
    await page.goto("/");
    await expect(page.locator("#count-total")).toHaveText("6");
    await expect(page.locator("#count-todo")).toHaveText("2");
    await expect(lane(page, "Other").getByRole("heading", { level: 4 })).toHaveText(["Investigate import"]);
    await expect(lane(page, "Other").getByRole("button")).toHaveCount(0);

    await page.getByLabel("Filter by status").selectOption("OTHER");
    await expect(boardTitles(page)).toHaveText(["Investigate import"]);
  });

  test("an empty task list shows empty lanes and zero counts", async ({ page }) => {
    await mockApi(page, { tasks: [] });
    await page.goto("/");
    await expect(page.locator("#task-status")).toHaveText("0 tasks loaded");
    for (const id of ["#count-total", "#count-completed", "#count-progress", "#count-todo"]) {
      await expect(page.locator(id)).toHaveText("0");
    }
    await expect(page.getByText("No tasks here")).toHaveCount(4);
  });

  test("a failed task request shows an error with a working retry", async ({ page }) => {
    let fail = true;
    await page.route("**/api/users/current", (route) => route.fulfill({ json: jordan }));
    await page.route("**/api/tasks", (route) => (fail ? route.fulfill({ status: 500, json: {} }) : route.fulfill({ json: boardTasks })));
    await page.goto("/");

    await expect(page.locator("#task-status")).toHaveText("Unable to load tasks. Request failed (500)");
    await expect(page.locator("#count-total")).toHaveText("0");
    fail = false;
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(boardTitles(page)).toHaveText(allTitles);
    await expect(page.getByRole("button", { name: "Retry" })).toBeHidden();
  });

  test("a non-list task response is reported as an error", async ({ page }) => {
    await mockApi(page, { tasks: { tasks: [] } });
    await page.goto("/");
    await expect(page.locator("#task-status")).toHaveText("Unable to load tasks. The task response was not a list.");
  });
});

test.describe("AC 11: search, filters, and task actions", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(boardTitles(page)).toHaveText(allTitles);
  });

  test("board search matches title, key, and assignee case-insensitively", async ({ page }) => {
    await boardSearch(page).fill("RELEASE");
    await expect(boardTitles(page)).toHaveText(["Prepare release"]);
    await boardSearch(page).fill("tf-2");
    await expect(boardTitles(page)).toHaveText(["Review dashboard"]);
    await boardSearch(page).fill("leo");
    await expect(boardTitles(page)).toHaveText(["Update guidance", "Confirm rollout"]);
  });

  test("global search filters the same board and combines with board search", async ({ page }) => {
    await page.getByLabel("Search tasks, people, or keywords").fill("Sara");
    await expect(boardTitles(page)).toHaveText(["Review dashboard", "Confirm rollout"]);
    await boardSearch(page).fill("rollout");
    await expect(boardTitles(page)).toHaveText(["Confirm rollout"]);
  });

  test("priority, status, assignee, and project filters narrow the board", async ({ page }) => {
    await page.getByLabel("Filter by priority").selectOption("MEDIUM");
    await expect(boardTitles(page)).toHaveText(["Review dashboard", "Confirm rollout"]);
    await page.getByLabel("Filter by status").selectOption("ON_HOLD");
    await expect(boardTitles(page)).toHaveText(["Confirm rollout"]);
    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByLabel("Filter by assignee").locator("option")).toHaveText([
      "Assignee: All", "Assignee: Daniel Moss", "Assignee: Leo Fernandes", "Assignee: Priya Nair", "Assignee: Sara Khan"
    ]);
    await page.getByLabel("Filter by assignee").selectOption("Leo Fernandes");
    await expect(boardTitles(page)).toHaveText(["Update guidance", "Confirm rollout"]);
    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByLabel("Filter by project").locator("option")).toHaveText(["All Projects", "TaskFlow API", "TaskFlow Web"]);
    await page.getByLabel("Filter by project").selectOption("TaskFlow API");
    await expect(boardTitles(page)).toHaveText(["Review dashboard", "Confirm rollout"]);
    await expect(lane(page, "To Do").getByText("No tasks here")).toBeVisible();
  });

  test("due date range is inclusive and excludes tasks without a due date", async ({ page }) => {
    await page.getByLabel("Due from").fill("2026-10-29");
    await page.getByLabel("Due to").fill("2026-10-31");
    await expect(boardTitles(page)).toHaveText(["Review dashboard"]);
    await page.getByLabel("Due from").fill("2026-11-01");
    await page.getByLabel("Due to").fill("2026-11-01");
    await expect(boardTitles(page)).toHaveText(["Confirm rollout"]);
    await page.getByLabel("Due to").fill("");
    await expect(boardTitles(page)).toHaveText(["Update guidance", "Confirm rollout"]);
  });

  test("no matches shows a message and Clear resets every filter", async ({ page }) => {
    await page.getByLabel("Search tasks, people, or keywords").fill("release");
    await boardSearch(page).fill("release");
    await page.getByLabel("Filter by priority").selectOption("HIGH");
    await page.getByLabel("Filter by status").selectOption("OPEN");
    await page.getByLabel("Filter by assignee").selectOption("Priya Nair");
    await page.getByLabel("Filter by project").selectOption("TaskFlow Web");
    await page.getByLabel("Due from").fill("2026-10-28");
    await expect(boardTitles(page)).toHaveText(["Prepare release"]);
    await boardSearch(page).fill("no such task");
    await expect(page.getByText("No tasks match these filters.")).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(boardTitles(page)).toHaveText(allTitles);
    for (const label of ["Search tasks, people, or keywords", "Filter by priority", "Filter by status", "Filter by assignee", "Filter by project", "Due from", "Due to"]) {
      await expect(page.getByLabel(label)).toHaveValue("");
    }
    await expect(boardSearch(page)).toHaveValue("");
    await expect(boardSearch(page)).toBeFocused();
    await expect(page.getByText("No tasks match these filters.")).toHaveCount(0);
  });
});

test.describe("AC 11: create task", () => {
  test("Create Task sends the entered fields and adds the card and counts", async ({ page }) => {
    const posted = await mockCreatableApi(page);
    await page.goto("/");
    await expect(boardTitles(page)).toHaveText(allTitles);

    const opener = page.getByRole("button", { name: "Create Task" });
    await opener.click();
    const dialog = createDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Title")).toBeFocused();
    await expect(dialog.getByLabel("Status")).toHaveValue("OPEN");
    await expect(dialog.getByLabel("Priority")).toHaveValue("MEDIUM");

    await dialog.getByLabel("Title").fill("  Write release notes  ");
    await dialog.getByLabel("Description").fill("Summarise the sprint");
    await dialog.getByLabel("Priority").selectOption("LOW");
    await dialog.getByLabel("Assignees").fill("Sara Khan, , Sara Khan, Leo Fernandes");
    await dialog.getByLabel("Estimate (hours)").fill("3");
    await dialog.getByLabel("Due date").fill("2026-11-03");
    await dialog.getByLabel("Project").fill("TaskFlow Web");
    await dialog.getByRole("button", { name: "Create Task" }).click();

    await expect(dialog).toBeHidden();
    expect(posted).toEqual([{
      title: "Write release notes", status: "OPEN", priority: "LOW", description: "Summarise the sprint",
      assignees: ["Sara Khan", "Leo Fernandes"], estimateHours: 3, project: "TaskFlow Web", dueDate: "2026-11-03"
    }]);
    await expect(lane(page, "To Do").getByRole("heading", { level: 4 }))
      .toHaveText(["Prepare release", "Draft onboarding", "Write release notes"]);
    await expect(card(page, "Write release notes").locator(".task-key")).toHaveText("Task key: TF-6");
    await expect(page.locator("#count-total")).toHaveText("6");
    await expect(page.locator("#count-todo")).toHaveText("3");
    await expect(page.locator("#task-status")).toHaveText("Task created. 6 tasks loaded");
    await expect(opener).toBeFocused();
  });

  for (const [button, status, laneName] of [
    ["Add task to In Progress", "IN_PROGRESS", "In Progress"],
    ["Add Task to On Hold", "ON_HOLD", "On Hold"]
  ]) {
    test(`"${button}" pre-selects ${status} and sends only required fields`, async ({ page }) => {
      const posted = await mockCreatableApi(page);
      await page.goto("/");
      await page.getByRole("button", { name: button, exact: true }).click();
      const dialog = createDialog(page);
      await expect(dialog.getByLabel("Status")).toHaveValue(status);
      await dialog.getByLabel("Title").fill("Lane task");
      await dialog.getByLabel("Title").press("Enter");

      await expect(dialog).toBeHidden();
      expect(posted).toEqual([{ title: "Lane task", status, priority: "MEDIUM" }]);
      await expect(lane(page, laneName).getByRole("heading", { name: "Lane task" })).toBeVisible();
    });
  }

  test("client validation blocks blank titles and invalid estimates", async ({ page }) => {
    const posted = await mockCreatableApi(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Create Task" }).click();
    const dialog = createDialog(page);
    const submit = dialog.getByRole("button", { name: "Create Task" });

    await dialog.getByLabel("Title").fill("   ");
    await submit.click();
    await expect(dialog.getByText("Enter a task title.")).toBeVisible();
    await expect(dialog.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");
    await expect(dialog.getByLabel("Title")).toBeFocused();

    await dialog.getByLabel("Title").fill("Valid title");
    for (const estimate of ["-1", "1.5"]) {
      await dialog.getByLabel("Estimate (hours)").fill(estimate);
      await submit.click();
      await expect(dialog.getByText("Enter whole hours of 0 or more.")).toBeVisible();
      await expect(dialog.getByText("Enter a task title.")).toBeHidden();
      await expect(dialog.getByLabel("Estimate (hours)")).toBeFocused();
    }
    expect(posted).toEqual([]);
    await expect(dialog).toBeVisible();
  });

  test("server validation errors are shown and the dialog stays open", async ({ page }) => {
    await page.route("**/api/users/current", (route) => route.fulfill({ json: jordan }));
    await page.route("**/api/tasks", (route) => (route.request().method() === "POST"
      ? route.fulfill({ status: 400, json: { status: 400, detail: "Task request is invalid.", errors: { title: "Title is required." } } })
      : route.fulfill({ json: boardTasks })));
    await page.goto("/");
    await page.getByRole("button", { name: "Create Task" }).click();
    const dialog = createDialog(page);
    await dialog.getByLabel("Title").fill("Rejected task");
    await dialog.getByRole("button", { name: "Create Task" }).click();

    await expect(dialog.getByRole("alert")).toHaveText("Unable to create task. Task request is invalid. (400)");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Create Task" })).toBeEnabled();
    await expect(boardTitles(page)).toHaveText(allTitles);
  });

  test("Escape, Cancel, and Close dismiss the dialog without creating and restore focus", async ({ page }) => {
    const posted = await mockCreatableApi(page);
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Add task to To Do", exact: true });
    const dialog = createDialog(page);

    await opener.click();
    await dialog.getByLabel("Title").fill("Discarded");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();

    for (const name of ["Cancel", "Close"]) {
      await opener.click();
      await expect(dialog.getByLabel("Title")).toHaveValue("");
      await dialog.getByRole("button", { name, exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    }
    expect(posted).toEqual([]);
  });
});

test.describe("AC 13: responsive layout", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 }
  ]) {
    test(`no page overflow or overlapping controls at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await mockApi(page);
      await page.goto("/");
      await expect(boardTitles(page)).toHaveText(allTitles);

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      for (const control of [
        page.getByLabel("Search tasks, people, or keywords"), boardSearch(page), page.getByRole("button", { name: "Create Task" }),
        page.getByLabel("Filter by priority"), page.getByRole("button", { name: "Clear filters" }), lane(page, "To Do")
      ]) {
        await expect(control).toBeVisible();
      }

      const search = await box(page.locator(".global-search"));
      const profile = await box(page.getByRole("group", { name: "Current user profile" }));
      expect(overlaps(search, profile)).toBe(false);
      const summaryBoxes = await Promise.all((await page.locator(".summary-card").all()).map(box));
      for (let i = 0; i < summaryBoxes.length; i++) {
        for (let j = i + 1; j < summaryBoxes.length; j++) expect(overlaps(summaryBoxes[i], summaryBoxes[j])).toBe(false);
      }
      const controlBoxes = await Promise.all((await page.locator(".board-actions > *, .filter-bar > *").all()).map(box));
      for (let i = 0; i < controlBoxes.length; i++) {
        for (let j = i + 1; j < controlBoxes.length; j++) expect(overlaps(controlBoxes[i], controlBoxes[j])).toBe(false);
      }
    });
  }

  test("mobile navigation opens from the menu button and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockApi(page);
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open navigation" });
    const sidebar = page.locator("#sidebar");

    await expect(sidebar).not.toBeInViewport();
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeInViewport();
    await expect(dashboardLink(page)).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(sidebar).not.toBeInViewport();
  });

  test("desktop shows the full sidebar labels and tablet collapses them to icons", async ({ page }) => {
    await mockApi(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const label = page.locator(".nav-label").first();
    expect((await box(label)).width).toBeGreaterThan(20);
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect.poll(async () => (await box(label)).width).toBeLessThanOrEqual(1);
    await expect(dashboardLink(page)).toBeInViewport();
  });
});
