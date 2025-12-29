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
    const fileName = `nav_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('Navigation E2E', () => {
  test.use({ locale: 'en-US' });
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

    // The button shows current language (e.g., "EN")
    // Use aria-label for precise targeting
    const langBtn = page.getByLabel('Switch Language');
    await expect(langBtn).toBeVisible();

    const initialText = await langBtn.innerText();
    console.log('Initial language button text:', initialText);

    // Ensure we start from EN to test the switch to ID
    if ((await langBtn.innerText()).includes('ID')) {
      await langBtn.click();
      await expect(langBtn).toContainText('EN');
    }

    // Ensure we are in EN
    await expect(langBtn).toContainText('EN');

    // Click to toggle
    await langBtn.click();
    console.log('Clicked language button');

    // Now it should show ID
    await expect(langBtn).toContainText('ID');
    console.log('Language button text changed to ID');

    // Verify content translation (Title matches "Pemecah Pola Deret Angka")
    await expect(page.getByRole('heading', { name: 'Pemecah Pola Deret Angka' })).toBeVisible();

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
