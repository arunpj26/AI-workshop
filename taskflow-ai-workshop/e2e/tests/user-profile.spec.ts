import { test, expect } from "@playwright/test";

/**
 * Verify dynamic user profile updates and fallback scenarios
 * Maps to AC3, AC4, AC6, AC7: User profile handling, dynamic updates, fallbacks
 */

test("User Profile - Display Update on Page Reload", async ({ page }) => {
  await page.goto("/");
  
  // Verify initial user name loads
  const userName = page.locator("#user-name");
  await expect(userName).toContainText("Demo User", { timeout: 5000 });
  
  // Reload page
  await page.reload();
  
  // Verify user name is still loaded after reload
  await expect(userName).toContainText("Demo User", { timeout: 5000 });
});

test("User Profile - Initials Display When No Image", async ({ page }) => {
  await page.goto("/");
  
  // Wait for profile to load
  const userInitials = page.locator("#user-initials");
  await page.waitForFunction(() => {
    const elem = document.querySelector("#user-initials");
    return elem && elem.textContent!.trim().length > 0;
  }, { timeout: 5000 });
  
  // Verify initials are displayed (should be "DU" for "Demo User")
  const initialsText = await userInitials.textContent();
  expect(initialsText).toMatch(/[A-Z]+/);
});

test("User Profile - Missing Name Fallback", async ({ page }) => {
  await page.goto("/");
  
  // Verify there's a user name element (even if fallback)
  const userName = page.locator("#user-name");
  const nameText = await userName.textContent();
  
  // Should not be null or "undefined"
  expect(nameText).not.toBe("undefined");
  expect(nameText).not.toBe("null");
  expect(nameText).toBeTruthy();
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
  
  // Verify welcome name is dynamically set
  const welcomeName = page.locator("#welcome-name");
  const nameText = await welcomeName.textContent();
  
  // Should contain the user's name, not a hardcoded placeholder
  expect(nameText).not.toBe("");
  expect(nameText).toBeTruthy();
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

test("User Profile - Subtitle/Tagline Visible", async ({ page }) => {
  await page.goto("/");
  
  const subtitle = page.locator("#welcome-subtitle");
  await expect(subtitle).toBeVisible();
  
  const text = await subtitle.textContent();
  expect(text).toBeTruthy();
});

test("User Profile - Header and Sidebar User Info Consistency", async ({ page }) => {
  await page.goto("/");
  
  // Wait for both elements to load
  const headerUserName = page.locator("#user-name");
  const headerUserRole = page.locator("#user-role");
  
  await expect(headerUserName).toContainText("Demo User", { timeout: 5000 });
  await expect(headerUserRole).toContainText("Project Member", { timeout: 5000 });
  
  // Both header elements should show consistent data
  const nameText = await headerUserName.textContent();
  const roleText = await headerUserRole.textContent();
  
  expect(nameText).toEqual("Demo User");
  expect(roleText).toEqual("Project Member");
});
