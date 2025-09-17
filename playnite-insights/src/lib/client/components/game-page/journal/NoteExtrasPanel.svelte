<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Image, ImagePlus, ScreenShare } from '@lucide/svelte';
	import LightButton from '../../buttons/LightButton.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';

	let props: {
		isOpen: boolean;
		onClose: () => void | Promise<void>;
		onSelectImage: (file: File) => void | Promise<void>;
		onTakeScreenshotFromPlaynite: () => void | Promise<void>;
		onAddAvailableScreenshot: () => void | Promise<void>;
	} = $props();
	let imageInput = $state<HTMLInputElement | null>(null);

	const handleOnImageChange = async () => {
		if (!imageInput || !imageInput.files) return;
		if (imageInput.files.length === 0) return;
		await props.onSelectImage(imageInput.files[0]);
		imageInput.value = '';
	};
</script>

{#if props.isOpen}
	<Backdrop
		onclick={() => props.onClose()}
		class={['z-22!']}
	/>
	<BottomSheet
		height={30}
		class={['z-23!']}
	>
		<AsideBody header={false}>
			<input
				type="file"
				name="file"
				accept="image/*"
				id="image-file"
				bind:this={imageInput}
				onchange={handleOnImageChange}
				class="hidden"
			/>
			<ul class={['flex flex-col justify-start gap-2']}>
				<li>
					<LightButton
						justify="start"
						size="md"
						class={['gap-3! w-full']}
						onclick={(e) => imageInput?.click()}
					>
						<ImagePlus class={['size-md']} />
						{m.label_note_editor_extras_add_image()}
					</LightButton>
				</li>
				<li>
					<LightButton
						justify="start"
						size="md"
						class={['gap-3! w-full']}
						onclick={props.onTakeScreenshotFromPlaynite}
					>
						<ScreenShare class={['size-md']} />
						{m.label_note_editor_extras_take_screenshot_from_playnite_host()}
					</LightButton>
				</li>
				<li>
					<LightButton
						justify="start"
						size="md"
						class={['gap-3! w-full']}
						onclick={props.onAddAvailableScreenshot}
					>
						<Image class={['size-md']} />
						{m.label_note_editor_extras_add_available_screenshot()}
					</LightButton>
				</li>
			</ul>
		</AsideBody>
	</BottomSheet>
{/if}
