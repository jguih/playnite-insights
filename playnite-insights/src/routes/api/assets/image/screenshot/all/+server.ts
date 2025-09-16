import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse, type GetAllScreenshotsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const result = await services.mediaFiles.getAvailableScreenshots();
		const parsedResult = result.map((fileName) => `/api/assets/image/screenshot/${fileName}`);
		const response: GetAllScreenshotsResponse = {
			screenshots: parsedResult,
		};
		const hash = createHashForObject(response);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(response, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	} catch (error) {
		return handleApiError(error, `GET /api/assets/image/screenshot/all`);
	}
};
