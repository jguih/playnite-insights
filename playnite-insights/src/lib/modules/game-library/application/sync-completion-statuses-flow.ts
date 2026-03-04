import type {
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { IPlayAtlasClientPort } from "$lib/modules/common/application/playatlas-client.port";
import type { CompletionStatusResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncCompletionStatusesCommandHandlerPort } from "../commands";
import type { ICompletionStatusMapperPort } from "./completion-status.mapper.port";

export type ISyncCompletionStatusesFlowPort = ISyncFlowPort;

export type SyncCompletionStatusesFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncCompletionStatusesCommandHandler: ISyncCompletionStatusesCommandHandlerPort;
	completionStatusMapper: ICompletionStatusMapperPort;
	syncRunner: ISyncRunnerPort;
};

export class SyncCompletionStatusesFlow implements ISyncCompletionStatusesFlowPort {
	constructor(private readonly deps: SyncCompletionStatusesFlowDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<CompletionStatusResponseDto>> => {
		const response = await this.deps.playAtlasClient.getCompletionStatusesAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.completionStatuses,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncCompletionStatusesFlowPort["executeAsync"] = async () => {
		const { completionStatusMapper, syncCompletionStatusesCommandHandler, syncRunner } = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "completionStatuses",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => completionStatusMapper.fromDto(dto, now),
			persistAsync: ({ entities }) =>
				syncCompletionStatusesCommandHandler.executeAsync({ completionStatuses: entities }),
		});
	};
}
