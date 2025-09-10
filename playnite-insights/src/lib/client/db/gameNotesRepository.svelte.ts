import {
	gameNoteSchema,
	SyncQueueFactory,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { IGameNotesRepository } from './IGameNotesRepository';
import { runRequest, runTransaction } from './indexeddb';
import { IndexedDBRepository, type IndexedDBRepositoryDeps } from './repository.svelte';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

export type GameNotesRepositoryDeps = {
	syncQueueFactory: SyncQueueFactory;
} & IndexedDBRepositoryDeps;

export class GameNoteRepository extends IndexedDBRepository implements IGameNotesRepository {
	#syncQueueFactory: SyncQueueFactory;

	static STORE_NAME = 'gameNotes' as const;

	static INDEX = {
		byGameId: 'byGameId',
		bySessionId: 'bySessionId',
	} as const;

	static FILTER_BY = {
		Id: 'Id',
		byGameId: this.INDEX.byGameId,
	} as const;

	constructor({ indexedDbSignal, syncQueueFactory }: GameNotesRepositoryDeps) {
		super({ indexedDbSignal });
		this.#syncQueueFactory = syncQueueFactory;
	}

	addAsync: IGameNotesRepository['addAsync'] = async ({ note }) => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return null;

		return this.withDb(async (db) => {
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
		});
	};

	putAsync: IGameNotesRepository['putAsync'] = async ({ note }) => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return false;

		return this.withDb(async (db) => {
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
		});
	};

	getAsync: IGameNotesRepository['getAsync'] = async (props) => {
		return this.withDb(async (db) => {
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
		});
	};

	getAllAsync: IGameNotesRepository['getAllAsync'] = async (props = {}) => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'gameNotes', 'readonly', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
				let notes: GameNote[] = [];

				switch (props.filterBy) {
					case 'byGameId': {
						const index = notesStore.index(GameNoteRepository.INDEX.byGameId);
						notes = await runRequest<GameNote[]>(index.getAll(props.GameId));
						break;
					}
					default:
						notes = await runRequest<GameNote[]>(notesStore.getAll());
						break;
				}

				return notes.sort((a, b) => {
					if (a.Title == null && b.Title == null) return 0;
					if (a.Title == null) return -1;
					if (b.Title == null) return 1;
					return a.Title?.localeCompare(b.Title);
				});
			});
		});
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
