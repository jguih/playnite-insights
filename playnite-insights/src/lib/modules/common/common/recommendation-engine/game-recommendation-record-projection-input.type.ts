import type { GameId } from "../../domain/value-object/game-id";

export type GameRecommendationRecordProjectionInput = {
	gameId: GameId;
	isHidden?: boolean;
	isDeleted?: boolean;
	searchName?: string;
};
