<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';

	let { width = 80, ...props }: HTMLAttributes<HTMLElement> & { width?: number } = $props();
</script>

<aside
	{...props}
	class={`bg-background-1 fixed top-0 right-0 left-0 z-1002 h-full max-w-full overflow-y-auto shadow-xl ${props.class ?? ''}`}
	style:width={`${width}dvw`}
	role="presentation"
	transition:fly={{ x: `-${width}dvw`, duration: 300 }}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</aside>
