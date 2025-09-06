<script lang="ts">
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Select from '$lib/client/components/forms/Select.svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import SearchBar from '$lib/client/components/SearchBar.svelte';
	import { makeHomePageViewModel } from '$lib/client/viewmodel/home';
	import { page } from '$app/state';
	import FiltersSidebar from '$lib/client/components/home-page/FiltersSidebar.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import {
		homePageSearchParamsFilterKeys,
		homePageSearchParamsKeys,
		type HomePageSearchParamKeys,
	} from '@playnite-insights/lib/client/home-page';
	import {
		gameSortBy,
		gameSortOrder,
		type PlayniteGame,
	} from '@playnite-insights/lib/client/playnite-game';
	import {
		gameSignal,
		recentGameSessionSignal,
		serverTimeSignal,
	} from '$lib/client/app-state/AppData.svelte';
	import FiltersButton from '$lib/client/components/home-page/FiltersButton.svelte';
	import LightAnchor from '$lib/client/components/anchors/LightAnchor.svelte';
	import { DateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte';

	let { data }: PageProps = $props();
	let vm = $derived.by(() => {
		const games = gameSignal;
		const gameList = games.raw ? [...games.raw] : undefined;
		const params = { ...data };
		return makeHomePageViewModel(gameList, params);
	});
	let gamesFiltered = $derived(vm.getGameList());
	let pageSizeParam = $derived(data.pageSize);
	let pageParam = $derived(Number(data.page));
	let installedParam = $derived(data.installed);
	let notInstalledParam = $derived(data.notInstalled);
	let sortByParam = $derived(data.sortBy);
	let sortOrderParam = $derived(data.sortOrder);
	let queryParam = $derived(data.query);
	let developersParam = $derived(data.developers);
	let publishersParam = $derived(data.publishers);
	let platformsParam = $derived(data.platforms);
	let genresParam = $derived(data.genres);
	let main: HTMLElement | undefined = $state();
	const dateTimeHandler = new DateTimeHandler({ serverTimeSignal: serverTimeSignal });
	const recentActivityVm = new RecentActivityViewModel({
		gameSignal: gameSignal,
		recentGameSessionSignal: recentGameSessionSignal,
		dateTimeHandler: dateTimeHandler,
	});

	const handleOnPageSizeChange: HTMLSelectAttributes['onchange'] = (event) => {
		const value = event.currentTarget.value;
		const params = new URLSearchParams(page.url.searchParams);
		params.set(homePageSearchParamsKeys.pageSize, value);
		params.set(homePageSearchParamsKeys.page, '1');
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true });
	};

	const handleOnPageChange = (value: number) => {
		const newParams = new URLSearchParams(page.url.searchParams);
		newParams.set(homePageSearchParamsKeys.page, String(value));
		const newUrl = `${page.url.pathname}?${newParams.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true });
	};

	const setSearchParam = (key: HomePageSearchParamKeys, value: string | boolean | null) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(homePageSearchParamsKeys.page, '1');
		if (!value) {
			params.delete(key);
		} else if (typeof value === 'string') {
			if (value === '') params.delete(key);
			else params.set(key, value);
		} else if (typeof value === 'boolean') {
			if (value) params.set(key, '1');
			else params.delete(key);
		}
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true, keepFocus: true });
	};

	const appendSearchParam = (key: HomePageSearchParamKeys, value: string) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(homePageSearchParamsKeys.page, '1');
		params.append(key, value);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true, keepFocus: true });
	};

	const removeSearchParam = (key: HomePageSearchParamKeys, value?: string | null) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(homePageSearchParamsKeys.page, '1');
		if (value) params.delete(key, value);
		else params.delete(key);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true, keepFocus: true });
	};

	const removeAllFilterParams = () => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(homePageSearchParamsKeys.page, '1');
		for (const filterParamKey of Object.values(homePageSearchParamsFilterKeys)) {
			params.delete(filterParamKey);
		}
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		if (main) {
			main.scrollTop = 0;
		}
		goto(newUrl, { replaceState: true, keepFocus: true });
	};
</script>

{#snippet gameCard(game: PlayniteGame)}
	<li
		class={[
			'm-0 aspect-[1/1.6] p-0 shadow outline-0',
			'border-background-1 border-4 border-solid',
			'hover:border-primary-light-hover-fg',
			'active:border-primary-light-active-fg',
			'focus:border-primary-light-active-fg',
		]}
	>
		<a href={`/game/${game.Id}`}>
			<img
				src={vm.getImageURL(game.CoverImage)}
				alt={`${game.Name} cover image`}
				loading="lazy"
				class="h-7/8 w-full object-cover"
			/>
			<div
				class="bg-background-1 h-1/8 bottom-0 flex w-full flex-row items-center justify-center p-1"
			>
				<p class="mt-1 truncate text-center text-sm text-white">{game.Name}</p>
			</div>
		</a>
	</li>
{/snippet}

<FiltersSidebar
	{setSearchParam}
	{appendSearchParam}
	{removeSearchParam}
	{installedParam}
	{notInstalledParam}
	{sortByParam}
	{sortOrderParam}
	{developersParam}
	{publishersParam}
	{platformsParam}
	{genresParam}
	onClearAllFilters={removeAllFilterParams}
>
	{#snippet renderSortOrderOptions()}
		{#each gameSortOrder as sortOrder}
			<option value={sortOrder}>{vm.getSortOrderLabel(sortOrder)}</option>
		{/each}
	{/snippet}
	{#snippet renderSortByOptions()}
		{#each gameSortBy as sortBy}
			<option value={sortBy}>{vm.getSortByLabel(sortBy)}</option>
		{/each}
	{/snippet}
</FiltersSidebar>
<BaseAppLayout>
	<Header>
		{#snippet action()}
			<a
				class=""
				href={`/?${page.url.searchParams.toString()}`}
			>
				<img
					src="/app-icon.png"
					class="aspect-auto h-8 w-10 rounded-md object-contain"
					alt="app icon"
				/>
			</a>
		{/snippet}
		<div class="flex flex-row items-center gap-2">
			<SearchBar
				value={queryParam}
				onChange={(v) => setSearchParam(homePageSearchParamsKeys.query, v)}
			/>
			<FiltersButton counter={vm.getFiltersCount()} />
		</div>
	</Header>
	<Main bind:main>
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
						totalCount: vm.getTotalGamesCount(),
					})}
				</p>
			{/if}
		</div>
		<label
			for="page_size"
			class="text-md mb-2 flex items-center justify-end gap-2"
		>
			{m.home_label_items_per_page()}
			<Select
				onchange={handleOnPageSizeChange}
				value={pageSizeParam}
				id="page_size"
				class={['bg-background-1!']}
			>
				{#each vm.getPageSizeList() as option}
					<option value={option}>{option}</option>
				{/each}
			</Select>
		</label>

		{#key pageParam}
			{#if gamesFiltered}
				<ul class="mb-6 grid list-none grid-cols-2 gap-2 p-0">
					{#each gamesFiltered as game}
						{@render gameCard(game)}
					{/each}
				</ul>
			{:else}
				<p class="text-md w-full text-center">{m.home_no_games_found()}</p>
			{/if}
		{/key}

		<nav class="mt-4 flex flex-row justify-center gap-2">
			<LightButton
				disabled={pageParam <= 1}
				onclick={() => handleOnPageChange(pageParam - 1)}
			>
				<ChevronLeft />
			</LightButton>

			{#if pageParam > 1}
				<LightButton onclick={() => handleOnPageChange(pageParam - 1)}>
					{pageParam - 1}
				</LightButton>
			{/if}
			<LightButton
				onclick={() => handleOnPageChange(pageParam)}
				selected
			>
				{pageParam}
			</LightButton>
			{#if pageParam < vm.getTotalPages()}
				<LightButton onclick={() => handleOnPageChange(pageParam + 1)}>
					{pageParam + 1}
				</LightButton>
			{/if}

			<LightButton
				onclick={() => handleOnPageChange(pageParam + 1)}
				disabled={pageParam >= vm.getTotalPages()}
			>
				<ChevronRight />
			</LightButton>
		</nav>
		{#if recentActivityVm.inProgressGame}
			<div class="z-1000 fixed bottom-[var(--bottom-nav-height)] left-0 w-full p-2">
				<LightAnchor
					class={['bg-background-1! flex w-full items-center justify-start gap-4 p-2 shadow']}
					href={`/game/${recentActivityVm.inProgressGame.Id}/activity`}
				>
					<img
						src={vm.getImageURL(recentActivityVm.inProgressGame.CoverImage)}
						alt={`${recentActivityVm.inProgressGame.Name} cover image`}
						loading="lazy"
						class="h-13 max-w-13 truncate object-cover"
					/>
					<div class="leading-5">
						<p class="text-md">{m.label_ongoing_session()}</p>
						<p class="text-md font-semibold">{recentActivityVm.inProgressGame.Name}</p>
					</div>
					<ChevronRight class="ml-auto size-6" />
				</LightAnchor>
			</div>
			<div class="pb-20"></div>
		{/if}
	</Main>

	<BottomNav>
		<Home selected={true} />
		<Dashboard />
		<Settings />
	</BottomNav>
</BaseAppLayout>
