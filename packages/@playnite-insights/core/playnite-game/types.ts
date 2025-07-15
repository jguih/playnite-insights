import type {
  Developer,
  GameManifestData,
  Genre,
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
  getTotal: (query?: string | null) => number;
  getTotalPlaytimeSeconds: () => number | undefined;
};
