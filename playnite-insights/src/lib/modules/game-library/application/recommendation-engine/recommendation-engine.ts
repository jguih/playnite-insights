import type { GameId } from "$lib/modules/common/domain";
import type { IGameRecommendationRecordProjectionServicePort } from "./game-recommendation-record-projection.service";
import type { IInstancePreferenceModelServicePort } from "./instance-preference-model.service";
import type {
	RecommendationEngineFilter,
	RecommendationEngineFilterProps,
} from "./recommendation-engine.types";

export type RankedGame = {
	gameId: GameId;
	similarity: number;
	searchName?: string;
};

export type IRecommendationEnginePort = {
	recommendForInstanceAsync(props?: {
		filters?: RecommendationEngineFilter[];
	}): Promise<RankedGame[]>;
};

export type RecommendationEngineDeps = {
	instancePreferenceModelService: IInstancePreferenceModelServicePort;
	gameRecommendationRecordProjectionService: IGameRecommendationRecordProjectionServicePort;
};

export class RecommendationEngine implements IRecommendationEnginePort {
	constructor(private readonly deps: RecommendationEngineDeps) {}

	private combineFilters = (...filters: Array<RecommendationEngineFilter>) => {
		return (props: RecommendationEngineFilterProps) => filters.every((f) => f(props));
	};

	private cosine = (a: Float32Array, b: Float32Array) => {
		let dot = 0;

		for (let i = 0; i < a.length; i++) {
			dot += a[i] * b[i];
		}

		return dot;
	};

	private recommendForVectorAsync = (props: {
		vector: Float32Array;
		filters?: RecommendationEngineFilter[];
	}): RankedGame[] => {
		const { filters, vector } = props;
		const applyFilters = this.combineFilters(...(filters ?? []));
		const results: RankedGame[] = [];

		this.deps.gameRecommendationRecordProjectionService.forEach((record) => {
			if (!applyFilters({ record })) return;
			if (record.Vector.length !== vector.length) return;
			if (record.GameMagnitude === 0) return;

			const sim = this.cosine(vector, record.Vector) * record.GameMagnitude;

			results.push({
				gameId: record.GameId,
				similarity: sim,
				searchName: record.SearchName,
			});
		});

		results.sort((a, b) => {
			const diff = b.similarity - a.similarity;
			if (diff !== 0) return diff;
			return a.gameId.localeCompare(b.gameId);
		});

		return results;
	};

	recommendForInstanceAsync: IRecommendationEnginePort["recommendForInstanceAsync"] = async (
		props = {},
	) => {
		const instanceVector = this.deps.instancePreferenceModelService.getVector();
		return this.recommendForVectorAsync({ vector: instanceVector, filters: props.filters });
	};
}
