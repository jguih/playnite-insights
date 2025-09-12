import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse, getAllGenresResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		const data = services.genreRepository.all();
		if (!data || data.length === 0) {
			return emptyResponse();
		}
		getAllGenresResponseSchema.parse(data);
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
