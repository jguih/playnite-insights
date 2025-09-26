import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getPlayniteLibraryMetricsResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetPlayniteLibraryMetricsResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type LibraryMetricsStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type LibraryMetricsSignal = {
	data: GetPlayniteLibraryMetricsResponse | null;
	isLoading: boolean;
};

export class LibraryMetricsStore {
	#httpClientSignal: LibraryMetricsStoreDeps['httpClientSignal'];
	#dataSignal: LibraryMetricsSignal;

	constructor({ httpClientSignal }: LibraryMetricsStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#dataSignal = $state({ data: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadLibraryMetrics = async () => {
		try {
			this.#dataSignal.isLoading = true;
			return await this.#withHttpClient(async ({ client }) => {
				const result = await client.httpGetAsync({
					endpoint: '/api/library/metrics',
					strategy: new JsonStrategy(getPlayniteLibraryMetricsResponseSchema),
				});
				this.#dataSignal.data = result;
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadLibraryMetrics] failed to fetch /api/library/metrics`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get data() {
		return this.#dataSignal.data;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
