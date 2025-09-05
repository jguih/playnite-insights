<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { BottomSheetProps } from './types';

	let { height = 80, ...props }: BottomSheetProps = $props();
	let showChildren = $state(false);

	onMount(async () => {
		await tick();
		showChildren = true;
	});
</script>

<aside
	{...props}
	class={[
		'bg-background-1 z-1002 fixed bottom-0 right-0 max-h-full w-full overflow-y-hidden shadow',
		props.class,
	]}
	style:height={`${height}dvh`}
	role="presentation"
	transition:fly={{ y: `${height}dvh`, duration: 150 }}
>
	{#if props.children && showChildren}
		{@render props.children()}
	{/if}
</aside>
