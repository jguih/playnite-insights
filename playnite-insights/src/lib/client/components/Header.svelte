<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, action, title }: { children?: Snippet; action?: Snippet; title?: Snippet } =
		$props();
</script>

<div
	class="bg-background-1 z-1000 fixed left-0 right-0 top-0 flex h-[var(--header-height)] flex-row items-center gap-2 px-4 py-2 shadow-lg"
>
	<div class="flex flex-row items-center gap-2">
		{#if action}
			{@render action()}
		{/if}
		{#if title}
			{@render title()}
		{/if}
	</div>
	<div class="grow">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
