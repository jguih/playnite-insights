<script lang="ts">
	import { locator } from '$lib/client/app-state/serviceLocator';
	import Toast from '$lib/client/components/Toast.svelte';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let appProcessingInterval: ReturnType<typeof setInterval> | null = $state(null);

	const appProcessingHandler = () => {
		return Promise.all([
			locator.serverTimeStore.loadServerTime(),
			locator.syncQueue.processQueueAsync(),
		]);
	};

	const handleFocus = () => {
		locator.gameSessionStore.loadRecentSessions();
	};

	onMount(() => {
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
