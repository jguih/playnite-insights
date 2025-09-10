<script lang="ts">
	import { page } from '$app/state';
	import { factory, indexedDbSignal } from '$lib/client/app-state/AppData.svelte';
	import { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
	import type { GameNote } from '@playnite-insights/lib/client';
	import BaseInput from '../forms/BaseInput.svelte';
	import BaseTextarea from '../forms/BaseTextarea.svelte';
	import Backdrop from '../sidebar/Backdrop.svelte';
	import BottomSheet from '../sidebar/BottomSheet.svelte';
	import SidebarBody from '../sidebar/SidebarBody.svelte';
	import { closeNoteEditor } from './Lib.svelte';

	const props: { gameId: GameNote['GameId'] | null; sessionId: GameNote['SessionId'] | null } =
		$props();
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);
	const delay = 2_000;
	const repo = new GameNoteRepository({
		indexedDbSignal: indexedDbSignal,
		syncQueueFactory: factory.syncQueue,
	});

	const currentNoteSignal = $derived.by(() => {
		const gameId = props.gameId;
		const sessionId = props.sessionId;
		const note = factory.gameNote.create({
			Title: null,
			Content: null,
			ImagePath: null,
			GameId: gameId,
			SessionId: sessionId,
		});
		return note;
	});

	const handleOnChange = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(async () => {
			const note = { ...currentNoteSignal };
			await repo.putAsync({ note });
		}, delay);
	};
</script>

{#if Object.hasOwn(page.state, 'bottomSheet')}
	<Backdrop onclick={() => closeNoteEditor()} />
	<BottomSheet height={80}>
		<SidebarBody class={['flex flex-col']}>
			<form class={['flex grow flex-col']}>
				<BaseInput
					type="text"
					placeholder="Título"
					class={['py-2 text-2xl font-semibold']}
					bind:value={currentNoteSignal.Title}
					oninput={handleOnChange}
				/>
				<BaseTextarea
					placeholder="Nota"
					class={['grow resize-none']}
					bind:value={currentNoteSignal.Content}
					oninput={handleOnChange}
				></BaseTextarea>
			</form>
		</SidebarBody>
	</BottomSheet>
{/if}
