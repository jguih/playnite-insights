import {
	FetchClientStrategyError,
	getAllGameNotesResponseSchema,
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

const getLastServerSync = (): string | null => {
	const lastSync = localStorage.getItem('lastServerSync');
	if (!lastSync) return null;
	if (isNaN(Date.parse(lastSync))) return null;
	return new Date(lastSync).toISOString();
};

const setLastServerSync = () => {
	const serverNow = locator.dateTimeHandler.getUtcNow();
	localStorage.setItem('lastServerSync', new Date(serverNow).toISOString());
};

const clearLastServerSync = () => {
	localStorage.setItem('lastServerSync', '');
};

/**
 * Loads game notes from the server
 * Cached by SW: No
 * Offline-safe: No
 */
export const loadGameNotesFromServer = async (override?: boolean) => {
	if (!locator.serverHeartbeat.isAlive) return { notes: null, success: true };
	if (override) clearLastServerSync();
	try {
		return await withHttpClient(async ({ client }) => {
			const lastSync = getLastServerSync();
			const notes = await client.httpGetAsync({
				endpoint: `/api/note${lastSync ? `?lastSync=${lastSync}` : ''}`,
				strategy: new JsonStrategy(getAllGameNotesResponseSchema),
			});
			setLastServerSync();
			await locator.repository.gameNote.upsertOrDeleteManyAsync(notes, { override });
			return { notes, success: true };
		});
	} catch (err) {
		if (
			err instanceof FetchClientStrategyError &&
			(err.statusCode === 304 || err.statusCode === 204)
		) {
			setLastServerSync();
			return { notes: null, success: true };
		}
		handleClientErrors(err, `[loadGameNotesFromServer] failed to fetch /api/note`);
		return { notes: null, success: false };
	}
};
