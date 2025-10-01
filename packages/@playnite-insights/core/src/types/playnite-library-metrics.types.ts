import type { PlayniteLibraryMetrics } from "@playnite-insights/lib/client";

export type PlayniteLibraryMetricsRepository = {
  add: (playniteLibraryMetrics: PlayniteLibraryMetrics) => boolean;
  /**
   *
   * @returns An array with 0 to 6 numbers representing the total playtime in seconds over the last 6 months.
   */
  getTotalPlaytimeOverLast6Months: () => number[];
  /**
   *
   * @returns An array with 0 to 6 numbers representing total games owned over the last 6 months.
   */
  getGamesOwnedLastNMonths: (n?: number) => {
    all: number[];
    visibleOnly: number[];
  };
};
