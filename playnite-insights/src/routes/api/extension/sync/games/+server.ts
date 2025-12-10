import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { defaultSSEManager } from '@playnite-insights/infra';
import { syncGameListCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { services, api } }) =>
	extensionAuthMiddleware({ request, api }, async (result) => {
		if (!result.body) {
			return json({ error: 'Empty body' }, { status: 400 });
		}
		const games = syncGameListCommandSchema.parse(JSON.parse(result.body));
		await services.playniteLibraryImporterService.sync(games);
		defaultSSEManager.broadcast({ type: 'gameLibraryUpdated', data: true });
		return json({ status: 'OK' }, { status: 200 });
	});
