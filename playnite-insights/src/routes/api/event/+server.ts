import { withInstanceAuth } from '$lib/server/api/authentication';
import { defaultSSEManager } from '@playnite-insights/infra';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) =>
	withInstanceAuth(
		request,
		url,
		async (isAuthorized) => {
			const stream = defaultSSEManager.createStream({ isAuthorized });
			return stream.response;
		},
		true,
	);
