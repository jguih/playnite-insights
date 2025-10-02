<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { SidebarProps } from './types';

	let { width = 80, ...props }: SidebarProps = $props();
	let showChildren = $state(false);

	onMount(async () => {
		await tick();
		showChildren = true;
	});
</script>

<aside
	{...props}
	class={[
		'bg-background-1 z-21 fixed left-0 right-0 top-0 h-full max-w-full overflow-y-hidden shadow-xl',
		props.class,
	]}
	style:width={`${width}dvw`}
	role="presentation"
	transition:fly={{ x: `-${width}dvw`, duration: 150 }}
>
	{#if props.children && showChildren}
		{@render props.children()}
	{/if}
</aside>
