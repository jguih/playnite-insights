<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import {
		dashStore,
		devStore,
		gameStore,
		loadDashData,
		loadDevs,
		loadGames
	} from '$lib/stores/app-data.svelte';
	import Loading from '$lib/client/components/Loading.svelte';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);

	onMount(async () => {
		if (!gameStore.raw) {
			isLoading = true;
			await loadGames();
		}
		if (!devStore.raw) {
			isLoading = true;
			await loadDevs();
		}
		if (!dashStore.pageData) {
			isLoading = true;
			await loadDashData();
		}
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
