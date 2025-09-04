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
		loadRecentActivity
	} from '$lib/stores/AppData.svelte';
	import Loading from '$lib/client/components/Loading.svelte';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);
	const refetchInterval = 30_000;
	let interval: ReturnType<typeof setInterval> | null = $state(null);

	onMount(() => {
		(async () => {
			isLoading = true;
			await loadGames();
			await loadCompanies();
			await loadDashData();
			await loadRecentActivity();
			await loadGenres();
			await loadPlatforms();
			isLoading = false;
		})();

		window.addEventListener('focus', async () => {
			if (interval) clearInterval(interval);
			await loadRecentActivity();
			interval = setInterval(loadRecentActivity, refetchInterval);
		});
		interval = setInterval(loadRecentActivity, refetchInterval);

		return () => {
			window.removeEventListener('focus', loadRecentActivity);
			if (interval) clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<title>{appName}</title>
	<meta name="application-name" content={appName} />
	<meta name="apple-mobile-web-app-title" content={appName} />
</svelte:head>

{#if isLoading}
	<Loading />
{:else}
	{@render children()}
{/if}
