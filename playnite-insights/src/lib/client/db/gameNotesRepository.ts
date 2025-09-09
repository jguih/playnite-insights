import { gameNoteSchema, type GameNote } from '@playnite-insights/lib/client';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import { runTransaction } from './indexeddb';

export type GameNotesRepositoryDeps = {
	indexedDbSignal: IndexedDbSignal;
};

export class GameNotesRepository {
	#indexedDbSignal: GameNotesRepositoryDeps['indexedDbSignal'];

	constructor({ indexedDbSignal }: GameNotesRepositoryDeps) {
		this.#indexedDbSignal = indexedDbSignal;
	}

	addAsync = async ({ note }: { note: GameNote }): Promise<string | null> => {
		const parseResult = gameNoteSchema.safeParse(note);
		if (!parseResult.success) return null;
		const db = this.#indexedDbSignal.db;
		if (!db) return null;
		const key = await runTransaction(db, 'gameNotes', 'readwrite', (store) => store.add(note));
		return key as string;
	};
}
