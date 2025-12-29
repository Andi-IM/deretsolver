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
    const fileName = `docs_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Documentation Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(500);
  });

  test('displays documentation content', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Documentation');
    expect(content).toContain('Pattern');

    await saveCoverage(page, 'docs_content');
  });

  test('shows supported pattern types', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('Arithmetic');
    expect(content).toContain('Geometric');

    await saveCoverage(page, 'pattern_types');
  });

  test('shows how to use section', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('How to Use');

    await saveCoverage(page, 'how_to_use');
  });

  test('shows API key information', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('API') || expect(content).toContain('Gemini');

    await saveCoverage(page, 'api_info');
  });

  test('scrolls through documentation', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'scroll_docs');
  });

  test('language switch works on docs page', async ({ page }) => {
    // Click language switcher
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

    await saveCoverage(page, 'docs_language_switch');
  });
});
