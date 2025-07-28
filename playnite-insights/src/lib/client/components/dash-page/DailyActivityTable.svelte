<script lang="ts">
	import type { GameSession } from '@playnite-insights/lib/client/game-session';
	import { loadRecentActivity, recentActivityStore } from '$lib/stores/app-data.svelte';
	import Loading from '../Loading.svelte';
	import { getPlaytimeInHoursAndMinutes } from '$lib/client/utils/playnite-game';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	let tableData = $derived.by(() => {
		const data: Map<
			string,
			{
				status: 'in_progress' | 'not_playing';
				gameName: string;
				totalPlaytime: number;
				sessions: GameSession[];
			}
		> = new Map();

		for (const dailySession of recentActivityStore.raw ?? []) {
			const key = dailySession.GameId ? dailySession.GameId : dailySession.GameName;
			if (key === null) continue;

			if (!data.has(key)) {
				data.set(key, {
					gameName: dailySession.GameName ?? 'Unknown',
					status: dailySession.Status === 'in_progress' ? 'in_progress' : 'not_playing',
					totalPlaytime: dailySession.Duration ?? 0,
					sessions: [dailySession].sort()
				});
			}

			const value = data.get(key);
			if (!value) continue;
			const newValue = { ...value };
			newValue.status =
				newValue.status === 'in_progress'
					? newValue.status
					: dailySession.Status === 'in_progress'
						? 'in_progress'
						: 'not_playing';
			newValue.totalPlaytime += dailySession.Duration ?? 0;
			newValue.sessions = [...newValue.sessions, dailySession].sort();
			data.set(key, newValue);
		}

		return data;
	});
	let interval: ReturnType<typeof setInterval> | null = $state(null);

	onMount(() => {
		window.addEventListener('focus', async () => {
			if (interval) clearInterval(interval);
			await loadRecentActivity();
			interval = setInterval(loadRecentActivity, 30_000);
		});
		interval = setInterval(loadRecentActivity, 30_000);
		return () => {
			window.removeEventListener('focus', loadRecentActivity);
			if (interval) clearInterval(interval);
		};
	});
</script>

{#snippet th(text: string)}
	<th class="px-3 py-2 text-center">{text}</th>
{/snippet}

{#snippet td(text: string)}
	<td class="px-3 py-2">{text}</td>
{/snippet}

{#snippet greenDot()}
	<span class="relative mx-auto flex h-2 w-2">
		<span class="absolute inset-0 h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
		></span>
		<span class="relative h-2 w-2 rounded-full bg-green-500"></span>
	</span>
{/snippet}

{#snippet grayDot()}
	<span class="relative mx-auto flex h-2 w-2">
		<span class="relative h-2 w-2 rounded-full bg-gray-500"></span>
	</span>
{/snippet}

{#snippet sessionOverview()}
	<div class="p-2">
		<table>
			<thead class="text-gray-500">
				<tr>
					{@render th('Status')}
					{@render th('Game')}
					{@render th('Start Time')}
					{@render th('End Time')}
					{@render th('Duration')}
				</tr>
			</thead>
			<tbody>
				<tr class="border-t border-gray-700">
					{@render td('In Progress')}
					{@render td('Palworld')}
					{@render td(new Date().toLocaleString())}
					{@render td(new Date().toLocaleString())}
					{@render td('1h 30m')}
				</tr>
			</tbody>
		</table>
	</div>
{/snippet}

<div class="relative overflow-x-auto">
	{#if recentActivityStore.isLoading}
		<div class="z-2 absolute inset-0 flex h-full w-full flex-col justify-center bg-gray-400/20">
			<Loading />
		</div>
	{/if}
	<table class="bg-background-1 min-w-full shadow">
		<thead class="bg-background-2">
			<tr>
				<th class="px-3 py-2 text-center">{m.recent_activity_table_col_status()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_game()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_total_playtime()}</th>
			</tr>
		</thead>
		<tbody>
			{#each tableData.values() as row}
				<tr class="border-t border-gray-700">
					<td class="px-3 py-2">
						{#if row.status === 'in_progress'}
							{@render greenDot()}
						{:else}
							{@render grayDot()}
						{/if}
					</td>
					<td class="px-3 py-2">{row.gameName}</td>
					<td class="px-3 py-2">{getPlaytimeInHoursAndMinutes(row.totalPlaytime)}</td>
				</tr>
			{/each}
			<!-- <tr>
				<td colspan="3">
					{@render sessionOverview()}
				</td>
			</tr> -->
		</tbody>
	</table>
</div>
