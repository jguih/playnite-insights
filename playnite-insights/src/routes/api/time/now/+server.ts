import { withInstanceAuth } from '$lib/server/api/authentication';
import type { GetServerUtcNowResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		const data: GetServerUtcNowResponse = {
			utcNow: new Date().toISOString(),
		};
		return json(data);
	});
