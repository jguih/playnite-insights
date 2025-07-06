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
import {
	homePagePlayniteGameMetadataSchema,
	homePagePlayniteGameListSchema
} from '../page/home/schemas';
import type { DatabaseSync } from 'node:sqlite';
import type { logService } from '$lib/services/setup';

type PlayniteGameRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: typeof logService;
};

export const makePlayniteGameRepository = (deps: PlayniteGameRepositoryDeps) => {
	const totalPlayniteGamesSchema = z.object({
		total: z.number()
	});
	const getTotal = (query?: string | null): number => {
		const db = deps.getDb();
		let sqlQuery = `
      SELECT count(*) as total 
      FROM playnite_game pg
      WHERE 1=1
    `;
		const params = [];
		if (query) {
			sqlQuery += ` AND LOWER(pg.Name) LIKE ?`;
			params.push(`%${query.toLowerCase()}%`);
		}
		try {
			const stmt = db.prepare(sqlQuery);
			const result = stmt.get(...params);
			const data = totalPlayniteGamesSchema.parse(result);
			return data.total;
		} catch (error) {
			deps.logService.error('Failed to get total amount of games', error as Error);
			return 0;
		}
	};

	const getHomePagePlayniteGameList = (
		offset: number,
		pageSize: number,
		query?: string | null
	): z.infer<typeof homePagePlayniteGameListSchema> => {
		const db = deps.getDb();
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
			const games = z.optional(homePagePlayniteGameMetadataSchema).parse(result) ?? [];
			const total = getTotal(query);
			const hasNextPage = offset + pageSize < total;
			const totalPages = Math.ceil(total / pageSize);
			deps.logService.success(
				`Fetched game list for home page, returning games ${offset} to ${Math.min(pageSize + offset, total)} out of ${total}`
			);
			return { games, total, hasNextPage, totalPages };
		} catch (error) {
			deps.logService.error('Failed to get all games from database', error as Error);
			return undefined;
		}
	};

	const getDevelopers = (game: Pick<PlayniteGame, 'Id' | 'Name'>): Array<Developer> | undefined => {
		const db = deps.getDb();
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
			deps.logService.success(
				`Developer list for ${game.Name} fetched: ${data.map((d) => d.Name).join(', ')}`
			);
			return data;
		} catch (error) {
			deps.logService.error(`Failed to get developer list for ${game.Name}:`, error as Error);
			return undefined;
		}
	};

	const getById = (id: string): PlayniteGame | undefined => {
		const db = deps.getDb();
		const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.get(id);
			const game = z.optional(playniteGameSchema).parse(result);
			deps.logService.success(`Found game ${game?.Name}`);
			return game;
		} catch (error) {
			deps.logService.error('Failed to get Playnite game with id: ' + id, error as Error);
			return undefined;
		}
	};

	const getDashPageGameList = (): z.infer<typeof dashPagePlayniteGameListSchema> | undefined => {
		const db = deps.getDb();
		const query = `
    SELECT Id, IsInstalled, Playtime
    FROM playnite_game;
  `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data = dashPagePlayniteGameListSchema.parse(result);
			deps.logService.success(
				`Game list for dashboard page fetched, returning data for ${data.length} games`
			);
			return data;
		} catch (error) {
			deps.logService.error('Failed to get game list for dashboard page', error as Error);
			return undefined;
		}
	};

	const exists = (gameId: string) => {
		const db = deps.getDb();
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
			deps.logService.error(`Failed to check if game with id ${gameId} exists`, error as Error);
			return false;
		}
	};

	const addDeveloperFor = (
		game: Pick<PlayniteGame, 'Id' | 'Name'>,
		developer: Developer
	): boolean => {
		const db = deps.getDb();
		const query = `
    INSERT INTO playnite_game_developer
      (GameId, DeveloperId)
    VALUES
      (?, ?)
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(game.Id, developer.Id);
			deps.logService.success(`Added developer ${developer.Name} to game ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to add developer ${developer.Name} for game ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const deleteDevelopersFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>): boolean => {
		const db = deps.getDb();
		const query = `DELETE FROM playnite_game_developer WHERE GameId = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(game.Id);
			deps.logService.success(`Deleted ${result.changes} developer relationships for ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to delete developer relationships for ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const addPlatformFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>, platform: Platform): boolean => {
		const db = deps.getDb();
		const query = `
    INSERT INTO playnite_game_platform
      (GameId, PlatformId)
    VALUES
      (?, ?)
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(game.Id, platform.Id);
			deps.logService.success(`Added platform ${platform.Name} to game ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to add platform ${platform.Name} for game ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const deletePlatformsFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>): boolean => {
		const db = deps.getDb();
		const query = `DELETE FROM playnite_game_platform WHERE GameId = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(game.Id);
			deps.logService.success(`Deleted ${result.changes} platform relationships for ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to delete platform relationships for ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const addGenreFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>, genre: Genre): boolean => {
		const db = deps.getDb();
		const query = `
    INSERT INTO playnite_game_genre
      (GameId, GenreId)
    VALUES
      (?, ?)
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(game.Id, genre.Id);
			deps.logService.success(`Added genre ${genre.Name} to game ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to add genre ${genre.Name} for game ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const deleteGenresFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>): boolean => {
		const db = deps.getDb();
		const query = `DELETE FROM playnite_game_genre WHERE GameId = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(game.Id);
			deps.logService.success(`Deleted ${result.changes} genre relationships for ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to delete genre relationships for ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const addPublisherFor = (
		game: Pick<PlayniteGame, 'Id' | 'Name'>,
		publisher: Publisher
	): boolean => {
		const db = deps.getDb();
		const query = `
    INSERT INTO playnite_game_publisher
      (GameId, PublisherId)
    VALUES
      (?, ?)
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(game.Id, publisher.Id);
			deps.logService.success(`Added publisher ${publisher.Name} to game ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to add publisher ${publisher.Name} for game ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const deletePublishersFor = (game: Pick<PlayniteGame, 'Id' | 'Name'>): boolean => {
		const db = deps.getDb();
		const query = `DELETE FROM playnite_game_publisher WHERE GameId = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(game.Id);
			deps.logService.success(`Deleted ${result.changes} publisher relationships for ${game.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(
				`Failed to delete publisher relationships for ${game.Name}`,
				error as Error
			);
			return false;
		}
	};

	const add = (
		game: PlayniteGame,
		developers?: Array<Developer>,
		platforms?: Array<Platform>,
		genres?: Array<Genre>,
		publishers?: Array<Publisher>
	): boolean => {
		const db = deps.getDb();
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
			deps.logService.success(`Added game ${game.Name}`);
			if (developers) {
				for (const developer of developers) {
					if (developerExists(developer)) {
						addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
						continue;
					}
					if (addDeveloper(developer)) {
						addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
					}
				}
			}
			if (platforms) {
				for (const platform of platforms) {
					if (platformExists(platform)) {
						addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
						continue;
					}
					if (addPlatform(platform)) {
						addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
					}
				}
			}
			if (genres) {
				for (const genre of genres) {
					if (genreExists(genre)) {
						addGenreFor({ Id: game.Id, Name: game.Name }, genre);
						continue;
					}
					if (addGenre(genre)) {
						addGenreFor({ Id: game.Id, Name: game.Name }, genre);
					}
				}
			}
			if (publishers) {
				for (const publisher of publishers) {
					if (publisherExists(publisher)) {
						addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
						continue;
					}
					if (addPublisher(publisher)) {
						addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
					}
				}
			}
			return true;
		} catch (error) {
			deps.logService.error(`Failed to add game ${game.Name}`, error as Error);
			return false;
		}
	};

	const update = (
		game: PlayniteGame,
		developers?: Array<Developer>,
		platforms?: Array<Platform>,
		genres?: Array<Genre>,
		publishers?: Array<Publisher>
	) => {
		const db = deps.getDb();
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
			deps.logService.success(`Updated game ${game.Name}`);
			if (developers) {
				deleteDevelopersFor({ Id: game.Id, Name: game.Name });
				for (const developer of developers) {
					const existing = getDeveloperById(developer.Id);
					if (existing) {
						if (developerHasChanges(existing, developer)) {
							updateDeveloper(developer);
						}
					} else {
						addDeveloper(developer);
					}
					addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
				}
			}
			if (platforms) {
				deletePlatformsFor({ Id: game.Id, Name: game.Name });
				for (const platform of platforms) {
					const existing = getPlatformById(platform.Id);
					if (existing) {
						if (platformHasChanges(existing, platform)) {
							updatePlatform(platform);
						}
					} else {
						addPlatform(platform);
					}
					addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
				}
			}
			if (genres) {
				deleteGenresFor({ Id: game.Id, Name: game.Name });
				for (const genre of genres) {
					const existing = getGenreById(genre.Id);
					if (existing) {
						if (genreHasChanges(existing, genre)) {
							updateGenre(genre);
						}
					} else {
						addGenre(genre);
					}
					addGenreFor({ Id: game.Id, Name: game.Name }, genre);
				}
			}
			if (publishers) {
				deletePublishersFor({ Id: game.Id, Name: game.Name });
				for (const publisher of publishers) {
					const existing = getPublisherById(publisher.Id);
					if (existing) {
						if (publisherHasChanges(existing, publisher)) {
							updatePublisher(publisher);
						}
					} else {
						addPublisher(publisher);
					}
					addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
				}
			}
			return true;
		} catch (error) {
			deps.logService.error(`Failed update game ${game.Name}`, error as Error);
			return false;
		}
	};

	const remove = (gameId: string): boolean => {
		const db = deps.getDb();
		const query = `DELETE FROM playnite_game WHERE Id = (?)`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(gameId);
			deps.logService.success(`Game with id ${gameId} deleted successfully`);
			return result.changes == 1; // Number of rows affected
		} catch (error) {
			deps.logService.error(`Failed to delete game with id ${gameId}`, error as Error);
			return false;
		}
	};

	const gameManifestDataSchema = z.array(
		z.object({
			Id: z.string(),
			ContentHash: z.string()
		})
	);
	type GetManifestDataResult = z.infer<typeof gameManifestDataSchema> | undefined;
	const getManifestData = (): GetManifestDataResult => {
		const db = deps.getDb();
		const query = `SELECT Id, ContentHash FROM playnite_game`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data = gameManifestDataSchema.parse(result);
			return data;
		} catch (error) {
			deps.logService.error(`Failed to get all game Ids from database`, error as Error);
			return;
		}
	};

	const totalPlaytimeSecondsSchema = z.object({ totalPlaytimeSeconds: z.number().nullable() });
	const getTotalPlaytimeHours = (): number | undefined => {
		const db = deps.getDb();
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
			deps.logService.success(`Fetched total playtime hours: ${totalPlaytimeHours}`);
			return totalPlaytimeHours;
		} catch (error) {
			deps.logService.error(`Failed to get total playtime`, error as Error);
			return;
		}
	};

	const getTopMostPlayedGames = (total: number): Array<PlayniteGame> | undefined => {
		const db = deps.getDb();
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
			deps.logService.success(
				`Found top ${total} most played games, returning ${data?.length} games`
			);
			return data;
		} catch (error) {
			deps.logService.error(`Failed to get top most played games`, error as Error);
		}
	};

	return {
		add,
		update,
		remove,
		exists,
		addDeveloperFor,
		addGenreFor,
		addPlatformFor,
		addPublisherFor,
		deleteDevelopersFor,
		deleteGenresFor,
		deletePlatformsFor,
		deletePublishersFor,
		getTopMostPlayedGames,
		getDashPageGameList,
		getById,
		getTotalPlaytimeHours,
		getManifestData,
		getDevelopers,
		getHomePagePlayniteGameList,
		getTotal
	};
};
