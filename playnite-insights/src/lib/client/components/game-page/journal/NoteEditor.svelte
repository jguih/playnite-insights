<script lang="ts">
	import { page } from '$app/state';
	import { TrashIcon } from '@lucide/svelte';
	import type { GameNote } from '@playnite-insights/lib/client';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import LightButton from '../../buttons/LightButton.svelte';
	import BaseInput from '../../forms/BaseInput.svelte';
	import BaseTextarea from '../../forms/BaseTextarea.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
	import AsideHeader from '../../sidebar/AsideHeader.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';

	let props: {
		currentNote: GameNote;
		onChange: () => void;
		onClose: () => void | Promise<void>;
		onDelete: () => void | Promise<void>;
	} = $props();
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);
	let contentTextArea = $state<HTMLTextAreaElement | null>(null);
	const delay = 1_000;

	const handleOnChange = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			props.onChange();
		}, delay);
	};

	const handleTitleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === 'Enter' && contentTextArea) {
			e.preventDefault();
			contentTextArea.focus();
		}
	};
</script>

{#if Object.hasOwn(page.state, 'bottomSheet')}
	<Backdrop onclick={() => props.onClose()} />
	<BottomSheet height={80}>
		<form class="h-full">
			<AsideHeader>
				<BaseInput
					type="text"
					placeholder="Título"
					class={['text-2xl font-semibold']}
					bind:value={props.currentNote.Title}
					oninput={handleOnChange}
					onMount={({ input }) => {
						if (input) input.focus();
					}}
					enterkeyhint="next"
					onkeydown={handleTitleKeyDown}
				/>
				<LightButton
					type="button"
					color="neutral"
					onclick={props.onDelete}
				>
					<TrashIcon class={['size-lg']} />
				</LightButton>
			</AsideHeader>
			<AsideBody class={['flex grow flex-col']}>
				<BaseTextarea
					placeholder="Nota"
					class={['grow resize-none']}
					bind:value={props.currentNote.Content}
					bind:textArea={contentTextArea}
					oninput={handleOnChange}
				></BaseTextarea>
			</AsideBody>
		</form>
	</BottomSheet>
{/if}
