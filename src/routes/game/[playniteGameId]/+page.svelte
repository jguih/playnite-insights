<script lang="ts">
	import MenuButton from '$lib/client/components/buttons/MenuButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import AppLayoutWithoutBottomNav from '$lib/client/components/layout/AppLayoutWithoutBottomNav.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft, Search } from '@lucide/svelte';

	let { data } = $props();
	const game = $derived(data.game);

	const getImageUrl = $derived((imagePath?: string | null) => {
		if (!imagePath) return '';
		const [gameId, imageFileName] = imagePath.split('\\');
		return `/api/assets/image/${gameId}/${imageFileName}`;
	});

	const getDevelopers = $derived((): string => {
		return game?.Developers?.map((dev) => dev.Name).join(', ') ?? '';
	});

	const getPlaytime = $derived((): string => {
		if (game?.Playtime) {
			return (game.Playtime / 3600).toFixed(1);
		}
		return '0';
	});

	const getAdded = $derived((): string => {
		if (game?.Added) {
			return new Date(game.Added).toLocaleDateString();
		}
		return '';
	});

	const getReleaseDate = $derived((): string => {
		if (game?.ReleaseDate) {
			return new Date(game.ReleaseDate).toLocaleDateString();
		}
		return '';
	});

	const getInstalled = $derived((): string => {
		if (Boolean(game?.IsInstalled)) {
			return m.yes();
		}
		return m.no();
	});
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
			<MenuButton onclick={() => history.back()}>
				<ArrowLeft />
			</MenuButton>
		{/snippet}
		<MenuButton class="ml-auto w-fit">
			<Search />
		</MenuButton>
	</Header>
	<Main>
		{#if !data.game}
			<p class="text-red-500">Game not found.</p>
		{:else}
			<h2 class="mb-4 text-2xl font-semibold">{data.game.Name}</h2>
			<img
				src={getImageUrl(data.game.BackgroundImage)}
				alt={`${data.game.Name} background image`}
				class="aspect-3/2 w-full"
			/>
			<div class="mt-4 mb-4 flex flex-col">
				{@render infoSection(m.game_info_release_date(), getReleaseDate())}
				{@render infoSection(m.game_info_added(), getAdded())}
				{@render infoSection(
					m.game_info_playtime(),
					m.game_playtime_in_hour({ hours: getPlaytime() })
				)}
				{@render infoSection(m.game_info_developers(), getDevelopers())}
				{@render infoSection(m.game_info_install_directory(), data.game.InstallDirectory ?? '')}
				{@render infoSection(m.game_info_installed(), getInstalled())}
			</div>
			<div>
				{#if data.game.Description}
					{@html data.game.Description}
				{/if}
			</div>
			<img
				src={getImageUrl(data.game.Icon)}
				alt={`${data.game.Name} icon`}
				class="mt-4 aspect-square h-fit w-12 grow-0"
			/>
		{/if}
	</Main>
</AppLayoutWithoutBottomNav>
