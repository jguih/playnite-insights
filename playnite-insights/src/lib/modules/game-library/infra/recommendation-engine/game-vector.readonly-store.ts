import type { GameId } from "$lib/modules/common/domain";
import { IndexedDbRepository, type IndexedDbRepositoryDeps } from "$lib/modules/common/infra";
import { type ClassificationId } from "@playatlas/common/domain";
import { gameVectorStoreMeta } from "./game-vector.store.schema";

export type GameVectorReadModel = Readonly<{
	GameId: GameId;
	ClassificationId: ClassificationId;
	NormalizedScore: number;
}>;

export type IGameVectorReadonlyStore = {
	getAllAsync: () => Promise<GameVectorReadModel[]>;
	getByGameIdAsync: (gameId: GameId | GameId[]) => Promise<Map<GameId, GameVectorReadModel[]>>;
};

export type GameVectorReadonlyStoreDeps = IndexedDbRepositoryDeps;

export class GameVectorReadonlyStore
	extends IndexedDbRepository
	implements IGameVectorReadonlyStore
{
	private readonly meta = gameVectorStoreMeta;

	constructor(private readonly deps: GameVectorReadonlyStoreDeps) {
		super(deps);
	}

	getAllAsync: IGameVectorReadonlyStore["getAllAsync"] = async () => {
		return await this.runTransaction([this.meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(this.meta.storeName);
			const models = await this.runRequest<GameVectorReadModel[]>(store.getAll());
			return models;
		});
	};

	getByGameIdAsync: IGameVectorReadonlyStore["getByGameIdAsync"] = async (gameId) => {
		const gameIds = Array.isArray(gameId) ? gameId : [gameId];
		const classificationsMap = new Map<GameId, GameVectorReadModel[]>();

		return await this.runTransaction([this.meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(this.meta.storeName);

			const models = await this.runRequest<GameVectorReadModel[]>(store.getAll());

			for (const model of models) {
				if (gameIds.includes(model.GameId)) {
					let vectors = classificationsMap.get(model.GameId);
					if (!vectors) {
						vectors = [];
						classificationsMap.set(model.GameId, vectors);
					}
					vectors.push(model);
				}
			}

			return classificationsMap;
		});
	};
}
