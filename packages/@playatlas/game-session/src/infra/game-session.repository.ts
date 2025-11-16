import type { DateFilter } from "@playatlas/common/domain";
import {
  repositoryCall,
  type BaseRepositoryDeps,
} from "@playatlas/common/infra";
import z from "zod";
import { sessionStatus } from "../domain/game-session.constants";
import type { GameSession } from "../domain/game-session.entity";
import type { GameSessionStatus } from "../domain/game-session.types";
import { gameSessionMapper } from "../game-session.mapper";
import type { GameSessionRepository } from "./game-session.repository.port";

export const gameSessionSchema = z.object({
  SessionId: z.string(),
  GameId: z.string().nullable(),
  GameName: z.string().nullable(),
  StartTime: z.string(),
  EndTime: z.string().nullable(),
  Duration: z.number().nullable(),
  Status: z.enum([
    sessionStatus.inProgress,
    sessionStatus.closed,
    sessionStatus.stale,
  ]),
});

export type GameSessionModel = z.infer<typeof gameSessionSchema>;

export type GameSessionFilters = {
  startTime?: DateFilter[];
  status?: {
    op: "in" | "not in";
    types: GameSessionStatus[];
  };
};

export const makeGameSessionRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): GameSessionRepository => {
  const _getWhereClauseAndParamsFromFilters = (
    filters?: GameSessionFilters
  ) => {
    const where: string[] = [];
    const params: string[] = [];

    if (filters?.startTime) {
      for (const startTimeFilter of filters.startTime) {
        switch (startTimeFilter.op) {
          case "between": {
            where.push(`StartTime >= (?) AND StartTime < (?)`);
            params.push(startTimeFilter.start, startTimeFilter.end);
            break;
          }
          case "eq": {
            where.push(`StartTime = (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "gte": {
            where.push(`StartTime >= (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "lte": {
            where.push(`StartTime <= (?)`);
            params.push(startTimeFilter.value);
            break;
          }
          case "overlaps": {
            where.push(
              `StartTime < (?) AND (EndTime >= (?) OR EndTime IS NULL)`
            );
            params.push(startTimeFilter.end, startTimeFilter.start);
            break;
          }
        }
      }
    }

    if (filters?.status) {
      const values = filters.status.types;
      const placeholders = values.map(() => "?").join(", ");
      switch (filters.status.op) {
        case "in": {
          where.push(`Status IN (${placeholders})`);
        }
        case "not in": {
          where.push(`Status NOT IN (${placeholders})`);
        }
      }
      params.push(...filters.status.types);
    }

    return {
      where: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
      params,
    };
  };

  const getById: GameSessionRepository["getById"] = (sessionId) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM game_session WHERE SessionId = (?)`;
        const stmt = db.prepare(query);
        const result = stmt.get(sessionId);
        const model = z.optional(gameSessionSchema).parse(result);
        return model ? gameSessionMapper.toDomain(model) : null;
      },
      `getById(${sessionId})`
    );
  };

  const add: GameSessionRepository["add"] = (session) => {
    return repositoryCall(
      logService,
      () => {
        const persistence = gameSessionMapper.toPersistence(session);
        gameSessionSchema.parse(persistence);
        const db = getDb();
        const query = `
        INSERT INTO game_session
          (SessionId, GameId, GameName, StartTime, EndTime, Duration, Status)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `;
        const stmt = db.prepare(query);
        stmt.run(
          persistence.SessionId,
          persistence.GameId,
          persistence.GameName,
          persistence.StartTime,
          persistence.EndTime,
          persistence.Duration,
          persistence.Status
        );
        logService.debug(`Created session ${persistence.SessionId}`);
        return true;
      },
      `add(${session.getSessionId()}, ${session.getGameName()})`
    );
  };

  const update: GameSessionRepository["update"] = (session) => {
    return repositoryCall(
      logService,
      () => {
        const persistence = gameSessionMapper.toPersistence(session);
        gameSessionSchema.parse(persistence);
        const query = `
          UPDATE game_session
          SET
            GameId = ?,
            GameName = ?,
            StartTime = ?,
            EndTime = ?,
            Duration = ?,
            Status = ?
          WHERE
            SessionId = ?
        `;
        const db = getDb();
        const stmt = db.prepare(query);
        stmt.run(
          persistence.GameId,
          persistence.GameName,
          persistence.StartTime,
          persistence.EndTime,
          persistence.Duration,
          persistence.Status,
          persistence.SessionId
        );
        logService.debug(`Updated session ${persistence.SessionId}`);
        return true;
      },
      `update(${session.getSessionId()}, ${session.getGameName()})`
    );
  };

  const all: GameSessionRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM game_session ORDER BY StartTime DESC`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const sessions = z.array(gameSessionSchema).parse(result);
        const entities: GameSession[] = [];
        for (const session of sessions) {
          const domainEntity = gameSessionMapper.toDomain(session);
          entities.push(domainEntity);
        }
        logService.debug(`Found ${entities?.length ?? 0} sessions`);
        return entities;
      },
      `all()`
    );
  };

  const getAllBy: GameSessionRepository["getAllBy"] = (args) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        let query = `
        SELECT * 
        FROM game_session 
      `;
        const { where, params } = _getWhereClauseAndParamsFromFilters(
          args.filters
        );
        query += where;
        query += ` ORDER BY StartTime DESC;`;
        const stmt = db.prepare(query);
        const result = stmt.all(...params);
        const sessions = z.array(gameSessionSchema).parse(result);
        const entities: GameSession[] = [];
        for (const session of sessions) {
          const domainEntity = gameSessionMapper.toDomain(session);
          entities.push(domainEntity);
        }
        return entities;
      },
      `getAllBy()`
    );
  };

  return { getById, add, update, all, getAllBy };
};
