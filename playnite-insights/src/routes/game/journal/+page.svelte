<script lang="ts">
	import { locator } from '$lib/client/app-state/serviceLocator.js';
	import { toast } from '$lib/client/app-state/toast.svelte.js';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Divider from '$lib/client/components/Divider.svelte';
	import Dropdown from '$lib/client/components/dropdown/Dropdown.svelte';
	import DropdownBody from '$lib/client/components/dropdown/DropdownBody.svelte';
	import { GameNoteEditor } from '$lib/client/components/game-page/journal/gameNoteEditor.svelte.js';
	import { ImageOptions } from '$lib/client/components/game-page/journal/imageOptions.svelte.js';
	import ImageOptionsPanel from '$lib/client/components/game-page/journal/ImageOptionsPanel.svelte';
	import NoteCard from '$lib/client/components/game-page/journal/NoteCard.svelte';
	import NoteEditor from '$lib/client/components/game-page/journal/NoteEditor.svelte';
	import { NoteExtras } from '$lib/client/components/game-page/journal/noteExtras.svelte.js';
	import NoteExtrasPanel from '$lib/client/components/game-page/journal/NoteExtrasPanel.svelte';
	import { ScreenshotsGallery } from '$lib/client/components/game-page/journal/screenshotsGallery.svelte.js';
	import ScreenshotsGalleryPanel from '$lib/client/components/game-page/journal/ScreenshotsGalleryPanel.svelte';
	import Header from '$lib/client/components/header/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized.js';
	import type { EventSourceManagerListener } from '$lib/client/event-source-manager/eventSourceManager.svelte.js';
	import { PlayniteRemoteAction } from '$lib/client/playnite-remote-action/playniteRemoteAction.svelte.js';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte.js';
	import {
		getPlayniteGameImageUrl,
		getPlaytimeInHoursMinutesAndSeconds,
	} from '$lib/client/utils/playnite-game';
	import { GamePageViewModel } from '$lib/client/viewmodel/gamePageViewModel.svelte';
	import { RecentActivityViewModel } from '$lib/client/viewmodel/recentActivityViewModel.svelte.js';
	import { m } from '$lib/paraglide/messages.js';
	import { ArrowLeft, ChevronDown, ChevronUp, Menu, PlusIcon } from '@lucide/svelte';
	import { type GameNote } from '@playnite-insights/lib/client';
	import { onMount } from 'svelte';

	const { data } = $props();
	const pageVm = new GamePageViewModel({
		getGameId: () => data.gameId,
		gameStore: locator.gameStore,
		companyStore: locator.companyStore,
	});
	const activityVm = new RecentActivityViewModel({
		gameStore: locator.gameStore,
		gameSessionStore: locator.gameSessionStore,
		dateTimeHandler: locator.dateTimeHandler,
	});
	const noteEditor = new GameNoteEditor({
		gameNoteFactory: locator.gameNoteFactory,
		gameNoteRepository: locator.gameNoteRepository,
	});
	const noteExtras = new NoteExtras({ httpClient: locator.httpClient });
	const imageOptions = new ImageOptions();
	const screenshotGallery = new ScreenshotsGallery();
	const playniteRemoteAction = new PlayniteRemoteAction({ httpClient: locator.httpClient });
	const isThisGameActive = $derived.by(() => {
		const gameId = data.gameId;
		if (!gameId) return false;
		const inProgressActivity = activityVm.inProgressActivity;
		return inProgressActivity?.gameId === gameId;
	});
	const activeSessionForThisGame = $derived.by(() => {
		if (!isThisGameActive) return null;
		const session = activityVm.inProgressSession;
		return session;
	});
	const todaySessionsCount = $derived.by(() => {
		const gameId = data.gameId;
		if (!gameId) return 0;
		const recentActivityMap = activityVm.recentActivityMap;
		const activityForThisGame = recentActivityMap.get(gameId);
		return activityForThisGame?.sessions.length ?? 0;
	});
	const notesSignal = $state<{ notes: GameNote[]; isLoading: boolean }>({
		notes: [],
		isLoading: false,
	});
	let noteChangeTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

	const loadNotes = async () => {
		const gameId = data.gameId;
		if (!gameId) return;
		try {
			notesSignal.isLoading = true;
			const notes = await locator.gameNoteRepository.getAllAsync({
				filterBy: 'byGameId',
				GameId: gameId,
			});
			notesSignal.notes = notes;
		} catch (err) {
			console.error(err);
			if (err instanceof IndexedDBNotInitializedError)
				toast.error({ message: m.error_db_not_ready(), category: 'local-database' });
		} finally {
			notesSignal.isLoading = false;
		}
	};

	const handleOnNoteChange = async () => {
		if (noteChangeTimeout) clearTimeout(noteChangeTimeout);
		noteChangeTimeout = setTimeout(async () => {
			await noteEditor.saveAsync();
		}, 1_000);
	};

	const handleOnDetroyNoteEditor = async () => {
		if (noteChangeTimeout) clearTimeout(noteChangeTimeout);
		await noteEditor.saveAsync();
		loadNotes();
	};

	const handleOnClickNote = async (note: GameNote) => {
		noteEditor.currentNote = { ...note };
		noteEditor.open();
	};

	const handleOnAddNote = async () => {
		const gameId = data.gameId;
		const sessionId = activeSessionForThisGame?.SessionId ?? null;
		const newNote = locator.gameNoteFactory.create({
			Title: null,
			Content: null,
			GameId: gameId,
			SessionId: sessionId,
			ImagePath: null,
		});
		noteEditor.currentNote = newNote;
		noteEditor.open();
	};

	const handleOnDeleteNote = async () => {
		await noteEditor.deleteAsync();
		await loadNotes();
	};

	const handleFocus = () => {
		locator.gameNoteStore.loadNotesFromServerAsync().then((notes) => {
			if (notes) loadNotes();
		});
	};

	const handleOnNoteImageChange = async (file: File) => {
		try {
			const uploadedImage = await noteExtras.uploadImageAsync(file);
			noteEditor.currentNote.ImagePath = uploadedImage;
			await handleOnNoteChange();
		} catch (error) {
			handleClientErrors(error, 'Failed to upload image');
		} finally {
			noteExtras.close();
		}
	};

	const handleOnRemoveNoteCurrentImage = async () => {
		noteEditor.currentNote.ImagePath = null;
		await handleOnNoteChange();
		imageOptions.close();
	};

	const handleOnSelectImageFromGallery = async (path: string) => {
		noteEditor.currentNote.ImagePath = path;
		await handleOnNoteChange();
		noteExtras.close();
		screenshotGallery.close();
	};

	const handleOnTakeSreenshotFromPlaynite = async () => {
		noteExtras.close();
		await playniteRemoteAction.takeScreenshotAsync();
	};

	const handleOnScreenshotTakenSSE: EventSourceManagerListener<'screenshotTaken'>['cb'] = async ({
		data,
	}) => {
		const warnMessage =
			m.toast_remote_action_take_screenshot_warn_no_screenshots_returned_message();
		const first = data.paths.at(0)?.trim();
		if (!first) {
			toast.warning({ message: warnMessage, category: 'network' });
			return;
		}
		noteEditor.currentNote.ImagePath = first;
		await handleOnNoteChange();
		await loadNotes();
	};

	onMount(() => {
		// Load notes from indexedDb to hydrate UI faster
		loadNotes();
		locator.gameNoteStore.loadNotesFromServerAsync().then((result) => {
			if (result.notes) loadNotes();
			// If notes = `null` nothing was changed since last sync
		});

		const unsub = locator.eventSourceManager.addListener({
			type: 'screenshotTaken',
			cb: handleOnScreenshotTakenSSE,
		});

		activityVm.setTickInterval();
		window.addEventListener('focus', handleFocus);
		return () => {
			activityVm.clearTickInterval();
			window.removeEventListener('focus', handleFocus);
			unsub?.();
		};
	});
</script>

<ScreenshotsGalleryPanel
	isOpen={screenshotGallery.isOpen}
	onClose={screenshotGallery.close}
	onSelectImage={handleOnSelectImageFromGallery}
/>
<ImageOptionsPanel
	isOpen={imageOptions.isOpen}
	onClose={imageOptions.close}
	onRemoveImage={handleOnRemoveNoteCurrentImage}
/>
<NoteExtrasPanel
	isOpen={noteExtras.isOpen}
	onClose={noteExtras.close}
	onSelectImage={handleOnNoteImageChange}
	onTakeScreenshotFromPlaynite={handleOnTakeSreenshotFromPlaynite}
	onAddAvailableScreenshot={screenshotGallery.open}
	isOptionDisabled={{
		addAvailableScreenshot: false,
		takeScreenshotFromPlayniteHost: !locator.serverHeartbeat.isAlive,
		uploadImage: !locator.serverHeartbeat.isAlive,
	}}
/>
<NoteEditor
	isOpen={noteEditor.isOpen}
	onClose={noteEditor.close}
	currentNote={noteEditor.currentNote}
	onDelete={handleOnDeleteNote}
	onChange={handleOnNoteChange}
	onDestroy={handleOnDetroyNoteEditor}
	onOpenExtrasPanel={noteExtras.open}
	onClickImage={imageOptions.open}
	isOpenExtrasDisabled={playniteRemoteAction.actionLoadingState.takeScreenShot}
	isImageLoading={playniteRemoteAction.actionLoadingState.takeScreenShot}
/>
<BaseAppLayout>
	<Header class={['flex items-center justify-between']}>
		<LightButton onclick={() => history.back()}>
			<ArrowLeft class={['size-md']} />
		</LightButton>
		<LightButton>
			<Menu class={['size-md']} />
		</LightButton>
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
		{:else}
			<p class="text-error-light-fg mb-4 w-full text-center">{m.error_resource_not_found()}</p>
		{/if}
		<section class="mb-6">
			<Dropdown initialState={true}>
				{#snippet button({ onclick, show })}
					<div class="flex flex-row gap-1">
						<LightButton
							{onclick}
							class={['w-full']}
							size="md"
							justify="between"
							disabled={!pageVm.game}
						>
							<h1 class="text-xl font-semibold">{m.game_journal_title_notes()}</h1>
							{#if show}
								<ChevronUp class={['size-lg']} />
							{:else}
								<ChevronDown class={['size-lg']} />
							{/if}
						</LightButton>
						<LightButton
							size="md"
							onclick={handleOnAddNote}
							aria-label={m.game_journal_label_add_note()}
							disabled={!pageVm.game}
						>
							<PlusIcon />
						</LightButton>
					</div>
					<Divider class="border-1" />
				{/snippet}
				{#snippet body()}
					<DropdownBody class={['px-0!']}>
						<ul class="flex flex-col gap-4">
							{#each notesSignal.notes as note (note.Id)}
								<li class="bg-background-1">
									<NoteCard
										{note}
										onClick={handleOnClickNote}
									/>
								</li>
							{/each}
						</ul>
					</DropdownBody>
				{/snippet}
			</Dropdown>
		</section>
		<section class="mb-6">
			<Dropdown initialState={true}>
				{#snippet button({ onclick, show })}
					<div class="flex flex-row gap-1">
						<LightButton
							{onclick}
							class={['w-full p-2']}
							justify="between"
							disabled={!pageVm.game}
						>
							<h1 class="text-xl font-semibold">{m.game_journal_title_links()}</h1>
							{#if show}
								<ChevronUp class={['size-lg']} />
							{:else}
								<ChevronDown class={['size-lg']} />
							{/if}
						</LightButton>
						<LightButton
							size="md"
							onclick={() => {}}
							aria-label={m.game_journal_label_add_link()}
							disabled={!pageVm.game}
						>
							<PlusIcon />
						</LightButton>
					</div>
					<Divider class="border-1" />
				{/snippet}
				{#snippet body()}
					<DropdownBody>
						<ul class="flex flex-col gap-4"></ul>
					</DropdownBody>
				{/snippet}
			</Dropdown>
		</section>
	</Main>
</BaseAppLayout>
