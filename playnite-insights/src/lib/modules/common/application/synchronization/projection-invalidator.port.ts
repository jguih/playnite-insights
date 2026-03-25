import type {
	GameRecommendationRecordProjectionInput,
	GameSessionInput,
	GameVectorProjectionInput,
} from "$lib/modules/common/common";

type RecommendationEngineInvalidationEntities = {
	games: GameRecommendationRecordProjectionInput[];
	gameClassifications: GameVectorProjectionInput[];
	gameSessions: GameSessionInput[];
};

type InvalidateFnProps = {
	[K in keyof RecommendationEngineInvalidationEntities]: {
		source: K;
		inputs: RecommendationEngineInvalidationEntities[K];
	};
}[keyof RecommendationEngineInvalidationEntities];

export type IProjectionInvalidatorPort = {
	invalidate: (props: InvalidateFnProps) => void;
};
