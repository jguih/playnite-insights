import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { registerExtensionCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const body = await request.json();
		const command = registerExtensionCommandSchema.parse(body);
		const registrationId = services.extensionRegistration.register(command);
		return json({ registrationId }, { status: 201 });
	} catch (error) {
		return handleApiError(error, `${request.method} ${url.pathname}`);
	}
};
