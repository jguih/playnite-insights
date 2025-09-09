import { storeNames } from './indexeddb';

export const migrations: Record<number, (db: IDBDatabase, tx: IDBTransaction) => void> = {
	1: (db) => {
		const store = db.createObjectStore(storeNames.gameNotes, { keyPath: 'Id' });
		store.createIndex('byGameId', 'GameId', { unique: false });
		store.createIndex('bySessionId', 'SessionId', { unique: false });
	},
	2: (db) => {
		const queue = db.createObjectStore(storeNames.syncQueue, { keyPath: 'Id' });
		queue.createIndex('byType', 'Type', { unique: false });
		queue.createIndex('byStatus', 'Status', { unique: false });
	},
	3: (_, tx) => {
		const store = tx.objectStore(storeNames.syncQueue);
		const indexName = 'Entity_PayloadId_Status';
		if (!store.indexNames.contains(indexName))
			store.createIndex(indexName, ['Entity', 'Payload.Id', 'Status'], {
				unique: false,
			});
	},
	4: (_, tx) => {
		const store = tx.objectStore(storeNames.syncQueue);
		const indexName = 'Entity_PayloadId_Status_Type';
		if (!store.indexNames.contains(indexName))
			store.createIndex(indexName, ['Entity', 'Payload.Id', 'Status', 'Type'], {
				unique: false,
			});
	},
};
