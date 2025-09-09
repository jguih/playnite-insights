<script
	lang="ts"
	module
>
	import { pushState } from '$app/navigation';
	import { factory } from '$lib/client/app-state/AppData.svelte';
	import type { GameNote } from '@playnite-insights/lib/client';

	export const openNoteEditor = () => {
		pushState('', { bottomSheet: true });
	};

	export const closeNoteEditor = () => {
		history.back();
	};

	export const currentNoteSignal = $state<GameNote>(
		factory.gameNote.create({
			Title: null,
			Content: null,
			GameId: null,
			ImagePath: null,
			SessionId: null,
		}),
	);
</script>
