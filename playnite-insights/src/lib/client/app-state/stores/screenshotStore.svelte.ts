import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllScreenshotsResponseSchema,
	JsonStrategy,
	type GetAllScreenshotsResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type ScreenshotStoreDeps = ApiDataStoreDeps;

export type ScreenshotListSignal = {
	list: GetAllScreenshotsResponse['screenshots'] | null;
	isLoading: boolean;
	hasLoaded: boolean;
};

export class ScreenshotStore extends ApiDataStore {
	#dataSignal: ScreenshotListSignal;
	#cache: Map<string, GetAllScreenshotsResponse['screenshots']>;

	constructor({ httpClient }: ScreenshotStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false, hasLoaded: false });
		this.#cache = new Map();
	}

	loadScreenshots = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const response = await this.httpClient.httpGetAsync({
				endpoint: '/api/assets/image/screenshot/all',
				strategy: new JsonStrategy(getAllScreenshotsResponseSchema),
			});
			return (this.#dataSignal.list = response.screenshots);
		} catch (error) {
			handleClientErrors(
				error,
				`[loadScreenshots] failed to fetch /api/assets/image/screenshot/all`,
			);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
			this.#dataSignal.hasLoaded = true;
		}
	};

	get screenshotList(): GetAllScreenshotsResponse['screenshots'] | null {
		if (this.#cache.has('sorted')) return this.#cache.get('sorted')!;
		if (!this.#dataSignal.list) return null;
		const sorted = [...this.#dataSignal.list].sort((a, b) =>
			b.CreatedAt.localeCompare(a.CreatedAt),
		);
		this.#cache.set('sorted', sorted);
		return sorted;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}

	get hasLoaded() {
		return this.#dataSignal.hasLoaded;
	}
}
