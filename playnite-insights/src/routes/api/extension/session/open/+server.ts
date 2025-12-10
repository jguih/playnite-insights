import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { defaultSSEManager } from '@playnite-insights/infra';
import { badRequest, emptyResponse, openGameSessionSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { services, api } }) =>
	extensionAuthMiddleware({ request, api }, async (result) => {
		console.log('Hey, look at this:', result);
		if (!result.body) {
			return json({ error: { message: 'Empty body' } }, { status: 400 });
		}
		const command = openGameSessionSchema.parse(JSON.parse(result.body));
		const openResult = services.gameSessionService.open(command);
		if (openResult) {
			defaultSSEManager.broadcast({ type: 'sessionOpened', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	});
