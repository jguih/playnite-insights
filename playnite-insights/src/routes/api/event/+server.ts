import { withInstanceAuth } from '$lib/infra/api/authentication';
import { defaultSSEManager } from '@playnite-insights/infra';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(
		request,
		url,
		services,
		async (isAuthorized) => {
			const stream = defaultSSEManager.createStream({ isAuthorized });
			return stream.response;
		},
		true,
	);
