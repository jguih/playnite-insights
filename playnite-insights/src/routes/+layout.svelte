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
		serviceWorkerUpdaterSignal,
	} from '$lib/client/app-state/AppData.svelte.js';
	import Loading from '$lib/client/components/Loading.svelte';
	import Toast from '$lib/client/components/Toast.svelte';
	import {
		INDEXEDDB_CURRENT_VERSION,
		INDEXEDDB_NAME,
		openIndexedDbAsync,
	} from '$lib/client/db/indexeddb';
	import { EventSourceManager } from '$lib/client/event-source-manager/eventSourceManager.svelte';
	import { ServiceWorkerUpdater } from '$lib/client/sw-updater.svelte';
	import { FetchClient } from '@playnite-insights/lib/client';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);
	let appProcessingInterval: ReturnType<typeof setInterval> | null = $state(null);

	const appProcessingHandler = () => {
		return Promise.all([loadServerTime(), clientServiceLocator.syncQueue.processQueueAsync()]);
	};

	const handleFocus = () => {
		loadRecentGameSessions();
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
		Promise.all([
			loadGames(),
			loadCompanies(),
			loadRecentGameSessions(),
			loadGenres(),
			loadPlatforms(),
			loadServerTime(),
			loadLibraryMetrics(),
			loadGameNotesFromServer(),
		]).then(() => (isLoading = false));
		// Periodic data processing
		appProcessingInterval = setInterval(appProcessingHandler, 60_000);
		// Create event source manager
		eventSourceManagerSignal.manager = new EventSourceManager();
		eventSourceManagerSignal.manager.setupGlobalListeners();
		serviceWorkerUpdaterSignal.updater = new ServiceWorkerUpdater();
		serviceWorkerUpdaterSignal.updater.setupGlobalListeners();
		serviceWorkerUpdaterSignal.updater.watchServiceWorkerUpdates();

		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			if (appProcessingInterval) clearInterval(appProcessingInterval);
			serviceWorkerUpdaterSignal.updater?.clearGlobalListeners();
			eventSourceManagerSignal.manager?.clearGlobalListeners();
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
