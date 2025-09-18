import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { defaultSSEManager } from '@playnite-insights/infra';
import { syncGameListCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	services.log.info('Received request to sync game library');

	try {
		const data = await request.json();
		const games = syncGameListCommandSchema.parse(data);
		const result = await services.playniteLibraryImporter.sync(games);
		if (result) {
			defaultSSEManager.broadcast({ type: 'gameLibraryUpdated', data: true });
			return json({ status: 'OK' }, { status: 200 });
		}
		return json(null, { status: 400 });
	} catch (err) {
		return handleApiError(err);
	}
};
