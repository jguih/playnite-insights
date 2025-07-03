import type { PlayniteGameMetadata } from '$lib/models/playnite-game';
import { readFile } from 'fs/promises';
import { logDebug, logError } from './log';
import { playniteInsightsConfig } from '$lib/config/config';
import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';

const PLAYNITE_GAMES_FILE = playniteInsightsConfig.path.playniteGamesFile;

const getGameListFromFile = async (): Promise<PlayniteGameMetadata[]> => {
	try {
		logDebug(`Reading game list JSON file at ${PLAYNITE_GAMES_FILE}`);
		const content = await readFile(PLAYNITE_GAMES_FILE, 'utf-8');
		const asJson = JSON.parse(content.toString()) as Array<PlayniteGameMetadata>;
		logDebug(`Read game list JSON file succesfully, returning ${asJson.length} games`);
		return asJson ?? [];
	} catch (error) {
		logError('Error reading game list file', error as Error);
		return [];
	}
};

export const getGameList = async (): Promise<Array<PlayniteGameMetadata>> => {
	return await getGameListFromFile();
};

export const getGameById = async (playniteGameId: string): Promise<PlayniteGameMetadata | null> => {
	const gameList = await getGameListFromFile();
	if (gameList.length === 0) {
		return null;
	}
	const game = gameList.find((game) => game.Id === playniteGameId);
	return game ?? null;
};

// ---- Database Functions

const totalPlayniteGamesSchema = z.object({
	total: z.number()
});
const getTotalPlayniteGames = (): number => {
	const db = getDb();
	const query = `SELECT count(*) as total FROM playnite_game;`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get();
		const data = totalPlayniteGamesSchema.parse(result);
		return data.total;
	} catch (error) {
		logError('Failed to get total amount of games', error as Error);
		return 0;
	}
};

const homePagePlayniteGamesSchema = z.array(
	z.object({
		Id: z.string(),
		Name: z.string().nullable().optional(),
		CoverImage: z.string().nullable().optional()
	})
);
export type GetHomePagePlayniteGamesResponse =
	| {
			data: z.infer<typeof homePagePlayniteGamesSchema>;
			offset: number;
			pageSize: number;
			total: number;
			hasNextPage: boolean;
			totalPages: number;
	  }
	| undefined;
export const getHomePagePlayniteGames = (
	offset: number,
	pageSize: number
): GetHomePagePlayniteGamesResponse => {
	const db = getDb();
	const query = `
    SELECT 
      pg.Id,
      pg.Name,
      pg.CoverImage
    FROM playnite_game pg
    LIMIT (?) OFFSET (?);
  `;

	try {
		const stmt = db.prepare(query);
		const result = stmt.all(pageSize, offset);
		const data = homePagePlayniteGamesSchema.parse(result);
		const total = getTotalPlayniteGames();
		const hasNextPage = offset + pageSize < total;
		const totalPages = Math.ceil(total / pageSize);
		return { data, offset, pageSize, total, hasNextPage, totalPages };
	} catch (error) {
		logError('Failed to get all games from database', error as Error);
		return undefined;
	}
};

const developerSchema = z.object({
	Id: z.string(),
	Name: z.string()
});
export const getPlayniteGameDevelopers = (
	gameId: string
): Array<z.infer<typeof developerSchema>> | undefined => {
	const db = getDb();
	const query = `
    SELECT dev.Id, dev.Name 
    FROM playnite_game_developer pgdev
    JOIN developer dev ON dev.Id = pgdev.DeveloperId
    WHERE pgdev.GameId = (?)
  `;
	try {
		logDebug(`Fetching developer list for game with id ${gameId}...`);
		const stmt = db.prepare(query);
		const result = stmt.all(gameId);
		const data = z.array(developerSchema).parse(result);
		logDebug(`Developer list for game with id ${gameId} fetched successfully`);
		return data;
	} catch (error) {
		logError('Failed to get developer list for game with id:' + gameId, error as Error);
		return undefined;
	}
};

const playniteGameSchema = z.object({
	Id: z.string(),
	Name: z.string().optional().nullable(),
	Description: z.string().optional().nullable(),
	ReleaseDate: z.string().optional().nullable(),
	Playtime: z.number(),
	LastActivity: z.string().optional().nullable(),
	Added: z.string().optional().nullable(),
	InstallDirectory: z.string().optional().nullable(),
	IsInstalled: z.number().transform((n) => Boolean(n)),
	BackgroundImage: z.string().optional().nullable(),
	CoverImage: z.string().optional().nullable(),
	Icon: z.string().optional().nullable()
});
export type GetPlayniteGameByIdResult = z.infer<typeof playniteGameSchema> & {
	developers?: Array<z.infer<typeof developerSchema>>;
};
export const getPlayniteGameById = (id: string): GetPlayniteGameByIdResult | undefined => {
	const db = getDb();
	const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
	try {
		logDebug(`Fetching game with id ${id}...`);
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const data = playniteGameSchema.parse(result);
		logDebug(`Game with id ${id} fetched successfully`);
		return { ...data, developers: getPlayniteGameDevelopers(id) };
	} catch (error) {
		logError('Failed to get Playnite game with id:' + id, error as Error);
		return undefined;
	}
};
