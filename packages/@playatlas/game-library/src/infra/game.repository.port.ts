import { Game, GameId, GameRelationship } from "../domain/game.entity";
import type { GameFilters } from "../domain/game.types";
import type { GameManifestData } from "./game.repository";

export type GameRepositoryEagerLoadProps = {
  load?: Partial<Record<GameRelationship, boolean>> | boolean;
};

export type GameRepository = {
  remove: (gameId: string) => boolean;
  exists: (gameId: string) => boolean;
  getById: (id: string, props?: GameRepositoryEagerLoadProps) => Game | null;
  getManifestData: () => GameManifestData;
  getTotal: (filters?: GameFilters) => number;
  getTotalPlaytimeSeconds: (filters?: GameFilters) => number;
  all: (props?: GameRepositoryEagerLoadProps) => Game[];
  upsertMany: (games: Game[]) => void;
  removeMany: (gameIds: GameId[]) => void;
};
