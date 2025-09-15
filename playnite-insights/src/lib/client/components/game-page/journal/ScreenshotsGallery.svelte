<script lang="ts">
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
		height={100}
		class={['z-23!']}
	>
		<AsideBody header={false}>
			<ul class={['mb-6 grid list-none grid-cols-2 gap-2 p-0']}>
				<li></li>
			</ul>
		</AsideBody>
	</BottomSheet>
{/if}
