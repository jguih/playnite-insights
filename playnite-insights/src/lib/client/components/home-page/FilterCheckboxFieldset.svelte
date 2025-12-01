<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<fieldset class="h-48 overflow-y-auto">
	{#if children}
		{@render children()}
	{/if}
</fieldset>
