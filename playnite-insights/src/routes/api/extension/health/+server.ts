import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { baseExtensionCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const rawBody = await request.text();
		const command = baseExtensionCommandSchema.parse(JSON.parse(rawBody));
		const isAuthorized = services.authentication.verifyExtensionAuthorization({
			headers: request.headers,
			payload: rawBody,
			extensionId: command.ExtensionId,
		});
		if (!isAuthorized) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}
		return json({ status: 'OK' });
	} catch (error) {
		return handleApiError(error, `GET /api/extension/health`);
	}
};
