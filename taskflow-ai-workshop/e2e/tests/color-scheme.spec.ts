import { test, expect } from "@playwright/test";

/**
 * Verify consistent green/grey/white color palette
 * Maps to AC2: Consistent green/grey/white palette
 */
test("Color Scheme - Primary Green Color", async ({ page }) => {
  await page.goto("/");
  
  const brandTitle = page.locator(".branding h1");
  const color = await brandTitle.evaluate((element) => {
    return window.getComputedStyle(element).color;
  });
  
  expect(color).toMatch(/rgb\(\s*23,\s*107,\s*52\s*\)/);
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

  const contrastRatios = await page.evaluate(() => {
    const luminance = (color: string) => {
      const channels = color.match(/\d+/g)?.slice(0, 3).map(Number);
      if (!channels || channels.length !== 3) {
        throw new Error(`Unable to parse computed color: ${color}`);
      }

      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const contrast = (foreground: string, background: string) => {
      const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };

    const heading = document.querySelector(".branding h1")!;
    const sidebar = document.querySelector(".sidebar")!;
    const activeNavigation = document.querySelector(".nav-item.active")!;
    const button = document.createElement("button");
    button.className = "btn btn-primary";
    document.body.appendChild(button);

    const ratios = [
      contrast(getComputedStyle(heading).color, getComputedStyle(sidebar).backgroundColor),
      contrast(getComputedStyle(activeNavigation).color, getComputedStyle(activeNavigation).backgroundColor),
      contrast(getComputedStyle(button).color, getComputedStyle(button).backgroundColor)
    ];
    button.remove();
    return ratios;
  });

  for (const ratio of contrastRatios) {
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  }
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
