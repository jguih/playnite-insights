import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { baseExtensionCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const command = baseExtensionCommandSchema.parse(body);
		const isAuthorized = services.authentication.verifyExtensionAuthorization({
			headers: request.headers,
			payload: JSON.stringify(body),
			extensionId: command.ExtensionId,
		});
		if (!isAuthorized) {
			return new Response(null, { status: 403 });
		}
		return json({ status: 'OK' });
	} catch (error) {
		return handleApiError(error, `GET /api/health`);
	}
};
