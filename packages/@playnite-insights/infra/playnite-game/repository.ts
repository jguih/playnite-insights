import type {
  CompanyRepository,
  GenreRepository,
  PlatformRepository,
  PlayniteGameRepository,
} from "@playnite-insights/core";
import {
  fullGameRawSchema,
  playniteGameSchema,
  type FullGame,
  type GameManifestData,
} from "@playnite-insights/lib/client";
import z from "zod";
import {
  getDefaultRepositoryDeps,
  repositoryCall,
  type BaseRepositoryDeps,
} from "../repository/base";
import { defaultCompanyRepository } from "../repository/company";
import { defaultGenreRepository } from "../repository/genre";
import { defaultPlatformRepository } from "../repository/platform";
import { getWhereClauseAndParamsFromFilters } from "./filtering-and-sorting";

type PlayniteGameRepositoryDeps = BaseRepositoryDeps & {
  platformRepository: PlatformRepository;
  genreRepository: GenreRepository;
  companyRepository: CompanyRepository;
};

const defaultDeps: Required<PlayniteGameRepositoryDeps> = {
  ...getDefaultRepositoryDeps(),
  platformRepository: defaultPlatformRepository,
  genreRepository: defaultGenreRepository,
  companyRepository: defaultCompanyRepository,
};

export const makePlayniteGameRepository = (
  deps: Partial<PlayniteGameRepositoryDeps> = {}
): PlayniteGameRepository => {
  const {
    getDb,
    logService,
    platformRepository,
    genreRepository,
    companyRepository,
  } = { ...defaultDeps, ...deps };

  const getTotal: PlayniteGameRepository["getTotal"] = (filters) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        let query = `
          SELECT 
            COUNT(*) AS Total
          FROM playnite_game pg
        `;
        const { where, params } = getWhereClauseAndParamsFromFilters(filters);
        query += where;
        const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;
        return total;
      },
      `getTotal(${JSON.stringify(filters)})`
    );
  };

  const getById: PlayniteGameRepository["getById"] = (id) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const game = z.optional(playniteGameSchema).parse(result);
        logService.debug(`Found game ${game?.Name}`);
        return game ?? null;
      },
      `getById(${id})`
    );
  };

  const exists: PlayniteGameRepository["exists"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        SELECT EXISTS (
          SELECT 1 FROM playnite_game WHERE Id = (?)
        );
        `;
        const stmt = db.prepare(query);
        const result = stmt.get(gameId) as object;
        if (result) {
          return Object.values(result)[0] === 1;
        }
        return false;
      },
      `exists(${gameId})`
    );
  };

  const addDeveloperFor: PlayniteGameRepository["addDeveloperFor"] = (
    game,
    developer
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO playnite_game_developer
            (GameId, DeveloperId)
          VALUES
            (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, developer.Id);
        logService.debug(
          `Added developer ${developer.Name} for game ${game.Name}`
        );
        return true;
      },
      `addDeveloperFor(${game.Id}, ${game.Name}, ${developer.Name})`
    );
  };

  const deleteDevelopersFor: PlayniteGameRepository["deleteDevelopersFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_developer WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} developer relationships for ${game.Name}`
        );
        return true;
      },
      `deleteDevelopersFor(${game.Id}, ${game.Name})`
    );
  };

  const addPlatformFor: PlayniteGameRepository["addPlatformFor"] = (
    game,
    platform
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
          INSERT INTO playnite_game_platform
            (GameId, PlatformId)
          VALUES
            (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, platform.Id);
        logService.debug(
          `Added platform ${platform.Name} for game ${game.Name}`
        );
        return true;
      },
      `addPlatformFor(${game.Id}, ${game.Name}, ${platform.Name})`
    );
  };

  const deletePlatformsFor: PlayniteGameRepository["deletePlatformsFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_platform WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} platform relationships for ${game.Name}`
        );
        return true;
      },
      `deletePlatformsFor(${game.Id}, ${game.Name})`
    );
  };

  const addPublisherFor: PlayniteGameRepository["addPublisherFor"] = (
    game,
    publisher
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO playnite_game_publisher
          (GameId, PublisherId)
        VALUES
          (?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(game.Id, publisher.Id);
        logService.debug(
          `Added publisher ${publisher.Name} for game ${game.Name}`
        );
        return true;
      },
      `addPublisherFor(${game.Id}, ${game.Name}, ${publisher.Name})`
    );
  };

  const deletePublishersFor: PlayniteGameRepository["deletePublishersFor"] = (
    game
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game_publisher WHERE GameId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(game.Id);
        logService.debug(
          `Deleted ${result.changes} publisher relationships for ${game.Name}`
        );
        return true;
      },
      `deletePublishersFor(${game.Id}, ${game.Name})`
    );
  };

  const upsertMany: PlayniteGameRepository["upsertMany"] = (games) => {
    return repositoryCall(
      logService,
      () => {
        const start = performance.now();
        const db = getDb();
        const query = `
        INSERT INTO playnite_game (
          Id, 
          Name, 
          Description, 
          ReleaseDate, 
          Playtime, 
          LastActivity, 
          Added, 
          InstallDirectory, 
          IsInstalled, 
          BackgroundImage, 
          CoverImage, 
          Icon, 
          ContentHash,
          Hidden,
          CompletionStatusId
        ) VALUES (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        ) ON CONFLICT(Id) DO UPDATE SET
          Name = excluded.Name,
          Description = excluded.Description,
          ReleaseDate = excluded.ReleaseDate,
          Playtime = excluded.Playtime,
          LastActivity = excluded.LastActivity,
          Added = excluded.Added,
          InstallDirectory = excluded.InstallDirectory,
          IsInstalled = excluded.IsInstalled,
          BackgroundImage = excluded.BackgroundImage,
          CoverImage = excluded.CoverImage,
          Icon = excluded.Icon,
          ContentHash = excluded.ContentHash,
          Hidden = excluded.Hidden,
          CompletionStatusId = excluded.CompletionStatusId;
        `;
        const stmt = db.prepare(query);
        db.exec("BEGIN TRANSACTION");
        try {
          for (const game of games)
            stmt.run(
              game.Id,
              game.Name,
              game.Description,
              game.ReleaseDate,
              game.Playtime,
              game.LastActivity,
              game.Added,
              game.InstallDirectory,
              +game.IsInstalled,
              game.BackgroundImage,
              game.CoverImage,
              game.Icon,
              game.ContentHash,
              game.Hidden,
              game.CompletionStatusId
            );
          db.exec("COMMIT");
          const duration = performance.now() - start;
          logService.debug(
            `Upserted ${games.length} game(s) in ${duration.toFixed(1)}ms`
          );
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `upsertMany(${games.length} game(s))`
    );
  };

  const updateManyGenres: PlayniteGameRepository["updateManyGenres"] = (
    genresMap
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const queries = {
          getCurrentGenres: `SELECT GenreId FROM playnite_game_genre WHERE GameId = ?`,
          removeGenre: `DELETE FROM playnite_game_genre WHERE GameId = ? AND GenreId = ?`,
          addGenre: `INSERT INTO playnite_game_genre (GameId, GenreId) VALUES (?, ?)`,
        };
        const statements = {
          getCurrentGenres: db.prepare(queries.getCurrentGenres),
          removeGenre: db.prepare(queries.removeGenre),
          addGenre: db.prepare(queries.addGenre),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const [gameId, _newGenreIds] of genresMap) {
            const _currentGenreIdsResult =
              statements.getCurrentGenres.all(gameId);
            const _currentGenreIds = _currentGenreIdsResult.map(
              (v) => v.GenreId as string
            );
            const currentGenreIdsSet = new Set(_currentGenreIds);
            const newGenreIdsSet = new Set(_newGenreIds);
            for (const newGenreId of newGenreIdsSet) {
              if (currentGenreIdsSet.has(newGenreId)) continue;
              statements.addGenre.run(gameId, newGenreId);
            }
            for (const currentGenreId of currentGenreIdsSet) {
              if (!newGenreIdsSet.has(currentGenreId)) {
                statements.removeGenre.run(gameId, currentGenreId);
              }
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `updateManyGenres(${genresMap.size} game(s))`
    );
  };

  const remove: PlayniteGameRepository["remove"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `DELETE FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(gameId);
        logService.debug(`Game with id ${gameId} deleted`);
        return result.changes == 1; // Number of rows affected
      },
      `remove(${gameId})`
    );
  };

  const getManifestData: PlayniteGameRepository["getManifestData"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT Id, ContentHash FROM playnite_game`;
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
      },
      `getManifestData()`
    );
  };

  const getTotalPlaytimeSeconds: PlayniteGameRepository["getTotalPlaytimeSeconds"] =
    () => {
      return repositoryCall(
        logService,
        () => {
          const db = getDb();
          const query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game;`;
          const stmt = db.prepare(query);
          const result = stmt.get();
          if (!result) return 0;
          const data = result.totalPlaytimeSeconds as number;
          logService.debug(`Calculated total playtime: ${data} seconds`);
          return data;
        },
        `getTotalPlaytimeSeconds()`
      );
    };

  const all: PlayniteGameRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const separator = ",";
        const query = `
          SELECT 
          pg.*, 
          (
            SELECT GROUP_CONCAT(GenreId)
            FROM playnite_game_genre
            WHERE GameId = pg.Id
          ) AS Genres,
          (
            SELECT GROUP_CONCAT(PlatformId)
            FROM playnite_game_platform
            WHERE GameId = pg.Id
          ) AS Platforms,
          (
            SELECT GROUP_CONCAT(DeveloperId)
            FROM playnite_game_developer
            WHERE GameId = pg.Id
          ) AS Developers,
          (
            SELECT GROUP_CONCAT(PublisherId)
            FROM playnite_game_publisher
            WHERE GameId = pg.Id
          ) AS Publishers
          FROM playnite_game pg
          ORDER BY pg.Id ASC;`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const raw = z.array(fullGameRawSchema).parse(result);
        const games = raw.map((g) => {
          const devs = g.Developers ? g.Developers.split(separator) : [];
          const publishers = g.Publishers ? g.Publishers.split(separator) : [];
          const platforms = g.Platforms ? g.Platforms.split(separator) : [];
          const genres = g.Genres ? g.Genres.split(separator) : [];
          return {
            ...g,
            Developers: devs,
            Publishers: publishers,
            Platforms: platforms,
            Genres: genres,
          } as FullGame;
        });
        logService.debug(`Found ${games?.length ?? 0} games`);
        return games;
      },
      `all()`
    );
  };

  return {
    upsertMany,
    updateManyGenres,
    remove,
    exists,
    getById,
    getTotalPlaytimeSeconds,
    getManifestData,
    getTotal,
    all,
  };
};

export const defaultPlayniteGameRepository: PlayniteGameRepository =
  makePlayniteGameRepository();
