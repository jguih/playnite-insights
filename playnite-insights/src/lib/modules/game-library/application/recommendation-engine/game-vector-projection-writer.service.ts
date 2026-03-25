import type { GameVectorProjectionInput } from "$lib/modules/common/common";
import type { GameId } from "$lib/modules/common/domain";
import type { ClassificationId } from "@playatlas/common/domain";
import type { IGameVectorWriteStore } from "../../infra/recommendation-engine/game-vector.write-store";

export type IGameVectorProjectionWriterPort = {
	projectAsync(props: { gameVectorInputs: GameVectorProjectionInput[] }): Promise<void>;
};

export type GameVectorProjectionWriterDeps = {
	gameVectorWriteStore: IGameVectorWriteStore;
};

export class GameVectorProjectionWriter implements IGameVectorProjectionWriterPort {
	constructor(private readonly deps: GameVectorProjectionWriterDeps) {}

	projectAsync: IGameVectorProjectionWriterPort["projectAsync"] = async ({ gameVectorInputs }) => {
		if (gameVectorInputs.length === 0) return;

		const normalizedScoresPerGame = new Map<GameId, Map<ClassificationId, number>>();
		const toDelete: GameVectorProjectionInput[] = [];

		for (const gameVectorInput of gameVectorInputs) {
			if (gameVectorInput.isGameDeleted) {
				toDelete.push(gameVectorInput);
				continue;
			}

			let normalizedScores = normalizedScoresPerGame.get(gameVectorInput.gameId);
			if (!normalizedScores) {
				normalizedScores = new Map();
				normalizedScoresPerGame.set(gameVectorInput.gameId, normalizedScores);
			}
			normalizedScores.set(gameVectorInput.classificationId, gameVectorInput.normalizedScore);
		}

		for (const [gameId, normalizedScoreMap] of normalizedScoresPerGame) {
			for (const [classificationId, normalizedScore] of normalizedScoreMap) {
				await this.deps.gameVectorWriteStore.upsertAsync({
					gameId,
					classificationId,
					normalizedScore,
				});
			}
		}

		for (const { gameId, classificationId } of toDelete) {
			await this.deps.gameVectorWriteStore.deleteAsync({
				gameId,
				classificationId,
			});
		}
	};
}
