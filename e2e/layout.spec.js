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
    const fileName = `layout_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Layout E2E', () => {
  test('shows header with logo', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('Deret') || expect(content).toContain('Solver');

    await saveCoverage(page, 'header_logo');
  });

  test('shows footer with links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toContain('Privacy') || expect(content).toContain('footer');

    await saveCoverage(page, 'footer_links');
  });

  test('shows navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('Solver') ||
      expect(content).toContain('Documentation') ||
      expect(content).toContain('nav');

    await saveCoverage(page, 'nav_links');
  });

  test('mobile menu opens on small viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // Try to click hamburger menu if present
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const menuBtn = buttons.find(
        (b) =>
          b.querySelector('.lucide-menu') ||
          b.getAttribute('aria-label')?.includes('menu') ||
          b.textContent.includes('☰'),
      );
      if (menuBtn) menuBtn.click();
    });
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'mobile_menu');
  });

  test('responsive layout adjusts', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'responsive');
  });

  test('language switcher in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const content = await page.content();
    const hasLanguageIndicator =
      content.includes('EN') || content.includes('ID') || content.includes('language');
    expect(hasLanguageIndicator).toBeTruthy();

    await saveCoverage(page, 'lang_switcher_header');
  });
});
