import { type ClientRepositoryMeta, type IIndexedDbSchema } from "$lib/modules/common/infra";
import type { GameClassificationModel } from "./game-classification.repository";

export const gameClassificationRepositoryMeta = {
	storeName: "game-classification",
	index: {
		BY_SOURCE_LAST_UPDATED_AT: "bySourceLastUpdatedAt",
		BY_GAME_ID: "byGameId",
		BY_CLASSIFICATION_ID: "byClassificationId",
	},
} as const satisfies ClientRepositoryMeta<string, string>;

export type GameClassificationRepositoryIndex =
	(typeof gameClassificationRepositoryMeta.index)[keyof typeof gameClassificationRepositoryMeta.index];

const createIndex = (
	store: IDBObjectStore,
	name: GameClassificationRepositoryIndex,
	keyPath: (keyof GameClassificationModel)[] | keyof GameClassificationModel,
	options?: IDBIndexParameters,
) => store.createIndex(name, keyPath, options);

export const gameClassificationRepositorySchema: IIndexedDbSchema = {
	define: ({ db }) => {
		const { storeName, index } = gameClassificationRepositoryMeta;

		if (!db.objectStoreNames.contains(storeName)) {
			const store = db.createObjectStore(storeName, {
				keyPath: "Id" satisfies keyof GameClassificationModel,
			});
			createIndex(store, index.BY_SOURCE_LAST_UPDATED_AT, ["SourceLastUpdatedAtMs", "Id"]);
			createIndex(store, index.BY_GAME_ID, ["GameId", "SourceLastUpdatedAtMs", "Id"]);
			createIndex(store, index.BY_CLASSIFICATION_ID, [
				"ClassificationId",
				"SourceLastUpdatedAtMs",
				"Id",
			]);
		}
	},
};
