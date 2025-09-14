import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const result = await services.image.uploadScreenshotsAsync(request);
		return json({ files: result });
	} catch (error) {
		return handleApiError(error, `POST /api/assets/upload/screenshot`);
	}
};
