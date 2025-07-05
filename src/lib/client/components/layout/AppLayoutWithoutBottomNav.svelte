<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import BaseAppLayout from './BaseAppLayout.svelte';

	let props: HTMLAttributes<HTMLDivElement> = $props();
</script>

<BaseAppLayout class="grid-rows-[3.4rem_1fr]">
	{#if props.children}
		{@render props.children()}
	{/if}
</BaseAppLayout>
