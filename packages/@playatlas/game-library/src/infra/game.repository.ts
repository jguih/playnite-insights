import {
  repositoryCall,
  type BaseRepositoryDeps,
} from "@playatlas/common/infra";
import z from "zod";
import { CompanyId, GameId, GenreId, PlatformId } from "../domain";
import { GameFilters, GameSorting } from "../domain/game.types";
import { GameManifestData } from "../domain/types/game-manifest-data";
import { gameMapper } from "../game.mapper";
import { GameRepository } from "./game.repository.port";

export const GROUPADD_SEPARATOR = ",";

export const gameSchema = z.object({
  Id: z.string(),
  Name: z.string().nullable(),
  Description: z.string().nullable(),
  ReleaseDate: z.string().nullable(),
  Playtime: z.number(),
  LastActivity: z.string().nullable(),
  Added: z.string().nullable(),
  InstallDirectory: z.string().nullable(),
  IsInstalled: z.number(),
  BackgroundImage: z.string().nullable(),
  CoverImage: z.string().nullable(),
  Icon: z.string().nullable(),
  Hidden: z.number(),
  CompletionStatusId: z.string().nullable(),
  ContentHash: z.string(),
});

export type GameModel = z.infer<typeof gameSchema>;

type GameRepositoryDeps = BaseRepositoryDeps;

export const makeGameRepository = (
  deps: GameRepositoryDeps
): GameRepository => {
  const { getDb, logService } = deps;
  const db = getDb();
  const tableNames = {
    playniteGame: "playnite_game",
    playniteGameDeveloper: "playnite_game_developer",
    playniteGamePublisher: "playnite_game_publisher",
  } as const;

  const _getWhereClauseAndParamsFromFilters = (filters?: GameFilters) => {
    const where: string[] = [];
    const params: (string | number)[] = [];

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

  const _updateRelations = (
    gameId: GameId,
    newIds: CompanyId[] | GenreId[] | PlatformId[],
    table: (typeof tableNames)[keyof typeof tableNames],
    column: string
  ) => {
    db.prepare(`DELETE FROM ${table} WHERE GameId = ?`).run(gameId);
    if (newIds.length > 0) {
      const stmt = db.prepare(
        `INSERT INTO ${table} (GameId, ${column}) VALUES (?, ?)`
      );
      for (const id of newIds) {
        stmt.run(gameId, id);
      }
    }
  };

  const _getGenresFor = (gameId: GameId): GenreId[] => {
    return repositoryCall(
      logService,
      () => {
        const query = `
          SELECT GROUP_CONCAT(GenreId) as Genres
          FROM playnite_game_genre
          WHERE GameId = ?
        `;
        const result = db.prepare(query).get(gameId);
        if (!result || !Array.isArray(result.Genres)) return [];
        return result.Genres as GenreId[];
      },
      `_getGenresFor(${gameId})`
    );
  };

  const _getDevelopersFor = (gameIds: GameId[]): Map<GameId, CompanyId[]> => {
    return repositoryCall(
      logService,
      () => {
        const placeholders = gameIds.map(() => "?").join(",");
        const stmt = db.prepare(`
          SELECT GameId, DeveloperId
          FROM playnite_game_developer
          WHERE GameId IN (${placeholders})
        `);
        const rows = stmt.all(...gameIds);
        const map = new Map<GameId, CompanyId[]>();
        for (const { GameId, DeveloperId } of rows) {
          const gameId = GameId as GameId;
          const developerId = DeveloperId as CompanyId;
          if (!map.get(gameId)) map.set(gameId, []);
          map.get(gameId)!.push(developerId);
        }
        return map;
      },
      `_getDevelopersFor(${gameIds.length} games)`
    );
  };

  const _getPublishersFor = (gameIds: GameId[]): Map<GameId, CompanyId[]> => {
    return repositoryCall(
      logService,
      () => {
        const placeholders = gameIds.map(() => "?").join(",");
        const stmt = db.prepare(`
          SELECT GameId, PublisherId
          FROM playnite_game_publisher
          WHERE GameId IN (${placeholders})
        `);
        const rows = stmt.all(...gameIds);
        const map = new Map<GameId, CompanyId[]>();
        for (const { GameId, PublisherId } of rows) {
          const gameId = GameId as GameId;
          const publisherId = PublisherId as CompanyId;
          if (!map.get(gameId)) map.set(gameId, []);
          map.get(gameId)!.push(publisherId);
        }
        return map;
      },
      `_getPublishersFor(${gameIds.length} games)`
    );
  };

  const _getPlatformsFor = (gameId: GameId): PlatformId[] => {
    return repositoryCall(
      logService,
      () => {
        const query = `
          SELECT GROUP_CONCAT(GenreId) as Platforms
          FROM playnite_game_platform
          WHERE GameId = ?
        `;
        const result = db.prepare(query).get(gameId);
        if (!result || !Array.isArray(result.Platforms)) return [];
        return result.Platforms as string[];
      },
      `_getPlatformsFor(${gameId})`
    );
  };

  const getTotal: GameRepository["getTotal"] = (filters) => {
    return repositoryCall(
      logService,
      () => {
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

  const getById: GameRepository["getById"] = (id, props = {}) => {
    return repositoryCall(
      logService,
      () => {
        const query = `SELECT * FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const game = z.optional(gameSchema).parse(result);
        if (!game) return null;

        let developerIds: CompanyId[] | null = null;
        if (props.loadDevelopers)
          developerIds = _getDevelopersFor([game.Id]).get(game.Id) ?? [];

        let publisherIds: CompanyId[] | null = null;
        if (props.loadPublishers)
          publisherIds = _getPublishersFor([game.Id]).get(game.Id) ?? [];

        logService.debug(`Found game ${game?.Name}`);
        return gameMapper.toDomain(game, { developerIds, publisherIds });
      },
      `getById(${id})`
    );
  };

  const exists: GameRepository["exists"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
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

  const upsertMany: GameRepository["upsertMany"] = (games) => {
    return repositoryCall(
      logService,
      () => {
        const columns = [
          "Id",
          "Name",
          "Description",
          "ReleaseDate",
          "Playtime",
          "LastActivity",
          "Added",
          "InstallDirectory",
          "IsInstalled",
          "BackgroundImage",
          "CoverImage",
          "Icon",
          "ContentHash",
          "Hidden",
          "CompletionStatusId",
        ];

        const placeholders = columns.map(() => "?").join(",");

        const updateColumns = columns
          .slice(1)
          .map((c) => `${c} = excluded.${c}`)
          .join(",");

        const stmt = db.prepare(`
          INSERT INTO playnite_game (${columns.join(",")}) 
          VALUES (
            ${placeholders}
          ) ON CONFLICT(Id) DO UPDATE SET
            ${updateColumns};
          `);

        db.exec("BEGIN TRANSACTION");
        try {
          for (const game of games) {
            const model = gameMapper.toPersistence(game);
            stmt.run(
              model.Id,
              model.Name,
              model.Description,
              model.ReleaseDate,
              model.Playtime,
              model.LastActivity,
              model.Added,
              model.InstallDirectory,
              +model.IsInstalled,
              model.BackgroundImage,
              model.CoverImage,
              model.Icon,
              model.ContentHash,
              model.Hidden,
              model.CompletionStatusId
            );
            if (game.relationships.developers.isLoaded()) {
              _updateRelations(
                model.Id,
                game.relationships.developers.get(),
                tableNames.playniteGameDeveloper,
                "DeveloperId"
              );
            }
            if (game.relationships.publishers.isLoaded()) {
              _updateRelations(
                model.Id,
                game.relationships.publishers.get(),
                tableNames.playniteGamePublisher,
                "PublisherId"
              );
            }
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `upsertMany(${games.length} game(s))`
    );
  };

  const remove: GameRepository["remove"] = (gameId) => {
    return repositoryCall(
      logService,
      () => {
        const query = `DELETE FROM playnite_game WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.run(gameId);
        logService.debug(`Game with id ${gameId} deleted`);
        return result.changes == 1; // Number of rows affected
      },
      `remove(${gameId})`
    );
  };

  const removeMany: GameRepository["removeMany"] = (gameIds) => {
    return repositoryCall(
      logService,
      () => {
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

  const getManifestData: GameRepository["getManifestData"] = () => {
    return repositoryCall(
      logService,
      () => {
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

  const getTotalPlaytimeSeconds: GameRepository["getTotalPlaytimeSeconds"] = (
    filters
  ) => {
    return repositoryCall(
      logService,
      () => {
        let query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game `;
        const { where, params } = _getWhereClauseAndParamsFromFilters(filters);
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

  const all: GameRepository["all"] = (props = {}) => {
    return repositoryCall(
      logService,
      () => {
        const query = `
          SELECT pg.*
          FROM playnite_game pg
          ORDER BY pg.Id ASC;
        `;
        const stmt = db.prepare(query);
        const rows = stmt.all();
        const models = z.array(gameSchema).parse(rows);

        let developerIds: Map<GameId, CompanyId[]> = new Map();
        if (props.loadDevelopers)
          developerIds = _getDevelopersFor(models.map((m) => m.Id));

        const games = models.map((game) => {
          return gameMapper.toDomain(game, {
            developerIds: props.loadDevelopers
              ? developerIds.get(game.Id)
              : null,
          });
        });

        logService.debug(`Found ${games?.length ?? 0} games`);
        return games;
      },
      `all()`
    );
  };

  return {
    upsertMany,
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
