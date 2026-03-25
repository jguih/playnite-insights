import type {
	GameRecommendationRecordProjectionInput,
	GameSessionInput,
	GameVectorProjectionInput,
	GameVectorProjectionInputId,
} from "$lib/modules/common/common";
import type {
	GameId,
	GameSessionId,
	RecommendationEngineProjectionSource,
} from "$lib/modules/common/domain";

export type ProjectionReconcilerContext = {
	recommendationRecordInputs: Map<GameId, GameRecommendationRecordProjectionInput> | null;
	gameVectorInputs: Map<GameVectorProjectionInputId, GameVectorProjectionInput> | null;
	gameSessionInputs: Map<GameSessionId, GameSessionInput> | null;
	gameIds: Set<GameId>;
};

export type ProjectionReconcilerSnapshot = {
	dirtySources: Set<RecommendationEngineProjectionSource>;
	context: {
		recommendationRecordInputs: GameRecommendationRecordProjectionInput[];
		gameVectorInputs: GameVectorProjectionInput[];
		gameSessionInputs: GameSessionInput[];
		gameIds: GameId[];
	};
};
