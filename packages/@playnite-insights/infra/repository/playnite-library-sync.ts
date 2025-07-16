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

  const getTotalPlaytimeOverLast6Months = (): number[] => {
    const query = `
        SELECT totalPlaytimeSeconds FROM (
          SELECT MAX(TotalPlaytimeSeconds) as totalPlaytimeSeconds, strftime('%Y-%m', Timestamp) as yearMonth
          FROM playnite_library_sync
          WHERE Timestamp >= datetime('now', '-6 months')
          GROUP BY yearMonth
          ORDER BY yearMonth
        );
      `;
    try {
      const stmt = getDb().prepare(query);
      const result = stmt.all();
      const data: number[] = [];
      for (const entry of result) {
        const value = entry.totalPlaytimeSeconds as number;
        data.push(value);
      }
      logService.debug(
        `Successfully queried total playtime over last 6 months: ${JSON.stringify(
          data
        )}`
      );
      return data;
    } catch (error) {
      logService.error(
        "Failed to get total playtime over last 6 months",
        error as Error
      );
      return [];
    }
  };

  const getTotalGamesOwnedOverLast6Months = (): number[] => {
    const query = `
        SELECT MAX(TotalGames) AS totalGamesOwned, strftime('%Y-%m', Timestamp) AS yearMonth
        FROM playnite_library_sync
        WHERE Timestamp >= datetime('now', '-6 months')
        GROUP BY yearMonth
        ORDER BY yearMonth;
      `;
    try {
      const stmt = getDb().prepare(query);
      const result = stmt.all();
      const data: number[] = [];
      for (const entry of result) {
        const value = entry.totalGamesOwned as number;
        data.push(value);
      }
      logService.debug(
        `Successfully queried total games owned over last 6 months: ${JSON.stringify(
          data
        )}`
      );
      return data;
    } catch (error) {
      logService.error(
        "Failed to get total games owned over last 6 months",
        error as Error
      );
      return [];
    }
  };

  return {
    add,
    getTotalGamesOwnedOverLast6Months,
    getTotalPlaytimeOverLast6Months,
  };
};

export const defaultPlayniteLibrarySyncRepository: PlayniteLibrarySyncRepository =
  makePlayniteLibrarySyncRepository();
