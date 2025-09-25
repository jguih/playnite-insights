import type {
  FullGame,
  GameFilters,
  GameManifestData,
  Genre,
  PlayniteGame,
} from "@playnite-insights/lib/client";

export type PlayniteGameRepository = {
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  getById: (id: string) => PlayniteGame | null;
  getManifestData: () => GameManifestData | null;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: () => number;
  all: () => FullGame[];
  upsertMany: (games: PlayniteGame[]) => void;
  updateManyGenres: (
    gameGenresMap: Map<PlayniteGame["Id"], Genre["Id"][]>
  ) => void;
};
