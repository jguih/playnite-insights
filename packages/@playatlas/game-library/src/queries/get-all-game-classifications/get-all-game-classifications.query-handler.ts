import type { ILogServicePort, IQueryHandlerPort } from "@playatlas/common/application";
import { computeNextSyncCursor, type IClockPort } from "@playatlas/common/infra";
import type { IGameClassificationMapperPort } from "../../application/scoring-engine/game-classification.mapper";
import type { IGameClassificationRepositoryPort } from "../../infra/scoring-engine/game-classification.repository";
import type { GameClassificationRepositoryFilters } from "../../infra/scoring-engine/game-classification.repository.types";
import type { GetAllGameClassificationsQuery } from "./get-all-game-classifications.query";
import type { GetAllGameClassificationsQueryResult } from "./get-all-game-classifications.query.types";

export type IGetAllGameClassificationsQueryHandlerPort = IQueryHandlerPort<
	GetAllGameClassificationsQuery,
	GetAllGameClassificationsQueryResult
>;

export type GetAllGameClassificationsQueryHandlerDeps = {
	gameClassificationRepository: IGameClassificationRepositoryPort;
	gameClassificationMapper: IGameClassificationMapperPort;
	logService: ILogServicePort;
	clock: IClockPort;
};

export const makeGetAllGameClassificationsQueryHandler = ({
	gameClassificationRepository,
	gameClassificationMapper,
	clock,
	logService,
}: GetAllGameClassificationsQueryHandlerDeps): IGetAllGameClassificationsQueryHandlerPort => {
	return {
		execute: ({ lastCursor } = {}) => {
			const filters: GameClassificationRepositoryFilters | undefined = lastCursor
				? {
						syncCursor: lastCursor,
					}
				: undefined;

			const gameClassifications = gameClassificationRepository
				.getLatestByGame(filters)
				.values()
				.toArray()
				.map((gc) => gc.values().toArray())
				.flat();

			if (lastCursor) {
				const elapsedMs = clock.now().getTime() - lastCursor.lastUpdatedAt.getTime();
				const elapsedSeconds = Math.floor(elapsedMs / 1000);
				logService.debug(
					`Found ${gameClassifications.length} gameClassifications (updated since last sync: ${elapsedSeconds}s ago)`,
				);
			} else {
				logService.debug(`Found ${gameClassifications.length} gameClassifications (no filters)`);
			}

			const gameClassificationsDtos = gameClassificationMapper.toDtoList(gameClassifications);
			const nextCursor = computeNextSyncCursor(gameClassifications, lastCursor);

			return { data: gameClassificationsDtos, nextCursor };
		},
	};
};
