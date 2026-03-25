import type { GameId } from "$lib/modules/common/domain";
import type { Game } from "../../domain/game.entity";

export type GetGamesByIdsQuery = {
	gameIds: GameId[];
};

export type GetGamesByIdsQueryResult = {
	games: Game[];
};
