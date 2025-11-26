import {
  makeRepositoryBase,
  type BaseRepositoryDeps,
} from "@playatlas/common/infra";
import z from "zod";
import type { CompanyId } from "../domain/company.entity";
import type { GameId, GameRelationshipMap } from "../domain/game.entity";
import type { GameFilters, GameSorting } from "../domain/game.types";
import type { GenreId } from "../domain/genre.entity";
import type { PlatformId } from "../domain/platform.entity";
import { gameMapper } from "../game.mapper";
import {
  GAME_RELATIONSHIP_META,
  TABLE_NAME,
} from "./game.repository.constants";
import type { GameRepository } from "./game.repository.port";
import type {
  GetRelationshipsForFn,
  UpdateRelationshipsForFn,
} from "./game.repository.types";

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

export const gameManifestDataSchema = z.array(
  z.object({
    Id: z.string(),
    ContentHash: z.string(),
  })
);

export type GameManifestData = z.infer<typeof gameManifestDataSchema>;

type GameRepositoryDeps = BaseRepositoryDeps;

export const makeGameRepository = (
  deps: GameRepositoryDeps
): GameRepository => {
  const { getDb, logService } = deps;
  const base = makeRepositoryBase({ getDb, logService });

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

  const _updateRelationshipFor: UpdateRelationshipsForFn = ({
    gameId,
    relationship,
    newRelationshipIds,
  }) => {
    const { table, column } = GAME_RELATIONSHIP_META[relationship];
    return base.run(
      ({ db }) => {
        db.prepare(`DELETE FROM ${table} WHERE GameId = ?`).run(gameId);
        if (newRelationshipIds.length > 0) {
          const stmt = db.prepare(
            `INSERT INTO ${table} (GameId, ${column}) VALUES (?, ?)`
          );
          for (const id of newRelationshipIds) {
            stmt.run(gameId, id);
          }
        }
      },
      `_updateRelationshipFor(${gameId}, ${relationship}, ${newRelationshipIds.length} relationship(s))`,
      false
    );
  };

  const _getRelationshipsFor: GetRelationshipsForFn = ({
    relationship,
    gameIds,
  }) => {
    const { table, column } = GAME_RELATIONSHIP_META[relationship];
    const placeholders = gameIds.map(() => "?").join(",");
    return base.run(
      ({ db }) => {
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
      `_getRelationshipsFor(${relationship}, ${gameIds.length} game(s))`,
      false
    );
  };

  const getTotal: GameRepository["getTotal"] = (filters) => {
    return base.run(({ db }) => {
      let query = `
          SELECT 
            COUNT(*) AS Total
          FROM playnite_game pg
        `;
      const { where, params } = _getWhereClauseAndParamsFromFilters(filters);
      query += where;
      const total = (db.prepare(query).get(...params)?.Total as number) ?? 0;
      return total;
    }, `getTotal()`);
  };

  const getById: GameRepository["getById"] = (id, props = {}) => {
    return base.run(({ db }) => {
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
    }, `getById(${id})`);
  };

  const exists: GameRepository["exists"] = (gameId) => {
    return base.run(({ db }) => {
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
    }, `exists(${gameId})`);
  };

  const upsertMany: GameRepository["upsertMany"] = (games) => {
    return base.run(({ db }) => {
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

      for (const game of games) {
        base.runTransaction(() => {
          const gameModel = gameMapper.toPersistence(game);
          stmt.run(
            gameModel.Id,
            gameModel.Name,
            gameModel.Description,
            gameModel.ReleaseDate,
            gameModel.Playtime,
            gameModel.LastActivity,
            gameModel.Added,
            gameModel.InstallDirectory,
            +gameModel.IsInstalled,
            gameModel.BackgroundImage,
            gameModel.CoverImage,
            gameModel.Icon,
            gameModel.ContentHash,
            gameModel.Hidden,
            gameModel.CompletionStatusId
          );
          if (game.relationships.developers.isLoaded())
            _updateRelationshipFor({
              relationship: "developers",
              gameId: gameModel.Id,
              newRelationshipIds: game.relationships.developers.get(),
            });
          if (game.relationships.publishers.isLoaded())
            _updateRelationshipFor({
              relationship: "publishers",
              gameId: gameModel.Id,
              newRelationshipIds: game.relationships.publishers.get(),
            });
          if (game.relationships.genres.isLoaded())
            _updateRelationshipFor({
              relationship: "genres",
              gameId: gameModel.Id,
              newRelationshipIds: game.relationships.genres.get(),
            });
          if (game.relationships.platforms.isLoaded())
            _updateRelationshipFor({
              relationship: "platforms",
              gameId: gameModel.Id,
              newRelationshipIds: game.relationships.platforms.get(),
            });
        });
      }
    }, `upsertMany(${games.length} game(s))`);
  };

  const remove: GameRepository["remove"] = (gameId) => {
    return base.run(({ db }) => {
      const query = `DELETE FROM playnite_game WHERE Id = (?)`;
      const stmt = db.prepare(query);
      const result = stmt.run(gameId);
      logService.debug(`Game with id ${gameId} deleted`);
      return result.changes == 1; // Number of rows affected
    }, `remove(${gameId})`);
  };

  const removeMany: GameRepository["removeMany"] = (gameIds) => {
    return base.run(({ db }) => {
      const stmt = {
        unlinkSessions: db.prepare(
          `UPDATE game_session SET GameId = NULL WHERE GameId = ?`
        ),
        removeGame: db.prepare(`DELETE FROM playnite_game WHERE Id = (?)`),
      };
      base.runTransaction(() => {
        for (const gameId of gameIds) {
          stmt.unlinkSessions.run(gameId);
          stmt.removeGame.run(gameId);
        }
      });
    }, `remove(${gameIds.length} game(s))`);
  };

  const getManifestData: GameRepository["getManifestData"] = () => {
    return base.run(({ db }) => {
      const query = `SELECT Id, ContentHash FROM playnite_game`;
      const stmt = db.prepare(query);
      const result = stmt.all();
      const data: GameManifestData = gameManifestDataSchema.parse(result);
      logService.debug(
        `Fetched manifest game data, total games in library: ${data.length}`
      );
      return data;
    }, `getManifestData()`);
  };

  const getTotalPlaytimeSeconds: GameRepository["getTotalPlaytimeSeconds"] = (
    filters
  ) => {
    return base.run(({ db }) => {
      let query = `SELECT SUM(Playtime) as totalPlaytimeSeconds FROM playnite_game `;
      const { where, params } = _getWhereClauseAndParamsFromFilters(filters);
      query += where;
      const stmt = db.prepare(query);
      const result = stmt.get(...params);
      if (!result) return 0;
      const data = result.totalPlaytimeSeconds as number;
      logService.debug(`Calculated total playtime: ${data} seconds`);
      return data;
    }, `getTotalPlaytimeSeconds()`);
  };

  const all: GameRepository["all"] = (props = {}) => {
    return base.run(({ db }) => {
      const query = `
          SELECT g.*
          FROM ${TABLE_NAME} g
          ORDER BY g.Id ASC;
        `;
      const stmt = db.prepare(query);
      const rows = stmt.all();
      const gameModels = z.array(gameSchema).parse(rows);
      const gameModelsIds = gameModels.map((m) => m.Id);

      let developerIdsMap: Map<GameId, CompanyId[]> = new Map();
      if (props.load?.developers)
        developerIdsMap = _getRelationshipsFor({
          relationship: "developers",
          gameIds: gameModelsIds,
        });

      let publisherIdsMap: Map<GameId, CompanyId[]> = new Map();
      if (props.load?.publishers)
        publisherIdsMap = _getRelationshipsFor({
          relationship: "publishers",
          gameIds: gameModelsIds,
        });

      let genreIdsMap: Map<GameId, GenreId[]> = new Map();
      if (props.load?.genres)
        genreIdsMap = _getRelationshipsFor({
          relationship: "genres",
          gameIds: gameModelsIds,
        });

      let platformIdsMap: Map<GameId, PlatformId[]> = new Map();
      if (props.load?.platforms)
        platformIdsMap = _getRelationshipsFor({
          relationship: "platforms",
          gameIds: gameModelsIds,
        });

      const games = gameModels.map((gameModel) => {
        const developerIds: CompanyId[] | null = props.load?.developers
          ? developerIdsMap.get(gameModel.Id) ?? []
          : null;
        const publisherIds: CompanyId[] | null = props.load?.publishers
          ? publisherIdsMap.get(gameModel.Id) ?? []
          : null;
        const genreIds: GenreId[] | null = props.load?.genres
          ? genreIdsMap.get(gameModel.Id) ?? []
          : null;
        const platformIds: PlatformId[] | null = props.load?.platforms
          ? platformIdsMap.get(gameModel.Id) ?? []
          : null;
        return gameMapper.toDomain(gameModel, {
          developerIds,
          publisherIds,
          genreIds,
          platformIds,
        });
      });

      logService.debug(`Found ${games?.length ?? 0} games`);
      return games;
    }, `all()`);
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
