<script lang="ts">
	import ActionBack from '$lib/components/ActionBack.svelte';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import Dashboard from '$lib/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/components/bottom-nav/Home.svelte';
	import Settings from '$lib/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import GamesOwnedOverTime from '$lib/components/charts/GamesOwnedOverTime.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';
	import { m } from '$lib/paraglide/messages.js';

	const { data } = $props();
	let gamesList = $derived(data.games);
	let total = $derived(data.total);
	let installed = $derived(data.installed);
	let notInstalled = $derived(data.notInstalled);
	let totalPlayTime = $derived(data.totalPlayTime);
	let notPlayed = $derived(data.notPlayed);
	let played = $derived(data.played);
	let totalPlayedPercent = $derived(Math.floor((played * 100) / total));
	let charts = $derived(data.charts);
</script>

{#snippet infoSection(label: string, value: string | number)}
	<div class="flex flex-row justify-between gap-4">
		<p class="text-nowrap">{label}</p>
		<p class="break-all">{value}</p>
	</div>
	<Divider />
{/snippet}

<AppLayout>
	<Header>
		{#snippet action()}
			<ActionBack />
		{/snippet}
		{#snippet title()}
			Dashboard
		{/snippet}
	</Header>
	<Main>
		<h1 class="text-2xl">Overview</h1>
		<Divider class="mb-4 border-2" />
		{@render infoSection(m.dash_games_in_library(), total)}
		{@render infoSection(m.dash_intalled(), installed)}
		{@render infoSection(m.dash_not_installed(), notInstalled)}
		{@render infoSection(
			m.dash_total_playtime(),
			m.dash_total_playtime_value({ time: totalPlayTime })
		)}
		<div class="flex flex-row justify-between">
			<small class="text-sm">
				<span class="text-primary-500">{played}</span>
				<span class="opacity-80">{m.dash_playtime_summary_out_of()}</span>
				<span class="text-primary-500 font-semibold">{total}</span>
				<span class="opacity-80">{m.dash_playtime_summary_games_played()}</span>
			</small>
			<small class="text-sm">{totalPlayedPercent}%</small>
		</div>
		<div class="bg-background-1 h-3 w-full rounded-sm">
			<div class="bg-primary-500 h-3 rounded-sm" style="width: {totalPlayedPercent}%"></div>
		</div>
		<Divider class="my-4" />
		<div class="bg-background-1 rounded-md shadow-md">
			<h1 class="text-md truncate px-3 pt-4 font-semibold">
				{m.dash_games_owned_over_last_n_months({ value: 6 })}
			</h1>
			{#if charts.totalPlaytimeOverLast6Months}
				<GamesOwnedOverTime
					series={charts.totalPlaytimeOverLast6Months.series}
					xAxis={charts.totalPlaytimeOverLast6Months.xAxis}
				/>
			{:else}
				<div>
					<p class="px-3 py-4 text-sm opacity-70">{m.dash_no_data_to_show()}</p>
				</div>
			{/if}
		</div>
		<Divider class="my-4" />
	</Main>
	<BottomNav>
		<Home />
		<Dashboard selected={true} />
		<Settings />
	</BottomNav>
</AppLayout>
