import { expect, test } from '@playwright/test';

test.describe('Quiz Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz');
    // Wait for the app to be interactive
    await expect(page.locator('button.border-2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display quiz interface', async ({ page }) => {
    await expect(page.getByText('Pattern Quiz')).toBeVisible();
    await expect(page.getByText('Find the missing number')).toBeVisible();

    // Check for 4 options
    const buttons = page.locator('button.border-2');
    await expect(buttons).toHaveCount(4);
  });

  test('should allow selecting an option and showing feedback', async ({ page }) => {
    // Select first option
    const firstOption = page.locator('button.border-2').first();
    await expect(firstOption).toBeEnabled();
    await firstOption.click();

    // Check for feedback
    await expect(page.getByText('Rule:')).toBeVisible();

    // Check next button
    const nextBtn = page.getByRole('button', { name: 'Next Question' });
    await expect(nextBtn).toBeVisible();
  });

  test('should load new question on next', async ({ page }) => {
    // Answer first question
    const firstOption = page.locator('button.border-2').first();
    await firstOption.click();

    // Click next
    const nextBtn = page.getByRole('button', { name: 'Next Question' });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify feedback gone
    await expect(page.getByText('Rule:')).not.toBeVisible();

    // Verify options are enabled again
    await expect(page.locator('button.border-2').first()).toBeEnabled();
  });
});
