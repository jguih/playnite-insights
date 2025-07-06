import type { DatabaseSync } from 'node:sqlite';
import type { LogService } from '$lib/services/log';

type PlayniteLibrarySyncRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export type PlayniteLibrarySyncRepository = {
	add: (totalPlaytimeHours: number, totalGames: number) => boolean;
};

export const makePlayniteLibrarySyncRepository = (
	deps: PlayniteLibrarySyncRepositoryDeps
): PlayniteLibrarySyncRepository => {
	const add = (totalPlaytimeHours: number, totalGames: number) => {
		const db = deps.getDb();
		const now = new Date().toISOString();
		const query = `
      INSERT INTO playnite_library_sync
        (Timestamp, TotalPlaytimeHours, TotalGames)
      VALUES
        (?, ?, ?);
    `;
		try {
			const stmt = db.prepare(query);
			stmt.run(now, totalPlaytimeHours, totalGames);
			deps.logService.success(
				`Inserted playnite_library_sync entry with totalPlaytime: ${totalPlaytimeHours} hours and totalGames: ${totalGames}`
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
