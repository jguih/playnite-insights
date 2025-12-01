import { handleApiError } from '$lib/server/api/handle-error';
import {
	ApiError,
	registerInstanceCommandSchema,
	type LoginInstanceResponse,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) => {
	try {
		const jsonBody = await request.json();
		const command = registerInstanceCommandSchema.parse(jsonBody);
		const sessionId = await services.authService.loginInstanceAsync(command.password);
		const syncId = services.synchronizationIdRepository.get();
		if (!syncId)
			throw new ApiError({ error: { code: 'not_found' } }, `Synchronization id not found`, 404);
		services.logService.info(`New instance login`);
		const response: LoginInstanceResponse = {
			sessionId,
			syncId: syncId.SyncId,
		};
		return json(response);
	} catch (error) {
		return handleApiError(error, services.logService, `${request.method} ${url.pathname}`);
	}
};
