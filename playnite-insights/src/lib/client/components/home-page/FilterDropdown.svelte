<script lang="ts">
	import { ChevronDown, ChevronUp, Trash } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import Dropdown from '../dropdown/Dropdown.svelte';
	import DropdownBody from '../dropdown/DropdownBody.svelte';
	import type { Snippet } from 'svelte';

	let {
		label,
		children,
		counter,
		onClear,
	}: { label: string; children: Snippet; counter?: number; onClear: () => void } = $props();
</script>

<Dropdown class={['w-full']}>
	{#snippet button({ onclick, show })}
		<div class="flex flex-row gap-1">
			<LightButton
				{onclick}
				class={['w-full p-2']}
				justify="between"
				selected={show}
			>
				{label}
				{#if show}
					<div class="flex flex-row items-center gap-1">
						{#if counter}
							<p class="bg-primary-bg text-primary-fg rounded-2xl px-1 text-sm">{counter}</p>
						{/if}
						<ChevronUp class={['h-5 w-5']} />
					</div>
				{:else}
					<div class="flex flex-row items-center gap-1">
						{#if counter}
							<p class="bg-primary-bg text-primary-fg rounded-2xl px-1 text-sm">{counter}</p>
						{/if}
						<ChevronDown class={['h-5 w-5']} />
					</div>
				{/if}
			</LightButton>
			{#if counter && counter > 0}
				<LightButton onclick={onClear}>
					<Trash class={['h-5 w-5']} />
				</LightButton>
			{/if}
		</div>
	{/snippet}
	{#snippet body()}
		<DropdownBody>{@render children()}</DropdownBody>
	{/snippet}
</Dropdown>
