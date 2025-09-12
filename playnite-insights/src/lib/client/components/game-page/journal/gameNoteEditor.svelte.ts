import { pushState } from '$app/navigation';
import { toast } from '$lib/client/app-state/toast.svelte';
import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized';
import type { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
import { m } from '$lib/paraglide/messages';
import type { GameNote, GameNoteFactory } from '@playnite-insights/lib/client';

export type GameNoteEditorDeps = {
	gameNoteFactory: GameNoteFactory;
	gameNoteRepository: GameNoteRepository;
};

export class GameNoteEditor {
	#currentNote: GameNote;
	#noteRepository: GameNoteEditorDeps['gameNoteRepository'];
	#gameNoteFactory: GameNoteEditorDeps['gameNoteFactory'];

	constructor({ gameNoteFactory: factory, gameNoteRepository }: GameNoteEditorDeps) {
		this.#noteRepository = gameNoteRepository;
		this.#gameNoteFactory = factory;

		this.#currentNote = $state(
			factory.create({
				Title: null,
				Content: null,
				ImagePath: null,
				GameId: null,
				SessionId: null,
			}),
		);
	}

	saveAsync = async ({
		gameId,
		sessionId,
	}: {
		gameId: GameNote['GameId'];
		sessionId: GameNote['SessionId'];
	}) => {
		const note = { ...this.#currentNote };
		note.GameId = gameId;
		note.SessionId = sessionId;
		note.LastUpdatedAt = new Date().toISOString();
		try {
			await this.#noteRepository.putAsync({ note });
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: m.error_db_not_ready() });
			} else if (err instanceof Error) {
				toast.error({ title: m.error_save_game_note(), message: err.message });
			}
		}
	};

	deleteAsync = async () => {
		const note = { ...this.#currentNote };
		try {
			await this.#noteRepository.deleteAsync({ noteId: note.Id });
			this.closeNoteEditor();
			this.#currentNote = this.#gameNoteFactory.create({
				Title: null,
				Content: null,
				ImagePath: null,
				GameId: null,
				SessionId: null,
			});
		} catch (err) {
			if (err instanceof IndexedDBNotInitializedError) {
				toast.error({ message: m.error_db_not_ready() });
			} else if (err instanceof Error) {
				toast.error({ title: m.error_save_game_note(), message: err.message });
			}
		}
	};

	openNoteEditor = () => {
		pushState('', { bottomSheet: true });
	};

	closeNoteEditor = () => {
		history.back();
	};

	get currentNote() {
		return this.#currentNote;
	}

	set currentNote(note: GameNote) {
		this.#currentNote = note;
	}
}
