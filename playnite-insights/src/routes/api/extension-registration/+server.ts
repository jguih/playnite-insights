import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { apiResponse } from '$lib/server/api/responses';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const ifNoneMatch = request.headers.get('if-none-match');
		const result = api.auth.queries
			.getGetAllExtensionRegistrationsQueryHandler()
			.execute({ ifNoneMatch });
		if (result.type === 'not_modified') return apiResponse.notModified();
		return json(
			{ registrations: result.data },
			{ headers: { 'Cache-Control': 'no-cache', ETag: result.etag } },
		);
	});
