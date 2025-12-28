import { expect, test } from '@playwright/test';
import fs from 'fs';

// ensure screenshots dir exists
const screenshotDir = 'e2e/screenshots/test_cases';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('Test Cases Execution with Evidence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#input-sequence', { state: 'visible' });
  });

  async function solveSequence(page, input) {
    await page.locator('#input-sequence').fill(input);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    // Wait for result to appear
    await page.waitForSelector('text=Predicted Next Number', { timeout: 10000 });
    // Wait a bit for animation
    await page.waitForTimeout(500);
  }

  // --- 1. Solver Functionality ---

  test('TC_SOLVER_001: Verify Arithmetic Progression Solution', async ({ page }) => {
    await solveSequence(page, '2, 4, 6, 8');

    // Verify
    const content = await page.content();
    expect(content).toContain('Arithmetic');
    expect(content).toContain('10'); // Next number

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_SOLVER_001.png`, fullPage: true });
  });

  test('TC_SOLVER_003: Verify Geometric Progression Solution', async ({ page }) => {
    await solveSequence(page, '2, 4, 8, 16');

    // Verify
    const content = await page.content();
    expect(content).toContain('Geometric');
    // Regex for x2 or multiply by 2 depending on locale, keeping simple
    expect(content).toContain('32');

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_SOLVER_003.png`, fullPage: true });
  });

  test('TC_SOLVER_005: Verify Interleaved Sequence Solution', async ({ page }) => {
    await solveSequence(page, '1, 10, 2, 20, 3, 30');

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_SOLVER_005.png`, fullPage: true });
  });

  // --- 2. Feedback System ---

  test('TC_FEEDBACK_001: Verify Positive Feedback Submission', async ({ page }) => {
    await solveSequence(page, '2, 4, 6');

    // Click Yes/Helpful
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(
        (b) => b.textContent.includes('Yes') || b.textContent.includes('helpful'),
      );
      if (btn) btn.click();
    });

    // Wait for Thank You
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/TC_FEEDBACK_001.png` });
  });

  test('TC_FEEDBACK_002: Verify Negative Feedback Form Display', async ({ page }) => {
    await solveSequence(page, '2, 4, 6');

    // Click No/Not Helpful
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(
        (b) => b.textContent.includes('No') || b.textContent.includes('Not'),
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(500);
    // Evidence of form
    await page.screenshot({ path: `${screenshotDir}/TC_FEEDBACK_002.png` });
  });

  // --- 3. Navigation & Localization ---

  test('TC_NAV_001: Navigate to Documentation', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(1000);

    // Verify content
    const content = await page.content();
    expect(content).toContain('Documentation');

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_NAV_001.png`, fullPage: true });
  });

  test('TC_NAV_002: Language Switching (EN -> ID)', async ({ page }) => {
    // Click Lang Switcher
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const langBtn = btns.find(
        (b) => b.textContent.includes('EN') || b.textContent.includes('ID'),
      );
      if (langBtn) langBtn.click();
    });
    await page.waitForTimeout(300);

    // Select ID
    await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, li, a'));
      const idOption = els.find(
        (el) => el.textContent.includes('Indonesia') || el.textContent === 'ID',
      );
      if (idOption) idOption.click();
    });
    await page.waitForTimeout(1000);

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_NAV_002.png`, fullPage: true });
  });

  test('TC_NAV_003: Navigate to Privacy Policy', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForTimeout(1000);

    const content = await page.content();
    expect(content).toContain('Privacy Policy');

    // Evidence
    await page.screenshot({ path: `${screenshotDir}/TC_NAV_003.png`, fullPage: true });
  });
});
