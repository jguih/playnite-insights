import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import type { GetAllScreenshotsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const result = await services.mediaFiles.getAvailableScreenshots();
		const parsedResult = result.map((fileName) => `/api/assets/image/screenshot/${fileName}`);
		const response: GetAllScreenshotsResponse = {
			screenshots: parsedResult,
		};
		return json(response);
	} catch (error) {
		return handleApiError(error, `GET /api/assets/image/screenshot/all`);
	}
};
