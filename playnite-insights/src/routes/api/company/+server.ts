import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import { createHashForObject } from '$lib/server/api/hash';
import { emptyResponse, getAllCompaniesResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url }) =>
	withInstanceAuth(request, url, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const data = services.companyRepository.all();
		if (!data || data.length === 0) {
			return emptyResponse();
		}
		getAllCompaniesResponseSchema.parse(data);
		const hash = createHashForObject(data);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(data, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	});
