import { logDebug, logError, logSuccess } from './log';
import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';
import { developerSchema, type Developer } from '$lib/models/developer';
import { playniteGameSchema, type PlayniteGame } from '$lib/models/playnite-game';
import { addDeveloper, developerExists } from './developer-repository';
import { addPlatform, platformExists } from './platform-repository';
import type { Platform } from '$lib/models/platform';
import type { Genre } from '$lib/models/genre';
import { addGenre, genreExists } from './genre-repository';
import { dashPagePlayniteGameListSchema } from '$lib/models/api/playnite-game/schemas';

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
export type GetHomePagePlayniteGameListResult =
	| {
			data: z.infer<typeof homePagePlayniteGamesSchema>;
			offset: number;
			pageSize: number;
			total: number;
			hasNextPage: boolean;
			totalPages: number;
	  }
	| undefined;
export const getHomePagePlayniteGameList = (
	offset: number,
	pageSize: number
): GetHomePagePlayniteGameListResult => {
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
		logDebug(`Fetching game list for home page, offset: ${offset}, pageSize: ${pageSize}`);
		const stmt = db.prepare(query);
		const result = stmt.all(pageSize, offset);
		const data = homePagePlayniteGamesSchema.parse(result);
		const total = getTotalPlayniteGames();
		const hasNextPage = offset + pageSize < total;
		const totalPages = Math.ceil(total / pageSize);
		logDebug(
			`Fetched game list for home page successfully, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
		);
		return { data, offset, pageSize, total, hasNextPage, totalPages };
	} catch (error) {
		logError('Failed to get all games from database', error as Error);
		return undefined;
	}
};

export const getPlayniteGameDevelopers = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>
): Array<Developer> | undefined => {
	const db = getDb();
	const query = `
    SELECT dev.Id, dev.Name 
    FROM playnite_game_developer pgdev
    JOIN developer dev ON dev.Id = pgdev.DeveloperId
    WHERE pgdev.GameId = (?)
  `;
	try {
		logDebug(`Fetching developer list for game with id ${game.Id}...`);
		const stmt = db.prepare(query);
		const result = stmt.all(game.Id);
		const data = z.array(developerSchema).parse(result);
		logSuccess(`Developer list for ${game.Name} fetched: ${data.map((d) => d.Name).join(', ')}`);
		return data;
	} catch (error) {
		logError(`Failed to get developer list for ${game.Name}:`, error as Error);
		return undefined;
	}
};

export type GetPlayniteGameByIdResult =
	| (PlayniteGame & {
			Developers?: Array<z.infer<typeof developerSchema>>;
	  })
	| undefined;
export const getPlayniteGameById = (id: string): GetPlayniteGameByIdResult => {
	const db = getDb();
	const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
	try {
		logDebug(`Fetching game with id ${id}...`);
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const game = playniteGameSchema.parse(result);
		logDebug(`Game with id ${id} fetched successfully`);
		return { ...game, Developers: getPlayniteGameDevelopers({ Id: game.Id, Name: game.Name }) };
	} catch (error) {
		logError('Failed to get Playnite game with id:' + id, error as Error);
		return undefined;
	}
};

export const getDashPagePlayniteGameList = ():
	| z.infer<typeof dashPagePlayniteGameListSchema>
	| undefined => {
	const db = getDb();
	const query = `
    SELECT Id, IsInstalled, Playtime
    FROM playnite_game;
  `;
	try {
		logDebug(`Fetching game list for dashboard page...`);
		const stmt = db.prepare(query);
		const result = stmt.all();
		const data = dashPagePlayniteGameListSchema.parse(result);
		logDebug(
			`Game list for dashboard page fetched successfully, returning data for ${data.length} games`
		);
		return data;
	} catch (error) {
		logError('Failed to get game list for dashboard page', error as Error);
		return undefined;
	}
};

export const playniteGameExists = (gameId: string) => {
	const db = getDb();
	const query = `
    SELECT EXISTS (
      SELECT 1 FROM playnite_game WHERE Id = (?)
    );
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(gameId) as object;
		if (result) {
			return Object.values(result)[0] === 1;
		}
		return false;
	} catch (error) {
		logError(`Failed to check if game with id ${gameId} exists`, error as Error);
		return false;
	}
};

export const addPlayniteGameDeveloper = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>,
	developer: Developer
): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO playnite_game_developer
      (GameId, DeveloperId)
    VALUES
      (?, ?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(game.Id, developer.Id);
		logSuccess(`Added developer ${developer.Name} to game ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add developer ${developer.Name} for game ${game.Name}`, error as Error);
		return false;
	}
};

export const addPlayniteGamePlatform = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>,
	platform: Platform
): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO playnite_game_platform
      (GameId, PlatformId)
    VALUES
      (?, ?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(game.Id, platform.Id);
		logSuccess(`Added platform ${platform.Name} to game ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add platform ${platform.Name} for game ${game.Name}`, error as Error);
		return false;
	}
};

export const addPlayniteGameGenre = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>,
	genre: Genre
): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO playnite_game_genre
      (GameId, GenreId)
    VALUES
      (?, ?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(game.Id, genre.Id);
		logSuccess(`Added genre ${genre.Name} to game ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add genre ${genre.Name} for game ${game.Name}`, error as Error);
		return false;
	}
};

export const addPlayniteGame = (
	game: PlayniteGame,
	developers?: Array<Developer>,
	platforms?: Array<Platform>,
	genres?: Array<Genre>
): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO playnite_game
     (Id, Name, Description, ReleaseDate, Playtime, LastActivity, Added, InstallDirectory, IsInstalled, BackgroundImage, CoverImage, Icon, ContentHash)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(
			game.Id,
			game.Name ?? null,
			game.Description ?? null,
			game.ReleaseDate ?? null,
			game.Playtime ?? null,
			game.LastActivity ?? null,
			game.Added ?? null,
			game.InstallDirectory ?? null,
			+game.IsInstalled,
			game.BackgroundImage ?? null,
			game.CoverImage ?? null,
			game.Icon ?? null,
			game.ContentHash
		);
		logSuccess(`Added game ${game.Name}`);
		if (developers) {
			for (const developer of developers) {
				if (developerExists(developer)) {
					addPlayniteGameDeveloper({ Id: game.Id, Name: game.Name }, developer);
					continue;
				}
				if (addDeveloper(developer)) {
					addPlayniteGameDeveloper({ Id: game.Id, Name: game.Name }, developer);
				}
			}
		}
		if (platforms) {
			for (const platform of platforms) {
				if (platformExists(platform)) {
					addPlayniteGamePlatform({ Id: game.Id, Name: game.Name }, platform);
					continue;
				}
				if (addPlatform(platform)) {
					addPlayniteGamePlatform({ Id: game.Id, Name: game.Name }, platform);
				}
			}
		}
		if (genres) {
			for (const genre of genres) {
				if (genreExists(genre)) {
					addPlayniteGameGenre({ Id: game.Id, Name: game.Name }, genre);
					continue;
				}
				if (addGenre(genre)) {
					addPlayniteGameGenre({ Id: game.Id, Name: game.Name }, genre);
				}
			}
		}
		return true;
	} catch (error) {
		logError(`Failed to add game ${game.Name}`, error as Error);
		return false;
	}
};

export const updatePlayniteGame = (game: PlayniteGame) => {
	const db = getDb();
	const query = `
    UPDATE playnite_game
    SET
      Name = ?,
      Description = ?,
      ReleaseDate = ?,
      Playtime = ?,
      LastActivity = ?,
      Added = ?,
      InstallDirectory = ?,
      IsInstalled = ?,
      BackgroundImage = ?,
      CoverImage = ?,
      Icon = ?,
      ContentHash = ?
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(
			game.Name ?? null,
			game.Description ?? null,
			game.ReleaseDate ?? null,
			game.Playtime ?? null,
			game.LastActivity ?? null,
			game.Added ?? null,
			game.InstallDirectory ?? null,
			+game.IsInstalled,
			game.BackgroundImage ?? null,
			game.CoverImage ?? null,
			game.Icon ?? null,
			game.ContentHash,
			game.Id // WHERE Id
		);
		logDebug(`Updated game ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed update game ${game.Name}`, error as Error);
		return false;
	}
};

export const deletePlayniteGame = (gameId: string): boolean => {
	const db = getDb();
	const query = `DELETE FROM playnite_game WHERE Id = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(gameId);
		logSuccess(`Game with id ${gameId} deleted successfully`);
		return result.changes == 1; // Number of rows affected
	} catch (error) {
		logError(`Failed to delete game with id ${gameId}`, error as Error);
		return false;
	}
};

const gameManifestDataSchema = z.array(
	z.object({
		Id: z.string(),
		ContentHash: z.string()
	})
);
export const getAllPlayniteGameManifestData = ():
	| z.infer<typeof gameManifestDataSchema>
	| undefined => {
	const db = getDb();
	const query = `SELECT Id, ContentHash FROM playnite_game`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.all();
		const data = gameManifestDataSchema.parse(result);
		return data;
	} catch (error) {
		logError(`Failed to get all game Ids from database`, error as Error);
		return;
	}
};

const totalPlaytimeSecondsSchema = z.object({ totalPlaytimeSeconds: z.number().nullable() });
export const getTotalPlaytimeHours = (): number | undefined => {
	const db = getDb();
	const query = `
    SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game;
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get();
		const data = totalPlaytimeSecondsSchema.parse(result);
		return data.totalPlaytimeSeconds ? data.totalPlaytimeSeconds / 3600 : undefined;
	} catch (error) {
		logError(`Failed to get total playtime`, error as Error);
		return;
	}
};
