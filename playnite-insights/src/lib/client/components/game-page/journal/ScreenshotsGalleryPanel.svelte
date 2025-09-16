<script lang="ts">
	import { withHttpClient } from '$lib/client/app-state/AppData.svelte';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
	import { m } from '$lib/paraglide/messages';
	import { ArrowLeft } from '@lucide/svelte';
	import { getAllScreenshotsResponseSchema, JsonStrategy } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';
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
	const screenshots = $state<{ paths: string[]; isLoading: boolean }>({
		paths: [],
		isLoading: false,
	});

	const loadScreenshots = async () => {
		try {
			await withHttpClient(async ({ client }) => {
				screenshots.isLoading = true;
				const response = await client.httpGetAsync({
					endpoint: '/api/assets/image/screenshot/all',
					strategy: new JsonStrategy(getAllScreenshotsResponseSchema),
				});
				screenshots.paths = response.screenshots;
			});
		} catch (error) {
			handleClientErrors(error, m.error_load_screenshots());
		} finally {
			screenshots.isLoading = false;
		}
	};

	const handleSwMessage = async (event: MessageEvent) => {
		if (!event.data || !Object.hasOwn(event.data, 'type') || !Object.hasOwn(event.data, 'pathname'))
			return;
		const type = event.data.type;
		const pathname = event.data.pathname;
		if (type === 'GAME_IMAGES_UPDATE' && pathname === '/api/assets/image/screenshot/all') {
			await loadScreenshots();
		}
	};

	onMount(() => {
		navigator.serviceWorker?.addEventListener('message', handleSwMessage);
		return () => {
			navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
		};
	});
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
		<AsideBody onMount={loadScreenshots}>
			{#if screenshots.isLoading}
				<Loading />
			{:else}
				<ul class={['grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4']}>
					{#each screenshots.paths as path (path)}
						<li>
							<LightButton
								class={['p-0! w-full']}
								onclick={() => props.onSelectImage(path)}
							>
								<img
									src={path}
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
