import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'fs';
import { seedDb } from './seed.js';
import type { LogService } from '$lib/services/log.js';
import { exit } from 'process';
import type { FileSystemAsyncDeps } from '$lib/services/types.js';
import { join } from 'path';

type InitDatabaseDeps = Pick<FileSystemAsyncDeps, 'readdir' | 'readfile' | 'unlink'> & {
	DB_FILE: string;
	MIGRATIONS_DIR: string;
	logService: LogService;
};

const shouldSeedDb = () =>
	process.env.TEST_DATA === 'true' &&
	(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing');

export const initDatabase = async ({
	DB_FILE,
	MIGRATIONS_DIR,
	logService,
	readdir,
	readfile,
	unlink
}: InitDatabaseDeps) => {
	try {
		if (shouldSeedDb() && existsSync(DB_FILE)) {
			await unlink(DB_FILE);
			logService.debug('Detected test data environment, database file was removed');
		}
	} catch (error) {
		logService.error(`Failed to remove database file`, error as Error);
		exit(1);
	}
	const db = new DatabaseSync(DB_FILE);
	try {
		logService.debug(`Creating migrations table`);
		db.exec(`
      CREATE TABLE IF NOT EXISTS __migrations (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        AppliedAt DATETIME NOT NULL
      );
    `);
	} catch (error) {
		logService.error(`Failed to create migrations table`, error as Error);
		exit(1);
	}
	logService.debug('Applying migrations');
	logService.info(`Initializing database`);
	try {
		// Get applied migrations
		const applied =
			db
				.prepare(`SELECT Name FROM __migrations;`)
				.all()
				?.map((e) => e.Name as string) ?? [];
		// Read all sql files in migrations folder
		const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
		const migrationFiles = entries
			.filter((entry) => entry.isFile())
			.map((entry) => entry.name)
			.filter((entry) => entry.endsWith('.sql'));
		// Apply missing migrations
		for (const fileName of migrationFiles) {
			if (applied.includes(fileName)) continue;
			const absolutePath = join(MIGRATIONS_DIR, fileName);
			const sqlContents = await readfile(absolutePath, 'utf-8');
			db.exec(sqlContents);
			db.prepare(`INSERT INTO __migrations (Name, AppliedAt) VALUES (?, datetime('now'))`).run(
				fileName
			);
			logService.debug(`Migration applied ${fileName}`);
		}
		logService.success(`Database initialized without issues`);
	} catch (error) {
		logService.error('Failed to initialize database', error as Error);
		exit(1);
	}
	if (shouldSeedDb()) {
		seedDb(db, logService);
	}
	db.close();
};
