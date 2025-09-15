import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import type { UploadScreenshotResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const result = await services.image.uploadScreenshotsAsync(request);
		const parsedResult = result.map((fileName) => `/api/assets/image/screenshot/${fileName}`);
		const response: UploadScreenshotResponse = {
			uploaded: parsedResult,
		};
		return json(response);
	} catch (error) {
		return handleApiError(error, `POST /api/assets/upload/screenshot`);
	}
};
