<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { ArrowLeft, PlusSquare, TrashIcon } from '@lucide/svelte';
	import { type GameNote } from '@playnite-insights/lib/client';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import LightButton from '../../buttons/LightButton.svelte';
	import SolidButton from '../../buttons/SolidButton.svelte';
	import BaseInput from '../../forms/BaseInput.svelte';
	import BaseTextarea from '../../forms/BaseTextarea.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
	import AsideBottomNav from '../../sidebar/AsideBottomNav.svelte';
	import AsideHeader from '../../sidebar/AsideHeader.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';

	let props: {
		isOpen: boolean;
		currentNote: GameNote;
		onChange: () => void;
		onClose: () => void | Promise<void>;
		onDelete: () => void | Promise<void>;
		onOpenExtrasPanel: () => void | Promise<void>;
		onClickImage: () => void | Promise<void>;
	} = $props();
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);
	let contentTextArea = $state<HTMLTextAreaElement | null>(null);
	const delay = 1_000;

	const handleOnChange = () => {
		resizeContentTextArea();
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

	const resizeContentTextArea = () => {
		if (!contentTextArea) return;
		contentTextArea.style.height = 'auto';
		contentTextArea.style.height = contentTextArea?.scrollHeight + 'px';
	};
</script>

{#if props.isOpen}
	<Backdrop onclick={() => props.onClose()} />
	<BottomSheet height={100}>
		<AsideHeader>
			<LightButton onclick={() => props.onClose()}>
				<ArrowLeft class={['size-md']} />
			</LightButton>
			<LightButton
				type="button"
				color="neutral"
				onclick={props.onDelete}
			>
				<TrashIcon class={['size-md']} />
			</LightButton>
		</AsideHeader>
		<AsideBody bottomNav>
			<div class="flex flex-col">
				{#if props.currentNote.ImagePath}
					<LightButton
						class={['p-0!']}
						onclick={props.onClickImage}
					>
						<div class="bg-background-2 h-86">
							<img
								src={props.currentNote.ImagePath}
								alt={`note image`}
								loading="lazy"
								class="h-full w-full object-contain"
							/>
						</div>
					</LightButton>
				{/if}
				<form class="flex grow flex-col p-2">
					<BaseInput
						type="text"
						placeholder={m.placeholder_note_editor_title()}
						class={['text-2xl font-semibold']}
						bind:value={props.currentNote.Title}
						oninput={handleOnChange}
						enterkeyhint="next"
						onkeydown={handleTitleKeyDown}
						spellcheck="false"
					/>
					<BaseTextarea
						placeholder={m.placeholder_note_editor_content()}
						class={['mt-2 w-full grow resize-none overflow-hidden']}
						bind:value={props.currentNote.Content}
						bind:textArea={contentTextArea}
						oninput={handleOnChange}
						onMount={resizeContentTextArea}
						spellcheck="false"
					></BaseTextarea>
				</form>
			</div>
		</AsideBody>
		<AsideBottomNav>
			<SolidButton
				color="neutral"
				rounded
				aria-label="Add extras"
				class={['h-fit grow-0']}
				onclick={props.onOpenExtrasPanel}
			>
				<PlusSquare class={['size-md']} />
			</SolidButton>
		</AsideBottomNav>
	</BottomSheet>
{/if}
