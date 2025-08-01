<script lang="ts">
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import GamesOwnedOverTime from '$lib/client/components/charts/GamesOwnedOverTime.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getPlayniteGameImageUrl } from '$lib/client/utils/playnite-game.js';
	import { ArrowLeft } from '@lucide/svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import { makeDashPageViewModel } from '$lib/client/viewmodel/dash.js';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import { dashStore } from '$lib/stores/app-data.svelte.js';
	import DailyActivityTable from '$lib/client/components/dash-page/DailyActivityTable.svelte';

	let vm = $derived.by(() => {
		const pageData = dashStore?.pageData ? { ...dashStore.pageData } : undefined;
		return makeDashPageViewModel(pageData);
	});
</script>

{#snippet infoSection(label: string, value: string | number)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-md text-nowrap">{label}</p>
		<p class="text-md break-all">{value}</p>
	</div>
	<Divider />
{/snippet}

<BaseAppLayout>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft />
			</LightButton>
		{/snippet}
	</Header>
	<Main class="flex flex-col gap-6">
		<div>
			<h1 class="text-2xl">{m.dash_recent_activity()}</h1>
			<Divider class="border-1 mb-4" />
			<DailyActivityTable />
		</div>
		<div>
			<h1 class="text-2xl">Overview</h1>
			<Divider class="border-1 mb-4" />
			{@render infoSection(m.dash_games_in_library(), vm.getTotal())}
			{@render infoSection(m.dash_intalled(), vm.getIsInstalled())}
			{@render infoSection(m.dash_not_installed(), vm.getNotInstalled())}
			{@render infoSection(m.dash_total_playtime(), vm.getTotalPlaytime())}
			<div class="flex flex-row justify-between">
				<small class="text-sm">
					<span class="text-primary-500">{vm.getPlayed()}</span>
					<span class="opacity-70">{m.dash_playtime_summary_out_of()}</span>
					<span class="text-primary-500 font-semibold">{vm.getTotal()}</span>
					<span class="opacity-70">{m.dash_playtime_summary_games_played()}</span>
				</small>
				<p class="text-md">{vm.getTotalPlayedPercent()}%</p>
			</div>
			<div class="bg-background-1 mt-1 h-3 w-full rounded-sm">
				<div
					class="bg-primary-500 h-3 rounded-sm"
					style="width: {vm.getTotalPlayedPercent()}%"
				></div>
			</div>
		</div>
		<div class="bg-background-1 shadow-md">
			<h1 class="text-md truncate px-3 pt-4 font-semibold">
				{m.dash_games_owned_over_last_n_months({ value: 6 })}
			</h1>
			{#if vm.getCharts().totalGamesOwnedOverLast6Months}
				<GamesOwnedOverTime
					series={{
						bar: {
							data: vm.getCharts().totalGamesOwnedOverLast6Months.series.bar.data,
							label: m.dash_chart_label_games_owned()
						}
					}}
					xAxis={vm.getCharts().totalGamesOwnedOverLast6Months.xAxis}
				/>
			{:else}
				<div>
					<p class="px-3 py-4 text-sm opacity-70">{m.dash_no_data_to_show()}</p>
				</div>
			{/if}
		</div>
		<div>
			<h1 class="text-2xl">Top 10</h1>
			<Divider class="border-1 mb-4" />
			{#if vm.getTop10MostPlayedGames()}
				<ul class="mb-6 grid list-none grid-cols-1 gap-1 p-0">
					{#each vm.getTop10MostPlayedGames() as game}
						<li
							class="hover:border-primary-500 active:border-primary-500 focus:border-primary-500 m-0 border-4 border-solid border-transparent p-0 shadow-md outline-0"
						>
							<a href={`/game/${game.Id}`}>
								<div class="bg-background-1 flex flex-row gap-3 px-3 py-3">
									<img
										src={getPlayniteGameImageUrl(game.CoverImage)}
										alt={`${game.Name} cover image`}
										loading="lazy"
										class="aspect-[1/1.6] w-24 object-cover"
									/>
									<div class="flex flex-col justify-between">
										<div>
											<h2 class="text-xl font-semibold">{game.Name}</h2>
											<p class=" mt-1 text-lg">
												<span class="text-primary-500 font-semibold">
													{vm.getPlaytime(game.Playtime)}
												</span>
											</p>
										</div>
										<p>
											{m.dash_last_time_played({
												value: game.LastActivity
													? new Date(game.LastActivity).toLocaleDateString()
													: '-'
											})}
										</p>
									</div>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<div>
					<p class="px-3 py-4 text-sm opacity-70">{m.dash_no_data_to_show()}</p>
				</div>
			{/if}
		</div>
	</Main>
	<BottomNav>
		<Home />
		<Dashboard selected={true} />
		<Settings />
	</BottomNav>
</BaseAppLayout>
