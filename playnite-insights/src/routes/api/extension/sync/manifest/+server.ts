import { services } from '$lib';
import { withExtensionAuth } from '$lib/server/api/authentication';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) =>
	withExtensionAuth(request, url, 'none', async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
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
	});
