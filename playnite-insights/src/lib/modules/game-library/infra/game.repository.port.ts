import type { GameId } from "$lib/modules/common/domain";
import type { IClientEntityRepository } from "$lib/modules/common/infra/client-entity.repository.port";
import type { Game } from "../domain/game.entity";
import type { GameQuery, GameQueryResult } from "./game.repository.types";

export interface IGameRepositoryPort extends IClientEntityRepository<Game, GameId> {
	queryAsync(query: GameQuery): Promise<GameQueryResult>;
}
