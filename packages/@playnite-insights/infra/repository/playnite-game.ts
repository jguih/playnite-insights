import type {
  DeveloperRepository,
  GenreRepository,
  LogService,
  PlatformRepository,
  PlayniteGameRepository,
  PublisherRepository,
} from "@playnite-insights/core";
import z from "zod";
import type { DatabaseSync } from "node:sqlite";
import { getDb as _getDb } from "../database";
import {
  DashPageData,
  DashPageGame,
  Developer,
  developerSchema,
  GameManifestData,
  Genre,
  Platform,
  PlayniteGame,
  playniteGameSchema,
  Publisher,
} from "@playnite-insights/lib";
import { defaultLogger } from "../services";
import { defaultPublisherRepository } from "./publisher";
import { defaultPlatformRepository } from "./platform";
import { defaultDeveloperRepository } from "./developer";
import { defaultGenreRepository } from "./genre";

type PlayniteGameRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
  publisherRepository: PublisherRepository;
  platformRepository: PlatformRepository;
  developerRepository: DeveloperRepository;
  genreRepository: GenreRepository;
};

export const makePlayniteGameRepository = (
  {
    getDb,
    logService,
    publisherRepository,
    platformRepository,
    developerRepository,
    genreRepository,
  }: PlayniteGameRepositoryDeps = {
    getDb: _getDb,
    logService: defaultLogger,
    publisherRepository: defaultPublisherRepository,
    platformRepository: defaultPlatformRepository,
    developerRepository: defaultDeveloperRepository,
    genreRepository: defaultGenreRepository,
  }
): PlayniteGameRepository => {
  const getTotalResultSchema = z.object({
    total: z.number(),
  });
  const getTotal = (query?: string | null): number => {
    const db = getDb();
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
      logService.error("Failed to get total amount of games", error as Error);
      return 0;
    }
  };

  const getDevelopers = (
    game: Pick<PlayniteGame, "Id" | "Name">
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
      logService.debug(
        `Developer list for ${game.Name} fetched: ${data
          .map((d) => d.Name)
          .join(", ")}`
      );
      return data;
    } catch (error) {
      logService.error(
        `Failed to get developer list for ${game.Name}:`,
        error as Error
      );
      return undefined;
    }
  };

  const getById = (id: string): PlayniteGame | undefined => {
    const db = getDb();
    const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const game = z.optional(playniteGameSchema).parse(result);
      logService.debug(`Found game ${game?.Name}`);
      return game;
    } catch (error) {
      logService.error(
        "Failed to get Playnite game with id: " + id,
        error as Error
      );
      return undefined;
    }
  };

  const exists = (gameId: string) => {
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
      logService.error(
        `Failed to check if game with id ${gameId} exists`,
        error as Error
      );
      return false;
    }
  };

  const addDeveloperFor = (
    game: Pick<PlayniteGame, "Id" | "Name">,
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
      logService.debug(
        `Added developer ${developer.Name} to game ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to add developer ${developer.Name} for game ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const deleteDevelopersFor = (
    game: Pick<PlayniteGame, "Id" | "Name">
  ): boolean => {
    const db = getDb();
    const query = `DELETE FROM playnite_game_developer WHERE GameId = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(game.Id);
      logService.debug(
        `Deleted ${result.changes} developer relationships for ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to delete developer relationships for ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const addPlatformFor = (
    game: Pick<PlayniteGame, "Id" | "Name">,
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
      logService.debug(`Added platform ${platform.Name} to game ${game.Name}`);
      return true;
    } catch (error) {
      logService.error(
        `Failed to add platform ${platform.Name} for game ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const deletePlatformsFor = (
    game: Pick<PlayniteGame, "Id" | "Name">
  ): boolean => {
    const db = getDb();
    const query = `DELETE FROM playnite_game_platform WHERE GameId = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(game.Id);
      logService.debug(
        `Deleted ${result.changes} platform relationships for ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to delete platform relationships for ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const addGenreFor = (
    game: Pick<PlayniteGame, "Id" | "Name">,
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
      logService.debug(`Added genre ${genre.Name} to game ${game.Name}`);
      return true;
    } catch (error) {
      logService.error(
        `Failed to add genre ${genre.Name} for game ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const deleteGenresFor = (
    game: Pick<PlayniteGame, "Id" | "Name">
  ): boolean => {
    const db = getDb();
    const query = `DELETE FROM playnite_game_genre WHERE GameId = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(game.Id);
      logService.debug(
        `Deleted ${result.changes} genre relationships for ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to delete genre relationships for ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const addPublisherFor = (
    game: Pick<PlayniteGame, "Id" | "Name">,
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
      logService.debug(
        `Added publisher ${publisher.Name} to game ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to add publisher ${publisher.Name} for game ${game.Name}`,
        error as Error
      );
      return false;
    }
  };

  const deletePublishersFor = (
    game: Pick<PlayniteGame, "Id" | "Name">
  ): boolean => {
    const db = getDb();
    const query = `DELETE FROM playnite_game_publisher WHERE GameId = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(game.Id);
      logService.debug(
        `Deleted ${result.changes} publisher relationships for ${game.Name}`
      );
      return true;
    } catch (error) {
      logService.error(
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
      logService.debug(`Added game ${game.Name}`);
      if (developers) {
        const uniqueDevs = Array.from(
          new Map(developers.map((dev) => [dev.Id, dev])).values()
        );
        for (const developer of uniqueDevs) {
          if (developerRepository.exists(developer)) {
            addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
            continue;
          }
          if (developerRepository.add(developer)) {
            addDeveloperFor({ Id: game.Id, Name: game.Name }, developer);
          }
        }
      }
      if (platforms) {
        const uniquePlatforms = Array.from(
          new Map(platforms.map((plat) => [plat.Id, plat])).values()
        );
        for (const platform of uniquePlatforms) {
          if (platformRepository.exists(platform)) {
            addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
            continue;
          }
          if (platformRepository.add(platform)) {
            addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
          }
        }
      }
      if (genres) {
        const uniqueGenres = Array.from(
          new Map(genres.map((genre) => [genre.Id, genre])).values()
        );
        for (const genre of uniqueGenres) {
          if (genreRepository.exists(genre)) {
            addGenreFor({ Id: game.Id, Name: game.Name }, genre);
            continue;
          }
          if (genreRepository.add(genre)) {
            addGenreFor({ Id: game.Id, Name: game.Name }, genre);
          }
        }
      }
      if (publishers) {
        const uniquePublishers = Array.from(
          new Map(publishers.map((pub) => [pub.Id, pub])).values()
        );
        for (const publisher of uniquePublishers) {
          if (publisherRepository.exists(publisher)) {
            addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
            continue;
          }
          if (publisherRepository.add(publisher)) {
            addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
          }
        }
      }
      return true;
    } catch (error) {
      logService.error(`Failed to add game ${game.Name}`, error as Error);
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
      logService.debug(`Updated game ${game.Name}`);
      if (developers) {
        deleteDevelopersFor({ Id: game.Id, Name: game.Name });
        const uniqueDevs = Array.from(
          new Map(developers.map((dev) => [dev.Id, dev])).values()
        );
        for (const developer of uniqueDevs) {
          const existing = developerRepository.getById(developer.Id);
          if (existing) {
            if (developerRepository.hasChanges(existing, developer)) {
              developerRepository.update(developer);
            }
          } else {
            developerRepository.add(developer);
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
          const existing = platformRepository.getById(platform.Id);
          if (existing) {
            if (platformRepository.hasChanges(existing, platform)) {
              platformRepository.update(platform);
            }
          } else {
            platformRepository.add(platform);
          }
          addPlatformFor({ Id: game.Id, Name: game.Name }, platform);
        }
      }
      if (genres) {
        deleteGenresFor({ Id: game.Id, Name: game.Name });
        const uniqueGenres = Array.from(
          new Map(genres.map((genre) => [genre.Id, genre])).values()
        );
        for (const genre of uniqueGenres) {
          const existing = genreRepository.getById(genre.Id);
          if (existing) {
            if (genreRepository.hasChanges(existing, genre)) {
              genreRepository.update(genre);
            }
          } else {
            genreRepository.add(genre);
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
          const existing = publisherRepository.getById(publisher.Id);
          if (existing) {
            if (publisherRepository.hasChanges(existing, publisher)) {
              publisherRepository.update(publisher);
            }
          } else {
            publisherRepository.add(publisher);
          }
          addPublisherFor({ Id: game.Id, Name: game.Name }, publisher);
        }
      }
      return true;
    } catch (error) {
      logService.error(`Failed update game ${game.Name}`, error as Error);
      return false;
    }
  };

  const remove = (gameId: string): boolean => {
    const db = getDb();
    const query = `DELETE FROM playnite_game WHERE Id = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(gameId);
      logService.debug(`Game with id ${gameId} deleted`);
      return result.changes == 1; // Number of rows affected
    } catch (error) {
      logService.error(
        `Failed to delete game with id ${gameId}`,
        error as Error
      );
      return false;
    }
  };

  const getManifestData = (): GameManifestData | undefined => {
    const db = getDb();
    const query = `SELECT Id, ContentHash FROM playnite_game`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const data: GameManifestData = [];
      for (const entry of result) {
        const value = {
          Id: entry.Id as string,
          ContentHash: entry.ContentHash as string,
        };
        data.push(value);
      }
      logService.debug(
        `Fetched manifest game data, total games in library: ${data.length}`
      );
      return data;
    } catch (error) {
      logService.error(
        `Failed to get all game Ids from database`,
        error as Error
      );
      return;
    }
  };

  const getTotalPlaytimeSeconds = (): number | undefined => {
    const db = getDb();
    const query = `
    SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game;
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get();
      if (!result) return;
      const data = result.totalPlaytimeSeconds as number;
      logService.debug(`Fetched total playtime: ${data} seconds`);
      return data;
    } catch (error) {
      logService.error(`Failed to get total playtime`, error as Error);
      return;
    }
  };

  const getTopMostPlayedGamesForDashPage = (
    total: number
  ): DashPageData["topMostPlayedGames"] => {
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
      const data: DashPageData["topMostPlayedGames"] = [];
      for (const entry of result) {
        const value: DashPageData["topMostPlayedGames"][number] = {
          Id: entry.Id as string,
          Name: entry.Name as string | null,
          Playtime: entry.Playtime as number,
          CoverImage: entry.CoverImage as string | null,
          LastActivity: entry.LastActivity as string | null,
        };
        data.push(value);
      }
      logService.debug(
        `Found top ${total} most played games, returning ${data?.length} games`
      );
      return data;
    } catch (error) {
      logService.error(`Failed to get top most played games`, error as Error);
      return [];
    }
  };

  const getGamesForDashPage = (): DashPageGame[] => {
    const db = getDb();
    const query = `
      SELECT Id, IsInstalled, Playtime
      FROM playnite_game;
    `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const data: Array<DashPageGame> = [];
      for (const entry of result) {
        data.push({
          Id: entry.Id as string,
          IsInstalled: entry.IsInstalled as number | null,
          Playtime: entry.Playtime as number,
        });
      }
      logService.debug(`Found ${data.length} games for dashboard page`);
      return data;
    } catch (error) {
      logService.error(
        `Failed to get games for dashboard page`,
        error as Error
      );
      return [];
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
    getTotal,
    getTopMostPlayedGamesForDashPage,
    getGamesForDashPage,
  };
};
