import { readFile, unlink } from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'fs';
import { seedDb } from './seed.js';
import type { LogService } from '$lib/services/log.js';

type InitDatabaseDeps = {
	DB_FILE: string;
	INIT_DB_SQL_FILE: string;
	logService: LogService;
};

export const initDatabase = async ({ DB_FILE, INIT_DB_SQL_FILE, logService }: InitDatabaseDeps) => {
	const shouldSeedDb = process.env.TEST_DATA === 'true' && process.env.NODE_ENV === 'development';
	if (shouldSeedDb && existsSync(DB_FILE)) {
		await unlink(DB_FILE);
		logService.info('Detected test data environment, database file was removed');
	}
	const db = new DatabaseSync(DB_FILE);
	logService.debug('Running initial database setup...');
	try {
		logService.debug(`Reading ${INIT_DB_SQL_FILE}`);
		const sql = await readFile(INIT_DB_SQL_FILE, 'utf-8');
		logService.debug(`${INIT_DB_SQL_FILE} file read successfully`);
		db.exec(sql);
		logService.info(`Database initialized successfully`);
	} catch (error) {
		logService.error('Failed to initialize database', error as Error);
	}
	if (shouldSeedDb) {
		seedDb(db, logService);
	}
	db.close();
};
