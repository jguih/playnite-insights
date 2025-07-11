import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	services.log.info('Received request to sync library files');
	const result = await services.playniteLibraryImporter.importMediaFiles(request);
	return json(result, { status: result.httpCode });
};
