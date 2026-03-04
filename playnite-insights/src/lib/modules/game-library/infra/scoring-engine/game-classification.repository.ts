import type { SyncStatus } from "$lib/modules/common/common";
import type { GameClassificationId, GameId } from "$lib/modules/common/domain";
import { ClientEntityRepository } from "$lib/modules/common/infra";
import {
	CLASSIFICATION_IDS,
	type ClassificationId,
	type EngineScoreMode,
} from "@playatlas/common/domain";
import type { IGameClassificationMapperPort } from "../../application/scoring-engine/game-classification.mapper.port";
import type { EvidenceGroupMeta } from "../../domain/scoring-engine/evidence-group-meta.record";
import type {
	GameClassification,
	GameClassificationBreakdown,
} from "../../domain/scoring-engine/game-classification.entity";
import type { IGameClassificationRepositoryPort } from "./game-classification.repository.port";
import { gameClassificationRepositoryMeta } from "./game-classification.repository.schema";

export type GameClassificationModel = {
	Id: GameClassificationId;
	SourceLastUpdatedAt: Date;
	SourceLastUpdatedAtMs: number;
	DeletedAt?: Date | null;
	DeleteAfter?: Date | null;
	GameId: GameId;
	ClassificationId: ClassificationId;
	Score: number;
	NormalizedScore: number;
	ScoreMode: EngineScoreMode;
	Breakdown: GameClassificationBreakdown;
	EvidenceGroupMeta?: EvidenceGroupMeta | null;

	Sync: {
		Status: SyncStatus;
		ErrorMessage?: string | null;
		LastSyncedAt: Date;
	};
};

export type GameClassificationRepositoryDeps = {
	dbSignal: IDBDatabase;
	gameClassificationMapper: IGameClassificationMapperPort;
};

export class GameClassificationRepository
	extends ClientEntityRepository<GameClassificationId, GameClassification, GameClassificationModel>
	implements IGameClassificationRepositoryPort
{
	constructor({ dbSignal, gameClassificationMapper }: GameClassificationRepositoryDeps) {
		super({
			dbSignal,
			storeName: gameClassificationRepositoryMeta.storeName,
			mapper: gameClassificationMapper,
			shouldIgnore: (entity) => !CLASSIFICATION_IDS.includes(entity.ClassificationId),
		});
	}

	override syncAsync: IGameClassificationRepositoryPort["syncAsync"] = async (entity) => {
		const entities = Array.isArray(entity) ? entity : [entity];
		if (entities.length === 0) return;

		await this.runTransaction([this.storeName], "readwrite", async ({ tx }) => {
			const store = tx.objectStore(this.storeName);

			const existingRecords = await this.runRequest<GameClassificationModel[]>(store.getAll());
			const existingRecordsMap = new Map(existingRecords.map((r) => [r.GameId, r]));

			for (const entity of entities) {
				const existing = existingRecordsMap.get(entity.GameId);

				if (existing && existing.ClassificationId === entity.ClassificationId) {
					await this.runRequest(store.delete(existing.Id));
				}

				const model = this.mapper.toPersistence(entity);
				await this.runRequest(store.put(model));
			}
		});
	};

	getByGameIdAsync: IGameClassificationRepositoryPort["getByGameIdAsync"] = async (gameId) => {
		return await this.runTransaction([this.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(this.storeName);
			const idx = store.index(gameClassificationRepositoryMeta.index.BY_GAME_ID);
			const gameClassifications = new Map<ClassificationId, Set<GameClassification>>();
			const context = {
				found: false,
			};

			const range = IDBKeyRange.bound([gameId, -Infinity, -Infinity], [gameId, Infinity, Infinity]);

			return await new Promise<Map<ClassificationId, Set<GameClassification>>>(
				(resolve, reject) => {
					const request = idx.openCursor(range, "next");

					request.onerror = () => reject(request.error);

					request.onsuccess = () => {
						const cursor = request.result;

						if (!cursor) {
							resolve(gameClassifications);
							return;
						}

						const gameClassificationModel: GameClassificationModel = cursor.value;
						const gameClassification = this.mapper.toDomain(gameClassificationModel);

						if (gameClassification.GameId === gameId) {
							context.found = true;

							if (this.shouldIgnore?.(gameClassification)) {
								cursor.continue();
								return;
							}

							let classifications = gameClassifications.get(gameClassification.ClassificationId);

							if (!classifications) {
								classifications = new Set();
								gameClassifications.set(gameClassification.ClassificationId, classifications);
							}

							classifications.add(gameClassification);
						} else if (context.found) {
							resolve(gameClassifications);
							return;
						}

						cursor.continue();
					};
				},
			);
		});
	};

	getLatestByGameIdAsync: IGameClassificationRepositoryPort["getLatestByGameIdAsync"] = async (
		gameId,
	) => {
		return await this.runTransaction([this.storeName], "readonly", async ({ tx }) => {
			const store = tx.objectStore(this.storeName);
			const idx = store.index(gameClassificationRepositoryMeta.index.BY_GAME_ID);
			const gameClassifications = new Map<ClassificationId, GameClassification>();
			const context = {
				found: false,
			};

			const range = IDBKeyRange.bound([gameId, -Infinity, -Infinity], [gameId, Infinity, Infinity]);

			return await new Promise<Map<ClassificationId, GameClassification>>((resolve, reject) => {
				const request = idx.openCursor(range, "prev");

				request.onerror = () => reject(request.error);

				request.onsuccess = () => {
					const cursor = request.result;

					if (!cursor) {
						resolve(gameClassifications);
						return;
					}

					const gameClassificationModel: GameClassificationModel = cursor.value;
					const gameClassification = this.mapper.toDomain(gameClassificationModel);

					if (gameClassification.GameId === gameId) {
						context.found = true;

						if (this.shouldIgnore?.(gameClassification)) {
							cursor.continue();
							return;
						}

						if (!gameClassifications.has(gameClassification.ClassificationId)) {
							gameClassifications.set(gameClassification.ClassificationId, gameClassification);
						}
					} else if (context.found) {
						resolve(gameClassifications);
						return;
					}

					cursor.continue();
				};
			});
		});
	};
}
