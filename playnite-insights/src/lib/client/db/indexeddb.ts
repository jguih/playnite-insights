//@prettier-ignore
import { migrations } from './migrations';

export const INDEXEDDB_NAME = 'PlayAtlasDb';
export const INDEXEDDB_CURRENT_VERSION = 1;

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
			for (let v = oldVersion + 1; v <= version; v++) {
				const migrate = migrations[v];
				if (migrate) migrate(db);
			}
		};
	});
};

export const storeNames = {
	gameNotes: 'gameNotes',
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
