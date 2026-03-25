import type {
	IInstancePreferenceModelInvalidationPort,
	IProjectionInvalidatorPort,
} from "$lib/modules/common/application";
import { GameVectorProjectionInputIdParser } from "$lib/modules/common/common";
import type { GameId, RecommendationEngineProjectionSource } from "$lib/modules/common/domain";
import type {
	IGameRecommendationRecordProjectionServicePort,
	IGameRecommendationRecordProjectionWriterPort,
	IGameVectorProjectionServicePort,
	IGameVectorProjectionWriterPort,
} from "$lib/modules/game-library/application";
import type { IProjectionCoordinatorPort } from "./projection-coordinator.port";
import type {
	ProjectionReconcilerContext,
	ProjectionReconcilerSnapshot,
} from "./projection-reconciler.types";

export type ProjectionReconcilerDeps = {
	gameVectorProjectionWriter: IGameVectorProjectionWriterPort;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
	instancePreferenceModelInvalidation: IInstancePreferenceModelInvalidationPort;
	gameRecommendationRecordProjectionWriter: IGameRecommendationRecordProjectionWriterPort;
	gameRecommendationRecordProjectionService: IGameRecommendationRecordProjectionServicePort;
};

const defaultContext = (): ProjectionReconcilerContext => ({
	recommendationRecordInputs: null,
	gameVectorInputs: null,
	gameSessionInputs: null,
	gameIds: new Set(),
});

export class ProjectionReconciler
	implements IProjectionInvalidatorPort, IProjectionCoordinatorPort
{
	private readonly dirtySources: Set<RecommendationEngineProjectionSource> = new Set();
	private context: ProjectionReconcilerContext = defaultContext();

	constructor(private readonly deps: ProjectionReconcilerDeps) {}

	private clearContext = () => {
		this.context = defaultContext();
	};

	private drain = (): ProjectionReconcilerSnapshot => {
		const snapshot: ProjectionReconcilerSnapshot = {
			dirtySources: new Set(this.dirtySources),
			context: {
				recommendationRecordInputs: [...(this.context.recommendationRecordInputs?.values() ?? [])],
				gameVectorInputs: [...(this.context.gameVectorInputs?.values() ?? [])],
				gameSessionInputs: [...(this.context.gameSessionInputs?.values() ?? [])],
				gameIds: [...this.context.gameIds.values()],
			},
		};

		this.dirtySources.clear();
		this.clearContext();

		return snapshot;
	};

	invalidate: IProjectionInvalidatorPort["invalidate"] = ({ source, inputs }) => {
		this.dirtySources.add(source);
		const gameIds = new Set<GameId>();

		switch (source) {
			case "games":
				if (!this.context.recommendationRecordInputs)
					this.context.recommendationRecordInputs = new Map();

				for (const input of inputs) {
					this.context.recommendationRecordInputs.set(input.gameId, input);
					gameIds.add(input.gameId);
				}

				break;
			case "gameClassifications":
				if (!this.context.gameVectorInputs) this.context.gameVectorInputs = new Map();
				if (!this.context.recommendationRecordInputs)
					this.context.recommendationRecordInputs = new Map();

				for (const input of inputs) {
					const gameId = input.gameId;
					this.context.gameVectorInputs.set(
						GameVectorProjectionInputIdParser.fromTrusted(input.gameId, input.classificationId),
						input,
					);

					if (!this.context.recommendationRecordInputs.has(gameId)) {
						this.context.recommendationRecordInputs.set(gameId, {
							gameId,
							isDeleted: input.isGameDeleted,
						});
					}

					gameIds.add(gameId);
				}

				break;
			case "gameSessions":
				if (!this.context.gameSessionInputs) this.context.gameSessionInputs = new Map();

				for (const input of inputs) {
					this.context.gameSessionInputs.set(input.sessionId, input);
					gameIds.add(input.gameId);
				}

				break;
		}

		for (const id of gameIds) {
			this.context.gameIds.add(id);
		}
	};

	reconcileAsync: IProjectionCoordinatorPort["reconcileAsync"] = async () => {
		const { context, dirtySources } = this.drain();

		if (dirtySources.size === 0) return;

		const needsGameVectors = dirtySources.has("gameClassifications");
		const needsGameRecommendationRecords =
			dirtySources.has("gameClassifications") || dirtySources.has("games");
		const needsInstancePreferences = needsGameVectors || dirtySources.has("gameSessions");

		if (needsGameVectors) {
			await this.deps.gameVectorProjectionWriter.projectAsync({
				gameVectorInputs: context.gameVectorInputs,
			});
			await this.deps.gameVectorProjectionService.rebuildForGamesAsync(context.gameIds);
		}

		if (needsGameRecommendationRecords && context.recommendationRecordInputs.length > 0) {
			await this.deps.gameRecommendationRecordProjectionWriter.projectAsync({
				recommendationRecordInputs: context.recommendationRecordInputs,
			});
		}

		if (needsGameRecommendationRecords) {
			await this.deps.gameRecommendationRecordProjectionService.rebuildForGamesAsync(
				context.gameIds,
			);
		}

		if (needsInstancePreferences) {
			this.deps.instancePreferenceModelInvalidation.invalidate();
		}
	};
}
