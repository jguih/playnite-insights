import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { badRequest, emptyResponse } from '@playnite-insights/lib/client';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
	const { noteId } = params;

	if (!noteId) {
		return badRequest();
	}

	try {
		services.noteRepository.remove(noteId);
		return emptyResponse(204);
	} catch (err) {
		return handleApiError(err);
	}
};
