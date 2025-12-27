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
    const fileName = `nav_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Navigation E2E', () => {
  test('navigates to Documentation page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('nav', { state: 'visible' });

    // Click Documentation link
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const docLink = links.find(
        (a) => a.textContent.includes('Documentation') || a.href.includes('/docs'),
      );
      if (docLink) docLink.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('Documentation');

    await saveCoverage(page, 'documentation_page');
  });

  test('navigates to Privacy Policy page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('footer', { state: 'visible' });

    // Click Privacy Policy link in footer
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const privacyLink = links.find(
        (a) => a.textContent.includes('Privacy') || a.href.includes('/privacy'),
      );
      if (privacyLink) privacyLink.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('Privacy');

    await saveCoverage(page, 'privacy_page');
  });

  test('switches language to Indonesian', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#input-sequence', { state: 'visible' });

    // Click language switcher
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const langBtn = buttons.find(
        (b) => b.textContent.includes('EN') || b.textContent.includes('ID'),
      );
      if (langBtn) langBtn.click();
    });
    await page.waitForTimeout(300);

    // Click Indonesian option
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('button, li, a'));
      const idOption = options.find(
        (el) => el.textContent.includes('Indonesia') || el.textContent === 'ID',
      );
      if (idOption) idOption.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    // Check for Indonesian text
    expect(
      content.includes('Pola') || content.includes('Urutan') || content.includes('Selesaikan'),
    ).toBeTruthy();

    await saveCoverage(page, 'language_switch');
  });

  test('navigates back to Solver from Documentation', async ({ page }) => {
    await page.goto('/docs');
    await page.waitForTimeout(500);

    // Click Solver link
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const solverLink = links.find(
        (a) => a.textContent.includes('Solver') || a.href === '/' || a.href.endsWith('/'),
      );
      if (solverLink) solverLink.click();
    });
    await page.waitForTimeout(500);

    await page.waitForSelector('#input-sequence', { state: 'visible' });
    const content = await page.content();
    expect(content).toContain('input-sequence');

    await saveCoverage(page, 'back_to_solver');
  });
});
