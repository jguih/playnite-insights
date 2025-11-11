import { withInstanceAuth } from '$lib/infra/api/authentication';
import type { GetServerUtcNowResponse } from '@playatlas/system/core';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		const data: GetServerUtcNowResponse = {
			utcNow: new Date().toISOString(),
		};
		return json(data);
	});
