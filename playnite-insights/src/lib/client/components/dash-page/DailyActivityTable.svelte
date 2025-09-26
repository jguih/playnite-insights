<script lang="ts">
	import { locator, serverTimeSignal } from '$lib/client/app-state/AppData.svelte.js';
	import { DateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte';
	import { getPlaytimeInHoursMinutesAndSeconds } from '$lib/client/utils/playnite-game';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { GameSessionStatus } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';

	const dateTimeHandler = new DateTimeHandler({ serverTimeSignal: serverTimeSignal });
	const vm = new RecentActivityViewModel({
		gameStore: locator.gameStore,
		gameSessionStore: locator.gameSessionStore,
		dateTimeHandler: dateTimeHandler,
	});
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
		vm.setTickInterval();
		return () => {
			vm.clearTickInterval();
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
	<table class="bg-background-1 min-w-full shadow">
		<thead class="bg-background-3">
			<tr>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_status()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_game()}</th>
				<th class="px-3 py-2 text-left">{m.recent_activity_table_col_total_playtime()}</th>
			</tr>
		</thead>
		<tbody>
			{#if vm.recentActivityMap.size === 0}
				<tr class="bg-background-2 border-t border-neutral-800">
					<td
						colspan="3"
						class="px-3 py-2 text-center"
					>
						{m.dash_no_data_to_show()}
					</td>
				</tr>
			{:else}
				{#each vm.recentActivityMap as [key, activity], index (key)}
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
						{#if activity.status === 'in_progress' && vm.inProgressActivityPlaytime}
							<td class="px-3 py-2">
								{getPlaytimeInHoursMinutesAndSeconds(vm.inProgressActivityPlaytime)}
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
										{#each activity.sessions as session (session.SessionId)}
											<tr>
												{#if session.Status === 'in_progress'}
													<td class="text-success-light-fg px-3 py-2">
														{getSessionStatusText(session.Status)}
													</td>
												{:else if session.Status === 'stale'}
													<td class="text-warning-light-fg px-3 py-2">
														{getSessionStatusText(session.Status)}
													</td>
												{:else}
													<td class="px-3 py-2">{getSessionStatusText(session.Status)}</td>
												{/if}
												<td class="px-3 py-2">{getSessionDateTimeText(session.StartTime)}</td>
												<td class="px-3 py-2">{getSessionDateTimeText(session.EndTime)}</td>
												<td class="px-3 py-2">
													{#if session.Status === 'in_progress' && vm.inProgressSessionPlaytime}
														{getPlaytimeInHoursMinutesAndSeconds(vm.inProgressSessionPlaytime)}
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
