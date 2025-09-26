<script lang="ts">
	import { locator } from '$lib/client/app-state/AppData.svelte.js';
	import SolidAnchor from '$lib/client/components/anchors/SolidAnchor.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Header from '$lib/client/components/header/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { GamePageViewModel } from '$lib/client/viewmodel/gamePageViewModel.svelte.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft } from '@lucide/svelte';

	const { data } = $props();
	const vm = new GamePageViewModel({
		getGameId: () => data.gameId,
		gameStore: locator.gameStore,
		companyStore: locator.companyStore,
	});
</script>

{#snippet infoSection(label: string, value: string | number)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-nowrap">{label}</p>
		<p class="break-all">{value}</p>
	</div>
	<Divider />
{/snippet}

<BaseAppLayout>
	<Header class={['flex items-center justify-center']}>
		<h1 class="block h-fit w-fit max-w-52 truncate text-xl underline">
			{vm?.game?.Name ?? ''}
		</h1>
		<LightButton
			onclick={() => history.back()}
			class={['absolute bottom-2 left-4 top-2']}
		>
			<ArrowLeft class={['size-md']} />
		</LightButton>
	</Header>
	<Main
		bottomNav={false}
		class={['p-0!']}
	>
		{#if vm.game}
			<img
				src={vm.getBackgroundImageUrl()}
				alt={`${vm.game.Name} background image`}
				class="max-h-[45dvh] w-full object-contain"
			/>
			<div class="p-4">
				<div class="mb-4">
					<SolidAnchor
						type="button"
						href={`/game/journal?id=${data.gameId}`}
						class={['block w-full text-center']}
					>
						{m.game_label_journal()}
					</SolidAnchor>
				</div>
				<div class="mb-4 mt-4 flex flex-col">
					{@render infoSection(m.game_info_release_date(), vm.getReleaseDate())}
					{@render infoSection(m.game_info_added(), vm.getAdded())}
					{@render infoSection(m.game_info_playtime(), vm.getPlaytime())}
					{@render infoSection(m.game_info_developers(), vm.getDevelopers())}
					{@render infoSection(m.game_info_installed(), vm.getInstalled())}
					{#if Boolean(vm.game.IsInstalled)}
						{@render infoSection(m.game_info_install_directory(), vm.game.InstallDirectory ?? '')}
					{/if}
				</div>
				<div>
					{#if vm.game.Description}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html vm.game.Description}
					{/if}
				</div>
				<img
					src={vm.getIconImageUrl()}
					alt={`${vm.game.Name} icon`}
					class="mt-4 aspect-square h-fit w-12 grow-0"
				/>
			</div>
		{/if}
	</Main>
</BaseAppLayout>
