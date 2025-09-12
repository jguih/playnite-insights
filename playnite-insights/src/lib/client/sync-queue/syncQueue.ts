import {
	createGameNoteCommandSchema,
	createGameNoteResponseSchema,
	gameNoteSchema,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal, IndexedDbSignal } from '../app-state/AppData.types';
import { IndexedDBNotInitializedError } from '../db/errors/indexeddbNotInitialized';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { runRequest, runTransaction } from '../db/indexeddb';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { FetchClientStrategyError } from '../fetch-client/error/fetchClientStrategyError';
import { HttpClientNotSetError } from '../fetch-client/error/httpClientNotSetError';
import type { FetchClient } from '../fetch-client/fetchClient';
import { JsonStrategy } from '../fetch-client/jsonStrategy';

export type SyncQueueDeps = {
	syncQueueRepository: SyncQueueRepository;
	httpClientSignal: HttpClientSignal;
	indexedDbSignal: IndexedDbSignal;
};

export class SyncQueue {
	#syncQueueRepository: SyncQueueDeps['syncQueueRepository'];
	#httpClientSignal: SyncQueueDeps['httpClientSignal'];
	#indexedDbSignal: SyncQueueDeps['indexedDbSignal'];

	constructor(deps: SyncQueueDeps) {
		this.#syncQueueRepository = deps.syncQueueRepository;
		this.#httpClientSignal = deps.httpClientSignal;
		this.#indexedDbSignal = deps.indexedDbSignal;
	}

	/**
	 * Awaits for indexeddb to be ready before calling the callback
	 * @param callback the callback function
	 * @throws {IndexedDBNotInitializedError} if db is not ready after promise is complete
	 */
	protected async withDb<T>(callback: (db: IDBDatabase) => Promise<T>): Promise<T> {
		await this.#indexedDbSignal.dbReady;
		const db = this.#indexedDbSignal.db;
		if (!db) throw new IndexedDBNotInitializedError();
		return callback(db);
	}

	withHttpClient = async <T>(cb: (props: { client: FetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	private updateGameNoteAndDeleteQueueItemAsync = async (
		note: GameNote,
		queueItem: SyncQueueItem,
	) => {
		await this.withDb(async (db) => {
			await runTransaction(db, ['syncQueue', 'gameNotes'], 'readwrite', async ({ tx }) => {
				await runRequest(tx.objectStore(GameNoteRepository.STORE_NAME).put(note));
				await runRequest(tx.objectStore(SyncQueueRepository.STORE_NAME).delete(queueItem.Id!));
			});
		});
	};

	private createGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.withHttpClient(async ({ client }) => {
			const note = { ...queueItem.Payload };
			const command = createGameNoteCommandSchema.parse(note);
			try {
				const createdNote = await client.httpPostAsync({
					endpoint: '/api/note',
					strategy: new JsonStrategy(createGameNoteResponseSchema),
					body: command,
				});
				await this.updateGameNoteAndDeleteQueueItemAsync(createdNote, queueItem);
			} catch (error) {
				if (error instanceof FetchClientStrategyError && error.statusCode === 409) {
					const existingNote = gameNoteSchema.parse(error.data);
					await this.updateGameNoteAndDeleteQueueItemAsync(existingNote, queueItem);
				} else {
					throw error;
				}
			}
		});
	};

	private processGameNoteAsync = async (queueItem: SyncQueueItem) => {
		try {
			switch (queueItem.Type) {
				case 'create': {
					await this.createGameNoteAsync(queueItem);
					break;
				}
				case 'update': {
					break;
				}
				case 'delete': {
					break;
				}
			}
		} catch (error) {
			console.error(error);
			const item = { ...queueItem };
			item.Status = 'failed';
			await this.withDb(async (db) => {
				await runTransaction(db, 'syncQueue', 'readwrite', async ({ tx }) => {
					await runRequest(tx.objectStore(SyncQueueRepository.STORE_NAME).put(item));
				});
			});
		}
	};

	processQueueAsync = async () => {
		try {
			const queueItems = await this.#syncQueueRepository.getAllAsync();
			for (const queueItem of queueItems) {
				switch (queueItem.Entity) {
					case 'gameNote':
						await this.processGameNoteAsync(queueItem);
				}
			}
		} catch (error) {
			console.error(error);
		}
	};
}
