import { logError, logSuccess } from '../log/log';
import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';
import { developerSchema, type Developer } from '$lib/developer/schemas';
import {
	dashPagePlayniteGameListSchema,
	playniteGameSchema,
	type PlayniteGame
} from '$lib/playnite-game/schemas';
import {
	addDeveloper,
	developerExists,
	developerHasChanges,
	getDeveloperById,
	updateDeveloper
} from '../developer/developer-repository';
import {
	addPlatform,
	getPlatformById,
	platformExists,
	platformHasChanges,
	updatePlatform
} from '../platform/platform-repository';
import type { Platform } from '$lib/platform/schemas';
import type { Genre } from '$lib/genre/schemas';
import {
	addGenre,
	genreExists,
	genreHasChanges,
	getGenreById,
	updateGenre
} from '../genre/genre-repository';
import type { Publisher } from '$lib/publisher/schemas';
import {
	addPublisher,
	getPublisherById,
	publisherExists,
	publisherHasChanges,
	updatePublisher
} from '$lib/publisher/publisher-repository';

const totalPlayniteGamesSchema = z.object({
	total: z.number()
});
export const getTotalPlayniteGames = (): number => {
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
		const stmt = db.prepare(query);
		const result = stmt.all(pageSize, offset);
		const data = homePagePlayniteGamesSchema.parse(result);
		const total = getTotalPlayniteGames();
		const hasNextPage = offset + pageSize < total;
		const totalPages = Math.ceil(total / pageSize);
		logSuccess(
			`Fetched game list for home page, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
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

export const getPlayniteGameById = (id: string): PlayniteGame | undefined => {
	const db = getDb();
	const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const game = z.optional(playniteGameSchema).parse(result);
		logSuccess(`Found game ${game?.Name}`);
		return game;
	} catch (error) {
		logError('Failed to get Playnite game with id: ' + id, error as Error);
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
		const stmt = db.prepare(query);
		const result = stmt.all();
		const data = dashPagePlayniteGameListSchema.parse(result);
		logSuccess(`Game list for dashboard page fetched, returning data for ${data.length} games`);
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

export const deleteDevelopersForPlayniteGame = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>
): boolean => {
	const db = getDb();
	const query = `DELETE FROM playnite_game_developer WHERE GameId = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(game.Id);
		logSuccess(`Deleted ${result.changes} developer relationships for ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to delete developer relationships for ${game.Name}`, error as Error);
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

export const deletePlatformsForPlayniteGame = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>
): boolean => {
	const db = getDb();
	const query = `DELETE FROM playnite_game_platform WHERE GameId = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(game.Id);
		logSuccess(`Deleted ${result.changes} platform relationships for ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to delete platform relationships for ${game.Name}`, error as Error);
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

export const deleteGenresForPlayniteGame = (game: Pick<PlayniteGame, 'Id' | 'Name'>): boolean => {
	const db = getDb();
	const query = `DELETE FROM playnite_game_genre WHERE GameId = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(game.Id);
		logSuccess(`Deleted ${result.changes} genre relationships for ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to delete genre relationships for ${game.Name}`, error as Error);
		return false;
	}
};

export const addPlayniteGamePublisher = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>,
	publisher: Publisher
): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO playnite_game_publisher
      (GameId, PublisherId)
    VALUES
      (?, ?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(game.Id, publisher.Id);
		logSuccess(`Added publisher ${publisher.Name} to game ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add publisher ${publisher.Name} for game ${game.Name}`, error as Error);
		return false;
	}
};

export const deletePublishersForPlayniteGame = (
	game: Pick<PlayniteGame, 'Id' | 'Name'>
): boolean => {
	const db = getDb();
	const query = `DELETE FROM playnite_game_publisher WHERE GameId = (?)`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(game.Id);
		logSuccess(`Deleted ${result.changes} publisher relationships for ${game.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to delete publisher relationships for ${game.Name}`, error as Error);
		return false;
	}
};

export const addPlayniteGame = (
	game: PlayniteGame,
	developers?: Array<Developer>,
	platforms?: Array<Platform>,
	genres?: Array<Genre>,
	publishers?: Array<Publisher>
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
		if (publishers) {
			for (const publisher of publishers) {
				if (publisherExists(publisher)) {
					addPlayniteGamePublisher({ Id: game.Id, Name: game.Name }, publisher);
					continue;
				}
				if (addPublisher(publisher)) {
					addPlayniteGamePublisher({ Id: game.Id, Name: game.Name }, publisher);
				}
			}
		}
		return true;
	} catch (error) {
		logError(`Failed to add game ${game.Name}`, error as Error);
		return false;
	}
};

export const updatePlayniteGame = (
	game: PlayniteGame,
	developers?: Array<Developer>,
	platforms?: Array<Platform>,
	genres?: Array<Genre>,
	publishers?: Array<Publisher>
) => {
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
		logSuccess(`Updated game ${game.Name}`);
		if (developers) {
			deleteDevelopersForPlayniteGame({ Id: game.Id, Name: game.Name });
			for (const developer of developers) {
				const existing = getDeveloperById(developer.Id);
				if (existing) {
					if (developerHasChanges(existing, developer)) {
						updateDeveloper(developer);
					}
				} else {
					addDeveloper(developer);
				}
				addPlayniteGameDeveloper({ Id: game.Id, Name: game.Name }, developer);
			}
		}
		if (platforms) {
			deletePlatformsForPlayniteGame({ Id: game.Id, Name: game.Name });
			for (const platform of platforms) {
				const existing = getPlatformById(platform.Id);
				if (existing) {
					if (platformHasChanges(existing, platform)) {
						updatePlatform(platform);
					}
				} else {
					addPlatform(platform);
				}
				addPlayniteGamePlatform({ Id: game.Id, Name: game.Name }, platform);
			}
		}
		if (genres) {
			deleteGenresForPlayniteGame({ Id: game.Id, Name: game.Name });
			for (const genre of genres) {
				const existing = getGenreById(genre.Id);
				if (existing) {
					if (genreHasChanges(existing, genre)) {
						updateGenre(genre);
					}
				} else {
					addGenre(genre);
				}
				addPlayniteGameGenre({ Id: game.Id, Name: game.Name }, genre);
			}
		}
		if (publishers) {
			deletePublishersForPlayniteGame({ Id: game.Id, Name: game.Name });
			for (const publisher of publishers) {
				const existing = getPublisherById(publisher.Id);
				if (existing) {
					if (publisherHasChanges(existing, publisher)) {
						updatePublisher(publisher);
					}
				} else {
					addPublisher(publisher);
				}
				addPlayniteGamePublisher({ Id: game.Id, Name: game.Name }, publisher);
			}
		}
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
		const totalPlaytimeHours = data.totalPlaytimeSeconds
			? data.totalPlaytimeSeconds / 3600
			: undefined;
		logSuccess(`Fetched total playtime hours: ${totalPlaytimeHours}`);
		return totalPlaytimeHours;
	} catch (error) {
		logError(`Failed to get total playtime`, error as Error);
		return;
	}
};

export const getTopMostPlayedGames = (total: number): Array<PlayniteGame> | undefined => {
	const db = getDb();
	const query = `
    SELECT *
    FROM playnite_game
    ORDER BY Playtime DESC
    LIMIT ?;
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.all(total);
		const data = z.optional(z.array(playniteGameSchema)).parse(result);
		logSuccess(`Found top ${total} most played games, returning ${data?.length} games`);
		return data;
	} catch (error) {
		logError(`Failed to get top most played games`, error as Error);
	}
};
