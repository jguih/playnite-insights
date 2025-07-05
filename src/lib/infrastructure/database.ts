import { config } from '$lib';
import { DatabaseSync } from 'node:sqlite';

let db: DatabaseSync | null = null;

export const getDb = (): DatabaseSync => {
	if (db === null) {
		db = new DatabaseSync(config.DB_FILE, { enableForeignKeyConstraints: true });
	}
	return db;
};

export const getLastInsertId = (): string | undefined => {
	return getDb().prepare('SELECT last_insert_rowid() as id').get()?.id?.toString();
};
