import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { defaultSSEManager } from '@playnite-insights/infra';
import { badRequest, closeGameSessionSchema, emptyResponse } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const command = closeGameSessionSchema.parse(jsonBody);
		const result = services.gameSession.close(command);
		if (result) {
			defaultSSEManager.broadcast({ type: 'sessionClosed', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	} catch (err) {
		return handleApiError(err);
	}
};
