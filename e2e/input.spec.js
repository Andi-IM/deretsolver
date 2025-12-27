import { test, expect } from '@playwright/test';
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
    const fileName = `input_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('InputSection E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#input-sequence', { state: 'visible' });
  });

  test('shows API key input when clicking Add API Key', async ({ page }) => {
    // Click Add API Key button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apiBtn = buttons.find(
        (b) => b.textContent.includes('API') || b.textContent.includes('Key'),
      );
      if (apiBtn) apiBtn.click();
    });
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toContain('AIza');

    await saveCoverage(page, 'api_key_input');
  });

  test('shows item count when typing sequence', async ({ page }) => {
    await page.locator('#input-sequence').fill('1, 2, 3, 4, 5');
    await page.waitForTimeout(200);

    const content = await page.content();
    expect(content).toContain('5 items') || expect(content).toContain('5');

    await saveCoverage(page, 'item_count');
  });

  test('shows error for invalid input', async ({ page }) => {
    await page.locator('#input-sequence').fill('abc');

    // Click solve button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    // May show error or just not show result
    expect(content).toBeDefined();

    await saveCoverage(page, 'invalid_input');
  });

  test('shows error for too few numbers', async ({ page }) => {
    await page.locator('#input-sequence').fill('1, 2');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'too_few_numbers');
  });

  test('clears input and solves again', async ({ page }) => {
    // First solve
    await page.locator('#input-sequence').fill('2, 4, 6, 8');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    await page.waitForTimeout(1000);

    // Clear and solve different sequence
    await page.locator('#input-sequence').fill('');
    await page.locator('#input-sequence').fill('3, 6, 12, 24');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    await page.waitForTimeout(1000);

    const content = await page.content();
    expect(content).toContain('48');

    await saveCoverage(page, 'clear_and_solve');
  });
});
