import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllPlatformsResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetAllPlatformsResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type PlatformStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type PlatformListSignal = {
	list: GetAllPlatformsResponse | null;
	isLoading: boolean;
};

export class PlatformStore {
	#httpClientSignal: PlatformStoreDeps['httpClientSignal'];
	#dataSignal: PlatformListSignal;

	constructor({ httpClientSignal }: PlatformStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadPlatforms = async () => {
		try {
			return await this.#withHttpClient(async ({ client }) => {
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
