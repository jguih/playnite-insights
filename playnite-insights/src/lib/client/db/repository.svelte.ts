import type { IndexedDbSignal } from '../app-state/indexeddbManager.svelte';
import { IndexedDBNotInitializedError } from './errors/indexeddbNotInitialized';

export type IndexedDBRepositoryDeps = {
	indexedDbSignal: IndexedDbSignal;
};

export class IndexedDBRepository {
	#indexedDbSignal: IndexedDBRepositoryDeps['indexedDbSignal'];

	constructor({ indexedDbSignal }: IndexedDBRepositoryDeps) {
		this.#indexedDbSignal = indexedDbSignal;
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
}
