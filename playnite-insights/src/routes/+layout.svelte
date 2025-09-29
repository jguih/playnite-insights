<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { locator } from '$lib/client/app-state/serviceLocator.svelte';
	import Loading from '$lib/client/components/Loading.svelte';
	import Toast from '$lib/client/components/Toast.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let appName = $derived(data.appName);
	let appProcessingInterval: ReturnType<typeof setInterval> | null = $state(null);
	let loading = $state<Set<string>>(new Set('all'));

	const addLoading = (value: string) => {
		const newLoading = new Set(loading);
		newLoading.add(value);
		loading = newLoading;
	};

	const removeLoading = (value: string) => {
		const newLoading = new Set(loading);
		newLoading.delete(value);
		loading = newLoading;
	};

	const initInstance = async () => {
		try {
			addLoading('instanceRegistered');
			var registered = await locator.instanceManager.isRegistered();
			if (!registered) {
				await goto('/auth/register', { replaceState: true });
			}
		} catch {
		} finally {
			removeLoading('instanceRegistered');
		}
		loading = new Set();
	};

	if (browser) {
		initInstance();
	}

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
		locator.serviceWorkerManager.setupGlobalListeners();
		locator.serviceWorkerManager.watchServiceWorkerUpdates();
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
			if (appProcessingInterval) clearInterval(appProcessingInterval);
			locator.serviceWorkerManager.clearGlobalListeners();
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
{#if loading.size > 0}
	<main class="flex h-full w-full items-center justify-center">
		<div class="block">
			<Loading />
		</div>
	</main>
{:else}
	{@render children()}
{/if}
