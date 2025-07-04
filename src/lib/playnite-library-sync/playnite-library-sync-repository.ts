import { getDb, getLastInsertId } from '$lib/infrastructure/database';
import { z } from 'zod';
import { logError, logSuccess } from '../log/log';

const totalPlaytimeOverTimeSchema = z.array(
	z.object({
		totalPlaytimeHours: z.number()
	})
);
export const getTotalPlaytimeOverLast6Months = (): number[] | undefined => {
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
		const stmt = getDb().prepare(query);
		const result = stmt.all();
		const data = totalPlaytimeOverTimeSchema.parse(result);
		logSuccess('Successfully queried total playtime over last 6 months');
		return data.map((e) => e.totalPlaytimeHours);
	} catch (error) {
		logError('Failed to get total playtime over last 6 months', error as Error);
		return undefined;
	}
};

const totalGamesOwnedOverLast6MonthsSchema = z.array(
	z.object({
		totalGamesOwned: z.number()
	})
);
export const getTotalGamesOwnedOverLast6Months = (): number[] | undefined => {
	const query = `
      SELECT totalGamesOwned FROM (
        SELECT MAX(TotalGames) as totalGamesOwned, strftime('%Y-%m', Timestamp) as yearMonth
        FROM playnite_library_sync
        WHERE Timestamp >= datetime('now', '-6 months')
        GROUP BY yearMonth
        ORDER BY yearMonth
      );
    `;
	try {
		const stmt = getDb().prepare(query);
		const result = stmt.all();
		const data = totalGamesOwnedOverLast6MonthsSchema.parse(result);
		logSuccess('Successfully queried total games owned over last 6 months');
		return data.map((e) => e.totalGamesOwned);
	} catch (error) {
		logError('Failed to get total games owned over last 6 months', error as Error);
		return undefined;
	}
};

export const addPlayniteLibrarySync = (totalPlaytimeHours: number, totalGames: number) => {
	const db = getDb();
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
		const lastInsertId = getLastInsertId();
		logSuccess(
			`Inserted playnite_library_sync entry with id: ${lastInsertId ?? 'undefined'}, totalPlaytime: ${totalPlaytimeHours} hours and totalGames: ${totalGames}`
		);
		return true;
	} catch (error) {
		logError('Error while inserting new entry for Playnite library sync', error as Error);
		return false;
	}
};
