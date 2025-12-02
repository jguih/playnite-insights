<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Trash } from '@lucide/svelte';
	import LightButton from '../../buttons/LightButton.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';

	let props: {
		isOpen: boolean;
		onClose: () => void | Promise<void>;
		onRemoveImage: () => void | Promise<void>;
	} = $props();
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
			<ul class={['flex flex-col justify-start gap-2']}>
				<li>
					<LightButton
						justify="start"
						size="md"
						class={['w-full gap-3!']}
						onclick={props.onRemoveImage}
					>
						<Trash class={['size-md']} />
						{m.label_note_editor_image_option_remove()}
					</LightButton>
				</li>
			</ul>
		</AsideBody>
	</BottomSheet>
{/if}
