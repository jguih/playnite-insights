import type { GameId } from "$lib/modules/common/domain";
import { IndexedDbRepository, type IndexedDbRepositoryDeps } from "$lib/modules/common/infra";
import type { GameSessionReadModel } from "../application/game-session.read-model";
import { gameSessionStoreMeta } from "./game-session.store.schema";

export type IGameSessionReadonlyStorePort = {
	getAllAsync: () => Promise<GameSessionReadModel[]>;
	getByGameIdAsync: (gameId: GameId) => Promise<GameSessionReadModel | null>;
};

export type GameSessionReadonlyStoreDeps = IndexedDbRepositoryDeps;

export class GameSessionReadonlyStore
	extends IndexedDbRepository
	implements IGameSessionReadonlyStorePort
{
	private readonly meta = gameSessionStoreMeta;

	constructor(private readonly deps: GameSessionReadonlyStoreDeps) {
		super(deps);
	}

	getAllAsync: IGameSessionReadonlyStorePort["getAllAsync"] = async () => {
		return await this.runTransaction([this.meta.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(this.meta.storeName);
			const models = await this.runRequest<GameSessionReadModel[]>(store.getAll());
			return models;
		});
	};

	getByGameIdAsync: IGameSessionReadonlyStorePort["getByGameIdAsync"] = () => {
		throw new Error("Not Implemented");
	};
}
