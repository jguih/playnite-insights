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
	} from '$lib/stores/app-data.svelte';
	import Loading from '$lib/client/components/Loading.svelte';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);

	onMount(async () => {
		isLoading = true;
		await loadGames();
		await loadCompanies();
		await loadDashData();
		await loadRecentActivity();
		await loadGenres();
		await loadPlatforms();
		isLoading = false;
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
