import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getPlayniteLibraryMetricsResponseSchema,
	JsonStrategy,
	type GetPlayniteLibraryMetricsResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type LibraryMetricsStoreDeps = ApiDataStoreDeps;

export type LibraryMetricsSignal = {
	data: GetPlayniteLibraryMetricsResponse | null;
	isLoading: boolean;
};

export class LibraryMetricsStore extends ApiDataStore {
	#dataSignal: LibraryMetricsSignal;

	constructor({ httpClient }: LibraryMetricsStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ data: null, isLoading: false });
	}

	loadLibraryMetrics = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/library/metrics',
				strategy: new JsonStrategy(getPlayniteLibraryMetricsResponseSchema),
			});
			this.#dataSignal.data = result;
			return result;
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
