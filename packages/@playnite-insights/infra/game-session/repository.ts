import type { LogService } from "@playnite-insights/core";
import { defaultLogger } from "../services/log";
import type { DatabaseSync } from "node:sqlite";
import { getDb as _getDb } from "../database";
import z from "zod";
import { gameSessionSchema } from "@playnite-insights/lib/client";
import { type GameSessionRepository } from "../../core/game-session.types";
import { getWhereClauseAndParamsFromFilters } from "./filtering";

type GameSessionRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

const defaultDeps: Required<GameSessionRepositoryDeps> = {
  getDb: _getDb,
  logService: defaultLogger,
};

export const makeGameSessionRepository = (
  deps: Partial<GameSessionRepositoryDeps> = {}
): GameSessionRepository => {
  const { getDb, logService } = { ...defaultDeps, ...deps };

  const getById: GameSessionRepository["getById"] = (sessionId) => {
    const db = getDb();
    const query = `SELECT * FROM game_session WHERE SessionId = (?)`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(sessionId);
      const session = z.optional(gameSessionSchema).parse(result);
      return session;
    } catch (error) {
      logService.error(`Failed to get session by Id`, error as Error);
      return;
    }
  };

  const add: GameSessionRepository["add"] = (session) => {
    const db = getDb();
    const query = `
      INSERT INTO game_session
        (SessionId, GameId, GameName, StartTime, EndTime, Duration, Status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `;
    try {
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
    } catch (error) {
      logService.error(`Failed to create session ${session.SessionId}`);
      return false;
    }
  };

  const update: GameSessionRepository["update"] = (session) => {
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
    try {
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
    } catch (error) {
      logService.error(`Failed to update session ${session.SessionId}`);
      return false;
    }
  };

  const all: GameSessionRepository["all"] = () => {
    const db = getDb();
    const query = `SELECT * FROM game_session ORDER BY StartTime DESC`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const sessions = z.optional(z.array(gameSessionSchema)).parse(result);
      logService.debug(`Found ${sessions?.length ?? 0} sessions`);
      return sessions;
    } catch (error) {
      logService.error(`Failed get all sessions`, error as Error);
      return;
    }
  };

  const unlinkSessionsForGame: GameSessionRepository["unlinkSessionsForGame"] =
    (gameId) => {
      const db = getDb();
      const query = `
        UPDATE game_session
        SET
          GameId = NULL
        WHERE
          GameId = ?
      `;
      try {
        const stmt = db.prepare(query);
        stmt.run(gameId);
        return true;
      } catch (error) {
        logService.error(
          `Failed to unlink sessions for game with id ${gameId}`,
          error as Error
        );
        return false;
      }
    };

  const findAllBy: GameSessionRepository["findAllBy"] = (args) => {
    const db = getDb();
    let query = `
      SELECT * 
      FROM game_session 
    `;
    const { where, params } = getWhereClauseAndParamsFromFilters(args.filters);
    query += where;
    query += ` ORDER BY StartTime DESC;`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      const sessions = z.optional(z.array(gameSessionSchema)).parse(result);
      logService.debug(`Found ${sessions?.length ?? 0} sessions`);
      return sessions;
    } catch (error) {
      logService.error(`Failed get all sessions`, error as Error);
      return;
    }
  };

  return { getById, add, update, all, unlinkSessionsForGame, findAllBy };
};
