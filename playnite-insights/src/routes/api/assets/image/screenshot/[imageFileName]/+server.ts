import { services } from '$lib';
import { type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request }) => {
	const { imageFileName } = params;
	if (!imageFileName) return new Response(null, { status: 400 });
	const ifNoneMatch = request.headers.get('if-none-match');
	const ifModifiedSince = request.headers.get('if-modified-since');
	try {
		return await services.mediaFiles.getScreenshotAsync(
			imageFileName,
			ifNoneMatch,
			ifModifiedSince,
		);
	} catch (error) {
		services.log.error(`Error reading image file: ${imageFileName}`, error as Error);
		return new Response(null, { status: 500 });
	}
};
