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
    const fileName = `localization_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Localization E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('should switch language from English to Indonesian and back', async ({ page }) => {
    // 1. Verify initial state (English)
    // We expect the title to be in English
    await expect(page.locator('h2')).toContainText('Number Sequence Pattern Solver');

    // 2. Click Language Toggle
    const langToggle = page.getByLabel('Switch Language');
    await langToggle.click();
    await page.waitForTimeout(500);

    // 3. Verify state changed to Indonesian
    await expect(page.locator('h2')).toContainText('Pemecah Pola Deret Angka');
    await expect(langToggle).toContainText('ID');

    // 4. Click Language Toggle again to switch back to English
    await langToggle.click();
    await page.waitForTimeout(500);

    // 5. Verify switched back to English
    await expect(page.locator('h2')).toContainText('Number Sequence Pattern Solver');
    await expect(langToggle).toContainText('EN');

    await saveCoverage(page, 'toggle_language');
  });

  test('should persist language preference after reload', async ({ page }) => {
    // 1. Switch to Indonesian
    const langToggle = page.getByLabel('Switch Language');
    await langToggle.click();
    await expect(page.locator('h2')).toContainText('Pemecah Pola Deret Angka');

    // 2. Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // 3. Verify language persists
    await expect(page.locator('h2')).toContainText('Pemecah Pola Deret Angka');
    await expect(langToggle).toContainText('ID');

    await saveCoverage(page, 'persist_language');
  });
});
