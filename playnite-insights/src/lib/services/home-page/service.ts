import type { DatabaseSync } from 'node:sqlite';
import { gameDataSchema, type HomePageData } from './schemas';
import z from 'zod';
import {
	getOrderByClause,
	getWhereClauseAndParamsFromFilters,
	type HomePageFilters,
	type HomePageSorting
} from './filter';
import type { LogService } from '@playnite-insights/core';

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
		filters?: HomePageFilters,
		sorting?: HomePageSorting
	): HomePageData | undefined => {
		logService.debug(
			`Getting home page data using: ${JSON.stringify({ offset, pageSize, filters, sorting })}`
		);
		const db = getDb();
		let query = `
      SELECT 
        pg.Id,
        pg.Name,
        pg.CoverImage
      FROM playnite_game pg
    `;
		const { where, params } = getWhereClauseAndParamsFromFilters(filters);
		const orderBy = getOrderByClause(sorting);
		query += where;
		query += orderBy;
		query += ` LIMIT ? OFFSET ?;`;
		params.push(pageSize.toString());
		params.push(offset.toString());

		try {
			const total = getTotal(filters);
			const stmt = db.prepare(query);
			const result = stmt.all(...params);
			const games = z.optional(gameDataSchema).parse(result) ?? [];
			const items = games.length;
			const hasNextPage = offset + pageSize < total;
			const totalPages = Math.ceil(total / pageSize);
			logService.success(
				`Fetched game list for home page, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
			);
			return { games, offset, items, total, hasNextPage, totalPages };
		} catch (error) {
			logService.error('Failed to get home page data', error as Error);
			return undefined;
		}
	};

	return {
		getGames
	};
};
