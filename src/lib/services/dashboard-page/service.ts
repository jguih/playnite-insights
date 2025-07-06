import z from 'zod';
import type { LogService } from '../log';
import type { DatabaseSync } from 'node:sqlite';
import { overviewDataSchema, type DashPageOverviewData } from './schemas';

type DashPageServiceDeps = {
	logService: LogService;
	getDb: () => DatabaseSync;
};

export type DashPageService = {
	getTotalPlaytimeOverLast6Months: () => number[] | undefined;
	getTotalGamesOwnedOverLast6Months: () => number[] | undefined;
	getOverviewData: () => DashPageOverviewData | undefined;
};

export const makeDashPageService = ({ logService, getDb }: DashPageServiceDeps) => {
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
			const stmt = getDb().prepare(query);
			const result = stmt.all();
			const data = totalPlaytimeOverTimeSchema.parse(result);
			logService.success('Successfully queried total playtime over last 6 months');
			return data.map((e) => e.totalPlaytimeHours);
		} catch (error) {
			logService.error('Failed to get total playtime over last 6 months', error as Error);
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
			const stmt = getDb().prepare(query);
			const result = stmt.all();
			const data = totalGamesOwnedOverLast6MonthsSchema.parse(result);
			logService.success('Successfully queried total games owned over last 6 months');
			return data.map((e) => e.totalGamesOwned);
		} catch (error) {
			logService.error('Failed to get total games owned over last 6 months', error as Error);
			return undefined;
		}
	};

	const getOverviewData = (): DashPageOverviewData | undefined => {
		const db = getDb();
		const query = `
      SELECT Id, IsInstalled, Playtime
      FROM playnite_game;
    `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data = overviewDataSchema.parse(result);
			logService.success(
				`Game list for dashboard page fetched, returning data for ${data.length} games`
			);
			return data;
		} catch (error) {
			logService.error('Failed to get game list for dashboard page', error as Error);
			return undefined;
		}
	};

	return {
		getTotalPlaytimeOverLast6Months,
		getTotalGamesOwnedOverLast6Months,
		getOverviewData
	};
};
