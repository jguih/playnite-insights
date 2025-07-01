<script lang="ts">
	import AppLayout from '$lib/components/AppLayout.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';
	import { ChevronLeft, ChevronRight, Home, LayoutDashboard, Menu, Settings } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import MenuAnchor from '$lib/components/MenuAnchor.svelte';
	import Select from '$lib/components/Select.svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MenuButton from '$lib/components/MenuButton.svelte';
  import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import { setLocale } from '$lib/paraglide/runtime';

	let { data }: PageProps = $props();
	let currentPage = $derived(data.page);
	let totalPages = $derived(data.totalPages);
	let totalGamesCount = $derived(data.totalGamesCount);
	let pageSize = $derived(Number(page.url.searchParams.get('page_size')));
	let gameList = $derived(data.games);
  let main: HTMLElement | undefined = $state();

	const getCoverImageUrl = (game: (typeof data.games)[number]) => {
		if (!game.CoverImage) return '';
		const [gameId, imageFileName] = game.CoverImage.split('\\');
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
    if(main) {
      main.scrollTop = 0;
    }
		goto(newUrl, { replaceState: true });
	};

	const handleOnPageChange = (page: number) => {
    if(main) {
      main.scrollTop = 0;
    }
		setSearchParams(`page`, String(page));
	};
</script>

{#snippet action()}
	<MenuAnchor>
		<Menu strokeWidth={1.75} />
	</MenuAnchor>
{/snippet}

<AppLayout>
	<Header {action} />
	<Main bind:main={main}>
		<h1 class="text-lg">{m.home_title()}</h1>
		<div class="mb-2">
			{#if gameList.length === 0}
				<p class="text-sm text-neutral-300/60">{m.home_no_games_found()}</p>
			{/if}
			{#if gameList.length > 0}
				<p class="text-sm text-neutral-300/60">
					{m.home_showing_games_counter({currentCount: gameList.length, totalCount: totalGamesCount})}
				</p>
			{/if}
		</div>
		<label for="page_size" class="text-md mb-2 flex items-center justify-end gap-2">
			{m.home_label_items_per_page()}
			<Select onchange={handleOnPageSizeChange} bind:value={pageSize} id="page_size">
				{#each [4, 25, 50, 75, 100] as option}
					<option value={option}>{option}</option>
				{/each}
			</Select>
		</label>
		<ul class="mb-6 flex list-none flex-row flex-wrap justify-center gap-4 p-0">
			{#each gameList as game}
				<li
					class="hover:border-primary-500 active:border-primary-500 focus:border-primary-500 m-0 aspect-[1/1.6] max-w-38 border-4 border-solid border-transparent p-0 shadow-md outline-0 sm:max-w-52"
				>
					<a href={`/game/${game.Id}`}>
						<img
							src={getCoverImageUrl(game)}
							alt={`${game.Name} cover image`}
							loading="lazy"
							class="aspect-square h-8/9 w-full object-cover"
						/>
						<div class="bg-background-1 bottom-0 h-1/9 w-full p-1">
							<p class="truncate text-center text-sm text-white">{game.Name}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>

		<nav class="mt-4 flex flex-row justify-center gap-2">
			<MenuButton disabled={currentPage <= 1} onclick={() => handleOnPageChange(currentPage - 1)}
				><ChevronLeft />
			</MenuButton>

			{#if currentPage > 1}
				<MenuButton onclick={() => handleOnPageChange(currentPage - 1)}
					>{currentPage - 1}
				</MenuButton>
			{/if}
			<MenuButton onclick={() => handleOnPageChange(currentPage)} selected>
				{currentPage}
			</MenuButton>
			{#if currentPage < totalPages}
				<MenuButton onclick={() => handleOnPageChange(currentPage + 1)}
					>{currentPage + 1}</MenuButton
				>
			{/if}

			<MenuButton
				onclick={() => handleOnPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages}
			>
				<ChevronRight />
			</MenuButton>
		</nav>
	</Main>

	<BottomNav>
		<MenuAnchor selected>
			<Home />
		</MenuAnchor>
		<MenuAnchor disabled>
			<LayoutDashboard />
		</MenuAnchor>
		<MenuAnchor disabled>
			<Settings />
		</MenuAnchor>
	</BottomNav>
</AppLayout>
