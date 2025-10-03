import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import { ensureSyncId } from '$lib/server/api/synchronization';
import { badRequest, emptyResponse } from '@playnite-insights/lib/client';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, request, url }) =>
	withInstanceAuth(request, url, async () => {
		await ensureSyncId(request, url);
		const { noteId } = params;
		if (!noteId) {
			return badRequest();
		}
		services.noteRepository.remove(noteId);
		return emptyResponse(204);
	});
