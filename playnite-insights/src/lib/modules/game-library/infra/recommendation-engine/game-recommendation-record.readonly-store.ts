import type { GameId } from "$lib/modules/common/domain";
import { IndexedDbRepository, type IndexedDbRepositoryDeps } from "$lib/modules/common/infra";
import { gameRecommendationRecordStoreMeta as meta } from "./game-recommendation-record.schema";

export type GameRecommendationRecordReadModel = Readonly<{
	GameId: GameId;
	Vector: Float32Array;
	GameMagnitude: number;
	IsHidden?: boolean;
	SearchName?: string;
}>;

export type IGameRecommendationRecordReadonlyStore = {
	getAllAsync: () => Promise<GameRecommendationRecordReadModel[]>;
	getByGameIdAsync: (gameId: GameId) => Promise<GameRecommendationRecordReadModel | null>;
	getByGameIdsAsync: (
		gameId: GameId | GameId[],
	) => Promise<Map<GameId, GameRecommendationRecordReadModel>>;
};

export type GameRecommendationRecordReadonlyStoreDeps = IndexedDbRepositoryDeps;

export class GameRecommendationRecordReadonlyStore
	extends IndexedDbRepository
	implements IGameRecommendationRecordReadonlyStore
{
	constructor(private readonly deps: GameRecommendationRecordReadonlyStoreDeps) {
		super(deps);
	}

	getAllAsync: IGameRecommendationRecordReadonlyStore["getAllAsync"] = async () => {
		return await this.runTransaction([meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(meta.storeName);
			const models = await this.runRequest<GameRecommendationRecordReadModel[]>(store.getAll());
			return models;
		});
	};

	getByGameIdAsync: IGameRecommendationRecordReadonlyStore["getByGameIdAsync"] = async (gameId) => {
		return await this.runTransaction([meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(meta.storeName);
			const model = await this.runRequest<GameRecommendationRecordReadModel | undefined>(
				store.get([gameId]),
			);
			return model ?? null;
		});
	};

	getByGameIdsAsync: IGameRecommendationRecordReadonlyStore["getByGameIdsAsync"] = async (
		gameId,
	) => {
		const gameIds = Array.isArray(gameId) ? gameId : [gameId];

		return await this.runTransaction([meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(meta.storeName);

			const models: GameRecommendationRecordReadModel[] = [];

			for (const gameId of gameIds) {
				const model = await this.runRequest<GameRecommendationRecordReadModel | undefined>(
					store.get([gameId]),
				);
				if (model) models.push(model);
			}

			const records = new Map<GameId, GameRecommendationRecordReadModel>(
				models.map((m) => [m.GameId, m]),
			);

			return records;
		});
	};
}
