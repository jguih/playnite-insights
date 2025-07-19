<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { devStore, gameStore } from '$lib/stores/app-data.svelte';
	import { fetchGames } from '$lib/client/utils/playnite-game';
	import { fetchDevs } from '$lib/client/use-devs';
	import { error } from '@sveltejs/kit';
	import Loading from '$lib/client/components/Loading.svelte';

	let { children, data }: { children: Snippet } & LayoutProps = $props();
	let appName = $derived(data.appName);
	let isLoading: boolean = $state(true);

	onMount(async () => {
		if (!gameStore.raw) {
			isLoading = true;
			await fetchGames()
				.then((games) => {
					gameStore.raw = games;
				})
				.catch((err) => {
					error(500, 'Failed to fetch games');
				});
		}
		if (!devStore.raw) {
			isLoading = true;
			await fetchDevs()
				.then((devs) => {
					devStore.raw = devs;
				})
				.catch((err) => {
					error(500, 'Failed to fetch devs');
				});
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
