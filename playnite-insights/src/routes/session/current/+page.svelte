<script lang="ts">
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import NoteEditor from '$lib/client/components/current-session-page/NoteEditor.svelte';
	import { openNoteEditor } from '$lib/client/components/current-session-page/Lib.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { getInProgressSessionPlaytime } from '$lib/client/utils/game-session';
	import {
		getPlayniteGameImageUrl,
		getPlaytimeInHoursMinutesAndSeconds,
	} from '$lib/client/utils/playnite-game';
	import { gamesSignal, getUtcNow, recentActivitySignal } from '$lib/stores/AppData.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { type Note } from '@playnite-insights/lib/client/notes';
	import { onMount } from 'svelte';

	let inProgressGame = $derived.by(() => {
		const activity = recentActivitySignal.inProgressActivity;
		const games = gamesSignal.raw ?? [];
		if (!activity) return null;
		return games.find((g) => g.Id === activity.gameId) ?? null;
	});
	let tick: number = $state(getUtcNow());
	let tickInterval: ReturnType<typeof setInterval> | null = $state(null);
	let inProgressSessionPlaytime = $derived.by(() => {
		const now = tick;
		const inProgressActivity = recentActivitySignal.inProgressActivity;
		return getInProgressSessionPlaytime({ inProgressActivity, now });
	});
	let sessionsToday = $derived.by(() => {
		const inProgressActivity = recentActivitySignal.inProgressActivity;
		return inProgressActivity?.sessions.length;
	});
	let notes: Note[] = [];

	onMount(() => {
		tickInterval = setInterval(() => (tick = getUtcNow()), 1000);
		return () => {
			if (tickInterval) clearInterval(tickInterval);
		};
	});
</script>

{#snippet noteCard(note: Note)}
	<li class="bg-background-1 mb-2 p-4">
		<p class="text-lg font-semibold">{note.Title}</p>
		<p class="text-md mb-2">{note.Content}</p>
		<p class="text-sm opacity-70">{note.CreatedAt}</p>
	</li>
{/snippet}

<NoteEditor />
<BaseAppLayout>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft />
			</LightButton>
		{/snippet}
	</Header>
	<Main bottomNav={false}>
		{#if !inProgressGame || !inProgressSessionPlaytime || !sessionsToday}
			<p>No active session</p>
		{:else}
			<div class="mb-6 flex flex-row gap-4">
				<img
					src={getPlayniteGameImageUrl(inProgressGame.CoverImage)}
					alt={`${inProgressGame.Name} cover image`}
					loading="lazy"
					class="h-7/8 w-26 object-cover"
				/>
				<div class="grow-1">
					<p>
						Você está jogando
						<br />
						<span class="text-3xl font-bold">{inProgressGame.Name}</span>
					</p>
					<Divider />
					<p class="text-2xl">
						{getPlaytimeInHoursMinutesAndSeconds(inProgressSessionPlaytime)}
					</p>
					<small class="text-sm opacity-70">{sessionsToday} sessões hoje</small>
				</div>
			</div>
			<section class="mb-6">
				<h1 class="text-xl font-semibold">Notas</h1>
				<Divider class="border-1 mb-4" />
				{#each notes as note}
					<ul class="">
						{@render noteCard(note)}
					</ul>
				{/each}
			</section>
			<section class="mb-6 font-semibold">
				<h1 class="text-xl">Links</h1>
				<Divider class="border-1 mb-4" />
			</section>
			<LightButton onclick={() => openNoteEditor()}>Criar Nota</LightButton>
		{/if}
	</Main>
</BaseAppLayout>
