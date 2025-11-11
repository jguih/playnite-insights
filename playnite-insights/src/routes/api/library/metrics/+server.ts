import { withInstanceAuth } from '$lib/infra/api/authentication';
import { createHashForObject } from '$lib/infra/api/hash';
import { emptyResponse } from '$lib/infra/api/utils';
import { getPlayniteLibraryMetricsResponseSchema } from '@playatlas/game-library/core';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const data = services.playniteLibraryService.getLibraryMetrics();
		if (!data) {
			return emptyResponse();
		}
		getPlayniteLibraryMetricsResponseSchema.parse(data);
		const hash = createHashForObject(data);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(data, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	});
