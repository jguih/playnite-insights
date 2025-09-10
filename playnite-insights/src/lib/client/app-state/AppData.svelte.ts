import { m } from '$lib/paraglide/messages';
import {
	GameNoteFactory,
	getAllCompaniesResponseSchema,
	getAllGamesResponseSchema,
	getAllGenresResponseSchema,
	getAllPlatformsResponseSchema,
	getPlayniteLibraryMetricsResponseSchema,
	getRecentSessionsResponseSchema,
	getServerUtcNowResponseSchema,
	SyncQueueFactory,
} from '@playnite-insights/lib/client';
import type { FetchClient } from '../fetch-client/fetchClient';
import { JsonStrategy } from '../fetch-client/jsonStrategy';
import type {
	CompanySignal,
	GameSignal,
	GenreSignal,
	IndexedDbSignal,
	LibraryMetricsSignal,
	PlatformSignal,
	RecentGameSessionSignal,
	ServerTimeSignal,
} from './AppData.types';
import { toast } from './toast.svelte';

export const httpClientSignal = $state<{ client: FetchClient | null }>({ client: null });
export const indexedDbSignal = $state<IndexedDbSignal>({ db: null, dbReady: null });
export const companySignal = $state<CompanySignal>({ raw: null, isLoading: true });
export const gameSignal = $state<GameSignal>({ raw: null, isLoading: false });
export const recentGameSessionSignal = $state<RecentGameSessionSignal>({
	raw: null,
	isLoading: false,
});
export const genreSignal = $state<GenreSignal>({ raw: null, isLoading: false });
export const platformSignal = $state<PlatformSignal>({ raw: null, isLoading: false });
export const serverTimeSignal = $state<ServerTimeSignal>({
	syncPoint: null,
	utcNow: null,
	isLoading: false,
});
export const libraryMetricsSignal = $state<LibraryMetricsSignal>({ raw: null, isLoading: false });

export const factory = {
	syncQueue: new SyncQueueFactory(),
	gameNote: new GameNoteFactory(),
};

async function withHttpClient<T>(cb: (props: { client: FetchClient }) => Promise<T>): Promise<T> {
	const client = httpClientSignal.client;
	if (!client) throw new Error(m.error_http_client_not_set());
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
		if (err instanceof Error)
			toast.error({ title: m.error_load_library_metrics(), message: err.message });
		console.error(err);
		return null;
	} finally {
		libraryMetricsSignal.isLoading = false;
	}
};

export const loadCompanies = async () => {
	try {
		return await withHttpClient(async ({ client }) => {
			companySignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/company',
				strategy: new JsonStrategy(getAllCompaniesResponseSchema),
			});
			companySignal.raw = result;
			return result;
		});
	} catch (err) {
		if (err instanceof Error)
			toast.error({ title: m.error_load_companies(), message: err.message });
		console.error(err);
		return null;
	} finally {
		companySignal.isLoading = false;
	}
};

export const loadGames = async () => {
	try {
		return await withHttpClient(async ({ client }) => {
			gameSignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/game',
				strategy: new JsonStrategy(getAllGamesResponseSchema),
			});
			gameSignal.raw = result;
			return result;
		});
	} catch (err) {
		if (err instanceof Error) toast.error({ title: m.error_load_games(), message: err.message });
		console.error(err);
		return null;
	} finally {
		gameSignal.isLoading = false;
	}
};

/**
 * Loads all game sessions that overlaps the last 7 days
 */
export const loadRecentGameSessions = async () => {
	try {
		return await withHttpClient(async ({ client }) => {
			recentGameSessionSignal.isLoading = true;
			const result = await client.httpGetAsync({
				endpoint: '/api/session/recent',
				strategy: new JsonStrategy(getRecentSessionsResponseSchema),
			});
			recentGameSessionSignal.raw = result;
			return result;
		});
	} catch (err) {
		if (err instanceof Error)
			toast.error({ title: m.error_load_recent_game_sessions(), message: err.message });
		console.error(err);
		return null;
	} finally {
		recentGameSessionSignal.isLoading = false;
	}
};

export const loadServerTime = async () => {
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
		if (err instanceof Error)
			toast.error({ title: m.error_load_server_time(), message: err.message });
		console.error(err);
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
		if (err instanceof Error) toast.error({ title: m.error_load_genres(), message: err.message });
		console.error(err);
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
		if (err instanceof Error)
			toast.error({ title: m.error_load_platforms(), message: err.message });
		console.error(err);
		return null;
	} finally {
		platformSignal.isLoading = false;
	}
};
