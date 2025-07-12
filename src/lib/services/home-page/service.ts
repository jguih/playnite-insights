import type { DatabaseSync } from 'node:sqlite';
import { gameDataSchema, type HomePageData } from './schemas';
import type { LogService } from '../log';
import z from 'zod';
import { getWhereClauseAndParamsFromFilters, type HomePageFilters } from './filter';

type HomePageServiceDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export const makeHomePageService = ({ getDb, logService }: HomePageServiceDeps) => {
	const getTotal = (filters?: HomePageFilters): number => {
		const db = getDb();
		let query = `
      SELECT 
        COUNT(*) AS Total
      FROM playnite_game pg
    `;
		const { where, params } = getWhereClauseAndParamsFromFilters(filters);
		query += where;
		try {
			const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;
			return total;
		} catch (error) {
			logService.error(`Failed to get total games count`, error as Error);
			return 0;
		}
	};

	const getGames = (
		offset: number,
		pageSize: number,
		filters?: HomePageFilters
	): HomePageData | undefined => {
		logService.debug(`Getting home page data using filters: ${JSON.stringify(filters)}`);
		const db = getDb();
		let query = `
      SELECT 
        pg.Id,
        pg.Name,
        pg.CoverImage
      FROM playnite_game pg
    `;
		const { where, params } = getWhereClauseAndParamsFromFilters(filters);
		query += where;
		query += ` ORDER BY Added DESC`;
		query += ` LIMIT ? OFFSET ?;`;
		params.push(pageSize.toString());
		params.push(offset.toString());

		try {
			const total = getTotal(filters);
			const stmt = db.prepare(query);
			const result = stmt.all(...params);
			const games = z.optional(gameDataSchema).parse(result) ?? [];
			const hasNextPage = offset + pageSize < total;
			const totalPages = Math.ceil(total / pageSize);
			logService.success(
				`Fetched game list for home page, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
			);
			return { games, total, hasNextPage, totalPages };
		} catch (error) {
			logService.error('Failed to get home page data', error as Error);
			return undefined;
		}
	};

	return {
		getGames
	};
};
