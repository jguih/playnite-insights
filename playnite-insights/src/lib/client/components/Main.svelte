<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { mainScrollPosition } from '$lib/stores/main-scroll-position.svelte';
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		main = $bindable<HTMLElement>(),
		bottomNav = true,
		restoreScroll = true,
		...props
	}: HTMLAttributes<HTMLElement> & {
		main?: ReturnType<typeof $bindable<HTMLElement>>;
		bottomNav?: boolean;
		restoreScroll?: boolean;
	} = $props();
	const pathname = $derived(page.url.pathname);

	onMount(() => {
		// Restore previous scroll position
		if (main && mainScrollPosition[pathname] && restoreScroll) {
			requestAnimationFrame(() => {
				if (main) main.scrollTop = mainScrollPosition[pathname].scrollTop;
			});
		}
	});

	beforeNavigate(() => {
		if (main && restoreScroll) {
			mainScrollPosition[pathname] = {
				scrollTop: main.scrollTop,
			};
		}
	});
</script>

<main
	{...props}
	class={[
		'absolute left-0 right-0 top-[var(--header-height)] overflow-y-auto overflow-x-hidden p-4',
		bottomNav ? 'bottom-[var(--bottom-nav-height)]' : 'bottom-0',
		props.class,
	]}
	bind:this={main}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</main>
