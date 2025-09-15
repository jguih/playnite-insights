<script lang="ts">
	import { withHttpClient } from '$lib/client/app-state/AppData.svelte';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
	import { getAllScreenshotsResponseSchema, JsonStrategy } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';
	import LightButton from '../../buttons/LightButton.svelte';
	import Loading from '../../Loading.svelte';
	import AsideBody from '../../sidebar/AsideBody.svelte';
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
			handleClientErrors(error, 'Failed to load available screenshots');
		} finally {
			screenshots.isLoading = false;
		}
	};

	onMount(() => {
		loadScreenshots();
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
		<AsideBody header={false}>
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
