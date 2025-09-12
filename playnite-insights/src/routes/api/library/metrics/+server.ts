import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import {
	emptyResponse,
	getPlayniteLibraryMetricsResponseSchema,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const data = services.playniteLibrary.getLibraryMetrics();
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
	} catch (err) {
		return handleApiError(err);
	}
};
