import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const manifest = await services.libraryManifest.get();
		if (!manifest) {
			return emptyResponse();
		}
		const hash = createHashForObject(manifest);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(manifest, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	} catch (err) {
		return handleApiError(err);
	}
};
