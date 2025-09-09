<script
	lang="ts"
	module
>
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

	export const httpClientSignal = $state<{ client: FetchClient | null }>({ client: null });
	export const indexedDbSignal = $state<IndexedDbSignal>({ db: null });
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

	export const loadLibraryMetrics = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		libraryMetricsSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/library/metrics',
			strategy: new JsonStrategy(getPlayniteLibraryMetricsResponseSchema),
		});
		if (result.success) {
			libraryMetricsSignal.raw = result.data;
		}
		libraryMetricsSignal.isLoading = false;
	};

	export const loadCompanies = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		companySignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/company',
			strategy: new JsonStrategy(getAllCompaniesResponseSchema),
		});
		if (result.success) {
			companySignal.raw = result.data;
		}
		companySignal.isLoading = false;
	};

	export const loadGames = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		gameSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/game',
			strategy: new JsonStrategy(getAllGamesResponseSchema),
		});
		if (result.success) {
			gameSignal.raw = result.data;
		}
		gameSignal.isLoading = false;
	};

	export const loadRecentGameSessions = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		recentGameSessionSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/session/recent',
			strategy: new JsonStrategy(getRecentSessionsResponseSchema),
		});
		if (result.success) {
			recentGameSessionSignal.raw = result.data;
		}
		recentGameSessionSignal.isLoading = false;
	};

	export const loadServerTime = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		serverTimeSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/time/now',
			strategy: new JsonStrategy(getServerUtcNowResponseSchema),
		});
		if (result.success) {
			serverTimeSignal.utcNow = result.data ? new Date(result.data.utcNow).getTime() : null;
			serverTimeSignal.syncPoint = performance.now();
		}
		serverTimeSignal.isLoading = false;
	};

	export const loadGenres = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		genreSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/genre',
			strategy: new JsonStrategy(getAllGenresResponseSchema),
		});
		if (result.success) {
			genreSignal.raw = result.data;
		}
		genreSignal.isLoading = false;
	};

	export const loadPlatforms = async () => {
		const client = httpClientSignal.client;
		if (!client) return;
		platformSignal.isLoading = true;
		const result = await client.httpGetAsync({
			endpoint: '/api/platform',
			strategy: new JsonStrategy(getAllPlatformsResponseSchema),
		});
		if (result.success) {
			platformSignal.raw = result.data;
		}
		platformSignal.isLoading = false;
	};
</script>
