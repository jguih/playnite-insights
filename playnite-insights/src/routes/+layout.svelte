<script lang="ts">
	import {
		httpClientSignal,
		loadCompanies,
		loadGames,
		loadGenres,
		loadLibraryMetrics,
		loadPlatforms,
		loadRecentGameSessions,
		loadServerTime,
	} from '$lib/client/app-state/AppData.svelte';
	import Loading from '$lib/client/components/Loading.svelte';
	import { FetchClient } from '$lib/client/fetch-client/fetchClient';
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);
	const refetchInterval = {
		recentGameSession: 5_000,
		serverTime: 60_000,
	};
	let recentGameSessionInterval: ReturnType<typeof setInterval> | null = $state(null);
	let serverTimeInterval: ReturnType<typeof setInterval> | null = $state(null);

	const handleFocus = () => {
		if (recentGameSessionInterval) clearInterval(recentGameSessionInterval);
		loadRecentGameSessions().then(() => {
			recentGameSessionInterval = setInterval(
				loadRecentGameSessions,
				refetchInterval.recentGameSession,
			);
		});
		if (serverTimeInterval) clearInterval(serverTimeInterval);
		loadServerTime().then(() => {
			serverTimeInterval = setInterval(loadServerTime, refetchInterval.serverTime);
		});
	};

	const handleMessage = (event: MessageEvent) => {
		console.debug('Message from sw: ', event);
		if (event.data && Object.hasOwn(event.data, 'type')) {
			const type = event.data.type;
			if (type === 'RECENT_SESSION_UPDATE') {
				console.debug('Re-fetching recent activity');
				loadRecentGameSessions();
			}
		}
	};

	onMount(() => {
		httpClientSignal.client = new FetchClient({ url: window.location.origin });

		(async () => {
			isLoading = true;
			await loadGames();
			await loadCompanies();
			await loadRecentGameSessions();
			await loadGenres();
			await loadPlatforms();
			await loadServerTime();
			await loadLibraryMetrics();
			isLoading = false;
		})();

		recentGameSessionInterval = setInterval(
			loadRecentGameSessions,
			refetchInterval.recentGameSession,
		);
		serverTimeInterval = setInterval(loadServerTime, refetchInterval.serverTime);

		navigator.serviceWorker?.addEventListener('message', handleMessage);
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			navigator.serviceWorker?.removeEventListener('message', handleMessage);
			if (recentGameSessionInterval) clearInterval(recentGameSessionInterval);
			if (serverTimeInterval) clearInterval(serverTimeInterval);
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

{#if isLoading}
	<Loading />
{:else}
	{@render children()}
{/if}
