import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const isAuthorized = services.authentication.verifyExtensionAuthorization({
			request,
			url,
		});
		if (!isAuthorized) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}
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
