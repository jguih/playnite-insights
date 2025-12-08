import { createHashForObject } from '$lib/server/api/hash';
import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { services, api } }) =>
	extensionAuthMiddleware({ request, api }, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const manifest = await services.libraryManifestService.get();
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
