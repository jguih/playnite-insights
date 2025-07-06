import { z } from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import type { services } from '$lib/services/setup';

type PlayniteLibrarySyncRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: typeof services.log;
};

export const makePlayniteLibrarySyncRepository = (deps: PlayniteLibrarySyncRepositoryDeps) => {
	const totalPlaytimeOverTimeSchema = z.array(
		z.object({
			totalPlaytimeHours: z.number()
		})
	);
	const getTotalPlaytimeOverLast6Months = (): number[] | undefined => {
		const query = `
        SELECT totalPlaytimeHours FROM (
          SELECT MAX(TotalPlaytimeHours) as totalPlaytimeHours, strftime('%Y-%m', Timestamp) as yearMonth
          FROM playnite_library_sync
          WHERE Timestamp >= datetime('now', '-6 months')
          GROUP BY yearMonth
          ORDER BY yearMonth
        );
      `;
		try {
			const stmt = deps.getDb().prepare(query);
			const result = stmt.all();
			const data = totalPlaytimeOverTimeSchema.parse(result);
			deps.logService.success('Successfully queried total playtime over last 6 months');
			return data.map((e) => e.totalPlaytimeHours);
		} catch (error) {
			deps.logService.error('Failed to get total playtime over last 6 months', error as Error);
			return undefined;
		}
	};

	const totalGamesOwnedOverLast6MonthsSchema = z.array(
		z.object({
			totalGamesOwned: z.number()
		})
	);
	const getTotalGamesOwnedOverLast6Months = (): number[] | undefined => {
		const query = `
        WITH latest_per_month AS (
          SELECT *
          FROM playnite_library_sync AS pls
          WHERE Timestamp = (
            SELECT MAX(Timestamp)
            FROM playnite_library_sync
            WHERE strftime('%Y-%m', Timestamp) = strftime('%Y-%m', pls.Timestamp)
          )
        )
        SELECT TotalGames AS totalGamesOwned, strftime('%Y-%m', Timestamp) AS yearMonth
        FROM latest_per_month
        WHERE Timestamp >= datetime('now', '-6 months')
        ORDER BY yearMonth;
      `;
		try {
			const stmt = deps.getDb().prepare(query);
			const result = stmt.all();
			const data = totalGamesOwnedOverLast6MonthsSchema.parse(result);
			deps.logService.success('Successfully queried total games owned over last 6 months');
			return data.map((e) => e.totalGamesOwned);
		} catch (error) {
			deps.logService.error('Failed to get total games owned over last 6 months', error as Error);
			return undefined;
		}
	};

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
		getTotalGamesOwnedOverLast6Months,
		getTotalPlaytimeOverLast6Months,
		add
	};
};
