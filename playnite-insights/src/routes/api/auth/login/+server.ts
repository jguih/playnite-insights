import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { registerInstanceCommandSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const jsonBody = await request.json();
		const command = registerInstanceCommandSchema.parse(jsonBody);
		const sessionId = await services.authentication.loginInstanceAsync(command.password);
		return json({ sessionId });
	} catch (error) {
		return handleApiError(error, `${request.method} ${url.pathname}`);
	}
};
