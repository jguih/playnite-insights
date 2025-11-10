import { handleApiError } from '$lib/server/api/handle-error';
import { registerExtensionCommandSchema } from '@playatlas/playnite-integration/core';
import { defaultSSEManager } from '@playnite-insights/infra';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) => {
	try {
		const body = await request.json();
		const command = registerExtensionCommandSchema.parse(body);
		const { status, registration } = services.extensionRegistrationService.register(command);
		defaultSSEManager.broadcast({ type: 'createdExtensionRegistration', data: registration });
		return json({ registrationId: registration.Id }, { status });
	} catch (error) {
		return handleApiError(error, services.logService, `${request.method} ${url.pathname}`);
	}
};
