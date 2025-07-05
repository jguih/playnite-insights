import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	services.log.logDebug('Received request to sync library files');
	const contentLength = request.headers.get('content-length');
	if (contentLength) {
		const sizeMb = (parseInt(contentLength, 10) / (1024 * 1024)).toFixed(2);
		services.log.logInfo(`Request body size: ${sizeMb} MB`);
	} else {
		services.log.logInfo('Request body size: unknown');
	}
	const contentType = request.headers.get('content-type');
	if (!contentType?.startsWith('application/zip')) {
		return json("Invalid content type. Expected 'application/zip'.", { status: 400 });
	}
	const result = await services.playniteLibraryImport.importMediaFiles(request.body);
	return json(result, { status: result.httpCode });
};
