<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={`relative h-full w-full overflow-y-hidden ${props.class ?? ''}`}
	transition:fade={{ duration: 150 }}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
