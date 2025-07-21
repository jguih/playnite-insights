import { GameSessionService, LogService } from "@playnite-insights/core";
import { defaultLogger } from "./log";
import type { DatabaseSync } from "node:sqlite";
import { getDb as _getDb } from "../database";
import z from "zod";
import { gameSessionSchema } from "@playnite-insights/lib";

type GameSessionServiceDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export const makeGameSessionService = (
  { logService, getDb }: GameSessionServiceDeps = {
    logService: defaultLogger,
    getDb: _getDb,
  }
): GameSessionService => {
  const exists: GameSessionService["exists"] = (sessionId) => {
    const db = getDb();
    const query = `
      SELECT EXISTS (SELECT 1 FROM game_session WHERE SessionId = (?))
    `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(sessionId);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    } catch (error) {
      logService.error(
        `Failed to check if session ${sessionId} exists`,
        error as Error
      );
      return false;
    }
  };

  const open: GameSessionService["open"] = (command) => {
    const db = getDb();
    const query = `
      INSERT INTO game_session
        (SessionId, GameId, StartTime)
      VALUES
        (?, ?, ?)
    `;
    try {
      const stmt = db.prepare(query);
      stmt.run(command.SessionId, command.GameId, command.StartTime);
      logService.info(
        `Opened game session ${command.SessionId} for game ${command.GameId}`
      );
      return true;
    } catch (error) {
      logService.error(`Failed to create session ${command.SessionId}`);
      return false;
    }
  };

  const close: GameSessionService["close"] = (command) => {
    const db = getDb();

    if (exists(command.SessionId)) {
      const query = `
        UPDATE game_session
        SET 
          EndTime = ?, 
          Duration = ?
        WHERE
          SessionId = ?
      `;
      try {
        const stmt = db.prepare(query);
        stmt.run(command.EndTime, command.Duration, command.SessionId);
        logService.info(`Closed game session ${command.SessionId}`);
        return true;
      } catch (error) {
        logService.error(`Failed to update session ${command.SessionId}`);
        return false;
      }
    }

    const query = `
      INSERT INTO game_session
        (SessionId, GameId, StartTime, EndTime, Duration)
      VALUES
        (?, ?, ?, ?, ?)
    `;
    try {
      const stmt = db.prepare(query);
      stmt.run(
        command.SessionId,
        command.GameId,
        command.StartTime,
        command.EndTime,
        command.Duration
      );
      logService.info(
        `Created closed game session ${command.SessionId} for game ${command.GameId}`
      );
      return true;
    } catch (error) {
      logService.error(
        `Failed to create closed game session ${command.SessionId}`
      );
      return false;
    }
  };

  const all: GameSessionService["all"] = () => {
    const db = getDb();
    const query = `SELECT * FROM game_session ORDER BY StartTime DESC`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const sessions = z.optional(z.array(gameSessionSchema)).parse(result);
      logService.debug(`Found ${sessions.length} game sessions`);
      return sessions;
    } catch (error) {
      logService.error(`Failed get all game sessions`, error as Error);
      return;
    }
  };

  return { exists, open, close, all };
};
