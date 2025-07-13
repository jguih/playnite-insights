<script lang="ts">
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { ChevronLeft, ChevronRight, ListFilter } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Select from '$lib/client/components/Select.svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import HeaderSearchBar from '$lib/client/components/HeaderSearchBar.svelte';
	import SelectedButton from '$lib/client/components/buttons/SelectedButton.svelte';
	import { makeHomePageViewModel } from '$lib/client/viewmodel/home';
	import { page } from '$app/state';
	import { type HomePageData } from '$lib/services/home-page/schemas';
	import Loading from '$lib/client/components/Loading.svelte';
	import SomethingWentWrong from '$lib/client/components/error/SomethingWentWrong.svelte';
	import FiltersSidebar from '$lib/client/components/home-page/FiltersSidebar.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import { filtersState } from '$lib/client/components/home-page/store.svelte';
	import { searchParamsKeys } from '$lib/services/home-page/validation';

	let { data }: PageProps = $props();
	let vm = $derived.by(() => makeHomePageViewModel({ data }));
	let currentPageSize = $derived(data.pageSize);
	let currentPage = $derived(Number(data.page));
	let main: HTMLElement | undefined = $state();
	$inspect(currentPageSize);

	const handleOnPageSizeChange: HTMLSelectAttributes['onchange'] = (event) => {
		const value = event.currentTarget.value;
		const params = new URLSearchParams(page.url.searchParams);
		params.set(searchParamsKeys.pageSize, value);
		params.set(searchParamsKeys.page, '1');
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true });
	};

	const handleOnPageChange = (_page: number) => {
		if (main) {
			main.scrollTop = 0;
		}
		const params = new URLSearchParams(page.url.searchParams);
		params.set(searchParamsKeys.page, String(_page));
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true });
	};
</script>

{#snippet gameCard(game: HomePageData['games'][number])}
	<li
		class="hover:border-primary-500 active:border-primary-500 focus:border-primary-500 border-background-1 m-0 aspect-[1/1.6] border-4 border-solid p-0 shadow-md outline-0"
	>
		<a href={`/game/${game.Id}`}>
			<img
				src={vm.getImageURL(game.CoverImage)}
				alt={`${game.Name} cover image`}
				loading="lazy"
				class="h-7/8 w-full object-cover"
			/>
			<div
				class="bg-background-1 bottom-0 flex h-1/8 w-full flex-row items-center justify-center p-1"
			>
				<p class="mt-1 truncate text-center text-sm text-white">{game.Name}</p>
			</div>
		</a>
	</li>
{/snippet}

<BaseAppLayout>
	<FiltersSidebar />
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
		<div class="flex flex-row items-center gap-2">
			<HeaderSearchBar />
			<LightButton>
				<ListFilter onclick={() => (filtersState.show = !filtersState.show)} />
			</LightButton>
		</div>
	</Header>
	{#await vm.load()}
		<Main>
			<h1 class="text-lg">{m.home_title()}</h1>
			<div class="mb-2">
				<div class="my-[0.35rem] h-[0.875rem] w-40 animate-pulse bg-neutral-300/60"></div>
			</div>
			<label for="page_size" class="text-md mb-2 flex items-center justify-end gap-2">
				{m.home_label_items_per_page()}
				<Select onchange={handleOnPageSizeChange} value={currentPageSize} id="page_size">
					{#each vm.getPageSizeList() as option}
						<option value={option}>{option}</option>
					{/each}
				</Select>
			</label>
			<Loading />
		</Main>
	{:then}
		<Main bind:main>
			{#if vm.getIsError()}
				<SomethingWentWrong />
			{:else}
				<h1 class="text-lg">{m.home_title()}</h1>
				<div class="mb-2">
					{#if vm.getTotalGamesCount() === 0}
						<p class="text-sm text-neutral-300/60">{m.home_no_games_found()}</p>
					{/if}
					{#if vm.getTotalGamesCount() > 0}
						<p class="text-sm text-neutral-300/60">
							{m.home_showing_games_counter({
								count1: vm.getGameCountFrom(),
								count2: vm.getGameCountTo(),
								totalCount: vm.getTotalGamesCount()
							})}
						</p>
					{/if}
				</div>
				<label for="page_size" class="text-md mb-2 flex items-center justify-end gap-2">
					{m.home_label_items_per_page()}
					<Select onchange={handleOnPageSizeChange} value={currentPageSize} id="page_size">
						{#each vm.getPageSizeList() as option}
							<option value={option}>{option}</option>
						{/each}
					</Select>
				</label>

				{#key currentPage}
					<ul class="mb-6 grid list-none grid-cols-2 gap-2 p-0">
						{#each vm.getGameList() as game}
							{@render gameCard(game)}
						{/each}
					</ul>
				{/key}

				<nav class="mt-4 flex flex-row justify-center gap-2">
					<LightButton
						disabled={currentPage <= 1}
						onclick={() => handleOnPageChange(currentPage - 1)}
					>
						<ChevronLeft />
					</LightButton>

					{#if currentPage > 1}
						<LightButton onclick={() => handleOnPageChange(currentPage - 1)}>
							{currentPage - 1}
						</LightButton>
					{/if}
					<SelectedButton onclick={() => handleOnPageChange(currentPage)}>
						{currentPage}
					</SelectedButton>
					{#if currentPage < vm.getTotalPages()}
						<LightButton onclick={() => handleOnPageChange(currentPage + 1)}>
							{currentPage + 1}
						</LightButton>
					{/if}

					<LightButton
						onclick={() => handleOnPageChange(currentPage + 1)}
						disabled={currentPage >= vm.getTotalPages()}
					>
						<ChevronRight />
					</LightButton>
				</nav>
			{/if}
		</Main>
	{/await}

	<BottomNav>
		<Home selected={true} />
		<Dashboard />
		<Settings />
	</BottomNav>
</BaseAppLayout>
