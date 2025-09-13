import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { createHashForObject } from '$lib/server/api/hash';
import {
	createGameNoteCommandSchema,
	createGameNoteResponseSchema,
	emptyResponse,
	getAllGameNotesResponseSchema,
	updateGameNoteCommandSchema,
	updateGameNoteResponseSchema,
	type GameNote,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url }) => {
	const lastSync = url.searchParams.get('lastSync');
	const ifNoneMatch = request.headers.get('if-none-match');

	try {
		let data: GameNote[] = [];
		if (lastSync && !isNaN(Date.parse(lastSync))) {
			return json(
				{ error: { message: 'lastSync param must be a valid ISO date string' } },
				{ status: 400 },
			);
		} else if (lastSync) {
			const lastSyncDate = new Date(lastSync);
			data = services.noteRepository.all({
				filters: { lastUpdatedAt: [{ op: 'gte', value: lastSyncDate.toISOString() }] },
			});
		} else {
			data = services.noteRepository.all();
		}
		if (!data || data.length === 0) {
			return emptyResponse();
		}
		getAllGameNotesResponseSchema.parse(data);
		const hash = createHashForObject(data);
		const etag = `"${hash}"`;
		if (ifNoneMatch === etag) {
			return emptyResponse(304);
		}
		return json(data, { headers: { 'Cache-Control': 'no-cache', ETag: etag } });
	} catch (err) {
		return handleApiError(err);
	}
};

/**
 * 201: Created
 * 409: Conflic (note already exists)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const command = createGameNoteCommandSchema.parse(jsonBody);
		const existingNote = services.noteRepository.getById(command.Id);
		if (existingNote) {
			createGameNoteResponseSchema.parse(existingNote);
			return json(existingNote, { status: 409 });
		}
		const createdNote = services.noteRepository.add(command);
		createGameNoteResponseSchema.parse(createdNote);
		return json(createdNote, { status: 201 });
	} catch (err) {
		return handleApiError(err, `POST /api/note`);
	}
};

/**
 * 200: Updated
 * 404: Not Found
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const command = updateGameNoteCommandSchema.parse(jsonBody);
		const existingNote = services.noteRepository.getById(command.Id);
		if (!existingNote) {
			return json(null, { status: 404 });
		}
		const updatedNote = services.noteRepository.update(command);
		updateGameNoteResponseSchema.parse(updatedNote);
		return json(updatedNote);
	} catch (err) {
		return handleApiError(err);
	}
};
