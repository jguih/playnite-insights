<script lang="ts">
	import type {  HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p class="text-xs truncate w-full block text-center">
    {#if props.children}
        {@render props.children()}
    {/if}
</p>
