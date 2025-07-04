import { syncGameList } from '$lib/services/playnite-library-importer';
import { logDebug } from '$lib/services/log';
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
