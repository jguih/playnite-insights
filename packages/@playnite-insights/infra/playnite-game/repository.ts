import type { PlayniteGameRepository } from "@playnite-insights/core";
import {
  fullGameRawSchema,
  playniteGameSchema,
  type FullGame,
  type GameFilters,
  type GameManifestData,
  type GameSorting,
} from "@playnite-insights/lib/client";
import z from "zod";
import {
  getDefaultRepositoryDeps,
  repositoryCall,
  type BaseRepositoryDeps,
} from "../repository/base";

type PlayniteGameRepositoryDeps = BaseRepositoryDeps;

const defaultDeps: Required<PlayniteGameRepositoryDeps> = {
  ...getDefaultRepositoryDeps(),
};

export const makePlayniteGameRepository = (
  deps: Partial<PlayniteGameRepositoryDeps> = {}
): PlayniteGameRepository => {
  const { getDb, logService } = { ...defaultDeps, ...deps };

  const _getWhereClauseAndParamsFromFilters = (filters?: GameFilters) => {
    const where: string[] = [];
    const params: string[] = [];

    if (!filters) {
      return { where: "", params };
    }

    if (filters.query !== undefined) {
      where.push(`LOWER(Name) LIKE ?`);
      params.push(`%${filters.query.toLowerCase()}%`);
    }

    if (filters.installed !== undefined) {
      where.push(`IsInstalled = ?`);
      params.push(+filters.installed);
    }

    if (filters.hidden != undefined) {
      where.push(`Hidden = ?`);
      params.push(+filters.hidden);
    }

    return {
      where: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
      params,
    };
  };

  const _getOrderByClause = (sorting?: GameSorting): string => {
    if (!sorting) return ` ORDER BY Id ASC`;
    const order = sorting.order.toUpperCase();
    switch (sorting.by) {
      case "IsInstalled": {
        return ` ORDER BY IsInstalled ${order}, Id ASC`;
      }
      case "Added": {
        return ` ORDER BY Added ${order}, Id ASC`;
      }
      case "LastActivity": {
        return ` ORDER BY LastActivity ${order}, Id ASC`;
      }
      case "Playtime": {
        return ` ORDER BY Playtime ${order}, Id ASC`;
      }
      default:
        return ` ORDER BY Id ASC`;
    }
  };

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
        const { where, params } = _getWhereClauseAndParamsFromFilters(filters);
        query += where;
        const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;
        return total;
      },
      `getTotal()`
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

  const upsertMany: PlayniteGameRepository["upsertMany"] = (games) => {
    return repositoryCall(
      logService,
      () => {
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

  const updateManyDevelopers: PlayniteGameRepository["updateManyDevelopers"] = (
    developersMap
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const queries = {
          getCurrentDevelopers: `SELECT DeveloperId FROM playnite_game_developer WHERE GameId = ?`,
          removeDeveloper: `DELETE FROM playnite_game_developer WHERE GameId = ? AND DeveloperId = ?`,
          addDeveloper: `INSERT INTO playnite_game_developer (GameId, DeveloperId) VALUES (?, ?)`,
        };
        const statements = {
          getCurrentDevelopers: db.prepare(queries.getCurrentDevelopers),
          removeDeveloper: db.prepare(queries.removeDeveloper),
          addDeveloper: db.prepare(queries.addDeveloper),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const [gameId, _newDeveloperIds] of developersMap) {
            const _currentDeveloperIdsResult =
              statements.getCurrentDevelopers.all(gameId);
            const _currentDeveloperIds = _currentDeveloperIdsResult.map(
              (v) => v.DeveloperId as string
            );
            const currentDeveloperIdsSet = new Set(_currentDeveloperIds);
            const newDeveloperIdsSet = new Set(_newDeveloperIds);
            for (const newDeveloperId of newDeveloperIdsSet) {
              if (currentDeveloperIdsSet.has(newDeveloperId)) continue;
              statements.addDeveloper.run(gameId, newDeveloperId);
            }
            for (const currentDeveloperId of currentDeveloperIdsSet) {
              if (!newDeveloperIdsSet.has(currentDeveloperId)) {
                statements.removeDeveloper.run(gameId, currentDeveloperId);
              }
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `updateManyDevelopers(${developersMap.size} game(s))`
    );
  };

  const updateManyPublishers: PlayniteGameRepository["updateManyPublishers"] = (
    publishersMap
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const queries = {
          getCurrentPublishers: `SELECT PublisherId FROM playnite_game_publisher WHERE GameId = ?`,
          removePublisher: `DELETE FROM playnite_game_publisher WHERE GameId = ? AND PublisherId = ?`,
          addPublisher: `INSERT INTO playnite_game_publisher (GameId, PublisherId) VALUES (?, ?)`,
        };
        const statements = {
          getCurrentPublishers: db.prepare(queries.getCurrentPublishers),
          removePublisher: db.prepare(queries.removePublisher),
          addPublisher: db.prepare(queries.addPublisher),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const [gameId, _newPublisherIds] of publishersMap) {
            const _currentPublisherIdsResult =
              statements.getCurrentPublishers.all(gameId);
            const _currentPublisherIds = _currentPublisherIdsResult.map(
              (v) => v.PublisherId as string
            );
            const currentPublisherIdsSet = new Set(_currentPublisherIds);
            const newPublisherIdsSet = new Set(_newPublisherIds);
            for (const newPublisherId of newPublisherIdsSet) {
              if (currentPublisherIdsSet.has(newPublisherId)) continue;
              statements.addPublisher.run(gameId, newPublisherId);
            }
            for (const currentPublisherId of currentPublisherIdsSet) {
              if (!newPublisherIdsSet.has(currentPublisherId)) {
                statements.removePublisher.run(gameId, currentPublisherId);
              }
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `updateManyPublishers(${publishersMap.size} game(s))`
    );
  };

  const updateManyPlatforms: PlayniteGameRepository["updateManyPlatforms"] = (
    platformsMap
  ) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const queries = {
          getCurrentPlatforms: `SELECT PlatformId FROM playnite_game_platform WHERE GameId = ?`,
          removePlatform: `DELETE FROM playnite_game_platform WHERE GameId = ? AND PlatformId = ?`,
          addPlatform: `INSERT INTO playnite_game_platform (GameId, PlatformId) VALUES (?, ?)`,
        };
        const statements = {
          getCurrentPlatforms: db.prepare(queries.getCurrentPlatforms),
          removePlatform: db.prepare(queries.removePlatform),
          addPlatform: db.prepare(queries.addPlatform),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const [gameId, _newPlatformIds] of platformsMap) {
            const _currentPlatformIdsResult =
              statements.getCurrentPlatforms.all(gameId);
            const _currentPlatformIds = _currentPlatformIdsResult.map(
              (v) => v.PlatformId as string
            );
            const currentPlatformIdsSet = new Set(_currentPlatformIds);
            const newPlatformIdsSet = new Set(_newPlatformIds);
            for (const newPlatformId of newPlatformIdsSet) {
              if (currentPlatformIdsSet.has(newPlatformId)) continue;
              statements.addPlatform.run(gameId, newPlatformId);
            }
            for (const currentPlatformId of currentPlatformIdsSet) {
              if (!newPlatformIdsSet.has(currentPlatformId)) {
                statements.removePlatform.run(gameId, currentPlatformId);
              }
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `updateManyPlatforms(${platformsMap.size} game(s))`
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

  const removeMany: PlayniteGameRepository["removeMany"] = (gameIds) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = {
          unlinkSessions: db.prepare(
            `UPDATE game_session SET GameId = NULL WHERE GameId = ?`
          ),
          removeGame: db.prepare(`DELETE FROM playnite_game WHERE Id = (?)`),
        };
        db.exec("BEGIN TRANSACTION");
        try {
          for (const gameId of gameIds) {
            stmt.unlinkSessions.run(gameId);
            stmt.removeGame.run(gameId);
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `remove(${gameIds.length} game(s))`
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
    (filters) => {
      return repositoryCall(
        logService,
        () => {
          const db = getDb();
          let query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game `;
          const { where, params } =
            _getWhereClauseAndParamsFromFilters(filters);
          query += where;
          const stmt = db.prepare(query);
          const result = stmt.get(...params);
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
    updateManyDevelopers,
    updateManyPublishers,
    updateManyPlatforms,
    remove,
    removeMany,
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
