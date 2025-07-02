<script lang="ts">
	import ActionBack from '$lib/components/ActionBack.svelte';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import Dashboard from '$lib/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/components/bottom-nav/Home.svelte';
	import Settings from '$lib/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Header from '$lib/components/Header.svelte';
	import Main from '$lib/components/Main.svelte';

	const { data } = $props();
	let gamesList = $derived(data.games);
	let installed = $derived(gamesList.filter((g) => g.IsInstalled).length);
	let notInstalled = $derived(gamesList.length - installed);
	let totalPlayTime = $derived(
		(gamesList.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600).toFixed(2)
	);
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
		{@render infoSection('Games in library', gamesList.length)}
		{@render infoSection('Installed', installed)}
		{@render infoSection('Not Installed', notInstalled)}
		{@render infoSection('Total Playtime', `${totalPlayTime} hrs`)}
	</Main>
	<BottomNav>
		<Home />
		<Dashboard selected={true} />
		<Settings />
	</BottomNav>
</AppLayout>
