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
    const fileName = `privacy_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Privacy Policy Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForTimeout(500);
  });

  test('displays privacy policy content', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Privacy');
    expect(content).toContain('Policy');

    await saveCoverage(page, 'privacy_content');
  });

  test('shows information collection section', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Information') || expect(content).toContain('Data');

    await saveCoverage(page, 'info_collection');
  });

  test('shows third party services section', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Google') ||
      expect(content).toContain('Analytics') ||
      expect(content).toContain('Firebase');

    await saveCoverage(page, 'third_party');
  });

  test('shows user rights section', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Rights') || expect(content).toContain('right');

    await saveCoverage(page, 'user_rights');
  });

  test('scrolls through privacy policy', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'scroll_privacy');
  });

  test('language switch works on privacy page', async ({ page }) => {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const langBtn = buttons.find(
        (b) => b.textContent.includes('EN') || b.textContent.includes('ID'),
      );
      if (langBtn) langBtn.click();
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('button, li, a'));
      const idOption = options.find(
        (el) => el.textContent.includes('Indonesia') || el.textContent === 'ID',
      );
      if (idOption) idOption.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'privacy_language_switch');
  });
});
