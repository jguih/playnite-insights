import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllPlatformsResponseSchema,
	type GetAllPlatformsResponse,
} from '@playatlas/game-library/core';
import { FetchClientStrategyError, JsonStrategy } from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type PlatformStoreDeps = ApiDataStoreDeps;

export type PlatformListSignal = {
	list: GetAllPlatformsResponse | null;
	isLoading: boolean;
};

export class PlatformStore extends ApiDataStore {
	#dataSignal: PlatformListSignal;

	constructor({ httpClient }: PlatformStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	loadPlatforms = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/platform',
				strategy: new JsonStrategy(getAllPlatformsResponseSchema),
			});
			this.#dataSignal.list = result;
			return result;
		} catch (err) {
			if (err instanceof FetchClientStrategyError && err.statusCode === 204) return null;
			handleClientErrors(err, `[loadPlatforms] failed to fetch /api/platform`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get platformList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
