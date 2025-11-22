import {
  repositoryCall,
  type BaseRepositoryDeps,
} from "@playatlas/common/infra";
import z from "zod";
import type { CompanyId } from "../domain/company.entity";
import type { GameId, GameRelationshipMap } from "../domain/game.entity";
import type { GameFilters, GameSorting } from "../domain/game.types";
import type { GenreId } from "../domain/genre.entity";
import type { PlatformId } from "../domain/platform.entity";
import type { GameManifestData } from "../domain/types/game-manifest-data";
import { gameMapper } from "../game.mapper";
import {
  REL_META,
  RELATIONSHIP_TABLE_NAME,
  TABLE_NAME,
} from "./game.repository.constants";
import type { GameRepository } from "./game.repository.port";
import type { GetRelationshipsForFn } from "./game.repository.types";

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

  const _updateRelationship = (
    gameId: GameId,
    newIds: CompanyId[] | GenreId[] | PlatformId[],
    table: (typeof RELATIONSHIP_TABLE_NAME)[keyof typeof RELATIONSHIP_TABLE_NAME],
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

  const _getRelationshipsFor: GetRelationshipsForFn = ({
    relationship,
    gameIds,
  }) => {
    const { table, column } = REL_META[relationship];
    const placeholders = gameIds.map(() => "?").join(",");

    return repositoryCall(
      logService,
      () => {
        const stmt = db.prepare(`
          SELECT GameId, ${column}
          FROM ${table}
          WHERE GameId IN (${placeholders})
        `);
        const rows = stmt.all(...gameIds);
        const map = new Map<
          GameId,
          GameRelationshipMap[typeof relationship][]
        >();
        for (const props of rows) {
          const gameId = props.GameId as GameId;
          const entityId = props[
            column
          ] as GameRelationshipMap[typeof relationship];
          if (!map.get(gameId)) map.set(gameId, []);
          map.get(gameId)!.push(entityId);
        }
        return map;
      },
      `_getRelationshipsFor()`
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
        const query = `SELECT * FROM ${TABLE_NAME} WHERE Id = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const gameModel = z.optional(gameSchema).parse(result);
        if (!gameModel) return null;

        let developerIds: CompanyId[] | null = null;
        if (props.load?.developers)
          developerIds =
            _getRelationshipsFor({
              relationship: "developers",
              gameIds: [gameModel.Id],
            }).get(gameModel.Id) ?? [];

        let publisherIds: CompanyId[] | null = null;
        if (props.load?.publishers)
          publisherIds =
            _getRelationshipsFor({
              relationship: "publishers",
              gameIds: [gameModel.Id],
            }).get(gameModel.Id) ?? [];

        let genreIds: GenreId[] | null = null;
        if (props.load?.genres)
          genreIds =
            _getRelationshipsFor({
              relationship: "genres",
              gameIds: [gameModel.Id],
            }).get(gameModel.Id) ?? [];

        let platformIds: PlatformId[] | null = null;
        if (props.load?.platforms)
          platformIds =
            _getRelationshipsFor({
              relationship: "platforms",
              gameIds: [gameModel.Id],
            }).get(gameModel.Id) ?? [];

        logService.debug(`Found game ${gameModel?.Name}`);
        return gameMapper.toDomain(gameModel, {
          developerIds,
          publisherIds,
          genreIds,
          platformIds,
        });
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
              _updateRelationship(
                model.Id,
                game.relationships.developers.get(),
                RELATIONSHIP_TABLE_NAME.gameDeveloper,
                "DeveloperId"
              );
            }
            if (game.relationships.publishers.isLoaded()) {
              _updateRelationship(
                model.Id,
                game.relationships.publishers.get(),
                RELATIONSHIP_TABLE_NAME.gamePublisher,
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
        const gameModels = z.array(gameSchema).parse(rows);

        let developerIds: Map<GameId, CompanyId[]> = new Map();
        if (props.load?.developers)
          developerIds = _getRelationshipsFor({
            relationship: "developers",
            gameIds: gameModels.map((m) => m.Id),
          });

        const games = gameModels.map((game) => {
          return gameMapper.toDomain(game, {
            developerIds: props.load?.developers
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
