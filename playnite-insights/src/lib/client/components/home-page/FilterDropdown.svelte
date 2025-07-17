<script lang="ts">
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import Dropdown from '../dropdown/Dropdown.svelte';
	import DropdownBody from '../dropdown/DropdownBody.svelte';
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<Dropdown class="w-full">
	{#snippet button({ onclick, show })}
		<LightButton {onclick} class="bg-background-2 w-full p-2" justify="between">
			{label}
			{#if show}
				<ChevronUp class="h-5 w-5" />
			{:else}
				<ChevronDown class="h-5 w-5" />
			{/if}
		</LightButton>
	{/snippet}
	{#snippet body()}
		<DropdownBody>{@render children()}</DropdownBody>
	{/snippet}
</Dropdown>
