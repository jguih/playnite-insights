<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mainScrollPosition } from '$lib/stores/main-scroll-position.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		main = $bindable<HTMLElement>(),
		...props
	}: HTMLAttributes<HTMLElement> & { main?: ReturnType<typeof $bindable<HTMLElement>> } = $props();
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

<main
	{...props}
	class="h-full overflow-x-hidden overflow-y-scroll p-4 pb-12 {props?.class ?? ''}"
	bind:this={main}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</main>
