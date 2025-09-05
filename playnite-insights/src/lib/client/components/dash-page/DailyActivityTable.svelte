<script lang="ts">
	import type { GameSessionStatus } from '@playnite-insights/lib/client/game-session';
	import { getUtcNow, recentActivitySignal } from '$lib/stores/AppData.svelte';
	import Loading from '../Loading.svelte';
	import { getPlaytimeInHoursMinutesAndSeconds } from '$lib/client/utils/playnite-game';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		getInProgressActivityPlaytime,
		getInProgressSessionPlaytime,
	} from '$lib/client/utils/game-session';

	let inProgressActivityPlaytime = $derived.by(() => {
		const now = tick;
		const inProgressActivity = recentActivitySignal.inProgressActivity;
		return getInProgressActivityPlaytime({ inProgressActivity, now });
	});
	let inProgressSessionPlaytime = $derived.by(() => {
		const now = tick;
		const inProgressActivity = recentActivitySignal.inProgressActivity;
		return getInProgressSessionPlaytime({ inProgressActivity, now });
	});
	let tick: number = $state(getUtcNow());
	let tickInterval: ReturnType<typeof setInterval> | null = $state(null);
	let expandedActivitySessions = $state(new Set<string>());

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
		tickInterval = setInterval(() => (tick = getUtcNow()), 1000);
		return () => {
			if (tickInterval) clearInterval(tickInterval);
		};
	});
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
		<span class="relative h-2 w-2 rounded-full bg-neutral-500"></span>
	</span>
{/snippet}

<div class="relative block overflow-x-auto">
	{#if recentActivitySignal.isLoading}
		<div class="z-2 absolute inset-0 flex h-full w-full flex-col justify-center bg-neutral-400/20">
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
			{#if !recentActivitySignal.recentActivityMap || recentActivitySignal.recentActivityMap.size === 0}
				<tr class="bg-background-2 border-t border-neutral-800">
					<td
						colspan="3"
						class="px-3 py-2 text-center"
					>
						{m.dash_no_data_to_show()}
					</td>
				</tr>
			{:else}
				{#each recentActivitySignal.recentActivityMap as [key, activity], index}
					<tr
						class={`${index % 2 === 0 ? 'bg-background-2' : ''} w-full border-t border-neutral-800`}
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
						<tr class={`${index % 2 === 0 ? 'bg-background-2' : ''} whitespace-nowrap`}>
							<td
								colspan="3"
								class="p-2"
							>
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
