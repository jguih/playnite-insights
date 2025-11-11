import { repositoryCall } from "@playatlas/shared/app";
import { type BaseRepositoryDeps } from "@playatlas/shared/core";
import z from "zod";
import type { GameSessionFilters } from "../../core/types/game-session";
import type { GameSessionRepository } from "../../core/types/repository/game-session";
import { gameSessionSchema } from "../../core/validation/schemas/game-session";

export const makeGameSessionRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): GameSessionRepository => {
  const getWhereClauseAndParamsFromFilters = (filters?: GameSessionFilters) => {
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
        const session = z.optional(gameSessionSchema).parse(result);
        return session ?? null;
      },
      `getById(${sessionId})`
    );
  };

  const add: GameSessionRepository["add"] = (session) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO game_session
          (SessionId, GameId, GameName, StartTime, EndTime, Duration, Status)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `;
        const stmt = db.prepare(query);
        stmt.run(
          session.SessionId,
          session.GameId,
          session.GameName,
          session.StartTime,
          session.EndTime,
          session.Duration,
          session.Status
        );
        logService.debug(`Created session ${session.SessionId}`);
        return true;
      },
      `add(${session.SessionId}, ${session.GameName})`
    );
  };

  const update: GameSessionRepository["update"] = (session) => {
    return repositoryCall(
      logService,
      () => {
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
          session.GameId,
          session.GameName,
          session.StartTime,
          session.EndTime,
          session.Duration,
          session.Status,
          session.SessionId
        );
        logService.debug(`Updated session ${session.SessionId}`);
        return true;
      },
      `update(${session.SessionId}, ${session.GameName})`
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
        logService.debug(`Found ${sessions?.length ?? 0} sessions`);
        return sessions;
      },
      `all()`
    );
  };

  const findAllBy: GameSessionRepository["findAllBy"] = (args) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        let query = `
        SELECT * 
        FROM game_session 
      `;
        const { where, params } = getWhereClauseAndParamsFromFilters(
          args.filters
        );
        query += where;
        query += ` ORDER BY StartTime DESC;`;
        const stmt = db.prepare(query);
        const result = stmt.all(...params);
        const sessions = z.array(gameSessionSchema).parse(result);
        return sessions;
      },
      `findAllBy()`
    );
  };

  return { getById, add, update, all, findAllBy };
};
