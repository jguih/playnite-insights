import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllPlatformsResponseSchema,
	JsonStrategy,
	type GetAllPlatformsResponse,
} from '@playnite-insights/lib/client';
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
			return await this.withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/platform',
					strategy: new JsonStrategy(getAllPlatformsResponseSchema),
				});
				this.#dataSignal.list = result;
				return result;
			});
		} catch (err) {
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
