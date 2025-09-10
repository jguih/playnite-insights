import {
	gameNoteSchema,
	SyncQueueFactory,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import type { IGameNotesRepository } from './IGameNotesRepository';
import { runRequest, runTransaction } from './indexeddb';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

export type GameNotesRepositoryDeps = {
	indexedDbSignal: IndexedDbSignal;
	syncQueueFactory: SyncQueueFactory;
};

export class GameNoteRepository implements IGameNotesRepository {
	#indexedDbSignal: GameNotesRepositoryDeps['indexedDbSignal'];
	#syncQueueFactory: SyncQueueFactory;

	static STORE_NAME = 'gameNotes' as const;

	static INDEX = {
		byGameId: 'byGameId',
		bySessionId: 'bySessionId',
	} as const;

	static FILTER_BY = {
		Id: 'Id',
	} as const;

	constructor({ indexedDbSignal, syncQueueFactory }: GameNotesRepositoryDeps) {
		this.#indexedDbSignal = indexedDbSignal;
		this.#syncQueueFactory = syncQueueFactory;
	}

	addAsync: IGameNotesRepository['addAsync'] = async ({ note }) => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return null;
		const db = this.#indexedDbSignal.db;
		if (!db) return null;

		try {
			const key = await runTransaction(
				db,
				['gameNotes', 'syncQueue'],
				'readwrite',
				async ({ tx }) => {
					const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
					const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);
					const key = await runRequest(notesStore.add(note));
					const queueItem = this.#syncQueueFactory.create({ Entity: 'gameNote', Payload: note });
					await runRequest(syncQueueStore.add(queueItem));
					return key;
				},
			);
			return key as string;
		} catch (err) {
			console.error('Failed to create note and queue item', err);
			return null;
		}
	};

	putAsync: IGameNotesRepository['putAsync'] = async ({ note }) => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return false;
		const db = this.#indexedDbSignal.db;
		if (!db) {
			console.warn('db is not defined');
			return false;
		}

		try {
			await runTransaction(db, ['gameNotes', 'syncQueue'], 'readwrite', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
				const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);

				const existingNote = await runRequest<GameNote | undefined>(notesStore.get(note.Id));
				const index = syncQueueStore.index(SyncQueueRepository.INDEX.Entity_PayloadId_Status_Type);
				const existingQueueItem = await runRequest<SyncQueueItem | undefined>(
					index.get(['gameNote', note.Id, 'pending', 'update']),
				);

				note.LastUpdatedAt = new Date().toISOString();
				await runRequest(notesStore.put(note));

				if (!existingNote) {
					const queueItem = this.#syncQueueFactory.create({
						Entity: 'gameNote',
						Payload: note,
						Type: 'create',
					});
					await runRequest(syncQueueStore.add(queueItem));
					return true;
				}

				if (existingQueueItem) {
					existingQueueItem.Payload = note;
					await runRequest(syncQueueStore.put(existingQueueItem));
				} else {
					const queueItem = this.#syncQueueFactory.create({
						Entity: 'gameNote',
						Payload: note,
						Type: 'update',
					});
					await runRequest(syncQueueStore.add(queueItem));
				}

				return true;
			});
			return true;
		} catch (err) {
			console.error('Failed to update note and queue item', err);
			return false;
		}
	};

	getAsync: IGameNotesRepository['getAsync'] = async (props) => {
		const db = this.#indexedDbSignal.db;
		if (!db) return null;

		try {
			return await runTransaction(db, 'gameNotes', 'readonly', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);

				switch (props.filterBy) {
					case 'Id': {
						const note = await runRequest<GameNote | undefined>(notesStore.get(props.Id));
						return note ?? null;
					}
					default:
						return null;
				}
			});
		} catch (err) {
			console.error('Failed to find note', err);
			return null;
		}
	};

	getAllAsync: IGameNotesRepository['getAllAsync'] = async () => {
		const db = this.#indexedDbSignal.db;
		if (!db) return [];

		try {
			return await runTransaction(db, 'gameNotes', 'readonly', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
				const notes = await runRequest<GameNote[]>(notesStore.getAll());
				return notes;
			});
		} catch (err) {
			console.error('Failed to find note', err);
			return [];
		}
	};

	static defineSchema = ({
		db,
	}: {
		db: IDBDatabase;
		tx: IDBTransaction;
		oldVersion: number;
		newVersion: number | null;
	}): void => {
		if (!db.objectStoreNames.contains(this.STORE_NAME)) {
			const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'Id' });
			store.createIndex(this.INDEX.byGameId, 'GameId', { unique: false });
			store.createIndex(this.INDEX.bySessionId, 'SessionId', { unique: false });
		}

		// Future migrations
	};
}
