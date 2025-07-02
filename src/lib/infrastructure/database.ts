import { playniteInsightsConfig } from '$lib/config/config';
import { logDebug, logError, logSuccess } from '$lib/services/log';
import { readFile } from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';

const DB_FILE = playniteInsightsConfig.path.dbFile;
const INIT_DB_SQL_FILE = playniteInsightsConfig.path.initSqlFile;
const db = new DatabaseSync(DB_FILE);

export const getDb = (): DatabaseSync => {
	return db;
};

export const initDatabase = async () => {
	logDebug('Running initial database setup...');
	try {
		logDebug(`Reading ${INIT_DB_SQL_FILE}`);
		const sql = await readFile(INIT_DB_SQL_FILE, 'utf-8');
		logDebug(`${INIT_DB_SQL_FILE} file read successfully`);
		logDebug(`Running: \n${sql}`);
		getDb().exec(sql);
		logSuccess(`Database initialized successfully`);
	} catch (error) {
		logError('Failed to initialize database', error as Error);
	}
};

export const getLastInsertId = (): string | undefined => {
	return getDb().prepare('SELECT last_insert_rowid() as id').get()?.id?.toString();
};
