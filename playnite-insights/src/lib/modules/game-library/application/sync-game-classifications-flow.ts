import type {
	IInstancePreferenceModelInvalidationPort,
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { IPlayAtlasClientPort } from "$lib/modules/common/application/playatlas-client.port";
import type { GameClassificationResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncGameClassificationsCommandHandlerPort } from "../commands/sync-game-classifications/sync-game-classifications.command-handler";
import type {
	IGameRecommendationRecordProjectionServicePort,
	IGameRecommendationRecordProjectionWriterPort,
	IGameVectorProjectionServicePort,
} from "./recommendation-engine";
import type { IGameVectorProjectionWriterPort } from "./recommendation-engine/game-vector-projection-writer.service";
import type { IGameClassificationMapperPort } from "./scoring-engine/game-classification.mapper.port";

export type ISyncGameClassificationsFlowPort = ISyncFlowPort;

export type SyncGameClassificationsFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncGameClassificationsCommandHandler: ISyncGameClassificationsCommandHandlerPort;
	gameClassificationMapper: IGameClassificationMapperPort;
	syncRunner: ISyncRunnerPort;
	gameVectorProjectionWriter: IGameVectorProjectionWriterPort;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
	instancePreferenceModelInvalidation: IInstancePreferenceModelInvalidationPort;
	gameRecommendationRecordProjectionWriter: IGameRecommendationRecordProjectionWriterPort;
	gameRecommendationRecordProjectionService: IGameRecommendationRecordProjectionServicePort;
};

export class SyncGameClassificationsFlow implements ISyncGameClassificationsFlowPort {
	constructor(private readonly deps: SyncGameClassificationsFlowDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<GameClassificationResponseDto>> => {
		const response = await this.deps.playAtlasClient.getGameClassificationsAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.gameClassifications,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncGameClassificationsFlowPort["executeAsync"] = async () => {
		const {
			syncRunner,
			gameClassificationMapper,
			syncGameClassificationsCommandHandler,
			gameVectorProjectionWriter,
			gameVectorProjectionService,
			instancePreferenceModelInvalidation,
			gameRecommendationRecordProjectionService,
			gameRecommendationRecordProjectionWriter,
		} = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "gameClassifications",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => gameClassificationMapper.fromDto(dto, now),
			persistAsync: async ({ entities: gameClassifications }) => {
				await syncGameClassificationsCommandHandler.executeAsync({ gameClassifications });

				const gameIds = new Set(gameClassifications.map((gc) => gc.GameId)).values().toArray();

				await gameVectorProjectionWriter.projectAsync({ gameClassifications });
				await gameVectorProjectionService.rebuildForGamesAsync(gameIds);

				instancePreferenceModelInvalidation.invalidate();

				await gameRecommendationRecordProjectionWriter.projectFromGameClassificationAsync({
					gameClassifications,
				});
				await gameRecommendationRecordProjectionService.rebuildForGamesAsync(gameIds);
			},
		});
	};
}
