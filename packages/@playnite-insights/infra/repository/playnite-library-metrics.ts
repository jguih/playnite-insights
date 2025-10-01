import type { PlayniteLibraryMetricsRepository } from "@playnite-insights/core";
import {
  type BaseRepositoryDeps,
  getDefaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makePlayniteLibraryMetricsRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): PlayniteLibraryMetricsRepository => {
  const { getDb, logService } = { ...getDefaultRepositoryDeps(), ...deps };
  const TABLE_NAME = "playnite_library_metrics";

  const add: PlayniteLibraryMetricsRepository["add"] = (newMetrics) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const now = new Date().toISOString();
        const query = `
        INSERT INTO ${TABLE_NAME} (
          Timestamp, 
          TotalPlaytimeSeconds, 
          TotalGames,
          VisibleTotalPlaytimeSeconds,
          VisibleTotalGames
        ) VALUES
          (?, ?, ?, ?, ?);
      `;
        const stmt = db.prepare(query);
        stmt.run(
          now,
          newMetrics.TotalPlaytimeSeconds,
          newMetrics.TotalGames,
          newMetrics.VisibleTotalPlaytimeSeconds,
          newMetrics.VisibleTotalGames
        );
        return true;
      },
      `add(${newMetrics.TotalPlaytimeSeconds}, ${newMetrics.TotalGames})`
    );
  };

  const getTotalPlaytimeOverLast6Months = (): number[] => {
    return repositoryCall(
      logService,
      () => {
        const query = `
          SELECT totalPlaytimeSeconds FROM (
            SELECT MAX(TotalPlaytimeSeconds) as totalPlaytimeSeconds, strftime('%Y-%m', Timestamp) as yearMonth
            FROM ${TABLE_NAME}
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
      },
      `getTotalPlaytimeOverLast6Months()`
    );
  };

  const getGamesOwnedLastNMonths: PlayniteLibraryMetricsRepository["getGamesOwnedLastNMonths"] =
    (n = 6) => {
      return repositoryCall(
        logService,
        () => {
          const query = `
          SELECT MAX(TotalGames) AS totalGamesOwned, strftime('%Y-%m', Timestamp) AS yearMonth
          FROM ${TABLE_NAME}
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
        },
        `getGamesOwnedLastNMonths(${n})`
      );
    };

  return {
    add,
    getGamesOwnedLastNMonths,
    getTotalPlaytimeOverLast6Months,
  };
};

export const defaultPlayniteLibraryMetricsRepository: PlayniteLibraryMetricsRepository =
  makePlayniteLibraryMetricsRepository();
