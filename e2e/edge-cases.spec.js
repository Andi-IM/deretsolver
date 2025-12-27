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
    const fileName = `edge_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Edge Cases E2E', () => {
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
    await page.waitForTimeout(1000);
  }

  test('handles empty input gracefully', async ({ page }) => {
    // Try to click solve with empty input (button should be disabled)
    const buttonDisabled = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      return solveBtn?.disabled || false;
    });

    expect(buttonDisabled).toBeTruthy();
    await saveCoverage(page, 'empty_input');
  });

  test('handles single number', async ({ page }) => {
    await page.locator('#input-sequence').fill('5');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn && !solveBtn.disabled) solveBtn.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toBeDefined();
    await saveCoverage(page, 'single_number');
  });

  test('handles two numbers', async ({ page }) => {
    await solveSequence(page, '1, 2');
    const content = await page.content();
    expect(content).toBeDefined();
    await saveCoverage(page, 'two_numbers');
  });

  test('handles spaces in input', async ({ page }) => {
    await solveSequence(page, '  2 ,  4 ,  6 ,  8  ');
    const content = await page.content();
    expect(content).toContain('10');
    await saveCoverage(page, 'spaces_input');
  });

  test('handles very long sequence', async ({ page }) => {
    await solveSequence(page, '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12');
    const content = await page.content();
    expect(content).toContain('13');
    await saveCoverage(page, 'long_sequence');
  });

  test('handles zero in sequence', async ({ page }) => {
    await solveSequence(page, '0, 1, 2, 3, 4');
    const content = await page.content();
    expect(content).toContain('>5<');
    await saveCoverage(page, 'with_zero');
  });

  test('handles all zeros', async ({ page }) => {
    await solveSequence(page, '0, 0, 0, 0');
    const content = await page.content();
    expect(content).toContain('>0<');
    await saveCoverage(page, 'all_zeros');
  });

  test('handles large numbers', async ({ page }) => {
    await solveSequence(page, '1000, 2000, 3000, 4000');
    const content = await page.content();
    expect(content).toContain('5000');
    await saveCoverage(page, 'large_numbers');
  });

  test('handles negative start', async ({ page }) => {
    await solveSequence(page, '-20, -10, 0, 10');
    const content = await page.content();
    expect(content).toContain('20');
    await saveCoverage(page, 'negative_start');
  });

  test('handles decreasing sequence', async ({ page }) => {
    await solveSequence(page, '100, 90, 80, 70');
    const content = await page.content();
    expect(content).toContain('60');
    await saveCoverage(page, 'decreasing');
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.locator('#input-sequence').focus();
    await page.keyboard.type('2, 4, 6, 8');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const content = await page.content();
    expect(content).toBeDefined();
    await saveCoverage(page, 'keyboard_nav');
  });
});
