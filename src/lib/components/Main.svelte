<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mainScrollPosition } from '$lib/stores/main-scroll-position.svelte';
	import { onMount, type Snippet } from 'svelte';

	let { children, main = $bindable<HTMLElement>() }: { children?: Snippet, main?: ReturnType<typeof $bindable<HTMLElement>> } = $props();
	const pathname = $derived(page.url.pathname);

	onMount(() => {
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
