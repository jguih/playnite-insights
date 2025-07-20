<script lang="ts">
	import { ListFilter } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import { filtersState } from './store.svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';

	let { counter, ...props }: HTMLButtonAttributes & { counter?: number } = $props();
</script>

<LightButton {...props} class="relative">
	{#if counter}
		<div
			class="bg-primary-500 absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs text-black"
			transition:scale={{ duration: 200 }}
		>
			{counter}
		</div>
	{/if}
	<ListFilter onclick={() => (filtersState.show = !filtersState.show)} />
</LightButton>
