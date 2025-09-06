<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class="block w-full truncate text-center text-xs">
	{#if props.children}
		{@render props.children()}
	{/if}
</p>
