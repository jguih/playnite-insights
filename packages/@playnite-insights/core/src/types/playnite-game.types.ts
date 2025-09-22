import type {
  Company,
  FullGame,
  GameFilters,
  GameManifestData,
  Genre,
  Platform,
  PlayniteGame,
} from "@playnite-insights/lib/client";

export type AddOrUpdatePlayniteGameArgs = {
  game: PlayniteGame;
  developers?: Array<Company>;
  platforms?: Array<Platform>;
  genres?: Array<Genre>;
  publishers?: Array<Company>;
};

export type PlayniteGameRepository = {
  add: (args: AddOrUpdatePlayniteGameArgs) => boolean;
  update: (args: AddOrUpdatePlayniteGameArgs) => boolean;
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  addDeveloperFor: (
    game: Pick<PlayniteGame, "Id" | "Name">,
    developer: Company
  ) => boolean;
  deleteDevelopersFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
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
    publisher: Company
  ) => boolean;
  deletePublishersFor: (game: Pick<PlayniteGame, "Id" | "Name">) => boolean;
  getById: (id: string) => PlayniteGame | null;
  getManifestData: () => GameManifestData | null;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: () => number;
  all: () => FullGame[];
};
