import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { emptyResponse, registerExtensionCommandSchema } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const body = await request.json();
		const command = registerExtensionCommandSchema.parse(body);
		services.extensionRegistration.register(command);
		return emptyResponse(204);
	} catch (error) {
		return handleApiError(error, `${request.method} ${url.pathname}`);
	}
};
