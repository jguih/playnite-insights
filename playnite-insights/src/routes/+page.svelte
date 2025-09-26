<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { locator, serverTimeSignal } from '$lib/client/app-state/AppData.svelte.js';
	import LightAnchor from '$lib/client/components/anchors/LightAnchor.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home, { updateBottomNavHomeHref } from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import SolidButton from '$lib/client/components/buttons/SolidButton.svelte';
	import Select from '$lib/client/components/forms/Select.svelte';
	import Header from '$lib/client/components/header/Header.svelte';
	import FiltersButton from '$lib/client/components/home-page/FiltersButton.svelte';
	import FiltersSidebar from '$lib/client/components/home-page/FiltersSidebar.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import SearchBar from '$lib/client/components/SearchBar.svelte';
	import { DateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte';
	import { HomePageViewModel } from '$lib/client/viewmodel/homePageViewModel.svelte';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import {
		gameSortBy,
		gameSortOrder,
		homePageSearchParamsFilterKeys,
		homePageSearchParamsKeys,
		type HomePageSearchParamKeys,
		type PlayniteGame,
	} from '@playnite-insights/lib/client';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let main: HTMLElement | undefined = $state();
	const dateTimeHandler = new DateTimeHandler({ serverTimeSignal: serverTimeSignal });
	const recentActivityVm = new RecentActivityViewModel({
		gameStore: locator.gameStore,
		gameSessionStore: locator.gameSessionStore,
		dateTimeHandler: dateTimeHandler,
	});
	const vm = new HomePageViewModel({
		getPageData: () => data,
		gameStore: locator.gameStore,
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

	// Save current applied filters before navigate
	beforeNavigate(() => {
		const params = new URLSearchParams(page.url.searchParams);
		const newHref = `${page.url.pathname}?${params.toString()}`;
		updateBottomNavHomeHref(newHref);
	});
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
		<a href={`/game/?id=${game.Id}`}>
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

{#snippet gameCardSkeleton()}
	<li
		class={['m-0 aspect-[1/1.6] p-0 shadow outline-0', 'border-background-1 border-4 border-solid']}
	>
		<div class="h-7/8 bg-background-3 w-full animate-pulse"></div>
		<div
			class="bg-background-1 h-1/8 bottom-0 flex w-full flex-row items-center justify-center p-1"
		>
			<div class="bg-background-3 h-4 w-3/4 animate-pulse rounded"></div>
		</div>
	</li>
{/snippet}

<FiltersSidebar
	{setSearchParam}
	{appendSearchParam}
	{removeSearchParam}
	installedParam={vm.filter.installed}
	notInstalledParam={vm.filter.notInstalled}
	sortByParam={vm.sort.by}
	sortOrderParam={vm.sort.order}
	developersParam={vm.filter.developers}
	publishersParam={vm.filter.publishers}
	platformsParam={vm.filter.platforms}
	genresParam={vm.filter.genres}
	onClearAllFilters={removeAllFilterParams}
>
	{#snippet renderSortOrderOptions()}
		{#each gameSortOrder as sortOrder (sortOrder)}
			<option value={sortOrder}>{vm.getSortOrderLabel(sortOrder)}</option>
		{/each}
	{/snippet}
	{#snippet renderSortByOptions()}
		{#each gameSortBy as sortBy (sortBy)}
			<option value={sortBy}>{vm.getSortByLabel(sortBy)}</option>
		{/each}
	{/snippet}
</FiltersSidebar>
<BaseAppLayout>
	<Header class={['flex flex-row items-center gap-2']}>
		<a
			href={`/?${page.url.searchParams.toString()}`}
			class="h-fit w-fit"
		>
			<img
				src="/app-icon.png"
				class="aspect-auto h-8 w-10 rounded-md object-contain"
				alt="app icon"
			/>
		</a>
		<div class="flex grow flex-row items-center gap-2">
			<SearchBar
				value={vm.filter.query}
				onChange={(v) => setSearchParam(homePageSearchParamsKeys.query, v)}
			/>
			<FiltersButton
				counter={vm.filtersCount}
				disabled={vm.isLoading}
			/>
		</div>
	</Header>
	<Main bind:main>
		<h1 class="text-lg">{m.home_title()}</h1>
		<div class="mb-2">
			{#if vm.isLoading}
				<div class="mt-1 h-4 w-48 animate-pulse bg-neutral-300/60"></div>
			{:else if vm.totalGamesCount === 0}
				<p class="text-sm text-neutral-300/60">{m.home_no_games_found()}</p>
			{/if}
			{#if vm.totalGamesCount > 0}
				<p class="text-sm text-neutral-300/60">
					{m.home_showing_games_counter({
						count1: vm.gamesCountFrom,
						count2: vm.gamesCountTo,
						totalCount: vm.totalGamesCount,
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
				value={vm.pagination.pageSize}
				id="page_size"
				class={['bg-background-1!']}
				disabled={vm.isLoading}
			>
				{#each vm.pageSizes as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</Select>
		</label>

		{#key vm.pagination.currentPage}
			{#if vm.isLoading}
				<ul class="mb-6 grid list-none grid-cols-2 gap-2 p-0">
					{#each new Array(Number(vm.pagination.pageSize)).fill(null) as _}
						{@render gameCardSkeleton()}
					{/each}
				</ul>
			{:else if vm.games}
				<ul class="mb-6 grid list-none grid-cols-2 gap-2 p-0">
					{#each vm.games as game (game.Id)}
						{@render gameCard(game)}
					{/each}
				</ul>
			{:else}
				<p class="text-md w-full text-center">{m.home_no_games_found()}</p>
			{/if}
		{/key}

		<nav class="mt-4 flex flex-row justify-center gap-2">
			<LightButton
				disabled={vm.pagination.currentPage <= 1}
				onclick={() => handleOnPageChange(vm.pagination.currentPage - 1)}
				class={['px-2 py-1']}
				aria-label="previous page"
			>
				<ChevronLeft />
			</LightButton>
			{#each vm.pagination.pages as page (page)}
				{#if page === null}
					<span class="px-2">…</span>
				{:else if page === vm.pagination.currentPage}
					<SolidButton
						selected
						class={['px-2 py-1']}
					>
						{page}
					</SolidButton>
				{:else}
					<LightButton
						onclick={() => handleOnPageChange(page)}
						class={['px-2 py-1']}
					>
						{page}</LightButton
					>
				{/if}
			{/each}
			<LightButton
				onclick={() => handleOnPageChange(vm.pagination.currentPage + 1)}
				disabled={vm.pagination.currentPage >= vm.pagination.totalPages}
				class={['px-2 py-1']}
				aria-label="next page"
			>
				<ChevronRight />
			</LightButton>
		</nav>
		{#if recentActivityVm.inProgressGame}
			<div class="fixed bottom-[var(--bottom-nav-height)] left-0 z-20 w-full p-2">
				<LightAnchor
					class={['bg-background-1! flex w-full items-center justify-start gap-4 p-2 shadow']}
					href={`/game/${recentActivityVm.inProgressGame.Id}/journal`}
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
					<ChevronRight class="size-lg ml-auto" />
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
