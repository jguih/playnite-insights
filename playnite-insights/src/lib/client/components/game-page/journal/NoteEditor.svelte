<script lang="ts">
	import { page } from '$app/state';
	import type { GameNote } from '@playnite-insights/lib/client';
	import BaseInput from '../../forms/BaseInput.svelte';
	import BaseTextarea from '../../forms/BaseTextarea.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';
	import SidebarBody from '../../sidebar/SidebarBody.svelte';

	const props: {
		currentNote: GameNote;
		handleOnChange: () => void;
		handleClose: () => void | Promise<void>;
	} = $props();
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);
	const delay = 1_000;

	const handleOnChange = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			props.handleOnChange();
		}, delay);
	};
</script>

{#if Object.hasOwn(page.state, 'bottomSheet')}
	<Backdrop onclick={() => props.handleClose()} />
	<BottomSheet height={80}>
		<SidebarBody class={['flex flex-col']}>
			<form class={['flex grow flex-col']}>
				<BaseInput
					type="text"
					placeholder="Título"
					class={['py-2 text-2xl font-semibold']}
					bind:value={props.currentNote.Title}
					oninput={handleOnChange}
				/>
				<BaseTextarea
					placeholder="Nota"
					class={['grow resize-none']}
					bind:value={props.currentNote.Content}
					oninput={handleOnChange}
				></BaseTextarea>
			</form>
		</SidebarBody>
	</BottomSheet>
{/if}
