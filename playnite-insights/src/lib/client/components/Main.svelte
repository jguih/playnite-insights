<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mainScrollPosition } from '$lib/stores/main-scroll-position.svelte';
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		main = $bindable<HTMLElement>(),
		bottomNav = true,
		...props
	}: HTMLAttributes<HTMLElement> & {
		main?: ReturnType<typeof $bindable<HTMLElement>>;
		bottomNav?: boolean;
	} = $props();
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
	class={`absolute ${bottomNav ? 'bottom-[3.4rem]' : 'bottom-0'} left-0 right-0 top-[3.4rem] overflow-y-auto overflow-x-hidden p-4 pb-12 ${
		props?.class ?? ''
	}`}
	bind:this={main}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</main>
