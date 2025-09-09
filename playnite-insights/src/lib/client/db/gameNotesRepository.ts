import {
	gameNoteSchema,
	SyncQueueFactory,
	type GameNote,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import { runRequest, runTransactionMultiple } from './indexeddb';

export type GameNotesRepositoryDeps = {
	indexedDbSignal: IndexedDbSignal;
	syncQueueFactory: SyncQueueFactory;
};

export class GameNoteRepository {
	#indexedDbSignal: GameNotesRepositoryDeps['indexedDbSignal'];
	#syncQueueFactory: SyncQueueFactory;

	constructor({ indexedDbSignal, syncQueueFactory }: GameNotesRepositoryDeps) {
		this.#indexedDbSignal = indexedDbSignal;
		this.#syncQueueFactory = syncQueueFactory;
	}

	addAsync = async ({ note }: { note: GameNote }): Promise<string | null> => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return null;
		const db = this.#indexedDbSignal.db;
		if (!db) return null;

		try {
			const key = await runTransactionMultiple(
				db,
				['gameNotes', 'syncQueue'],
				'readwrite',
				async ({ tx, storeNames }) => {
					const notesStore = tx.objectStore(storeNames.gameNotes);
					const syncQueueStore = tx.objectStore(storeNames.syncQueue);
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

	putAsync = async ({ note }: { note: GameNote }): Promise<boolean> => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return false;
		const db = this.#indexedDbSignal.db;
		if (!db) return false;

		try {
			await runTransactionMultiple(
				db,
				['gameNotes', 'syncQueue'],
				'readwrite',
				async ({ tx, storeNames }) => {
					const notesStore = tx.objectStore(storeNames.gameNotes);
					const syncQueueStore = tx.objectStore(storeNames.syncQueue);

					const existingNote = await runRequest<GameNote | undefined>(notesStore.get(note.Id));
					const index = syncQueueStore.index('Entity_PayloadId_Status_Type');
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
				},
			);
			return true;
		} catch (err) {
			console.error('Failed to update note and queue item', err);
			return false;
		}
	};
}
