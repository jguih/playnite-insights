import type {
	ISyncFlowPort,
	ISyncRunnerPort,
	SyncRunnerFetchResult,
} from "$lib/modules/common/application";
import type { IPlayAtlasClientPort } from "$lib/modules/common/application/playatlas-client.port";
import type { GenreResponseDto } from "@playatlas/game-library/dtos";
import type { ISyncGenresCommandHandlerPort } from "../commands";
import type { IGenreMapperPort } from "./genre.mapper.port";

export type ISyncGenresFlowPort = ISyncFlowPort;

export type SyncGenresFlowDeps = {
	playAtlasClient: IPlayAtlasClientPort;
	syncGenresCommandHandler: ISyncGenresCommandHandlerPort;
	genreMapper: IGenreMapperPort;
	syncRunner: ISyncRunnerPort;
};

export class SyncGenresFlow implements ISyncGenresFlowPort {
	constructor(private readonly deps: SyncGenresFlowDeps) {}

	private fetchAsync = async ({
		lastCursor,
	}: {
		lastCursor: string | null;
	}): Promise<SyncRunnerFetchResult<GenreResponseDto>> => {
		const response = await this.deps.playAtlasClient.getGenresAsync({
			lastCursor,
		});

		if (!response.success) return { success: false };

		return {
			success: true,
			items: response.genres,
			nextCursor: response.nextCursor,
		};
	};

	executeAsync: ISyncGenresFlowPort["executeAsync"] = async () => {
		const { syncRunner, genreMapper, syncGenresCommandHandler } = this.deps;

		return await syncRunner.runAsync({
			syncTarget: "genres",
			fetchAsync: this.fetchAsync,
			mapDtoToEntity: ({ dto, now }) => genreMapper.fromDto(dto, now),
			persistAsync: ({ entities }) => syncGenresCommandHandler.executeAsync({ genres: entities }),
		});
	};
}
