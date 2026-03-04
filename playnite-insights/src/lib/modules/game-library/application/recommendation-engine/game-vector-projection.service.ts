import { RecommendationEngineVectorUtils } from "$lib/modules/common/application";
import { GAME_CLASSIFICATION_INDEX, type GameId } from "$lib/modules/common/domain";
import type {
	GameVectorReadModel,
	IGameVectorReadonlyStore,
} from "../../infra/recommendation-engine/game-vector.readonly-store";

type GameVectorProjectionRecord = {
	vector: Float32Array;
	magnitude: number;
};

export type GameVectorProjection = Map<GameId, GameVectorProjectionRecord>;

export type IGameVectorProjectionServicePort = {
	initializeAsync: () => Promise<void>;
	getVector: (gameId: GameId) => Float32Array | null;
	getMagnitude: (gameId: GameId) => number | null;
	forEach: (callback: (gameId: GameId, record: GameVectorProjectionRecord) => void) => void;
	invalidate: () => void;
	rebuildAsync: () => Promise<void>;
	rebuildForGamesAsync: (gameIds: GameId[]) => Promise<void>;
};

export type GameVectorProjectionServiceDeps = {
	gameVectorReadonlyStore: IGameVectorReadonlyStore;
};

export class GameVectorProjectionService implements IGameVectorProjectionServicePort {
	private cache: GameVectorProjection | null = null;

	constructor(private readonly deps: GameVectorProjectionServiceDeps) {}

	normalizeVector = (v: Float32Array) => {
		const mag = RecommendationEngineVectorUtils.magnitude(v);
		if (mag === 0) return v;
		for (let i = 0; i < v.length; i++) v[i] /= mag;
		return v;
	};

	private buildAsync = async (gameId?: GameId | GameId[]) => {
		let rows: GameVectorReadModel[];

		if (gameId) {
			rows = (await this.deps.gameVectorReadonlyStore.getByGameIdAsync(gameId))
				.values()
				.toArray()
				.flat();
		} else {
			rows = await this.deps.gameVectorReadonlyStore.getAllAsync();
		}

		const projectionMap: GameVectorProjection = new Map();
		const vectorMap = new Map<GameId, Float32Array>();

		for (const row of rows) {
			let vec = vectorMap.get(row.GameId);

			if (!vec) {
				vec = RecommendationEngineVectorUtils.createEmptyVector();
				vectorMap.set(row.GameId, vec);
			}

			const index = GAME_CLASSIFICATION_INDEX[row.ClassificationId];
			vec[index] = row.NormalizedScore;
		}

		for (const [gameId, vector] of vectorMap) {
			const magnitude = RecommendationEngineVectorUtils.magnitude(vector);

			this.normalizeVector(vector);

			projectionMap.set(gameId, { magnitude, vector });
		}

		return projectionMap;
	};

	initializeAsync: IGameVectorProjectionServicePort["initializeAsync"] = async () => {
		this.cache = await this.buildAsync();
	};

	getVector: IGameVectorProjectionServicePort["getVector"] = (gameId) => {
		if (!this.cache) throw new Error("Projection not initialized");
		return this.cache.get(gameId)?.vector ?? null;
	};

	getMagnitude: IGameVectorProjectionServicePort["getMagnitude"] = (gameId) => {
		if (!this.cache) throw new Error("Projection not initialized");
		return this.cache.get(gameId)?.magnitude ?? null;
	};

	forEach: IGameVectorProjectionServicePort["forEach"] = (callback) => {
		if (!this.cache) return;

		for (const [gameId, record] of this.cache) {
			callback(gameId, record);
		}
	};

	invalidate: IGameVectorProjectionServicePort["invalidate"] = () => (this.cache = null);

	rebuildAsync: IGameVectorProjectionServicePort["rebuildAsync"] = async () => {
		this.cache = await this.buildAsync();
	};

	rebuildForGamesAsync: IGameVectorProjectionServicePort["rebuildForGamesAsync"] = async (
		gameIds,
	) => {
		if (gameIds.length === 0) return;

		const cache: GameVectorProjection = new Map();

		const newVectors = await this.buildAsync(gameIds.values().toArray());

		for (const gameId of gameIds) {
			const newVector = newVectors.get(gameId);
			if (newVector) cache.set(gameId, newVector);
		}

		this.cache = cache;
	};
}
