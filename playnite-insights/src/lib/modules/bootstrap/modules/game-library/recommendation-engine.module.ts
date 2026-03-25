import {
	RecommendationEngine,
	type IGameRecommendationRecordProjectionServicePort,
	type IGameVectorProjectionServicePort,
	type IInstancePreferenceModelServicePort,
	type IRecommendationEnginePort,
} from "$lib/modules/game-library/application";
import type { IRecommendationEngineModulePort } from "./recommendation-engine.module.port";

export type RecommendationEngineModulePortDeps = {
	gameVectorProjectionService: IGameVectorProjectionServicePort;
	gameRecommendationRecordProjectionService: IGameRecommendationRecordProjectionServicePort;
	instancePreferenceModelService: IInstancePreferenceModelServicePort;
};

export class RecommendationEngineModule implements IRecommendationEngineModulePort {
	readonly recommendationEngine: IRecommendationEnginePort;

	constructor(private readonly deps: RecommendationEngineModulePortDeps) {
		this.recommendationEngine = new RecommendationEngine({
			instancePreferenceModelService: this.deps.instancePreferenceModelService,
			gameRecommendationRecordProjectionService:
				this.deps.gameRecommendationRecordProjectionService,
		});
	}

	initializeAsync: IRecommendationEngineModulePort["initializeAsync"] = async () => {
		await this.deps.gameVectorProjectionService.initializeAsync();
		await this.deps.instancePreferenceModelService.initializeAsync();
		await this.deps.gameRecommendationRecordProjectionService.initializeAsync();
	};
}
