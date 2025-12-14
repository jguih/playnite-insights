import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import type { GetServerUtcNowResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const data: GetServerUtcNowResponse = {
			utcNow: new Date().toISOString(),
		};
		return json(data);
	});
