<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div
	class="bg-background-1 z-1000 fixed bottom-0 left-0 right-0 flex h-[var(--bottom-nav-height)] flex-row items-center justify-between gap-4 p-4 shadow-lg"
>
	{#if children}
		{@render children()}
	{/if}
</div>
