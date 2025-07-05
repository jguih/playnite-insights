<script lang="ts">
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { ArrowLeft, ChevronLeft, ChevronRight, Search } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Select from '$lib/client/components/Select.svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import HeaderSearchBar from '$lib/client/components/HeaderSearchBar.svelte';
	import BaseButton from '$lib/client/components/buttons/BaseButton.svelte';
	import SelectedButton from '$lib/client/components/buttons/SelectedButton.svelte';
	import { searchBarVisible } from '$lib/page/home/stores.svelte';

	let { data }: PageProps = $props();
	let currentPage = $derived(data.page);
	let currentQuery = $derived(data.query);
	let currentPageSize = $derived(data.pageSize);
	let currentOffset = $derived((currentPage - 1) * currentPageSize);
	let totalGamesCount = $derived(data.total ?? 0);
	let lastGameCountShown = $derived(Math.min(currentPageSize + currentOffset, totalGamesCount));
	let totalPages = $derived(data.totalPages ?? 1);
	let gameList = $derived(data.games ?? []);
	let main: HTMLElement | undefined = $state();

	const getCoverImageUrl = (coverImage?: string | null) => {
		if (!coverImage) return '';
		const [gameId, imageFileName] = coverImage.split('\\');
		return `/api/assets/image/${gameId}/${imageFileName}`;
	};

	const setSearchParams = $derived((key: string, value: string) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(key, value);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true });
	});

	const handleOnPageSizeChange: HTMLSelectAttributes['onchange'] = (event) => {
		const value = event.currentTarget.value;
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page_size', value);
		params.set('page', '1');
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true });
	};

	const handleOnPageChange = (page: number) => {
		if (main) {
			main.scrollTop = 0;
		}
		setSearchParams(`page`, String(page));
	};
</script>

{#snippet gameCard(game: (typeof gameList)[number])}
	<li
		class="hover:border-primary-500 active:border-primary-500 focus:border-primary-500 border-background-1 m-0 aspect-[1/1.6] border-4 border-solid p-0 shadow-md outline-0"
	>
		<a href={`/game/${game.Id}`}>
			<img
				src={getCoverImageUrl(game.CoverImage)}
				alt={`${game.Name} cover image`}
				loading="lazy"
				class="h-7/8 w-full object-cover"
			/>
			<div class="bg-background-1 bottom-0 flex h-1/8 w-full flex-row justify-center p-1">
				<p class="mt-1 truncate text-center text-sm text-white">{game.Name}</p>
			</div>
		</a>
	</li>
{/snippet}

{#key currentPage}
	<BaseAppLayout>
		{#if !searchBarVisible.isVisible}
			<Header>
				{#snippet action()}
					<a class="" href={`/?${page.url.searchParams.toString()}`}>
						<img
							src="/app-icon.png"
							class="aspect-auto h-8 w-10 rounded-md object-contain"
							alt="app icon"
						/>
					</a>
				{/snippet}
				<BaseButton
					onclick={() => (searchBarVisible.isVisible = !searchBarVisible.isVisible)}
					class="ml-auto w-fit"
				>
					<Search />
					{#if currentQuery}
						<span class="truncate opacity-70">{currentQuery}</span>
					{/if}
				</BaseButton>
			</Header>
		{:else}
			<Header>
				{#snippet action()}
					<BaseButton onclick={() => (searchBarVisible.isVisible = !searchBarVisible.isVisible)}>
						<ArrowLeft />
					</BaseButton>
				{/snippet}
				<HeaderSearchBar />
			</Header>
		{/if}
		<Main bind:main>
			<h1 class="text-lg">{m.home_title()}</h1>
			<div class="mb-2">
				{#if gameList.length === 0}
					<p class="text-sm text-neutral-300/60">{m.home_no_games_found()}</p>
				{/if}
				{#if gameList.length > 0}
					<p class="text-sm text-neutral-300/60">
						{m.home_showing_games_counter({
							count1: currentOffset,
							count2: lastGameCountShown,
							totalCount: totalGamesCount
						})}
					</p>
				{/if}
			</div>
			<label for="page_size" class="text-md mb-2 flex items-center justify-end gap-2">
				{m.home_label_items_per_page()}
				<Select onchange={handleOnPageSizeChange} bind:value={currentPageSize} id="page_size">
					{#each [2, 25, 50, 75, 100] as option}
						<option value={option}>{option}</option>
					{/each}
				</Select>
			</label>
			<ul class="mb-6 grid list-none grid-cols-2 gap-2 p-0">
				{#each gameList as game}
					{@render gameCard(game)}
				{/each}
			</ul>

			<nav class="mt-4 flex flex-row justify-center gap-2">
				<BaseButton disabled={currentPage <= 1} onclick={() => handleOnPageChange(currentPage - 1)}>
					<ChevronLeft />
				</BaseButton>

				{#if currentPage > 1}
					<BaseButton onclick={() => handleOnPageChange(currentPage - 1)}>
						{currentPage - 1}
					</BaseButton>
				{/if}
				<SelectedButton onclick={() => handleOnPageChange(currentPage)}>
					{currentPage}
				</SelectedButton>
				{#if currentPage < totalPages}
					<BaseButton onclick={() => handleOnPageChange(currentPage + 1)}>
						{currentPage + 1}
					</BaseButton>
				{/if}

				<BaseButton
					onclick={() => handleOnPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					<ChevronRight />
				</BaseButton>
			</nav>
		</Main>

		<BottomNav>
			<Home selected={true} />
			<Dashboard />
			<Settings />
		</BottomNav>
	</BaseAppLayout>
{/key}
