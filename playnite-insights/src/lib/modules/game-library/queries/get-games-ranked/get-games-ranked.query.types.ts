import type { Game } from "../../domain/game.entity";

export type ExpandedGame = Game & {
	Similarity: number;
};

export type GetGamesRankedQueryResult = {
	games: ExpandedGame[];
	nextKey: number | null;
};
