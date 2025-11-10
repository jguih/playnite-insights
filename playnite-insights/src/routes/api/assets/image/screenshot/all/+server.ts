import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse } from '@playatlas/system/app';
import { type GetAllScreenshotsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { services } }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const result = await services.mediaFilesService.getAvailableScreenshots();
		const parsedResult = result.map((image) => {
			return {
				...image,
				Path: `/api/assets/image/screenshot/${image.FileName}`,
			};
		});
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
		return handleApiError(error, services.logService, `GET /api/assets/image/screenshot/all`);
	}
};
