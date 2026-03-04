<script lang="ts">
	import LightButton from "$lib/ui/components/buttons/LightButton.svelte";
	import GameCard from "$lib/ui/components/game-card/GameCard.svelte";
	import GameCardSkeleton from "$lib/ui/components/game-card/GameCardSkeleton.svelte";
	import type { HomePageGameReadModel } from "../home-page-game-model";

	type HeroProps = {
		games: HomePageGameReadModel[];
		loading: boolean;
		onClickSeeMore: () => void;
	};

	const { games, loading, onClickSeeMore }: HeroProps = $props();
</script>

<section class="mb-8">
	<header class="mb-3">
		<h2 class="text-lg font-semibold">Top Picks</h2>

		<div class="flex items-center justify-between">
			<p class="text-sm opacity-60">Based on your taste</p>
			<LightButton
				size="sm"
				onclick={() => onClickSeeMore()}
			>
				See more
			</LightButton>
		</div>
	</header>

	<ul class={["mb-6 grid list-none gap-2 p-0 justify-center grid-cols-4 grid-rows-3"]}>
		{#each games as game, i (game.Id)}
			<GameCard
				game={{ id: game.Id, name: game.Name, coverImageFilePath: game.CoverImageFilePath }}
				class={[i === 0 && "col-span-2 row-span-2", i === 1 && "col-span-2 row-span-2"]}
				hideName
			/>
		{/each}

		{#if loading}
			{#each Array.from({ length: 6 }, () => crypto.randomUUID()) as id, i (id)}
				<GameCardSkeleton
					class={[i === 0 && "col-span-2 row-span-2", i === 1 && "col-span-2 row-span-2"]}
					hideName
				/>
			{/each}
		{/if}
	</ul>
</section>
