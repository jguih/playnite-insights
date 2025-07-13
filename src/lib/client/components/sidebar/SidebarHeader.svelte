<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Divider from '../Divider.svelte';

	let { ...props }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...props} class={`fles-row flex justify-between gap-2 px-4 pt-4 pb-2 ${props.class ?? ''}`}>
	{#if props.children}
		{@render props.children()}
	{/if}
</div>
