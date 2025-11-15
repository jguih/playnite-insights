import type { Company } from "../domain/types/company";
import type { FullGame, Game, GameFilters } from "../domain/types/game";
import type { GameManifestData } from "../domain/types/game-manifest-data";
import type { Genre } from "../domain/types/genre";
import type { Platform } from "../domain/types/platform";

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
