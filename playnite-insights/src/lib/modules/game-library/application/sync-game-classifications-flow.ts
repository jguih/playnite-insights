import type {
	IPlayAtlasClientPort,
	IProjectionInvalidatorPort,
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { GameVectorProjectionInput } from "$lib/modules/common/common";
import type { GameClassificationResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncGameClassificationsCommandHandlerPort } from "../commands/sync-game-classifications/sync-game-classifications.command-handler";
import type { IGameClassificationMapperPort } from "./scoring-engine/game-classification.mapper.port";

export type ISyncGameClassificationsFlowPort = ISyncFlowPort;

export type SyncGameClassificationsFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncGameClassificationsCommandHandler: ISyncGameClassificationsCommandHandlerPort;
	gameClassificationMapper: IGameClassificationMapperPort;
	syncRunner: ISyncRunnerPort;
	projectionInvalidator: IProjectionInvalidatorPort;
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
			projectionInvalidator,
		} = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "gameClassifications",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => gameClassificationMapper.fromDto(dto, now),
			persistAsync: async ({ entities: gameClassifications }) => {
				await syncGameClassificationsCommandHandler.executeAsync({ gameClassifications });

				const projectionInputs: GameVectorProjectionInput[] = gameClassifications.map((gc) => ({
					gameId: gc.GameId,
					classificationId: gc.ClassificationId,
					normalizedScore: gc.NormalizedScore,
				}));

				projectionInvalidator.invalidate({
					source: "gameClassifications",
					inputs: projectionInputs,
				});
			},
		});
	};
}
