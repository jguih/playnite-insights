import type { IClockPort } from "$lib/modules/common/application";
import {
	GameRecommendationRecordProjectionService,
	GameRecommendationRecordProjectionWriter,
	GameVectorProjectionService,
	GameVectorProjectionWriter,
	InstancePreferenceModelService,
	RecommendationEngine,
	type IGameRecommendationRecordProjectionServicePort,
	type IGameRecommendationRecordProjectionWriterPort,
	type IGameVectorProjectionServicePort,
	type IGameVectorProjectionWriterPort,
	type IInstancePreferenceModelServicePort,
	type IRecommendationEnginePort,
} from "$lib/modules/game-library/application";
import {
	GameRecommendationRecordReadonlyStore,
	GameRecommendationRecordWriteStore,
	GameVectorReadonlyStore,
	GameVectorWriteStore,
} from "$lib/modules/game-library/infra";
import type { IGameSessionReadonlyStorePort } from "$lib/modules/game-session/infra";
import type { IRecommendationEngineModulePort } from "./recommendation-engine.module.port";

export type RecommendationEngineModulePortDeps = {
	dbSignal: IDBDatabase;
	clock: IClockPort;
	gameSessionReadonlyStore: IGameSessionReadonlyStorePort;
};

export class RecommendationEngineModule implements IRecommendationEngineModulePort {
	readonly gameVectorProjectionService: IGameVectorProjectionServicePort;
	readonly gameVectorProjectionWriter: IGameVectorProjectionWriterPort;
	readonly gameRecommendationRecordProjectionService: IGameRecommendationRecordProjectionServicePort;
	readonly gameRecommendationRecordProjectionWriter: IGameRecommendationRecordProjectionWriterPort;
	readonly instancePreferenceModelService: IInstancePreferenceModelServicePort;
	readonly recommendationEngine: IRecommendationEnginePort;

	constructor(private readonly deps: RecommendationEngineModulePortDeps) {
		const { dbSignal, clock, gameSessionReadonlyStore } = deps;

		const gameVectorReadonlyStore = new GameVectorReadonlyStore({ dbSignal });
		const gameVectorWriteStore = new GameVectorWriteStore({ dbSignal });
		const gameRecommendationRecordReadonlyStore = new GameRecommendationRecordReadonlyStore({
			dbSignal,
		});
		const gameRecommendationRecordWriteStore = new GameRecommendationRecordWriteStore({ dbSignal });

		this.gameVectorProjectionService = new GameVectorProjectionService({
			gameVectorReadonlyStore,
		});
		this.gameVectorProjectionWriter = new GameVectorProjectionWriter({
			gameVectorWriteStore,
		});
		this.gameRecommendationRecordProjectionService = new GameRecommendationRecordProjectionService({
			gameRecommendationRecordReadonlyStore,
		});
		this.gameRecommendationRecordProjectionWriter = new GameRecommendationRecordProjectionWriter({
			gameRecommendationRecordReadonlyStore,
			gameRecommendationRecordWriteStore,
			gameVectorProjectionService: this.gameVectorProjectionService,
		});
		this.instancePreferenceModelService = new InstancePreferenceModelService({
			clock,
			gameSessionReadonlyStore,
			gameVectorProjectionService: this.gameVectorProjectionService,
		});
		this.recommendationEngine = new RecommendationEngine({
			instancePreferenceModelService: this.instancePreferenceModelService,
			gameRecommendationRecordProjectionService: this.gameRecommendationRecordProjectionService,
		});
	}

	initializeAsync: IRecommendationEngineModulePort["initializeAsync"] = async () => {
		await this.gameVectorProjectionService.initializeAsync();
		await this.instancePreferenceModelService.initializeAsync();
		await this.gameRecommendationRecordProjectionService.initializeAsync();
	};
}
