import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { ensureSyncId } from '$lib/server/api/synchronization';
import { badRequest, emptyResponse } from '@playnite-insights/lib/client';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, request, url, locals: { services, api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		await ensureSyncId({ request, url, ...services });
		const { noteId } = params;
		if (!noteId) {
			return badRequest();
		}
		services.gameNoteRepository.remove(noteId);
		return emptyResponse(204);
	});
