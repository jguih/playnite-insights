import type { IClockPort } from "$lib/modules/common/application";
import type { IInstancePreferenceModelInvalidationPort } from "$lib/modules/common/application/recommendation-engine/instance-preference-invalidation.port";
import { GAME_CLASSIFICATION_DIMENSIONS } from "$lib/modules/common/domain";
import type { GameSessionReadModel } from "$lib/modules/game-session/application";
import type { IGameSessionReadonlyStorePort } from "$lib/modules/game-session/infra";
import type { IGameVectorProjectionServicePort } from "./game-vector-projection.service";

export type IInstancePreferenceModelServicePort = IInstancePreferenceModelInvalidationPort & {
	initializeAsync: () => Promise<void>;
	getVector: () => Float32Array;
	rebuildAsync: () => Promise<void>;
};

export type InstancePreferenceModelServiceDeps = {
	gameSessionReadonlyStore: IGameSessionReadonlyStorePort;
	gameVectorProjectionService: IGameVectorProjectionServicePort;
	clock: IClockPort;
};

export class InstancePreferenceModelService implements IInstancePreferenceModelServicePort {
	private readonly lambda: number = 0.05;
	private readonly ONE_DAY_MS: number = 1000 * 60 * 60 * 24;
	private cache: Float32Array | null = null;

	constructor(private readonly deps: InstancePreferenceModelServiceDeps) {}

	private sessionWeight = (session: GameSessionReadModel, now: number): number => {
		if (!session.Duration) return 0;

		const days = (now - session.EndTime!.getTime()) / this.ONE_DAY_MS;

		const decay = Math.exp(-this.lambda * days);

		return session.Duration * decay;
	};

	private normalize = (v: Float32Array) => {
		let sum = 0;

		for (let i = 0; i < v.length; i++) {
			sum += v[i] * v[i];
		}

		const mag = Math.sqrt(sum);
		if (mag === 0) return;

		for (let i = 0; i < v.length; i++) {
			v[i] /= mag;
		}
	};

	private buildAsync = async () => {
		const instance = new Float32Array(GAME_CLASSIFICATION_DIMENSIONS);
		const now = this.deps.clock.now();
		const sessions = await this.deps.gameSessionReadonlyStore.getAllAsync();

		for (const session of sessions) {
			if (!session.EndTime) continue;

			const vec = this.deps.gameVectorProjectionService.getVector(session.GameId);
			if (!vec) continue;

			const w = this.sessionWeight(session, now.getTime());
			if (w === 0) continue;

			for (let i = 0; i < GAME_CLASSIFICATION_DIMENSIONS; i++) {
				instance[i] += vec[i] * w;
			}
		}

		this.normalize(instance);

		return instance;
	};

	initializeAsync: IInstancePreferenceModelServicePort["initializeAsync"] = async () => {
		this.cache = await this.buildAsync();
	};

	getVector: IInstancePreferenceModelServicePort["getVector"] = () => {
		if (!this.cache)
			throw new Error(
				"InstancePreferenceModelService not initialized. Call initializeAsync() before requesting recommendations.",
			);
		return Float32Array.from(this.cache);
	};

	invalidate: IInstancePreferenceModelInvalidationPort["invalidate"] = () => (this.cache = null);

	rebuildAsync: IInstancePreferenceModelServicePort["rebuildAsync"] = async () => {
		this.cache = await this.buildAsync();
	};
}
