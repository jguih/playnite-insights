import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { api } }) =>
	extensionAuthMiddleware({ request, api }, async () => {
		await api.playniteIntegration
			.getPlayniteSyncService()
			.handleMediaFilesSynchronizationRequest(request);
		return json({ status: 'OK' });
	});
