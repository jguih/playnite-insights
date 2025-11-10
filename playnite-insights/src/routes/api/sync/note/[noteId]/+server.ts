import { withInstanceAuth } from '$lib/server/api/authentication';
import { ensureSyncId } from '$lib/server/api/synchronization';
import { badRequest, emptyResponse } from '@playatlas/system/app';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		await ensureSyncId({ request, url, ...services });
		const { noteId } = params;
		if (!noteId) {
			return badRequest();
		}
		services.gameNoteRepository.remove(noteId);
		return emptyResponse(204);
	});
