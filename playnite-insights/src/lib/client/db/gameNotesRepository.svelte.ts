import {
	gameNoteSchema,
	SyncQueueFactory,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { IDateTimeHandler } from '../utils/dateTimeHandler.svelte';
import type { IGameNotesRepository } from './IGameNotesRepository';
import { runRequest, runTransaction } from './indexeddb';
import { IndexedDBRepository, type IndexedDBRepositoryDeps } from './repository.svelte';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

export type GameNotesRepositoryDeps = {
	syncQueueFactory: SyncQueueFactory;
	dateTimeHandler: IDateTimeHandler;
} & IndexedDBRepositoryDeps;

export class GameNoteRepository extends IndexedDBRepository implements IGameNotesRepository {
	#syncQueueFactory: GameNotesRepositoryDeps['syncQueueFactory'];
	#dateTimeHandler: GameNotesRepositoryDeps['dateTimeHandler'];

	static STORE_NAME = 'gameNotes' as const;

	static INDEX = {
		byGameId: 'byGameId',
		bySessionId: 'bySessionId',
	} as const;

	static FILTER_BY = {
		Id: 'Id',
		byGameId: this.INDEX.byGameId,
	} as const;

	constructor({ indexedDbSignal, syncQueueFactory, dateTimeHandler }: GameNotesRepositoryDeps) {
		super({ indexedDbSignal });
		this.#syncQueueFactory = syncQueueFactory;
		this.#dateTimeHandler = dateTimeHandler;
	}

	addAsync: IGameNotesRepository['addAsync'] = async ({ note }) => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return null;

		return await this.withDb(async (db) => {
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
		const now = new Date(this.#dateTimeHandler.getUtcNow()).toISOString();

		return await this.withDb(async (db) => {
			await runTransaction(db, ['gameNotes', 'syncQueue'], 'readwrite', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
				const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);

				const existingNote = await runRequest<GameNote | undefined>(notesStore.get(note.Id));
				const index = syncQueueStore.index(SyncQueueRepository.INDEX.Entity_PayloadId_Status_Type);
				const existingQueueItem = await runRequest<SyncQueueItem | undefined>(
					index.get(['gameNote', note.Id, 'pending', 'update']),
				);

				note.LastUpdatedAt = now;
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

	deleteAsync: IGameNotesRepository['deleteAsync'] = async (props) => {
		const now = new Date(this.#dateTimeHandler.getUtcNow()).toISOString();

		return await this.withDb(async (db) => {
			return await runTransaction(db, ['gameNotes', 'syncQueue'], 'readwrite', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);
				const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);
				const existingNote = await runRequest<GameNote | undefined>(notesStore.get(props.noteId));

				if (!existingNote) return false;
				if (existingNote.DeletedAt) return true;
				existingNote.DeletedAt = now;
				await runRequest(notesStore.put(existingNote));

				const queueItem = this.#syncQueueFactory.create({
					Entity: 'gameNote',
					Payload: existingNote,
					Type: 'delete',
				});
				await runRequest(syncQueueStore.add(queueItem));

				return true;
			});
		});
	};

	getAsync: IGameNotesRepository['getAsync'] = async (props) => {
		return await this.withDb(async (db) => {
			return await runTransaction(db, 'gameNotes', 'readonly', async ({ tx }) => {
				const notesStore = tx.objectStore(GameNoteRepository.STORE_NAME);

				switch (props.filterBy) {
					case 'Id': {
						const note = await runRequest<GameNote | undefined>(notesStore.get(props.Id));
						if (note && note.DeletedAt === null) return note;
						return null;
					}
					default:
						return null;
				}
			});
		});
	};

	getAllAsync: IGameNotesRepository['getAllAsync'] = async (props = {}) => {
		return await this.withDb(async (db) => {
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

				return notes
					.sort((a, b) => {
						if (b.CreatedAt === a.CreatedAt) return 0;
						if (a.CreatedAt < b.CreatedAt) return 1;
						return -1;
					})
					.filter((n) => n.DeletedAt === null);
			});
		});
	};

	upsertOrDeleteManyAsync: IGameNotesRepository['upsertOrDeleteManyAsync'] = async (notes, ops) => {
		const shouldOverride = ops?.override === true;
		return await this.withDb(async (db) => {
			await runTransaction(db, [GameNoteRepository.STORE_NAME], 'readwrite', async ({ tx }) => {
				const store = tx.objectStore(GameNoteRepository.STORE_NAME);
				for (const note of notes) {
					const existing = await runRequest<GameNote | undefined>(store.get(note.Id));
					if (
						shouldOverride ||
						!existing ||
						new Date(note.LastUpdatedAt) > new Date(existing.LastUpdatedAt)
					) {
						await runRequest(store.put(note));
					}
				}
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
