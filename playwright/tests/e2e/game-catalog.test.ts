import test, { expect } from 'playwright/test';

test('shows search bar on home page', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
});
