import type { GameId } from "@playatlas/common/domain";
import type {
	GameRecommendationRecordReadModel,
	IGameRecommendationRecordReadonlyStore,
} from "../../infra/recommendation-engine/game-recommendation-record.readonly-store";

export type GameRecommendationRecordProjection = Map<GameId, GameRecommendationRecordReadModel>;

export type IGameRecommendationRecordProjectionServicePort = {
	initializeAsync: () => Promise<void>;
	getRecord: (gameId: GameId) => GameRecommendationRecordReadModel | null;
	forEach: (callback: (record: GameRecommendationRecordReadModel) => void) => void;
	invalidate: () => void;
	rebuildAsync: () => Promise<void>;
	rebuildForGamesAsync: (gameIds: GameId[]) => Promise<void>;
};

export type GameRecommendationRecordProjectionServiceDeps = {
	gameRecommendationRecordReadonlyStore: IGameRecommendationRecordReadonlyStore;
};

export class GameRecommendationRecordProjectionService implements IGameRecommendationRecordProjectionServicePort {
	private cache: GameRecommendationRecordProjection | null = null;

	constructor(private readonly deps: GameRecommendationRecordProjectionServiceDeps) {}

	private buildAsync = async (gameId?: GameId | GameId[]) => {
		let rows: GameRecommendationRecordReadModel[];

		if (gameId) {
			rows = (await this.deps.gameRecommendationRecordReadonlyStore.getByGameIdsAsync(gameId))
				.values()
				.toArray();
		} else {
			rows = await this.deps.gameRecommendationRecordReadonlyStore.getAllAsync();
		}

		return new Map(rows.map((r) => [r.GameId, r]));
	};

	initializeAsync: IGameRecommendationRecordProjectionServicePort["initializeAsync"] = async () => {
		this.cache = await this.buildAsync();
	};

	getRecord: IGameRecommendationRecordProjectionServicePort["getRecord"] = (gameId) => {
		if (!this.cache) throw new Error("Projection not initialized");
		return this.cache.get(gameId) ?? null;
	};

	forEach: IGameRecommendationRecordProjectionServicePort["forEach"] = (callback) => {
		if (!this.cache) return;

		for (const [, record] of this.cache) {
			callback(record);
		}
	};

	invalidate: IGameRecommendationRecordProjectionServicePort["invalidate"] = () =>
		(this.cache = null);

	rebuildAsync: IGameRecommendationRecordProjectionServicePort["rebuildAsync"] = async () => {
		this.cache = await this.buildAsync();
	};

	rebuildForGamesAsync: IGameRecommendationRecordProjectionServicePort["rebuildForGamesAsync"] =
		async (gameIds) => {
			if (gameIds.length === 0) return;

			const newRecords = await this.buildAsync(gameIds);

			for (const gameId of gameIds) {
				const record = newRecords.get(gameId);
				if (record) this.cache?.set(gameId, record);
			}
		};
}
