import type { ClassificationId } from "@playatlas/common/domain";
import type { GameId } from "../../domain/value-object/game-id";

export type GameVectorProjectionInputId = string & {
	readonly __brand: "GameVectorProjectionInputId";
};

export const GameVectorProjectionInputIdParser = {
	fromTrusted: (gameId: GameId, classificationId: ClassificationId) =>
		`${gameId}:${classificationId}` as GameVectorProjectionInputId,
};

export type GameVectorProjectionInput = {
	gameId: GameId;
	classificationId: ClassificationId;
	normalizedScore: number;
	isGameDeleted?: boolean;
};
