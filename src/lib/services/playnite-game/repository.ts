import { z } from 'zod';
import { developerSchema, type Developer } from '$lib/services/developer/schemas';
import { playniteGameSchemas, type PlayniteGame } from './schemas';
import type { Platform } from '$lib/platform/schemas';
import type { Genre } from '$lib/genre/schemas';
import {
	addGenre,
	genreExists,
	genreHasChanges,
	getGenreById,
	updateGenre
} from '../../genre/genre-repository';
import type { Publisher } from '$lib/publisher/schemas';
import type { DatabaseSync } from 'node:sqlite';
import type { LogService } from '$lib/services/log';
import type { PublisherRepository } from '$lib/publisher/publisher-repository';
import type { PlatformRepository } from '$lib/platform/platform-repository';
import type { DeveloperRepository } from '$lib/services/developer/repository';

type PlayniteGameRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
	publisherRepository: PublisherRepository;
	platformRepository: PlatformRepository;
	developerRepository: DeveloperRepository;
};

export type PlayniteGameRepository = {
	add: (
		game: PlayniteGame,
		developers?: Array<Developer>,
		platforms?: Array<Platform>,
		genres?: Array<Genre>,
		publishers?: Array<Publisher>
	) => boolean;
	update: (
		game: PlayniteGame,
		developers?: Array<Developer>,
		platforms?: Array<Platform>,
		genres?: Array<Genre>,
		publishers?: Array<Publisher>
	) => boolean;
	remove: (gameId: string) => boolean;
	exists: (gameId: string) => boolean;
	addDeveloperFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>, developer: Developer) => boolean;
	deleteDevelopersFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>) => boolean;
	getDevelopers: (game: Pick<PlayniteGame, 'Id' | 'Name'>) => Array<Developer> | undefined;
	addPlatformFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>, platform: Platform) => boolean;
	deletePlatformsFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>) => boolean;
	addGenreFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>, genre: Genre) => boolean;
	deleteGenresFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>) => boolean;
	addPublisherFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>, publisher: Publisher) => boolean;
	deletePublishersFor: (game: Pick<PlayniteGame, 'Id' | 'Name'>) => boolean;
	getById: (id: string) => PlayniteGame | undefined;
	getManifestData: () => z.infer<typeof playniteGameSchemas.gameManifestDataResult> | undefined;
	getTotal: (query?: string | null) => number;
	getTotalPlaytimeHours: () => number | undefined;
	getTopMostPlayedGames: (total: number) => Array<PlayniteGame> | undefined;
};

export const makePlayniteGameRepository = (
	deps: PlayniteGameRepositoryDeps
): PlayniteGameRepository => {
	const getTotalResultSchema = z.object({
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
			const data = getTotalResultSchema.parse(result);
			return data.total;
		} catch (error) {
			deps.logService.error('Failed to get total amount of games', error as Error);
			return 0;
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
			const game = z.optional(playniteGameSchemas.playniteGame).parse(result);
			deps.logService.success(`Found game ${game?.Name}`);
			return game;
		} catch (error) {
			deps.logService.error('Failed to get Playnite game with id: ' + id, error as Error);
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
					if (deps.developerRepository.exists(developer)) {
						addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
						continue;
					}
					if (deps.developerRepository.add(developer)) {
						addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
					}
				}
			}
			if (platforms) {
				for (const platform of platforms) {
					if (deps.platformRepository.exists(platform)) {
						addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
						continue;
					}
					if (deps.platformRepository.add(platform)) {
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
					if (deps.publisherRepository.exists(publisher)) {
						addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
						continue;
					}
					if (deps.publisherRepository.add(publisher)) {
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
					const existing = deps.developerRepository.getById(developer.Id);
					if (existing) {
						if (deps.developerRepository.hasChanges(existing, developer)) {
							deps.developerRepository.update(developer);
						}
					} else {
						deps.developerRepository.add(developer);
					}
					addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
				}
			}
			if (platforms) {
				deletePlatformsFor({ Id: game.Id, Name: game.Name });
				for (const platform of platforms) {
					const existing = deps.platformRepository.getById(platform.Id);
					if (existing) {
						if (deps.platformRepository.hasChanges(existing, platform)) {
							deps.platformRepository.update(platform);
						}
					} else {
						deps.platformRepository.add(platform);
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
					const existing = deps.publisherRepository.getById(publisher.Id);
					if (existing) {
						if (deps.publisherRepository.hasChanges(existing, publisher)) {
							deps.publisherRepository.update(publisher);
						}
					} else {
						deps.publisherRepository.add(publisher);
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

	type GetManifestDataResult =
		| z.infer<typeof playniteGameSchemas.gameManifestDataResult>
		| undefined;
	const getManifestData = (): GetManifestDataResult => {
		const db = deps.getDb();
		const query = `SELECT Id, ContentHash FROM playnite_game`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data = playniteGameSchemas.gameManifestDataResult.parse(result);
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
			const data = z.optional(z.array(playniteGameSchemas.playniteGame)).parse(result);
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
		getById,
		getTotalPlaytimeHours,
		getManifestData,
		getDevelopers,
		getTotal
	};
};
