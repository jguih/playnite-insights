import { GameNoteRepository } from './gameNotesRepository.svelte';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

export const INDEXEDDB_NAME = 'PlayAtlasDb';
export const INDEXEDDB_CURRENT_VERSION = 4;

export const openIndexedDbAsync: (props: {
	dbName: string;
	version: number;
}) => Promise<IDBDatabase> = ({ dbName, version }) => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, version);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const db = request.result;

			db.onversionchange = () => {
				db.close();
				console.warn('Database is outdated, please reload the app');
			};

			resolve(request.result);
		};
		request.onupgradeneeded = (event) => {
			const db = request.result;
			const tx = request.transaction!;
			const oldVersion = event.oldVersion;
			const newVersion = event.newVersion;

			GameNoteRepository.defineSchema({ db, tx, oldVersion, newVersion });
			SyncQueueRepository.defineSchema({ db, tx, oldVersion, newVersion });
		};
	});
};

export type StoreNames =
	| typeof SyncQueueRepository.STORE_NAME
	| typeof GameNoteRepository.STORE_NAME;

export const runTransaction = <T>(
	db: IDBDatabase,
	storeName: StoreNames | StoreNames[],
	mode: IDBTransactionMode,
	callback: (props: { tx: IDBTransaction }) => Promise<T> | T,
): Promise<T> => {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, mode);

		tx.oncomplete = () => resolve(result);
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);

		let result: T;
		try {
			result = callback({ tx }) as T;
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
