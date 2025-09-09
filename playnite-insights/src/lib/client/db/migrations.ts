import { storeNames } from './indexeddb';

export const migrations: Record<number, (db: IDBDatabase) => void> = {
	1: (db) => {
		const store = db.createObjectStore(storeNames.gameNotes, { keyPath: 'Id' });
		store.createIndex('byGameId', 'GameId', { unique: false });
		store.createIndex('bySessionId', 'SessionId', { unique: false });
	},
};
