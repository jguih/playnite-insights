<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';

	let { width = 80, ...props }: HTMLAttributes<HTMLElement> & { width?: number } = $props();
	let showChildren = $state(false);

	onMount(async () => {
		await tick();
		showChildren = true;
	});
</script>

<aside
	{...props}
	class={`bg-background-1 z-1002 fixed left-0 right-0 top-0 h-full max-w-full overflow-y-auto shadow-xl ${props.class ?? ''}`}
	style:width={`${width}dvw`}
	role="presentation"
	transition:fly={{ x: `-${width}dvw`, duration: 300 }}
>
	{#if props.children && showChildren}
		{@render props.children()}
	{/if}
</aside>
