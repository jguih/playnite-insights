import { handleApiError } from '$lib/server/api/handle-error';
import { defaultSSEManager } from '@playnite-insights/infra';
import type { UploadScreenshotResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { services } }) => {
	try {
		const result = await services.mediaFilesService.uploadScreenshotsAsync(request);
		const imagePaths = result.map((fileName) => `/api/assets/image/screenshot/${fileName}`);
		const response: UploadScreenshotResponse = {
			uploaded: imagePaths,
		};
		defaultSSEManager.broadcast({ type: 'screenshotTaken', data: { paths: imagePaths } });
		return json(response);
	} catch (error) {
		return handleApiError(error, services.logService, `POST /api/assets/upload/screenshot`);
	}
};
