<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	{...props}
	class={`fles-row border-background flex justify-between gap-2 border-b-1 p-3 shadow-md ${props.class ?? ''}`}
>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
