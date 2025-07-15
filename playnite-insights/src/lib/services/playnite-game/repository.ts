import { z } from 'zod';
import { developerSchema, type Developer } from '$lib/services/developer/schemas';
import {
	gameManifestDataSchema,
	playniteGameSchema,
	type GameManifestData,
	type PlayniteGame
} from './schemas';
import type { Platform } from '$lib/services/platform/schemas';
import type { Genre } from '$lib/services/genre/schemas';
import type { Publisher } from '$lib/services/publisher/schemas';
import type { DatabaseSync } from 'node:sqlite';
import type { PublisherRepository } from '$lib/services/publisher/repository';
import type { PlatformRepository } from '$lib/services/platform/repository';
import type { DeveloperRepository } from '$lib/services/developer/repository';
import type { GenreRepository } from '$lib/services/genre/repository';
import type { LogService } from '@playnite-insights/services';

type PlayniteGameRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
	publisherRepository: PublisherRepository;
	platformRepository: PlatformRepository;
	developerRepository: DeveloperRepository;
	genreRepository: GenreRepository;
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
	getManifestData: () => z.infer<typeof gameManifestDataSchema> | undefined;
	getTotal: (query?: string | null) => number;
	getTotalPlaytimeSeconds: () => number | undefined;
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
			deps.logService.debug(
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
			deps.logService.debug(`Found game ${game?.Name}`);
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
			deps.logService.debug(`Added developer ${developer.Name} to game ${game.Name}`);
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
			deps.logService.debug(`Deleted ${result.changes} developer relationships for ${game.Name}`);
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
			deps.logService.debug(`Added platform ${platform.Name} to game ${game.Name}`);
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
			deps.logService.debug(`Deleted ${result.changes} platform relationships for ${game.Name}`);
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
			deps.logService.debug(`Added genre ${genre.Name} to game ${game.Name}`);
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
			deps.logService.debug(`Deleted ${result.changes} genre relationships for ${game.Name}`);
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
			deps.logService.debug(`Added publisher ${publisher.Name} to game ${game.Name}`);
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
			deps.logService.debug(`Deleted ${result.changes} publisher relationships for ${game.Name}`);
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
			deps.logService.debug(`Added game ${game.Name}`);
			if (developers) {
				const uniqueDevs = Array.from(new Map(developers.map((dev) => [dev.Id, dev])).values());
				for (const developer of uniqueDevs) {
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
				const uniquePlatforms = Array.from(
					new Map(platforms.map((plat) => [plat.Id, plat])).values()
				);
				for (const platform of uniquePlatforms) {
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
				const uniqueGenres = Array.from(new Map(genres.map((genre) => [genre.Id, genre])).values());
				for (const genre of uniqueGenres) {
					if (deps.genreRepository.exists(genre)) {
						addGenreFor({ Id: game.Id, Name: game.Name }, genre);
						continue;
					}
					if (deps.genreRepository.add(genre)) {
						addGenreFor({ Id: game.Id, Name: game.Name }, genre);
					}
				}
			}
			if (publishers) {
				const uniquePublishers = Array.from(
					new Map(publishers.map((pub) => [pub.Id, pub])).values()
				);
				for (const publisher of uniquePublishers) {
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
			deps.logService.debug(`Updated game ${game.Name}`);
			if (developers) {
				deleteDevelopersFor({ Id: game.Id, Name: game.Name });
				const uniqueDevs = Array.from(new Map(developers.map((dev) => [dev.Id, dev])).values());
				for (const developer of uniqueDevs) {
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
				const uniquePlatforms = Array.from(
					new Map(platforms.map((plat) => [plat.Id, plat])).values()
				);
				for (const platform of uniquePlatforms) {
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
				const uniqueGenres = Array.from(new Map(genres.map((genre) => [genre.Id, genre])).values());
				for (const genre of uniqueGenres) {
					const existing = deps.genreRepository.getById(genre.Id);
					if (existing) {
						if (deps.genreRepository.hasChanges(existing, genre)) {
							deps.genreRepository.update(genre);
						}
					} else {
						deps.genreRepository.add(genre);
					}
					addGenreFor({ Id: game.Id, Name: game.Name }, genre);
				}
			}
			if (publishers) {
				deletePublishersFor({ Id: game.Id, Name: game.Name });
				const uniquePublishers = Array.from(
					new Map(publishers.map((pub) => [pub.Id, pub])).values()
				);
				for (const publisher of uniquePublishers) {
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
			deps.logService.debug(`Game with id ${gameId} deleted`);
			return result.changes == 1; // Number of rows affected
		} catch (error) {
			deps.logService.error(`Failed to delete game with id ${gameId}`, error as Error);
			return false;
		}
	};

	const getManifestData = (): GameManifestData | undefined => {
		const db = deps.getDb();
		const query = `SELECT Id, ContentHash FROM playnite_game`;
		try {
			const stmt = db.prepare(query);
			const result = stmt.all();
			const data: GameManifestData = [];
			for (const entry of result) {
				const value = {
					Id: entry.Id as string,
					ContentHash: entry.ContentHash as string
				};
				data.push(value);
			}
			deps.logService.debug(`Fetched manifest game data, total games in library: ${data.length}`);
			return data;
		} catch (error) {
			deps.logService.error(`Failed to get all game Ids from database`, error as Error);
			return;
		}
	};

	const getTotalPlaytimeSeconds = (): number | undefined => {
		const db = deps.getDb();
		const query = `
    SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game;
  `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.get();
			if (!result) return;
			const data = result.totalPlaytimeSeconds as number;
			deps.logService.debug(`Fetched total playtime: ${data} seconds`);
			return data;
		} catch (error) {
			deps.logService.error(`Failed to get total playtime`, error as Error);
			return;
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
		getById,
		getTotalPlaytimeSeconds,
		getManifestData,
		getDevelopers,
		getTotal
	};
};
