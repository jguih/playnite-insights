<script lang="ts">
	import AppLayoutWithoutBottomNav from '$lib/components/AppLayoutWithoutBottomNav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();

	const getImageUrl = (imagePath?: string | null) => {
		if (!imagePath) return '';
		const [gameId, imageFileName] = imagePath.split('\\');
		return `/api/assets/image/${gameId}/${imageFileName}`;
	};
</script>

{#snippet action()}
	<MenuButton onclick={() => history.back()}>
		<ArrowLeft />
	</MenuButton>
{/snippet}

{#snippet divider(className?: string)}
	<hr class="border-background-2 {className}" />
{/snippet}

{#snippet infoSection(label: string, value: string)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-nowrap">{label}</p>
		<p class="break-all">{value}</p>
	</div>
	{@render divider()}
{/snippet}

<AppLayoutWithoutBottomNav>
	<Header {action} />
	<Main>
		{#if !data.game}
			<p class="text-red-500">Game not found.</p>
		{:else}
			<h2 class="mb-4 text-2xl font-semibold">{data.game.Name}</h2>
			<img
				src={getImageUrl(data.game.BackgroundImage)}
				alt={`${data.game.Name} icon`}
				class="aspect-3/2 w-full"
			/>
			<div class="mt-4 mb-4 flex flex-col gap-1">
				{#if data.game.ReleaseDate?.ReleaseDate}
					{@render infoSection(
						'Release date',
						new Date(data.game.ReleaseDate?.ReleaseDate).toLocaleDateString() ?? ''
					)}
				{/if}
				{@render infoSection('Install directory', data.game.InstallDirectory ?? '')}
				{#if data.game.Added}
					{@render infoSection('Added', new Date(data.game.Added).toLocaleDateString() ?? '')}
				{/if}
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
