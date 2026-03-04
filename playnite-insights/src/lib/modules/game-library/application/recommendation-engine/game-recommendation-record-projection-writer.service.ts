import { RecommendationEngineVectorUtils } from "$lib/modules/common/application";
import type { Game } from "../../domain/game.entity";
import type { GameClassification } from "../../domain/scoring-engine/game-classification.entity";
import type {
	IGameRecommendationRecordReadonlyStore,
	IGameRecommendationRecordWriteStore,
} from "../../infra";
import type { IGameVectorProjectionServicePort } from "./game-vector-projection.service";

export type IGameRecommendationRecordProjectionWriterPort = {
	projectFromGameClassificationAsync: (props: {
		gameClassifications: GameClassification[];
	}) => Promise<void>;
	projectFromGameAsync: (props: { games: Game[] }) => Promise<void>;
};

export type GameRecommendationRecordProjectionWriterDeps = {
	gameRecommendationRecordWriteStore: IGameRecommendationRecordWriteStore;
	gameRecommendationRecordReadonlyStore: IGameRecommendationRecordReadonlyStore;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
};

export class GameRecommendationRecordProjectionWriter implements IGameRecommendationRecordProjectionWriterPort {
	constructor(private readonly deps: GameRecommendationRecordProjectionWriterDeps) {}

	projectFromGameClassificationAsync: IGameRecommendationRecordProjectionWriterPort["projectFromGameClassificationAsync"] =
		async ({ gameClassifications }) => {
			const gameIds = new Set(gameClassifications.map((gc) => gc.GameId));

			for (const gameId of gameIds) {
				const record =
					await this.deps.gameRecommendationRecordReadonlyStore.getByGameIdAsync(gameId);
				const vector = this.deps.gameVectorProjectionService.getVector(gameId);
				const magnitude = this.deps.gameVectorProjectionService.getMagnitude(gameId) ?? 0;

				if (vector && record)
					await this.deps.gameRecommendationRecordWriteStore.upsertAsync({
						...record,
						Vector: vector,
						GameMagnitude: magnitude,
					});
				else if (vector) {
					await this.deps.gameRecommendationRecordWriteStore.upsertAsync({
						GameId: gameId,
						Vector: vector,
						GameMagnitude: magnitude,
					});
				}
			}
		};

	projectFromGameAsync: IGameRecommendationRecordProjectionWriterPort["projectFromGameAsync"] =
		async ({ games }) => {
			const gamesMap = new Map(games.map((g) => [g.Id, g]));

			for (const [gameId, game] of gamesMap) {
				const record =
					await this.deps.gameRecommendationRecordReadonlyStore.getByGameIdAsync(gameId);
				const vector = this.deps.gameVectorProjectionService.getVector(gameId);
				const magnitude = this.deps.gameVectorProjectionService.getMagnitude(gameId) ?? 0;

				if (record)
					await this.deps.gameRecommendationRecordWriteStore.upsertAsync({
						...record,
						Vector: vector ?? RecommendationEngineVectorUtils.createEmptyVector(),
						GameMagnitude: magnitude,
						IsHidden: game.Playnite?.Hidden,
						SearchName: game.SearchName ?? undefined,
					});
				else {
					await this.deps.gameRecommendationRecordWriteStore.upsertAsync({
						GameId: gameId,
						Vector: vector ?? RecommendationEngineVectorUtils.createEmptyVector(),
						GameMagnitude: magnitude,
						IsHidden: game.Playnite?.Hidden,
						SearchName: game.SearchName ?? undefined,
					});
				}
			}
		};
}
