<script lang="ts">
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import SomethingWentWrong from '$lib/client/components/error/SomethingWentWrong.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import AppLayoutWithoutBottomNav from '$lib/client/components/layout/AppLayoutWithoutBottomNav.svelte';
	import Loading from '$lib/client/components/Loading.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { makeGamePageViewModel } from '$lib/client/viewmodel/game.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();
	const vm = $derived.by(() => makeGamePageViewModel(data.promise));
	let game = $derived(vm.getGame());
</script>

{#snippet infoSection(label: string, value: string | number)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-nowrap">{label}</p>
		<p class="break-all">{value}</p>
	</div>
	<Divider />
{/snippet}

<AppLayoutWithoutBottomNav>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft />
			</LightButton>
		{/snippet}
	</Header>
	{#await vm.load()}
		<Main>
			<Loading />
		</Main>
	{:then}
		<Main>
			{#if vm.getIsError()}
				<SomethingWentWrong />
			{:else if game}
				<h2 class="mb-4 text-2xl font-semibold">{game.Name}</h2>
				<img
					src={vm.getImageURL(game.BackgroundImage)}
					alt={`${game.Name} background image`}
					class="aspect-3/2 w-full"
				/>
				<div class="mt-4 mb-4 flex flex-col">
					{@render infoSection(m.game_info_release_date(), vm.getReleaseDate())}
					{@render infoSection(m.game_info_added(), vm.getAdded())}
					{@render infoSection(m.game_info_playtime(), vm.getPlaytime())}
					{@render infoSection(m.game_info_developers(), vm.getDevelopers())}
					{@render infoSection(m.game_info_installed(), vm.getInstalled())}
					{#if Boolean(game.IsInstalled)}
						{@render infoSection(m.game_info_install_directory(), game.InstallDirectory ?? '')}
					{/if}
				</div>
				<div>
					{#if game.Description}
						{@html game.Description}
					{/if}
				</div>
				<img
					src={vm.getImageURL(game.Icon)}
					alt={`${game.Name} icon`}
					class="mt-4 aspect-square h-fit w-12 grow-0"
				/>
			{/if}
		</Main>
	{/await}
</AppLayoutWithoutBottomNav>
