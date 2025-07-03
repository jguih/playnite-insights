import { playniteInsightsConfig } from '$lib/config/config';
import { DatabaseSync } from 'node:sqlite';

const DB_FILE = playniteInsightsConfig.path.dbFile;
let db: DatabaseSync | null = null;

export const getDb = (): DatabaseSync => {
	if (db === null) {
		db = new DatabaseSync(DB_FILE);
	}
	return db;
};

export const getLastInsertId = (): string | undefined => {
	return getDb().prepare('SELECT last_insert_rowid() as id').get()?.id?.toString();
};
