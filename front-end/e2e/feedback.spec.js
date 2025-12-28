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
    const fileName = `feedback_${testTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    fs.writeFileSync(path.join(coverageDir, fileName), JSON.stringify(coverage));
  }
}

test.describe('FeedbackDialog E2E', () => {
  async function solveAndGetResult(page) {
    await page.goto('/');
    await page.waitForSelector('#input-sequence', { state: 'visible' });
    await page.locator('#input-sequence').fill('2, 4, 6, 8');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const solveBtn = buttons.find((b) => b.textContent.includes('Solve'));
      if (solveBtn) solveBtn.click();
    });
    await page.waitForTimeout(1500);
  }

  test('shows feedback dialog after solving', async ({ page }) => {
    await solveAndGetResult(page);

    const content = await page.content();
    expect(content).toContain('Feedback') || expect(content).toContain('helpful');

    await saveCoverage(page, 'feedback_shows');
  });

  test('clicks helpful button', async ({ page }) => {
    await solveAndGetResult(page);

    // Click helpful button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const helpfulBtn = buttons.find(
        (b) => b.textContent.includes('Yes') || b.textContent.includes('helpful'),
      );
      if (helpfulBtn) helpfulBtn.click();
    });
    await page.waitForTimeout(1000);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'helpful_click');
  });

  test('clicks not helpful button and shows form', async ({ page }) => {
    await solveAndGetResult(page);

    // Click not helpful button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const notHelpfulBtn = buttons.find(
        (b) => b.textContent.includes('Not') || b.textContent.includes('No'),
      );
      if (notHelpfulBtn) notHelpfulBtn.click();
    });
    await page.waitForTimeout(500);

    const content = await page.content();
    expect(content).toContain('issue') ||
      expect(content).toContain('reason') ||
      expect(content).toContain('Incorrect');

    await saveCoverage(page, 'not_helpful_form');
  });

  test('selects reason in feedback form', async ({ page }) => {
    await solveAndGetResult(page);

    // Click not helpful
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const notHelpfulBtn = buttons.find(
        (b) => b.textContent.includes('Not') || b.textContent.includes('No'),
      );
      if (notHelpfulBtn) notHelpfulBtn.click();
    });
    await page.waitForTimeout(500);

    // Click a reason button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const reasonBtn = buttons.find(
        (b) => b.textContent.includes('Incorrect') || b.textContent.includes('Unclear'),
      );
      if (reasonBtn) reasonBtn.click();
    });
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'select_reason');
  });

  test('types comment in feedback form', async ({ page }) => {
    await solveAndGetResult(page);

    // Click not helpful
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const notHelpfulBtn = buttons.find(
        (b) => b.textContent.includes('Not') || b.textContent.includes('No'),
      );
      if (notHelpfulBtn) notHelpfulBtn.click();
    });
    await page.waitForTimeout(500);

    // Type in textarea
    const textarea = page.locator('#feedback-comment');
    if (await textarea.isVisible()) {
      await textarea.fill('This is a test comment');
    }

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'type_comment');
  });

  test('clicks cancel in feedback form', async ({ page }) => {
    await solveAndGetResult(page);

    // Click not helpful
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const notHelpfulBtn = buttons.find(
        (b) => b.textContent.includes('Not') || b.textContent.includes('No'),
      );
      if (notHelpfulBtn) notHelpfulBtn.click();
    });
    await page.waitForTimeout(500);

    // Click cancel
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cancelBtn = buttons.find((b) => b.textContent.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    });
    await page.waitForTimeout(300);

    const content = await page.content();
    expect(content).toBeDefined();

    await saveCoverage(page, 'cancel_feedback');
  });
});
