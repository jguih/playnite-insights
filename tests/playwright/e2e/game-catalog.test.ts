import { m } from '$lib/paraglide/messages';
import test, { expect } from 'playwright/test';

test('shows search bar on home page', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByPlaceholder(m.home_search_bar_placeholder())).toBeVisible();
});
