import { withExtensionAuth } from '$lib/server/api/authentication';
import { defaultSSEManager } from '@playnite-insights/infra';
import { badRequest, emptyResponse, openGameSessionSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) =>
	withExtensionAuth(request, url, services, 'text', async (bodyRaw) => {
		if (!bodyRaw) {
			return json({ error: 'Empty body' }, { status: 400 });
		}
		const command = openGameSessionSchema.parse(JSON.parse(bodyRaw));
		const result = services.gameSessionService.open(command);
		if (result) {
			defaultSSEManager.broadcast({ type: 'sessionOpened', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	});
