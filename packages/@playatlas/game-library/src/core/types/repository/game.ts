import type { Company } from "../company";
import type { FullGame, Game, GameFilters } from "../game";
import type { GameManifestData } from "../game-manifest-data";
import type { Genre } from "../genre";
import type { Platform } from "../platform";

export type GameRepository = {
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  getById: (id: string) => Game | null;
  getManifestData: () => GameManifestData | null;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: (filters?: GameFilters) => number;
  all: () => FullGame[];
  upsertMany: (games: Game[]) => void;
  updateManyGenres: (gameGenresMap: Map<Game["Id"], Genre["Id"][]>) => void;
  updateManyDevelopers: (
    gameDevelopersMap: Map<Game["Id"], Company["Id"][]>
  ) => void;
  updateManyPublishers: (
    gamePublishersMap: Map<Game["Id"], Company["Id"][]>
  ) => void;
  updateManyPlatforms: (
    gamePlatformsMap: Map<Game["Id"], Platform["Id"][]>
  ) => void;
  removeMany: (gameIds: Game["Id"][]) => void;
};
