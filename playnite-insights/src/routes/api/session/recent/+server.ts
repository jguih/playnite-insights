import { services } from '$lib';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse, getRecentSessionsResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');
	// const ifModifiedSince = request.headers.get('if-modified-since');

	const _data = services.gameSession.getRecent();

	if (!_data || _data.length === 0) {
		return emptyResponse();
	}

	const result = getRecentSessionsResponseSchema.safeParse(_data);

	if (!result.success) {
		services.log.error(`Schema validation failed: ${result.error.format()}`);
		return json(
			{ error: { message: 'Invalid server data', details: result.error.flatten() } },
			{ status: 500 },
		);
	}

	const hash = createHashForObject(result.data);
	const etag = `"${hash}"`;

	if (ifNoneMatch === etag) {
		return new Response(null, { status: 304 });
	}

	return json(result.data, {
		headers: { 'Cache-Control': 'no-cache', ETag: etag },
	});
};
