import {
	FetchClientStrategyError,
	GameNoteFactory,
	SyncQueueFactory,
	type ApiErrorResponse,
	type GameNote,
	type IFetchClient,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IndexedDbSignal } from '../app-state/indexeddbManager.svelte';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from '../db/indexeddb';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { type IDateTimeHandler } from '../utils/dateTimeHandler.svelte';
import { SyncQueue } from './syncQueue.svelte';

const fakeFetchClient = {
	httpGetAsync: vi.fn(),
	httpPostAsync: vi.fn(),
	httpPutAsync: vi.fn(),
	httpDeleteAsync: vi.fn(),
} satisfies IFetchClient;
const indexedDbSignal: IndexedDbSignal = { db: null, dbReady: null };
const syncQueueFactory = new SyncQueueFactory();
const gameNoteFactory = new GameNoteFactory();
const syncQueueRepository = new SyncQueueRepository({ indexedDbSignal });
const dateTimeHandler: IDateTimeHandler = {
	getUtcNow: () => Date.now(),
};
const notesRepo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory, dateTimeHandler });

class TestSyncQueue extends SyncQueue {
	testUpdateGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.updateGameNoteAsync(queueItem);
	};

	testCreateGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.createGameNoteAsync(queueItem);
	};

	testDeleteGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.deleteGameNoteAsync(queueItem);
	};
}

const syncQueue = new TestSyncQueue({
	httpClient: fakeFetchClient,
	indexedDbSignal,
	syncQueueRepository,
});

const createAndUpdateNoteAsync = async (): Promise<GameNote> => {
	const note = gameNoteFactory.create({
		Title: 'Test Note',
		Content: 'Testing',
		GameId: null,
		ImagePath: null,
		SessionId: null,
	});
	await notesRepo.addAsync({ note });
	note.GameId = crypto.randomUUID();
	await notesRepo.putAsync({ note });
	return note;
};

describe('SyncQueue', () => {
	beforeEach(async () => {
		indexedDbSignal.dbReady = openIndexedDbAsync({
			dbName: INDEXEDDB_NAME,
			version: INDEXEDDB_CURRENT_VERSION,
		}).then((db) => {
			db.onversionchange = () => {
				db.close();
			};
			indexedDbSignal.db = db;
		});
		vi.resetAllMocks();
	});

	afterEach(() => {
		indexedDB.deleteDatabase(INDEXEDDB_NAME);
	});

	it('creates sync queue item of type create when update request fails with 404', async () => {
		// Arrange
		const note = await createAndUpdateNoteAsync();
		const [, updateQueueItem] = await syncQueueRepository.getAllAsync();
		fakeFetchClient.httpPutAsync.mockImplementationOnce(() => {
			throw new FetchClientStrategyError({
				statusCode: 404,
				message: 'Note not found',
			});
		});
		// Act
		await syncQueue.testUpdateGameNoteAsync(updateQueueItem);
		const newQueueItems = await syncQueueRepository.getAllAsync();
		// Assert
		expect(newQueueItems).toHaveLength(1);
		expect(newQueueItems[0].Payload).toMatchObject(note);
		expect(newQueueItems[0].Type).toBe('create');
		expect(newQueueItems[0].Status).toBe('pending');
	});

	it.each([{ statusCode: 500 }, { statusCode: 409 }, { statusCode: 501 }, { statusCode: 503 }])(
		'does not change queue items when update request fails with $statusCode',
		async ({ statusCode }) => {
			// Arrange
			const note = await createAndUpdateNoteAsync();
			const [, updateQueueItem] = await syncQueueRepository.getAllAsync();
			fakeFetchClient.httpPutAsync.mockImplementationOnce(() => {
				throw new FetchClientStrategyError({
					statusCode: statusCode,
					message: 'Error',
				});
			});
			// Act
			// Assert
			await expect(syncQueue.testUpdateGameNoteAsync(updateQueueItem)).rejects.toBeInstanceOf(
				FetchClientStrategyError,
			);
			const queueItems = await syncQueueRepository.getAllAsync();
			expect(queueItems).toHaveLength(2);
			expect(queueItems[0].Type).toBe('create');
			expect(queueItems[0].Payload.Id).toBe(note.Id);
			expect(queueItems[1].Type).toBe('update');
			expect(queueItems[1].Payload).toMatchObject(note);
		},
	);

	it('when create note request fails with a 409, replace current note with the note returned by the api and clear queue', async () => {
		// Arrange
		const note = await createAndUpdateNoteAsync();
		const existingNote: GameNote = { ...note, GameId: crypto.randomUUID() };
		const [createQueueItem] = await syncQueueRepository.getAllAsync();
		const apiError: ApiErrorResponse = {
			error: { code: 'note_already_exists', note: existingNote },
		};
		fakeFetchClient.httpPostAsync.mockImplementationOnce(() => {
			throw new FetchClientStrategyError({
				statusCode: 409,
				message: 'Note already exists',
				data: apiError,
			});
		});
		// Act
		await syncQueue.testCreateGameNoteAsync(createQueueItem);
		const queueItems = await syncQueueRepository.getAllAsync();
		const currentNote = await notesRepo.getAsync({ filterBy: 'Id', Id: note.Id });
		// Assert
		expect(queueItems).toHaveLength(1);
		expect(queueItems.every((i) => i.Type !== 'create')).toBe(true);
		expect(currentNote?.GameId).toBe(existingNote.GameId);
		expect(currentNote).toMatchObject(existingNote);
	});

	it('deleting a note removes it from indexedDb on success', async () => {
		// Arrange
		const note = await createAndUpdateNoteAsync();
		await notesRepo.deleteAsync({ noteId: note.Id });
		const deleteQueueItem = await syncQueueRepository.getAsync({
			filterBy: 'Entity_PayloadId_Status_Type',
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'delete',
		});
		fakeFetchClient.httpDeleteAsync.mockImplementationOnce(() => null);
		// Act
		await syncQueue.testDeleteGameNoteAsync(deleteQueueItem!);
		const currentNote = await notesRepo.getAsync({ filterBy: 'Id', Id: note.Id });
		// Assert
		expect(currentNote).toBe(null);
	});

	it('deleting a note removes it from indexedDb on 404', async () => {
		// Arrange
		const note = await createAndUpdateNoteAsync();
		await notesRepo.deleteAsync({ noteId: note.Id });
		const deleteQueueItem = await syncQueueRepository.getAsync({
			filterBy: 'Entity_PayloadId_Status_Type',
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'delete',
		});
		fakeFetchClient.httpDeleteAsync.mockImplementationOnce(() => {
			throw new FetchClientStrategyError({
				statusCode: 404,
				message: 'Note not found',
			});
		});
		// Act
		await syncQueue.testDeleteGameNoteAsync(deleteQueueItem!);
		const currentNote = await notesRepo.getAsync({ filterBy: 'Id', Id: note.Id });
		// Assert
		expect(currentNote).toBe(null);
	});
});
