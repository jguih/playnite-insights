<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div
	class={[
		'bg-background-1 fixed right-0 bottom-0 left-0 z-1000 flex h-[var(--bottom-nav-height)] flex-row items-center justify-between gap-4 p-4 shadow',
	]}
>
	{#if children}
		{@render children()}
	{/if}
</div>
