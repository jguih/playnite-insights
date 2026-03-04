import type {
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { IPlayAtlasClientPort } from "$lib/modules/common/application/playatlas-client.port";
import type { PlatformResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncPlatformsCommandHandlerPort } from "../commands";
import type { IPlatformMapperPort } from "./platform.mapper.port";

export type ISyncPlatformsFlowPort = ISyncFlowPort;

export type SyncPlatformsFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncPlatformsCommandHandler: ISyncPlatformsCommandHandlerPort;
	platformMapper: IPlatformMapperPort;
	syncRunner: ISyncRunnerPort;
};

export class SyncPlatformsFlow implements ISyncPlatformsFlowPort {
	constructor(private readonly deps: SyncPlatformsFlowDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<PlatformResponseDto>> => {
		const response = await this.deps.playAtlasClient.getPlatformsAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.platforms,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncPlatformsFlowPort["executeAsync"] = async () => {
		const { platformMapper, syncPlatformsCommandHandler, syncRunner } = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "platforms",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => platformMapper.fromDto(dto, now),
			persistAsync: ({ entities }) =>
				syncPlatformsCommandHandler.executeAsync({ platforms: entities }),
		});
	};
}
