<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mainScrollPosition } from '$lib/stores/main-scroll-position.svelte';
	import { onDestroy, onMount, type Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
	let main: HTMLElement;
	const pathname = $derived(page.url.pathname);

	onMount(() => {
		$inspect(mainScrollPosition);
		// Restore previous scroll position
		if (main && mainScrollPosition[pathname]) {
			requestAnimationFrame(() => {
				main.scrollTop = mainScrollPosition[pathname].scrollTop;
			});
		}
	});

	beforeNavigate(() => {
		if (main) {
			mainScrollPosition[pathname] = {
				scrollTop: main.scrollTop
			};
		}
	});
</script>

<main class="h-full overflow-auto p-4 pb-12" bind:this={main}>
	{#if children}
		{@render children()}
	{/if}
</main>
