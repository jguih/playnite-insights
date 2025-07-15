import type { LogService } from '@playnite-insights/core';
import type { DatabaseSync } from 'node:sqlite';

type PlayniteLibrarySyncRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export type PlayniteLibrarySyncRepository = {
	add: (totalPlaytimeSeconds: number, totalGames: number) => boolean;
};

export const makePlayniteLibrarySyncRepository = (
	deps: PlayniteLibrarySyncRepositoryDeps
): PlayniteLibrarySyncRepository => {
	const add = (totalPlaytimeSeconds: number, totalGames: number) => {
		const db = deps.getDb();
		const now = new Date().toISOString();
		const query = `
      INSERT INTO playnite_library_sync
        (Timestamp, TotalPlaytimeSeconds, TotalGames)
      VALUES
        (?, ?, ?);
    `;
		try {
			const stmt = db.prepare(query);
			stmt.run(now, totalPlaytimeSeconds, totalGames);
			deps.logService.debug(
				`Inserted playnite_library_sync entry with totalPlaytime: ${totalPlaytimeSeconds} seconds and totalGames: ${totalGames}`
			);
			return true;
		} catch (error) {
			deps.logService.error(
				'Error while inserting new entry for Playnite library sync',
				error as Error
			);
			return false;
		}
	};

	return {
		add
	};
};
