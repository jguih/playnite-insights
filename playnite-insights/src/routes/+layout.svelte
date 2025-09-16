<script lang="ts">
	import {
		clientServiceLocator,
		eventSourceManagerSignal,
		httpClientSignal,
		indexedDbSignal,
		loadCompanies,
		loadGameNotesFromServer,
		loadGames,
		loadGenres,
		loadLibraryMetrics,
		loadPlatforms,
		loadRecentGameSessions,
		loadServerTime,
	} from '$lib/client/app-state/AppData.svelte.js';
	import Loading from '$lib/client/components/Loading.svelte';
	import Toast from '$lib/client/components/Toast.svelte';
	import {
		INDEXEDDB_CURRENT_VERSION,
		INDEXEDDB_NAME,
		openIndexedDbAsync,
	} from '$lib/client/db/indexeddb';
	import { EventSourceManager } from '$lib/client/event-source-manager/eventSourceManager.svelte';
	import { FetchClient } from '@playnite-insights/lib/client';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);
	let recentGameSessionInterval: ReturnType<typeof setInterval> | null = $state(null);
	let appDataInterval: ReturnType<typeof setInterval> | null = $state(null);

	const loadAllAppData = () => {
		return Promise.all([
			loadGames(),
			loadCompanies(),
			loadRecentGameSessions(),
			loadGenres(),
			loadPlatforms(),
			loadServerTime(),
			loadLibraryMetrics(),
			clientServiceLocator.syncQueue.processQueueAsync(),
		]);
	};

	const handleFocus = () => {
		if (appDataInterval) clearInterval(appDataInterval);
		if (recentGameSessionInterval) clearInterval(recentGameSessionInterval);
		loadAllAppData().then(() => {
			appDataInterval = setInterval(loadAllAppData, 60_000);
			recentGameSessionInterval = setInterval(loadRecentGameSessions, 5_000);
		});
	};

	const handleMessage = (event: MessageEvent) => {
		if (!event.data || !Object.hasOwn(event.data, 'type')) return;
		const type = event.data.type;
		switch (type) {
			case 'GAMES_UPDATE': {
				loadGames();
				break;
			}
			case 'COMPANY_UPDATE': {
				loadCompanies();
				break;
			}
			case 'RECENT_SESSION_UPDATE': {
				loadRecentGameSessions();
				break;
			}
			case 'GENRE_UPDATE': {
				loadGenres();
				break;
			}
			case 'PLATFORM_UPDATE': {
				loadPlatforms();
				break;
			}
			case 'LIBRARY_METRICS_UPDATE': {
				loadLibraryMetrics();
				break;
			}
		}
	};

	onMount(() => {
		// Setup http client
		httpClientSignal.client = new FetchClient({ url: window.location.origin });
		// Setup indexeddb connection
		indexedDbSignal.dbReady = openIndexedDbAsync({
			dbName: INDEXEDDB_NAME,
			version: INDEXEDDB_CURRENT_VERSION,
		}).then((db) => {
			indexedDbSignal.db = db;
		});
		// Load app data
		isLoading = true;
		Promise.all([loadAllAppData(), loadGameNotesFromServer()]).then(() => (isLoading = false));
		// Periodic data fetch
		recentGameSessionInterval = setInterval(loadRecentGameSessions, 5_000);
		appDataInterval = setInterval(loadAllAppData, 60_000);
		// Create event source manager
		eventSourceManagerSignal.manager = new EventSourceManager();

		navigator.serviceWorker?.addEventListener('message', handleMessage);
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			navigator.serviceWorker?.removeEventListener('message', handleMessage);
			if (recentGameSessionInterval) clearInterval(recentGameSessionInterval);
			if (appDataInterval) clearInterval(appDataInterval);
			eventSourceManagerSignal.manager?.close();
		};
	});
</script>

<svelte:head>
	<title>{appName}</title>
	<meta
		name="application-name"
		content={appName}
	/>
	<meta
		name="apple-mobile-web-app-title"
		content={appName}
	/>
</svelte:head>

<Toast />
{#if isLoading}
	<Loading />
{:else}
	{@render children()}
{/if}
