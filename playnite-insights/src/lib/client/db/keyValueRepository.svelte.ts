import type { KeyValue } from '@playnite-insights/lib/client';
import type { IKeyValueRepository } from './IKeyValueRepository';
import { runRequest, runTransaction } from './indexeddb';
import { IndexedDBRepository, type IndexedDBRepositoryDeps } from './repository.svelte';

export type KeyValueRepositoryDeps = IndexedDBRepositoryDeps;

export class KeyValueRepository extends IndexedDBRepository implements IKeyValueRepository {
	static STORE_NAME = 'keyValue' as const;

	constructor({ indexedDbSignal }: KeyValueRepositoryDeps) {
		super({ indexedDbSignal });
	}

	putAsync: IKeyValueRepository['putAsync'] = ({ keyvalue }) => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'keyValue', 'readonly', async ({ tx }) => {
				const keyvalueStore = tx.objectStore(KeyValueRepository.STORE_NAME);
				await runRequest(keyvalueStore.put(keyvalue));
			});
		});
	};

	deleteAsync: IKeyValueRepository['deleteAsync'] = ({ key }) => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'keyValue', 'readwrite', async ({ tx }) => {
				const keyvalueStore = tx.objectStore(KeyValueRepository.STORE_NAME);
				await runRequest(keyvalueStore.delete(key));
			});
		});
	};

	getAsync: IKeyValueRepository['getAsync'] = ({ key }) => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'keyValue', 'readonly', async ({ tx }) => {
				const keyvalueStore = tx.objectStore(KeyValueRepository.STORE_NAME);
				const keyvalue = await runRequest<KeyValue | undefined>(keyvalueStore.get(key));
				return keyvalue ?? null;
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
			db.createObjectStore(this.STORE_NAME, { keyPath: 'Key' });
		}

		// Future migrations
	};
}
