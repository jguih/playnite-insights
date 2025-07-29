<script lang="ts">
	import type { GameSession } from '@playnite-insights/lib/client/game-session';
	import { loadRecentActivity, recentActivityStore } from '$lib/stores/app-data.svelte';
	import Loading from '../Loading.svelte';
	import {
		getPlaytimeInHoursAndMinutes,
		getPlaytimeInHoursMinutesAndSeconds
	} from '$lib/client/utils/playnite-game';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	let recentActivityData = $derived.by(() => {
		const data: Map<
			string,
			{
				status: 'in_progress' | 'not_playing';
				gameName: string;
				totalPlaytime: number;
				sessions: GameSession[];
			}
		> = new Map();

		const sessions = recentActivityStore.raw ?? [];

		for (const session of sessions) {
			const key = session.GameId ? session.GameId : session.GameName;
			if (key === null) continue;

			const currentStatus = getActivityStateFromSession(session);
			const duration = session.Duration ?? 0;

			if (!data.has(key)) {
				data.set(key, {
					gameName: session.GameName ?? 'Unknown',
					status: currentStatus,
					totalPlaytime: duration,
					sessions: [session]
				});
				continue;
			}

			const value = data.get(key)!;
			value.totalPlaytime += duration;
			value.sessions.push(session);
			if (value.status !== 'in_progress') {
				value.status = currentStatus;
			}
		}
		return data;
	});
	let tick: Date = $state(new Date());
	let inProgressPlaytime = $derived.by(() => {
		const now = tick;
		const data: Map<string, number> = new Map();

		for (const [key, activity] of recentActivityData) {
			const status = activity.status;
			if (status === 'not_playing') continue;

			const latestSession = activity.sessions.at(0);
			const startTime = latestSession?.StartTime;
			if (!startTime) continue;

			const totalPlaytime = activity.totalPlaytime;
			const elapsed = (now.getTime() - new Date(startTime).getTime()) / 1000;

			data.set(key, Math.floor(totalPlaytime + elapsed));
		}

		return data;
	});
	let interval: ReturnType<typeof setInterval> | null = $state(null);
	let tickInterval: ReturnType<typeof setInterval> | null = $state(null);

	const getActivityStateFromSession = (session: GameSession): 'in_progress' | 'not_playing' => {
		if (session.Status === 'in_progress') return 'in_progress';
		return 'not_playing';
	};

	onMount(() => {
		window.addEventListener('focus', async () => {
			if (interval) clearInterval(interval);
			await loadRecentActivity();
			interval = setInterval(loadRecentActivity, 30_000);
		});
		interval = setInterval(loadRecentActivity, 30_000);

		tickInterval = setInterval(() => (tick = new Date()), 1000);

		return () => {
			window.removeEventListener('focus', loadRecentActivity);
			if (interval) clearInterval(interval);
			if (tickInterval) clearInterval(tickInterval);
		};
	});

	$inspect(recentActivityData);
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
		<thead class="bg-background-3">
			<tr>
				<th class="px-3 py-2 text-center">{m.recent_activity_table_col_status()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_game()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_total_playtime()}</th>
			</tr>
		</thead>
		<tbody>
			{#if recentActivityData.size === 0}
				<tr class="bg-background-2 border-t border-gray-700">
					<td colspan="3" class="px-3 py-2 text-center">
						{m.dash_no_data_to_show()}
					</td>
				</tr>
			{:else}
				{#each recentActivityData as [key, activity], index}
					<tr class={`${index % 2 === 0 ? 'bg-background-2' : ''} border-t border-gray-700`}>
						<td class="px-3 py-2">
							{#if activity.status === 'in_progress'}
								{@render greenDot()}
							{:else}
								{@render grayDot()}
							{/if}
						</td>
						<td class="px-3 py-2">{activity.gameName}</td>
						{#if activity.status === 'in_progress' && inProgressPlaytime.has(key)}
							<td class="px-3 py-2">
								{getPlaytimeInHoursMinutesAndSeconds(inProgressPlaytime.get(key)!)}
							</td>
						{:else}
							<td class="px-3 py-2">
								{getPlaytimeInHoursMinutesAndSeconds(activity.totalPlaytime)}
							</td>
						{/if}
					</tr>
				{/each}
				<!-- <tr>
				<td colspan="3">
					{@render sessionOverview()}
				</td>
			</tr> -->
			{/if}
		</tbody>
	</table>
</div>
