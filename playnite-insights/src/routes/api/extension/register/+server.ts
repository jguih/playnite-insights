import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { defaultSSEManager } from '@playnite-insights/infra';
import { registerExtensionCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const body = await request.json();
		const command = registerExtensionCommandSchema.parse(body);
		const { status, registrationId } = services.extensionRegistration.register(command);
		defaultSSEManager.broadcast({ type: 'createdExtensionRegistration', data: true });
		return json({ registrationId }, { status });
	} catch (error) {
		return handleApiError(error, `${request.method} ${url.pathname}`);
	}
};
