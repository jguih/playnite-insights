import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { defaultSSEManager } from '@playnite-insights/infra';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async (result) => {
		const stream = defaultSSEManager.createStream({ isAuthorized: result.authorized });
		return stream.response;
	});
