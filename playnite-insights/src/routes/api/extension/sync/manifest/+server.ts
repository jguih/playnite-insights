import { withExtensionAuth } from '$lib/infra/api/authentication';
import { createHashForObject } from '$lib/infra/api/hash';
import { emptyResponse } from '$lib/infra/api/utils';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withExtensionAuth(request, url, services, 'none', async () => {
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
