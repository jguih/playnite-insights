import type { SyncQueueItem } from '@playnite-insights/lib/client';
import { migrations } from './migrations';

export const INDEXEDDB_NAME = 'PlayAtlasDb';
export const INDEXEDDB_CURRENT_VERSION = 4;

export const openIndexedDB: (props: {
	dbName: string;
	version: number;
}) => Promise<IDBDatabase> = ({ dbName, version }) => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, version);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const db = request.result;
			const oldVersion = event.oldVersion;
			const tx = request.transaction!;

			for (let v = oldVersion + 1; v <= version; v++) {
				const migrate = migrations[v];
				if (migrate) migrate(db, tx);
			}
		};
	});
};

export const storeNames = {
	gameNotes: 'gameNotes',
	syncQueue: 'syncQueue',
} as const;

export type StoreNames = keyof typeof storeNames;

export const runTransaction = <T>(
	db: IDBDatabase,
	storeName: StoreNames,
	mode: IDBTransactionMode,
	callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, mode);
		const store = tx.objectStore(storeName);

		const request = callback(store);

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);

		// optional: resolve/reject on transaction completion
		tx.oncomplete = () => {
			/* can signal overall transaction complete */
		};
		tx.onerror = () => reject(tx.error);
	});
};

export const runTransactionMultiple = <T>(
	db: IDBDatabase,
	storeName: StoreNames | StoreNames[],
	mode: IDBTransactionMode,
	callback: (props: { tx: IDBTransaction; storeNames: typeof storeNames }) => Promise<T> | T,
): Promise<T> => {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, mode);

		tx.oncomplete = () => resolve(result);
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);

		let result: T;
		try {
			result = callback({ tx, storeNames: storeNames }) as T;
		} catch (err) {
			tx.abort();
			reject(err);
		}
	});
};

export const runRequest = <T>(req: IDBRequest<T>): Promise<T> => {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
};

export const enqueueChange = async (
	db: IDBDatabase,
	change: Omit<SyncQueueItem, 'Id' | 'CreatedAt' | 'Status'>,
) => {
	const item: SyncQueueItem = {
		...change,
		Id: crypto.randomUUID(),
		CreatedAt: new Date().toISOString(),
		Status: 'pending',
	};

	await runTransaction(db, 'syncQueue', 'readwrite', (store) => store.add(item));
};
