import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { defaultSSEManager } from '@playnite-insights/infra';
import { badRequest, emptyResponse, openGameSessionSchema } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const command = openGameSessionSchema.parse(jsonBody);
		const result = services.gameSession.open(command);
		if (result) {
			defaultSSEManager.broadcast({ type: 'sessionOpened', data: true });
			return emptyResponse(200);
		}
		return badRequest();
	} catch (err) {
		return handleApiError(err);
	}
};
