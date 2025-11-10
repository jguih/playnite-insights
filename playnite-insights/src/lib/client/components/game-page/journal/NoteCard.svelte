<script lang="ts">
	import type { GameNote } from '@playatlas/game-library/core';
	import { onMount } from 'svelte';
	import BaseButton from '../../buttons/BaseButton.svelte';

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

<BaseButton
	class={[
		'flex-col! items-start! p-0! w-full',
		'hover:outline-primary-hover-bg hover:outline-2',
		'active:bg-primary-light-active-bg',
	]}
	onclick={() => onClick(note)}
	type="button"
>
	{#if note.ImagePath}
		<div class="bg-background-2 w-full">
			<img
				src={note.ImagePath}
				alt={`note image`}
				loading="lazy"
				class="mx-auto max-h-[35dvh] w-auto object-contain"
			/>
		</div>
	{/if}
	<div
		class="relative mb-2 max-h-[20dvh] w-full overflow-y-hidden px-4 pt-3 text-start"
		bind:this={noteContentEl}
	>
		{#if note.Title}
			<p class="block w-full truncate text-lg font-semibold">{note.Title}</p>
		{/if}
		{#if note.Content}
			<p class="text-md my-2 block w-full opacity-80">{note.Content}</p>
		{/if}
		{#if isOverflowing}
			<div
				class="from-background-1 pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t to-transparent"
			></div>
		{/if}
	</div>
	<p class="w-full p-2 pt-0 text-right text-sm opacity-60">
		{new Date(note.CreatedAt).toLocaleString()}
	</p>
</BaseButton>
