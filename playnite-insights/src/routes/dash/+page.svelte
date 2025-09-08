<script lang="ts">
	import { gameSignal, libraryMetricsSignal } from '$lib/client/app-state/AppData.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import GamesOwnedOverTime from '$lib/client/components/charts/GamesOwnedOverTime.svelte';
	import DailyActivityTable from '$lib/client/components/dash-page/DailyActivityTable.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { getPlayniteGameImageUrl } from '$lib/client/utils/playnite-game.js';
	import { DashPageViewModel } from '$lib/client/viewmodel/dashPageViewModel.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft } from '@lucide/svelte';

	const vm = new DashPageViewModel({
		gameSignal: gameSignal,
		libraryMetricsSignal: libraryMetricsSignal,
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
			<Divider class="mb-4 border-1" />
			<DailyActivityTable />
		</div>
		<div>
			<h1 class="text-2xl">Overview</h1>
			<Divider class="mb-4 border-1" />
			{@render infoSection(m.dash_games_in_library(), vm.libraryMetrics.totalGamesInLibrary)}
			{@render infoSection(m.dash_intalled(), vm.libraryMetrics.isInstalled)}
			{@render infoSection(m.dash_not_installed(), vm.libraryMetrics.notInstalled)}
			{@render infoSection(m.dash_total_playtime(), vm.libraryMetrics.totalPlaytime)}
			<div class="flex flex-row justify-between">
				<small class="text-sm">
					<span class="text-primary-bg">{vm.libraryMetrics.played}</span>
					<span class="opacity-70">{m.dash_playtime_summary_out_of()}</span>
					<span class="text-primary-bg font-semibold">{vm.libraryMetrics.totalGamesInLibrary}</span>
					<span class="opacity-70">{m.dash_playtime_summary_games_played()}</span>
				</small>
				<p class="text-md">{vm.playedPercentage}%</p>
			</div>
			<div class="bg-background-1 mt-1 h-3 w-full rounded-sm">
				<div
					class="bg-primary-bg h-3 rounded-sm"
					style="width: {vm.playedPercentage}%"
				></div>
			</div>
		</div>
		<div class="bg-background-1 shadow">
			<h1 class="text-md truncate px-3 pt-4 font-semibold">
				{m.dash_games_owned_over_last_n_months({ value: 6 })}
			</h1>
			{#if vm.chartsData}
				<GamesOwnedOverTime
					series={{
						bar: {
							data: vm.chartsData.gamesOwnedLast6Months.count,
							label: m.dash_chart_label_games_owned(),
						},
					}}
					xAxis={{ data: vm.chartsData.gamesOwnedLast6Months.months }}
				/>
			{:else}
				<div>
					<p class="px-3 py-4 text-sm opacity-70">{m.dash_no_data_to_show()}</p>
				</div>
			{/if}
		</div>
		<div>
			<h1 class="text-2xl">Top 10</h1>
			<Divider class="mb-4 border-1" />
			{#if vm.libraryMetrics.topMostPlayedGames.length > 0}
				<ul class="mb-6 grid list-none grid-cols-1 gap-4 p-0">
					{#each vm.libraryMetrics.topMostPlayedGames as game (game.Id)}
						<li
							class={[
								'border-background-1 border-4 border-solid',
								'hover:border-primary-hover-bg',
								'atotalGamesInLibrary:border-primary-active-bg',
								'focus:border-primary-active-bg',
								'm-0 p-0 shadow outline-0',
							]}
						>
							<a href={`/game/${game.Id}`}>
								<div class="bg-background-1 flex flex-row gap-3 p-2">
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
												<span class="text-primary-bg font-semibold">
													{vm.getPlaytime(game.Playtime)}
												</span>
											</p>
										</div>
										<p>
											{m.dash_last_time_played({
												value: game.LastActivity
													? new Date(game.LastActivity).toLocaleDateString()
													: '-',
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
