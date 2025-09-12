import {
	GameNoteFactory,
	SyncQueueFactory,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClientSignal, IndexedDbSignal } from '../app-state/AppData.types';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from '../db/indexeddb';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { FetchClientStrategyError } from '../fetch-client/error/fetchClientStrategyError';
import type { IFetchClient } from '../fetch-client/fetchClient.types';
import { SyncQueue } from './syncQueue';

const fakeFetchClient = {
	httpGetAsync: vi.fn(),
	httpPostAsync: vi.fn(),
	httpPutAsync: vi.fn(),
} satisfies IFetchClient;
const indexedDbSignal: IndexedDbSignal = { db: null, dbReady: null };
const httpClientSignal: HttpClientSignal = { client: fakeFetchClient };
const syncQueueFactory = new SyncQueueFactory();
const gameNoteFactory = new GameNoteFactory();
const syncQueueRepository = new SyncQueueRepository({ indexedDbSignal });
const notesRepo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });

class TestSyncQueue extends SyncQueue {
	testUpdateGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.updateGameNoteAsync(queueItem);
	};
}

const syncQueue = new TestSyncQueue({
	httpClientSignal,
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

	it.each([{ statusCode: 500 }, { statusCode: 409 }, { statusCode: 501 }])(
		'does not change queue items when update request fails with $statusCode',
		async ({ statusCode }) => {
			// Arrange
			await createAndUpdateNoteAsync();
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
		},
	);
});
