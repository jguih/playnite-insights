<script lang="ts">
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import SomethingWentWrong from '$lib/client/components/error/SomethingWentWrong.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Loading from '$lib/client/components/Loading.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { fetchGames } from '$lib/client/utils/playnite-game.js';
	import { makeGamePageViewModel } from '$lib/client/viewmodel/game.js';
	import { m } from '$lib/paraglide/messages.js';
	import { gameStore } from '$lib/stores/app-data.svelte.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	const vm = $derived.by(() => {
		const games = gameStore.raw ? [...gameStore.raw] : undefined;
		const game = games?.find((g) => g.Id === data.gameId);
		return makeGamePageViewModel(game);
	});
	let game = $derived(vm.getGame());
	let isLoading: boolean = $state(false);
	let isError: boolean = $state(false);
	$inspect(game);

	onMount(async () => {
		if (!gameStore.raw) {
			isLoading = true;
			await fetchGames()
				.then((games) => {
					gameStore.raw = games;
					isError = false;
					isLoading = false;
				})
				.catch((err) => {
					isError = true;
					isLoading = false;
				});
		}
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
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft />
			</LightButton>
		{/snippet}
	</Header>
	<Main bottomNav={false}>
		{#if isError}
			<SomethingWentWrong />
		{:else if isLoading}
			<Loading />
		{:else if game}
			<h2 class="mb-4 text-2xl font-semibold">{game.Name}</h2>
			<img
				src={vm.getImageURL(game.BackgroundImage)}
				alt={`${game.Name} background image`}
				class="aspect-3/2 w-full"
			/>
			<div class="mb-4 mt-4 flex flex-col">
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
</BaseAppLayout>
