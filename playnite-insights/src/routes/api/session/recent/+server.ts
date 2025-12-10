import { createHashForObject } from '$lib/server/api/hash';
import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { emptyResponse, getRecentSessionsResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { services, api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
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
