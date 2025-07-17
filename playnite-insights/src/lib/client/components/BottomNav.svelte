<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div
	class="bg-background-1 z-1000 fixed bottom-0 left-0 right-0 flex h-[3.4rem] flex-row items-center justify-between pb-4 pl-8 pr-8 pt-4 shadow-lg"
>
	{#if children}
		{@render children()}
	{/if}
</div>
