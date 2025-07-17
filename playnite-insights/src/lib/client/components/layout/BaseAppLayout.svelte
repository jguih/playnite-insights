<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...props} class={`relative h-full w-full overflow-y-hidden ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
