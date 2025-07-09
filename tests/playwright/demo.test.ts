import { expect, test } from '@playwright/test';

test('get library manifest', async ({ request }) => {
	const manifest = await request.get(`/api/sync/manifest`);
	expect(manifest.ok()).toBeFalsy();
});
