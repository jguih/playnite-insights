<script lang="ts">
	import {
		httpClientSignal,
		indexedDbSignal,
		loadGameNotesFromServer,
		loadGenres,
		loadLibraryMetrics,
		loadPlatforms,
		loadServerTime,
		locator,
	} from '$lib/client/app-state/AppData.svelte.js';
	import Toast from '$lib/client/components/Toast.svelte';
	import {
		INDEXEDDB_CURRENT_VERSION,
		INDEXEDDB_NAME,
		openIndexedDbAsync,
	} from '$lib/client/db/indexeddb';
	import { FetchClient } from '@playnite-insights/lib/client';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let appProcessingInterval: ReturnType<typeof setInterval> | null = $state(null);

	const appProcessingHandler = () => {
		return Promise.all([loadServerTime(), locator.syncQueue.processQueueAsync()]);
	};

	const handleFocus = () => {
		locator.gameSessionStore.loadRecentSessions();
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
			loadGameNotesFromServer();
		});
		// Background data loading
		Promise.all([
			locator.loadStoresData(),
			loadGenres(),
			loadPlatforms(),
			loadLibraryMetrics(),
			loadServerTime(),
		]);
		// Periodic data processing
		appProcessingInterval = setInterval(appProcessingHandler, 60_000);
		locator.eventSourceManager.connect();
		locator.eventSourceManager.setupGlobalListeners();
		locator.serviceWorkerUpdater.setupGlobalListeners();
		locator.serviceWorkerUpdater.watchServiceWorkerUpdates();
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			if (appProcessingInterval) clearInterval(appProcessingInterval);
			locator.serviceWorkerUpdater.clearGlobalListeners();
			locator.eventSourceManager.clearGlobalListeners();
			locator.eventSourceManager.close();
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
{@render children()}
