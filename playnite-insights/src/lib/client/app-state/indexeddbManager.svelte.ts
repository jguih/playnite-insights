import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from '../db/indexeddb';

export type IndexedDbManagerDeps = {
	onOpen?: (db: IDBDatabase) => void;
};

export type IndexedDbSignal = { db: IDBDatabase | null; dbReady: Promise<void> | null };

export interface IIndexedDbManager {
	dbSignal: IndexedDbSignal;
}

export class IndexedDbManager implements IIndexedDbManager {
	#dbSignal: IndexedDbSignal;

	constructor({ onOpen }: IndexedDbManagerDeps = {}) {
		this.#dbSignal = $state({
			db: null,
			dbReady: Promise.resolve(),
		});

		this.#dbSignal.dbReady = openIndexedDbAsync({
			dbName: INDEXEDDB_NAME,
			version: INDEXEDDB_CURRENT_VERSION,
		}).then((db) => {
			this.#dbSignal.db = db;
			onOpen?.(db);
		});
	}

	get dbSignal() {
		return this.#dbSignal;
	}
}
