import { services } from '$lib';
import { withExtensionAuth } from '$lib/server/api/authentication';
import { defaultSSEManager } from '@playnite-insights/infra';
import { syncGameListCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) =>
	withExtensionAuth(request, url, 'text', async (bodyRaw) => {
		if (!bodyRaw) {
			return json({ error: 'Empty body' }, { status: 400 });
		}
		const games = syncGameListCommandSchema.parse(JSON.parse(bodyRaw));
		const result = await services.playniteLibraryImporter.sync(games);
		if (result) {
			defaultSSEManager.broadcast({ type: 'gameLibraryUpdated', data: true });
			return json({ status: 'OK' }, { status: 200 });
		}
		return json(null, { status: 500 });
	});
