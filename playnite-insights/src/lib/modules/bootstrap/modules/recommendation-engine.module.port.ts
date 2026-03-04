import type {
	IGameRecommendationRecordProjectionServicePort,
	IGameRecommendationRecordProjectionWriterPort,
	IGameVectorProjectionServicePort,
	IGameVectorProjectionWriterPort,
	IInstancePreferenceModelServicePort,
	IRecommendationEnginePort,
} from "$lib/modules/game-library/application";

export type IRecommendationEngineModulePort = {
	get recommendationEngine(): IRecommendationEnginePort;
	get gameVectorProjectionService(): IGameVectorProjectionServicePort;
	get gameVectorProjectionWriter(): IGameVectorProjectionWriterPort;
	get gameRecommendationRecordProjectionService(): IGameRecommendationRecordProjectionServicePort;
	get gameRecommendationRecordProjectionWriter(): IGameRecommendationRecordProjectionWriterPort;
	get instancePreferenceModelService(): IInstancePreferenceModelServicePort;

	initializeAsync: () => Promise<void>;
};
