import { readFile, unlink } from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { exit } from 'process';
import { DB_FILE, INIT_DB_SQL_FILE, logDebug, logError, logInfo } from '../common/config.js';
import { existsSync } from 'fs';
import { seedDb } from './seed.js';

logInfo(`TEST_DATA: ${process.env.TEST_DATA}`);
logInfo(`NODE_ENV: ${process.env.NODE_ENV}`);

const shouldSeedDb = process.env.TEST_DATA === 'true' && process.env.NODE_ENV === 'development';

/**
 * @param {DatabaseSync} db
 */
const initDatabase = async (db) => {
	logDebug('Running initial database setup...');
	try {
    logDebug(`Reading ${INIT_DB_SQL_FILE}`);
		const sql = await readFile(INIT_DB_SQL_FILE, 'utf-8');
		logDebug(`${INIT_DB_SQL_FILE} file read successfully`);
		logDebug(`Running: \n${sql}`);
		db.exec(sql);
		logInfo(`Database initialized successfully`);
	} catch (error) {
		logError('Failed to initialize database', error);
    exit(1);
	}
};

if (shouldSeedDb && existsSync(DB_FILE)) {
  await unlink(DB_FILE);
  logInfo("Database removed successfully")
  logInfo("Seeding database...");
}

const db = new DatabaseSync(DB_FILE);
await initDatabase(db);
if (shouldSeedDb) {
  seedDb(db);
}

db.close();

exit(0);