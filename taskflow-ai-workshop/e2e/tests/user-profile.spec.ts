import { test, expect } from "@playwright/test";

const defaultProfile = {
  name: "Taylor Morgan",
  role: "Project Member",
  imageUrl: null
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    contentType: "application/json",
    json: defaultProfile
  }));
});

test("User Profile - Display Update on Page Reload", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/users/current", (route) => {
    requestCount += 1;
    return route.fulfill({
      contentType: "application/json",
      json: requestCount === 1
        ? defaultProfile
        : { name: "Jordan Lee", role: "Analyst", imageUrl: null }
    });
  });
  await page.goto("/");
  
  const userName = page.locator("#user-name");
  await expect(userName).toHaveText("Taylor Morgan");
  await page.reload();
  await expect(userName).toHaveText("Jordan Lee");
  await expect(page.locator("#welcome-name")).toHaveText("Jordan Lee");
});

test("User Profile - Initials Display When No Image", async ({ page }) => {
  await page.goto("/");
  
  const userInitials = page.locator("#user-initials");
  await expect(userInitials).toHaveText("TM");
  await expect(userInitials).toBeVisible();
  await expect(page.locator("#user-image")).toBeHidden();
});

test("User Profile - Configured Image Is Displayed", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    contentType: "application/json",
    json: { ...defaultProfile, imageUrl: "https://profile.test/avatar.png" }
  }));
  await page.route("https://profile.test/avatar.png", (route) => route.fulfill({
    status: 200,
    contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=", "base64")
  }));
  await page.goto("/");

  await expect(page.locator("#user-image")).toBeVisible();
  await expect(page.locator("#user-initials")).toBeHidden();
});

test("User Profile - Broken Image Falls Back To Initials", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    contentType: "application/json",
    json: { ...defaultProfile, imageUrl: "https://profile.test/broken-avatar.png" }
  }));
  await page.route("https://profile.test/broken-avatar.png", (route) => route.fulfill({ status: 404, body: "" }));
  await page.goto("/");

  await expect(page.locator("#user-initials")).toHaveText("TM");
  await expect(page.locator("#user-initials")).toBeVisible();
  await expect(page.locator("#user-image")).toBeHidden();
});

test("User Profile - Missing Name Fallback", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    contentType: "application/json",
    json: { name: null, role: "undefined", imageUrl: null }
  }));
  await page.goto("/");

  const userName = page.locator("#user-name");
  await expect(userName).toBeHidden();
  await expect(page.locator("#welcome-greeting")).toHaveText("Welcome to UVJTaskFlow");
  await expect(page.locator("#welcome-name")).toBeHidden();
  await expect(page.locator("#user-role")).toBeHidden();
  await expect(page.locator("#user-initials")).toHaveText("U");
  await expect(page.locator("body")).not.toContainText(/null|undefined|Demo User/i);
});

test("User Profile - Role Display", async ({ page }) => {
  await page.goto("/");
  
  // Verify role is displayed
  const userRole = page.locator("#user-role");
  await expect(userRole).toContainText("Project Member", { timeout: 5000 });
});

test("User Profile - Avatar Element Exists", async ({ page }) => {
  await page.goto("/");
  
  // Verify avatar element exists
  const userAvatar = page.locator("#user-avatar");
  await expect(userAvatar).toBeVisible();
  
  // Avatar should either have an image or initials
  const content = await userAvatar.innerHTML();
  expect(content.length).toBeGreaterThan(0);
});

test("User Profile - Welcome Section Uses Dynamic Name", async ({ page }) => {
  await page.goto("/");
  
  const welcomeName = page.locator("#welcome-name");
  await expect(welcomeName).toHaveText("Taylor Morgan");
});

test("User Profile - Greeting Section Visible", async ({ page }) => {
  await page.goto("/");
  
  // Verify greeting is present
  const greeting = page.locator("#welcome-greeting");
  await expect(greeting).toBeVisible();
  
  // Greeting should have text
  const greetingText = await greeting.textContent();
  expect(greetingText).toContain("Welcome");
});

test("User Profile - No Null Values in DOM", async ({ page }) => {
  await page.goto("/");
  
  // Check for "undefined" or "null" strings in DOM that shouldn't be there
  const body = page.locator('body');
  const html = await body.innerHTML();
  
  // Should not display "undefined" or "null" as text content
  const hasUndefined = html.includes(">undefined<") || 
                       html.includes(">null<");
  
  expect(hasUndefined).toBe(false);
});

test("User Profile - API Failure Shows Generic Profile And Error", async ({ page }) => {
  await page.route("**/api/users/current", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    json: { error: "Unavailable" }
  }));
  await page.goto("/");

  await expect(page.locator("#welcome-greeting")).toHaveText("Welcome to UVJTaskFlow");
  await expect(page.locator("#profile-status")).toContainText("Unable to load configured profile");
  await expect(page.locator("#user-initials")).toHaveText("U");
});

test("User Profile - Subtitle/Tagline Visible", async ({ page }) => {
  await page.goto("/");
  
  const subtitle = page.locator("#welcome-subtitle");
  await expect(subtitle).toBeVisible();
  
  const text = await subtitle.textContent();
  expect(text).toBeTruthy();
});

test("User Profile - Header and Sidebar User Info Consistency", async ({ page }) => {
  await page.goto("/");
  
  const headerUserName = page.locator("#user-name");
  const headerUserRole = page.locator("#user-role");
  
  await expect(headerUserName).toHaveText("Taylor Morgan");
  await expect(headerUserRole).toHaveText("Project Member");
  
  const nameText = await headerUserName.textContent();
  const roleText = await headerUserRole.textContent();
  
  expect(nameText).toEqual("Taylor Morgan");
  expect(roleText).toEqual("Project Member");
});
