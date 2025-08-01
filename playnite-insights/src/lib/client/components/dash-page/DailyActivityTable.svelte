<script lang="ts">
	import type { GameSession, GameSessionStatus } from '@playnite-insights/lib/client/game-session';
	import { getUtcNow, loadRecentActivity, recentActivityStore } from '$lib/stores/app-data.svelte';
	import Loading from '../Loading.svelte';
	import {
		getPlaytimeInHoursAndMinutes,
		getPlaytimeInHoursMinutesAndSeconds
	} from '$lib/client/utils/playnite-game';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	let recentActivityList = $derived.by(() => {
		const data: Map<
			string,
			{
				status: 'in_progress' | 'not_playing';
				gameName: string;
				totalPlaytime: number;
				sessions: GameSession[];
			}
		> = new Map();

		const sessions = recentActivityStore.raw?.Sessions ?? [];

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
	let inProgressActivity = $derived.by(() => {
		for (const [_, activity] of recentActivityList) {
			if (activity.status === 'in_progress') return activity;
		}
	});
	let inProgressActivityPlaytime = $derived.by(() => {
		const now = tick;
		if (!inProgressActivity) return;
		const latestSession = inProgressActivity.sessions.at(0);
		const startTime = latestSession?.StartTime;
		if (!startTime) return;
		const totalPlaytime = inProgressActivity.totalPlaytime;
		const elapsed = (now - new Date(startTime).getTime()) / 1000;
		return Math.floor(totalPlaytime + elapsed);
	});
	let inProgressSessionPlaytime = $derived.by(() => {
		const now = tick;
		if (!inProgressActivity) return;
		const session = inProgressActivity.sessions.at(0);
		const startTime = session?.StartTime;
		if (!startTime) return;
		const elapsed = (now - new Date(startTime).getTime()) / 1000;
		return Math.floor(elapsed);
	});
	let interval: ReturnType<typeof setInterval> | null = $state(null);
	let tick: number = $state(getUtcNow());
	let tickInterval: ReturnType<typeof setInterval> | null = $state(null);
	let expandedActivitySessions = $state(new Set<string>());

	const getActivityStateFromSession = (session: GameSession): 'in_progress' | 'not_playing' => {
		if (session.Status === 'in_progress') return 'in_progress';
		return 'not_playing';
	};

	const toggleExpandActivitySessions = (key: string) => {
		const newSet = new Set(expandedActivitySessions);
		if (expandedActivitySessions.has(key)) {
			newSet.delete(key);
			expandedActivitySessions = newSet;
		} else {
			newSet.add(key);
			expandedActivitySessions = newSet;
		}
	};

	const getSessionDateTimeText = (dateTime?: string | null) => {
		if (dateTime && !isNaN(Date.parse(dateTime))) return new Date(dateTime).toLocaleString();
		return '-';
	};

	const getSessionStatusText = (status: GameSessionStatus) => {
		switch (status) {
			case 'in_progress':
				return m.session_status_in_progress();
			case 'closed':
				return m.session_status_closed();
			case 'stale':
				return m.session_status_stale();
		}
	};

	onMount(() => {
		window.addEventListener('focus', async () => {
			if (interval) clearInterval(interval);
			await loadRecentActivity();
			interval = setInterval(loadRecentActivity, 30_000);
		});
		interval = setInterval(loadRecentActivity, 30_000);

		tickInterval = setInterval(() => (tick = getUtcNow()), 1000);

		return () => {
			window.removeEventListener('focus', loadRecentActivity);
			if (interval) clearInterval(interval);
			if (tickInterval) clearInterval(tickInterval);
		};
	});

	$inspect(recentActivityList);
	$inspect(expandedActivitySessions);
</script>

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

<div class="relative block overflow-x-auto whitespace-nowrap">
	{#if recentActivityStore.isLoading}
		<div class="z-2 absolute inset-0 flex h-full w-full flex-col justify-center bg-gray-400/20">
			<Loading />
		</div>
	{/if}
	<table class="bg-background-1 min-w-full shadow">
		<thead class="bg-background-3">
			<tr>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_status()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_game()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_total_playtime()}</th>
			</tr>
		</thead>
		<tbody>
			{#if recentActivityList.size === 0}
				<tr class="bg-background-2 border-t border-gray-700">
					<td colspan="3" class="px-3 py-2 text-center">
						{m.dash_no_data_to_show()}
					</td>
				</tr>
			{:else}
				{#each recentActivityList as [key, activity], index}
					<tr
						class={`${index % 2 === 0 ? 'bg-background-2' : ''} border-t border-gray-700`}
						onclick={() => toggleExpandActivitySessions(key)}
					>
						<td class="px-3 py-2">
							{#if activity.status === 'in_progress'}
								{@render greenDot()}
							{:else}
								{@render grayDot()}
							{/if}
						</td>
						<td class="px-3 py-2">{activity.gameName}</td>
						{#if activity.status === 'in_progress' && inProgressActivityPlaytime}
							<td class="px-3 py-2">
								{getPlaytimeInHoursMinutesAndSeconds(inProgressActivityPlaytime)}
							</td>
						{:else}
							<td class="px-3 py-2">
								{getPlaytimeInHoursMinutesAndSeconds(activity.totalPlaytime)}
							</td>
						{/if}
					</tr>
					{#if expandedActivitySessions.has(key)}
						<tr class={`${index % 2 === 0 ? 'bg-background-2' : ''}`}>
							<td colspan="3" class="p-2">
								<table class="opacity-80">
									<thead>
										<tr>
											<th class="px-3 py-2 text-left">{m.recent_activity_table_col_status()}</th>
											<th class="px-3 py-2 text-left">
												{m.recent_activity_table_col_session_start_time()}
											</th>
											<th class="px-3 py-2 text-left">
												{m.recent_activity_table_col_session_end_time()}
											</th>
											<th class="px-3 py-2 text-left">
												{m.recent_activity_table_col_session_duration()}
											</th>
										</tr>
									</thead>
									<tbody>
										{#each activity.sessions as session}
											<tr>
												{#if session.Status === 'in_progress'}
													<td class="px-3 py-2 text-green-500">
														{getSessionStatusText(session.Status)}
													</td>
												{:else}
													<td class="px-3 py-2">{getSessionStatusText(session.Status)}</td>
												{/if}
												<td class="px-3 py-2">{getSessionDateTimeText(session.StartTime)}</td>
												<td class="px-3 py-2">{getSessionDateTimeText(session.EndTime)}</td>
												<td class="px-3 py-2">
													{#if session.Status === 'in_progress' && inProgressSessionPlaytime}
														{getPlaytimeInHoursMinutesAndSeconds(inProgressSessionPlaytime)}
													{:else}
														{getPlaytimeInHoursMinutesAndSeconds(session.Duration ?? 0)}
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</td>
						</tr>
					{/if}
				{/each}
			{/if}
		</tbody>
	</table>
</div>
