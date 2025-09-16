<script lang="ts">
	import type { GameNote } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';
	import LightButton from '../../buttons/LightButton.svelte';

	type NoteCardProps = {
		note: GameNote;
		onClick: (note: GameNote) => void | Promise<void>;
	};

	let { onClick, note }: NoteCardProps = $props();
	let noteContentEl = $state<HTMLDivElement | null>(null);
	let isOverflowing = $state(false);

	onMount(() => {
		if (noteContentEl) {
			isOverflowing = noteContentEl.scrollHeight > noteContentEl.clientHeight;
		}
	});
</script>

<LightButton
	class={['flex-col! items-start! w-full gap-4 p-4 text-start']}
	onclick={() => onClick(note)}
	type="button"
>
	{#if note.ImagePath}
		<img
			src={note.ImagePath}
			alt={`note image`}
			loading="lazy"
			class="h-64 w-full object-cover"
		/>
	{/if}
	<div
		class="relative max-h-[30dvh] overflow-y-hidden"
		bind:this={noteContentEl}
	>
		{#if note.Title}
			<p class="mb-4 block w-full text-lg font-semibold">{note.Title}</p>
		{/if}
		{#if note.Content}
			<p class="text-md block w-full opacity-80">{note.Content}</p>
		{/if}
		{#if isOverflowing}
			<div
				class="from-background-1 pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t to-transparent"
			></div>
		{/if}
	</div>
	<p class="w-full text-right text-sm opacity-60">
		{new Date(note.CreatedAt).toLocaleString()}
	</p>
</LightButton>
