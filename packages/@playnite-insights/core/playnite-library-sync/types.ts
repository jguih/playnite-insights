export type PlayniteLibrarySyncRepository = {
  add: (totalPlaytimeSeconds: number, totalGames: number) => boolean;
};
