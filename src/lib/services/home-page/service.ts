import type { DatabaseSync } from 'node:sqlite';
import { gameDataSchema, type HomePageData } from './schemas';
import type { LogService } from '../log';
import type { PlayniteGameRepository } from '../playnite-game';
import z from 'zod';

type HomePageServiceDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
	playniteGameRepository: PlayniteGameRepository;
};

export const makeHomePageService = ({
	getDb,
	logService,
	playniteGameRepository
}: HomePageServiceDeps) => {
	const getGames = (offset: number, pageSize: number, query?: string | null): HomePageData => {
		const db = getDb();
		let sqlQuery = `
      SELECT 
        pg.Id,
        pg.Name,
        pg.CoverImage
      FROM playnite_game pg
      WHERE 1=1
    `;
		const params = [];
		if (query) {
			sqlQuery += ` AND LOWER(pg.Name) LIKE ?`;
			params.push(`%${query.toLowerCase()}%`);
		}
		sqlQuery += ` LIMIT ? OFFSET ?;`;
		params.push(pageSize, offset);

		try {
			const stmt = db.prepare(sqlQuery);
			const result = stmt.all(...params);
			const games = z.optional(gameDataSchema).parse(result) ?? [];
			const total = playniteGameRepository.getTotal(query);
			const hasNextPage = offset + pageSize < total;
			const totalPages = Math.ceil(total / pageSize);
			logService.success(
				`Fetched game list for home page, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
			);
			return { games, total, hasNextPage, totalPages };
		} catch (error) {
			logService.error('Failed to get all games from database', error as Error);
			return undefined;
		}
	};

	return {
		getGames
	};
};
