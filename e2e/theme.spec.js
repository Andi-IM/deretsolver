import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Helper to save coverage
async function saveCoverage(page, testTitle) {
  const coverage = await page.evaluate(() => window.__coverage__);
  if (coverage) {
    const coverageDir = '.nyc_output';
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }
    const fileName = `theme_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Theme E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('should toggle dark mode via the toggle button', async ({ page }) => {
    const html = page.locator('html');

    // Initial state check (assuming default light mode in test environment)
    await expect(html).not.toHaveClass(/dark/);

    // Find and click the toggle button
    const toggleBtn = page.locator(
      'button[aria-label*="theme"], button:has(.lucide-sun), button:has(.lucide-moon)',
    );
    await toggleBtn.click();

    // Verify dark class is added
    await expect(html).toHaveClass(/dark/);

    // Verify visual change (e.g., body background-color)
    // oxlint-disable-next-line no-unused-vars
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // In dark mode with slate-950, it should be very dark or specific hex
    // Tailwind slate-950 is usually hex #020617 (rgb(2, 6, 23))

    // Toggle back
    await toggleBtn.click();
    await expect(html).not.toHaveClass(/dark/);

    await saveCoverage(page, 'toggle_dark_mode');
  });

  test('should persist theme preference after reload', async ({ page }) => {
    const toggleBtn = page.locator(
      'button[aria-label*="theme"], button:has(.lucide-sun), button:has(.lucide-moon)',
    );

    // Switch to dark mode
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Verify dark mode persists
    await expect(page.locator('html')).toHaveClass(/dark/);

    await saveCoverage(page, 'persist_theme');
  });

  // oxlint-disable-next-line no-unused-vars
  test('should respect system preference if no localStorage set', async ({ page, context }) => {
    // We can't easily change system preference mid-test in a shared context usually,
    // but Playwright allows color-scheme emulation.
    await page.emulateMedia({ colorScheme: 'dark' });

    // We need to clear localStorage for this test to rely on system preference
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.locator('html')).toHaveClass(/dark/);

    await saveCoverage(page, 'system_preference');
  });
});
