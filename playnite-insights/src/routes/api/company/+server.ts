import { withInstanceAuth } from '$lib/server/api/authentication';
import { createHashForObject } from '$lib/server/api/hash';
import { getAllCompaniesResponseSchema } from '@playatlas/game-library/core';
import { emptyResponse } from '@playatlas/system/app';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
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
