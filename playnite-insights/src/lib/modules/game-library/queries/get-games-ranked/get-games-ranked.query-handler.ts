import { normalize } from "$lib/modules/common/common";
import type { IGameVectorProjectionServicePort } from "../../application/recommendation-engine/game-vector-projection.service";
import type {
	IRecommendationEnginePort,
	RankedGame,
} from "../../application/recommendation-engine/recommendation-engine";
import type { RecommendationEngineFilter } from "../../application/recommendation-engine/recommendation-engine.types";
import type { IGameRepositoryPort } from "../../infra/game.repository.port";
import type { GetGamesRankedQuery } from "./get-games-ranked.query";
import type { IGetGamesRankedQueryHandlerPort } from "./get-games-ranked.query-handler.port";
import type { ExpandedGame } from "./get-games-ranked.query.types";

export type GetGamesRankedQueryHandlerDeps = {
	recommendationEngine: IRecommendationEnginePort;
	gameRepository: IGameRepositoryPort;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
};

export class GetGamesRankedQueryHandler implements IGetGamesRankedQueryHandlerPort {
	constructor(private readonly deps: GetGamesRankedQueryHandlerDeps) {}

	private paginate = (props: { items: RankedGame[]; cursor?: number | null; limit: number }) => {
		const { items, limit } = props;
		const cursor = props.cursor ?? 0;

		const slice = items.slice(cursor, cursor + limit);
		const nextKey = cursor + slice.length < items.length ? cursor + slice.length : null;

		return { slice, nextKey };
	};

	private buildFilters = (query: GetGamesRankedQuery) => {
		const filters: RecommendationEngineFilter[] = [];

		// filters.push(({ record }) => record.IsHidden === false);

		const search = query.filter?.search;
		if (search) {
			filters.push(({ record }) => {
				if (!record.SearchName) return false;
				return record.SearchName.startsWith(normalize(search));
			});
		}

		return filters;
	};

	executeAsync: IGetGamesRankedQueryHandlerPort["executeAsync"] = async (query) => {
		const ranked = await this.deps.recommendationEngine.recommendForInstanceAsync({
			filters: this.buildFilters(query),
		});
		const rankedMap = new Map(ranked.map((r) => [r.gameId, r.similarity]));

		const { slice, nextKey } = this.paginate({
			items: ranked,
			limit: query.limit,
			cursor: query.cursor,
		});

		const games = await this.deps.gameRepository.getByIdsAsync(slice.map((s) => s.gameId));

		const rankedGames: ExpandedGame[] = [...games.values()].map((g) => ({
			...g,
			Synergy: rankedMap.get(g.Id) ?? 0,
		}));

		return { games: rankedGames, nextKey };
	};
}
