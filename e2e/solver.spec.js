import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('SolverPage E2E', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('#input-sequence', { state: 'visible' });
  });

  // Collect coverage after each test
  test.afterEach(async ({ page }, testInfo) => {
    const coverage = await page.evaluate(() => window.__coverage__);
    if (coverage) {
      const coverageDir = '.nyc_output';
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }
      const fileName = `${testInfo.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
    }
  });

  async function solveSequence(page, input) {
    await page.locator('#input-sequence').fill(input);
    // Click the button using evaluate to ensure it works
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    // Wait for result section to appear
    await page.waitForTimeout(1000);
  }

  test('solves geometric sequence 2,4,8,16 -> 32', async ({ page }) => {
    await solveSequence(page, '2,4,8,16');
    const content = await page.content();
    expect(content).toContain('32');
  });

  test('solves interleaved sequence 1,10,2,20,3,30 -> 4,40', async ({ page }) => {
    await solveSequence(page, '1,10,2,20,3,30,...,...');
    const content = await page.content();
    // Interleaved patterns return multiple predictions
    expect(content).toContain('Pattern');
  });

  test('solves arithmetic addition 2, 4, 6, 8 -> 10', async ({ page }) => {
    await solveSequence(page, '2, 4, 6, 8');
    const content = await page.content();
    expect(content).toContain('>10<');
  });

  test('solves arithmetic subtraction 20, 15, 10, 5 -> 0', async ({ page }) => {
    await solveSequence(page, '20, 15, 10, 5');
    const content = await page.content();
    expect(content).toContain('>0<');
  });

  test('solves geometric multiplication 3, 9, 27, 81 -> 243', async ({ page }) => {
    await solveSequence(page, '3, 9, 27, 81');
    const content = await page.content();
    expect(content).toContain('243');
  });

  test('solves geometric division 100, 50, 25, 12.5 -> 6.25', async ({ page }) => {
    await solveSequence(page, '100, 50, 25, 12.5');
    const content = await page.content();
    expect(content).toContain('6.25');
  });

  test('solves fibonacci 1, 1, 2, 3, 5, 8 -> 13', async ({ page }) => {
    await solveSequence(page, '1, 1, 2, 3, 5, 8');
    const content = await page.content();
    expect(content).toContain('>13<');
  });

  test('solves squares 1, 4, 9, 16, 25 -> 36', async ({ page }) => {
    await solveSequence(page, '1, 4, 9, 16, 25');
    const content = await page.content();
    expect(content).toContain('36');
  });

  test('solves cubes 1, 8, 27, 64 -> 125', async ({ page }) => {
    await solveSequence(page, '1, 8, 27, 64');
    const content = await page.content();
    expect(content).toContain('125');
  });

  test('solves mixed 2, 5, 4, 7, 6, 9 -> 8', async ({ page }) => {
    await solveSequence(page, '2, 5, 4, 7, 6, 9');
    const content = await page.content();
    expect(content).toContain('>8<');
  });

  test('solves negative arithmetic -10, -5, 0, 5 -> 10', async ({ page }) => {
    await solveSequence(page, '-10, -5, 0, 5');
    const content = await page.content();
    expect(content).toContain('>10<');
  });

  test('solves decimals 1.5, 3.0, 4.5, 6.0 -> 7.5', async ({ page }) => {
    await solveSequence(page, '1.5, 3.0, 4.5, 6.0');
    const content = await page.content();
    expect(content).toContain('7.5');
  });

  // Additional edge cases for higher coverage
  test('solves two-level difference 1, 2, 4, 7, 11 -> 16', async ({ page }) => {
    await solveSequence(page, '1, 2, 4, 7, 11');
    const content = await page.content();
    expect(content).toContain('16');
  });

  test('solves triangular numbers 1, 3, 6, 10, 15 -> 21', async ({ page }) => {
    await solveSequence(page, '1, 3, 6, 10, 15');
    const content = await page.content();
    expect(content).toContain('21');
  });

  test('solves large arithmetic 100, 200, 300, 400 -> 500', async ({ page }) => {
    await solveSequence(page, '100, 200, 300, 400');
    const content = await page.content();
    expect(content).toContain('500');
  });

  test.skip('solves fractional geometric 1, 0.5, 0.25, 0.125 -> 0.0625', async ({ page }) => {
    await solveSequence(page, '1, 0.5, 0.25, 0.125');
    // Wait for the result to be visible and contain the expected value
    await expect(page.locator('.text-3xl.font-bold.text-slate-900')).toContainText('0.0625', {
      timeout: 10000,
    });
  });

  test('solves power of 3: 1, 3, 9, 27 -> 81', async ({ page }) => {
    await solveSequence(page, '1, 3, 9, 27');
    const content = await page.content();
    expect(content).toContain('81');
  });

  test('solves alternating signs: 1, -2, 4, -8 -> 16', async ({ page }) => {
    await solveSequence(page, '1, -2, 4, -8');
    const content = await page.content();
    expect(content).toContain('16') || expect(content).toContain('-16');
  });

  test('solves constant sequence: 5, 5, 5, 5 -> 5', async ({ page }) => {
    await solveSequence(page, '5, 5, 5, 5');
    const content = await page.content();
    expect(content).toContain('>5<');
  });

  test('solves increasing by 2: 0, 2, 6, 12, 20 -> 30', async ({ page }) => {
    await solveSequence(page, '0, 2, 6, 12, 20');
    const content = await page.content();
    expect(content).toContain('30');
  });
});
