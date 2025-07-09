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
	await expect(page).toHaveURL((url) => new URL(url).pathname === '/dash');

	// Navigate back
	await page.goBack();
	await expect(page).toHaveURL((url) => new URL(url).pathname === '/');

	// Wait for <main> to be re-mounted
	const main = page.locator('main');
	await main.waitFor();

	await expect(async () => {
		const scrollTop = await main.evaluate((el) => el.scrollTop);
		expect(scrollTop).toBeGreaterThan(400);
	}).toPass();
});
