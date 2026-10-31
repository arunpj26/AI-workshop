import { test, expect, type Page } from "@playwright/test";

type Profile = { name: string | null; role: string | null; imageUrl: string | null };

async function mockUser(page: Page, profile: Profile) {
  await page.route("**/api/users/current", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(profile) })
  );
}

async function openDashboard(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("6 tasks loaded");
}

function column(page: Page, name: string) {
  return page.getByRole("region", { name, exact: true });
}

// A wrapping <label> makes the select's accessible name include its current value, e.g. "Priority All".
function filterSelect(page: Page, label: "Priority" | "Status") {
  return page.getByRole("combobox", { name: new RegExp(`^${label}\\b`) });
}

function summaryCard(page: Page, label: string) {
  return page
    .getByRole("list")
    .filter({ has: page.getByText("Total Tasks", { exact: true }) })
    .getByRole("listitem")
    .filter({ has: page.getByText(label, { exact: true }) });
}

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe("AC1 branding", () => {
  test("shows the UVJTaskFlow name, loaded logo and UVJ Technologies footer", async ({ page }) => {
    await openDashboard(page);
    await expect(page).toHaveTitle("UVJTaskFlow");
    await expect(page.getByText("UVJTaskFlow", { exact: true })).toBeVisible();
    const logo = page.getByRole("img", { name: "UVJ Technologies logo" });
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByText("Powered by UVJ Technologies")).toBeVisible();
  });
});

test.describe("AC3-AC7 dynamic user profile", () => {
  test("shows the configured user from the real API and no sample name", async ({ page }) => {
    await openDashboard(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Welcome back,\s*Demo User!$/);
    await expect(page.getByRole("banner").getByText("Demo User", { exact: true })).toBeVisible();
    await expect(page.getByRole("banner").getByText("Project Member", { exact: true })).toBeVisible();
    await expect(page.getByText("DU", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Arun Janardhanan");
  });

  test("switching user shows each user's own name and role", async ({ page }) => {
    let profile: Profile = { name: "Alice Example", role: "Developer", imageUrl: null };
    await page.route("**/api/users/current", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(profile) })
    );
    await openDashboard(page);
    const heading = page.getByRole("heading", { level: 1 });
    const banner = page.getByRole("banner");
    await expect(heading).toHaveText(/^Welcome back,\s*Alice Example!$/);
    await expect(banner.getByText("Developer", { exact: true })).toBeVisible();
    await expect(banner.getByText("AE", { exact: true })).toBeVisible();

    profile = { name: "Bob Sample", role: "Tester", imageUrl: null };
    await page.reload();
    await expect(heading).toHaveText(/^Welcome back,\s*Bob Sample!$/);
    await expect(banner.getByText("Tester", { exact: true })).toBeVisible();
    await expect(banner.getByText("BS", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Alice Example");
    await expect(page.locator("body")).not.toContainText("Developer");
  });

  test("shows the profile image when an image URL is available", async ({ page }) => {
    await mockUser(page, { name: "Image User", role: "Lead", imageUrl: "/images/uvj-logo.png" });
    await openDashboard(page);
    const avatar = page.getByRole("img", { name: "Image User" });
    await expect(avatar).toBeVisible();
    await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByText("IU", { exact: true })).toBeHidden();
  });

  test("shows initials when there is no image URL", async ({ page }) => {
    await mockUser(page, { name: "Test User", role: "QA", imageUrl: null });
    await openDashboard(page);
    await expect(page.getByText("TU", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Test User" })).toHaveCount(0);
  });

  test("falls back to initials when the profile image fails to load", async ({ page }) => {
    await page.route("**/avatars/broken.png", (route) => route.fulfill({ status: 404 }));
    await mockUser(page, { name: "Broken Image", role: "QA", imageUrl: "/avatars/broken.png" });
    await openDashboard(page);
    await expect(page.getByText("BI", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Broken Image" })).toBeHidden();
  });

  test("handles a missing name, role and image without null or undefined", async ({ page }) => {
    await mockUser(page, { name: null, role: null, imageUrl: null });
    await openDashboard(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back!");
    const banner = page.getByRole("banner");
    await expect(banner.locator("#user-name")).toBeHidden();
    await expect(banner.locator("#user-role")).toBeHidden();
    await expect(banner.locator("#user-avatar-icon")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\bnull\b|\bundefined\b|\(\s*\)/);
    expect(bodyText).not.toContain("Demo User");
  });

  test("hides the role when only the role is missing", async ({ page }) => {
    await mockUser(page, { name: "Solo Name", role: "  ", imageUrl: null });
    await openDashboard(page);
    await expect(page.getByRole("banner").getByText("Solo Name", { exact: true })).toBeVisible();
    await expect(page.getByRole("banner").locator("#user-role")).toBeHidden();
  });

  test("uses the generic greeting and still loads the board when the user API fails", async ({ page }) => {
    await page.route("**/api/users/current", (route) => route.fulfill({ status: 500, body: "boom" }));
    await openDashboard(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back!");
    await expect(page.getByRole("article")).toHaveCount(6);
    await expect(page.locator("body")).not.toContainText("boom");
  });
});

test.describe("AC8-AC10 summary and board", () => {
  test("summary counts reflect the seeded task data", async ({ page }) => {
    await openDashboard(page);
    await expect(summaryCard(page, "Total Tasks")).toHaveText(/^\s*6\s*Total Tasks\s*$/);
    await expect(summaryCard(page, "Completed")).toHaveText(/^\s*1\s*Completed\s*$/);
    await expect(summaryCard(page, "In Progress")).toHaveText(/^\s*2\s*In Progress\s*$/);
    await expect(summaryCard(page, "To Do")).toHaveText(/^\s*2\s*To Do\s*$/);
  });

  test("board shows the four status columns with the seeded tasks", async ({ page }) => {
    await openDashboard(page);
    const expected: Record<string, string[]> = {
      "To Do": ["Update user profile", "Add API documentation"],
      "In Progress": ["Implement login", "Improve error handling"],
      Completed: ["Fix button alignment"],
      "On Hold": ["Plan data migration"],
    };
    for (const [name, titles] of Object.entries(expected)) {
      const col = column(page, name);
      await expect(col.getByRole("heading", { level: 3, name })).toBeVisible();
      await expect(col.getByRole("heading", { level: 4 })).toHaveText(titles);
    }
  });

  test("cards show title, description and priority", async ({ page }) => {
    await openDashboard(page);
    const card = column(page, "In Progress").getByRole("article").filter({ hasText: "Implement login" });
    await expect(card.getByRole("heading", { name: "Implement login" })).toBeVisible();
    await expect(card).toContainText("Add login form validation");
    await expect(card).toContainText("Priority: High");
    const hold = column(page, "On Hold").getByRole("article");
    await expect(hold).toContainText("Paused until the reporting database is available");
    await expect(hold).toContainText("Priority: Low");
  });
});

test.describe("AC11 search, filters and actions", () => {
  test("priority filter shows only matching tasks", async ({ page }) => {
    await openDashboard(page);
    await filterSelect(page, "Priority").selectOption("HIGH");
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(["Implement login", "Improve error handling"]);
    await expect(page.getByRole("status")).toHaveText("Showing 2 of 6 tasks");
    await expect(summaryCard(page, "Total Tasks")).toHaveText(/^\s*6\s*Total Tasks\s*$/);
  });

  test("status filter shows only matching tasks", async ({ page }) => {
    await openDashboard(page);
    const status = filterSelect(page, "Status");
    await status.selectOption("COMPLETED");
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(["Fix button alignment"]);
    await status.selectOption("ON_HOLD");
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(["Plan data migration"]);
    await expect(column(page, "To Do").getByText("No matching tasks")).toBeVisible();
  });

  test("search filters by title or description, case-insensitively", async ({ page }) => {
    await openDashboard(page);
    const search = page.getByLabel("Search tasks");
    await search.fill("DOCUMENTATION");
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(["Add API documentation"]);
    await search.fill("reporting database");
    await expect(page.getByRole("article").getByRole("heading")).toHaveText(["Plan data migration"]);
  });

  test("no-match search shows empty states and Clear restores all tasks", async ({ page }) => {
    await openDashboard(page);
    await page.getByLabel("Search tasks").fill("zzz-no-such-task");
    await filterSelect(page, "Priority").selectOption("LOW");
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.getByText("No matching tasks")).toHaveCount(4);
    await expect(page.getByRole("status")).toHaveText("Showing 0 of 6 tasks");

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByLabel("Search tasks")).toHaveValue("");
    await expect(filterSelect(page, "Priority")).toHaveValue("ALL");
    await expect(filterSelect(page, "Status")).toHaveValue("ALL");
    await expect(page.getByRole("article")).toHaveCount(6);
    await expect(page.getByRole("status")).toHaveText("6 tasks loaded");
  });

  test("Create Task and Add Task are disabled and marked Coming soon", async ({ page }) => {
    await openDashboard(page);
    const create = page.getByRole("button", { name: /Create Task/ });
    await expect(create).toBeDisabled();
    await expect(create).toContainText("Coming soon");
    for (const name of ["To Do", "In Progress", "Completed", "On Hold"]) {
      const add = column(page, name).getByRole("button", { name: `Add task to ${name} (coming soon)` });
      await expect(add).toBeVisible();
      await expect(add).toBeDisabled();
      await expect(add).toContainText("Coming soon");
    }
  });

  test("sidebar has working Dashboard and Board links and Coming soon items", async ({ page }) => {
    await openDashboard(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveText(["Dashboard", "Board"]);
    await expect(nav.locator('[aria-disabled="true"]')).toHaveText([
      /^\s*Tasks\s*Coming soon\s*$/,
      /^\s*My Tasks\s*Coming soon\s*$/,
      /^\s*Timeline\s*Coming soon\s*$/,
      /^\s*Reports\s*Coming soon\s*$/,
      /^\s*Milestones\s*Coming soon\s*$/,
      /^\s*Team\s*Coming soon\s*$/,
      /^\s*Settings\s*Coming soon\s*$/,
    ]);

    await nav.getByRole("link", { name: "Board", exact: true }).click();
    await expect(page).toHaveURL(/#board$/);
    await expect(nav.getByRole("link", { name: "Board", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Task Board" })).toBeInViewport();

    await nav.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/#dashboard$/);
    await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });

  test("shows a visible error when tasks fail to load and recovers on Retry", async ({ page }) => {
    await page.route("**/api/tasks", (route) => route.fulfill({ status: 500, body: "" }));
    await page.goto("/");
    await expect(page.getByRole("alert")).toContainText("Unable to load tasks");
    await expect(summaryCard(page, "Total Tasks")).toHaveText(/^\s*–\s*Total Tasks\s*$/);
    await expect(page.getByRole("article")).toHaveCount(0);

    await page.unroute("**/api/tasks");
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByRole("status")).toHaveText("6 tasks loaded");
    await expect(page.getByRole("button", { name: "Retry" })).toBeHidden();
  });

  test("an empty task list shows No tasks in every column and zero counts", async ({ page }) => {
    await page.route("**/api/tasks", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText("0 tasks loaded");
    await expect(page.getByText("No tasks", { exact: true })).toHaveCount(4);
    await expect(summaryCard(page, "Total Tasks")).toHaveText(/^\s*0\s*Total Tasks\s*$/);
  });
});

test.describe("AC13 responsive layout and keyboard access", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 1180 },
    { width: 375, height: 812 },
  ]) {
    test(`no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openDashboard(page);
      await expectNoHorizontalOverflow(page);
      await expect(summaryCard(page, "Total Tasks")).toBeVisible();
      for (const name of ["To Do", "In Progress", "Completed", "On Hold"]) {
        await expect(column(page, name)).toBeVisible();
      }
      await expect(page.getByLabel("Search tasks")).toBeVisible();
    });
  }

  test("menu toggle opens the navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openDashboard(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: "Board", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await nav.getByRole("link", { name: "Board", exact: true }).click();
    await expect(nav).toBeHidden();
    await expect(page).toHaveURL(/#board$/);
  });

  test("Tab reaches search, filters and Clear with a visible focus outline", async ({ page }) => {
    await openDashboard(page);
    const targets = ["task-search", "priority-filter", "status-filter", "clear-filters"];
    const reached: Record<string, boolean> = {};
    for (let i = 0; i < 40 && Object.keys(reached).length < targets.length; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        // The search input draws its focus ring on the wrapping .search container.
        const ringHost = el.id === "task-search" ? (el.closest(".search") as HTMLElement) : el;
        const style = getComputedStyle(ringHost);
        return { id: el.id, outlined: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 };
      });
      if (targets.includes(info.id)) reached[info.id] = info.outlined;
    }
    expect(reached).toEqual({
      "task-search": true,
      "priority-filter": true,
      "status-filter": true,
      "clear-filters": true,
    });
  });
});

test.describe("AC15 design review screenshots", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 1180 },
    { width: 375, height: 812 },
  ]) {
    test(`captures dashboard at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openDashboard(page);
      await page.screenshot({ path: `test-results/aiw-7/dashboard-${viewport.width}.png`, fullPage: true });
    });
  }
});
