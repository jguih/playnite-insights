import type { IClockPort, ILogServicePort } from "$lib/modules/common/application";
import {
	GameRecommendationRecordProjectionService,
	GameRecommendationRecordProjectionWriter,
	GameVectorProjectionService,
	GameVectorProjectionWriter,
	InstancePreferenceModelService,
} from "$lib/modules/game-library/application";
import {
	GameRecommendationRecordReadonlyStore,
	GameRecommendationRecordWriteStore,
	GameVectorReadonlyStore,
	GameVectorWriteStore,
} from "$lib/modules/game-library/infra";
import type { IGameSessionReadonlyStorePort } from "$lib/modules/game-session/infra";

type RecommendationEnginePartsDeps = {
	dbSignal: IDBDatabase;
	clock: IClockPort;
	gameSessionReadonlyStore: IGameSessionReadonlyStorePort;
	logService: ILogServicePort;
};

export class RecommendationEngineModuleCompositor {
	static buildParts = ({
		dbSignal,
		clock,
		gameSessionReadonlyStore,
		logService,
	}: RecommendationEnginePartsDeps) => {
		const gameVectorReadonlyStore = new GameVectorReadonlyStore({ dbSignal });
		const gameVectorWriteStore = new GameVectorWriteStore({ dbSignal });
		const gameRecommendationRecordReadonlyStore = new GameRecommendationRecordReadonlyStore({
			dbSignal,
		});
		const gameRecommendationRecordWriteStore = new GameRecommendationRecordWriteStore({ dbSignal });

		const gameVectorProjectionService = new GameVectorProjectionService({
			gameVectorReadonlyStore,
		});
		const gameVectorProjectionWriter = new GameVectorProjectionWriter({
			gameVectorWriteStore,
		});
		const gameRecommendationRecordProjectionService = new GameRecommendationRecordProjectionService(
			{
				gameRecommendationRecordReadonlyStore,
			},
		);
		const gameRecommendationRecordProjectionWriter = new GameRecommendationRecordProjectionWriter({
			gameRecommendationRecordReadonlyStore,
			gameRecommendationRecordWriteStore,
			gameVectorProjectionService: gameVectorProjectionService,
		});

		const instancePreferenceModelService = new InstancePreferenceModelService({
			clock,
			gameSessionReadonlyStore,
			gameVectorProjectionService,
			logService,
		});

		return {
			gameVectorReadonlyStore,
			gameVectorWriteStore,
			gameRecommendationRecordReadonlyStore,
			gameRecommendationRecordWriteStore,
			gameVectorProjectionService,
			gameVectorProjectionWriter,
			gameRecommendationRecordProjectionService,
			gameRecommendationRecordProjectionWriter,
			instancePreferenceModelService,
			instancePreferenceModelInvalidation: instancePreferenceModelService,
		};
	};
}
