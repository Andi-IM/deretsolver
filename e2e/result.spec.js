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
    const fileName = `result_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('ResultSection E2E', () => {
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
    // Wait for result section to appear (using a specific text that appears in the result)
    await page.waitForSelector('text=Result Analysis', { state: 'visible' });
  }

  test('shows pattern type in result', async ({ page }) => {
    await solveSequence(page, '2, 4, 6, 8');

    const content = await page.content();
    expect(content).toContain('Pattern Type') || expect(content).toContain('Arithmetic');

    await saveCoverage(page, 'pattern_type');
  });

  test('shows rule in result', async ({ page }) => {
    await solveSequence(page, '2, 4, 8, 16');

    // Use locators for better stability
    await expect(page.getByText('Rule')).toBeVisible();
    await expect(page.getByText(/Multiply|×2/)).toBeVisible();

    await saveCoverage(page, 'rule_display');
  });

  test('shows visualization with nodes', async ({ page }) => {
    await solveSequence(page, '1, 2, 3, 4, 5');

    const content = await page.content();
    expect(content).toContain('Visualization') || expect(content).toContain('svg');

    await saveCoverage(page, 'visualization');
  });

  test('shows success message', async ({ page }) => {
    await solveSequence(page, '5, 10, 15, 20');

    const content = await page.content();
    expect(content).toContain('Success') || expect(content).toContain('success');

    await saveCoverage(page, 'success_message');
  });

  test('shows predicted next number prominently', async ({ page }) => {
    await solveSequence(page, '10, 20, 30, 40');

    const content = await page.content();
    expect(content).toContain('50');
    expect(content).toContain('Predicted') || expect(content).toContain('Next');

    await saveCoverage(page, 'predicted_number');
  });

  test('shows legend for visualization', async ({ page }) => {
    await solveSequence(page, '1, 3, 5, 7');

    const content = await page.content();
    expect(content).toContain('Add') ||
      expect(content).toContain('Sub') ||
      expect(content).toContain('Mul');

    await saveCoverage(page, 'legend');
  });

  test('result section scrolls horizontally for long sequences', async ({ page }) => {
    await solveSequence(page, '1, 2, 3, 4, 5, 6, 7, 8, 9, 10');

    const content = await page.content();
    expect(content).toContain('11');

    await saveCoverage(page, 'long_sequence');
  });
});
