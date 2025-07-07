import type { LogService } from '../log';
import type { DatabaseSync } from 'node:sqlite';
import { type DashPageData } from './schemas';
import { getLastSixMonthsInclusiveAbreviated } from '$lib/utils/date';

type DashPageServiceDeps = {
	logService: LogService;
	getDb: () => DatabaseSync;
};

export type DashPageService = {
	getOverviewData: () => DashPageData | undefined;
};

export const makeDashPageService = ({ logService, getDb }: DashPageServiceDeps) => {
	const getTotalPlaytimeOverLast6Months = (): number[] => {
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
			const data: number[] = [];
			for (const entry of result) {
				const value = entry.totalPlaytimeHours as number;
				data.push(value);
			}
			logService.success('Successfully queried total playtime over last 6 months');
			return data;
		} catch (error) {
			logService.error('Failed to get total playtime over last 6 months', error as Error);
			return [];
		}
	};

	const getTotalGamesOwnedOverLast6Months = (): number[] => {
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
			const data: number[] = [];
			for (const entry of result) {
				const value = entry.totalGamesOwned as number;
				data.push(value);
			}
			logService.success('Successfully queried total games owned over last 6 months');
			return data;
		} catch (error) {
			logService.error('Failed to get total games owned over last 6 months', error as Error);
			return [];
		}
	};

	const getTopMostPlayedGames = (total: number): DashPageData['top10MostPlayedGames'] => {
		const db = getDb();
		const query = `
    SELECT Id, Name, Playtime
    FROM playnite_game
    ORDER BY Playtime DESC
    LIMIT ?;
  `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all(total);
			const data: DashPageData['top10MostPlayedGames'] = [];
			for (const entry of result) {
				const value = {
					Id: entry.Id as string,
					Name: entry.Name as string | null,
					Playtime: entry.Playtime as number
				};
				data.push(value);
			}
			logService.success(`Found top ${total} most played games, returning ${data?.length} games`);
			return data;
		} catch (error) {
			logService.error(`Failed to get top most played games`, error as Error);
			return [];
		}
	};

	const getPageData = (): DashPageData | undefined => {
		const db = getDb();
		const query = `
      SELECT Id, IsInstalled, Playtime
      FROM playnite_game;
    `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data: Array<{ Id: string; IsInstalled: number | null; Playtime: number }> = [];
			for (const entry of result) {
				data.push({
					Id: entry.Id as string,
					IsInstalled: entry.IsInstalled as number | null,
					Playtime: entry.Playtime as number
				});
			}
			logService.success(
				`Game list for dashboard page fetched, returning data for ${data.length} games`
			);

			const total = data.length;
			const isInstalled = data.length > 0 ? data.filter((g) => Boolean(g.IsInstalled)).length : 0;
			const notInstalled = total - isInstalled;
			const totalPlaytime =
				data.length > 0 ? data.map((g) => g.Playtime).reduce((prev, current) => prev + current) : 0;
			const notPlayed = data.length > 0 ? data.filter((g) => g.Playtime === 0).length : 0;
			const played = total - notPlayed;
			const top10MostPlayedGames = getTopMostPlayedGames(10);

			const charts: DashPageData['charts'] = {
				totalPlaytimeOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: {
						bar: { data: getTotalPlaytimeOverLast6Months() }
					}
				},
				totalGamesOwnedOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: {
						bar: { data: getTotalGamesOwnedOverLast6Months() }
					}
				}
			};

			return {
				total,
				isInstalled,
				notInstalled,
				totalPlaytime,
				notPlayed,
				played,
				charts,
				top10MostPlayedGames
			};
		} catch (error) {
			logService.error('Failed to get dashboard page data', error as Error);
			return undefined;
		}
	};

	return {
		getPageData
	};
};
