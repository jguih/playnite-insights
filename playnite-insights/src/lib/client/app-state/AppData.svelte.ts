import {
	getAllGenresResponseSchema,
	getAllPlatformsResponseSchema,
	getPlayniteLibraryMetricsResponseSchema,
	getServerUtcNowResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { handleClientErrors } from '../utils/handleClientErrors.svelte';
import type {
	GenreSignal,
	HttpClientSignal,
	IndexedDbSignal,
	LibraryMetricsSignal,
	PlatformSignal,
	ServerTimeSignal,
} from './AppData.types';
import { ClientServiceLocator } from './serviceLocator';

export const httpClientSignal = $state<HttpClientSignal>({ client: null });
export const indexedDbSignal = $state<IndexedDbSignal>({ db: null, dbReady: null });
export const genreSignal = $state<GenreSignal>({ raw: null, isLoading: false });
export const platformSignal = $state<PlatformSignal>({ raw: null, isLoading: false });
export const serverTimeSignal = $state<ServerTimeSignal>({
	syncPoint: null,
	utcNow: null,
	isLoading: false,
});
export const libraryMetricsSignal = $state<LibraryMetricsSignal>({ raw: null, isLoading: false });
export const locator = new ClientServiceLocator({
	httpClientSignal,
	indexedDbSignal,
	serverTimeSignal,
});

export async function withHttpClient<T>(
	cb: (props: { client: IFetchClient }) => Promise<T>,
): Promise<T> {
	const client = httpClientSignal.client;
	if (!client) throw new HttpClientNotSetError();
	return cb({ client });
}

export const loadLibraryMetrics = async () => {
	try {
		libraryMetricsSignal.isLoading = true;
		return await withHttpClient(async ({ client }) => {
			const result = await client.httpGetAsync({
				endpoint: '/api/library/metrics',
				strategy: new JsonStrategy(getPlayniteLibraryMetricsResponseSchema),
			});
			libraryMetricsSignal.raw = result;
			return result;
		});
	} catch (err) {
		handleClientErrors(err, `[loadLibraryMetrics] failed to fetch /api/library/metrics`);
		return null;
	} finally {
		libraryMetricsSignal.isLoading = false;
	}
};

/**
 * Loads server time
 * Cached by SW: No
 * Offline-safe: No
 */
export const loadServerTime = async () => {
	if (!locator.serverHeartbeat.isAlive) return null;
	try {
		return await withHttpClient(async ({ client }) => {
			serverTimeSignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/time/now',
				strategy: new JsonStrategy(getServerUtcNowResponseSchema),
			});
			serverTimeSignal.utcNow = result ? new Date(result.utcNow).getTime() : null;
			serverTimeSignal.syncPoint = performance.now();
			return result;
		});
	} catch (err) {
		handleClientErrors(err, `[loadServerTime] failed to fetch /api/time/now`);
		return null;
	} finally {
		serverTimeSignal.isLoading = false;
	}
};

export const loadGenres = async () => {
	try {
		return await withHttpClient(async ({ client }) => {
			genreSignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/genre',
				strategy: new JsonStrategy(getAllGenresResponseSchema),
			});
			genreSignal.raw = result;
			return result;
		});
	} catch (err) {
		handleClientErrors(err, `[loadGenres] failed to fetch /api/genre`);
		return null;
	} finally {
		genreSignal.isLoading = false;
	}
};

export const loadPlatforms = async () => {
	try {
		return await withHttpClient(async ({ client }) => {
			platformSignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/platform',
				strategy: new JsonStrategy(getAllPlatformsResponseSchema),
			});
			platformSignal.raw = result;
			return result;
		});
	} catch (err) {
		handleClientErrors(err, `[loadPlatforms] failed to fetch /api/platform`);
		return null;
	} finally {
		platformSignal.isLoading = false;
	}
};
