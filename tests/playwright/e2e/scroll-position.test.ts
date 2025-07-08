import { expect, test } from '@playwright/test';

test('restores scroll position when navigating back to home', async ({ page }) => {
	// Go to the home page and scroll
	await page.goto('/');
	await page.waitForSelector('main');

	await page.locator('main').evaluate((el) => {
		el.scrollTop = 500;
	});

	// Navigate to a different page
	await page.click('a[href="/dash"]');
	await expect(page).toHaveURL('/dash');

	// Navigate back
	await page.goBack();
	await expect(page).toHaveURL('/');

	// Wait for <main> to be re-mounted
	const main = page.locator('main');
	await main.waitFor();

	// Check scroll position
	const scrollTop = await main.evaluate((el) => el.scrollTop);
	expect(scrollTop).toBeGreaterThan(400);
});
