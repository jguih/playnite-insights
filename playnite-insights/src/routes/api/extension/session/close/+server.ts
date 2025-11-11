import { withExtensionAuth } from '$lib/infra/api/authentication';
import { badRequest, emptyResponse } from '$lib/infra/api/utils';
import { closeGameSessionSchema } from '@playatlas/game-library/core';
import { defaultSSEManager } from '@playnite-insights/infra';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) =>
	withExtensionAuth(request, url, services, 'text', async (bodyRaw) => {
		if (!bodyRaw) {
			return json({ error: 'Empty body' }, { status: 400 });
		}
		const command = closeGameSessionSchema.parse(JSON.parse(bodyRaw));
		const result = services.gameSessionService.close(command);
		if (result) {
			defaultSSEManager.broadcast({ type: 'sessionClosed', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	});
