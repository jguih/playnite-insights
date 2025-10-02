import {
	createGameNoteCommandSchema,
	createGameNoteResponseSchema,
	EmptyStrategy,
	FetchClientStrategyError,
	gameNoteSchema,
	HttpClientNotSetError,
	JsonStrategy,
	updateGameNoteCommandSchema,
	updateGameNoteResponseSchema,
	type GameNote,
	type IFetchClient,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { IndexedDbSignal } from '../app-state/indexeddbManager.svelte';
import { IndexedDBNotInitializedError } from '../db/errors/indexeddbNotInitialized';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { runRequest, runTransaction } from '../db/indexeddb';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';

export type SyncQueueDeps = {
	syncQueueRepository: SyncQueueRepository;
	httpClient: IFetchClient | null;
	indexedDbSignal: IndexedDbSignal;
};

export class SyncQueue {
	#syncQueueRepository: SyncQueueDeps['syncQueueRepository'];
	#httpClient: SyncQueueDeps['httpClient'];
	#indexedDbSignal: SyncQueueDeps['indexedDbSignal'];
	#permanentFailureCodes = [400, 401, 403, 404, 409, 422, 501];

	constructor(deps: SyncQueueDeps) {
		this.#syncQueueRepository = deps.syncQueueRepository;
		this.#httpClient = deps.httpClient;
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

	protected withHttpClient = async <T>(
		cb: (props: { client: IFetchClient }) => Promise<T>,
	): Promise<T> => {
		const client = this.#httpClient;
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

	private deleteGameNoteAndQueueItemAsync = async (note: GameNote, queueItem: SyncQueueItem) => {
		await this.withDb(async (db) => {
			await runTransaction(db, ['syncQueue', 'gameNotes'], 'readwrite', async ({ tx }) => {
				await runRequest(tx.objectStore(GameNoteRepository.STORE_NAME).delete(note.Id));
				await runRequest(tx.objectStore(SyncQueueRepository.STORE_NAME).delete(queueItem.Id!));
			});
		});
	};

	protected createGameNoteAsync = async (queueItem: SyncQueueItem) => {
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
					// When note already exists (conflict)
					const existingNote = gameNoteSchema.parse(error.data);
					await this.updateGameNoteAndDeleteQueueItemAsync(existingNote, queueItem);
				} else {
					throw error;
				}
			}
		});
	};

	protected updateGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.withHttpClient(async ({ client }) => {
			const note = { ...queueItem.Payload };
			const command = updateGameNoteCommandSchema.parse(note);
			try {
				const updatedNote = await client.httpPutAsync({
					endpoint: '/api/note',
					strategy: new JsonStrategy(updateGameNoteResponseSchema),
					body: command,
				});
				await this.updateGameNoteAndDeleteQueueItemAsync(updatedNote, queueItem);
			} catch (error) {
				if (error instanceof FetchClientStrategyError && error.statusCode === 404) {
					await this.withDb(async (db) => {
						await runTransaction(db, ['syncQueue', 'gameNotes'], 'readwrite', async ({ tx }) => {
							const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);
							const index = syncQueueStore.index(SyncQueueRepository.INDEX.Entity_PayloadId_Type);
							// Delete all create queue items for this payload
							const createQueueItems = await runRequest(
								index.getAllKeys(['gameNote', note.Id, 'create']),
							);
							for (const createQueueItem of createQueueItems)
								await runRequest(syncQueueStore.delete(createQueueItem));
							// Update 'type' of current queue item to 'create'
							const newItem = { ...queueItem };
							newItem.Type = 'create';
							newItem.Status = 'pending';
							await runRequest(syncQueueStore.put(newItem));
						});
					});
				} else {
					throw error;
				}
			}
		});
	};

	protected deleteGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.withHttpClient(async ({ client }) => {
			const note = { ...queueItem.Payload };
			try {
				await client.httpDeleteAsync({
					endpoint: `/api/note/${note.Id}`,
					strategy: new EmptyStrategy(),
				});
				await this.deleteGameNoteAndQueueItemAsync(note, queueItem);
			} catch (error) {
				if (error instanceof FetchClientStrategyError && error.statusCode === 404) {
					await this.deleteGameNoteAndQueueItemAsync(note, queueItem);
				} else {
					throw error;
				}
			}
		});
	};

	protected processGameNoteAsync = async (queueItem: SyncQueueItem) => {
		try {
			switch (queueItem.Type) {
				case 'create': {
					await this.createGameNoteAsync(queueItem);
					break;
				}
				case 'update': {
					await this.updateGameNoteAsync(queueItem);
					break;
				}
				case 'delete': {
					await this.deleteGameNoteAsync(queueItem);
					break;
				}
			}
		} catch (error) {
			console.error(error);
			if (
				error instanceof FetchClientStrategyError &&
				!this.#permanentFailureCodes.includes(error.statusCode)
			)
				return;
			const item = { ...queueItem };
			item.Status = 'failed';
			item.Retries = (item.Retries ?? 0) + 1;
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
				if (queueItem.Retries && queueItem.Retries >= 100) continue;
				switch (queueItem.Entity) {
					case 'gameNote':
						await this.processGameNoteAsync(queueItem);
				}
			}
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	};
}
