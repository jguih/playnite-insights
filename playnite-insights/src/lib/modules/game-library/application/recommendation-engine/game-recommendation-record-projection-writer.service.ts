import { RecommendationEngineVectorUtils } from "$lib/modules/common/application";
import type { GameRecommendationRecordProjectionInput } from "$lib/modules/common/common";
import type { GameId } from "$lib/modules/common/domain";
import type {
	GameRecommendationRecordReadModel,
	IGameRecommendationRecordReadonlyStore,
	IGameRecommendationRecordWriteStore,
} from "../../infra";
import type { IGameVectorProjectionServicePort } from "./game-vector-projection.service";

export type IGameRecommendationRecordProjectionWriterPort = {
	projectAsync(props: {
		recommendationRecordInputs: GameRecommendationRecordProjectionInput[];
	}): Promise<void>;
};

export type GameRecommendationRecordProjectionWriterDeps = {
	gameRecommendationRecordWriteStore: IGameRecommendationRecordWriteStore;
	gameRecommendationRecordReadonlyStore: IGameRecommendationRecordReadonlyStore;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
};

export class GameRecommendationRecordProjectionWriter implements IGameRecommendationRecordProjectionWriterPort {
	constructor(private readonly deps: GameRecommendationRecordProjectionWriterDeps) {}

	projectAsync: IGameRecommendationRecordProjectionWriterPort["projectAsync"] = async ({
		recommendationRecordInputs,
	}) => {
		if (recommendationRecordInputs.length === 0) return;

		const records = new Map<GameId, GameRecommendationRecordReadModel>();

		for (const recommendationRecordInput of recommendationRecordInputs) {
			const gameId = recommendationRecordInput.gameId;
			const vector =
				this.deps.gameVectorProjectionService.getVector(gameId) ??
				RecommendationEngineVectorUtils.createEmptyVector();
			const magnitude = this.deps.gameVectorProjectionService.getMagnitude(gameId) ?? 0;

			records.set(recommendationRecordInput.gameId, {
				GameId: gameId,
				GameMagnitude: magnitude,
				Vector: vector,
				IsDeleted: recommendationRecordInput.isDeleted,
				IsHidden: recommendationRecordInput.isHidden,
				SearchName: recommendationRecordInput.searchName,
			});
		}

		for (const [, record] of records) {
			await this.deps.gameRecommendationRecordWriteStore.upsertAsync(record);
		}
	};
}
