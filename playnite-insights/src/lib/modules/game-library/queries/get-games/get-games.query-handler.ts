import type { SortDirection } from "$lib/modules/common/domain";
import type { Game } from "../../domain/game.entity";
import type { IGameRepositoryPort } from "../../infra/game.repository.port";
import type { IGetGamesQueryHandlerFilterBuilderPort } from "./get-games.query-handler.filter-builder";
import type {
	GetGamesQueryResult,
	IGetGamesQueryHandlerPort,
} from "./get-games.query-handler.port";
import type { GameFilter, ScanSourceAsyncFn } from "./get-games.query-handler.types";

export type GetGamesQueryHandlerDeps = {
	gameRepository: IGameRepositoryPort;
	filterBuilder: IGetGamesQueryHandlerFilterBuilderPort;
};

export class GetGamesQueryHandler implements IGetGamesQueryHandlerPort {
	constructor(private readonly deps: GetGamesQueryHandlerDeps) {}

	private combineFilters = <T>(...filters: Array<(item: T) => boolean>) => {
		return (item: T) => filters.every((f) => f(item));
	};

	private scanGamesUntilLimit = async (params: {
		limit: number;
		filters: GameFilter | GameFilter[];
		scanSourceAsync: ScanSourceAsyncFn;
		direction?: SortDirection;
		cursor?: IDBValidKey | null;
	}): Promise<GetGamesQueryResult> => {
		const { limit, scanSourceAsync, direction } = params;

		const batchSize = Math.min(limit * 3, 200);
		const collected: Game[] = [];
		const filters = Array.isArray(params.filters) ? params.filters : [params.filters];
		const filter = this.combineFilters(
			this.deps.filterBuilder.createNotDeletedFilter(),
			...filters,
		);
		let cursor = params.cursor ?? null;
		let nextKey: IDBValidKey | null = null;

		while (collected.length < limit) {
			const result = await scanSourceAsync({ batchSize, cursor, direction });

			if (result.items.length === 0) break;

			for (const game of result.items) {
				if (filter(game)) {
					collected.push(game);
				}

				if (collected.length === limit) {
					nextKey = result.keys.get(game.Id) ?? null;
					break;
				}
			}

			const lastVisited = result.items.at(-1);
			cursor = lastVisited ? (result.keys.get(lastVisited.Id) ?? null) : null;

			if (!cursor) break;
		}

		return { items: collected, nextKey };
	};

	private recentScanSource: ScanSourceAsyncFn = async ({
		batchSize,
		cursor,
		direction = "desc",
	}) => {
		let range: IDBKeyRange | null = null;
		let queryDirection: IDBCursorDirection = "prev";

		if (direction === "desc") {
			if (cursor) range = IDBKeyRange.upperBound(cursor, true);
			queryDirection = "prev";
		} else {
			if (cursor) range = IDBKeyRange.lowerBound(cursor, true);
			queryDirection = "next";
		}

		const { items, keys } = await this.deps.gameRepository.queryAsync({
			index: "bySourceLastUpdatedAt",
			direction: queryDirection,
			range: range,
			limit: batchSize,
		});
		return { items, keys };
	};

	executeAsync: IGetGamesQueryHandlerPort["executeAsync"] = async (query) => {
		if (query.sort.type === "recentlyUpdated" && query.filter?.search) {
			return await this.scanGamesUntilLimit({
				limit: query.limit,
				cursor: query.cursor,
				direction: query.sort.direction,
				scanSourceAsync: this.recentScanSource,
				filters: [this.deps.filterBuilder.createNameFilter(query.filter.search)],
			});
		}

		if (query.sort.type === "recentlyUpdated") {
			return await this.scanGamesUntilLimit({
				limit: query.limit,
				cursor: query.cursor,
				direction: query.sort.direction,
				scanSourceAsync: this.recentScanSource,
				filters: [],
			});
		}

		throw new Error("Unsupported query");
	};
}
