<script lang="ts">
	import { ListFilter } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import { filtersState } from './store.svelte';
	import { scale } from 'svelte/transition';

	let { counter }: { counter?: number } = $props();
</script>

<LightButton
	class={['relative']}
	color="primary"
	onclick={() => (filtersState.show = !filtersState.show)}
>
	{#if counter}
		<div
			class={[
				'bg-primary-bg text-primary-fg absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs',
			]}
			transition:scale={{ duration: 150 }}
		>
			{counter}
		</div>
	{/if}
	<ListFilter />
</LightButton>
