<script lang="ts">
	import {
		companySignal,
		gameSignal,
		recentGameSessionSignal,
		serverTimeSignal,
	} from '$lib/client/app-state/AppData.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import { openNoteEditor } from '$lib/client/components/game-page/Lib.svelte';
	import NoteEditor from '$lib/client/components/game-page/NoteEditor.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { DateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte.js';
	import {
		getPlayniteGameImageUrl,
		getPlaytimeInHoursMinutesAndSeconds,
	} from '$lib/client/utils/playnite-game';
	import { GamePageViewModel } from '$lib/client/viewmodel/gamePageViewModel.svelte';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { type GameNote } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';

	const { data } = $props();
	const dateTimeHandler = new DateTimeHandler({ serverTimeSignal: serverTimeSignal });
	const vm = new GamePageViewModel({
		getGameId: () => data.gameId,
		gamesSignal: gameSignal,
		companySignal: companySignal,
	});
	const activityVm = new RecentActivityViewModel({
		gameSignal: gameSignal,
		recentGameSessionSignal: recentGameSessionSignal,
		dateTimeHandler: dateTimeHandler,
	});
	const isThisGameActive = $derived.by(() => {
		const inProgressActivity = activityVm.inProgressActivity;
		return inProgressActivity?.gameId === data.gameId;
	});
	const activeSessionForThisGame = $derived.by(() => {
		if (!isThisGameActive) return null;
		const session = activityVm.inProgressSession;
		return session;
	});
	const todaySessionsCount = $derived.by(() => {
		const inProgressActivity = activityVm.inProgressActivity;
		return inProgressActivity?.sessions.length;
	});
	let notes: GameNote[] = [];

	onMount(() => {
		activityVm.setTickInterval();
		return () => {
			activityVm.clearTickInterval();
		};
	});
</script>

{#snippet noteCard(note: GameNote)}
	<li class="bg-background-1 mb-2 p-4">
		<p class="text-lg font-semibold">{note.Title}</p>
		<p class="text-md mb-2">{note.Content}</p>
		<p class="text-sm opacity-70">{note.CreatedAt}</p>
	</li>
{/snippet}

<NoteEditor
	gameId={data.gameId}
	sessionId={activeSessionForThisGame?.SessionId ?? null}
/>
<BaseAppLayout>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft />
			</LightButton>
		{/snippet}
	</Header>
	<Main bottomNav={false}>
		{#if vm.game}
			<div class="mb-6 flex flex-row gap-4">
				<img
					src={getPlayniteGameImageUrl(vm.game.CoverImage)}
					alt={`${vm.game.Name} cover image`}
					loading="lazy"
					class="h-7/8 w-26 object-cover"
				/>
				<div class="grow-1">
					{#if isThisGameActive}
						<p>
							{m.game_journal_you_are_playing()}
							<br />
							<span class="text-3xl font-bold">{vm.game.Name}</span>
						</p>
						<Divider />
						<p class="text-2xl">
							{getPlaytimeInHoursMinutesAndSeconds(activityVm.inProgressSessionPlaytime!)}
						</p>
					{:else}
						<p class="text-3xl font-bold">{vm.game.Name}</p>
						<Divider />
					{/if}
					<small class="text-sm opacity-70">
						{#if todaySessionsCount === 1}
							{m.game_journal_sessions_today_singular({ count: todaySessionsCount })}
						{:else}
							{m.game_journal_sessions_today_plural({ count: todaySessionsCount! })}
						{/if}
					</small>
				</div>
			</div>
			<section class="mb-6">
				<h1 class="text-xl font-semibold">{m.game_journal_title_notes()}</h1>
				<Divider class="border-1 mb-4" />
				{#each notes as note (note.Id)}
					<ul class="">
						{@render noteCard(note)}
					</ul>
				{/each}
			</section>
			<section class="mb-6 font-semibold">
				<h1 class="text-xl">{m.game_journal_title_links()}</h1>
				<Divider class="border-1 mb-4" />
			</section>
			<LightButton onclick={() => openNoteEditor()}>{m.game_journal_label_add_note()}</LightButton>
		{/if}
	</Main>
</BaseAppLayout>
