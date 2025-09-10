<script lang="ts">
	import {
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
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { type GameNote } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';

	const dateTimeHandler = new DateTimeHandler({ serverTimeSignal: serverTimeSignal });
	const vm = new RecentActivityViewModel({
		gameSignal: gameSignal,
		recentGameSessionSignal: recentGameSessionSignal,
		dateTimeHandler: dateTimeHandler,
	});
	const sessionsToday = $derived.by(() => {
		const inProgressActivity = vm.inProgressActivity;
		return inProgressActivity?.sessions.length;
	});
	let notes: GameNote[] = [];

	onMount(() => {
		vm.setTickInterval();
		return () => {
			vm.clearTickInterval();
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
		{#if !vm.inProgressGame || !vm.inProgressSessionPlaytime || !sessionsToday}
			<p>No active session</p>
		{:else}
			<div class="mb-6 flex flex-row gap-4">
				<img
					src={getPlayniteGameImageUrl(vm.inProgressGame.CoverImage)}
					alt={`${vm.inProgressGame.Name} cover image`}
					loading="lazy"
					class="h-7/8 w-26 object-cover"
				/>
				<div class="grow-1">
					<p>
						Você está jogando
						<br />
						<span class="text-3xl font-bold">{vm.inProgressGame.Name}</span>
					</p>
					<Divider />
					<p class="text-2xl">
						{getPlaytimeInHoursMinutesAndSeconds(vm.inProgressSessionPlaytime)}
					</p>
					<small class="text-sm opacity-70">{sessionsToday} sessões hoje</small>
				</div>
			</div>
			<section class="mb-6">
				<h1 class="text-xl font-semibold">Notas</h1>
				<Divider class="border-1 mb-4" />
				{#each notes as note (note.Id)}
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
