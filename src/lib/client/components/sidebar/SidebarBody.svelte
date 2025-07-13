<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...props} class={`p-4 ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
