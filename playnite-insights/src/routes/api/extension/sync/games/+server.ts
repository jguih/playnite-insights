import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { apiResponse } from '$lib/server/api/responses';
import {
	makeSyncGamesCommand,
	syncGamesRequestDtoSchema,
} from '@playatlas/playnite-integration/commands';
import { defaultSSEManager } from '@playnite-insights/infra';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { api } }) =>
	extensionAuthMiddleware({ request, api }, async (result) => {
		if (!result.body) {
			return json({ error: 'Request body cannot be empty' }, { status: 400 });
		}

		const { success, data, error } = syncGamesRequestDtoSchema.safeParse(JSON.parse(result.body));
		if (!success) {
			api
				.getLogService()
				.error(
					`${api.getLogService().getRequestDescription(request)}: Validation error while handling request`,
					error.issues.slice(0, 10),
				);
			return apiResponse.error({
				error: { message: 'Validation error', details: error.issues },
			});
		}

		const command = makeSyncGamesCommand(data);
		const commandResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(command);

		if (commandResult.success) {
			defaultSSEManager.broadcast({ type: 'gameLibraryUpdated', data: true });
			return json({ status: 'OK' }, { status: 200 });
		}

		return apiResponse.error({ error: { message: 'Internal server error' } });
	});
