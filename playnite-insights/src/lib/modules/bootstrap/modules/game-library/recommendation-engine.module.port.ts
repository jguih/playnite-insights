import type { IRecommendationEnginePort } from "$lib/modules/game-library/application";

export type IRecommendationEngineModulePort = {
	get recommendationEngine(): IRecommendationEnginePort;
	initializeAsync: () => Promise<void>;
};
