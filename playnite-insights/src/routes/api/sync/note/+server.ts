import { withInstanceAuth } from '$lib/server/api/authentication';
import { createHashForObject } from '$lib/server/api/hash';
import { ensureSyncId } from '$lib/server/api/synchronization';
import {
	createGameNoteCommandSchema,
	createGameNoteResponseSchema,
	getAllGameNotesResponseSchema,
	updateGameNoteCommandSchema,
	updateGameNoteResponseSchema,
	type GameLibraryApiErrorCode,
	type GameNote,
} from '@playatlas/game-library/core';
import { emptyResponse } from '@playatlas/system/app';
import type { ApiErrorResponse } from '@playatlas/system/core';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		await ensureSyncId({ request, url, ...services });
		const lastSync = url.searchParams.get('lastSync')?.trim();
		const ifNoneMatch = request.headers.get('if-none-match');
		let data: GameNote[] = [];
		if (lastSync && isNaN(Date.parse(lastSync))) {
			const response: ApiErrorResponse = {
				error: {
					code: 'invalid_iso_date',
					message: 'lastSync param must be a valid ISO date string',
				},
			};
			return json(response, { status: 400 });
		} else if (lastSync) {
			const lastSyncDate = new Date(lastSync);
			data = services.gameNoteRepository.all({
				filters: { lastUpdatedAt: [{ op: 'gte', value: lastSyncDate.toISOString() }] },
			});
		} else {
			data = services.gameNoteRepository.all();
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
	});

/**
 * 201: Created
 * 409: Conflict (note already exists)
 */
export const POST: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		await ensureSyncId({ request, url, ...services });
		const jsonBody = await request.json();
		const command = createGameNoteCommandSchema.parse(jsonBody);
		const existingNote = services.gameNoteRepository.getById(command.Id);
		if (existingNote) {
			const response: GameLibraryApiErrorCode = {
				error: {
					code: 'note_already_exists',
					note: existingNote,
				},
			};
			return json(response, { status: 409 });
		}
		const createdNote = services.gameNoteRepository.add(command);
		createGameNoteResponseSchema.parse(createdNote);
		return json(createdNote, { status: 201 });
	});

/**
 * 200: Updated
 * 404: Not Found
 */
export const PUT: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		await ensureSyncId({ request, url, ...services });
		const jsonBody = await request.json();
		const command = updateGameNoteCommandSchema.parse(jsonBody);
		const existingNote = services.gameNoteRepository.getById(command.Id);
		if (!existingNote) {
			return json(null, { status: 404 });
		}
		const updatedNote = services.gameNoteRepository.update(command);
		updateGameNoteResponseSchema.parse(updatedNote);
		return json(updatedNote);
	});
