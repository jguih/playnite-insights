<script lang="ts">
	import AppLayoutWithoutBottomNav from '$lib/components/AppLayoutWithoutBottomNav.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';
	import MenuAnchor from '$lib/components/MenuAnchor.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();

  const getImageUrl = (imagePath?: string | null) => {
		if (!imagePath) return '';
		const [gameId, imageFileName] = imagePath.split('\\');
		return `/api/assets/image/${gameId}/${imageFileName}`;
	};
</script>

{#snippet action()}
  <MenuAnchor>
    <ArrowLeft />
  </MenuAnchor>
{/snippet}

<AppLayoutWithoutBottomNav>
  <Header action={action}>
    <h1 class="text-lg font-semibold">{data.game?.Name}</h1>
  </Header>
  <Main>
    {#if data.game}
      <img
            src={getImageUrl(data.game.BackgroundImage)}
            alt={`${data.game.Name} Background`}
            loading="lazy"
            class="aspect-square h-8/9 w-full object-cover"
          />
    {:else}
      <p class="text-red-500">Game not found.</p>
    {/if}
  </Main>
</AppLayoutWithoutBottomNav>
