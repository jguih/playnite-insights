import type { DatabaseSync } from 'node:sqlite';
import { type DashPageData } from './schemas';
import { getLastSixMonthsInclusiveAbreviated } from '$lib/utils/date';
import type { LogService } from '@playnite-insights/core';

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
        SELECT totalPlaytimeSeconds FROM (
          SELECT MAX(TotalPlaytimeSeconds) as totalPlaytimeSeconds, strftime('%Y-%m', Timestamp) as yearMonth
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
				const value = entry.totalPlaytimeSeconds as number;
				data.push(value);
			}
			logService.debug(
				`Successfully queried total playtime over last 6 months: ${JSON.stringify(data)}`
			);
			return data;
		} catch (error) {
			logService.error('Failed to get total playtime over last 6 months', error as Error);
			return [];
		}
	};

	const getTotalGamesOwnedOverLast6Months = (): number[] => {
		const query = `
        SELECT MAX(TotalGames) AS totalGamesOwned, strftime('%Y-%m', Timestamp) AS yearMonth
        FROM playnite_library_sync
        WHERE Timestamp >= datetime('now', '-6 months')
        GROUP BY yearMonth
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
			logService.debug(
				`Successfully queried total games owned over last 6 months: ${JSON.stringify(data)}`
			);
			return data;
		} catch (error) {
			logService.error('Failed to get total games owned over last 6 months', error as Error);
			return [];
		}
	};

	const getTopMostPlayedGames = (total: number): DashPageData['top10MostPlayedGames'] => {
		const db = getDb();
		const query = `
    SELECT Id, Name, Playtime, CoverImage, LastActivity
    FROM playnite_game
    ORDER BY Playtime DESC
    LIMIT ?;
  `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all(total);
			const data: DashPageData['top10MostPlayedGames'] = [];
			for (const entry of result) {
				const value: DashPageData['top10MostPlayedGames'][number] = {
					Id: entry.Id as string,
					Name: entry.Name as string | null,
					Playtime: entry.Playtime as number,
					CoverImage: entry.CoverImage as string | null,
					LastActivity: entry.LastActivity as string | null
				};
				data.push(value);
			}
			logService.debug(`Found top ${total} most played games, returning ${data?.length} games`);
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
			// Convert to hours
			const totalPlaytimeOverLast6Months = getTotalPlaytimeOverLast6Months().map((p) =>
				Math.ceil(p / 3600)
			);

			const charts: DashPageData['charts'] = {
				totalPlaytimeOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: {
						bar: { data: totalPlaytimeOverLast6Months }
					}
				},
				totalGamesOwnedOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: {
						bar: { data: getTotalGamesOwnedOverLast6Months() }
					}
				}
			};
			logService.success(`Fetched all the data for dashboard page without issues`);
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
