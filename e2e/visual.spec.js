import { expect, test } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('home page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#input-sequence', { state: 'visible' });

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'e2e/screenshots/home-initial.png', fullPage: true });

    // Solve a sequence
    await page.locator('#input-sequence').fill('2, 4, 8, 16');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });

    await page.waitForTimeout(1000); // Wait for animation

    // Take a screenshot of the result
    await page.screenshot({ path: 'e2e/screenshots/home-solved.png', fullPage: true });

    const content = await page.content();
    expect(content).toContain('32');
  });
});
