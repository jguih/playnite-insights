<script lang="ts">
	import {
		clientServiceLocator,
		companySignal,
		gameSignal,
		loadGameNotesFromServer,
		recentGameSessionSignal,
	} from '$lib/client/app-state/AppData.svelte.js';
	import { toast } from '$lib/client/app-state/toast.svelte.js';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Dropdown from '$lib/client/components/dropdown/Dropdown.svelte';
	import DropdownBody from '$lib/client/components/dropdown/DropdownBody.svelte';
	import { GameNoteEditor } from '$lib/client/components/game-page/journal/gameNoteEditor.svelte.js';
	import NoteEditor from '$lib/client/components/game-page/journal/NoteEditor.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized.js';
	import {
		getPlayniteGameImageUrl,
		getPlaytimeInHoursMinutesAndSeconds,
	} from '$lib/client/utils/playnite-game';
	import { GamePageViewModel } from '$lib/client/viewmodel/gamePageViewModel.svelte';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft, ChevronDown, ChevronUp, PlusIcon } from '@lucide/svelte';
	import { type GameNote } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';

	const { data } = $props();
	const pageVm = new GamePageViewModel({
		getGameId: () => data.gameId,
		gamesSignal: gameSignal,
		companySignal: companySignal,
	});
	const activityVm = new RecentActivityViewModel({
		gameSignal: gameSignal,
		recentGameSessionSignal: recentGameSessionSignal,
		dateTimeHandler: clientServiceLocator.dateTimeHandler,
	});
	const noteEditor = new GameNoteEditor({
		gameNoteFactory: clientServiceLocator.factory.gameNote,
		gameNoteRepository: clientServiceLocator.repository.gameNote,
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
		const recentActivityMap = activityVm.recentActivityMap;
		const activityForThisGame = recentActivityMap.get(data.gameId);
		return activityForThisGame?.sessions.length ?? 0;
	});
	const notesSignal = $state<{ notes: GameNote[]; isLoading: boolean }>({
		notes: [],
		isLoading: false,
	});

	const loadNotes = async () => {
		const gameId = data.gameId;
		try {
			notesSignal.isLoading = true;
			const notes = await clientServiceLocator.repository.gameNote.getAllAsync({
				filterBy: 'byGameId',
				GameId: gameId,
			});
			notesSignal.notes = notes;
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: m.error_db_not_ready() });
			} else if (err instanceof Error) {
				toast.error({ title: m.error_load_local_game_notes(), message: err.message });
			} else {
				toast.error({ message: m.error_load_local_game_notes() });
			}
		} finally {
			notesSignal.isLoading = false;
		}
	};

	const handleOnNoteChange = async () => {
		const gameId = data.gameId;
		const sessionId = activeSessionForThisGame?.SessionId ?? null;
		await noteEditor.saveAsync({ gameId, sessionId });
		await loadNotes();
	};

	const handleOnClickNote = async (note: GameNote) => {
		noteEditor.currentNote = { ...note };
		noteEditor.openNoteEditor();
	};

	const handleOnAddNote = async () => {
		const newNote = clientServiceLocator.factory.gameNote.create({
			Title: null,
			Content: null,
			GameId: null,
			ImagePath: null,
			SessionId: null,
		});
		noteEditor.currentNote = newNote;
		noteEditor.openNoteEditor();
	};

	const handleOnDeleteNote = async () => {
		await noteEditor.deleteAsync();
		await loadNotes();
	};

	const handleFocus = () => {
		loadGameNotesFromServer().then((notes) => {
			if (notes) loadNotes();
		});
	};

	onMount(() => {
		// Load notes from indexedDb to hydrate UI faster
		loadNotes();
		loadGameNotesFromServer().then((notes) => {
			if (notes) loadNotes();
			// If notes = `null` nothing was changed since last sync
		});
		activityVm.setTickInterval();
		window.addEventListener('focus', handleFocus);
		return () => {
			activityVm.clearTickInterval();
			window.removeEventListener('focus', handleFocus);
		};
	});
</script>

{#snippet noteCard(note: GameNote)}
	<li class="bg-background-1">
		<LightButton
			class={['flex-col! items-start! w-full p-4 text-start']}
			onclick={() => handleOnClickNote(note)}
			type="button"
		>
			{#if note.Title}
				<p class="text-lg font-semibold">{note.Title}</p>
			{/if}
			{#if note.Content}
				<p class="text-md mb-2">{note.Content}</p>
			{/if}
			<p class="w-full text-right text-sm opacity-70">
				{new Date(note.CreatedAt).toLocaleString()}
			</p>
		</LightButton>
	</li>
{/snippet}

<NoteEditor
	currentNote={noteEditor.currentNote}
	onChange={handleOnNoteChange}
	onClose={noteEditor.closeNoteEditor}
	onDelete={handleOnDeleteNote}
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
		{#if pageVm.game}
			<div class="mb-6 flex flex-row gap-4">
				<img
					src={getPlayniteGameImageUrl(pageVm.game.CoverImage)}
					alt={`${pageVm.game.Name} cover image`}
					loading="lazy"
					class="h-7/8 w-26 object-cover"
				/>
				<div class="grow-1">
					{#if isThisGameActive}
						<p>
							{m.game_journal_you_are_playing()}
							<br />
							<span class="text-3xl font-bold">{pageVm.game.Name}</span>
						</p>
						<Divider />
						<p class="text-2xl">
							{getPlaytimeInHoursMinutesAndSeconds(activityVm.inProgressSessionPlaytime!)}
						</p>
					{:else}
						<p class="text-3xl font-bold">{pageVm.game.Name}</p>
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
		{/if}
		<section class="mb-6">
			<Dropdown initialState={true}>
				{#snippet button({ onclick, show })}
					<LightButton
						{onclick}
						class={['w-full p-2']}
						justify="between"
					>
						<h1 class="text-xl font-semibold">{m.game_journal_title_notes()}</h1>
						{#if show}
							<ChevronUp class={['size-lg']} />
						{:else}
							<ChevronDown class={['size-lg']} />
						{/if}
					</LightButton>
					<Divider class="border-1" />
				{/snippet}
				{#snippet body()}
					<DropdownBody>
						<LightButton
							class={['border-background-1 mb-4 w-full border-2 p-2 text-xl']}
							onclick={handleOnAddNote}
							type="button"
						>
							<PlusIcon />
							{m.game_journal_label_add_note()}
						</LightButton>
						<ul class="flex flex-col gap-4">
							{#each notesSignal.notes as note (note.Id)}
								{@render noteCard(note)}
							{/each}
						</ul>
					</DropdownBody>
				{/snippet}
			</Dropdown>
		</section>
		<section class="mb-6">
			<Dropdown initialState={true}>
				{#snippet button({ onclick, show })}
					<LightButton
						{onclick}
						class={['w-full p-2']}
						justify="between"
					>
						<h1 class="text-xl font-semibold">{m.game_journal_title_links()}</h1>
						{#if show}
							<ChevronUp class={['size-lg']} />
						{:else}
							<ChevronDown class={['size-lg']} />
						{/if}
					</LightButton>
					<Divider class="border-1" />
				{/snippet}
				{#snippet body()}
					<DropdownBody>
						<LightButton
							class={['border-background-1 mb-4 w-full border-2 p-2 text-xl']}
							type="button"
						>
							<PlusIcon />
							{m.game_journal_label_add_link()}
						</LightButton>
						<ul class="flex flex-col gap-4"></ul>
					</DropdownBody>
				{/snippet}
			</Dropdown>
		</section>
	</Main>
</BaseAppLayout>
