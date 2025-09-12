import type { PlayniteLibrarySyncRepository } from "@playnite-insights/core";
import {
  BaseRepositoryDeps,
  defaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makePlayniteLibrarySyncRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): PlayniteLibrarySyncRepository => {
  const { getDb, logService } = { ...defaultRepositoryDeps, ...deps };

  const add = (totalPlaytimeSeconds: number, totalGames: number) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const now = new Date().toISOString();
        const query = `
        INSERT INTO playnite_library_sync
          (Timestamp, TotalPlaytimeSeconds, TotalGames)
        VALUES
          (?, ?, ?);
      `;
        const stmt = db.prepare(query);
        stmt.run(now, totalPlaytimeSeconds, totalGames);
        logService.debug(
          `Created library sync entry (totalPlaytime: ${totalPlaytimeSeconds}s, totalGames: ${totalGames})`
        );
        return true;
      },
      `add(${totalPlaytimeSeconds}, ${totalGames})`
    );
  };

  const getTotalPlaytimeOverLast6Months = (): number[] => {
    return repositoryCall(logService,() => {
      const query = `
          SELECT totalPlaytimeSeconds FROM (
            SELECT MAX(TotalPlaytimeSeconds) as totalPlaytimeSeconds, strftime('%Y-%m', Timestamp) as yearMonth
            FROM playnite_library_sync
            WHERE Timestamp >= datetime('now', '-6 months')
            GROUP BY yearMonth
            ORDER BY yearMonth
          );
        `;
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
    }, `getTotalPlaytimeOverLast6Months()`);
  };

  const getGamesOwnedLastNMonths: PlayniteLibrarySyncRepository["getGamesOwnedLastNMonths"] =
    (n = 6) => {
      return repositoryCall(logService, () => {
        const query = `
          SELECT MAX(TotalGames) AS totalGamesOwned, strftime('%Y-%m', Timestamp) AS yearMonth
          FROM playnite_library_sync
          WHERE Timestamp >= datetime('now', ?)
          GROUP BY yearMonth
          ORDER BY yearMonth DESC;
        `;
        const stmt = getDb().prepare(query);
        const result = stmt.all(`-${n} months`);
        const data: number[] = new Array(6).fill(0);
        let i = 5;
        for (const entry of result) {
          const value = entry.totalGamesOwned as number;
          data[i] = value;
          i--;
        }
        logService.debug(
          `Found total games owned over last 6 months: ${JSON.stringify(
            data
          )}`
        );
        return data;
      }, `getGamesOwnedLastNMonths(${n})`)
    };

  return {
    add,
    getGamesOwnedLastNMonths,
    getTotalPlaytimeOverLast6Months,
  };
};

export const defaultPlayniteLibrarySyncRepository: PlayniteLibrarySyncRepository =
  makePlayniteLibrarySyncRepository();
