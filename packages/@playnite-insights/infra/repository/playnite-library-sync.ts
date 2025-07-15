import type {
  LogService,
  PlayniteLibrarySyncRepository,
} from "@playnite-insights/core";
import type { DatabaseSync } from "node:sqlite";
import { getDb as _getDb } from "../database";
import { defaultLogger } from "../services";

type PlayniteLibrarySyncRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

export const makePlayniteLibrarySyncRepository = (
  { getDb, logService }: PlayniteLibrarySyncRepositoryDeps = {
    getDb: _getDb,
    logService: defaultLogger,
  }
): PlayniteLibrarySyncRepository => {
  const add = (totalPlaytimeSeconds: number, totalGames: number) => {
    const db = getDb();
    const now = new Date().toISOString();
    const query = `
      INSERT INTO playnite_library_sync
        (Timestamp, TotalPlaytimeSeconds, TotalGames)
      VALUES
        (?, ?, ?);
    `;
    try {
      const stmt = db.prepare(query);
      stmt.run(now, totalPlaytimeSeconds, totalGames);
      logService.debug(
        `Inserted playnite_library_sync entry with totalPlaytime: ${totalPlaytimeSeconds} seconds and totalGames: ${totalGames}`
      );
      return true;
    } catch (error) {
      logService.error(
        "Error while inserting new entry for Playnite library sync",
        error as Error
      );
      return false;
    }
  };

  return {
    add,
  };
};
