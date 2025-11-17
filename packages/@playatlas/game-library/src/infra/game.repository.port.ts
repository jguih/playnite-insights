import { CompanyId } from "../domain/company.entity";
import { Game, GameId } from "../domain/game.entity";
import type { GameFilters } from "../domain/game.types";
import type { GameManifestData } from "../domain/types/game-manifest-data";
import type { Genre } from "../domain/types/genre";
import type { Platform } from "../domain/types/platform";

export type GameRepositoryEagerLoadProps = {
  loadGenres?: boolean;
  loadPlatforms?: boolean;
  loadDevelopers?: boolean;
  loadPublishers?: boolean;
};

export type GameRepository = {
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  getById: (id: string, props: GameRepositoryEagerLoadProps) => Game | null;
  getManifestData: () => GameManifestData | null;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: (filters?: GameFilters) => number;
  all: (props: GameRepositoryEagerLoadProps) => Game[];
  upsertMany: (games: Game[]) => void;
  updateManyGenres: (gameGenresMap: Map<GameId, Genre["Id"][]>) => void;
  updateManyDevelopers: (gameDevelopersMap: Map<GameId, CompanyId[]>) => void;
  updateManyPublishers: (gamePublishersMap: Map<GameId, CompanyId[]>) => void;
  updateManyPlatforms: (
    gamePlatformsMap: Map<GameId, Platform["Id"][]>
  ) => void;
  removeMany: (gameIds: GameId[]) => void;
};
