import type {
	IPlayAtlasClientPort,
	IProjectionInvalidatorPort,
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { GameSessionInput } from "$lib/modules/common/common";
import type { GameSessionResponseDto } from "@playatlas/game-session/dtos";
import type { IGameSessionWriteStorePort } from "../infra/game-session.write-store";
import type { IGameSessionReadModelMapperPort } from "./game-session.read-model";

export type ISyncGameSessionsFlowPort = ISyncFlowPort;

export type SyncGameSessionsFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	gameSessionsWriteStore: IGameSessionWriteStorePort;
	gameSessionMapper: IGameSessionReadModelMapperPort;
	syncRunner: ISyncRunnerPort;
	projectionInvalidator: IProjectionInvalidatorPort;
};

export class SyncGameSessionsFlow implements ISyncGameSessionsFlowPort {
	constructor(private readonly deps: SyncGameSessionsFlowDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<GameSessionResponseDto>> => {
		const response = await this.deps.playAtlasClient.getGameSessionsAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.gameSessions,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncGameSessionsFlowPort["executeAsync"] = async () => {
		const { syncRunner, gameSessionMapper, gameSessionsWriteStore, projectionInvalidator } =
			this.deps;

		return await syncRunner.runAsync({
			syncTarget: "gameSessions",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => gameSessionMapper.fromDto(dto, now),
			persistAsync: async ({ entities: gameSessions }) => {
				await gameSessionsWriteStore.upsertAsync({ gameSessionDto: gameSessions });

				const sessionInputs: GameSessionInput[] = gameSessions.map((s) => ({
					gameId: s.GameId,
					sessionId: s.Id,
				}));

				projectionInvalidator.invalidate({ source: "gameSessions", inputs: sessionInputs });
			},
		});
	};
}
