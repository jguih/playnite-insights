import { withInstanceAuth } from '$lib/server/api/authentication';
import { createHashForObject } from '$lib/server/api/hash';
import { getRecentSessionsResponseSchema } from '@playatlas/game-library/core';
import { emptyResponse } from '@playatlas/system/app';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const data = services.gameSessionService.getRecent();
		if (!data || data.length === 0) {
			return json([], { headers: { 'Cache-Control': 'no-cache' } });
		}
		getRecentSessionsResponseSchema.parse(data);
		const hash = createHashForObject(data);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(data, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	});
