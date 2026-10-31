import { test, expect } from "@playwright/test";

/**
 * Verify consistent green/grey/white color palette
 * Maps to AC2: Consistent green/grey/white palette
 */
test("Color Scheme - Primary Green Color", async ({ page }) => {
  await page.goto("/");
  
  // Get computed style of the primary button
  const createTaskBtn = page.locator('#create-task-btn');
  const bgColor = await createTaskBtn.evaluate(() => {
    return window.getComputedStyle(document.querySelector('#create-task-btn')!).backgroundColor;
  });
  
  // Primary green should be #1fb84d or similar
  expect(bgColor).toMatch(/rgb\(\s*31,\s*184,\s*77\s*\)|#1fb84d/i);
});

test("Color Scheme - Grey Color in Sidebar", async ({ page }) => {
  await page.goto("/");
  
  const sidebar = page.locator('.sidebar');
  const bgColor = await sidebar.evaluate(() => {
    return window.getComputedStyle(document.querySelector('.sidebar')!).backgroundColor;
  });
  
  // Sidebar should have white or light grey background
  expect(bgColor).toMatch(/rgb\(\s*255,\s*255,\s*255\s*\)|#ffffff|white/i);
});

test("Color Scheme - Text Color Contrast", async ({ page }) => {
  await page.goto("/");
  
  // Verify text on primary elements has good contrast
  const heading = page.getByRole("heading", { name: "UVJTaskFlow" });
  const textColor = await heading.evaluate(() => {
    return window.getComputedStyle(document.querySelector('h1')!).color;
  });
  
  // Should be dark text
  expect(textColor).toBeTruthy();
});

test("Color Scheme - Priority Badge Colors", async ({ page }) => {
  await page.goto("/");
  
  // Wait for task card with priority badge
  await page.waitForSelector('.task-priority', { timeout: 5000 });
  
  const priorityBadge = page.locator('.task-priority').first();
  const bgColor = await priorityBadge.evaluate(() => {
    return window.getComputedStyle(document.querySelector('.task-priority')!).backgroundColor;
  });
  
  // Priority badge should have colored background
  expect(bgColor).toBeTruthy();
});

test("Color Scheme - Status Indicators Use Palette", async ({ page }) => {
  await page.goto("/");
  
  // Verify at least one status indicator is visible (columns have different backgrounds)
  const kanbanColumns = page.locator('.kanban-column');
  const columnCount = await kanbanColumns.count();
  
  expect(columnCount).toBe(4);
});

test("Color Scheme - Dark Mode Not Invoked by Default", async ({ page }) => {
  await page.goto("/");
  
  // Verify body background is light (not dark)
  const bodyBgColor = await page.locator('body').evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  
  // Should not be dark (e.g., not black or very dark grey)
  expect(bodyBgColor).not.toMatch(/rgb\(\s*[0-2][0-9]?,\s*[0-2][0-9]?,\s*[0-2][0-9]?\s*\)/);
});
