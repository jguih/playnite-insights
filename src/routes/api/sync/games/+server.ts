import { syncGameList } from '$lib/services/playnite-library-importer';
import { logDebug, logInfo } from '$lib/services/log';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	logDebug('Received request to sync games');
	const contentLength = request.headers.get('content-length');
	if (contentLength) {
		const sizeMb = (parseInt(contentLength, 10) / (1024 * 1024)).toFixed(2);
		logInfo(`Request body size: ${sizeMb} MB`);
	} else {
		logInfo('Request body size: unknown');
	}
	const data = await request.json();
	const result = syncGameList(data);
	if (result) {
		return json(null, { status: 200 });
	}
	return json(null, { status: 500 });
};
