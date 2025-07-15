export type PlayniteLibrarySyncRepository = {
  /**
   * Creates a new entry for playnite_library_sync
   * @param totalPlaytimeSeconds
   * @param totalGames
   * @returns
   */
  add: (totalPlaytimeSeconds: number, totalGames: number) => boolean;
  /**
   *
   * @returns An array with 0 to 6 numbers representing the total playtime in seconds over the last 6 months.
   */
  getTotalPlaytimeOverLast6Months: () => number[];
  /**
   *
   * @returns An array with 0 to 6 numbers representing total games owned over the last 6 months.
   */
  getTotalGamesOwnedOverLast6Months: () => number[];
};
