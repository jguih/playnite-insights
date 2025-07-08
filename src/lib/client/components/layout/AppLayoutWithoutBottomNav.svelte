<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...props} class={`grid h-dvh grid-cols-1 grid-rows-[3.4rem_1fr] ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
