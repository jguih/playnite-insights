<script lang="ts">
	import Backdrop from '../sidebar/Backdrop.svelte';
	import SidebarBody from '../sidebar/SidebarBody.svelte';
	import BottomSheet from '../sidebar/BottomSheet.svelte';
	import { page } from '$app/state';
	import BaseInput from '../forms/BaseInput.svelte';
	import BaseTextarea from '../forms/BaseTextarea.svelte';
	import { currentNoteValues } from './Lib.svelte';

	const closeNoteEditor = () => {
		history.back();
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
					bind:value={currentNoteValues.Title}
				/>
				<BaseTextarea
					placeholder="Nota"
					class={['grow resize-none']}
					bind:value={currentNoteValues.Content}
				></BaseTextarea>
			</form>
		</SidebarBody>
	</BottomSheet>
{/if}
