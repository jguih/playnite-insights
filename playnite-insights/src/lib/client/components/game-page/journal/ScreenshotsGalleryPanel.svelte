<script lang="ts">
	import { getLocatorContext } from '$lib/client/app-state/serviceLocator.svelte';
	import { m } from '$lib/paraglide/messages';
	import { ArrowLeft } from '@lucide/svelte';
	import LightButton from '../../buttons/LightButton.svelte';
	import Loading from '../../Loading.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
	import AsideHeader from '../../sidebar/AsideHeader.svelte';
	import Backdrop from '../../sidebar/Backdrop.svelte';
	import BottomSheet from '../../sidebar/BottomSheet.svelte';

	let props: {
		isOpen: boolean;
		onClose: () => void | Promise<void>;
		onSelectImage: (path: string) => void | Promise<void>;
	} = $props();

	const locator = getLocatorContext();
	const { screenshotStore } = locator;
</script>

{#if props.isOpen}
	<Backdrop
		onclick={() => props.onClose()}
		class={['z-23!']}
	/>
	<BottomSheet
		height={100}
		class={['z-24!']}
	>
		<AsideHeader>
			<div class="flex gap-2">
				<LightButton onclick={() => props.onClose()}>
					<ArrowLeft class={['size-md']} />
				</LightButton>
				<h1 class="text-lg">{m.image_gallery()}</h1>
			</div>
			<div></div>
		</AsideHeader>
		<AsideBody>
			{#if !screenshotStore.hasLoaded || !screenshotStore.screenshotList}
				<Loading />
			{:else}
				<ul class={['grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4']}>
					{#each screenshotStore.screenshotList as screenshot (screenshot.Id)}
						<li>
							<LightButton
								class={['p-0! w-full']}
								onclick={() => props.onSelectImage(screenshot.Path)}
							>
								<img
									src={screenshot.Path}
									alt="screenshot"
									loading="lazy"
									class={['h-48 w-full object-cover']}
								/>
							</LightButton>
						</li>
					{/each}
				</ul>
			{/if}
		</AsideBody>
	</BottomSheet>
{/if}
