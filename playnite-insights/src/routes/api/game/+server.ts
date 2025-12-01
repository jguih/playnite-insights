import { withInstanceAuth } from '$lib/server/api/authentication';
import { emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url, locals: { services, api } }) =>
	withInstanceAuth(request, url, services, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const result = api.gameLibrary.queries.getAllGamesHandler().execute({ ifNoneMatch });
		if (result.type === 'not_modified') return emptyResponse(304);
		else return json(result.data, { headers: { 'Cache-Control': 'no-cache', ETag: result.etag } });
	});
