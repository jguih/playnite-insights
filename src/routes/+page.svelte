<script lang="ts">
	import AppLayout from '$lib/client/components/AppLayout.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { ChevronLeft, ChevronRight, Menu, Search } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import MenuAnchor from '$lib/client/components/MenuAnchor.svelte';
	import Select from '$lib/client/components/Select.svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MenuButton from '$lib/client/components/MenuButton.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';

	let { data }: PageProps = $props();
	let pageData = $derived(data.pageData ?? { data: [], totalPages: 1, total: 0, pageSize: 50 });
	let currentPage = $derived(Number(page.url.searchParams.get('page')));
	let totalPages = $derived(pageData.totalPages);
	let totalGamesCount = $derived(pageData.total);
	let pageSize = $derived(pageData.pageSize);
	let gameList = $derived(pageData.data);
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

{#snippet action()}
	<a class="" href="/">
		<img src="/favicon-96x96.png" class="aspect-square h-9 w-9 rounded-md" alt="app icon" />
	</a>
{/snippet}

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
	<AppLayout>
		<Header {action}>
			<a><Search /></a>
		</Header>
		<Main bind:main>
			<h1 class="text-lg">{m.home_title()}</h1>
			<div class="mb-2">
				{#if gameList.length === 0}
					<p class="text-sm text-neutral-300/60">{m.home_no_games_found()}</p>
				{/if}
				{#if gameList.length > 0}
					<p class="text-sm text-neutral-300/60">
						{m.home_showing_games_counter({
							currentCount: gameList.length,
							totalCount: totalGamesCount
						})}
					</p>
				{/if}
			</div>
			<label for="page_size" class="text-md mb-2 flex items-center justify-end gap-2">
				{m.home_label_items_per_page()}
				<Select onchange={handleOnPageSizeChange} bind:value={pageSize} id="page_size">
					{#each [25, 50, 75, 100] as option}
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
			<Home selected={true} />
			<Dashboard />
			<Settings />
		</BottomNav>
	</AppLayout>
{/key}
