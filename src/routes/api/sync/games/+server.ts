import { logDebug } from '$lib/log/log';
import { syncGameList } from '$lib/playnite-library-sync/playnite-library-importer';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	logDebug('Received request to sync game library');
	const data = await request.json();
	const result = await syncGameList(data);
	if (result) {
		return json(null, { status: 200 });
	}
	return json(null, { status: 500 });
};
