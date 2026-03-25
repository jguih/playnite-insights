<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { getClientApiContext } from "$lib/modules/bootstrap/application";
	import {
		GameLibraryPager,
		GameLibrarySearch,
		SyncProgressViewModel,
	} from "$lib/page/game/library";
	import { HomePageStore } from "$lib/page/home";
	import HomePageHero from "$lib/page/home/components/HomePageHero.svelte";
	import BottomNav from "$lib/ui/components/BottomNav.svelte";
	import LightButton from "$lib/ui/components/buttons/LightButton.svelte";
	import Header from "$lib/ui/components/header/Header.svelte";
	import Icon from "$lib/ui/components/Icon.svelte";
	import AppLayout from "$lib/ui/components/layout/AppLayout.svelte";
	import Main from "$lib/ui/components/Main.svelte";
	import Spinner from "$lib/ui/components/Spinner.svelte";
	import { HomeIcon, LayoutDashboardIcon, SearchIcon, SettingsIcon } from "@lucide/svelte";
	import { onMount } from "svelte";

	const api = getClientApiContext();
	const pager = new GameLibraryPager({ api });
	const syncProgress = $derived(api().Synchronization.SyncProgressReporter.progressSignal);
	const store = new HomePageStore({ api });
	const search = new GameLibrarySearch();

	void store.loadGamesAsync();

	onMount(() => {
		const unsubscribe = api().EventBus.on("game-library-updated", () => {
			void store.loadGamesAsync();
		});

		return () => unsubscribe();
	});
</script>

<AppLayout>
	{#snippet header()}
		<Header>
			<div class="flex justify-between items-center flex-nowrap">
				<div class="min-w-16 flex gap-2 text-xs flex-nowrap">
					{#if syncProgress.running}
						<Spinner
							size="sm"
							variant="primary"
						/>
						<p class="font-medium text-foreground/80">
							{SyncProgressViewModel.getSyncProgressLabel(syncProgress.activeFlow)}
						</p>
					{/if}
				</div>
				<div class="flex flex-nowrap">
					<LightButton
						variant="neutral"
						iconOnly
						class="flex items-center gap-1 px-2!"
						onclick={() => {
							pager.setQuery({ mode: "ranked" });
							void goto(resolve("/game/library")).then(() => search.open());
						}}
					>
						<Icon>
							<SearchIcon />
						</Icon>
					</LightButton>
				</div>
			</div>
		</Header>
	{/snippet}
	{#snippet banner()}
		<div></div>
	{/snippet}

	<Main>
		<HomePageHero
			games={store.storeSignal.hero.items}
			loading={store.storeSignal.hero.loading}
			onClickSeeMore={async () => {
				pager.setQuery({ mode: "ranked" });
				await goto(resolve("/game/library"));
			}}
		/>
	</Main>

	{#snippet bottomNav()}
		<BottomNav>
			<LightButton
				size="lg"
				iconOnly
				state="active"
				aria-label="Home"
			>
				<Icon>
					<HomeIcon />
				</Icon>
			</LightButton>
			<LightButton
				size="lg"
				variant="neutral"
				iconOnly
				aria-label="Dashboard"
			>
				<Icon>
					<LayoutDashboardIcon />
				</Icon>
			</LightButton>
			<LightButton
				size="lg"
				variant="neutral"
				iconOnly
				aria-label="Settings"
			>
				<Icon>
					<SettingsIcon />
				</Icon>
			</LightButton>
		</BottomNav>
	{/snippet}
</AppLayout>
