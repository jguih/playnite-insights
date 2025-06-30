<script lang="ts">
	import AppLayout from '$lib/components/AppLayout.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';
	import { Home, LayoutDashboard, Menu, Settings } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import MenuAnchor from '$lib/components/MenuAnchor.svelte';

	let { data }: PageProps = $props();
	const gameList = data.games.sort((a, b) =>
		a.IsInstalled === b.IsInstalled ? 0 : a.IsInstalled ? -1 : 1
	);
	const getCoverImageUrl = (game: typeof data.games[number]) => {
		if (!game.CoverImage) return '';
		const [gameId, imageFileName] = game.CoverImage.split('\\');
		return `/api/assets/image/${gameId}/${imageFileName}`;
	};
</script>

{#snippet action()}
  <MenuAnchor>
    <Menu strokeWidth={1.75} />
  </MenuAnchor>
{/snippet}

<AppLayout>
  <Header action={action}/>
  <Main>
    <h1 class="text-lg">My Games</h1>
    <div class="mb-4">
      {#if gameList.length === 0}
        <p class="text-sm text-neutral-300/60">No games found.</p>
      {/if}
      {#if gameList.length > 0}
        <p class="text-sm text-neutral-300/60">You have: {gameList.length} games</p>
      {/if}
    </div>
    <div class="mb-6 flex flex-row flex-wrap gap-4 justify-center">
      {#each gameList as game}
        <a class="m-0 p-0 aspect-[1/1.6] max-w-38 sm:max-w-52 border-4 border-solid border-transparent hover:border-primary-500 active:border-primary-500 focus:border-primary-500 outline-0 shadow-md" href={`/game/${game.Id}`}>
          <img
            src={getCoverImageUrl(game)}
            alt={`${game.Name} cover image`}
            loading="lazy"
            class="aspect-square h-8/9 w-full object-cover"
          />
          <div class="bottom-0 h-1/9 w-full bg-background-1 p-1">
            <p class="truncate text-center text-sm text-white">{game.Name}</p>
          </div>
        </a>
      {/each}
    </div>
  </Main>
  <BottomNav>
    <MenuAnchor>
      <Home strokeWidth={1.75}/>
    </MenuAnchor>
    <MenuAnchor>
      <LayoutDashboard strokeWidth={1.75} />
    </MenuAnchor>
    <MenuAnchor>
      <Settings strokeWidth={1.75} />
    </MenuAnchor>
  </BottomNav>
</AppLayout>
