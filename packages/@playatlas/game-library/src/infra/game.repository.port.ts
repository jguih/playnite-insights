import { Game, GameId } from "../domain/game.entity";
import type { GameFilters } from "../domain/game.types";
import type { GameManifestData } from "../domain/types/game-manifest-data";

export type GameRepositoryEagerLoadProps = {
  loadGenres?: boolean;
  loadPlatforms?: boolean;
  loadDevelopers?: boolean;
  loadPublishers?: boolean;
};

export type GameRepository = {
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  getById: (id: string, props?: GameRepositoryEagerLoadProps) => Game | null;
  getManifestData: () => GameManifestData | null;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: (filters?: GameFilters) => number;
  all: (props?: GameRepositoryEagerLoadProps) => Game[];
  upsertMany: (games: Game[]) => void;
  removeMany: (gameIds: GameId[]) => void;
};
