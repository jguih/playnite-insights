import { withInstanceAuth } from '$lib/infra/api/authentication';
import { ensureSyncId } from '$lib/infra/api/synchronization';
import { badRequest, emptyResponse } from '$lib/infra/api/utils';
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
