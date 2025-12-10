import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { defaultSSEManager } from '@playnite-insights/infra';
import { badRequest, closeGameSessionSchema, emptyResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { services, api } }) =>
	extensionAuthMiddleware({ request, api }, async (result) => {
		if (!result.body) {
			return json({ error: { message: 'Empty body' } }, { status: 400 });
		}
		const command = closeGameSessionSchema.parse(JSON.parse(result.body));
		const closeResult = services.gameSessionService.close(command);
		if (closeResult) {
			defaultSSEManager.broadcast({ type: 'sessionClosed', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	});
