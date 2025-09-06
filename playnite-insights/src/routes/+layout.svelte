<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import {
		loadCompanies,
		loadDashData,
		loadGames,
		loadGenres,
		loadPlatforms,
		loadRecentActivity,
		loadServerTime,
		serverTimeSignal,
	} from '$lib/stores/AppData.svelte';
	import Loading from '$lib/client/components/Loading.svelte';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);
	const refetchInterval = {
		recentActivity: 5_000,
		serverTime: 60_000,
	};
	let recentActivityInterval: ReturnType<typeof setInterval> | null = $state(null);
	let serverTimeInterval: ReturnType<typeof setInterval> | null = $state(null);

	const handleFocus = () => {
		if (recentActivityInterval) clearInterval(recentActivityInterval);
		loadRecentActivity().then(() => {
			recentActivityInterval = setInterval(loadRecentActivity, refetchInterval.recentActivity);
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
				loadRecentActivity();
			}
		}
	};

	onMount(() => {
		(async () => {
			isLoading = true;
			await loadGames();
			await loadCompanies();
			await loadDashData();
			await loadRecentActivity();
			await loadGenres();
			await loadPlatforms();
			await loadServerTime();
			isLoading = false;
		})();

		recentActivityInterval = setInterval(loadRecentActivity, refetchInterval.recentActivity);
		serverTimeInterval = setInterval(loadServerTime, refetchInterval.serverTime);

		navigator.serviceWorker?.addEventListener('message', handleMessage);
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			navigator.serviceWorker?.removeEventListener('message', handleMessage);
			if (recentActivityInterval) clearInterval(recentActivityInterval);
			if (serverTimeInterval) clearInterval(serverTimeInterval);
		};
	});

	$inspect(serverTimeSignal);
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
