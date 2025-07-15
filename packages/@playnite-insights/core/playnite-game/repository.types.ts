import type {
  DashPageData,
  DashPageGame as DashPageGame,
  Developer,
  GameFilters,
  GameManifestData,
  GamePageSize,
  GameSorting,
  Genre,
  HomePageData,
  Platform,
  PlayniteGame,
  Publisher,
} from "@playnite-insights/lib";

export type PlayniteGameRepository = {
  add: (
    game: PlayniteGame,
    developers?: Array<Developer>,
    platforms?: Array<Platform>,
    genres?: Array<Genre>,
    publishers?: Array<Publisher>
  ) => boolean;
  update: (
    game: PlayniteGame,
    developers?: Array<Developer>,
    platforms?: Array<Platform>,
    genres?: Array<Genre>,
    publishers?: Array<Publisher>
  ) => boolean;
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  addDeveloperFor: (
    game: Pick<PlayniteGame, "Id" | "Name">,
    developer: Developer
  ) => boolean;
  deleteDevelopersFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
  getDevelopers: (
    game: Pick<PlayniteGame, "Id" | "Name">
  ) => Array<Developer> | undefined;
  addPlatformFor: (
    game: Pick<PlayniteGame, "Id" | "Name">,
    platform: Platform
  ) => boolean;
  deletePlatformsFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
  addGenreFor: (
    game: Pick<PlayniteGame, "Id" | "Name">,
    genre: Genre
  ) => boolean;
  deleteGenresFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
  addPublisherFor: (
    game: Pick<PlayniteGame, "Id" | "Name">,
    publisher: Publisher
  ) => boolean;
  deletePublishersFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
  getById: (id: string) => PlayniteGame | undefined;
  getManifestData: () => GameManifestData | undefined;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: () => number | undefined;
  /**
   * Gets the top `total` games for dashboard page
   * @param total Number of games to return
   * @returns
   */
  getTopMostPlayedGamesForDashPage: (
    total: number
  ) => DashPageData["topMostPlayedGames"];
  /**
   * Gets games for dashboard page
   * @returns
   */
  getGamesForDashPage: () => DashPageGame[];
  /**
   * Gets games for home page
   * @param offset
   * @param pageSize
   * @param filters
   * @param sorting
   * @returns
   */
  getGamesForHomePage: (
    offset: number,
    pageSize: GamePageSize,
    filters?: GameFilters,
    sorting?: GameSorting
  ) => HomePageData | undefined;
};
