import { test, expect } from "@playwright/test";

/**
 * Verify responsive design works on different viewports
 * Maps to AC13: Responsive design usable on desktop, tablet, mobile
 */

// Desktop viewport test
test("Responsive Design - Desktop Layout", async ({ page }) => {
  await page.goto("/");
  
  // Verify desktop layout elements are visible
  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toBeVisible();
  
  const mainContent = page.locator('.main-content');
  await expect(mainContent).toBeVisible();
  
  // Verify no horizontal overflow
  const appContainer = page.locator('.app-container');
  const overflowX = await appContainer.evaluate(() => {
    return window.getComputedStyle(document.querySelector('.app-container')!).overflowX;
  });
  expect(overflowX).toMatch(/auto|hidden/);
});

test("Responsive Design - Text Readability Across Viewports", async ({ page }) => {
  await page.goto("/");
  
  // Verify heading is readable on default viewport
  const heading = page.getByRole("heading", { name: "UVJTaskFlow", exact: true });
  const fontSize = await heading.evaluate(() => {
    return window.getComputedStyle(document.querySelector('h1')!).fontSize;
  });
  
  const fontSizeValue = parseInt(fontSize);
  expect(fontSizeValue).toBeGreaterThanOrEqual(18); // Minimum readable size
});

test("Responsive Design - Kanban Board Columns Adapt", async ({ page }) => {
  await page.goto("/");
  
  // Verify kanban columns are visible and properly laid out
  const columns = page.locator('.kanban-column');
  const columnCount = await columns.count();
  expect(columnCount).toBe(4);
  
  // Get first column and verify it's visible
  const firstColumn = columns.first();
  await expect(firstColumn).toBeVisible();
  const isInViewport = await firstColumn.evaluate(() => {
    const rect = document.querySelector('.kanban-column')!.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  expect(isInViewport).toBe(true);
});

test("Responsive Design - Filter Controls Accessible", async ({ page }) => {
  await page.goto("/");
  
  // Verify filter controls are visible and accessible
  const priorityFilter = page.locator('#priority-filter');
  const statusFilter = page.locator('#status-filter');
  
  await expect(priorityFilter).toBeVisible();
  await expect(statusFilter).toBeVisible();
  
  // Ensure they have appropriate sizes for touch/click
  const filterSize = await priorityFilter.evaluate(() => {
    const rect = document.querySelector('#priority-filter')!.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  
  expect(filterSize.height).toBeGreaterThanOrEqual(32); // Minimum touch target size
});

test("Responsive Design - No Horizontal Overflow on Page", async ({ page }) => {
  await page.goto("/");
  
  // Verify no horizontal scrollbar
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  
  expect(hasHorizontalScroll).toBe(false);
});

test("Responsive Design - Layout Stability", async ({ page }) => {
  await page.goto("/");
  
  // Verify the main layout remains stable
  const appContainer = page.locator('.app-container');
  const initialHeight = await appContainer.evaluate(() => {
    const elem = document.querySelector('.app-container') as HTMLElement;
    return elem.offsetHeight;
  });
  
  expect(initialHeight).toBeGreaterThan(0);
  
  // Sidebar should have reasonable width
  const sidebar = page.locator('.sidebar');
  const sidebarWidth = await sidebar.evaluate(() => {
    const elem = document.querySelector('.sidebar') as HTMLElement;
    return elem.offsetWidth;
  });
  
  expect(sidebarWidth).toBeGreaterThan(200);
  expect(sidebarWidth).toBeLessThan(400);
});

test("Responsive layout is usable on desktop, tablet, and mobile", async ({ page }) => {
  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".main-content")).toBeVisible();
    await expect(page.locator("#priority-filter")).toBeVisible();
    await expect(page.locator(".kanban-column").first()).toBeVisible();

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      sidebarWidth: document.querySelector(".sidebar")!.getBoundingClientRect().width,
      firstColumnRight: document.querySelector(".kanban-column")!.getBoundingClientRect().right,
      filterHeight: document.querySelector("#priority-filter")!.getBoundingClientRect().height
    }));

    expect(layout.documentWidth, `${viewport.name} page should not overflow horizontally`).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.sidebarWidth).toBeGreaterThan(0);
    expect(layout.firstColumnRight).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.filterHeight).toBeGreaterThanOrEqual(32);
  }
});
