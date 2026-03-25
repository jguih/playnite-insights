import type {
	IProjectionInvalidatorPort,
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { IPlayAtlasClientPort } from "$lib/modules/common/application/playatlas-client.port";
import type { GameRecommendationRecordProjectionInput } from "$lib/modules/common/common";
import type { GameResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncGamesCommandHandlerPort } from "../commands/sync-games/sync-games.command-handler";
import type { IGameMapperPort } from "./game.mapper.port";

export type ISyncGamesFlowPort = ISyncFlowPort;

export type SyncGameLibraryServiceDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncGamesCommandHandler: ISyncGamesCommandHandlerPort;
	gameMapper: IGameMapperPort;
	syncRunner: ISyncRunnerPort;
	projectionInvalidator: IProjectionInvalidatorPort;
};

export class SyncGamesFlow implements ISyncGamesFlowPort {
	constructor(private readonly deps: SyncGameLibraryServiceDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<GameResponseDto>> => {
		const response = await this.deps.playAtlasClient.getGamesAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.games,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncGamesFlowPort["executeAsync"] = async () => {
		const { syncRunner, gameMapper, syncGamesCommandHandler, projectionInvalidator } = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "games",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => gameMapper.fromDto(dto, now),
			persistAsync: async ({ entities: games }) => {
				await syncGamesCommandHandler.executeAsync({ games });

				const recommendationRecordInputs: GameRecommendationRecordProjectionInput[] = games.map(
					(g) => ({
						gameId: g.Id,
						isDeleted: g.DeletedAt !== null,
						isHidden: g.Playnite?.Hidden,
						searchName: g.SearchName ?? undefined,
					}),
				);

				projectionInvalidator.invalidate({ source: "games", inputs: recommendationRecordInputs });
			},
		});
	};
}
